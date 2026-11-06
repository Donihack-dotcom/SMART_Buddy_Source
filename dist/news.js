// «Жаңалықтар» бөлімі: Buddy News серверінде жарияланған жаңалықтар (server.js → news-proxy.js → /api/news).
// Мәзірде жаңа жаңалықтар саны, басты бетте «Соңғы жаңалықтар», бөлек бетте сүзгі, үлкен бекітілген карточка және толық мақала.
// Жаңалықтар әр 60 секунд сайын өзі жаңарады; оқылғандары аккаунтқа сақталады (buddy_news_seen).
(function(){
const F=window.BuddyNewsFormat;
const text={
 kk:{news:'Жаңалықтар',newsSub:'Университет пен Buddy-дің соңғы жаңалықтары',allCats:'Барлығы',readMore:'Оқу',back:'← Барлық жаңалықтар',minRead:'мин оқу',newBadge:'Жаңа',pinned:'Бекітілген',latestNews:'Соңғы жаңалықтар',allNews:'Барлығы ↗',related:'Басқа жаңалықтар',emptyNews:'Әзірге жаңалық жоқ. Жаңалық жарияланғанда осында бірден шығады.',emptyCat:'Бұл санатта әзірге жаңалық жоқ.',offline:'Жаңалықтар серверіне қосылу мүмкін болмады.',cached:'Жаңалықтар серверімен байланыс жоқ — соңғы сақталған нұсқа көрсетілуде.',loading:'Жаңалықтар жүктелуде…',notFound:'Бұл жаңалық табылмады немесе өшірілген.',justNow:'жаңа ғана',minAgo:'мин бұрын',hAgo:'сағ бұрын',yesterday:'кеше',retry:'Қайта көру',newCount:'{n} жаңа'},
 ru:{news:'Новости',newsSub:'Последние новости университета и Buddy',allCats:'Все',readMore:'Читать',back:'← Все новости',minRead:'мин чтения',newBadge:'Новое',pinned:'Закреплено',latestNews:'Последние новости',allNews:'Все ↗',related:'Другие новости',emptyNews:'Пока новостей нет. Как только новость опубликуют, она сразу появится здесь.',emptyCat:'В этой категории пока нет новостей.',offline:'Не удалось подключиться к серверу новостей.',cached:'Нет связи с сервером новостей — показана последняя сохранённая версия.',loading:'Загружаем новости…',notFound:'Новость не найдена или удалена.',justNow:'только что',minAgo:'мин назад',hAgo:'ч назад',yesterday:'вчера',retry:'Повторить',newCount:'{n} новых'},
 en:{news:'News',newsSub:'Latest news from the university and Buddy',allCats:'All',readMore:'Read',back:'← All news',minRead:'min read',newBadge:'New',pinned:'Pinned',latestNews:'Latest news',allNews:'All ↗',related:'More news',emptyNews:'No news yet. As soon as something is published, it will appear here.',emptyCat:'No news in this category yet.',offline:'Could not connect to the news server.',cached:'No connection to the news server — showing the last saved version.',loading:'Loading news…',notFound:'This news item was not found or has been removed.',justNow:'just now',minAgo:'min ago',hAgo:'h ago',yesterday:'yesterday',retry:'Retry',newCount:'{n} new'}
};
Object.keys(text).forEach(l=>Object.assign(dictionary[l],text[l]));

const st={list:[],loaded:false,live:true,error:false,filter:'all',openId:null,article:null,articleError:false};
let seen=load('buddy_news_seen',{last:null,read:[]});
if(!seen||typeof seen!=='object'||!Array.isArray(seen.read))seen={last:null,read:[]};
const saveSeen=()=>save('buddy_news_seen',seen);
const WEEK=7*864e5;

// ---------- Көмекші ----------
const cat=k=>F.CATEGORIES[k]||F.CATEGORIES.general;
const catName=k=>cat(k)[lang]||cat(k).kk;
const grad=k=>`linear-gradient(135deg, ${cat(k).color}, color-mix(in srgb, ${cat(k).color} 55%, #1d1640))`;
function when(iso){
 const d=new Date(iso),m=Math.round((Date.now()-d)/60000);
 if(m<1)return t('justNow');
 if(m<60)return m+' '+t('minAgo');
 if(m<24*60)return Math.round(m/60)+' '+t('hAgo');
 if(m<48*60)return t('yesterday');
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Almaty',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(d).map(x=>[x.type,x.value]));
 const year=+p.year!==new Date().getFullYear()?' '+p.year:'';
 return lang==='en'?new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Almaty',day:'numeric',month:'long'}).format(d)+year:+p.day+' '+MONTHS[lang][p.month-1]+year;
}
// Браузерлерде қазақша ай атаулары жиі жоқ — өзіміз жазамыз.
const MONTHS={kk:['қаңтар','ақпан','наурыз','сәуір','мамыр','маусым','шілде','тамыз','қыркүйек','қазан','қараша','желтоқсан'],ru:['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']};
const isNew=n=>!seen.read.includes(n.id)&&Date.now()-new Date(n.publishedAt)<WEEK;
const unseenCount=()=>st.list.filter(n=>seen.last?new Date(n.publishedAt)>new Date(seen.last):Date.now()-new Date(n.publishedAt)<WEEK).length;
const badge=k=>`<span class="n-cat" style="--c:${cat(k).color}">${cat(k).icon} ${esc(catName(k))}</span>`;
const cover=(n,cls='')=>`<div class="n-cover ${cls}" style="--g:${grad(n.category)}">${n.cover?`<img src="${esc(n.cover)}" alt="" loading="lazy">`:`<span>${cat(n.category).icon}</span>`}</div>`;
const meta=n=>`<span>${when(n.publishedAt)}</span><span>·</span><span>${n.readMin} ${t('minRead')}</span>`;

// ---------- Деректер ----------
async function fetchList(){
 try{
  const r=await fetch('/api/news',{credentials:'same-origin'}),j=await r.json();
  if(!r.ok&&!(j.news||[]).length)throw new Error(j.error||'offline');
  st.list=j.news||[];st.live=j.live!==false;st.error=false;
 }catch{st.error=!st.list.length;st.live=false}
 st.loaded=true;
 refresh();
}
async function openArticle(id){
 st.openId=id;st.articleError=false;
 st.article=st.list.find(n=>n.id===id)||null;   // карточкадағы мәлімет бірден, толық мәтін артынан
 if(!seen.read.includes(id)){seen.read=[...seen.read.slice(-200),id];saveSeen()}
 view('news');
 try{const r=await fetch('/api/news/'+id,{credentials:'same-origin'});if(!r.ok)throw new Error(r.status);st.article=(await r.json()).news}
 catch{if(!st.article||st.article.body===undefined)st.articleError=true}
 if(currentView==='news'&&st.openId===id)render();
}

// ---------- Карточкалар ----------
function card(n){
 return `<button class="n-card" data-news-open="${n.id}">${cover(n)}<div class="n-card-body"><div class="n-tags">${badge(n.category)}${n.pinned?`<span class="n-pin">📌</span>`:''}${isNew(n)?`<span class="n-new">${t('newBadge')}</span>`:''}</div>
  <h3>${esc(n.title)}</h3>${n.summary?`<p>${esc(n.summary)}</p>`:''}<div class="n-meta">${meta(n)}</div></div></button>`;
}
function featured(n){
 return `<button class="n-featured" data-news-open="${n.id}">${cover(n,'big')}<div class="n-featured-body"><div class="n-tags">${badge(n.category)}${n.pinned?`<span class="n-pin">📌 ${t('pinned')}</span>`:''}${isNew(n)?`<span class="n-new">${t('newBadge')}</span>`:''}</div>
  <h2>${esc(n.title)}</h2>${n.summary?`<p>${esc(n.summary)}</p>`:''}<div class="n-meta">${meta(n)}${n.author?`<span>·</span><span>${esc(n.author)}</span>`:''}</div><span class="n-read">${t('readMore')} →</span></div></button>`;
}
function stateNote(){return !st.live&&st.list.length?`<p class="n-note">⚠ ${t('cached')}</p>`:''}

// ---------- Беттер ----------
function newsPage(){
 if(st.openId)return articlePage();
 const head=intro(t('news'),t('newsSub'));
 if(!st.loaded)return head+`<div class="n-skeleton">${'<div></div>'.repeat(3)}</div>`;
 if(st.error)return head+`<div class="view-card n-empty"><div>📡</div><p>${t('offline')}</p><button class="primary" id="newsRetry">${t('retry')}</button></div>`;
 if(!st.list.length)return head+`<div class="view-card n-empty"><div>📰</div><p>${t('emptyNews')}</p></div>`;
 const cats=[...new Set(st.list.map(n=>n.category))];
 const list=st.filter==='all'?st.list:st.list.filter(n=>n.category===st.filter);
 const top=st.filter==='all'?(list.find(n=>n.pinned)||list[0]):null,rest=list.filter(n=>n!==top);
 return head+stateNote()+
  `<div class="n-filters" role="tablist">${['all',...cats].map(k=>`<button role="tab" class="${st.filter===k?'active':''}" data-news-filter="${k}">${k==='all'?t('allCats'):cat(k).icon+' '+esc(catName(k))}<b>${k==='all'?st.list.length:st.list.filter(n=>n.category===k).length}</b></button>`).join('')}</div>`+
  (top?featured(top):'')+(rest.length?`<div class="n-grid">${rest.map(card).join('')}</div>`:(!top?`<div class="view-card n-empty"><p>${t('emptyCat')}</p></div>`:''));
}
function articlePage(){
 const n=st.article;
 const backBtn=`<button class="n-back" id="newsBack">${t('back')}</button>`;
 if(!n)return backBtn+(st.articleError?`<div class="view-card n-empty"><div>🔎</div><p>${t('notFound')}</p></div>`:`<div class="n-skeleton one"><div></div></div>`);
 const others=st.list.filter(x=>x.id!==n.id).slice(0,3);
 const body=n.body===undefined?(st.articleError?`<p class="n-note">⚠ ${t('offline')}</p>`:`<p class="n-loading">${t('loading')}</p>`):F.render(n.body);
 return backBtn+`<article class="n-article">${cover(n,'hero')}<div class="n-article-inner"><div class="n-tags">${badge(n.category)}${n.pinned?`<span class="n-pin">📌 ${t('pinned')}</span>`:''}</div>
  <h1>${esc(n.title)}</h1><div class="n-meta">${n.author?`<span class="n-author"><i>${esc(n.author.trim()[0]||'B')}</i>${esc(n.author)}</span><span>·</span>`:''}${meta(n)}</div>
  ${n.summary?`<p class="n-lead">${esc(n.summary)}</p>`:''}<div class="n-prose">${body}</div></div></article>`+
  (others.length?`<h2 class="n-related">${t('related')}</h2><div class="n-grid">${others.map(card).join('')}</div>`:'');
}
function homeWidget(){
 if(!st.list.length)return '';
 const fresh=st.list.filter(isNew).length;
 return `<section class="n-home"><div class="section-title"><h2>📰 ${t('latestNews')} ${fresh?`<span class="n-new">${fmt('newCount',{n:fresh})}</span>`:''}</h2><button class="text-btn" data-view="news">${t('allNews')}</button></div>
  <div class="n-strip">${st.list.slice(0,3).map(card).join('')}</div></section>`;
}
const fmt=(k,v)=>Object.entries(v).reduce((s,[a,b])=>s.replaceAll('{'+a+'}',b),t(k));

// ---------- Қолданбаға қосу ----------
const NEWS_ICON='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>';
const baseNav=nav;
nav=function(){
 const html=baseNav(),n=currentView==='news'?0:unseenCount();
 const btn=`<button class="${currentView==='news'?'active':''}" data-view="news"><span class="ico">${NEWS_ICON}</span>${t('news')}${n?`<span class="nav-badge" aria-label="${fmt('newCount',{n})}">${n>9?'9+':n}</span>`:''}</button>`;
 const i=html.indexOf('</button>');   // «Басты беттен» кейін
 return i<0?html+btn:html.slice(0,i+9)+btn+html.slice(i+9);
};
const basePage=pageContent;
pageContent=function(){
 if(currentView==='news')return newsPage();
 const html=basePage();
 if(currentView==='home'){const w=`<div id="homeNews">${homeWidget()}</div>`,k='<div class="grid home-secondary">';return html.includes(k)?html.replace(k,w+k):html+w}
 return html;
};
function bindNews(){
 $$('[data-news-open]').forEach(b=>b.onclick=()=>openArticle(+b.dataset.newsOpen));
 $$('[data-news-filter]').forEach(b=>b.onclick=()=>{st.filter=b.dataset.newsFilter;render()});
 const back=$('#newsBack');if(back)back.onclick=()=>{st.openId=null;st.article=null;render();window.scrollTo({top:0,behavior:'smooth'})};
 const retry=$('#newsRetry');if(retry)retry.onclick=()=>{st.loaded=false;render();fetchList()};
}
const baseBind=bind;
bind=function(){baseBind();bindNews()};
const baseView=view;
view=function(id){
 if(id!=='news'){st.openId=null;st.article=null}
 if(id==='news'&&!st.openId){seen.last=new Date().toISOString();saveSeen()}
 baseView(id);
};
// Жаңарғанда бетті толық қайта салмаймыз (студент жазып отырған мәтін жоғалмасын): тек қажет жерін.
function refresh(){
 if(currentView==='news'&&!st.openId){render();return}
 const h=$('#homeNews');
 if(h){h.innerHTML=homeWidget();$$('#homeNews [data-news-open]').forEach(b=>b.onclick=()=>openArticle(+b.dataset.newsOpen));$$('#homeNews [data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view))}
 const navEl=$('.nav');
 if(navEl){navEl.innerHTML=nav();$$('.nav [data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view))}
}
fetchList();
setInterval(()=>{if(!document.hidden)fetchList()},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)fetchList()});
window.BuddyNews={refresh:fetchList,open:openArticle};
render();
})();
