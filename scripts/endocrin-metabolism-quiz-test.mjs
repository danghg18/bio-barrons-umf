import assert from 'node:assert/strict';
import {readFile, mkdir} from 'node:fs/promises';
import vm from 'node:vm';
import http from 'node:http';
import {extname, resolve, sep} from 'node:path';
import {chromium} from 'playwright';

const root=resolve(import.meta.dirname,'..');
const key=JSON.parse(await readFile(resolve(root,'tests/endocrin-metabolism-answer-key.json'),'utf8'));
assert.equal(key.length,160);
const specs=[
 {file:'grile_sistemul_endocrin.html',dataFile:'grile-sistemul-endocrin-data.js',lesson:'sistemul_endocrin.html',key:'bb.quiz.sistemul-endocrin.v1',prefix:'end-',numbers:[...Array.from({length:60},(_,i)=>i+1),...Array.from({length:41},(_,i)=>i+120).filter(n=>n!==150)],count:100,search:'insulină',searchRange:'grile-150-159'},
 {file:'grile_metabolism_si_nutritie.html',dataFile:'grile-metabolism-data.js',lesson:'metabolism_si_nutritie.html',key:'bb.quiz.metabolism.v1',prefix:'met-',numbers:[61,62,63,64,...Array.from({length:55},(_,i)=>i+65),150],count:60,search:'lipoproteine',searchRange:'grile-65-74'}
];
const allNumbers=[];
for(const spec of specs){
 const sandbox={window:{}};
 vm.runInNewContext(await readFile(resolve(root,'assets/js/'+spec.dataFile),'utf8'),sandbox);
 spec.data=JSON.parse(JSON.stringify(sandbox.window.BB_QUIZ));
 assert.equal(spec.data.questionCount,spec.count);assert.equal(spec.data.questions.length,spec.count);
 assert.equal(spec.data.firstNumber,spec.numbers[0]);assert.equal(spec.data.storageKey,spec.key);
 assert.deepEqual(spec.data.questions.map(q=>q.number),spec.numbers);
 for(const q of spec.data.questions){
  assert.equal(q.id,([61,62,63,64,150].includes(q.number)?'end-':spec.prefix)+String(q.number).padStart(3,'0'));
  assert.equal(q.sourceNumber,q.number);allNumbers.push(q.sourceNumber);
  assert.equal(q.correct.join(''),key[q.sourceNumber-1],`user key ${q.sourceNumber}`);
  assert.equal(q.options.map(o=>o.letter).join(''),'ABCDE');assert.ok(q.prompt.trim());
  q.options.forEach(o=>{assert.ok(o.text.trim());assert.ok(o.why?.trim(),`explanation ${q.number}${o.letter}`);});
  assert.equal(spec.data.ranges.filter(r=>q.number>=r.start&&q.number<=r.end).length,1);
 }
 assert.ok(spec.data.ranges.every(r=>r.end-r.start<10));
}
assert.deepEqual(allNumbers.sort((a,b)=>a-b),Array.from({length:160},(_,i)=>i+1));
const prefix='/bio-barrons-umf/';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const server=http.createServer(async(req,res)=>{try{
 const path=new URL(req.url,'http://localhost').pathname;const file=resolve(root,path.slice(prefix.length)||'index.html');
 if(!path.startsWith(prefix)||!file.startsWith(root+sep))throw Error('Invalid path');
 const body=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(body);
}catch{res.writeHead(404);res.end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}${prefix}`;
const browser=await chromium.launch({headless:true});
try {
 const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce',viewport:{width:1440,height:1000}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await mkdir(resolve(root,'tmp/endocrin-import/qa'),{recursive:true});
 for(const spec of specs){
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(base+spec.lesson);
  await page.locator(`.bb-lesson-completion a[href="${spec.file}"]`).click();
  await page.waitForFunction(()=>document.body.dataset.bbSharedReady==='true');
  assert.equal(await page.locator('.quiz-fatal').count(),0);
  assert.equal(await page.locator('.quiz-question').count(),spec.count);
  assert.equal(await page.locator('.quiz-question-map a').count(),spec.count);
  assert.equal(await page.locator('.lab-topbar-back').getAttribute('href'),spec.lesson);
  await page.goto(base+'testare.html');await page.locator(`#lab-testing-catalog a[href="${spec.file}"]`).click();
  const first=spec.data.questions[0], card=page.locator('#grila-'+first.number);
  const extra='ABCDE'.split('').find(l=>!key[first.number-1].includes(l));
  await card.locator(`input[value="${extra}"]`).check();await card.locator('.quiz-check').click();
  await card.locator('input:disabled').first().waitFor({state:'visible'});
  assert.equal(await card.locator('.is-selected-extra').count(),1);
  assert.equal(await card.locator('.is-missed-answer').count(),key[first.number-1].length);
  assert.ok(await card.locator('.quiz-option-explanation').first().isVisible());
  await page.screenshot({path:resolve(root,`tmp/endocrin-import/qa/${spec.prefix}desktop.png`)});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:resolve(root,`tmp/endocrin-import/qa/${spec.prefix}mobile.png`)});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.setViewportSize({width:1440,height:1000});
  // Retrying must restore editing, then exact supplied answers must score correctly.
  await page.locator('.quiz-reset-start').click();await page.locator('.quiz-reset-confirm').click();
  await page.waitForFunction(()=>document.querySelectorAll('.quiz-question.is-verified').length===0);
  assert.equal(await card.locator('input:disabled').count(),0);
  for(const q of spec.data.questions){
   const range=spec.data.ranges.find(r=>q.number>=r.start&&q.number<=r.end);
   await page.evaluate(id=>window.goto(id),range.id);
   const question=page.locator('#grila-'+q.number);
   for(const letter of 'ABCDE')await question.locator(`input[value="${letter}"]`).setChecked(key[q.number-1].includes(letter));
   await question.locator('.quiz-check').click();
   await page.waitForFunction(id=>document.getElementById(id).classList.contains('is-verified'),'grila-'+q.number);
   assert.ok(await question.evaluate(el=>el.classList.contains('is-correct')),`exact-set score ${q.number}`);
  }
  assert.equal(await page.locator('.quiz-question.is-correct').count(),spec.count);
  await page.reload();assert.equal(await page.locator('.quiz-question.is-correct').count(),spec.count);
  await page.locator('.quiz-reset-start').click();await page.locator('.quiz-reset-cancel').click();
  assert.equal(await page.locator('.quiz-question.is-correct').count(),spec.count);
  // A reset for this chapter cannot clear the existing sense-organ quiz.
  await page.evaluate(()=>localStorage.setItem('bb.quiz.organe-simt.v1','isolation-proof'));
  await page.locator('.quiz-reset-start').click();await page.locator('.quiz-reset-confirm').click();
  await page.waitForFunction(()=>document.querySelectorAll('.quiz-question.is-verified').length===0);
  await page.reload();assert.equal(await page.locator('.quiz-question.is-verified').count(),0);
  assert.equal(await page.evaluate(()=>localStorage.getItem('bb.quiz.organe-simt.v1')),'isolation-proof');
  await page.goto(base+spec.file+'?'+new URLSearchParams({q:spec.search,section:spec.searchRange,hit:'0'}));
  await page.waitForFunction(id=>document.querySelector('.page-section.active')?.id==='page-'+id,spec.searchRange);
  assert.ok(await page.locator('.page-section.active .search-found').count());
  await page.goto(base+spec.file+'#invalid');
  assert.equal(await page.locator('.page-section.active').getAttribute('id'),'page-'+spec.data.ranges[0].id);
 }
 // The endocrine split must neither insert metabolism numbers nor lose direct links/history.
 await page.goto(base+'grile_sistemul_endocrin.html#grila-60');
 assert.equal(await page.locator('.page-section.active').getAttribute('id'),'page-grile-51-60');
 assert.equal(await page.locator('.quiz-question-map a[href="#grila-65"]').count(),0);
 await page.locator('.page-section.active .quiz-page-nav a[href="#grile-120-129"]').click();
 assert.equal(await page.locator('.page-section.active').getAttribute('id'),'page-grile-120-129');
 await page.goBack();assert.equal(await page.locator('.page-section.active').getAttribute('id'),'page-grile-51-60');
 await page.goForward();assert.equal(await page.locator('.page-section.active').getAttribute('id'),'page-grile-120-129');
 await page.goto(base+'grile_sistemul_endocrin.html#grila-160');await page.reload();
 assert.ok(await page.locator('#grila-160').isVisible());
 await page.setViewportSize({width:390,height:844});await page.locator('.lab-menu-trigger').click();
 await page.locator('.quiz-question-map a[href="#grila-120"]').click();
 assert.ok(await page.locator('#grila-120').isVisible());assert.equal(await page.locator('main').evaluate(el=>el.inert),false);
 // Wrong answers retain their original source number in analytics and correction practice.
 await page.locator('#grila-120 input[value="A"]').check();await page.locator('#grila-120 .quiz-check').click();
 await page.waitForFunction(async()=>(await BBQuizAnalytics.getReport()).mistakes.some(m=>m.questionId==='end-120'&&m.number===120));
 const saved=await page.evaluate(()=>{
  const answers={};
  for(const q of BB_QUIZ.questions)answers[q.id]={verified:true,correct:q.number!==120,selected:q.number===120?['A']:q.correct};
  BBUserStorage.hydrate({[BB_QUIZ.storageKey]:{version:BB_QUIZ.version,questions:answers}});
  return BB_QUIZ.storageKey;
 });
 await page.waitForSelector('#quiz-practice-link:not([hidden])');
 await page.goto(base+'grile_sistemul_endocrin.html?mod=greseli');
 await page.waitForSelector('#grila-120');
 assert.equal(await page.locator('.quiz-question').count(),1);
 assert.deepEqual(errors,[]);
 await context.close();
 // Both new resources and a visited search URL must remain available under the worker offline.
 const offline=await browser.newContext({reducedMotion:'reduce'});const p=await offline.newPage();
 await p.goto(base+'testare.html');
 await p.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(done=>navigator.serviceWorker.addEventListener('controllerchange',done,{once:true}));});
 for(const spec of specs)await p.goto(base+spec.file);
 const searchUrl=base+specs[1].file+'?q=lipoproteine&section=grile-65-74&hit=0';
 await p.goto(searchUrl);await offline.setOffline(true);
 for(const [file,count] of [[specs[0].file+'#grila-160',100],[specs[1].file+'#grila-119',60]]){
  await p.goto(base+file);assert.equal(await p.locator('.quiz-question').count(),count);
 }
 await p.goto(searchUrl);assert.ok(await p.locator('.page-section.active .search-found').count());
 await offline.close();
 console.log('Endocrine/metabolism: all 160 source numbers, 800 options/explanations, exact user keys/scoring, source gap, persistence, isolation, search, mobile, mistakes and offline passed.');
} finally {await browser.close();await new Promise(done=>server.close(done));}
