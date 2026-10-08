import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const description = 'Componentele trunchiului cerebral și ale diencefalului';
const attributes = tag => Object.fromEntries(
  [...tag.matchAll(/\b([\w-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value])
);

for (const [catalog, lesson] of [
  ['index.html', 'sistemul_nervos.html'],
  ['nou/lectii.html', 'nou/sistemul_nervos.html'],
  ['nou/index.html', 'nou/sistemul_nervos.html']
]) {
  const catalogUrl = new URL(catalog, root);
  const lessonUrl = new URL(lesson, root);
  const [catalogHtml, lessonHtml] = await Promise.all([
    readFile(catalogUrl, 'utf8'), readFile(lessonUrl, 'utf8')
  ]);
  const demoFigures = [...catalogHtml.matchAll(/<img\b[^>]*>/g)]
    .map(([tag]) => attributes(tag))
    .filter(image => image.alt === description);
  assert.equal(demoFigures.length, 1, `${catalog}: lesson preview image must exist and be unambiguous`);
  const currentFigures = [...lessonHtml.matchAll(/<img\b[^>]*>/g)]
    .map(([tag]) => attributes(tag))
    .filter(image => image.alt === description);
  assert.equal(currentFigures.length, 1, `${lesson}: matching current lesson figure must be unambiguous`);
  const current = currentFigures[0];
  const demo = demoFigures[0];
  assert.ok(current.src && demo.src, `${catalog}: both images must have a source`);
  const currentAsset = new URL(current.src, lessonUrl);
  assert.ok(currentAsset.href.startsWith(root.href), `${lesson}: figure must use a local asset`);
  assert.equal(new URL(demo.src, catalogUrl).href, currentAsset.href,
    `${catalog}: preview must reuse the current lesson figure`);
  assert.ok((await stat(currentAsset)).isFile(), `${catalog}: preview asset must exist`);
  for (const name of ['alt', 'width', 'height']) {
    assert.ok(current[name], `${lesson}: figure must declare ${name}`);
    assert.equal(demo[name], current[name], `${catalog}: preview ${name} must match its lesson figure`);
  }
}

console.log('PASS: classic and /nou lesson previews reuse their current local lesson figure and dimensions.');
