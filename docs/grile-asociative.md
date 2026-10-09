# Grile asociative — UMF Cluj 2026

Integrare finalizată la 9 octombrie 2026, la cererea utilizatorului. Colecția conține 400 de întrebări și 2.000 de explicații A–E. Apare în Testare, statistici, exersarea greșelilor și selecția simulărilor, în ambele ediții ale site-ului. Cele 17 lecții rămân distincte de colecția asociativă.

## Surse și barem

Enunțurile și variantele au fost confruntate vizual cu paginile PDF 233–288 din `1019145554-Grile-Biologie-UMF-Cluj-2026-1.pdf`; baremul se află la paginile 289–291. Cheia independentă existentă, `tests/umf-cluj-2026-answer-key.json`, capitol XIII, este păstrată integral. La 182, forma tipărită este **ACBE**, iar playerul stochează aceeași mulțime sortată, **ABCE**. Nu este o modificare a răspunsului.

Explicațiile au fost rescrise exclusiv din `output/text/Manual_Biologie_toate_cele_17_lectii.txt` și figurile originale locale inspectate. SHA-256 al TXT-ului: `787a515090ab49c3ea9d135a141b2a8ff77e7aa5fe3b7e1aa8102d783bfb5dd6`. Au fost corelate cele 17 lecții, tabelele și etichetele grafice relevante; inventarul auditului include 54 de figuri distincte. Nu au fost utilizate surse web, excepții clinice sau completări din cunoștințe externe.

Toate cele 2.000 de explicații și referințele lor au avut recenzie editorială independentă, urmată de aplicarea constatărilor. Enunțurile, variantele și baremul nu au fost ajustate pentru a masca neconcordanțe. Corectura certă de transcriere la 15B, „menstrual”, era deja prezentă în copia de recenzie arhivată și a fost verificată pe scan. Numerele și cerințele negative sunt păstrate.

## Audit și limite

`data/manual-review-asociative.json` conține câte o înregistrare pentru fiecare variantă, cu lecția, secțiunea, rândurile TXT, figurile relevante și SHA-256 al explicației integrate. Testul structural verifică corespondența cu banca; lectura editorială este documentată separat în rapoartele locale `output/asociative-20261009/report-*.md` și `review-*.md`. Arhiva veche din `docs/editorial/umf-2026/asociative-pending/` rămâne neschimbată ca istoric al ciornelor, cu o notă de reluare în README.

„Susținută” clasifică explicația, inclusiv motivele de excludere a unei variante; nu înseamnă că varianta este adevărată. „Limită” înseamnă că sursa nu demonstrează toate detaliile cerute. „Discrepanță” include contradicții și formulări ambigue față de selecția baremului. Aceste situații sunt explicite în explicațiile afișate și nu schimbă punctarea.

| Lot | Explicații | Susținute | Limite | Discrepanțe/ambiguități |
|---|---:|---:|---:|---:|
| 001-100 | 500 | 485 | 12 | 3 |
| 101-200 | 500 | 477 | 16 | 7 |
| 201-300 | 500 | 486 | 8 | 6 |
| 301-400 | 500 | 493 | 4 | 3 |
| **Total** | **2.000** | **1.941** | **40** | **19** |

- 001-100, limite: 4C, 4E, 7A, 14E, 31D, 32B, 53E, 61C, 84E, 87D, 87E, 92C.
- 001-100, discrepanțe/ambiguități: 18B, 20B, 70E.
- 101-200, limite: 107D, 107E, 112E, 113B, 116A, 116D, 118E, 119E, 121E, 142A, 151C, 171E, 179D, 192A, 194E, 196A.
- 101-200, discrepanțe/ambiguități: 128D, 149B, 155B, 183E, 188D, 193D, 200E.
- 201-300, limite: 201E, 202B, 208D, 230C, 233D, 255B, 282E, 284A.
- 201-300, discrepanțe/ambiguități: 203E, 219B, 261D, 262E, 276C, 277C.
- 301-400, limite: 338E, 374E, 394E, 399A.
- 301-400, discrepanțe/ambiguități: 352E, 369E, 377D.

## Integrare și compatibilitate

