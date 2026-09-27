import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import http from 'node:http';
import {chromium} from 'playwright';

const source = await readFile(new URL('../assets/js/quiz-analytics.js', import.meta.url), 'utf8');
const old = {chapterNum:22, name:'Reproducător', url:'quiz.html', storageKey:'quiz.content-history', version:1,
  ranges:[{id:'all', start:1, end:3}], questions:[
    {id:'q1', number:1, rangeId:'all', correct:['A']},
    {id:'q2', number:2, rangeId:'all', correct:['B']}
  ]};
const upgraded = {...old, contentRevision:1, previousQuestionIds:['q1','q2'], retiredQuestions:[{...old.questions[1], retired:true}], questions:[
  {...old.questions[0], contentRevision:1, correct:['B']},
  {id:'q3', number:3, rangeId:'all', correct:['C']}
]};
const server = http.createServer((req, res) => {res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><title>Content history</title>');});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch();
try {
  const context = await browser.newContext(); const page = await context.newPage();
  async function load(quiz) {
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.evaluate(q => window.BB_QUIZ_INDEX = [q], quiz);
    await page.addScriptTag({content:source}); await page.evaluate(() => BBQuizAnalytics.ready);
  }
  await load(old);
  const original = await page.evaluate(() => BBQuizAnalytics.ensureRun('quiz.content-history'));
  await page.evaluate(async runId => {
    await BBQuizAnalytics.recordAttempt({storageKey:'quiz.content-history', questionId:'q1', attemptId:'old-1', runId, selected:['A'], correct:true, answerKey:['A']});
    await BBQuizAnalytics.recordAttempt({storageKey:'quiz.content-history', questionId:'q2', attemptId:'old-2', runId, selected:['A'], correct:false, answerKey:['B']});
    localStorage.setItem('quiz.content-history', JSON.stringify({version:1, questions:{q1:{selected:['A'], verified:true, correct:true}, q2:{selected:['A'], verified:true, correct:false}}}));
  }, original.id);
  await load(upgraded);
  let report = await page.evaluate(() => BBQuizAnalytics.getReport({days:'all'}));
  assert.equal(report.history.length, 2, 'Retired questions retain their historical attempts');
  assert.equal(report.history.find(e => e.questionId === 'q1').correct, true, 'A key correction never regrades a historical event');
  assert.equal(report.quizzes[0].current.verified, 0, 'A meaning change requires fresh verification; retired records are not active progress');
  assert.equal(report.runs.find(r => r.id === original.id).total, 2, 'An old traversal retains its original scope');
  const successor = await page.evaluate(() => BBQuizAnalytics.ensureRun('quiz.content-history'));
  assert.notEqual(successor.id, original.id, 'A changed question is answered in a successor traversal');
  assert.equal(successor.answers.q1.verified, false);
  assert.deepEqual(successor.answers.q1.selected, ['A'], 'Draft selections are preserved for review');
  assert.equal(await page.evaluate(async runId => BBQuizAnalytics.recordAttempt({storageKey:'quiz.content-history', questionId:'q1', attemptId:'stale-player', runId, selected:['A'], correct:true, answerKey:['A'], contentRevision:0}), successor.id), false, 'A stale player cannot label an old question attempt as the current content revision');
  const recorded = await page.evaluate(async runId => ({
    fresh:await BBQuizAnalytics.recordAttempt({storageKey:'quiz.content-history', questionId:'q1', attemptId:'new-1', runId, selected:['B'], correct:true, answerKey:['B'], contentRevision:1}),
    retired:await BBQuizAnalytics.recordAttempt({storageKey:'quiz.content-history', questionId:'q2', attemptId:'new-retired', runId, selected:['B'], correct:true})
  }), successor.id);
  assert.deepEqual(recorded, {fresh:true, retired:false});
  await load(upgraded);
  report = await page.evaluate(() => BBQuizAnalytics.getReport({days:'all'}));
  const archived = report.runs.find(r => r.id === original.id);
  assert.equal(archived.isCurrent, false); assert.equal(archived.correct, 1); assert.equal(archived.total, 2);
  assert.equal(archived.answers.q2.correct, false); assert.equal(report.history.length, 3);
  assert.equal((await page.evaluate(() => BBQuizAnalytics.ensureRun('quiz.content-history'))).id, successor.id, 'Repeated loads do not create further successors');
  await load(old);
  assert.equal(await page.evaluate(async () => {try {await BBQuizAnalytics.ensureRun('quiz.content-history'); return false;} catch {return true;}}), true, 'A stale dataset cannot downgrade or archive a newer traversal');
  await load(upgraded);
  assert.equal((await page.evaluate(() => BBQuizAnalytics.ensureRun('quiz.content-history'))).id, successor.id);
  console.log('Retired history, frozen original scores/scope, content reverification and one persistent successor passed.');
} finally {await browser.close(); await new Promise(r => server.close(r));}
