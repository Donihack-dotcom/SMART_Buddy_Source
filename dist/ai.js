// Buddy ЖИ қабаты: ережелер жауап таппаған сұрақтарды Ollama моделіне (server.js → /api/chat) жібереді,
// чатқа сурет қосуға мүмкіндік береді, «дедлайн қос» десе тапсырманы, «кестеге қос» десе сабақтарды шын қосады.
(function(){
const aiText={
 kk:{assistantNote:'Кесте бойынша нақты жауаптарды ережелер есептейді. Басқа сұрақтарға Buddy ЖИ (Qwen3-VL, локалды) жауап береді — әзірге орыс тілінде. «Сейсенбі 14:00 волейбол дедлайнын қос» десең — дедлайн, «кестеме қос» деп сурет жіберсең — сабақтар қосылады. Маңызды ақпаратты тексер.',thinking:'Buddy ойлануда…',aiOffline:'ЖИ қазір қолжетімсіз. Кесте, сабақ немесе дедлайн туралы нақты сұрақ қойып көр.',aiBusy:'Buddy қазір басқа сұрауды өңдеп жатыр. Сәлден кейін қайталап көр.',attach:'Сурет қосу',removeImage:'Суретті алып тастау',imageQuestion:'Суретте не бар? Түсіндірші.',notImage:'Тек сурет файлын қосуға болады',creatingTask:'Buddy дедлайнды қосып жатыр…',taskCreated:'Дедлайн қосылды',tasksCreated:'{n} дедлайн қосылды',taskUndo:'↶ Болдырмау',taskUndone:'Болдырылмады — өшірілді.',taskNoDate:'«{title}» — қай күнге қосайын? Күнін жаз, мысалы: «сейсенбі 14:00».',taskFail:'Не қосу керегін түсінбедім. Атауы мен күнін жаз, мысалы: «Сейсенбі 14:00 волейбол дедлайнын қос».',openTasks:'Дедлайндар ↗',readingSchedule:'Buddy кестені оқып жатыр…',lessonsAdded:'Кестеге {n} сабақ қосылды',openSchedule:'Кестені ашу ↗',noLessonsChat:'Сабақ таба алмадым. Мысалы: «Кестеме дүйсенбі 10:00–10:50 Физика, дәріс, 305 ауд. қос» деп жаз немесе кесте суретін жібер.',lessonsSkipped:'{n} сабақ кестеде бұрыннан бар.'},
 ru:{assistantNote:'Точные ответы по расписанию считаются правилами. На остальные вопросы отвечает Buddy ИИ (Qwen3-VL, локально). Напиши «добавь дедлайн: волейбол, вторник 14:00» — появится дедлайн; пришли фото расписания с «добавь в расписание» — добавятся пары. Проверяй важное.',thinking:'Buddy думает…',aiOffline:'ИИ сейчас недоступен. Спроси конкретно про расписание, пары или дедлайны.',aiBusy:'Buddy сейчас обрабатывает другой запрос. Попробуй чуть позже.',attach:'Прикрепить картинку',removeImage:'Убрать картинку',imageQuestion:'Что на картинке? Объясни.',notImage:'Можно прикрепить только изображение',creatingTask:'Buddy добавляет дедлайн…',taskCreated:'Дедлайн добавлен',tasksCreated:'Добавлено дедлайнов: {n}',taskUndo:'↶ Отменить',taskUndone:'Отменено — удалено.',taskNoDate:'«{title}» — на какой день добавить? Напиши день, например: «вторник 14:00».',taskFail:'Не понял, что добавить. Напиши название и день, например: «Добавь дедлайн: волейбол, вторник 14:00».',openTasks:'Дедлайны ↗',readingSchedule:'Buddy читает расписание…',lessonsAdded:'В расписание добавлено пар: {n}',openSchedule:'Открыть расписание ↗',noLessonsChat:'Не нашёл пар. Напиши, например: «Добавь в расписание: понедельник 10:00–10:50 Физика, лекция, ауд. 305» или пришли фото расписания.',lessonsSkipped:'{n} пар уже были в расписании.'},
 en:{assistantNote:'Exact timetable answers use rules. Other questions are answered by Buddy AI (Qwen3-VL, local). Write “add a deadline: volleyball, Tuesday 14:00” to create a deadline; send a timetable photo with “add to my timetable” to add classes. Double-check anything important.',thinking:'Buddy is thinking…',aiOffline:'AI is unavailable right now. Try a specific question about classes or deadlines.',aiBusy:'Buddy is busy with another request. Try again in a moment.',attach:'Attach image',removeImage:'Remove image',imageQuestion:'What is in this image? Explain.',notImage:'Only image files can be attached',creatingTask:'Buddy is adding the deadline…',taskCreated:'Deadline added',tasksCreated:'{n} deadlines added',taskUndo:'↶ Undo',taskUndone:'Undone — removed.',taskNoDate:'“{title}” — which day should I set? Write the day, e.g. “Tuesday 14:00”.',taskFail:'I could not tell what to add. Write a name and a day, e.g. “Add a deadline: volleyball, Tuesday 14:00”.',openTasks:'Deadlines ↗',readingSchedule:'Buddy is reading the timetable…',lessonsAdded:'{n} classes added to your timetable',openSchedule:'Open timetable ↗',noLessonsChat:'I found no classes. Write e.g. “Add to my timetable: Monday 10:00–10:50 Physics, lecture, room 305” or send a timetable photo.',lessonsSkipped:'{n} classes were already there.'}
};
Object.assign(aiText.kk,{taskExists:'«{title}» дедлайны бұрыннан бар: {when}. Басқасын қосу үшін атауы мен күнін жаз.'});
Object.assign(aiText.ru,{taskExists:'«{title}» уже есть: {when}. Чтобы добавить другой, напиши название и день.'});
Object.assign(aiText.en,{taskExists:'“{title}” is already there: {when}. To add another one, write its name and day.'});
Object.keys(aiText).forEach(l=>Object.assign(dictionary[l],aiText[l]));
const fmt=(k,v)=>Object.entries(v).reduce((s,[a,b])=>s.replaceAll('{'+a+'}',b),t(k));

// ---------- Студентке атымен жүгіну («Жарайды, Danny!») ----------
// Лақап ат профильде (Баптаулар → Профиль); болмаса атының бірінші сөзі.
const nick=()=>{const u=window.BUDDY_USER||{};return String(u.nickname||'').trim()||String(u.name||'').split(' ')[0]||''};
const LEAD={
 done:{kk:['Жарайды, {n}!','Дайын, {n}!','Болды, {n}!'],ru:['Хорошо, {n}!','Готово, {n}!','Сделано, {n}!'],en:['Sure, {n}!','Done, {n}!','All set, {n}!']},
 info:{kk:['{n}, міне 👇','Қарап шықтым, {n} 👇','Жарайды, {n}, міне 👇'],ru:['{n}, вот 👇','Посмотрел, {n} 👇','Смотри, {n} 👇'],en:['{n}, here you go 👇','Checked it, {n} 👇','Look, {n} 👇']},
 ask:{kk:['{n}, '],ru:['{n}, '],en:['{n}, ']}
};
let leadTurn=0;
function lead(kind){const n=nick();if(!n)return '';const list=LEAD[kind][lang]||LEAD[kind].en;return list[leadTurn++%list.length].replaceAll('{n}',n)}
// «{n}, «Эссе» — қай күнге…» — сұрақ түріндегі жауапқа атты алдына қосамыз.
const askLead=s=>{const l=lead('ask');return l?l+s.charAt(0).toLowerCase()+s.slice(1):s};
const keepFirstCap=s=>/^[«“"]/.test(s);

const typeName={kk:{lecture:'дәріс',practice:'практика',lab:'зертхана',seminar:'семинар'},ru:{lecture:'лекция',practice:'практика',lab:'лабораторная',seminar:'семинар'},en:{lecture:'lecture',practice:'practice',lab:'lab',seminar:'seminar'}};
const dayName=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const sName=id=>(S.subjects[id]&&S.subjects[id][lang])||id;
const placeText=l=>l.online||l.room==='online'?'online':[l.building,l.room?'room '+l.room:''].filter(Boolean).join(', ')||'room not set';
const lessonLine=l=>`${l.start}-${l.end} ${sName(l.subject)} (${typeName[lang][l.type]||l.type})${l.teacher?', '+l.teacher:''}, ${placeText(l)}`;
const fmtDT=d=>new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Almaty',weekday:'long',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(d);

const localDay={kk:['жексенбі','дүйсенбі','сейсенбі','сәрсенбі','бейсенбі','жұма','сенбі'],ru:['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'],en:dayName.map(d=>d.toLowerCase())};
const noClassesText={kk:'САБАҚ ЖОҚ (бос күн)',ru:'ПАР НЕТ (свободный день)',en:'NO CLASSES (free day)'};
const dayAliases=[['жексен','воскрес','sunday'],['дүйсен','понедель','monday'],['сейсен','вторник','tuesday'],['сәрсен','сред','wednesday'],['бейсен','четвер','thursday'],['жұма','пятниц','friday'],['сенбі','суббот','saturday']];
// Сұрақта аталған күндерді код өзі анықтайды: модель күнді шатастырмауы үшін сол күндердің дәл сабақтары беріледі.
function focusDates(q,today){
 const s=(q||'').toLowerCase(),out=new Set(),todayDay=new Date(today+'T12:00:00+05:00').getUTCDay();
 if(/бүрсігүн|послезавтра|day after tomorrow/.test(s))out.add(S.shift(today,2));
 else if(/ертең|завтра|tomorrow/.test(s))out.add(S.shift(today,1));
 if(/бүгін|сегодня|today|tonight|кешке|вечером/.test(s))out.add(today);
 dayAliases.forEach((a,d)=>{if(a.some(x=>s.includes(x)))out.add(S.shift(today,(d-todayDay+7)%7))});
 if(/демалыс|выходн|weekend/.test(s)){out.add(S.shift(today,(6-todayDay+7)%7));out.add(S.shift(today,(7-todayDay)%7))}
 if(/апта|недел|week/.test(s)&&!out.size)for(let i=0;i<7;i++)out.add(S.shift(today,i));
 return [...out].sort();
}

// Сұрақта күн аталса, сол күндердің сабақтарын код өзі жазады (әрқашан дұрыс), модель тек кеңес береді.
function factsHeader(focus){
 if(!focus.length)return '';
 return focus.map(d=>{const ev=S.events(d,repeat),dl=tasks.filter(x=>!x.done&&x.date===d);
  return '📅 '+dt(d,{weekday:'long'})+'\n'+(ev.length?ev.map(line).join('\n'):t('empty'))+(dl.length?'\n'+dl.map(x=>'⏰ '+x.title+' — '+(x.time||'23:59')).join('\n'):'')}).join('\n\n');
}

function buildContext(q){
 const now=new Date(),st=S.state(now,repeat),out=[],today=S.localDate(now),tomorrow=S.shift(today,1),sem=S.semester();
 const focus=focusDates(q,today),header=factsHeader(focus);
 const wd=d=>localDay[lang][new Date(d+'T12:00:00+05:00').getUTCDay()];
 const dayList=d=>{const ev=S.events(d,repeat);return ev.length?ev.map(l=>l.start+'-'+l.end+' '+sName(l.subject)).join(', '):noClassesText[lang]};
 if(focus.length){
  out.push('SHOWN ABOVE — the app has ALREADY shown the student these exact, correct facts right above your answer:');
  focus.forEach(d=>out.push('• '+wd(d)+' '+d+': '+dayList(d)));
  const subj=[...new Set(focus.flatMap(d=>S.events(d,repeat).map(l=>sName(l.subject))))];
  out.push(subj.length?'The ONLY subjects on these days are: '+subj.join(', ')+'. When giving advice for these days, mention only these subjects — no other subjects.':'There are NO classes on these days — do not mention any classes for them.');
  out.push('Do NOT list the class times again. Write only practical advice or a short plan for these days.','');
 }
 const user=window.BUDDY_USER||{},hasSunday=S.weekly.some(l=>l.day===0);
 const study=[user.university,user.major&&'major: '+user.major,user.course&&'year: '+user.course,user.group&&'group '+user.group].filter(Boolean).join(', ');
 out.push('Student: '+(user.name||'student')+(nick()?' (call them "'+nick()+'")':'')+'. '+(study?study+'.':'ENU.')+' Semester: '+sem.start+' to '+sem.end+'.'+(hasSunday?'':' Sunday has no classes.'));
 out.push('Now (Astana): '+fmtDT(now));
 out.push('TODAY is '+wd(today)+' '+today+'. Today: '+dayList(today));
 out.push('TOMORROW is '+wd(tomorrow)+' '+tomorrow+'. Tomorrow: '+dayList(tomorrow));
 out.push('Current class: '+(st.current?lessonLine(st.current)+', ends in '+st.remaining+' min':'none'));
 out.push('Next class: '+(st.next?st.next.date+' ('+wd(st.next.date)+') '+lessonLine(st.next)+', starts in '+st.wait+' min':'none'));
 if(!focus.length){
  out.push('','Weekly timetable (repeats every week'+(!S.isCustom()&&!repeat?' — weekly repeat is OFF, only week 2026-11-02..08 confirmed':'')+'):');
  for(const d of [1,2,3,4,5,6,...(hasSunday?[0]:[])]){const ls=S.weekly.filter(l=>l.day===d).sort((a,b)=>a.start.localeCompare(b.start));out.push(localDay[lang][d]+': '+(ls.length?ls.map(lessonLine).join('; '):noClassesText[lang]))}
  out.push('','Next 7 days:');
  for(let i=0;i<7;i++){const date=S.shift(today,i);out.push(date+' '+wd(date)+(i===0?' (today)':i===1?' (tomorrow)':'')+': '+dayList(date))}
 }
 const open=P.sortTasks(tasks).filter(x=>!x.done);
 out.push('','Open tasks/deadlines:',...(open.length?open.map(x=>{const m=Math.round((P.dueDate(x)-now)/60000);return '- '+x.title+(x.subjectId?' ['+sName(x.subjectId)+']':x.subject?' ['+x.subject+']':'')+' due '+wd(x.date)+' '+x.date+' '+(x.time||'23:59')+' ('+(m<0?'OVERDUE':'in '+Math.floor(m/1440)+'d '+Math.floor(m%1440/60)+'h')+')'}):['none']));
 const done=tasks.filter(x=>x.done).length;if(done)out.push('Completed tasks: '+done);
 out.push('','GPA courses (credits, grade points 0-4):',...courses.map(c=>'- '+(c.subjectId?sName(c.subjectId):c.name)+': '+c.credits+' credits, '+c.grade),'Calculated GPA: '+gpaValue()+' / 4.00');
 out.push('Exam formula example: final = rating*0.6 + exam*0.4.');
 return {context:out.join('\n'),header};
}

const cleanText=s=>s.replace(/\*\*|__|^#+\s*/gm,'').replace(/^\s*[-*]\s+/gm,'• ');
// Кеңес, жоспар, түсіндіру сұрайтын сұрақтар ережелерге емес, бірден ЖИ-ге барады.
const AI_FIRST=/қалай|неге|неліктен|кеңес|жоспар|дайында|көмектес|түсіндір|ұсын|не істе|мотивац|бос уақыт|үлгер|как |почему|зачем|совет|план|подготов|помоги|объясни|посоветуй|что делать|успе|свободн|how |why |advice|plan|prepar|help me|explain|suggest|should i|free time|motivat/;

// ---------- Ниетті тану (қате жазулармен де) ----------
const ADD_VERB=/қос|жаса|құр|жаз|белгіле|енгіз|сақта|салып|сал\b|добав|дабав|допиш|давай|созда|запиш|запомн|постав|сделай|внеси|внести|занес|add|create|set|make|put|save|insert|remind|напомн|еске сал/;
const TASK_NOUN=/дедлайн|дедлаин|deadline|тапсырма|задач|задани|напомин|напомни|еске сал|remind|reminder/;
const SCHED_NOUN=/кесте|расписан|раписан|schedule|timetable/;
const LESSON_NOUN=/сабақ|пара\b|пары|пару|урок|занят|class|lesson|лекци|дәріс|семинар/;
const LIST_Q=/қандай|какие|какой|покажи|көрсет|список|тізім|сколько|қанша|what|which|list|show|бар ма|есть ли/;
const hasTime=s=>/\b([01]?\d|2[0-3])[:.][0-5]\d\b/.test(s);
function intentOf(q,hasImage){
 const s=q.toLowerCase(),verb=ADD_VERB.test(s),today=S.localDate();
 const listing=LIST_Q.test(s)&&!verb;
 if(SCHED_NOUN.test(s)&&(verb||hasImage)&&!TASK_NOUN.test(s))return 'schedule';
 if(TASK_NOUN.test(s)&&!listing&&(verb||hasTime(s)||focusDates(s,today).length))return 'task';
 if(hasImage&&LESSON_NOUN.test(s)&&verb)return 'schedule';
 if(!hasImage&&LESSON_NOUN.test(s)&&verb&&hasTime(s)&&dayAliases.some(a=>a.some(x=>s.includes(x))))return 'schedule';
 return null;
}

let busy=false,pendingImage=null;
const ruleAsk=ask;
const plain=m=>({user:!!m.user,text:String(m.text||'')});
const bubble=()=>$('#chatLog .chat-bubble:last-child');
const setBubble=(msg,thinking)=>{const b=bubble();if(b&&b.firstChild&&b.firstChild.nodeType===3){b.firstChild.nodeValue=msg.text;b.classList.toggle('ai-thinking',!!thinking)}const log=$('#chatLog');if(log)log.scrollTop=log.scrollHeight};
const finish=(chat,msg)=>{msg.at=new Date().toISOString();chat.updated=msg.at;persistChats();render()};

// Көңіл күйге қолдау: мәтінді support.js құрастырады (студенттің нақты кестесі мен дедлайндарымен).
// Әңгіме ішінде (алдыңғы жауап да қолдау болса) — қысқа нұсқа; жалғасқа арналған дайын жауап болса — сол.
// ---------- Көңіл күйді қолдау: модель ойланады ----------
// 1) Қауіпті белгі (суицид, өзіне зиян) — бірден сенім телефондары (модельге жіберілмейді).
// 2) Әңгіме күйлері: баға 1–10, «жоспар», «рахмет», «білмеймін», «сөйлескім келеді» — дәл жауап.
// 3) Басқасының бәрін модель ТҮСІНЕДІ (/api/ai/feel): жағдай, сезім, күші, қажеттілік, студенттің өз сөзі, қауіп.
//    Қазақша: support-kb.js осы түсінікке сай білім базасынан жеке жауап құрастырады (модельдің қазақшасы әлсіз).
//    Орыс/ағылшын: модель жауапты өзі жазады — оған талдау мен осы жағдайдың білім базасы беріледі.
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const condensed=m=>({user:!!m.user,text:m.user?String(m.text||''):String(m.text||'').split(/\n\s*\n/)[0]});
async function analyzeFeeling(chat){
 try{
  const r=await fetch('/api/ai/feel',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:chat.messages.slice(0,-1).slice(-6).map(condensed)})});
  return r.ok?(await r.json()).analysis:null;
 }catch{return null}
}
async function supportTurn(chat,msg,q,mood,last){
 const B=BuddySupport,inTalk=!!(last&&!last.user&&last.flow==='support');
 setBubble(msg,true);
 const done=text=>{msg.text=text;finish(chat,msg)};
 if(mood&&mood.kind==='crisis'){await pause(200);msg.mood='crisis';return done(B.reply(mood))}
 const quick=inTalk?B.followUp(q,last.text):null;
 if(quick){await pause(700);msg.mood=last.mood;return done(quick)}
 let a=await analyzeFeeling(chat);
 if(a&&a.risk==='high'){msg.mood='crisis';return done(B.reply({kind:'crisis'}))}
 if(!a){   // модель қолжетімсіз — кілт сөздер бойынша
  if(mood)a=B.fromMood(mood,q);
  else if(inTalk&&last.analysis)a={...last.analysis,quote:'',intensity:Math.max(5,last.analysis.intensity-1)};
  else{const off=B.offlineFollow(q);return done(off||B.reply({kind:'sad'}))}
 }
 // Әңгіменің негізгі тақырыбы сақталады: «ол басқамен жүр, ұйықтай алмаймын» — ажырасу (+ ұйқысыздық қадамдары).
 const TOPICS=['teacher_conflict','public_embarrassment','exam_fail','exam_fear','deadlines_pile','breakup','family_conflict','friend_conflict','loneliness','homesick','money_problems','bullying','avoid_classes','self_doubt','future_worry'];
 const GENERIC=['general_sadness','other','sleep_problems','burnout','low_motivation'];
 if(inTalk&&last.analysis&&TOPICS.includes(last.analysis.situation)&&GENERIC.includes(a.situation)){
  if(!a.symptom&&['sleep_problems','burnout','low_motivation'].includes(a.situation))a.symptom=a.situation;
  a.situation=last.analysis.situation;
 }
 msg.mood=a.situation;msg.analysis=a;
 if(lang==='kk'){const r=B.compose(a,chat,{inTalk});msg.kb=r.ids;return done(r.text)}
 await streamAI(chat,msg,null,'support',a);
 if(!msg.text||msg.text===t('aiOffline')||msg.text===t('aiBusy'))done(mood?(inTalk?B.replyShort(mood):B.reply(mood)):(B.offlineFollow(q)||B.reply({kind:'sad'})));
}

async function streamAI(chat,msg,image,mode,analysis){
 const support=mode==='support';
 // Қолдау режимінде кесте фактілерін жауаптың үстіне шығармаймыз — тек мәнмәтін ретінде береміз.
 const q=chat.messages[chat.messages.length-2].text,{context,header}=buildContext(support?'':q),pre=header&&!support?header+'\n\n':'';
 let raw='';
 const show=body=>{msg.text=pre+body;setBubble(msg,!raw.trim())};
 show(t('thinking'));
 try{
  const r=await fetch('api/chat',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({lang,context,mode:support?'support':undefined,analysis:support?analysis:undefined,image:image||undefined,messages:chat.messages.slice(0,-1).slice(-8).map(support?m=>({user:!!m.user,text:m.user?String(m.text||''):String(m.text||'').split(/\n\s*\n/)[0]}):plain)})});
  if(r.status===503)throw new Error('busy');
  if(!r.ok||!r.body)throw new Error('offline');
  const reader=r.body.getReader(),dec=new TextDecoder();
  for(;;){const {done,value}=await reader.read();if(done)break;raw+=dec.decode(value,{stream:true});show(cleanText(raw).trim()||t('thinking'))}
  if(!raw.trim())throw new Error('offline');
 }catch(e){if(raw.trim())show(cleanText(raw).trim());else show(header?'':t(e.message==='busy'?'aiBusy':'aiOffline'))}
 msg.text=msg.text.trim();msg.at=new Date().toISOString();chat.updated=msg.at;persistChats();setBubble(msg,false);
}

