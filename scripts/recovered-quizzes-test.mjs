import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import http from 'node:http';
import {extname, resolve, sep} from 'node:path';
import {chromium} from 'playwright';

const root=resolve(import.meta.dirname,'..');
const {quizzes}=JSON.parse(await readFile(resolve(root,'tests/recovered-quizzes.json'),'utf8'));
const prefix='/bio-barrons-umf/';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
  try {
    const path=new URL(req.url,'http://localhost').pathname;
    const file=resolve(root,path.slice(prefix.length)||'index.html');
    if(!path.startsWith(prefix)||!file.startsWith(root+sep)) throw Error('Invalid path');
    const data=await readFile(file);
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(data);
  } catch {res.writeHead(404);res.end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}${prefix}`;
const browser=await chromium.launch({headless:true});
try {
  const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const spec of quizzes){
    const sandbox={window:{}};
    vm.runInNewContext(await readFile(resolve(root,spec.dataFile),'utf8'),sandbox);
    const data=sandbox.window.BB_QUIZ;
    assert.equal(data.questions.length,spec.count);
    assert.equal(createHash('sha256').update(JSON.stringify(data.questions)).digest('hex'),spec.sha256,'Recovered content differs from archive snapshot');
    assert.equal(data.ranges.reduce((n,r)=>n+r.end-r.start+1,0),spec.count);
    await page.goto(base+spec.file);
    await page.waitForFunction(()=>document.body.dataset.bbSharedReady==='true');
    assert.equal(await page.locator('.quiz-question').count(),spec.count);
    assert.equal(await page.locator('.quiz-fatal').count(),0);
    assert.ok(await page.locator(`#sidenav a[href="${spec.lesson}"]`).count());
    const question=data.questions[0];
    const card=page.locator(`[data-question-id="${question.id}"]`);
    for(const letter of question.correct) await card.locator(`input[value="${letter}"]`).check();
    await card.locator('.quiz-check').click();
    assert.equal(await card.locator('.is-selected-extra').count(),0);
    assert.equal(await card.locator('.is-answer').count(),question.correct.length);
    await page.reload();
    assert.equal(await card.locator('input:checked').count(),question.correct.length);
    assert.ok(await card.locator('.quiz-retry').isVisible());
    await card.locator('.quiz-retry').click();
    assert.equal(await card.locator('input:checked').count(),0);
    const wrong=question.options.find(o=>!question.correct.includes(o.letter));
    if(wrong){
      await card.locator(`input[value="${wrong.letter}"]`).check();
      await card.locator('.quiz-check').click();
      assert.equal(await card.locator('.is-selected-extra').count(),1);
      assert.equal(await card.locator('.is-missed-answer').count(),question.correct.length);
      assert.ok((await card.locator(`#${question.id}-${wrong.letter.toLowerCase()}-explanation`).textContent()).includes(wrong.why));
    }
    const last=data.ranges.at(-1);
    await page.goto(base+spec.file+'#'+last.id);
    assert.equal(await page.locator('.page-section.active .quiz-question').count(),last.end-last.start+1);
    assert.match(await page.locator('.page-section.active .quiz-range-score').textContent(),new RegExp('/'+(last.end-last.start+1)+' '));
    await page.locator('.page-section.active .quiz-reset-start').click();
    await page.locator('.page-section.active .quiz-reset-confirm').click();
    await page.reload();
    assert.equal(await page.locator('#quiz-sidebar-count').textContent(),`0/${spec.count} verificate`);
    // Every archived explanation and added note must survive into the rendered DOM.
    for(const q of data.questions){
      for(const option of q.options){
        const text=await page.locator(`#${q.id}-${option.letter.toLowerCase()}-explanation`).textContent();
        assert.ok(text.includes(option.why));
        if(option.added) assert.ok(text.includes(option.added));
      }
    }
    console.log(`${spec.title}: ${spec.count} intact questions; scoring, retry, reset and reload passed`);
  }
  assert.deepEqual(errors,[]);
} finally {await browser.close();await new Promise(done=>server.close(done));}
