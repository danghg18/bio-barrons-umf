import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

// Real owner storage, merge helpers and cloud coordinator; only network, clocks
// and browser storage are simulated. The RPC double implements server CAS and
// the migration's immutable-attempt guard, not an unconditional successful write.
const files=['analytics-sync','personal-records','user-storage','cloud-sync'];
const sources=await Promise.all(files.map(file=>readFile(new URL('../assets/js/'+file+'.js',import.meta.url),'utf8')));
const copy=value=>JSON.parse(JSON.stringify(value));
const owner='personal-race-owner';
function deferred(){let resolve;const promise=new Promise(done=>{resolve=done;});return {promise,resolve};}
function fixture({remote={},local={},delayRead=false,useLocks=false}={}){
 const disk=new Map(),timers=new Map(),rows=new Map(),requests=[];
 let timerId=0,reads=0,readStarted=false;
 const gate=deferred();
 for(const [key,payload] of Object.entries(remote))rows.set(key,{user_id:owner,record_key:key,payload:copy(payload),revision:1});
 const document=new EventTarget();document.visibilityState='visible';
 const window=Object.assign(new EventTarget(),{BB_QUIZ_INDEX:[],localStorage:{
  get length(){return disk.size;},key:i=>[...disk.keys()][i]??null,
  getItem:k=>disk.get(k)??null,setItem:(k,v)=>disk.set(k,v),removeItem:k=>disk.delete(k)
 }});
 const client={
  from(table) {
   return {select() {
    return {eq(column,id) {
     assert.equal(column,'user_id'); assert.equal(id,owner);
     if(table!=='personal_records')return Promise.resolve({data:[],error:null});
     return {order(field) {
      assert.equal(field,'record_key');
      return {async range(first,last) {
       const snapshot=[...rows.values()].sort((a,b)=>a.record_key.localeCompare(b.record_key)).slice(first,last+1).map(copy);
       reads++;if(delayRead&&reads===1){readStarted=true;await gate.promise;}
       return {data:snapshot,error:null};
      }};
     }};
    }};
   }};
  },
  async rpc(name,{p_owner,p_key,p_payload,p_expected}){
   assert.equal(name,'bb_put_personal_record');assert.equal(p_owner,owner);requests.push(p_key);
   const old=rows.get(p_key);
   if(old&&old.revision!==p_expected)return {data:{accepted:false,record:copy(old)},error:null};
   assert.ok(old||p_expected===0);
   const immutable=old&&(old.payload.deleted||p_key.startsWith('bb.analytics.v1:attempt:'));
   const row={user_id:owner,record_key:p_key,payload:copy(immutable?old.payload:p_payload),revision:(old?.revision||0)+1};
   rows.set(p_key,row);return {data:{accepted:true,record:copy(row)},error:null};
  }
 };
 const context=vm.createContext({window,document,CustomEvent,navigator:{onLine:true,...(useLocks?{locks:{request:(_name,fn)=>fn()}}:{})},
  setTimeout:fn=>{const id=++timerId;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id)});
 for(const source of sources.slice(0,3))vm.runInContext(source,context);
 window.BBUserStorage.activate(owner);
 for(const [key,value] of Object.entries(local))window.BBUserStorage.set(key,value);
 window.BBAuth={ready:Promise.resolve(),getState:()=>({user:{id:owner},configured:true})};
 window.BBSupabase={get:()=>client};
 vm.runInContext(sources[3],context);
 async function tick(){const callbacks=[...timers.values()];timers.clear();callbacks.forEach(fn=>fn());await new Promise(done=>setImmediate(done));}
 async function settle(label){for(let i=0;i<30;i++){await tick();if(!timers.size&&['synced','error'].includes(window.BBCloudSync.getState().status))return;}assert.fail(`${label}: did not settle; ${requests.length} RPCs, status=${window.BBCloudSync.getState().status}`);}
 return {window,rows,requests,timers,tick,settle,gate,readStarted:()=>readStarted};
}

