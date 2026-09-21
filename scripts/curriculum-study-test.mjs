// Curriculum route persistence against the deterministic SDK mock; never a real account.
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'playwright';
const root=resolve(import.meta.dirname,'..'),prefix='/bio-barrons-umf/';
const scope=JSON.parse(await readFile(resolve(root,'data/curriculum-2025.json'),'utf8'));
const legacy=JSON.parse(await readFile(resolve(root,'tests/curriculum-legacy-anchors.json'),'utf8'));
const server=http.createServer(async(req,res)=>{try{
 const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=resolve(root,path.slice(prefix.length)||'index.html');
 if(!path.startsWith(prefix)||!file.startsWith(root+sep))throw Error();
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'})[extname(file)]||'application/octet-stream');
 let body=await readFile(file);
 // Explicit preview mode affects only the served copy before publication activation.
 if(process.env.BB_CURRICULUM_PREVIEW==='1'&&file.endsWith('/assets/js/chapters-data.js'))body=body.toString().replace(/done:false/g,'done:true');
 res.end(body);
}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}${prefix}`,browser=await chromium.launch();
const A='11111111-1111-4111-8111-111111111111',time='2026-09-11T08:00:00.000Z';
const note=(n,id)=>`Notiță păstrată: capitol ${n}, ruta ${id}.`;
try{
 const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce'});
 await context.route('**/assets/js/supabase-config.js*',r=>r.fulfill({contentType:'text/javascript',body:"window.BB_SUPABASE_CONFIG={url:'',publishableKey:''};"}));
 await context.route('https://*.supabase.co/**',r=>r.abort('blockedbyclient'));
 await context.addInitScript({path:resolve(root,'tests/supabase-mock.js')});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
 const chapters=[];
 for(const chapter of scope.chapters){
  const html=await readFile(resolve(root,chapter.url),'utf8');
  const routes=await page.evaluate(html=>{const doc=new DOMParser().parseFromString(html,'text/html');return [...doc.querySelectorAll('.page-section[id^="page-"]')].map(s=>({id:s.id.slice(5),excluded:s.hasAttribute('data-curriculum-excluded'),home:s.classList.contains('chapter-home')}));},html);
  for(const id of legacy[chapter.url]?.ids.filter(id=>id.startsWith('page-'))||[])assert.ok(routes.some(r=>r.id===id.slice(5)),`${chapter.url}: legacy route ${id}`);
  chapters.push({...chapter,routes});
 }
 await page.goto(base+chapters[0].url);await page.evaluate(()=>BBAuth.ready);
 const notes=chapters.flatMap(c=>c.routes.map(r=>({user_id:A,chapter_num:c.number,section_id:r.id,body:note(c.number,r.id),created_at:time,updated_at:time})));
 const state={version:1,lastVisited:null,lessons:Object.fromEntries(chapters.map(c=>[c.number,{completedSections:[...c.routes.map(r=>r.id),'retained-unknown-legacy-route'],updatedAt:time}]))};
 await page.evaluate(({notes,state,A,time})=>{__mock.seed('notes',notes);__mock.seed('study_state',[{user_id:A,version:1,state,updated_at:time}]);},{notes,state,A,time});
 assert.equal((await page.evaluate(()=>BBAuth.perform('login','ana@example.test','Test-password-123!'))).ok,true);
 const ready=async()=>{await page.evaluate(()=>BBAuth.ready);await page.waitForFunction(()=>window.BBCloudSync?.getState().status==='synced'&&document.body.dataset.bbSharedReady==='true');};
 await ready();let count=0;
 for(const c of chapters){
  for(const r of c.routes){
   await page.goto(base+c.url+'?curriculum-study='+encodeURIComponent(r.id)+'#'+encodeURIComponent(r.id));await ready();
   assert.equal(await page.locator('.page-section.active').getAttribute('id'),'page-'+r.id,`${c.url}#${r.id}: route context`);
   await page.locator('#bb-notes-toggle').click();
   await page.waitForFunction(body=>document.querySelector('#bb-note-body')?.innerText===body,note(c.number,r.id));
   await page.reload();await ready();await page.locator('#bb-notes-toggle').click();
   await page.waitForFunction(body=>document.querySelector('#bb-note-body')?.innerText===body,note(c.number,r.id));
   // Exercise the actual shared or legacy in-document router with the notes panel open.
   const other=c.routes.find(item=>item.id!==r.id);
   if(other){
    for(const target of [other.id,r.id]){
     await page.evaluate(id=>{if(window.BBLessonNavigation)BBLessonNavigation.navigate(id);else window.goto(id);},target);
     await page.waitForFunction(({id,body})=>document.querySelector('.page-section.active')?.id==='page-'+id&&document.querySelector('#bb-note-body')?.innerText===body,{id:target,body:note(c.number,target)});
    }
   }
   const result=await page.evaluate(n=>BBStudyState.getState().lessons[n].completedSections,c.number);
   for(const prior of state.lessons[c.number].completedSections)assert.ok(result.includes(prior),`${c.url}#${r.id}: lost stored completion ${prior}`);
   const included=c.routes.filter(r=>!r.excluded&&!r.home).length;
   assert.equal(await page.locator('.bb-lesson-progress-track').getAttribute('aria-valuemax'),String(included),`${c.url}: included progress denominator`);
   assert.equal(await page.locator('.bb-lesson-progress-track').getAttribute('aria-valuenow'),String(included),`${c.url}: preserved completion count`);
   if(r.excluded)assert.equal(await page.locator('#page-'+r.id+' .bb-section-end-sentinel').count(),0);
   count++;
  }
  console.log(`PASS chapter ${c.number}: ${c.routes.length} route notes after navigation/reload; stored progress retained`);
 }
 assert.deepEqual(errors,[],'No browser runtime errors');
 console.log(`PASS curriculum study: ${chapters.length} lessons, ${count} routes, ${notes.length} saved notes, excluded routes excluded from progress.`);
 await context.close();
}finally{await browser.close();await new Promise(r=>server.close(r));}
