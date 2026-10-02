import {createHash} from 'node:crypto';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import vm from 'node:vm';
import {loadSiteRegistry, publishedResources} from './site-registry.mjs';

const root = new URL('../', import.meta.url);
const check = process.argv.includes('--check');
const version = '20261002-platform1';
const registry = await loadSiteRegistry(root);
const {chapters, resources} = publishedResources(registry);
const files = [...new Set(['index.html', ...registry.BIO_SITE.pages.map(p => p.url), ...chapters.map(p => p.url), ...resources.map(p => p.url)])];
const variant = file => file === 'index.html' ? 'lectii.html' : file;
async function emit(file, content) {
  const target = new URL('nou/' + file, root);
  if (check) {
    const current = await readFile(target, 'utf8').catch(() => '');
    if (current !== content) throw Error(`nou/${file} is stale; run npm run generate`);
  } else await writeFile(target, content);
}
await mkdir(new URL('nou/', root), {recursive:true});

for (const file of files) {
  let html = await readFile(new URL(file, root), 'utf8');
  html = html.replace(/<link\b[^>]*href="https:\/\/fonts\.(?:googleapis|gstatic)\.com[^>]*>\s*/g, '');
  html = html.replace(/\b(src|href|poster)=(['"])(assets\/[^'"]+|(?:icon-[^'"]+|apple-touch-icon\.png))\2/g, '$1=$2../$3$2');
  // A previously installed classic worker may still own the first nested navigation.
  // Give the two nesting-aware adapters fresh URLs before the Softly worker takes over.
  html = html.replace(/(src="\.\.\/assets\/js\/(?:chapter-redesign|simulation-ui)\.js)\?[^\"]+/g, `$1?v=${version}`);
  html = html.replace(/<a\b[^>]*>/g, tag => /class="[^"]*lab-brand\b/.test(tag) ? tag : tag.replace(/href="index\.html/g, 'href="lectii.html'));
  html = html.replace(/<meta name="robots" content="[^"]+">/, '<meta name="robots" content="noindex,follow">');
  html = html.replace(/<meta name="theme-color" content="[^"]+">/, '<meta name="theme-color" content="#FDFCF8">');
  html = html.replace(/<link rel="stylesheet" href="\.\.\/assets\/css\/site-header\.css[^\"]*">\n?/g, '');
  html = html.replace(/<body class="([^"]*)"/, `<body class="$1 softly-study" data-asset-base="../" data-softly-source="${file}"`);
  html = html.replace('</head>', [
    `<link rel="preload" href="assets/Outfit-Regular.ttf" as="font" type="font/ttf" crossorigin>`,
    `<link rel="stylesheet" href="transitions.css?v=${version}">`,
    `<link rel="stylesheet" href="study.css?v=20261002-catalog1">`,
    `<link rel="stylesheet" href="../assets/css/site-header.css?v=20261002-header1">`,
    file === 'cont.html' ? `<script src="auth-redirect.js?v=${version}"></script>` : '',
    '</head>'
  ].filter(Boolean).join('\n'));
  html = html.replace('</body>', [
    `<footer class="softly-edition-footer"><a href="index.html">BioMed</a><a data-classic-edition href="../${file}">Deschide varianta clasică</a></footer>`,
    `<script src="assets/vendor/gsap.min.js"></script>`,
    `<script src="assets/vendor/ScrollTrigger.min.js"></script>`,
    `<script src="study.js?v=${version}"></script>`,
    '</body>'
  ].join('\n'));
  await emit(variant(file), html);
}

const manifest = JSON.parse(await readFile(new URL('manifest.json', root), 'utf8'));
await emit('manifest.json', JSON.stringify({...manifest, name:'BioMed — Softly', short_name:'BioMed', id:'./', scope:'./', start_url:'./lectii.html', background_color:'#FDFCF8', theme_color:'#FDFCF8', icons:manifest.icons.map(icon => ({...icon, src:'../'+icon.src}))}, null, 2)+'\n');

// Reuse the established public-only caching policy with an independent scope and namespace.
const worker = (await readFile(new URL('sw.js', root), 'utf8'))
  .replace("'./assets/js/precache-manifest.js'", "'./precache-manifest.js'")
  .replace("'biologie-atlas-'", "'biomed-softly-'")
  .replace('const ASSETS =', 'const matchCached = request => caches.open(CACHE).then(cache => cache.match(request));\nconst ASSETS =')
  .replaceAll('caches.match(', 'matchCached(');
await emit('sw.js', worker);

const context = {self:{}};
vm.runInNewContext(await readFile(new URL('assets/js/precache-manifest.js', root), 'utf8'), context);
const assets = new Set(context.self.BIO_PRECACHE.assets.filter(path => !/\.html(?:[?#]|$)/.test(path) && path !== 'manifest.json').map(path => '../' + path));
const queue = ['index.html', ...files.map(variant), 'manifest.json'];
while (queue.length) {
  const path = queue.shift();
  if (assets.has(path)) continue;
  assets.add(path);
  const url = new URL(path, new URL('nou/', root)); url.search = ''; url.hash = '';
  const source = await readFile(url, 'utf8');
  const references = path.split('?')[0].endsWith('.html') ? [...source.matchAll(/\b(?:src|href)="([^"]+)"/g)].map(m => m[1])
    : path.split('?')[0].endsWith('.css') ? [...source.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(m => m[1]) : [];
  for (const reference of references) {
    if (/^(https?:|data:|mailto:|#)/.test(reference)) continue;
    const resolved = new URL(reference, url); resolved.hash = '';
    const local = resolved.href.startsWith(new URL('nou/', root).href) ? resolved.href.slice(new URL('nou/', root).href.length) : '../' + resolved.href.slice(root.href.length);
    // Links back to the classic edition do not make that edition part of this cache.
    if (local.startsWith('../') && /\.html(?:[?#]|$)/.test(local)) continue;
    if (!assets.has(local)) queue.push(local);
  }
}
const list = [...assets].sort();
const digest = createHash('sha256');
for (const path of list) {
  const url = new URL(path, new URL('nou/', root)); url.search = ''; url.hash = '';
  digest.update(path); digest.update(await readFile(url));
}
const cacheName = 'biomed-softly-' + digest.digest('hex').slice(0,12);
await emit('precache-manifest.js', `/* Generated by scripts/generate-softly.mjs. */\nself.BIO_PRECACHE = ${JSON.stringify({cacheName,assets:list},null,2)};\n`);
console.log(`${check ? 'Checked' : 'Generated'} Softly: ${files.length} study pages, shared data/runtime, isolated offline cache.`);
