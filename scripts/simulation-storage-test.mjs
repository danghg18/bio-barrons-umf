import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const disk=new Map(), document=new EventTarget(), window=new EventTarget();
Object.assign(window,{localStorage:{getItem:k=>disk.get(k)??null,setItem:(k,v)=>disk.set(k,v),removeItem:k=>disk.delete(k),key:i=>[...disk.keys()][i],get length(){return disk.size;}}});
const context={window,document,CustomEvent,Date,JSON,Map,Set,navigator:{locks:{request:async(_,fn)=>fn()}},crypto:globalThis.crypto};
for(const file of ['user-storage','simulation-core','simulation-store']){
 try{vm.runInNewContext(await readFile(new URL(`../assets/js/${file}.js`,import.meta.url),'utf8'),context);}catch(e){if(e.code!=='ENOENT')throw e;}
}
const storage=window.BBUserStorage, store=window.BBSimulationStore, core=window.BBSimulationCore;
assert.ok(store,'Simulation persistence API exists');
const bank={chapterNum:1,questions:Array.from({length:35},(_,i)=>({id:String(i),correct:['A','B'],options:[...'ABCDE'].map(letter=>({letter,text:letter})),prompt:'Test'}))};
const make=()=>core.create([bank],core.allocate([bank]),0,Date.now(),crypto.randomUUID());
let run=await store.create(make(),'guest');
assert.equal(store.list().length,1);
const guestId=run.id;
run=await store.update(run.id,run.revision,'guest',{type:'answer',index:0,selected:['A']});
await assert.rejects(store.update(run.id,0,'guest',{type:'answer',index:1,selected:['B']}),/altă filă/);
assert.equal(store.get(run.id).answers[1].length,0);
run=await store.update(run.id,run.revision,'guest',{type:'finish'});assert.equal(run.result.points,.5);
const frozen=JSON.stringify(run);
await assert.rejects(store.update(run.id,run.revision,'guest',{type:'answer',index:0,selected:['A','B']}),/predat/);
assert.equal(JSON.stringify(store.get(run.id)),frozen);
storage.activate('alice');assert.equal(store.list().length,0);assert.equal(store.get(guestId),null);
let own=await store.create(make(),'alice');storage.hydrate({});
assert.equal(Object.keys(storage.snapshot().pending).filter(k=>k.startsWith('bb.simulation.')).length,0,'Local tests must not become cloud outbox rows after hydration');
storage.hydrate({['bb.simulation.v1:'+own.id]:{version:99}});assert.equal(store.get(own.id).version,1,'Cloud cannot overwrite local simulations');
storage.activate('bob');await assert.rejects(store.update(own.id,0,'alice',{type:'finish'}),/contul/);
storage.activate('guest');assert.equal(store.list().length,1);
let timed=make();timed.deadline=Date.now()-1000;timed=await store.create(timed,'guest');
timed=await store.update(timed.id,timed.revision,'guest',{type:'answer',index:0,selected:['A','B']});
assert.equal(timed.status,'completed');assert.equal(timed.result.points,0);assert.equal(timed.completedAt,timed.deadline);
console.log('Simulation storage: owner isolation, local-only hydration, stale writes, immutable submission and expired deadline passed.');
