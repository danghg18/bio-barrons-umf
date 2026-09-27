import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile, readdir} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {chromium} from 'playwright';

const root = resolve(import.meta.dirname, '..'), prefix = '/bio-barrons-umf/';
const oldAssets = JSON.parse(await readFile(resolve(root,'tests/ui-polish-old-assets.json'),'utf8'));
const oldCache = 'biologie-atlas-ui-polish-previous';
let released = false, upgradeWorker = false;
const server = http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url,'http://local'), relative = url.pathname.slice(prefix.length);
    const file = resolve(root,relative);
    if (!url.pathname.startsWith(prefix) || !file.startsWith(root+sep)) throw Error();
    let body;
    if (relative === 'polish-upgrade.html') body = '<html><body>Previous installation</body></html>';
    else if (!upgradeWorker && relative === 'assets/js/precache-manifest.js') body = 'self.BIO_PRECACHE='+JSON.stringify({cacheName:oldCache,assets:oldAssets})+';';
    else if (!released && oldAssets.includes(relative+url.search)) body = extname(file) === '.css' ? ':root{--bb-stale-ui:stale;}' : 'window.__stalePolishAsset=true;';
    else body = await readFile(file);
    res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'})[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(body);
  } catch {res.writeHead(404);res.end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}${prefix}`, browser=await chromium.launch();
try {
  const pages=(await readdir(root)).filter(file=>file.endsWith('.html'));
  for(const file of pages) {
    const html=await readFile(resolve(root,file),'utf8');
    const urls=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match=>match[1]);
    assert.deepEqual(urls.filter(url=>oldAssets.includes(url)),[],file+' must request updated UI assets');
  }
  const context=await browser.newContext({reducedMotion:'reduce'});
  await context.addInitScript({path:resolve(root,'tests/supabase-mock.js')});
  const page=await context.newPage(), errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'polish-upgrade.html');
  await page.evaluate(async()=>{await navigator.serviceWorker.register('sw.js');await navigator.serviceWorker.ready;});
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  assert.equal(await page.evaluate(async name=>(await (await caches.open(name)).keys()).length,oldCache),oldAssets.length);
  released=true;
  for(const file of pages) {
    await page.goto(base+file);
    await page.waitForLoadState('load');
    assert.equal(await page.evaluate(()=>!!window.__stalePolishAsset),false,file+' must load new scripts');
    assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--bb-stale-ui')),'',file+' must load new styles');
  }
  assert.ok(await page.evaluate(name=>caches.keys().then(names=>names.includes(name)),oldCache),'The original worker stayed installed during all fresh-page checks');
  // Complete the real upgrade before disconnecting: the new worker must cache
  // the versioned scripts/styles, not merely make the HTML shell visible.
  upgradeWorker = true;
  await page.evaluate(async()=>{
    window.__polishWorkerUpdated=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{window.__polishWorkerUpdated=true;},{once:true});
    const registration=await navigator.serviceWorker.getRegistration();
    await registration.update();
  });
  await page.waitForFunction(()=>window.__polishWorkerUpdated===true&&navigator.serviceWorker.controller?.state==='activated');
  assert.equal(await page.evaluate(name=>caches.keys().then(names=>names.includes(name)),oldCache),false,'Updated worker retires the previous cache');
  assert.ok(await page.evaluate(async()=>!!(await caches.match(document.querySelector('link[href^="assets/css/site-redesign.css"]').href))),'Updated UI stylesheet is cached before disconnecting');
  await context.setOffline(true);
  await page.goto(base+'testare.html');
  await page.waitForFunction(()=>document.body.dataset.analyticsReady==='true');
  assert.ok(await page.locator('[name="simulation-chapter"]').count()>0,'Offline Testare initializes the simulation builder');
  await page.goto(base+'glosar.html?letter=Z');
  await page.waitForSelector('.glossary-entry');
  assert.equal(await page.locator('.glossary-entry h2').first().innerText(),'zigot','Offline glossary retains query filtering');
  await page.goto(base+'sistemul_renal_complet.html#nefron');
  await page.waitForFunction(()=>document.body.dataset.bbSharedReady==='true');
  await page.locator('.lesson-search-trigger').click();
  await page.locator('#lesson-search-input').fill('nefron');
  await page.waitForFunction(()=>Number(document.getElementById('lesson-search-count').textContent.split('/')[1])>0);
  const searchButton=await page.locator('#lesson-search-next').boundingBox();
  assert.ok(searchButton.width>=44&&searchButton.height>=44,'Updated search CSS remains available offline');
  assert.deepEqual(errors,[]);
  console.log(`UI cache upgrade: ${pages.length} pages request fresh scripts/styles under the old worker; worker update and functional offline Testare/glossary/legacy search passed.`);
} finally {await browser.close();await new Promise(done=>server.close(done));}
