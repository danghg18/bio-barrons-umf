import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import vm from 'node:vm';
import {chromium} from 'playwright';

const root=resolve(import.meta.dirname,'..');
const prefix='/bio-barrons-umf/';
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.json':'application/json'};
const server=http.createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=resolve(root,path.slice(prefix.length)||'index.html');if(!path.startsWith(prefix)||!file.startsWith(root+sep))throw Error('not found');const contents=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(contents);}catch{res.writeHead(404);res.end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}${prefix}`;
const browser=await chromium.launch({headless:true});
const sandbox={window:{}};vm.runInNewContext(await readFile(resolve(root,'assets/js/quiz-index.js'),'utf8'),sandbox);
const quizzes=JSON.parse(JSON.stringify(sandbox.window.BB_QUIZ_INDEX));
const output=process.env.BB_ACCOUNTS_OUTPUT || '/tmp/bb-accounts-review';
await mkdir(output,{recursive:true});
let count=0;
async function test(name,run){if(process.env.BB_ACCOUNTS_CASE&&!name.includes(process.env.BB_ACCOUNTS_CASE))return;await run();count++;console.log(`PASS ${name}`);}
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const time='2026-09-11T08:00:00.000Z';
const study=(chapterNum=1,sectionId='introducere')=>({version:1,lastVisited:{chapterNum,sectionId,visitedAt:time},lessons:{[chapterNum]:{completedSections:[sectionId],updatedAt:time}}});
async function login(page,email='ana@example.test'){
  const result=await page.evaluate(email=>BBAuth.perform('login',email,'Test-password-123!'),email);
  assert.equal(result.ok,true,'login API succeeds');
  await synced(page);
}
async function synced(page){await page.waitForFunction(()=>window.BBCloudSync?.getState().status==='synced');}
async function logout(page){assert.equal((await page.evaluate(()=>BBAuth.perform('logout'))).ok,true);await page.waitForFunction(()=>!BBAuth.getState().user);}
async function newPage({mock=true,blockedStorage=false,mobile=false,serviceWorkers='block',entry=''}={}){
  const context=await browser.newContext({hasTouch:mobile,viewport:mobile?{width:390,height:844}:{width:1440,height:900},serviceWorkers,reducedMotion:'reduce'});
  await context.route('**/assets/js/supabase-config.js*',route=>route.fulfill({contentType:'text/javascript',body:"window.BB_SUPABASE_CONFIG = {url:'',publishableKey:''};"}));
  await context.route('https://*.supabase.co/**',route=>route.abort('blockedbyclient'));
  if(mock)await context.addInitScript({path:resolve(root,'tests/supabase-mock.js')});
  if(blockedStorage)await context.addInitScript(()=>Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('Storage blocked','SecurityError');}}));
  const page=await context.newPage();page.setDefaultTimeout(12000);const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+entry);await page.waitForFunction(()=>Boolean(window.BBAuth));await page.evaluate(()=>BBAuth.ready);
  return {page,context,errors};
}
try{
  await test('statistics reconcile 85 synced answers with 35 dated results without duplicates',async()=>{
    const {page,context,errors}=await newPage({entry:'statistici.html?capitol=12'});
    const cloud=await page.evaluate(({A,time})=>{
      const q=BB_QUIZ_INDEX.find(q=>q.chapterNum===12);
      const questions=Object.fromEntries(q.questions.slice(0,85).map((item,i)=>[item.id,{verified:true,correct:i<57,selected:i<57?item.correct:[]} ]));
      const row={user_id:A,quiz_key:q.storageKey,version:1,state:{version:1,questions},updated_at:time};
      __mock.seed('quiz_states',[row]);return row;
    },{A,time});
    await login(page);
    await page.evaluate(async()=>{
      const q=BB_QUIZ_INDEX.find(q=>q.chapterNum===12);
      // 22 correct + 13 wrong are the only dated results available here.
      for(const item of [...q.questions.slice(0,22),...q.questions.slice(57,70)])await BBQuizAnalytics.recordAttempt({storageKey:q.storageKey,questionId:item.id,attemptId:'dated-'+item.id,correct:q.questions.indexOf(item)<22,selected:q.questions.indexOf(item)<22?item.correct:[]});
    });
    await page.waitForFunction(()=>document.body.dataset.analyticsReady==='true');
    assert.equal(await page.locator('[data-metric="attempts"]').innerText(),'85','Default report must include all verified cloud answers');
    assert.equal(await page.locator('[data-metric="correct"]').innerText(),'57');
    assert.equal(await page.locator('[data-metric="wrong"]').innerText(),'28');
    let report=await page.evaluate(()=>BBQuizAnalytics.getReport({chapterNum:12,days:'all'}));
    assert.equal(report.history.length,35,'Saved answers do not become invented history');
    assert.equal(report.daily.reduce((n,d)=>n+d.attempts,0),35,'Unknown dates never appear on a chart');
    assert.equal(report.savedResults.length,50,'History and answer cache overlap is counted once');
    assert.equal(report.summary.solved,85);
    assert.equal(report.topics.reduce((n,t)=>n+t.attempts,0),85);
    assert.equal(report.mistakes.length,28);
    assert.match(await page.locator('#analytics-saved-note').innerText(),/50/);
    await page.getByRole('tab',{name:'Greșeli',exact:true}).click();
    assert.equal(await page.locator('.statistics-mistake-list li').count(),5,'Recovered current mistakes are available without opening the full quiz');
    assert.ok(await page.locator('.statistics-mistake-list li').first().innerText().then(text=>text.includes('De corectat')));
    assert.equal((await page.evaluate(()=>BBQuizAnalytics.getReport({chapterNum:12,days:'all'}))).runs.length,0,'Reading recovered mistakes never invents a traversal');
    await page.getByRole('tab',{name:'Rezumat',exact:true}).click();
    await page.locator('#analytics-period').selectOption('30');
    await page.waitForFunction(()=>document.body.dataset.analyticsReady==='true'&&document.querySelector('[data-metric="attempts"]').textContent==='35');
    assert.match(await page.locator('#analytics-saved-note').innerText(),/50/);
    await page.goBack();await page.waitForFunction(()=>document.querySelector('[data-metric="attempts"]')?.textContent==='85');
    await page.reload();await synced(page);await page.waitForFunction(()=>document.querySelector('[data-metric="attempts"]')?.textContent==='85');
    await page.goto(base+'testare.html');await page.waitForFunction(()=>document.body.dataset.analyticsReady==='true');
    assert.equal(await page.locator('#testing-preview-summary strong').innerText(),'85');
    assert.match(await page.locator('#testing-quiz-12').locator('..').locator('.testing-row-progress').innerText(),/85\s*\/\s*100 verificate/);
    assert.equal(await page.locator('#testing-stats-12').getAttribute('href'),'statistici.html?capitol=12','The catalog links to the detailed result');
    // A separate browser has only cloud answers, with no copied IndexedDB history.
    const second=await newPage({entry:'statistici.html?capitol=12'});
    await second.page.evaluate(row=>__mock.seed('quiz_states',[row]),cloud);await login(second.page);
    await second.page.waitForFunction(()=>document.querySelector('[data-metric="attempts"]')?.textContent==='85');
    assert.equal(await second.page.locator('[data-metric="correct"]').innerText(),'57');
    assert.equal(await second.page.locator('#analytics-activity svg').count(),0);
    await second.page.evaluate(()=>__mock.offline(true));await second.page.reload();
    await second.page.waitForFunction(()=>document.querySelector('[data-metric="attempts"]')?.textContent==='85');
    await second.page.evaluate(()=>__mock.offline(false));await synced(second.page);
    await second.page.evaluate(async()=>{
      const q=BB_QUIZ_INDEX.find(q=>q.chapterNum===12),row=__mock.rows('quiz_states')[0],next=q.questions[85];
      row.state.questions[next.id]={verified:true,correct:true,selected:next.correct};
      __mock.seed('quiz_states',[row]);await BBCloudSync.retry();
    });
    await second.page.waitForFunction(()=>document.querySelector('[data-metric="attempts"]')?.textContent==='86');
    assert.equal(await second.page.locator('[data-metric="correct"]').innerText(),'58','A new cloud answer updates the open report after hydration');
    await logout(second.page);await login(second.page,'bogdan@example.test');
    await second.page.waitForFunction(()=>document.body.dataset.analyticsReady==='true');
    assert.equal(await second.page.locator('#analytics-onboarding').isVisible(),true,'Another account must not see recovered answers');
    assert.equal((await second.page.evaluate(()=>BBQuizAnalytics.getReport({days:'all'}))).summary.solved,0);
    await second.context.close();
    for(const width of [1440,768,390,320]){
      await page.setViewportSize({width,height:900});await page.goto(base+'statistici.html?capitol=12');await page.waitForFunction(()=>document.body.dataset.analyticsReady==='true');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.screenshot({path:resolve(output,'statistics-reconciled-'+width+'.png'),fullPage:true});
      await page.screenshot({path:resolve(output,'statistics-reconciled-viewport-'+width+'.png')});
    }
    await page.evaluate(async()=>{
      const key=BB_QUIZ_INDEX.find(q=>q.chapterNum===12).storageKey;
      await BBQuizAnalytics.clearHistory(12);
      await BBQuizAnalytics.ensureRun(key);
      await BBQuizAnalytics.prepareRestart({storageKey:key,resetId:'saved-stats-restart'});
      BBUserStorage.set(key,{version:1,questions:{}});
      await BBQuizAnalytics.finishRestart({storageKey:key,resetId:'saved-stats-restart'});
    });
    await synced(page);await page.goto(base+'testare.html');await page.waitForFunction(()=>document.body.dataset.analyticsReady==='true');
    assert.equal(await page.locator('#testing-preview-summary strong').innerText(),'85','Restart preserves recovered coverage');
    assert.match(await page.locator('#testing-quiz-12').locator('..').locator('.testing-row-progress').innerText(),/0\s*\/\s*100 verificate/,'The catalog reports the empty current traversal after restarting');
    assert.equal(await page.locator('#testing-stats-12').isVisible(),true,'Archived results remain reachable through statistics');
    const archivedReport=await page.evaluate(()=>BBQuizAnalytics.getReport({chapterNum:12,days:'all'}));
    const archivedRun=archivedReport.runs.find(run=>run.verified===85);
    assert.ok(archivedRun,'The imported previous traversal is retained after restarting');
    assert.equal(archivedRun.correct,57,'Restarting preserves the original correct-answer count in the archived traversal');
    assert.deepEqual(errors,[]);await context.close();
  });
  await test('account runtime initializes without a configured project',async()=>{
    const {page,context,errors}=await newPage({mock:false});
    assert.equal(await page.evaluate(()=>BBAuth.getState().configured),false);
    await page.locator('#pilot-account-toggle').click();
    assert.match(await page.locator('#bb-account-status').textContent(),/nu sunt încă configurate/);
    assert.equal(await page.locator('.bb-account-form').count(),0);
    assert.equal(errors.length,0);
    await context.close();
  });
  await test('signup, login, logout and password recovery are usable from the account dialog',async()=>{
    const {page,context,errors}=await newPage();
    await page.locator('#pilot-account-toggle').click();
    await page.screenshot({path:resolve(output,'account-desktop-login.png')});
    assert.equal(await page.locator('#bb-auth-email').evaluate(node=>node===document.activeElement),true);
    await page.getByRole('button',{name:'Creează un cont',exact:true}).click();
    await page.locator('#bb-auth-email').fill('ana@example.test');await page.locator('#bb-auth-password').fill('Test-password-123!');
    await page.getByRole('button',{name:'Creează contul',exact:true}).click();await synced(page);
    assert.equal(await page.locator('.bb-account-email').textContent(),'ana@example.test');
    assert.equal(await page.evaluate(()=>__mock.calls().filter(call=>call.operation==='signUp').length),1);
    await page.getByRole('button',{name:'Deconectare',exact:true}).click();await page.waitForFunction(()=>!BBAuth.getState().user);
    await page.locator('#bb-auth-email').fill('ana@example.test');await page.locator('#bb-auth-password').fill('Test-password-123!');
    await page.getByRole('button',{name:'Autentifică-te',exact:true}).click();await synced(page);
    await page.keyboard.press('Escape');assert.equal(await page.locator('#pilot-account-panel').evaluate(node=>node.open),false);
    assert.equal(await page.locator('#pilot-account-toggle').evaluate(node=>node===document.activeElement),true);
    await page.locator('#pilot-account-toggle').click();await page.getByRole('button',{name:'Deconectare',exact:true}).click();await page.waitForFunction(()=>!BBAuth.getState().user);
    await page.getByRole('button',{name:'Am uitat parola',exact:true}).click();await page.locator('#bb-auth-email').fill('ana@example.test');
    await page.getByRole('button',{name:'Trimite linkul de resetare',exact:true}).click();
    await page.waitForFunction(()=>__mock.calls().some(call=>call.operation==='resetPasswordForEmail'));
    const reset=await page.evaluate(()=>__mock.calls().find(call=>call.operation==='resetPasswordForEmail'));
    assert.equal(new URL(reset.payload.options.redirectTo).pathname,prefix+'cont.html');
    assert.equal(new URL(reset.payload.options.redirectTo).searchParams.get('flow'),'recovery');
    await page.goto(base+'cont.html?flow=recovery');await page.evaluate(()=>BBAuth.ready);
    await page.evaluate(()=>{__mock.setUser('a');__mock.recovery();});
    await page.getByRole('button',{name:'Salvează parola',exact:true}).waitFor();
    await page.locator('#bb-auth-password').fill('New-test-password-123!');await page.getByRole('button',{name:'Salvează parola',exact:true}).click();
    await page.waitForFunction(()=>__mock.calls().some(call=>call.operation==='updateUser'));
    assert.equal(errors.length,0);await context.close();
  });
  await test('email confirmation and failed login show Romanian messages without exposing technical details',async()=>{
    const {page,context}=await newPage();await page.evaluate(()=>__mock.requireConfirmation(true));
    await page.locator('#pilot-account-toggle').click();await page.getByRole('button',{name:'Creează un cont',exact:true}).click();
    await page.locator('#bb-auth-email').fill('ana@example.test');await page.locator('#bb-auth-password').fill('Test-password-123!');
    await page.getByRole('button',{name:'Creează contul',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('#bb-account-message').textContent.includes('confirm'));
    assert.equal(await page.evaluate(()=>BBAuth.getState().user),null);
    await page.getByRole('button',{name:'Înapoi la autentificare',exact:true}).click();
    await page.locator('#bb-auth-email').fill('ana@example.test');await page.locator('#bb-auth-password').fill('Incorrect-test-password');
    await page.evaluate(()=>__mock.failNext('auth',null,'invalid_credentials'));
    await page.getByRole('button',{name:'Autentifică-te',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('#bb-account-message').classList.contains('is-error'));
    assert.doesNotMatch(await page.locator('body').innerText(),/mock database detail|invalid_credentials|Incorrect-test-password/);
    await page.keyboard.press('Escape');await page.locator('#pilot-account-toggle').click();
    assert.equal(await page.locator('#bb-auth-password').inputValue(),'','closing modal clears password');
    await context.close();
  });
  await test('notes autosave and refresh preserve the exact caret and scroll position',async()=>{
    for(const notebook of [false,true])for(const mobile of [false,true]){
      const {page,context,errors}=await newPage({mobile,entry:notebook?'notite.html?capitol=3':'celula_si_fiziologia_celulara.html#membrana'});
      await login(page);
      if(!notebook)await page.locator('#bb-notes-toggle').click();
      const editor=page.locator(notebook?'#nota-membrana .bb-note-body':'#bb-note-body');
      await editor.fill(Array.from({length:50},(_,i)=>'Rândul '+i+' despre membrană.').join('\n'));
      await synced(page);
      await editor.evaluate(node=>{
        node.focus();const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);let text;
        while((text=walker.nextNode())&&!text.textContent.includes('Rândul 25')){}
        if(!text)throw Error('Missing middle paragraph');
        const range=document.createRange();range.setStart(text,text.textContent.indexOf('Rândul 25')+6);range.collapse(true);
        const selection=getSelection();selection.removeAllRanges();selection.addRange(range);
        window.noteCaretNode=text;window.noteCaretOffset=range.startOffset;
        const rect=range.getBoundingClientRect();
        if(node.scrollHeight>node.clientHeight)node.scrollTop+=rect.top-node.getBoundingClientRect().top-100;
        else window.scrollBy(0,rect.top-innerHeight/2);
      });
      const before=await editor.evaluate(node=>({offset:getSelection().anchorOffset,scroll:node.scrollTop,page:scrollY}));
      await page.evaluate(()=>BBCloudSync.retry());await synced(page);
      const after=await editor.evaluate(node=>({sameNode:getSelection().anchorNode===window.noteCaretNode,offset:getSelection().anchorOffset,scroll:node.scrollTop,page:scrollY}));
      assert.equal(after.sameNode,true,'Saving/syncing must retain the text node under the caret');
      assert.equal(after.offset,before.offset,'Sync must retain the exact insertion offset');
      assert.equal(after.scroll,before.scroll);assert.equal(after.page,before.page);
      await page.evaluate(()=>__mock.setUser('a','TOKEN_REFRESHED'));await synced(page);
      assert.equal(await editor.evaluate(()=>getSelection().anchorNode===window.noteCaretNode&&getSelection().anchorOffset===window.noteCaretOffset),true,'Session refresh preserves the insertion point');
      await page.keyboard.type('NOU');await synced(page);
      assert.ok((await editor.innerText()).includes('RândulNOU 25'),'Typing resumes at the original position');
      assert.deepEqual(errors,[]);await context.close();
    }
  });
  await test('notebook continuous writing opens empty sections and preserves the active cursor',async()=>{
    const {page,context,errors}=await newPage({entry:'notite.html?capitol=3'});
    assert.equal(await page.locator('h1').innerText(),'Celula și fiziologia celulară');assert.equal(await page.locator('.bb-note-body').count(),0,'Guests see the chapter heading but no private editors');
    await login(page);
    await page.waitForFunction(()=>document.querySelector('#notebooks')?.dataset.sectionsReady==='true');
    const membrane=page.locator('#nota-membrana .bb-note-body');
    assert.equal(await membrane.count(),1,'An empty lesson section is immediately writable');
    assert.equal(await page.locator('.nb-entry .bb-note-body[contenteditable="true"]').count(),9);
    assert.equal(await page.evaluate(()=>Object.keys(BBUserStorage.snapshot().values).filter(k=>k.startsWith('note:')).length),0,'Opening a notebook does not create empty records');
    await membrane.fill('Ideea despre membrană.');await page.keyboard.press('End');await page.keyboard.type(' Continuare.');
    await synced(page);
    assert.equal(await page.evaluate(()=>BBUserStorage.get('note:3:membrana').body),'Ideea despre membrană. Continuare.');
    assert.equal(await membrane.evaluate(n=>n===document.activeElement&&n.contains(getSelection().anchorNode)),true,'Autosave keeps editor and caret');
    assert.equal(await page.locator('.bb-notes-toolbar:visible').count(),1);
    const ids=await page.locator('[id]').evaluateAll(nodes=>nodes.map(n=>n.id));assert.equal(new Set(ids).size,ids.length,'Mounted editors have distinct accessible IDs');
    await page.reload();await page.waitForSelector('#nota-membrana .bb-note-body');assert.equal(await membrane.innerText(),'Ideea despre membrană. Continuare.');
    await page.goto(base+'celula_si_fiziologia_celulara.html#membrana');await synced(page);await page.locator('#bb-notes-toggle').click();
    assert.equal(await page.locator('#bb-note-body').innerText(),'Ideea despre membrană. Continuare.');
    await page.locator('#bb-note-body').fill('Actualizat în lecție.');await synced(page);
    await page.goto(base+'notite.html?capitol=3');await page.waitForSelector('#nota-membrana .bb-note-body');assert.equal(await membrane.innerText(),'Actualizat în lecție.');
    assert.deepEqual(errors,[]);await context.close();
  });
  await test('notebook every chapter is writable without fetching its lesson and survives reload',async()=>{
    const {page,context,errors}=await newPage({entry:'notite.html'});await login(page);
    const chapters=await page.evaluate(()=>CHAPTERS.filter(c=>c.done&&c.url).map(({num,url})=>({num,url})));
    const expected={};
    for(const chapter of chapters){
      expected[chapter.num]=await page.evaluate(source=>{
        const html=new DOMParser().parseFromString(source,'text/html');
        return [...html.querySelectorAll('.page-section[id^="page-"]')].map(section=>({id:section.id.slice(5),title:((section.id==='page-home'&&html.querySelector('nav a[href="#home"]')?.textContent)||section.querySelector('.page-title,.section-title,h1,h2')?.textContent||section.id.slice(5)).trim()}));
      },await readFile(resolve(root,chapter.url),'utf8'));
    }
    let requests=0;
    for(const chapter of chapters)await page.route('**/'+chapter.url,route=>{requests++;return route.fulfill({status:503,body:'Unavailable'});});
    let sectionsWritten=0;
    for(const chapter of chapters){
      await page.goto(base+'notite.html?capitol='+chapter.num);
      await page.waitForFunction(()=>document.querySelector('#notebooks')?.dataset.sectionsReady==='true');
      const rows=await page.locator('.nb-entry').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.section,title:node.querySelector('h2').textContent})));
      assert.deepEqual(rows,expected[chapter.num],'Chapter '+chapter.num+' exposes all authored sections even when its lesson cannot load');
      for(const section of expected[chapter.num]){
        const editor=page.locator('#nota-'+section.id+' .bb-note-body');
        await editor.fill('Notița '+chapter.num+' / '+section.id);sectionsWritten++;
      }
      await synced(page);await page.reload();await page.waitForFunction(()=>document.querySelector('#notebooks')?.dataset.sectionsReady==='true');
      const saved=await page.locator('.nb-entry').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.section,body:node.querySelector('.bb-note-body').innerText,editable:node.querySelector('.bb-note-body').isContentEditable})));
      assert.deepEqual(saved,expected[chapter.num].map(section=>({id:section.id,body:'Notița '+chapter.num+' / '+section.id,editable:true})),'Chapter '+chapter.num+' retains every writable note');
      if([8,13,20].includes(chapter.num)){
        await page.setViewportSize({width:chapter.num===13?390:1440,height:900});
        await page.screenshot({path:resolve(output,'notebook-chapter-'+chapter.num+'.png')});
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
        await page.setViewportSize({width:1440,height:900});
      }
    }
    assert.equal(requests,0,'Notebook editors do not depend on a second lesson request');
    assert.equal(await page.locator('.nb-retry').count(),0);
    console.log('Verified writing/reload: '+chapters.length+' notebooks, '+sectionsWritten+' sections.');
    assert.deepEqual(errors,[]);await context.close();
  });
  await test('notebook unavailable lessons stay silent without losing existing notes',async()=>{
    const {page,context,errors}=await newPage();await login(page);
    await page.evaluate(time=>BBUserStorage.set('note:3:membrana',{chapter_num:3,section_id:'membrana',body:'Notița mea existentă.',created_at:time,updated_at:time}),time);await synced(page);
    let unavailable=true,requests=0;
    await page.route('**/celula_si_fiziologia_celulara.html',route=>{
      requests++;return unavailable?route.fulfill({status:503,body:'Unavailable'}):route.continue();
    });
    await page.goto(base+'notite.html?capitol=3');
    await page.waitForFunction(()=>document.querySelector('#notebooks')?.dataset.sectionsReady==='true');
    assert.equal(await page.getByText('Secțiunile lecției nu sunt disponibile. Reîncearcă',{exact:true}).count(),0,'Unavailable metadata never displays the unwanted message');
    const editor=page.locator('#nota-membrana .bb-note-body');assert.equal(await editor.innerText(),'Notița mea existentă.');
    await editor.evaluate(node=>{node.focus();const range=document.createRange();range.selectNodeContents(node);range.collapse(false);getSelection().removeAllRanges();getSelection().addRange(range);});
    await page.keyboard.type(' Continui sa scriu.');await synced(page);
    for(let i=0;i<6;i++)await page.evaluate(()=>document.dispatchEvent(new CustomEvent('bb:cache-change',{detail:{reason:'external'}})));
    assert.equal(requests,0,'Typing and cache events do not fetch lesson metadata');
    assert.equal(await page.locator('.nb-retry').count(),0);
    assert.equal(await page.evaluate(()=>BBUserStorage.get('note:3:membrana').body),'Notița mea existentă. Continui sa scriu.');
    await page.screenshot({path:resolve(output,'notebook-unavailable-sections.png')});
    unavailable=false;await page.evaluate(()=>window.dispatchEvent(new Event('online')));
    await page.waitForSelector('#nota-home .bb-note-body');
    assert.equal(requests,0,'Reconnect retains the already available lesson sections');
    assert.equal(await page.locator('.nb-entry').count(),9);
    assert.equal(await editor.innerText(),'Notița mea existentă. Continui sa scriu.');
    assert.deepEqual(errors,[]);await context.close();
  });
  await test('notebook authored headings and cache updates preserve existing notes and the active cursor',async()=>{
    const {page,context,errors}=await newPage();await login(page);
    await page.evaluate(time=>{
      for(const section of ['transport','membrana','nucleu','organite','home'])BBUserStorage.set('note:3:'+section,{chapter_num:3,section_id:section,body:'Idei '+section,created_at:time,updated_at:time});
    },time);await synced(page);
    await page.route('**/celula_si_fiziologia_celulara.html',route=>route.fulfill({status:503,body:'Unavailable'}));
    await page.goto(base+'notite.html?capitol=3');await page.waitForSelector('.nb-entry');
    const initial=await page.locator('.nb-entry').evaluateAll(nodes=>nodes.map(n=>n.dataset.section));
    const authored=['home','introducere','structura','membrana','transport','nucleu','organite','energie','recapitulare'];
    assert.deepEqual(initial,authored,'Saved notes immediately use the authored section order');
    const editor=page.locator('#nota-membrana .bb-note-body');await editor.fill('Scriu chiar acum.');await page.keyboard.press('End');
    await page.evaluate(()=>document.dispatchEvent(new CustomEvent('bb:cache-change',{detail:{reason:'external'}})));
    assert.equal(await editor.evaluate(n=>n===document.activeElement&&n.contains(getSelection().anchorNode)),true,'Cache updates must not detach the active caret');
    await page.keyboard.type(' Continui.');assert.equal(await editor.innerText(),'Scriu chiar acum. Continui.');
    assert.deepEqual(errors,[]);await context.close();
  });
  await test('notebook movable objects wrap text and keep their section after reload',async()=>{
    const {page,context,errors}=await newPage({entry:'notite.html?capitol=3'});await login(page);
    await page.waitForFunction(()=>document.querySelector('#notebooks')?.dataset.sectionsReady==='true');
    const source=page.locator('#nota-membrana .bb-note-body'),destination=page.locator('#nota-transport .bb-note-body');
    await source.fill('Text înainte.\n'+('Membrana celulară delimitează celula și permite schimburile. '.repeat(35)));
    await source.evaluate(node=>{node.focus();const range=document.createRange();range.setStart(node.firstChild,13);range.collapse(true);getSelection().removeAllRanges();getSelection().addRange(range);});
    await page.getByRole('button',{name:'Adaugă sticky note',exact:true}).click();
    assert.equal(await page.locator('.bb-sticky-palette:visible').count(),1,'Adding a sticky opens a temporary color picker');
    await page.getByRole('button',{name:'Sticky note roz',exact:true}).click();
    assert.equal(await page.locator('.bb-sticky-palette:visible').count(),0,'Choosing a color dismisses the palette');
    await source.locator('.bb-sticky-text').fill('Idee de reținut');
    assert.equal(await source.locator('[data-bb-sticky]').evaluate(node=>getComputedStyle(node).float),'right');
    assert.ok(await source.evaluate(node=>node.innerText.indexOf('Idee de reținut')<node.innerText.lastIndexOf('Membrana celulară')),'Object is inserted at the cursor, not appended');
    await source.locator('[data-bb-sticky]').getByRole('button',{name:'Mută obiectul',exact:true}).click();
    await source.locator('.bb-object-destination').selectOption('transport');
    await source.getByRole('button',{name:'Mută în secțiune',exact:true}).click();
    assert.equal(await source.locator('[data-bb-sticky]').count(),0);assert.equal(await destination.locator('[data-bb-sticky="rose"]').count(),1);
    await synced(page);await page.reload();await page.waitForSelector('#nota-transport [data-bb-sticky]');
    assert.equal(await destination.locator('.bb-sticky-text').innerText(),'Idee de reținut');
    await destination.locator('[data-bb-sticky]').getByRole('button',{name:'Mută obiectul',exact:true}).click();
    await destination.getByRole('button',{name:'Pe rând separat',exact:true}).click();
    assert.equal(await destination.locator('[data-bb-sticky]').evaluate(node=>getComputedStyle(node).float),'none');
    for(const entry of ['notite.html?capitol=3','celula_si_fiziologia_celulara.html#membrana']){
      await page.setViewportSize({width:320,height:900});await page.goto(base+entry);await synced(page);
      if(entry.startsWith('celula'))await page.locator('#bb-notes-toggle').click();else await page.locator('#nota-home .bb-note-body').focus();
      await page.getByRole('button',{name:'Adaugă sticky note',exact:true}).click();
      const palette=await page.locator('.bb-sticky-palette:visible').boundingBox();assert.ok(palette.x>=0&&palette.x+palette.width<=320,'Sticky colors fit the phone: '+JSON.stringify(palette));
      await page.getByRole('button',{name:'Sticky note galben',exact:true}).click();assert.equal(await page.locator('.bb-sticky-palette:visible').count(),0);
      await page.locator('.bb-object-selected .bb-sticky-color').click();const colors=await page.locator('.bb-sticky-palette:visible').boundingBox();assert.ok(colors.x>=0&&colors.x+colors.width<=320,'Existing sticky colors fit the phone');
      await page.locator('.bb-object-selected .bb-sticky-color').click();assert.equal(await page.locator('.bb-sticky-palette:visible').count(),0);
    }
    assert.deepEqual(errors,[]);await context.close();
  });
  await test('notebook drag, touch, geometry and transfer limits preserve note contents',async()=>{
    const {page,context,errors}=await newPage({mobile:true,entry:'notite.html?capitol=3'});await login(page);await page.setViewportSize({width:1440,height:1200});
    await page.waitForFunction(()=>document.querySelector('#notebooks')?.dataset.sectionsReady==='true');
    await page.evaluate(time=>{
      const set=(section,body)=>BBUserStorage.set('note:3:'+section,{chapter_num:3,section_id:section,body,created_at:time,updated_at:time});
      set('home','<!--bb-note-rich:v1--><aside data-bb-sticky="sage" data-bb-align="right"><div class="bb-sticky-text">De repetat: structura membranei și rolul proteinelor.</div></aside><p>'+('În caiet leg ideile principale de exemple și de întrebările mele. '.repeat(22))+'</p><p>Ultimul paragraf rămâne sub obiect.</p>');
      set('introducere','Notița de la introducere.');
      set('transport','x'.repeat(19980));
    },time);
    const source=page.locator('#nota-home .bb-note-body'),object=source.locator('[data-bb-sticky]');
    await object.getByRole('button',{name:'Mută obiectul',exact:true}).click();
    assert.equal(await object.getByRole('button',{name:'Mută mai sus',exact:true}).isDisabled(),true,'First object cannot wrap to the end when moved upward');
    await page.keyboard.press('Escape');
    const overlap=async()=>source.evaluate(host=>{
      const object=host.querySelector('[data-bb-sticky]').getBoundingClientRect();
      const walker=document.createTreeWalker(host,NodeFilter.SHOW_TEXT);let node;let overlap=false,beside=false,below=false;
      while((node=walker.nextNode())){if(node.parentElement.closest('[data-bb-sticky]')||!node.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(node);for(const rect of range.getClientRects()){
        if(rect.width<1)continue;const vertical=rect.top<object.bottom-1&&rect.bottom>object.top+1;
        if(vertical&&rect.left<object.right-1&&rect.right>object.left+1)overlap=true;
        if(vertical&&(rect.right<=object.left+1||rect.left>=object.right-1))beside=true;
        if(rect.top>=object.bottom-1)below=true;
      }}return {overlap,beside,below};
    });
    assert.deepEqual(await overlap(),{overlap:false,beside:true,below:true});
    await object.hover();const handle=object.getByRole('button',{name:'Mută obiectul',exact:true});const start=await handle.boundingBox(),target=await source.boundingBox();
    await page.mouse.move(start.x+20,start.y+20);await page.mouse.down();await page.mouse.move(target.x+12,target.y+20,{steps:12});await page.waitForSelector('.bb-object-drop-preview:not([hidden])');await page.mouse.up();
    assert.equal(await object.getAttribute('data-bb-align'),'left');assert.deepEqual(await overlap(),{overlap:false,beside:true,below:true});
    await handle.click();await source.locator('.bb-object-destination').selectOption('transport');await source.getByRole('button',{name:'Mută în secțiune',exact:true}).click();
    assert.equal(await object.count(),1,'A full destination never removes the original');assert.equal(await page.locator('#nota-transport [data-bb-sticky]').count(),0);
    await page.keyboard.press('Escape');
    // A real touch drag uses the same handle and must not select or rewrite text.
    await page.setViewportSize({width:390,height:844});await object.scrollIntoViewIfNeeded();
    const touch=await handle.boundingBox(),box=await source.boundingBox();const cdp=await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:touch.x+20,y:touch.y+20}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width-15,y:touch.y+35}]});
    await page.waitForSelector('.bb-object-drop-preview:not([hidden])');await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert.equal(await object.getAttribute('data-bb-align'),'right');assert.equal(await object.evaluate(n=>getComputedStyle(n).float),'none');
    await synced(page);await page.reload();await page.waitForSelector('#nota-home [data-bb-sticky]');
    assert.equal(await object.getAttribute('data-bb-align'),'right');assert.match(await source.innerText(),/Ultimul paragraf/);
    for(const width of [1440,768,390,320]){
      await page.setViewportSize({width,height:1000});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:resolve(output,'notebook-flow-'+width+'.png')});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      assert.equal((await overlap()).overlap,false);
    }
    const malicious=await page.evaluate(()=>BBNotesContent.clean('<aside data-bb-sticky="rose" data-bb-align="absolute" style="position:absolute;left:0"><div class="bb-sticky-text" onclick="alert(1)">Sigur</div></aside>'));
    assert.ok(!/absolute|onclick|style=/.test(malicious));
    assert.deepEqual(errors,[]);await context.close();
  });
  async function imageNotebook(mobile=false) {
    const setup=await newPage({mobile,entry:'notite.html?capitol=3'}),{page}=setup;
    await login(page);await page.waitForFunction(()=>document.querySelector('#notebooks')?.dataset.sectionsReady==='true');
    const source=page.locator('#nota-home .bb-note-body');await source.fill('Textul și descrierea trebuie păstrate.');
    const bytes=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=600;canvas.height=300;const c=canvas.getContext('2d');c.fillStyle='#dce9ef';c.fillRect(0,0,600,300);c.fillStyle='#345742';c.font='28px sans-serif';c.fillText('Schiță de studiu',30,150);return canvas.toDataURL('image/png').split(',')[1];});
    await page.locator('.bb-note-image-input').setInputFiles({name:'schema.png',mimeType:'image/png',buffer:Buffer.from(bytes,'base64')});
    await page.waitForFunction(()=>document.querySelector('#nota-home figure img')?.naturalWidth>0);
    await source.locator('figcaption').fill('Descriere păstrată.');
    return {...setup,source,figure:source.locator('figure')};
  }
  await test('notebook Add image accepts any image format the browser can decode',async()=>{
    const {page,context,errors}=await newPage({entry:'notite.html?capitol=3'});
    await login(page);await page.waitForFunction(()=>document.querySelector('#notebooks')?.dataset.sectionsReady==='true');
    await page.locator('#nota-home .bb-note-body').focus();
    const chooserPromise=page.waitForEvent('filechooser');
    await page.getByRole('button',{name:'Adaugă imagine',exact:true}).click();
    const chooser=await chooserPromise;
    await chooser.setFiles({name:'schema.gif',mimeType:'image/gif',buffer:Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==','base64')});
    await page.waitForFunction(()=>document.querySelector('#nota-home figure img')?.naturalWidth>0);
    assert.equal(await page.locator('#nota-home figure[data-bb-image]').count(),1);
    assert.equal(await page.locator('.bb-note-image-input').getAttribute('accept'),'image/*');
    assert.deepEqual(errors,[]);await context.close();
  });
  await test('notebook Add image falls back when createImageBitmap is unavailable',async()=>{
    const {page,context,errors}=await newPage({entry:'notite.html?capitol=3'});
    await login(page);await page.waitForFunction(()=>document.querySelector('#notebooks')?.dataset.sectionsReady==='true');
    await page.evaluate(()=>{window.createImageBitmap=undefined;});
    await page.locator('#nota-home .bb-note-body').focus();
    const bytes=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=32;canvas.height=16;const c=canvas.getContext('2d');c.fillStyle='#345742';c.fillRect(0,0,32,16);return canvas.toDataURL('image/png').split(',')[1];});
    const chooserPromise=page.waitForEvent('filechooser');
    await page.getByRole('button',{name:'Adaugă imagine',exact:true}).click();
    const chooser=await chooserPromise;
    await chooser.setFiles({name:'schema.png',mimeType:'image/png',buffer:Buffer.from(bytes,'base64')});
    await page.waitForFunction(()=>document.querySelector('#nota-home figure img')?.naturalWidth>0);
    assert.equal(await page.locator('#nota-home figure[data-bb-image]').count(),1);
    assert.deepEqual(errors,[]);await context.close();
  });
  await test('notebook image stays in place during mouse drags and allows touch scrolling',async()=>{
    const {page,context,errors,source,figure}=await imageNotebook(true);
    await page.setViewportSize({width:1440,height:1200});await figure.scrollIntoViewIfNeeded();
    assert.equal(await figure.locator('.bb-object-move,.bb-object-menu,.bb-object-destination,.bb-object-transfer').count(),0,'Images have no movement handle or menu');
    const id=await figure.getAttribute('data-bb-image'),body=await page.evaluate(()=>BBUserStorage.get('note:3:home').body);
    const destination=page.locator('#nota-introducere .bb-note-body');
    for(const target of [source,destination]) {
      const start=await figure.locator('img').boundingBox(),end=await target.boundingBox();
      await page.mouse.move(start.x+start.width/2,start.y+start.height/2);await page.mouse.down();
      await page.mouse.move(end.x+30,end.y+30,{steps:12});await page.mouse.up();
      assert.equal(await source.locator('figure').getAttribute('data-bb-image'),id,'Dragging image pixels leaves the image in its original section');
      assert.equal(await figure.getAttribute('data-bb-align'),'right');
      assert.equal(await destination.locator('figure').count(),0);
      assert.equal(await page.locator('.bb-object-drop-preview').count(),0);
      assert.equal(await page.evaluate(()=>BBUserStorage.get('note:3:home').body),body,'Dragging does not rewrite the note');
    }
    assert.equal(await figure.locator('img').evaluate(node=>!node.dispatchEvent(new DragEvent('dragstart',{bubbles:true,cancelable:true}))),true,'Native image dragging is cancelled');
    await page.setViewportSize({width:390,height:844});await figure.scrollIntoViewIfNeeded();
    assert.equal(await figure.locator('img').evaluate(node=>getComputedStyle(node).touchAction),'auto','Image pixels permit native touch scrolling');
    const image=await figure.locator('img').boundingBox(),scrollBefore=await page.evaluate(()=>scrollY);
    const cdp=await context.newCDPSession(page),x=image.x+image.width/2,y=image.y+image.height/2;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    for(let step=1;step<=4;step++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-step*30}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await page.waitForFunction(before=>scrollY>before+20,scrollBefore);
    assert.equal(await figure.getAttribute('data-bb-image'),id);
    assert.equal(await figure.getAttribute('data-bb-align'),'right');
    assert.equal(await page.locator('.bb-object-drop-preview').count(),0);
    await synced(page);await page.reload();await figure.locator('img').waitFor();
    assert.equal(await figure.getAttribute('data-bb-image'),id);
    assert.equal(await figure.locator('figcaption').innerText(),'Descriere păstrată.');
    await figure.scrollIntoViewIfNeeded();await page.screenshot({path:resolve(output,'notebook-image-fixed-mobile.png')});
    assert.deepEqual(errors,[]);await context.close();
  });
  await test('notebook image resizing keeps proportions and saved width on desktop and touch',async()=>{
    const {page,context,errors,figure}=await imageNotebook(true);
    await page.setViewportSize({width:1440,height:1100});await figure.scrollIntoViewIfNeeded();await figure.click();
    const resize=figure.getByRole('slider',{name:'Dimensiunea imaginii',exact:true});
    assert.equal(await resize.count(),1,'The selected image has an accessible resize control');
    const original=await figure.locator('img').boundingBox(),handle=await resize.boundingBox();
    // Right-aligned images grow toward the left; resize from their exposed corner.
    await page.mouse.move(handle.x+22,handle.y+22);await page.mouse.down();
    await page.mouse.move(handle.x-78,handle.y+72,{steps:10});await page.mouse.up();
    let sized=await figure.locator('img').boundingBox();
    assert.ok(sized.width>original.width+80,'The corner enlarges the image');
    assert.ok(Math.abs(sized.width/sized.height-2)<.02,'Image proportions remain unchanged');
    await synced(page);await page.reload();await figure.locator('img').waitFor();
    assert.ok(Math.abs((await figure.locator('img').boundingBox()).width-sized.width)<2,'Width survives a reload');
    await resize.focus();await page.keyboard.press('ArrowLeft');
    assert.ok((await figure.locator('img').boundingBox()).width<sized.width,'Keyboard can reduce the size');
    const saved=await page.evaluate(()=>BBUserStorage.get('note:3:home').body);
    assert.match(saved,/data-bb-width="\d+"/,'Resized width is saved with the image');
    assert.equal(await figure.getAttribute('data-bb-align'),'right','Resizing preserves existing placement');
    await page.setViewportSize({width:390,height:844});await figure.scrollIntoViewIfNeeded();
    const mobileBefore=await figure.locator('img').boundingBox(),touch=await figure.getByRole('slider').boundingBox();
    const cdp=await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:touch.x+22,y:touch.y+22}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:touch.x-48,y:touch.y-13}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert.ok((await figure.locator('img').boundingBox()).width<mobileBefore.width-50,'Touch resizes without scrolling the page');
    assert.equal(await figure.locator('figcaption').innerText(),'Descriere păstrată.');
    for(const width of [390,320,1440]) {
      await page.setViewportSize({width,height:900});await figure.scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.screenshot({path:resolve(output,'notebook-image-resize-'+width+'.png')});
    }
    const smallHandle=figure.getByRole('slider');await smallHandle.focus();await page.keyboard.press('Home');
    assert.equal(await smallHandle.evaluate(node=>{const r=node.getBoundingClientRect();return node.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),true,'A small image keeps its resize target accessible');
    const corner=await smallHandle.boundingBox(),small=await figure.locator('img').boundingBox();
    await page.mouse.move(corner.x+22,corner.y+22);await page.mouse.down();
    await page.mouse.move(corner.x-38,corner.y+52,{steps:8});await page.mouse.up();
    assert.ok((await figure.locator('img').boundingBox()).width>small.width+45,'A small image can be enlarged again from its corner');
    assert.deepEqual(errors,[]);await context.close();
  });
  await test('notebook image saved placement, private reference and dimensions survive reopening',async()=>{
    const {page,context,errors,source,figure}=await imageNotebook();
    const id=await figure.getAttribute('data-bb-image');
    for(const align of ['left','right','block']) {
      await page.evaluate(align=>{
        const row=BBUserStorage.get('note:3:home');
        row.body=row.body.replace(/data-bb-align="[^"]+"/,'data-bb-align="'+align+'"');
        row.body=row.body.replace(/ data-bb-width="[^"]+"/g,'').replace('<figure ','<figure data-bb-width="240" ');
        BBUserStorage.set('note:3:home',row);
      },align);
      await synced(page);await page.reload();await figure.locator('img').waitFor();
      assert.equal(await figure.getAttribute('data-bb-image'),id,'Previously saved images retain their private reference');
      assert.equal(await figure.getAttribute('data-bb-align'),align,'Previously saved placement is retained');
      assert.equal(await figure.getAttribute('data-bb-width'),'240','Previously saved dimensions are retained');
      assert.equal(await figure.locator('figcaption').innerText(),'Descriere păstrată.');
      assert.equal(await figure.locator('.bb-object-move,.bb-object-menu').count(),0);
      assert.ok(Math.abs((await figure.locator('img').boundingBox()).width-240)<2);
    }
    await figure.locator('figcaption').fill('Descriere editată.');await synced(page);await page.reload();await figure.locator('img').waitFor();
    assert.equal(await figure.locator('figcaption').innerText(),'Descriere editată.','Captions remain editable');
    await figure.hover();await figure.getByRole('button',{name:'Elimină imaginea',exact:true}).click();
    await synced(page);await page.reload();await source.waitFor();
    assert.equal(await source.locator('figure').count(),0,'Image deletion is still saved');
    assert.match(await source.innerText(),/Textul și descrierea trebuie păstrate/);
    assert.deepEqual(errors,[]);await context.close();
  });
  await test('notebooks show complete chapters, safe formatting and private live updates',async()=>{
    const {page,context,errors}=await newPage();
    const homeLink=page.locator('.lab-topbar-actions a#bb-notes-toggle');
    assert.equal(await homeLink.getAttribute('href'),'notite.html');
    await homeLink.click();await page.locator('.nb-guest button').click();
    await page.waitForSelector('#bb-auth-email');await page.keyboard.press('Escape');await login(page);
    const ending='Ultima idee din notița completă.';
    await page.evaluate(({time,ending})=>{
      const note=(chapter,section,body)=>BBUserStorage.set('note:'+chapter+':'+section,{chapter_num:chapter,section_id:section,body,created_at:time,updated_at:time});
      note(3,'membrana','<!--bb-note-rich:v1--><p><b>Membrana plasmatică</b></p><p><span style="background-color:#fff0a3;color:#2459a6">Transportul prin membrană</span></p><img src=x onerror="window.noteLeak=true"><script>window.noteLeak=true</script>');
      note(3,'introducere','Celula este unitatea structurală și funcțională.\n'+('Text complet, fără trunchiere. '.repeat(100))+ending);
      note(1,'introducere','<b>Text simplu, păstrat literal.</b>');
      note(3,'home','<!--bb-note-rich:v1--><p><br></p>');
    },{time,ending});await synced(page);
    assert.equal(await page.locator('.nb-cover').count(),await page.evaluate(()=>CHAPTERS.filter(c=>c.done&&c.url).length));
    assert.match(await page.locator('.nb-cover[data-chapter="3"]').innerText(),/2 notițe/);
    await page.locator('.nb-cover[data-chapter="3"]').focus();await page.keyboard.press('Enter');
    await page.waitForFunction(()=>document.querySelector('#notebooks')?.dataset.sectionsReady==='true');
    assert.match(page.url(),/notite.html\?capitol=3$/);
    assert.equal(await page.locator('.nb-entry').count(),9);
    assert.ok((await page.locator('.nb-paper').innerText()).includes(ending));
    assert.equal(await page.locator('.nb-entry').first().getAttribute('data-section'),'home');
    assert.equal(await page.locator('.nb-entry .bb-note-body b').innerText(),'Membrana plasmatică');
    assert.equal(await page.locator('.nb-entry .bb-note-body img,.nb-entry .bb-note-body script').count(),0);
    assert.equal(await page.evaluate(()=>window.noteLeak),undefined);
    assert.equal(await page.locator('.nb-entry .bb-note-body span').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(255, 240, 163)');
    assert.equal(await page.locator('.nb-entry .bb-note-body span').evaluate(n=>getComputedStyle(n).color),'rgb(36, 89, 166)');
    assert.equal(await page.locator('.nb-entry[data-section="membrana"] .nb-lesson-link').count(),0,'Notebook sections omit redundant lesson links');
    await page.locator('.nb-toc summary').click();await page.locator('.nb-toc a[href="#nota-membrana"]').click();assert.match(page.url(),/#nota-membrana$/);
    await page.reload();await page.waitForSelector('#nota-membrana');
    await page.waitForFunction(()=>document.querySelector('#notebooks')?.dataset.sectionsReady==='true');
    const anchorPosition=await page.locator('#nota-membrana').evaluate(n=>({scroll:scrollY,top:n.getBoundingClientRect().top,bottom:n.getBoundingClientRect().bottom,height:innerHeight}));
    assert.ok(anchorPosition.scroll>0&&anchorPosition.top>=0&&anchorPosition.bottom<=anchorPosition.height,'Direct section anchor scrolls after async rendering: '+JSON.stringify(anchorPosition));
    await page.locator('.nb-back').click();await page.waitForSelector('.nb-cover');
    await page.goBack();await page.waitForSelector('#nota-membrana');await page.goForward();await page.waitForSelector('.nb-cover');
    await page.locator('.nb-cover[data-chapter="1"]').click();await page.waitForSelector('.nb-entry .bb-note-body');
    assert.equal(await page.locator('#nota-introducere .bb-note-body').innerText(),'<b>Text simplu, păstrat literal.</b>');
    assert.equal(await page.locator('.nb-entry .bb-note-body b').count(),0);
    await page.locator('.nb-back').click();await page.locator('.nb-cover[data-chapter="6"]').click();await page.waitForSelector('.nb-entry .bb-note-body');
    assert.ok(await page.locator('.nb-toc').count());
    await page.goto(base+'notite.html?capitol=3');await page.waitForSelector('.nb-entry');
    await page.evaluate(()=>{const key='note:3:introducere';BBUserStorage.set(key,{...BBUserStorage.get(key),body:'Celula este unitatea structurală și funcțională a organismului.\nDe revăzut: organitele și rolul lor.'});});await synced(page);
    await page.waitForFunction(()=>!document.querySelector('.nb-paper').innerText.includes('Ultima idee'));
    for(const width of [1440,768,390,320]){
      await page.setViewportSize({width,height:900});await page.goto(base+'notite.html');await page.waitForSelector('.nb-cover');
      await page.screenshot({path:resolve(output,'notebooks-library-'+width+'.png'),fullPage:true});
      await page.screenshot({path:resolve(output,'notebooks-library-viewport-'+width+'.png')});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      const columns=await page.locator('.nb-grid').evaluate(n=>getComputedStyle(n).gridTemplateColumns.split(' ').length);
      assert.equal(columns,width>=700?2:1);
      assert.ok((await page.locator('.nb-cover').first().boundingBox()).height<=132,'Notebook library uses compact rows at '+width);
      await page.locator('.nb-cover[data-chapter="3"]').click();await page.waitForFunction(()=>document.querySelector('#notebooks')?.dataset.sectionsReady==='true');
      if(width<700){await page.locator('.nb-toc summary').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.nb-toc').getAttribute('open'),'');}
      await page.screenshot({path:resolve(output,'notebooks-reading-'+width+'.png'),fullPage:true});
      await page.screenshot({path:resolve(output,'notebooks-reading-viewport-'+width+'.png')});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if(width<=390){await page.goto(base);const nav=await page.locator('.bm-primary-nav').boundingBox(),actions=await page.locator('.lab-topbar-actions').boundingBox();assert.ok(nav.x+nav.width<=actions.x+1||actions.x+actions.width<=nav.x+1||nav.y+nav.height<=actions.y+1||actions.y+actions.height<=nav.y+1,'Mobile navigation and account actions must not overlap');}
    }
    await page.goto(base+'notite.html?capitol=3');await page.waitForSelector('.nb-entry');
    await logout(page);assert.equal(await page.locator('.nb-entry').count(),0);
    await login(page,'bogdan@example.test');assert.equal(await page.locator('.nb-entry .bb-note-body').evaluateAll(nodes=>nodes.every(n=>!n.textContent.trim())),true);
    await logout(page);await login(page);await page.waitForSelector('.nb-entry');
    await page.evaluate(()=>__mock.offline(true));await page.route('**/celula_si_fiziologia_celulara.html',route=>route.abort());await page.reload();await page.waitForSelector('.nb-entry');
    assert.equal(await page.locator('.nb-entry').count(),9,'All sections, including empty ones, remain writable when the lesson request is blocked');
    assert.equal(await page.locator('#nota-membrana .bb-note-body b').innerText(),'Membrana plasmatică','Existing formatted notes remain intact');
    await page.goto(base+'notite.html?capitol=999');await page.waitForSelector('.nb-cover');
    await page.evaluate(()=>localStorage.setItem('darkMode','true'));await page.reload();await page.waitForSelector('.nb-cover');
    assert.equal(await page.locator('body').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(245, 247, 245)');
    assert.equal(await page.locator('.nb-cover').first().evaluate(n=>getComputedStyle(n).transitionDuration),'0s');
    await page.goto(base+'notite.html?capitol=3');await page.waitForSelector('.nb-paper');
    await page.emulateMedia({media:'print'});assert.equal(await page.locator('.nb-toc').isVisible(),false);assert.equal(await page.locator('.nb-paper').isVisible(),true);
    await page.emulateMedia({media:'screen'});
    await page.goto(base+'notite.html?capitol=6#nota-noua');await page.waitForSelector('.nb-entry .bb-note-body');
    await page.evaluate(time=>BBUserStorage.set('note:6:noua',{chapter_num:6,section_id:'noua',body:'Notiță sosită după deschiderea linkului. '.repeat(100),created_at:time,updated_at:time}),time);
    await page.waitForSelector('#nota-noua');await page.waitForFunction(()=>scrollY>50);
    assert.deepEqual(errors,[]);await context.close();
  });
  await test('notebooks retain private notes without redundant links offline under the Pages subpath',async()=>{
    const {page,context,errors}=await newPage({serviceWorkers:'allow',entry:'notite.html'});await login(page);
    await page.evaluate(time=>BBUserStorage.set('note:3:membrana',{chapter_num:3,section_id:'membrana',body:'Notiță disponibilă offline.',created_at:time,updated_at:time}),time);await synced(page);
    await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();
    assert.equal(await page.evaluate(()=>!!navigator.serviceWorker.controller),true);
    await page.evaluate(()=>__mock.offline(true));await context.setOffline(true);
    await page.goto(base+'notite.html?capitol=3#nota-membrana');await page.waitForSelector('.nb-entry .bb-note-body');
    await page.waitForFunction(()=>document.querySelector('#notebooks')?.dataset.sectionsReady==='true');
    assert.equal(await page.locator('#nota-membrana .bb-note-body').innerText(),'Notiță disponibilă offline.');
    assert.equal(await page.locator('#nota-membrana h2').innerText(),'Membrana plasmatică');
    assert.equal(await page.locator('#nota-membrana .nb-lesson-link').count(),0);
    assert.deepEqual(errors,[]);await context.close();
  });
  await test('notebook actionable statuses stay out of print',async()=>{
    const {page,context,errors}=await newPage({entry:'notite.html?capitol=3'});await login(page);
    await page.waitForFunction(()=>document.querySelector('#notebooks')?.dataset.sectionsReady==='true');
    await page.evaluate(()=>{__mock.offline(true);window.dispatchEvent(new Event('offline'));});
    const status=page.locator('#bb-note-3-home-status');
    await page.waitForFunction(()=>document.querySelector('#bb-note-3-home-status')?.textContent.trim().length>0);
    await page.emulateMedia({media:'print'});
    assert.equal(await status.evaluate(node=>getComputedStyle(node).display),'none','Editor status messages do not repeat under notebook sections in print');
    assert.deepEqual(errors,[]);await context.close();
  });
  await test('notebook editing shares lesson text, images and sticky notes',async()=>{
    const {page,context,errors}=await newPage();await login(page);
    await page.goto(base+'notite.html?capitol=3');await page.waitForSelector('#nota-membrana .bb-note-body');
    const editor=page.locator('#bb-note-body,#nota-membrana .bb-note-body');await editor.fill('Text scris în caiet.');
    await page.getByRole('button',{name:'Adaugă sticky note',exact:true}).click();
    await page.getByRole('button',{name:'Sticky note roz',exact:true}).click();
    await editor.locator('[data-bb-sticky] .bb-sticky-text').fill('De reținut: transportul activ.');
    const bytes=await page.evaluate(async()=>{const canvas=document.createElement('canvas');canvas.width=600;canvas.height=360;const c=canvas.getContext('2d');c.fillStyle='#d5e6d6';c.fillRect(0,0,600,360);c.fillStyle='#294d3d';c.font='30px sans-serif';c.fillText('Membrana celulară',50,180);return canvas.toDataURL('image/png').split(',')[1];});
    await page.locator('.bb-note-image-input').setInputFiles({name:'membrana.png',mimeType:'image/png',buffer:Buffer.from(bytes,'base64')});
    await editor.locator('figure img').waitFor();await page.waitForFunction(()=>document.querySelector('.bb-note-body figure img')?.naturalWidth>0);await synced(page);
    const body=await page.evaluate(()=>BBUserStorage.get('note:3:membrana').body);assert.match(body,/data-bb-image=/);assert.match(body,/data-bb-sticky="rose"/);assert.ok(!body.includes('blob:')&&!body.includes('data:image'));
    await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:resolve(output,'notebook-editing-desktop.png'),fullPage:true});
    await page.waitForSelector('.nb-entry figure img');
    await page.goto(base+'celula_si_fiziologia_celulara.html#membrana');await page.evaluate(()=>BBAuth.ready);await synced(page);await page.locator('#bb-notes-toggle').click();
    assert.match(await editor.innerText(),/Text scris în caiet/);assert.match(await editor.innerText(),/De reținut/);await page.waitForFunction(()=>document.querySelector('.bb-note-body figure img')?.naturalWidth>0);
    await editor.locator('.bb-sticky-text').fill('Modificat din lecție.');await synced(page);
    await page.screenshot({path:resolve(output,'lesson-writing-desktop.png')});await page.setViewportSize({width:390,height:844});await page.screenshot({path:resolve(output,'lesson-writing-390.png')});await page.setViewportSize({width:1440,height:900});
    await page.goto(base+'notite.html?capitol=3');await page.waitForSelector('.nb-entry');assert.match(await page.locator('#nota-membrana').innerText(),/Modificat din lecție/);
    await editor.focus();
    for(const width of [768,390,320]){await page.setViewportSize({width,height:900});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:resolve(output,'notebook-editing-'+width+'.png'),fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
    await page.locator('.bb-note-image-input').setInputFiles({name:'bad.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg/>')});assert.match(await page.locator('#bb-note-3-membrana-status').innerText(),/fotografie|raster/i);
    await page.evaluate(()=>__mock.offline(true));
    await page.locator('.bb-note-image-input').setInputFiles({name:'offline.png',mimeType:'image/png',buffer:Buffer.from(bytes,'base64')});
    await page.waitForFunction(()=>document.querySelectorAll('.bb-note-body figure img').length===2);await page.reload();
    await page.waitForFunction(()=>document.querySelectorAll('.nb-entry figure img').length===2);
    await page.evaluate(()=>{__mock.failNext('upload','note-images');__mock.offline(false);});
    await page.waitForFunction(()=>BBCloudSync.getState().status==='error');
    assert.ok(await page.evaluate(()=>BBUserStorage.snapshot().pending['note:3:membrana']),'Failed image upload retains the note outbox');
    await page.evaluate(()=>BBCloudSync.retry());await synced(page);
    await page.evaluate(()=>new Promise((resolve,reject)=>{const r=indexedDB.deleteDatabase('bb.note-media.v1:'+BBUserStorage.owner());r.onsuccess=resolve;r.onerror=()=>reject(r.error);}));await page.reload();await page.waitForFunction(()=>document.querySelector('.nb-entry figure img')?.naturalWidth>0);
    assert.ok(await page.evaluate(()=>__mock.calls().some(c=>c.operation==='download')),'A fresh device downloads private images');
    await page.evaluate(()=>__mock.offline(true));await page.reload();await page.waitForSelector('.nb-entry figure img');await page.waitForFunction(()=>document.querySelector('.nb-entry figure img')?.naturalWidth>0);
    await page.evaluate(()=>__mock.offline(false));await synced(page);await logout(page);assert.equal(await page.locator('[data-bb-image]').count(),0);await login(page,'bogdan@example.test');assert.equal(await page.locator('[data-bb-image]').count(),0);
    await editor.focus();
    await page.evaluate(()=>{const add=BBNoteMedia.add;BBNoteMedia.add=async(...args)=>{const id=await add(...args);await new Promise(resolve=>window.releaseImage=resolve);return id;};});
    await page.locator('.bb-note-image-input').setInputFiles({name:'delayed.png',mimeType:'image/png',buffer:Buffer.from(bytes,'base64')});await page.waitForFunction(()=>!!window.releaseImage);
    await logout(page);await login(page);await page.evaluate(()=>window.releaseImage());await page.waitForTimeout(100);
    assert.equal(await page.locator('.nb-entry [data-bb-image]').count(),2,'A pending image cannot attach to the newly active account');
    assert.deepEqual(errors,[]);await context.close();
  });
  await test('notes image retries keep one recoverable error while writing',async()=>{
    const {page,context}=await newPage();await login(page);
    await page.evaluate(time=>BBUserStorage.set('note:3:membrana',{chapter_num:3,section_id:'membrana',body:'<!--bb-note-rich:v1--><figure data-bb-image="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"><figcaption>Imagine de test</figcaption></figure>',created_at:time,updated_at:time}),time);await synced(page);
    await page.goto(base+'notite.html?capitol=3');await page.waitForSelector('.bb-image-loading button');await page.locator('#nota-membrana .bb-note-body').focus();await page.waitForSelector('.bb-image-loading button');
    await page.getByRole('button',{name:'Adaugă sticky note',exact:true}).click();await page.getByRole('button',{name:'Sticky note galben',exact:true}).click();await page.waitForSelector('.bb-image-loading button');
    assert.equal(await page.locator('.bb-image-loading').count(),1);assert.equal(await page.locator('.bb-image-loading button').count(),1);
    await page.locator('.bb-image-loading button').click();await page.waitForSelector('.bb-image-loading button');assert.equal(await page.locator('.bb-image-loading').count(),1);
    await context.close();
  });
  await test('notes remain attached to two chapters and two sections during rapid navigation',async()=>{
    const {page,context,errors}=await newPage();await login(page);
    await page.goto(base+'introducere_anatomie_fiziologie.html#introducere');await page.evaluate(()=>BBAuth.ready);await synced(page);
    await page.locator('#bb-notes-toggle').click();
    assert.equal(await page.locator('#bb-note-body').evaluate(node=>node===document.activeElement),true);
    assert.equal(await page.locator('#bb-note-limit').count(),0,'Lesson notes do not show a character counter during normal editing');
    await page.locator('#bb-note-body').fill('Capitol 1, introducere: prima notiță.');
    await page.waitForFunction(()=>document.querySelector('#bb-note-status')?.textContent==='');
    await page.evaluate(()=>BBLessonNavigation.navigate('organizare'));
    await page.waitForFunction(()=>document.querySelector('#page-organizare').classList.contains('active')&&document.querySelector('#bb-note-body').innerText==='');
    await page.locator('#bb-note-body').fill('Capitol 1, organizare: a doua notiță.');
    await page.goto(base+'celula_si_fiziologia_celulara.html#introducere');await page.evaluate(()=>BBAuth.ready);await synced(page);
    await page.locator('#bb-notes-toggle').click();await page.locator('#bb-note-body').fill('Capitol 3, introducere: a treia notiță.');
    await page.evaluate(()=>BBLessonNavigation.navigate('membrana'));
    await page.waitForFunction(()=>document.querySelector('#page-membrana').classList.contains('active')&&document.querySelector('#bb-note-body').innerText==='');
    await page.locator('#bb-note-body').fill('Capitol 3, membrană: a patra notiță.');await synced(page);
    await page.screenshot({path:resolve(output,'notes-desktop.png')});
    const rows=await page.evaluate(()=>__mock.rows('notes'));
    assert.equal(rows.length,4);
    assert.equal(rows.find(row=>row.chapter_num===1&&row.section_id==='introducere').body,'Capitol 1, introducere: prima notiță.');
    assert.equal(rows.find(row=>row.chapter_num===1&&row.section_id==='organizare').body,'Capitol 1, organizare: a doua notiță.');
    assert.equal(rows.find(row=>row.chapter_num===3&&row.section_id==='introducere').body,'Capitol 3, introducere: a treia notiță.');
    assert.equal(rows.find(row=>row.chapter_num===3&&row.section_id==='membrana').body,'Capitol 3, membrană: a patra notiță.');
    assert.equal(await page.locator('#bb-note-status').textContent(),'','Routine save confirmation stays out of the editor');
    await page.keyboard.press('Escape');assert.equal(await page.locator('#bb-notes-panel').evaluate(node=>node.open),false);
    assert.equal(await page.locator('#bb-notes-toggle').evaluate(node=>node===document.activeElement),true);
    await page.reload();await page.evaluate(()=>BBAuth.ready);await synced(page);await page.locator('#bb-notes-toggle').click();
    assert.equal(await page.locator('#bb-note-body').innerText(),'Capitol 3, membrană: a patra notiță.');
    await page.evaluate(()=>__mock.offline(true));await page.locator('#bb-note-body').fill('Ciornă offline păstrată.');
    assert.match(await page.locator('#bb-note-status').textContent(),/dispozitiv|local/i);
    await page.evaluate(()=>__mock.offline(false));await synced(page);
    assert.equal(await page.evaluate(()=>__mock.rows('notes').find(row=>row.chapter_num===3&&row.section_id==='membrana').body),'Ciornă offline păstrată.');
    await page.goto(base+'notite.html?capitol=3');await page.waitForSelector('#nota-membrana .bb-note-body');
    assert.equal(await page.locator('.nb-lesson-link').count(),0,'Notebook sections do not duplicate lesson navigation links');
    assert.equal(await page.locator('#nota-membrana [id$="-limit"]').count(),0,'Notebook editors do not show a character counter during normal editing');
    assert.equal(await page.locator('#nota-membrana [id$="-status"]').evaluate(node=>getComputedStyle(node).display),'none','A blank notebook status does not leave routine editor microcopy or spacing');
    assert.ok(!(await page.locator('.nb-paper-heading .nb-intro').innerText()).includes('Se salvează automat'),'Notebook heading omits autosave microcopy');
    assert.equal(errors.length,0);await context.close();
  });
  await test('notes colors preserve selection, formatting, reload and safe legacy text',async()=>{
    const {page,context}=await newPage();
    await login(page);
    await page.goto(base+'introducere_anatomie_fiziologie.html'); await page.evaluate(()=>BBAuth.ready); await synced(page);
    await page.locator('#bb-notes-toggle').click();
    const editor=page.locator('#bb-note-body');
    await editor.fill('Text colorat și evidențiat.');
    async function selectText(start,end){await editor.evaluate((node,{start,end})=>{
      const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);let text=walker.nextNode();
      const range=document.createRange();range.setStart(text,start);range.setEnd(text,end);
      const selection=getSelection();selection.removeAllRanges();selection.addRange(range);
    },{start,end});}
    await selectText(0,4);
    await page.getByRole('button',{name:'Culoarea textului',exact:true}).click();
    await page.locator('#bb-note-text-colors').getByRole('button',{name:'Roșu',exact:true}).click();
    assert.equal(await editor.locator('span').first().evaluate(n=>getComputedStyle(n).color),'rgb(180, 35, 50)');
    await selectText(0,4);
    await page.getByRole('button',{name:'Evidențiere',exact:true}).click();
    await page.locator('#bb-note-highlights').getByRole('button',{name:'Galben',exact:true}).click();
    assert.equal(await editor.locator('span').first().evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(255, 240, 163)');
    await synced(page);
    await page.reload();await page.evaluate(()=>BBAuth.ready);await synced(page);await page.locator('#bb-notes-toggle').click();
    assert.equal(await editor.innerText(),'Text colorat și evidențiat.');
    assert.equal(await editor.locator('span').first().evaluate(n=>getComputedStyle(n).color),'rgb(180, 35, 50)');
    assert.equal(await editor.locator('span').first().evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(255, 240, 163)');
    await page.getByRole('button',{name:'Evidențiere',exact:true}).click();
    await page.screenshot({path:resolve(output,'notes-colors-desktop.png')});
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:resolve(output,'notes-colors-mobile.png')});
    assert.ok(await page.locator('.bb-notes-toolbar').evaluate(n=>n.scrollWidth<=n.clientWidth));
    await page.getByRole('button',{name:'Evidențiere',exact:true}).focus();await page.keyboard.press('Escape');
    assert.ok(await page.locator('#bb-notes-panel').evaluate(n=>n.open),'Escape closes palette first');
    assert.equal(await page.locator('#bb-note-highlights').isVisible(),false);
    await editor.fill('<img src=x onerror=alert(1)>');await synced(page);
    await page.reload();await page.evaluate(()=>BBAuth.ready);await synced(page);await page.locator('#bb-notes-toggle').click();
    assert.equal(await editor.locator('img').count(),0);
    assert.equal(await editor.innerText(),'<img src=x onerror=alert(1)>');
    await context.close();
  });
  await test('notes highlight newly selected text and keep colors with touch palettes',async()=>{
    const {page,context}=await newPage({mobile:true});await login(page);
    await page.goto(base+'introducere_anatomie_fiziologie.html');await page.evaluate(()=>BBAuth.ready);await synced(page);
    await page.locator('#bb-notes-toggle').click();const editor=page.locator('#bb-note-body');
    await editor.fill('Text pentru marcare.');
    await page.getByRole('button',{name:'Evidențiere',exact:true}).click();
    await page.locator('#bb-note-highlights').getByRole('button',{name:'Galben',exact:true}).click();
    await editor.evaluate(node=>{node.focus();const range=document.createRange();range.setStart(node.firstChild,0);range.setEnd(node.firstChild,4);getSelection().removeAllRanges();getSelection().addRange(range);node.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));});
    await page.waitForTimeout(100);
    assert.equal(await editor.evaluate(node=>[...node.querySelectorAll('span')].some(n=>n.textContent==='Text'&&getComputedStyle(n).backgroundColor==='rgb(255, 240, 163)')),true,'selecting text applies the active marker');
    await page.getByRole('button',{name:'Evidențiere',exact:true}).click();
    await page.locator('#bb-note-highlights').getByRole('button',{name:'Fără evidențiere',exact:true}).click();
    await editor.evaluate(node=>{node.focus();const range=document.createRange();range.selectNodeContents(node);getSelection().removeAllRanges();getSelection().addRange(range);node.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));});
    // Real touch input must keep the editor selection while opening the palette.
    const trigger=page.getByRole('button',{name:'Culoarea textului',exact:true});
    await trigger.tap();
    await page.locator('#bb-note-text-colors').getByRole('button',{name:'Roșu',exact:true}).tap();
    assert.equal(await editor.evaluate(node=>[...node.querySelectorAll('span')].some(n=>getComputedStyle(n).color==='rgb(180, 35, 50)')),true);
    await synced(page);await page.reload();await page.evaluate(()=>BBAuth.ready);await synced(page);await page.locator('#bb-notes-toggle').click();
    assert.equal(await editor.innerText(),'Text pentru marcare.');
    assert.ok(await editor.locator('[style]').count());await context.close();
  });
  await test('notes selection is isolated from lesson markers and stored markup is sanitized',async()=>{
    const {page,context}=await newPage();await login(page);
    await page.evaluate(()=>localStorage.setItem('highlighterMode','1'));
    for(const file of ['introducere_anatomie_fiziologie.html','sistemul_renal_complet.html','sistemul_reproducator_masculin.html']){
      await page.goto(base+file);await page.evaluate(()=>BBAuth.ready);await synced(page);await page.locator('#bb-notes-toggle').click();
      const editor=page.locator('#bb-note-body');await editor.fill('Selecția rămâne în notiță.');
      await editor.evaluate(node=>{const range=document.createRange();range.selectNodeContents(node);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);node.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));});
      await page.waitForTimeout(100);
      assert.equal(await page.evaluate(()=>getSelection().toString()),'Selecția rămâne în notiță.');
      assert.equal(await editor.locator('mark').count(),0);
    }
    await page.evaluate(()=>{
      const section=document.querySelector('.page-section.active').id.slice(5);
      const chapter=CHAPTERS.find(ch=>ch.url===location.pathname.split('/').pop());const key='note:'+chapter.num+':'+section;
      BBUserStorage.set(key,{...BBUserStorage.get(key),body:'<!--bb-note-rich:v1--><span style="color:#b42332" onclick="window.noteInjection=true">Sigur</span><img src=x onerror="window.noteInjection=true"><script>window.noteInjection=true</script>'});
      document.dispatchEvent(new CustomEvent('bb:cache-change'));
    });
    const editor=page.locator('#bb-note-body');
    assert.equal(await editor.innerText(),'Sigur');assert.equal(await editor.locator('img,script,[onclick]').count(),0);
    assert.equal(await page.evaluate(()=>window.noteInjection),undefined);
    await context.close();
  });
  await test('mobile account and notes dialogs fit, contain keyboard focus, and close with Escape',async()=>{
    const {page,context,errors}=await newPage({mobile:true});
    await page.goto(base+'sistemul_renal_complet.html');await page.evaluate(()=>BBAuth.ready);
    await page.locator('#bb-notes-toggle').click();assert.ok(await page.locator('#bb-notes-login').isVisible());
    await page.locator('#bb-notes-login').click();assert.ok(await page.locator('#bb-auth-email').isVisible());
    await page.screenshot({path:resolve(output,'account-mobile-login.png')});
    for(let i=0;i<12;i++){await page.keyboard.press('Tab');assert.ok(await page.locator('#pilot-account-panel').evaluate(node=>node.contains(document.activeElement)),'account focus stays in dialog at Tab '+i+': '+await page.evaluate(()=>document.activeElement.outerHTML.slice(0,160))); }
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#bb-notes-toggle').evaluate(node=>node===document.activeElement),true,'closing account opened from notes returns to the visible notes trigger');
    await login(page);await page.locator('#bb-notes-toggle').click();
    await page.locator('#bb-note-body').fill('Notiță mobilă, capitol renal.');await synced(page);
    for(let i=0;i<7;i++){await page.keyboard.press('Tab');assert.ok(await page.locator('#bb-notes-panel').evaluate(node=>node.contains(document.activeElement)),'notes focus stays in mobile drawer');}
    await page.screenshot({path:resolve(output,'notes-mobile.png')});
    assert.ok(await page.locator('#bb-notes-panel').evaluate(node=>{const r=node.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1;}));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.keyboard.press('Escape');assert.equal(await page.locator('#bb-notes-toggle').evaluate(node=>node===document.activeElement),true);
    assert.equal(errors.length,0);await context.close();
  });
  await test('imports guest lessons and all registry quiz storage keys with unchanged versions',async()=>{
    const {page,context,errors}=await newPage();
    await page.evaluate(({quizzes,state})=>{
      BBUserStorage.set('bb.study.v1',state);
      quizzes.forEach(quiz=>BBUserStorage.set(quiz.storageKey,{version:quiz.version,questions:{[quiz.questions[0].id]:{selected:['A'],verified:false,correct:false}}}));
    },{quizzes,state:study()});
    await login(page);
    const rows=await page.evaluate(()=>({study:__mock.rows('study_state'),quiz:__mock.rows('quiz_states')}));
    assert.deepEqual(rows.study[0].state,study());
    assert.deepEqual(rows.quiz.map(row=>row.quiz_key).sort(),quizzes.map(q=>q.storageKey).sort());
    for(const quiz of quizzes){const row=rows.quiz.find(row=>row.quiz_key===quiz.storageKey);assert.equal(row.version,quiz.version);assert.deepEqual(row.state.questions[quiz.questions[0].id].selected,['A']);}
    assert.equal(errors.length,0);await context.close();
  });
  await test('cloud data is primary, displaced local data is backed up, and Continue updates',async()=>{
    const {page,context}=await newPage();
    const cloud=study(3,'membrana');
    await page.evaluate(({cloud,A,time})=>{BBStudyState.completeSection(1,'organizare');__mock.seed('study_state',[{user_id:A,version:1,state:cloud,updated_at:time}]);},{cloud,A,time});
    await login(page);
    assert.deepEqual(await page.evaluate(()=>BBStudyState.getState()),cloud);
    await page.waitForFunction(()=>!document.querySelector('#lab-continue').hidden);
    assert.match(await page.locator('#lab-continue-link').getAttribute('href'),/celula_si_fiziologia_celulara.html#membrana$/);
    assert.match(JSON.stringify(await page.evaluate(()=>BBUserStorage.snapshot())),/organizare/,'guest progress remains in backup');
    await page.evaluate(()=>{BBStudyState.completeSection(3,'nucleu');BBStudyState.recordVisit(3,'nucleu');});
    await synced(page);
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('bb.study.v1')).lastVisited.sectionId),'nucleu');
    assert.equal(await page.evaluate(()=>__mock.rows('study_state')[0].state.lastVisited.sectionId),'nucleu');
    await page.waitForFunction(()=>document.querySelector('#lab-continue-link').getAttribute('href').endsWith('#nucleu'));
    await page.evaluate(()=>BBStudyState.completeLesson(3,['membrana','nucleu','transport']));await synced(page);
    assert.equal(await page.evaluate(()=>BBStudyState.getLessonProgress(3,['membrana','nucleu','transport']).isComplete),true);
    await page.evaluate(()=>BBStudyState.resetLesson(3));await synced(page);
    assert.equal(await page.evaluate(()=>__mock.rows('study_state')[0].state.lessons['3']),undefined);
    await context.close();
  });
  await test('session refresh and two-user account switching isolate cached progress and notes',async()=>{
    const {page,context}=await newPage();
    await login(page);
    await page.evaluate(()=>{BBStudyState.completeSection(1,'organizare');BBUserStorage.set('note:1:introducere',{chapter_num:1,section_id:'introducere',body:'Ana private',created_at:new Date().toISOString(),updated_at:new Date().toISOString()});});
    await synced(page);await page.reload();await page.evaluate(()=>BBAuth.ready);await synced(page);
    assert.equal(await page.evaluate(()=>BBAuth.getState().user.id),A);
    assert.ok(await page.evaluate(()=>BBStudyState.getState().lessons['1'].completedSections.includes('organizare')));
    await logout(page);
    assert.equal(await page.evaluate(()=>BBUserStorage.get('note:1:introducere')),null);
    assert.doesNotMatch(JSON.stringify(await page.evaluate(()=>BBStudyState.getState())),/organizare/);
    await login(page,'bogdan@example.test');
    assert.equal(await page.evaluate(()=>BBAuth.getState().user.id),B);
    assert.doesNotMatch(JSON.stringify(await page.evaluate(()=>BBUserStorage.snapshot())),/Ana private/);
    assert.equal(await page.evaluate(()=>BBUserStorage.get('note:1:introducere')),null);
    assert.doesNotMatch(JSON.stringify(await page.evaluate(()=>BBStudyState.getState())),/organizare/);
    await page.evaluate(()=>BBStudyState.completeSection(3,'membrana'));await synced(page);
    await logout(page);await login(page);
    assert.equal(await page.evaluate(()=>BBUserStorage.get('note:1:introducere').body),'Ana private');
    assert.doesNotMatch(JSON.stringify(await page.evaluate(()=>BBStudyState.getState())),/membrana/);
    await context.close();
  });
  await test('same-user reload in a second tab does not erase the first tab cache',async()=>{
    const {page,context}=await newPage();await login(page);
    await page.evaluate(()=>BBStudyState.completeSection(1,'organizare'));await synced(page);
    const popup=page.waitForEvent('popup');await page.evaluate(()=>window.open('index.html','bb-account-test-second-tab'));
    const second=await popup;second.setDefaultTimeout(12000);await second.waitForFunction(()=>window.BBAuth);await second.evaluate(()=>BBAuth.ready);await synced(second);
    assert.equal(await second.evaluate(()=>BBAuth.getState().user.id),A);
    await second.reload();await second.evaluate(()=>BBAuth.ready);await synced(second);
    assert.equal(await page.evaluate(()=>BBUserStorage.owner()),A);
    assert.equal(await page.evaluate(()=>BBStudyState.getState().lessons['1'].completedSections.includes('organizare')),true);
    assert.equal(await second.evaluate(()=>BBStudyState.getState().lessons['1'].completedSections.includes('organizare')),true);
    await context.close();
  });
  await test('a restored session records the current deep link after hydration for Continue study',async()=>{
    const {page,context}=await newPage();await login(page);
    await page.goto(base+'introducere_anatomie_fiziologie.html#organizare');await page.evaluate(()=>BBAuth.ready);await synced(page);
    assert.equal(await page.evaluate(()=>BBStudyState.getState().lastVisited.sectionId),'organizare');
    await page.goto(base+'celula_si_fiziologia_celulara.html#membrana');await page.evaluate(()=>BBAuth.ready);await synced(page);
    assert.equal(await page.evaluate(()=>BBStudyState.getState().lastVisited.sectionId),'membrana');
    await page.goto(base);await page.evaluate(()=>BBAuth.ready);await synced(page);
    await page.waitForFunction(()=>document.querySelector('#lab-continue-link').getAttribute('href').endsWith('celula_si_fiziologia_celulara.html#membrana'));
    await context.close();
  });
  await test('debounces rapid local changes into one upsert containing the latest state',async()=>{
    const {page,context}=await newPage();await login(page);
    await page.evaluate(()=>{__mock.clearCalls();for(let i=0;i<20;i++)BBStudyState.recordVisit(1,'section-'+i);});
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('bb.study.v1')).lastVisited.sectionId),'section-19','local write is immediate');
    await synced(page);
    const writes=await page.evaluate(()=>__mock.calls().filter(call=>call.operation==='upsert'&&call.table==='study_state'));
    assert.equal(writes.length,1);assert.equal(writes[0].payload.input.state.lastVisited.sectionId,'section-19');
    assert.equal(writes[0].payload.options.onConflict,'user_id');await context.close();
  });
  await test('a slow upsert acknowledgement never discards newer local edits',async()=>{
    const {page,context}=await newPage();await login(page);
    await page.evaluate(()=>{__mock.clearCalls();__mock.delay('upsert','study_state','hold');BBStudyState.recordVisit(1,'introducere');});
    await page.waitForFunction(()=>__mock.calls().some(call=>call.operation==='upsert'&&call.table==='study_state'));
    await page.evaluate(()=>{BBStudyState.recordVisit(1,'organizare');__mock.delay('upsert','study_state',0);__mock.release();});await synced(page);
    assert.equal(await page.evaluate(()=>BBStudyState.getState().lastVisited.sectionId),'organizare');
    assert.equal(await page.evaluate(()=>__mock.rows('study_state')[0].state.lastVisited.sectionId),'organizare');
    assert.equal(await page.evaluate(()=>__mock.calls().filter(call=>call.operation==='upsert'&&call.table==='study_state').length),2);
    await context.close();
  });
  await test('offline outbox survives refresh and retries without losing unsent progress',async()=>{
    const {page,context,errors}=await newPage();await login(page);
    await page.evaluate(()=>{__mock.offline(true);BBStudyState.completeSection(1,'cavitati');});
    assert.equal(await page.evaluate(()=>BBStudyState.getState().lessons['1'].completedSections.includes('cavitati')),true);
    await page.reload();await page.evaluate(()=>BBAuth.ready);
    await page.waitForFunction(()=>BBCloudSync.getState().status==='offline');
    assert.match(JSON.stringify(await page.evaluate(()=>BBStudyState.getState())),/cavitati/);
    await page.evaluate(()=>__mock.offline(false));await synced(page);
    assert.match(JSON.stringify(await page.evaluate(()=>__mock.rows('study_state'))),/cavitati/);
    assert.equal(errors.length,0);await context.close();
  });
  await test('RLS and network failures remain recoverable and never render raw errors',async()=>{
    const {page,context,errors}=await newPage();await login(page);
    await page.evaluate(()=>{__mock.failNext('upsert','study_state','42501');BBStudyState.completeSection(1,'termeni');});
    await page.waitForFunction(()=>BBCloudSync.getState().status==='error');
    assert.match(JSON.stringify(await page.evaluate(()=>BBStudyState.getState())),/termeni/);
    assert.doesNotMatch(await page.locator('body').innerText(),/mock database detail|42501/);
    await page.evaluate(()=>BBCloudSync.retry());await synced(page);
    assert.match(JSON.stringify(await page.evaluate(()=>__mock.rows('study_state'))),/termeni/);
    await logout(page);
    await page.evaluate(()=>__mock.failNext('select','study_state','NETWORK'));
    assert.equal((await page.evaluate(()=>BBAuth.perform('login','ana@example.test','Test-password-123!'))).ok,true);
    await page.waitForFunction(()=>BBCloudSync.getState().status==='error');
    await page.evaluate(()=>BBCloudSync.retry());await synced(page);
    assert.equal(errors.length,0);await context.close();
  });
  await test('a stale hydration response cannot expose another account after switching',async()=>{
    const {page,context}=await newPage();
    await page.evaluate(({A,time})=>{__mock.seed('study_state',[{user_id:A,version:1,state:{version:1,lastVisited:null,lessons:{'1':{completedSections:['private-a'],updatedAt:time}}},updated_at:time}]);__mock.delay('select','study_state','hold');},{A,time});
    await page.evaluate(()=>BBAuth.perform('login','ana@example.test','Test-password-123!'));
    await page.waitForFunction(()=>__mock.calls().some(call=>call.operation==='select'&&call.table==='study_state'));
    await logout(page);
    await page.evaluate(()=>{__mock.delay('select','study_state',0);__mock.setUser('b');});
    assert.doesNotMatch(JSON.stringify(await page.evaluate(()=>BBStudyState.getState())),/private-a/);
    await page.evaluate(()=>__mock.release());await synced(page);
    assert.equal(await page.evaluate(()=>BBAuth.getState().user.id),B);
    assert.doesNotMatch(JSON.stringify(await page.evaluate(()=>BBStudyState.getState())),/private-a/);
    await context.close();
  });
  await test('all registered quizzes preserve exact scoring, retry, reset and reload through the adapter',async()=>{
    const {page,context,errors}=await newPage();await login(page);
    for(const quiz of quizzes){
      await page.goto(base+quiz.url+'#grila-'+quiz.questions[0].number);await page.evaluate(()=>BBAuth.ready);await synced(page);
      const question=await page.evaluate(()=>(window.BB_QUIZ||window.BB_NERVOUS_QUIZ).questions[0]);
      const card=page.locator('[data-question-id="'+question.id+'"]');
      for(const answer of question.correct)await card.locator('input[value="'+answer+'"]').check();
      await card.locator('.quiz-check').click();
      await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).questions[Object.keys(JSON.parse(localStorage.getItem(key)).questions)[0]].verified,quiz.storageKey);
      await synced(page);
      assert.equal(await page.evaluate(({key,id})=>BBUserStorage.get(key).questions[id].correct,{key:quiz.storageKey,id:question.id}),true,quiz.storageKey+' exact answer set');
      await page.reload();await page.evaluate(()=>BBAuth.ready);await synced(page);
      assert.equal(await card.evaluate(node=>node.classList.contains('is-verified')),true,quiz.storageKey+' verified state reload');
      await page.locator('.quiz-reset-start').click();
      await page.locator('.quiz-reset-confirm').click();
      await page.waitForFunction(()=>document.querySelectorAll('.quiz-question.is-verified').length===0);await synced(page);
      assert.equal(await page.evaluate(({key,id})=>Boolean(BBUserStorage.get(key).questions[id]?.verified),{key:quiz.storageKey,id:question.id}),false);
      const extra=question.options.find(option=>!question.correct.includes(option.letter));
      if(extra){
        if(question.correct.length>1)await card.locator('input[value="'+question.correct[0]+'"]').check();
        await card.locator('input[value="'+extra.letter+'"]').check();await card.locator('.quiz-check').click();
        await page.waitForFunction(({key,id})=>BBUserStorage.get(key).questions[id].verified,{key:quiz.storageKey,id:question.id});await synced(page);
        assert.equal(await page.evaluate(({key,id})=>BBUserStorage.get(key).questions[id].correct,{key:quiz.storageKey,id:question.id}),false,quiz.storageKey+' omitted/extra choice must fail exact scoring');
        assert.equal(await card.locator('.is-selected-extra').count(),1,'red selected extra choice');
        assert.ok(await card.locator('.is-missed-answer').count()>0,'yellow omitted correct choices');
        if(question.correct.length>1)assert.equal(await card.locator('.is-answer').count(),1,'green selected correct choice');
      }
      await page.locator('.quiz-reset-start').click();await page.locator('.quiz-reset-confirm').click();
      await page.waitForFunction(()=>document.querySelectorAll('.quiz-question.is-verified').length===0);await synced(page);
      assert.deepEqual(await page.evaluate(key=>BBUserStorage.get(key).questions,quiz.storageKey),{});
      assert.deepEqual(await page.evaluate(key=>__mock.rows('quiz_states').find(row=>row.quiz_key===key).state.questions,quiz.storageKey),{});
    }
    assert.equal(errors.length,0);await context.close();
  });
  await test('blocked localStorage remains usable for lessons, quiz answers, and authenticated sync in memory',async()=>{
    const {page,context,errors}=await newPage({blockedStorage:true});await login(page);
    await page.evaluate(()=>BBStudyState.completeSection(1,'introducere'));await synced(page);
    assert.match(JSON.stringify(await page.evaluate(()=>__mock.rows('study_state'))),/introducere/);
    await page.goto(base+quizzes[0].url+'#grila-'+quizzes[0].questions[0].number);await page.evaluate(()=>BBAuth.ready);await synced(page);
    const card=page.locator('.page-section.active .quiz-question').first();await card.locator('input').first().check();
    assert.deepEqual(await page.evaluate(()=>BBUserStorage.get((window.BB_QUIZ||window.BB_NERVOUS_QUIZ).storageKey).questions[(window.BB_QUIZ||window.BB_NERVOUS_QUIZ).questions[0].id].selected),['A']);
    await synced(page);assert.equal(errors.length,0);await context.close();
  });
  console.log(`Accounts browser: ${count} scenarios passed; ${quizzes.length} registered quiz storage keys.`);
}finally{await browser.close();await new Promise(done=>server.close(done));}
