# Grile: sistemul endocrin și metabolism

## Sursă și împărțire

Import din `grile-biologie-umf-cluj-paginile-109-127.pdf`, primit la 25 septembrie 2026. PDF-ul are 19 pagini scanate, cu numerele tipărite **115–133**, diferite de intervalul din numele fișierului.

- **Sistemul endocrin:** 105 întrebări, numerele originale **1–64 și 120–160**; pagina `grile_sistemul_endocrin.html`, date `assets/js/grile-sistemul-endocrin-data.js`, cheia de stocare `bb.quiz.sistemul-endocrin.v1`.
- **Metabolism și nutriție:** 55 întrebări, numerele originale **65–119**; pagina `grile_metabolism_si_nutritie.html`, date `assets/js/grile-metabolism-data.js`, cheia de stocare `bb.quiz.metabolism.v1`.
- Împărțirea respectă cererea utilizatorului chiar pentru întrebările endocrine 61–64, 150 și 152 care tratează teme metabolice. Legăturile tematice pot trimite la lecția relevantă fără a muta întrebarea între teste.
- Exact 160 de întrebări și 800 de variante A–E, fiecare cu explicație individuală. Numerotarea nu este refăcută.

SHA-256 al PDF-ului: `ab84276e1a85269d1ef0b3fbd63458af01dd68d5e0b75d63a445ea59f28da453`.

## Autoritatea baremului și fidelitate

Pentru explicațiile endocrine, politica actuală și limitele reviziei sunt în secțiunea „Revizia explicațiilor endocrine — 29 septembrie 2026” de mai jos. Notele de import și rezultatele din 25 septembrie sunt istorice, nu o validare a prezentei revizii.


**Numai baremul transmis de utilizator stabilește punctajul.** Fixture-ul independent `tests/endocrin-metabolism-answer-key.json` are 160 de intrări, indexate prin `sourceNumber - 1`; literele au fost normalizate la majuscule. Observațiile biologice din explicații nu modifică cheia.

Toate paginile au fost inspectate vizual, apoi enunțurile și cele cinci variante au fost recitite în comparație cu scanarea, inclusiv continuările între coloane și pagini. O comparație OCR suplimentară a ajutat la localizarea diferențelor; imaginea scanată a rămas autoritatea. S-au unit rândurile tipografice și s-au redat indicii/sarcinile în Unicode. Greșelile tipărite și distractorii nu au fost corectați în textul întrebării.

Întrebările cu cerință negativă sunt 36, 69, 98 și 99. Explicațiile disting între afirmațiile false, afirmațiile adevărate care nu răspund cerinței și neconcordanțele dintre barem și biologie. Cazuri importante: **23C, 31A, 73B, 89B, 103A și 108D**. Nuanțele sunt documentate mai jos și în explicațiile afișate după verificare.

## Corespondența paginilor

| Pagina PDF | Pagina tipărită | Întrebări / continuări |
|---:|---:|---|
| 1 | 115 | 1–9D |
| 2 | 116 | 9E, 10–20 |
| 3 | 117 | 21–29 |
| 4 | 118 | 30–38 |
| 5 | 119 | 39–47A |
| 6 | 120 | 47B–55D |
| 7 | 121 | 55E–63C |
| 8 | 122 | 63D–71C |
| 9 | 123 | 71D–77 |
| 10 | 124 | 78–85 |
| 11 | 125 | 86–94A |
| 12 | 126 | 94B–102B |
| 13 | 127 | 102C–109 |
| 14 | 128 | 110–117A |
| 15 | 129 | 117B–125 |
| 16 | 130 | 126–136 |
| 17 | 131 | 137–145 |
| 18 | 132 | 146–154B |
| 19 | 133 | 154C–160 |

## Integrare și verificări reproductibile

Paginile folosesc același player, navigare, feedback și stil ca grilele pentru organele de simț. Registrul canonic publică resursele în catalog și în lecțiile părinte. Indexul de întrebări, legăturile tematice, sitemap-ul și inventarul offline includ ambele teste. Totalul site-ului devine 9 teste cu 611 întrebări.

