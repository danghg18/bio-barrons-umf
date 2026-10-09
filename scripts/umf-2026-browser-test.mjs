import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import vm from 'node:vm';
import {chromium} from 'playwright';
import {loadSiteRegistry, publishedResources} from './site-registry.mjs';

// Release gate for 17 chapter sets and the associative collection (1,990 items).
// Run: node scripts/umf-2026-browser-test.mjs
// Screenshots + evidence: tmp/umf-2026/browser-qa/ (override BB_UMF_BROWSER_OUTPUT).
// No quiz data, expected answer or question count is replaced in the served site.
const root = resolve(import.meta.dirname, '..');
const prefix = '/bio-barrons-umf/';
const output = resolve(process.env.BB_UMF_BROWSER_OUTPUT || resolve(root, 'tmp/umf-2026/browser-qa'));
const readJSON = async file => JSON.parse(await readFile(resolve(root, file), 'utf8'));
const [sourceMap, fixture, decisions, registry] = await Promise.all([
  readJSON('data/quiz-source-map.json'), readJSON('tests/umf-cluj-2026-answer-key.json'),
  readJSON('data/umf-2026-semantic-revisions.json'), loadSiteRegistry()
]);
const sets = sourceMap.filter(set => set.publicationStatus !== 'deferred');
const numbersFor = set => set.ranges.flatMap(([start, end]) => Array.from({length:end - start + 1}, (_, i) => start + i));
const lettersFor = (set, number) => [...new Set(fixture.chapters[set.sourceChapter].answers[number].printed)].sort();
const published = publishedResources(registry).resources.filter(resource => resource.kind === 'quiz');
assert.equal(sets.length, 18, 'This release contains 17 chapter sets and one associative collection');
assert.equal(sets.reduce((sum, set) => sum + numbersFor(set).length, 0), 1990);
assert.deepEqual(Array.from(published, item => item.url).sort(), sets.map(set => set.url).sort(), 'All 18 approved sets are published');
const coverage = new Set();
for (const set of sets) {
  const sandbox = {window:{}};
  vm.runInNewContext(await readFile(resolve(root, set.dataFile), 'utf8'), sandbox, {filename:set.dataFile});
  set.quiz = JSON.parse(JSON.stringify(sandbox.window.BB_QUIZ || sandbox.window.BB_NERVOUS_QUIZ));
  set.numbers = numbersFor(set);
  assert.deepEqual(set.quiz.questions.map(q => q.number), set.numbers, set.name + ': original numbering');
  assert.equal(set.quiz.questionCount, set.numbers.length);
  assert.equal(set.quiz.storageKey, set.storageKey);
  assert.deepEqual(set.quiz.ranges.flatMap(range => Array.from({length:range.end - range.start + 1}, (_, i) => range.start + i)), set.numbers);
  for (const range of set.quiz.ranges) assert.ok(range.end >= range.start && range.end - range.start < 10, 'At most ten items per range');
  for (const q of set.quiz.questions) {
    const identity = set.sourceChapter + '/' + q.number;
    assert.ok(!coverage.has(identity), 'No duplicated source question: ' + identity); coverage.add(identity);
    assert.equal(q.sourceNumber, q.number); assert.equal(q.sourceChapter, set.sourceChapter);
    assert.deepEqual(q.correct, lettersFor(set, q.number), 'Independent printed key: ' + identity);
    assert.equal(q.options.map(o => o.letter).join(''), 'ABCDE');
    assert.ok(q.options.every(o => o.text?.trim() && o.why?.trim()), 'Five complete options/explanations: ' + identity);
    const decision = decisions.find(row => row.storageKey === set.storageKey && row.id === q.id);
    if (decision) assert.equal(q.contentRevision || 0, decision.requiresReverification ? 1 : 0, 'Reviewed semantic revision: ' + identity);
  }
}
assert.equal(coverage.size, 1990);
await mkdir(output, {recursive:true});
const evidence = {
  status:'running', startedAt:new Date().toISOString(), prefix, sets:18, questions:1990,
  scope:'I–XIII, including the associative collection', screenshots:[], results:[],
  additionalExistingCoverage:{
    'scripts/quiz-mistakes-test.mjs':'Completed initial run, original IDs, correction rounds, corrected-question removal, source-run isolation and visible search.',
    'scripts/quiz-content-compatibility-test.mjs':'Old hashes, stable IDs, retired answers, semantic reverification and retained priorResults.',
    'scripts/quiz-content-history-test.mjs':'Frozen historical key/scope, successor traversal, rejected stale contentRevision.',
    'scripts/simulation-browser-test.mjs':'Visible configuration, navigation, reload, submission/review, cross-tab conflict, storage errors and offline expiry.',
    'scripts/simulation-upgrade-test.mjs':'Old installed cache-first worker cannot supply stale index/storage; local simulation results stay outside the cloud outbox.'
  },
  note:'Existing suites are named for coverage, not claimed as executed by this command. Screenshots require separate visual inspection.'
};
const saveEvidence = () => writeFile(resolve(output, 'results.json'), JSON.stringify(evidence, null, 2) + '\n');
const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.woff2':'font/woff2'};
const server = http.createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, path.slice(prefix.length) || 'index.html');
    if (!path.startsWith(prefix) || !file.startsWith(root + sep)) throw Error('Outside Pages prefix');
    const body = await readFile(file);
    res.writeHead(200, {'Content-Type':mime[extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store'}); res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}${prefix}`;
let browser, activePage;
async function ready(page) {
  await page.waitForFunction(() => document.body?.dataset.bbSharedReady === 'true');
  assert.equal(await page.locator('.quiz-fatal').count(), 0);
}
async function noOverflow(page, label) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), label + ': no horizontal overflow');
}
async function capture(page, name, locator) {
  await page.evaluate(() => document.fonts.ready);
  const path = resolve(output, name + '.png');
  const viewport = page.viewportSize();
  if (locator) {
    // An isolated feedback card needs enough height for all five explanations.
    // Width stays unchanged; shell screenshots retain the real device viewport.
    const height = Math.max(viewport.height, Math.ceil(await locator.evaluate(node => node.getBoundingClientRect().height)) + 240);
    try {
      await page.setViewportSize({...viewport, height});
      await locator.scrollIntoViewIfNeeded();
      await locator.screenshot({path, animations:'disabled', style:'.lab-topbar, .lesson-skip { visibility:hidden !important; }'});
    } finally { await page.setViewportSize(viewport); }
  } else await page.screenshot({path, animations:'disabled'});
  evidence.screenshots.push({name, path, viewport, kind:locator ? 'isolated-card-extended-height-fixed-header-hidden' : 'device-viewport'});
}
async function chooseNumber(page, number, phone) {
  if (phone) await page.locator('.lab-menu-trigger').click();
  await page.locator(`.quiz-question-map a[href="#grila-${number}"]`).click();
  await page.waitForFunction(number => document.getElementById('grila-' + number)?.closest('.page-section')?.classList.contains('active'), number);
  assert.equal(await page.locator('main').evaluate(node => node.inert), false, 'Drawer releases the content');
}
async function answer(page, set, question, letters, expected) {
  const card = page.locator('#grila-' + question.number);
  for (const letter of letters) await card.locator(`input[value="${letter}"]`).check();
  await card.locator('.quiz-check').click();
  await page.waitForSelector(`#grila-${question.number}.is-verified`);
  assert.equal(await card.evaluate(node => node.classList.contains('is-correct')), expected, `${set.name}/${question.number}: exact-set scoring`);
  assert.equal(await card.locator('.quiz-option-explanation:visible').count(), 5, 'All five explanations become visible');
  assert.deepEqual(await card.locator('.quiz-option-explanation > p:first-of-type').allTextContents(), question.options.map(option => option.why));
  await page.waitForFunction(async ({key, id}) => {
    const report = await BBQuizAnalytics.getReport({days:'all'});
    return report.history.some(event => event.storageKey === key && event.questionId === id);
  }, {key:set.storageKey, id:question.id});
  const saved = await page.evaluate(async ({key, id}) => ({
    answer:BBUserStorage.get(key).questions[id],
    event:(await BBQuizAnalytics.getReport({days:'all'})).history.find(event => event.storageKey === key && event.questionId === id)
  }), {key:set.storageKey, id:question.id});
  assert.deepEqual(saved.answer.selected, letters);
  assert.equal(saved.answer.verified, true); assert.equal(saved.answer.correct, expected);
  assert.equal(saved.answer.contentRevision || 0, question.contentRevision || 0, 'Persisted revision matches reviewed content');
  assert.equal(saved.event.contentRevision || 0, question.contentRevision || 0, 'History revision matches reviewed content');
  assert.equal(saved.event.correct, expected);
  assert.deepEqual(saved.event.answerKey, lettersFor(set, question.number), 'History stores the independent current key');
}

