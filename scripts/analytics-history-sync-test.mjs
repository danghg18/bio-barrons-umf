import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const source=await readFile(new URL('../assets/js/quiz-analytics.js',import.meta.url),'utf8');
const userStorage=await readFile(new URL('../assets/js/user-storage.js',import.meta.url),'utf8');
const personal=await readFile(new URL('../assets/js/personal-records.js',import.meta.url),'utf8');
const helper=await readFile(new URL('../assets/js/analytics-sync.js',import.meta.url),'utf8');
const quiz={chapterNum:1,name:'Test',url:'quiz.html',storageKey:'quiz.sync',version:1,ranges:[{id:'all',start:1,end:2}],questions:[1,2].map(n=>({id:'q'+n,number:n,rangeId:'all',correct:['A']}))};
const server=http.createServer((req,res)=>res.end('<!doctype html><title>History sync</title>'));
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch();
const url=`http://127.0.0.1:${server.address().port}`;
async function load(page, storage=true) {
 await page.goto(url);await page.evaluate(q=>window.BB_QUIZ_INDEX=[q],quiz);await page.addScriptTag({content:helper});
 if(storage) await page.evaluate(()=>{
  let owner='guest';
  const values=()=>JSON.parse(localStorage.getItem('test-vault:'+owner)||'{}');
  window.BBUserStorage={owner:()=>owner,get:key=>values()[key]||null,entries:prefix=>Object.entries(values()).filter(([key])=>key.startsWith(prefix)),
   set(key,value){const all=values();all[key]=value;localStorage.setItem('test-vault:'+owner,JSON.stringify(all));return true;},
   activate(id){owner=id;document.dispatchEvent(new CustomEvent('bb:cache-owner-change'));},
   hydrate(records){for(const [key,value] of Object.entries(records)){const old=this.get(key);this.set(key,BBAnalyticsSync.merge(key,old,value));}document.dispatchEvent(new CustomEvent('bb:cache-change'));},
   canClaimGuestRecords:()=>false};
 });
 await page.addScriptTag({content:source});await page.evaluate(()=>BBQuizAnalytics.ready);
}
const record=(page,id,q='q1',runId)=>page.evaluate(input=>BBQuizAnalytics.recordAttempt(input),{attemptId:id,storageKey:'quiz.sync',questionId:q,selected:['A'],correct:true,runId,answerKey:['A']});
const rows=page=>page.evaluate(()=>Object.fromEntries(BBUserStorage.entries('bb.analytics')));
const report=page=>page.evaluate(()=>BBQuizAnalytics.getReport({days:'all'}));
try {
 const ca=await browser.newContext(),cb=await browser.newContext();const a=await ca.newPage(),b=await cb.newPage();
 await load(a,false);await record(a,'legacy-real');const original=(await report(a)).history[0];
 await load(a);
 assert.ok((await rows(a))['bb.analytics.v1:attempt:legacy-real'],'Existing real IndexedDB rows migrate into owner storage');
 assert.equal((await rows(a))['bb.analytics.v1:attempt:legacy-real'].at,original.at,'Migration preserves real timestamps');
 await load(a);assert.equal((await report(a)).history.length,1,'Migration is idempotent');
 await load(b);await b.evaluate(data=>BBUserStorage.hydrate(data),await rows(a));
 assert.equal((await report(b)).history.length,1,'Another device projects detailed attempts');
 const run=await a.evaluate(()=>BBQuizAnalytics.ensureRun('quiz.sync'));
 await b.evaluate(data=>BBUserStorage.hydrate(data),await rows(a));
 await record(a,'offline-a','q1',run.id);await record(b,'offline-b','q2',run.id);
 const ar=await rows(a),br=await rows(b);
 await a.evaluate(data=>BBUserStorage.hydrate(data),br);await b.evaluate(data=>BBUserStorage.hydrate(data),ar);
 assert.equal((await report(a)).runs.find(r=>r.id===run.id).verified,2,'Reconnect preserves both devices answers');
 assert.equal((await report(b)).history.length,3,'Real attempts union without duplicates');
 await a.evaluate(()=>BBQuizAnalytics.clearHistory(999));
 assert.equal((await report(a)).history.length,3,'Unknown chapter clear cannot erase unrelated history');
 await a.evaluate(()=>BBQuizAnalytics.clearHistory(1));
 await record(b,'unseen-before-clear','q1');
 await b.evaluate(data=>BBUserStorage.hydrate(data),await rows(a));
 assert.equal((await report(b)).history.length,0,'Clear barrier suppresses unseen stale offline history');
 await record(b,'after-clear','q2');assert.equal((await report(b)).history.length,1,'Fresh attempts survive after clearing');
 const correctedRun=await b.evaluate(async()=>{
  const run=await BBQuizAnalytics.ensureRun('quiz.sync');
  await BBQuizAnalytics.recordAttempt({attemptId:'initial-wrong',storageKey:'quiz.sync',questionId:'q1',runId:run.id,selected:['B'],correct:false,answerKey:['A']});
  await BBQuizAnalytics.recordAttempt({attemptId:'initial-right',storageKey:'quiz.sync',questionId:'q2',runId:run.id,selected:['A'],correct:true,answerKey:['A']});
  const round=await BBQuizAnalytics.ensurePractice('quiz.sync');
  await BBQuizAnalytics.recordAttempt({attemptId:'corrected-real',storageKey:'quiz.sync',questionId:'q1',runId:round.id,selected:['A'],correct:true,answerKey:['A']});
  return run.id;
 });
 await a.evaluate(data=>BBUserStorage.hydrate(data),await rows(b));
 const mirroredCorrection=(await report(a)).runs.find(run=>run.id===correctedRun);
 assert.equal(mirroredCorrection.correct,1,'Correction sync preserves the original score');
 assert.equal(mirroredCorrection.correction.corrected,1,'The actual correction round synchronizes with its parent');
 assert.equal(mirroredCorrection.correction.roundCount,1);
 await b.evaluate(()=>BBUserStorage.activate('second-account'));await b.evaluate(()=>BBQuizAnalytics.ready);
 assert.equal((await report(b)).history.length,0,'Account switch never shares prior history');
 // Real owner vault integration, including a guest database from an older release.
 const cc=await browser.newContext();const c=await cc.newPage();
 await load(c,false);await record(c,'old-guest');
 await c.goto(url);await c.evaluate(q=>window.BB_QUIZ_INDEX=[q],quiz);
 await c.addScriptTag({content:helper});await c.addScriptTag({content:personal});await c.addScriptTag({content:userStorage});
 await c.evaluate(()=>BBUserStorage.activate('account-a'));
 await c.addScriptTag({content:source});await c.evaluate(()=>BBQuizAnalytics.ready);
 assert.equal((await report(c)).history.length,1,'Authorized first account claims genuine legacy guest IndexedDB rows');
 assert.ok((await c.evaluate(()=>BBUserStorage.snapshot())).pending['bb.analytics.v1:attempt:old-guest'],'Migrated guest history enters durable sync outbox');
 await c.evaluate(()=>BBUserStorage.activate('account-b'));await c.evaluate(()=>BBQuizAnalytics.ready);
 assert.equal((await report(c)).history.length,0,'A second real account cannot reclaim guest history');
 await c.evaluate(()=>BBUserStorage.activate('account-a'));await c.evaluate(()=>BBQuizAnalytics.ready);
 assert.equal((await report(c)).history.length,1,'Revisiting the claiming account does not duplicate migration');
 await cc.close();await ca.close();await cb.close();
 console.log('Analytics migration, two-device offline merge, deletion barriers and owner isolation passed.');
} finally {await browser.close();server.close();}
