import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import http from 'node:http';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'playwright';
const root=resolve(import.meta.dirname,'..'),prefix='/bio-barrons-umf/';
const server=http.createServer(async(req,res)=>{try{
 const path=new URL(req.url,'http://local').pathname,file=resolve(root,path.slice(prefix.length));
 if(!path.startsWith(prefix)||!file.startsWith(root+sep))throw Error();
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');
 res.end(await readFile(file));
}catch{res.writeHead(404);res.end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}${prefix}`,browser=await chromium.launch();
try{
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage(),failures=[];
 const captures=process.env.BB_SIM_OUTPUT;if(captures)await mkdir(captures,{recursive:true});
 await page.goto(base+'testare.html');
 await page.getByLabel('Introducere în anatomie și fiziologie',{exact:true}).check();
 await page.locator('#sim-start').click();await page.waitForURL(/simulare.html/);await page.waitForSelector('.sim-question');
 const choices=await page.evaluate(()=>{const run=BBSimulationStore.list()[0];return {extra:run.questions[0].options.find(o=>!run.questions[0].correct.includes(o.letter)).letter,correct:run.questions[1].correct[0]};});
 await page.locator(`#intrebarea-1 input[value="${choices.extra}"]`).check();
 await page.locator(`#intrebarea-2 input[value="${choices.correct}"]`).check();
 await page.locator('#sim-submit').click();
 for(const [width,height] of [[1440,900],[768,900],[390,844],[320,640],[390,320]]){
  await page.setViewportSize({width,height});
  const geometry=await page.locator('#sim-confirm').evaluate(node=>{const r=node.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,scroll:node.scrollHeight,client:node.clientHeight,overflow:getComputedStyle(node).overflowY};});
  if(Math.abs(geometry.x+geometry.w/2-width/2)>2||Math.abs(geometry.y+geometry.h/2-height/2)>2)failures.push(`Dialog is not centered at ${width}x${height}: ${JSON.stringify(geometry)}`);
  if(geometry.x<15||geometry.y<15||geometry.x+geometry.w>width-15||geometry.y+geometry.h>height-15)failures.push(`Dialog exceeds viewport margins at ${width}x${height}`);
  if(geometry.scroll>geometry.client&&!['auto','scroll'].includes(geometry.overflow))failures.push('Clipped dialog cannot scroll');
  if(captures)await page.screenshot({path:resolve(captures,`confirmation-${width}x${height}.png`)});
 }
 await page.setViewportSize({width:1440,height:900});
 await page.locator('#sim-cancel').click();assert.equal(await page.locator('#sim-confirm').isVisible(),false);
 await page.locator('#sim-submit').click();await page.locator('#sim-confirm-submit').click();await page.waitForSelector('#sim-result:not([hidden])');
 for(const [state,color] of [['extra','rgb(251, 236, 232)'],['missed','rgb(255, 245, 215)'],['correct','rgb(230, 243, 233)']]){
  const option=page.locator(`.sim-option-wrap.is-${state}`).first();assert.ok(await option.count());
  const actual=await option.evaluate(node=>getComputedStyle(node).backgroundColor);
  if(actual!==color)failures.push(`${state} feedback is ${actual}, expected ${color}`);
 }
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});await page.locator('#intrebarea-1').scrollIntoViewIfNeeded();
  if(captures)await page.screenshot({path:resolve(captures,`feedback-${width}.png`)});
 }
 assert.deepEqual(failures,[]);
 console.log('Simulation feedback: centered responsive confirmation, cancel/submit, red extra, yellow omitted and green correct answers passed.');
}finally{await browser.close();await new Promise(done=>server.close(done));}
