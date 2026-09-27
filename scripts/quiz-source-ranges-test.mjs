import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import http from 'node:http';
import {extname, resolve, sep} from 'node:path';
import {chromium} from 'playwright';

// A quiz split across source ranges must render without renumbering, while
// missing, duplicate or unordered questions must still be rejected.
const root=resolve(import.meta.dirname,'..'), prefix='/bio-barrons-umf/';
const sandbox={window:{}};
vm.runInNewContext(await readFile(resolve(root,'assets/js/grile-celula-data.js'),'utf8'),sandbox);
const fixture=JSON.parse(JSON.stringify(sandbox.window.BB_QUIZ));
fixture.questions=fixture.questions.filter(q=>[61,62,100,110].includes(q.number));
fixture.questionCount=4;
fixture.ranges=[{id:'grile-61-62',start:61,end:62},{id:'grile-100-100',start:100,end:100},{id:'grile-110-110',start:110,end:110}];
const html=(await readFile(resolve(root,'grile_celula.html'),'utf8')).replace(/    <div class="page-section[\s\S]*?(?=  <\/main>)/,fixture.ranges.map((r,i)=>`    <div class="page-section${i?'':' active'}" id="page-${r.id}"></div>\n`).join(''));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
let current=fixture;
const server=http.createServer(async(req,res)=>{try{
 const path=new URL(req.url,'http://localhost').pathname;
 const file=resolve(root,path.slice(prefix.length)||'index.html');
 if(!path.startsWith(prefix)||!file.startsWith(root+sep))throw Error();
 const body=path.endsWith('/grile_celula.html')?html:path.endsWith('/grile-celula-data.js')?`window.BB_QUIZ=${JSON.stringify(current)};`:await readFile(file);
 res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(body);
}catch{res.writeHead(404);res.end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}${prefix}`;
const browser=await chromium.launch({headless:true});
try {
 const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce'});
 const page=await context.newPage();
 await page.goto(base+'grile_celula.html#grila-100');
 await page.waitForFunction(()=>document.body.dataset.bbSharedReady==='true');
 assert.equal(await page.locator('.quiz-fatal').count(),0,'disjoint source ranges must be accepted');
 assert.equal(await page.locator('.quiz-question').count(),4);
 assert.equal(await page.locator('.page-section.active').getAttribute('id'),'page-grile-100-100');
 await page.locator('.quiz-question-map a[href="#grila-62"]').click();
 assert.equal(await page.locator('.page-section.active').getAttribute('id'),'page-grile-61-62');
 await page.locator('.quiz-page-nav a[href="#grile-100-100"]').first().click();
 assert.equal(await page.locator('.page-section.active').getAttribute('id'),'page-grile-100-100');
 for(const [name,mutate] of [
   ['missing',q=>{q.questions.splice(1,1);q.questionCount=3;}],
   ['duplicate',q=>{q.questions[2]=q.questions[1];}],
   ['unordered',q=>{[q.questions[0],q.questions[1]]=[q.questions[1],q.questions[0]];}],
   ['overlapping',q=>{q.ranges[1].start=62;}],
   ['wrong first number',q=>{q.firstNumber=60;}]
 ]){
   current=structuredClone(fixture);mutate(current);
   await page.reload();
   assert.equal(await page.locator('.quiz-fatal').count(),1,`${name} source data must fail closed`);
 }
 console.log('Disjoint source ranges render and navigate; missing, duplicate, unordered and overlapping source numbers are rejected.');
} finally {await browser.close();await new Promise(done=>server.close(done));}
