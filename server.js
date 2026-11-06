// SMART.Buddy демо сервері: dist папкасын көрсетеді, аккаунттар мен деректерді SQLite-та сақтайды (db.js)
// және /api/chat арқылы Ollama-ға жалғайды.
// Іске қосу: node server.js   (тәуелділіктер қажет емес)
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const store = require('./db');
const psychology = require('./psychology');
const newsProxy = require('./news-proxy');

const PORT = Number(process.env.PORT) || 8000;
const OLLAMA = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const MODEL = process.env.BUDDY_MODEL || 'qwen3-vl:4b-instruct';
const ROOT = path.join(__dirname, 'dist');
const MAX_BODY = 64 * 1024;          // чат, аккаунт сұраулары
const MAX_STATE_BODY = 4 * 1024 * 1024;  // бір кілттің деректері (мысалы, суреттің кішірейтілген нұсқасы бар чаттар)
const MAX_AI_BODY = 8 * 1024 * 1024;     // суреті бар ЖИ сұраулары
const MAX_QUEUE = 8;
// Барлық сұрауда бірдей контекст өлшемі: өлшем өзгерсе, Ollama модельді қайта жүктейді (бірнеше секунд кідіріс).
const NUM_CTX = 8192;
// ҚАЗ режимінде әдепкіде ЖИ орысша жауап береді (Qwen қазақшаны нашар жазады). BUDDY_KK=kk — қазақша жауап (мысалы, Gemma үшін).
const KK_NATIVE = process.env.BUDDY_KK === 'kk';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json', '.woff2': 'font/woff2'
};

const LANG = {
  kkNative: 'Жауапты тек қазақ тілінде жаз. Қысқа, қарапайым, грамматикасы дұрыс сөйлемдер қолдан.',
  kk: 'Отвечай на русском языке (казахский интерфейс, но модель пока отвечает по-русски). Если студент пишет по-казахски — пойми вопрос и ответь по-русски.',
  ru: 'Отвечай только на русском языке.',
  en: 'Answer only in English.'
};

