import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import {loadSiteRegistry,publishedResources} from './site-registry.mjs';

const root=resolve(import.meta.dirname,'..'), prefix='/bio-barrons-umf/';
const registry=await loadSiteRegistry(),{chapters,resources}=publishedResources(registry);
const files=[...new Set(['lectii.html',...registry.BIO_SITE.pages.map(p=>p.url),...chapters.map(p=>p.url),...resources.map(p=>p.url)])];
const server=http.createServer(async(req,res)=>{
  try {
    const path=decodeURIComponent(new URL(req.url,'http://local').pathname);
    if(!path.startsWith(prefix))throw Error();
    const file=resolve(root,path.slice(prefix.length)+(path.endsWith('/')?'index.html':''));
    if(!file.startsWith(root+'/'))throw Error();
    const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.ttf':'font/ttf','.webp':'image/webp','.png':'image/png'};
    const content=await readFile(file);
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(content);
  }catch{res.writeHead(404);res.end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}${prefix}`;
const browser=await chromium.launch();
try {
  const context=await browser.newContext({viewport:{width:1440,height:950},serviceWorkers:'block'});
  await context.addInitScript({path:resolve(root,'tests/supabase-mock.js')});
  await context.route('https://**/*',route=>route.abort());
  const page=await context.newPage();
  const errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()===404)missing.push(r.url());});
  for(const file of files){
    await page.goto(base+'nou/'+file);
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('softly-study')),true,file);
    assert.match(await page.locator('body').evaluate(e=>getComputedStyle(e).fontFamily),/Outfit/,file+' uses local Outfit');
    for(const width of [1440,775,390,320]){
      await page.setViewportSize({width,height:900});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${file}: no page overflow at ${width}`);
    }
    const links=await page.locator('.bm-primary-nav a').evaluateAll(links=>links.map(l=>l.href));
    assert.ok(links.every(link=>link.startsWith(base+'nou/')),file+' stays in the Softly edition');
  }
  assert.deepEqual(missing,[],'No missing assets across the complete platform');
  await page.goto(base+'nou/glosar.html');
  assert.match(await page.locator('#glossary-back').getAttribute('href'), /lectii\.html#lab-bento/, 'Glossary pageshow keeps its catalog destination');
  await page.setViewportSize({width:1280,height:900});
  for(const file of ['sistemul_nervos.html','sistemul_renal_complet.html','sistemul_reproducator_masculin.html']){
    await page.goto(base+'nou/'+file);
    const routes=await page.locator('.page-section').evaluateAll(nodes=>nodes.map(n=>n.id.replace('page-','')));
    const link=page.locator(`#sidenav a[href="#${routes[1]}"]`).first();
    if(await link.count())await link.click();
    else await page.locator('#sidenav .nav-link').nth(1).click();
    assert.equal(await page.locator('.page-section.active').count(),1,file+' routes exactly one active section');
  }
  await page.goto(base+'nou/sistemul_nervos.html?q=trunchi&section=sistem-nervos-central&hit=0');
  await page.waitForSelector('.search-found');
  assert.ok(await page.locator('.search-found').count()>0,'Bookmarked search resolves in Softly');
  await page.goto(base+'nou/grile_sistemul_nervos.html#grila-58');
  const question=page.locator('#grila-58');
  await question.locator('input[value="B"]').check();
  await question.locator('.quiz-check').click();
  await page.waitForSelector('#grila-58.is-verified');
  assert.equal(await question.locator('.is-missed-answer').count(),2,'Omitted correct answers remain distinct');
  const state=await page.evaluate(()=>JSON.stringify(BBUserStorage.get('bb.quiz.sistem-nervos.v1')));
  await page.goto(base+'grile_sistemul_nervos.html#grila-58');
  await page.waitForSelector('#grila-58.is-verified');
  assert.equal(await page.evaluate(()=>JSON.stringify(BBUserStorage.get('bb.quiz.sistem-nervos.v1'))),state,'Both editions share genuine progress');
  assert.equal(await page.locator('body.softly-study').count(),0,'Classic appearance remains separate');
  await page.goto(base+'nou/notite.html?capitol=3');
  await page.locator('#pilot-account-toggle').click();
  await page.getByLabel('Email',{exact:true}).fill('ana@example.test');
  await page.getByLabel('Parolă',{exact:true}).fill('test-password');
  await page.locator('#pilot-account-panel').getByRole('button',{name:'Autentifică-te',exact:true}).click();
  await page.waitForFunction(()=>BBAuth.getState().user?.email==='ana@example.test'&&BBCloudSync.getState().status==='synced');
  await page.keyboard.press('Escape');
  await page.locator('#nota-membrana .bb-note-body').fill('Notiță de verificare în varianta Softly.');
  await page.waitForFunction(()=>BBCloudSync.getState().status==='synced');
  await page.reload();
  assert.match(await page.locator('#nota-membrana .bb-note-body').innerText(),/Notiță de verificare/);
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.bm-primary-nav .t-tab').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  await page.emulateMedia({media:'print'});
  assert.equal(await page.locator('.softly-edition-footer').isVisible(),false,'Print excludes edition navigation');
  await page.emulateMedia({media:'screen',reducedMotion:'no-preference'});
  await page.goto(base+'nou/testare.html');
  await page.getByLabel('Introducere în anatomie și fiziologie',{exact:true}).check();
  await page.getByRole('button',{name:'Începe simularea',exact:true}).click();
  await page.waitForURL(/\/nou\/simulare\.html\?test=/);
  await page.waitForSelector('.sim-question');
  assert.equal(await page.locator('.sim-question').count(),10,'Simulation loads shared banks from nested edition');
  assert.deepEqual(errors,[]);
  await context.close();

  // Install both workers, then prove that their scopes and caches coexist offline.
  const offline=await browser.newContext(), p=await offline.newPage();
  await p.goto(base+'testare.html');
  await p.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:60000});
  const classicCache=(await p.evaluate(()=>caches.keys())).find(key=>key.startsWith('biologie-atlas-'));
  const classicLesson=await readFile(resolve(root,'sistemul_nervos.html'),'utf8');
  const classicBridge=classicLesson.match(/src="(assets\/js\/chapter-redesign\.js[^\"]*)"/)[1];
  const oldBridge=(await readFile(resolve(root,'assets/js/chapter-redesign.js'),'utf8')).replace("(document.body.dataset.assetBase || '') + ",'');
  await p.evaluate(async({classicCache,url,source})=>{const cache=await caches.open(classicCache);await cache.put(url,new Response(source,{headers:{'Content-Type':'text/javascript'}}));},{classicCache,url:base+classicBridge,source:oldBridge});
  await p.goto(base+'nou/sistemul_nervos.html');
  assert.equal(await p.locator('.brand-logo-mark').getAttribute('src'),'../assets/logo-mark.svg','First Softly lesson bypasses the old classic bridge before its own worker activates');
  await p.goto(base+'nou/testare.html');
  await p.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.includes('/nou/sw.js'),null,{timeout:60000});
  const cachesBefore=await p.evaluate(()=>caches.keys());
  assert.ok(cachesBefore.some(key=>key.startsWith('biologie-atlas-'))&&cachesBefore.some(key=>key.startsWith('biomed-softly-')));
  const oldCache=cachesBefore.find(key=>key.startsWith('biologie-atlas-'));
  const sharedAsset=base+'assets/js/light-mode.js?v=20260909-editorial1';
  await p.evaluate(async({oldCache,sharedAsset})=>{const cache=await caches.open(oldCache);await cache.put(sharedAsset,new Response('classic-stale-marker'));},{oldCache,sharedAsset});
  await offline.setOffline(true);
  assert.notEqual(await p.evaluate(async url=>(await fetch(url)).text(),sharedAsset),'classic-stale-marker','Softly reads its current cache rather than stale classic assets');
  for(const url of ['nou/sistemul_nervos.html#sistem-nervos-periferic','nou/grile_sistemul_nervos.html?mod=greseli','nou/notite.html?capitol=3','nou/glosar.html','testare.html']){
    await p.goto(base+url);
    assert.ok(await p.locator('main').count(),url+' is available offline');
    assert.equal(await p.locator('body.softly-study').count(),url.startsWith('nou/')?1:0,url+' keeps its edition');
  }
  await offline.close();
  console.log('PASS Softly platform: 41 pages × 4 widths, shared progress, legacy routes, search, canonical feedback, notes/auth mock, simulation, reduced motion, print and both offline editions.');
}finally{await browser.close();await new Promise(done=>server.close(done));}
