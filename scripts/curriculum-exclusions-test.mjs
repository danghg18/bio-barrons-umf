import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
const root=resolve(import.meta.dirname,'..'), prefix='/bio-barrons-umf/';
const server=http.createServer(async(req,res)=>{try{
 const path=new URL(req.url,'http://local').pathname;if(!path.startsWith(prefix))throw Error();
 const file=resolve(root,path.slice(prefix.length)||'index.html');if(!file.startsWith(root+'/'))throw Error();
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'})[extname(file)]||'application/octet-stream');
 let body=await readFile(file);
 // Inject a compatibility route into an actual lesson before runtime discovers sections.
 if(file.endsWith('/sistemul_nervos.html')) body=body.toString().replace('id="page-sistem-nervos-central">','id="page-sistem-nervos-central"><section id="subsection-excluded-fixture" data-curriculum-excluded="true"><p>UnicSubExclusȚesut</p></section>').replace('</main>', '<div class="page-section" id="page-curriculum-excluded-fixture" data-curriculum-excluded="true"><h1>Materia exclusă</h1><p>UnicRegExclusȚesut</p><a href="#sistem-nervos-central">Înapoi la lecție</a></div></main>');
 res.end(body);
}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}${prefix}`;
const browser=await chromium.launch();
try{
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
 await page.goto(base+'sistemul_nervos.html#curriculum-excluded-fixture');
 await page.waitForFunction(()=>document.body.dataset.bbSharedReady==='true');
 assert.equal(await page.locator('.page-section.active').getAttribute('id'),'page-curriculum-excluded-fixture','Bookmarked excluded routes remain reachable');
 assert.equal(await page.evaluate(()=>BBSearchText.collect('UnicRegExclusTesut').length),0,'Excluded content must not appear in lesson search');
 assert.equal(await page.evaluate(()=>BBSearchText.collect('UnicSubExclusTesut').length),0,'An excluded subsection inside an included route is omitted from search');
 const included=await page.locator('.page-section:not(.chapter-home):not([data-curriculum-excluded])').count();
 assert.equal(await page.locator('.bb-lesson-progress-track').getAttribute('aria-valuemax'),String(included),'Excluded sections do not contribute to the denominator');
 assert.equal(await page.locator('#page-curriculum-excluded-fixture .bb-section-end-sentinel').count(),0,'Excluded sections must not be auto-completed');
 await page.waitForSelector('#bb-notes-toggle');
 await page.locator('#bb-notes-toggle').click();
 assert.equal(await page.locator('#bb-notes-panel').isVisible(),true,'Old section notes remain accessible');
 await page.goto(base);
 await page.locator('#search-btn').click();await page.locator('#palette-input').fill('UnicRegExclusTesut');
 await page.waitForSelector('.lab-palette-empty');
 assert.equal(await page.locator('[data-hit]').count(),0,'Homepage search omits excluded content');
 const sections=await page.evaluate(async()=>loadLessonSections(CHAPTERS.find(c=>c.num===11)));
 assert.ok(!sections.some(s=>s.id==='curriculum-excluded-fixture'),'Homepage progress uses the same included section set');
 console.log('Curriculum exclusions: preserved bookmarks/notes, excluded search and progress passed.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
