import { chromium } from 'playwright';
import http from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSiteRegistry, publishedResources } from './site-registry.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const prefix = '/bio-barrons-umf/';
const mime = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.xml':'application/xml' };
let serveLegacyWorker = false;
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname.replace(/^\//, '');
    if (serveLegacyWorker && relative === 'sw.js') {
      response.writeHead(200, { 'content-type':'text/javascript', 'cache-control':'no-store' });
      response.end("const CACHE='biologie-atlas-v16';self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',()=>{});");
      return;
    }
    const target = normalize(join(root, relative || 'index.html'));
    if (!target.startsWith(root)) throw new Error('outside root');
    const body = await readFile(target);
    response.writeHead(200, { 'content-type': mime[extname(target)] || 'application/octet-stream', 'cache-control':'no-store' });
    response.end(body);
  } catch {
    response.writeHead(404); response.end('Not found');
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const base = `http://127.0.0.1:${port}${prefix}`;
const registry = await loadSiteRegistry();
const { chapters, resources } = publishedResources(registry);
const lessonFiles = chapters.map(chapter => chapter.url);
const simpleLessons = lessonFiles.filter(file => !['sistemul_renal_complet.html','sistemul_reproducator_masculin.html'].includes(file));
const errors = [];
const browser = await chromium.launch({ headless: true });

async function newPage(context) {
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error' && !/fonts\.(googleapis|gstatic)\.com/.test(message.text())) errors.push(`${page.url()}: ${message.text()}`);
  });
  return page;
}

