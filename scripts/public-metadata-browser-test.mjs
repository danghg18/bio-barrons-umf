import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import http from 'node:http';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'playwright';
const root=resolve(import.meta.dirname,'..'),prefix='/bio-barrons-umf/';
const server=http.createServer(async(req,res)=>{try{
 const path=new URL(req.url,'http://local').pathname,file=resolve(root,path.slice(prefix.length));
 if(!path.startsWith(prefix)||!file.startsWith(root+sep))throw Error();
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');
 res.end(await readFile(file));
}catch{res.writeHead(404);res.end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}${prefix}`,browser=await chromium.launch();
try{
 for(const javaScriptEnabled of [true,false])for(const width of [1440,390]){
  const context=await browser.newContext({javaScriptEnabled,serviceWorkers:'block',viewport:{width,height:900}}),page=await context.newPage();
  await page.goto(base+'testare.html');
  if(javaScriptEnabled)await page.waitForFunction(()=>window.BB_QUIZ_INDEX&&window.BBSimulationCore);
  assert.equal(await page.locator('[data-chapter="8"] .lab-item-tags').textContent(),'155 de grile','Discontinuous source ranges must not undercount the actual published dataset');
  assert.equal(await page.locator('#lab-testing-count').textContent(),'18 seturi disponibile · 1990 de grile');
  assert.equal(await page.locator('#lab-testing-catalog a.lab-item').count(),18);
  assert.equal(await page.locator('#lab-testing-catalog button.lab-item').count(),0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.goto(base+'index.html');
  assert.equal(await page.locator('.lab-home-catalog a.lab-item').count(),17);
  assert.equal(await page.locator('meta[name="description"]').getAttribute('content'),await page.locator('meta[property="og:description"]').getAttribute('content'));
  assert.match(await page.locator('.pilot-hero-note').textContent(),/Acces gratuit/);
  await context.close();
 }
 console.log('Public metadata browser: desktop/mobile catalogs and counts, with and without JavaScript, passed.');
}finally{await browser.close();await new Promise(done=>server.close(done));}
