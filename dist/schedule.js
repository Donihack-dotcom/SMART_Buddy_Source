(function(root){
const subjects={
modern:{kk:'Қазіргі заманғы бағдарламалау тілдері',ru:'Современные языки программирования',en:'Modern programming languages'},
olympiad:{kk:'Программалаудан олимпиадалық есептерді шешу практикумы',ru:'Практикум решения олимпиадных задач по программированию',en:'Competitive programming workshop'},
printing:{kk:'3D модельдеу және принтинг',ru:'3D-моделирование и печать',en:'3D modeling and printing'},
android:{kk:'Android платформасында мобильдік бағдарламалау',ru:'Мобильное программирование на платформе Android',en:'Android mobile programming'},
bigdata:{kk:'Үлкен деректерді өңдеу',ru:'Обработка больших данных',en:'Big data processing'},
integration:{kk:'Жаратылыстану-ғылыми пәндердің интеграциясы',ru:'Интеграция естественно-научных дисциплин',en:'Integration of natural sciences'},
vr:{kk:'Виртуалды және кеңейтілген шындық',ru:'Виртуальная и дополненная реальность',en:'Virtual and augmented reality'},
info:{kk:'Инфографика',ru:'Инфографика',en:'Infographics'}};
const raw=[
[2,'08:00','08:50','modern','lecture','Карелхан Н.','712'],[2,'09:00','09:50','olympiad','lecture','Тлеумагамбетова Д.Ш.','712'],[2,'14:10','15:00','printing','practice','Рахымжанқызы А.','№93'],[2,'15:10','16:00','printing','practice','Рахымжанқызы А.','№93'],
[3,'10:00','10:50','olympiad','practice','Тлеумагамбетова Д.Ш.','407'],[3,'11:10','12:00','olympiad','practice','Тлеумагамбетова Д.Ш.','407'],[3,'12:10','13:00','android','lecture','Омарбеков Е.Е.','710'],[3,'13:10','14:00','bigdata','lecture','Нурбекова Г.Ф.','222'],[3,'14:10','15:00','integration','practice','Балабеков К.Н.','410'],[3,'15:10','16:00','integration','practice','Балабеков К.Н.','410'],[3,'19:10','20:00','printing','lecture','Зулпыхар Ж.Е.','online'],
[4,'10:00','10:50','vr','lecture','Копеев Ж.Б.','710'],[4,'11:10','12:00','integration','lecture','Балабеков К.Н.','710'],[4,'12:10','13:00','modern','lab','Карелхан Н.','405'],[4,'13:10','14:00','modern','lab','Карелхан Н.','405'],[4,'14:10','15:00','bigdata','lab','Есболова А.Ө.','616'],[4,'15:10','16:00','bigdata','lab','Есболова А.Ө.','616'],[4,'18:10','19:00','info','lecture','Альжанов А.К.','online'],[4,'19:10','20:00','info','practice','Альжанов А.К.','online'],[4,'20:10','21:00','info','practice','Альжанов А.К.','online'],
[5,'14:10','15:00','vr','practice','Есболова А.Ө.','414'],[5,'15:10','16:00','vr','practice','Есболова А.Ө.','414'],[5,'16:10','17:00','android','practice','Муканова Т.Т.','407'],[5,'17:10','18:00','android','practice','Муканова Т.Т.','407']];
// Демо кесте (әдепкі). Пайдаланушы өз кестесін құрса, setSchedule() subjects пен weekly-ді орнында ауыстырады.
const demoSubjects=JSON.parse(JSON.stringify(subjects));
const demoWeekly=raw.map((r,id)=>({id,day:r[0],start:r[1],end:r[2],subject:r[3],type:r[4],teacher:r[5],room:r[6]}));
const DEMO_SEMESTER={start:'2026-09-01',end:'2026-12-12'};
const weekly=demoWeekly.map(l=>({...l}));
let semester={...DEMO_SEMESTER},custom=false;
const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||''),validTime=s=>/^([01]\d|2[0-3]):[0-5]\d$/.test(s||'');
// data: {semester:{start,end}, subjects:[{id,name,color}], lessons:[{id,day,start,end,subject,type,teacher,building,room,online}]}; null — демо кестеге қайту.
function setSchedule(data){
 Object.keys(subjects).forEach(k=>delete subjects[k]);weekly.length=0;
 if(!data||!Array.isArray(data.subjects)||!Array.isArray(data.lessons)){
  Object.assign(subjects,JSON.parse(JSON.stringify(demoSubjects)));demoWeekly.forEach(l=>weekly.push({...l}));semester={...DEMO_SEMESTER};custom=false;return;
 }
 custom=true;
 semester={start:validDate(data.semester&&data.semester.start)?data.semester.start:DEMO_SEMESTER.start,end:validDate(data.semester&&data.semester.end)?data.semester.end:DEMO_SEMESTER.end};
 data.subjects.forEach(s=>{if(s&&s.id&&s.name)subjects[s.id]={kk:s.name,ru:s.name,en:s.name,name:s.name,color:s.color||''}});
 data.lessons.forEach(l=>{if(l&&subjects[l.subject]&&l.day>=0&&l.day<=6&&validTime(l.start)&&validTime(l.end)&&l.start<l.end)
  weekly.push({id:l.id,day:Number(l.day),start:l.start,end:l.end,subject:l.subject,type:l.type||'lecture',teacher:l.teacher||'',building:l.online?'':(l.building||''),room:l.online?'online':(l.room||''),online:!!l.online})});
}
function localDate(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Almaty',year:'numeric',month:'2-digit',day:'2-digit'}).format(now)}
function shift(date,n){let d=new Date(date+'T12:00:00+05:00');d.setUTCDate(d.getUTCDate()+n);return localDate(d)}
function events(date,repeat=true){if(date<semester.start||date>semester.end||(!custom&&!repeat&&(date<'2026-11-02'||date>'2026-11-08')))return [];let day=new Date(date+'T12:00:00+05:00').getUTCDay();return weekly.filter(l=>l.day===day).sort((a,b)=>a.start.localeCompare(b.start)).map(l=>({...l,date,starts:new Date(date+'T'+l.start+':00+05:00'),ends:new Date(date+'T'+l.end+':00+05:00')}))}
function state(now=new Date(),repeat=true){let date=localDate(now),today=events(date,repeat),current=today.find(l=>now>=l.starts&&now<l.ends),next=null;for(let i=0;i<100&&!next;i++)next=events(shift(date,i),repeat).find(l=>l.starts>now)||null;return {now,date,today,current,next,remaining:current?Math.max(0,Math.ceil((current.ends-now)/60000)):null,wait:next?Math.max(0,Math.ceil((next.starts-now)/60000)):null}}
const api={subjects,weekly,events,state,shift,localDate,setSchedule,semester:()=>({...semester}),isCustom:()=>custom,demo:()=>({subjects:JSON.parse(JSON.stringify(demoSubjects)),weekly:demoWeekly.map(l=>({...l}))})};
// Браузерде пайдаланушының сақталған кестесін бірден қолданамыз (boot.js оны серверден localStorage-ке жазады).
if(typeof window!=='undefined'&&root===window){try{const saved=JSON.parse(window.localStorage.getItem('buddy_schedule'));if(saved)setSchedule(saved)}catch{}}
if(typeof module!=='undefined')module.exports=api;root.BuddySchedule=api;
})(typeof window!=='undefined'?window:globalThis);
