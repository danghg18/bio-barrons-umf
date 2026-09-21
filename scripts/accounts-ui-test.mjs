import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile, mkdir} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {chromium} from 'playwright';

const root = resolve(import.meta.dirname, '..');
const prefix = '/bio-barrons-umf/';
const types = {'.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.json':'application/json'};
const server = http.createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, path.slice(prefix.length) || 'index.html');
    if (!path.startsWith(prefix) || !file.startsWith(root + sep)) throw Error('not found');
    res.writeHead(200, {'Content-Type':types[extname(file)] || 'application/octet-stream'});
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}${prefix}`;
const browser = await chromium.launch({headless:true});
const output = process.env.BB_ACCOUNTS_OUTPUT || '/tmp/bb-account-redesign-review';
await mkdir(output, {recursive:true});
let count = 0;
async function test(name, run) {
  if (process.env.BB_ACCOUNTS_CASE && !name.includes(process.env.BB_ACCOUNTS_CASE)) return;
  await run(); count++; console.log('PASS ' + name);
}
async function visit({entry='cont.html', blockedStorage=false, mock=true} = {}) {
  const context = await browser.newContext({viewport:{width:1440,height:900}, serviceWorkers:'block', reducedMotion:'reduce'});
  await context.route('**/assets/js/supabase-config.js*', route => route.fulfill({contentType:'text/javascript', body:"window.BB_SUPABASE_CONFIG = {url:'',publishableKey:''};"}));
  await context.route('https://*.supabase.co/**', route => route.abort('blockedbyclient'));
  if (mock) await context.addInitScript({path:resolve(root, 'tests/supabase-mock.js')});
  if (blockedStorage) await context.addInitScript(() => Object.defineProperty(window, 'localStorage', {configurable:true, get(){throw new DOMException('Storage blocked', 'SecurityError');}}));
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + entry);
  await page.waitForFunction(() => window.BBAccountUI && window.BBAuth?.getState().initialized);
  return {page, context, errors};
}
async function credentials(page, email='ana@example.test') {
  await page.locator('#bb-auth-email').fill(email);
  await page.locator('#bb-auth-password').fill('Test-password-123!');
}
async function synced(page) { await page.waitForFunction(() => window.BBCloudSync?.getState().status === 'synced'); }
async function exported(page) {
  const downloaded = page.waitForEvent('download');
  await page.locator('#bb-cache-export').click();
  return JSON.parse(await readFile(await (await downloaded).path(), 'utf8'));
}
try {
  await test('account page presents its working form inline without trapping page navigation', async () => {
    const {page, context, errors} = await visit();
    assert.equal(await page.locator('main .bb-account-form').count(), 1, 'The account form belongs to the page content');
    assert.equal(await page.locator('dialog[open]').count(), 0, 'Account entry does not cover the page with a modal');
    await credentials(page);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#bb-auth-password').inputValue(), 'Test-password-123!', 'Escape does not close or reset an inline form');
    const returnLink = page.getByRole('link', {name:'Înapoi la lecții', exact:true});
    await returnLink.focus();
    assert.equal(await returnLink.evaluate(node => node === document.activeElement), true, 'Page navigation remains reachable while signing in');
    await page.getByRole('button', {name:'Autentifică-te', exact:true}).click();
    await synced(page);
    assert.equal(await page.locator('.bb-account-email').innerText(), 'ana@example.test');
    await page.getByRole('button', {name:'Deconectare', exact:true}).click();
    await page.waitForFunction(() => !BBAuth.getState().user);
    await page.getByRole('button', {name:'Creează un cont', exact:true}).click();
    await page.evaluate(() => __mock.requireConfirmation(true));
    await credentials(page);
    await page.getByRole('button', {name:'Creează contul', exact:true}).click();
    await page.waitForFunction(() => document.querySelector('#bb-account-message').textContent.includes('confirm'));
    assert.equal(await page.locator('#bb-account-message').isVisible(), true, 'Confirmation feedback stays outside collapsed options');
    assert.equal(await page.locator('#bb-account-message').evaluate(node => Boolean(node.closest('details'))), false);
    assert.deepEqual(errors, []); await context.close();
  });
  await test('account secondary data tools stay grouped while export preserves the current owner', async () => {
    const {page, context, errors} = await visit();
    assert.equal(await page.locator('#bb-cache-export').isVisible(), false, 'Routine backup tools start collapsed');
    await credentials(page);
    await page.getByRole('button', {name:'Autentifică-te', exact:true}).click(); await synced(page);
    await page.evaluate(() => { __mock.failNext('upsert', 'study_state', '42501'); BBStudyState.completeSection(1, 'introducere'); });
    await page.waitForFunction(() => BBCloudSync.getState().status === 'error');
    assert.equal(await page.locator('#bb-sync-retry').isVisible(), true, 'Synchronization errors can be retried while data options stay closed');
    assert.equal(await page.locator('.bb-account-options').evaluate(node => node.open), false);
    await page.locator('#bb-sync-retry').click(); await synced(page);
    await page.evaluate(() => BBUserStorage.set('note:1:introducere', {chapter_num:1,section_id:'introducere',body:'Notița A',updated_at:'2026-09-19T10:00:00.000Z'}));
    await synced(page);
    await page.locator('.bb-account-options summary').click();
    const first = await exported(page);
    assert.equal(first.values['note:1:introducere'].body, 'Notița A');
    assert.doesNotMatch(JSON.stringify(first), /Test-password|test-only-token|test-only-refresh/);
    await page.getByRole('button', {name:'Deconectare', exact:true}).click();
    await page.waitForFunction(() => !BBAuth.getState().user);
    await credentials(page, 'bogdan@example.test');
    await page.getByRole('button', {name:'Autentifică-te', exact:true}).click(); await synced(page);
    if (!await page.locator('#bb-cache-export').isVisible()) await page.locator('.bb-account-options summary').click();
    assert.doesNotMatch(JSON.stringify(await exported(page)), /Notița A/, 'Export never includes another account’s local notes');
    assert.deepEqual(errors, []); await context.close();
  });
  await test('storage failure exposes export immediately without expanding account options', async () => {
    const {page, context, errors} = await visit({blockedStorage:true});
    assert.equal(await page.locator('.bb-account-options').evaluate(node => node.open), false);
    assert.equal(await page.locator('#bb-cache-export').isVisible(), true, 'Volatile data can be exported without finding a hidden option');
    assert.match(await page.locator('#bb-account-status').innerText(), /Stocarea locală nu este disponibilă/);
    await credentials(page); await page.getByRole('button', {name:'Autentifică-te', exact:true}).click(); await synced(page);
    await page.evaluate(() => BBStudyState.completeSection(1, 'introducere')); await synced(page);
    const data = await exported(page);
    assert.ok(JSON.stringify(data.values).includes('introducere'));
    assert.deepEqual(errors, []); await context.close();
  });
  await test('reset callbacks and configuration errors stay visible in the inline account surface', async () => {
    const {page, context, errors} = await visit({entry:'cont.html?flow=recovery'});
    assert.equal(await page.locator('#bb-account-message.is-error').isVisible(), true);
    await page.getByRole('button', {name:'Am uitat parola', exact:true}).click();
    await page.locator('#bb-auth-email').fill('ana@example.test');
    await page.getByRole('button', {name:'Trimite linkul de resetare', exact:true}).click();
    await page.waitForFunction(() => document.querySelector('#bb-account-message').textContent.includes('email'));
    await page.evaluate(() => { __mock.setUser('a'); __mock.recovery(); });
    await page.getByRole('button', {name:'Salvează parola', exact:true}).waitFor();
    assert.equal(await page.locator('dialog[open]').count(), 0);
    await page.locator('#bb-auth-password').fill('New-password-123!');
    await page.getByRole('button', {name:'Salvează parola', exact:true}).click();
    await page.waitForFunction(() => !BBAuth.getState().recovery);
    assert.match(await page.locator('#bb-account-message').innerText(), /actualizată/);
    assert.deepEqual(errors, []); await context.close();
    const unconfigured = await visit({mock:false});
    assert.equal(await unconfigured.page.locator('#bb-account-status').isVisible(), true);
    assert.match(await unconfigured.page.locator('#bb-account-status').innerText(), /nu sunt încă configurate/);
    assert.equal(await unconfigured.page.locator('.bb-account-form').count(), 0);
    assert.deepEqual(unconfigured.errors, []); await unconfigured.context.close();
  });
  await test('account page fits desktop and phone while other pages keep modal focus behavior', async () => {
    const {page, context, errors} = await visit();
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width,height:900});
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.screenshot({path:resolve(output, 'account-inline-' + width + '.png'), fullPage:true});
    }
    await page.goto(base + 'celula_si_fiziologia_celulara.html#membrana');
    await page.waitForFunction(() => Boolean(window.BBAccountUI));
    await page.locator('#pilot-account-toggle').click();
    assert.equal(await page.locator('#pilot-account-panel').evaluate(node => node instanceof HTMLDialogElement && node.open), true);
    assert.equal(await page.locator('#bb-auth-email').evaluate(node => node === document.activeElement), true);
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('#pilot-account-panel').evaluate(node => node.contains(document.activeElement)), true, 'Account focus remains inside the dialog after Tab ' + i);
    }
    await page.locator('.bb-account-options summary').focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('#bb-cache-export').evaluate(node => node === document.activeElement), true, 'Expanded backup tools are keyboard reachable');
    await page.keyboard.press('Tab');
    assert.equal(await page.getByRole('button', {name:'Închide contul', exact:true}).evaluate(node => node === document.activeElement), true, 'Tab wraps from the last expanded control');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.locator('#bb-cache-export').evaluate(node => node === document.activeElement), true, 'Reverse Tab wraps to the last expanded control');
    await page.screenshot({path:resolve(output, 'account-dialog-320.png')});
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#pilot-account-panel').evaluate(node => node.open), false);
    assert.equal(await page.locator('#pilot-account-toggle').evaluate(node => node === document.activeElement), true);
    assert.deepEqual(errors, []); await context.close();
  });
  console.log(`Account UI: ${count} scenarios passed.`);
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
