importScripts('./assets/js/precache-manifest.js');

const BASE = new URL('./', self.location.href).pathname;
const CACHE_PREFIX = 'biologie-atlas-';
const CACHE = self.BIO_PRECACHE.cacheName;
const ASSETS = self.BIO_PRECACHE.assets.map(asset => new URL(asset, self.location.href).href);

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS.map(url => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Auth and private API data must never enter the public PWA cache.
  const requestUrl = new URL(e.request.url);
  if (e.request.method !== 'GET' || e.request.headers.has('authorization') ||
      (requestUrl.origin !== self.location.origin &&
       !['fonts.googleapis.com', 'fonts.gstatic.com'].includes(requestUrl.hostname))) return;
  // Keep HTML fresh while still allowing offline fallback.
  if (e.request.mode === 'navigate' || (e.request.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(e.request);
          if (cached) return cached;
          // Analytics filters are local UI state and always use this same static shell.
          // Keep the established exact-query behavior for every other public page.
          const url = new URL(e.request.url);
          if (url.origin === self.location.origin && ['statistici.html', 'cont.html'].some(file => url.pathname === BASE + file)) {
            const analytics = await caches.match(url.pathname);
            if (analytics) return analytics;
          }
          return caches.match(BASE + 'index.html');
        })
    );
    return;
  }

  // Cache-first for local assets, network-first for Google Fonts
  if (e.request.url.includes('fonts.googleapis.com') || e.request.url.includes('fonts.gstatic.com')) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        fetch(e.request).then(res => { cache.put(e.request, res.clone()); return res; })
          .catch(() => caches.match(e.request))
      )
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
