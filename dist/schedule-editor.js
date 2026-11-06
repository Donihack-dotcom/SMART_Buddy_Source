// Кесте редакторы: студент пәндерін, сабақтарын, ғимарат/аудиторияны өзі құрады немесе скриншоттан толтырады.
// Кесте buddy_schedule кілтімен сақталады (account.js оны аккаунтқа синхрондайды), schedule.js оны S.setSchedule() арқылы қолданады.
(function(){
const editorText={
 kk:{editor:'Кесте редакторы',editorSub:'Пәндеріңді және сабақтарыңды қос. Өзгерістер аккаунтыңа бірден сақталады.',editSchedule:'✎ Кестені өңдеу',myScheduleTitle:'Менің кестем',demoBadge:'Демо кесте',demoNotice:'Қазір демо кесте көрсетіліп тұр. Өз кестеңді құр — пәндерің, уақытың, аудиторияң.',demoNoticeShort:'Демо кесте көрсетілген.',createOwn:'Өз кестеңді құр →',startTitle:'Кестеңді құрайық',startSub:'Үш жолдың бірін таңда. Кейін бәрін өзгертуге болады.',startEmpty:'Бос кестеден бастау',startEmptySub:'Пәндер мен сабақтарды өзің қосасың',startDemo:'Демо кестені негізге алу',startDemoSub:'Дайын үлгіні өзіңе қарай өзгертесің',startPhoto:'Скриншоттан толтыру',startPhotoSub:'Buddy ЖИ суреттен сабақтарды оқиды (бета)',subjects:'Пәндер',subjectsHint:'Алдымен пәндерді қос — сабақ қосқанда тізімнен таңдайсың.',addSubject:'＋ Пән қосу',editSubject:'Пәнді өңдеу',subjectName:'Пәннің толық атауы',subjectNamePh:'Мысалы, Үлкен деректерді өңдеу',color:'Түсі',noSubjects:'Әзірге пән жоқ',week:'Апталық кесте',addLesson:'＋ Сабақ қосу',editLesson:'Сабақты өңдеу',newLesson:'Жаңа сабақ',subject:'Пән',newSubjectOpt:'＋ Жаңа пән…',days:'Күн',daysMulti:'Күндер (бірнешеуін таңдауға болады)',time:'Уақыты',quickSlots:'Жиі қолданылатын уақыттар',start:'Басталуы',end:'Аяқталуы',lessonType:'Түрі',seminar:'Семинар',teacher:'Оқытушы',teacherPh:'Мысалы, Карелхан Н.',place:'Өтетін орны',inPerson:'Аудиторияда',onlineOpt:'Онлайн',building:'Ғимарат',buildingPh:'Мысалы, №2 оқу ғимараты (АТФ)',roomLabel:'Аудитория',roomPh:'Мысалы, 712',save:'Сақтау',cancel:'Болдырмау',delete:'Өшіру',deleteLessonQ:'Бұл сабақты өшіресің бе?',deleteSubjectQ:'«{name}» пәні және оның {n} сабағы өшіріледі. Жалғастырасың ба?',lessonSaved:'Сабақ сақталды',lessonsSaved:'{n} сабақ қосылды',lessonDeleted:'Сабақ өшірілді',subjectSaved:'Пән сақталды',subjectDeleted:'Пән өшірілді',errSubject:'Пәнді таңда немесе жаңасын жаз',errDays:'Кемінде бір күн таңда',errTime:'Аяқталу уақыты басталудан кейін болуы керек',errName:'Пәннің атауын жаз',overlap:'Ескерту: {day} күні {time} уақытында басқа сабақ бар.',addHere:'＋ Қосу',noLessonsDay:'Сабақ жоқ',semester:'Семестр',semesterSub:'Сабақтар осы аралықта апта сайын қайталанады.',semStart:'Басталуы',semEnd:'Аяқталуы',semesterSaved:'Семестр сақталды',errSemester:'Семестр аяқталуы басталуынан кейін болуы керек',moreActions:'Тағы',backToDemo:'Демо кестеге қайту',backToDemoQ:'Сенің кестең өшіріліп, демо кесте қайта қосылады. Жалғастырасың ба?',clearAll:'Барлық сабақты тазалау',clearAllQ:'Барлық сабақ пен пән өшіріледі. Жалғастырасың ба?',cleared:'Кесте тазаланды',importTitle:'Скриншоттан толтыру',importSub:'SMART.ENU немесе басқа жерден кесте скриншотын жүкте. Buddy ЖИ сабақтарды оқып, тізім ұсынады — сақтамас бұрын тексер.',chooseImage:'Сурет таңдау',reading:'Buddy суретті оқып жатыр… Бұл 20–60 секунд алуы мүмкін.',importFound:'{n} сабақ табылды. Қажет емесін алып таста, сосын қос.',importNone:'Суреттен сабақ табылмады. Анығырақ скриншот жүктеп көр немесе қолмен қос.',importAdd:'Таңдалғандарды қосу',importReplace:'Бар кестені толық ауыстыру',importErr:'ЖИ қазір қолжетімсіз. Кейінірек қайталап көр.',importBusy:'Buddy бос емес. Сәлден кейін қайталап көр.',lessonsCount:'{n} сабақ',subjectsCount:'{n} пән',yourSchedule:'Сенің кестең',sundayShow:'Жексенбі',online:'Онлайн'},
 ru:{editor:'Редактор расписания',editorSub:'Добавь свои предметы и пары. Изменения сразу сохраняются в аккаунте.',editSchedule:'✎ Редактировать',myScheduleTitle:'Моё расписание',demoBadge:'Демо-расписание',demoNotice:'Сейчас показано демо-расписание. Создай своё — предметы, время, аудитории.',demoNoticeShort:'Показано демо-расписание.',createOwn:'Создать своё →',startTitle:'Создадим расписание',startSub:'Выбери способ. Потом всё можно изменить.',startEmpty:'Начать с нуля',startEmptySub:'Добавишь предметы и пары сам',startDemo:'Взять демо за основу',startDemoSub:'Изменишь готовый пример под себя',startPhoto:'Заполнить по скриншоту',startPhotoSub:'Buddy ИИ прочитает пары с картинки (бета)',subjects:'Предметы',subjectsHint:'Сначала добавь предметы — при добавлении пары выберешь из списка.',addSubject:'＋ Предмет',editSubject:'Редактировать предмет',subjectName:'Полное название предмета',subjectNamePh:'Например, Обработка больших данных',color:'Цвет',noSubjects:'Пока нет предметов',week:'Расписание на неделю',addLesson:'＋ Добавить пару',editLesson:'Редактировать пару',newLesson:'Новая пара',subject:'Предмет',newSubjectOpt:'＋ Новый предмет…',days:'День',daysMulti:'Дни (можно выбрать несколько)',time:'Время',quickSlots:'Частые слоты',start:'Начало',end:'Конец',lessonType:'Тип',seminar:'Семинар',teacher:'Преподаватель',teacherPh:'Например, Карелхан Н.',place:'Где проходит',inPerson:'В аудитории',onlineOpt:'Онлайн',building:'Корпус',buildingPh:'Например, Учебный корпус №2 (АТФ)',roomLabel:'Аудитория',roomPh:'Например, 712',save:'Сохранить',cancel:'Отмена',delete:'Удалить',deleteLessonQ:'Удалить эту пару?',deleteSubjectQ:'Предмет «{name}» и его пары ({n}) будут удалены. Продолжить?',lessonSaved:'Пара сохранена',lessonsSaved:'Добавлено пар: {n}',lessonDeleted:'Пара удалена',subjectSaved:'Предмет сохранён',subjectDeleted:'Предмет удалён',errSubject:'Выбери предмет или введи новый',errDays:'Выбери хотя бы один день',errTime:'Конец должен быть позже начала',errName:'Введи название предмета',overlap:'Внимание: в {day} в {time} уже есть другая пара.',addHere:'＋ Добавить',noLessonsDay:'Пар нет',semester:'Семестр',semesterSub:'В этом промежутке пары повторяются каждую неделю.',semStart:'Начало',semEnd:'Конец',semesterSaved:'Семестр сохранён',errSemester:'Конец семестра должен быть позже начала',moreActions:'Ещё',backToDemo:'Вернуть демо-расписание',backToDemoQ:'Твоё расписание удалится, вернётся демо. Продолжить?',clearAll:'Очистить всё',clearAllQ:'Все пары и предметы будут удалены. Продолжить?',cleared:'Расписание очищено',importTitle:'Заполнить по скриншоту',importSub:'Загрузи скриншот расписания из SMART.ENU или откуда угодно. Buddy ИИ прочитает пары и предложит список — проверь перед сохранением.',chooseImage:'Выбрать картинку',reading:'Buddy читает картинку… Это может занять 20–60 секунд.',importFound:'Найдено пар: {n}. Сними лишние и добавь.',importNone:'Пары на картинке не найдены. Попробуй более чёткий скриншот или добавь вручную.',importAdd:'Добавить выбранные',importReplace:'Полностью заменить текущее расписание',importErr:'ИИ сейчас недоступен. Попробуй позже.',importBusy:'Buddy занят. Попробуй чуть позже.',lessonsCount:'{n} пар',subjectsCount:'{n} предметов',yourSchedule:'Твоё расписание',sundayShow:'Воскресенье',online:'Онлайн'},
 en:{editor:'Timetable editor',editorSub:'Add your subjects and classes. Changes are saved to your account instantly.',editSchedule:'✎ Edit timetable',myScheduleTitle:'My timetable',demoBadge:'Demo timetable',demoNotice:'You are looking at a demo timetable. Build your own — subjects, times, rooms.',demoNoticeShort:'Demo timetable shown.',createOwn:'Build yours →',startTitle:'Let’s build your timetable',startSub:'Pick a way to start. You can change everything later.',startEmpty:'Start from scratch',startEmptySub:'Add subjects and classes yourself',startDemo:'Use the demo as a base',startDemoSub:'Adapt a ready example',startPhoto:'Fill from a screenshot',startPhotoSub:'Buddy AI reads classes from an image (beta)',subjects:'Subjects',subjectsHint:'Add subjects first — then pick them when adding classes.',addSubject:'＋ Subject',editSubject:'Edit subject',subjectName:'Full subject name',subjectNamePh:'e.g. Big data processing',color:'Colour',noSubjects:'No subjects yet',week:'Weekly timetable',addLesson:'＋ Add class',editLesson:'Edit class',newLesson:'New class',subject:'Subject',newSubjectOpt:'＋ New subject…',days:'Day',daysMulti:'Days (you can pick several)',time:'Time',quickSlots:'Common slots',start:'Starts',end:'Ends',lessonType:'Type',seminar:'Seminar',teacher:'Teacher',teacherPh:'e.g. Karelkhan N.',place:'Location',inPerson:'In person',onlineOpt:'Online',building:'Building',buildingPh:'e.g. Academic building №2',roomLabel:'Room',roomPh:'e.g. 712',save:'Save',cancel:'Cancel',delete:'Delete',deleteLessonQ:'Delete this class?',deleteSubjectQ:'“{name}” and its {n} classes will be deleted. Continue?',lessonSaved:'Class saved',lessonsSaved:'{n} classes added',lessonDeleted:'Class deleted',subjectSaved:'Subject saved',subjectDeleted:'Subject deleted',errSubject:'Pick a subject or type a new one',errDays:'Pick at least one day',errTime:'End time must be after start time',errName:'Enter the subject name',overlap:'Note: {day} already has another class at {time}.',addHere:'＋ Add',noLessonsDay:'No classes',semester:'Semester',semesterSub:'Classes repeat every week within these dates.',semStart:'Starts',semEnd:'Ends',semesterSaved:'Semester saved',errSemester:'Semester end must be after its start',moreActions:'More',backToDemo:'Back to demo timetable',backToDemoQ:'Your timetable will be removed and the demo restored. Continue?',clearAll:'Clear everything',clearAllQ:'All classes and subjects will be deleted. Continue?',cleared:'Timetable cleared',importTitle:'Fill from a screenshot',importSub:'Upload a timetable screenshot from SMART.ENU or anywhere. Buddy AI reads the classes and suggests a list — check it before saving.',chooseImage:'Choose image',reading:'Buddy is reading the image… This can take 20–60 seconds.',importFound:'{n} classes found. Untick what you don’t need, then add.',importNone:'No classes found in the image. Try a sharper screenshot or add them manually.',importAdd:'Add selected',importReplace:'Replace the current timetable completely',importErr:'AI is unavailable right now. Try again later.',importBusy:'Buddy is busy. Try again in a moment.',lessonsCount:'{n} classes',subjectsCount:'{n} subjects',yourSchedule:'Your timetable',sundayShow:'Sunday',online:'Online'}
};
Object.keys(editorText).forEach(l=>Object.assign(dictionary[l],editorText[l],{seminar:editorText[l].seminar}));
const fmt=(k,v)=>Object.entries(v).reduce((s,[a,b])=>s.replaceAll('{'+a+'}',b),t(k));

const PALETTE=['#7764e8','#4f8ef7','#2bb3a3','#e3a03a','#e0657a','#9b6be0','#3fa36b','#d9773c','#5b6b8c','#c45ab3'];
const SLOTS=[['08:00','08:50'],['09:00','09:50'],['10:00','10:50'],['11:10','12:00'],['12:10','13:00'],['13:10','14:00'],['14:10','15:00'],['15:10','16:00'],['16:10','17:00'],['17:10','18:00'],['18:10','19:00'],['19:10','20:00'],['20:10','21:00']];
const TYPES=['lecture','practice','lab','seminar'];
const WEEK=[1,2,3,4,5,6,0];
const dayShort=d=>dt(S.shift('2026-11-01',d),{weekday:'short',month:undefined}).replace(/[,.\s\d]+$/,'');
const dayLong=d=>dt(S.shift('2026-11-01',d),{weekday:'long',month:undefined}).replace(/[,\s\d]+$/,'');

let sched=load('buddy_schedule',null);
const isCustom=()=>!!(sched&&Array.isArray(sched.subjects));
const subjectById=id=>sched.subjects.find(s=>s.id===id);
const colorOf=id=>(S.subjects[id]&&S.subjects[id].color)||PALETTE[Math.max(0,Object.keys(S.subjects).indexOf(id))%PALETTE.length];

// Buddy пәнді сұрақтан табуы үшін app.js-тегі aliases-ті пайдаланушының пәндерімен жаңартамыз.
const demoAliases=JSON.parse(JSON.stringify(aliases));
function rebuildAliases(){
 Object.keys(aliases).forEach(k=>delete aliases[k]);
 if(!S.isCustom()){Object.assign(aliases,JSON.parse(JSON.stringify(demoAliases)));return}
 for(const [id,s] of Object.entries(S.subjects)){
  const name=s.name.toLowerCase(),words=name.split(/[\s,.;:()«»"-]+/).filter(w=>w.length>=4);
  aliases[id]=[...new Set([name,...words.map(w=>w.slice(0,Math.max(4,Math.ceil(w.length*.7))))])];
 }
}
function commit(msg){
 if(sched){sched.updated=new Date().toISOString();save('buddy_schedule',sched)}else save('buddy_schedule',null);
 S.setSchedule(sched);rebuildAliases();render();if(msg)toast(msg);
}
rebuildAliases();

// ---------- Сабақтың көрінісі (басты бет, кесте беті) ----------
const baseLocation=locationText;
locationText=function(l){
 if(l.online||l.room==='online')return t('online');
 if(S.isCustom()||l.building)return [l.building,l.room?l.room+' '+t('room'):''].filter(Boolean).join(' · ')||'—';
 return baseLocation(l);
};
lessonHTML=function(l,now=new Date()){
 const past=l.ends<=now,active=l.starts<=now&&!past,online=l.online||l.room==='online';
 const badge=online?'◉ '+t('online'):l.room==='№93'?'№93':l.room?'⌖ '+esc(l.room):'—';
 return `<div class="lesson ${active?'live-lesson':past?'past':''}"><div class="time">${l.start}<small>${l.end}</small></div><div class="lesson-detail" style="border-left-color:${colorOf(l.subject)}"><strong>${esc(title(l))}</strong><small>${t(l.type)}${l.teacher?' · '+esc(l.teacher):''}</small><small style="display:block;margin-top:5px">${esc(locationText(l))}</small></div><div class="room ${online?'badge-online':''}">${badge}<span style="display:block;margin-top:4px">${active?t('current'):past?t('ended'):t('upcoming')}</span></div></div>`;
};
empty=function(date){const sem=S.semester();return `<div class="empty">🌿<p>${date<sem.start||date>sem.end||(!S.isCustom()&&!repeat&&(date<'2026-11-02'||date>'2026-11-08'))?t('outside'):t('empty')}</p></div>`};

// ---------- Кесте беті ----------
function scheduleInfo(){
 const sem=S.semester(),range=dt(sem.start)+' – '+dt(sem.end);
 if(S.isCustom())return `<div class="view-card sched-info"><div><h3>${t('yourSchedule')}</h3><p class="muted">${fmt('subjectsCount',{n:Object.keys(S.subjects).length})} · ${fmt('lessonsCount',{n:S.weekly.length})} · ${t('semester')}: ${range}</p></div><button class="primary" data-view="editor">${t('editSchedule')}</button></div>`;
 return `<div class="view-card sched-info demo"><div><span class="tag">${t('demoBadge')}</span><h3>${t('demoNotice')}</h3><label class="toggle"><input id="repeat" type="checkbox" ${repeat?'checked':''}>${t('weekly')}</label></div><button class="primary" data-view="editor">${t('createOwn')}</button></div>`;
}
function schedulePage(){
 const sem=S.semester(),d=new Date(selectedDate+'T12:00:00+05:00').getUTCDay(),monday=S.shift(selectedDate,-((d+6)%7));
 return `<div class="intro"><div><h1>${t('schedule')}</h1><p>${S.isCustom()?t('editorSub'):t('source')}</p></div><button class="ghost-btn" data-view="editor">${t('editSchedule')}</button></div>
 <div class="view-card"><div class="day-select"><h2 style="margin:0">${dt(selectedDate,{weekday:'long'})}</h2><label class="credit-label">${t('calendar')}<input type="date" id="datePicker" value="${selectedDate}" min="${sem.start}" max="${sem.end}"></label></div>
 <div class="tabs">${WEEK.map((n,i)=>{const date=S.shift(monday,i);return `<button data-date="${date}" class="${selectedDate===date?'active':''}">${dt(date,{weekday:'short',month:undefined})}</button>`}).join('')}</div>
 <div id="dayLessons">${rows(selectedDate)}</div></div>${scheduleInfo()}`;
}

// ---------- Редактор беті ----------
function lessonsOf(day){return sched.lessons.filter(l=>l.day===day&&subjectById(l.subject)).sort((a,b)=>a.start.localeCompare(b.start))}
function editorPage(){
 if(!isCustom())return `${intro(t('editor'),t('editorSub'))}<div class="start-card view-card"><img src="assets/buddy.png" alt="" class="start-buddy"><h2>${t('startTitle')}</h2><p class="muted">${t('startSub')}</p>
  <div class="start-options">
   <button class="start-option" data-start="empty"><span class="so-ico">＋</span><strong>${t('startEmpty')}</strong><small>${t('startEmptySub')}</small></button>
   <button class="start-option" data-start="demo"><span class="so-ico">⧉</span><strong>${t('startDemo')}</strong><small>${t('startDemoSub')}</small></button>
   <button class="start-option" data-start="photo"><span class="so-ico">📷</span><strong>${t('startPhoto')}</strong><small>${t('startPhotoSub')}</small></button>
  </div></div>`;
 const sem=sched.semester,showSunday=lessonsOf(0).length>0;
 return `<div class="intro"><div><h1>${t('editor')}</h1><p>${t('editorSub')}</p></div><div class="editor-actions"><button class="ghost-btn" data-import>📷 ${t('importTitle')}</button><button class="primary" data-add-lesson>${t('addLesson')}</button></div></div>
 <section class="view-card editor-subjects"><div class="section-title"><h2>${t('subjects')} <span class="tag">${sched.subjects.length}</span></h2><button class="text-btn" data-add-subject>${t('addSubject')}</button></div>
  ${sched.subjects.length?`<div class="subject-chips">${sched.subjects.map(s=>`<button class="subject-chip" data-edit-subject="${esc(s.id)}"><i style="background:${esc(s.color)}"></i><span>${esc(s.name)}</span><small>${sched.lessons.filter(l=>l.subject===s.id).length}</small></button>`).join('')}</div>`:`<p class="muted">${t('subjectsHint')}</p>`}</section>
 <section class="editor-week">${WEEK.filter(d=>d!==0||showSunday).map(d=>{const list=lessonsOf(d);return `<div class="day-col"><div class="day-col-head"><strong>${esc(dayLong(d))}</strong><span>${list.length||''}</span></div>
  ${list.map(l=>{const s=subjectById(l.subject);return `<button class="lesson-card" data-edit-lesson="${esc(l.id)}" style="--c:${esc(s.color)}"><span class="lc-time">${l.start}–${l.end}</span><strong>${esc(s.name)}</strong><span class="lc-meta"><em>${t(l.type)}</em>${l.teacher?' · '+esc(l.teacher):''}</span><span class="lc-place">${l.online?'◉ '+t('online'):esc([l.building,l.room?l.room+' '+t('room'):''].filter(Boolean).join(' · ')||'—')}</span></button>`}).join('')||`<p class="day-empty">${t('noLessonsDay')}</p>`}
  <button class="add-here" data-add-lesson="${d}">${t('addHere')}</button></div>`}).join('')}</section>
 <section class="view-card editor-footer"><div><h3>${t('semester')}</h3><p class="muted">${t('semesterSub')}</p></div>
  <form id="semesterForm" class="semester-form"><label>${t('semStart')}<input type="date" name="start" value="${esc(sem.start)}" required></label><label>${t('semEnd')}<input type="date" name="end" value="${esc(sem.end)}" required></label><button class="ghost-btn">${t('save')}</button></form>
  <div class="editor-danger"><button class="text-btn" data-clear-all>${t('clearAll')}</button><button class="text-btn" data-back-demo>${t('backToDemo')}</button></div></section>`;
}

// ---------- Терезелер ----------
const baseModal=modal;
modal=function(html){$('#modalBg .modal').classList.remove('modal-wide');baseModal(html)};
function wideModal(html,label){modal(html);const m=$('#modalBg .modal');m.classList.add('modal-wide');m.setAttribute('aria-label',label)}
const formErr=(el,text)=>{el.textContent=text;el.hidden=!text};
const datalist=(id,values)=>`<datalist id="${id}">${[...new Set(values.filter(Boolean))].map(v=>`<option value="${esc(v)}">`).join('')}</datalist>`;

function subjectForm(s){
 const color=s?s.color:PALETTE[sched.subjects.length%PALETTE.length];
 return `<label>${t('subjectName')}<input name="subjectName" maxlength="120" value="${s?esc(s.name):''}" placeholder="${esc(t('subjectNamePh'))}"></label>
 <div class="ed-field"><span class="field-label">${t('color')}</span><div class="swatches">${PALETTE.map(c=>`<label class="swatch" style="--c:${c}"><input type="radio" name="color" value="${c}" ${c===color?'checked':''}><i></i></label>`).join('')}</div></div>`;
}
function openSubject(id){
 const s=id?subjectById(id):null;
 wideModal(`<h2>${t(s?'editSubject':'addSubject').replace('＋ ','')}</h2><form id="subjectForm" class="editor-form">${subjectForm(s)}<p class="form-msg err" id="subjectErr" hidden></p>
 <div class="modal-actions">${s?`<button type="button" class="danger-link" id="deleteSubject">${t('delete')}</button>`:''}<button type="button" class="ghost-btn" data-close>${t('cancel')}</button><button class="primary">${t('save')}</button></div></form>`,t('editSubject'));
 $('[data-close]').onclick=closeModal;
 $('#subjectForm [name=subjectName]').focus();
 $('#subjectForm').onsubmit=e=>{
  e.preventDefault();const f=new FormData(e.target),name=String(f.get('subjectName')||'').trim();
  if(!name)return formErr($('#subjectErr'),t('errName'));
  if(s){s.name=name;s.color=f.get('color')}else sched.subjects.push({id:P.makeId('subj'),name,color:f.get('color')});
  closeModal();commit(t('subjectSaved'));
 };
 if(s)$('#deleteSubject').onclick=()=>{
  const n=sched.lessons.filter(l=>l.subject===s.id).length;
  if(!confirm(fmt('deleteSubjectQ',{name:s.name,n})))return;
  sched.subjects=sched.subjects.filter(x=>x.id!==s.id);sched.lessons=sched.lessons.filter(l=>l.subject!==s.id);
  closeModal();commit(t('subjectDeleted'));
 };
}

function openLesson(id,presetDay){
 const l=id?sched.lessons.find(x=>x.id===id):null;
 const base=l||{subject:sched.subjects.length?sched.subjects[sched.subjects.length-1].id:'',day:presetDay??1,start:'',end:'',type:'lecture',teacher:'',building:'',room:'',online:false};
 const lastPlace=sched.lessons[sched.lessons.length-1]||{};
 if(!l&&!base.building)base.building=lastPlace.building||'';
 const editing=!!l,days=new Set([base.day]);
 wideModal(`<h2>${t(editing?'editLesson':'newLesson')}</h2><form id="lessonForm" class="editor-form">
  <label>${t('subject')}<select name="subject">${sched.subjects.map(s=>`<option value="${esc(s.id)}" ${s.id===base.subject?'selected':''}>${esc(s.name)}</option>`).join('')}<option value="__new" ${sched.subjects.length?'':'selected'}>${t('newSubjectOpt')}</option></select></label>
  <div class="new-subject" ${sched.subjects.length?'hidden':''}>${subjectForm(null)}</div>
  <div class="ed-field"><span class="field-label">${t(editing?'days':'daysMulti')}</span><div class="day-picks">${WEEK.map(d=>`<button type="button" data-day="${d}" class="${days.has(d)?'on':''}">${esc(dayShort(d))}</button>`).join('')}</div></div>
  <div class="ed-field"><span class="field-label">${t('time')}</span><div class="slot-chips">${SLOTS.map(([a,b])=>`<button type="button" data-slot="${a}-${b}" class="${base.start===a&&base.end===b?'on':''}">${a}–${b}</button>`).join('')}</div>
   <div class="form-grid tight"><label>${t('start')}<input type="time" name="start" value="${base.start}" required></label><label>${t('end')}<input type="time" name="end" value="${base.end}" required></label></div></div>
  <div class="ed-field"><span class="field-label">${t('lessonType')}</span><div class="segmented wide" data-group="type">${TYPES.map(x=>`<button type="button" data-val="${x}" class="${base.type===x?'active':''}">${t(x)}</button>`).join('')}</div></div>
  <label>${t('teacher')}<input name="teacher" list="teacherList" maxlength="80" value="${esc(base.teacher)}" placeholder="${esc(t('teacherPh'))}"></label>${datalist('teacherList',sched.lessons.map(x=>x.teacher))}
  <div class="ed-field"><span class="field-label">${t('place')}</span><div class="segmented wide" data-group="online"><button type="button" data-val="0" class="${base.online?'':'active'}">⌖ ${t('inPerson')}</button><button type="button" data-val="1" class="${base.online?'active':''}">◉ ${t('onlineOpt')}</button></div></div>
  <div class="form-grid tight place-fields" ${base.online?'hidden':''}><label>${t('building')}<input name="building" list="buildingList" maxlength="80" value="${esc(base.building)}" placeholder="${esc(t('buildingPh'))}"></label><label>${t('roomLabel')}<input name="room" maxlength="30" value="${esc(base.room)}" placeholder="${esc(t('roomPh'))}"></label></div>${datalist('buildingList',sched.lessons.map(x=>x.building))}
  <p class="form-msg err" id="lessonErr" hidden></p><p class="form-msg warn" id="lessonWarn" hidden></p>
  <div class="modal-actions">${editing?`<button type="button" class="danger-link" id="deleteLesson">${t('delete')}</button>`:''}<button type="button" class="ghost-btn" data-close>${t('cancel')}</button><button class="primary">${t('save')}</button></div></form>`,t('editLesson'));
 const form=$('#lessonForm');let type=base.type,online=base.online;
 $('[data-close]').onclick=closeModal;
 form.subject.onchange=()=>{form.querySelector('.new-subject').hidden=form.subject.value!=='__new';if(form.subject.value==='__new')form.subjectName.focus()};
 form.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{const d=+b.dataset.day;if(editing){days.clear();form.querySelectorAll('[data-day]').forEach(x=>x.classList.remove('on'))}
  if(days.has(d)){days.delete(d);b.classList.remove('on')}else{days.add(d);b.classList.add('on')}checkOverlap()});
 form.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>{const [a,c]=b.dataset.slot.split('-');form.start.value=a;form.end.value=c;form.querySelectorAll('[data-slot]').forEach(x=>x.classList.toggle('on',x===b));checkOverlap()});
 form.querySelectorAll('[data-group=type] button').forEach(b=>b.onclick=()=>{type=b.dataset.val;form.querySelectorAll('[data-group=type] button').forEach(x=>x.classList.toggle('active',x===b))});
 form.querySelectorAll('[data-group=online] button').forEach(b=>b.onclick=()=>{online=b.dataset.val==='1';form.querySelectorAll('[data-group=online] button').forEach(x=>x.classList.toggle('active',x===b));form.querySelector('.place-fields').hidden=online});
 form.start.oninput=form.end.oninput=()=>{form.querySelectorAll('[data-slot]').forEach(x=>x.classList.toggle('on',x.dataset.slot===form.start.value+'-'+form.end.value));checkOverlap()};
 function checkOverlap(){
  const a=form.start.value,b=form.end.value,hit=[...days].find(d=>sched.lessons.some(x=>x.day===d&&x.id!==(l&&l.id)&&a&&b&&x.start<b&&a<x.end));
  formErr($('#lessonWarn'),hit!==undefined?fmt('overlap',{day:dayLong(hit),time:a+'–'+b}):'');
 }
 checkOverlap();
 form.onsubmit=e=>{
  e.preventDefault();const f=new FormData(form);let subject=f.get('subject');
  if(subject==='__new'){const name=String(f.get('subjectName')||'').trim();if(!name)return formErr($('#lessonErr'),t('errSubject'))}
  else if(!subjectById(subject))return formErr($('#lessonErr'),t('errSubject'));
  if(!days.size)return formErr($('#lessonErr'),t('errDays'));
  const start=f.get('start'),end=f.get('end');
  if(!start||!end||start>=end)return formErr($('#lessonErr'),t('errTime'));
  if(subject==='__new'){subject=P.makeId('subj');sched.subjects.push({id:subject,name:String(f.get('subjectName')).trim(),color:f.get('color')})}
  const data={subject,start,end,type,teacher:String(f.get('teacher')||'').trim(),online,building:online?'':String(f.get('building')||'').trim(),room:online?'':String(f.get('room')||'').trim()};
  if(editing)Object.assign(l,data,{day:[...days][0]});
  else [...days].forEach(d=>sched.lessons.push({id:P.makeId('lesson'),day:d,...data}));
  closeModal();commit(editing||days.size===1?t('lessonSaved'):fmt('lessonsSaved',{n:days.size}));
 };
 if(editing)$('#deleteLesson').onclick=()=>{if(!confirm(t('deleteLessonQ')))return;sched.lessons=sched.lessons.filter(x=>x.id!==l.id);closeModal();commit(t('lessonDeleted'))};
}

// ---------- Бастау және скриншоттан импорт ----------
function newSchedule(){const sem=S.semester();return {version:1,semester:{start:sem.start,end:sem.end},subjects:[],lessons:[]}}
function demoSchedule(){
 const demo=S.demo(),out=newSchedule();
 out.subjects=Object.entries(demo.subjects).map(([id,s],i)=>({id,name:s[lang],color:PALETTE[i%PALETTE.length]}));
 out.lessons=demo.weekly.map(l=>({id:P.makeId('lesson'),day:l.day,start:l.start,end:l.end,subject:l.subject,type:l.type,teacher:l.teacher,
  online:l.room==='online',building:l.room==='online'?'':l.room==='№93'?t('school').split(' · ')[0]:t('building'),room:l.room==='online'||l.room==='№93'?'':l.room}));
 return out;
}

// Суретті кішірейтеміз: ЖИ-ге жіберуге (full) және чатта көрсетуге (thumb).
async function readImage(file,max=1600,quality=.86){
 if(!file||!/^image\//.test(file.type))throw new Error('not_image');
 const url=URL.createObjectURL(file);
 try{
  const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url});
  const draw=(m,q)=>{const k=Math.min(1,m/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);return c.toDataURL('image/jpeg',q)};
  return {full:draw(max,quality),thumb:draw(360,.72)};
 }finally{URL.revokeObjectURL(url)}
}
window.BuddyImage={readImage};

// ---------- ЖИ-ден сабақтарды алу (сурет немесе мәтін) — редактор да, чат та осыны қолданады ----------
const importText={
 kk:{importOr:'немесе мәтінмен жаз',importTextPh:'Мысалы:\nДүйсенбі 10:00–10:50 Физика, дәріс, Ахметов Б.Қ., 305 ауд.\nСәрсенбі 12:10 Тарих семинары, онлайн',readText:'Мәтіннен оқу',stop:'Тоқтату',stopped:'Тоқтатылды',foundSoFar:'{n} сабақ табылды',doneFound:'✓ {n} сабақ табылды · {s} с',importAddN:'Кестеге қосу ({n})',anotherImage:'Басқа сурет',dupSkipped:'{n} сабақ кестеде бұрыннан бар — қайта қосылмады.',readingShort:'Buddy оқып жатыр…'},
 ru:{importOr:'или напиши текстом',importTextPh:'Например:\nПонедельник 10:00–10:50 Физика, лекция, Ахметов Б.К., ауд. 305\nСреда 12:10 семинар по истории, онлайн',readText:'Прочитать текст',stop:'Остановить',stopped:'Остановлено',foundSoFar:'Найдено пар: {n}',doneFound:'✓ Найдено пар: {n} · {s} с',importAddN:'Добавить в расписание ({n})',anotherImage:'Другая картинка',dupSkipped:'{n} пар уже есть в расписании — повторно не добавлены.',readingShort:'Buddy читает…'},
 en:{importOr:'or type it',importTextPh:'For example:\nMonday 10:00–10:50 Physics, lecture, Akhmetov B., room 305\nWednesday 12:10 History seminar, online',readText:'Read text',stop:'Stop',stopped:'Stopped',foundSoFar:'{n} classes found',doneFound:'✓ {n} classes found · {s} s',importAddN:'Add to timetable ({n})',anotherImage:'Another image',dupSkipped:'{n} classes were already in your timetable — not added again.',readingShort:'Buddy is reading…'}
};
Object.keys(importText).forEach(l=>Object.assign(dictionary[l],importText[l]));
const EN_DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// Сервер NDJSON ағынын қайтарады: әр жол — {"lesson":{...}}, соңында {"done":true}.
async function streamLessons(payload,signal,onLesson){
 const r=await fetch('/api/ai/schedule',{method:'POST',credentials:'same-origin',signal,headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
 if(r.status===503)throw new Error('busy');
 if(r.status===401){location.reload();throw new Error('auth')}
 if(!r.ok||!r.body)throw new Error('ai');
 const reader=r.body.getReader(),dec=new TextDecoder();let buf='';
 for(;;){
  const {done,value}=await reader.read();if(done)break;
  buf+=dec.decode(value,{stream:true});let i;
  while((i=buf.indexOf('\n'))>=0){
   const line=buf.slice(0,i).trim();buf=buf.slice(i+1);if(!line)continue;
   let j;try{j=JSON.parse(line)}catch{continue}
   if(j.error)throw new Error('ai');
   if(j.lesson)onLesson(j.lesson);
  }
 }
}

// Кесте торын суреттің өзінен табамыз: тік сызықтар — бағандар шекарасы.
// Сызық = биіктігінің үлкен бөлігіне созылған жіңішке қараңғы із (мәтін немесе түсті ұяшық емес).
async function gridColumns(dataUrl){
 const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=dataUrl});
 const W=img.width,H=img.height;if(W<300||H<150)return null;
 const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(img,0,0);
 const px=x.getImageData(0,0,W,H).data,run=new Uint32Array(W);
 for(let col=0;col<W;col++){let cur=0,best=0;for(let row=0;row<H;row++){const k=(row*W+col)*4,l=.299*px[k]+.587*px[k+1]+.114*px[k+2];if(l<228){if(++cur>best)best=cur}else cur=0}run[col]=best}
 const lines=[];let start=-1;
 for(let col=0;col<=W;col++){const on=col<W&&run[col]>=H*.35;if(on&&start<0)start=col;if(!on&&start>=0){if(col-start<=6)lines.push(Math.round((start+col-1)/2));start=-1}}
 const edges=[...new Set([0,...lines,W-1])].sort((a,b)=>a-b),cols=[];
 for(let i=1;i<edges.length;i++)if(edges[i]-edges[i-1]>W*.035)cols.push({x0:edges[i-1],x1:edges[i]});
 if(lines.length<3||cols.length<3)return null;
 return {img,H,cols};
}
// Бірінші баған (жол белгілері — әдетте уақыт) + бір күн бағаны → бір кішкентай сурет.
function sliceImage(g,k){
 const a=g.cols[0],b=g.cols[k],wa=a.x1-a.x0,wb=b.x1-b.x0,c=document.createElement('canvas');
 c.width=wa+wb+10;c.height=g.H;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);
 x.drawImage(g.img,a.x0,0,wa,g.H,0,0,wa,g.H);x.drawImage(g.img,b.x0,0,wb,g.H,wa+10,0,wb,g.H);
 x.fillStyle='#999';x.fillRect(wa+4,0,2,g.H);
 return c.toDataURL('image/jpeg',.92);
}

