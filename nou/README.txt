BioMed — homepage separat

URL nou: https://danghg18.github.io/bio-barrons-umf/nou/
URL păstrat: https://danghg18.github.io/bio-barrons-umf/

Această pagină este un punct de intrare alternativ către platforma actuală.
index.html de la rădăcină, lecțiile, catalogul, conturile, notițele și progresul
nu sunt înlocuite sau copiate. Legăturile sunt relative și funcționează sub
prefixul GitHub Pages /bio-barrons-umf/.

home-data.js citește CHAPTERS și grila sn-058 din sursele canonice ale site-ului.
Exercițiul demonstrativ nu persistă răspunsuri și nu inițializează conturi.
Animația fixată și bara de progres sunt păstrate din demo-ul aprobat.

Pagina este publicată separat, cu noindex,follow, și nu este introdusă în
catalogul de lecții sau în inventarul offline al aplicației vechi. Este o
pagină de prezentare online; nu instalează și nu modifică un service worker.
Regenerarea inventarului existent nu trebuie să schimbe pagina veche sau
cache-ul acesteia doar pentru o actualizare a acestei prezentări.

Resurse:
- Figtree: Google Fonts; licența inclusă în assets/Figtree-OFL.txt.
- GSAP + ScrollTrigger 3.15.0: resurse locale cu notificările de licență
  originale. https://gsap.com/standard-license
- organic.jpg / organic-mobile.jpg: imagine decorativă generată pentru
  direcția vizuală aprobată, fără rol didactic.
- Figura trunchiului cerebral și sigla sunt resursele existente ale site-ului.
- transitions.css păstrează CSS-ul pentru tabs-sliding și accordion din
  skillul transitions-dev; adaptările sunt în homepage.css.

Verificare structurală: node scripts/homepage-separation-test.mjs
Previzualizare: un server static care servește rădăcina proiectului.

Verificări la integrare (2 octombrie 2026):
- Testul de separare a trecut: legături, surse canonice, cele 32 de combinații
  de răspuns și absența scrierilor în progresul personal.
- Verificate în browser: desktop 1280px, fereastră 775px, telefon 390px,
  animația fixată, progresul vizibil, răspunsul B+C+E și accesul la catalog.
- npm test a trecut generarea, validarea, programa, smoke/offline, căutarea,
  interfața și testele de grile până la quiz-restart-test.mjs:39. Acolo eșuează
  închiderea confirmării de reluare într-un al doilea tab. Același eșec a fost
  reprodus separat pe HEAD-ul nemodificat 2bf8c1e. Codul respectiv nu este
  schimbat de această integrare; suita generală nu este integral verde.
- Impeccable: patru excepții locale doar pentru nou/index.html — paleta și
  razele demo-ului aprobat, plus alarme false de tracking și padding, verificate
  vizual. Configurația detectorului rămâne locală și nu este publicată.
