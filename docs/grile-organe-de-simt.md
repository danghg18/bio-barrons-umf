# Grilele „Organele de simț”

## Sursa și baremul

Cele 100 de întrebări și 500 de variante au fost transcrise vizual din PDF-ul furnizat de utilizator, `grile-organe-de-simt-paginile-88-101.pdf` (14 pagini scanate; numerotarea tipărită este 90–103). Ordinea întrebărilor și formulările din sursă sunt păstrate, inclusiv formulările neobișnuite. La grila 100, ultima afirmație nu are litera tipărită; a fost atribuită variantei E, în ordinea A–E.

Baremul trimis de utilizator la 10 septembrie 2026 este autoritatea pentru punctaj. Copia independentă folosită la validare este `tests/organe-de-simt-answer-key.json`. Nu se deduce baremul din explicații și nu se modifică pentru a rezolva neconcordanțe biologice.

Datele se află în `assets/js/grile-organe-de-simt-data.js`, separat de player. Fiecare variantă exclusă de barem are explicație. La cerințele care solicită afirmații false, variantele de selectat au și explicația falsității, iar celelalte sunt explicate ca afirmații adevărate. Notele care încep cu „Baremul furnizat…” semnalează explicit ambiguitățile sau neconcordanțele, fără schimbarea punctajului.

Explicațiile se raportează în primul rând la lecția existentă `organele_de_simt.html`. Pentru clarificările anatomice privind foveea și conurile, corneea, orientarea canalelor semicirculare și căile senzoriale au fost consultate și sursele primare educaționale [OpenStax: Sensory Perception](https://openstax.org/books/anatomy-and-physiology/pages/14-1-sensory-perception), [OpenStax: Vision](https://openstax.org/books/biology-2e/pages/36-5-vision) și [OpenStax: Physics of the Eye](https://openstax.org/books/college-physics/pages/26-1-physics-of-the-eye). Convențiile didactice din lecție, de exemplu localizările preferențiale ale gusturilor, sunt numite ca atare în explicații.

## Integrare

- `testare.html` prezintă ambele teste, accesibile și prin legăturile directe existente.
- `grile_organele_de_simt.html` conține zece intervale, cu hash-uri `#grile-1-10` până la `#grile-91-100`.
- Resursa este asociată capitolului 12 în `CHAPTERS`; pagina de catalog este în `BIO_SITE.pages` pentru sitemap și precache.
- `quiz-player.js` și routerul existent `legacy/quiz-navigation.js` sunt comune. Routerul descoperă intervalele din HTML, păstrând comportamentul legacy de înlocuire a hash-ului.
- Playerul găsește lecția-părinte prin relația capitol–resursă din registru. Legăturile de întoarcere duc la lecția testului, inclusiv după acces direct sau reîncărcare.
- Starea nouă folosește `bb.quiz.organe-simt.v1`, ID-uri `os-001`–`os-100`, versiunea 1. Contractul `bb.quiz.sistem-nervos.v1` și ID-urile `sn-051`–`sn-100` sunt păstrate.
- După verificare, varianta corectă bifată este verde; varianta corectă omisă este galbenă; varianta bifată în plus este roșie. Etichetele text și descrierile accesibile fac distincția și fără culoare.

## Verificare

`npm test` verifică datele și baremul independent, punctajul exact pentru fiecare dintre cele 150 de grile, selecția parțială/în plus, culoarea și eticheta omisiunilor, reîncărcarea, reîncercarea, confirmarea/anularea resetării și izolarea stării celor două capitole. Sunt acoperite legăturile lecție–test, catalogul, intervalele directe, hash-ul invalid, parametrii de căutare, drawer-ul mobil, pornirea light-only, paginile offline și actualizarea workerului.

Inventarul offline și versiunea cache-ului sunt regenerate prin `npm run generate`; strategia `sw.js` nu este schimbată. O adresă de căutare cu query este o intrare distinctă și este verificată offline după acces online, conform comportamentului existent al workerului.

Verificarea vizuală directă acoperă catalogul, butonul din lecție și răspunsurile corectate la 1440 și 390 px. Suita UI verifică toate cele 14 pagini la zece dimensiuni. Baseline-ul textului educațional al quizului vechi este păstrat; testul exclude numai noua legendă de culori, care este text de interfață.

## Explicații în lecție

Lecția include patru explicații anatomice și funcționale în formulări proprii, cu paragrafe și liste roșii, fără casete sau trimiteri la grile. Ele sunt păstrate numai în secțiunile despre auz și echilibru: regiunile urechii, compartimentele cohleei, organizarea labirinturilor și receptorii vestibulari. Textul original și baremul nu au fost modificate. Clarificările folosesc și sursele educaționale OpenStax citate anterior: [Sensory Perception](https://openstax.org/books/anatomy-and-physiology-2e/pages/14-1-sensory-perception) și [Balance](https://openstax.org/books/introduction-behavioral-neuroscience/pages/7-4-balance-a-sense-of-where-you-are).

La echilibru este adăugată imaginea furnizată de utilizator, cu creditul ginamed.ro păstrat, în `assets/images/chapters/sense-organs/labirint-osos-membranos-ginamed.png`. Stilul paragrafelor este local lecției, în `assets/css/chapters/sense-organs.css`.