// Студентке қалай жүгінеміз: лақап аты, болмаса атының бірінші сөзі (дерекқордан алынады, клиентке сенбейміз).
function addressName(user) {
  const raw = user && (user.nickname || String(user.name || '').split(' ')[0]);
  return String(raw || '').replace(/[<>{}\\"]/g, '').slice(0, 30);
}
function addressRule(lang, nick) {
  if (!nick) return '';
  const ex = lang === 'en' ? `"Sure, ${nick}! ..." or "${nick}, here is ..."`
    : lang === 'kk' && KK_NATIVE ? `«Жарайды, ${nick}! ...» or «${nick}, міне ...»`
    : `«Хорошо, ${nick}! ...» or «${nick}, смотри ...»`;
  return `- The student wants to be called "${nick}". Address them by this name in EVERY answer, usually in the first sentence, e.g. ${ex}. Write the name exactly as "${nick}" — never translate, decline or change it.`;
}

// Көңіл күйді қолдау режимі: студент сезімі туралы әңгімені жалғастырғанда (бірінші жауапты dist/support.js құрастырады).
function supportPrompt(lang, context, nick, analysis) {
  const a = analysis && typeof analysis === 'object' && psychology.SITUATIONS.includes(analysis.situation) ? analysis : null;
  return [
    'You are Buddy, a warm, calm and caring companion for a university student in Kazakhstan, inside the SMART.Buddy app.',
    'Right now the student is talking about their feelings (stress, sadness, tiredness, loneliness, failure, anger, low motivation or something that happened).',
    'You are NOT a doctor or licensed psychologist and you never diagnose. Talk like a kind, wise friend trained in supportive listening.',
    'How to answer:',
    '1. First reflect the feeling in your own words and validate it, e.g. "It makes sense that you feel ... because ...". No judgement, no lecturing.',
    '2. If they are tense or anxious, offer ONE short calming technique (slow breathing: in 4 s, hold 4 s, out 6 s; grounding 5-4-3-2-1; a short walk; a glass of water).',
    '3. Give 1–2 small, concrete next steps for today. Use STUDENT DATA when it helps: free time before the next class, the nearest deadline (suggest only a tiny first step), or rest when classes are over. Never invent classes or deadlines.',
    '4. Encourage rest and sleep when relevant and add one short, sincere encouraging sentence.',
    '5. End with ONE gentle open question so they keep talking.',
    'Never say or imply that the student was not needed, not good enough, unlovable or to blame for what happened.',
    'Never suggest recalling painful memories, thinking about or contacting the person who hurt them (an ex, an offender), or anything that keeps them in the pain; suggest things that soothe and distract instead (a walk, a friend, music, a shower, sleep).',
    'Never use toxic positivity ("just cheer up", "others have it worse"), never blame, never give advice about medication, no long lists, no markdown.',
    'If the feelings last more than two weeks or affect sleep, appetite or studies, gently suggest the university psychologist or a doctor — that is a brave step, not weakness.',
    'SAFETY: if there is ANY hint of suicide, self-harm or wanting to disappear, respond with care, say their life matters, urge them to call 112 if in danger, or the free 24/7 helpline 111, or 150 (youth helpline), and to tell a trusted person right now; ask whether they are safe right now.',
    'Respond to the SPECIFIC thing they just said (name the situation), not with generic advice.',
    'Format: ONE natural paragraph of 4–6 short sentences. No emojis, no bullet points, no headings, no numbered steps — even if earlier messages in the chat used them. Warm, simple, human words; no strange or poetic advice.',
    addressRule(lang, nick),
    (lang === 'kk' && KK_NATIVE ? LANG.kkNative : LANG[lang]) || LANG.kk,
    '',
    // Кішкентай модель үлгімен әлдеқайда таза жазады (тексерілді: оғаш метафоралар жоғалады).
    'Example of a good answer (style only, do not copy the content):',
    ...(SUPPORT_SHOT[lang] || SUPPORT_SHOT.ru).map(s => s.replaceAll('{n}', nick || (lang === 'en' ? 'friend' : 'друг'))),
    // Модель алдымен түсінген нәрсе (талдау) және осы жағдайға арналған білім базасы.
    ...(a ? ['', `WHAT YOU UNDERSTOOD ABOUT THE STUDENT NOW: situation=${a.situation}, feeling=${a.feeling}, intensity=${a.intensity}/10, needs=${(a.needs || []).join('+') || 'be_heard'}.`,
      'KNOWLEDGE for this situation (use these ideas in your own words, choose what fits, do not list them all):', psychology.guide(a.situation),
      ...(a.intensity >= 8 || a.feeling === 'hopeless' ? ['The feeling is strong: in one gentle sentence suggest the university psychologist or the free 24/7 helpline 111.'] : [])] : []),
    '',
    'STUDENT DATA:',
    String(context || '').slice(0, 8000)
  ].join('\n');
}
const SUPPORT_SHOT = {
  ru: ['Student: меня завалили на экзамене, и я чувствую себя полным неудачником',
    'Buddy: {n}, понимаю, как обидно — ты готовился, а результат не тот, и сейчас кажется, что всё зря. Но одна неудачная оценка говорит об одном дне, а не о тебе как о человеке. Сегодня просто отдохни и не прокручивай экзамен в голове, а завтра спокойно спроси у преподавателя, где были ошибки и есть ли пересдача. Многие сильные студенты проходили через это и потом сдавали лучше. Что тебя сейчас расстраивает больше всего — сама оценка или то, что скажут другие?'],
  en: ['Student: I failed my exam and I feel like a total failure',
    'Buddy: {n}, I understand how much that hurts — you prepared, the result wasn’t what you hoped, and now it feels like it was all for nothing. But one bad grade says something about one day, not about you as a person. Tonight just rest and don’t replay the exam in your head; tomorrow calmly ask the teacher where the mistakes were and whether there is a retake. Many strong students went through this and did better next time. What upsets you most right now — the grade itself or what others might think?']
};

function systemPrompt(lang, context, nick) {
  return [
    'You are Buddy, a friendly purple mascot assistant inside SMART.Buddy — a student helper web app for L.N. Gumilyov Eurasian National University (ENU), Astana.',
    'You help ONE student with their timetable, deadlines, GPA, exam preparation and study planning.',
    'Rules:',
    '- Use ONLY the facts in STUDENT DATA for anything about this student\'s classes, rooms, teachers, times, tasks or grades. Never invent classes, rooms, teachers or deadlines.',
    '- If the data does not contain the answer, say so honestly and suggest checking SMART.ENU or asking the teacher.',
    '- If STUDENT DATA starts with a SHOWN ABOVE block, the app already displayed those classes to the student. Do not list classes again; give only advice or a plan for those days. A day marked as free has no classes.',
    '- All times are Astana time (UTC+5). The current date and time are given in STUDENT DATA — use them for words like today, tomorrow, this week.',
    '- For general study questions (how to prepare, how to plan, motivation) give practical, concrete advice tied to the student\'s real schedule when possible.',
    '- Keep answers short: 3–5 sentences or a list of at most 4 short points. Plain text, no markdown headings, no tables.',
    '- You CANNOT add, change or delete deadlines, tasks or timetable entries yourself, and you must NEVER say that you did. If the student asks for that, tell them to write the request directly, e.g. "Add a deadline: volleyball, Tuesday 14:00" or "Add to my timetable: Monday 10:00 Physics, room 305" — the app does it automatically.',
    '- You are not an official ENU service.',
    addressRule(lang, nick),
    (lang === 'kk' && KK_NATIVE ? LANG.kkNative : LANG[lang]) || LANG.kk,
    '',
    'STUDENT DATA:',
    String(context || '').slice(0, 12000)
  ].join('\n');
}

let active = 0;
const waiting = [];
function acquire() {
  if (active < 1) { active++; return Promise.resolve(); }
  if (waiting.length >= MAX_QUEUE) return Promise.reject(new Error('busy'));
  return new Promise(r => waiting.push(r));
}
function release() { const next = waiting.shift(); if (next) next(); else active--; }

function readBody(req, limit = MAX_BODY) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > limit) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// Браузер JPEG/PNG суретті data URL түрінде жібереді; Ollama-ға тек base64 бөлігі керек.
function imageData(img) {
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(img || ''));
  return m ? m[2] : null;
}

