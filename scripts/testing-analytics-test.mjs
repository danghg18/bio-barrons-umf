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
  assert.equal(await page.getByRole('link', {name:'Vezi toate statisticile', exact:true}).count(), 1, 'Testare must link its analytics preview to the full report');
  await page.waitForFunction(() => document.body.dataset.analyticsReady === 'true');
  assert.equal(await page.locator('.testing-chapter-row').count(), 17);
  assert.equal(await page.locator('.testing-chapter-row [data-chapter="8"]:disabled').count(), 1);
  assert.equal(await page.locator('#testing-activity .chart-no-data').isVisible(),true,'The restored activity preview honestly shows an empty history');
  assert.equal(await page.locator('#testing-activity svg').count(),0,'No activity is invented for a fresh student');
  await capture(page, 'testing-empty');
  await page.getByRole('link', {name:'Vezi toate statisticile', exact:true}).click();
  await page.waitForFunction(() => document.body.dataset.analyticsReady === 'true');
  assert.equal(new URL(page.url()).pathname, prefix + 'statistici.html');
  assert.equal(await page.locator('#analytics-period').inputValue(), 'all');
  assert.equal(await page.locator('#analytics-chapter').inputValue(), 'all');
  assert.equal(await page.getByRole('tab', {name:'Rezumat', exact:true}).getAttribute('aria-selected'), 'true');
  assert.match(await page.locator('#analytics-history').textContent(), /Nicio parcurgere/);
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
  assert.equal(await page.evaluate(async () => (await BBQuizAnalytics.getReport({days:'all'})).legacyHistory.length), 23, 'Legacy results remain available without inventing runs');
  assert.equal(await page.locator('.analytics-legacy').count(), 1);
  assert.equal(await page.locator('.analytics-legacy table').count(), 0, 'Legacy results use compact summaries and question numbers');
  await page.evaluate(async()=>{
    const a=BBQuizAnalytics,q=BB_QUIZ_INDEX.find(q=>q.chapterNum===11),question=q.questions[0];
    for(let i=0;i<11;i++){
      const run=await a.ensureRun(q.storageKey);
      await a.recordAttempt({storageKey:q.storageKey,questionId:question.id,selected:question.correct,correct:true,answerKey:question.correct,attemptId:a.newAttemptId(),runId:run.id});
      const ticket=await a.prepareRestart({storageKey:q.storageKey,resetId:a.newAttemptId(),answers:{}});
      await a.finishRestart({storageKey:q.storageKey,resetId:ticket.id});
    }
  });
  await page.reload();await page.waitForFunction(()=>document.body.dataset.analyticsReady==='true');
  await page.getByRole('tab', {name:'Istoric', exact:true}).click();
  assert.equal(await page.locator('.analytics-run').count(),5);
  assert.match(await page.locator('.analytics-run > summary .statistics-run-name > strong').first().textContent(), /Parcurgerea 1\b/);
  assert.match(await page.locator('.analytics-run > summary .statistics-run-name > strong').last().textContent(), /Parcurgerea 5\b/);
  await page.getByRole('button',{name:'Pagina următoare a istoricului'}).click();
  assert.equal(await page.locator('.analytics-run').count(),5);
  await page.getByRole('button',{name:'Pagina următoare a istoricului'}).click();
  assert.equal(await page.locator('.analytics-run').count(),1);
  await page.locator('#analytics-chapter').selectOption('11');
  await page.waitForFunction(() => document.body.dataset.analyticsReady === 'true' && new URL(location.href).searchParams.get('capitol') === '11');
  assert.equal(await page.locator('.analytics-run').count(), 5, 'Changing filter resets history pagination');
  assert.equal(await page.locator('#analytics-comparison tbody tr').count(), 0, 'A single chapter does not repeat a comparison row');
  assert.equal(new URL(page.url()).searchParams.get('fila'), 'istoric', 'Changing chapter preserves the selected tab');
  await page.locator('#analytics-chapter').selectOption('3');
  await page.waitForFunction(() => document.body.dataset.analyticsReady === 'true' && new URL(location.href).searchParams.get('capitol') === '3');
  assert.equal(await page.locator('[data-metric="attempts"]').textContent(), '0');
  await page.goBack();
  await page.waitForFunction(() => document.querySelector('#analytics-chapter').value === '11' && document.body.dataset.analyticsReady === 'true');
  assert.equal(await page.locator('[data-metric="attempts"]').textContent(), '34');
  await page.locator('#analytics-management > summary').click();
  await page.getByRole('button', {name:'Șterge istoricul', exact:true}).click();
  await page.getByRole('button', {name:'Anulează', exact:true}).click();
  assert.equal(await page.locator('[data-metric="attempts"]').textContent(), '34');

  // A year of history is grouped into readable weekly buckets, preserving totals.
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      const request = indexedDB.open('bb.quiz.analytics.v1', 2);
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
  await page.waitForFunction(() => document.body.dataset.analyticsReady === 'true' && document.querySelector('#analytics-period').value === 'all');
  await page.locator('#analytics-activity').evaluate(node => { const disclosure = node.closest('details'); if (disclosure) disclosure.open = true; });
  await page.waitForFunction(() => document.querySelectorAll('#analytics-activity tbody tr').length > 1);
  assert.ok(await page.locator('#analytics-activity tbody tr').count() < 10, 'Only weeks with recorded work appear');
  assert.ok(await page.locator('#analytics-activity svg').evaluate(svg => svg.getBoundingClientRect().height >= 140), 'The disclosed activity chart keeps a readable compact plot');

  const grouped=await page.evaluate(()=>{
    const days=Array.from({length:100},(_,i)=>{const d=new Date(2026,0,1+i);return {date:[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'),attempts:i===0?1:i===1?9:0,correct:i===0?1:0,accuracy:i===0?100:i===1?0:null};});
    const result=BBAnalyticsCharts.groupDays(days);return {interval:result.interval,first:result.days[0]};
  });
  assert.equal(grouped.interval,'week');assert.equal(grouped.first.attempts,10);assert.equal(grouped.first.accuracy,10,'Grouped accuracy is weighted by solved questions');

  for (const file of ['testare.html', 'statistici.html']) {
    for (const width of [1440, 1280, 768, 390, 320]) {
      await page.setViewportSize({width, height:850});
      await page.goto(base + file);
      await page.waitForFunction(() => document.body.dataset.analyticsReady === 'true');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${file} overflows at ${width}`);
      if (file === 'testare.html') {
        assert.equal(await page.locator('.testing-row-progress').first().isVisible(),true,`Current progress stays visible at ${width}`);
        assert.equal(await page.locator('.testing-row-first').count(),0,'Initial and corrected scores stay together in statistics');
        const activity = await page.evaluate(async () => ({
          actual:[...document.querySelectorAll('#testing-activity tbody tr')].reduce((sum,row) => sum + Number(row.querySelector('td').textContent.replace(/[^0-9]/g,'')),0),
          expected:(await BBQuizAnalytics.getReport({days:30})).daily.reduce((sum,day) => sum + day.attempts,0)
        }));
        assert.ok(activity.expected>0,'Fixture has recent history for the restored activity preview');
        assert.equal(activity.actual,activity.expected,'The activity preview uses real recent attempts');
        assert.equal(await page.locator('#testing-activity svg').isVisible(),true,'Activity chart remains visible in the right-hand preview');
      }
      if (width === 1440 || width === 390) {
        await capture(page, file.replace('.html','')+'-fixture-'+width);
        if (file === 'statistici.html') {
          if (await page.locator('#analytics-comparison').isVisible()) {
            await page.locator('#analytics-comparison').scrollIntoViewIfNeeded();
            await capture(page, 'analytics-comparison-fixture-'+width);
          }
          await page.getByRole('tab', {name:'Istoric', exact:true}).click();
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
  await offline.waitForFunction(async () => !!(await navigator.serviceWorker.getRegistration()), null, {timeout:15000});
  await offline.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, {once:true}));
  });
  await offlineContext.setOffline(true);
  await offline.goto(base + 'statistici.html?capitol=11&perioada=7&fila=istoric');
  assert.equal(await offline.locator('body.bm-analytics').count(), 1, 'An unvisited analytics filter URL must open its cached shell offline');
  await offline.waitForFunction(() => document.body.dataset.analyticsReady === 'true');
  assert.equal(await offline.locator('#analytics-chapter').inputValue(), '11');
  assert.equal(await offline.locator('#analytics-period').inputValue(), '7');
  assert.equal(await offline.getByRole('tab', {name:'Istoric', exact:true}).getAttribute('aria-selected'), 'true');
  await offline.goto(base + 'grile_sistemul_nervos.html#grila-99');
  await offline.waitForFunction(() => document.querySelector('.page-section.active')?.id === 'page-grile-91-100');
  await offlineContext.close();
  console.log('Testing and analytics UI: catalog, empty/populated reports, filters, history pagination, links, responsive widths passed.');
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
