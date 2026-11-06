// Аккаунт қабаты: деректерді серверге синхрондау, профиль мәзірі, баптаулар беті, шығу.
// boot.js кірген пайдаланушыны window.BUDDY_USER-ге жазады және осы файлды соңғы болып жүктейді.
(function(){
let user=window.BUDDY_USER||{name:'',email:'',group:''};

const accountText={
 kk:{settings:'Баптаулар',logout:'Шығу',profile:'Профиль',profileSub:'Аты-жөнің Buddy-дің сәлемдесуінде және анықтамаларда қолданылады.',name:'Аты-жөні',group:'Топ / мамандық',groupPh:'Мысалы, ИС-31',email:'Email',memberSince:'Тіркелген күні',save:'Сақтау',saved:'Сақталды',interface:'Интерфейс',language:'Тіл',weeklyTitle:'Апта сайын қайталау',weeklySub:'Кестені семестр соңына дейін әр аптаға қайталау.',alertsTitle:'Ескертулер',security:'Қауіпсіздік',securitySub:'Құпиясөзді ауыстырғанда басқа құрылғылардағы сеанстар жабылады.',currentPw:'Қазіргі құпиясөз',newPw:'Жаңа құпиясөз',confirmPw:'Жаңа құпиясөзді қайтала',changePw:'Құпиясөзді ауыстыру',pwChanged:'Құпиясөз ауыстырылды',data:'Деректер',dataSub:'Тапсырмалар, GPA, чаттар мен баптаулар аккаунтыңда сақталады және кез келген құрылғыда ашылады.',clearChats:'Чат тарихын тазалау',clearChatsConfirm:'Барлық чаттар өшіріледі. Жалғастырасың ба?',chatsCleared:'Чат тарихы тазаланды',session:'Сеанс',sessionSub:'Осы құрылғыдағы аккаунттан шығу.',dangerTitle:'Аккаунтты өшіру',dangerSub:'Аккаунт пен барлық деректерің біржола өшіріледі. Қайтару мүмкін емес.',deleteAccount:'Аккаунтты өшіру',deleteConfirm:'Растау үшін құпиясөзіңді енгіз.',deleteBtn:'Біржола өшіру',cancel:'Болдырмау',syncError:'Деректерді серверге сақтау мүмкін болмады. Интернетті тексер.',mismatch:'Құпиясөздер сәйкес емес',wrong_password:'Құпиясөз қате',weak_password:'Құпиясөз кемінде 6 таңба болуы керек',invalid_name:'Аты-жөніңді жаз (2–60 таңба)',server_error:'Сервер қатесі. Қайта көр.',accountMenu:'Аккаунт мәзірі',helloName:'Сәлем, {name}! 👋',localHistory:'Аккаунтыңда сақталады',historyNote:'Әңгімелер аккаунтыңда сақталады — кез келген құрылғыдан ашылады. Жауаптар жазылған кездегі уақытымен қалады.'},
 ru:{settings:'Настройки',logout:'Выйти',profile:'Профиль',profileSub:'Имя используется в приветствии Buddy и в справках.',name:'Имя и фамилия',group:'Группа / специальность',groupPh:'Например, ИС-31',email:'Email',memberSince:'Дата регистрации',save:'Сохранить',saved:'Сохранено',interface:'Интерфейс',language:'Язык',weeklyTitle:'Повторять каждую неделю',weeklySub:'Повторять расписание каждую неделю до конца семестра.',alertsTitle:'Уведомления',security:'Безопасность',securitySub:'При смене пароля сеансы на других устройствах завершаются.',currentPw:'Текущий пароль',newPw:'Новый пароль',confirmPw:'Повтори новый пароль',changePw:'Сменить пароль',pwChanged:'Пароль изменён',data:'Данные',dataSub:'Задачи, GPA, чаты и настройки хранятся в аккаунте и доступны с любого устройства.',clearChats:'Очистить историю чатов',clearChatsConfirm:'Все чаты будут удалены. Продолжить?',chatsCleared:'История чатов очищена',session:'Сеанс',sessionSub:'Выйти из аккаунта на этом устройстве.',dangerTitle:'Удаление аккаунта',dangerSub:'Аккаунт и все данные будут удалены навсегда. Отменить нельзя.',deleteAccount:'Удалить аккаунт',deleteConfirm:'Для подтверждения введи пароль.',deleteBtn:'Удалить навсегда',cancel:'Отмена',syncError:'Не удалось сохранить данные на сервере. Проверь интернет.',mismatch:'Пароли не совпадают',wrong_password:'Неверный пароль',weak_password:'Пароль должен быть не короче 6 символов',invalid_name:'Укажи имя (2–60 символов)',server_error:'Ошибка сервера. Попробуй ещё раз.',accountMenu:'Меню аккаунта',helloName:'Привет, {name}! 👋',localHistory:'Сохраняется в аккаунте',historyNote:'Разговоры сохраняются в аккаунте и открываются с любого устройства. Ответы остаются с тем временем, когда были написаны.'},
 en:{settings:'Settings',logout:'Log out',profile:'Profile',profileSub:'Your name is used in Buddy greetings and certificates.',name:'Full name',group:'Group / major',groupPh:'e.g. IS-31',email:'Email',memberSince:'Member since',save:'Save',saved:'Saved',interface:'Interface',language:'Language',weeklyTitle:'Repeat weekly',weeklySub:'Repeat the timetable every week until the semester ends.',alertsTitle:'Notifications',security:'Security',securitySub:'Changing your password signs out your other devices.',currentPw:'Current password',newPw:'New password',confirmPw:'Repeat new password',changePw:'Change password',pwChanged:'Password changed',data:'Data',dataSub:'Tasks, GPA, chats and settings are stored in your account and available on any device.',clearChats:'Clear chat history',clearChatsConfirm:'All chats will be deleted. Continue?',chatsCleared:'Chat history cleared',session:'Session',sessionSub:'Log out of your account on this device.',dangerTitle:'Delete account',dangerSub:'Your account and all data will be permanently deleted. This cannot be undone.',deleteAccount:'Delete account',deleteConfirm:'Enter your password to confirm.',deleteBtn:'Delete forever',cancel:'Cancel',syncError:'Could not save data to the server. Check your connection.',mismatch:'Passwords do not match',wrong_password:'Wrong password',weak_password:'Password must be at least 6 characters',invalid_name:'Enter your name (2–60 characters)',server_error:'Server error. Please try again.',accountMenu:'Account menu',helloName:'Hey, {name}! 👋',localHistory:'Saved to your account',historyNote:'Conversations are saved to your account and open on any device. Answers keep the time they were originally written.'}
};
const profileText={
 kk:{personal:'Жеке деректер',study:'Оқу орны',nickname:'Лақап ат',nicknamePh:'Мысалы, Danny',nicknameHint:'Buddy саған осылай жүгінеді. Бос қалса — атыңмен.',university:'Университет',universityPh:'Тізімнен таңда немесе өзің жаз',major:'Мамандық',majorPh:'Мысалы, Ақпараттық жүйелер',groupOnly:'Топ',groupOnlyPh:'Мысалы, ИС-31',course:'Курс',courseNone:'Көрсетілмеген',bachelor:'Бакалавр',master:'Магистратура',phd:'Докторантура',previewTitle:'Buddy сені былай атайды',previewMsg:'Жарайды, {n}! Бүгінгі сабақтарың мен дедлайндарыңды қарап шықтым 👌',invalid_nickname:'Лақап атта < > { } \\ таңбалары болмауы керек',alertsSub:'Ескертулер 🔔 қоңырауда және басты бетте көрсетіледі. Бұл жерден оларды қосып-өшіресің.',inAppShort:'Ескертулер сайт ашық кезде жаңарады.'},
 ru:{personal:'Личные данные',study:'Учёба',nickname:'Никнейм',nicknamePh:'Например, Danny',nicknameHint:'Так Buddy будет к тебе обращаться. Если пусто — по имени.',university:'Университет',universityPh:'Выбери из списка или впиши',major:'Специальность',majorPh:'Например, Информационные системы',groupOnly:'Группа',groupOnlyPh:'Например, ИС-31',course:'Курс',courseNone:'Не указан',bachelor:'Бакалавриат',master:'Магистратура',phd:'Докторантура',previewTitle:'Так Buddy будет к тебе обращаться',previewMsg:'Хорошо, {n}! Я посмотрел твои пары и дедлайны на сегодня 👌',invalid_nickname:'В никнейме не должно быть символов < > { } \\',alertsSub:'Напоминания показываются в 🔔 колокольчике и на главной. Здесь их можно включить или выключить.',inAppShort:'Напоминания обновляются, пока сайт открыт.'},
 en:{personal:'Personal details',study:'Studies',nickname:'Nickname',nicknamePh:'e.g. Danny',nicknameHint:'Buddy will call you this. If empty, your first name is used.',university:'University',universityPh:'Pick from the list or type your own',major:'Major',majorPh:'e.g. Information Systems',groupOnly:'Group',groupOnlyPh:'e.g. IS-31',course:'Year',courseNone:'Not set',bachelor:'Bachelor',master:'Master',phd:'PhD',previewTitle:'This is how Buddy will call you',previewMsg:'Sure, {n}! I checked your classes and deadlines for today 👌',invalid_nickname:'Nickname must not contain < > { } \\',alertsSub:'Reminders appear in the 🔔 bell and on the home page. Turn them on or off here.',inAppShort:'Reminders update while the site is open.'}
};
Object.keys(accountText).forEach(l=>Object.assign(dictionary[l],accountText[l],profileText[l]));
const UNIVERSITIES=['Л.Н. Гумилев атындағы Еуразия ұлттық университеті (ЕҰУ)','Әл-Фараби атындағы Қазақ ұлттық университеті (ҚазҰУ)','Назарбаев Университеті','Сәтбаев Университеті','Astana IT University','Қазақстан-Британ техникалық университеті (ҚБТУ)','Абай атындағы Қазақ ұлттық педагогикалық университеті','С. Сейфуллин атындағы Қазақ агротехникалық зерттеу университеті','Е.А. Бөкетов атындағы Қарағанды университеті','М. Әуезов атындағы Оңтүстік Қазақстан университеті','SDU University','KIMEP University','Narxoz University','AlmaU','Turan University','Astana Medical University','Асфендияров атындағы Қазақ ұлттық медицина университеті'];
const COURSES=[['1','bachelor'],['2','bachelor'],['3','bachelor'],['4','bachelor'],['5','bachelor'],['M1','master'],['M2','master'],['PhD','phd']];
function courseText(c){
 c=String(c||'');if(!c)return '';
 if(c==='PhD')return t('phd');
 const n=c.replace(/^M/,''),master=c.startsWith('M');
 const base=lang==='en'?'Year '+n:lang==='ru'?n+' курс':n+'-курс';
 return master?t('master')+', '+base:base;
}
// Buddy жүгінетін ат: лақап ат, болмаса атының бірінші сөзі.
const callName=()=>(user.nickname||'').trim()||(user.name||'').split(' ')[0]||'';
function shortUni(u){const m=/\(([^)]+)\)\s*$/.exec(u);return m?m[1]:u}
const studyLine=()=>[user.university&&shortUni(user.university),user.major,courseText(user.course),user.group].filter(Boolean).join(' · ');

const firstName=()=>(user.name||'').split(' ')[0]||'';
const initials=()=>(user.name||user.email||'?').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('');
function applyName(){Object.keys(dictionary).forEach(l=>{dictionary[l].hello=dictionary[l].helloName.replace('{name}',callName()||firstName())})}
applyName();

// ---------- Серверге синхрондау ----------
// Қолданба барлық деректі save(key, value) арқылы жазады — соны кеңейтіп, әр кілтті серверге де жібереміз.
const baseSave=save,pending={},timers={};let syncWarned=false;
async function push(key){
 const body=pending[key];if(body===undefined)return;delete pending[key];
 try{
  const r=await fetch('/api/state/'+encodeURIComponent(key),{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body});
  if(r.status===401){location.reload();return}
  if(!r.ok)throw new Error(r.status);
  syncWarned=false;
 }catch{if(!syncWarned){syncWarned=true;toast(t('syncError'))}}
}
save=function(key,value){
 baseSave(key,value);
 if(!String(key).startsWith('buddy_'))return;
 pending[key]=JSON.stringify({value:value===undefined?null:value});
 clearTimeout(timers[key]);timers[key]=setTimeout(()=>push(key),350);
};
// Бет жабылғанда жіберілмей қалған өзгерістерді жібереміз.
window.addEventListener('pagehide',()=>{for(const key of Object.keys(pending)){clearTimeout(timers[key]);fetch('/api/state/'+encodeURIComponent(key),{method:'PUT',keepalive:true,credentials:'same-origin',headers:{'Content-Type':'application/json'},body:pending[key]});delete pending[key]}});
if(window.BUDDY_PENDING_LANG)save('buddy_lang',lang);

async function apiJSON(path,method,data){
 const r=await fetch(path,{method,credentials:'same-origin',headers:{'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});
 let j={};try{j=await r.json()}catch{}
 return {ok:r.ok,status:r.status,data:j};
}
async function logout(){
 for(const key of Object.keys(pending)){clearTimeout(timers[key]);await push(key)}
 try{await apiJSON('/api/auth/logout','POST')}catch{}
 window.BuddyBoot.clearLocal();location.reload();
}

// ---------- Профиль мәзірі (жоғарғы оң жақ аватар және сол жақ төменгі профиль) ----------
function closeMenu(){const m=document.getElementById('accountMenu');if(m)m.remove();document.removeEventListener('click',outsideClick,true)}
function outsideClick(e){if(!e.target.closest('#accountMenu,[data-account-menu]'))closeMenu()}
function openMenu(btn){
 if(document.getElementById('accountMenu')){closeMenu();return}
 const m=document.createElement('div');m.id='accountMenu';m.className='account-menu';m.setAttribute('role','menu');
 m.innerHTML=`<div class="account-menu-head"><span class="avatar">${esc(initials())}</span><div><strong>${esc(user.name)}${user.nickname?` <span class="nick-chip">@${esc(user.nickname)}</span>`:''}</strong><small>${esc(studyLine()||user.email)}</small></div></div>
  <button role="menuitem" data-menu="settings"><span>⚙</span>${t('settings')}</button>
  <button role="menuitem" data-menu="logout" class="danger-item"><span>↪</span>${t('logout')}</button>`;
 document.body.appendChild(m);
 const r=btn.getBoundingClientRect(),w=m.offsetWidth,h=m.offsetHeight;
 m.style.left=Math.max(12,Math.min(r.right-w,innerWidth-w-12))+'px';
 m.style.top=(r.top>innerHeight/2?r.top-h-8:r.bottom+8)+'px';
 if(r.left<innerWidth/3)m.style.left=Math.max(12,r.left)+'px';
 m.querySelector('[data-menu="settings"]').onclick=()=>{closeMenu();view('settings')};
 m.querySelector('[data-menu="logout"]').onclick=()=>{closeMenu();logout()};
 m.querySelector('button').focus();
 setTimeout(()=>document.addEventListener('click',outsideClick,true));
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
window.addEventListener('resize',closeMenu);

function decorate(){
 const profile=document.querySelector('.sidebar .profile');
 if(profile)profile.outerHTML=`<button class="profile profile-btn ${currentView==='settings'?'active':''}" data-account-menu aria-haspopup="menu" aria-label="${t('accountMenu')}"><div class="avatar">${esc(initials())}</div><div><strong>${esc(user.name)}</strong><small>${esc([courseText(user.course),user.group||user.major].filter(Boolean).join(' · ')||user.email)}</small></div><span class="profile-more">⋯</span></button>`;
 const actions=document.querySelector('.top-actions');
 if(actions&&!actions.querySelector('.avatar-btn'))actions.insertAdjacentHTML('beforeend',`<button class="avatar-btn" data-account-menu aria-haspopup="menu" aria-label="${t('accountMenu')}">${esc(initials())}</button>`);
 document.querySelectorAll('[data-account-menu]').forEach(b=>b.onclick=e=>{e.stopPropagation();openMenu(b)});
}
const baseRender=render;
render=function(){closeMenu();baseRender();decorate()};

// ---------- Баптаулар беті ----------
const toggle=(id,on)=>`<span class="switch"><input type="checkbox" id="${id}" ${on?'checked':''}><i></i></span>`;
function settingsHTML(){
 const since=user.createdAt?dt(user.createdAt.slice(0,10)):'—';
 return `${intro(t('settings'),'')}
 <div class="settings-layout">
  <section class="view-card settings-card profile-card">
   <div class="profile-hero"><span class="avatar big">${esc(initials())}</span><div class="profile-hero-text"><h2>${esc(user.name)}${user.nickname?` <span class="nick-chip">@${esc(user.nickname)}</span>`:''}</h2>
    ${studyLine()?`<p class="study-line">🎓 ${esc(studyLine())}</p>`:''}<small>${esc(user.email)} · ${t('memberSince')}: ${since}</small></div></div>
   <form id="profileForm" class="settings-form profile-form">
    <h3 class="form-section">${t('personal')}</h3>
    <div class="form-grid">
     <label>${t('name')}<input name="name" required maxlength="60" autocomplete="name" value="${esc(user.name)}"></label>
     <label>${t('nickname')}<input name="nickname" maxlength="30" autocomplete="nickname" value="${esc(user.nickname||'')}" placeholder="${esc(t('nicknamePh'))}"><span class="field-hint">${t('nicknameHint')}</span></label>
    </div>
    <div class="buddy-preview" aria-live="polite"><img src="assets/buddy.png" alt=""><div><span>${t('previewTitle')}</span><p id="nickPreview"></p></div></div>
    <h3 class="form-section">${t('study')}</h3>
    <label>${t('university')}<input name="university" list="uniList" maxlength="100" value="${esc(user.university||'')}" placeholder="${esc(t('universityPh'))}"></label>
    <datalist id="uniList">${UNIVERSITIES.map(u=>`<option value="${esc(u)}">`).join('')}</datalist>
    <div class="form-grid">
     <label>${t('major')}<input name="major" maxlength="100" value="${esc(user.major||'')}" placeholder="${esc(t('majorPh'))}"></label>
     <label>${t('groupOnly')}<input name="group" maxlength="60" value="${esc(user.group||'')}" placeholder="${esc(t('groupOnlyPh'))}"></label>
    </div>
    <fieldset class="course-field"><legend>${t('course')}</legend><div class="course-chips" role="radiogroup" aria-label="${t('course')}">
     <label class="course-chip"><input type="radio" name="course" value="" ${!user.course?'checked':''}><span>—</span></label>
     ${COURSES.map(([v,k],i)=>`${i&&COURSES[i-1][1]!==k?'<i class="course-sep"></i>':''}<label class="course-chip ${k}" title="${esc(courseText(v))}"><input type="radio" name="course" value="${v}" ${user.course===v?'checked':''}><span>${v==='PhD'?'PhD':v.replace('M','М')}</span></label>`).join('')}
    </div><small class="course-name" id="courseName">${esc(courseText(user.course)||t('courseNone'))}</small></fieldset>
    <p class="form-msg" id="profileMsg" hidden></p>
    <button class="primary">${t('save')}</button></form>
  </section>
  <section class="view-card settings-card tall">
   <h2>${t('interface')}</h2>
   <div class="settings-row static"><div><strong>${t('language')}</strong></div><div class="segmented">${['kk','ru','en'].map(l=>`<button data-set-lang="${l}" class="${lang===l?'active':''}">${{kk:'ҚАЗ',ru:'РУС',en:'ENG'}[l]}</button>`).join('')}</div></div>
   <label class="settings-row"><div><strong>${t('weeklyTitle')}</strong><small>${t('weeklySub')}</small></div>${toggle('setRepeat',repeat)}</label>
   <h2 class="settings-gap" id="alertsSettings">🔔 ${t('alertsTitle')}</h2><p class="settings-sub">${t('alertsSub')}</p>
   <label class="settings-row"><div><strong>${t('classAlerts')}</strong><small>${t('classAlertsSub')}</small></div>${toggle('setClassAlerts',alertPrefs.classes)}</label>
   <label class="settings-row"><div><strong>${t('deadlineAlerts')}</strong><small>${t('deadlineAlertsSub')}</small></div>${toggle('setDeadlineAlerts',alertPrefs.deadlines)}</label>
   <button class="text-btn" id="setRestoreAlerts">${t('restoreAlerts')} ↗</button>
   <p class="settings-sub" style="margin-top:10px">${t('notificationResetNote')} ${t('inAppShort')}</p>
  </section>
  <section class="view-card settings-card">
   <h2>${t('security')}</h2><p class="settings-sub">${t('securitySub')}</p>
   <form id="passwordForm" class="settings-form">
    <label>${t('currentPw')}<input name="current" type="password" autocomplete="current-password" required></label>
    <div class="form-grid"><label>${t('newPw')}<input name="next" type="password" autocomplete="new-password" minlength="6" required></label>
    <label>${t('confirmPw')}<input name="confirm" type="password" autocomplete="new-password" required></label></div>
    <p class="form-msg" id="passwordMsg" hidden></p>
    <button class="primary">${t('changePw')}</button></form>
  </section>
  <section class="view-card settings-card">
   <h2>${t('data')}</h2><p class="settings-sub">${t('dataSub')}</p>
   <button class="ghost-btn" id="clearChats">◷ ${t('clearChats')}</button>
   <h2 class="settings-gap">${t('session')}</h2><p class="settings-sub">${t('sessionSub')}</p>
   <button class="ghost-btn" id="settingsLogout">↪ ${t('logout')}</button>
   <div class="danger-zone"><h3>${t('dangerTitle')}</h3><p>${t('dangerSub')}</p><button class="danger-btn" id="deleteAccount">${t('deleteAccount')}</button></div>
  </section>
 </div>`;
}
const msg=(id,text,ok)=>{const el=document.getElementById(id);if(!el)return;el.textContent=text;el.className='form-msg '+(ok?'ok':'err');el.hidden=false};

function bindSettings(){
 $$('[data-set-lang]').forEach(b=>b.onclick=()=>{lang=b.dataset.setLang;save('buddy_lang',lang);render()});
 const form=$('#profileForm'),preview=()=>{const n=form.nickname.value.trim()||form.name.value.trim().split(' ')[0]||'…';$('#nickPreview').textContent=t('previewMsg').replace('{n}',n)};
 form.nickname.oninput=preview;form.name.oninput=preview;preview();
 form.querySelectorAll('input[name=course]').forEach(r=>r.onchange=()=>{$('#courseName').textContent=courseText(r.value)||t('courseNone')});
 $('#setRepeat').onchange=e=>{repeat=e.target.checked;save('buddy_repeat',repeat);toast(t('saved'))};
 $('#setClassAlerts').onchange=e=>{alertPrefs.classes=e.target.checked;save('buddy_alert_preferences',alertPrefs);refreshAlerts();toast(t('saved'))};
 $('#setDeadlineAlerts').onchange=e=>{alertPrefs.deadlines=e.target.checked;save('buddy_alert_preferences',alertPrefs);refreshAlerts();toast(t('saved'))};
 $('#setRestoreAlerts').onclick=()=>{dismissedAlerts={};save('buddy_dismissed_alerts',dismissedAlerts);refreshAlerts();toast(t('restored'))};
 $('#profileForm').onsubmit=async e=>{
  e.preventDefault();const f=Object.fromEntries(new FormData(e.target));
  if(/[<>{}\\]/.test(f.nickname||''))return msg('profileMsg',t('invalid_nickname'));
  const r=await apiJSON('/api/me','PATCH',{name:f.name,nickname:f.nickname,university:f.university,major:f.major,group:f.group,course:f.course||''}).catch(()=>({ok:false,data:{}}));
  if(!r.ok)return msg('profileMsg',t(r.data.error||'server_error'));
  user=Object.assign(user,r.data.user);window.BUDDY_USER=user;applyName();render();toast(t('saved'));
 };
 $('#passwordForm').onsubmit=async e=>{
  e.preventDefault();const f=Object.fromEntries(new FormData(e.target));
  if(f.next!==f.confirm)return msg('passwordMsg',t('mismatch'));
  const r=await apiJSON('/api/me/password','POST',{current:f.current,next:f.next}).catch(()=>({ok:false,data:{}}));
  if(!r.ok)return msg('passwordMsg',t(r.data.error||'server_error'));
  e.target.reset();msg('passwordMsg',t('pwChanged'),true);
 };
 $('#clearChats').onclick=()=>{if(!confirm(t('clearChatsConfirm')))return;sessions=[];activeChatId=null;persistChats();render();toast(t('chatsCleared'))};
 $('#settingsLogout').onclick=logout;
 $('#deleteAccount').onclick=()=>{
  modal(`<h2>${t('dangerTitle')}</h2><p class="settings-sub">${t('dangerSub')}</p><form id="deleteForm"><label>${t('deleteConfirm')}<input name="password" type="password" autocomplete="current-password" required></label><p class="form-msg" id="deleteMsg" hidden></p><div class="modal-actions"><button type="button" class="ghost-btn" id="cancelDelete">${t('cancel')}</button><button class="danger-btn">${t('deleteBtn')}</button></div></form>`);
  $('#modalBg .modal').setAttribute('aria-label',t('dangerTitle'));
  $('#cancelDelete').onclick=closeModal;
  $('#deleteForm').onsubmit=async e=>{
   e.preventDefault();
   const r=await apiJSON('/api/me','DELETE',{password:new FormData(e.target).get('password')}).catch(()=>({ok:false,data:{}}));
   if(!r.ok)return msg('deleteMsg',t(r.data.error||'server_error'));
   Object.keys(pending).forEach(k=>{clearTimeout(timers[k]);delete pending[k]});
   window.BuddyBoot.clearLocal();location.reload();
  };
 };
}

const basePage=pageContent;
pageContent=function(){
 if(currentView==='settings')return settingsHTML();
 // Деканат анықтамасындағы аты-жөні — кірген пайдаланушының аты.
 return basePage().replace('value="Айару Амангелди"',`value="${esc(user.name)}"`);
};
const baseBind=bind;
bind=function(){baseBind();if(currentView==='settings')bindSettings()};

window.BuddyAccount={get user(){return user},logout,callName,courseText};
render();
})();
