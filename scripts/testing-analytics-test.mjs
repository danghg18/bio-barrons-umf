import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const prefix = '/bio-barrons-umf/';
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.webp':'image/webp'};
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, pathname.slice(prefix.length) || 'index.html');
    if (!pathname.startsWith(prefix) || !file.startsWith(root + sep)) throw Error('Invalid path');
    res.writeHead(200, {'Content-Type':mime[extname(file)] || 'application/octet-stream'});
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('Not found'); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}${prefix}`;
const browser = await chromium.launch({headless:true});
const output = process.env.BB_UI_OUTPUT;
if (output) await mkdir(output, {recursive:true});
async function capture(page, name) {
  if (!output) return;
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({path:resolve(output, name+'.png'), animations:'disabled'});
}
try {
  const context = await browser.newContext({serviceWorkers:'block', reducedMotion:'reduce'});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + 'testare.html');
  assert.equal(await page.getByRole('link', {name:'Vezi toate statisticile'}).count(), 1, 'Testare must link its analytics preview to the full report');
  await page.waitForFunction(() => document.body.dataset.analyticsReady === 'true');
  assert.equal(await page.locator('.testing-chapter-row').count(), 17);
  assert.equal(await page.locator('.testing-chapter-row [data-chapter="8"]:disabled').count(), 1);
  assert.equal(await page.locator('#testing-activity svg').count(), 1);
  assert.match(await page.locator('#testing-activity').innerText(), /Prima verificare/);
  await capture(page, 'testing-empty');
  await page.getByRole('link', {name:'Vezi toate statisticile'}).click();
  await page.waitForFunction(() => document.body.dataset.analyticsReady === 'true');
  assert.equal(new URL(page.url()).pathname, prefix + 'statistici.html');
  assert.equal(await page.locator('#analytics-period').inputValue(), '30');
  assert.equal(await page.locator('#analytics-chapter').inputValue(), 'all');
  assert.match(await page.locator('#analytics-history').innerText(), /Nicio încercare/);
  await capture(page, 'analytics-empty');

  await page.evaluate(async () => {
    const a = window.BBQuizAnalytics;
    await a.ready;
    const quiz = window.BB_QUIZ_INDEX.find(q => q.chapterNum === 11);
    for (let i = 0; i < 23; i++) await a.recordAttempt({storageKey:quiz.storageKey, questionId:quiz.questions[i % 3].id, selected:['A'], correct:i % 2 === 0, attemptId:a.newAttemptId()});
  });
  await page.reload();
  await page.waitForFunction(() => document.body.dataset.analyticsReady === 'true');
  assert.equal(await page.locator('[data-metric="attempts"]').textContent(), '23');
  assert.equal(await page.locator('#analytics-history tbody tr').count(), 20);
  await page.getByRole('button', {name:'Pagina următoare a istoricului'}).click();
  assert.equal(await page.locator('#analytics-history tbody tr').count(), 3);
  await page.locator('#analytics-chapter').selectOption('11');
  await page.waitForFunction(() => document.body.dataset.analyticsReady === 'true' && new URL(location.href).searchParams.get('capitol') === '11');
  assert.equal(await page.locator('#analytics-history tbody tr').count(), 20, 'Changing filter resets history pagination');
  assert.equal(await page.locator('#analytics-comparison tbody tr').count(), 1);
  assert.ok(await page.locator('#analytics-mistakes a[href*="#grila-"]').count());
  await page.locator('#analytics-chapter').selectOption('3');
  await page.waitForFunction(() => document.body.dataset.analyticsReady === 'true' && new URL(location.href).searchParams.get('capitol') === '3');
  assert.equal(await page.locator('[data-metric="attempts"]').textContent(), '0');
  await page.goBack();
  await page.waitForFunction(() => document.querySelector('#analytics-chapter').value === '11' && document.body.dataset.analyticsReady === 'true');
  assert.equal(await page.locator('[data-metric="attempts"]').textContent(), '23');
  await page.getByRole('button', {name:'Șterge istoricul', exact:true}).click();
  await page.getByRole('button', {name:'Anulează', exact:true}).click();
  assert.equal(await page.locator('[data-metric="attempts"]').textContent(), '23');

  // A year of daily history must remain legible instead of shrinking the SVG into a strip.
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      const request = indexedDB.open('bb.quiz.analytics.v1', 1);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('attempts', 'readwrite');
        const store = tx.objectStore('attempts');
        store.getAll().onsuccess = event => {
          event.target.result.forEach((attempt, i) => {
            const day = new Date(); day.setDate(day.getDate() - (i === 0 ? 365 : i % 28));
            attempt.at = day.toISOString(); store.put(attempt);
          });
        };
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
      request.onerror = () => reject(request.error);
    });
  });
  await page.locator('#analytics-period').selectOption('all');
  await page.waitForFunction(() => document.body.dataset.analyticsReady === 'true' && document.querySelectorAll('#analytics-activity tbody tr').length > 360);
  assert.ok(await page.locator('#analytics-activity svg').evaluate(svg => svg.getBoundingClientRect().height >= 180), 'All-history chart must preserve readable axis and plot height');

  for (const file of ['testare.html', 'statistici.html']) {
    for (const width of [1440, 1280, 768, 390, 320]) {
      await page.setViewportSize({width, height:850});
      await page.goto(base + file);
      await page.waitForFunction(() => document.body.dataset.analyticsReady === 'true');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${file} overflows at ${width}`);
      if (file === 'testare.html') assert.equal(await page.locator('.testing-row-first').first().isVisible(), true, `First-attempt result must remain visible at ${width}`);
      if (width === 1440 || width === 390) {
        await capture(page, file.replace('.html','')+'-fixture-'+width);
        if (file === 'statistici.html') {
          await page.locator('#analytics-comparison').scrollIntoViewIfNeeded();
          await capture(page, 'analytics-comparison-fixture-'+width);
          await page.locator('#analytics-history').scrollIntoViewIfNeeded();
          await capture(page, 'analytics-history-fixture-'+width);
        }
      }
    }
  }
  assert.deepEqual(errors, []);
  const offlineContext = await browser.newContext({serviceWorkers:'allow'});
  const offline = await offlineContext.newPage();
  await offline.goto(base + 'testare.html');
  await offline.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, {once:true}));
  });
  await offlineContext.setOffline(true);
  await offline.goto(base + 'statistici.html?capitol=11&perioada=7');
  assert.equal(await offline.locator('body.bm-analytics').count(), 1, 'An unvisited analytics filter URL must open its cached shell offline');
  await offline.waitForFunction(() => document.body.dataset.analyticsReady === 'true');
  assert.equal(await offline.locator('#analytics-chapter').inputValue(), '11');
  assert.equal(await offline.locator('#analytics-period').inputValue(), '7');
  await offline.goto(base + 'grile_sistemul_nervos.html#grila-99');
  await offline.waitForFunction(() => document.querySelector('.page-section.active')?.id === 'page-grile-91-100');
  await offlineContext.close();
  console.log('Testing and analytics UI: catalog, empty/populated reports, filters, history pagination, links, responsive widths passed.');
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
