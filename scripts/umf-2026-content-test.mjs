import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const key = JSON.parse(await readFile(new URL('tests/umf-cluj-2026-answer-key.json', root)));
const sets = JSON.parse(await readFile(new URL('data/quiz-source-map.json', root)));
const errors = [], coverage = new Set(), partitions = new Set(), activePartitions = new Set(), ids = new Set();
let questions = 0, explanations = 0;
assert.equal(sets.length, 18);
assert.equal(Object.values(key.chapters).reduce((n, c) => n + Object.keys(c.answers).length, 0), 1990);
assert.equal(key.chapters.XIII.answers[182].printed, 'ACBE', 'Preserve the unusual printed order independently of scoring');
for (const set of sets) {
  const expected = set.ranges.flatMap(([start, end]) => Array.from({length:end - start + 1}, (_, i) => start + i));
  for (const n of expected) {
    const identity = set.sourceChapter + '/' + n;
    assert.ok(key.chapters[set.sourceChapter].answers[n], 'Partition has a printed key: ' + identity);
    assert.ok(!partitions.has(identity), 'No overlapping partitions: ' + identity);
    partitions.add(identity);
    if (set.publicationStatus !== 'deferred') activePartitions.add(identity);
  }
  // XIII remains fully mapped to the independent key, but its unfinished
  // editorial review was explicitly deferred by the user for this release.
  if (set.publicationStatus === 'deferred') {
    assert.equal(set.sourceChapter, 'XIII', 'Only the associative set is deferred');
    continue;
  }
  let quiz;
  try {
    const context = {window:{}};
    vm.runInNewContext(await readFile(new URL(set.dataFile, root), 'utf8'), context);
    quiz = context.window.BB_QUIZ || context.window.BB_NERVOUS_QUIZ;
  } catch (error) { errors.push(set.dataFile + ': ' + error.message); continue; }
  if (quiz.storageKey !== set.storageKey) errors.push('Storage identity changed: ' + set.dataFile);
  if (JSON.stringify(quiz.questions.map(q => q.number)) !== JSON.stringify(expected)) errors.push('Wrong source coverage: ' + set.dataFile);
  if (quiz.ranges.some(r => r.end - r.start + 1 > 10)) errors.push('Range exceeds ten questions: ' + set.dataFile);
  for (const q of quiz.questions) {
    questions++;
    const identity = set.sourceChapter + '/' + q.number;
    const printed = key.chapters[set.sourceChapter].answers[q.number]?.printed;
    if (q.sourceNumber !== q.number || q.sourceChapter !== set.sourceChapter) errors.push('Missing/wrong source identity: ' + q.id);
    if (coverage.has(identity)) errors.push('Duplicate source question: ' + identity);
    coverage.add(identity);
    if (ids.has(q.id)) errors.push('Duplicate question ID: ' + q.id);
    ids.add(q.id);
    if (!printed || [...new Set(printed)].sort().join('') !== q.correct.join('')) errors.push('Answer differs from printed key: ' + identity + ' (' + q.id + ')');
    if (typeof q.asksFalse !== 'boolean') errors.push('Missing prompt semantics: ' + q.id);
    if (!q.prompt?.trim() || q.options?.map(o => o.letter).join('') !== 'ABCDE') errors.push('Incomplete question: ' + q.id);
    for (const o of q.options || []) {
      if (!o.text?.trim() || !o.why?.trim()) errors.push('Missing option text/explanation: ' + q.id + '/' + o.letter);
      else explanations++;
    }
    if ((set.mixed || []).includes(q.number) && !q.mixed) errors.push('Missing mixed-question label: ' + q.id);
  }
}
assert.equal(partitions.size, 1990, 'The approved partitions cover the complete book exactly once');
for (const identity of activePartitions) if (!coverage.has(identity)) errors.push('Missing question: ' + identity);
assert.equal(activePartitions.size, 1590);
assert.equal(sets.filter(s => s.publicationStatus !== 'deferred').length, 17);
console.log(JSON.stringify({publishedSets:17, deferredSets:1, questions, explanations, errors:errors.length}, null, 2));
if (errors.length) {
  console.error(errors.slice(0, 25).join('\n') + (errors.length > 25 ? `\n… ${errors.length - 25} more errors` : ''));
  process.exitCode = 1;
} else {
  assert.equal(questions, 1590); assert.equal(explanations, 7950);
  console.log('All 1,590 published questions match the printed key, with 7,950 option explanations. The 400 associative questions remain deferred.');
}
