import { chromium } from 'playwright';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
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

try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const home = await newPage(context);
  await home.goto(`${base}index.html`, { waitUntil:'domcontentloaded' });
  await home.waitForFunction(() => typeof CHAPTERS !== 'undefined');
  if (await home.locator('.lab-item-done').count() !== 9) errors.push('homepage published-card count changed');
  if (await home.locator('.lab-item-soon:disabled').count() !== 14) errors.push('homepage unpublished-card count changed');
  await home.evaluate(() => openPalette());
  await home.locator('#palette-input').fill('tesut nervos');
  await home.waitForFunction(() => document.querySelectorAll('#palette-list [data-url]').length > 0);
  await home.locator('#palette-input').fill('țesut nervos');
  await home.waitForFunction(() => document.querySelectorAll('#palette-list [data-url]').length > 0);
  await home.evaluate(() => document.getElementById('dm-btn').click());
  if (await home.evaluate(() => localStorage.darkMode) !== '1') errors.push('homepage dark mode did not persist');
  await home.close();

  for (const file of lessonFiles) {
    const page = await newPage(context);
    await page.goto(`${base}${file}`, { waitUntil:'domcontentloaded' });
    await page.waitForFunction(() => document.body.dataset.bbSharedReady === 'true');
    const state = await page.evaluate(() => ({
      routes:[...document.querySelectorAll('.page-section[id^="page-"]')].map(node => node.id.slice(5)),
      defaultRoute:document.querySelector('.page-section.active')?.id.slice(5),
      activeCount:document.querySelectorAll('.page-section.active').length
    }));
    if (state.activeCount !== 1 || !state.defaultRoute) errors.push(`${file}: invalid default route`);
    for (const route of state.routes) {
      await page.goto(`${base}${file}#${encodeURIComponent(route)}`, { waitUntil:'domcontentloaded' });
      await page.reload({ waitUntil:'domcontentloaded' });
      await page.waitForFunction(value => document.getElementById(`page-${value}`)?.classList.contains('active'), route);
    }
    await page.goto(`${base}${file}#route-that-does-not-exist`, { waitUntil:'domcontentloaded' });
    await page.reload({ waitUntil:'domcontentloaded' });
    await page.waitForFunction(value => document.getElementById(`page-${value}`)?.classList.contains('active'), state.defaultRoute);
    await page.evaluate(() => {
      const input = document.getElementById('lesson-search-input');
      input.value = 'sistem';
      input.dispatchEvent(new Event('input', { bubbles:true }));
    });
    await page.waitForTimeout(350);
    const searchCount = await page.locator('#lesson-search-count').textContent();
    const searchTotal = Number((searchCount.match(/\/\s*(\d+)/) || [])[1]);
    if (!searchTotal) errors.push(`${file}: cross-section search returned no results`);
    await page.evaluate(() => window.toggleDarkMode());
    if (await page.evaluate(() => localStorage.darkMode) !== (await page.evaluate(() => document.body.classList.contains('dark') ? '1' : '0'))) errors.push(`${file}: dark preference mismatch`);
    await page.close();
  }

  for (const file of simpleLessons) {
    const page = await newPage(context);
    await page.goto(`${base}${file}`, { waitUntil:'domcontentloaded' });
    const routes = await page.evaluate(() => BBLessonNavigation.getRoutes());
    if (routes.length > 1) {
      const target = routes[1];
      await page.evaluate(route => BBLessonNavigation.navigate(route, { history:'push', focus:false }), target);
      await page.goBack();
      await page.goForward();
      if (!await page.locator(`#page-${target}`).evaluate(node => node.classList.contains('active'))) errors.push(`${file}: Back/Forward failed`);
      const modifiedAllowed = await page.locator(`a[href="#${target}"]`).first().evaluate(link => link.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,ctrlKey:true})));
      if (!modifiedAllowed) errors.push(`${file}: modified click was intercepted`);
    }
    await page.close();
  }

  const mobile = await browser.newContext({ viewport:{width:390,height:844}, reducedMotion:'reduce' });
  for (const file of [...simpleLessons, 'sistemul_renal_complet.html', 'sistemul_reproducator_masculin.html', resources[0].url]) {
    const page = await newPage(mobile);
    await page.goto(`${base}${file}`, { waitUntil:'domcontentloaded' });
    await page.locator('.lab-menu-trigger').click();
    if (!await page.locator('#sidenav').evaluate(node => node.classList.contains('open'))) errors.push(`${file}: drawer did not open`);
    await page.keyboard.press('Escape');
    if (await page.locator('#sidenav').evaluate(node => node.classList.contains('open'))) errors.push(`${file}: Escape did not close drawer`);
    await page.locator('.lab-menu-trigger').click();
    await page.locator('#nav-overlay').click({ position:{x:380,y:20}, force:true });
    if (await page.locator('#sidenav').evaluate(node => node.classList.contains('open'))) errors.push(`${file}: overlay did not close drawer`);
    await page.close();
  }
  await mobile.close();

  const feature = await newPage(context);
  await feature.goto(`${base}tesutul_muscular.html#muschiul-striat`, { waitUntil:'domcontentloaded' });
  await feature.locator('#nav-hl-btn').click();
  await feature.evaluate(() => {
    const node=document.querySelector('.page-section.active p')?.firstChild;
    const range=document.createRange(); range.setStart(node,0); range.setEnd(node,Math.min(12,node.textContent.length));
    const selection=getSelection(); selection.removeAllRanges(); selection.addRange(range);
    node.parentElement.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));
  });
  await feature.waitForTimeout(50);
  if (await feature.locator('mark.hl').count() < 1) errors.push('shared highlighter failed');
  await feature.evaluate(() => { scrollTo(0,1000); dispatchEvent(new Event('scroll')); });
  await feature.locator('#top').click({ force:true });
  await feature.waitForTimeout(50);
  if (await feature.evaluate(() => scrollY) !== 0) errors.push('back-to-top failed');
  await feature.close();

  const quiz = await newPage(context);
  await quiz.goto(`${base}${resources[0].url}`, { waitUntil:'domcontentloaded' });
  await quiz.waitForFunction(() => document.querySelectorAll('.quiz-question').length === 50);
  const first = quiz.locator('.quiz-question').first();
  await first.locator('input[type=checkbox]').first().check();
  await first.locator('.quiz-check').click();
  if (!await first.getAttribute('data-question-id')) errors.push('quiz IDs unavailable');
  if (!await quiz.evaluate(() => localStorage.getItem('bb.quiz.sistem-nervos.v1'))) errors.push('quiz state did not persist');
  await quiz.close();

  const swPage = await newPage(context);
  await swPage.goto(`${base}index.html`, { waitUntil:'load' });
  await swPage.evaluate(() => navigator.serviceWorker.ready);
  await swPage.reload({ waitUntil:'domcontentloaded' });
  if (!await swPage.evaluate(() => !!navigator.serviceWorker.controller)) errors.push('service worker did not control reload');
  await context.setOffline(true);
  for (const file of ['index.html', ...lessonFiles, resources[0].url]) {
    const response = await swPage.goto(`${base}${file}`, { waitUntil:'domcontentloaded' });
    if (!response || response.status() !== 200) errors.push(`${file}: offline navigation failed`);
  }
  await context.setOffline(false);
  await swPage.close();
  await context.close();

  serveLegacyWorker = true;
  const upgradeContext = await browser.newContext();
  const upgradePage = await newPage(upgradeContext);
  await upgradePage.goto(`${base}index.html`, { waitUntil:'load' });
  await upgradePage.evaluate(async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(registration => registration.unregister()));
    await caches.delete('biologie-atlas-v16');
    await navigator.serviceWorker.register('sw.js');
    await navigator.serviceWorker.ready;
    await caches.open('biologie-atlas-v16');
    await caches.open('unrelated-site-cache');
  });
  serveLegacyWorker = false;
  await upgradePage.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration.update();
    if (registration.installing) await new Promise(resolve => registration.installing.addEventListener('statechange', event => event.target.state === 'activated' && resolve()));
  });
  await upgradePage.waitForFunction(async () => !(await caches.keys()).includes('biologie-atlas-v16'));
  if (!await upgradePage.evaluate(async () => (await caches.keys()).includes('unrelated-site-cache'))) errors.push('service worker deleted an unrelated origin cache');
  await upgradePage.close();
  await upgradeContext.close();
} finally {
  await browser.close();
  server.close();
}

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}
console.log(`smoke-tested homepage, ${lessonFiles.length} lessons, ${resources.length} quiz, navigation, preferences, mobile UI, and offline control`);
