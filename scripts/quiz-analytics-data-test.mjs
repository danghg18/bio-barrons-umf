import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import http from 'node:http';
import vm from 'node:vm';
import { chromium } from 'playwright';
import { loadSiteRegistry } from './site-registry.mjs';

const root = new URL('../', import.meta.url);
const source = await readFile(new URL('assets/js/quiz-analytics.js', root), 'utf8').catch(() => '/* Module not implemented yet. */');
const fixture = [
  {chapterNum:1,name:'Capitol unu',url:'grile_unu.html',storageKey:'quiz.one',version:1,questions:[{id:'a',number:1,rangeId:'set-1'},{id:'b',number:2,rangeId:'set-1'},{id:'c',number:3,rangeId:'set-1'}],ranges:[{id:'set-1',start:1,end:3}]},
  {chapterNum:3,name:'Capitol trei',url:'grile_trei.html',storageKey:'quiz.three',version:1,questions:[{id:'d',number:61,rangeId:'set-61'}],ranges:[{id:'set-61',start:61,end:61}]}
];
const server = http.createServer((req,res) => {
  res.writeHead(200, {'Content-Type':'text/html'});
  res.end('<!doctype html><title>Analytics test</title>');
});
await new Promise(done => server.listen(0,'127.0.0.1',done));
const browser = await chromium.launch({headless:true});
const base = `http://127.0.0.1:${server.address().port}`;
async function load(page) {
  await page.goto(base);
  await page.evaluate(value => { window.BB_QUIZ_INDEX = value; }, fixture);
  await page.addScriptTag({content:source});
  assert.equal(await page.evaluate(() => typeof window.BBQuizAnalytics), 'object', 'Analytics module exposes a usable data API');
  await page.evaluate(() => BBQuizAnalytics.ready);
}
async function record(page, id, questionId='a', correct=false, storageKey='quiz.one') {
  return page.evaluate(event => BBQuizAnalytics.recordAttempt(event), {attemptId:id,questionId,correct,storageKey,selected:['A']});
}
async function report(page, options={days:'all'}) { return page.evaluate(o => BBQuizAnalytics.getReport(o), options); }
try {
  const context = await browser.newContext({timezoneId:'Europe/Bucharest'});
  const page = await context.newPage();
  await page.clock.install({time:new Date('2026-09-01T10:00:00Z')});
  await page.goto(base);
  await page.evaluate(() => localStorage.setItem('quiz.one', JSON.stringify({version:1,questions:{a:{verified:true,correct:true,selected:['A']},unknown:{verified:true,correct:true}}})));
  await load(page);
  let r = await report(page);
  assert.equal(r.canPersist,true);
  assert.deepEqual(r.totals.current,{verified:1,correct:1,total:4});
  assert.equal(r.totals.attempts,0, 'Legacy progress never fabricates dated attempts');
  assert.equal(r.totals.accuracy,null);
  assert.equal(await record(page,'legacy-retry'),true);
  assert.equal(await record(page,'first-b','b',true),true);
  assert.equal(await record(page,'first-b','b',true),false,'Attempt identity deduplicates verification');
  assert.equal(await record(page,'invalid','unknown',true),false,'Unknown question is rejected');
  r = await report(page);
  assert.equal(r.totals.firstAttempts,1, 'Unknown legacy first attempt stays excluded');
  assert.equal(r.totals.firstCorrect,1);
  assert.equal(r.totals.firstAccuracy,100);
  assert.equal(r.totals.accuracy,50);
  assert.equal(r.totals.distinct,2);
  assert.equal(r.mistakes[0].number,1);

  await page.clock.setFixedTime(new Date('2026-09-11T21:30:00Z'));
  await record(page,'retry-b','b',false);
  await record(page,'first-d','d',true,'quiz.three');
  r = await report(page,{days:7,now:'2026-09-11T21:40:00Z'});
  assert.equal(r.daily.length,7);
  assert.equal(r.daily.at(-1).date,'2026-09-12','Daily buckets follow local midnight');
  assert.equal(r.daily.at(-1).attempts,2);
  assert.equal(r.daily[0].accuracy,null,'Missing days have no invented zero accuracy');
  assert.equal(r.totals.attempts,2);
  assert.equal(r.totals.firstAttempts,1,'Retry does not become a first attempt after date filtering');
  assert.equal(r.totals.firstAccuracy,100);
  assert.equal(r.totals.accuracy,50);
  r = await report(page,{chapterNum:1,days:7,now:'2026-09-11T21:40:00Z'});
  assert.equal(r.totals.firstAccuracy,null);
  assert.equal(r.totals.attempts,1);
  assert.equal(r.totals.current.total,3);

  const second = await context.newPage();
  await second.clock.install({time:new Date('2026-09-11T21:30:00Z')});
  await load(second);
  await second.evaluate(() => {window.notifications=0; BBQuizAnalytics.subscribe(() => window.notifications++);});
  const both = await Promise.all([record(page,'same-cross-tab','c',true),record(second,'same-cross-tab','c',true)]);
  assert.deepEqual(both.sort(),[false,true],'Concurrent tabs commit one event per attempt ID');
  await record(page,'notify','c',false);
  await second.waitForFunction(() => window.notifications>0);
  r = await report(second);
  assert.equal(r.totals.attempts,6, 'Reloaded tabs read committed events without lost writes');
  assert.equal(r.totals.firstCorrect,3,'The first committed attempt wins even when timestamps tie');

  const saved = await page.evaluate(() => localStorage.getItem('quiz.one'));
  await page.evaluate(() => BBQuizAnalytics.clearHistory(1));
  assert.equal(await page.evaluate(() => localStorage.getItem('quiz.one')),saved,'History clearing preserves quiz progress');
  r = await report(page);
  assert.equal(r.totals.attempts,1,'Scoped clear preserves other chapters');
  await record(page,'new-baseline-a');
  await record(page,'new-first-b','b',true);
  r = await report(page,{chapterNum:1,days:'all'});
  assert.equal(r.totals.firstAttempts,1,'Clear creates baseline from currently verified progress');
  assert.equal(r.totals.firstAccuracy,100);
  await page.evaluate(async () => {
    const NativeDate = window.Date;
    window.Date = class extends NativeDate { constructor(...args) { super(...(args.length ? args : ['2026-09-11T21:31:00Z'])); } };
    await BBQuizAnalytics.recordAttempt({attemptId:'zz-first',storageKey:'quiz.one',questionId:'c',correct:true,selected:['A']});
    await BBQuizAnalytics.recordAttempt({attemptId:'aa-retry',storageKey:'quiz.one',questionId:'c',correct:false,selected:['A']});
    window.Date = NativeDate;
  });
  r = await report(page,{chapterNum:1,days:'all',now:'2026-09-12T00:00:00Z'});
  assert.equal(r.totals.firstCorrect,2,'Commit order identifies the first event when timestamps and sorting disagree');
  await page.evaluate(() => localStorage.setItem('quiz.three',JSON.stringify({version:2,questions:{d:{verified:true,correct:true}}})));
  assert.equal((await report(page)).totals.current.verified,1,'Stale quiz versions are ignored');
  await page.evaluate(() => {
    const original = IDBDatabase.prototype.transaction;
    window.restoreAnalyticsTransactions = () => { IDBDatabase.prototype.transaction = original; };
    IDBDatabase.prototype.transaction = function (stores,mode) {
      if (mode === 'readwrite') throw new DOMException('Quota exhausted','QuotaExceededError');
      return original.apply(this,arguments);
    };
  });
  assert.equal(await page.evaluate(() => BBQuizAnalytics.clearHistory(1).then(() => false, () => true)),true,
    'A failed durable deletion rejects instead of claiming success');
  assert.equal((await report(page,{days:'all',now:'2026-09-12T00:00:00Z'})).totals.attempts,5,
    'Failed clear leaves visible history intact');
  await record(page,'quota-write','b',false);
  r = await report(page,{days:'all',now:'2026-09-12T00:00:00Z'});
  assert.equal(r.canPersist,false,'Quota failure switches to session memory');
  assert.equal(r.totals.attempts,6,'Readable committed history survives fallback after a write failure');
  assert.equal(await page.evaluate(() => BBQuizAnalytics.clearHistory(null).then(() => false, () => true)),true,
    'Memory fallback cannot silently clear previously persisted history');
  assert.equal((await report(page,{days:'all',now:'2026-09-12T00:00:00Z'})).totals.attempts,6);
  await record(page,'memory-other-chapter','d',false,'quiz.three');
  await page.evaluate(() => window.restoreAnalyticsTransactions());
  await page.evaluate(() => BBQuizAnalytics.clearHistory(1));
  assert.equal((await report(page,{days:'all',now:'2026-09-12T00:00:00Z'})).totals.attempts,2,
    'Successful fallback clear preserves other chapters including session-only events');
  await load(second);
  assert.equal((await report(second,{days:'all',now:'2026-09-12T00:00:00Z'})).totals.attempts,1,
    'After reopening storage, scoped clearing really deletes durable events across reload');
  await context.close();

  const fallbackContext = await browser.newContext();
  const fallback = await fallbackContext.newPage();
  await fallback.goto(base);
  await fallback.evaluate(() => {
    Object.defineProperty(window,'indexedDB',{get(){throw new DOMException('Unavailable','SecurityError');}});
    Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Unavailable','SecurityError');}});
  });
  await fallback.evaluate(value => {window.BB_QUIZ_INDEX=value;},fixture);
  await fallback.addScriptTag({content:source});
  await fallback.evaluate(() => BBQuizAnalytics.ready);
  await record(fallback,'memory-first','b',true);
  assert.equal(await record(fallback,'memory-first','b',true),false);
  r = await report(fallback);
  assert.equal(r.canPersist,false);
  assert.equal(r.totals.attempts,1);
  assert.equal(r.totals.firstAccuracy,100);
  await fallback.evaluate(() => BBQuizAnalytics.clearHistory(null));
  assert.equal((await report(fallback)).totals.attempts,0);
  await fallbackContext.close();

  const indexSource = await readFile(new URL('assets/js/quiz-index.js',root),'utf8');
  const sandbox={window:{}};
  vm.runInNewContext(indexSource,sandbox);
  const registry=await loadSiteRegistry(root);
  const expected=registry.CHAPTERS.filter(c=>c.done).flatMap(c=>(c.resources||[]).filter(r=>r.kind==='quiz').map(r=>({chapter:c,resource:r})));
  assert.equal(sandbox.window.BB_QUIZ_INDEX.length,expected.length);
  for (const {chapter,resource} of expected) {
    const entry=sandbox.window.BB_QUIZ_INDEX.find(q=>q.url===resource.url);
    assert.ok(entry,`Registered quiz ${resource.url} is indexed`);
    assert.equal(entry.chapterNum,chapter.num);
    const html=await readFile(new URL(resource.url,root),'utf8');
    const dataPath=[...html.matchAll(/src=["']([^"']*grile-[^"']+-data\.js)(?:\?[^"']*)?["']/g)][0][1];
    const quizSandbox={window:{}};
    vm.runInNewContext(await readFile(new URL(dataPath,root),'utf8'),quizSandbox);
    const data=quizSandbox.window.BB_QUIZ||quizSandbox.window.BB_NERVOUS_QUIZ;
    assert.equal(entry.questions.length,data.questions.length);
    assert.equal(entry.storageKey,data.storageKey);
    for (const q of entry.questions) {
      assert.ok(data.questions.some(original=>original.id===q.id&&original.number===q.number));
      const range=entry.ranges.find(range=>range.id===q.rangeId);
      assert.ok(range&&q.number>=range.start&&q.number<=range.end);
    }
  }
  console.log('Quiz analytics: real IndexedDB, concurrency, first-attempt history, date filters, scoped clear, fallback, generated index passed.');
} finally {
  await browser.close();
  await new Promise(done=>server.close(done));
}