async function handleChat(req, res) {
  const user = currentUser(req);
  if (!user) { res.writeHead(401).end('unauthorized'); return; }
  const nick = addressName(user);
  let body;
  try { body = JSON.parse(await readBody(req, MAX_AI_BODY)); } catch { res.writeHead(400).end('bad request'); return; }
  const lang = ['kk', 'ru', 'en'].includes(body.lang) ? body.lang : 'kk';
  const history = (Array.isArray(body.messages) ? body.messages : [])
    .filter(m => m && typeof m.text === 'string' && m.text.trim())
    .slice(-8)
    .map(m => ({ role: m.user ? 'user' : 'assistant', content: m.text.slice(0, 2000) }));
  if (!history.length || history[history.length - 1].role !== 'user') { res.writeHead(400).end('no question'); return; }
  // Кішкентай модель тілді жиі ауыстырып жібереді, сондықтан тіл еске салғышы сұрақтың өзіне тіркеледі.
  const support = body.mode === 'support';
  const reminder = support
    ? (lang === 'en' ? 'Answer in English, warmly, 5-8 sentences, end with one gentle question.'
      : lang === 'kk' && KK_NATIVE ? 'Жауапты тек қазақ тілінде жаз, жылы, 5-8 сөйлем, соңында бір жұмсақ сұрақ қой.'
      : 'Ответь на русском языке, тепло и бережно, 5-8 предложений, в конце один мягкий вопрос.')
    : lang === 'en' ? 'Answer in English, 3-5 sentences.'
    : lang === 'kk' && KK_NATIVE ? 'Жауапты тек қазақ тілінде жаз, 3-5 сөйлем.'
    : 'Ответь на русском языке, 3-5 предложений.';
  const call = !nick ? '' : lang === 'en' ? ` Call me ${nick}.` : lang === 'kk' && KK_NATIVE ? ` Маған ${nick} деп жүгін.` : ` Обращайся ко мне «${nick}».`;
  history[history.length - 1].content += '\n\n(' + reminder + call + ')';
  const image = imageData(body.image);
  if (image) history[history.length - 1].images = [image];

  try { await acquire(); } catch { res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' }).end('busy'); return; }
  const abort = new AbortController();
  res.on('close', () => abort.abort());
  try {
    const r = await fetch(OLLAMA + '/api/chat', {
      method: 'POST', signal: abort.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL, stream: true, keep_alive: '30m',
        options: { temperature: 0.3, repeat_penalty: support ? 1.1 : 1.15, num_predict: support ? 700 : 600, num_ctx: NUM_CTX },
        messages: [{ role: 'system', content: (support ? supportPrompt : systemPrompt)(lang, body.context, nick, body.analysis) }, ...history]
      })
    });
    if (!r.ok || !r.body) throw new Error('ollama ' + r.status);
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' });
    const decoder = new TextDecoder(); let buf = '';
    for await (const chunk of r.body) {
      buf += decoder.decode(chunk, { stream: true });
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
        if (!line) continue;
        const j = JSON.parse(line);
        if (j.message && j.message.content) res.write(j.message.content);
      }
    }
    res.end();
  } catch (e) {
    if (!abort.signal.aborted) {
      console.error('[ai]', e.message);
      if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end();
    }
  } finally { release(); }
}

