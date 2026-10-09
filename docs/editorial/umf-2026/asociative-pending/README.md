# Asociative UMF Cluj 2026 — progres păstrat, publicare amânată

> **Reluare la 9 octombrie 2026:** utilizatorul a cerut integrarea celor 400 de asociative. Explicațiile au fost rescrise exclusiv din TXT-ul furnizat și figurile originale, apoi recenzate independent. Banca integrată și auditul curent sunt documentate în [grile-asociative.md](../../../grile-asociative.md). Arhiva de mai jos păstrează starea istorică din septembrie; explicațiile sale nu sunt sursa băncii curente. Integrarea locală nu confirmă publicarea pe server.

La cererea explicită din 28 septembrie 2026, cele 400 de asociative NU se publică în această versiune. Cele patru drafturi conțin 100 de întrebări și 500 de explicații fiecare (400/2.000 în total); sunt variante de lucru, nu conținut acceptat pentru site.

- **1–100**: autorare completă; copie de recenzie în `reviews/XIII-001-100.json`, `review.status=needs-review`. Recitirea finală a modificărilor și raportul de acceptare rămân deschise.
- **101–200**: autorare completă; root a comparat vizual toate întrebările și a citit toate explicațiile. Corecturile propuse și dovezile rămase sunt în `checkpoint-root-XIII-101-200.md`. Recenzia nu este finalizată.
- **201–300**: autorare completă; recenzia independentă nu a început.
- **301–400**: autorare completă; recenzia independentă nu a început. Vezi `checkpoint-review_intro-XIII.md`.

Păstrăm fiecare draft autor separat de copia recenzentului. `sha256.json` identifică fișierele salvate înainte de publicare. Baremul integral rămâne în `tests/umf-cluj-2026-answer-key.json`, inclusiv forma tipărită ACBE la XIII/182. Împărțirea, numărul rezervat 1000, cheia `bb.quiz.asociative.v1` și numele viitorului fișier sunt în `data/quiz-source-map.json`, cu `publicationStatus=deferred`.

Pentru reluare, citiți checkpointurile și rapoartele, încheiați fiecare recenzie independentă și apoi integrați loturile. Nu copiați aceste drafturi direct în producție. Nu schimbați cheia pe baza explicațiilor sau a surselor externe. După acceptare: înregistrați colecția în `BIO_SITE.quizCollections`, actualizați ținta testelor la 1.990/9.950/18, generați indexurile și verificați toate fluxurile colecției. Rapoartele includ căile scratch de la autorare; arhiva locală integrală păstrează și acele fișiere.

Sursa: `1019145554-Grile-Biologie-UMF-Cluj-2026-1.pdf`, întrebări PDF 233–288 / barem 289–291; manualul `734244481-Barron-s-2022.pdf`. Scanurile nu sunt incluse în repository. Tot scratch-ul original, inclusiv paginile randate, sursele punctuale, scripturile și checkpointurile, rămâne separat în arhiva locală `Documents/Biologie-Barrons-checkpoints/umf-2026-2026-09-28.tar.gz`.
