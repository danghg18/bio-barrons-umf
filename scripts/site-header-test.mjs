import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import {loadSiteRegistry,publishedResources} from './site-registry.mjs';
import {toggleReadingSettings} from './header-test-helpers.mjs';
const root=resolve(import.meta.dirname,'..'),prefix='/bio-barrons-umf/';
const registry=await loadSiteRegistry(),{chapters,resources}=publishedResources(registry);
const classic=[...new Set(['index.html',...registry.BIO_SITE.pages.map(p=>p.url),...chapters.map(p=>p.url),...resources.map(p=>p.url)])];
const files=[...classic,'nou/index.html',...classic.map(f=>'nou/'+(f==='index.html'?'lectii.html':f))];
const server=http.createServer(async(req,res)=>{try{
 const path=decodeURIComponent(new URL(req.url,'http://local').pathname),file=resolve(root,path.slice(prefix.length));
 if(!path.startsWith(prefix)||!file.startsWith(root+'/'))throw Error();
 const body=await readFile(file);res.writeHead(200,{'Content-Type':({'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.json':'application/json','.ttf':'font/ttf'})[extname(file)]||'application/octet-stream'});res.end(body);
}catch{res.writeHead(404);res.end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}${prefix}`,browser=await chromium.launch();
try{
 const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce',viewport:{width:1440,height:900}});
 await context.route('https://**/*',route=>route.abort());
 await context.addInitScript({path:resolve(root,'tests/supabase-mock.js')});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const file of files){
  await page.setViewportSize({width:1440,height:900});await page.goto(base+file);await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('#bb-site-header').count(),1,file+' has one shared header');
  assert.equal(await page.locator('#bb-site-header .bb-header-account').count(),1,file+' has one account entry after all controllers mount');
  if(await page.evaluate(()=>!!window.BBAccountUI))assert.equal(await page.locator('#pilot-account-toggle.bb-header-account').count(),1,file+' reuses the real account button');
  const homepage = file === 'index.html' || file === 'nou/index.html';
  assert.equal(await page.locator('#bb-site-header .bb-header-cta').count(), homepage ? 1 : 0, file+' homepage-only CTA');
  if(homepage) assert.equal(await page.locator('#bb-site-header .bb-header-cta').evaluate(n=>getComputedStyle(n).color),'rgb(255, 255, 255)',file+' CTA contrast');
  else assert.equal(await page.locator('#bb-site-header .bb-header-account span').isVisible(),false,file+' icon-only account');
  assert.ok(await page.locator('#bb-site-header .bb-header-account').getAttribute('aria-label'),file+' accessible account name');
  for(const width of [1440,1120,1000,775,390,320]){
   await page.setViewportSize({width,height:900});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),file+' no overflow at '+width);
   const covered=await page.locator('#bb-site-header a:visible,#bb-site-header button:visible').evaluateAll(nodes=>nodes.filter(n=>{const r=n.getBoundingClientRect();return r.width&&r.height&&!n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}).map(n=>n.textContent||n.getAttribute('aria-label')));
   assert.deepEqual(covered,[],file+' reachable controls at '+width);
  }
  await page.locator('#menu-toggle').click();
  const destinations=await page.locator('#mobile-menu .bb-header-links a').evaluateAll(ns=>ns.map(n=>n.href));
  assert.equal(destinations.length,5,file+' complete mobile navigation');
  assert.ok(destinations.every(url=>url.startsWith(base+(file.startsWith('nou/')?'nou/':''))&&!url.includes('/nou/nou/')),file+' retains edition');
  await page.locator(homepage ? '#mobile-menu .bb-header-cta' : '#mobile-menu .bb-header-account-action').focus();await page.keyboard.press('Tab');
  assert.equal(await page.locator('#mobile-menu').evaluate(n=>n.contains(document.activeElement)),true,file+' native dialog contains keyboard focus');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#menu-toggle').evaluate(n=>n===document.activeElement),true,file+' restores focus');
 }
 for(const edition of ['', 'nou/'])for(const file of ['sistemul_nervos.html','sistemul_renal_complet.html','sistemul_reproducator_masculin.html','grile_sistemul_nervos.html']){
  await page.goto(base+edition+file);await toggleReadingSettings(page);
  assert.equal(await page.locator('#bb-sidebar-settings-panel').isVisible(),true,'Menu opens the existing settings');
  assert.equal(await page.locator('#bb-sidebar-settings-panel').evaluate(n=>n.contains(document.activeElement)),true,'Keyboard enters the panel');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#bb-sidebar-settings-panel').isVisible(),false);
  assert.equal(await page.locator('#menu-toggle').evaluate(n=>n===document.activeElement),true,'Settings returns focus to a visible entry');
  await page.locator('#menu-toggle').click();await page.setViewportSize({width:1440,height:900});
  await page.waitForFunction(()=>!document.querySelector('#mobile-menu').open);
  assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false','Resizing to desktop closes the mobile menu');
  await page.evaluate(()=>scrollTo(0,600));await page.waitForFunction(()=>document.querySelector('#bb-site-header').classList.contains('is-scrolled'));
  assert.equal(Math.round(await page.locator('#bb-site-header').evaluate(n=>n.getBoundingClientRect().width)),1120,'Desktop compacts at scroll');
  await page.emulateMedia({media:'print'});assert.equal(await page.locator('#bb-site-header').isVisible(),false,'Header stays out of print');await page.emulateMedia({media:'screen'});
  await page.setViewportSize({width:320,height:900});
 }
 assert.deepEqual(errors,[]);
 console.log(`PASS Efferd header: ${files.length} pages × 6 widths, single account, contrast, edition links, keyboard menu, legacy settings, resize, scroll and print.`);
}finally{await browser.close();await new Promise(done=>server.close(done));}
