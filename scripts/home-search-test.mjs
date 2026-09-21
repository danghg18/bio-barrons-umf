import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSiteRegistry, publishedResources } from './site-registry.mjs';

// Standalone focused suite: node scripts/search-highlighter-test.mjs
// BB_SEARCH_BASE may point to an existing server, including its Pages prefix.
const root = fileURLToPath(new URL('../', import.meta.url));
const expectedLessonUrls = Array.from(publishedResources(await loadSiteRegistry()).chapters, chapter => chapter.url).sort();
const prefix = '/bio-barrons-umf/';
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' };
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (!pathname.startsWith(prefix)) throw new Error('outside prefix');
    const target = normalize(join(root, pathname.slice(prefix.length) || 'index.html'));
    if (!target.startsWith(root)) throw new Error('outside root');
    const body = await readFile(target);
    response.writeHead(200, { 'content-type': mime[extname(target)] || 'application/octet-stream', 'cache-control': 'no-store' });
    response.end(body);
  } catch {
    response.writeHead(404); response.end('Not found');
  }
});
if (!process.env.BB_SEARCH_BASE) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = process.env.BB_SEARCH_BASE || `http://127.0.0.1:${server.address().port}${prefix}`;

const browser = await chromium.launch({headless: true});
const context = await browser.newContext({serviceWorkers: 'block', viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
const page = await context.newPage();
page.setDefaultTimeout(6000);
const failures = [];
async function check(name, fn) { try { await fn(); console.log('PASS', name); } catch (error) { failures.push(name + ': ' + error.message); console.error('FAIL', name, error.message); } }
async function query(value) {
  await page.locator('#palette-input').fill(value);
  await page.waitForFunction(() => !document.querySelector('#palette-list').textContent.includes('Caut în text'));
  await page.waitForTimeout(250);
}
try {
  await page.goto(base);
  await page.locator('#search-btn').click();
  await query('celul');
  await mkdir(root + 'tmp/home-search', {recursive: true});
  await page.screenshot({path: root + 'tmp/home-search/desktop.png'});
  await check('chapters start collapsed with small independent result lists', async () => {
    assert.deepEqual(await page.locator('details[data-chapter]').evaluateAll(items => items.map(item => item.dataset.chapter).sort()), expectedLessonUrls);
    assert.equal(await page.locator('details[open]').count(), 0);
    assert.equal(await page.locator('[data-hit]:visible').count(), 0);
    await page.locator('details[data-chapter="celula_si_fiziologia_celulara.html"] > summary').click();
    assert.equal(await page.locator('[data-hit]:visible').count(), 5);
    const width = await page.locator('details[open] .lab-palette-item > div').first().evaluate(el => el.getBoundingClientRect().width);
    assert.ok(width > 350, 'result text width: ' + width);
    await page.locator('details[open] [data-more]').click();
    assert.equal(await page.locator('[data-hit]:visible').count(), 10);
    await page.locator('details[data-chapter="sistemul_reproducator_feminin.html"] > summary').click();
    assert.equal(await page.locator('details[open]').count(), 1);
    const urls = await page.locator('[data-hit]:visible').evaluateAll(items => [...new Set(items.map(item => item.dataset.url))]);
    assert.deepEqual(urls, ['sistemul_reproducator_feminin.html']);
  });
  await query('tesut');
  await check('diacritic-insensitive visual highlight', async () => {
    assert.ok(await page.locator('.lab-palette-match mark, .lab-palette-match strong').count());
  });
  for (const [file, word] of [['celula_si_fiziologia_celulara.html','membrana'], ['sistemul_renal_complet.html','ADH'], ['sistemul_reproducator_masculin.html','testosteron']]) {
    await check('exact passage link ' + file, async () => {
      await query(word);
      await page.locator(`details[data-chapter="${file}"] > summary`).click();
      const result = page.locator(`[data-url="${file}"][data-hit]`).last();
      const section = await result.getAttribute('data-section-id');
      await result.click();
      await page.waitForSelector('.search-found-current');
      assert.equal(await page.locator('.page-section.active').getAttribute('id'), 'page-' + section);
      assert.ok(await page.locator('.search-found-current').first().isVisible());
      await page.goto(base);
      await page.locator('#search-btn').click();
    });
  }
  await check('late occurrence after 300 lesson hits opens exactly', async () => {
    await query('a');
    await page.locator('details[data-chapter="celula_si_fiziologia_celulara.html"] > summary').click();
    while (await page.locator('details[open] [data-hit]').count() <= 310 && await page.locator('details[open] [data-more]').count()) await page.locator('details[open] [data-more]').click();
    const result = page.locator('details[open] [data-hit]').last();
    const section = await result.getAttribute('data-section-id');
    const hit = Number(await result.getAttribute('data-hit'));
    await result.click();
    await page.waitForSelector('.search-found-current');
    assert.equal(await page.locator('.page-section.active').getAttribute('id'), 'page-' + section);
    const current = await page.locator('.search-found-current').first().getAttribute('data-search-index');
    const indices = await page.locator('.page-section.active [data-search-index]').evaluateAll(items => [...new Set(items.map(item => item.dataset.searchIndex))]);
    assert.equal(current, indices[hit]);
    assert.ok(Number(current) > 300);
    await page.goto(base);
    await page.locator('#search-btn').click();
  });
  await check('empty result and literal special characters', async () => {
    await query('<absent & 100%>');
    assert.ok((await page.locator('.lab-palette-empty').textContent()).includes('<absent & 100%>'));
    assert.equal(await page.locator('[data-hit]').count(), 0);
  });
  await page.setViewportSize({width:390,height:844});
  await query('celul');
  await page.screenshot({path: root + 'tmp/home-search/mobile.png'});
  await page.locator('details[data-chapter="celula_si_fiziologia_celulara.html"] > summary').click();
  await page.screenshot({path: root + 'tmp/home-search/mobile-expanded.png'});
  await check('mobile dialog contained', async () => {
    const box = await page.locator('.lab-palette').boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= 390 && box.y + box.height <= 844);
    assert.equal(await page.locator('.lab-palette').evaluate(el => el.scrollWidth <= el.clientWidth), true);
  });
  await check('Escape restores focus and scrolling', async () => {
    await page.keyboard.press('Control+k');
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');
    assert.equal(await page.locator('#search-btn').evaluate(el => el === document.activeElement), true);
  });
  await page.route('**/celula_si_fiziologia_celulara.html', route => route.abort());
  await page.goto(base);
  await page.locator('#search-btn').click();
  await query('ADH');
  await check('one unavailable lesson does not discard other results', async () => {
    assert.ok(await page.locator('[data-url="sistemul_renal_complet.html"][data-hit]').count());
  });
  await check('retry restores unavailable chapter', async () => {
    await page.unroute('**/celula_si_fiziologia_celulara.html');
    await page.locator('#palette-retry').click();
    await page.waitForFunction(() => !document.getElementById('palette-retry') && document.querySelector('[data-hit]'));
    await query('celul');
    await page.locator('details[data-chapter="celula_si_fiziologia_celulara.html"] > summary').click();
    assert.ok(await page.locator('[data-url="celula_si_fiziologia_celulara.html"][data-hit]').count());
  });
  await check('catalog search reads precached lessons offline', async () => {
    const offlineContext = await browser.newContext();
    try {
      const offlinePage = await offlineContext.newPage();
      await offlinePage.goto(base);
      await offlinePage.evaluate(() => navigator.serviceWorker.ready);
      await offlinePage.waitForFunction(() => !!navigator.serviceWorker.controller);
      await offlineContext.setOffline(true);
      await offlinePage.reload();
      await offlinePage.locator('#search-btn').click();
      await offlinePage.locator('#palette-input').fill('ADH');
      await offlinePage.waitForSelector('[data-url="sistemul_renal_complet.html"][data-hit]', {state:'attached'});
    } finally { await offlineContext.close(); }
  });
  assert.deepEqual(failures, []);
} finally {
  await browser.close();
  server.close();
}
