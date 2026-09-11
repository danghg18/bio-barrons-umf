import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSiteRegistry, publishedResources } from './site-registry.mjs';

// Standalone focused suite: node scripts/search-highlighter-test.mjs
// BB_SEARCH_BASE may point to an existing server, including its Pages prefix.
const root = fileURLToPath(new URL('../', import.meta.url));
const prefix = '/bio-barrons-umf/';
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' };
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (!pathname.startsWith(prefix)) throw new Error('outside prefix');
    const target = normalize(join(root, pathname.slice(prefix.length) || 'index.html'));
    if (!target.startsWith(root)) throw new Error('outside root');
    const body = await readFile(target);
    response.writeHead(200, { 'content-type': mime[extname(target)] || 'application/octet-stream', 'cache-control': 'no-store' });
    response.end(body);
  } catch {
    response.writeHead(404); response.end('Not found');
  }
});
if (!process.env.BB_SEARCH_BASE) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = process.env.BB_SEARCH_BASE || `http://127.0.0.1:${server.address().port}${prefix}`;
const { chapters, resources } = publishedResources(await loadSiteRegistry());
const files = [...new Set([...chapters, ...resources].map(item => item.url))];
const browser = await chromium.launch({ headless: true });
const failures = [];
const phrase = 'Regresiețesut nervos 100%';

async function search(page, query, count) {
  const input = page.locator('#lesson-search-input');
  await input.fill(query);
  // Also exercise retrying the unchanged query.
  await input.dispatchEvent('input');
  // The shared controller debounces for 140ms; identical counts alone do not
  // prove that a replacement or repeated query has actually finished.
  await page.waitForTimeout(180);
  await page.waitForFunction(expected => document.getElementById('lesson-search-count').textContent === expected, count);
}

async function selectHighlight(page, id, start, end, event = 'mouseup') {
  const before = await page.locator(`#${id} mark.hl`).count();
  await page.evaluate(({ id, start, end, event }) => {
    const paragraph = document.getElementById(id);
    const route = paragraph.closest('.page-section').id.slice(5);
    if (window.BBLessonNavigation) window.BBLessonNavigation.navigate(route, { focus: false });
    else window.goto(route);
    if (!document.body.classList.contains('hl-mode')) window.toggleHighlighter();
    const range = document.createRange();
    const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
    let offset = 0;
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (start >= offset && start < offset + node.length) range.setStart(node, start - offset);
      if (end > offset && end <= offset + node.length) range.setEnd(node, end - offset);
      offset += node.length;
    }
    const selection = window.getSelection();
    selection.removeAllRanges(); selection.addRange(range);
    paragraph.dispatchEvent(event === 'mouseup' ? new MouseEvent(event, { bubbles: true }) : new Event(event, { bubbles: true }));
  }, { id, start, end, event });
  await page.waitForFunction(({ id, before }) => document.querySelectorAll(`#${id} mark.hl`).length > before, { id, before });
}

async function rememberHighlights(page) {
  await page.evaluate(() => {
    function cleanMarkup(mark) {
      const copy = mark.cloneNode(true);
      copy.querySelectorAll('[data-bb-search="true"]').forEach(node => node.replaceWith(...node.childNodes));
      return copy.outerHTML;
    }
    window.searchRegressionHighlights = [...document.querySelectorAll('mark.hl')].map(mark => ({ mark, html: cleanMarkup(mark) }));
  });
}

async function assertHighlights(page) {
  assert.equal(await page.evaluate(() => window.searchRegressionHighlights.every(({ mark, html }) => {
    const copy = mark.cloneNode(true);
    copy.querySelectorAll('[data-bb-search="true"]').forEach(node => node.replaceWith(...node.childNodes));
    return mark.isConnected && copy.outerHTML === html;
  })), true, 'search changed highlight identity, attributes, nesting or content');
}

async function assertCurrent(page, index, text = phrase) {
  const actual = await page.locator('.search-found-current').evaluateAll(marks => ({
    indexes: [...new Set(marks.map(mark => Number(mark.dataset.searchIndex)))],
    text: marks.map(mark => mark.textContent).join(''),
    active: marks.every(mark => mark.closest('.page-section').classList.contains('active')),
  }));
  assert.deepEqual(actual, { indexes: [index], text, active: true });
}

