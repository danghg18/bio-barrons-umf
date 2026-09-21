import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
const root=resolve(import.meta.dirname,'..'),prefix='/bio-barrons-umf/';
const server=http.createServer(async(req,res)=>{try{const path=new URL(req.url,'http://local').pathname;if(!path.startsWith(prefix))throw Error();const file=resolve(root,path.slice(prefix.length)||'index.html');if(!file.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'})[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}${prefix}`;
const browser=await chromium.launch();
const output=process.env.BB_UI_OUTPUT;if(output)await mkdir(output,{recursive:true});
const capture=async(page,name)=>{if(output){await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:resolve(output,name+'.png')});}};
try{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const ready=()=>page.waitForFunction(()=>document.body.dataset.analyticsReady==='true');
 await page.goto(base+'testare.html');await ready();
 assert.equal(await page.locator('.testing-chapter-row:visible').count(),7,'Start with actionable tests, preserving the full curriculum behind a filter');
 await page.getByRole('button',{name:'Toate capitolele',exact:true}).click();assert.equal(await page.locator('.testing-chapter-row:visible').count(),17);
 await page.getByRole('button',{name:'Disponibile',exact:true}).click();assert.equal(await page.locator('.testing-chapter-row:visible').count(),7);
 assert.equal(await page.locator('#testing-preview-summary strong').innerText(),'0');
 await page.locator('.testing-intro a[href="#lab-testing-catalog"]').click();
 assert.equal(new URL(page.url()).hash,'#lab-testing-catalog');
 assert.ok(await page.locator('#lab-testing-catalog').evaluate(node=>{const box=node.getBoundingClientRect();return box.top>=0&&box.top<innerHeight;}),'The introduction links directly to chapter selection');
 assert.match(await page.locator('.testing-chapter-row:visible').first().innerText(),/Neînceput/);
 await page.goto(base+'statistici.html');await ready();
 assert.equal(await page.locator('#analytics-onboarding').isVisible(),true);
 assert.equal(await page.getByRole('link',{name:'Rezolvă prima grilă',exact:true}).isVisible(),true);
 await capture(page,'analytics-empty-390');
 await page.goto(base+'grile_sistemul_nervos.html#grila-51');await page.waitForFunction(()=>document.body.dataset.bbSharedReady==='true');
 await page.locator('input[type="checkbox"]:visible').first().check();await page.getByRole('button',{name:'Verifică răspunsul',exact:true}).first().click();await page.waitForFunction(()=>document.querySelector('main').innerText.includes('Combinația corectă este'));
 await page.goto(base+'statistici.html?capitol=11');await ready();assert.equal(await page.locator('[data-metric="attempts"]').innerText(),'1');
 assert.ok((await page.locator('#analytics-next-step a').first().boundingBox()).y<844,'Review action comes before charts');
 assert.match(await page.locator('#analytics-next-step a').first().getAttribute('href'),/grile_sistemul_nervos.html(?:#grila-\d+)?$/,'Finish the initial run before correction practice');
 await page.getByRole('tab',{name:'Greșeli',exact:true}).click();assert.equal(await page.locator('#analytics-period').isVisible(),false,'Current mistakes are independent from the historical period filter');await page.getByRole('tab',{name:'Rezumat',exact:true}).click();
 await page.locator('#analytics-chapter').selectOption('3');await ready();assert.equal(await page.locator('#analytics-onboarding').isVisible(),true);assert.match(await page.locator('#analytics-onboarding a').first().getAttribute('href'),/grile_celula.html/);
 await page.locator('#analytics-chapter').selectOption('all');await ready();assert.equal(await page.locator('#analytics-onboarding').isVisible(),false);
 for(const file of ['sistemul_nervos.html','sistemul_renal_complet.html','sistemul_reproducator_masculin.html','oasele_si_articulatiile.html']){
  await page.goto(base+file);await page.waitForFunction(()=>document.body.dataset.bbSharedReady==='true');
  const practice=page.locator('.bb-practice-lesson');assert.equal(await practice.count(),file.startsWith('oasele')?0:1);
  if(await practice.count()){const href=await practice.getAttribute('href');assert.equal((await page.request.get(base+href)).status(),200);}
  await page.waitForSelector('#bb-notes-toggle');assert.equal(await page.locator('#bb-notes-toggle').evaluate(e=>getComputedStyle(e).position),'static');
  await page.locator('#bb-notes-toggle').click();assert.equal(await page.locator('#bb-notes-panel').isVisible(),true);await page.keyboard.press('Escape');
  assert.equal(await page.locator('#bb-notes-toggle').evaluate(e=>e===document.activeElement),true);
  if(file==='sistemul_nervos.html'&&output){await page.locator('.bb-lesson-completion').scrollIntoViewIfNeeded();await capture(page,'lesson-completion-390');await page.setViewportSize({width:1440,height:900});await page.locator('.bb-lesson-completion').scrollIntoViewIfNeeded();await capture(page,'lesson-completion-1440');await page.setViewportSize({width:390,height:844});}
 }
 await page.goto(base+'index.html');await page.waitForSelector('.pilot-demo-option');assert.ok((await page.locator('.pilot-demo-option').first().boundingBox()).height>=44);assert.ok((await page.locator('#pilot-demo-check').boundingBox()).height>=44);
 for(const width of [1440,768,390,320]){await page.setViewportSize({width,height:900});for(const file of ['index.html','testare.html','statistici.html','sistemul_nervos.html']){await page.goto(base+file);if(['testare.html','statistici.html'].includes(file))await ready();else await page.waitForSelector(file==='index.html'?'.pilot-hero .pilot-demo':'#bb-notes-toggle');await page.evaluate(()=>document.fonts.ready);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${file} overflow at ${width}`);if(output&&[1440,390].includes(width))await page.screenshot({path:resolve(output,`${file}-${width}.png`)});}}
 const historicalContext=await browser.newContext({serviceWorkers:'block'});const historical=await historicalContext.newPage();
 await historical.goto(base+'statistici.html');await historical.waitForFunction(()=>document.body.dataset.analyticsReady==='true');
 await historical.evaluate(async()=>{
  const q=BB_QUIZ_INDEX[0],a=BBQuizAnalytics;await a.recordAttempt({storageKey:q.storageKey,questionId:q.questions[0].id,attemptId:a.newAttemptId(),correct:true,selected:q.questions[0].correct});
  await new Promise((resolve,reject)=>{const request=indexedDB.open('bb.quiz.analytics.v1',2);request.onerror=()=>reject(request.error);request.onsuccess=()=>{const db=request.result,tx=db.transaction('attempts','readwrite'),store=tx.objectStore('attempts');store.getAll().onsuccess=event=>{for(const attempt of event.target.result){const date=new Date();date.setDate(date.getDate()-45);attempt.at=date.toISOString();store.put(attempt);}};tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};});
 });
 await historical.goto(base+'statistici.html?perioada=30');await historical.waitForFunction(()=>document.body.dataset.analyticsReady==='true');
 assert.equal(await historical.locator('#analytics-onboarding').isVisible(),false,'Older history must not be mistaken for a new student');
 await historical.getByRole('tab',{name:'Istoric',exact:true}).click();await historical.locator('#analytics-period').selectOption('all');await historical.waitForFunction(()=>document.body.dataset.analyticsReady==='true' && new URL(location.href).searchParams.get('perioada')==='all');assert.equal(await historical.locator('[data-metric="attempts"]').textContent(),'1');
 await historicalContext.close();
 await page.setViewportSize({width:1440,height:900});await page.goto(base+'testare.html');await ready();
 assert.equal(await page.locator('#testing-preview-summary strong').innerText(),'1','Preview counts distinct verified questions');
 assert.equal(await page.locator('#testing-activity svg').isVisible(),true,'The restored activity preview shows recorded answers');
 assert.equal(await page.locator('#testing-activity tbody tr td').first().textContent(),'1','Activity counts the real verification from this study session');
 const intro=await page.locator('.testing-intro').boundingBox(),preview=await page.locator('.testing-preview').boundingBox();assert.ok(preview.x>intro.x+intro.width,'Progress preview sits to the right of the introduction');
 assert.deepEqual(errors,[]);console.log('Study flow: available/all filters, empty/active/chapter analytics, real review links, legacy and shared lesson practice, mobile notes and responsive widths passed.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
