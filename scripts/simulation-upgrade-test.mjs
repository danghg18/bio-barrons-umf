import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import http from 'node:http';
import {extname,resolve,sep} from 'node:path';
import {chromium} from 'playwright';
const root=resolve(import.meta.dirname,'..'),prefix='/bio-barrons-umf/';
const oldAssets=['assets/js/quiz-index.js?v=20260925-endocrin1','assets/js/user-storage.js?v=20260911-accounts1'];
const cacheName='biologie-atlas-simulation-upgrade-old';let released=false;
const server=http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://local'),relative=url.pathname.slice(prefix.length),file=resolve(root,relative);
 if(!url.pathname.startsWith(prefix)||!file.startsWith(root+sep))throw Error();
 let body;
 if(relative==='simulation-upgrade.html')body='<html><body>Previous installation</body></html>';
 else if(relative==='assets/js/precache-manifest.js')body='self.BIO_PRECACHE='+JSON.stringify({cacheName,assets:oldAssets})+';';
 else if(!released&&oldAssets.includes(relative+url.search))body='window.__oldSimulationDependency=true;';
 else body=await readFile(file);
 res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
}catch{res.writeHead(404);res.end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));const base=`http://127.0.0.1:${server.address().port}${prefix}`;
const browser=await chromium.launch();
try{
 for(const file of (await readdir(root)).filter(file=>file.endsWith('.html'))){
  const html=await readFile(resolve(root,file),'utf8');
  for(const old of oldAssets)assert.ok(!html.includes(old),`${file} retains an incompatible cached asset`);
 }
 const context=await browser.newContext(),page=await context.newPage();
 await page.goto(base+'simulation-upgrade.html');await page.evaluate(async()=>{await navigator.serviceWorker.register('sw.js');await navigator.serviceWorker.ready;});await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 released=true;await page.goto(base+'testare.html');await page.waitForSelector('[name="simulation-chapter"]');
 assert.equal(await page.evaluate(()=>!!window.__oldSimulationDependency),false);
 await page.getByLabel('Introducere în anatomie și fiziologie',{exact:true}).check();await page.getByRole('button',{name:'Începe simularea',exact:true}).click();await page.waitForURL(/simulare.html/);await page.waitForSelector('.sim-question');
 assert.equal(await page.evaluate(()=>!!window.__oldSimulationDependency),false);
 await page.evaluate(()=>{BBUserStorage.activate('upgrade-user');BBUserStorage.set('bb.simulation.v1:migration',{version:1,id:'migration',owner:'upgrade-user',status:'active'});BBUserStorage.hydrate({});});
 assert.equal(await page.evaluate(()=>Object.keys(BBUserStorage.snapshot().pending).some(key=>key.startsWith('bb.simulation.'))),true);
 assert.ok(await page.evaluate(name=>caches.keys().then(keys=>keys.includes(name)),cacheName),'Original cache-first worker remains installed during first-visit verification');
 await context.close();console.log('Simulation upgrade: old installed cache-first worker cannot supply stale index/storage; local results enter the new owner-scoped cloud outbox.');
}finally{await browser.close();await new Promise(done=>server.close(done));}
