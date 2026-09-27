# Grile: sistemul cardiovascular și sistemul limfatic

## Sursa și numerotarea

Import solicitat la 26 septembrie 2026 din `grile-biologie-umf-cluj-paginile-142-160.pdf`. Cele 19 pagini scanate au numerele **149–167** în carte; numele fișierului nu reprezintă paginile tipărite.

- **Cardiovascular:** 82 de întrebări, **1–74, 131–135 și 138–140**; `grile_sistemul_cardiovascular.html`, `assets/js/grile-sistemul-cardiovascular-data.js`, `bb.quiz.sistemul-cardiovascular.v1`, ID-uri `cv-NNN`.
- **Limfatic și imun:** 58 de întrebări, **75–130 și 136–137**; `grile_sistemul_limfatic_si_imun.html`, `assets/js/grile-sistemul-limfatic-data.js`, `bb.quiz.sistemul-limfatic.v1`, ID-uri `lim-NNN`.
- Întrebările 136 și 137 nu sunt eliminate: apar exclusiv la limfatic. Toate numerele 1–140 apar exact o dată. `number` și `sourceNumber` păstrează numărul din carte.
- Sunt 700 de variante A–E și 700 de explicații individuale. Împărțirea urmează cererea utilizatorului inclusiv la întrebările mixte.

SHA-256 al PDF-ului: `9cfb778abf1656d68c59c32d6c4c92c3f174a58cb5868dddd69c54c2a7177f0d`.

## Baremul deplasat

**Punctajul respectă exclusiv cheia utilizatorului.** Prima întrebare are cheia suplimentară **ABCD**. Rândurile numerotate 1–139 din mesaj sunt deplasate cu o poziție: rândul `n` corespunde întrebării `n+1`. Fixture-ul independent `tests/circulator-answer-key.json` are exact 140 de intrări, indexate prin `sourceNumber - 1`.

Repere verificate: **1 ABCD, 2 ADE, 74 CDE, 75 ADE, 130 ACE, 131 CD, 135 C, 136 DE, 137 ABCE, 138 CE, 139 A, 140 ABC**. Nicio observație biologică nu modifică această cheie.

## Verificarea editorială

Toate cele 19 pagini au fost inspectate vizual. Transcrierea manuală a fost apoi recitită separat de doi recenzori: 82 de întrebări cardiovasculare și 58 limfatice. Revizia a corectat trei diferențe: 115E „agenți patogeni”, 126E „drenează limfă” și 127C „foliculi limfocitari”. Un OCR local a fost utilizat numai ca reper auxiliar; imaginile rămân autoritatea.

Au fost unite rândurile tipografice, normalizate diacriticele ș/ț și redate indicii în Unicode. Formulările false și particularitățile sursei sunt păstrate, inclusiv **63B „cardiac I”**, **74C/D „ramură”**, **130E „contracția muscular”**, **133A „vene carotidiene”** și **135D „endoteliul ... alveolelor”**. Acestea nu sunt erori introduse de import.

| PDF | Carte | Conținut / continuări |
|---:|---:|---|
| 1 | 149 | 1–8D; 4E continuă în coloana dreaptă |
| 2 | 150 | 8E–16E, ultima variantă continuă |
| 3 | 151 | continuarea 16E, 17–24B |
| 4 | 152 | 24C–33A; 29B–E în coloana dreaptă |
| 5 | 153 | 33B–40 |
| 6 | 154 | 41–47D |
| 7 | 155 | 47E–54B; 50E în coloana dreaptă |
| 8 | 156 | 54C–61 |
| 9 | 157 | 62–69C; 65D–E în coloana dreaptă |
| 10 | 158 | 69D–77; 73D–E în coloana dreaptă |
| 11 | 159 | 78–85D; 81D–E în coloana dreaptă |
| 12 | 160 | 85E–93 |
| 13 | 161 | 94–101B |
| 14 | 162 | 101C–108D; 105B–E în coloana dreaptă |
| 15 | 163 | 108E–116D; 112C–E în coloana dreaptă |
| 16 | 164 | 116E–125B; 121B–E în coloana dreaptă |
| 17 | 165 | 125C–132; 129B–E în coloana dreaptă |
| 18 | 166 | 133–138; 136C–E în coloana dreaptă |
| 19 | 167 | 139–140 |