async function extractLessons({image,text,signal,onLesson,onProgress}){
 const today=S.localDate(),todayInfo=`Today is ${EN_DAYS[new Date(today+'T12:00:00+05:00').getUTCDay()]}, ${today}.`;
 const out=[],seen=new Set();
 const push=l=>{const key=[l.day,l.start,l.subject.toLowerCase()].join('|');if(seen.has(key))return;seen.add(key);out.push(l);if(onLesson)onLesson(l,out.length)};
 let grid=null;
 if(image){try{grid=await gridColumns(image)}catch{}}
 if(!grid){await streamLessons({image,text,today:todayInfo},signal,push);return out}
 // Тор табылды: әр бағанды жеке оқимыз — 4B модель тұтас торда бағандарды шатастырады, бір бағанды дәл оқиды.
 const total=grid.cols.length-1;let failed=0,lastErr=null;
 for(let k=1;k<=total;k++){
  if(signal&&signal.aborted)break;
  if(onProgress)onProgress(k,total);
  try{await streamLessons({image:sliceImage(grid,k),text,mode:'column',today:todayInfo},signal,push)}
  catch(e){if(e.name==='AbortError')throw e;failed++;lastErr=e}
 }
 if(failed===total&&lastErr)throw lastErr;
 return out;
}

// Сабақтарды кестеге қосу. Қайтарылатын мән «Болдырмау» үшін керек.
function addLessons(list,{replace=false}={}){
 const wasDemo=!isCustom();
 if(wasDemo||replace)sched=newSchedule();
 const lessonIds=[],subjectIds=[];let skipped=0;
 list.forEach(l=>{
  let s=sched.subjects.find(x=>x.name.toLowerCase()===String(l.subject).toLowerCase());
  if(!s){s={id:P.makeId('subj'),name:l.subject,color:PALETTE[sched.subjects.length%PALETTE.length]};sched.subjects.push(s);subjectIds.push(s.id)}
  if(sched.lessons.some(x=>x.day===l.day&&x.start===l.start&&x.subject===s.id)){skipped++;return}
  const id=P.makeId('lesson');lessonIds.push(id);
  sched.lessons.push({id,day:l.day,start:l.start,end:l.end,subject:s.id,type:l.type||'lecture',teacher:l.teacher||'',online:!!l.online,building:l.online?'':(l.building||''),room:l.online?'':(l.room||'')});
 });
 commit();
 return {lessonIds,subjectIds,skipped,wasDemo};
}
function removeLessons({lessonIds=[],subjectIds=[],wasDemo=false}){
 if(!isCustom())return;
 sched.lessons=sched.lessons.filter(l=>!lessonIds.includes(l.id));
 sched.subjects=sched.subjects.filter(s=>!subjectIds.includes(s.id)||sched.lessons.some(l=>l.subject===s.id));
 if(wasDemo&&!sched.lessons.length&&!sched.subjects.length)sched=null;
 commit();
}
const lessonRow=(l,i)=>`<label class="import-row"><input type="checkbox" data-i="${i}" checked><span class="ir-day">${esc(dayShort(l.day))}</span><span class="ir-time">${l.start}–${l.end}</span><span class="ir-main"><strong>${esc(l.subject)}</strong><small>${t(l.type)}${l.teacher?' · '+esc(l.teacher):''} · ${l.online?t('online'):esc(l.room?l.room+' '+t('room'):'—')}</small></span></label>`;

