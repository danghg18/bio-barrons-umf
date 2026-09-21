# Capitolele 13–16 — sursă și acoperire

Sursă: fișierul furnizat `734244481-Barron-s-2022.pdf` (604 pagini scanate). Numerele de mai jos sunt cele tipărite. Pagina PDF este poziția în fișier, numerotată de la 1. Scanurile au fost extrase/randate la 1224 × 1888 pentru inspecție. Textul a fost recunoscut cu Apple Vision și reconciliat cu scanurile; tabelele au fost transcrise în HTML semantic. Diacriticele ș/ț au fost normalizate. Cuvintele despărțite la sfârșit de rând au fost reunite. Nu au fost importate întrebările recapitulative.

## Acoperire

| Lecție | Tipărit → PDF | Blocuri incluse | Excluderi |
|---|---|---|---|
| Sistemul endocrin | 295–308 → 302–315 | Obiectivele p.295; descrierea hormonilor, hipofiză, tiroidă, paratiroide, pancreas, suprarenale, alte glande; finalul despre glandele digestive și prostaglandine p.308 | De la titlul „Întrebări recapitulative” p.308; figura 13.10 aparține întrebărilor și este exclusă |
| Sângele | 319–331 → 327–339 | Obiectivele p.319; funcții, plasmă, eritrocite, hemoglobină, distrugerea eritrocitelor inclusiv continuarea p.324, grupe sanguine, leucocite, plachete și coagulare | Doar blocul „Anemia” începând de la titlul p.324; restul paginii nu este eliminat |
| Sistemul cardiovascular | 343–359 → 351–367 | Obiectivele p.343; inimă, cavități/vase, circulație, valve, circulație coronariană, mușchi cardiac, ciclu cardiac, vase sanguine, presiune și puls; tipuri de circulație începând în a doua jumătate a p.356 | „Reglarea fluxului cardiac” de la titlul p.355 și continuarea p.356; „Șocul” p.356. Textul despre puls anterior titlului p.355 și circulația ulterior șocului p.356 sunt păstrate |
| Sistemul limfatic și imun | 375–382 → 383–390 | Obiectivele relevante p.375; introducere, vase limfatice, noduli limfatici, amigdale, timus, splină, limfă și edem p.382 | Obiectivele exclusiv despre dezvoltarea sistemului imun, imunitate celulară/anticorpi, antigene, rolurile limfocitelor T/B, selecție clonală și clase de anticorpi p.375; blocul „Sistemul imun” de la titlul p.382 |

Pagina PDF 326 este goală; nu s-a aplicat automat decalajul +7 după această pagină. Cuprinsurile tipărite de deschidere sunt reprezentate prin navigarea lecției; grafica decorativă a deschiderilor și antetele/numerele paginilor nu sunt imagini educaționale.

## Tabele

| Tabel | Pagina | HTML |
|---|---:|---|
| 13.1 Cele două tipuri principale de hormoni | 296 | `sistemul_endocrin.html` |
| 13.2 Hormonii glandei hipofize | 300 | idem |
| 13.3 Principalii hormoni din organismul uman | 302 | idem |
| 14.1 Componentele majore ale sângelui | 321 | `sangele.html` |
| 14.2 Aspectul microscopic al leucocitelor în colorația Wright | 327 | idem |
| 14.3 Caracteristicile elementelor figurate ale sângelui | 329 | idem |
| 15.1 Prezentare succintă a valvelor cardiace | 348 | `sistemul_cardiovascular.html` |
| 15.2 O comparație între vasele sanguine ale organismului | 352 | idem |
| 16.1 Principalele organe ale sistemului limfatic | 379 | `sistemul_limfatic_si_imun.html` |

## Figuri

S-au căutat variante online Barron's; rezultatele similare aveau redesenări sau numerotare diferită. Pentru fidelitate, toate cele 32 de figuri folosesc decupaje din PDF-ul furnizat, în format WebP local, decupate direct din imaginea nativă 2480 × 3507 a paginii PDF (fără micșorare înainte de decupare), cu panourile și etichetele scanului. Legendele sunt text HTML, separat de imagine. Fiecare `figure` are `data-source-figure` și `data-source-page`.

| Capitol / director | Figură → pagină tipărită |
|---|---|
| `sistemul-endocrin` | 13.1→297; 13.2→298; 13.3→299; 13.4→301; 13.5→303; 13.6→304; 13.7→305; 13.8→306; 13.9→307 |
| `sangele` | 14.1→320; 14.2→322; 14.3→323; 14.4→325; 14.5→328; 14.6→330; 14.7→331 |
| `sistemul-cardiovascular` | 15.1→344; 15.2→345; 15.3→346; 15.4→347; 15.5→348; 15.6→350; 15.7→350; 15.8→354; 15.9→357; 15.10→358; 15.11→359 |
| `sistemul-limfatic-si-imun` | 16.1→377; 16.2→378; 16.3→379; 16.4→380; 16.5→381 |

Calea fiecărei imagini este `assets/images/chapters/<director>/figura-<capitol>-<număr>.webp`.

## Verificare efectuată și limite

Toate paginile incluse — 295–308, 319–331, 343–359, 375–382 — au fost deschise vizual la dimensiune lizibilă, nu doar în contact sheet. Au fost verificate în mod special limitele mixte 308/324/355/356/382, tabelele, legendele și rândurile care continuă între pagini. Formulările neobișnuite tipărite nu au fost corectate editorial (de exemplu „țesuri” în caseta p.376, „Impusurile” în legenda 15.6, „comportimentează” p.381).

Verificarea structurală locală a confirmat: ID-uri unice; 7/7/9/5 rute; 3/3/2/1 tabele; 9/7/11/5 figuri; toate referințele locale există; niciun bloc inline de stil sau script; fiecare pagină inclusă are marcaje `data-source-page`. Paragrafele continue au și `data-source-pages` când traversează paginația.

Aceasta este verificarea autorului importului; nu înlocuiește revizia independentă a transcrierii și a randării în browser. Testele complete, registrul, generarea sitemap/precache și verificarea offline sunt gestionate separat de coordonator. Nu s-a publicat și nu s-a făcut commit din acest subtask.


Revizie finală a decupajelor native: toate cele 32 de fișiere au fost deschise individual. Figura 14.6 a fost restrânsă la dreapta pentru eliminarea unui fragment de casetă vecină; figurile 15.5 și 15.2 au fost curățate de fragmente ale paragrafului precedent. Marginile figurilor 13.3, 15.4, 15.11 și 16.2 au fost ajustate pentru păstrarea integrală a liniilor și etichetelor, apoi redeschise și verificate. Dimensiunile HTML au fost actualizate; textul lecțiilor nu a fost schimbat în această etapă.

Revizia independentă a coordonatorului a identificat «șaua turceașcă» (p.297) și o separare de paragraf lipsă înainte de «Lobul anterior al hipofizei» (p.298). Ambele au fost corectate în HTML.

Figura 13.5 a fost reverificată în scanul nativ: săgeata de deasupra paratiroidelor este completă. Marginea superioară a fost extinsă cu 21 pixeli, fără text vecin; noul decupaj 2158×1017 a fost redeschis și dimensiunile HTML actualizate.