// ---------- ЖИ: чаттан дедлайн құру және суреттен/мәтіннен кесте оқу ----------
async function ollamaJSON(messages, schema, numPredict = 800) {
  await acquire();
  try {
    const r = await fetch(OLLAMA + '/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL, stream: false, keep_alive: '30m', format: schema,
        options: { temperature: 0, num_predict: numPredict, num_ctx: NUM_CTX }, messages
      })
    });
    if (!r.ok) throw new Error('ollama ' + r.status);
    const j = await r.json();
    return JSON.parse((j.message && j.message.content) || '{}');
  } finally { release(); }
}

const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));
const isTime = s => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(s || ''));

// Бір хабарламада бірнеше дедлайн болуы мүмкін — сондықтан массив.
const TASKS_SCHEMA = {
  type: 'object',
  properties: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: { title: { type: 'string' }, when: { type: 'string' }, date: { type: 'string' }, time: { type: 'string' }, subject: { type: 'string' } },
        required: ['title', 'when', 'date', 'time', 'subject']
      }
    }
  },
  required: ['tasks']
};

async function aiTask(body) {
  const days = (Array.isArray(body.days) ? body.days : []).slice(0, 60)
    .map(d => `${d.date} = ${d.weekday}${d.label ? ' (' + d.label + ')' : ''}`).join('\n');
  const subjects = (Array.isArray(body.subjects) ? body.subjects : []).slice(0, 40).join('; ');
  const earlier = (Array.isArray(body.history) ? body.history : []).slice(-5).map(s => '- ' + String(s).slice(0, 400)).join('\n');
  const system = [
    'You turn a student\'s request into deadline/task entries for a planner app. Reply with JSON only: {"tasks":[...]}.',
    'The student may write in Kazakh, Russian or English, with typos and slang. Any activity the student wants to remember counts as a task (homework, lab, exam, sport practice, meeting...).',
    'One entry per separate deadline. Usually there is exactly one.',
    'title: short, clean name of the task/activity in THE SAME LANGUAGE the student used for it (Kazakh stays Kazakh, Russian stays Russian), with typos fixed (e.g. "Волейбол", "Big data зертханалық №6", "Ағылшын тілінен эссе"). Do not put the date, time or words like "deadline/дедлайн/добавь" into the title. If the messages never say WHAT the task is, return "".',
    'when: copy the exact words from the messages that say WHEN this task is due (e.g. "жұмаға", "вторник", "завтра", "15 ноября"), or "" if no day is given.',
    'date: YYYY-MM-DD. Resolve weekdays and words like today/tomorrow/ертең/сенбі/завтра/вторник with the CALENDAR below (the nearest such day, today included). If no day is given anywhere, return "".',
    'time: HH:MM 24h if a time is given (e.g. "14:00", "в 2 часа дня" = 14:00), otherwise "".',
    'subject: the matching name from SUBJECTS if the task clearly belongs to one, otherwise "".',
    'The LATEST REQUEST is the main one. EARLIER MESSAGES of the same chat may contain the missing details (title, day, time) — use them, e.g. if the latest message only says "yes, add it".',
    'If an image is attached it may show an assignment or announcement — use it for the title and due date.',
    '', 'CALENDAR (Astana time, the first line is today):', days, '', 'SUBJECTS: ' + (subjects || '(none)')
  ].join('\n');
  const content = (earlier ? 'EARLIER MESSAGES:\n' + earlier + '\n\n' : '') + 'LATEST REQUEST: ' + String(body.text || '').slice(0, 1000);
  const msg = { role: 'user', content };
  const image = imageData(body.image);
  if (image) msg.images = [image];
  const out = await ollamaJSON([{ role: 'system', content: system }, msg], TASKS_SCHEMA, 400);
  const tasks = (Array.isArray(out.tasks) ? out.tasks : []).map(x => ({
    title: String(x.title || '').trim().slice(0, 100),
    when: String(x.when || '').trim().slice(0, 60),
    date: isDate(x.date) ? x.date : '',
    time: isTime(x.time) ? x.time : '',
    subject: String(x.subject || '').trim().slice(0, 100)
  })).filter(x => x.title).slice(0, 10);
  return { tasks };
}

