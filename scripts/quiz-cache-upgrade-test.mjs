import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import http from 'node:http';
import {extname, resolve, sep} from 'node:path';
import {chromium} from 'playwright';
import {loadSiteRegistry, publishedResources} from './site-registry.mjs';

const root=resolve(import.meta.dirname,'..'), prefix='/bio-barrons-umf/';
const [registry, sourceMap]=await Promise.all([
 loadSiteRegistry(), readFile(resolve(root,'data/quiz-source-map.json'),'utf8').then(JSON.parse)
]);
const published=publishedResources(registry).resources.filter(resource=>resource.kind==='quiz');
const sets=sourceMap.filter(set=>set.publicationStatus!=='deferred');
const numbersFor=set=>set.ranges.flatMap(([start,end])=>Array.from({length:end-start+1},(_,index)=>start+index));
assert.equal(sets.length,17,'Exactly 17 chapter sets are active; XIII is deferred');
assert.equal(sets.reduce((total,set)=>total+numbersFor(set).length,0),1590);
assert.deepEqual(Array.from(published,resource=>resource.url).sort(),sets.map(set=>set.url).sort(),'Registry and active source map agree');
const oldAssets=[
 'assets/js/chapters-data.js?v=20260909-editorial1',
 'assets/js/quiz-index.js?v=20260911-accounts1',
 'assets/js/quiz-player.js?v=20260911-accounts1',
 'assets/js/chapters-data.js?v=20260925-endocrin1',
 'assets/js/quiz-index.js?v=20260926-simulation1',
 'assets/js/quiz-player.js?v=20260925-endocrin1'
];
const cacheName='biologie-atlas-upgrade-test-old';
// Use the real cache-first worker, with the old release's exact asset URLs.
// Marker bodies make any reuse of the incompatible cached scripts observable.
let released=false;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const server=http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost'), relative=url.pathname.slice(prefix.length);
 const file=resolve(root,relative||'index.html');
 if(!url.pathname.startsWith(prefix)||!file.startsWith(root+sep))throw Error();
 let body;
 if(relative==='upgrade-test.html')body='<html><body>Previous installation</body></html>';
 else if(relative==='assets/js/precache-manifest.js')body='self.BIO_PRECACHE='+JSON.stringify({cacheName,assets:oldAssets})+';';
 else if(!released&&oldAssets.includes(relative+url.search))body='window.__staleQuizAsset=true;';
 else body=await readFile(file);
 res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
}catch{res.writeHead(404);res.end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}${prefix}`;
const browser=await chromium.launch({headless:true});
try {
 // Every entry shell must request fresh registry/index/player URLs, including
 // lessons and the catalog a returning student will visit before the new quiz.
 for(const file of (await readdir(root)).filter(name=>name.endsWith('.html'))){
  const html=await readFile(resolve(root,file),'utf8');
  for(const old of oldAssets)assert.ok(!html.includes(old),`${file} still requests ${old}`);
 }
 const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'upgrade-test.html');
 await page.evaluate(async()=>{await navigator.serviceWorker.register('sw.js');await navigator.serviceWorker.ready;});
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 assert.equal(await page.evaluate(async()=>{const cache=await caches.open('biologie-atlas-upgrade-test-old');return (await cache.keys()).length;}),oldAssets.length);
 released=true;
 // A successful fetch of the old URLs must still return the poisoned cache
 // bodies. Otherwise fresh-page checks could pass without a cache-first worker.
 for(const asset of oldAssets){
  const cached=await page.evaluate(async url=>(await fetch(url)).text(),base+asset);
  assert.equal(cached,'window.__staleQuizAsset=true;',asset+' remains cache-first');
 }
 await page.goto(base+'testare.html');
 const expectedIndex=sets.map(set=>({url:set.url,storageKey:set.storageKey,numbers:numbersFor(set)})).sort((a,b)=>a.url.localeCompare(b.url));
 async function assertFreshCatalogAndIndex(){
  assert.equal(await page.evaluate(()=>!!window.__staleQuizAsset),false,'No stale registry, index or player was executed');
  const index=await page.evaluate(()=>BB_QUIZ_INDEX.map(set=>({url:set.url,storageKey:set.storageKey,numbers:set.questions.map(q=>q.number)})).sort((a,b)=>a.url.localeCompare(b.url)));
  assert.deepEqual(index,expectedIndex,'All 17 index entries expose the current 1,590 source numbers');
  const registered=await page.evaluate(()=>CHAPTERS.filter(chapter=>chapter.done).flatMap(chapter=>chapter.resources||[]).filter(resource=>resource.kind==='quiz').map(resource=>resource.url).sort());
  assert.deepEqual(registered,sets.map(set=>set.url).sort(),'No stale chapter registry');
 }
 await assertFreshCatalogAndIndex();
 assert.equal(await page.locator('#lab-testing-catalog .lab-item-done').count(),sets.length);
 for(const set of sets){
  const {url:file,lessonUrl:lesson,storageKey:key}=set, numbers=numbersFor(set);
  await page.goto(base+'testare.html');await page.locator(`#lab-testing-catalog a[href="${file}"]`).click();
  await page.waitForURL(base+file);await page.waitForLoadState('load');
  await page.waitForFunction(()=>document.body.dataset.bbSharedReady==='true');
  assert.equal(await page.locator('.quiz-fatal').count(),0);
  assert.equal(await page.locator('.quiz-question').count(),numbers.length,file+' exact question count');
  assert.deepEqual(await page.locator('.quiz-question').evaluateAll(cards=>cards.map(card=>Number(card.id.slice('grila-'.length)))),numbers,file+' original source numbering');
  assert.equal(await page.evaluate(()=>(window.BB_QUIZ||window.BB_NERVOUS_QUIZ).storageKey),key);
  assert.equal(await page.locator('.lab-topbar-back').getAttribute('href'),lesson);
  await assertFreshCatalogAndIndex();
  const first=page.locator('.quiz-question').first();
  await first.locator('input[value="A"]').check();
  await page.reload();assert.ok(await first.locator('input[value="A"]').isChecked(),file+' saves an unverified selection');
  await first.locator('.quiz-check').click();
  await page.waitForFunction(()=>document.querySelector('.quiz-question')?.classList.contains('is-verified'));
  assert.equal(await first.locator('.quiz-option-explanation:visible').count(),5,file+' current player reveals all five explanations');
  await page.reload();
  assert.ok(await first.locator('input[value="A"]').isChecked(),file+' keeps the verified selection');
  assert.ok(await first.evaluate(card=>card.classList.contains('is-verified')),file+' keeps verification after reload');
  assert.equal(await first.locator('.quiz-option-explanation:visible').count(),5,file+' keeps explanations after reload');
  await assertFreshCatalogAndIndex();
  assert.equal(await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();return !!reg.active&&(await caches.keys()).includes('biologie-atlas-upgrade-test-old');}),true);
 }
 assert.deepEqual(errors,[]);await context.close();
 console.log('Existing cache-first worker: 17 active sets / 1,590 questions, fresh registry/index/player, catalog links, source numbering, backlinks, five explanations and save/reload passed before worker upgrade; XIII deferred.');
} finally {await browser.close();await new Promise(done=>server.close(done));}
