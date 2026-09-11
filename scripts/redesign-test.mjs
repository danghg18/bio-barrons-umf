import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const prefix = '/bio-barrons-umf/';
const types = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.json':'application/json'};
const server = http.createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, path.slice(prefix.length) || 'index.html');
    if (!path.startsWith(prefix) || !file.startsWith(root + sep)) throw new Error('Not found');
    res.writeHead(200, {'Content-Type': types[extname(file)] || 'application/octet-stream'});
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}${prefix}`;
const browser = await chromium.launch({headless:true});
const output = process.env.BB_REDESIGN_OUTPUT || process.env.BB_PILOT_OUTPUT;
if (output) await mkdir(output, {recursive:true});
try {
  const context = await browser.newContext({viewport:{width:1440,height:900}, serviceWorkers:'block', reducedMotion:'reduce'});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base);
  assert.equal(await page.locator('.lab-topbar .lab-brand-name').textContent(), 'BioMed', 'Shared identity must use BioMed');
  const capture = async name => { if(output) await page.screenshot({path:resolve(output,name+'.png'), fullPage:false}); };
  await page.goto(base+'sistemul_nervos.html');
  await page.waitForFunction(() => document.body.dataset.bbSharedReady === 'true');
  assert.ok(await page.locator('.lab-menu-trigger').isVisible(), 'Desktop sidebar must have a visible toggle');
  const before = await page.locator('main').boundingBox();
  await page.locator('.lab-menu-trigger').click();
  assert.equal(await page.locator('#sidenav').evaluate(node => node.inert), true);
  assert.ok((await page.locator('main').boundingBox()).width > before.width, 'Hiding contents must expand reading space');
  await capture('lesson-focus');
  await page.goto(base+'sistemul_nervos.html#sistem-nervos-periferic');
  assert.equal(await page.locator('.lab-menu-trigger').getAttribute('aria-expanded'), 'false', 'Section navigation preserves focus mode');
  await page.reload();
  assert.equal(await page.locator('.lab-menu-trigger').getAttribute('aria-expanded'), 'true', 'Desktop contents open on a fresh visit');
  await page.locator('.pilot-subtopics:not([hidden]) button').first().click();
  assert.equal(await page.evaluate(() => document.activeElement.tagName), 'H2');
  await page.locator('.bb-settings-toggle').click();
  await page.locator('[data-reading-size="large"]').click();
  assert.equal(await page.locator('body').getAttribute('data-reading-size'), 'large');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#bb-sidebar-settings-panel').evaluate(node=>node.hidden), true);
  await page.reload();
  assert.equal(await page.locator('body').getAttribute('data-reading-size'), 'large');
  await page.locator('.bb-settings-toggle').click();
  await page.keyboard.press('/');
  assert.equal(await page.locator('#bb-sidebar-settings-panel').evaluate(node=>node.hidden),true, 'Keyboard search must close settings');
  await page.keyboard.press('Escape');
  await page.goto(base+'sistemul_nervos.html');
  await page.locator('.bb-settings-toggle').click();
  await page.locator('[data-reading-size="normal"]').click();
  await page.keyboard.press('Escape');
  await capture('lesson-desktop');
  await page.locator('.lesson-search-trigger').click();
  await page.locator('#lesson-search-input').fill('măduva');
  await page.waitForFunction(() => document.querySelectorAll('.search-found').length > 0);
  await capture('lesson-search');
  await page.keyboard.press('Escape');
  await page.locator('.bb-settings-toggle').click();
  await capture('lesson-settings');
  await page.keyboard.press('Escape');
  await page.goto(base);
  await capture('home-desktop');
  if(output) await page.screenshot({path:resolve(output,'home-full.png'), fullPage:true});
  await page.locator('#pilot-account-toggle').click();
  await capture('home-account');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#pilot-account-toggle').evaluate(node=>node===document.activeElement),true);
  assert.match(await page.locator('#pilot-demo-question label').nth(1).textContent(), /^B\./, 'Options must identify the letters used in feedback');
  await page.locator('#pilot-demo-question input[value="B"]').check();
  await page.locator('#pilot-demo-question input[value="C"]').check();
  await page.locator('#pilot-demo-question input[value="E"]').check();
  await page.locator('#pilot-demo-check').click();
  assert.match(await page.locator('#pilot-demo-feedback').textContent(), /Corect/);
  assert.equal(await page.evaluate(() => localStorage.getItem('bb.quiz.sistem-nervos.v1')), null, 'Demo must not change quiz progress');
  await page.locator('#lab-bento').scrollIntoViewIfNeeded();
  await capture('catalog-desktop');
  await page.goto(base+'index.html?design=member');
  await page.locator('#pilot-account-toggle').click();
  await capture('home-account-member');
  await page.keyboard.press('Escape');
  for (const width of [390,768,1024,1280]) {
    await page.setViewportSize({width,height:844});
    for (const file of ['index.html','sistemul_nervos.html']) {
      await page.goto(base+file);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1), file+' horizontal overflow at '+width);
      if(width===390) await capture(file==='index.html'?'home-mobile':'lesson-mobile');
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.locator('.lab-menu-trigger').click();
  await capture('lesson-mobile-drawer');
  await page.keyboard.press('Shift+Tab');
  assert.ok(await page.locator('#sidenav').evaluate(node=>node.contains(document.activeElement) && document.activeElement.getClientRects().length>0), 'Drawer traps focus on visible items');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('main').evaluate(node=>node.inert),false);
  await page.goto(base);
  await page.locator('#pilot-account-toggle').click();
  await capture('home-account-mobile');
  assert.ok(await page.locator('#pilot-account-panel').evaluate(node => node.getBoundingClientRect().left>=0 && node.getBoundingClientRect().right<=innerWidth));
  await page.keyboard.press('Escape');
  // Exercise every public surface, including both legacy chapter controllers and both quiz players.
  const files = ['index.html','testare.html','introducere_anatomie_fiziologie.html',
    'celula_si_fiziologia_celulara.html','oasele_si_articulatiile.html','tesutul_muscular.html',
    'tesutul_nervos.html','sistemul_nervos.html','organele_de_simt.html','sistemul_renal_complet.html',
    'sistemul_reproducator_masculin.html','sistemul_reproducator_feminin.html',
    'grile_sistemul_nervos.html','grile_organele_de_simt.html',
    'grile_introducere_anatomie_fiziologie.html','grile_sistemul_urinar.html',
    'grile_sistemul_reproducator_masculin.html','grile_sistemul_reproducator_feminin.html'];
  for (const width of [1440,390]) {
    await page.setViewportSize({width,height:900});
    for (const file of files) {
      await page.goto(base+file);
      const reader = !['index.html','testare.html'].includes(file);
      if(reader) await page.waitForFunction(()=>document.body.dataset.bbSharedReady==='true');
      await page.evaluate(()=>document.fonts.ready);
      assert.equal(await page.locator('.lab-topbar .lab-brand-name').textContent(),'BioMed',file+' brand');
      assert.equal(await page.locator('.bm-primary-nav a').count(),2,file+' primary navigation');
      assert.ok(await page.locator('.lab-topbar .lab-brand').evaluate(n=>Boolean(n.compareDocumentPosition(document.querySelector('.bm-primary-nav')) & Node.DOCUMENT_POSITION_FOLLOWING)),file+' keyboard navigation order');
      assert.equal(await page.locator('.bm-primary-nav a[aria-current]').textContent(),file.startsWith('grile_')||file==='testare.html'?'Testare':'Lecții');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),file+' overflow '+width);
      const navRect=await page.locator('.bm-primary-nav').boundingBox();
      assert.ok(Math.abs(navRect.x+navRect.width/2-width/2)<2,file+' navigation is not centered');
      const brandRect=await page.locator('.lab-topbar .lab-brand').boundingBox();
      assert.ok(brandRect.x+brandRect.width<=navRect.x,file+' logo overlaps navigation');
      for(const link of await page.locator('.bm-primary-nav a').all()) {
        assert.ok(await link.evaluate(n=>{const r=n.getBoundingClientRect();return n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),file+' navigation link is covered');
      }
      assert.equal(await page.locator('#pilot-account-toggle').count(),file==='index.html'?1:0,file+' account scope');
      await capture(file.replace('.html','')+'-'+width);
      if(!reader) continue;
      const menu=page.locator('.lab-menu-trigger');
      if(width===1440){
        const reading=await page.locator('main').boundingBox();
        await menu.click();
        assert.equal(await page.locator('#sidenav').evaluate(n=>n.inert),true,file+' collapsed sidebar');
        assert.ok((await page.locator('main').boundingBox()).width>reading.width,file+' expanded reading');
        await capture(file.replace('.html','')+'-focus');
        await menu.click();
      }else{
        await menu.click();
        await page.keyboard.press('Shift+Tab');
        assert.ok(await page.locator('#sidenav').evaluate(n=>n.contains(document.activeElement)),file+' focus trap');
        await capture(file.replace('.html','')+'-drawer');
        await page.keyboard.press('Escape');
        assert.equal(await menu.evaluate(n=>n===document.activeElement),true,file+' drawer return focus');
      }
      await page.locator('.bb-settings-toggle').click();
      assert.ok(await page.locator('#bb-sidebar-settings-panel').isVisible(),file+' settings');
      await page.locator('[data-reading-size="large"]').click();
      await capture(file.replace('.html','')+'-settings-'+width);
      await page.locator('[data-reading-size="normal"]').click();
      await page.keyboard.press('/');
      assert.equal(await page.locator('#bb-sidebar-settings-panel').evaluate(n=>n.hidden),true,file+' search/settings exclusion');
      assert.ok(await page.locator('#lesson-search-input').isVisible(),file+' search');
      if(width===390) {
        assert.equal(await page.locator('.lab-topbar .lab-brand').isVisible(),false,file+' covered brand must leave tab order');
        assert.equal(await page.locator('.bb-settings-toggle').isVisible(),false,file+' covered settings must leave tab order');
      }
      await capture(file.replace('.html','')+'-search-'+width);
      await page.keyboard.press('Escape');
      if(file==='sistemul_renal_complet.html'||file==='sistemul_reproducator_masculin.html'){
        if(width===390) await menu.click();
        await page.locator('#sidenav > a[href^="#"], #sidenav > .nav-group > a[href^="#"]').nth(1).click();
        await page.waitForFunction(()=>document.querySelector('#sub-nav')?.children.length>0 && document.querySelector('#sub-nav').previousElementSibling?.classList.contains('active'));
        assert.equal(await page.locator('.pilot-subtopics').count(),0,file+' duplicated legacy contents');
        assert.ok(await page.locator('#sub-nav').evaluate(n=>n.previousElementSibling?.classList.contains('active')),file+' legacy subtopics placement');
      }
    }
  }
  const touchContext=await browser.newContext({viewport:{width:320,height:800},hasTouch:true,isMobile:true,serviceWorkers:'block',reducedMotion:'reduce'});
  const touch=await touchContext.newPage();
  for(const file of files){
    await touch.goto(base+file);
    if(!['index.html','testare.html'].includes(file)) await touch.waitForFunction(()=>document.body.dataset.bbSharedReady==='true');
    assert.ok(await touch.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),file+' touch overflow');
    for(const link of await touch.locator('.bm-primary-nav a').all()) {
      assert.ok(await link.evaluate(n=>{const r=n.getBoundingClientRect();return n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),file+' touch navigation is covered');
    }
  }
  await touchContext.close();
  assert.deepEqual(errors,[]);
  console.log('BioMed rollout: desktop focus mode, subsection navigation, reading preferences, account menu, quiz demo and responsive layout passed.');
} finally { await browser.close(); await new Promise(done=>server.close(done)); }
