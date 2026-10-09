import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {loadSiteRegistry, publishedResources} from './site-registry.mjs';
const root = new URL('../', import.meta.url);
const registry = await loadSiteRegistry(root);
const context = {window:{}};
vm.runInNewContext(await readFile(new URL('assets/js/quiz-index.js',root),'utf8'),context);
const quizzes = context.window.BB_QUIZ_INDEX;
const {chapters} = publishedResources(registry);
const homepage = await readFile(new URL('index.html',root),'utf8');
assert.ok(homepage.includes(`${chapters.length} lecții`), 'Delivered homepage SEO must use the published lesson count');
const {renderPublicMetadata} = await import('./public-metadata.mjs');
const sample = structuredClone(registry);
sample.CHAPTERS[1].done = false;
const changed = renderPublicMetadata(homepage, 'index.html', sample, quizzes);
assert.match(changed, /16 lecții/);
assert.doesNotMatch(changed, /<a[^>]*href="celula_si_fiziologia_celulara.html"/);
assert.equal(renderPublicMetadata(changed,'index.html',sample,quizzes),changed,'Generation must be idempotent');
const count = quizzes.reduce((sum,q)=>sum+q.questions.length,0);
assert.match(homepage,new RegExp(`${count} de grile`));
for(const file of ['index.html','testare.html',...registry.BIO_SITE.pages.map(p=>p.url),...chapters.map(c=>c.url),...quizzes.map(q=>q.url)]){
 const html=await readFile(new URL(file,root),'utf8');
 assert.equal(renderPublicMetadata(html,file,registry,quizzes),html,`${file}: delivered metadata/catalog must already be generated`);
 assert.doesNotMatch(html.slice(0,html.indexOf('</head>')),/10 lecții|tematica[^"<>]*2025/);
}
for (const file of ['testare.html','statistici.html']) {
 const html=await readFile(new URL(file,root),'utf8');
 assert.doesNotMatch(html,/Progresul grilelor se păstrează în acest browser|Se păstrează în acest browser\. Reluarea/,'Public sync copy must match cloud history support');
}
const testing = await readFile(new URL('testare.html',root),'utf8');
assert.doesNotMatch(testing,/Test în pregătire|În curând/,'Every currently published quiz must be linked before JS');
for(const quiz of quizzes) assert.ok(testing.includes(`href="${quiz.url}"`),quiz.url);
const withheld = structuredClone(registry); withheld.CHAPTERS[0].resources[0].done=false;
assert.ok(!publishedResources(withheld).resources.some(r=>r.url===registry.CHAPTERS[0].resources[0].url),'Explicit draft resources must stay excluded');
const withoutDraft=renderPublicMetadata(testing,'testare.html',withheld,quizzes);
assert.doesNotMatch(withoutDraft,/<a[^>]*href="grile_introducere_anatomie_fiziologie.html"/);
assert.match(withoutDraft,/17 seturi disponibile · 1930 de grile/);
assert.match(withoutDraft,/<button[^>]*data-chapter="1"[^>]*disabled>/,'Draft quizzes render a disabled modern row before JS');
assert.equal(renderPublicMetadata(withoutDraft,'testare.html',withheld,quizzes),withoutDraft,'Draft catalog generation is idempotent');
assert.equal(renderPublicMetadata(withoutDraft,'testare.html',registry,quizzes),testing,'Republishing restores the canonical modern catalog');
assert.doesNotMatch(withoutDraft,/class="lab-bento-cat(?: |")/,'Generation never restores legacy colored cards');
const shortened=structuredClone(quizzes); shortened[0].questions.splice(0,10);
assert.match(renderPublicMetadata(homepage,'index.html',registry,shortened),/1980 de grile/);
const shorterRow=renderPublicMetadata(testing,'testare.html',registry,shortened).match(/<a[^>]*id="testing-quiz-1"[\s\S]*?<\/a>/)?.[0];
assert.match(shorterRow,/class="lab-item-tags">50 de grile/,'Static question counts follow quiz data');
console.log(`Public metadata: delivered HTML, canonical counts, availability, drafts and idempotence passed (${chapters.length} lessons / ${quizzes.length} sets / ${count} questions).`);