for(const useLocks of [false,true]){
 const key='bb.highlight.v1:during-read';
 const f=fixture({delayRead:true,useLocks});
 for(let i=0;i<10&&!f.readStarted();i++)await f.tick();
 assert.ok(f.readStarted(),'Fixture must hold the actual personal SELECT in flight');
 const created={version:1,id:'during-read',color:'yellow',quote:'pasaj real'};
 f.window.BBUserStorage.set(key,created);
 assert.ok(f.window.BBUserStorage.snapshot().pending[key]);
 f.gate.resolve();await f.settle('Personal edit while SELECT is in flight');
 assert.deepEqual(f.rows.get(key)?.payload,created,'A personal edit during SELECT must actually reach the remote store');
 assert.equal(f.window.BBUserStorage.snapshot().pending[key],undefined,'Only the uploaded edit is acknowledged');
 console.log(`PASS personal SELECT race (${useLocks?'Web Locks':'no Web Locks'}): in-flight edit uploaded`);
}
{
 const futureKey='bb.highlight.v1:a-future',supportedKey='bb.highlight.v1:z-supported';
 const future={version:2,id:'a-future',futureData:{untouched:true}};
 const localFuture={version:1,id:'a-future',color:'yellow'};
 const supported={version:1,id:'z-supported',color:'blue'};
 const f=fixture({remote:{[futureKey]:future},local:{[futureKey]:localFuture,[supportedKey]:supported}});
 await f.settle('Unsupported remote record');
 assert.deepEqual(f.rows.get(futureKey).payload,future,'The future row is never overwritten');
 assert.deepEqual(copy(f.window.BBUserStorage.get(futureKey)),localFuture,'Keep the pending compatible local copy for export');
 assert.ok(f.window.BBUserStorage.snapshot().backups.some(item=>item.key===futureKey&&item.value.version===2),'Unknown remote payload is retained for export');
 assert.deepEqual(f.rows.get(supportedKey)?.payload,supported,'A future record must not starve later supported uploads');
 assert.equal(f.window.BBCloudSync.getState().status,'error');
 assert.match(f.window.BBCloudSync.getState().message,/versiune mai nouă/);
 const sent=f.requests.length;for(let i=0;i<5;i++)await f.tick();
 assert.equal(f.requests.length,sent,'Unsupported records must not cause a busy retry loop');
 assert.equal(f.timers.size,0);
 console.log('PASS personal future version: remote/local retained, supported uploads proceed, visible error without busy retry');
}
{
 const key='bb.analytics.v1:attempt:existing';
 const original={version:1,id:'existing',at:'2026-09-01T10:00:00Z',correct:true,selected:['B'],answerKey:['B']};
 // Earlier lexical value deliberately exposes local-minimum merging against
 // a server record that the SQL trigger correctly keeps immutable.
 const divergent={...original,at:'2026-08-01T10:00:00Z',correct:false,selected:['A']};
 const f=fixture({remote:{[key]:original},local:{[key]:divergent}});
 await f.settle('Divergent same-ID immutable attempt');
 assert.deepEqual(f.rows.get(key).payload,original,'The original remote attempt remains immutable');
 assert.deepEqual(copy(f.window.BBUserStorage.get(key)),original,'Local projection must converge to the acknowledged immutable original');
 assert.ok(f.window.BBUserStorage.snapshot().backups.some(item=>item.key===key&&JSON.stringify(item.value)===JSON.stringify(divergent)),'Retain divergent local evidence for export');
 assert.equal(f.window.BBUserStorage.snapshot().pending[key],undefined);
 assert.ok(f.requests.length<=2,'The same immutable rejection must not produce unbounded RPCs');
 console.log('PASS personal immutable attempt: original preserved, local conflict exportable, synchronization converges');
}
{
 const key='bb.highlight.v1:future-local',supported='bb.highlight.v1:other';
 const future={version:2,id:'future-local',zzzFutureData:true};
 const f=fixture({remote:{[key]:{version:1,id:'future-local'}},local:{[key]:future,[supported]:{version:1,id:'other'}}});
 await f.settle('Unsupported local version');
 assert.deepEqual(copy(f.window.BBUserStorage.get(key)),future,'Older client cannot replace future local data');
 assert.equal(f.rows.get(supported)?.payload.id,'other');
 assert.ok(!f.requests.includes(key));
 assert.equal(f.window.BBCloudSync.getState().status,'error');
 console.log('PASS unsupported local version retained without blocking compatible records');
}
