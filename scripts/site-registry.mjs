import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

export async function loadSiteRegistry(rootUrl = new URL('../', import.meta.url)) {
  const source = await readFile(new URL('assets/js/chapters-data.js', rootUrl), 'utf8');
  const context = {};
  vm.runInNewContext(`${source}\nthis.__BIO_REGISTRY__ = { BIO_SITE, CHAPTERS };`, context, {
    filename: 'assets/js/chapters-data.js'
  });
  return context.__BIO_REGISTRY__;
}

export function publishedResources(registry) {
  const chapters = registry.CHAPTERS.filter(chapter => chapter.done && chapter.url);
  const resources = chapters.flatMap(chapter => chapter.resources || []);
  const collections = (registry.BIO_SITE.quizCollections || []).filter(item => item.done);
  const numbers = new Set(registry.CHAPTERS.map(chapter => chapter.num));
  const urls = new Set([...chapters, ...resources, ...(registry.BIO_SITE.pages || [])].map(item => item.url));
  for (const collection of collections) {
    if (!Number.isInteger(collection.num) || collection.num < 1000 || collection.kind !== 'quiz' ||
        !/^[a-z0-9_-]+\.html$/.test(collection.url) || !collection.name) throw new Error('Invalid quiz collection');
    if (numbers.has(collection.num) || urls.has(collection.url)) throw new Error('Quiz collection identity collision');
    numbers.add(collection.num); urls.add(collection.url);
  }
  return { chapters, collections, resources: resources.concat(collections) };
}
