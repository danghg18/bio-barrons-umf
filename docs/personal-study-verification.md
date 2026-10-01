# Verificare locală — 30 septembrie 2026

Implementarea celor patru cerințe este locală. Nu s-a publicat site-ul și nu s-a modificat proiectul Supabase de producție. Pașii necesari înainte de publicare sunt în [documentația sincronizării](personal-study-sync.md).

## Mediul și limitele verificării

Comanda `npm test` în directorul de lucru s-a oprit la validarea copiilor preexistente, neversionate, cu sufixul „2” (inclusiv o a doua declarație `CHAPTERS`). Aceste fișiere, `output/` și scriptul preexistent `scripts/sange-quiz-test.mjs` au rămas intacte și nu fac parte din modificare.

Testele au fost executate în `/tmp/bb-personal-validation`, o copie a fișierelor versionate și a fișierelor noi ale acestui task, fără copiile enumerate mai sus. După corectarea unor fixture-uri care presupuneau vechiul comportament exclusiv local, rularea a fost reluată de la verificările afectate. Toate componentele comenzii `npm test` au trecut cumulativ; aceasta nu reprezintă o singură invocare neîntreruptă cu rezultat verde. Comparația finală a celor 693 de fișiere ale copiei cu directorul de lucru nu a găsit diferențe, înaintea adăugării acestui raport și bifării planului.

Supabase a fost înlocuit în teste cu servicii simulate; SQL/RLS/RPC au fost executate în PGlite. Au fost folosite două conturi și două contexte independente de browser, inclusiv desktop și telefon. Aceste verificări nu confirmă configurarea Data API, autentificarea și livrarea emailurilor în proiectul real. Acestea rămân verificări de mediu înainte de publicare, după aplicarea migrației.

## Rezultate

| Domeniu | Rezultat local |
| --- | --- |
| Generare și structură | `generate:check`, validator: 41 de pagini, 17 capitole, 139 de fișiere JavaScript; `git diff --check` fără erori. |
| Conținut și bareme | Amprentele conținutului educațional protejat și baremele păstrate; 17 seturi / 1.590 de întrebări / 7.950 de explicații validate de suita existentă. Nicio nouă revizie editorială a explicațiilor nu este pretinsă. Cele 400 de întrebări asociative rămân nepublicate. |
| Scorare | 50.880 de combinații în playerul grilelor și 960 de combinații pentru simulare. Algoritmul și rezultatele istorice nu au fost schimbate. |
| Interfață și navigare | Suitele smoke, search, UI, redesign, grile și glosar; 41 de pagini la lățimi 1440/768/390/320, tabele, preferințe, căutare, navigare și compatibilitate cu lecțiile vechi. |
| Offline și actualizare | Worker nou și deja instalat, navigare/căutare offline, actualizarea activelor, istoricul și reluarea simulărilor. |
| Conturi și notițe | Suitele core, storage, race, SQL, media, browser și UI; 38 de scenarii browser pentru conturi și 5 pentru interfața contului. Editarea notițelor și evidențierile private din editor au rămas funcționale. |
| Evidențieri în lecții | Desktop și telefon pe lecție modernă, renală și masculină: salvare, culori, refresh, reluare după închidere, ancorare unică, refuzul ancorării ambigue, avertizare, căutare, ștergere individuală și confirmări pentru ștergerea în masă. |
| Sincronizare evidențieri | Import vizitator, două conturi, două contexte, ștergeri offline, ștergere concurentă și bariere împotriva reapariției datelor. |
| Istoric | Migrarea încercărilor reale și a parcurgerilor/corectărilor, idempotentă; păstrarea ID-urilor, datelor și rezultatelor inițiale; izolare și ștergeri. |
| Simulări | Continuare pe alt context, modificări offline independente și concurente, variante conflictuale păstrate, termen neschimbat, rezultat predat imuabil, ștergere confirmată și anularea ștergerii. |
| Transport și SQL | Paginare peste 500 de înregistrări, CAS, RLS propriu utilizator, acces anonim refuzat, lipsa ștergerii fizice din client, verificarea proprietarului cererii la schimbarea sesiunii, cereri întârziate, reîncercare după eroare. |
| Compatibilitate date | Versiuni viitoare păstrate fără blocarea datelor compatibile, editări în timpul hidratării păstrate, variante divergente ale încercărilor imuabile exportabile; barierele vizitatorului nu șterg datele contului. |
| Metadate | Numere și disponibilitate generate din registru; HTML livrat, desktop/telefon și JavaScript dezactivat: 17 lecții, 17 seturi, 1.590 de întrebări. |

Inspecția vizuală a inclus paleta pe telefon în lecția renală, ștergerea individuală pe desktop și paginile de statistici/simulare pe telefon. Capturile locale ale noilor teste sunt în `/tmp/bb-highlight-review` și `/tmp/bb-personal-cloud-review`.

## Punctajul pentru 2026

Ghidul și regulamentul oficial 2026 consultate nu au confirmat formula numerică detaliată. Formula istorică din 2023 este păstrată și etichetată explicit ca antrenament pentru biologie, fără a reprezenta nota examenului complet. Sursele, paginile și limitele sunt în [verificarea punctajului](simulation-scoring-sources.md).
