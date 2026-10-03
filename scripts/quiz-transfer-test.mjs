import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import http from 'node:http';
import {extname, resolve, sep} from 'node:path';
import {chromium} from 'playwright';
const root=resolve(import.meta.dirname,'..'), prefix='/bio-barrons-umf/';
const numbers=[61,62,63,64,150], from='bb.quiz.sistemul-endocrin.v1', to='bb.quiz.metabolism.v1';
const sourceFile='grile_sistemul_endocrin.html', targetFile='grile_metabolism_si_nutritie.html';
const key=JSON.parse(await readFile(resolve(root,'tests/endocrin-metabolism-answer-key.json'),'utf8'));
const answers=Object.fromEntries(numbers.map(n=>['end-'+String(n).padStart(3,'0'),{selected:[...key[n-1]],verified:true,correct:true}]));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{try{
 const path=new URL(req.url,'http://localhost').pathname, file=resolve(root,path.slice(prefix.length)||'index.html');
 if(!path.startsWith(prefix)||!file.startsWith(root+sep))throw Error();
 res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});res.end(await readFile(file));
}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}${prefix}`;
const browser=await chromium.launch();
try {
 const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce'}), page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+sourceFile);
 await page.evaluate(({from,answers})=>BBUserStorage.set(from,{version:1,questions:answers}),{from,answers});
 // A different endocrine answer must not delete the relocated saved answers.
 await page.locator('#grila-1 input[value="A"]').check();
 for(const [id,answer] of Object.entries(answers))assert.deepEqual((await page.evaluate(k=>BBUserStorage.get(k),from)).questions[id],answer);
 // Statistics must recover progress even before the destination quiz is opened.
 await page.goto(base+'statistici.html');
 const report=await page.evaluate(()=>BBQuizAnalytics.getReport());
 assert.equal(report.quizzes.find(q=>q.storageKey===to).current.verified,5,'Transferred answers are visible on a direct statistics visit');
 for(const n of numbers){
  await page.goto(base+sourceFile+'#grila-'+n);
  await page.waitForURL(base+targetFile+'#grila-'+n);
  assert.ok(await page.locator('#grila-'+n+'.is-correct').isVisible(),'Old link and saved answer survive: '+n);
 }
 await page.goto(base+sourceFile+'?q=chilomicronii&section=grile-61-64&hit=0');
 await page.waitForURL(url=>url.pathname.endsWith(targetFile));
 await page.waitForSelector('.page-section.active .search-found');
 assert.equal(new URL(page.url()).searchParams.get('q'),'chilomicronii');
 await page.goto(base+sourceFile+'#grile-61-64');
 await page.waitForURL(base+targetFile+'#grile-61-64');
 // Persisting a normal metabolism edit materializes the transferred answers.
 await page.goto(base+targetFile+'#grila-65');
 await page.locator('#grila-65 input[value="A"]').check();
 for(const id of Object.keys(answers))assert.equal((await page.evaluate(k=>BBUserStorage.get(k),to)).questions[id].verified,true);
 // A restart deliberately suppresses the legacy fallback, including after reload.
 await page.locator('.quiz-reset-start').click();await page.locator('.quiz-reset-confirm').click();
 await page.waitForFunction(()=>document.querySelectorAll('.quiz-question.is-verified').length===0);
 await page.reload();assert.equal(await page.locator('.quiz-question.is-verified').count(),0);
 for(const [id,answer] of Object.entries(answers))assert.deepEqual((await page.evaluate(k=>BBUserStorage.get(k),from)).questions[id],answer,'Historical source is retained');
 // Same-owner hydration can deliver the source later; other owners cannot see it.
 await page.evaluate(()=>{BBUserStorage.activate('transfer-first-owner');BBUserStorage.activate('transfer-other-owner');});
 assert.equal(await page.evaluate(k=>BBUserStorage.get(k),from),null);
 assert.equal(await page.locator('.quiz-question.is-verified').count(),0);
 await page.evaluate(({from,answers})=>BBUserStorage.hydrate({[from]:{version:1,questions:answers}}),{from,answers});
 await page.waitForFunction(()=>document.querySelectorAll('.quiz-question.is-correct').length===5);
 assert.deepEqual(errors,[]);
 await context.close();
 // The generated /nou/ edition must use relative destinations as well.
 const other=await browser.newContext({serviceWorkers:'block'}), p=await other.newPage();
 await p.goto(base+'nou/'+sourceFile+'#grila-150');
 await p.waitForURL(base+'nou/'+targetFile+'#grila-150');
 assert.ok(await p.locator('#grila-150').isVisible());
 await other.close();
 console.log('Quiz transfer: legacy links/search, same-owner saved progress, source preservation, reset/reload and /nou/ passed.');
} finally {await browser.close();await new Promise(r=>server.close(r));}
