import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import vm from 'node:vm';
import {chromium} from 'playwright';

const root = resolve(import.meta.dirname, '..');
const prefix = '/bio-barrons-umf/';
const currentManifest = await readFile(resolve(root, 'assets/js/precache-manifest.js'), 'utf8');
// Retain the actual pre-glossary release without requiring Git history in CI.
const previousReleaseFixture = JSON.parse(await readFile(resolve(root, 'tests/fixtures/glossary-previous-worker.json'), 'utf8'));
const previousWorker = previousReleaseFixture.worker;
const previousManifest = previousReleaseFixture.manifest;
function manifest(source) {
  const context = {self: {}};
  vm.runInNewContext(source, context);
  return context.self.BIO_PRECACHE;
}
const current = manifest(currentManifest), previous = manifest(previousManifest);
assert.ok(current.assets.includes('glosar.html'), 'Run npm run generate before glossary offline tests');
assert.notEqual(current.cacheName, previous.cacheName, 'Upgrade test needs a release different from the pinned pre-glossary revision');
let previousRelease = false;
const types = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.woff2':'font/woff2'};
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (!pathname.startsWith(prefix)) throw Error('outside project');
    const relative = pathname.slice(prefix.length) || 'index.html';
    const target = resolve(root, relative);
    if (!target.startsWith(root + sep)) throw Error('outside root');
    const body = previousRelease && relative === 'sw.js' ? previousWorker
      : previousRelease && relative === 'assets/js/precache-manifest.js' ? previousManifest
      : await readFile(target);
    response.writeHead(200, {'content-type': types[extname(target)] || 'application/octet-stream', 'cache-control': 'no-store'});
    response.end(body);
  } catch {
    response.writeHead(404); response.end('Not found');
  }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}${prefix}`;
const browser = await chromium.launch({headless: true});
const errors = [];
async function install(context, cacheName) {
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + 'index.html');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.waitForFunction(async name => (await caches.keys()).includes(name), cacheName);
  await page.reload();
  assert.ok(await page.evaluate(() => !!navigator.serviceWorker.controller), 'worker must control the reload');
  return page;
}
async function unseen(page, url) {
  assert.equal(await page.evaluate(async href => !!await caches.match(href), base + url), false,
    'Query navigation must not already have an exact cached response: ' + url);
  const response = await page.goto(base + url);
  assert.equal(response.status(), 200);
  assert.ok(response.fromServiceWorker(), 'offline HTML must be served by the real worker');
  await page.waitForSelector('.glossary-entry');
}
async function exerciseOffline(context, page, label) {
  await context.setOffline(true);
  await unseen(page, 'glosar.html?q=ACETILCOLINA&exact=1');
  assert.equal(await page.locator('.glossary-entry').count(), 1);
  assert.equal(await page.locator('.glossary-entry h2').innerText(), 'acetilcolină');
  assert.equal(await page.getByLabel('Termen exact', {exact: true}).isChecked(), true);
  await page.reload();
  assert.equal(await page.locator('.glossary-entry h2').innerText(), 'acetilcolină');
  await unseen(page, 'glosar.html?letter=Z');
  assert.equal(await page.locator('.glossary-entry h2').innerText(), 'zigot');
  await unseen(page, 'glosar.html?q=abdomen&context=offline-unknown-context');
  assert.equal(await page.locator('#glossary-query').inputValue(), 'abdomen');
  assert.equal(await page.locator('#glossary-back').getAttribute('href'), 'index.html#lab-bento');
  await page.getByRole('searchbox', {name:'Caută în glosar', exact: true}).fill('abdom');
  await page.waitForFunction(() => !!document.querySelector('.glossary-entry mark'));
  await page.getByLabel('Termen exact', {exact: true}).check();
  await page.waitForSelector('#glossary-empty:not([hidden])');
  await page.getByRole('button', {name:'Șterge căutarea', exact:true}).click();
  await page.waitForSelector('.glossary-entry');
  assert.equal(await page.locator('.glossary-entry').count(), 25);

  // Both source shells were precached at installation; the glossary context URL
  // is first created while disconnected by the normal settings interaction.
  for (const source of ['celula_si_fiziologia_celulara.html', 'grile_sistemul_nervos.html#grila-76']) {
    const response = await page.goto(base + source);
    assert.ok(response.fromServiceWorker(), 'source should load from the worker');
    await page.waitForFunction(() => document.body.dataset.bbSharedReady === 'true');
    const active = await page.locator('.page-section.active').getAttribute('id');
    const sourceURL = page.url();
    await page.locator('.bb-settings-toggle').click();
    await page.locator('#nav-glossary-link').click();
    await page.waitForURL('**/glosar.html?context=*');
    await page.waitForSelector('.glossary-entry');
    const contextToken = new URL(page.url()).searchParams.get('context');
    assert.ok(contextToken, 'source interaction creates a context token');
    assert.equal(await page.locator('#glossary-back').textContent(), source.startsWith('grile_') ? 'Înapoi la grile' : 'Înapoi la lecție');
    await page.getByRole('searchbox', {name:'Caută în glosar', exact:true}).fill('abdomen');
    await page.getByLabel('Termen exact', {exact:true}).check();
    await page.waitForFunction(() => document.querySelectorAll('.glossary-entry').length === 1);
    assert.equal(new URL(page.url()).searchParams.get('context'), contextToken);
    await page.reload();
    await page.waitForSelector('.glossary-entry');
    assert.equal(await page.locator('.glossary-entry h2').innerText(), 'abdomen');
    await page.locator('#glossary-back').click();
    await page.waitForURL(sourceURL);
    await page.waitForFunction(id => document.querySelector('.page-section.active')?.id === id, active);
    assert.ok(await page.evaluate(() => !!navigator.serviceWorker.controller));
  }
  console.log(`${label}: offline unseen query/exact/letter/context URLs, reload, interactive search, and cached lesson/quiz return passed.`);
}
try {
  const fresh = await browser.newContext({reducedMotion:'reduce', viewport:{width:1440, height:900}});
  const page = await install(fresh, current.cacheName);
  await exerciseOffline(fresh, page, 'Fresh worker');
  await fresh.close();

  previousRelease = true;
  const upgrade = await browser.newContext({reducedMotion:'reduce', viewport:{width:1440, height:900}});
  const upgradePage = await install(upgrade, previous.cacheName);
  assert.equal(await upgradePage.evaluate(async () => !!await caches.match(new URL('glosar.html', location.href).href)), false,
    'Committed prior release must begin without a cached glossary');
  await upgradePage.evaluate(() => caches.open('unrelated-origin-cache'));
  previousRelease = false;
  await upgradePage.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    const oldController = navigator.serviceWorker.controller;
    await registration.update();
    if (navigator.serviceWorker.controller === oldController) {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(Error('Updated worker did not take control')), 30000);
        navigator.serviceWorker.addEventListener('controllerchange', () => { clearTimeout(timer); resolve(); }, {once:true});
      });
    }
  });
  await upgradePage.waitForFunction(async ({oldName, newName}) => {
    const names = await caches.keys();
    return names.includes(newName) && !names.includes(oldName);
  }, {oldName: previous.cacheName, newName: current.cacheName});
  assert.ok(await upgradePage.evaluate(async () => (await caches.keys()).includes('unrelated-origin-cache')),
    'upgrade must preserve unrelated origin caches');
  await upgradePage.reload();
  await exerciseOffline(upgrade, upgradePage, 'Committed previous worker upgraded');
  await upgrade.close();
  assert.deepEqual(errors, [], 'no page runtime errors');
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
