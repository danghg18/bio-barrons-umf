# Acoperirea programei UMF Cluj 2025 — Barron’s 2022

Raport de integrare locală pentru Medicină și Medicină Dentară. Sunt incluse cele 17 capitole cerute: șapte lecții noi și zece lecții existente revizuite. Publicarea online nu face parte din această intervenție.

## Surse și numerotare

Sursele sunt fișierele furnizate `Tematica-si-bibliografie-ADMITERE-2025.pdf` și `734244481-Barron-s-2022.pdf`. Amprentele SHA-256, intervalele și excluderile sunt în [inventarul programei](../data/curriculum-2025.json). Numerele din lecții și din acest raport sunt **paginile tipărite**. Pozițiile PDF sunt numărate de la 1.

Paginile au fost confruntate vizual cu numerele tipărite. Decalajul este +7 pentru capitolele 1–13 și +8 începând cu capitolul 14; poziția PDF 326 este goală. Nu s-a aplicat un decalaj unic întregii cărți.

| Capitol | Pagini tipărite | Poziții PDF | Figuri | Tabele HTML |
|---|---|---|---:|---:|
| 1. Introducere în anatomie și fiziologie | 1–11 | 8–18 | 5 | 2 |
| 3. Celula și fiziologia celulară | 45–52 | 52–59 | 5 | 1 |
| 6. Oasele și articulațiile | 115–126 | 122–133 | 5 | 2 |
| 8. Țesutul muscular | 167–179 | 174–186 | 2 | 1 |
| 10. Țesutul nervos | 223–235 | 230–242 | 9 | 2 |
| 11. Organizarea sistemului nervos | 245–259 | 252–266 | 10 | 5 |
| 12. Organele de simț | 271–283 | 278–290 | 8 | 2 |
| 13. Sistemul endocrin — nou | 295–308 | 302–315 | 9 | 3 |
| 14. Sângele — nou | 319–331 | 327–339 | 7 | 3 |
| 15. Sistemul cardiovascular — nou | 343–359 | 351–367 | 11 | 2 |
| 16. Sistemul limfatic și imun — nou | 375–382 | 383–390 | 5 | 1 |
| 17. Sistemul respirator — nou | 401–414 | 409–422 | 9 | 1 |
| 18. Sistemul digestiv — nou | 425–441 | 433–449 | 10 | 4 |
| 19. Metabolism și nutriție — nou | 453–474 | 461–482 | 4 | 1 |
| 20. Sistemul urinar | 485–497 | 493–505 | 9 | 4 |
| 22. Sistemul reproducător masculin | 529–537 | 537–545 | 5 | 2 |
| 23. Sistemul reproducător feminin | 549–566 | 557–574 | 10 | 2 |
| **Total** | | | **123** | **38** |

Tabelul 20.2 apare și la vechea adresă `#mindmap`, înlocuind explicațiile interactive fără corespondent în manual. Prin urmare, cele 38 de instanțe HTML reprezintă 37 de tabele distincte ale sursei.

## Delimitări și fidelitate

Excluderile urmează titlurile și blocurile indicate, inclusiv când limita cade în interiorul paginii. Limitele exacte și inventarele figurilor sunt documentate în rapoartele de autor: [capitolele 1–12](curriculum-2025-early.md), [capitolul 11](curriculum-2025-nervous.md), [capitolele 13–16](curriculum-2025-middle.md), [capitolele 17–23](curriculum-2025-late.md).

În special, p.52 se oprește înainte de „Celulele și energia”; p.124 reia „Mișcările articulare”; p.176 reia „Energia necesară contracției musculare”. Întregul bloc „Funcțiile mușchiului neted și cardiac” de pe p.178–179 este exclus. Paginile 324, 355–356, 382, 455–456, 463, 472, 532 și 562 sunt împărțite după titlurile sursei. Referințele incidente la ATP sau la alte noțiuni din blocurile incluse nu au fost eliminate automat. Figura 19.10 este exclusă.

La cererea ulterioară a utilizatorului, blocurile introductive „Ce veți învăța” au fost eliminate din toate cele 17 lecții. Termenii-cheie sunt evidențiați selectiv cu bold; formulările paragrafelor păstrate, figurile și tabelele nu au fost modificate. Cuprinsurile de deschidere sunt reprezentate prin navigare. Antetele, numerele paginilor și grafica decorativă nu sunt conținut de lecție. Exercițiile recapitulative ale manualului nu au fost importate ca grile noi.

OCR-ul a fost doar transcriere preliminară. Fiecare pagină inclusă a fost citită vizual, apoi verificată de un alt agent decât autorul. Au fost păstrate formulările și particularitățile sursei, fără corecturi științifice editoriale. Reviziile independente sunt documentate separat: [1–12](curriculum-2025-independent-middle.md), [13](curriculum-2025-independent-root.md), [14–16](curriculum-2025-independent-14-16.md), [17–23](curriculum-2025-independent-early.md).

Căutările online au găsit imagini similare sau redesenate, fără o potrivire exactă verificată. Cele 123 de figuri livrate folosesc rezerva aprobată: decupaje din imaginile native ale PDF-ului furnizat, păstrând etichetele și panourile. Toate sunt WebP locale; legendele sunt text HTML căutabil. Figurile 11.1 și 11.10 au fost înlocuite cu ilustrațiile scanului. Fișierele vechi nu au fost șterse incidental.

