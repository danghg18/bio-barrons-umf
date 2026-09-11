# Grile · Celula și fiziologia celulară

- Sursă: `grile_bio_umf_cluj_2025_paginile_14-21.pdf`, furnizat de utilizator; cele opt pagini ale PDF-ului sunt numerotate tipărit 16–23.
- Au fost citite vizual toate paginile. Sunt transcrise exclusiv întrebările 61–110, cu toate cele cinci variante A–E; fragmentele întrebărilor 57–60 sunt excluse.
- Numerotarea originală este păstrată în `number`, `sourceNumber`, ID-urile `cel-061`–`cel-110`, titluri și cele cinci intervale de câte zece întrebări.
- Baremul independent: `tests/celula-answer-key.json`; poziția 1 = întrebarea 61, poziția 50 = întrebarea 110. Nu este recalculat din explicații.
- Datele: `assets/js/grile-celula-data.js`. Pagina: `grile_celula.html`, resursă a lecției despre celulă în registrul canonic.
- Interacțiunea și navigarea reutilizează `quiz-player.js` și `legacy/quiz-navigation.js`. Progresul separat folosește `bb.quiz.celula.v1`.

## Fidelitate și note editoriale

Enunțurile și variantele păstrează textul scanat, cu diacritice normalizate, rânduri reunite și spațiere tipografică uniformizată. Explicațiile din `why` sunt note editoriale bazate pe lecția locală, distincte de transcriere. Enunțurile negative de la 64, 65, 68, 96, 102 și 110 păstrează cerința originală.

Baremul utilizatorului rămâne autoritatea pentru punctaj. Explicațiile semnalează explicit excluderile discutabile de la 76A, 77E, 84C/E, 85B/C, 87B/C/E, 91C/D/E, 92B și 103A/D, fără a transforma afirmații susținute de lecție în afirmații false. La 90E, subiectul lipsește în original; varianta este păstrată integral și ambiguitatea este explicată. La 88B se precizează că în mediu izoton lipsește osmoza netă. La 102B se distinge absența organitelor membranare de prezența ribozomilor la procariote. La 106D se explică cele două membrane ale învelișului nuclear.

## Verificare

`npm run test:celula` verifică toate cele 50 de corespondențe cu baremul independent, numerotarea și intervalele, randarea și punctajul fiecărei întrebări, reîncercarea, reîncărcarea, resetarea, legăturile din catalog/lecție și afișarea pe telefon. `npm test` include această verificare și suitele comune. `npm run generate` actualizează sitemap-ul și inventarul offline, inclusiv versiunea cache calculată din conținut.
