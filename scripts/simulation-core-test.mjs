import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const context={window:{}};
try {vm.runInNewContext(await readFile(new URL('../assets/js/simulation-core.js',import.meta.url),'utf8'),context);} catch(e) {if(e.code!=='ENOENT')throw e;}
const core=context.window.BBSimulationCore;
assert.ok(core,'Simulation scoring and sampling engine exists');
const letters='ABCDE';
const set=mask=>[...letters].filter((_,i)=>mask&(1<<i));
// Independent table by answer-key size and number of mismatched boxes.
const table={1:[1,0,0,0,0,0],2:[1,.5,0,0,0,0],3:[1,.5,.25,0,0,0],4:[1,.5,.25,0,0,0]};
for(let key=1;key<31;key++)for(let selection=0;selection<32;selection++){
 const correct=set(key), selected=set(selection), errors=set(key^selection).length;
 assert.equal(core.scoreQuestion(correct,selected),selection?table[correct.length][errors]:0,`key ${key} selected ${selection}`);
}
assert.equal(core.scoreQuestion(['A','B'],['A','A']),.5);
const rng=()=>.41;
const chapters=[1,3,11,12,13,19,20,22,23].map(chapterNum=>({chapterNum,version:7,questions:Array.from({length:42},(_,i)=>({id:`${chapterNum}-${i}`,number:i+1,prompt:'Întrebare',correct:['A','C'],options:[...letters].map(letter=>({letter,text:letter}))}))}));
for(const count of [1,2,3,9]){
 const banks=chapters.slice(0,count); const allocation=core.allocate(banks,rng);
 assert.equal(allocation.reduce((s,x)=>s+x.count,0),35);
 assert.ok(Math.max(...allocation.map(x=>x.count))-Math.min(...allocation.map(x=>x.count))<=1);
 const run=core.create(banks,allocation,60,1000,'test',rng);
 assert.equal(run.questions.length,35);assert.equal(new Set(run.questions.map(q=>q.sourceKey+':'+q.id)).size,35);
 assert.equal(run.questions[0].sourceVersion,7,'Question snapshots preserve dataset version');
 assert.equal(run.deadline,3601000);assert.equal(run.status,'active');
 for(const a of allocation)assert.equal(run.questions.filter(q=>q.chapterNum===a.chapterNum).length,a.count);
 assert.equal(core.result(run).grade,0);
 run.answers=run.questions.map(q=>q.correct);assert.equal(core.result(run).grade,10);
 run.answers=run.questions.map(()=>['A']);assert.equal(core.result(run).grade,5);
}
assert.throws(()=>core.allocate([]));
assert.throws(()=>core.allocate([{chapterNum:1,questions:chapters[0].questions.slice(0,34)}]));
const small=core.allocate([{chapterNum:1,questions:[{}]},chapters[1]],rng);assert.equal(small[0].count,1);assert.equal(small[1].count,34);
const run=core.create(chapters.slice(0,1),core.allocate(chapters.slice(0,1)),0,1000,'untimed');assert.equal(run.deadline,null);
run.answers[0]=['A','C'];assert.equal(core.result(run).grade,10/35);
console.log('Simulation: all 960 answer combinations, partial scoring, sampling, allocation, immutable source copies and grades passed.');
