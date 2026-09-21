import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, mkdir, cp, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
let registry;
try { registry = JSON.parse(await readFile(new URL('data/quiz-topics.json', root), 'utf8')); } catch {}
assert.ok(registry, 'Every published quiz needs an explicit question-to-topic registry');
const fixture = await mkdtemp(join(tmpdir(), 'bb-quiz-topics-'));
try {
  for (const folder of ['scripts', 'data', 'assets/js']) await mkdir(join(fixture, folder), { recursive: true });
  for (const file of ['scripts/generate-site-assets.mjs', 'scripts/site-registry.mjs', 'scripts/notebook-sections.mjs', 'scripts/html-entities.json', 'assets/js/chapters-data.js']) await cp(new URL(file, root), join(fixture, file));
  for (const file of await readdir(root)) if (file.endsWith('.html')) await cp(new URL(file, root), join(fixture, file));
  for (const file of await readdir(new URL('assets/js/', root))) if (/^grile-.*-data\.js$/.test(file)) await cp(new URL('assets/js/' + file, root), join(fixture, 'assets/js', file));
  const run = async data => {
    await writeFile(join(fixture, 'data/quiz-topics.json'), JSON.stringify(data));
    return spawnSync(process.execPath, [join(fixture, 'scripts/generate-site-assets.mjs'), '--validate-quiz-topics'], { encoding: 'utf8' });
  };
  let result = await run(registry);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validated quiz topics: 7 quizzes, 451 questions/);
  const expectedTopics = [
    ['bb.quiz.celula.v1', 'cel-061', 'membrana'],
    ['bb.quiz.celula.v1', 'cel-076', 'transport'],
    ['bb.quiz.celula.v1', 'cel-063', 'recapitulare-mixta'],
    ['bb.quiz.introducere.v1', 'ia-015', 'recapitulare-mixta'],
    ['bb.quiz.sistem-nervos.v1', 'sn-056', 'cranieni'],
    ['bb.quiz.sistem-nervos.v1', 'sn-057', 'impuls'],
    ['bb.quiz.organe-simt.v1', 'os-024', 'echilibru'],
    ['bb.quiz.organe-simt.v1', 'os-072', 'recapitulare-mixta'],
    ['bb.quiz.sistemul-urinar.v1', 'ur-003', 'filtrare'],
    ['bb.quiz.sistemul-urinar.v1', 'ur-053', 'recapitulare-mixta'],
    ['bb.quiz.reproducator-masculin.v1', 'rm-069', 'gonada-feminina'],
    ['bb.quiz.reproducator-feminin.v1', 'rf-025', 'ovogeneza']
  ];
  for (const [key, id, topic] of expectedTopics) assert.equal(registry[key].questionTopics[id], topic, `Editorial acceptance: ${id}`);
  assert.match(registry['bb.quiz.reproducator-masculin.v1'].topics.find(topic => topic.id === 'gonada-feminina').lessonUrl, /^sistemul_reproducator_feminin\.html/);
  assert.match(registry['bb.quiz.sistem-nervos.v1'].topics.find(topic => topic.id === 'impuls').lessonUrl, /^tesutul_nervos\.html/);
  const storageKey = 'bb.quiz.celula.v1';
  const reject = async (mutate, pattern) => {
    const data = structuredClone(registry); mutate(data);
    const result = await run(data);
    assert.notEqual(result.status, 0, 'Invalid topic registry must reject generation');
    assert.match(result.stderr, pattern);
  };
  await reject(data => delete data[storageKey].questionTopics['cel-061'], /Missing topic mapping/);
  await reject(data => data[storageKey].questionTopics['cel-999'] = data[storageKey].topics[0].id, /Unknown question mapping/);
  await reject(data => data[storageKey].questionTopics['cel-061'] = 'unknown-topic', /Unknown topic/);
  await reject(data => data[storageKey].topics.push(data[storageKey].topics[0]), /Invalid or duplicate topic/);
  await reject(data => data[storageKey].topics[0].lessonUrl = 'celula_si_fiziologia_celulara.html#invented', /Invalid lesson route/);
  await reject(data => data[storageKey].topics[0].lessonUrl = 'celula_si_fiziologia_celulara.html?q=NonexistentHeading&section=membrana', /Missing lesson heading/);
  await reject(data => data[storageKey].topics[0].lessonUrl = 'https://example.com/', /Invalid lesson destination/);
  await reject(data => data['unknown-quiz'] = data[storageKey], /Unknown quiz topic registry/);
  await reject(data => delete data[storageKey], /Missing topic registry/);
  const hashes = JSON.parse(await readFile(new URL('tests/quiz-content-hashes.json', root), 'utf8'));
  for (const { dataFile, sha256 } of Object.values(hashes)) {
    const context = { window: {} };
    vm.runInNewContext(await readFile(new URL(dataFile, root), 'utf8'), context);
    const data = context.window.BB_QUIZ || context.window.BB_NERVOUS_QUIZ;
    assert.equal(createHash('sha256').update(JSON.stringify(data.questions)).digest('hex'), sha256, `${dataFile} educational data changed`);
  }
  console.log('Quiz topic coverage, invalid-registry rejection and educational fingerprints passed.');
} finally { await rm(fixture, { recursive: true, force: true }); }