- Pagina `grile_asociative.html`, copia generată `nou/grile_asociative.html` și banca `assets/js/grile-asociative-data.js` reutilizează playerul existent.
- Colecția este în `BIO_SITE.quizCollections`, cu numărul rezervat 1000, ID-uri `asoc-001`–`asoc-400`, cheia nouă `bb.quiz.asociative.v1` și 40 de intervale. Nu există progres anterior publicat de migrat pentru această colecție.
- Cele 91 de grupări tematice trimit la rute de lecție existente, fără a muta întrebări între cele 17 seturi tematice.
- Indexul, băncile de simulare, catalogul static, sitemapul, manifestele offline și ediția `nou/` sunt generate. URL-urile registrului și indexului au versiunea `20261009-asociative1`; banca nouă folosește `20261009-manual`.
- Totalul site-ului devine 18 seturi, 1.990 de întrebări și 9.950 de explicații. Numărul lecțiilor rămâne 17.

## Verificări locale

- Verificări editoriale și structurale: 400/400 chei, toate textele protejate comparate cu arhiva, 2.000/2.000 referințe și amprente, rândurile TXT și căile figurilor valide.
- Evaluatorul real: toate cele 63.680 de combinații ale celor 1.990 de întrebări au trecut, dintre care 12.800 pentru asociative. Ultimele corecții au schimbat numai explicații/referințe, nu cheia sau evaluatorul.
- Cache deja instalat: toate cele 18 seturi se încarcă fără registru sau index vechi; sursele, legăturile și cele cinci explicații apar corect, iar răspunsurile se păstrează la reîncărcare.
- Analytics: verificările de secțiuni, finalizare, topicuri, date, corecturi, sesiuni, greșeli, restart, navigare și interfață au trecut. Pornirea catalogului și metadatele desktop/mobil, cu/fără JavaScript, au trecut.
- Generarea și verificarea generării, conținutul UMF, grupările tematice, băncile de simulare și `git diff --check` sunt verificate după integrarea finală.
- Browser final: 36/36 combinații set–dispozitiv au trecut (18 seturi la 1440 și 390 px), inclusiv barem independent, toate limitele intervalelor, cinci explicații, navigare, căutare, salvare/reîncărcare, statistici și simulare cu toate seturile. Dovezi: `output/asociative-20261009/browser/results.json`.
- Colecția asociativă clasic/nou: 4/4 combinații ediție–lățime au trecut, inclusiv cheia ACBE/182, persistența, URL de căutare vizitat accesibil offline și ultima grilă400 offline. Capturile de pe desktop și telefon au fost inspectate vizual; textul și controalele sunt lizibile, fără depășire orizontală. Dovezi: `output/asociative-20261009/focused-browser/results.json`.
- `npm test` nu a trecut integral: validatorul se oprește pe declarațiile duplicate CHAPTERS din fișierele preexistente, neversionate `assets/js/chapters-data 2.js` și `chapters-data 3.js`. Aceste fișiere nu au fost șterse sau modificate. Verificările specifice de mai sus au fost executate separat; nu reprezintă o trecere a întregii suite.

Publicarea pe `main` a fost cerută explicit de utilizator la 9 octombrie 2026. Livrarea este construită peste versiunea curentă `origin/main`, fără duplicate, fișiere `output/` sau modificările locale fără legătură. Proiectul Supabase nu este modificat prin această livrare.


## Verificarea copiei pentru publicare

Copia de publicare pornește din `origin/main` la `13a2605`, păstrând cele două commituri deja publicate după baza locală inițială. Au trecut verificarea generării, validatorul, verificările curriculumului și ale intrărilor directe, testul complet `smoke-test.mjs` (17 lecții, 18 seturi, navigare, preferințe, mobil și offline), auditul asociativelor, conținutul UMF, topicurile, băncile de simulare și metadatele.

Pe această copie au trecut și cele patru combinații clasic/nou × desktop/telefon și testul cu worker cache-first deja instalat. Baremul și toate textele lecțiilor sunt păstrate; schimbările din paginile existente sunt versiunile registrului/indexului și metadatele/catalogul generate. Fișierele locale fără legătură nu sunt incluse.

Comanda `npm test` din copia curată s-a oprit inițial la o constantă veche de 17 seturi/1.590 întrebări în verificarea workerului. Constanta a fost corectată la 18/1.990, iar întregul test smoke a fost reluat și a trecut. Restul suitei generale nu a fost reluat integral în etapa de publicare; verificările specifice și rezultatele etapei de integrare sunt enumerate mai sus.
