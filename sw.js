const CACHE = 'biologie-v30';
const BASE = new URL('./', self.location.href).pathname;
const ASSETS = [
  BASE + 'index.html',
  BASE + 'introducere_anatomie_fiziologie.html',
  BASE + 'celula_si_fiziologia_celulara.html',
  BASE + 'oasele_si_articulatiile.html',
  BASE + 'sistemul_renal_complet.html',
  BASE + 'grile_sistemul_urinar.html',
  BASE + 'sistemul_reproducator_masculin.html',
  BASE + 'grile_sistemul_reproducator_masculin.html',
  BASE + 'sistemul_reproducator_feminin.html',
  BASE + 'grile_sistemul_reproducator_feminin.html',
  BASE + 'assets/js/grile-introducere.js?v=20260518-exp1',
  BASE + 'assets/js/grile-feminin.js',
  BASE + 'assets/js/chapter-redesign.js?v=20260504-highlighter1',
  BASE + 'assets/css/tokens.css',
  BASE + 'assets/css/lesson.css',
  BASE + 'assets/css/chapter-redesign.css?v=20260504-highlighter1',
  BASE + 'manifest.json',
  BASE + 'assets/logo-mark.svg',
  BASE + 'assets/logo-horizontal.svg',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png',
  BASE + 'apple-touch-icon.png',
  BASE + 'img introducere/niveluri_organizare_barrons.png.webp',
  BASE + 'img introducere/pozitie_anatomica_barrons.png.webp',
  BASE + 'img introducere/termeni_directionali_barrons.png.webp',
  BASE + 'img introducere/planuri_barrons.png.webp',
  BASE + 'img introducere/cavitatile_corpului_barrons.png.webp',
  BASE + 'img introducere/regiuni_anatomice_barrons.png.webp',
  BASE + 'img celula/celula_barrons.png.webp',
  BASE + 'img celula/tipuri_de_celule_barrons.png.webp',
  BASE + 'img celula/osmoza_barrons.png.webp',
  BASE + 'img celula/mozaic_fluid_barrons.png.webp',
  BASE + 'img celula/endocitoza_barrons.png.webp',
  BASE + 'img oase/tipuri_de_oase_barrons.png.webp',
  BASE + 'img oase/os_lung_barrons.png.webp',
  BASE + 'img oase/histologie_os_barrons.png.webp',
  BASE + 'img oase/tipuri_de_articulatii_barrons.png.webp',
  BASE + 'imagini/rinichi_si_componente_barrons.png.webp',
  BASE + 'imagini/nefron_detaliat_barrons.png.webp',
  BASE + 'imagini/functia_nefron_barrons.png.webp',
  BASE + 'imagini/pasajul_moleculelor_barrons.png.webp',
  BASE + 'imagini/mecanism_contracurent_barrons.png.webp',
  BASE + 'imagini/ADH_aldosteron_barrons.png.webp',
  BASE + 'imagini/structuri_anexe_barrons.png.webp',
  BASE + 'imagini/sistemul_urinar_imag_noua.png.webp',
  BASE + 'imagini/alte_organe_excretorii_barrons.png.webp',
  BASE + 'imagini/sist_rep_masculin_barrons.webp',
  BASE + 'imagini/spermatogeneza_barrons.webp',
  BASE + 'imagini/structura_spermatozoid_barrons.webp',
  BASE + 'imagini/sistem_ducte_barrons.webp',
  BASE + 'imagini/ducte_organe_masculine_barrons.webp',
  BASE + 'img reproducator feminin/ciclul_menstrual_barrons.png.webp',
  BASE + 'img reproducator feminin/fecundatia_barrons.png.webp',
  BASE + 'img reproducator feminin/tract_genital_feminin_barrons.png.webp',
  BASE + 'img reproducator feminin/ovar_lunar_barrons.png.webp',
  BASE + 'img reproducator feminin/vulva_barrons.png.webp',
  BASE + 'img reproducator feminin/dupa_fecundatie_barrons.png.webp',
  BASE + 'img reproducator feminin/tract_genital_lateral_barrons.png.webp',
  BASE + 'img reproducator feminin/formare_deav_ovulului_barrons.png.webp',
  BASE + 'img reproducator feminin/uter_trompe_barrons.png.webp',
  BASE + 'img reproducator feminin/san_barrons.png.webp'
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
  // Keep HTML fresh while still allowing offline fallback.
  if (e.request.mode === 'navigate' || (e.request.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request).then(cached => cached || caches.match(BASE + 'index.html')))
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