Playerul validează acum numerele în raport cu intervalele declarate, acceptând discontinuitatea intenționată 64→120; lipsurile, duplicatele, ordinea greșită și suprapunerile rămân respinse. Seturile existente și cheile lor de stocare sunt păstrate. Toate paginile publice cer versiuni noi pentru registru, index și player, astfel încât un service worker vechi cu strategia cache-first să nu servească validatorul incompatibil în timpul actualizării. Amprentele tuturor întrebărilor noi sunt în `tests/quiz-content-hashes.json`; cele existente nu sunt schimbate.

- `npm run test:endocrin-metabolism`: fixture independent, toate combinațiile corecte verificate efectiv în browser, variante omise/selectate în plus, resetare/anulare/reîncărcare, izolare față de testele existente, catalog și lecții, numere/hash/history, căutare, mobil, statistici, exersarea greșelilor și service worker offline sub `/bio-barrons-umf/`.
- `scripts/quiz-cache-upgrade-test.mjs`: service worker real cu URL-urile vechi precache-uite și corpuri-martor, verificând că prima încărcare folosește resursele noi înaintea actualizării workerului; fără dependență de istoricul Git în CI.
- `npm test`: întreaga suită a site-ului, inclusiv fingerprint-uri, teme, navigare, căutare, conturi simulate și offline.
- Verificarea editorială vizuală și verificarea faptelor sunt distincte de testele automate; testele structurale nu demonstrează singure fidelitatea sau corectitudinea explicațiilor.

### Rezultat local al verificării — 25 septembrie 2026

Testul dedicat celor 160 de grile și regresia cache-ului au trecut. `npm test` a parcurs cu succes generarea, validarea, programa, smoke, căutarea, interfața, testele existente și verificările analiticii până la aserțiunea veche 7→9 teste disponibile din `study-flow-ui-test.mjs`. După actualizarea exclusiv a celor două așteptări numerice, acel test a fost rerulat cu succes, apoi `test:accounts` și `test:glossary` au trecut integral. Verificările deja trecute nu au fost repetate inutil. `generate:check` și `git diff --check` au trecut la final.

Au fost inspectate capturile ambelor teste la 1440 px și 390 px, inclusiv feedbackul după un răspuns greșit. Separat de fixture-ul automat, a fost reprodusă și verificată tranziția cu workerul și resursele reale din commitul anterior `207480b`: catalogul, cele 105/55 întrebări, indexul și legăturile către lecții funcționează cât timp workerul vechi rămâne activ. Aceasta este validare locală; nu s-a făcut publicare.

## Revizia explicațiilor endocrine — 29 septembrie 2026

La cererea utilizatorului, sursele externe din vechiul audit endocrin sunt retrase. Explicațiile folosesc exclusiv `output/text/Manual_Biologie_toate_cele_17_lectii.txt` și figurile locale corespunzătoare ale manualului. Prima etapă a reviziei a acoperit **105 grile endocrine / 525 de explicații A–E**. Extinderea ulterioară include și cele **55 de grile / 275 de explicații** din testul separat de metabolism; starea completă este în `docs/manual-explanation-review.md`. Numerotarea, enunțurile, variantele, baremul, identificatorii și contractul de progres rămân neschimbate.

TXT-ul se identifică drept export al celor 17 lecții, nu transcriere integrală a fiecărei pagini tipărite. Nu conține etichetele grafice. Au fost inspectate vizual figurile 13.3 (nuclei și conexiuni hipotalamice), 13.4 (tiroidă), 13.6 (raporturi pancreatice), 13.7 (insulină/glucagon), 18.10 (duct biliar și cap pancreatic) și 19.1b (ATP). O lipsă din TXT nu este tratată ca dovadă că informația lipsește din carte.