let importAbort=null;
const stopImport=()=>{if(importAbort){importAbort.abort();importAbort=null}};
const baseCloseModal=closeModal;
closeModal=function(){stopImport();baseCloseModal()};

function openImport(){
 wideModal(`<h2>📷 ${t('importTitle')}</h2><p class="settings-sub">${t('importSub')}</p>
  <div id="importInput">
   <label class="drop-zone" id="importDrop"><input type="file" accept="image/*" id="importFile" hidden><span class="dz-ico">⇪</span><strong>${t('chooseImage')}</strong><small>PNG · JPG · Ctrl+V</small></label>
   <div class="import-or"><span>${t('importOr')}</span></div>
   <textarea id="importText" rows="3" maxlength="2000" placeholder="${esc(t('importTextPh'))}"></textarea>
   <div class="modal-actions" style="margin-top:8px"><button type="button" class="ghost-btn" id="importReadText">${t('readText')}</button></div>
  </div>
  <div id="importBody"></div>`,t('importTitle'));
 $('#closeModal').addEventListener('click',stopImport,{once:true});
 const drop=$('#importDrop');
 $('#importFile').onchange=e=>runImage(e.target.files[0]);
 drop.ondragover=e=>{e.preventDefault();drop.classList.add('over')};drop.ondragleave=()=>drop.classList.remove('over');
 drop.ondrop=e=>{e.preventDefault();drop.classList.remove('over');runImage(e.dataTransfer.files[0])};
 $('#modalBg .modal').onpaste=e=>{const f=[...(e.clipboardData&&e.clipboardData.files||[])].find(x=>/^image\//.test(x.type));if(f){e.preventDefault();runImage(f)}};
 $('#importReadText').onclick=()=>{const v=$('#importText').value.trim();if(v)run({text:v})};
 async function runImage(file){if(!file||!/^image\//.test(file.type))return;try{const img=await readImage(file,1800,.9);run({image:img.full,thumb:img.thumb})}catch{}}
 async function run({image,text,thumb}){
  stopImport();importAbort=new AbortController();const signal=importAbort.signal,t0=Date.now(),found=[];
  $('#importInput').hidden=true;
  const body=$('#importBody');
  body.innerHTML=`<div class="import-status">${thumb?`<img src="${thumb}" alt="">`:''}<div><strong id="impState"><span class="spinner"></span> ${t('readingShort')}</strong><small id="impCount">${fmt('foundSoFar',{n:0})} · 0 с</small></div><button type="button" class="ghost-btn" id="impStop">${t('stop')}</button></div><div class="import-list" id="impList" hidden></div><div id="impFoot"></div>`;
  const timer=setInterval(()=>{const c=$('#impCount');if(c)c.textContent=fmt('foundSoFar',{n:found.length})+' · '+Math.round((Date.now()-t0)/1000)+' с'},500);
  $('#impStop').onclick=stopImport;
  let error='';
  try{await extractLessons({image,text,signal,onLesson:l=>{found.push(l);const list=$('#impList');if(list){list.hidden=false;list.insertAdjacentHTML('beforeend',lessonRow(l,found.length-1));list.scrollTop=list.scrollHeight}}})}
  catch(e){if(e.name!=='AbortError')error=e.message==='busy'?'importBusy':'importErr'}
  clearInterval(timer);
  const stopped=signal.aborted;importAbort=null;
  if(!$('#importBody'))return;
  const secs=Math.round((Date.now()-t0)/1000);
  $('#impState').innerHTML=error?`⚠ ${t(error)}`:stopped?`■ ${t('stopped')}`:fmt('doneFound',{n:found.length,s:secs});
  $('#impCount').textContent=stopped||error?fmt('foundSoFar',{n:found.length})+' · '+secs+' с':'';
  $('#impStop').textContent=t('anotherImage');$('#impStop').onclick=()=>{$('#importBody').innerHTML='';$('#importInput').hidden=false};
  const foot=$('#impFoot');
  if(!found.length){foot.innerHTML=error?'':`<p class="form-msg warn">${t('importNone')}</p>`;return}
  const update=()=>{const n=document.querySelectorAll('#impList input:checked').length,b=$('#importAdd');if(b){b.textContent=fmt('importAddN',{n});b.disabled=!n}};
  foot.innerHTML=`${isCustom()&&sched.lessons.length?`<label class="replace-row"><input type="checkbox" id="importReplace"> ${t('importReplace')}</label>`:''}
   <div class="modal-actions"><button type="button" class="ghost-btn" data-close>${t('cancel')}</button><button class="primary" id="importAdd"></button></div>`;
  update();$('#impList').onchange=update;
  $('[data-close]').onclick=closeModal;
  $('#importAdd').onclick=()=>{
   const chosen=[...document.querySelectorAll('#impList input:checked')].map(x=>found[+x.dataset.i]);if(!chosen.length)return;
   closeModal();currentView='editor';
   const r=addLessons(chosen,{replace:!!($('#importReplace')&&$('#importReplace').checked)});
   toast(fmt('lessonsSaved',{n:r.lessonIds.length})+(r.skipped?' · '+fmt('dupSkipped',{n:r.skipped}):''));
  };
 }
}

function bindEditor(){
 $$('[data-start]').forEach(b=>b.onclick=()=>{const k=b.dataset.start;if(k==='photo')return openImport();sched=k==='demo'?demoSchedule():newSchedule();commit();if(k==='empty')openSubject()});
 $$('[data-import]').forEach(b=>b.onclick=openImport);
 $$('[data-add-subject]').forEach(b=>b.onclick=()=>openSubject());
 $$('[data-edit-subject]').forEach(b=>b.onclick=()=>openSubject(b.dataset.editSubject));
 $$('[data-add-lesson]').forEach(b=>b.onclick=()=>openLesson(null,b.dataset.addLesson?+b.dataset.addLesson:undefined));
 $$('[data-edit-lesson]').forEach(b=>b.onclick=()=>openLesson(b.dataset.editLesson));
 if($('#semesterForm'))$('#semesterForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),start=f.get('start'),end=f.get('end');if(!start||!end||start>=end)return toast(t('errSemester'));sched.semester={start,end};commit(t('semesterSaved'))};
 $$('[data-clear-all]').forEach(b=>b.onclick=()=>{if(!confirm(t('clearAllQ')))return;sched=newSchedule();commit(t('cleared'))});
 $$('[data-back-demo]').forEach(b=>b.onclick=()=>{if(!confirm(t('backToDemoQ')))return;sched=null;commit()});
}

// ---------- Қолданбаға қосу ----------
const basePage=pageContent;
pageContent=function(){
 if(currentView==='editor')return editorPage();
 if(currentView==='schedule')return schedulePage();
 let html=basePage();
 // Басты беттегі «Дерек: …» жазбасының орнына — кесте туралы қысқа ақпарат (жаңа элемент қоспаймыз).
 if(currentView==='home')html=html.replace(/<p class="source-note">[\s\S]*?<\/p>/,S.isCustom()?'':`<p class="source-note">${t('demoNoticeShort')} <button class="text-btn" data-view="editor">${t('createOwn')}</button></p>`);
 return html;
};
const baseBind=bind;
bind=function(){baseBind();if(currentView==='editor')bindEditor()};
// Мәзірде «Кесте» бөлімі редактор ашық тұрғанда да белсенді көрінсін.
const baseNav=nav;
nav=function(){const v=currentView;if(v==='editor')currentView='schedule';const html=baseNav();currentView=v;return html};
window.BuddyScheduleEditor={openImport,extractLessons,addLessons,removeLessons,lessonRow,dayShort,get schedule(){return sched}};
render();
})();
