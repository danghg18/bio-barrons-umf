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
async function newPage({mock=true,blockedStorage=false,mobile=false}={}){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},serviceWorkers:'block',reducedMotion:'reduce'});
  await context.route('**/assets/js/supabase-config.js*',route=>route.fulfill({contentType:'text/javascript',body:"window.BB_SUPABASE_CONFIG = {url:'',publishableKey:''};"}));
  await context.route('https://*.supabase.co/**',route=>route.abort('blockedbyclient'));
  if(mock)await context.addInitScript({path:resolve(root,'tests/supabase-mock.js')});
  if(blockedStorage)await context.addInitScript(()=>Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('Storage blocked','SecurityError');}}));
  const page=await context.newPage();page.setDefaultTimeout(12000);const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base);await page.waitForFunction(()=>Boolean(window.BBAuth));await page.evaluate(()=>BBAuth.ready);
  return {page,context,errors};
}
try{
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
  await test('notes remain attached to two chapters and two sections during rapid navigation',async()=>{
    const {page,context,errors}=await newPage();await login(page);
    await page.goto(base+'introducere_anatomie_fiziologie.html#introducere');await page.evaluate(()=>BBAuth.ready);await synced(page);
    await page.locator('#bb-notes-toggle').click();
    assert.equal(await page.locator('#bb-note-body').evaluate(node=>node===document.activeElement),true);
    await page.locator('#bb-note-body').fill('Capitol 1, introducere: prima notiță.');
    await page.evaluate(()=>BBLessonNavigation.navigate('organizare'));
    await page.waitForFunction(()=>document.querySelector('#page-organizare').classList.contains('active')&&document.querySelector('#bb-note-body').value==='');
    await page.locator('#bb-note-body').fill('Capitol 1, organizare: a doua notiță.');
    await page.goto(base+'celula_si_fiziologia_celulara.html#introducere');await page.evaluate(()=>BBAuth.ready);await synced(page);
    await page.locator('#bb-notes-toggle').click();await page.locator('#bb-note-body').fill('Capitol 3, introducere: a treia notiță.');
    await page.evaluate(()=>BBLessonNavigation.navigate('membrana'));
    await page.waitForFunction(()=>document.querySelector('#page-membrana').classList.contains('active')&&document.querySelector('#bb-note-body').value==='');
    await page.locator('#bb-note-body').fill('Capitol 3, membrană: a patra notiță.');await synced(page);
    await page.screenshot({path:resolve(output,'notes-desktop.png')});
    const rows=await page.evaluate(()=>__mock.rows('notes'));
    assert.equal(rows.length,4);
    assert.equal(rows.find(row=>row.chapter_num===1&&row.section_id==='introducere').body,'Capitol 1, introducere: prima notiță.');
    assert.equal(rows.find(row=>row.chapter_num===1&&row.section_id==='organizare').body,'Capitol 1, organizare: a doua notiță.');
    assert.equal(rows.find(row=>row.chapter_num===3&&row.section_id==='introducere').body,'Capitol 3, introducere: a treia notiță.');
    assert.equal(rows.find(row=>row.chapter_num===3&&row.section_id==='membrana').body,'Capitol 3, membrană: a patra notiță.');
    assert.equal(await page.locator('#bb-note-status').textContent(),'Salvat');
    await page.keyboard.press('Escape');assert.equal(await page.locator('#bb-notes-panel').evaluate(node=>node.open),false);
    assert.equal(await page.locator('#bb-notes-toggle').evaluate(node=>node===document.activeElement),true);
    await page.reload();await page.evaluate(()=>BBAuth.ready);await synced(page);await page.locator('#bb-notes-toggle').click();
    assert.equal(await page.locator('#bb-note-body').inputValue(),'Capitol 3, membrană: a patra notiță.');
    await page.evaluate(()=>__mock.offline(true));await page.locator('#bb-note-body').fill('Ciornă offline păstrată.');
    assert.match(await page.locator('#bb-note-status').textContent(),/dispozitiv|local/i);
    await page.evaluate(()=>__mock.offline(false));await synced(page);
    assert.equal(await page.evaluate(()=>__mock.rows('notes').find(row=>row.chapter_num===3&&row.section_id==='membrana').body),'Ciornă offline păstrată.');
    assert.equal(errors.length,0);await context.close();
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
      assert.equal(await card.locator('.quiz-retry').isVisible(),true,quiz.storageKey+' verified state reload');
      await card.locator('.quiz-retry').click();await synced(page);
      assert.equal(await page.evaluate(({key,id})=>BBUserStorage.get(key).questions[id].verified,{key:quiz.storageKey,id:question.id}),false);
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
      await page.locator('.page-section.active .quiz-reset-start').click();await page.locator('.page-section.active .quiz-reset-confirm').click();await synced(page);
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
