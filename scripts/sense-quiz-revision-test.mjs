import assert from 'node:assert/strict';
import {readFile, mkdir} from 'node:fs/promises';
import http from 'node:http';
import {extname, resolve, sep} from 'node:path';
import {chromium} from 'playwright';

const root=resolve(import.meta.dirname,'..'), prefix='/bio-barrons-umf/';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
  try {
    const path=new URL(req.url,'http://localhost').pathname;
    const file=resolve(root,path.slice(prefix.length)||'index.html');
    if(!path.startsWith(prefix)||!file.startsWith(root+sep)) throw Error('Invalid path');
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});
    res.end(await readFile(file));
  } catch {res.writeHead(404);res.end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}${prefix}`;
const browser=await chromium.launch({headless:true});
try {
  const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce',viewport:{width:1440,height:1000}});
  const page=await context.newPage(), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'grile_organele_de_simt.html#grila-3');
  await page.waitForFunction(()=>document.body.dataset.bbSharedReady==='true');
  const third=page.locator('#grila-3');
  // The printed page 104 and the user's correction both require CDE.
  for(const letter of 'CDE') await third.locator(`input[value="${letter}"]`).check();
  await third.locator('.quiz-check').click();
  await third.locator('.quiz-retry').waitFor({state:'visible'});
  assert.ok(await third.evaluate(el=>el.classList.contains('is-correct')),'3 CDE must score as correct');
  await third.locator('.quiz-retry').click();
  for(const letter of 'CE') await third.locator(`input[value="${letter}"]`).check();
  await third.locator('.quiz-check').click();
  await third.locator('.quiz-retry').waitFor({state:'visible'});
  assert.ok(await third.locator('[data-letter="D"]').evaluate(el=>el.classList.contains('is-missed-answer')),'Omitted D must be yellow');
  const beforeHistory=await page.evaluate(()=>BBQuizAnalytics.getReport());
  // A previously verified CE answer must keep its selection but lose its stale exact score.
  await page.evaluate(()=>BBUserStorage.set('bb.quiz.organe-simt.v1',{
    version:1,extra:'preserve',questions:{
      'os-001':{selected:['B','C','E'],verified:true,correct:true},
      'os-003':{selected:['C','E'],verified:true,correct:true,extra:'preserve'},
      'os-future':{selected:['A'],verified:true,correct:true,extra:'preserve'}
    }
  }));
  const beforeStorage=await page.evaluate(()=>BBUserStorage.get('bb.quiz.organe-simt.v1'));
  // A direct analytics visit must use the new key without first loading the player.
  await page.goto(base+'statistici.html');
  assert.equal((await page.evaluate(()=>BBQuizAnalytics.getReport())).totals.current.correct,1,'Direct analytics must ignore the stale CE score');
  await page.goto(base+'grile_organele_de_simt.html#grila-3');
  await third.locator('.quiz-retry').waitFor({state:'visible'});
  assert.ok(await third.evaluate(el=>el.classList.contains('is-review')),'Old CE must be rescored on load');
  const restored=await page.evaluate(()=>BBUserStorage.get('bb.quiz.organe-simt.v1'));
  assert.deepEqual(restored,beforeStorage,'Displaying a corrected score must not mutate the stored record');
  assert.equal(restored.extra,'preserve');
  assert.equal(restored.questions['os-future'].extra,'preserve','A score correction must not delete future rows');
  assert.equal(await page.locator('#grila-1').evaluate(el=>el.classList.contains('is-correct')),true);
  const afterHistory=await page.evaluate(()=>BBQuizAnalytics.getReport());
  for(const field of ['attempts','correct','firstAttempts','firstCorrect']) assert.equal(afterHistory.totals[field],beforeHistory.totals[field],`Rescoring must preserve history ${field}`);
  assert.equal(afterHistory.totals.current.correct,1,'Current analytics must use the corrected score');
  // Cloud/cache hydration and identity changes must apply the same correction.
  await page.evaluate(()=>{
    BBUserStorage.activate('revision-alice');
    BBUserStorage.hydrate({'bb.quiz.organe-simt.v1':{version:1,questions:{'os-003':{selected:['C','E'],verified:true,correct:true}}}});
  });
  assert.deepEqual(await page.evaluate(()=>BBUserStorage.snapshot().pending),{},'Reading a clean cached answer must not queue a cloud write');
  await page.evaluate(()=>{
    BBUserStorage.hydrate({'bb.quiz.organe-simt.v1':{version:1,questions:{'os-003':{selected:['C','D','E'],verified:true,correct:false}}}});
  });
  assert.ok(await third.evaluate(el=>el.classList.contains('is-correct')),'A formerly rejected CDE must become correct after hydration');
  assert.equal(await page.evaluate(()=>BBUserStorage.get('bb.quiz.organe-simt.v1').questions['os-003'].correct),false,'Derived score must not rewrite a cloud row');
  await page.evaluate(()=>BBUserStorage.activate('revision-bob'));
  assert.equal(await third.locator('input:checked').count(),0,'Bob must not inherit Alice answers');
  await page.evaluate(()=>BBUserStorage.activate('guest'));
  assert.ok(await third.evaluate(el=>el.classList.contains('is-review')),'Guest selection must remain isolated');
  assert.deepEqual(await third.locator('input:checked').evaluateAll(inputs=>inputs.map(i=>i.value)),['C','E']);
  // Clarifications render under the appropriate answer status, at desktop and phone sizes.
  const fourth=page.locator('#grila-4');
  await fourth.locator('input[value="A"]').check();
  await fourth.locator('.quiz-check').click();
  await fourth.locator('.quiz-retry').waitFor({state:'visible'});
  assert.equal(await fourth.locator('#os-004-e-explanation').isVisible(),true);
  await mkdir(resolve(root,'tmp/sense-audit/browser'),{recursive:true});
  for(const width of [1440,390]) {
    await page.setViewportSize({width,height:1000});
    await page.goto(base+'grile_organele_de_simt.html#grila-3');
    await third.locator('.quiz-retry').waitFor({state:'visible'});
    await third.screenshot({path:resolve(root,`tmp/sense-audit/browser/q3-${width}.png`)});
    await fourth.screenshot({path:resolve(root,`tmp/sense-audit/browser/q4-${width}.png`)});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'No horizontal overflow');
  }
  assert.deepEqual(errors,[]);
  await context.close();
  console.log('Sense quiz revision: CDE scoring, omitted D, stored answers, hydration, owner isolation, preserved history and desktop/mobile feedback passed.');
} finally {
  await browser.close();
  await new Promise(done=>server.close(done));
}