## Explicații și limitele cheii

Explicațiile au fost confruntate cu lecțiile locale `sistemul_cardiovascular.html` și `sistemul_limfatic_si_imun.html`, iar aspectele incerte au fost verificate în surse externe. Testele automate validează contractul și punctajul, nu demonstrează singure corectitudinea biologică.

### Neconcordanțe și formulări ambigue

- **17D (cheie AE):** arcul aortic trece superior de artera pulmonară stângă. Excluderea este semnalată explicit, fără a inventa o anatomie contrară.
- **6D, 10B:** valvulele și oxigenarea pot influența indirect hemodinamica. Excluderea din barem nu se transformă într-o negare absolută a oricărui efect.
- **38B, 40E, 44A/D:** afirmații anatomic adevărate excluse într-o cerință despre fiziologie/funcție. Explicațiile spun că există o posibilă distincție editorială, nu că anatomia ar fi falsă.
- **48B și 77C:** atât sângele, cât și limfa au flux orientat în condiții normale. Diferența didactică urmărită este circuitul sanguin închis versus traseul limfatic din țesuturi spre vene. Comparația din 48B este ambiguă.
- **53B:** arterele hepatică comună și splenică provin din trunchiul celiac, nu direct din aortă; cuvântul „direct” lipsește din enunț, iar explicația precizează acest lucru.
- **59C (ABDE):** raportul cu traheea și esofagul este generalizat. Nu există în sursă o explicație explicită a excluderii; nu este prezentată ca o regulă anatomică absolută.
- **71B (ACDE):** legătura anatomică între venule și arteriole este reală. Sensul normal al fluxului este arteriole → capilare → venule; simpla ordine a termenilor nu face legătura inexistentă.
- **75C, 101B:** lecția accentuează apărarea specifică, dar organele limfoide participă și la apărarea înnăscută. Se păstrează excluderea din barem, nu o negare biologică a rolului macrofagelor.
- **82A (BCE):** localizarea „în interiorul cavității” este imprecisă față de localizarea subepitelială în pereții regiunii orofaringiene/nazofaringiene. Nu se neagă prezența amigdalelor în această regiune.
- **101E (AC):** „concentrație mică” nu are termen de comparație; limfa are de regulă mai puține proteine decât plasma, dar drenează proteinele interstițiale evidențiate de lecție.
- **107A–D (AE):** A este acceptată în sensul intrării lichidului interstițial în capilarul limfatic. B este structural adevărată. **C și D descriu mecanisme reale ale edemului, susținute și de lecție, dar excluse de barem**; explicațiile le marchează explicit.
- **117A/B, 96A și 128A:** topografia și involuția timusului necesită nuanțare. Lecția afirmă atrofie după un an; descrierea anatomică generală distinge dimensiunea absolută de involuția progresivă. Extensia în mediastinul inferior anterior nu este imposibilă anatomic. Nu se presupune un calendar identic al involuției timusului și amigdalelor.
- **126D:** limfa drenează direct lichidul interstițial; acesta este derivat din plasmă, dar nu se numește plasmă după ieșirea din vase.
- **134D (AB):** chemoreceptorii aortici răspund la CO₂ și H⁺; excluderea este semnalată ca neconcordanță cu baremul.

Cerințele **111 și 116** solicită variante false/incorecte. Explicațiile acestora precizează explicit de ce afirmația falsă trebuie selectată. La **49, 72, 81, 84, 85 și 87**, afirmațiile excluse pot fi adevărate, dar nu corespund categoriei structurale/funcționale cerute. La **82D și 103D**, informația despre plăcile Peyer este adevărată, dar nu descrie amigdalele.

### Surse de verificare

Lecțiile locale constituie referința didactică principală. Sursele externe verifică mecanisme și ambiguități; nu furnizează întrebările sau baremul:

