import assert from 'node:assert/strict';
import {publishedResources} from './site-registry.mjs';

const chapter = {num:1, done:true, url:'lesson.html', resources:[{kind:'quiz', url:'quiz.html'}]};
const collection = {num:1000, name:'Întrebări asociative', kind:'quiz', done:true, url:'grile_asociative.html'};
const registry = {CHAPTERS:[chapter], BIO_SITE:{quizCollections:[collection]}};
const result = publishedResources(registry);
assert.deepEqual(result.chapters, [chapter], 'Collections never become lessons');
assert.deepEqual(result.resources.map(r => r.url), ['quiz.html', 'grile_asociative.html'], 'Collections enter the generated public asset inventory');
assert.deepEqual(result.collections, [collection]);
assert.equal(registry.CHAPTERS.length, 1, 'The registry is immutable');
for (const invalid of [{...collection, num:1}, {...collection, num:999}, {...collection, kind:'lesson'}, {...collection, url:'quiz.html'}]) {
  assert.throws(() => publishedResources({...registry, BIO_SITE:{quizCollections:[invalid]}}), /collection|collision/i);
}
assert.throws(() => publishedResources({...registry, BIO_SITE:{quizCollections:[collection, collection]}}), /collision/i);
assert.deepEqual(publishedResources({...registry, BIO_SITE:{quizCollections:[{...collection, done:false}]}}).collections, []);
console.log('Independent collection discovery, lesson isolation and reserved-ID/URL collision checks passed.');