// Индекс — JS-тегі апта күні: 0 = жексенбі, 1 = дүйсенбі … 6 = сенбі.
const DAY_FULL = [
  ['жексен', 'воскрес', 'sunday'], ['дүйсен', 'дуйсен', 'понедель', 'monday'], ['сейсен', 'вторник', 'tuesday'],
  ['сәрсен', 'сарсен', 'сред', 'wednesday'], ['бейсен', 'четвер', 'thursday'], ['жұма', 'жума', 'пятниц', 'friday'],
  ['сенбі', 'сенби', 'суббот', 'saturday']
];
const DAY_SHORT = [['жс', 'вс', 'sun'], ['дс', 'пн', 'mon'], ['сс', 'вт', 'tue'], ['ср', 'wed'], ['бс', 'чт', 'thu'], ['жм', 'пт', 'fri'], ['сб', 'sat']];
function dayIndex(v) {
  if (Number.isInteger(v) && v >= 0 && v <= 6) return v;
  const s = String(v || '').toLowerCase().trim();
  if (/^[0-6]$/.test(s)) return Number(s);
  const full = DAY_FULL.findIndex(words => words.some(w => s.includes(w)));
  if (full >= 0) return full;
  const word = s.split(/[\s.,]/)[0];
  const short = DAY_SHORT.findIndex(words => words.includes(word));
  return short >= 0 ? short : null;
}
const cleanRoom = s => String(s || '').replace(/^(ауд(итория)?|aud(itorium)?|каб(инет)?|room|бөлме)\.?\s*/i, '').trim();
// Модель кейде ұяшықтың келесі жолын (сабақ түрін) пән атауына қосып жібереді — тек бірінші жолды аламыз.
const cleanSubject = s => String(s || '').split(/\n/)[0]
  .replace(/[\s,(·-]+(дәріс|практика|зертханалық|семинар|лекция|лабораторная|lecture|practice|lab|seminar)\)?$/i, '')
  .replace(/^["«“'\s]+|["»”'\s]+$/g, '').trim();
function lessonType(s) {
  s = String(s || '').toLowerCase();
  if (/лаб|зертхана|lab/.test(s)) return 'lab';
  if (/семинар|seminar/.test(s)) return 'seminar';
  if (/практ|practice|пр\b|сөж|срс|срсп/.test(s)) return 'practice';
  return 'lecture';
}
const toTime = s => {
  const m = /^(\d{1,2})[:.](\d{2})$/.exec(String(s || '').trim());
  const v = m ? m[1].padStart(2, '0') + ':' + m[2] : '';
  return isTime(v) ? v : '';
};

// Модель әр сабақты бір жолмен жазады: КҮН | ББ:ММ-ББ:ММ | ПӘН | ТҮРІ | ОҚЫТУШЫ | АУДИТОРИЯ.
// JSON-нан 4–5 есе аз токен — үлкен кесте де қиылмайды және сабақтар бірден-бірден шығады.
function parseLessonLine(line) {
  const raw = String(line || '').replace(/^[\s*•\-\d.)]+(?=[А-ЯA-ZӘҒҚҢӨҰҮҺІа-яa-zәғқңөұүһі])/, '').trim();
  if (!raw.includes('|')) return null;
  const parts = raw.split('|').map(p => p.trim().replace(/^-$/, ''));
  if (parts.length < 3) return null;
  const day = dayIndex(parts[0]);
  const tm = /(\d{1,2}[:.]\d{2})\s*[-–—]\s*(\d{1,2}[:.]\d{2})/.exec(parts[1]);
  if (day === null || !tm) return null;
  const start = toTime(tm[1]), end = toTime(tm[2]);
  if (!start || !end || start >= end) return null;
  // Модель кейде ұяшықтың бүкіл мәтінін пән өрісіне жазады: «Физика Дәріс Ахметов Б.Қ. ауд. 305» — бөлшектейміз.
  const cell = splitCell(parts[2]);
  const subject = cleanSubject(cell.subject).slice(0, 120);
  if (!subject || /^(none|жоқ|нет)$/i.test(subject)) return null;
  // Қалған өрістерді орнына емес, мазмұнына қарап танимыз (модель кейде бір өрісті өткізіп жібереді).
  let type = cell.type, teacher = cell.teacher, room = cell.room, online = cell.online;
  for (const p of parts.slice(3).filter(Boolean)) {
    if (/^(online|онлайн|дистан\w*|zoom|teams)$/i.test(p)) online = true;
    else if (/^(ауд(итория)?\.?\s*)?№?\s*\d[\w\-/]*$/i.test(p) || /^№/.test(p)) room = room || cleanRoom(p);
    else if (TYPE_WORD.test(' ' + p) && p.length < 20) type = type || lessonType(p);
    else if (TEACHER_RE.test(p) || /[а-яәғқңөұүһіa-z]{3,}/i.test(p)) teacher = teacher || p;
  }
  const tr = ROOM_RE.exec(teacher); // «Сейтқали А. ауд. 201» — аудиторияны оқытушыдан бөлеміз
  if (tr) { room = room || (tr[1] || tr[2]).replace(/\s/g, ''); teacher = (teacher.slice(0, tr.index) + teacher.slice(tr.index + tr[0].length)).trim(); }
  if (/\b(online|онлайн)\b/i.test(teacher)) { online = true; teacher = teacher.replace(/\b(online|онлайн)\b/ig, '').trim(); }
  return { day, start, end, subject, type: type || 'lecture', teacher: teacher.replace(/[\s,·-]+$/, '').slice(0, 80), building: '', room: online ? '' : room.slice(0, 30), online };
}

// Ұяшық мәтінінен пән, түр, оқытушы, аудиторияны бөлу.
const TYPE_WORD = /(^|[\s,(·/])(дәріс|дəріс|лекция|практика|практическое|практ\.|зертханалық|зертхана|лабораторная|лаб\.|семинар|lecture|practice|lab|seminar)(?=$|[\s,)·/.])/i;
const TEACHER_RE = /([А-ЯӘҒҚҢӨҰҮҺІA-Z][а-яәғқңөұүһіa-z'-]+\s+[А-ЯӘҒҚҢӨҰҮҺІA-Z]\.\s?(?:[А-ЯӘҒҚҢӨҰҮҺІA-Z]\.)?)/;
const ROOM_RE = /(?:ауд(?:итория)?\.?|aud\.?|каб\.?|room)\s*([№\w\-/]+)|(№\s?\d+[\w-]*)/i;
function splitCell(text) {
  let s = String(text || '').replace(/\s*\/\s*/g, ' ').replace(/\s+/g, ' ').trim();
  const out = { subject: s, type: '', teacher: '', room: '', online: false };
  if (/\b(online|онлайн)\b/i.test(s)) { out.online = true; s = s.replace(/\b(online|онлайн)\b/ig, ' ').trim(); }
  const rm = ROOM_RE.exec(s);
  if (rm) { out.room = (rm[1] || rm[2]).replace(/\s/g, ''); s = (s.slice(0, rm.index) + ' ' + s.slice(rm.index + rm[0].length)).trim(); }
  const tw = TYPE_WORD.exec(s);
  if (tw) {
    out.type = lessonType(tw[2]);
    const after = s.slice(tw.index + tw[0].length).trim();
    s = s.slice(0, tw.index).trim();
    const tm = TEACHER_RE.exec(after);
    if (tm) out.teacher = tm[1].trim();
  } else {
    const tm = TEACHER_RE.exec(s);
    if (tm && tm.index > 3) { out.teacher = tm[1].trim(); s = s.slice(0, tm.index).trim(); }
  }
  out.subject = s.replace(/[\s,·-]+$/, '').trim() || out.subject;
  return out;
}

// Браузер торды бағандарға кесіп жібергенде: сол жақ жолақ — жол белгілері (уақыт), оң жақ — бір баған (күн).
function columnPrompt() {
  return [
    'This image is a slice of a university timetable. The LEFT strip is the row-label column (usually times). The RIGHT strip is ONE column of the timetable; its header at the top is usually a weekday.',
    'List every NON-EMPTY cell of the RIGHT strip, top to bottom, one class per line, in exactly this format and nothing else:',
    'DAY | HH:MM-HH:MM | SUBJECT | TYPE | TEACHER | ROOM',
    'DAY and time: one comes from the header of the RIGHT strip, the other from the LEFT strip label on the same row as the cell. Look straight to the left of each cell to find its row label.',
    'TYPE: the class type word exactly as written in the cell (e.g. Дәріс, Практика, Зертханалық, Семинар, Лекция, Лабораторная), or - if none is written.',
    'TEACHER: as written, or - . ROOM: only the room number/code (e.g. 305, №93), "online" for online classes, or - .',
    'Copy the subject name exactly (all its words, even if it wraps over several lines). Empty cells are NOT classes — skip them. Do not invent anything.',
    'Example:',
    'Сейсенбі | 08:00-08:50 | Физика | Дәріс | Ахметов Б.Қ. | 305',
    'If the right strip has no classes, output only: NONE'
  ].join('\n');
}

function schedulePrompt(hasImage, todayInfo) {
  return [
    hasImage
      ? 'You convert a university timetable screenshot into plain text lines. It may be a grid (day columns × time rows) or a list grouped by day.'
      : 'The student describes one or more classes to add to their weekly timetable. Convert them into plain text lines.',
    'Output ONLY lines in exactly this format, one class per line, and nothing else:',
    'DAY | HH:MM-HH:MM | SUBJECT | TYPE | TEACHER | ROOM',
    hasImage
      ? 'DAY: the weekday exactly as written for that class — its column header or the day heading above it. In a grid, always check the header of the column the cell is in.'
      : 'DAY: the weekday name. ' + todayInfo,
    'TYPE: the class type word exactly as written (e.g. Дәріс, Практика, Зертханалық, Семинар, Лекция, Лабораторная), or - if none is written.',
    'TEACHER: exactly as written by the student or in the image (do not complete or change initials), or - . ROOM: only the room number/code (e.g. 305, 1-210), "online" for online classes, or - .',
    'If a class has no end time, use start + 50 minutes.',
    'Copy subject names exactly; do not translate; do not invent classes; skip empty cells; write each class once.',
    'Example:',
    'Дүйсенбі | 09:00-09:50 | Физика | Дәріс | Ахметов Б.Қ. | 305',
    'Сейсенбі | 11:10-12:00 | Тарих | Семинар | - | online',
    'If there are no classes at all, output only: NONE'
  ].join('\n');
}

// Сабақтарды NDJSON ағынымен жібереміз: әр табылған сабақ — бір JSON жол, соңында {"done":true}.
async function handleScheduleStream(req, res, body) {
  const image = imageData(body.image), text = String(body.text || '').trim().slice(0, 2000);
  if (!image && !text) return sendJSON(res, 400, { error: 'no_input' });
  try { await acquire(); } catch { return sendJSON(res, 503, { error: 'busy' }); }
  const abort = new AbortController();
  res.on('close', () => abort.abort());
  const seen = new Set();
  let count = 0;
  try {
    const column = body.mode === 'column' && !!image;
    const user = { role: 'user', content: column ? 'List the classes of the right strip.' : image ? (text ? 'Student note: ' + text + '\n\n' : '') + 'Write all classes from this timetable.' : text };
    if (image) user.images = [image];
    const r = await fetch(OLLAMA + '/api/chat', {
      method: 'POST', signal: abort.signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL, stream: true, keep_alive: '30m',
        options: { temperature: 0, repeat_penalty: 1.05, num_predict: 3500, num_ctx: NUM_CTX },
        messages: [{ role: 'system', content: column ? columnPrompt() : schedulePrompt(!!image, String(body.today || '')) }, user]
      })
    });
    if (!r.ok || !r.body) throw new Error('ollama ' + r.status);
    res.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' });
    const decoder = new TextDecoder();
    let buf = '', text_ = '';
    const emitLine = line => {
      const l = parseLessonLine(line);
      if (!l) return;
      const key = [l.day, l.start, l.subject.toLowerCase(), l.type].join('|');
      if (seen.has(key)) return;
      seen.add(key); count++;
      res.write(JSON.stringify({ lesson: l }) + '\n');
    };
    for await (const chunk of r.body) {
      buf += decoder.decode(chunk, { stream: true });
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
        if (!line) continue;
        const j = JSON.parse(line);
        if (j.message && j.message.content) {
          text_ += j.message.content;
          let k;
          while ((k = text_.indexOf('\n')) >= 0) { emitLine(text_.slice(0, k)); text_ = text_.slice(k + 1); }
          if (count >= 120) { abort.abort(); break; }
        }
      }
    }
    if (text_.trim()) emitLine(text_);
    res.end(JSON.stringify({ done: true, count }) + '\n');
  } catch (e) {
    if (!abort.signal.aborted) {
      console.error('[ai-schedule]', e.message);
      if (!res.headersSent) sendJSON(res, 502, { error: 'ai_unavailable' });
      else res.end(JSON.stringify({ error: 'ai_unavailable' }) + '\n');
    } else if (!res.writableEnded) res.end(JSON.stringify({ done: true, count }) + '\n');
  } finally { release(); }
}

