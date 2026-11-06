// Buddy-дің психологиялық қолдау «миы» (сервер жағы).
// 1) analyze(): модель студенттің әңгімесін түсінеді — не болды (situation), не сезінеді (feeling), қаншалық күшті,
//    оған қазір не керек (needs), студенттің өз сөзінен қай тіркесті қайталау керек (quote), қауіп бар ма (risk).
//    Қазақша жауапты браузер осы талдау бойынша dist/support-kb.js білім базасынан құрастырады
//    (Qwen3-VL-4B қазақша өз сөйлемдерін қате құрайтыны тексерілді, ал мәтінді түсінуі жақсы).
// 2) guide(): орыс/ағылшын тілінде модель жауапты өзі жазады — оған осы жағдайға арналған білім базасы беріледі.

const SITUATIONS = ['teacher_conflict', 'public_embarrassment', 'exam_fail', 'exam_fear', 'deadlines_pile', 'breakup',
  'family_conflict', 'friend_conflict', 'loneliness', 'homesick', 'sleep_problems', 'burnout', 'low_motivation',
  'avoid_classes', 'future_worry', 'money_problems', 'bullying', 'self_doubt', 'general_sadness', 'feeling_better', 'other'];
const FEELINGS = ['sad', 'anxious', 'ashamed', 'lonely', 'angry', 'tired', 'overwhelmed', 'hopeless', 'heartbroken',
  'guilty', 'unmotivated', 'better', 'neutral'];
const NEEDS = ['calm_down', 'plan', 'rest', 'be_heard', 'practical_advice', 'reach_out', 'self_kindness'];

// «feeling_better» модельге берілмейді — тест кезінде ол «ұйықтай алмаймын» дегенді де «жеңілдеді» деп қойды.
// Студент шынымен жеңілдесе («рахмет, жеңілдеді»), оны браузер өзі таниды.
const MODEL_SITUATIONS = SITUATIONS.filter(s => s !== 'feeling_better');
const SCHEMA = {
  type: 'object',
  properties: {
    situation: { type: 'string', enum: MODEL_SITUATIONS },
    feeling: { type: 'string', enum: FEELINGS },
    intensity: { type: 'integer', minimum: 1, maximum: 10 },
    needs: { type: 'array', items: { type: 'string', enum: NEEDS }, maxItems: 3 },
    quote: { type: 'string' },
    risk: { type: 'string', enum: ['none', 'possible', 'high'] }
  },
  required: ['situation', 'feeling', 'intensity', 'needs', 'quote', 'risk']
};

const PROMPT = [
  'You analyse what a university student writes to a supportive assistant. Messages may be in Kazakh, Russian or English.',
  'Read the WHOLE conversation, focus on the LATEST student message and return JSON:',
  '- situation: what is going on now (closest option). Keep the main topic of the conversation (e.g. a breakup) if the new message continues it.',
  '- feeling: the main emotion now. - intensity: 1-10.',
  '- needs: 1-3 DIFFERENT things that would help most right now.',
  '- quote: a SHORT exact phrase (3-8 words) copied character-for-character from the latest student message that best shows their feeling, or "".',
  '- risk: "high" if any hint of suicide, self-harm or wanting to disappear; "possible" if strong hopelessness; otherwise "none".',
  'Kazakh hints: ұят = shame, айқайлады = yelled, құладым = failed an exam, ажырастық = broke up, жалғыз = alone, сағындым = I miss (home), ұйықтай алмаймын = cannot sleep, үлгермеймін = cannot keep up, барғым келмейді = do not want to go, ерінем = no motivation, ата-анам = my parents, шаршадым = tired, қорқамын = afraid, ақша = money, төлей алмаймын = cannot pay, мазақтайды = mock/bully, сатып кетті = betrayed.'
].join('\n');

