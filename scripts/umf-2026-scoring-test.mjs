import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import http from 'node:http';
import {resolve, sep, extname} from 'node:path';
import {chromium} from 'playwright';
import {loadSiteRegistry, publishedResources} from './site-registry.mjs';

const root = resolve(import.meta.dirname, '..'), prefix = '/bio-barrons-umf/';
const key = JSON.parse(await readFile(resolve(root, 'tests/umf-cluj-2026-answer-key.json')));
const mapping = JSON.parse(await readFile(resolve(root, 'data/quiz-source-map.json')));
const registry = await loadSiteRegistry();
const resources = publishedResources(registry).resources.filter(r => r.kind === 'quiz');
const availableOnly = process.argv.includes('--available');
if (!availableOnly) assert.equal(resources.length, 17, 'All 17 thematic sets must be registered; associative publication is deferred');
const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml'};
const server = http.createServer(async (req, res) => {try {
  const path = new URL(req.url, 'http://localhost').pathname;
  const file = resolve(root, path.slice(prefix.length) || 'index.html');
  if (!path.startsWith(prefix) || !file.startsWith(root + sep)) throw Error();
  // Scoring is exercised by the production player. History has its own full
  // browser suite; this exhaustive matrix must not fabricate 50,880 attempts.
  const body = path.endsWith('/quiz-analytics.js') ? 'window.BBQuizAnalytics=null;' : await readFile(file);
  res.writeHead(200, {'Content-Type':mime[extname(file)] || 'application/octet-stream'}); res.end(body);
} catch {res.writeHead(404); res.end();}});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch();
let combinations = 0, count = 0;
try {
  const context = await browser.newContext({serviceWorkers:'block', reducedMotion:'reduce'});
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error)));
  for (const resource of resources) {
    await page.goto(`http://127.0.0.1:${server.address().port}${prefix}${resource.url}`);
    await page.waitForFunction(() => document.body.dataset.bbSharedReady === 'true');
    assert.equal(await page.locator('.quiz-fatal').count(), 0, resource.url + ' renders');
    const data = await page.evaluate(() => window.BB_QUIZ || window.BB_NERVOUS_QUIZ);
    const set = mapping.find(s => s.storageKey === data.storageKey);
    assert.ok(set, 'Known source partition: ' + data.storageKey);
    const expected = data.questions.map(q => ({id:q.id, mask:[...key.chapters[set.sourceChapter].answers[q.originalNumber || q.number].printed].reduce((mask, letter) => mask | (1 << ('ABCDE'.indexOf(letter))), 0)}));
    const mismatches = await page.evaluate(({expected}) => {
      const quiz = window.BB_QUIZ || window.BB_NERVOUS_QUIZ;
      const errors = [];
      for (let mask = 0; mask < 32; mask++) {
        const selected = [...'ABCDE'].filter((_, bit) => mask & (1 << bit));
        BBUserStorage.set(quiz.storageKey, {version:quiz.version, questions:Object.fromEntries(quiz.questions.map(q => [q.id, {selected, verified:true, correct:false, contentRevision:q.contentRevision || 0}]))});
        document.dispatchEvent(new CustomEvent('bb:cache-change', {detail:{reason:'external'}}));
        for (const item of expected) {
          const card = document.querySelector('[data-question-id="' + item.id + '"]');
          if (card.classList.contains('is-correct') !== (mask === item.mask)) errors.push({id:item.id, selected:mask, expected:item.mask});
        }
      }
      return errors;
    }, {expected});
    assert.deepEqual(mismatches, [], resource.url + ': production player must match the independent printed key for all 32 selections');
    assert.deepEqual(pageErrors, [], resource.url + ': no browser errors during scoring');
    count += data.questions.length; combinations += data.questions.length * 32;
    console.log(resource.url + ': ' + data.questions.length * 32 + ' answer combinations passed');
  }
  if (!availableOnly) { assert.equal(count, 1590); assert.equal(combinations, 50880); }
  console.log(`${count} questions, ${combinations} real-player scoring combinations passed.`);
} finally {await browser.close(); await new Promise(r => server.close(r));}
