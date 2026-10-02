import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';
import {loadSiteRegistry, publishedResources} from './site-registry.mjs';

const root = new URL('../', import.meta.url);
const registry = await loadSiteRegistry(root);
const {chapters, resources} = publishedResources(registry);
const files = [...new Set(['index.html', ...registry.BIO_SITE.pages.map(p => p.url), ...chapters.map(p => p.url), ...resources.map(p => p.url)])];
for (const file of files) {
  const destination = new URL('nou/' + (file === 'index.html' ? 'lectii.html' : file), root);
  const canonical = await readFile(new URL(file, root), 'utf8');
  const html = await readFile(destination, 'utf8');
  assert.match(html, /class="[^"]*softly-study/);
  assert.match(html, /href="study\.css\?v=/);
  assert.match(html, /src="study\.js\?v=/);
  assert.doesNotMatch(html, /fonts\.googleapis\.com/);
  assert.doesNotMatch(canonical, /softly-study|study\.css/);
  // All authored lesson sections remain byte-identical except relative asset references.
  const normalize = source => source.replace(/(?:src|href)="\.\.\/assets\//g, match => match.replace('../', '')).replace(/href="lectii\.html/g, 'href="index.html');
  const originalIds = [...canonical.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  const generatedIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  for (const id of originalIds) assert.ok(generatedIds.has(id), `${file}: preserved #${id}`);
  // The generated main body retains every educational text node and source figure.
  const text = source => source.split('<body')[1].split('</body>')[0].replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/<footer class="softly-edition-footer"[\s\S]*?<\/footer>/g, '').replace(/<[^>]+>/g, '').replace(/^[^>]*>/, '').replace(/\s+/g, ' ').trim();
  assert.equal(text(html), text(canonical), `${file}: authored text is unchanged`);
  const figures = source => [...source.matchAll(/<img\b[^>]*>/g)].map(m => normalize(m[0]));
  assert.deepEqual(figures(html), figures(canonical), `${file}: figures and alt text are unchanged`);
  for (const [,reference] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    if (/^(?:https?:|data:|mailto:|#)/.test(reference)) continue;
    const asset = new URL(reference, destination); asset.search = ''; asset.hash = '';
    assert.ok((await stat(asset)).isFile(), `${file}: ${reference}`);
  }
}
console.log(`PASS Softly generation: ${files.length} pages, authored text/IDs/figures preserved, local assets and classic isolation.`);