// ---------- Чаттан дедлайн құру ----------
// Пәнді тек нақты сәйкестікте байлаймыз: модельдің атауы толық сәйкес келсе немесе студент пәнді өзі атаса.
// Модель ұсынған пән тапсырма атауымен ортақ сөзі болса ғана қабылданады (модель кейде пәнді болжап қояды).
function matchSubject(name,title){
 const n=String(name||'').toLowerCase().trim(),s=String(title||'').toLowerCase();
 const stems=v=>v.split(/[\s,.()«»"-]+/).filter(w=>w.length>=4).map(w=>w.slice(0,Math.max(4,Math.ceil(w.length*.7))));
 if(n.length>=3){const hit=Object.entries(S.subjects).find(([,x])=>{const v=x[lang].toLowerCase();return (v===n||(n.length>=8&&(v.startsWith(n)||n.startsWith(v))))&&stems(v).some(w=>s.includes(w))});if(hit)return hit[0]}
 return Object.keys(aliases).find(k=>aliases[k].some(a=>a.length>=4&&s.includes(a)))||null;
}
const FILLER=['дедлайн','deadline','добав','дабав','add','қос','мне','маған','ты','сен','мен','пожалуйста','please','тапсырма','задач','задани','напомн','создай','create','set','жаса','құр','для','для меня','керек','нужно','new','жаңа'];
const meaningfulTitle=title=>String(title||'').toLowerCase().split(/[\s,.!?«»"']+/).filter(w=>w.length>1&&!FILLER.some(f=>w.startsWith(f))).length>0;
const MONTHS=/қаңтар|ақпан|наурыз|сәуір|мамыр|маусым|шілде|тамыз|қыркүйек|қазан|қараша|желтоқсан|январ|феврал|март|апрел|мая|июн|июл|август|сентябр|октябр|ноябр|декабр|january|february|march|april|may|june|july|august|september|october|november|december/;
const hasDateCue=s=>{s=String(s||'').toLowerCase();return focusDates(s,S.localDate()).length>0||MONTHS.test(s)||/\d{1,2}[./]\d{1,2}/.test(s)||/через|after|кейін|келесі|следующ|next|күннен|дней|days/.test(s)};
// Сол чаттағы соңғы пайдаланушы хабарламалары — «иа, солай қос» сияқты жауаптарды түсіну үшін.
// Бұрын орындалған сұрау (дедлайн/сабақ қосылған хабарлама) қайта қосылмауы үшін тек содан кейінгі хабарламаларды аламыз.
const recentUserTexts=(chat,n=4)=>{
 const msgs=chat.messages.slice(0,-2);let from=0;
 msgs.forEach((m,i)=>{if(!m.user&&(m.taskIds||m.lessonUndo))from=i+1});
 return msgs.slice(from).filter(m=>m.user).slice(-n).map(m=>m.text);
};
const sameTask=(a,b)=>!b.done&&a.title.trim().toLowerCase()===String(b.title).trim().toLowerCase()&&a.date===b.date&&(a.time||'23:59')===(b.time||'23:59');
async function createTask(chat,msg,q,image){
 msg.text=t('creatingTask');setBubble(msg,true);
 const today=S.localDate(),history=recentUserTexts(chat);
 const days=Array.from({length:45},(_,i)=>{const d=S.shift(today,i),wdi=new Date(d+'T12:00:00+05:00').getUTCDay();return {date:d,weekday:dayName[wdi]+' / '+localDay.kk[wdi]+' / '+localDay.ru[wdi],label:i===0?'today':i===1?'tomorrow':''}});
 let data=null,status=0;
 try{const r=await fetch('/api/ai/task',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({lang,text:q,history,image:image||undefined,days,subjects:Object.values(S.subjects).map(s=>s[lang])})});status=r.status;if(r.ok)data=await r.json()}catch{}
 if(!data){msg.text=t(status===503?'aiBusy':'aiOffline');return finish(chat,msg)}
 // Мағынасыз атауды («Добавь дедлайн») қабылдамаймыз — Buddy не қосу керегін сұрайды.
 const list=(data.tasks||[]).filter(x=>meaningfulTitle(x.title));
 // Күнді модель емес, код есептейді: модель тек «жұмаға», «вторник» сияқты сөздерді қайтарады.
 const allText=[...history,q].join(' '),coded=focusDates(q,today).filter(d=>d>=today),codedAll=focusDates(allText,today).filter(d=>d>=today);
 const timeIn=s=>{const m=/(^|[^\d])([01]?\d|2[0-3])[:.]([0-5]\d)(?!\d)/.exec(s);return m?m[2].padStart(2,'0')+':'+m[3]:''};
 const cue=hasDateCue(allText);
 list.forEach(x=>{
  const byWhen=x.when?focusDates(x.when,today).filter(d=>d>=today):[];
  if(byWhen.length===1)x.date=byWhen[0];
  else if(list.length===1&&coded.length===1)x.date=coded[0];
  else if(list.length===1&&codedAll.length===1)x.date=codedAll[0];
  else if(!cue||x.date<today)x.date='';   // хабарламада күн мүлде айтылмаса, модель ойлап тапқан күнді алмаймыз
  if(list.length===1&&!x.time)x.time=timeIn(q)||timeIn(allText);
 });
 const ready=list.filter(x=>x.date),missing=list.filter(x=>!x.date);
 if(!list.length){msg.text=askLead(t('taskFail'));msg.flow='task';return finish(chat,msg)}
 if(!ready.length){const q2=fmt('taskNoDate',{title:missing[0].title});msg.text=keepFirstCap(q2)?(nick()?nick()+', '+q2:q2):askLead(q2);msg.flow='task';return finish(chat,msg)}
 // Дәл сондай (атауы, күні, уақыты бірдей) ашық дедлайн бар болса, екінші рет қоспаймыз.
 const fresh=ready.filter(x=>!tasks.some(y=>sameTask({...x,time:x.time||'23:59'},y)));
 if(!fresh.length){const x=ready[0];msg.text=askLead(fmt('taskExists',{title:x.title,when:dt(x.date,{weekday:'long'})+', '+(x.time||'23:59')}));return finish(chat,msg)}
 ready.splice(0,ready.length,...fresh);
 const created=ready.map((x,i)=>{const subjectId=matchSubject(x.subject,x.title);return {id:Date.now()+i,title:x.title,subjectId,subject:'',date:x.date,time:x.time||'23:59',done:false}});
 tasks.push(...created);save('buddy_tasks',tasks);
 msg.taskIds=created.map(x=>x.id);
 const hi=lead('done');
 msg.text=(hi?hi+'\n':'')+'✅ '+(created.length===1?t('taskCreated'):fmt('tasksCreated',{n:created.length}))+'\n'+created.map(x=>`«${x.title}»\n📅 ${dt(x.date,{weekday:'long'})}, ${x.time}`+(x.subjectId?`\n📚 ${sName(x.subjectId)}`:'')).join('\n\n')+(missing.length?'\n\n'+fmt('taskNoDate',{title:missing[0].title}):'');
 if(missing.length)msg.flow='task';
 finish(chat,msg);
}

// ---------- Чаттан кестеге сабақ қосу (сурет немесе мәтін) ----------
async function createLessons(chat,msg,q,image){
 const E=window.BuddyScheduleEditor;
 msg.text=t('readingSchedule');setBubble(msg,true);
 let found=[],error='';
 try{found=await E.extractLessons({image,text:image?q:[...recentUserTexts(chat,2),q].join('\n'),onLesson:(l,n)=>{msg.text=t('readingSchedule')+'\n'+fmt('foundSoFar',{n});setBubble(msg,true)}})}
 catch(e){error=e.message==='busy'?'aiBusy':'aiOffline'}
 if(error&&!found.length){msg.text=t(error);return finish(chat,msg)}
 if(!found.length){msg.text=askLead(t('noLessonsChat'));return finish(chat,msg)}
 const r=E.addLessons(found);
 msg.lessonUndo={lessonIds:r.lessonIds,subjectIds:r.subjectIds,wasDemo:r.wasDemo};
 const hi=lead('done');
 msg.text=(hi?hi+'\n':'')+'✅ '+fmt('lessonsAdded',{n:r.lessonIds.length})+'\n'+found.slice(0,12).map(l=>`${E.dayShort(l.day)} ${l.start}–${l.end} · ${l.subject}${l.online?' · '+t('online'):l.room?' · '+l.room+' '+t('room'):''}`).join('\n')+(found.length>12?'\n…':'')+(r.skipped?'\n\n'+fmt('lessonsSkipped',{n:r.skipped}):'');
 finish(chat,msg);
}

// ---------- Чатқа сурет қосу ----------
function refreshAttach(){
 $$('.search-box').forEach(form=>{
  const input=form.querySelector('input[name=query]');if(!input||!form.querySelector('[data-attach]'))return;
  form.querySelectorAll('.attach-chip').forEach(x=>x.remove());
  input.required=!pendingImage;
  if(pendingImage){input.insertAdjacentHTML('beforebegin',`<span class="attach-chip"><img src="${pendingImage.thumb}" alt=""><button type="button" data-remove-image aria-label="${t('removeImage')}">×</button></span>`);
   form.querySelector('[data-remove-image]').onclick=()=>{pendingImage=null;refreshAttach()}}
 });
}
async function attachFile(file){
 if(!file)return;
 if(!/^image\//.test(file.type))return toast(t('notImage'));
 try{pendingImage=await BuddyImage.readImage(file,1800,.88);refreshAttach();const i=$('#chatForm input[name=query]')||$('#searchForm input[name=query]');if(i)i.focus()}catch{toast(t('notImage'))}
}
const baseSearchBox=searchBox;
searchBox=function(id,placeholder){
 const html=baseSearchBox(id,placeholder);
 if(id!=='chatForm'&&id!=='searchForm')return html;
 return html.replace('<button aria-label',`<label class="attach-btn" title="${t('attach')}"><input type="file" accept="image/*" data-attach hidden aria-label="${t('attach')}">📎</label><button aria-label`);
};
const msgTaskIds=m=>m.taskIds||(m.taskId?[m.taskId]:[]);
// Қарсы алу сөзі: «Сәлем! 💜» → «Сәлем, Danny! 💜»
const welcomeText=()=>{const n=nick(),w=t('welcome');return n?w.replace(/^(Сәлем|Привет|Hey|Hi)!/,'$1, '+esc(n)+'!'):w};
chatMessages=function(){
 const c=getActiveChat();
 return `<div class="chat-bubble">${welcomeText()}</div>`+(c?c.messages.map((m,i)=>{
  const img=m.image&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(m.image)?`<img class="chat-img" src="${m.image}" alt="">`:'';
  const ids=msgTaskIds(m),liveTasks=!m.undone&&ids.some(id=>tasks.some(x=>x.id===id));
  const liveLessons=!m.undone&&m.lessonUndo&&m.lessonUndo.lessonIds.length;
  const actions=liveTasks?`<span class="chat-task-actions"><button class="text-btn" data-view="tasks">${t('openTasks')}</button><button class="text-btn" data-undo-msg="${i}">${t('taskUndo')}</button></span>`
   :liveLessons?`<span class="chat-task-actions"><button class="text-btn" data-view="editor">${t('openSchedule')}</button><button class="text-btn" data-undo-msg="${i}">${t('taskUndo')}</button></span>`:'';
  return `<div class="chat-bubble ${m.user?'user':''}">${esc(m.text)}${img}${actions}<time datetime="${esc(m.at)}">${dt(new Date(m.at))} · ${timeWithoutSeconds(new Date(m.at))}</time></div>`}).join(''):'');
};
function undoMessage(index){
 const c=getActiveChat(),m=c&&c.messages[index];if(!m||m.undone)return;
 const ids=msgTaskIds(m);
 if(ids.length){tasks=tasks.filter(x=>!ids.includes(x.id));save('buddy_tasks',tasks)}
 if(m.lessonUndo)window.BuddyScheduleEditor.removeLessons(m.lessonUndo);
 m.undone=true;m.text+='\n\n'+t('taskUndone');
 persistChats();render();
}
const baseBind=bind;
bind=function(){
 baseBind();
 $$('[data-attach]').forEach(i=>i.onchange=e=>{attachFile(e.target.files[0]);e.target.value=''});
 $$('.search-box input[name=query]').forEach(i=>i.onpaste=e=>{const f=[...(e.clipboardData&&e.clipboardData.files||[])].find(x=>/^image\//.test(x.type));if(f){e.preventDefault();attachFile(f)}});
 $$('[data-undo-msg]').forEach(b=>b.onclick=()=>undoMessage(+b.dataset.undoMsg));
 refreshAttach();
};

// Ережелер берген нақты жауаптар да атымен басталады: «Danny, міне 👇».
const baseRespond=respond;
respond=function(q){const a=baseRespond(q);if(a===t('fallback'))return a;const l=lead('info');return l?l+'\n'+a:a};

ask=function(q){
 q=(q||'').trim();if(busy)return;
 const image=pendingImage;
 if(!q&&!image)return;
 if(!q)q=t('imageQuestion');
 if(currentView!=='chat')activeChatId=null;
 const prev=getActiveChat(),last=prev&&prev.messages[prev.messages.length-1];
 // Buddy алдыңғы хабарламада күнін сұраған болса, бұл хабарлама — сол дедлайнның жалғасы.
 // Бірақ жаңа сұрақ («Емтиханға қалай дайындалам?») жалғасу емес: күні/уақыты бар немесе қысқа жауап болса ғана.
 const s=q.toLowerCase(),followsTask=last&&last.flow==='task'&&!last.taskIds&&!AI_FIRST.test(s)&&!/\?/.test(q)&&(hasTime(s)||hasDateCue(s)||s.split(/\s+/).length<=6);
 // Көңіл күй: қауіпті белгі болса — бәрінен бұрын қолдау; әйтпесе нақты сұрау (дедлайн/кесте) бірінші.
 const mood=!image&&window.BuddySupport?BuddySupport.detect(q):null;
 let intent=mood&&mood.kind==='crisis'?'support':intentOf(q,!!image)||(followsTask?'task':null);
 // Көңіл күй туралы хабарлама немесе қолдау әңгімесінің жалғасы — модель түсініп жауап береді (supportTurn).
 const inTalk=last&&!last.user&&last.flow==='support';
 if(!intent&&mood)intent='support';
 // Әңгіме ішінде кесте ережесі тек анық сұрақта («Келесі сабағым қашан?») жауап береді, әйтпесе «бүгін…» деген әңгімені кесте деп қабылдап қояды.
 const questionLike=/\?|қашан|қандай|қайда|қай күн|неше|когда|какие|какой|где|сколько|^(what|when|where|which)\b/.test(s);
 if(!intent&&!image&&inTalk&&(!questionLike||AI_FIRST.test(s)||respond(q)===t('fallback')))intent='support';
 if(!image&&!intent&&!AI_FIRST.test(q.toLowerCase())&&respond(q)!==t('fallback'))return ruleAsk(q);
 pendingImage=null;
 let c=prev;const at=new Date().toISOString();
 if(!c){c={id:P.makeId('chat'),created:at,updated:at,messages:[]};sessions.push(c);activeChatId=c.id}
 const msg={user:false,text:t('thinking'),at},userMsg={user:true,text:q,at};
 if(image)userMsg.image=image.thumb;
 c.messages.push(userMsg,msg);c.updated=at;persistChats();
 currentView='chat';render();
 busy=true;document.body.classList.add('ai-busy');
 const full=image&&image.full;
 if(intent==='support')msg.flow='support';
 (intent==='support'?supportTurn(c,msg,q,mood,last):intent==='task'?createTask(c,msg,q,full):intent==='schedule'?createLessons(c,msg,q,full):streamAI(c,msg,full))
  .catch(()=>{msg.text=t('aiOffline');finish(c,msg)})
  .finally(()=>{busy=false;document.body.classList.remove('ai-busy');const i=$('#chatForm input');if(i)i.focus()});
};

const st=document.createElement('style');
st.textContent='.chat-bubble.ai-thinking{color:#8b85a7;animation:aiPulse 1.2s ease-in-out infinite}@keyframes aiPulse{50%{opacity:.45}}body.ai-busy .search-box button[type=submit]{opacity:.5;pointer-events:none}';
document.head.appendChild(st);
window.BuddyAI={buildContext,AI_FIRST,intentOf,focusDates};
render();
})();
