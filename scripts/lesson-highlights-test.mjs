import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import http from 'node:http';
import {readFile, mkdir} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
const root=resolve(import.meta.dirname,'..'), prefix='/bio-barrons-umf/';
const server=http.createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;if(!pathname.startsWith(prefix))throw Error();const file=resolve(root,decodeURIComponent(pathname.slice(prefix.length)));if(!file.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}${prefix}`;
const browser=await chromium.launch();
async function select(page,selector,start=2,end=28,event='mouseup'){
 await page.evaluate(({selector,start,end,event})=>{const el=document.querySelector(selector),section=el.closest('.page-section');if(window.BBLessonNavigation)BBLessonNavigation.navigate(section.id.slice(5),{focus:false});else goto(section.id.slice(5));if(!document.body.classList.contains('hl-mode'))toggleHighlighter();const range=document.createRange(),walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let offset=0;while(walker.nextNode()){const node=walker.currentNode;if(start>=offset&&start<offset+node.length)range.setStart(node,start-offset);if(end>offset&&end<=offset+node.length)range.setEnd(node,end-offset);offset+=node.length;}const selection=getSelection();selection.removeAllRanges();selection.addRange(range);el.dispatchEvent(new Event(event,{bubbles:true}));},{selector,start,end,event});
 await page.waitForFunction(()=>document.querySelector('mark[data-highlight-id]'));
}
try{
 for(const mobile of [false,true]) for(const file of ['introducere_anatomie_fiziologie.html','sistemul_renal_complet.html','sistemul_reproducator_masculin.html']){
  const context=await browser.newContext({serviceWorkers:'block',hasTouch:mobile,viewport:mobile?{width:390,height:844}:{width:1440,height:900}});
  await context.addInitScript(()=>localStorage.setItem('highlighterColor','pink'));
  const page=await context.newPage();const errors=[];page.on('pageerror',err=>errors.push(err.message));
  await page.goto(base+file);assert.equal(await page.evaluate(()=>!!window.BBLessonHighlights),true,'persistent highlight module installed');
  const selector='.page-section p[data-source-page]';
  await select(page,selector,2,28,mobile?'touchend':'mouseup');
  const saved=await page.evaluate(()=>Object.values(BBUserStorage.snapshot().values).find(v=>v?.anchor));
  assert.equal(saved.color,'pink');assert.equal(await page.locator('mark[data-highlight-id]').first().getAttribute('data-highlight-color'),'pink');
  await page.reload();assert.equal(await page.locator('mark[data-highlight-id]').first().textContent(),saved.anchor.quote,'exact quote restored after reload');
  // Search wrappers must preserve the saved marking identity and its text.
  await page.evaluate(quote=>{const matches=BBLessonSearchText.collect(quote);BBLessonSearchText.render(matches);BBLessonSearchText.clear();},saved.anchor.quote);
  assert.equal(await page.locator('mark[data-highlight-id]').first().textContent(),saved.anchor.quote);
  // Separate account owner must never see the guest mark, and return restores it.
  await page.evaluate(()=>BBUserStorage.activate('highlight-account-a'));
  assert.ok(await page.locator('mark[data-highlight-id]').count(),'first account imports guest highlight');
  await page.evaluate(()=>BBUserStorage.activate('highlight-account-b'));
  assert.equal(await page.locator('mark[data-highlight-id]').count(),0);
  await page.evaluate(()=>BBUserStorage.activate('guest'));
  assert.ok(await page.locator('mark[data-highlight-id]').count());
  // A changed quote is retained, surfaced as unresolved, and never moved elsewhere.
  await page.evaluate(()=>{const mark=document.querySelector('mark[data-highlight-id]');mark.textContent='[text changed by lesson update]';BBLessonHighlights.restore();});
  assert.equal(await page.locator('mark[data-highlight-id]').count(),0);
  assert.match(await page.locator('.bb-highlight-warning').textContent(),/1.*nu mai poate/);
  assert.equal(await page.evaluate(id=>BBUserStorage.get('bb.highlight.v1:'+id).deleted||false,saved.id),false);
  await page.reload();
  await page.evaluate(()=>{const mark=document.querySelector('mark[data-highlight-id]'),section=mark.closest('.page-section');if(window.BBLessonNavigation)BBLessonNavigation.navigate(section.id.slice(5),{focus:false});else goto(section.id.slice(5));});
  await page.locator('mark[data-highlight-id]').first().click();
  await page.getByRole('button',{name:'Șterge această evidențiere',exact:true}).click();
  assert.equal(await page.locator('mark[data-highlight-id]').count(),0);
  await page.reload();assert.equal(await page.locator('mark[data-highlight-id]').count(),0);
  await select(page,selector,2,28,mobile?'touchend':'mouseup');
  const beforeClear=await page.evaluate(()=>Object.values(BBUserStorage.snapshot().values).find(v=>v?.anchor&&!v.deleted));
  // Use real UI and exact confirmation, cancellation first.
  if(mobile) await page.locator('.lab-menu-trigger').click();
  await page.locator('.bb-settings-toggle').click();
  await page.locator('#nav-hl-btn').click();
  assert.equal(await page.locator('.bb-highlight-manage').evaluate(details=>details.open),false,'bulk deletion starts collapsed');
  await page.locator('.bb-highlight-manage > summary').click();
  page.once('dialog',async dialog=>{assert.match(dialog.message(),/notițele/);await dialog.dismiss();});
  await page.getByRole('button',{name:'Șterge evidențierile din această lecție',exact:true}).click();
  assert.ok(await page.locator('mark[data-highlight-id]').count());
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Șterge evidențierile din această lecție',exact:true}).click();
  assert.equal(await page.locator('mark[data-highlight-id]').count(),0);
  await page.evaluate(old=>{const copy={...old,id:'unseen-old-device',deleted:false};BBUserStorage.set('bb.highlight.v1:'+copy.id,copy);},beforeClear);
  assert.equal(await page.locator('mark[data-highlight-id]').count(),0,'clear barrier hides previously unseen offline records');
  await select(page,selector,35,60,mobile?'touchend':'mouseup');
  assert.ok(await page.locator('mark[data-highlight-id]').count(),'new selection after clear remains visible');
  await page.evaluate(()=>{const p=document.querySelector('.page-section.active');const editor=document.createElement('div');editor.contentEditable='true';editor.id='protected-editor';editor.textContent='Notița mea personală cu evidențieri proprii';p.append(editor);const range=document.createRange();range.selectNodeContents(editor);getSelection().removeAllRanges();getSelection().addRange(range);editor.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));});
  await page.waitForTimeout(100);assert.equal(await page.locator('#protected-editor mark').count(),0);
  assert.deepEqual(errors,[]);
  await mkdir('/tmp/bb-highlight-review',{recursive:true});
  await page.evaluate(()=>getSelection().removeAllRanges());
  await page.locator('mark[data-highlight-id]').first().click();
  await page.screenshot({path:`/tmp/bb-highlight-review/${mobile?'mobile':'desktop'}-${file}.png`});
  await page.getByRole('button',{name:'Închide',exact:true}).click();
  if(mobile) await page.locator('.lab-menu-trigger').click();
  await page.locator('.bb-settings-toggle').click();
  await page.locator('#nav-hl-btn').click();
  await page.screenshot({path:`/tmp/bb-highlight-review/${mobile?'mobile':'desktop'}-palette-${file}.png`});
  await page.evaluate(()=>BBUserStorage.set('note:highlight-test:protected',{body:'Notiță protejată'}));
  if(!await page.locator('.bb-highlight-manage').evaluate(details=>details.open)) await page.locator('.bb-highlight-manage > summary').click();
  page.once('dialog',dialog=>{assert.match(dialog.message(),/toate lecțiile/);return dialog.accept();});
  await page.getByRole('button',{name:'Șterge evidențierile din toate lecțiile',exact:true}).click();
  assert.equal(await page.locator('mark[data-highlight-id]').count(),0);
  assert.deepEqual(await page.evaluate(()=>BBUserStorage.get('note:highlight-test:protected')),{body:'Notiță protejată'});
  console.log(`PASS ${mobile?'mobile':'desktop'} ${file}: persistence, search, identity, unresolved, individual/bulk delete, barriers, protected editor`);
  await context.close();
 }
 // An offline visit writes durably; a new browser context restores the disk state.
 const offlineContext=await browser.newContext({serviceWorkers:'block'});
 const offlinePage=await offlineContext.newPage();
 await offlinePage.goto(base+'introducere_anatomie_fiziologie.html');
 await offlineContext.setOffline(true);
 await select(offlinePage,'.page-section p[data-source-page]',80,110);
 const offlineSaved=await offlinePage.evaluate(()=>Object.values(BBUserStorage.snapshot().values).find(v=>v?.anchor));
 const disk=await offlineContext.storageState();await offlineContext.close();
 const restored=await browser.newContext({storageState:disk,serviceWorkers:'block'}), restoredPage=await restored.newPage();
 await restoredPage.goto(base+'introducere_anatomie_fiziologie.html');
 assert.equal(await restoredPage.locator('mark[data-highlight-id]').first().textContent(),offlineSaved.anchor.quote);
 // Shift the quote without changing its context: a strict unique match reanchors.
 await restoredPage.evaluate(()=>{const p=document.querySelector('mark[data-highlight-id]').closest('p');p.before(document.createTextNode('Unrelated new paragraph. '));BBLessonHighlights.restore();});
 assert.equal(await restoredPage.locator('mark[data-highlight-id]').first().textContent(),offlineSaved.anchor.quote);
 // Two identical textual/contextual matches after an update must stay unresolved.
 await restoredPage.evaluate(()=>{const p=document.querySelector('mark[data-highlight-id]').closest('p'),copy=p.cloneNode(true);copy.querySelectorAll('mark').forEach(mark=>mark.replaceWith(...mark.childNodes));p.after(copy);BBLessonHighlights.restore();});
 assert.equal(await restoredPage.locator('mark[data-highlight-id]').count(),0,'ambiguous duplicate does not silently attach');
 assert.match(await restoredPage.locator('.bb-highlight-warning').textContent(),/1.*nu mai poate/);
 await restored.close();console.log('PASS offline save, closed browser recovery, unique reanchor and ambiguous duplicate protection');
 // Two browsers share a deterministic server-side CAS table, never production.
 const cloudRows=new Map();
 async function cloudContext(mobile=false){
  const context=await browser.newContext({serviceWorkers:'block',hasTouch:mobile,viewport:mobile?{width:390,height:844}:{width:1440,height:900}});
  await context.route('**/assets/js/supabase-config.js*',route=>route.fulfill({contentType:'text/javascript',body:"window.BB_SUPABASE_CONFIG={url:'',publishableKey:''};"}));
  await context.route('https://*.supabase.co/**',route=>route.abort());
  await context.exposeBinding('__sharedPersonal',(_,request)=>{
   if(request.type==='select'){const rows=[...cloudRows.values()].filter(row=>row.user_id===request.owner).sort((a,b)=>a.record_key.localeCompare(b.record_key));return {data:rows.slice(request.first,request.last===null?undefined:request.last+1),error:null};}
   const key=request.owner+':'+request.p_key, old=cloudRows.get(key);
   if(old&&old.revision!==request.p_expected)return {data:{accepted:false,record:structuredClone(old)},error:null};
   const row={user_id:request.owner,record_key:request.p_key,payload:old?.payload.deleted?old.payload:request.p_payload,revision:(old?.revision||0)+1};cloudRows.set(key,structuredClone(row));return {data:{accepted:true,record:row},error:null};
  });
  await context.addInitScript({path:resolve(root,'tests/supabase-mock.js')});
  const page=await context.newPage();page.setDefaultTimeout(12000);await page.goto(base+'introducere_anatomie_fiziologie.html');await page.evaluate(()=>BBAuth.ready);
  return {context,page};
 }
 const first=await cloudContext(),second=await cloudContext(true);
 async function login(page,email='ana@example.test'){assert.equal((await page.evaluate(email=>BBAuth.perform('login',email,'Test-password-123!'),email)).ok,true);await page.waitForFunction(()=>BBCloudSync.getState().status==='synced');}
 async function sync(page){await page.evaluate(()=>BBCloudSync.retry());await page.waitForFunction(()=>BBCloudSync.getState().status==='synced');}
 await select(first.page,'.page-section p[data-source-page]');
 await login(first.page);await sync(first.page);
 const imported=await first.page.evaluate(()=>Object.values(BBUserStorage.snapshot().values).find(row=>row?.anchor));
 assert.ok([...cloudRows.values()].some(row=>row.record_key==='bb.highlight.v1:'+imported.id),'guest record actually uploaded');
 await login(second.page);assert.equal(await second.page.locator('mark[data-highlight-id]').first().textContent(),imported.anchor.quote,'second signed-in device hydrates');
 await second.page.evaluate(()=>__mock.offline(true));
 await second.page.evaluate(id=>BBLessonHighlights.removeHighlight(id),imported.id);
 assert.equal(await second.page.locator('mark[data-highlight-id]').count(),0);
 assert.equal(await second.page.evaluate(()=>BBCloudSync.getState().status),'offline');
 await second.page.evaluate(()=>__mock.offline(false));await sync(second.page);await sync(first.page);
 assert.equal(await first.page.locator('mark[data-highlight-id]').count(),0,'offline tombstone propagates');
 // Device 2 creates unseen offline annotation; device 1 clears while online.
 await second.page.evaluate(()=>__mock.offline(true));
 await select(second.page,'.page-section p[data-source-page]',35,60,'touchend');
 await first.page.evaluate(()=>BBLessonHighlights.clearHighlights(null));await sync(first.page);
 await second.page.evaluate(()=>__mock.offline(false));await sync(second.page);await sync(first.page);
 assert.equal(await first.page.locator('mark[data-highlight-id]').count(),0);
 assert.equal(await second.page.locator('mark[data-highlight-id]').count(),0,'shared server barrier suppresses unseen offline annotation');
 await select(first.page,'.page-section p[data-source-page]',80,110);await sync(first.page);await sync(second.page);
 assert.ok(await second.page.locator('mark[data-highlight-id]').count(),'new annotation after synchronized clear is visible');
 await second.page.evaluate(()=>BBAuth.perform('logout'));await login(second.page,'bogdan@example.test');
 assert.equal(await second.page.locator('mark[data-highlight-id]').count(),0,'account B sees no account A highlight');
 await second.page.evaluate(()=>BBAuth.perform('logout'));await login(second.page);assert.ok(await second.page.locator('mark[data-highlight-id]').count());
 await first.context.close();await second.context.close();
 console.log('PASS shared mocked cloud across desktop/mobile: guest import, hydration, offline deletion, concurrent clear barrier, new highlight, two-account isolation');
}finally{await browser.close();server.close();}
