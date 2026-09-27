import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const index={window:{}};
vm.runInNewContext(await readFile(new URL('assets/js/quiz-index.js',root),'utf8'),index);
const entries=index.window.BB_QUIZ_INDEX;
const uiSource=await readFile(new URL('assets/js/simulation-ui.js',root),'utf8');
const coreSource=await readFile(new URL('assets/js/simulation-core.js',root),'utf8');

function runtime(protocol,missing=false){
 const scripts=[],requests=[];let context;
 const window={location:{protocol},BB_QUIZ_INDEX:entries,BBSimulationStore:{create:async(run,owner)=>({...run,owner})}};
 const document={createElement:()=>({remove(){this.removed=true;}}),head:{append(script){
  scripts.push(script);
  queueMicrotask(async()=>{
   try{if(missing)throw Error('Missing file');vm.runInContext(await readFile(new URL(script.src,root),'utf8'),context);}
   catch{script.onerror();return;}
   script.onload();
  });
 }}};
 context=vm.createContext({window,document,crypto:{randomUUID:()=> 'loading-test'},fetch:async url=>{
  requests.push(url);
  if(protocol==='file:')throw new TypeError('Failed to fetch');
  return {ok:true,json:async()=>JSON.parse(await readFile(new URL(url,root),'utf8'))};
 }});
 vm.runInContext(coreSource,context);vm.runInContext(uiSource,context);
 return {window,scripts,requests};
}

// Direct-file pages cannot fetch JSON. The same selected banks must load as classic scripts.
const local=runtime('file:');
for(const selected of [[entries[0].chapterNum],entries.map(entry=>entry.chapterNum)]){
 const before=local.scripts.length;
 const run=await local.window.BBSimulationUI.start(selected,0,null,'guest');
 assert.equal(run.questions.length,35);
 assert.equal(local.scripts.length-before,selected.length,'Only selected chapter scripts are loaded');
 assert.ok(run.questions.every(q=>selected.includes(q.chapterNum)));
 assert.ok(local.scripts.every(script=>script.removed),'Loader removes script elements after reading the bank');
}
assert.equal(local.requests.length,0,'Direct-file mode never attempts blocked JSON fetches');
for(const entry of entries){
 const context={window:{BBSimulationUI:{registerBank(bank){this.bank=bank;}}}};
 vm.runInNewContext(await readFile(new URL(entry.bankUrl+'.js',root),'utf8'),context);
 const original=JSON.parse(await readFile(new URL(entry.bankUrl,root),'utf8'));
 assert.deepEqual(JSON.parse(JSON.stringify(context.window.BBSimulationUI.bank)),original,'Local script preserves the complete generated JSON');
}
const missing=runtime('file:',true);
await assert.rejects(()=>missing.window.BBSimulationUI.start([entries[0].chapterNum],0,null,'guest'),/Fișierul cu grile/);
assert.ok(missing.scripts.every(script=>script.removed));
const hosted=runtime('https:');
await hosted.window.BBSimulationUI.start([entries[0].chapterNum],0,null,'guest');
assert.equal(hosted.scripts.length,0,'Hosted pages retain JSON loading');
assert.deepEqual(hosted.requests,[entries[0].bankUrl]);
console.log('Simulation loading: direct-file single/all chapters, exact content, missing-file feedback and hosted JSON passed.');
