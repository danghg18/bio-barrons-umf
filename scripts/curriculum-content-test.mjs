import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {loadSiteRegistry} from './site-registry.mjs';
const root=resolve(import.meta.dirname,'..');
const curriculum=JSON.parse(await readFile(resolve(root,'data/curriculum-2025.json'),'utf8'));
const legacy=JSON.parse(await readFile(resolve(root,'tests/curriculum-legacy-anchors.json'),'utf8'));
const registry=await loadSiteRegistry();
const browser=await chromium.launch();
try{
 const page=await browser.newPage();
 assert.deepEqual([...registry.CHAPTERS].map(c=>c.num),curriculum.chapters.map(c=>c.number));
 for(const source of curriculum.chapters){
  const record=registry.CHAPTERS.find(c=>c.num===source.number);
  assert.equal(record.done,true,`Chapter ${source.number} must be available only after source review`);
  assert.equal(record.url,source.url);
  const html=await readFile(resolve(root,source.url),'utf8');
  const dom=await page.evaluate(html=>{
   const doc=new DOMParser().parseFromString(html,'text/html');
   const sections=[...doc.querySelectorAll('.page-section')];
   return {ids:[...doc.querySelectorAll('[id]')].map(x=>x.id),routes:sections.map(s=>({id:s.id,nested:Boolean(s.parentElement.closest('.page-section')),inMain:Boolean(s.closest('main'))})),
    sourcePages:[...doc.querySelectorAll('[data-source-page]')].map(n=>n.dataset.sourcePage),
    remoteImages:[...doc.querySelectorAll('main img')].filter(i=>/^https?:/.test(i.getAttribute('src'))).map(i=>i.src),
    figures:[...doc.querySelectorAll('main figure')].map(f=>({caption:f.querySelector('figcaption')?.textContent.trim(),src:f.querySelector('img')?.getAttribute('src'),alt:f.querySelector('img')?.getAttribute('alt')})),
    excludedNav:[...doc.querySelectorAll('#sidenav a[href^="#"],.lab-nav a[href^="#"]')].filter(a=>doc.getElementById('page-'+a.hash.slice(1))?.hasAttribute('data-curriculum-excluded')).map(a=>a.hash)};
  },html);
  assert.equal(new Set(dom.ids).size,dom.ids.length,`${source.url}: duplicate IDs`);
  assert.ok(dom.routes.length,`${source.url}: no lesson routes`);
  assert.ok(dom.routes.every(r=>!r.nested&&r.inMain),`${source.url}: nested or misplaced lesson sections`);
  for(const id of legacy[source.url]?.ids||[])assert.ok(dom.ids.includes(id),`${source.url}: legacy anchor ${id} lost`);
  assert.ok(dom.sourcePages.length,`${source.url}: no printed source-page provenance`);
  for(const value of dom.sourcePages){
   const numbers=value.match(/\d+/g)?.map(Number)||[];
   assert.ok(numbers.length&&numbers.every(n=>n>=source.printedPages[0]&&n<=source.printedPages[1]),`${source.url}: out-of-scope printed page ${value}`);
  }
  assert.deepEqual(dom.remoteImages,[],`${source.url}: figures must be local for offline study`);
  assert.deepEqual(dom.excludedNav,[],`${source.url}: excluded route remains in study navigation`);
  for(const fig of dom.figures){assert.ok(fig.caption&&fig.alt&&fig.src,`${source.url}: figure missing caption/alt/image`);assert.ok((await stat(resolve(root,fig.src))).isFile());}
  if(source.number===19)assert.ok(!dom.figures.some(f=>/Figura\s*19[.,]10\b/i.test(f.caption)),'Excluded Figure 19.10 must not be imported');
  console.log(`PASS chapter ${source.number}: routes, source references, local figures and preserved anchors`);
 }
}finally{await browser.close();}
