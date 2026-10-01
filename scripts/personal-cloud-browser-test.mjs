import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'playwright';

const root=resolve(import.meta.dirname,'..'),prefix='/bio-barrons-umf/';
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const server=http.createServer(async(req,res)=>{
 try {const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,path.slice(prefix.length)||'index.html');
  if(!path.startsWith(prefix)||!file.startsWith(root+sep))throw Error();
  res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(await readFile(file));
 } catch {res.writeHead(404);res.end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}${prefix}`;
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
const cloud=new Map(),requests=[],clone=value=>JSON.parse(JSON.stringify(value));
for(let i=0;i<501;i++){
 const key='bb.highlight.v1:pagination-'+String(i).padStart(3,'0');
 cloud.set(A+':'+key,{user_id:A,record_key:key,payload:{version:1,id:'pagination-'+i,deleted:true},revision:1});
}
async function shared(_source,request){
 requests.push(clone(request));
 assert.ok([A,B].includes(request.owner),'Only authenticated fixture owners reach the service');
 if(request.type==='select'){
  const rows=[...cloud.values()].filter(row=>row.user_id===request.owner).sort((a,b)=>a.record_key.localeCompare(b.record_key));
  return {data:clone(rows.slice(request.first,request.last==null?undefined:request.last+1)),error:null};
 }
 if(request.p_owner!==request.owner)return {data:null,error:{code:'42501'}};
 const id=request.owner+':'+request.p_key,old=cloud.get(id);
 if((old?.revision||0)!==request.p_expected)return {data:{accepted:false,record:clone(old)},error:null};
 let payload=clone(request.p_payload);
 if(old?.payload.deleted)payload=clone(old.payload);
 if(request.p_key.startsWith('bb.simulation.v1:')&&old?.payload.status==='completed'&&!payload.deleted)for(const field of ['status','answers','result','completedAt','submissionId','questions','deadline','startedAt','scoringVersion']){if(old.payload[field]!==undefined)payload[field]=clone(old.payload[field]);}
 const record={user_id:request.owner,record_key:request.p_key,payload,revision:(old?.revision||0)+1};cloud.set(id,record);
 return {data:{accepted:true,record:clone(record)},error:null};
}
const browser=await chromium.launch();
const output=process.env.BB_PERSONAL_OUTPUT||'/tmp/bb-personal-cloud-review';await mkdir(output,{recursive:true});
const contexts=[],errors=[];
async function context(mobile){
 const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},hasTouch:mobile,isMobile:mobile,serviceWorkers:'block',reducedMotion:'reduce'});contexts.push(ctx);
 await ctx.route('**/*',route=>{const url=new URL(route.request().url());return url.origin===new URL(base).origin?route.continue():route.abort('blockedbyclient');});
 await ctx.route('**/assets/js/supabase-config.js*',route=>route.fulfill({contentType:'text/javascript',body:"window.BB_SUPABASE_CONFIG={url:'',publishableKey:''};"}));
 await ctx.exposeBinding('__sharedPersonal',shared);await ctx.addInitScript({path:resolve(root,'tests/supabase-mock.js')});
 const page=await ctx.newPage();page.setDefaultTimeout(20000);page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'testare.html');await page.waitForFunction(()=>window.BBAuth&&window.BBQuizAnalytics&&window.BBSimulationStore);await page.evaluate(()=>Promise.all([BBAuth.ready,BBQuizAnalytics.ready]));return page;
}
async function synced(page){await page.waitForFunction(()=>BBCloudSync.getState().status==='synced'&&Object.keys(BBUserStorage.snapshot().pending).length===0,null,{timeout:60000});}
async function login(page,owner='a'){assert.equal((await page.evaluate(email=>BBAuth.perform('login',email,'Test-password-123!'),owner==='a'?'ana@example.test':'bogdan@example.test')).ok,true);await synced(page);await page.evaluate(()=>BBQuizAnalytics?.ready);}
async function refresh(page){await page.evaluate(()=>BBCloudSync.retry());await synced(page);if(await page.evaluate(()=>!!window.BBQuizAnalytics))await page.evaluate(()=>BBQuizAnalytics.getReport({days:'all'}));}
async function offline(page,value){await page.evaluate(value=>__mock.offline(value),value);}
async function edit(page,id,index,selected){return page.evaluate(async({id,index,selected})=>{const run=BBSimulationStore.get(id);return BBSimulationStore.update(id,run.revision,BBUserStorage.owner(),{type:'answer',index,selected});},{id,index,selected});}
async function simulation(page,id){return page.evaluate(id=>BBSimulationStore.get(id),id);}
try{
 const desktop=await context(false),mobile=await context(true);
 // Migrate a genuinely recorded guest attempt, never a fabricated aggregate.
 const guest=await desktop.evaluate(async()=>{const q=BB_QUIZ_INDEX.find(q=>q.chapterNum===3),item=q.questions[0];await BBQuizAnalytics.recordAttempt({attemptId:'real-guest-before-login',storageKey:q.storageKey,questionId:item.id,selected:item.correct,correct:true,contentRevision:item.contentRevision||0,answerKey:item.correct});return (await BBQuizAnalytics.getReport({days:'all'})).history.find(x=>x.id==='real-guest-before-login');});
 await login(desktop);await login(mobile);
 assert.ok(requests.some(r=>r.type==='select'&&r.owner===A&&r.first===500),'The real sync fetches past the first 500 personal records');
 const migrated=await mobile.evaluate(()=>BBQuizAnalytics.getReport({days:'all'}));
 assert.equal(migrated.history.find(x=>x.id===guest.id).at,guest.at,'A real guest attempt reaches the other device with its original timestamp');
 await refresh(desktop);assert.equal((await desktop.evaluate(()=>BBQuizAnalytics.getReport({days:'all'}))).history.filter(x=>x.id===guest.id).length,1,'Migration is idempotent');
 console.log('PASS real guest history migration, two-device transfer and pagination beyond 500 rows');

 await offline(desktop,true);
 const traversal=await desktop.evaluate(async()=>{
  const q=BB_QUIZ_INDEX.find(q=>q.chapterNum===3),run=await BBQuizAnalytics.ensureRun(q.storageKey);
  for(let i=0;i<q.questions.length;i++){const item=q.questions[i];await BBQuizAnalytics.recordAttempt({attemptId:'full-'+item.id,storageKey:q.storageKey,questionId:item.id,runId:run.id,selected:i===0?[]:item.correct,correct:i!==0,contentRevision:item.contentRevision||0,answerKey:item.correct});}
  const correction=await BBQuizAnalytics.ensurePractice(q.storageKey),item=q.questions[0];
  await BBQuizAnalytics.recordAttempt({attemptId:'correction-real',storageKey:q.storageKey,questionId:item.id,runId:correction.id,selected:item.correct,correct:true,contentRevision:item.contentRevision||0,answerKey:item.correct});return {id:run.id,total:q.questions.length,correction:correction.id};
 });
 await offline(desktop,false);await synced(desktop);await refresh(mobile);
 const mirrored=await mobile.evaluate(id=>BBQuizAnalytics.getReport({days:'all'}).then(report=>report.runs.find(run=>run.id===id)),traversal.id);
 assert.equal(mirrored.correct,traversal.total-1);assert.equal(mirrored.correction.corrected,1);assert.equal(mirrored.correction.rounds[0].id,traversal.correction);
 await mobile.goto(base+'statistici.html?capitol=3');await synced(mobile);await mobile.waitForFunction(()=>document.body.dataset.analyticsReady==='true');
 assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await mobile.screenshot({path:resolve(output,'analytics-mobile.png'),fullPage:true});
 await mobile.goto(base+'testare.html');await synced(mobile);await mobile.evaluate(()=>BBQuizAnalytics.ready);
 console.log('PASS actual offline traversal and correction round synchronize without rewriting initial results');

 const run=await desktop.evaluate(()=>BBSimulationUI.start([3],60,null,BBUserStorage.owner()));
 await synced(desktop);await refresh(mobile);assert.equal((await simulation(mobile,run.id)).deadline,run.deadline,'Timed simulation deadline survives device transfer');
 await Promise.all([offline(desktop,true),offline(mobile,true)]);
 await edit(desktop,run.id,0,['A']);await edit(mobile,run.id,1,['B']);
 await offline(desktop,false);await synced(desktop);await offline(mobile,false);await synced(mobile);await refresh(desktop);
 assert.deepEqual((await simulation(desktop,run.id)).answers.slice(0,2),[['A'],['B']]);
 assert.deepEqual((await simulation(mobile,run.id)).answers.slice(0,2),[['A'],['B']]);
 await Promise.all([offline(desktop,true),offline(mobile,true)]);
 await edit(desktop,run.id,2,['A']);await edit(mobile,run.id,2,['C']);
 await offline(desktop,false);await synced(desktop);await offline(mobile,false);await synced(mobile);await refresh(desktop);
 const converged=await simulation(desktop,run.id);assert.deepEqual(converged.answers,(await simulation(mobile,run.id)).answers);
 assert.ok(converged.syncConflicts.some(c=>c.type==='answer'&&c.index===2),'Competing answers remain preserved for review');assert.equal(converged.deadline,run.deadline);
 await mobile.goto(base+'simulare.html?test='+run.id);await synced(mobile);await mobile.waitForFunction(()=>!document.querySelector('#sim-workspace')?.hidden&&document.querySelector('#sim-submit'));
 assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await mobile.screenshot({path:resolve(output,'simulation-mobile.png'),fullPage:true});
 await desktop.goto(base+'simulare.html?test='+run.id);await synced(desktop);await desktop.screenshot({path:resolve(output,'simulation-desktop.png'),fullPage:true});
 console.log('PASS offline simulation edits converge; competing answers and original deadline are preserved');

 await offline(mobile,true);await edit(mobile,run.id,3,['E']);
 const submitted=await desktop.evaluate(id=>{const run=BBSimulationStore.get(id);return BBSimulationStore.update(id,run.revision,BBUserStorage.owner(),{type:'finish'});},run.id);
 await synced(desktop);await offline(mobile,false);await synced(mobile);await refresh(desktop);
 assert.deepEqual((await simulation(mobile,run.id)).result,submitted.result,'A late offline answer never changes the submitted result');
 assert.equal((await simulation(mobile,run.id)).completedAt,submitted.completedAt);assert.equal((await simulation(mobile,run.id)).scoringVersion,submitted.scoringVersion);
 await desktop.goto(base+'testare.html#simulation-history');await synced(desktop);
 const deleteButton=desktop.locator('[data-delete-simulation="'+run.id+'"]');
 desktop.once('dialog',dialog=>dialog.dismiss());await deleteButton.click();assert.ok(await simulation(desktop,run.id),'Cancel keeps the simulation');
 desktop.once('dialog',dialog=>dialog.accept());await deleteButton.click();await desktop.waitForFunction(id=>!BBSimulationStore.get(id),run.id);
 await synced(desktop);await refresh(mobile);assert.equal(await simulation(mobile,run.id),null,'A confirmed synchronized tombstone removes the simulation');
 console.log('PASS first submitted result remains frozen and deletion cannot resurrect the simulation');

 await desktop.goto(base+'testare.html');await synced(desktop);await desktop.evaluate(()=>BBQuizAnalytics.ready);
 const retryRun=await desktop.evaluate(()=>BBSimulationUI.start([3],0,null,BBUserStorage.owner()));await synced(desktop);
 await offline(desktop,true);await edit(desktop,retryRun.id,0,['B']);
 await desktop.evaluate(()=>__mock.failNext('rpc','bb_put_personal_record','NETWORK'));await offline(desktop,false);
 await desktop.waitForFunction(()=>BBCloudSync.getState().status==='error');
 assert.deepEqual((await simulation(desktop,retryRun.id)).answers[0],['B']);assert.match(await desktop.evaluate(()=>BBCloudSync.getState().message),/păstrate/);
 await refresh(desktop);assert.deepEqual(cloud.get(A+':bb.simulation.v1:'+retryRun.id).payload.answers[0],['B']);
 console.log('PASS recoverable network errors retain local answers and explicit retry uploads them');

 // Hold the real RPC response across logout/account switching.
 await desktop.evaluate(()=>{__mock.clearCalls();__mock.delay('rpc','bb_put_personal_record','hold');});
 await edit(desktop,retryRun.id,1,['D']);
 await desktop.waitForFunction(id=>__mock.calls().some(c=>c.operation==='rpc'&&c.payload.p_key==='bb.simulation.v1:'+id),retryRun.id);
 assert.equal((await desktop.evaluate(()=>BBAuth.perform('logout'))).ok,true);
 assert.equal((await desktop.evaluate(()=>BBAuth.perform('login','bogdan@example.test','Test-password-123!'))).ok,true);
 await desktop.evaluate(()=>{__mock.delay('rpc','bb_put_personal_record',0);__mock.release();});await synced(desktop);
 assert.equal(await desktop.evaluate(()=>BBUserStorage.owner()),B);assert.equal(await simulation(desktop,retryRun.id),null);
 assert.equal((await desktop.evaluate(()=>BBQuizAnalytics.getReport({days:'all'}))).history.length,0,'The second account never sees first-account analytics');
 assert.ok(![...cloud.values()].some(row=>row.user_id===B&&row.record_key==='bb.simulation.v1:'+retryRun.id),'Late RPC completion never writes to the second account');
 await login(desktop,'a');assert.deepEqual((await simulation(desktop,retryRun.id)).answers[1],['D'],'The original owner recovers the actual pending edit');
 console.log('PASS held RPC logout, account isolation and same-owner recovery');
 assert.deepEqual(errors,[],'Public pages report no uncaught browser errors');
 console.log(`Personal cloud browser integration passed. Screenshots: ${output}`);
}finally{await Promise.all(contexts.map(ctx=>ctx.close()));await browser.close();server.close();}
