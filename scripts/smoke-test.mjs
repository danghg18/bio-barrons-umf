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
  if (await home.locator('.lab-item-done').count() !== 10) errors.push('homepage published-card count changed');
  if (await home.locator('.lab-item-soon:disabled').count() !== 13) errors.push('homepage unpublished-card count changed');
  await home.evaluate(() => openPalette());
  await home.locator('#palette-input').fill('tesut nervos');
  await home.waitForFunction(() => document.querySelectorAll('#palette-list [data-url]').length > 0);
  await home.locator('#palette-input').fill('țesut nervos');
  await home.waitForFunction(() => document.querySelectorAll('#palette-list [data-url]').length > 0);
  await home.evaluate(() => localStorage.setItem('darkMode', '1'));
  await home.reload();
  if (await home.evaluate(() => document.body.classList.contains('dark') || localStorage.getItem('darkMode') !== null)) errors.push('homepage did not retire dark preference');
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
    if (await page.locator('.lab-topbar > .lab-topbar-inner > .lab-nav').count()) errors.push(`${file}: duplicate topbar navigation remains`);
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
    if (await page.locator('#dm-btn, #nav-dm-btn, #sfab-dm').count() || await page.evaluate(() => document.body.classList.contains('dark') || typeof window.toggleDarkMode !== 'undefined')) errors.push(`${file}: obsolete theme behavior remains`);
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
  for (const file of [...simpleLessons, 'sistemul_renal_complet.html', 'sistemul_reproducator_masculin.html', ...resources.map(r=>r.url), ...(registry.BIO_SITE.pages || []).map(r=>r.url)]) {
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
  if (!await feature.locator('#bb-sidebar-settings-panel').evaluate(node => node.hidden)) errors.push('settings menu did not start collapsed');
  await feature.locator('.bb-settings-toggle').click();
  await feature.locator('#nav-hl-btn').click();
  await feature.locator('.bb-highlighter-color[data-highlight-color="yellow"]').click();
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
  // Exact-set scoring, retry, persistence, and reset for all 50 authored IDs.
  await first.locator('.quiz-retry').click();
  const questions = await quiz.evaluate(() => BB_NERVOUS_QUIZ.questions.map(q => ({ id:q.id, correct:q.correct })));
  for (const question of questions) {
    const card = quiz.locator('[data-question-id="' + question.id + '"]');
    const route = await card.evaluate(node => node.closest('.page-section').id.slice(5));
    await quiz.evaluate(route => window.goto(route), route);
    for (const letter of question.correct) await card.locator('input[value="' + letter + '"]').check();
    await card.locator('.quiz-check').click();
    if (!await card.evaluate(node => node.classList.contains('is-correct'))) errors.push(question.id + ': exact answer set scored incorrectly');
  }
  await quiz.reload();
  if (await quiz.locator('.quiz-question.is-correct').count() !== 50) errors.push('quiz reload lost verified answers');
  await quiz.locator('.page-section.active .quiz-reset-start').click();
  await quiz.locator('.page-section.active .quiz-reset-cancel').click();
  if (await quiz.locator('.quiz-question.is-correct').count() !== 50) errors.push('cancel reset changed saved answers');
  await quiz.locator('.page-section.active .quiz-reset-start').click();
  await quiz.locator('.page-section.active .quiz-reset-confirm').click();
  if (await quiz.locator('.quiz-question.is-verified').count()) errors.push('quiz reset failed');
  await quiz.close();

  // The second quiz shares the player but must never share or clear saved answers.
  const sense = await newPage(context);
  const senseKey = JSON.parse(await readFile(join(root, 'tests/organe-de-simt-answer-key.json'), 'utf8'));
  await sense.goto(base + 'organele_de_simt.html');
  await sense.locator('.page-section.active a[href="grile_organele_de_simt.html"]').click();
  await sense.waitForFunction(() => document.querySelectorAll('.quiz-question').length === 100);
  if (await sense.locator('.lab-topbar-back').getAttribute('href') !== 'organele_de_simt.html') errors.push('sense quiz back link points at another lesson');
  await sense.locator('.lab-topbar-back').click();
  if (!sense.url().endsWith('organele_de_simt.html')) errors.push('sense quiz back action did not return to its lesson');
  await sense.goto(base + 'testare.html');
  if (await sense.locator('.testing-entry').count() !== resources.length) errors.push('testing catalog missing a quiz');
  await sense.locator('.testing-entry a[href="grile_organele_de_simt.html"]').click();
  await sense.evaluate(() => localStorage.setItem('bb.quiz.sistem-nervos.v1', JSON.stringify({version:1,questions:{'sn-051':{selected:['C','D'],verified:true,correct:true}}})));
  const nervousSaved = await sense.evaluate(() => localStorage.getItem('bb.quiz.sistem-nervos.v1'));
  const senseFirst = sense.locator('#grila-1');
  await senseFirst.locator('.quiz-check').click();
  if (await senseFirst.locator('input:disabled').count()) errors.push('empty answer was verified');
  await senseFirst.locator('input[value="A"]').check();
  await senseFirst.locator('input[value="B"]').check();
  await senseFirst.locator('.quiz-check').click();
  if (await senseFirst.locator('.is-answer').count() !== 1 || await senseFirst.locator('.is-missed-answer').count() !== 2 || await senseFirst.locator('.is-selected-extra').count() !== 1) errors.push('selected, omitted, and extra feedback are not distinct');
  if (!await senseFirst.locator('.quiz-option-wrap[data-letter="C"] .quiz-option-state').textContent().then(text => text.includes('omis'))) errors.push('omitted feedback has no text label');
  if (await senseFirst.locator('.is-missed-answer').first().evaluate(node=>getComputedStyle(node).backgroundColor) !== 'rgb(254, 249, 195)') errors.push('omitted answer is not yellow');
  if (!await senseFirst.locator('.quiz-option-wrap[data-letter="A"] .quiz-option-explanation').isVisible()) errors.push('incorrect choice explanation is hidden');
  await sense.reload();
  if (await senseFirst.locator('.is-missed-answer').count() !== 2) errors.push('reload lost omitted feedback');
  await senseFirst.locator('.quiz-retry').click();
  if (await senseFirst.locator('.is-missed-answer').count() || await senseFirst.locator('input:disabled').count()) errors.push('retry did not clear feedback');
  // Every authored question is scored against the independently supplied key.
  for (let number=1; number<=100; number++) {
    const card=sense.locator('#grila-'+number);
    const route=await card.evaluate(node=>node.closest('.page-section').id.slice(5));
    await sense.evaluate(route=>goto(route),route);
    for (const letter of senseKey[number-1]) await card.locator('input[value="'+letter+'"]').check();
    await card.locator('.quiz-check').click();
    if (!await card.evaluate(node=>node.classList.contains('is-correct'))) errors.push('sense quiz '+number+': exact-set scoring failed');
  }
  if (await sense.locator('#quiz-sidebar-count').textContent() !== '100/100 verificate') errors.push('sense quiz progress total is wrong');
  await sense.reload();
  if (await sense.locator('.quiz-question.is-correct').count() !== 100) errors.push('sense quiz reload lost saved answers');
  await sense.locator('.page-section.active .quiz-reset-start').click();
  await sense.locator('.page-section.active .quiz-reset-cancel').click();
  if (await sense.locator('.quiz-question.is-correct').count() !== 100) errors.push('sense quiz cancel reset lost saved answers');
  await sense.locator('.page-section.active .quiz-reset-start').click();
  await sense.locator('.page-section.active .quiz-reset-confirm').click();
  if (await sense.locator('.quiz-question.is-verified').count()) errors.push('sense quiz reset failed');
  if (await sense.evaluate(() => localStorage.getItem('bb.quiz.sistem-nervos.v1')) !== nervousSaved) errors.push('sense quiz changed nervous-system progress');
  await sense.goto(base+'grile_sistemul_nervos.html');
  if (!await sense.locator('#grila-51').evaluate(node=>node.classList.contains('is-correct'))) errors.push('existing nervous-system state is incompatible with shared player');
  // Direct range URLs and legacy search parameters remain available for both quizzes.
  for (const resource of resources) {
    await sense.goto(base+resource.url);
    const routes=await sense.locator('.page-section').evaluateAll(nodes=>nodes.map(node=>node.id.slice(5)));
    for (const route of routes) {
      await sense.goto(base+resource.url+'#'+route);
      if (await sense.locator('.page-section.active').getAttribute('id') !== 'page-'+route) errors.push(resource.url+': direct range failed '+route);
    }
    await sense.goto(base+resource.url+'#invalid');
    if (await sense.locator('.page-section.active').getAttribute('id') !== 'page-'+routes[0]) errors.push(resource.url+': invalid hash fallback failed');
  }
  await sense.goto(base+'grile_organele_de_simt.html?q=otoli%C8%9Bi&section=grile-71-80&hit=0');
  await sense.waitForFunction(()=>document.querySelector('.page-section.active').id==='page-grile-71-80');
  await sense.close();

  const swPage = await newPage(context);
  await swPage.goto(`${base}index.html`, { waitUntil:'load' });
  await swPage.evaluate(() => navigator.serviceWorker.ready);
  await swPage.reload({ waitUntil:'domcontentloaded' });
  if (!await swPage.evaluate(() => !!navigator.serviceWorker.controller)) errors.push('service worker did not control reload');
  await context.setOffline(true);
  for (const file of ['index.html', ...lessonFiles, ...resources.map(r=>r.url), ...(registry.BIO_SITE.pages || []).map(r=>r.url)]) {
    const response = await swPage.goto(`${base}${file}`, { waitUntil:'domcontentloaded' });
    if (!response || response.status() !== 200) errors.push(`${file}: offline navigation failed`);
  }
  await swPage.goto(base+'grile_organele_de_simt.html?q=otoli%C8%9Bi&section=grile-71-80&hit=0');
  if (await swPage.locator('.page-section.active').getAttribute('id') !== 'page-grile-71-80') errors.push('sense quiz cached search URL failed offline');
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
