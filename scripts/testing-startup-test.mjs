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
const output = process.env.BB_UI_OUTPUT || resolve(root, 'output/testing-redesign');
if (output) await mkdir(output, {recursive:true});
async function capture(page, name) {
  if (!output) return;
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({path:resolve(output, name+'.png'), animations:'disabled'});
}
try {
  for (const edition of ['', 'nou/']) {
    const name = edition ? 'softly' : 'classic';
    const context = await browser.newContext({serviceWorkers:'block', reducedMotion:'reduce'});
    const page = await context.newPage();
    await page.setViewportSize({width:1440,height:1000});
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await page.route('**/analytics-ui.js*', async route => { await gate; await route.continue(); });
    await page.goto(base + edition + 'testare.html', {waitUntil:'commit'});
    await page.locator('#testing-quiz-1').waitFor();
    assert.equal(await page.locator('#lab-testing-catalog .lab-bento-cat').count(), 0, 'No legacy colored cards before analytics loads');
    assert.equal(await page.locator('.testing-chapter-row').count(), 18);
    assert.equal(await page.locator('.testing-unstarted').first().innerText(), 'Se încarcă progresul…');
    await capture(page, `after-${name}-startup`);
    release();
    await page.waitForFunction(() => document.body.dataset.analyticsReady === 'true');
    await page.unroute('**/analytics-ui.js*');
    const inventory = await page.evaluate(() => BB_QUIZ_INDEX.map(quiz => ({chapter:quiz.chapterNum,url:quiz.url,total:quiz.questions.length})));
    const staticPage = await context.newPage();
    await staticPage.route('**/*.js*', route => route.abort());
    await staticPage.goto(base + edition + 'testare.html');
    for(const quiz of inventory) {
      const row = staticPage.locator(`#testing-quiz-${quiz.chapter}`);
      assert.equal(await row.getAttribute('href'), quiz.url);
      assert.equal(await row.locator('.lab-item-tags').innerText(), `${quiz.total} de grile`);
    }
    await staticPage.close();
    assert.equal(await page.locator('#testing-activity .chart-no-data').innerText(),'Nicio activitate');
    await capture(page, `after-${name}-empty`);
    // Synthetic browser-test attempts only; no real account or remote project is touched.
    await page.evaluate(async () => {
      const q = BB_QUIZ_INDEX[0];
      for(let i=0;i<8;i++) await BBQuizAnalytics.recordAttempt({storageKey:q.storageKey,questionId:q.questions[i].id,selected:q.questions[i].correct,correct:true,attemptId:BBQuizAnalytics.newAttemptId()});
    });
    await page.reload(); await page.waitForFunction(() => document.body.dataset.analyticsReady === 'true');
    assert.equal(await page.locator('.testing-activity-day').count(),30);
    assert.equal(await page.locator('.testing-activity-day.is-active').count(),1);
    assert.match(await page.locator('.testing-activity-total').innerText(), /8 verificări/);
    assert.equal(await page.locator('#testing-activity details, #testing-activity summary').count(),0,'The chart has no visible data disclosure');
    assert.equal(await page.locator('.testing-activity-data tbody td').first().textContent(),'8');
    assert.equal(await page.locator('.testing-activity-data').evaluate(node => getComputedStyle(node).clip),'rect(0px, 0px, 0px, 0px)','Daily data remains available to assistive technology only');
    assert.equal(await page.locator('.testing-activity-data :is(a,button,[tabindex])').count(),0,'Hidden data has no focusable controls');
    for(const width of [1440,390,320]) {
      await page.setViewportSize({width,height:1000});
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name} overflow at ${width}`);
      await capture(page, `after-${name}-test-fixture-${width}`);
    }
    await context.close();
  }
  console.log('Testing startup, static inventory, empty/real history projection, screen-reader data, and responsive classic/Softly passed.');
} finally { await browser.close(); server.close(); }
