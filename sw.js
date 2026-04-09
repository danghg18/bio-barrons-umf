const CACHE = 'biologie-v3';
const BASE = new URL('./', self.location.href).pathname;
const ASSETS = [
  BASE + 'index.html',
  BASE + 'sistemul_renal_complet.html',
  BASE + 'manifest.json',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png',
  BASE + 'apple-touch-icon.png',
  BASE + 'imagini/rinichi_si_componente_barrons.png.webp',
  BASE + 'imagini/nefron_detaliat_barrons.png.webp',
  BASE + 'imagini/functia_nefron_barrons.png.webp',
  BASE + 'imagini/pasajul_moleculelor_barrons.png.webp',
  BASE + 'imagini/mecanism_contracurent_barrons.png.webp',
  BASE + 'imagini/ADH_aldosteron_barrons.png.webp',
  BASE + 'imagini/structuri_anexe_barrons.png.webp',
  BASE + 'imagini/sistemul_urinar_imag_noua.png.webp',
  BASE + 'imagini/alte_organe_excretorii_barrons.png.webp'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
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
