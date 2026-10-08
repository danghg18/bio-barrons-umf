import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {PGlite} from '@electric-sql/pglite';
const db=new PGlite(), owner='00000000-0000-4000-8000-000000000001',other='00000000-0000-4000-8000-000000000002';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const sources=await Promise.all(['user-storage','cloud-sync'].map(n=>read('assets/js/'+n+'.js')));
const plain=v=>JSON.parse(JSON.stringify(v));
const study='bb.study.v1',quiz='bb.quiz.test.v1',note='note:1:home';
await db.exec(`create role anon nologin; create role authenticated nologin; create schema auth; create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
await db.exec(await read('supabase/migrations/20260911160700_accounts_sync.sql'));
await db.exec(await read('supabase/pending/account-state-cas.sql'));
await db.query('insert into auth.users values ($1),($2)',[owner,other]);
await db.query("select set_config('request.jwt.claim.sub',$1,false)",[owner]);await db.exec('set role authenticated');
const rpc=async(key,payload,expected,id=owner)=>(await db.query('select public.bb_put_account_state($1,$2,$3::jsonb,$4) as result',[id,key,JSON.stringify(payload),expected])).rows[0].result;
const initialStudy={version:1,lessons:{1:{completedSections:['base']}},lastVisited:null};
const initialQuiz={version:1,questions:{a:{selected:['A'],verified:true},b:{selected:['B'],verified:true}}};
const initialNote={chapter_num:1,section_id:'home',body:'Original'};
try {
 for(const [key,payload] of [[study,initialStudy],[quiz,initialQuiz],[note,initialNote]])assert.equal((await rpc(key,payload,0)).accepted,true);
 const calls=[];
 function device(disk=new Map()){
  const timers=new Map();let timer=0,hold=null;
  const document=new EventTarget();
  const window=Object.assign(new EventTarget(),{BB_QUIZ_INDEX:[{storageKey:quiz,version:1}],localStorage:{get length(){return disk.size;},key:i=>[...disk.keys()][i],getItem:k=>disk.get(k)??null,setItem:(k,v)=>disk.set(k,v),removeItem:k=>disk.delete(k)}});
  const client={from:table=>({select:()=>({eq:async(column,id)=>({data:(await db.query(`select * from public.${table} where user_id = $1`,[id])).rows})})}),rpc:async(name,args)=>{
   assert.equal(name,'bb_put_account_state');calls.push(args);
   if(hold){const pause=hold;hold=null;await pause;}
   try{return {data:await rpc(args.p_key,args.p_payload,args.p_expected,args.p_owner)};}catch(error){console.error(error.message);return {error};}
  }};
  const navigator={onLine:true};
  const context=vm.createContext({window,document,CustomEvent,navigator,setTimeout:fn=>{timers.set(++timer,fn);return timer;},clearTimeout:id=>timers.delete(id)});
  vm.runInContext(sources[0],context);const store=window.BBUserStorage;store.activate(owner);
  window.BBAuth={ready:Promise.resolve(),getState:()=>({configured:true,user:{id:store.owner()}})};
  window.BBSupabase={get:()=>client};vm.runInContext(sources[1],context);
  async function settle(){for(let i=0;i<300;i++){const jobs=[...timers.values()];timers.clear();jobs.forEach(fn=>fn());await new Promise(resolve=>setTimeout(resolve,2));if(window.BBCloudSync.getState().status==='synced'&&!timers.size)return;}assert.fail('Cloud did not settle: '+JSON.stringify(window.BBCloudSync.getState()));}
  return {store,window,navigator,disk,settle,hold:promise=>{hold=promise;},tick:()=>{const jobs=[...timers.values()];timers.clear();jobs.forEach(fn=>fn());}};
 }
 const a=device(),b=device();await a.settle();await b.settle();
 a.store.set(quiz,{...initialQuiz,questions:{...initialQuiz.questions,a:{selected:['C'],verified:false}}});await a.settle();
 b.store.set(quiz,{...initialQuiz,questions:{...initialQuiz.questions,b:{selected:['D'],verified:false}}});await b.settle();
 assert.deepEqual(plain(b.store.get(quiz).questions),{a:{selected:['C'],verified:false},b:{selected:['D'],verified:false}});
 assert.ok(calls.filter(c=>c.p_key===quiz).length>=3,'Second device actually encounters CAS rejection and retries');
 a.store.set(study,{...initialStudy,lessons:{1:{completedSections:['base','device-a']}}});await a.settle();
 b.store.set(study,{...initialStudy,lessons:{1:{completedSections:['base','device-b']}}});await b.settle();
 assert.deepEqual(new Set(b.store.get(study).lessons[1].completedSections),new Set(['base','device-a','device-b']));
 a.store.set(note,{...a.store.get(note),body:'A note'});await a.settle();
 b.store.set(note,{...b.store.get(note),body:'B note'});await b.settle();
 assert.equal(b.store.get(note).body,'A note');
 assert.ok(b.store.snapshot().backups.some(x=>x.key===note&&x.value.body==='B note'),'Conflicting local note is available in account export');
 assert.equal(b.store.snapshot().pending[note],undefined,'Irreconcilable conflict does not retry forever');
 console.log('PASS real SQL + two devices: question and section merges, rejected stale writes, note conflict export');
 // A reset races a remote answer change: retain the changed remote answer and
 // export the reset branch; unmodified answers are removed by the reset.
 await a.window.BBCloudSync.retry();await b.window.BBCloudSync.retry();
 a.store.set(quiz,{...a.store.get(quiz),questions:{...a.store.get(quiz).questions,a:{selected:['E'],verified:true}}});await a.settle();
 b.store.set(quiz,{version:1,questions:{}});await b.settle();
 assert.deepEqual(plain(b.store.get(quiz).questions),{a:{selected:['E'],verified:true}});
 assert.ok(b.store.snapshot().backups.some(x=>x.key===quiz&&Object.keys(x.value.questions).length===0));
 // Notes edited during an accepted request keep the newer draft, despite server timestamps.
 let release;const gate=new Promise(resolve=>{release=resolve;});b.hold(gate);
 b.store.set(note,{...b.store.get(note),body:'First'});b.tick();await new Promise(resolve=>setTimeout(resolve,5));
 b.store.set(note,{...b.store.get(note),body:'Second'});release();await b.settle();assert.equal(b.store.get(note).body,'Second');
 assert.equal((await db.query('select body from public.notes')).rows[0].body,'Second');
 console.log('PASS real SQL: reset versus answer conflict and note edit during request');
 const offline=device();await offline.settle();offline.navigator.onLine=false;
 offline.store.set(quiz,{...offline.store.get(quiz),questions:{...offline.store.get(quiz).questions,offline:{selected:['B'],verified:false}}});
 b.store.set(quiz,{...b.store.get(quiz),questions:{...b.store.get(quiz).questions,remote:{selected:['C'],verified:true}}});await b.settle();
 const resumed=device(offline.disk);await resumed.settle();
 assert.ok(resumed.store.get(quiz).questions.offline);assert.ok(resumed.store.get(quiz).questions.remote);
 const switching=device();await switching.settle();let finish;
 switching.hold(new Promise(resolve=>{finish=resolve;}));
 switching.store.set(note,{...switching.store.get(note),body:'Account A in flight'});switching.tick();
 await new Promise(resolve=>setTimeout(resolve,5));switching.store.activate(other);finish();
 await new Promise(resolve=>setTimeout(resolve,10));
 assert.equal(switching.store.get(note),null,'Late write response cannot enter the next identity cache');
 assert.equal(switching.store.snapshot().backups.length,0,'Account A conflicts cannot leak to B export');
 console.log('PASS real SQL: offline reload merges durable base and late RPC response is identity fenced');

 const existing=(await db.query('select * from public.notes')).rows[0];
 assert.equal((await rpc(note,{...initialNote,body:'stale'},existing.revision-1)).accepted,false);
 await assert.rejects(rpc(note,initialNote,existing.revision,other),e=>e.code==='42501');
 await assert.rejects(db.query("update public.notes set body='old-client'"),e=>e.code==='40001');
 await assert.rejects(db.query('delete from public.notes'),e=>e.code==='42501');
 await assert.rejects(rpc(note,{...initialNote,section_id:'wrong'},existing.revision),e=>e.code==='22023');
 await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[other]);await db.exec('set role authenticated');
 assert.equal((await db.query('select * from public.notes')).rows.length,0);
 await assert.rejects(rpc(note,initialNote,existing.revision),e=>e.code==='42501');
 await db.exec('reset role; set role anon');await assert.rejects(rpc(note,initialNote,0),e=>e.code==='42501');
 console.log('PASS real SQL: RLS, wrong owner, anonymous denial, key validation, old-client update and delete blocked');
} finally {await db.close();}
