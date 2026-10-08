import assert from 'node:assert/strict';
import {extractNotebookSections} from './notebook-sections.mjs';
const html = `<div class="page-section" id="page-outside"></div><main>
<div class="page-section chapter-home" id="page-home"></div>
<div class="page-section" id="page-excluded" data-curriculum-excluded></div>
<div class="page-section" id="page-redirect" data-lesson-redirect="content"></div>
<div class="page-section" id="page-content"><h1>Content</h1></div></main>`;
assert.deepEqual(extractNotebookSections(html, 'fixture.html', {studyOnly:true}).map(section => section.id), ['content']);
console.log('Study section extraction excludes chapter homes, excluded content, redirects and sections outside main.');
