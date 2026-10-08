import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {chromium} from 'playwright';

const root = resolve(import.meta.dirname, '..'), prefix = '/bio-barrons-umf/';
const server = http.createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const file = resolve(root, pathname.slice(prefix.length) || 'index.html');
    if (!pathname.startsWith(prefix) || !file.startsWith(root + sep)) throw Error('Not found');
    res.setHeader('Content-Type', ({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}${prefix}`;
const browser = await chromium.launch();
try {
  const context = await browser.newContext({serviceWorkers:'block'});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base);
  const chapters = await page.evaluate(() => CHAPTERS.filter(chapter => chapter.done && chapter.url));
  // Derive expected progress from authored sections, independent of generated metadata.
  const sections = {};
  for (const chapter of chapters) {
    const html = await (await page.request.get(base + chapter.url)).text();
    sections[chapter.num] = await page.evaluate(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return Array.from(doc.querySelectorAll('main .page-section[id^="page-"]:not(.chapter-home):not([data-curriculum-excluded]):not([data-lesson-redirect])'), section => section.id.slice(5));
    }, html);
    assert.ok(sections[chapter.num].length, `${chapter.url} has study sections`);
  }
  const last = chapters.at(-1), first = chapters[0];
  await page.goto(base + last.url);
  await page.waitForSelector('.bb-lesson-completion-button');
  assert.deepEqual(await page.evaluate(() => BB_STUDY_SECTIONS), sections,
    'Generated canonical inventory matches every lesson’s actual study sections');
  await page.locator('.bb-lesson-completion-button').click();
  const status = page.locator('.bb-lesson-completion-status');
  assert.doesNotMatch(await status.textContent(), /Ai parcurs toate lecțiile disponibile/,
    'Completing the last registry chapter first must not claim all lessons are done');
  assert.equal(await page.locator('.bb-next-lesson').getAttribute('href'), first.url,
    'Continue wraps to the first unfinished published lesson');
  // Saved obsolete IDs and matching counts must not masquerade as completed sections.
  await page.evaluate(({chapters, sections}) => {
    chapters.forEach(chapter => BBStudyState.completeLesson(chapter.num, sections[chapter.num]));
    BBStudyState.resetLesson(chapters[0].num);
    BBStudyState.completeLesson(chapters[0].num, sections[chapters[0].num].map(id => 'obsolete-' + id));
  }, {chapters, sections});
  assert.doesNotMatch(await status.textContent(), /Ai parcurs toate lecțiile disponibile/);
  assert.equal(await page.locator('.bb-next-lesson').getAttribute('href'), first.url);
  await page.evaluate(({first, sections}) => BBStudyState.completeLesson(first.num, sections[first.num]), {first, sections});
  await page.waitForFunction(() => document.querySelector('.bb-lesson-completion-status').textContent.includes('Ai parcurs toate lecțiile disponibile'));
  assert.equal(await page.locator('.bb-next-lesson').isVisible(), false);
  await page.reload();
  await page.waitForFunction(() => document.querySelector('.bb-lesson-completion-status')?.textContent.includes('Ai parcurs toate lecțiile disponibile'));
  await page.evaluate(first => BBStudyState.resetLesson(first.num), first);
  await page.waitForFunction(() => !document.querySelector('.bb-next-lesson').hidden);
  assert.doesNotMatch(await status.textContent(), /Ai parcurs toate lecțiile disponibile/);
  assert.equal(await page.locator('.bb-next-lesson').getAttribute('href'), first.url);
  await page.goto(base + 'nou/' + last.url);
  await page.waitForSelector('.bb-lesson-completion-button');
  assert.doesNotMatch(await status.textContent(), /Ai parcurs toate lecțiile disponibile/);
  assert.equal(await page.locator('.bb-next-lesson').getAttribute('href'), first.url,
    'The same progress decision keeps the next lesson within /nou/');
  assert.equal(new URL(await page.locator('.bb-next-lesson').getAttribute('href'), page.url()).pathname,
    prefix + 'nou/' + first.url);
  await page.evaluate(({first, sections}) => BBStudyState.completeLesson(first.num, sections[first.num]), {first, sections});
  await page.waitForFunction(() => document.querySelector('.bb-lesson-completion-status').textContent.includes('Ai parcurs toate lecțiile disponibile'));
  // Unknown inventory cannot prove that every published lesson is complete.
  await page.evaluate(({first, sections}) => {
    delete window.BB_STUDY_SECTIONS;
    BBStudyState.resetLesson(first.num);
    BBStudyState.completeLesson(first.num, sections[first.num]);
  }, {first, sections});
  assert.doesNotMatch(await status.textContent(), /Ai parcurs toate lecțiile disponibile/);
  assert.deepEqual(errors, []);
  console.log('Chapter completion: last-first wrap, canonical section IDs, all-complete, reload and reset passed.');
} finally { await browser.close(); await new Promise(done => server.close(done)); }
