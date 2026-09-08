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
  return { chapters, resources };
}
