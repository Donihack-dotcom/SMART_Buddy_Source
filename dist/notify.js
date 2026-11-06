// 🔔 Ескертулер панелі: қоңырауды басқанда шұғыл дедлайндар мен сабақтар әдемі қызыл карточкалармен ашылады.
// Ескертулердің баптаулары (қосу/өшіру, жасырылғандарды қайтару) енді тек «Баптаулар» бетінде.
(function(){
const text={
 kk:{npTitle:'Ескертулер',npSub:'Шұғыл дедлайндар мен сабақтар',npDeadlines:'Шұғыл дедлайндар',npClasses:'Сабақтар',npNow:'ҚАЗІР ЖҮРІП ЖАТЫР',npNext:'ЖАҚЫН САБАҚ',npLater:'Бүгін кейін',npLeft:'қалды',npStarts:'басталуына',npOverdue:'Мерзімі өтті',npClearTitle:'Бәрі тыныш 🎉',npClearSub:'Шұғыл дедлайн да, жақын сабақ та жоқ. Демал!',npOff:'Ескертулер баптауда өшірулі.',npAllTasks:'Барлық дедлайндар',npSchedule:'Кесте',npSettings:'Баптау',npSoon:'Алдағы 4–6 күнде тағы {n} дедлайн бар',npHidden:'{n} ескерту жасырылған',npRestore:'Қайтару',npOpen:'Ескертулерді ашу'},
 ru:{npTitle:'Напоминания',npSub:'Срочные дедлайны и пары',npDeadlines:'Срочные дедлайны',npClasses:'Пары',npNow:'ИДЁТ СЕЙЧАС',npNext:'БЛИЖАЙШАЯ ПАРА',npLater:'Сегодня позже',npLeft:'осталось',npStarts:'до начала',npOverdue:'Срок прошёл',npClearTitle:'Всё спокойно 🎉',npClearSub:'Ни срочных дедлайнов, ни ближайших пар. Отдыхай!',npOff:'Напоминания выключены в настройках.',npAllTasks:'Все дедлайны',npSchedule:'Расписание',npSettings:'Настроить',npSoon:'Ещё {n} дедлайн(а) в ближайшие 4–6 дней',npHidden:'Скрыто напоминаний: {n}',npRestore:'Вернуть',npOpen:'Открыть напоминания'},
 en:{npTitle:'Reminders',npSub:'Urgent deadlines and classes',npDeadlines:'Urgent deadlines',npClasses:'Classes',npNow:'HAPPENING NOW',npNext:'NEXT CLASS',npLater:'Later today',npLeft:'left',npStarts:'starts in',npOverdue:'Overdue',npClearTitle:'All clear 🎉',npClearSub:'No urgent deadlines and no upcoming classes. Take a break!',npOff:'Reminders are turned off in settings.',npAllTasks:'All deadlines',npSchedule:'Timetable',npSettings:'Settings',npSoon:'{n} more deadline(s) in the next 4–6 days',npHidden:'{n} reminder(s) hidden',npRestore:'Restore',npOpen:'Open reminders'}
};
Object.keys(text).forEach(l=>Object.assign(dictionary[l],text[l]));
const fmt=(k,v)=>Object.entries(v).reduce((s,[a,b])=>s.replaceAll('{'+a+'}',b),t(k));
const BELL='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>';
const X='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';

function hiddenCount(){return Object.keys(dismissedAlerts||{}).length}
// Бүгінгі қалған сабақтар (ескертудегі сабақтан басқа), ең көбі 3.
function laterToday(skip){
 const now=new Date(),today=S.localDate(now),hm=timeWithoutSeconds(now);
 return S.events(today,repeat).filter(l=>l.start>hm&&!(skip&&skip.id===l.id&&skip.date===l.date)).slice(0,3);
}
function deadlineCard(a){
 const x=a.task,over=P.urgency(x)==='overdue',m=Math.ceil((P.dueDate(x)-new Date())/60000),sub=taskSubject(x);
 return `<div class="np-card np-deadline ${over?'is-over':''}" data-np-go="tasks" tabindex="0" role="button">
  <span class="np-icon">${over?'!':'⏰'}</span>
  <div class="np-body"><strong>${esc(x.title)}</strong>${sub?`<small class="np-subject">${esc(sub)}</small>`:''}
   <small class="np-when">📅 ${dt(x.date,{weekday:'short'})} · ${x.time||'23:59'}</small></div>
  <span class="np-pill">${over?t('npOverdue'):duration(m)}</span>
  <button class="np-x" data-np-dismiss="${esc(a.key)}" aria-label="${t('closeAlert')}: ${esc(x.title)}" title="${t('closeAlert')}">${X}</button></div>`;
}
function classCard(a){
 const l=a.lesson;
 return `<div class="np-card np-class ${a.current?'is-now':''}" data-np-go="schedule" tabindex="0" role="button">
  <span class="np-icon">${a.current?'<i class="np-live"></i>':'▣'}</span>
  <div class="np-body"><em class="np-label">${t(a.current?'npNow':'npNext')}</em><strong>${esc(title(l))}</strong>
   <small class="np-when">🕒 ${l.date!==S.localDate()?dt(l.date,{weekday:'short'})+' · ':''}${l.start}–${l.end}</small>
   <small class="np-where">📍 ${esc(locationText(l))}</small></div>
  <span class="np-pill">${a.current?duration(a.minutes)+' '+t('npLeft'):t('npStarts')+' '+duration(a.minutes)}</span>
  <button class="np-x" data-np-dismiss="${esc(a.key)}" aria-label="${t('closeAlert')}" title="${t('closeAlert')}">${X}</button></div>`;
}
function panelHTML(){
 const list=currentAlerts(),cls=list.find(a=>a.kind==='class'),dl=list.filter(a=>a.kind!=='class');
 const later=alertPrefs.classes?laterToday(cls&&cls.lesson):[];
 const soon=alertPrefs.deadlines?tasks.filter(x=>!x.done&&P.urgency(x)==='yellow').length:0;
 const off=!alertPrefs.classes&&!alertPrefs.deadlines,hidden=hiddenCount();
 let body='';
 if(dl.length)body+=`<h4 class="np-group red">${t('npDeadlines')} <b>${dl.length}</b></h4>${dl.map(deadlineCard).join('')}`;
 if(cls||later.length){
  body+=`<h4 class="np-group">${t('npClasses')}</h4>${cls?classCard(cls):''}`;
  if(later.length)body+=`<div class="np-later"><span>${t('npLater')}</span>${later.map(l=>`<button data-np-go="schedule"><b>${l.start}</b>${esc(title(l))}<small>${esc(locationText(l))}</small></button>`).join('')}</div>`;
 }
 if(!body)body=`<div class="np-empty"><div class="np-empty-icon">${off?'🔕':'✓'}</div><strong>${off?t('npOff'):t('npClearTitle')}</strong>${off?'':`<small>${t('npClearSub')}</small>`}</div>`;
 if(soon)body+=`<button class="np-soon" data-np-go="tasks">🟡 ${fmt('npSoon',{n:soon})} ↗</button>`;
 if(hidden)body+=`<div class="np-hidden">${fmt('npHidden',{n:hidden})} · <button data-np-restore>${t('npRestore')}</button></div>`;
 return `<div class="np-head"><div><h3>${BELL}${t('npTitle')}${list.length?`<span class="np-count">${list.length}</span>`:''}</h3><small>${t('npSub')}</small></div>
  <button class="np-gear" data-np-settings aria-label="${t('npSettings')}" title="${t('npSettings')}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></button></div>
  <div class="np-list">${body}</div>
  <div class="np-foot"><button data-np-go="tasks">☑ ${t('npAllTasks')}</button><button data-np-go="schedule">▣ ${t('npSchedule')}</button><button data-np-settings>⚙ ${t('npSettings')}</button></div>`;
}

let panel=null;
function place(){
 const bell=document.querySelector('.bell');if(!panel||!bell)return;
 const r=bell.getBoundingClientRect(),w=Math.min(400,innerWidth-24);
 panel.style.width=w+'px';
 panel.style.top=(r.bottom+10)+'px';
 panel.style.left=Math.max(12,Math.min(r.right-w,innerWidth-w-12))+'px';
 panel.style.setProperty('--nub',Math.max(18,Math.min(w-18,r.left+r.width/2-parseFloat(panel.style.left)))+'px');
}
function fill(){
 if(!panel)return;
 const scroll=panel.querySelector('.np-list')?.scrollTop||0;
 panel.innerHTML=panelHTML();
 panel.querySelector('.np-list').scrollTop=scroll;
 panel.querySelectorAll('[data-np-go]').forEach(b=>{const go=()=>{close();view(b.dataset.npGo)};b.onclick=go;b.onkeydown=e=>{if(e.key==='Enter'&&e.target===b){e.preventDefault();go()}}});
 panel.querySelectorAll('[data-np-settings]').forEach(b=>b.onclick=()=>{close();openAlertSettings()});
 panel.querySelectorAll('[data-np-dismiss]').forEach(b=>b.onclick=e=>{e.stopPropagation();dismissedAlerts[b.dataset.npDismiss]=true;save('buddy_dismissed_alerts',dismissedAlerts);refreshAlerts()});
 const restore=panel.querySelector('[data-np-restore]');
 if(restore)restore.onclick=()=>{dismissedAlerts={};save('buddy_dismissed_alerts',{});refreshAlerts();toast(t('restored'))};
}
function outside(e){if(panel&&!e.target.closest('#notifyPanel,.bell'))close()}
function close(){if(!panel)return;panel.remove();panel=null;document.removeEventListener('pointerdown',outside,true);const b=document.querySelector('.bell');if(b)b.setAttribute('aria-expanded','false')}
function open(){
 if(panel){close();return}
 panel=document.createElement('div');panel.id='notifyPanel';panel.className='notify-panel';
 panel.setAttribute('role','dialog');panel.setAttribute('aria-label',t('npTitle'));
 document.body.appendChild(panel);fill();place();
 const b=document.querySelector('.bell');if(b)b.setAttribute('aria-expanded','true');
 setTimeout(()=>document.addEventListener('pointerdown',outside,true));
 panel.querySelector('.np-gear').focus({preventScroll:true});
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel){close();const b=document.querySelector('.bell');if(b)b.focus()}});
addEventListener('resize',place);

// Ескерту баптаулары енді модальда емес, «Баптаулар» бетінде.
openAlertSettings=function(){
 close();view('settings');
 setTimeout(()=>{const el=document.getElementById('alertsSettings');if(!el)return;el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1600)},80);
};
const baseRefresh=refreshAlerts;
refreshAlerts=function(){baseRefresh();if(panel)fill()};
const baseRender=render;
render=function(){
 baseRender();
 const bell=document.querySelector('.bell');
 if(bell){
  bell.removeAttribute('data-settings');
  bell.innerHTML=BELL+bell.innerHTML.replace(/^[^<]*/,'');
  bell.setAttribute('aria-label',t('npOpen'));bell.setAttribute('aria-haspopup','dialog');bell.setAttribute('aria-expanded',panel?'true':'false');
  bell.classList.toggle('has-urgent',currentAlerts().some(a=>a.kind!=='class'));
  bell.onclick=e=>{e.stopPropagation();open()};
 }
 if(panel){fill();place()}
};
window.BuddyNotify={open,close};
render();
})();
