import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const source = await readFile(new URL('../assets/js/quiz-analytics.js', import.meta.url), 'utf8');
const storageSource = await readFile(new URL('../assets/js/user-storage.js', import.meta.url), 'utf8');
const quizzes = [1, 3].map(chapterNum => ({
  chapterNum, name: `Capitol ${chapterNum}`, url: `quiz-${chapterNum}.html`, storageKey: `quiz.corrections.${chapterNum}`, version: 1,
  ranges: [{ id: 'all', start: 1, end: 10 }],
  topics: [{ id: 'first', label: 'Prima parte', lessonUrl: 'lesson.html#first' }, { id: 'last', label: 'Ultima parte', lessonUrl: 'lesson.html#last' }],
  questions: Array.from({ length: 10 }, (_, i) => ({ id: `q${i + 1}`, number: i + 1, rangeId: 'all', correct: ['A', 'B'], topicId: i < 5 ? 'first' : 'last' }))
}));
const key = quizzes[0].storageKey;
const server = http.createServer((_request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end('<!doctype html><title>Traversal corrections</title>');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const failures = [];

async function load(page, scoped = false) {
  await page.goto(base);
  await page.evaluate(value => { window.BB_QUIZ_INDEX = value; }, quizzes);
  if (scoped) await page.addScriptTag({ content: storageSource });
  await page.addScriptTag({ content: source });
  await page.evaluate(() => BBQuizAnalytics.ready);
}
async function report(page, options = { days: 'all' }) {
  return page.evaluate(options => BBQuizAnalytics.getReport(options), options);
}
async function verify(page, run, number, correct) {
  return page.evaluate(async ({ run, number, correct }) => {
    const questionId = `q${number}`;
    const selected = correct ? ['A', 'B'] : ['A'];
    const accepted = await BBQuizAnalytics.recordAttempt({ storageKey: run.storageKey, runId: run.id, questionId, correct, selected, answerKey: ['A', 'B'], attemptId: BBQuizAnalytics.newAttemptId() });
    if (accepted && run.mode !== 'mistakes') {
      const current = window.BBUserStorage ? BBUserStorage.get(run.storageKey) : JSON.parse(localStorage.getItem(run.storageKey) || 'null');
      const saved = current || { version: 1, questions: {} };
      saved.questions[questionId] = { selected, correct, verified: true };
      if (window.BBUserStorage) BBUserStorage.set(run.storageKey, saved); else localStorage.setItem(run.storageKey, JSON.stringify(saved));
    }
    return accepted;
  }, { run, number, correct });
}
async function full(page, correctCount = 7, storageKey = key) {
  const run = await page.evaluate(key => BBQuizAnalytics.ensureRun(key), storageKey);
  for (let n = 1; n <= 10; n++) assert.equal(await verify(page, run, n, n <= correctCount), true);
  return run;
}
async function practice(page, sourceRun, restart = false) {
  return page.evaluate(({ key, id, restart }) => BBQuizAnalytics.ensurePractice(key, restart, id), { key: sourceRun.storageKey, id: sourceRun.id, restart });
}
async function restart(page, run) {
  return page.evaluate(async run => {
    const ticket = await BBQuizAnalytics.prepareRestart({ storageKey: run.storageKey, runId: run.id, resetId: BBQuizAnalytics.newAttemptId() });
    if (window.BBUserStorage) BBUserStorage.set(run.storageKey, { version: 1, questions: {} });
    else localStorage.setItem(run.storageKey, JSON.stringify({ version: 1, questions: {} }));
    await BBQuizAnalytics.finishRestart({ storageKey: run.storageKey, resetId: ticket.id });
    return ticket;
  }, run);
}
async function test(name, body, scoped = false) {
  const context = await browser.newContext({ timezoneId: 'Europe/Bucharest' });
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date('2026-09-19T10:00:00Z'));
  try {
    await load(page, scoped);
    await body(page, context);
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push({ name, error });
    console.error(`FAIL ${name}: ${error.stack}`);
  } finally { await context.close(); }
}

try {
  await test('correction practice is unavailable until every full-chapter question is verified', async page => {
    const run = await page.evaluate(key => BBQuizAnalytics.ensureRun(key), key);
    assert.equal(await verify(page, run, 1, false), true);
    assert.equal(await practice(page, run), null, 'One wrong answer cannot start corrections before the full chapter is finished');
    const data = await report(page);
    assert.equal(data.runs[0].initialComplete, false);
    assert.equal(data.runs[0].correction.canPractice, false);
  });

  await test('70 percent becomes 100 after three correction rounds while the initial result stays frozen', async page => {
    const initial = await full(page);
    const original = (await report(page)).runs.find(run => run.id === initial.id);
    const saved = await page.evaluate(key => localStorage.getItem(key), key);
    const one = await practice(page, initial);
    assert.equal(one.sourceRunId, initial.id);
    assert.deepEqual(one.questionIds, ['q8', 'q9', 'q10']);
    assert.equal((await report(page)).runs.find(run => run.id === initial.id).correction.roundCount, 0, 'Opening an empty correction round never counts as a try');
    assert.equal((await practice(page, initial, true)).id, one.id, 'An unfinished round resumes, even when restart is requested');
    await verify(page, one, 8, true);
    await verify(page, one, 9, false);
    await verify(page, one, 10, false);
    let parent = (await report(page)).runs.find(run => run.id === initial.id);
    assert.equal(parent.correction.accuracy, 80);
    assert.equal(parent.correction.roundCount, 1);
    assert.deepEqual(parent.correction.remainingIds, ['q9', 'q10']);
    assert.equal((await practice(page, initial)).id, one.id, 'The completed round remains resumable until the next round is requested');
    const two = await practice(page, initial, true);
    assert.deepEqual(two.questionIds, ['q9', 'q10']);
    await verify(page, two, 9, true);
    await verify(page, two, 10, false);
    const three = await practice(page, initial, true);
    assert.deepEqual(three.questionIds, ['q10']);
    await verify(page, three, 10, true);
    parent = (await report(page)).runs.find(run => run.id === initial.id);
    assert.equal(parent.number, 1);
    assert.equal(parent.initialComplete, true);
    assert.deepEqual([parent.correct, parent.wrong, parent.accuracy], [7, 3, 70]);
    assert.deepEqual(parent.answers, original.answers, 'Correction events never rewrite original answers or grading outcomes');
    assert.deepEqual([parent.correction.roundCount, parent.correction.corrected, parent.correction.remaining, parent.correction.accuracy, parent.correction.complete], [3, 3, 0, 100, true]);
    assert.deepEqual(parent.correction.rounds.map(round => round.roundNumber), [1, 2, 3]);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), key), saved, 'Practice leaves the complete quiz answer cache byte-for-byte unchanged');
    await load(page);
    assert.equal((await practice(page, initial)).id, three.id, 'Reload retains the successful final round');
    assert.equal(await practice(page, initial, true), null, 'No fourth round exists after all errors are corrected');
    assert.equal((await practice(page, initial)).id, three.id);
  });

  await test('full traversal numbering survives filters, updates, reload and independent quiz histories', async page => {
    await page.clock.setFixedTime(new Date('2026-08-01T10:00:00Z'));
    const first = await full(page, 10);
    await restart(page, first);
    await page.clock.setFixedTime(new Date('2026-09-19T10:00:00Z'));
    const second = await full(page, 9);
    const other = await full(page, 10, quizzes[1].storageKey);
    assert.deepEqual([first.number, second.number, other.number], [1, 2, 1]);
    const child = await practice(page, second);
    await verify(page, child, 10, true);
    for (const days of [7, 30, 'all']) {
      const data = await report(page, { chapterNum: 1, days });
      assert.equal(data.runs.find(run => run.id === second.id).number, 2);
      assert.equal(data.quizzes[0].activeRunId, second.id);
      assert.equal(data.runs.find(run => run.id === second.id).isCurrent, true);
      if (days !== 'all') assert.equal(data.runs.some(run => run.id === first.id), false);
    }
    await load(page);
    assert.equal((await report(page)).runs.find(run => run.id === second.id).number, 2);
    await page.evaluate(() => BBQuizAnalytics.clearHistory(1));
    assert.equal((await report(page)).runs.find(run => run.id === other.id).number, 1);
  });

  await test('full restart archives the parent and fences a stale correction tab before reset recovery', async (page, context) => {
    const initial = await full(page);
    const child = await practice(page, initial);
    await verify(page, child, 8, false);
    const stale = await context.newPage();
    await load(stale);
    assert.equal((await practice(stale, initial)).id, child.id);
    const ticket = await page.evaluate(run => BBQuizAnalytics.prepareRestart({ storageKey: run.storageKey, runId: run.id, resetId: 'pending-full-reset' }), initial);
    assert.equal(await verify(stale, child, 9, true), false, 'A pending full reset fences correction writes in other tabs');
    assert.equal(await practice(stale, initial, true), null);
    assert.equal(await page.evaluate(key => BBQuizAnalytics.ensureRun(key).then(() => false, error => /Restart requires recovery/.test(error.message)), key), true);
    assert.equal((await report(page)).canPersist, true, 'A logical pending-reset rejection must not poison working IndexedDB storage');
    let parent = (await report(page)).runs.find(run => run.id === initial.id);
    assert.equal(parent.isCurrent, false);
    assert.equal(parent.correction.canPractice, false);
    assert.equal(parent.correction.rounds[0].status, 'stopped');
    await page.evaluate(async ({ key, ticket }) => {
      localStorage.setItem(key, JSON.stringify({ version: 1, questions: {} }));
      await BBQuizAnalytics.finishRestart({ storageKey: key, resetId: ticket.id });
    }, { key, ticket });
    const next = await page.evaluate(key => BBQuizAnalytics.ensureRun(key), key);
    assert.equal(next.number, 2);
    assert.equal(await practice(page, initial), null, 'An archived source cannot start more rounds');
    assert.equal(await practice(page, next), null, 'The next traversal must first finish its own full chapter');
    assert.equal(await verify(stale, child, 10, true), false);
  });

  await test('complete undated cache can begin corrections without fabricated dates or unrelated explicit sources', async page => {
    await page.evaluate(key => localStorage.setItem(key, JSON.stringify({ version: 1, questions: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`q${i + 1}`, { selected: i < 7 ? ['A', 'B'] : ['A'], verified: true, correct: i < 7 }])) })), key);
    assert.equal(await page.evaluate(key => BBQuizAnalytics.ensurePractice(key, false, 'missing-source'), key), null);
    assert.equal((await report(page)).runs.length, 0, 'An explicit invalid source must not create a substitute traversal');
    const child = await page.evaluate(key => BBQuizAnalytics.ensurePractice(key), key);
    assert.ok(child.sourceRunId);
    const parent = (await report(page)).runs.find(run => run.id === child.sourceRunId);
    assert.equal(parent.initialComplete, true);
    assert.equal(parent.startedAt, null);
    assert.equal(parent.completedAt, null);
    assert.equal(parent.correction.roundCount, 0);
    assert.equal((await report(page)).history.length, 0);
  });

  await test('saved-answer grading agrees in read-only reports, imported traversals and correction selection', async page => {
    const incomplete = { version: 1, questions: {
      q1: { selected: ['A', 'B'], verified: true, correct: false },
      q2: { selected: ['A'], verified: true, correct: true },
      q3: { selected: ['A'], verified: false, correct: false }
    } };
    await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key, value: incomplete });
    let data = await report(page);
    assert.deepEqual(data.quizzes[0].current.wrongIds, ['q2'], 'Current keys determine verified mistakes; unchecked drafts are absent');
    assert.equal(data.quizzes[0].current.verified, 2);
    assert.equal(data.quizzes[0].current.correct, 1);
    assert.deepEqual(data.quizzes[0].mistakeIds, []);
    assert.equal(data.runs.length, 0);
    assert.equal(data.history.length, 0);
    assert.equal(data.quizzes[0].activeRunId, null);
    assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key), incomplete);
    const complete = { version: 1, questions: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`q${i + 1}`, { selected: i === 1 ? ['A'] : ['A', 'B'], verified: true, correct: i === 1 }])) };
    await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key, value: complete });
    data = await report(page);
    assert.deepEqual(data.quizzes[0].current.wrongIds, ['q2']);
    assert.equal(data.quizzes[0].current.verified, 10);
    assert.equal(data.quizzes[0].current.correct, 9);
    assert.equal(data.runs.length, 0, 'Even a complete cache stays a read-only projection until the quiz/practice creates its parent');
    assert.equal(data.history.length, 0);
    assert.equal(data.quizzes[0].activeRunId, null);
    assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key), complete);
    const child = await page.evaluate(key => BBQuizAnalytics.ensurePractice(key), key);
    assert.deepEqual(child.questionIds, ['q2'], 'Importing for practice must use the same answer-key grading as the read-only report');
    const imported = (await report(page)).runs.find(run => run.id === child.sourceRunId);
    assert.deepEqual([imported.correct, imported.wrong, imported.accuracy], [9, 1, 90]);
    assert.equal(imported.answers.q1.correct, true);
    assert.equal(imported.answers.q2.correct, false);
    assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key), complete, 'Normalizing an imported snapshot must not overwrite saved raw answers');
    const otherKey = quizzes[1].storageKey;
    await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: otherKey, value: complete });
    const other = await page.evaluate(key => BBQuizAnalytics.ensureRun(key), otherKey);
    assert.equal(other.answers.q1.correct, true, 'Direct full-run import uses the current answer key too');
    assert.equal(other.answers.q2.correct, false);
    const original = structuredClone(imported.answers);
    await verify(page, child, 2, true);
    assert.deepEqual((await report(page)).runs.find(run => run.id === imported.id).answers, original, 'Later correction never regrades the frozen imported initial snapshot');
  });

  await test('legacy partial runs and unlinked practice remain intact without invented correction relationships', async page => {
    const legacy = {
      id: 'old-unknown', storageKey: key, startedAt: null, lastAt: null, completedAt: null, closedAt: '2026-09-01T10:00:00.000Z', status: 'stopped',
      answers: { q8: { selected: ['A'], verified: true, correct: false, at: null, imported: true } }
    };
    const oldPractice = { id: 'old-practice', storageKey: key, mode: 'mistakes', questionIds: ['q8'], startedAt: '2026-09-02T10:00:00.000Z', lastAt: '2026-09-02T10:00:00.000Z', completedAt: '2026-09-02T10:00:00.000Z', closedAt: null, status: 'completed', answers: { q8: { selected: ['A', 'B'], verified: true, correct: true, at: '2026-09-02T10:00:00.000Z', eventId: 'old-correction' } } };
    await page.evaluate(({ legacy, oldPractice }) => new Promise((resolve, reject) => {
      const open = indexedDB.open('bb.quiz.analytics.v1', 2);
      open.onsuccess = () => {
        const db = open.result, tx = db.transaction(['runs', 'metadata'], 'readwrite');
        tx.objectStore('runs').put(legacy); tx.objectStore('runs').put(oldPractice);
        tx.objectStore('metadata').put({ key: legacy.storageKey, since: '2026-09-01T10:00:00.000Z', first: {}, unknown: ['q8'], practiceRunId: oldPractice.id });
        tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => reject(tx.error);
      }; open.onerror = () => reject(open.error);
    }), { legacy, oldPractice });
    await load(page);
    assert.equal(await page.evaluate(key => BBQuizAnalytics.ensurePractice(key), key), null, 'Old unlinked practice cannot resume as corrections for an absent full traversal');
    const data = await report(page);
    const old = data.runs.find(run => run.id === legacy.id);
    assert.equal(old.number, null);
    assert.equal(old.initialComplete, false);
    assert.equal(old.correction.roundCount, 0);
    assert.deepEqual(old.answers, legacy.answers);
    assert.deepEqual(data.runs.find(run => run.id === oldPractice.id).answers, oldPractice.answers);
    assert.equal(data.runs.find(run => run.id === oldPractice.id).sourceRunId, undefined);
  });

  await test('late saved answers complete an empty parent without replacing verified original outcomes', async page => {
    const initial = await page.evaluate(key => BBQuizAnalytics.ensureRun(key), key);
    assert.equal((await report(page)).runs.length, 0);
    await page.evaluate(key => localStorage.setItem(key, JSON.stringify({ version: 1, questions: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`q${i + 1}`, { selected: i < 7 ? ['A', 'B'] : ['A'], verified: true, correct: i < 7 }])) })), key);
    const child = await practice(page, initial);
    assert.ok(child, 'A preexisting empty run must accept fully verified cloud answers before correction gating');
    assert.equal(child.sourceRunId, initial.id);
    let parent = (await report(page)).runs.find(run => run.id === initial.id);
    assert.equal(parent.startedAt, null);
    assert.equal(parent.initialComplete, true);
    assert.equal(parent.accuracy, 70);
    await page.evaluate(key => {
      const saved = JSON.parse(localStorage.getItem(key));
      saved.questions.q8 = { selected: ['A', 'B'], verified: true, correct: true };
      localStorage.setItem(key, JSON.stringify(saved));
    }, key);
    await page.evaluate(key => BBQuizAnalytics.ensureRun(key), key);
    parent = (await report(page)).runs.find(run => run.id === initial.id);
    assert.equal(parent.answers.q8.correct, false, 'A later cache refresh cannot rewrite an already verified original result');
    assert.equal(parent.accuracy, 70);
  });

  await test('identity switching cannot expose or modify another owner correction run', async page => {
    await page.evaluate(() => BBUserStorage.activate('correction-owner-a'));
    const initial = await full(page);
    const child = await practice(page, initial);
    await verify(page, child, 8, true);
    await page.evaluate(() => BBUserStorage.activate('correction-owner-b'));
    assert.equal(await practice(page, initial), null);
    assert.equal(await verify(page, child, 9, true), false);
    assert.equal((await report(page)).runs.length, 0);
    await page.evaluate(() => BBUserStorage.activate('correction-owner-a'));
    const parent = (await report(page)).runs.find(run => run.id === initial.id);
    assert.equal(parent.correction.corrected, 1);
    assert.equal((await practice(page, initial)).id, child.id);
  }, true);

  await test('rapid owner switches discard obsolete initialization without leaking an unhandled rejection', async page => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const result = await page.evaluate(async () => {
      BBUserStorage.activate('fast-owner-a');
      const pending = BBQuizAnalytics.getReport({ days: 'all' });
      BBUserStorage.activate('fast-owner-b');
      BBUserStorage.activate('fast-owner-c');
      const report = await pending;
      await BBQuizAnalytics.ready;
      return { runs: report.runs.length, canPersist: report.canPersist, owner: BBUserStorage.owner() };
    });
    await page.waitForTimeout(40);
    assert.deepEqual(result, { runs: 0, canPersist: true, owner: 'fast-owner-c' });
    assert.deepEqual(errors, []);
  }, true);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

if (failures.length) process.exitCode = 1;
else console.log('Traversal corrections: full-first gate, 70→100 in three rounds, numbering, restart fencing, legacy preservation, identity and immutable original results passed.');
