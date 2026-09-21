import assert from 'node:assert/strict';
import { test } from 'node:test';
import { extractNotebookSections } from './notebook-sections.mjs';

test('keeps authored route order, excluded routes and the notebook title fallback rules', () => {
  const source = `
    <nav><a href="#home"> Prima <span>pagină</span> &amp; cuprins </a></nav>
    <nav><a href="#home">Nu înlocuiește primul titlu</a></nav>
    <div class="page-section active" id="page-home"><h1>Titlul capitolului</h1></div>
    <div id='page-legacy' data-curriculum-excluded class='page-section'>
      <h2> Primul <em>titlu</em><br>al secțiunii </h2>
      <div class="page-title">Alt titlu, mai târziu în document</div>
    </div>
    <section class=page-section id=page-empty><p>Fără titlu</p></section>
    <section class="page-section" id="page-whitespace"><h1>  </h1></section>`;
  assert.deepEqual(extractNotebookSections(source), [
    { id: 'home', title: 'Prima pagină & cuprins' },
    { id: 'legacy', title: 'Primul titlual secțiunii' },
    { id: 'empty', title: 'empty' },
    { id: 'whitespace', title: '' }
  ]);
});

test('decodes named/numeric entities as textContent while preserving child text boundaries', () => {
  const source = `<nav><a href="&#35;home">&nbsp;</a></nav>
    <div class="page-section" id="page-home"><h1>Fallback</h1></div>
    <div class="page-section" id="page-entities"><h1>
      Știință &amp; &#x218; &#539; &NotEqualTilde; &copy &madeup; &#0; &#x80;
      &amp<span>;</span>
    </h1></div>`;
  assert.deepEqual(extractNotebookSections(source), [
    { id: 'home', title: '' },
    { id: 'entities', title: 'Știință & Ș ț ≂̸ © &madeup; � €\n      &;' }
  ]);
});

test('ignores fake markup in comments, raw text and templates and respects quoted attributes', () => {
  const source = `<!-- <div class="page-section" id="page-comment"><h1>Fake</h1></div> -->
    <script>const fake = '<div class="page-section" id="page-script">';</script>
    <template><div class="page-section" id="page-template"><h1>Fake</h1></div></template>
    <div title="a > b" class="page-section" id="page-real">
      <h1>Real<!-- omit --><span title='x > y'> &lt;text&gt;</span><template>omit</template></h1>
    </div>`;
  assert.deepEqual(extractNotebookSections(source), [{ id: 'real', title: 'Real <text>' }]);
});

test('rejects missing, empty and duplicate section routes before emitting a catalog', () => {
  assert.throws(() => extractNotebookSections('<main><h1>No sections</h1></main>', 'empty.html'), /No notebook sections.*empty\.html/);
  assert.throws(() => extractNotebookSections('<div class="page-section" id="page-"></div>'), /Invalid or duplicate notebook section/);
  assert.throws(() => extractNotebookSections('<div class="page-section" id="page-one"></div><section class="page-section" id="page-one"></section>', 'duplicate.html'), /duplicate notebook section "one".*duplicate\.html/);
});
