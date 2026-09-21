import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import http from 'node:http';
import {extname, resolve, sep} from 'node:path';
import {chromium} from 'playwright';
const root=resolve(import.meta.dirname,'..'), prefix='/bio-barrons-umf/';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname;const file=resolve(root,path.slice(prefix.length)||'index.html');if(!path.startsWith(prefix)||!file.startsWith(root+sep))throw Error();res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}${prefix}`;
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce',viewport:{width:1440,height:900}});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'glosar.html');
 await page.evaluate(()=>sessionStorage.setItem('bb.glossary.context.corrupt-token-123',JSON.stringify({url:new URL('celula_si_fiziologia_celulara.html',location.href).href,created:Date.now()})));
 await page.goto(base+'glosar.html?context=corrupt-token-123');
 assert.equal(await page.locator('#glossary-back').getAttribute('href'),'index.html#lab-bento','corrupt context falls back safely');
 await page.goto(base+'celula_si_fiziologia_celulara.html');
 await page.waitForFunction(()=>document.body.dataset.bbSharedReady==='true');
 assert.equal(await page.locator('#nav-glossary-link').count(),1,'settings contains the glossary entry');
 async function openGlossary(){if(await page.evaluate(()=>innerWidth<768))await page.locator('.lab-menu-trigger').click();if(await page.locator('.bb-settings-toggle').getAttribute('aria-expanded')!=='true')await page.locator('.bb-settings-toggle').click();await page.locator('#nav-glossary-link').click();await page.waitForURL('**/glosar.html?context=*');}
 async function assertReturn(source,y){await page.locator('#glossary-back').click();await page.waitForURL(source);await page.waitForTimeout(1800);assert.ok(Math.abs(await page.evaluate(()=>scrollY)-y)<4,'restores the reading position after late routing');}
 await page.evaluate(()=>{history.replaceState({other:'retained'},'');scrollTo(0,700);});
 const source=page.url(), y=await page.evaluate(()=>scrollY);
 await openGlossary();assert.equal(await page.locator('#glossary-back').textContent(),'Înapoi la lecție');
 await page.reload();await assertReturn(source,y);
 assert.equal(await page.evaluate(()=>history.state.other),'retained');
 await page.goto(base+'grile_sistemul_nervos.html#grila-76');
 await page.waitForTimeout(500);await page.evaluate(()=>scrollBy(0,180));
 const quizURL=page.url(), quizY=await page.evaluate(()=>scrollY);
 await openGlossary();assert.equal(await page.locator('#glossary-back').textContent(),'Înapoi la grile');await assertReturn(quizURL,quizY);
 // Both legacy routing families retain accordion visibility and reading offset.
 for (const file of ['sistemul_renal_complet.html','sistemul_reproducator_masculin.html']) {
  await page.goto(base+file);await page.waitForTimeout(250);
  const sourceState=await page.evaluate(()=>{
   const candidate=Array.from(document.querySelectorAll('.page-section')).find(n=>n.querySelector('.acc-head,.accordion-head,[onclick*="tog("]'));
   if(candidate)window.goto(candidate.id.slice(5));
   const head=document.querySelector('.page-section.active .acc-head,.page-section.active .accordion-head,.page-section.active [onclick*="tog("]');
   if(head&&!head.classList.contains('open'))head.click();scrollTo(0,450);return {url:location.href,y:scrollY,open:!!head};
  });
  await openGlossary();await assertReturn(sourceState.url,sourceState.y);
  if(sourceState.open)assert.ok(await page.locator('.page-section.active .acc-head.open,.page-section.active .accordion-head.open,.page-section.active [onclick*="tog("].open').count());
 }
 // The legacy mindmap bookmark now contains the source table, replacing the
 // out-of-source flowchart. Fallback return must still restore this bookmark.
 await page.goto(base+'sistemul_renal_complet.html#mindmap');await page.locator('#page-mindmap table').scrollIntoViewIfNeeded();
 const sourceTable={url:page.url(),y:await page.evaluate(()=>scrollY)};await openGlossary();
 await page.evaluate(()=>history.replaceState({...history.state,bbGlossary:{...history.state.bbGlossary,safe:false}},''));await page.reload();
 await assertReturn(sourceTable.url,sourceTable.y);
 assert.equal(await page.locator('.page-section.active').getAttribute('id'),'page-mindmap');
 assert.match(await page.locator('#page-mindmap table caption').innerText(),/20\.2/);
 await page.goto(base+'grile_celula.html');await page.waitForSelector('#grila-61');
 const practiceSourceId=await page.evaluate(async()=>{
  await BBQuizAnalytics.ready;
  const quiz=BB_QUIZ,run=await BBQuizAnalytics.ensureRun(quiz.storageKey),wrongIds=new Set(quiz.questions.filter((_,i)=>i%3===0).slice(0,12).map(q=>q.id)),answers={};
  for(const q of quiz.questions){
   const correct=!wrongIds.has(q.id),selected=correct?q.correct:q.correct.length>1?[q.correct[0]]:[q.options.find(o=>!q.correct.includes(o.letter)).letter];
   answers[q.id]={selected,verified:true,correct};
   await BBQuizAnalytics.recordAttempt({storageKey:quiz.storageKey,runId:run.id,questionId:q.id,selected,correct,attemptId:BBQuizAnalytics.newAttemptId(),answerKey:q.correct});
  }
  BBUserStorage.set(quiz.storageKey,{version:quiz.version,questions:answers});
  return run.id;
 });
 await page.goto(base+'grile_celula.html?mod=greseli&parcurgere='+encodeURIComponent(practiceSourceId)+'#grila-94');await page.waitForSelector('body[data-quiz-mode="mistakes"] #grila-94');await page.waitForTimeout(300);
 await page.evaluate(()=>scrollBy(0,100));
 const practice={url:page.url(),y:await page.evaluate(()=>scrollY),state:await page.evaluate(()=>JSON.stringify(BBUserStorage.get(BB_QUIZ.storageKey)))};
 await openGlossary();
 await page.route('**/assets/js/quiz-player.js*',async route=>{
  const response=await route.fetch(),body=await response.text(),anchor='      await analytics.ready;\n      var run =';
  assert.ok(body.includes(anchor),'delayed practice fixture must intercept initialization');
  await route.fulfill({response,body:body.replace(anchor,'      await new Promise(resolve => setTimeout(resolve, 2200));\n'+anchor)});
 });
 await page.evaluate(()=>history.replaceState({...history.state,bbGlossary:{...history.state.bbGlossary,safe:false}},''));await page.reload();
 await page.locator('#glossary-back').click();await page.waitForURL(practice.url);await page.waitForTimeout(3200);
 assert.ok(Math.abs(await page.evaluate(()=>scrollY)-practice.y)<4,'delayed practice rendering must finish before return restoration settles');
 await page.unroute('**/assets/js/quiz-player.js*');
 assert.equal(await page.evaluate(()=>JSON.stringify(BBUserStorage.get(BB_QUIZ.storageKey))),practice.state,'navigation leaves quiz answer state unchanged');
 await page.setViewportSize({width:390,height:844});await page.goto(base+'celula_si_fiziologia_celulara.html');await page.evaluate(()=>scrollTo(0,500));
 const mobile={url:page.url(),y:await page.evaluate(()=>scrollY)};await openGlossary();await assertReturn(mobile.url,mobile.y);
 assert.equal(await page.locator('main').evaluate(n=>n.inert),false,'return closes the mobile drawer');
 // Native browser Back follows the same return contract.
 await openGlossary();await page.goBack();await page.waitForTimeout(1800);assert.ok(Math.abs(await page.evaluate(()=>scrollY)-mobile.y)<4);
 await page.setViewportSize({width:1440,height:900});
 await page.goto(base+'grile_sistemul_nervos.html?q=neuron&section=grile-51-60&hit=1#grila-53');await page.waitForTimeout(500);await page.evaluate(()=>scrollBy(0,100));
 const searched={url:page.url(),y:await page.evaluate(()=>scrollY)};await openGlossary();await assertReturn(searched.url,searched.y);
 await page.goto(base+'celula_si_fiziologia_celulara.html');await page.locator('.bb-settings-toggle').click();
 const modified=await page.evaluate(()=>{let prevented;document.addEventListener('click',event=>{prevented=event.defaultPrevented;event.preventDefault();},{once:true});document.getElementById('nav-glossary-link').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,ctrlKey:true,button:0}));return prevented;});assert.equal(modified,false,'modified clicks stay native');
 // A width change uses a content anchor, rather than the obsolete document pixel offset.
 await page.goto(base+'grile_sistemul_nervos.html#grila-76');await page.waitForTimeout(250);await page.evaluate(()=>scrollBy(0,140));
 await openGlossary();
 const anchored=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('bb.glossary.context.'+new URLSearchParams(location.search).get('context'))));
 await page.setViewportSize({width:390,height:844});await page.locator('#glossary-back').click();await page.waitForURL(anchored.url);await page.waitForTimeout(1800);
 assert.ok(Math.abs(await page.evaluate(v=>document.getElementById(v.section).querySelector(v.anchor).getBoundingClientRect().top,anchored)-anchored.offset)<4,'resize restores the same content anchor at the same viewport offset');
 await page.goto(base+'glosar.html');assert.equal(await page.locator('#glossary-back').getAttribute('href'),'index.html#lab-bento');
 await page.goto(base+'glosar.html?context=invalid');assert.equal(await page.locator('#glossary-back').getAttribute('href'),'index.html#lab-bento');
 assert.deepEqual(errors,[],'no browser runtime errors');await context.close();console.log('Glossary navigation: lesson, both legacy lessons, normal/mistakes quizzes, search URL, exact scroll, resize anchor, mobile drawer, native Back, reload, preserved history/answers, modified clicks and invalid context passed.');
}finally{await browser.close();await new Promise(done=>server.close(done));}