// ---------- Аккаунт және деректер API ----------
function sendJSON(res, status, obj, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(obj));
}
function cookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('='); if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
const sessionToken = req => cookies(req).buddy_sid || '';
const currentUser = req => store.userBySession(sessionToken(req));
function sessionCookie(req, token, maxAge) {
  const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  return `buddy_sid=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

// Кіру/тіркелу әрекеттерін шектеу: бір IP-ден 15 минутта 20 әрекет.
const attempts = new Map();
function tooManyAttempts(req) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const now = Date.now(), a = attempts.get(ip);
  if (!a || a.reset < now) { attempts.set(ip, { count: 1, reset: now + 15 * 60e3 }); return false; }
  return ++a.count > 20;
}

async function handleApi(req, res, pathname) {
  const method = req.method;
  let body = {};
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    try {
      const raw = await readBody(req, pathname.startsWith('/api/state/') ? MAX_STATE_BODY : pathname.startsWith('/api/ai/') ? MAX_AI_BODY : MAX_BODY);
      body = raw ? JSON.parse(raw) : {};
    } catch { return sendJSON(res, 400, { error: 'bad_request' }); }
  }

  if (pathname === '/api/auth/register' && method === 'POST') {
    if (tooManyAttempts(req)) return sendJSON(res, 429, { error: 'too_many' });
    const r = await store.register(body);
    if (r.error) return sendJSON(res, 400, { error: r.error });
    const s = store.createSession(r.user.id);
    return sendJSON(res, 200, { user: store.publicUser(r.user) }, { 'Set-Cookie': sessionCookie(req, s.token, s.maxAge) });
  }
  if (pathname === '/api/auth/login' && method === 'POST') {
    if (tooManyAttempts(req)) return sendJSON(res, 429, { error: 'too_many' });
    const r = await store.login(body);
    if (r.error) return sendJSON(res, 401, { error: r.error });
    const s = store.createSession(r.user.id);
    return sendJSON(res, 200, { user: store.publicUser(r.user) }, { 'Set-Cookie': sessionCookie(req, s.token, s.maxAge) });
  }
  if (pathname === '/api/auth/logout' && method === 'POST') {
    store.deleteSession(sessionToken(req));
    return sendJSON(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(req, '', 0) });
  }

  const user = currentUser(req);
  if (!user) return sendJSON(res, 401, { error: 'unauthorized' });

  if (pathname === '/api/me' && method === 'GET') return sendJSON(res, 200, { user: store.publicUser(user) });
  if (pathname === '/api/me' && method === 'PATCH') {
    const r = store.updateProfile(user, body);
    return r.error ? sendJSON(res, 400, r) : sendJSON(res, 200, { user: store.publicUser(r.user) });
  }
  if (pathname === '/api/me/password' && method === 'POST') {
    const r = await store.changePassword(user, sessionToken(req), body);
    return sendJSON(res, r.error ? 400 : 200, r);
  }
  if (pathname === '/api/me' && method === 'DELETE') {
    const r = await store.deleteAccount(user, body);
    return r.error ? sendJSON(res, 400, r) : sendJSON(res, 200, r, { 'Set-Cookie': sessionCookie(req, '', 0) });
  }
  if (pathname === '/api/ai/schedule' && method === 'POST') return handleScheduleStream(req, res, body);
  // Көңіл күйді талдау: модель әңгімені түсінеді, қазақша жауапты браузер білім базасынан құрастырады.
  if (pathname === '/api/ai/feel' && method === 'POST') {
    try {
      return sendJSON(res, 200, { analysis: await psychology.analyze(ollamaJSON, body.messages) });
    } catch (e) {
      console.error('[ai-feel]', e.message);
      return sendJSON(res, e.message === 'busy' ? 503 : 502, { error: e.message === 'busy' ? 'busy' : 'ai_unavailable' });
    }
  }
  if (pathname === '/api/ai/task' && method === 'POST') {
    try {
      const r = await aiTask(body);
      return sendJSON(res, 200, r);
    } catch (e) {
      console.error('[ai-json]', e.message);
      return sendJSON(res, e.message === 'busy' ? 503 : 502, { error: e.message === 'busy' ? 'busy' : 'ai_unavailable' });
    }
  }
  if (pathname === '/api/state' && method === 'GET') return sendJSON(res, 200, { state: store.getState(user.id) });
  if (pathname.startsWith('/api/state/') && method === 'PUT') {
    const r = store.putState(user.id, decodeURIComponent(pathname.slice('/api/state/'.length)), body.value);
    return sendJSON(res, r.error ? 400 : 200, r);
  }
  return sendJSON(res, 404, { error: 'not_found' });
}

function serveStatic(req, res) {
  let p;
  try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400).end(); return; }
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, path.normalize(p));
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}

http.createServer((req, res) => {
  console.log(new Date().toISOString().slice(11, 19), req.method, req.url);
  const pathname = req.url.split('?')[0];
  if (pathname === '/api/chat' && req.method === 'POST') return handleChat(req, res);
  if (newsProxy.handle(req, res, pathname)) return;   // жаңалықтар (Buddy News серверінен)
  if (req.url === '/api/health') {
    return fetch(OLLAMA + '/api/tags').then(r => r.json()).then(j => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, model: MODEL, available: (j.models || []).some(m => m.name === MODEL) }));
    }).catch(() => { res.writeHead(200, { 'Content-Type': 'application/json' }).end('{"ok":false}'); });
  }
  if (pathname.startsWith('/api/')) return handleApi(req, res, pathname).catch(e => {
    console.error('[api]', e);
    if (!res.headersSent) sendJSON(res, 500, { error: 'server_error' });
  });
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405).end(); return; }
  serveStatic(req, res);
}).listen(PORT, '0.0.0.0', () => {
  console.log(`SMART.Buddy: http://localhost:${PORT}  (model: ${MODEL}, db: ${store.file})`);
});