## Integrare și păstrarea datelor

URL-urile și identificatorii existenți sunt păstrați. Lecțiile noi folosesc shell-ul existent și routerul comun. Registrul canonic gestionează disponibilitatea, temele și resursele; nu există backend sau migrare de framework.

Adresele secțiunilor excluse rămân accesibile, cu mesaj și legătură spre lecție. Marcajul `data-curriculum-excluded` le elimină din căutarea de studiu și din calculul progresului, inclusiv pentru o subsecțiune exclusă aflată într-o secțiune păstrată. Notițele vechi rămân accesibile. Nu s-au schimbat cheile de stocare, întrebările, baremele sau istoricul grilelor.

Au fost adaptate 27 de destinații din registrul tematic al grilelor către titlurile efective ale manualului; ID-urile temelor și repartizarea întrebărilor au rămas aceleași. Astfel, legăturile de recapitulare nu caută titluri eliminate prin corectarea lecțiilor.

## Evidența verificării

Inventarul la nivel de bloc este în [curriculum-source-inventory.json](../tests/curriculum-source-inventory.json): destinație, pagină tipărită, tip de bloc, amprentă text și, pentru figuri, fișierul și amprenta imaginii. După eliminarea obiectivelor introductive la cererea utilizatorului, cuprinde 886 de blocuri: 666 de paragrafe, 21 de elemente de listă, 123 de figuri, 38 de tabele și 38 de casete. Toate blocurile păstrate au aceleași amprente de text și imagini ca înaintea acestei modificări de prezentare. Actualizarea explicită a acestui inventar și a amprentelor educaționale s-a făcut după închiderea reviziei sursei, separat de generarea obișnuită a site-ului.

Au trecut verificările structurale pentru toate cele 17 capitole, inventarul blocurilor și regresia excluderilor. Testul de studiu a încărcat 86 de notițe distincte pe toate cele 86 de rute, le-a verificat după navigare și reîncărcare, folosind atât routerul comun, cât și cele două routere legacy. Progresul anterior, inclusiv identificatori vechi necunoscuți, a rămas stocat; secțiunile excluse nu intră în numitorul progresului. Acest test folosește exclusiv un serviciu simulat, fără acces la conturi reale.

Inspecția locală în browser a parcurs cele 86 de rute la 1440 px și 390 px, cu 172 de capturi, fără depășiri orizontale, imagini neîncărcate sau erori JavaScript. Capturile au fost inspectate vizual; rutele modificate la ultima revizie au fost recontrolate. Figurile au fost comparate separat, la rezoluția sursei, nu numai din miniaturile capturilor.

Verificarea finală din 19 septembrie 2026 s-a încheiat cu succes:

- `npm run generate` — sitemap, indexul grilelor și precache regenerate; după ajustarea prezentării, cache-ul rezultat este `biologie-atlas-38b906d9b51f`.
- `npm test` — **exit 0**, întreaga suită: generare, validare, curriculum, navigare/offline, căutare/evidențiere, interfață, grile, statistici, conturi și glosar.
- Interfață: 30 de pagini publice, toate rutele la 10 dimensiuni de ecran, toate cele 38 de tabele, fonturi, meniuri și integritatea conținutului.
- Căutare/evidențiere: toate cele 24 de pagini de lecții și grile, plus selecție tactilă pe telefon; diacritice, expresii împărțite de marcaje și parametrii URL.
- Offline: instalare nouă și actualizare de service worker; toate cele 17 lecții și imaginile lor se încarcă offline. Adresele de căutare ale lecțiilor au fost vizitate întâi online și apoi reverificate exact offline, conform contractului existent al cache-ului. Cache-urile fără legătură cu aplicația au fost păstrate.
- Grile și conturi: amprente educaționale și bareme intacte, punctaj exact, retry/reset/reload, istoric păstrat și 30 de scenarii de conturi/notițe cu servicii simulate.
- `git diff --check` — fără erori.

Jurnalul inițial al rulării este `tmp/curriculum-2025/npm-test-final.log`. După eliminarea blocurilor „Ce veți învăța” și evidențierea termenilor-cheie, întreaga suită `npm test` a trecut din nou (exit 0), cu jurnalul `tmp/curriculum-2025/npm-test-presentation.log`. Cele 86 de rute au fost recapturate la 1440 px și 390 px, fără depășiri orizontale, imagini lipsă sau erori JavaScript; au fost inspectate vizual exemple de pagini de început și de conținut pe ambele dimensiuni. Capturile și raportul inspecției locale sunt în `tmp/curriculum-2025/browser/`. Inspecția în browser, comparația conținutului cu sursa și verificarea offline sunt verificări distincte; una nu este prezentată ca dovadă pentru celelalte.

**Problemă preexistentă:** înainte de editarea lecțiilor, `npm run generate:check` semnala că `sitemap.xml` era neactualizat. Regenerarea finală rezolvă și această neconcordanță. Modificările locale preexistente au fost păstrate; nu s-a făcut staging, commit sau publicare.
