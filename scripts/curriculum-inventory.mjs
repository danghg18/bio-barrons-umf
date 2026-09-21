// Source-block inventory. Refresh explicitly after source review, never as part
// of ordinary site generation: a changed lesson must not approve its own hash.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const root=resolve(import.meta.dirname,'..');
const scope=JSON.parse(await readFile(resolve(root,'data/curriculum-2025.json'),'utf8'));
const target=resolve(root,'tests/curriculum-source-inventory.json');
const digest=value=>createHash('sha256').update(value).digest('hex');
const browser=await chromium.launch();
const inventory={edition:scope.edition,session:scope.session,pageNumbering:'printed',chapters:[]};
try {
 const page=await browser.newPage();
 for(const chapter of scope.chapters){
  const source=await readFile(resolve(root,chapter.url),'utf8');
  const blocks=await page.evaluate(source=>{
   const doc=new DOMParser().parseFromString(source,'text/html');
   const nodes=[...doc.querySelectorAll('main p,main li,main table,main figure,main .box')];
   return nodes.filter(node=>!node.closest('[data-curriculum-excluded]')&&
    !node.parentElement.closest('table,figure,.box')&&node.textContent.trim()).map((node,index)=>{
    const origin=node.closest('[data-source-page]');
    const text=node.textContent.replace(/\s+/g,' ').trim();
    return {block:index+1,route:node.closest('.page-section')?.id.slice(5),type:node.tagName.toLowerCase(),
     printedPages:origin?.getAttribute('data-source-pages')||origin?.getAttribute('data-source-page')||null,
     label:node.querySelector('caption,figcaption')?.textContent.replace(/\s+/g,' ').trim()||text.slice(0,120),
     text,image:node.querySelector('img')?.getAttribute('src')||undefined};
   });
  },source);
  for(const block of blocks){
   assert.ok(block.printedPages,`${chapter.url}: source page missing for ${block.label}`);
   block.textSha256=digest(block.text);delete block.text;
   if(block.image)block.imageSha256=digest(await readFile(resolve(root,block.image)));
   else delete block.image;
  }
  inventory.chapters.push({number:chapter.number,url:chapter.url,printedPages:chapter.printedPages,pdfPages:chapter.pdfPages,exclusions:chapter.exclusions,blocks});
 }
}finally{await browser.close();}
if(process.argv.includes('--check-provenance')){
 console.log(`Source provenance present for ${inventory.chapters.reduce((n,c)=>n+c.blocks.length,0)} blocks across ${inventory.chapters.length} chapters; no review fingerprints changed.`);
}else if(process.argv.includes('--write')){
 await writeFile(target,JSON.stringify(inventory,null,2)+'\n');
 console.log(`Recorded ${inventory.chapters.reduce((n,c)=>n+c.blocks.length,0)} source blocks across ${inventory.chapters.length} chapters.`);
}else{
 assert.deepEqual(inventory,JSON.parse(await readFile(target,'utf8')),'Source inventory changed: compare the affected blocks with the printed source before updating.');
 console.log('Source inventory: all reviewed text blocks, tables, figures and local image bytes match.');
}
