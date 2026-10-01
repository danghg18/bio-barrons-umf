import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'playwright';
const root=resolve(import.meta.dirname,'..'),prefix='/bio-barrons-umf/';
const cases=[
 ['introducere_anatomie_fiziologie.html','home','introducere'],
 ['celula_si_fiziologia_celulara.html','home','introducere'],
 ['sistemul_reproducator_feminin.html','home','intro'],
 ['sistemul_respirator.html','introducere','anatomie'],
 ['sistemul_digestiv.html','introducere','tractul-gastrointestinal'],
 ['metabolism_si_nutritie.html','introducere','metabolismul-glucidelor'],
 ['sistemul_renal_complet.html','home','rinichii'],
 ['sistemul_reproducator_masculin.html','home','testiculele']
];
const server=http.createServer(async(req,res)=>{try{
 const path=decodeURIComponent(new URL(req.url,'http://local').pathname),file=resolve(root,path.slice(prefix.length));
 if(!path.startsWith(prefix)||!file.startsWith(root+sep))throw Error();
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(await readFile(file));
}catch{res.writeHead(404);res.end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}${prefix}`,browser=await chromium.launch();
try{
 const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 for(const [file,oldRoute,first] of cases){
  for(const suffix of ['', '#'+oldRoute, '#route-does-not-exist', ...(file.includes('renal_complet')||file.includes('masculin')?['?goto='+oldRoute]:[])]){
   await page.goto(base+file+suffix);await page.waitForFunction(()=>document.body.dataset.bbSharedReady==='true');
   assert.equal(await page.locator('.page-section.active').getAttribute('id'),'page-'+first,file+suffix+' opens lesson content');
   assert.equal(await page.locator('#sidenav a[href="#'+oldRoute+'"]').count(),0,'No landing-page item in sidebar');
   assert.equal(await page.locator('.page-section.active p[data-source-page]').first().isVisible(),true,'First lesson prose is visible');
   await page.reload();await page.waitForFunction(()=>document.body.dataset.bbSharedReady==='true');
   assert.equal(await page.locator('.page-section.active').getAttribute('id'),'page-'+first,'Bookmark reload keeps content');
  }
  await page.evaluate(route=>{if(window.BBLessonNavigation)BBLessonNavigation.navigate(route);else goto(route);},oldRoute);
  await page.waitForFunction(id=>document.querySelector('.page-section.active')?.id==='page-'+id,first);
  assert.equal(await page.locator('#sidenav a.active').first().getAttribute('href'),'#'+first,'Active navigation follows resolved route');
  if(await page.evaluate(()=>Boolean(window.BBLessonNavigation))){
   const next=await page.locator('.page-section.active .page-nav a[href^="#"]').last().getAttribute('href');
   await page.locator('.page-section.active .page-nav a[href="'+next+'"]').click();
   await page.waitForFunction(id=>document.querySelector('.page-section.active')?.id==='page-'+id,next.slice(1));
   await page.goBack();await page.waitForFunction(id=>document.querySelector('.page-section.active')?.id==='page-'+id,first);
   await page.goForward();await page.waitForFunction(id=>document.querySelector('.page-section.active')?.id==='page-'+id,next.slice(1));
  }
  console.log('PASS direct lesson entry and legacy bookmarks: '+file);
 }
 await page.setViewportSize({width:390,height:844});
 for(const file of ['introducere_anatomie_fiziologie.html','sistemul_renal_complet.html','sistemul_reproducator_masculin.html']){
  await page.goto(base+file);await page.waitForFunction(()=>document.body.dataset.bbSharedReady==='true');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Mobile lesson fits viewport');
 }
 assert.deepEqual(errors,[]);await context.close();
}finally{await browser.close();await new Promise(done=>server.close(done));}
