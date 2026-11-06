const test=require('node:test'),assert=require('node:assert/strict');
const P=require('../dist/planner.js'),S=require('../dist/schedule.js');
const now=new Date('2026-11-04T12:00:00+05:00');
function task(date,time='12:00',extra={}){return {id:1,title:'Task',date,time,done:false,...extra}}
test('deadline bands respect exact rolling time and completion',()=>{
 assert.equal(P.urgency(task('2026-11-04','12:00'),now),'overdue');
 assert.equal(P.urgency(task('2026-11-04','12:01'),now),'red');
 assert.equal(P.urgency(task('2026-11-07'),now),'red');
 assert.equal(P.urgency(task('2026-11-07','12:01'),now),'yellow');
 assert.equal(P.urgency(task('2026-11-10'),now),'yellow');
 assert.equal(P.urgency(task('2026-11-10','12:01'),now),'green');
 assert.equal(P.urgency(task('2026-11-11'),now),'green');
 assert.equal(P.urgency(task('2026-11-01','12:00',{done:true}),now),'done');
});
test('old tasks default to 23:59 in Astana timezone',()=>{
 assert.equal(P.dueDate({date:'2026-11-04'}).toISOString(),'2026-11-04T18:59:00.000Z');
});
test('only urgent unfinished tasks alert, with persistent dismiss and categories',()=>{
 const red=task('2026-11-05'),overdue=task('2026-11-03','12:00',{id:2}),yellow=task('2026-11-09','12:00',{id:3}),done=task('2026-11-04','12:00',{id:4,done:true});
 const list=[red,overdue,yellow,done];
 assert.deepEqual(P.deadlineAlerts(list,{deadlines:true},{},now).map(a=>a.task.id),[2,1]);
 assert.equal(P.deadlineAlerts(list,{deadlines:false},{},now).length,0);
 const dismissed={[P.deadlineKey(red)]:true};
 assert.deepEqual(P.deadlineAlerts(list,{deadlines:true},dismissed,now).map(a=>a.task.id),[2]);
 assert.equal(P.deadlineAlerts([{...red,time:'13:00'}],{deadlines:true},dismissed,now).length,1);
});
test('class alert switches exactly at the end and across midnight',()=>{
 const prefs={classes:true};
 let a=P.classAlert(S,prefs,{},new Date('2026-11-04T10:49:00+05:00'));assert.equal(a.current,true);assert.equal(a.minutes,1);
 a=P.classAlert(S,prefs,{},new Date('2026-11-04T10:50:00+05:00'));assert.equal(a.current,false);assert.equal(a.lesson.start,'11:10');assert.equal(a.minutes,20);
 a=P.classAlert(S,prefs,{},new Date('2026-11-04T20:30:00+05:00'));assert.equal(a.lesson.date,'2026-11-05');assert.equal(a.lesson.start,'10:00');
 const hidden={[a.key]:true};assert.equal(P.classAlert(S,prefs,hidden,new Date('2026-11-04T20:30:00+05:00')),null);
 assert.ok(P.classAlert(S,prefs,hidden,new Date('2026-11-05T10:50:00+05:00')));
 assert.equal(P.classAlert(S,{classes:false},{},now),null);
});
test('semester end and disabled weekly repetition suppress nonexistent classes',()=>{
 assert.equal(P.classAlert(S,{classes:true},{},new Date('2026-12-13T10:00:00+05:00')),null);
 assert.equal(P.classAlert(S,{classes:true},{},new Date('2026-11-09T10:00:00+05:00'),false),null);
});
test('tasks are sorted by due datetime, with completed tasks last',()=>{
 const tasks=[task('2026-11-05','12:00',{id:1}),task('2026-11-05','10:00',{id:2}),task('2026-11-01','12:00',{id:3,done:true})];
 assert.deepEqual(P.sortTasks(tasks).map(t=>t.id),[2,1,3]);
 assert.equal(tasks[0].id,1);
});
