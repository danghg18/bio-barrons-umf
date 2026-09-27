import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile, mkdir} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {chromium} from 'playwright';

const root = resolve(import.meta.dirname, '..'), prefix = '/bio-barrons-umf/';
const output = process.env.BB_POLISH_OUTPUT;
if (output) await mkdir(output, {recursive:true});
const server = http.createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://local').pathname;
    const file = resolve(root, path.slice(prefix.length) || 'index.html');
    if (!path.startsWith(prefix) || !file.startsWith(root + sep)) throw Error();
    res.setHeader('Content-Type', ({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.webp':'image/webp','.ttf':'font/ttf'})[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}${prefix}`;
const browser = await chromium.launch();
const failures = [];
let passed = 0;
async function check(name, run) {
  try { await run(); passed++; }
  catch (error) { failures.push({name, message:error.message}); console.error('FAIL', name, error.message); }
}
try {
  const context = await browser.newContext({serviceWorkers:'block', reducedMotion:'reduce'});
  await context.route('**/assets/js/supabase-config.js*', route => route.fulfill({contentType:'text/javascript', body:"window.BB_SUPABASE_CONFIG={url:'',publishableKey:''};"}));
  await context.route('https://*.supabase.co/**', route => route.abort());
  await context.addInitScript({path:resolve(root, 'tests/supabase-mock.js')});
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440,768,390,320]) {
    await page.setViewportSize({width,height:900});
    for (const file of ['celula_si_fiziologia_celulara.html','sistemul_renal_complet.html','sistemul_reproducator_masculin.html','grile_celula.html']) {
      await check(`search touch targets and keyboard: ${file} at ${width}`, async () => {
        await page.goto(base + file);
        await page.waitForFunction(() => document.body.dataset.bbSharedReady === 'true');
        assert.ok((await page.locator('.lesson-search-trigger').boundingBox()).width >= 44);
        await page.locator('.lesson-search-trigger').click();
        await page.locator('.lesson-search-box input').fill('a');
        const sizes = await page.locator('.lesson-search-panel button').evaluateAll(nodes => nodes.map(n => {
          const r = n.getBoundingClientRect();
          return {name:n.getAttribute('aria-label'),width:r.width,height:r.height};
        }));
        assert.ok(sizes.every(r => r.width >= 44 && r.height >= 44), JSON.stringify(sizes));
        const bounds = await page.locator('.lesson-search-panel').boundingBox();
        assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width + 1, 'Search fits viewport');
        assert.ok(await page.locator('.lesson-search-box input').evaluate(n => n.getBoundingClientRect().width >= 100), 'Search leaves a readable input');
        assert.ok(await page.locator('.lesson-search-panel button:enabled').evaluateAll(nodes => nodes.every(n => {
          const r = n.getBoundingClientRect(); return n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
        })), 'Search buttons are not covered by another control');
        if (output && [1440,390].includes(width)) await page.screenshot({path:resolve(output,`search-${file}-${width}.png`)});
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.lesson-search').evaluate(n => n.classList.contains('open')), false);
        assert.equal(await page.locator('.lesson-search-trigger').evaluate(n => n === document.activeElement), true);
      });
    }
  }
  await check('glossary exposes later letters on phones and keeps active letter visible after reload', async () => {
    await page.setViewportSize({width:320,height:900});
    await page.goto(base + 'glosar.html');
    await page.waitForSelector('.glossary-entry');
    const next = page.getByRole('button',{name:'Literele următoare',exact:true});
    assert.equal(await next.isVisible(), true);
    for (let i=0; i<20 && await next.isEnabled(); i++) await next.click();
    const z = page.getByRole('button',{name:'Litera Z',exact:true});
    assert.ok(await z.evaluate(n => { const r=n.getBoundingClientRect(), a=n.parentElement.getBoundingClientRect();return r.left>=a.left-1 && r.right<=a.right+1; }));
    await z.click();
    await page.reload();
    await page.waitForSelector('.glossary-entry');
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await z.getAttribute('aria-pressed'),'true');
    assert.ok(await z.evaluate(n => { const r=n.getBoundingClientRect(), a=n.parentElement.getBoundingClientRect();return r.left>=a.left-1 && r.right<=a.right+1; }));
    assert.equal(await page.locator('.glossary-entry h2').first().innerText(),'zigot');
    if (output) await page.screenshot({path:resolve(output,'glossary-last-letter-320.png')});
  });
  await check('guest account stays quiet online and does not promise automatic offline sync', async () => {
    await page.goto(base + 'cont.html');
    await page.waitForFunction(() => window.BBAuth?.getState().initialized);
    assert.equal(await page.locator('#bb-account-status').isVisible(),false);
    try {
      await page.evaluate(() => __mock.offline(true));
      await page.waitForFunction(() => document.getElementById('bb-account-status').textContent.includes('offline'));
      assert.match(await page.locator('#bb-account-status').innerText(),/dispozitiv/);
      assert.doesNotMatch(await page.locator('#bb-account-status').innerText(),/se sincronizează/);
    } finally { await page.evaluate(() => __mock.offline(false)); }
  });
  await check('simulation skip link works even without a saved test', async () => {
    await page.goto(base + 'simulare.html');
    await page.waitForSelector('#sim-unavailable:not([hidden])');
    const skip = page.locator('.lab-skip');
    await skip.focus(); await page.keyboard.press('Enter');
    const id = new URL(page.url()).hash;
    assert.ok(id && await page.locator(id).isVisible(), 'Skip link lands on visible content');
  });
  await check('mobile simulation map retains 44px targets without crowding the question area', async () => {
    await page.goto(base + 'testare.html');
    await page.getByLabel('Introducere în anatomie și fiziologie', {exact:true}).check();
    await page.getByRole('button', {name:'Începe simularea',exact:true}).click();
    await page.waitForSelector('.sim-question');
    for (const width of [390,320]) {
      await page.setViewportSize({width,height:900});
      await page.evaluate(() => scrollTo(0,0));
      assert.ok(await page.locator('.sim-map a').evaluateAll(nodes => nodes.every(node => {
        const box = node.getBoundingClientRect(); return box.width >= 44 && box.height >= 44;
      })), 'Each question number is comfortably tappable at ' + width);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      if (output) await page.screenshot({path:resolve(output,`simulation-active-${width}.png`)});
    }
  });
  assert.deepEqual(errors, [], 'No browser errors');
  assert.deepEqual(failures, [], `${failures.length} polish regressions`);
  console.log(`UI polish: ${passed} search, glossary, account and simulation checks passed.`);
} finally { await browser.close(); await new Promise(done => server.close(done)); }