// Нақты сөздер табылса, модельдің жағдайын түзетеміз (тест кезінде модель осыларда шатасты).
const OVERRIDES = [
  ['avoid_classes', /барғым келмей|бармаймын|бармай қой|сабаққа бармай|не хочу (идти|ходить) на пар|перестал[аи]? ходить|прогулива|don'?t want to go to (class|uni)|skip(ping)? class/],
  ['money_problems', /ақша(м)? жоқ|ақшам жетпей|төлей алмай|стипенди|жатақхана(ға)? төле|нет денег|не могу (оплатить|заплатить)|денег не хватает|can'?t (afford|pay)|no money/],
  ['homesick', /сағындым|сағынып жүр|ауылым|үйімді сағын|скучаю по (дому|родным|маме)|тоска по дому|homesick|miss (my )?home/],
  ['bullying', /мазақта|мазақ қыл|буллинг|травят|издеваются|высмеивают|bull(y|ied)|mock(s|ing)? me/],
  ['breakup', /ажырастық|ажырасып кетт|айрылыстық|расстал|бросил(а)? меня|broke up|break ?up|dumped/],
  ['friend_conflict', /сатып кетті|досым .{0,20}(алдады|сатты|айтып қойды)|предал(а)?|подставил|betrayed/],
  ['self_doubt', /ештеңеге жарамай|өзіме сенбей|бәрі менен жақсы|ни на что не способ|я ничтожеств|хуже всех|worthless|not good enough/]
];
// Жалпы белгі (ұйқысыздық, мұң) — әңгіменің негізгі тақырыбын (ажырасу т.б.) ауыстырмайды, оны браузер біріктіреді.
const SYMPTOM_RX = [['sleep_problems', /ұйықтай алмай|ұйқым келмей|ұйқым қашты|не могу (уснуть|спать)|бессонн|can'?t sleep|insomnia/]];

function clean(a, lastText) {
  const out = {
    situation: SITUATIONS.includes(a.situation) ? a.situation : 'other',
    feeling: FEELINGS.includes(a.feeling) ? a.feeling : 'neutral',
    intensity: Math.max(1, Math.min(10, Number(a.intensity) || 5)),
    needs: [...new Set((Array.isArray(a.needs) ? a.needs : []).filter(n => NEEDS.includes(n)))].slice(0, 3),
    quote: '',
    risk: ['none', 'possible', 'high'].includes(a.risk) ? a.risk : 'none'
  };
  const low = String(lastText || '').toLowerCase();
  for (const [sit, rx] of OVERRIDES) if (rx.test(low)) { out.situation = sit; break; }
  for (const [sit, rx] of SYMPTOM_RX) if (rx.test(low)) out.symptom = sit;
  // Дәйексөз студенттің соңғы хабарламасында сөзбе-сөз болуы керек, қысқа әрі бүкіл хабарламаны қайталамауы керек.
  const q = String(a.quote || '').trim().replace(/^[«"“']+|[»"”'.,!?…]+$/g, '').trim();
  const whole = low.replace(/[.,!?…\s]+$/, '').trim();
  if (q.length >= 6 && q.length <= 45 && q.split(/\s+/).length >= 2 && low.includes(q.toLowerCase())
    && (q.length <= whole.length * 0.75 || whole.length <= 30)) out.quote = q;
  return out;
}

async function analyze(ollamaJSON, messages) {
  const history = (Array.isArray(messages) ? messages : [])
    .filter(m => m && typeof m.text === 'string' && m.text.trim()).slice(-6)
    .map(m => ({ role: m.user ? 'user' : 'assistant', content: m.text.slice(0, 600) }));
  const last = [...history].reverse().find(m => m.role === 'user');
  if (!last) throw new Error('no message');
  const a = await ollamaJSON([{ role: 'system', content: PROMPT }, ...history], SCHEMA, 200);
  return clean(a, last.content);
}

// Орыс/ағылшын жауаптарына арналған білім базасы: әр жағдайға дәлелді идеялар (CBT, белсенді тыңдау, мінез-құлықты белсендіру).
const GUIDE = {
  teacher_conflict: 'A teacher raised their voice or was unfair. Ideas: the yelling often reflects the teacher\'s own stress, not the student\'s worth; one bad moment does not define the relationship; once calm, talk privately and politely ("it hurt me, I want to understand what was wrong"); if it repeats, tell the advisor/curator — respect is their right.',
  public_embarrassment: 'Embarrassed in front of others. Ideas: the spotlight effect — people forget others\' awkward moments fast; one moment does not define you; telling a friend weakens shame; self-compassion phrase.',
  exam_fail: 'Failed or got a bad grade. Ideas: one grade is one day, not ability; many strong students failed once; ask the teacher where mistakes were; ask the advisor about retake/extra work; calculate the needed score; rest tonight instead of replaying it.',
  exam_fear: 'Afraid of an exam. Ideas: anxiety shows it matters; you do not need to know everything; split material into 3 parts and self-test; 25/5 Pomodoro; top-5 topics; sleep 7+ hours (memory consolidates in sleep); less caffeine.',
  deadlines_pile: 'Too many deadlines. Ideas: write everything down and sort by due date; only the first task today; 25-minute blocks, one thing at a time; politely ask for an extension; phone in another room.',
  breakup: 'A breakup. Ideas: grief is normal, the heart heals with time and self-kindness; do not check their profile or reread chats; meet or call a friend, do not stay alone; let tears out; keep sleep/food/class routine. Never suggest recalling memories or contacting the ex.',
  family_conflict: 'Conflict with parents/family. Ideas: parents often want to protect but say it badly; pause during heated moments; use I-messages ("I struggle when…"); show concrete plans when defending choices (e.g. a major); a trusted relative can mediate.',
  friend_conflict: 'Conflict with or betrayal by a friend. Ideas: their choice is not your flaw; wait before replying; I-message when calm; spend time with other supportive people.',
  loneliness: 'Loneliness. Ideas: many students feel this silently; connections start small — message one classmate first, study together; try one club meeting; call family or an old friend.',
  homesick: 'Missing home in a new city. Ideas: adapting takes time, first semester is hardest; video-call family; invite someone for tea; bring a cosy item from home; join a students-from-your-region club.',
  sleep_problems: 'Cannot sleep. Ideas: everything feels heavier at night; no phone 1 hour before bed; write thoughts down and close the notebook; same bed/wake time; no caffeine after 16:00.',
  burnout: 'Exhausted/burned out. Ideas: rest is part of the work; one hour only for yourself today; 7–8 hours of sleep; water and warm food; postpone one or two tasks.',
  low_motivation: 'No motivation. Ideas: motivation comes after action; 5-minute timer; do only the tiniest first step; phone away; small reward after.',
  avoid_classes: 'Does not want to go to classes. Ideas: avoidance makes fear stronger, attending makes it weaker; go to just one class tomorrow; walk in with a classmate, usual seat; just attending is enough.',
  future_worry: 'Worried about the future. Ideas: no need to solve the whole future today; one concrete goal for the next month; write the worry down; meet the advisor or career center.',
  money_problems: 'Money problems. Ideas: temporary, does not define worth; ask the university social support/student affairs about discounts or installments; ask about paying dorm fees later; track weekly spending; asking a trusted relative for help is not weakness.',
  bullying: 'Being mocked/bullied by classmates. Ideas: it is the bully\'s problem, not your flaw; keep a dated record; tell the curator/advisor — that is self-protection, not complaining; stay near supportive people.',
  self_doubt: 'Feels worthless / compares with others. Ideas: comparing your inside with others\' outside is unfair; everyone has their own pace; write 3 things you did today; compare only with yesterday\'s self.',
  general_sadness: 'General sadness. Ideas: a hard day is not a hard life; one tiny caring action (water, warm food, shower); 10–15 minutes outside in daylight; message one trusted person.',
  feeling_better: 'Feels better or thanks you. Ideas: celebrate the progress briefly, suggest keeping one helpful habit (sleep, walk), remind them they can write anytime.',
  other: 'Listen carefully, reflect what they said, ask one open question to understand more.'
};
const guide = s => GUIDE[s] || GUIDE.other;

module.exports = { analyze, guide, SITUATIONS, FEELINGS, NEEDS };