Fiecare explicație afișată include o trimitere cu numele lecției și secțiunea, tabelul sau figura relevantă; nu folosește numere de capitole. `data/endocrin-manual-review.json` înregistrează sursa și amprenta sa, intervalele de rânduri din TXT, imaginile verificate și corespondența tuturor celor 525 de explicații cu sursele. Amprentele explicațiilor identifică versiunea revizuită; ele nu înlocuiesc verificarea editorială.

Corelările includ: cap. 6 pentru remodelarea osoasă și hidroxiapatită; cap. 8 pentru nucleul fibrei musculare netede; cap. 11 pentru diencefal; cap. 16 pentru timus; cap. 18 pentru digestie, vitamine și pancreas; cap. 19 pentru metabolism, cetoacidoză, chilomicroni și termoreglare; cap. 20 pentru ADH și aldosteron; cap. 22–23 pentru gonade și controlul hormonal.

Cazuri care rămân explicit delimitate:

- **4A/C/E:** cerința generală despre secreția hipotalamică este interpretată de barem pentru ADH și oxitocină; hormonii stimulatori/inhibitori nu sunt negați.
- **12A:** rolurile FSH/LH sunt corelate între cap. 13 și 23, fără a nega acțiunea LH asupra foliculului în dezvoltare.
- **23C:** cap. 6 leagă hormonii sexuali de echilibrul osteoblastelor/osteoclastelor. Excluderea din barem nu justifică negarea categorică a acestei legături.
- **29A și 131B:** „secretat” poate însemna produs sau eliberat. Manualul diferențiază producerea hipotalamică de eliberarea neurohipofizară.
- **31A:** enumerarea depunerii glicogenului la ACTH nu dovedește inhibarea glicogenogenezei de către glucocorticoizi.
- **54A, 55B/D și 57A:** se disting afirmația susținută de manual și delimitarea cerinței folosită de barem; nu se declară fals un efect doar pentru că varianta este exclusă.
- **18A și 146A:** pasajele furnizate nu precizează structura chimică a glucagonului și secretinei. Excluderea din barem este păstrată, iar limita justificării este menționată, fără completare externă.
- **155C:** manualul atribuie estrogenilor dezvoltarea caracterelor sexuale feminine, dar pasajele furnizate nu detaliază separat dezvoltarea glandelor mamare.
- **160C:** schema 13.7 prezintă insulina eliberată acționând pe ținte; nu se adaugă etape de procesare hormonală absente din sursă.

Clasificarea proteină/peptidă/glicoproteină urmează tabelul 13.1; efectele ACTH urmează tabelul 13.2; afinitatea transportorului pentru glucoză și efectele hormonilor asupra lipidelor/proteinelor urmează cap. 19. Au fost eliminate completările externe despre căi moleculare, excepții clinice, secreții ectopice și studii experimentale.

### Verificarea acestei revizii

- Comparație cu copia fișierului de la începutul intervenției: numai câmpurile `options[].why` au fost schimbate în date; 105 enunțuri, 525 variante, baremul, ordinea, ID-urile și versiunea progresului sunt identice.
- Toate cele 525 de explicații au referințe în registrul editorial; amprentele TXT-ului, figurilor inspectate și explicațiilor corespund.
- `npm run generate` și `npm run generate:check`: trecute. Băncile de simulare și manifestul offline sunt regenerate; URL-ul datelor endocrine are versiunea `20260929-manual`.
- `npm run test:endocrin-metabolism`: trecut, inclusiv barem/punctaj, reîncărcare, izolare, căutare, mobil, greșeli, offline și cache vechi. Capturile de desktop (1440 px) și telefon (390 px) au fost inspectate vizual.
- `quiz-topics-test.mjs`, `simulation-data-test.mjs`, `umf-2026-content-test.mjs` și `umf-2026-semantic-test.mjs`: trecute.
- `npm test`: **oprit la validare**, din cauza declarației duplicate `CHAPTERS` din fișierul local neversionat preexistent `assets/js/chapters-data 2.js`. Restul suitei generale nu a rulat prin această comandă. Duplicatul nu a fost modificat sau șters.
- `git diff --check`: trecut. Modificările sunt locale; nu s-a făcut publicare.
