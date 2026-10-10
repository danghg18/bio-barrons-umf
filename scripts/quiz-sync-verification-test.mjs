import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import {chromium} from 'playwright';

const root=resolve(import.meta.dirname,'..'), prefix='/bio-barrons-umf/';
const server=http.createServer(async(req,res)=>{
  try {
    const path=new URL(req.url,'http://localhost').pathname;
    const file=resolve(root,path.slice(prefix.length));
    if(!path.startsWith(prefix)||!file.startsWith(root+'/'))throw Error('not found');
    res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');
    res.end(await readFile(file));
  } catch {res.writeHead(404);res.end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch();
try {
  for(const edition of ['', 'nou/']) {
    const context=await browser.newContext({serviceWorkers:'block'});
    await context.addInitScript({path:resolve(root,'tests/supabase-mock.js')});
    await context.route('https://*.supabase.co/**',route=>route.abort());
    const page=await context.newPage(), errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}${prefix}${edition}grile_celula.html`);
    await page.evaluate(()=>BBAuth.ready);
    assert.equal((await page.evaluate(()=>BBAuth.perform('login','ana@example.test','Test-password-123!'))).ok,true);
    await page.waitForFunction(()=>BBCloudSync.getState().status==='synced');
    await page.evaluate(()=>BBQuizAnalytics.ready);
    // A real history commit can overlap an upload acknowledgement, cloud
    // hydration or a storage invalidation from another tab. None resets answers.
    await page.evaluate(()=>{
      const original=BBQuizAnalytics.recordAttempt;
      BBQuizAnalytics.recordAttempt=async input=>{
        const recorded=await original(input);
        document.dispatchEvent(new CustomEvent('bb:cache-change',{detail:{reason:'personal-cloud',key:'bb.analytics.v1:attempt:'+input.attemptId}}));
        document.dispatchEvent(new CustomEvent('bb:cache-change',{detail:{reason:'cloud'}}));
        document.dispatchEvent(new CustomEvent('bb:cache-change',{detail:{reason:'external'}}));
        return recorded;
      };
    });
    const card=page.locator('#grila-61');
    await card.locator('input[value="C"]').check();
    // Reconciliation renders unsaved empty cards. A later acknowledgement must
    // not mistake these defaults or reordered JSON fields for a second reset.
    await page.evaluate(()=>{
      const value=BBUserStorage.get(BB_QUIZ.storageKey);
      const id=BB_QUIZ.questions.find(q=>q.number===62).id;
      value.questions[id]={correct:false,verified:false,selected:['A']};
      BBUserStorage.set(BB_QUIZ.storageKey,value);
      document.dispatchEvent(new CustomEvent('bb:cache-change',{detail:{reason:'external'}}));
    });
    await card.locator('.quiz-check').click();
    await page.waitForFunction(()=>!document.querySelector('#grila-61 .quiz-check').disabled);
    assert.equal(await card.evaluate(node=>node.classList.contains('is-verified')),true,'Cloud acknowledgements must not cancel an in-flight verification');
    let report=await page.evaluate(()=>BBQuizAnalytics.getReport({days:'all'}));
    assert.equal(report.history.length,1,'One click records exactly one dated attempt');
    assert.equal(report.runs[0].verified,1);
    await page.reload();
    await page.waitForSelector('#grila-61.is-verified');
    report=await page.evaluate(()=>BBQuizAnalytics.getReport({days:'all'}));
    assert.equal(report.history.length,1,'Reload preserves the result without duplicate history');
    // A genuine reset still fences a verification. Only no-op invalidations
    // may be ignored; a committed attempt must not restore cleared answers.
    await page.evaluate(()=>{
      const original=BBQuizAnalytics.recordAttempt;
      BBQuizAnalytics.recordAttempt=async input=>{
        const recorded=await original(input);
        BBUserStorage.set(BB_QUIZ.storageKey,{version:BB_QUIZ.version,questions:{}});
        document.dispatchEvent(new CustomEvent('bb:cache-change',{detail:{reason:'external'}}));
        return recorded;
      };
    });
    const next=page.locator('#grila-62');
    await next.locator('input[value="A"]').check();
    await next.locator('.quiz-check').click();
    await page.waitForFunction(()=>!document.querySelector('#grila-62 .quiz-check').disabled);
    assert.equal(await next.evaluate(node=>node.classList.contains('is-verified')),false,'A concurrent real reset must still cancel the pending answer');
    assert.deepEqual(await page.evaluate(()=>BBUserStorage.get(BB_QUIZ.storageKey).questions),{});
    assert.deepEqual(errors,[]);
    await context.close();
    console.log(`PASS ${edition||'root/'} verification survives concurrent sync and retains answer/history after reload`);
  }
} finally {await browser.close();await new Promise(done=>server.close(done));}
