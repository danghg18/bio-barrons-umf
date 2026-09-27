import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';

const root=resolve(import.meta.dirname,'..');
const read=async path=>JSON.parse(await readFile(resolve(root,path),'utf8'));
const decisions=await read('data/umf-2026-semantic-revisions.json');
const audits=await read('data/umf-2026-editorial-audit.json');
const sets=await read('data/quiz-source-map.json');
const normalize=s=>s.normalize('NFC').replaceAll('ş','ș').replaceAll('ţ','ț').replaceAll('Ş','Ș').replaceAll('Ţ','Ț').replace(/\s+/g,' ').trim();
const hash=q=>createHash('sha256').update(JSON.stringify([normalize(q.prompt),...q.options.map(o=>normalize(o.text))])).digest('hex');
const identity=row=>row.storageKey+'/'+row.id;
assert.equal(new Set(decisions.map(identity)).size,decisions.length,'One semantic decision per stable question');
const changed=audits.filter(a=>a.changes.prompt||a.changes.options?.length);
assert.deepEqual(decisions.map(identity).sort(),changed.map(identity).sort(),'Every transcription change receives an explicit semantic review');
const loaded=new Map();
for(const decision of decisions){
 assert.equal(typeof decision.requiresReverification,'boolean');
 assert.ok(decision.reason.trim().length>15,'Review rationale is required');
 assert.match(decision.beforeHash,/^[a-f0-9]{64}$/);
 assert.notEqual(decision.beforeHash,decision.afterHash,'The decision must correspond to changed text');
 if(!loaded.has(decision.storageKey)){
  const set=sets.find(s=>s.storageKey===decision.storageKey);assert.ok(set);
  const context={window:{}};vm.runInNewContext(await readFile(resolve(root,set.dataFile),'utf8'),context);
  loaded.set(decision.storageKey,context.window.BB_QUIZ||context.window.BB_NERVOUS_QUIZ);
 }
 const q=loaded.get(decision.storageKey).questions.find(q=>q.id===decision.id);assert.ok(q);
 assert.equal(q.sourceChapter,decision.sourceChapter);assert.equal(q.sourceNumber,decision.sourceNumber);
 assert.equal(hash(q),decision.afterHash,'Review binds to the exact final prompt and options: '+identity(decision));
 assert.equal(q.contentRevision||0,decision.requiresReverification?1:0,'Only a meaning change asks the student to reverify: '+identity(decision));
}
console.log(`${decisions.length} explicit transcription decisions; ${decisions.filter(d=>d.requiresReverification).length} meaning changes require reverification.`);
