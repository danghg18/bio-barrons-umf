import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import http from 'node:http';
import {chromium} from 'playwright';

const source = await readFile(new URL('../assets/js/quiz-analytics.js', import.meta.url), 'utf8');
const editions = ['corrected', 'remaining'].map((name, index) => ({
  chapterNum:22 + index, name, url:`${name}.html`, storageKey:`quiz.retired-history.${name}`, version:1,
  ranges:[{id:'all', start:1, end:2}], questions:[
    {id:'q1', number:1, rangeId:'all', correct:['A']},
    {id:'q2', number:2, rangeId:'all', correct:['B']}
  ]
}));
const revised = editions.map(quiz => ({...quiz, contentRevision:1, previousQuestionIds:['q1', 'q2'],
  retiredQuestions:[{...quiz.questions[1], retired:true, replacementUrl:'moved.html#grila-2'}],
  questions:[quiz.questions[0]]
}));
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><title>Retired correction history</title>');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  async function load(quizzes) {
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.evaluate(quizzes => window.BB_QUIZ_INDEX = quizzes, quizzes);
    await page.addScriptTag({content:source}); await page.evaluate(() => BBQuizAnalytics.ready);
  }
  await load(editions);
  const parents = await page.evaluate(async quizzes => {
    const ids = [];
    for (const quiz of quizzes) {
      const run = await BBQuizAnalytics.ensureRun(quiz.storageKey); ids.push(run.id);
      await BBQuizAnalytics.recordAttempt({storageKey:quiz.storageKey, questionId:'q1', runId:run.id,
        attemptId:quiz.name + '-initial-1', selected:['A'], correct:true, answerKey:['A']});
      await BBQuizAnalytics.recordAttempt({storageKey:quiz.storageKey, questionId:'q2', runId:run.id,
        attemptId:quiz.name + '-initial-2', selected:['A'], correct:false, answerKey:['B']});
      const practice = await BBQuizAnalytics.ensurePractice(quiz.storageKey, false, run.id);
      const corrected = quiz.name === 'corrected';
      await BBQuizAnalytics.recordAttempt({storageKey:quiz.storageKey, questionId:'q2', runId:practice.id,
        attemptId:quiz.name + '-practice', selected:corrected ? ['B'] : ['A'], correct:corrected, answerKey:['B']});
    }
    return ids;
  }, editions);
  const before = await page.evaluate(() => BBQuizAnalytics.getReport({days:'all'}));
  assert.equal(before.runs.find(run => run.id === parents[0]).correction.accuracy, 100);
  assert.deepEqual(before.runs.find(run => run.id === parents[1]).correction.remainingIds, ['q2']);
  await load(revised);
  await page.evaluate(async quizzes => {
    for (const quiz of quizzes) await BBQuizAnalytics.ensureRun(quiz.storageKey);
  }, revised);
  const after = await page.evaluate(() => BBQuizAnalytics.getReport({days:'all'}));
  assert.deepEqual(after.history, before.history, 'Retiring a question never rewrites dated results');
  for (const id of parents) {
    const original = before.runs.find(run => run.id === id), archived = after.runs.find(run => run.id === id);
    assert.equal(archived.isCurrent, false);
    assert.equal(archived.total, 2); assert.equal(archived.correct, 1); assert.equal(archived.wrong, 1);
    assert.deepEqual(archived.answers, original.answers, 'The initial traversal preserves all original answers');
    for (const key of ['correctedIds', 'remainingIds', 'corrected', 'remaining', 'accuracy', 'complete', 'roundCount']) {
      assert.deepEqual(archived.correction[key], original.correction[key],
        `Retired questions preserve historical correction ${key} for ${original.chapterName}`);
    }
    assert.equal(archived.correction.canPractice, false, 'An archived scope never permits new practice');
    assert.equal(archived.correction.rounds[0].total, 1);
    assert.deepEqual(archived.correction.rounds[0].answers, original.correction.rounds[0].answers);
    assert.equal(archived.correction.rounds[0].questions[0].retired, true);
  }
  await load(revised);
  const reloaded = await page.evaluate(() => BBQuizAnalytics.getReport({days:'all'}));
  for (const id of parents) {
    assert.deepEqual(reloaded.runs.find(run => run.id === id).correction,
      after.runs.find(run => run.id === id).correction, 'Reload preserves the archived correction summary');
  }
  console.log('Retired corrected/remaining questions retain original correction scores, rounds and history after upgrade/reload.');
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
