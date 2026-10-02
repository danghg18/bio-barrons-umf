import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const pageUrl = new URL('nou/index.html', root);
const html = await readFile(pageUrl, 'utf8');
const original = await readFile(new URL('index.html', root), 'utf8');
assert.match(original, /id="lab-bento"/);
assert.doesNotMatch(original, /nou\/homepage\.(?:css|js)|nou\/index\.html/);
assert.match(html, /href="\.\.\/index\.html#lab-bento"/);
assert.match(html, /href="\.\.\/testare\.html"/);
assert.match(html, /href="\.\.\/notite\.html"/);
assert.match(html, /href="\.\.\/index\.html">Varianta clasică/);
assert.doesNotMatch(html, /<style\b|<script(?![^>]*\bsrc=)[^>]*>/);
for (const shared of ['user-storage', 'auth-state', 'cloud-sync', 'account-ui']) {
  assert.match(html, new RegExp('src="\\.\\./assets/js/' + shared + '\\.js\\?'));
}

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'No duplicate IDs');
const references = [...html.matchAll(/\b(?:src|href|srcset)="([^"]+)"/g)].map(match => match[1]);
const cssFiles = ['nou/homepage.css', 'nou/transitions.css'];
for (const file of cssFiles) {
  const css = await readFile(new URL(file, root), 'utf8');
  for (const [, ref] of css.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) {
    const target = new URL(ref, new URL(file, root));
    assert.ok((await stat(target)).isFile(), `${file}: ${ref}`);
  }
}
for (const reference of references) {
  if (/^(https?:|data:|mailto:)/.test(reference)) continue;
  const target = new URL(reference, pageUrl);
  const hash = target.hash.slice(1);
  target.hash = ''; target.search = '';
  assert.ok(target.href.startsWith(root.href), `Reference outside project: ${reference}`);
  assert.ok((await stat(target)).isFile(), `Missing resource: ${reference}`);
  if (hash) {
    const source = await readFile(target, 'utf8');
    assert.ok(source.includes(`id="${hash}"`) || source.includes(`id="page-${hash}"`), `Missing fragment: ${reference}`);
  }
}

const context = vm.createContext({window:{}});
for (const file of ['assets/js/chapters-data.js','assets/js/grile-sistemul-nervos-data.js']) {
  vm.runInContext(await readFile(new URL(file, root), 'utf8'), context, {filename:file});
}
const before = vm.runInContext('JSON.stringify([CHAPTERS, window.BB_NERVOUS_QUIZ])', context);
vm.runInContext(await readFile(new URL('nou/home-data.js', root), 'utf8'), context);
assert.equal(vm.runInContext('JSON.stringify([CHAPTERS, window.BB_NERVOUS_QUIZ])', context), before, 'Canonical data remains unchanged');
assert.equal(vm.runInContext('window.BIOMED_HOME_DATA.question === window.BB_NERVOUS_QUIZ.questions.find(q => q.id === "sn-058")', context), true);
assert.equal(context.window.BIOMED_HOME_DATA.chapters.length, 17);
vm.runInContext(await readFile(new URL('nou/quiz-core.js', root), 'utf8'), context);
for (let mask=0; mask<32; mask++) {
  const selected = ['A','B','C','D','E'].filter((_, i) => mask & (1<<i));
  const result = context.window.BioMedHomeQuiz.score(selected, ['B','C','E']);
  assert.equal(result.exact, mask === 22);
}
for (const file of ['nou/homepage.js','nou/home-data.js','nou/quiz-core.js']) {
  const source = await readFile(new URL(file, root), 'utf8');
  assert.doesNotMatch(source, /localStorage|indexedDB|serviceWorker\.register|supabase/i);
  new vm.Script(source, {filename:fileURLToPath(new URL(file, root))});
}
console.log('PASS: separate homepage links/assets, canonical question, 32 answer sets and personal-data isolation.');