- [OpenStax, anatomia inimii](https://openstax.org/books/anatomy-and-physiology-2e/pages/19-1-heart-anatomy): pericard, cavități, valve, coronare, flux unidirecțional.
- [OpenStax, ciclul cardiac](https://openstax.org/books/anatomy-and-physiology/pages/19-3-cardiac-cycle): faze și zgomote.
- [OpenStax, flux, presiune și rezistență](https://openstax.org/books/anatomy-and-physiology-2e/pages/20-2-blood-flow-blood-pressure-and-resistance): determinanți hemodinamici.
- [OpenStax, anatomia sistemului limfatic și imun](https://openstax.org/books/anatomy-and-physiology-2e/pages/21-1-anatomy-of-the-lymphatic-and-immune-systems): drenaj, ganglioni, timus, splină.
- [OpenStax, circulația sanguină și limfatică](https://openstax.org/books/microbiology/pages/25-1-anatomy-of-the-circulatory-and-lymphatic-systems): circuit limfatic, organe limfoide.
- [Studiu experimental despre chemoreceptorii aortici](https://pubmed.ncbi.nlm.nih.gov/6811527/): răspunsuri la CO₂ și H⁺, relevant pentru 134D.

## Integrare și verificări

Ambele pagini folosesc același player și aceleași stiluri ca grilele organelor de simț. Nu se schimbă motorul comun de punctaj și nu se mută progresul altor teste. Registrul publică automat testele în catalog și legăturile din lecții. Temele au mapări explicite spre secțiuni existente ale lecțiilor. Generatorul actualizează indexul, băncile pentru simulare, sitemap-ul și precache-ul.

URL-urile pentru `chapters-data.js` și `quiz-index.js` sunt versionate `20260926-circulator1` în toate paginile publice. Regresia de upgrade păstrează un service worker cache-first real și resurse vechi în cache, apoi verifică încărcarea noilor grile înainte de actualizarea workerului.

Comenzi:

- `npm run test:circulator`: toate cele 140 de combinații corecte aplicate în browser, opțiuni omise/în plus, explicații, reîncărcare/resetare, izolare, catalog, legături către lecții, discontinuități 74→131, 135→138, 130→136, hash/history, căutare, mobil, greșeli, offline și upgrade.
- `npm run generate:check`: artefactele generate corespund surselor.
- `npm test`: regresiile întregului site.
- `git diff --check`: verificare whitespace.

Rezultatele efective sunt consemnate după terminarea execuțiilor; existența scripturilor nu este o afirmație că au trecut. Modificările sunt locale, fără publicare implicită.

### Rezultatul verificării locale — 26 septembrie 2026

- **Trecut:** `npm run test:circulator`, inclusiv toate cele 140 de răspunsuri verificate în browser, 700 de explicații, numerotări, feedback, salvare/resetare, izolare, căutare, mobil, exersarea greșelilor, offline și regresia reală cu worker vechi. Capturile ambelor pagini la 1440 și 390 px au fost inspectate vizual.
- **Trecut:** `generate:check`, `validate`, programa, inventarul conținutului, smoke, căutare/highlighter pe 28 de pagini, interfața tuturor celor 35 de pagini, 38 de tabele, testele de compactare la patru lățimi și cele 20 de verificări de polish.
- **Limită explicită a rulării `npm test`:** execuția s-a oprit la `scripts/ui-polish-upgrade-test.mjs:57`, cu timeout de 30 s pentru `document.body.dataset.analyticsReady === 'true'` după trecerea offline. Testul de upgrade al stilurilor a fost adăugat concomitent în arborele de lucru și nu a fost modificat de acest import. Reexecuția izolată reproduce eroarea; diagnosticul observă resurse indisponibile offline după înlocuirea workerului. Nu este raportat un succes integral pentru `npm test`.
- **Restul suitei a fost executat separat și a trecut:** redesign, cele patru teste recuperate, celulă, organe de simț, endocrin/metabolism, circulator, analytics, accounts, glossary și simulation. Conturile au verificat toate cele 11 chei de grile; băncile simulărilor păstrează exact datele sursă. Regresiile offline/upgrade dedicate grilelor, glosarului și simulării au trecut.
- **Trecut la final:** `npm run generate:check` și `git diff --check`.

Importul este finalizat local. Nu s-a creat commit și nu s-a făcut push/publicare. Eșecul separat de upgrade al stilurilor rămâne de rezolvat înainte de a declara întreaga suită verde pentru o publicare comună a arborelui de lucru.
