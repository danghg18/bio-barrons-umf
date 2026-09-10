import { readFile, readdir, stat } from 'node:fs/promises';
import { extname } from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
import { loadSiteRegistry, publishedResources } from './site-registry.mjs';

const root = new URL('../', import.meta.url);
const registry = await loadSiteRegistry(root);
const { chapters, resources } = publishedResources(registry);
const errors = [];
const htmlFiles = ['index.html', ...(registry.BIO_SITE.pages || []).map(x => x.url), ...chapters.map(x => x.url), ...resources.map(x => x.url)];
const ids = new Map();

async function exists(path) {
  try { return (await stat(new URL(path, root))).isFile(); } catch { return false; }
}
for (const file of htmlFiles) {
  const source = await readFile(new URL(file, root), 'utf8');
  const pageIds = new Set([...source.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]));
  ids.set(file, pageIds);
  if (pageIds.size !== [...source.matchAll(/\bid=["']([^"']+)["']/g)].length) errors.push(`${file}: duplicate id`);
  if (/<style\b/i.test(source)) errors.push(`${file}: inline style block remains`);
  if (/<script(?![^>]+\bsrc=)[^>]*>/i.test(source)) errors.push(`${file}: inline script block remains`);
  for (const match of source.matchAll(/\b(?:src|href)=["']([^"']+)["']/gi)) {
    const ref = match[1];
    if (/^(?:https?:|\/\/|mailto:|data:)/i.test(ref)) continue;
    const [pathPart, hash] = ref.split('#');
    const targetFile = decodeURIComponent((pathPart || file).split('?')[0]);
    if (pathPart && !(await exists(targetFile))) errors.push(`${file}: missing ${ref}`);
    const fragment = hash && decodeURIComponent(hash);
    if (fragment && ids.has(targetFile) && !ids.get(targetFile).has(fragment) && !ids.get(targetFile).has(`page-${fragment}`)) errors.push(`${file}: missing fragment ${ref}`);
  }
}

const expectedChapterNumbers = [1, 3, 6, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23];
if (registry.CHAPTERS.map(chapter => chapter.num).join(',') !== expectedChapterNumbers.join(',')) {
  errors.push(`chapter registry must contain exactly: ${expectedChapterNumbers.join(', ')}`);
}
for (const chapter of chapters) {
  if (!chapter.updated || !chapter.theme) errors.push(`chapter ${chapter.num}: missing generated-site metadata`);
  if (!(await exists(chapter.url))) errors.push(`chapter ${chapter.num}: missing page ${chapter.url}`);
}
for (const resource of resources) if (!(await exists(resource.url))) errors.push(`missing resource ${resource.url}`);

const homepage = await readFile(new URL('index.html', root), 'utf8');
const homepageCards = new Map([...homepage.matchAll(/class="lab-item-num">(\d+)<[\s\S]*?class="lab-item-title">([^<]+)</g)].map(match => [Number(match[1]), match[2]]));
for (const chapter of registry.CHAPTERS) {
  if (homepageCards.get(chapter.num) !== chapter.name) errors.push(`homepage card ${chapter.num} does not match the registry`);
}

const quizContext = { window:{} };
vm.runInNewContext(await readFile(new URL('assets/js/grile-sistemul-nervos-data.js', root), 'utf8'), quizContext);
const quiz = quizContext.window.BB_NERVOUS_QUIZ;
if (!quiz || quiz.questions.length !== 50) errors.push('quiz dataset must contain 50 questions');
else {
  const questionIds = new Set(quiz.questions.map(question => question.id));
  if (questionIds.size !== quiz.questions.length) errors.push('quiz question IDs must be unique');
  for (const question of quiz.questions) {
    const letters = new Set(question.options.map(option => option.letter));
    if (letters.size !== 5 || !Array.isArray(question.correct) || question.correct.some(answer => !letters.has(answer))) errors.push(`quiz question ${question.id}: invalid answer/options`);
  }
}

// The supplied answer key is independent of the authored dataset.
const senseContext = { window: {} };
vm.runInNewContext(await readFile(new URL('assets/js/grile-organe-de-simt-data.js', root), 'utf8'), senseContext);
const sense = senseContext.window.BB_QUIZ;
const senseKey = JSON.parse(await readFile(new URL('tests/organe-de-simt-answer-key.json', root), 'utf8'));
if (!sense || sense.questions.length !== 100 || senseKey.length !== 100) errors.push('sense quiz must contain 100 questions');
else {
  if (sense.storageKey !== 'bb.quiz.organe-simt.v1' || sense.version !== 1) errors.push('sense quiz storage contract changed');
  sense.questions.forEach((question, index) => {
    const number = index + 1;
    if (question.id !== `os-${String(number).padStart(3, '0')}` || question.number !== number || question.sourceNumber !== number) errors.push(`sense quiz ${number}: numbering/ID mismatch`);
    if (question.correct.join('') !== senseKey[index]) errors.push(`sense quiz ${number}: supplied key mismatch`);
    if (question.options.map(option => option.letter).join('') !== 'ABCDE') errors.push(`sense quiz ${number}: options must be A–E`);
    for (const option of question.options) {
      if (!option.text.trim() || (!question.correct.includes(option.letter) && !option.why?.trim())) errors.push(`sense quiz ${number}${option.letter}: missing text/explanation`);
    }
    const matchingRanges = sense.ranges.filter(range => number >= range.start && number <= range.end);
    if (matchingRanges.length !== 1) errors.push(`sense quiz ${number}: range membership mismatch`);
  });
}

const jsFiles = [new URL('sw.js', root)];
const pending = [new URL('assets/js/', root), new URL('scripts/', root)];
while (pending.length) {
  const dir = pending.pop();
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const url = new URL(entry.isDirectory() ? `${entry.name}/` : entry.name, dir);
    if (entry.isDirectory()) pending.push(url);
    else if (extname(entry.name) === '.js' || extname(entry.name) === '.mjs') jsFiles.push(url);
  }
}
for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ['--check', fileURL(file)], { encoding: 'utf8' });
  if (result.status) errors.push(`${fileURL(file)}: JavaScript parse failure`);
}

const duplicateDeclarations = [];
for (const file of jsFiles) {
  const source = await readFile(file, 'utf8');
  if (/\b(?:const|let|var)\s+CHAPTERS\s*=/.test(source) && !file.pathname.endsWith('/assets/js/chapters-data.js')) duplicateDeclarations.push(fileURL(file));
}
if (duplicateDeclarations.length) errors.push(`duplicate CHAPTERS declarations: ${duplicateDeclarations.join(', ')}`);

const generated = spawnSync(process.execPath, ['scripts/generate-site-assets.mjs', '--check'], { cwd: fileURL(root), encoding: 'utf8' });
if (generated.status) errors.push(generated.stderr.trim() || generated.stdout.trim());

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}
console.log(`validated ${htmlFiles.length} pages, ${chapters.length} published chapters, and ${jsFiles.length} JavaScript files`);

function fileURL(url) { return decodeURIComponent(url.pathname); }