try {
  for (const file of files) {
    const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
    await context.addInitScript(() => { try { localStorage.setItem('highlighterColor', 'pink'); } catch {} });
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto(base + file, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.body.dataset.bbSharedReady === 'true');
      const routes = await page.evaluate(phrase => {
        const sections = [...document.querySelectorAll('.page-section')];
        const targets = [sections[0], sections[1]];
        // Controlled, unique text in real routes makes exact ordering/counts
        // independent of ongoing educational-content edits by other agents.
        targets.forEach((section, group) => {
          for (let i = 0; i < 2; i++) {
            const p = document.createElement('p');
            p.id = `search-regression-${group * 2 + i}`;
            p.textContent = phrase;
            section.append(p);
          }
        });
        const boundary = document.createElement('div');
        boundary.innerHTML = '<p>RegBoundary</p><p>End</p><p>RegControl<button>ignored</button>End</p><p>RegBreak<br>End</p><p>RegAccent s\u0326t\u0327</p>';
        sections[0].append(boundary);
        window.searchRegressionText = sections.map(section => section.textContent);
        return targets.map(section => section.id.slice(5));
      }, phrase);
      await page.locator('.lesson-search-trigger').click();
      await search(page, phrase, '1 / 4');
      await assertCurrent(page, 0);
      await search(page, '', '0 / 0');

      await selectHighlight(page, 'search-regression-0', 0, phrase.length);
      await selectHighlight(page, 'search-regression-1', 3, 10);
      await selectHighlight(page, 'search-regression-2', 10, 19);
      await selectHighlight(page, 'search-regression-3', 0, 3);
      await selectHighlight(page, 'search-regression-3', 3, 8);
      await rememberHighlights(page);
      await search(page, phrase, '1 / 4');
      await assertCurrent(page, 0);
      await assertHighlights(page);

      // Accent/case normalization, one count for a fragmented phrase, and DOM order.
      await search(page, 'REGRESIETESUT NERVOS 100%', '1 / 4');
      for (let i = 1; i <= 4; i++) {
        await page.locator('#lesson-search-next').click();
        await assertCurrent(page, i % 4);
      }
      await page.locator('#lesson-search-prev').click();
      await assertCurrent(page, 3);
      await page.locator('#lesson-search-input').press('Shift+Enter');
      await assertCurrent(page, 2);
      await page.locator('#lesson-search-input').press('Enter');
      await assertCurrent(page, 3);
      assert.equal(await page.locator('.page-section.active').getAttribute('id'), 'page-' + routes[1]);
      await assertHighlights(page);

      // New highlights inside live search markers must survive clear/retry too.
      await selectHighlight(page, 'search-regression-1', 16, phrase.length);
      await rememberHighlights(page);
      await page.locator('#lesson-search-next').click();
      await assertCurrent(page, 0);
      await search(page, phrase, '1 / 4');
      await assertHighlights(page);
      await search(page, 'definitely-absent-regression', '0 / 0');
      await assertHighlights(page);
      await search(page, phrase, '1 / 4');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.search-found').count(), 0);
      await assertHighlights(page);
      await page.locator('.lesson-search-trigger').click();
      await search(page, phrase, '1 / 4');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.search-found').count(), 0);
      await assertHighlights(page);
      assert.deepEqual(await page.locator('.page-section').evaluateAll(sections => sections.map(section => section.textContent)), await page.evaluate(() => window.searchRegressionText));

      await page.locator('.lesson-search-trigger').click();
      for (const query of ['RegBoundaryEnd', 'RegControlEnd', 'RegBreakEnd']) await search(page, query, '0 / 0');
      await search(page, 'regaccent st', '1 / 1');
      await assertCurrent(page, 0, 'RegAccent s\u0326t\u0327');
      await search(page, '', '0 / 0');
      assert.equal(await page.locator('#lesson-search-next').isDisabled(), true);
      assert.equal(await page.locator('#lesson-search-prev').isDisabled(), true);

      // Real authored text still has stable counts/order through clear + retry.
      await page.evaluate(() => { if (document.body.classList.contains('hl-mode')) window.toggleHighlighter(); });
      // The cell questions do not contain the previous universal probe, 'sistem'.
      const authoredQuery = file === 'grile_celula.html' ? 'membrana' : 'sistem';
      await page.locator('#lesson-search-input').fill(authoredQuery);
      await page.waitForFunction(() => document.querySelector('.search-found-current'));
      const realMatches = await page.locator('.search-found').evaluateAll(marks => Object.values(marks.reduce((hits, mark) => { const key = mark.dataset.searchIndex; hits[key] ||= { section: mark.closest('.page-section').id.slice(5), text: '', index: key }; hits[key].text += mark.textContent; return hits; }, {})));
      const realCount = await page.locator('#lesson-search-count').textContent();
      assert.ok(realMatches.length > 0);
      const realHighlight = await page.locator('.search-found').evaluateAll(marks => {
        // Quiz explanations are indexed before verification, but their hidden
        // text cannot be selected by a student. Highlight an exposed passage.
        const mark = marks.find(node => !node.closest('[hidden]'));
        if (!mark) throw new Error('No selectable authored search match');
        const parent = mark.parentElement;
        if (!parent.id) parent.id = 'search-regression-authored';
        const before = document.createRange();
        before.selectNodeContents(parent); before.setEndBefore(mark);
        return { id: parent.id, start: before.toString().length + 1, end: before.toString().length + 4 };
      });
      await search(page, '', '0 / 0');
      await selectHighlight(page, realHighlight.id, realHighlight.start, realHighlight.end);
      await rememberHighlights(page);
      await search(page, authoredQuery, realCount);
      await assertHighlights(page);
      assert.deepEqual(await page.locator('.search-found').evaluateAll(marks => Object.values(marks.reduce((hits, mark) => { const key = mark.dataset.searchIndex; hits[key] ||= { section: mark.closest('.page-section').id.slice(5), text: '', index: key }; hits[key].text += mark.textContent; return hits; }, {}))), realMatches);

      // URLSearchParams already decodes %, and preferred hit is section-local.
      const preferred = realMatches.find(match => realMatches.filter(other => other.section === match.section).length > 1) || realMatches[0];
      const sectionMatches = realMatches.filter(match => match.section === preferred.section);
      const hit = Math.min(1, sectionMatches.length - 1);
      const expected = sectionMatches[hit];
      await page.goto(base + file + '?' + new URLSearchParams({ q: authoredQuery, section: preferred.section, hit: String(hit) }));
      await page.waitForFunction(index => document.querySelector('.search-found-current')?.dataset.searchIndex === index, expected.index);
      assert.equal(await page.locator('.page-section.active').getAttribute('id'), 'page-' + preferred.section);
      await page.goto(base + file + '?' + new URLSearchParams({ q: '100%', section: preferred.section, hit: '0' }));
      await page.waitForFunction(() => document.getElementById('lesson-search-input')?.value === '100%');
      await page.keyboard.press('Escape');
      assert.deepEqual(errors, [], 'browser exceptions');
      console.log(`PASS ${file}: highlights, split phrases, live highlighting, normalization, order/arrows, clear/retry, URL restoration`);
    } catch (error) {
      failures.push(`${file}: ${error.stack}`);
      console.error(`FAIL ${file}: ${error.message}`);
    } finally {
      await context.close();
    }
  }
  // Exercise the shared touch-selection handler at phone size, with search open.
  const touchContext = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce', hasTouch: true, viewport: { width: 390, height: 844 } });
  try {
    const page = await touchContext.newPage();
    page.setDefaultTimeout(5000);
    await page.goto(base + 'introducere_anatomie_fiziologie.html');
    await page.waitForFunction(() => document.body.dataset.bbSharedReady === 'true');
    await page.evaluate(phrase => {
      const p = document.createElement('p'); p.id = 'search-regression-touch'; p.textContent = phrase;
      document.querySelector('.page-section.active').append(p);
    }, phrase);
    await page.locator('.lesson-search-trigger').tap();
    await search(page, phrase, '1 / 1');
    await selectHighlight(page, 'search-regression-touch', 3, 10, 'touchend');
    await rememberHighlights(page);
    await assertCurrent(page, 0);
    await search(page, '', '0 / 0');
    await assertHighlights(page);
    await search(page, phrase, '1 / 1');
    await assertCurrent(page, 0);
    await assertHighlights(page);
    console.log('PASS phone touch selection during open search');
  } finally {
    await touchContext.close();
  }
  assert.deepEqual(failures, []);
  console.log(`Search/highlighter regression passed on ${files.length} lesson/quiz pages plus phone touch selection.`);
} finally {
  await browser.close();
  if (server.listening) await new Promise(resolve => server.close(resolve));
}
