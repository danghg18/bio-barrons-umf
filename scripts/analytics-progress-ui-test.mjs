import assert from 'node:assert/strict';
import {readFile, mkdir} from 'node:fs/promises';
import http from 'node:http';
import {extname, resolve} from 'node:path';
import {chromium} from 'playwright';

const root = resolve(import.meta.dirname, '..');
const server = http.createServer(async (req, res) => {
  try {
    const file = resolve(root, '.' + new URL(req.url, 'http://local').pathname);
    if (!file.startsWith(root + '/')) throw Error('Invalid path');
    res.setHeader('Content-Type', ({'.js':'text/javascript', '.html':'text/html', '.css':'text/css', '.svg':'image/svg+xml'})[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch();
const base = `http://127.0.0.1:${server.address().port}`;
const output = process.env.BB_UI_OUTPUT;
if (output) await mkdir(output, {recursive:true});

try {
  const context = await browser.newContext({serviceWorkers:'block', timezoneId:'Europe/Bucharest', reducedMotion:'reduce'});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const ready = () => page.waitForFunction(() => document.body.dataset.analyticsReady === 'true');
  const tab = async name => { await page.getByRole('tab', {name, exact:true}).click(); await ready(); };
  const reload = async () => { await page.reload(); await ready(); };
  const hrefNumbers = async locator => locator.evaluateAll(links => links.map(link => Number(link.hash.replace('#grila-', ''))).sort((a,b) => a-b));
  const allMistakeNumbers = async () => {
    const result = [];
    for (;;) {
      const links = page.locator('#analytics-mistakes a[href*="#grila-"]');
      assert.ok(await links.count() <= 5, 'Mistake pages stay compact');
      result.push(...await hrefNumbers(links));
      const next = page.locator('[data-mistakes-step="1"]');
      if (!await next.count() || await next.isDisabled()) break;
      await next.click();
    }
    return result.sort((a,b) => a-b);
  };
  const captureTabs = async stage => {
    if (!output) return;
    for (const width of [1440,390]) {
      await page.setViewportSize({width,height:950});
      for (const name of ['Rezumat','Greșeli','Istoric']) {
        await tab(name);
        await page.evaluate(async () => { document.activeElement?.blur(); window.scrollTo({top:0,behavior:'instant'}); await document.fonts.ready; });
        await page.screenshot({path:resolve(output, `progress-${stage}-${name.toLowerCase()}-${width}.png`), fullPage:true});
      }
    }
  };

  await page.goto(base + '/statistici.html?capitol=3&perioada=7');
  await ready();
  assert.equal(await page.locator('h1').innerText(), 'Progresul tău');
  assert.equal(await page.getByRole('tab').count(), 3);
  assert.equal(await page.getByRole('tab', {name:'Rezumat', exact:true}).getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('#analytics-panel-greseli').isVisible(), false);
  assert.equal(await page.locator('#analytics-panel-istoric').isVisible(), false);
  assert.equal(await page.locator('#analytics-accuracy svg, #analytics-activity svg').count(), 0, 'No empty graph axes');

  // A partial initial traversal may be continued, but it cannot open a correction round.
  const fixture = await page.evaluate(async () => {
    const quiz = BB_QUIZ_INDEX.find(q => q.chapterNum === 3);
    const run = await BBQuizAnalytics.ensureRun(quiz.storageKey);
    for (const [i, question] of quiz.questions.slice(0, 10).entries()) {
      const correct = i % 5 !== 0;
      await BBQuizAnalytics.recordAttempt({storageKey:quiz.storageKey, questionId:question.id, runId:run.id,
        attemptId:BBQuizAnalytics.newAttemptId(), correct, selected:correct ? question.correct : [], answerKey:question.correct});
    }
    return {key:quiz.storageKey, runId:run.id, total:quiz.questions.length,
      wrongNumbers:quiz.questions.filter((_,i) => i % 5 === 0).map(q => q.number)};
  });
  await reload();
  assert.match(await page.locator('[data-current-progress]').innerText(), /10\s*(?:\/|din)\s*50/);
  assert.match(await page.locator('[data-current-initial]').innerText(), /80%/);
  assert.equal(await page.locator('#analytics-next-step a[href*="mod=greseli"]').count(), 0);
  assert.equal(await page.locator('#analytics-accuracy svg').count(), 0, 'One day uses a compact result rather than graph axes');
  assert.equal(await page.locator('#analytics-accuracy .analytics-day-result').count(), 1);
  assert.equal(await page.locator('#analytics-comparison tbody tr').count(), 0, 'Single-chapter summary has no duplicate comparison');
  assert.equal(await page.locator('#analytics-activity svg:visible').count(), 0, 'Activity is kept outside the summary');
  for (const width of [320,1440]) {
    await page.setViewportSize({width,height:900});
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await page.locator('#analytics-accuracy svg').count(), 0, 'Resizing does not restore one-day graph axes');
    assert.equal(await page.locator('#analytics-accuracy .analytics-day-result').count(), 1);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Compact result fits ${width}px`);
  }

  await page.evaluate(async ({key, runId}) => {
    const quiz = BB_QUIZ_INDEX.find(q => q.storageKey === key);
    for (let i = 10; i < quiz.questions.length; i++) {
      const question = quiz.questions[i], correct = i % 5 !== 0;
      await BBQuizAnalytics.recordAttempt({storageKey:key, questionId:question.id, runId,
        attemptId:BBQuizAnalytics.newAttemptId(), correct, selected:correct ? question.correct : [], answerKey:question.correct});
    }
  }, fixture);
  await reload();
  assert.match(await page.locator('[data-current-progress]').innerText(), /50\s*(?:\/|din)\s*50/);
  assert.match(await page.locator('[data-current-initial]').innerText(), /80%/);
  assert.equal(await page.locator('#analytics-next-step a[href*="mod=greseli"]').count(), 1);

  // The first correction resolves six of the original ten mistakes.
  const correction = await page.evaluate(async key => {
    const quiz = BB_QUIZ_INDEX.find(q => q.storageKey === key);
    const round = await BBQuizAnalytics.ensurePractice(key);
    for (const [i, id] of round.questionIds.entries()) {
      const question = quiz.questions.find(q => q.id === id), correct = i < 6;
      await BBQuizAnalytics.recordAttempt({storageKey:key, questionId:id, runId:round.id,
        attemptId:BBQuizAnalytics.newAttemptId(), correct, selected:correct ? question.correct : [], answerKey:question.correct});
    }
    return {id:round.id, remainingNumbers:round.questionIds.slice(6).map(id => quiz.questions.find(q => q.id === id).number)};
  }, fixture.key);
  await reload();
  assert.match(await page.locator('[data-current-initial]').innerText(), /80%/, 'Initial accuracy stays frozen after correction');
  assert.match(await page.locator('[data-current-corrected]').innerText(), /92%/);
  await tab('Greșeli');
  assert.equal(new URL(page.url()).searchParams.get('fila'), 'greseli');
  assert.equal(new URL(page.url()).searchParams.get('capitol'), '3');
  assert.equal(new URL(page.url()).searchParams.get('perioada'), '7');
  assert.equal(await page.locator('#analytics-period').isVisible(), false);
  assert.deepEqual(await hrefNumbers(page.locator('#analytics-mistakes a[href*="#grila-"]')), correction.remainingNumbers);
  assert.equal(await page.locator('#analytics-mistakes table').count(), 0, 'Review shows compact question numbers, without answer tables');
  await page.locator('#analytics-review-mode').selectOption('all');
  assert.deepEqual(await allMistakeNumbers(), fixture.wrongNumbers);
  await page.locator('#analytics-review-mode').selectOption('resolved');
  assert.deepEqual(await allMistakeNumbers(), fixture.wrongNumbers.slice(0, 6));
  await page.locator('#analytics-review-mode').selectOption('unresolved');
  assert.ok(await page.locator('[data-topic-select]').count(), 'Practised topics remain available');
  assert.doesNotMatch(await page.locator('#analytics-topics').innerText(), /Fără date/);
  await page.locator('[data-topic-select]').first().click();
  assert.equal(await page.locator('[data-topic-select][aria-pressed="true"]').count(), 1);
  const lesson = page.locator('.analytics-topic-lesson').first();
  const target = new URL(await lesson.getAttribute('href'), page.url());
  await lesson.click();
  await page.waitForFunction(section => document.querySelector('.page-section.active')?.id === 'page-' + section, target.searchParams.get('section') || target.hash.slice(1));
  await page.goBack(); await ready();

  await tab('Istoric');
  const parent = page.locator(`.analytics-run[data-run-id="${fixture.runId}"]`);
  assert.equal(await page.locator('.analytics-run').count(), 1, 'A correction round is nested under its initial traversal');
  await parent.locator('summary').first().click();
  assert.match(await parent.locator('[data-run-initial]').innerText(), /80%/);
  assert.match(await parent.locator('[data-run-corrected]').innerText(), /92%/);
  assert.equal(await parent.locator('.analytics-correction-round').count(), 1);
  assert.equal(await parent.locator('table').count(), 0, 'Run history has no expanded question table');
  assert.deepEqual(await hrefNumbers(parent.locator('.statistics-run-breakdown > section').first().locator('a[href*="#grila-"]')), fixture.wrongNumbers, 'History retains the original mistakes after partial correction');
  await captureTabs('correcting');

  await page.evaluate(async key => {
    const quiz = BB_QUIZ_INDEX.find(q => q.storageKey === key);
    const round = await BBQuizAnalytics.ensurePractice(key, true);
    for (const id of round.questionIds) {
      const question = quiz.questions.find(q => q.id === id);
      await BBQuizAnalytics.recordAttempt({storageKey:key, questionId:id, runId:round.id,
        attemptId:BBQuizAnalytics.newAttemptId(), correct:true, selected:question.correct, answerKey:question.correct});
    }
  }, fixture.key);
  await reload();
  assert.equal(await parent.locator('.analytics-correction-round').count(), 2);
  assert.match(await parent.locator('[data-run-initial]').textContent(), /80%/);
  assert.match(await parent.locator('[data-run-corrected]').textContent(), /100%/);
  assert.deepEqual(await hrefNumbers(parent.locator('.statistics-run-breakdown > section').first().locator('a[href*="#grila-"]')), fixture.wrongNumbers, 'History keeps the original mistakes even after full correction');
  await tab('Rezumat');
  assert.match(await page.locator('[data-current-initial]').innerText(), /80%/);
  assert.match(await page.locator('[data-current-corrected]').innerText(), /100%/);
  await tab('Greșeli');
  await page.locator('#analytics-review-mode').selectOption('unresolved');
  assert.equal(await page.locator('#analytics-mistakes a[href*="#grila-"]').count(), 0);

  // A new full traversal starts a new result and a new correction scope.
  const nextId = await page.evaluate(async key => {
    const quiz = BB_QUIZ_INDEX.find(q => q.storageKey === key), analytics = BBQuizAnalytics;
    const ticket = await analytics.prepareRestart({storageKey:key, resetId:analytics.newAttemptId(), answers:{}});
    await analytics.finishRestart({storageKey:key, resetId:ticket.id});
    const run = await analytics.ensureRun(key), question = quiz.questions[0];
    await analytics.recordAttempt({storageKey:key, questionId:question.id, runId:run.id,
      attemptId:analytics.newAttemptId(), correct:true, selected:question.correct, answerKey:question.correct});
    return run.id;
  }, fixture.key);
  await reload();
  assert.equal(await page.locator('#analytics-mistakes a[href*="#grila-"]').count(), 0, 'A fresh traversal cannot inherit old mistakes');
  await tab('Rezumat');
  assert.match(await page.locator('[data-current-progress]').innerText(), /1\s*(?:\/|din)\s*50/);
  assert.match(await page.locator('[data-current-initial]').innerText(), /100%/);
  await tab('Istoric');
  assert.equal(await page.locator('.analytics-run').count(), 2);
  assert.match(await page.locator(`.analytics-run[data-run-id="${nextId}"] > summary`).innerText(), /Parcurgerea\s+2/i);
  assert.match(await parent.locator('summary').first().innerText(), /Parcurgerea\s+1/i);
  assert.match(await page.locator('.analytics-run > summary').first().innerText(), /Parcurgerea\s+1/i, 'Full traversals display in increasing order');
  await page.goBack(); await ready();
  assert.equal(await page.getByRole('tab', {name:'Rezumat', exact:true}).getAttribute('aria-selected'), 'true', 'Browser Back restores the previous tab');

  // Keep chart accessibility coverage with multiple recorded dates, including a genuine 0% result.
  const plotFixture = () => {
    const days = Array.from({length:10}, (_,i) => ({date:'2026-09-' + String(i+1).padStart(2,'0'),
      attempts:[0,2,9].includes(i) ? 2 : 0, correct:i === 9 ? 0 : 1, accuracy:[0,2].includes(i) ? 50 : i === 9 ? 0 : null}));
    BBAnalyticsCharts.render('analytics-accuracy', days, 'accuracy');
    return {dates:BBAnalyticsCharts.groupDays(days).days.map(d => d.date), xs:[...document.querySelectorAll('#analytics-accuracy .chart-dot')].map(e => Number(e.getAttribute('cx')))};
  };
  const activeDays = await page.evaluate(plotFixture);
  assert.deepEqual(activeDays.dates, ['2026-09-01','2026-09-03','2026-09-10']);
  assert.ok(Math.abs((activeDays.xs[1]-activeDays.xs[0])-(activeDays.xs[2]-activeDays.xs[1])) < 1, 'Recorded dates use equal spacing without inactive gaps');
  assert.equal(await page.locator('#analytics-accuracy [data-series-index]').count(), 3);
  await page.locator('#analytics-accuracy [data-series-index]').last().focus();
  await page.waitForSelector('#analytics-tooltip:not([hidden])');
  assert.match(await page.locator('#analytics-tooltip').innerText(), /0%/);
  assert.ok(await page.locator('#analytics-tooltip').evaluate(e => e.getBoundingClientRect().width <= 180));
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#analytics-tooltip').isVisible(), false);
  for (const width of [1440,768,390,320]) {
    await page.setViewportSize({width, height:900});
    await page.evaluate(plotFixture);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `No overflow at ${width}`);
    await page.locator('#analytics-accuracy [data-series-index]').last().hover();
    await page.waitForSelector('#analytics-tooltip:not([hidden])');
    assert.ok(await page.locator('#analytics-tooltip').evaluate(e => {const r=e.getBoundingClientRect(); return r.left>=0 && r.right<=innerWidth && r.top>=0 && r.bottom<=innerHeight;}));
  }


  const touchContext = await browser.newContext({hasTouch:true, isMobile:true, viewport:{width:390,height:850}, serviceWorkers:'block'});
  const touch = await touchContext.newPage();
  await touch.goto(base + '/statistici.html');
  await touch.waitForFunction(() => document.body.dataset.analyticsReady === 'true');
  await touch.evaluate(() => { document.getElementById('analytics-report-content').hidden = false; document.getElementById('analytics-evolution').hidden = false; });
  await touch.evaluate(plotFixture);
  await touch.locator('#analytics-accuracy [data-series-index]').first().tap();
  assert.equal(await touch.locator('#analytics-tooltip').isVisible(), true);
  await touch.locator('h1').tap();
  assert.equal(await touch.locator('#analytics-tooltip').isVisible(), false);
  await touchContext.close();

  await captureTabs('new-run');

  // An account switch closes an old confirmation before any new report resolves.
  await tab('Istoric');
  await page.locator('.analytics-run > summary').first().click();
  await page.locator('#analytics-management > summary').click();
  await page.locator('#analytics-clear-start').click();
  const switched = await page.evaluate(() => {
    const original = BBQuizAnalytics.getReport;
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    window.__releaseOwnerReview = () => { BBQuizAnalytics.getReport = original; release(); };
    window.__readOwnerReport = original;
    BBQuizAnalytics.getReport = async options => { await gate; return original(options); };
    BBUserStorage.activate('statistics-owner-review-b');
    return {
      oldReportVisible:!!document.querySelector('.analytics-run')?.getClientRects().length,
      confirmationOpen:!document.getElementById('analytics-clear-confirmation').hidden
    };
  });
  assert.equal(switched.oldReportVisible, false, 'Private report is hidden synchronously on identity change');
  assert.equal(switched.confirmationOpen, false, 'An old deletion confirmation cannot authorize a new owner');
  const ownerResult = await page.evaluate(async () => {
    await BBQuizAnalytics.ready;
    const quiz = BB_QUIZ_INDEX.find(q => q.chapterNum === 3), question = quiz.questions[0];
    const run = await BBQuizAnalytics.ensureRun(quiz.storageKey);
    await BBQuizAnalytics.recordAttempt({storageKey:quiz.storageKey, questionId:question.id, runId:run.id,
      attemptId:BBQuizAnalytics.newAttemptId(), correct:true, selected:question.correct, answerKey:question.correct});
    // A queued activation of the old control must also be harmless.
    document.getElementById('analytics-clear-confirm').click();
    const result = await window.__readOwnerReport({days:'all'});
    window.__releaseOwnerReview();
    return {runId:run.id, solved:result.summary.solved};
  });
  await ready();
  assert.equal(ownerResult.solved, 1, 'A stale confirmation does not delete the next account history');
  assert.equal(await page.locator(`.analytics-run[data-run-id="${fixture.runId}"]`).count(), 0);
  assert.equal(await page.locator(`.analytics-run[data-run-id="${nextId}"]`).count(), 0);
  assert.equal(await page.locator(`.analytics-run[data-run-id="${ownerResult.runId}"]`).count(), 1);
  assert.equal(await page.locator('#analytics-history details[open], #analytics-management[open]').count(), 0);
  assert.deepEqual(errors, []);
  console.log('Progress UI: tabs, initial/corrected results, nested correction history, fresh-run scope, compact day result, responsive and accessible charts passed.');
} finally { await browser.close(); await new Promise(done => server.close(done)); }