// All screenshots are optional local evidence, outside production paths.
const output = process.env.BB_UI_OUTPUT;
if (output) await mkdir(output, { recursive: true });
const { createHash } = await import('node:crypto');
const hash = value => createHash('sha256').update(value).digest('hex');
const protectedContent = JSON.parse(await readFile(join(root, 'tests/educational-content.json'), 'utf8'));
const viewports = [[1440,900],[1280,800],[1024,768],[390,844],[430,932],[640,900],[641,900],[768,1024],[1023,768],[1025,768]];
const report = { viewports, pages: [], tables: 0, fonts: {}, screenshots: [] };
async function resize(page, size) {
  await page.setViewportSize(size);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function capture(page, name) {
  if (!output) return;
  await page.waitForTimeout(250);
  await page.screenshot({path:join(output,name+'.png'), animations:'disabled'}); report.screenshots.push(name+'.png');
}
try {
 const context = await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce'});
 const page = await newPage(context);
 for (const file of ['index.html', ...(registry.BIO_SITE.pages || []).map(r=>r.url), ...lessonFiles, ...resources.map(r=>r.url)]) {
  await page.goto(base+file); await page.evaluate(()=>document.fonts.ready);
  // The feedback legend is new interface copy; retain the existing educational-text baseline.
  const sections = await page.evaluate(()=>[...document.querySelectorAll('.page-section')].map(x=>{const copy=x.cloneNode(true);copy.querySelectorAll('.quiz-feedback-guide').forEach(node=>node.remove());return {id:x.id,text:copy.textContent.replace(/\s+/g,' ').trim(),images:[...x.querySelectorAll('img')].map(i=>i.getAttribute('src')),tables:[...x.querySelectorAll('table')].map(t=>t.textContent.replace(/\s+/g,' ').trim())};}));
  if (protectedContent[file]) {
   const actual = sections.map(s=>({...s,text:hash(s.text),tables:s.tables.map(hash)}));
   if(JSON.stringify(actual)!==JSON.stringify(protectedContent[file])) errors.push(file+': protected content changed');
  }
  const font = await page.evaluate(async()=>{const glyphs='ăâîșțĂÂÎȘȚ';const sans=await document.fonts.load('400 16px Figtree',glyphs);const serif=await document.fonts.load('italic 400 48px Fraunces',glyphs);return {body:getComputedStyle(document.body).fontFamily,figtree:sans.length>0&&document.fonts.check('400 16px Figtree',glyphs),fraunces:serif.length>0&&document.fonts.check('italic 400 48px Fraunces',glyphs)};});
  report.fonts[file]=font;if(!font.figtree||!font.fraunces||!font.body.includes('Figtree'))errors.push(file+': fonts did not load');
  for (const [width,height] of viewports) {
   await resize(page, {width,height});
   for (const section of sections.length?sections:[{id:null}]) {
    if(section.id)await page.evaluate(id=>{const r=id.slice(5);if(window.BBLessonNavigation)BBLessonNavigation.navigate(r,{focus:false});else window.goto(r);},section.id);
    const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,tableErrors:[...document.querySelectorAll('.page-section.active table')].filter(t=>t.classList.contains('bb-table-stacked')&&innerWidth<=640&&t.getBoundingClientRect().width>t.closest('.table-wrap').getBoundingClientRect().width+1).length,broken:[...document.querySelectorAll('img')].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)}));
    if(geometry.overflow||geometry.tableErrors||geometry.broken.length)errors.push(file+' '+section.id+' @'+width+': '+JSON.stringify(geometry));
   }
   // Default-route evidence after the full route sweep.
   if(width===1440||width===390){await page.goto(base+file);await page.evaluate(()=>document.fonts.ready);await capture(page,file+'-'+width);}
  }
  report.pages.push(file);
  report.tables+=await page.locator('table').count();
 }
 // Old preference values and failed storage cannot activate a theme or stop startup.
 for (const value of ['1','0',null,'blocked']) {
  const isolated=await browser.newContext({serviceWorkers:'block'});
  await isolated.addInitScript(value=>{if(value==='blocked'){Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError');}});}else if(value!==null)localStorage.setItem('darkMode',value);},value);
  const p=await newPage(isolated);
  for(const file of report.pages){await p.goto(base+file);if(file!=='index.html')await p.waitForFunction(()=>document.body.dataset.bbSharedReady==='true');const state=await p.evaluate(()=>({dark:document.body.classList.contains('dark'),controls:document.querySelectorAll('#dm-btn,#nav-dm-btn,#sfab-dm').length,bg:getComputedStyle(document.body).backgroundColor}));if(state.dark||state.controls||state.bg!=='rgb(244, 246, 250)')errors.push(file+' preference '+value+': '+JSON.stringify(state));}
  await isolated.close();
 }
 await resize(page, {width:390,height:844});
 await page.goto(base+'index.html');await page.locator('#search-btn').click();await page.locator('#palette-input').fill('țesut nervos');await page.waitForTimeout(350);await capture(page,'global-search');await page.keyboard.press('Escape');if(await page.locator('.lab').evaluate(x=>x.inert))errors.push('global search left inert');
 await page.locator('#lab-bento').scrollIntoViewIfNeeded();await capture(page,'curriculum-mobile');
 await resize(page, {width:1440,height:900});await page.locator('#lab-bento').scrollIntoViewIfNeeded();await capture(page,'curriculum-desktop');
 for(const file of [...lessonFiles,...resources.map(r=>r.url)]){
  await resize(page, {width:390,height:844});await page.goto(base+file);
  await page.locator('.lab-menu-trigger').click();await page.waitForFunction(()=>document.getElementById('sidenav').getBoundingClientRect().left>=0);await capture(page,file+'-drawer');
  await page.keyboard.press('Shift+Tab');if(!await page.locator('#sidenav').evaluate(x=>x.contains(document.activeElement)))errors.push(file+': reverse focus escaped drawer');
  await page.keyboard.press('Tab');await page.keyboard.press('Escape');if(!await page.locator('.lab-menu-trigger').evaluate(x=>x===document.activeElement))errors.push(file+': drawer focus not returned');
  await page.locator('.lab-menu-trigger').click();await resize(page, {width:1440,height:900});if(await page.locator('main').evaluate(x=>x.inert))errors.push(file+': resize left main inert');
  if(!await page.locator('#bb-sidebar-settings-panel').evaluate(x=>x.hidden))errors.push(file+': settings menu did not start collapsed');await page.locator('.bb-settings-toggle').click();await page.locator('#nav-hl-btn').click();await page.locator('#bb-highlighter-palette').waitFor({state:'visible'});await page.locator('#bb-highlighter-palette').scrollIntoViewIfNeeded();await capture(page,file+'-highlighter');await page.locator('.bb-highlighter-color').last().click();if(await page.locator('#bb-highlighter-palette').isVisible())errors.push(file+': highlighter palette stayed open after color selection');if(!await page.locator('body').evaluate(x=>x.classList.contains('hl-mode')))errors.push(file+': highlighter did not activate after color selection');await page.locator('#nav-hl-btn').click();await page.locator('.bb-highlighter-disable').click();
  await page.locator('.lesson-search-trigger').click();await page.locator('#lesson-search-input').fill('sistem');await page.waitForTimeout(350);await capture(page,file+'-search');await page.keyboard.press('Escape');
 }
 await page.goto(base+'introducere_anatomie_fiziologie.html');const tableRoute=await page.locator('table.bb-table-stacked').first().evaluate(t=>t.closest('.page-section').id.slice(5));await page.evaluate(r=>BBLessonNavigation.navigate(r,{focus:false}),tableRoute);await page.locator('.page-section.active table').first().scrollIntoViewIfNeeded();await capture(page,'table-desktop');await resize(page, {width:390,height:844});await page.locator('.page-section.active table').first().scrollIntoViewIfNeeded();await capture(page,'table-stacked');
 await page.goto(base+resources[0].url);const first=page.locator('.quiz-question').first();await first.locator('input').first().check();await first.scrollIntoViewIfNeeded();await capture(page,'quiz-selected');await first.locator('.quiz-check').click();await capture(page,'quiz-verified');
 // 200% zoom equivalent CSS viewport: a 1280px browser exposes 640 CSS pixels.
 await resize(page, {width:640,height:400});for(const file of report.pages){await page.goto(base+file);if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))errors.push(file+': 200% reflow overflow');}
 await page.goto(base+'index.html');await resize(page,{width:1000,height:500});
 await page.evaluate(()=>{const sample=document.createElement('div');sample.id='font-proof';sample.style.cssText='position:fixed;inset:0;background:#F4F6FA;padding:48px;z-index:9999';sample.innerHTML='<p style="font:400 48px Figtree">ă â î ș ț Ă Â Î Ș Ț</p><p style="font:italic 400 48px Fraunces;color:#2563eb">ă â î ș ț Ă Â Î Ș Ț</p>';document.body.appendChild(sample);});await page.evaluate(()=>document.fonts.ready);await capture(page,'romanian-fonts');
 await context.close();
 if(output)await writeFile(join(output,'report.json'),JSON.stringify({...report,errors},null,2));
 if(errors.length)throw new Error(errors.join('\n'));
 console.log(`UI verified ${report.pages.length} pages, ${report.tables} tables, all routes at ${viewports.length} sizes, content integrity, fonts, theme retirement and controls`);
} finally { await browser.close();server.close(); }
