import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {loadSiteRegistry,publishedResources} from './site-registry.mjs';
const root=new URL('../',import.meta.url);
const read=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const sandbox={window:{}};
vm.runInNewContext(await readFile(new URL('assets/js/grile-asociative-data.js',root),'utf8'),sandbox);
const quiz=JSON.parse(JSON.stringify(sandbox.window.BB_QUIZ));
const key=(await read('tests/umf-cluj-2026-answer-key.json')).chapters.XIII.answers;
const audit=await read('data/manual-review-asociative.json');
// The supplied textbook stays local; CI checks the persisted audit without
// requiring the private source export. When present, verify it as well.
let manual;
try { manual=await readFile(new URL(audit.source.path,root)); }
catch(error) { if(error.code!=='ENOENT') throw error; }
assert.match(audit.source.sha256,/^[a-f0-9]{64}$/);
if(manual) assert.equal(createHash('sha256').update(manual).digest('hex'),audit.source.sha256);
const lines=manual?.toString('utf8').split('\n');
assert.equal(quiz.storageKey,'bb.quiz.asociative.v1');
assert.equal(quiz.version,1);
assert.equal(quiz.questionCount,400);
assert.equal(quiz.questions.length,400);
assert.equal(quiz.ranges.length,40);
assert.equal(audit.reviewedOptions,2000);
assert.equal(audit.records.length,2000);
const evidence=new Map(audit.records.map(row=>[row.question+'/'+row.option,row]));
assert.equal(evidence.size,2000);
for(const [i,q] of quiz.questions.entries()) {
 assert.equal(q.id,`asoc-${String(i+1).padStart(3,'0')}`);
 assert.equal(q.number,i+1);assert.equal(q.sourceNumber,i+1);assert.equal(q.sourceChapter,'XIII');
 assert.deepEqual(q.correct,[...new Set(key[q.number].printed)].sort());
 assert.equal(q.options.map(o=>o.letter).join(''),'ABCDE');
 assert.equal(typeof q.asksFalse,'boolean');
 for(const o of q.options){
  assert.ok(o.why.includes('Sursa:')&&o.why.length>60,q.id+o.letter+' explanation');
  assert.doesNotMatch(o.why,/https?:\/\/|capitol(?:ul)?\s+\d/i,'Only named textbook lessons and figures');
  const record=evidence.get(q.id+'/'+o.letter);assert.ok(record);
  assert.equal(record.file,'assets/js/grile-asociative-data.js');
  assert.equal(record.explanationSha256,createHash('sha256').update(o.why).digest('hex'),'Evidence binds to current explanation');
  assert.ok(['supported','source-limitation','discrepancy'].includes(record.status));
  assert.ok(record.references.length);
  for(const ref of record.references){
   assert.ok(ref.lesson&&ref.section);
   const [a,b]=ref.lines;assert.ok(Number.isInteger(a)&&Number.isInteger(b)&&a>0&&a<=b);
   if(lines){assert.ok(b<=lines.length);assert.ok(lines.slice(a-1,b).join('').trim(),q.id+o.letter+' nonempty evidence');}
   if(ref.figure){await access(new URL(ref.figure,root));assert.ok(audit.inspectedFigures.includes(ref.figure));}
  }
 }
}
// The archived scan transcription remains the independent text baseline.
for(const lot of ['001-100','101-200','201-300','301-400']){
 const folder=lot==='001-100'?'reviews':'drafts';
 const source=await read(`docs/editorial/umf-2026/asociative-pending/${folder}/XIII-${lot}.json`);
 for(const q of source.questions){
  const current=quiz.questions[q.number-1];
  for(const field of ['prompt','number','sourceNumber','sourceChapter','asksFalse','sourcePages']) assert.deepEqual(current[field],q[field],q.number+' '+field);
  assert.deepEqual(current.options.map(o=>o.text),q.options.map(o=>o.text),q.number+' source options');
 }
}
const registry=await loadSiteRegistry();const {chapters,collections,resources}=publishedResources(registry);
assert.equal(chapters.length,17);assert.equal(collections.length,1);assert.equal(collections[0].num,1000);
assert.equal(resources.filter(r=>r.kind==='quiz').length,18);
for(const prefix of ['','nou/']){
 const html=await readFile(new URL(prefix+'grile_asociative.html',root),'utf8');
 assert.equal((html.match(/id="page-grile-/g)||[]).length,40);
 assert.ok(html.includes('href="testare.html"'));
}
assert.equal(key[182].printed,'ACBE');
console.log('Associative: 400 original questions, 2000 source-linked explanations, immutable printed key, 40 ranges and both editions verified.');
console.log(manual?'Local textbook SHA-256 and cited line ranges verified.':'Local textbook unavailable; persisted references verified structurally only.');
