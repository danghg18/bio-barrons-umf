import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { loadSiteRegistry, publishedResources } from './site-registry.mjs';
import { buildNotebookSections } from './notebook-sections.mjs';

const root = new URL('../', import.meta.url);
const check = process.argv.includes('--check');
const registry = await loadSiteRegistry(root);
const { chapters, resources } = publishedResources(registry);

function sitemapXml() {
  const entries = [
    { url: '', updated: registry.BIO_SITE.updated },
    ...(registry.BIO_SITE.pages || []),
    ...chapters.map(({ url, updated }) => ({ url, updated })),
    ...resources.map(({ url, updated }) => ({ url, updated }))
  ];
  const blocks = entries.map(entry => [
    '  <url>',
    `    <loc>${registry.BIO_SITE.baseUrl}${entry.url}</loc>`,
    `    <lastmod>${entry.updated}</lastmod>`,
    '  </url>'
  ].join('\n'));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${blocks.join('\n')}\n</urlset>\n`;
}

// Build the lightweight question directory from registered public quiz datasets.
// Generate it before reference discovery and hashing so the precache always sees current bytes.
const quizIndex = [];
const storageKeys = new Set();
const topicRegistry = JSON.parse(await readFile(new URL('data/quiz-topics.json', root), 'utf8'));
const lessonFiles = new Set(chapters.map(chapter => chapter.url));
const lessonSources = new Map();
const normalizeHeading = value => value.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

async function validateTopics(quiz) {
  const entry = topicRegistry[quiz.storageKey];
  if (!entry || !Array.isArray(entry.topics) || !entry.topics.length || !entry.questionTopics || typeof entry.questionTopics !== 'object' || Array.isArray(entry.questionTopics)) {
    throw new Error(`Missing topic registry for ${quiz.storageKey}`);
  }
  const topicIds = new Set();
  const topics = [];
  for (const topic of entry.topics) {
    if (!topic || typeof topic.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic.id) || topicIds.has(topic.id) || typeof topic.label !== 'string' || !topic.label.trim()) {
      throw new Error(`Invalid or duplicate topic in ${quiz.storageKey}`);
    }
    topicIds.add(topic.id);
    if (typeof topic.lessonUrl !== 'string' || !/^[a-z0-9_-]+\.html[?#]/.test(topic.lessonUrl)) throw new Error(`Invalid lesson destination for ${topic.id}`);
    const destination = new URL(topic.lessonUrl, root);
    const file = topic.lessonUrl.split(/[?#]/)[0];
    if (!lessonFiles.has(file) || !destination.href.startsWith(root.href)) throw new Error(`Invalid lesson destination for ${topic.id}`);
    if (!lessonSources.has(file)) lessonSources.set(file, await readFile(new URL(file, root), 'utf8'));
    const html = lessonSources.get(file);
    const route = destination.searchParams.get('section') || decodeURIComponent(destination.hash.slice(1));
    const sections = [...html.matchAll(/\bid=["']page-([^"']+)["']/g)];
    const sectionIndex = sections.findIndex(match => match[1] === route);
    if (sectionIndex < 0 || (destination.hash && destination.hash.slice(1) !== route)) throw new Error(`Invalid lesson route for ${topic.id}`);
    const query = destination.searchParams.get('q');
    if (destination.search && (!query || !destination.searchParams.has('section') || [...destination.searchParams.keys()].some(key => !['q', 'section'].includes(key)))) throw new Error(`Invalid lesson destination for ${topic.id}`);
    if (query) {
      const section = html.slice(sections[sectionIndex].index, sections[sectionIndex + 1]?.index ?? html.length);
      const headings = [...section.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map(match => normalizeHeading(match[1]));
      if (!headings.some(heading => heading.includes(normalizeHeading(query)))) throw new Error(`Missing lesson heading for ${topic.id}: ${query}`);
    }
    topics.push({ id: topic.id, label: topic.label, lessonUrl: topic.lessonUrl });
  }
  const ids = new Set(quiz.questions.map(question => question.id));
  for (const id of Object.keys(entry.questionTopics)) if (!ids.has(id)) throw new Error(`Unknown question mapping ${id} in ${quiz.storageKey}`);
  for (const id of ids) {
    if (!Object.hasOwn(entry.questionTopics, id)) throw new Error(`Missing topic mapping ${id} in ${quiz.storageKey}`);
    if (!topicIds.has(entry.questionTopics[id])) throw new Error(`Unknown topic for ${id} in ${quiz.storageKey}`);
  }
  return { topics, questionTopics: entry.questionTopics };
}

for (const chapter of chapters) {
  for (const resource of (chapter.resources || []).filter(item => item.kind === 'quiz')) {
    const htmlUrl = new URL(resource.url, root);
    const html = await readFile(htmlUrl, 'utf8');
    const scripts = [...html.matchAll(/\bsrc=["']([^"']*grile-[^"']+-data\.js(?:\?[^"']*)?)["']/gi)];
    if (scripts.length !== 1) throw new Error(`${resource.url} must load exactly one quiz dataset`);
    const sourceUrl = new URL(scripts[0][1], htmlUrl);
    sourceUrl.search = '';
    if (!sourceUrl.href.startsWith(root.href)) throw new Error(`Quiz dataset must be local: ${sourceUrl}`);
    const context = { window: {} };
    vm.runInNewContext(await readFile(sourceUrl, 'utf8'), context, { filename: fileURLToPath(sourceUrl), timeout: 5000 });
    const quiz = context.window.BB_QUIZ || context.window.BB_NERVOUS_QUIZ;
    if (!quiz || typeof quiz.storageKey !== 'string' || !quiz.storageKey || storageKeys.has(quiz.storageKey) ||
      !Number.isInteger(quiz.version) || !Array.isArray(quiz.questions) || !Array.isArray(quiz.ranges)) {
      throw new Error(`Invalid or duplicate quiz metadata in ${resource.url}`);
    }
    storageKeys.add(quiz.storageKey);
    const { topics, questionTopics } = await validateTopics(quiz);
    const ids = new Set();
    const numbers = new Set();
    const rangeIds = new Set();
    const ranges = quiz.ranges.map(({ id, start, end }) => {
      if (typeof id !== 'string' || !id || rangeIds.has(id) || !Number.isInteger(start) || !Number.isInteger(end) || start > end) {
        throw new Error(`Invalid quiz range in ${resource.url}`);
      }
      rangeIds.add(id);
      return { id, start, end };
    });
    const questions = quiz.questions.map(({ id, number, correct }) => {
      const matches = ranges.filter(range => number >= range.start && number <= range.end);
      if (typeof id !== 'string' || !id || ids.has(id) || !Number.isInteger(number) || numbers.has(number) || matches.length !== 1) {
        throw new Error(`Invalid quiz question ${id} in ${resource.url}`);
      }
      ids.add(id); numbers.add(number);
      if (!Array.isArray(correct) || !correct.length || correct.some(letter => !/^[A-E]$/.test(letter)) ||
        [...new Set(correct)].sort().join('') !== correct.join('')) {
        throw new Error(`Invalid quiz answer key ${id} in ${resource.url}`);
      }
      return { id, number, rangeId: matches[0].id, correct, topicId: questionTopics[id] };
    });
    quizIndex.push({ chapterNum: chapter.num, name: chapter.name, url: resource.url, storageKey: quiz.storageKey,
      version: quiz.version, questions, ranges, topics });
  }
}
for (const key of Object.keys(topicRegistry)) if (!storageKeys.has(key)) throw new Error(`Unknown quiz topic registry ${key}`);
if (process.argv.includes('--validate-quiz-topics')) {
  console.log(`Validated quiz topics: ${quizIndex.length} quizzes, ${quizIndex.reduce((total, quiz) => total + quiz.questions.length, 0)} questions`);
  process.exit(0);
}
await emit('assets/js/quiz-index.js', `/* Generated by scripts/generate-site-assets.mjs. */\nwindow.BB_QUIZ_INDEX = ${JSON.stringify(quizIndex, null, 2)};\n`);

// Derive the notebook's routes/titles from each published lesson once at build
// time. Emit before discovery/hashing so this local catalog is cached with its
// current content and --check detects authored section changes.
const notebookSections = await buildNotebookSections(chapters, root);
await emit('assets/js/notebook-sections.js', `/* Generated by scripts/generate-site-assets.mjs. */\nwindow.BB_NOTEBOOK_SECTIONS = ${JSON.stringify(notebookSections, null, 2)};\n`);

const external = /^(?:[a-z]+:|\/\/|#|data:|mailto:)/i;
const discovered = new Map();
const queue = [];

function remember(reference, fromFile = '') {
  if (!reference || external.test(reference)) return;
  const resolved = new URL(reference, new URL(fromFile, 'https://local.invalid/'));
  const clean = resolved.pathname.replace(/^\//, '') + resolved.search;
  const file = decodeURIComponent(resolved.pathname.replace(/^\//, ''));
  if (!file || discovered.has(clean)) return;
  discovered.set(clean, file);
  queue.push(clean);
}

for (const entry of ['index.html', ...(registry.BIO_SITE.pages || []).map(item => item.url), ...chapters.map(item => item.url), ...resources.map(item => item.url)]) remember(entry);

// The local SDK redistributes its third-party license notices with the bundle.
remember('assets/js/vendor/supabase.LICENSE.txt');

while (queue.length) {
  const reference = queue.shift();
  const file = decodeURIComponent(reference.replace(/^\.\//, '').split(/[?#]/)[0]);
  let source;
  try { source = await readFile(new URL(file, root), 'utf8'); }
  catch { continue; }
  const extension = extname(file).toLowerCase();
  if (extension === '.html') {
    for (const match of source.matchAll(/\b(?:src|href)=["']([^"']+)["']/gi)) remember(match[1], file);
  } else if (extension === '.css') {
    for (const match of source.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) remember(match[1], file);
  } else if (extension === '.json' && file === 'manifest.json') {
    const manifest = JSON.parse(source);
    for (const icon of manifest.icons || []) remember(icon.src, file);
  }
}

const assets = [...discovered.keys()].sort((a, b) => {
  if (a === 'index.html') return -1;
  if (b === 'index.html') return 1;
  return a.localeCompare(b);
});
const digest = createHash('sha256');
for (const asset of assets) {
  const file = discovered.get(asset);
  digest.update(asset);
  digest.update(await readFile(new URL(file, root)));
}
const cacheName = `biologie-atlas-${digest.digest('hex').slice(0, 12)}`;
const precache = `/* Generated by scripts/generate-site-assets.mjs. */\nself.BIO_PRECACHE = ${JSON.stringify({ cacheName, assets }, null, 2)};\n`;

async function emit(path, content) {
  const url = new URL(path, root);
  if (check) {
    let current = '';
    try { current = await readFile(url, 'utf8'); } catch {}
    if (current !== content) throw new Error(`${path} is stale; run npm run generate`);
  } else {
    await writeFile(url, content);
    console.log(`generated ${fileURLToPath(url)}`);
  }
}

await emit('sitemap.xml', sitemapXml());
await emit('assets/js/precache-manifest.js', precache);
