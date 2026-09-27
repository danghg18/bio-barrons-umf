import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import http from 'node:http';
import {extname, resolve, sep} from 'node:path';
import {chromium} from 'playwright';

const root = resolve(import.meta.dirname, '..'), prefix = '/bio-barrons-umf/';
const context = {window:{}};
vm.runInNewContext(await readFile(resolve(root, 'assets/js/grile-reproducator-feminin-data.js'), 'utf8'), context);
const quiz = JSON.parse(JSON.stringify(context.window.BB_QUIZ));
// Model the pre-import identity explicitly; production numbers now already match the book.
quiz.questions = quiz.questions.slice(0, 2).map((q, index) => ({...q,
  legacyNumber:index + 1, number:69 + index, sourceNumber:69 + index,
  sourceChapter:'XII', asksFalse:false, contentRevision:0
}));
quiz.contentRevision = 0;
quiz.questions[0].correct = ['A'];
quiz.questionCount = 2; quiz.firstNumber = 69;
quiz.ranges = [{id:'grile-69-70', start:69, end:70}];
quiz.legacyRoutes = {'grila-1':'grila-69', 'grila-2':'grila-70', 'grile-1-10':'grile-69-70'};
quiz.retiredQuestions = [{id:'rf-003', number:3, correct:['B'], topicId:'legacy'}];
const html = (await readFile(resolve(root, 'grile_sistemul_reproducator_feminin.html'), 'utf8'))
  .replace(/    <div class="page-section[\s\S]*?(?=  <\/main>)/, '<div class="page-section active" id="page-grile-69-70"></div>');
const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml'};
const server = http.createServer(async (req, res) => { try {
  const path = new URL(req.url, 'http://localhost').pathname;
  const file = resolve(root, path.slice(prefix.length) || 'index.html');
  if (!path.startsWith(prefix) || !file.startsWith(root + sep)) throw Error();
  const body = path.endsWith('/grile_sistemul_reproducator_feminin.html') ? html :
    path.endsWith('/grile-reproducator-feminin-data.js') ? 'window.BB_NERVOUS_QUIZ=' + JSON.stringify(quiz) + ';' :
    path.endsWith('/quiz-index.js') ? 'window.BB_QUIZ_INDEX=' + JSON.stringify([{...quiz, questions:quiz.questions.map(q => ({...q, rangeId:'grile-69-70'})), chapterNum:23, name:'Feminin', url:'grile_sistemul_reproducator_feminin.html'}]) + ';' : await readFile(file);
  res.writeHead(200, {'Content-Type':mime[extname(file)] || 'application/octet-stream'}); res.end(body);
} catch { res.writeHead(404); res.end(); } });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}${prefix}`;
const browser = await chromium.launch();
try {
  const browserContext = await browser.newContext({serviceWorkers:'block', reducedMotion:'reduce'});
  await browserContext.addInitScript(({key}) => {
    if (!localStorage.getItem('compat-seeded')) {
      localStorage.setItem(key, JSON.stringify({version:1, questions:{
        'rf-001':{selected:['A','B'], verified:true, correct:true},
        'rf-003':{selected:['B'], verified:true, correct:true}
      }}));
      localStorage.setItem('compat-seeded', '1');
    }
  }, {key:quiz.storageKey});
  const page = await browserContext.newPage();
  await page.goto(base + 'grile_sistemul_reproducator_feminin.html#grila-1');
  await page.waitForFunction(() => document.body.dataset.bbSharedReady === 'true');
  assert.equal(await page.locator('.quiz-fatal').count(), 0, 'Stable IDs survive source renumbering');
  assert.equal(await page.locator('#grila-69').getAttribute('data-question-id'), 'rf-001');
  assert.equal(await page.locator('#grila-69 input:checked').count(), 2, 'Saved selections remain attached to the same source question');
  assert.match(await page.locator('#grila-69 .quiz-result').innerText(), /greșit|incorect|exact|corect/i);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'grila-69', 'An old question hash opens its renumbered question');
  assert.equal(await page.locator('#rf-001-a-explanation strong').innerText(), 'Clarificare', 'Affirmative questions are not labelled false because of their dataset global');
  await page.locator('#rf-002-a').check();
  const saved = await page.evaluate(key => window.BBUserStorage.get(key), quiz.storageKey);
  assert.equal(saved.questions['rf-001'].correct, false, 'Current score follows the corrected key');
  assert.deepEqual(saved.questions['rf-003'], {selected:['B'], verified:true, correct:true}, 'Saving another answer preserves retired selections');
  await page.reload();
  assert.equal(await page.locator('#rf-002-a').isChecked(), true);
  await page.goto(base + 'grile_sistemul_reproducator_feminin.html#grile-1-10');
  assert.equal(await page.locator('.page-section.active').getAttribute('id'), 'page-grile-69-70', 'Old range links remain valid');
  quiz.contentRevision = 1; quiz.questions[0].contentRevision = 1;
  await page.reload();
  assert.equal(await page.locator('#rf-001-a').isEnabled(), true, 'A semantic correction unlocks the preserved selection for reverification');
  assert.match(await page.locator('#grila-69 .quiz-result').innerText(), /actualizat.*verifică/i);
  await page.locator('#rf-001-b').uncheck();
  const revised = await page.evaluate(key => BBUserStorage.get(key), quiz.storageKey);
  assert.equal(revised.questions['rf-001'].priorResults.length, 1);
  assert.deepEqual(revised.questions['rf-001'].priorResults[0].selected, ['A','B']);
  await page.locator('#grila-69 .quiz-check').click();
  await page.waitForFunction(key => BBUserStorage.get(key).questions['rf-001'].verified, quiz.storageKey);
  await page.reload();
  assert.equal(await page.locator('#rf-001-a').isEnabled(), false, 'A newly verified corrected question stays verified after reload');
  assert.equal((await page.evaluate(key => BBUserStorage.get(key), quiz.storageKey)).questions['rf-001'].priorResults.length, 1, 'The earlier result survives reverification without duplicate archives');
  console.log('Stable IDs, old hashes, current-key scoring, retired selections and affirmative explanation labels passed.');
} finally { await browser.close(); await new Promise(r => server.close(r)); }