try {
  browser = await chromium.launch({headless:true});
  for (const device of [{name:'desktop', viewport:{width:1440, height:1000}}, {name:'phone', viewport:{width:390, height:844}}]) {
    const phone = device.name === 'phone';
    const context = await browser.newContext({viewport:device.viewport, isMobile:phone, hasTouch:phone, serviceWorkers:'block', reducedMotion:'reduce'});
    // All persistence exercised here is local guest data, never a live account.
    await context.route('**/assets/js/supabase-config.js*', route => route.fulfill({contentType:'text/javascript', body:"window.BB_SUPABASE_CONFIG={url:'',publishableKey:''};"}));
    await context.route('https://*.supabase.co/**', route => route.abort());
    const page = await context.newPage(); activePage = page; page.setDefaultTimeout(15000);
    const errors = [], failedLocalRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) failedLocalRequests.push(response.url() + ': ' + response.status()); });
    for (const set of sets) {
      evidence.current = {device:device.name, chapterNum:set.chapterNum, url:set.url};
      await page.goto(base + 'testare.html');
      await page.waitForFunction(() => document.body?.dataset.analyticsReady === 'true');
      assert.equal(await page.locator('#lab-testing-catalog a[id^="testing-quiz-"]').count(), 18);
      assert.match(await page.locator('#lab-testing-count').innerText(), /18/);
      assert.deepEqual(await page.locator('#lab-testing-catalog a[id^="testing-quiz-"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')).sort()), sets.map(item => item.url).sort());
      assert.equal(await page.locator('.testing-progress-count + progress').getAttribute('max'), '1990');
      if (set === sets[0]) { await noOverflow(page, device.name + ' catalog'); await capture(page, device.name + '-catalog'); }
      await page.locator('#testing-quiz-' + set.chapterNum).click(); await ready(page);
      assert.equal(new URL(page.url()).pathname, prefix + set.url);
      assert.equal(await page.locator('.quiz-question').count(), set.numbers.length);
      assert.deepEqual(await page.locator('.quiz-question').evaluateAll(nodes => nodes.map(node => Number(node.id.slice(6)))), set.numbers);
      assert.deepEqual(await page.locator('.quiz-map-number').allTextContents(), set.numbers.map(String));
      assert.deepEqual(await page.locator('.quiz-question-number').allTextContents(), set.quiz.questions.map(q => 'Grila ' + q.number + (q.mixed ? ' · Întrebare mixtă' : '')));
      const runtime = await page.evaluate(() => {
        const q = window.BB_QUIZ || window.BB_NERVOUS_QUIZ;
        const indexed = BB_QUIZ_INDEX.find(item => item.storageKey === q.storageKey);
        return {revision:q.contentRevision || 0, indexedRevision:indexed.contentRevision || 0, revisions:q.questions.map(item => item.contentRevision || 0), indexedRevisions:indexed.questions.map(item => item.contentRevision || 0)};
      });
      assert.equal(runtime.revision, set.quiz.contentRevision || 0); assert.equal(runtime.indexedRevision, runtime.revision);
      assert.deepEqual(runtime.revisions, set.quiz.questions.map(q => q.contentRevision || 0)); assert.deepEqual(runtime.indexedRevisions, runtime.revisions);
      assert.equal(await page.locator('.lab-topbar-back').getAttribute('href'), set.lessonUrl);
      if (phone) await page.locator('.lab-menu-trigger').click();
      await page.locator('#sidenav').getByRole('link', {name:set.sourceChapter === 'XIII' ? '← Toate testele' : 'Lecția', exact:true}).click();
      assert.equal(new URL(page.url()).pathname, prefix + set.lessonUrl, 'Back link opens the parent lesson or collection catalog');
      await page.goBack(); await ready(page);
      const boundaries = [];
      for (const range of set.quiz.ranges) {
        for (const number of [...new Set([range.start, range.end])]) {
          await chooseNumber(page, number, phone);
          assert.equal(await page.locator('.page-section.active').getAttribute('id'), 'page-' + range.id);
          assert.deepEqual(await page.locator('.page-section.active .quiz-question').evaluateAll(nodes => nodes.map(node => Number(node.id.slice(6)))), set.numbers.filter(n => n >= range.start && n <= range.end));
          boundaries.push(number);
        }
      }
      const first = set.quiz.questions[0], last = set.quiz.questions.at(-1);
      await chooseNumber(page, first.number, phone);
      await noOverflow(page, device.name + '/' + set.url);
      await page.locator('#grila-' + first.number).scrollIntoViewIfNeeded();
      await capture(page, `${device.name}-${set.chapterNum}-question`);
      await answer(page, set, first, lettersFor(set, first.number), true);
      await capture(page, `${device.name}-${set.chapterNum}-feedback`, page.locator('#grila-' + first.number));
      await chooseNumber(page, last.number, phone);
      await answer(page, set, last, lettersFor(set, last.number), true);
      await page.reload(); await ready(page);
      assert.equal(await page.locator('#grila-' + last.number + '.is-correct').isVisible(), true, 'Last answer and source hash survive reload');
      await chooseNumber(page, first.number, phone);
      assert.equal(await page.locator('#grila-' + first.number + '.is-correct').isVisible(), true, 'First answer survives reload');
      assert.equal(await page.locator('#grila-' + first.number + ' .quiz-option-explanation:visible').count(), 5);
      // An extra letter must fail exact-set scoring and retain its original number in analytics.
      const wrong = set.quiz.questions.find(q => q !== first && q !== last && lettersFor(set, q.number).length < 5);
      const key = lettersFor(set, wrong.number), extra = [...'ABCDE'].find(letter => !key.includes(letter));
      await chooseNumber(page, wrong.number, phone); await answer(page, set, wrong, [...key, extra].sort(), false);
      const query = last.prompt.trim().slice(0, 110);
      await page.locator('.lesson-search-trigger').click();
      await page.locator('#lesson-search-input').fill(query);
      await page.waitForSelector('.search-found-current');
      assert.ok(await page.locator('.search-found-current').first().isVisible(), 'Visible search finds actual authored text');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#lesson-search-input').isVisible(), false);
      assert.equal(await page.locator('.quiz-question.is-verified').count(), 3, 'Search preserves all submitted answers');
      evidence.results.push({device:device.name, chapterNum:set.chapterNum, url:set.url, count:set.numbers.length, boundaries, correct:[first.number,last.number], wrong:wrong.number, search:query, passed:true});
      await saveEvidence(); console.log(`PASS ${device.name}: ${set.name} (${set.numbers.length} items, ${boundaries.length} boundaries)`);
    }
    evidence.current = {device:device.name, surface:'statistics-and-simulation'};
    await page.goto(base + 'statistici.html'); await page.waitForFunction(() => document.body?.dataset.analyticsReady === 'true');
    assert.equal(await page.locator('#analytics-chapter option').count(), 19, 'All + 18 quiz filters');
    const report = await page.evaluate(() => BBQuizAnalytics.getReport({days:'all'}));
    assert.equal(report.quizzes.length, 18); assert.equal(report.history.length, 54);
    assert.equal(report.quizzes.reduce((sum, quiz) => sum + quiz.current.total, 0), 1990);
    for (const set of sets) {
      const result = evidence.results.find(item => item.device === device.name && item.chapterNum === set.chapterNum);
      assert.ok(report.mistakes.some(item => item.chapterNum === set.chapterNum && item.number === result.wrong), 'Mistakes retain original source numbers');
      await page.locator('#analytics-chapter').selectOption(String(set.chapterNum));
      await page.waitForFunction(total => document.querySelector('.statistics-progress')?.max === total, set.numbers.length);
      assert.equal(await page.locator('[data-current-progress]').innerText().then(text => text.replace(/\s+/g,' ').trim()), `3 din ${set.numbers.length} grile`);
    }
    await noOverflow(page, device.name + ' statistics'); await capture(page, device.name + '-statistics');
    await page.goto(base + 'testare.html'); await page.waitForFunction(() => document.body?.dataset.analyticsReady === 'true');
    assert.deepEqual(await page.locator('[name="simulation-chapter"]').evaluateAll(nodes => nodes.map(node => Number(node.value)).sort((a,b) => a-b)), sets.map(set => set.chapterNum).sort((a,b) => a-b));
    await page.getByRole('button', {name:'Selectează toate', exact:true}).click();
    assert.equal(await page.locator('[name="simulation-chapter"]:checked').count(), 18);
    assert.equal((await page.locator('[data-allocation]').allTextContents()).reduce((sum, value) => sum + (parseInt(value) || 0), 0), 35);
    await page.getByRole('button', {name:'Începe simularea', exact:true}).click();
    await page.waitForURL(/simulare.html\?test=/); await page.waitForSelector('.sim-question');
    const simulation = await page.evaluate(() => BBSimulationStore.list()[0]);
    assert.equal(simulation.questions.length, 35);
    assert.deepEqual([...new Set(simulation.questions.map(q => q.chapterNum))].sort((a,b) => a-b), sets.map(set => set.chapterNum).sort((a,b) => a-b));
    for (const q of simulation.questions) {
      const set = sets.find(item => item.chapterNum === q.chapterNum);
      const original = set.quiz.questions.find(item => item.id === q.questionId || item.id === q.id);
      assert.ok(original, 'Simulation keeps a known source identity');
      assert.deepEqual(q.correct, lettersFor(set, original.number));
      assert.equal(q.contentRevision || 0, original.contentRevision || 0);
    }
    await noOverflow(page, device.name + ' simulation'); await capture(page, device.name + '-simulation');
    assert.deepEqual(errors, [], 'No JavaScript errors'); assert.deepEqual(failedLocalRequests, [], 'No failed local assets');
    await context.close();
  }
  assert.equal(evidence.results.length, sets.length * 2);
  evidence.status = 'passed'; delete evidence.current; evidence.completedAt = new Date().toISOString(); await saveEvidence();
  console.log(`PASS: 18 sets / 1,990 items on desktop and phone; independent scoring, revisions, ranges, search, persistence, statistics and all-chapter simulation. Captures: ${output}`);
} catch (error) {
  if (activePage && !activePage.isClosed()) {
    await activePage.screenshot({path:resolve(output, 'failure.png')}).catch(() => {});
    evidence.failureUrl = activePage.url();
  }
  evidence.status = 'failed'; evidence.error = error.stack; await saveEvidence(); throw error;
} finally {
  await browser?.close(); await new Promise(done => server.close(done));
}
