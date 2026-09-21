import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

// Standalone focused suite: node scripts/search-highlighter-test.mjs
// BB_SEARCH_BASE may point to an existing server, including its Pages prefix.
const root = fileURLToPath(new URL('../', import.meta.url));
const prefix = '/bio-barrons-umf/';
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' };
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (!pathname.startsWith(prefix)) throw new Error('outside prefix');
    const target = normalize(join(root, pathname.slice(prefix.length) || 'index.html'));
    if (!target.startsWith(root)) throw new Error('outside root');
    const body = await readFile(target);
    response.writeHead(200, { 'content-type': mime[extname(target)] || 'application/octet-stream', 'cache-control': 'no-store' });
    response.end(body);
  } catch {
    response.writeHead(404); response.end('Not found');
  }
});
if (!process.env.BB_SEARCH_BASE) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = process.env.BB_SEARCH_BASE || `http://127.0.0.1:${server.address().port}${prefix}`;


const browser = await chromium.launch({headless:true});
const context = await browser.newContext({serviceWorkers:'block'});
const page = await context.newPage();
page.setDefaultTimeout(5000);
const fixture = '<p id="multiword-fixture">RegMultiȚesut <strong>membrană</strong>\n plasmatică susține transportul <em>activ</em> de sodiu la 100%.</p><p>RegSeparate</p><p>MissingTerm</p>';
try {
  for(const file of ['celula_si_fiziologia_celulara.html', 'sistemul_renal_complet.html', 'sistemul_reproducator_masculin.html']){
    await page.route('**/' + file + '*', async route => {
      const response = await route.fetch();
      const html = (await response.text()).replace(/<(?:div|section)[^>]*class="[^"]*page-section[^>]*>/, '$&' + fixture);
      await route.fulfill({response, body:html});
    });
  }
  for(const [file, query, expected] of [
    ['celula_si_fiziologia_celulara.html','regmultitesut membrana plasmatica','RegMultiȚesut membrană plasmatică'],
    ['sistemul_renal_complet.html','regmultitesut   activ  sodiu','RegMultiȚesut activ sodiu'],
    ['sistemul_reproducator_masculin.html','regmultitesut sodiu 100%','RegMultiȚesut sodiu 100%'],
  ]){
    await page.goto(base);
    await page.locator('#search-btn').click();
    await page.locator('#palette-input').fill(query);
    await page.waitForSelector('[data-hit]', {state:'attached'});
    const result = page.locator(`[data-url="${file}"][data-hit]`).first();
    assert.ok(await result.count(), 'phrase/terms must match across authored inline elements');
    await page.locator(`details[data-chapter="${file}"] > summary`).click();
    await result.click();
    await page.waitForSelector('#multiword-fixture .search-found-current');
    const text = await page.locator('#multiword-fixture .search-found-current').allTextContents();
    assert.equal(text.join(' ').replace(/\s+/g,' ').trim(),expected);
    console.log('PASS multiword home-to-lesson',file,query);
  }
  await page.goto(base);
  await page.locator('#search-btn').click();
  await page.locator('#palette-input').fill('RegSeparate MissingTerm');
  await page.waitForSelector('.lab-palette-empty');
  assert.equal(await page.locator('[data-hit]').count(),0,'terms in unrelated paragraphs must not match');
  console.log('PASS terms remain in one passage');
} finally { await browser.close();server.close(); }
