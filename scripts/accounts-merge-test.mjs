import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../assets/js/user-storage.js',import.meta.url),'utf8');
const disk=new Map();
function device(events=new EventTarget()){
 const window=Object.assign(new EventTarget(),{BB_QUIZ_INDEX:[{storageKey:'bb.quiz.test.v1',version:1}],localStorage:{get length(){return disk.size;},key:i=>[...disk.keys()][i],getItem:k=>disk.get(k)??null,setItem:(k,v)=>disk.set(k,v),removeItem:k=>disk.delete(k)}});
 vm.runInNewContext(source,{window,document:events,CustomEvent});window.BBUserStorage.activate('owner');return window.BBUserStorage;
}
const plain=v=>JSON.parse(JSON.stringify(v));
let s=device();
const key='bb.quiz.test.v1', base={version:1,questions:{q1:{selected:['A'],verified:true},q2:{selected:['B'],verified:true}}};
s.hydrate({[key]:base});
s.set(key,{...base,questions:{...base.questions,q1:{selected:['C'],verified:false}}});
s=device(); // merge base must survive offline reload
s.hydrate({[key]:{...base,questions:{...base.questions,q2:{selected:['D'],verified:false}}}});
assert.deepEqual(plain(s.get(key).questions),{q1:{selected:['C'],verified:false},q2:{selected:['D'],verified:false}},'Distinct offline questions merge instead of overwriting cloud progress');
console.log('PASS durable three-way question merge');

// Shared-disk tabs can have stale UI snapshots before storage events arrive.
const a=device(),b=device(),before={version:1,lessons:{},lastVisited:null};
a.hydrate({'bb.study.v1':before});
a.set('bb.study.v1',{...before,lessons:{1:{completedSections:['first']}}});
b.set('bb.study.v1',{...before,lessons:{3:{completedSections:['second']}}});
assert.ok(b.snapshot().backups.some(x=>x.reason==='concurrent-tab-before-write'&&x.value.lessons?.['1']?.completedSections.includes('first')),'Displaced pending branch remains exportable even before cross-tab invalidation');
assert.deepEqual(plain(b.get('bb.study.v1').lessons),{3:{completedSections:['second']}});
console.log('PASS stale same-device tab: displaced unsynced branch retained for export');

const changes=new EventTarget(),c=device(changes);
const reset={version:1,questions:{}};
c.set(key,reset);
let invalidations=0;changes.addEventListener('bb:cache-change',()=>{invalidations++;});
c.acceptState(key,reset,c.snapshot().pending[key],reset);
assert.equal(invalidations,0,'Acknowledging an identical reset must not rerun quiz content reconciliation');
c.hydrate({[key]:reset});
assert.equal(invalidations,1,'Full hydration still sends its compatibility invalidation');
console.log('PASS identical CAS acknowledgements stay quiet; hydration still invalidates');
