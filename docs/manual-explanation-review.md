# Revizia explicațiilor după manual — 29 septembrie 2026

Sursa exclusivă este `output/text/Manual_Biologie_toate_cele_17_lectii.txt`, împreună cu figurile originale ale manualului disponibile local și verificate vizual. TXT-ul este un export al lecțiilor și nu transcrie etichetele grafice. Absența unei noțiuni dintr-un pasaj nu este tratată automat ca absență din carte: se corelează lecțiile, tabelele, legendele și figurile.

Explicațiile folosesc numele lecțiilor în trimiteri, de exemplu „Sistemul endocrin — hipofiza”, inclusiv când susținerea se află în altă lecție. Numerele figurilor și tabelelor rămân pentru identificarea sursei originale. Explicațiile susținute deja de material au fost păstrate și referențiate; completările externe au fost eliminate sau înlocuite. Unde sursele disponibile nu lămuresc un detaliu ori contrazic selecția din barem, limita sau neconcordanța este explicită.

Enunțurile, variantele, cheile, numerotarea, identificatorii, datele de compatibilitate și contractele de progres nu se modifică. În băncile de grile se editează exclusiv `options[].why`. TXT-ul integral furnizat de utilizator rămâne local; auditul publicat îl identifică prin SHA-256, fără să republice manualul.

Revizia acoperă toate cele 17 capitole publicate. Sistemul urinar și Sistemul reproducător masculin au fost finalizate în continuarea autorizată după prima etapă de 15 capitole.

## Evidența editorială

- `data/endocrin-manual-review.json`: explicațiile endocrine și sursele lor.
- `data/manual-review-metabolism-digestive-female.json`: metabolism, digestiv și reproducător feminin.
- `data/manual-review-foundations.json`: introducere, celulă și oase.
- `data/manual-review-neural.json`: țesut muscular, țesut nervos, organizarea sistemului nervos și organele de simț.
- `data/manual-review-circulation.json`: sânge, cardiovascular, limfatic și respirator.
- `data/manual-review-urinary.json`: sistemul urinar.
- `data/manual-review-male.json`: sistemul reproducător masculin.

Fiecare audit identifică TXT-ul prin SHA-256 și conține corespondența fiecărei opțiuni cu pasajele/figurile relevante. Intervalele de rânduri permit verificarea sursei; hash-urile explicațiilor, acolo unde sunt prezente, identifică exact versiunea revizuită. Aceste verificări structurale nu înlocuiesc lectura editorială.

Reîncadrarea din 3 octombrie 2026 mută grilele 61–64 și 150 la Metabolism și nutriție, fără modificarea explicațiilor. Referințele lor rămân în auditul endocrin, sub ID-urile originale `end-061`–`end-064` și `end-150`. Tabelul de mai jos reflectă distribuția actuală.

## Capitole revizuite

| Lecție | Grile | Explicații A–E |
|---|---:|---:|
| Introducere în anatomie și fiziologie | 60 | 300 |
| Celula și fiziologia celulară | 50 | 250 |
| Oasele și articulațiile | 180 | 900 |
| Țesutul muscular | 155 | 775 |
| Țesutul nervos | 85 | 425 |
| Organizarea sistemului nervos | 100 | 500 |
| Organele de simț | 100 | 500 |
| Sistemul endocrin | 100 | 500 |
| Sângele | 80 | 400 |
| Sistemul cardiovascular | 82 | 410 |
| Sistemul limfatic și imun | 58 | 290 |
| Sistemul respirator | 160 | 800 |
| Sistemul digestiv | 80 | 400 |
| Metabolism și nutriție | 60 | 300 |
| Sistemul urinar | 100 | 500 |
| Sistemul reproducător masculin | 69 | 345 |
| Sistemul reproducător feminin | 71 | 355 |
| **Total revizuit** | **1.590** | **7.950** |

Ultima etapă acoperă 169 de grile și 845 de explicații. În urinar, 357 de explicații au fost rescrise, iar celelalte au fost verificate și referențiate; în reproducătorul masculin au fost rescrise toate cele 345. Figurile urinare 20.1–20.9 și cele masculine 22.1–22.5 au fost verificate vizual, împreună cu figurile relevante din celelalte lecții. Limitele sursei rămân explicite, inclusiv pentru anumite raporturi anatomice, mecanismele sfincteriene și diferențele dintre barem și text.

## Verificări locale

După ultimele două capitole au fost repetate comparația structurală cu snapshoturile, verificarea celor 7.950 de referințe, generarea, amprentele educaționale, concordanța băncilor de simulare, verificarea baremelor și compatibilității, testele pentru seturile recuperate (inclusiv toate explicațiile afișate în DOM) și verificarea vizuală a celor două pagini. Testul de compatibilitate cu workerul cache-first deja instalat a trecut pentru toate cele 17 seturi și 1.590 de grile, inclusiv încărcarea explicațiilor noi și păstrarea răspunsurilor după reîncărcare. Celelalte rezultate de mai jos provin din etapa anterioară, dacă nu sunt incluse în această enumerare.

- Comparația celor 17 bănci cu snapshotul inițial: câmpurile din afara `why` sunt identice. Cele 17 bănci revizuite au sursă nominală la fiecare opțiune și nicio trimitere numerică de tip „capitolul 15”.
- Acoperirea auditurilor: 7.950 înregistrări unice, corespunzătoare tuturor explicațiilor revizuite; SHA-256 al TXT-ului, intervalele și căile figurilor sunt valide.
- `umf-2026-scoring-test.mjs`: toate cele 50.880 de combinații de răspuns pentru cele 1.590 de grile publicate au trecut prin evaluatorul real.
- Testele pentru endocrin/metabolism, celulă, seturile recuperate, organele de simț, circulator și analytics au trecut, inclusiv păstrarea progresului, retry/reset/reload și compatibilitatea datelor.
- `quiz-topics-test.mjs`, `simulation-data-test.mjs`, `umf-2026-content-test.mjs`, `umf-2026-semantic-test.mjs` și `quiz-content-compatibility-test.mjs`: trecute. Băncile de simulare reproduc datele editoriale și baremele sunt păstrate.
- Verificare în browser pentru fiecare dintre cele 17 pagini: cele cinci explicații ale primei grile afișează sursa, răspunsul exact este punctat corect, fără erori JavaScript sau depășire orizontală la 1440 și 390 px. Capturi reprezentative din endocrin/metabolism/digestiv/feminin/urinar/masculin au fost inspectate vizual.
- `npm run generate` și verificarea generării au trecut. URL-urile băncilor revizuite folosesc versiunea `20260929-manual`, iar manifestul offline și băncile de simulare sunt regenerate.
- `npm test` **nu a trecut integral**: se oprește în validator pe duplicatul preexistent, neversionat, `assets/js/chapters-data 2.js` (`duplicate CHAPTERS declarations`). Fișierele duplicate ale utilizatorului nu au fost șterse sau modificate.

Această evidență descrie verificările făcute înainte de publicarea reviziei.
