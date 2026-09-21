# Revizie independentă — capitolele 1, 3, 6, 8, 10, 11 și 12

Revizie de conținut și decupaje realizată la 18 septembrie 2026. Scanurile native din `/tmp/barrons-early/native/pN.png` au fost deschise separat, la dimensiune lizibilă, și comparate cu textul HTML, obiectivele incluse, tabelele, legendele și casetele. Toate cele 44 de imagini livrate din capitolele revizuite au fost deschise individual și comparate cu sursa. Numerele de pagină din constatările de mai jos sunt tipărite; poziția în PDF este cu 7 mai mare.

Aceasta nu este o verificare a randării sau funcționalității în browser. Nu am modificat lecțiile celorlalți autori.

| Capitol | Pagini tipărite deschise | Poziții PDF | Tabele incluse comparate | Figuri livrate comparate |
|---|---|---|---|---|
| 1 — Introducere | 1–11 | 8–18 | 1.1, 1.2 | 1.1–1.5 |
| 3 — Celula | 45–52 | 52–59 | 3.1 | 3.1–3.5 |
| 6 — Oasele și articulațiile | 115–126 | 122–133 | 6.1, 6.3 | 6.1–6.4, 6.6 |
| 8 — Țesutul muscular | 167–171, 176–179 | 174–178, 183–186 | 8.1 | 8.1, 8.5 |
| 10 — Țesutul nervos | 223–235 | 230–242 | 10.1, 10.2 | 10.1–10.9 |
| 11 — Sistemul nervos | 245–259 | 252–266 | 11.1–11.5 | 11.1–11.10 |
| 12 — Organele de simț | 271–283 | 278–290 | 12.1, 12.2 | 12.1–12.8 |

## Delimitări verificate

- Capitolul 1 se oprește înaintea întrebărilor recapitulative de pe p.11.
- Capitolul 3 include p.52 până înainte de «Celulele și energia».
- Capitolul 6 omite blocul «Tipuri de diartroze» început la mijlocul p.123, inclusiv tabelul 6.2 și figura 6.5. Reia textul de la «Mișcările articulare», în partea de jos a p.124, și păstrează tabelul 6.3 pe p.126.
- Capitolul 8 păstrează începutul p.171 înaintea «Funcția mușchilor striați — mecanismul de glisare al filamentelor» și reia textul la «Energia necesară contracției musculare», la mijlocul p.176. Paginile 172–175 sunt integral excluse și nu au fost revizuite ca text de importat. Paginile 178–179 au fost deschise pentru verificarea delimitării: întregul bloc «Funcțiile mușchiului neted și cardiac», inclusiv subsecțiunile, tabelul 8.3 și schema fără număr, este exclus conform clarificării coordonatorului; nu se selectează separat propoziții structurale din blocul exclus.
- Capitolul 11 include întregul interval 245–259, cu toate cele 10 figuri și 5 tabele.

## Constatări și remediere

1. Capitolul 11, tabelul 11.2, p.252: lipsea `;` după `(aria somatică motorie, aria vorbirii)`. Corectat de coordonator și reverificat în HTML.
2. Capitolul 11, p.258, după figura 11.10: `simpațice` în loc de `simpatice`. Corectat de coordonator și reverificat în HTML.
3. Capitolul 1, p.5: `ścade nivelul glicemiei` în loc de `scade nivelul glicemiei`. Corectat de autor și reverificat în HTML.
4. Capitolul 6: obiectivele introductive de pe p.115 lipseau la prima verificare. Autorul le-a restaurat; întregul bloc a fost recitit și comparat cu sursa.
5. Capitolele 3 și 8: lipsea obiectivul generic privind aplicarea cunoștințelor într-un studiu de caz. Restaurat de autor și reverificat în HTML.
6. Capitolul 8, p.176: `ATPul` trebuie `ATP-ul`, iar `necesităților celu- lare` trebuie `necesităților celulare`. Corectat de autor și reverificat în HTML.
7. Figura 8.5: decupajul inferior taie litera O de sub ciclul ribozei. Marginea extinsă de autor; litera O completă confirmată vizual. Franjura minusculă a legendei de la marginea inferioară a fost apoi eliminată; fișierul final a fost redeschis și verificat.

8. Capitolul 10, p.224 și p.227: ghilimeaua inițială lipsă în «înspre», virgulă suplimentară în «luptă sau fugi» și «substanța lipidică» în loc de «substanță lipidică». Corectate de autor și reverificate în HTML.
9. Figura 10.8: marginea superioară include un fragment de text din paragraful precedent. Eliminat de autor; fișierul final a fost redeschis, cu etichetele intacte.
10. Capitolul 12, tabelul 12.2, p.274: «muschii extrinseci» în loc de «mușchii extrinseci». Corectat de autor și reverificat în HTML.

Capitolele 10 și 12 au fost comparate integral pe cele 26 de pagini, inclusiv obiectivele, cele patru tabele, cele 17 legende și casetele. Toate cele 17 fișiere de figuri au fost deschise individual; defectul de la figura 10.8 a fost remediat și reverificat. Particularitățile textului sursă au fost păstrate, fără corecturi științifice editoriale.

În afara constatărilor enumerate, comparația efectuată nu a identificat omisiuni substanțiale de paragrafe, tabele, legende sau etichete în conținutul inclus. Rezultatul privește fișierele citite în această sesiune; modificările ulterioare necesită verificarea lor separată.

## Revizie limitată a excluderilor în infrastructura comună

Au fost citite implementările excluderilor din `assets/js/search-text.js`, `assets/js/home.js`, `assets/js/chapter-redesign.js` și cele trei scripturi `scripts/curriculum-*.mjs`. Nu am identificat regresii concrete în modificările pentru excluderi. Selectorii de căutare omit atât rutele excluse, cât și blocurile excluse din interiorul unei rute; progresul utilizează setul de rute incluse. Am rulat `node scripts/curriculum-exclusions-test.mjs`: trecut, inclusiv bookmark pe ruta exclusă, accesul la notițe, căutarea locală și din homepage, numitorul progresului și absența santinelei de completare pentru ruta exclusă. Această verificare nu reprezintă o revizie a tuturor modificărilor preexistente din fișierele comune sau rularea întregii suite.
