import {toggleReadingSettings} from './header-test-helpers.mjs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, extname} from 'node:path';

const root=resolve(import.meta.dirname,'..'), prefix='/bio-barrons-umf/';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer(async(req,res)=>{
  try {
    const pathname=new URL(req.url,'http://localhost').pathname;
    if(!pathname.startsWith(prefix)) throw Error('outside Pages subpath');
    const file=resolve(root,decodeURIComponent(pathname.slice(prefix.length)));
    if(!file.startsWith(root+'/')) throw Error('outside root');
    res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.writeHead(404);res.end(); }
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}${prefix}`;
let browser;

async function openPalette(page) {
  if(await page.locator('#bb-sidebar-settings-panel').evaluate(panel=>panel.hidden)) await toggleReadingSettings(page);
  await page.locator('#nav-hl-btn').click();
  await page.locator('#bb-highlighter-palette').waitFor({state:'visible'});
  await page.locator('#bb-highlighter-palette').evaluate(async palette=>{
    await Promise.allSettled(palette.getAnimations({subtree:true}).filter(animation=>animation.effect?.getTiming().iterations!==Infinity).map(animation=>animation.finished));
  });
}

async function checkLayout(page,label) {
  const geometry=await page.locator('#bb-highlighter-palette').evaluate(palette=>{
    const panel=document.getElementById('bb-sidebar-settings-panel');
    const rect=palette.getBoundingClientRect(), panelRect=panel.getBoundingClientRect();
    const colors=[...palette.querySelectorAll('.bb-highlighter-color')].map(button=>{
      const bounds=button.getBoundingClientRect();
      return {width:bounds.width,height:bounds.height,name:button.getAttribute('aria-label')};
    });
    const text=[...palette.querySelectorAll('*')].filter(element=>{
      if(element.closest('[aria-hidden="true"]')||!element.checkVisibility()) return false;
      return [...element.childNodes].some(node=>node.nodeType===Node.TEXT_NODE&&node.textContent.trim());
    }).map(element=>({text:element.textContent.trim(),size:parseFloat(getComputedStyle(element).fontSize)}));
    return {left:rect.left,right:rect.right,width:innerWidth,panelLeft:panelRect.left,panelRight:panelRect.right,overflow:palette.scrollWidth-palette.clientWidth,panelOverflow:panel.scrollWidth-panel.clientWidth,pageOverflow:document.documentElement.scrollWidth-innerWidth,colors,text};
  });
  assert.ok(geometry.left>=-1&&geometry.right<=geometry.width+1&&geometry.panelLeft>=-1&&geometry.panelRight<=geometry.width+1,label+': panel stays in viewport');
  assert.ok(geometry.overflow<=1&&geometry.panelOverflow<=1&&geometry.pageOverflow<=1,label+': no horizontal overflow');
  assert.equal(geometry.colors.length,6,label+': six colors');
  assert.ok(geometry.colors.every(color=>color.width>=43.9&&color.height>=43.9&&color.name),label+': six named touch targets at least 44px: '+JSON.stringify(geometry.colors));
  assert.ok(geometry.text.length>0,label+': readable palette labels');
  assert.ok(geometry.text.every(text=>text.size<=13.01),label+': compact palette type: '+JSON.stringify(geometry.text));
}

try {
  browser=await chromium.launch();
  for(const viewport of [{width:1384,height:688},{width:390,height:844},{width:320,height:568}]) {
    for(const file of ['organele_de_simt.html','sistemul_renal_complet.html','sistemul_reproducator_masculin.html','grile_sistemul_urinar.html']) {
      const label=`${file} @${viewport.width}`;
      const context=await browser.newContext({viewport,hasTouch:viewport.width<600,serviceWorkers:'block'});
      await context.addInitScript(()=>localStorage.setItem('highlighterColor','pink'));
      const page=await context.newPage();page.setDefaultTimeout(5000);
      const errors=[];page.on('pageerror',error=>errors.push(error.message));
      await page.goto(base+file);
      await page.waitForFunction(()=>document.body.dataset.bbSharedReady==='true');
      assert.equal(await page.locator('#bb-sidebar-settings-panel').evaluate(panel=>panel.hidden),true,label+': settings start closed');
      await openPalette(page);
      assert.equal(await page.locator('#nav-hl-btn').getAttribute('aria-expanded'),'true');
      await checkLayout(page,label);
      const persistent=await page.evaluate(()=>!!window.BBLessonHighlights);
      if(persistent) {
        const management=page.locator('details.bb-highlight-manage');
        assert.equal(await management.count(),1,label+': one management disclosure');
        assert.equal(await management.evaluate(details=>details.open),false,label+': deletion actions start collapsed');
        assert.match(await management.locator('summary').textContent(),/Șterge evidențieri/);
        assert.equal(await page.getByRole('button',{name:'Șterge evidențierile din această lecție',exact:true}).isVisible(),false);
        assert.equal(await page.getByRole('button',{name:'Șterge evidențierile din toate lecțiile',exact:true}).isVisible(),false);
        assert.equal(await page.locator('#bb-highlight-status').getAttribute('role'),'status');
        assert.match(await page.locator('#bb-highlight-status').textContent(),/0.*evidențier/);
        await management.locator('summary').focus();
        await page.keyboard.press('Enter');
        assert.equal(await page.getByRole('button',{name:'Șterge evidențierile din această lecție',exact:true}).isVisible(),true);
        assert.equal(await page.getByRole('button',{name:'Șterge evidențierile din toate lecțiile',exact:true}).isVisible(),true);
        await checkLayout(page,label+' expanded');
        await management.locator('summary').click();
      }
      const selected=page.locator('.bb-highlighter-color[data-highlight-color="pink"]');
      assert.equal(await selected.getAttribute('aria-pressed'),'true',label+': saved color selected');
      await selected.focus();
      assert.ok(await selected.evaluate(button=>document.activeElement===button),label+': swatch can receive keyboard focus');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#bb-highlighter-palette').isVisible(),false,label+': Escape closes palette');
      assert.equal(await page.evaluate(()=>document.activeElement.id),'nav-hl-btn',label+': Escape restores trigger focus');
      await openPalette(page);
      await page.locator('.bb-highlighter-color[data-highlight-color="blue"]').focus();
      await page.keyboard.press('Space');
      assert.equal(await page.locator('#bb-highlighter-palette').isVisible(),false,label+': color selection closes palette');
      assert.equal(await page.evaluate(()=>document.body.classList.contains('hl-mode')),true,label+': color selection enables mode');
      assert.equal(await page.evaluate(()=>localStorage.getItem('highlighterColor')),'blue');
      assert.equal(await page.evaluate(()=>document.activeElement.id),'nav-hl-btn',label+': color selection restores trigger focus');
      await openPalette(page);
      await page.locator('.bb-highlighter-disable').click();
      assert.equal(await page.evaluate(()=>document.body.classList.contains('hl-mode')),false,label+': disable stops highlighting');
      assert.equal(await page.locator('#bb-highlighter-palette').isVisible(),false,label+': disabling closes palette');
      assert.equal(await page.evaluate(()=>document.activeElement.id),'nav-hl-btn');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#bb-sidebar-settings-panel').isVisible(),false,label+': second Escape closes settings');
      assert.ok(await page.locator(viewport.width<1000?'#menu-toggle':'.bb-settings-toggle').evaluate(button=>document.activeElement===button),label+': settings Escape restores focus to the visible entry');
      assert.deepEqual(errors,[],label+': no browser errors');
      console.log('PASS '+label+': compact panel, disclosure, touch targets, keyboard, color, disable');
      await context.close();
    }
  }
  const context=await browser.newContext({viewport:{width:390,height:568},reducedMotion:'reduce',serviceWorkers:'block'});
  const page=await context.newPage();page.setDefaultTimeout(5000);
  await page.goto(base+'organele_de_simt.html');
  await openPalette(page);
  const motion=await page.locator('#bb-highlighter-palette').evaluate(palette=>{
    const seconds=value=>value.trim().endsWith('ms')?parseFloat(value)/1000:parseFloat(value);
    return [palette,...palette.querySelectorAll('*')].flatMap(element=>{
      const style=getComputedStyle(element);
      return [...style.animationDuration.split(','),...style.transitionDuration.split(',')].map(seconds);
    });
  });
  assert.ok(motion.every(duration=>duration<=0.01),'reduced motion removes palette animations and transitions');
  await checkLayout(page,'reduced motion short viewport');
  await context.close();
  console.log('PASS reduced motion and short viewport');
} finally {
  await browser?.close();
  await new Promise(done=>server.close(done));
}
