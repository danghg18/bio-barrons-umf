import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import http from 'node:http';
import {extname, resolve, sep} from 'node:path';
import {chromium} from 'playwright';

const root = resolve(import.meta.dirname, '..'), prefix = '/bio-barrons-umf/';
const context = {window:{}};
vm.runInNewContext(await readFile(resolve(root, 'assets/js/grile-reproducator-feminin-data.js'), 'utf8'), context);
const quiz = JSON.parse(JSON.stringify(context.window.BB_QUIZ));
quiz.questions = quiz.questions.slice(0, 2).map((question, index) => ({...question,
  legacyNumber:index + 1, number:69 + index, sourceNumber:69 + index,
  sourceChapter:'XII', asksFalse:false, contentRevision:0
}));
quiz.questions[0].correct = ['A'];
quiz.questions[1].correct = ['C'];
quiz.contentRevision = 0;
quiz.previousQuestionIds = quiz.questions.map(question => question.id);
quiz.questionCount = 2; quiz.firstNumber = 69;
quiz.ranges = [{id:'grile-69-70', start:69, end:70}];
delete quiz.retiredQuestions;
const html = (await readFile(resolve(root, 'grile_sistemul_reproducator_feminin.html'), 'utf8'))
  .replace(/    <div class="page-section[\s\S]*?(?=  <\/main>)/, '<div class="page-section active" id="page-grile-69-70"></div>');
const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml'};
const server = http.createServer(async (req, res) => { try {
  const path = new URL(req.url, 'http://localhost').pathname;
  const file = resolve(root, path.slice(prefix.length) || 'index.html');
  if (!path.startsWith(prefix) || !file.startsWith(root + sep)) throw Error();
  const body = path.endsWith('/grile_sistemul_reproducator_feminin.html') ? html :
    path.endsWith('/grile-reproducator-feminin-data.js') ? 'window.BB_QUIZ=' + JSON.stringify(quiz) + ';' :
    path.endsWith('/quiz-index.js') ? 'window.BB_QUIZ_INDEX=' + JSON.stringify([{...quiz,
      questions:quiz.questions.map(question => ({...question, rangeId:'grile-69-70'})),
      chapterNum:23, name:'Feminin', url:'grile_sistemul_reproducator_feminin.html'
    }]) + ';' : await readFile(file);
  res.writeHead(200, {'Content-Type':mime[extname(file)] || 'application/octet-stream'}); res.end(body);
} catch { res.writeHead(404); res.end(); } });
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}${prefix}`;
const browser = await chromium.launch();
try {
  const browserContext = await browser.newContext({serviceWorkers:'block', reducedMotion:'reduce'});
  const page = await browserContext.newPage();
  const ready = () => page.waitForFunction(() => document.body.dataset.bbSharedReady === 'true');
  const saved = () => page.evaluate(key => BBUserStorage.get(key).questions['rf-001'], quiz.storageKey);
  const report = () => page.evaluate(() => BBQuizAnalytics.getReport({days:'all'}));
  await page.goto(base + 'grile_sistemul_reproducator_feminin.html'); await ready();
  await page.locator('#rf-001-a').check();
  await page.locator('#grila-69 .quiz-check').click();
  await page.waitForFunction(key => BBUserStorage.get(key).questions['rf-001'].verified, quiz.storageKey);
  const originalReport = await report(), original = originalReport.history[0];
  assert.equal(originalReport.history.length, 1);
  assert.deepEqual(original.selected, ['A']); assert.equal(original.correct, true);
  const originalRun = originalReport.runs.find(run => run.id === original.runId);

  quiz.contentRevision = 1; quiz.questions[0].contentRevision = 1;
  quiz.questions[0].correct = ['B'];
  await page.reload(); await ready();
  assert.equal(await page.locator('#rf-001-a').isEnabled(), true);
  assert.match(await page.locator('#grila-69 .quiz-result').innerText(), /actualizat.*verifică/i);
  await page.locator('#rf-001-a').uncheck(); await page.locator('#rf-001-b').check();
  const pendingAttempts = await page.evaluate(key => BBUserStorage.get(key + '.attempts.v1'), quiz.storageKey);
  await page.reload(); await ready();
  assert.equal(await page.locator('#rf-001-b').isChecked(), true, 'The revised draft survives reload');
  assert.deepEqual(await page.evaluate(key => BBUserStorage.get(key + '.attempts.v1'), quiz.storageKey), pendingAttempts,
    'Reload does not renew the in-progress attempt identity');
  await page.locator('#grila-69 .quiz-check').click();
  await page.waitForFunction(() => !document.querySelector('#grila-69 .quiz-check').disabled);
  assert.equal((await saved()).verified, true,
    'A previously recorded question can be verified after a semantic revision; an old event ID must not block it');
  assert.deepEqual((await saved()).selected, ['B']);
  assert.equal((await saved()).contentRevision, 1);
  assert.equal((await saved()).priorResults.length, 1);
  assert.deepEqual((await saved()).priorResults[0].selected, ['A']);
  assert.equal((await saved()).priorResults[0].correct, true);
  let upgradedReport = await report();
  assert.equal(upgradedReport.history.length, 2, 'Both editions retain exactly one dated result');
  const fresh = upgradedReport.history.find(event => event.contentRevision === 1);
  assert.ok(fresh); assert.notEqual(fresh.id, original.id, 'A new revision receives a new event identity');
  assert.notEqual(fresh.runId, original.runId, 'The revised result belongs to its successor traversal');
  assert.deepEqual(upgradedReport.history.find(event => event.id === original.id), original, 'The original dated result is unchanged');
  const archived = upgradedReport.runs.find(run => run.id === originalRun.id);
  assert.deepEqual(archived.answers, originalRun.answers, 'Archiving preserves the original scores and selections');
  assert.equal(archived.isCurrent, false);
  assert.equal(await page.evaluate(async event => BBQuizAnalytics.recordAttempt({
    storageKey:event.storageKey, questionId:event.questionId, selected:event.selected,
    correct:event.correct, attemptId:event.id, runId:event.runId,
    answerKey:event.answerKey, contentRevision:event.contentRevision
  }), fresh), false, 'Retrying the same revised event is idempotent');
  await page.reload(); await ready();
  assert.equal(await page.locator('#rf-001-b').isEnabled(), false, 'The new verification remains locked after reload');
  assert.equal((await saved()).priorResults.length, 1, 'Reload never duplicates the preserved old result');
  upgradedReport = await report();
  assert.equal(upgradedReport.history.length, 2, 'Retry and reload never duplicate history');
  assert.equal(upgradedReport.history.find(event => event.contentRevision === 1).id, fresh.id);
  console.log('UI semantic reverification, fresh revision identity, retry/reload idempotence and frozen original history passed.');
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
