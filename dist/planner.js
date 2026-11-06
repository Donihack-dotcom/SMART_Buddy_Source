(function(root){
const DAY=86400000;
function dueDate(task){return new Date(`${task.date}T${task.time||'23:59'}:00+05:00`)}
function urgency(task,now=new Date()){
 if(task.done)return 'done';
 const remaining=dueDate(task)-now;
 if(!Number.isFinite(remaining))return 'invalid';
 if(remaining<=0)return 'overdue';
 const days=Math.ceil(remaining/DAY);
 return days<=3?'red':days<=6?'yellow':'green';
}
function deadlineKey(task){return `task:${task.id}:${task.date}:${task.time||'23:59'}`}
function deadlineAlerts(tasks,prefs,dismissed,now=new Date()){
 if(!prefs.deadlines)return [];
 return tasks.filter(t=>['red','overdue'].includes(urgency(t,now))&&!dismissed[deadlineKey(t)])
 .sort((a,b)=>dueDate(a)-dueDate(b)).map(task=>({kind:'task',key:deadlineKey(task),task}));
}
function classAlert(schedule,prefs,dismissed,now=new Date(),repeat=true){
 if(!prefs.classes)return null;
 const state=schedule.state(now,repeat),lesson=state.current||state.next;
 if(!lesson)return null;
 const key=`class:${lesson.date}:${lesson.id}`;
 if(dismissed[key])return null;
 return {kind:'class',key,lesson,current:!!state.current,minutes:state.current?state.remaining:state.wait};
}
function sortTasks(tasks,now=new Date()){
 return [...tasks].sort((a,b)=>Number(a.done)-Number(b.done)||dueDate(a)-dueDate(b));
}
function makeId(prefix='id'){return prefix+'-'+(typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2))}
const api={dueDate,urgency,deadlineKey,deadlineAlerts,classAlert,sortTasks,makeId};if(typeof module!=='undefined')module.exports=api;root.BuddyPlanner=api;
})(typeof window!=='undefined'?window:globalThis);
