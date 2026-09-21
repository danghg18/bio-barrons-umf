import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import vm from 'node:vm';
import {chromium} from 'playwright';

const root = resolve(import.meta.dirname, '..');
const prefix = '/bio-barrons-umf/';
const output = process.env.BB_COMPACT_OUTPUT || '/tmp/bb-site-compact-review';
const registry = vm.runInNewContext(await readFile(resolve(root, 'assets/js/chapters-data.js'), 'utf8') + '\n({site:BIO_SITE,chapters:CHAPTERS})');
const lessons = registry.chapters.filter(chapter => chapter.done && chapter.url).map(chapter => chapter.url);
const quizzes = [...new Set(registry.chapters.flatMap(chapter => (chapter.resources || []).filter(resource => resource.kind === 'quiz').map(resource => resource.url)))];
const general = ['index.html', ...registry.site.pages.map(page => page.url)];
const pages = [...general, ...lessons, ...quizzes];
assert.deepEqual([lessons.length, quizzes.length, general.length, new Set(pages).size], [17, 7, 6, 30], 'The registry must cover all 30 public pages');

const types = {'.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.json':'application/json', '.ttf':'font/ttf'};
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = resolve(root, pathname.slice(prefix.length) || 'index.html');
    if (!pathname.startsWith(prefix) || !file.startsWith(root + sep)) throw Error('not found');
    response.writeHead(200, {'Content-Type':types[extname(file)] || 'application/octet-stream'});
    response.end(await readFile(file));
  } catch { response.writeHead(404); response.end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}${prefix}`;
const browser = await chromium.launch({headless:true});
await mkdir(output, {recursive:true});
const failures = [];
let passed = 0;
async function check(name, run) {
  try { await run(); passed++; }
  catch (error) { failures.push({name, message:error.message}); console.error('FAIL ' + name + ': ' + error.message); }
}
async function contextAt(width) {
  const context = await browser.newContext({viewport:{width,height:900}, serviceWorkers:'block', reducedMotion:'reduce'});
  await context.route('**/assets/js/supabase-config.js*', route => route.fulfill({contentType:'text/javascript', body:"window.BB_SUPABASE_CONFIG = {url:'',publishableKey:''};"}));
  await context.route('https://*.supabase.co/**', route => route.abort('blockedbyclient'));
  await context.addInitScript({path:resolve(root, 'tests/supabase-mock.js')});
  return context;
}
async function ready(page, file) {
  const response = await page.goto(base + file, {waitUntil:'load'});
  assert.equal(response.status(), 200, file + ' must load under the Pages subpath');
  if (lessons.includes(file) || quizzes.includes(file)) await page.waitForFunction(() => document.body.dataset.bbSharedReady === 'true');
  if (await page.evaluate(() => !!window.BBAuth)) await page.evaluate(() => BBAuth.ready);
  if (file === 'glosar.html') await page.waitForSelector('.glossary-entry');
  if (file === 'statistici.html' || file === 'testare.html') await page.waitForFunction(() => document.body.dataset.analyticsReady === 'true');
  if (file === 'cont.html') await page.waitForSelector('main .bb-account-form');
  await page.evaluate(() => document.fonts.ready);
}
const representatives = new Set(['index.html','testare.html','celula_si_fiziologia_celulara.html','sistemul_nervos.html','sistemul_renal_complet.html','sistemul_reproducator_masculin.html','grile_celula.html','glosar.html','cont.html','statistici.html']);
async function capture(page, name, width) { await page.screenshot({path:resolve(output, name + '-' + width + '.png')}); }

try {
  for (const width of [1440,768,390,320]) {
    const context = await contextAt(width);
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const file of pages) {
      await check(file + ' at ' + width, async () => {
        errors.length = 0;
        await ready(page, file);
        if ([1440,390].includes(width) && representatives.has(file)) await capture(page, file.replace('.html',''), width);
        assert.ok(await page.locator('main h1:visible').count(), 'A visible page heading is required');
        const geometry = await page.evaluate(() => {
          const header = document.querySelector('.lab-topbar'), box = header.getBoundingClientRect(), style = getComputedStyle(header);
          const heading = document.querySelector('main h1');
          return {width:innerWidth, scroll:document.documentElement.scrollWidth, header:{left:box.left,right:box.right,top:box.top,bottom:box.bottom,radius:parseFloat(style.borderTopLeftRadius)},heading:heading?.textContent.trim()};
        });
        assert.ok(geometry.scroll <= width + 1, 'Horizontal overflow: ' + JSON.stringify(geometry));
        assert.ok(geometry.header.left >= 8 && geometry.header.right <= width - 8 && geometry.header.top >= 8, 'The shared header must remain detached from viewport edges: ' + JSON.stringify(geometry.header));
        assert.ok(geometry.header.radius >= 20, 'The shared header retains its rounded surface');
        assert.equal(await page.locator('.lab-topbar .lab-brand-name').textContent(), 'BioMed');
        assert.equal(await page.locator('.bm-primary-nav a').count(), 2);
        const covered = await page.locator('.lab-topbar a:visible,.lab-topbar button:visible').evaluateAll(nodes => nodes.filter(node => {
          const box = node.getBoundingClientRect();
          if (!box.width || !box.height || node.disabled) return false;
          return !node.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
        }).map(node => node.getAttribute('aria-label') || node.textContent.trim()));
        assert.deepEqual(covered, [], 'Header controls must remain reachable without overlap');
        const overlapping = await page.locator('.lab-topbar a:visible,.lab-topbar button:visible').evaluateAll(nodes => {
          const controls = nodes.filter(node => !node.disabled).map(node => ({node, box:node.getBoundingClientRect(), name:node.getAttribute('aria-label') || node.textContent.trim()})).filter(control => control.box.width && control.box.height);
          const pairs = [];
          for (let i = 0; i < controls.length; i++) {
            for (let j = i + 1; j < controls.length; j++) {
              const a = controls[i], b = controls[j];
              if (a.node.contains(b.node) || b.node.contains(a.node)) continue;
              const width = Math.min(a.box.right, b.box.right) - Math.max(a.box.left, b.box.left);
              const height = Math.min(a.box.bottom, b.box.bottom) - Math.max(a.box.top, b.box.top);
              if (width > .5 && height > .5) pairs.push({first:a.name, second:b.name, width, height});
            }
          }
          return pairs;
        });
        assert.deepEqual(overlapping, [], 'The full rectangles of header controls must not overlap, including navigation links and action-button edges');
        if (width === 1440 && (lessons.includes(file) || quizzes.includes(file))) {
          const sidebar = await page.locator('#sidenav').evaluate(node => {
            const box = node.getBoundingClientRect();
            return {inert:node.inert,width:box.width,left:box.left,right:box.right,top:box.top,bottom:box.bottom,display:getComputedStyle(node).display};
          });
          assert.ok(!sidebar.inert && sidebar.display !== 'none' && sidebar.width > 150 && sidebar.left >= 0 && sidebar.right < width && sidebar.top < 200 && sidebar.bottom > sidebar.top, 'Desktop contents remain open: ' + JSON.stringify(sidebar));
        }
        if (file === 'cont.html') assert.equal(await page.locator('dialog[open]').count(), 0, 'Account form stays inline');
        if (file === 'index.html') {
          assert.equal((await page.locator('#pilot-hero-title').innerText()).replace(/\s+/g,' '), 'Biologie, pe înțelesul tău.', 'The original homepage introduction is retained');
          const chapters = page.locator('#lab-bento a.lab-item');
          assert.equal(await chapters.count(), lessons.length, 'Homepage lists every published chapter');
          assert.deepEqual(await chapters.evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), [...lessons]);
          assert.equal(await page.locator('#pilot-demo-question').isVisible(), true, 'The working demo is visible in the homepage introduction');
          assert.equal(await page.locator('#pilot-demo-question input').count(), 5, 'All demo answers remain available');
          const copy = await page.locator('.pilot-hero-copy').boundingBox(), demo = await page.locator('.pilot-hero > .pilot-demo').boundingBox();
          if (width > 900) assert.ok(demo.x >= copy.x + copy.width && demo.y < copy.y + copy.height, 'Desktop demo sits beside the introduction');
          else assert.ok(demo.y >= copy.y + copy.height, 'Narrow layouts stack the full demo below the introduction');
          await page.locator('.pilot-hero-copy a[href="#lab-bento"]').click();
          assert.equal(new URL(page.url()).hash, '#lab-bento', 'The hero links directly to the chapter catalog');
          assert.ok(await page.locator('#lab-bento').evaluate(node => { const box = node.getBoundingClientRect(); return box.top >= 0 && box.top < innerHeight; }), 'Hero action brings the catalog into view');
        }
        if (file === 'testare.html') {
          assert.equal((await page.locator('#testing-title').innerText()).replace(/\s+/g,' '), 'Ce ai învățat, pus în practică.', 'The original testing introduction is retained');
          assert.equal(await page.locator('#testing-activity').isVisible(), true, 'The real progress and activity panel is present');
          const intro = await page.locator('.testing-intro').boundingBox(), preview = await page.locator('.testing-preview').boundingBox();
          if (width > 700) assert.ok(preview.x >= intro.x + intro.width && preview.y < intro.y + intro.height, 'Testing preview sits beside the introduction');
          else assert.ok(preview.y >= intro.y + intro.height, 'Testing preview stacks below the introduction on phones');
          await page.locator('.testing-intro a[href="#lab-testing-catalog"]').click();
          assert.equal(new URL(page.url()).hash, '#lab-testing-catalog');
          assert.ok(await page.locator('#lab-testing-catalog').evaluate(node => { const box = node.getBoundingClientRect(); return box.top >= 0 && box.top < innerHeight; }), 'Testing hero action brings chapters into view');
        }
        assert.deepEqual(errors, [], 'Page JavaScript must not throw');
      });
    }
    console.log('Checked all 30 public pages at ' + width + 'px.');
    await context.close();
  }
  for (const width of [1440,390]) {
    const context = await contextAt(width), page = await context.newPage();
    page.setDefaultTimeout(15000);
    await check('Homepage demo and visible resume at ' + width, async () => {
      await ready(page, 'index.html');
      assert.equal(await page.locator('#pilot-demo-question').isVisible(), true);
      for (const letter of ['B','C','E']) await page.locator('#pilot-demo-question input[value="' + letter + '"]').check();
      await page.locator('#pilot-demo-check').click();
      assert.match(await page.locator('#pilot-demo-feedback').textContent(), /Corect/);
      assert.equal(await page.evaluate(() => BBUserStorage.get('bb.quiz.sistem-nervos.v1')), null, 'Demo does not create quiz progress');
      assert.equal((await page.evaluate(() => BBAuth.perform('login','ana@example.test','Test-password-123!'))).ok, true);
      await page.waitForFunction(() => BBCloudSync.getState().status === 'synced');
      await page.evaluate(() => BBStudyState.recordVisit(3,'membrana'));
      await page.waitForSelector('#lab-continue:not([hidden])');
      assert.equal(await page.locator('#lab-continue').evaluate(node => !!node.closest('main') && !node.closest('dialog,.bb-account-panel,#pilot-account-panel')), true, 'Resume belongs to the homepage, outside account UI');
      assert.match(await page.locator('#lab-continue-link').getAttribute('href'), /celula_si_fiziologia_celulara\.html#membrana$/);
      await page.locator('#lab-continue-link').scrollIntoViewIfNeeded();
      assert.ok(await page.locator('#lab-continue-link').evaluate(node => { const box = node.getBoundingClientRect(); return node.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)); }), 'Saved study remains reachable without opening account UI');
      await capture(page, 'index-resume', width);
    });
    await check('Authenticated notebook and open paper at ' + width, async () => {
      await ready(page, 'notite.html');
      if (!await page.evaluate(() => !!BBAuth.getState().user)) {
        assert.equal((await page.evaluate(() => BBAuth.perform('login','ana@example.test','Test-password-123!'))).ok, true);
        await page.waitForFunction(() => BBCloudSync.getState().status === 'synced');
      }
      await page.waitForSelector('.nb-cover');
      assert.equal(await page.locator('.nb-cover').count(), lessons.length);
      await capture(page, 'notite-library', width);
      await page.locator('.nb-cover[data-chapter="3"]').click();
      await page.waitForFunction(() => document.querySelector('#notebooks')?.dataset.sectionsReady === 'true');
      assert.equal(await page.locator('.nb-entry').count(), 9);
      assert.equal(await page.locator('.nb-paper').evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(255, 254, 249)');
      assert.match(await page.locator('.nb-paper h1').evaluate(node => getComputedStyle(node).fontFamily), /Caveat/);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await capture(page, 'notite-paper', width);
    });
    await context.close();
  }
  await writeFile(resolve(output, 'report.json'), JSON.stringify({pages:[...pages],widths:[1440,768,390,320],passed,failures}, null, 2) + '\n');
  assert.equal(failures.length, 0, 'Compact UI regressions; full details in ' + resolve(output,'report.json'));
  console.log('Compact site UI: 30 pages × 4 widths, detached accessible headers, visible desktop contents, responsive homepage introduction and working demo, catalog CTA, direct resume and notebook paper passed. Captures: ' + output);
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
