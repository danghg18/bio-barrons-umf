import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {loadSiteRegistry} from './site-registry.mjs';

const root = new URL('../', import.meta.url);
const {CHAPTERS} = await loadSiteRegistry(root);
for (const [num, file] of [[13, 'grile-sistemul-endocrin-data.js'], [19, 'grile-metabolism-data.js']]) {
  const context = {window:{}};
  vm.runInNewContext(await readFile(new URL('assets/js/' + file, root), 'utf8'), context);
  const numbers = context.window.BB_QUIZ.questions.map(question => question.number).sort((a, b) => a - b);
  const runs = [];
  numbers.forEach(number => {
    const last = runs.at(-1);
    if (last && last[1] === number - 1) last[1] = number;
    else runs.push([number, number]);
  });
  const labels = runs.map(([start, end]) => start === end ? String(start) : `${start}–${end}`);
  const expected = 'Grile ' + (labels.length > 1 ? labels.slice(0, -1).join(', ') + ' și ' + labels.at(-1) : labels[0]);
  assert.equal(CHAPTERS.find(chapter => chapter.num === num).resources.find(resource => resource.kind === 'quiz').title, expected,
    `Chapter ${num} resource interval describes its current question numbers`);
}
const home = await readFile(new URL('index.html', root), 'utf8');
assert.doesNotMatch(home, /evidențierile sunt temporare/i);
assert.match(home, /evidențierile sunt salvate/i);
console.log('Catalog metadata: endocrine/metabolism labels match current question numbers and About describes saved highlights.');
