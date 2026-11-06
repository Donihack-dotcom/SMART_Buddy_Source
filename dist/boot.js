// SMART.Buddy іске қосушысы: аккаунтты тексереді, кірмеген болса кіру/тіркелу бетін көрсетеді,
// кірген болса пайдаланушының деректерін серверден алып, қолданба скрипттерін ретімен жүктейді.
(function(){
const APP_SCRIPTS=['schedule.js','app.js','planner.js','experience.js','schedule-editor.js','support.js','support-kb.js','ai.js','account.js','news-format.js','news.js','notify.js'];
const KEY_PREFIX='buddy_';
const L={
 kk:{tagline:'ЕНУ студентінің цифрлық көмекшісі',f1:'Сабақ кестесі және келесі сабақ',f2:'Дедлайндар мен ескертулер',f3:'GPA калькуляторы және Buddy ЖИ',login:'Кіру',register:'Тіркелу',welcome:'Қайта қош келдің!',welcomeSub:'Аккаунтыңа кіріп, жоспарыңды жалғастыр.',create:'Аккаунт жасау',createSub:'Деректерің аккаунтыңда сақталады — кез келген құрылғыдан кіре аласың.',name:'Аты-жөні',namePh:'Мысалы, Айару Амангелди',email:'Email',password:'Құпиясөз',passwordPh:'Кемінде 6 таңба',confirm:'Құпиясөзді қайтала',submitLogin:'Кіру',submitRegister:'Тіркелу',noAccount:'Аккаунтың жоқ па?',haveAccount:'Аккаунтың бар ма?',show:'Көрсету',hide:'Жасыру',mismatch:'Құпиясөздер сәйкес емес',loading:'Жүктелуде…',unofficial:'ЕНУ-дің ресми сервисі емес · студенттік жоба',
  invalid_credentials:'Email немесе құпиясөз қате',email_taken:'Бұл email тіркелген. Кіріп көр.',invalid_email:'Email дұрыс емес',invalid_name:'Аты-жөніңді жаз (2–60 таңба)',weak_password:'Құпиясөз кемінде 6 таңба болуы керек',too_many:'Әрекет тым көп. 15 минуттан кейін қайтала.',network:'Серверге қосылу мүмкін болмады',server_error:'Сервер қатесі. Қайта көр.'},
 ru:{tagline:'Цифровой помощник студента ЕНУ',f1:'Расписание и следующая пара',f2:'Дедлайны и напоминания',f3:'Калькулятор GPA и Buddy ИИ',login:'Вход',register:'Регистрация',welcome:'С возвращением!',welcomeSub:'Войди в аккаунт и продолжай планировать.',create:'Создать аккаунт',createSub:'Данные хранятся в аккаунте — заходи с любого устройства.',name:'Имя и фамилия',namePh:'Например, Аяру Амангелди',email:'Email',password:'Пароль',passwordPh:'Минимум 6 символов',confirm:'Повтори пароль',submitLogin:'Войти',submitRegister:'Зарегистрироваться',noAccount:'Нет аккаунта?',haveAccount:'Уже есть аккаунт?',show:'Показать',hide:'Скрыть',mismatch:'Пароли не совпадают',loading:'Загрузка…',unofficial:'Не официальный сервис ЕНУ · студенческий проект',
  invalid_credentials:'Неверный email или пароль',email_taken:'Этот email уже зарегистрирован. Попробуй войти.',invalid_email:'Некорректный email',invalid_name:'Укажи имя (2–60 символов)',weak_password:'Пароль должен быть не короче 6 символов',too_many:'Слишком много попыток. Повтори через 15 минут.',network:'Не удалось подключиться к серверу',server_error:'Ошибка сервера. Попробуй ещё раз.'},
 en:{tagline:'Digital assistant for ENU students',f1:'Timetable and your next class',f2:'Deadlines and reminders',f3:'GPA calculator and Buddy AI',login:'Log in',register:'Sign up',welcome:'Welcome back!',welcomeSub:'Log in to pick up where you left off.',create:'Create your account',createSub:'Your data lives in your account — log in from any device.',name:'Full name',namePh:'e.g. Aiaru Amangeldi',email:'Email',password:'Password',passwordPh:'At least 6 characters',confirm:'Repeat password',submitLogin:'Log in',submitRegister:'Sign up',noAccount:'No account yet?',haveAccount:'Already have an account?',show:'Show',hide:'Hide',mismatch:'Passwords do not match',loading:'Loading…',unofficial:'Not an official ENU service · student project',
  invalid_credentials:'Wrong email or password',email_taken:'This email is already registered. Try logging in.',invalid_email:'Invalid email',invalid_name:'Enter your name (2–60 characters)',weak_password:'Password must be at least 6 characters',too_many:'Too many attempts. Try again in 15 minutes.',network:'Could not reach the server',server_error:'Server error. Please try again.'}
};
let lang;try{lang=JSON.parse(localStorage.getItem('buddy_lang'))}catch{}
if(!L[lang])lang=/^ru/.test(navigator.language)?'ru':/^en/.test(navigator.language)?'en':'kk';
const t=k=>L[lang][k]||k;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const app=document.getElementById('app');

async function api(path,opts={}){
 const r=await fetch(path,{credentials:'same-origin',headers:{'Content-Type':'application/json'},...opts});
 let data={};try{data=await r.json()}catch{}
 return {status:r.status,ok:r.ok,data};
}

function clearLocal(){Object.keys(localStorage).filter(k=>k.startsWith(KEY_PREFIX)).forEach(k=>localStorage.removeItem(k))}

function loadScripts(i=0){
 if(i>=APP_SCRIPTS.length)return;
 const s=document.createElement('script');s.src=APP_SCRIPTS[i];s.onload=()=>loadScripts(i+1);
 s.onerror=()=>{app.innerHTML=`<div class="boot-screen"><p>${t('server_error')}</p></div>`};
 document.body.appendChild(s);
}

async function start(){
 app.innerHTML=`<div class="boot-screen"><img src="assets/buddy.png" alt="" width="90"><p>${t('loading')}</p></div>`;
 let me;
 try{me=await api('/api/me')}catch{app.innerHTML=`<div class="boot-screen"><p>${t('network')}</p></div>`;return}
 if(me.status===401)return showAuth('login');
 if(!me.ok){app.innerHTML=`<div class="boot-screen"><p>${t('server_error')}</p></div>`;return}
 const st=await api('/api/state');
 // Браузердегі бұрынғы деректерді осы аккаунттың деректерімен ауыстырамыз (бір браузерде бірнеше аккаунт болуы мүмкін).
 const chosenLang=lang;clearLocal();
 const state=(st.data&&st.data.state)||{};
 for(const [k,v] of Object.entries(state))localStorage.setItem(k,JSON.stringify(v));
 if(!state.buddy_lang)localStorage.setItem('buddy_lang',JSON.stringify(chosenLang));
 window.BUDDY_USER=me.data.user;
 window.BUDDY_PENDING_LANG=state.buddy_lang?null:chosenLang;
 loadScripts();
}

function showAuth(mode){
 document.documentElement.lang=lang;document.title='SMART.Buddy — '+t(mode);
 const reg=mode==='register';
 app.innerHTML=`<div class="auth-page">
 <aside class="auth-art">
  <div class="logo"><span class="logo-mark">✦</span><span>SMART.<b>Buddy</b></span></div>
  <div class="auth-art-body"><img src="assets/buddy.png" alt="Buddy" class="auth-buddy"><h2>${t('tagline')}</h2>
   <ul><li>▣ ${t('f1')}</li><li>☑ ${t('f2')}</li><li>✧ ${t('f3')}</li></ul></div>
  <small>${t('unofficial')}</small>
 </aside>
 <main class="auth-main">
  <div class="auth-top"><div class="logo auth-mobile-logo"><span class="logo-mark">✦</span><span>SMART.<b>Buddy</b></span></div>
   <select id="authLang" class="lang" aria-label="Language"><option value="kk" ${lang==='kk'?'selected':''}>ҚАЗ</option><option value="ru" ${lang==='ru'?'selected':''}>РУС</option><option value="en" ${lang==='en'?'selected':''}>ENG</option></select></div>
  <div class="auth-card">
   <div class="auth-tabs" role="tablist"><button type="button" role="tab" data-mode="login" aria-selected="${!reg}" class="${reg?'':'active'}">${t('login')}</button><button type="button" role="tab" data-mode="register" aria-selected="${reg}" class="${reg?'active':''}">${t('register')}</button></div>
   <h1>${t(reg?'create':'welcome')}</h1><p class="auth-sub">${t(reg?'createSub':'welcomeSub')}</p>
   <form id="authForm" novalidate>
    ${reg?`<label>${t('name')}<input name="name" autocomplete="name" required maxlength="60" placeholder="${esc(t('namePh'))}"></label>`:''}
    <label>${t('email')}<input name="email" type="email" autocomplete="email" required maxlength="120" placeholder="name@example.com"></label>
    <label>${t('password')}<span class="pw-wrap"><input name="password" type="password" autocomplete="${reg?'new-password':'current-password'}" required minlength="6" maxlength="200" placeholder="${esc(t('passwordPh'))}"><button type="button" class="pw-toggle" data-pw>${t('show')}</button></span></label>
    ${reg?`<label>${t('confirm')}<input name="confirm" type="password" autocomplete="new-password" required maxlength="200"></label>`:''}
    <p class="auth-error" id="authError" role="alert" hidden></p>
    <button class="primary auth-submit" type="submit">${t(reg?'submitRegister':'submitLogin')}</button>
   </form>
   <p class="auth-switch">${t(reg?'haveAccount':'noAccount')} <button type="button" data-mode="${reg?'login':'register'}">${t(reg?'login':'register')} →</button></p>
  </div>
 </main></div>`;
 document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>showAuth(b.dataset.mode));
 document.getElementById('authLang').onchange=e=>{lang=e.target.value;try{localStorage.setItem('buddy_lang',JSON.stringify(lang))}catch{}showAuth(mode)};
 document.querySelector('[data-pw]').onclick=e=>{const i=e.target.previousElementSibling,show=i.type==='password';i.type=show?'text':'password';e.target.textContent=t(show?'hide':'show')};
 const form=document.getElementById('authForm'),err=document.getElementById('authError');
 const fail=k=>{err.textContent=t(k);err.hidden=false};
 form.elements[0].focus();
 form.onsubmit=async e=>{
  e.preventDefault();err.hidden=true;
  const f=Object.fromEntries(new FormData(form));
  if(reg&&f.password!==f.confirm)return fail('mismatch');
  const btn=form.querySelector('.auth-submit');btn.disabled=true;btn.textContent=t('loading');
  try{
   const r=await api('/api/auth/'+(reg?'register':'login'),{method:'POST',body:JSON.stringify(reg?{name:f.name,email:f.email,password:f.password}:{email:f.email,password:f.password})});
   if(r.ok)return start();
   fail(r.data.error||'server_error');
  }catch{fail('network')}
  btn.disabled=false;btn.textContent=t(reg?'submitRegister':'submitLogin');
 };
}

window.BuddyBoot={clearLocal};
start();
})();
