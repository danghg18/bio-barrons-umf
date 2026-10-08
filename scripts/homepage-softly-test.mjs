import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {chromium} from 'playwright';

const root = resolve(import.meta.dirname, '..');
const prefix = '/bio-barrons-umf/';
const types = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.ttf':'font/ttf', '.webp':'image/webp', '.jpg':'image/jpeg'};
const server = http.createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://local').pathname);
    if (!path.startsWith(prefix)) throw Error();
    const relative = path.slice(prefix.length) + (path.endsWith('/') ? 'index.html' : '');
    const file = resolve(root, relative);
    if (!file.startsWith(root + sep)) throw Error();
    const body = await readFile(file);
    res.writeHead(200, {'Content-Type':types[extname(file)] || 'application/octet-stream'});
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}${prefix}`;
const browser = await chromium.launch();
try {
  const context = await browser.newContext({viewport:{width:775,height:688},serviceWorkers:'block'});
  await context.addInitScript({path:resolve(root, 'tests/supabase-mock.js')});
  await context.route('https://**/*', route => route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + 'nou/');
  await page.waitForSelector('#quiz-options input');
  await page.emulateMedia({media:'print'});
  for (const selector of ['.quiz-surface','.included','.pricing-intro','.plan','.diary-note','.faq']) {
    assert.equal(await page.locator(selector).first().evaluate(el => getComputedStyle(el).opacity), '1', `Print exposes ${selector} without scrolling first`);
  }
  await page.emulateMedia({media:'screen'});
  assert.equal(await page.locator('#pilot-account-toggle').count(), 1, 'The new homepage exposes the real shared account dialog');
  await page.locator('#pilot-account-toggle').click();
  await page.waitForSelector('#pilot-account-panel[open]');
  await page.getByLabel('Email', {exact:true}).fill('ana@example.test');
  await page.getByLabel('Parolă', {exact:true}).fill('test-password');
  await page.getByRole('button', {name:'Autentifică-te',exact:true}).click();
  await page.waitForFunction(() => window.BBAuth.getState().user?.email === 'ana@example.test');
  await page.waitForFunction(() => BBCloudSync.getState().status === 'synced');
  assert.match(await page.locator('.bb-account-email').innerText(), /ana@example.test/);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('#pilot-account-panel').open);
  assert.equal(await page.locator('#pilot-account-toggle').evaluate(el => el === document.activeElement), true, 'Closing the account returns focus');
  await page.locator('#step-1').click();
  await page.waitForFunction(() => document.querySelector('.scene-progress').getAttribute('aria-valuenow') === '50');
  assert.ok(Math.abs(await page.locator('.method-layout').evaluate(el => el.getBoundingClientRect().top) - 24) < 3, 'Story stays pinned at compact window size');
  await page.locator('#step-2').click();
  await page.waitForFunction(() => document.querySelector('.scene-progress').getAttribute('aria-valuenow') === '86');
  await page.locator('#step-0').click();
  await page.waitForFunction(() => document.querySelector('.scene-progress').getAttribute('aria-valuenow') === '12');
  assert.equal(await page.locator('#scene-0').getAttribute('aria-hidden'), 'false', 'Reverse scroll restores the lesson');
  const prior = await page.evaluate(() => JSON.stringify(BBUserStorage.snapshot()));
  for (const letter of ['B','C','E']) await page.locator(`#quiz-options input[value="${letter}"]`).check();
  await page.getByRole('button', {name:'Verifică răspunsul'}).click();
  await page.waitForSelector('#quiz-result:not([hidden])');
  assert.match(await page.locator('#result-title').innerText(), /Exact/);
  assert.equal(await page.evaluate(() => JSON.stringify(BBUserStorage.snapshot())), prior, 'Demo does not alter the signed-in study records');
  for (const width of [1440,1096,980,775,390,320]) {
    const height = width === 1440 ? 1000 : width === 980 ? 680 : width >= 775 ? 688 : 844;
    await page.setViewportSize({width,height});
    await page.waitForFunction(() => document.body.classList.contains('phone-story'), null, {timeout:5000});
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `No page overflow at ${width}px`);
    if (width >= 775) {
      for (const [index, progress] of [[0,12],[1,50],[2,86]]) {
        await page.locator(`#step-${index}`).click();
        await page.waitForFunction(progress => document.querySelector('.scene-progress').getAttribute('aria-valuenow') === String(progress), progress);
        const bottom = await page.locator('.scene-caption').evaluate(el => el.getBoundingClientRect().bottom);
        assert.ok(bottom <= height - 5, `Progress remains visible at ${width} × ${height}: ${bottom}`);
        assert.ok(await page.locator(`#scene-${index}`).evaluate(el => el.scrollHeight <= el.clientHeight + 1), `Active phone ${index} fits its educational content at ${width}px`);
      }
      const boxes = await page.locator('[data-scene]').evaluateAll(elements => elements.map(el => el.getBoundingClientRect().toJSON()));
      if (width >= 980) assert.ok(boxes[0].right < boxes[1].left && boxes[1].right < boxes[2].left, 'Three phone frames fit side by side');
      else assert.ok(Math.abs((boxes[2].left + boxes[2].right) / 2 - width / 2) < 2, 'Compact layout brings the active phone to the front and center');
    }
  }
  await page.getByRole('button', {name:'Deschide meniul',exact:true}).click();
  await page.waitForSelector('#mobile-menu.is-open');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'false');
  await page.locator('#step-2').click();
  await page.waitForFunction(() => document.querySelector('#scene-2').getAttribute('aria-hidden') === 'false');
  await page.locator('#step-2').press('ArrowLeft');
  assert.equal(await page.locator('#step-1').getAttribute('aria-selected'), 'true');
  for (const scene of await page.locator('[data-scene]').all()) assert.equal(await scene.isVisible(), true, 'All three phone frames stay visible on mobile');
  await page.waitForFunction(() => Math.abs(document.querySelector('#scene-1').getBoundingClientRect().left + document.querySelector('#scene-1').getBoundingClientRect().width / 2 - innerWidth / 2) < 2);
  await page.locator('#faq-question-1').click();
  await page.waitForFunction(() => document.querySelector('#faq-answer-1').getBoundingClientRect().height > 70);
  assert.equal(await page.locator('#faq-question-1').getAttribute('aria-expanded'), 'true');
  await page.locator('#faq-question-1').click();
  await page.waitForFunction(() => document.querySelector('#faq-answer-1').getBoundingClientRect().height < 1);
  await page.locator('#pilot-account-toggle').click();
  await page.getByRole('button', {name:'Deconectare',exact:true}).click();
  await page.waitForFunction(() => !BBAuth.getState().user);
  await page.getByLabel('Email', {exact:true}).fill('ana@example.test');
  await page.getByLabel('Parolă', {exact:true}).fill('wrong-password');
  await page.evaluate(() => __mock.failNext('auth', null, 'invalid_credentials'));
  await page.getByRole('button', {name:'Autentifică-te',exact:true}).click();
  await page.waitForSelector('#bb-account-message.is-error');
  assert.doesNotMatch(await page.locator('#bb-account-message').innerText(), /mock|database|secret/);
  await page.evaluate(() => __mock.offline(true));
  assert.match(await page.locator('#bb-account-status').innerText(), /offline/i);
  await page.getByRole('button', {name:'Autentifică-te',exact:true}).click();
  assert.equal(await page.evaluate(() => BBAuth.getState().user), null);
  await page.evaluate(() => __mock.offline(false));
  await page.getByRole('button', {name:'Am uitat parola',exact:true}).click();
  await page.getByRole('button', {name:'Trimite linkul de resetare',exact:true}).click();
  await page.waitForFunction(() => document.querySelector('#bb-account-message').textContent.includes('îl vei găsi în email'));
  const redirect = await page.evaluate(() => __mock.calls().find(call => call.operation === 'resetPasswordForEmail').payload.options.redirectTo);
  assert.equal(redirect, base + 'nou/cont.html?flow=recovery');
  await page.keyboard.press('Escape');
  await page.locator('[data-account-open="signup"]').click();
  await page.waitForSelector('#pilot-account-panel[open]');
  assert.equal(await page.locator('#pilot-account-title').innerText(), 'Creează un cont');
  await page.getByLabel('Email', {exact:true}).fill('bogdan@example.test');
  await page.getByLabel('Parolă', {exact:true}).fill('test-password');
  await page.evaluate(() => __mock.requireConfirmation(true));
  await page.getByRole('button', {name:'Creează contul',exact:true}).click();
  await page.waitForFunction(() => document.querySelector('#bb-account-message').textContent.startsWith('Verifică emailul'));
  assert.equal(await page.evaluate(() => BBAuth.getState().user), null);
  await page.getByRole('button', {name:'Înapoi la autentificare',exact:true}).click();
  await page.getByLabel('Parolă', {exact:true}).fill('test-password');
  await page.getByRole('button', {name:'Autentifică-te',exact:true}).click();
  await page.waitForFunction(() => BBAuth.getState().user?.email === 'bogdan@example.test' && BBCloudSync.getState().status === 'synced');
  assert.equal(await page.evaluate(() => BBUserStorage.owner()), '22222222-2222-4222-8222-222222222222');
  assert.match(await page.locator('.bb-account-email').innerText(), /bogdan@example.test/);
  await page.keyboard.press('Escape');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(() => !document.body.classList.contains('scroll-story'));
  for (const scene of await page.locator('[data-scene]').all()) assert.equal(await scene.isVisible(), true);
  assert.equal(await page.locator('#testimonials [data-demo-testimonial]').count(), 3);
  assert.match(await page.locator('#pricing').innerText(), /Prețuri demonstrative/);
  assert.deepEqual(errors, []);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(base + 'nou/?bookmark=1#pricing');
  await page.waitForFunction(() => Math.abs(document.querySelector('#pricing').getBoundingClientRect().top - 110) < 8, null, {timeout:5000}).catch(async error => {
    console.log('Bookmark diagnostic', await page.evaluate(() => ({scrollY, height:innerHeight, target:document.querySelector('#pricing').getBoundingClientRect().top, padding:getComputedStyle(document.documentElement).scrollPaddingTop, hash:location.hash, story:ScrollTrigger.getById('biomed-story')?.end})));
    throw error;
  });
  await page.goto(base + 'nou/cont.html?flow=recovery#example=preserved');
  await page.waitForURL(base + 'nou/cont.html?flow=recovery#example=preserved');
  assert.equal(await page.locator('body.softly-study').count(),1);
  await context.close();
  console.log('PASS Softly: login/logout, signup confirmation, recovery callback, safe errors, offline and account change; demo isolation; forward/reverse compact pin, 3 phones, 6 widths, keyboard/menu/FAQ, reduced motion, print, direct bookmarks and demo disclosures.');
} finally { await browser.close(); await new Promise(done => server.close(done)); }
