import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'playwright';
const root=resolve(import.meta.dirname,'..'),prefix='/bio-barrons-umf/';
const output=process.env.BB_QUIZ_SURFACE_OUTPUT || '/tmp/bb-quiz-surface';
await mkdir(output,{recursive:true});
const server=http.createServer(async(req,res)=>{try{const path=new URL(req.url,'http://local').pathname,file=resolve(root,path.slice(prefix.length));if(!path.startsWith(prefix)||!file.startsWith(root+sep))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch(),base=`http://127.0.0.1:${server.address().port}${prefix}`;
try {
 const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 for(const width of [1440,1024,768,390,320]) {
  await page.setViewportSize({width,height:950});await page.goto(base+'grile_celula.html');
  await page.waitForFunction(()=>document.body.dataset.bbSharedReady==='true');await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('.page-section.active .quiz-question').count(),10);
  assert.equal(await page.locator('.quiz-question-map a').count(),50);
  assert.equal(await page.locator('.quiz-progress-panel').count(),1);
  assert.equal(await page.locator('#sidenav .quiz-sidebar-summary,#sidenav #quiz-sidebar-count,#sidenav #quiz-sidebar-progress').count(),0,'Progress belongs only to the main traversal summary');
  assert.equal(await page.locator('#quiz-content #quiz-sidebar-count').count(),1,'Existing progress ID remains available on the single summary');
  assert.equal(await page.locator('#quiz-content .quiz-progress-track').count(),1);
  assert.equal(await page.locator('.quiz-help').count(),1);
  assert.equal(await page.locator('.quiz-instruction').count(),1);
  assert.equal(await page.locator('.quiz-feedback-guide').count(),1);
  assert.equal(await page.locator('.quiz-map-legend').count(),1);
  assert.equal(await page.locator('.quiz-question fieldset').evaluateAll(nodes=>nodes.every(node=>node.getAttribute('aria-describedby')==='quiz-instruction quiz-feedback-guide')),true);
  assert.equal(await page.locator('#quiz-instruction').textContent(),'Bifează toate variantele care răspund cerinței.');
  assert.equal(await page.locator('#quiz-feedback-guide').textContent(),'După verificare: verde — corect bifat; galben — corect omis; roșu — bifat în plus.');
  assert.equal(await page.locator('.quiz-question').first().evaluate(node=>getComputedStyle(node).borderRadius),'24px');
  assert.equal(await page.locator('.quiz-option-wrap').first().evaluate(node=>getComputedStyle(node).borderLeftWidth),'0px');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow at '+width);
  if(width===1440)assert.equal(await page.locator('#sidenav').isVisible(),true,'Desktop keeps the numbered map visible');
  await page.screenshot({path:resolve(output,'quiz-'+width+'.png')});
 }
 await page.locator('.quiz-help summary').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('#quiz-instruction').isVisible(),true,'The shared help is keyboard accessible');
 assert.equal(await page.locator('#quiz-feedback-guide').isVisible(),true);
 await page.screenshot({path:resolve(output,'quiz-help-320.png')});
 await page.locator('.quiz-help summary').click();
 await page.locator('#grila-61 input[value="A"]').check();await page.locator('#grila-61 .quiz-check').click();await page.waitForSelector('#grila-61.is-verified');
 assert.equal(await page.locator('#grila-61 .is-selected-extra').count(),1);
 assert.equal(await page.locator('#grila-61 .is-missed-answer').count(),1);
 assert.equal(await page.locator('#cel-061-a-explanation').isVisible(),true);
 await page.locator('#grila-61').scrollIntoViewIfNeeded();await page.screenshot({path:resolve(output,'quiz-feedback-320.png')});
 assert.deepEqual(errors,[]);await context.close();
 console.log('Quiz surfaces: one summary, shared verbatim help, accessible descriptions, ten-question pages, desktop map, feedback and responsive 320–1440px layout passed.');
} finally {await browser.close();await new Promise(done=>server.close(done));}
