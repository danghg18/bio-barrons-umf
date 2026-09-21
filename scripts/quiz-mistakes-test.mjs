import assert from 'node:assert/strict';
import {readFile, mkdir} from 'node:fs/promises';
import http from 'node:http';
import {extname,resolve} from 'node:path';
import {chromium} from 'playwright';
const root=resolve(import.meta.dirname,'..');
const prefix='/bio-barrons-umf/';
const output=resolve(root,'tmp/mistake-practice');
await mkdir(output,{recursive:true});
const server=http.createServer(async(req,res)=>{try{const path=new URL(req.url,'http://local').pathname;if(!path.startsWith(prefix))throw Error();const file=resolve(root,path.slice(prefix.length));if(!file.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();const base=`http://127.0.0.1:${server.address().port}${prefix}`;
async function context(options={}) {
 const ctx=await browser.newContext({serviceWorkers:'block',...options});
 await ctx.route('**/assets/js/supabase-config.js*',route=>route.fulfill({contentType:'text/javascript',body:"window.BB_SUPABASE_CONFIG={url:'',publishableKey:''};"}));
 await ctx.route('https://*.supabase.co/**',route=>route.abort());
 return ctx;
}
async function check(page,number,letters) {
 await page.locator(`.quiz-question-map a[href="#grila-${number}"]`).click();
 for(const letter of letters)await page.locator(`#grila-${number} input[value="${letter}"]`).check();
 await page.locator(`#grila-${number} .quiz-check`).click();await page.waitForSelector(`#grila-${number}.is-verified`);
}
async function finishRound(page,wrongCount) {
 return page.evaluate(async wrongCount=>{
  const quiz=window.BB_QUIZ||window.BB_NERVOUS_QUIZ,sourceId=new URLSearchParams(location.search).get('parcurgere');
  const run=await BBQuizAnalytics.ensurePractice(quiz.storageKey,false,sourceId);
  const remaining=run.questionIds.filter(id=>!run.answers[id]?.verified);
  for(const [index,id] of remaining.entries()) {
   const q=quiz.questions.find(q=>q.id===id),correct=index>=wrongCount;
   const selected=correct?q.correct:q.correct.length>1?[q.correct[0]]:[q.options.find(o=>!q.correct.includes(o.letter)).letter];
   await BBQuizAnalytics.recordAttempt({storageKey:quiz.storageKey,runId:run.id,questionId:id,attemptId:BBQuizAnalytics.newAttemptId(),selected,correct,answerKey:q.correct});
  }
  return run;
 },wrongCount);
}
try {
 const ctx=await context();const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.stack));
 await page.goto(base+'grile_celula.html');await page.waitForSelector('#grila-61');
 const first=await page.evaluate(()=>{const q=BB_QUIZ.questions[0];return {number:q.number,wrong:q.correct.length>1?[q.correct[0]]:[q.options.find(o=>!q.correct.includes(o.letter)).letter]};});
 await check(page,first.number,first.wrong);
 assert.equal(await page.locator('#quiz-practice-link').isVisible(),false,'A partial initial run has no correction action');
 await page.goto(base+'grile_celula.html?mod=greseli');await page.waitForSelector('[data-practice-empty]');
 assert.match(await page.locator('[data-practice-empty] h1').innerText(),/Termină parcurgerea inițială/);
 assert.equal(await page.locator('.quiz-question').count(),0);
 assert.equal(await page.locator('[data-practice-empty] a').innerText(),'Continuă testul complet');
 await page.locator('[data-practice-empty] a').click();await page.waitForSelector('#grila-61');
 const seeded=await page.evaluate(async()=>{
  const quiz=BB_QUIZ,run=await BBQuizAnalytics.ensureRun(quiz.storageKey),wrong=quiz.questions.filter((_,i)=>i%3===0).slice(0,15);
  const wrongIds=new Set(wrong.map(q=>q.id)),answers={};
  for(const q of quiz.questions) {
   const correct=!wrongIds.has(q.id),selected=correct?q.correct:q.correct.length>1?[q.correct[0]]:[q.options.find(o=>!q.correct.includes(o.letter)).letter];
   answers[q.id]={selected,verified:true,correct};
   if(!run.answers[q.id]?.verified)await BBQuizAnalytics.recordAttempt({storageKey:quiz.storageKey,runId:run.id,questionId:q.id,selected,correct,attemptId:BBQuizAnalytics.newAttemptId(),answerKey:q.correct});
  }
  BBUserStorage.set(quiz.storageKey,{version:quiz.version,questions:answers});
  return {sourceId:run.id,ids:wrong.map(q=>q.id),numbers:wrong.map(q=>q.number),key:quiz.storageKey,cache:BBUserStorage.get(quiz.storageKey)};
 });
 await page.waitForSelector('#quiz-practice-link:not([hidden])');
 assert.match(await page.locator('#quiz-practice-link').getAttribute('href'),new RegExp('parcurgere='+seeded.sourceId));
 assert.match(await page.locator('#quiz-run-context').innerText(),/70%/);
 await page.locator('#quiz-practice-link').click();await page.waitForSelector('body[data-quiz-mode="mistakes"] .quiz-question');
 assert.equal(new URL(page.url()).searchParams.get('parcurgere'),seeded.sourceId);
 assert.equal(await page.locator('.quiz-question').count(),15);assert.equal(await page.locator('.page-section.active .quiz-question').count(),10);
 assert.deepEqual(await page.locator('.quiz-question').evaluateAll(nodes=>nodes.map(n=>n.dataset.questionId)),seeded.ids);
 assert.match(await page.locator('.quiz-progress-title').innerText(),/Runda de corectare 1/);
 assert.equal(await page.locator('.quiz-reset-start').isVisible(),false,'An unfinished correction cannot start another round');
 assert.equal((await page.evaluate(()=>BBQuizAnalytics.getReport({days:'all'}))).runs.find(r=>r.id===new URL(page.url()).searchParams.get('parcurgere')).correction.roundCount,0,'Opening an empty round does not count as an attempt');
 await page.locator('.lesson-search-trigger').click();await page.locator('#lesson-search-input').fill('membrana plasmatica');await page.waitForSelector('.search-found-current');await page.keyboard.press('Escape');
 assert.equal(await page.locator('.quiz-question.is-verified').count(),0);
 await page.locator('.page-section.active .quiz-page-nav a').last().click();assert.equal(await page.locator('.page-section.active .quiz-question').count(),5);
 await page.reload();await page.waitForSelector('.page-section.active .quiz-question');assert.equal(await page.locator('.page-section.active .quiz-question').count(),5);
 const correct=await page.evaluate(()=>BB_QUIZ.questions[0].correct);await check(page,seeded.numbers[0],correct);
 assert.deepEqual(await page.evaluate(key=>BBUserStorage.get(key),seeded.key),seeded.cache,'Correction must not change initial answers');
 const unfinished=await page.evaluate(async()=>{const key=BB_QUIZ.storageKey,source=new URLSearchParams(location.search).get('parcurgere');const before=await BBQuizAnalytics.ensurePractice(key,false,source),after=await BBQuizAnalytics.ensurePractice(key,true,source);return {before,after};});
 assert.equal(unfinished.before.id,unfinished.after.id,'Restart cannot discard unfinished correction answers');
 await page.reload();await page.waitForSelector(`#grila-${seeded.numbers[0]}.is-correct`);
 await finishRound(page,7);await page.reload();await page.waitForSelector('.quiz-reset-start:visible');
 assert.match(await page.locator('.quiz-reset-start').innerText(),/7 greșeli rămase/);
 await page.locator('.quiz-reset-start').click();await page.waitForFunction(()=>document.querySelectorAll('.quiz-question').length===7);
 assert.equal(await page.locator(`#grila-${seeded.numbers[0]}`).count(),0,'Corrected original IDs leave later rounds');
 assert.match(await page.locator('.quiz-progress-title').innerText(),/Runda de corectare 2/);
 const other=await ctx.newPage();await other.goto(base+'grile_celula.html?mod=greseli&parcurgere='+encodeURIComponent(seeded.sourceId));await other.waitForSelector('.quiz-question');
 const stale=await other.evaluate(()=>BBQuizAnalytics.ensurePractice(BB_QUIZ.storageKey,false,new URLSearchParams(location.search).get('parcurgere')));
 await finishRound(page,1);await page.reload();await page.waitForSelector('.quiz-reset-start:visible');
 await page.locator('.quiz-reset-start').click();await page.waitForFunction(()=>document.querySelectorAll('.quiz-question').length===1);
 await other.waitForSelector('[data-practice-empty]');assert.match(await other.locator('[data-practice-empty] h1').innerText(),/rundă nouă/);
 assert.equal(await other.evaluate(run=>BBQuizAnalytics.recordAttempt({storageKey:run.storageKey,runId:run.id,questionId:run.questionIds[0],attemptId:'stale-practice',selected:['A'],correct:false}),stale),false,'A prior-round tab cannot submit to its successor');
 await other.close();
 const last=await page.locator('.quiz-question').getAttribute('data-question-id');
 const lastQuestion=await page.evaluate(id=>BB_QUIZ.questions.find(q=>q.id===id),last);await check(page,lastQuestion.number,lastQuestion.correct);
 await page.waitForFunction(()=>document.querySelector('#quiz-restart-status').textContent.includes('3 runde de corectare'));
 assert.match(await page.locator('#quiz-run-context').innerText(),/70%/,'Initial score remains visible after full correction');
 assert.equal(await page.locator('.quiz-reset-start').isVisible(),false,'No next round after all original mistakes are corrected');
 await page.reload();await page.waitForSelector('.quiz-question.is-correct');assert.match(await page.locator('#quiz-restart-status').innerText(),/3 runde de corectare/);
 const report=await page.evaluate(()=>BBQuizAnalytics.getReport({chapterNum:3,days:'all'})),parent=report.runs.find(r=>r.id===seeded.sourceId);
 assert.equal(parent.accuracy,70);assert.equal(parent.correction.accuracy,100);assert.equal(parent.correction.roundCount,3);assert.equal(parent.correction.remaining,0);
 assert.deepEqual(await page.evaluate(key=>BBUserStorage.get(key),seeded.key),seeded.cache);
 for(const width of [1440,390,320]) {
  await page.setViewportSize({width,height:900});await page.evaluate(()=>{window.closeNav();scrollTo(0,0);});await page.emulateMedia({reducedMotion:'reduce'});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:resolve(output,'correction-complete-'+width+'.png')});
 }
 await page.evaluate(()=>{BBUserStorage.activate('practice-import-owner');BBUserStorage.activate('practice-empty-owner');});
 await page.waitForSelector('[data-practice-empty]');assert.equal(await page.locator('.quiz-question').count(),0);
 await page.evaluate(()=>BBUserStorage.activate('guest'));await page.waitForSelector('.quiz-question.is-correct');
 const staleSource=await ctx.newPage();await staleSource.goto(page.url());await staleSource.waitForSelector('.quiz-question');
 await page.goto(base+'grile_celula.html');await page.waitForSelector('#grila-61');await page.locator('.quiz-reset-start').click();await page.locator('.quiz-reset-confirm').click();
 await page.waitForFunction(()=>!document.querySelector('#grila-61').classList.contains('is-verified'));
 await staleSource.waitForSelector('[data-practice-empty]');assert.match(await staleSource.locator('[data-practice-empty] h1').innerText(),/nu mai este activă/);
 await staleSource.reload();await staleSource.waitForSelector('[data-practice-empty]');
 assert.equal(await staleSource.evaluate(id=>BBQuizAnalytics.ensurePractice(BB_QUIZ.storageKey,false,id),seeded.sourceId),null,'Archived source URLs cannot reopen correction');
 await staleSource.close();
 // Every registered dataset keeps original question IDs, text and exact answer keys.
 const quizzes=await page.evaluate(()=>BB_QUIZ_INDEX.map(q=>({url:q.url,key:q.storageKey})));
 for(const entry of quizzes) {
  const datasetCtx=await context(),dataset=await datasetCtx.newPage();dataset.on('pageerror',e=>errors.push(e.stack));await dataset.goto(base+entry.url);await dataset.waitForSelector('.quiz-question');
  const q=await dataset.evaluate(async()=>{
   const quiz=window.BB_QUIZ||window.BB_NERVOUS_QUIZ,first=quiz.questions[0],answers={};
   for(const q of quiz.questions){const correct=q!==first;answers[q.id]={verified:true,correct,selected:correct?q.correct:q.correct.length>1?[q.correct[0]]:[q.options.find(o=>!q.correct.includes(o.letter)).letter]};}
   BBUserStorage.hydrate({[quiz.storageKey]:{version:quiz.version,questions:answers}});return first;
  });
  await dataset.waitForSelector('#quiz-practice-link:not([hidden])');
  await dataset.goto(base+entry.url+'?mod=greseli');await dataset.waitForSelector('[data-question-id="'+q.id+'"]');
  assert.equal(await dataset.locator('.quiz-question').count(),1);assert.equal(await dataset.locator('#grila-'+q.number+' legend').innerText(),q.prompt);
  await check(dataset,q.number,q.correct);await dataset.waitForSelector('#grila-'+q.number+'.is-correct');await datasetCtx.close();
 }
 // Fully verified cached answers can begin their first correction while offline.
 const offlineCtx=await context({serviceWorkers:'allow'}),offline=await offlineCtx.newPage();offline.on('pageerror',e=>errors.push(e.stack));await offline.goto(base+'grile_celula.html');
 await offline.evaluate(async()=>{await navigator.serviceWorker.register('sw.js');await navigator.serviceWorker.ready;});await offline.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await offline.evaluate(()=>{const answers={};for(const [i,q] of BB_QUIZ.questions.entries()){const correct=i!==0;answers[q.id]={selected:correct?q.correct:q.correct.length>1?[q.correct[0]]:[q.options.find(o=>!q.correct.includes(o.letter)).letter],verified:true,correct};}BBUserStorage.set(BB_QUIZ.storageKey,{version:BB_QUIZ.version,questions:answers});});
 await offlineCtx.setOffline(true);await offline.goto(base+'grile_celula.html?mod=greseli');await offline.waitForSelector('body[data-quiz-mode="mistakes"] #grila-61');await offlineCtx.close();
 assert.deepEqual(errors,[]);await ctx.close();
 console.log('Correction rounds: full-first gating, immutable 70% initial result, three shrinking rounds, source URLs, resume/counting, exact grading, stale rounds and parents, identity changes, phone layout, all registered datasets and first offline entry passed.');
} finally {await browser.close();await new Promise(r=>server.close(r));}
