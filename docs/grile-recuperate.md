# Grile recuperate din istoricul proiectului

Cele patru seturi șterse prin commitul `9a4cf407d5689672f0880d32009d920d4064dc08` au fost recuperate din `810246f`:

| Capitol | Întrebări | Sursa arhivată |
| --- | ---: | --- |
| Introducere în anatomie și fiziologie | 60 | `assets/js/grile-introducere.js` |
| Sistemul urinar | 80 | `grile_sistemul_urinar.html` |
| Sistemul reproducător masculin | 69 | `grile_sistemul_reproducator_masculin.html` |
| Sistemul reproducător feminin | 42 | `assets/js/grile-feminin.js` |

Textele întrebărilor, variantele, baremele, explicațiile și completările sunt păstrate din arhivă. La introducere sunt păstrate explicațiile rezultate din formula originală, inclusiv notele individuale. Numerotarea originală 69–110 a setului feminin se păstrează în câmpul `originalNumber`; numerotarea interfeței rămâne 1–42, ca în vechiul set. Recuperarea nu constituie o revizuire a corectitudinii științifice a conținutului.

Paginile folosesc playerul și navigarea comune actuale. Seturile finale pot avea mai puțin de zece întrebări; progresul folosește mărimea reală a setului. Datele noi se salvează separat în cheile `bb.quiz.*.v1`. Vechile chei și date de analiză nu sunt șterse sau modificate; răspunsurile vechi nu sunt importate automat.

`scripts/recover-archived-quizzes.mjs` documentează conversia mecanică și necesită istoricul Git complet. Este un utilitar de recuperare, nu parte din generarea obișnuită a site-ului; rularea lui rescrie cele patru pagini și datele recuperate. `tests/recovered-quizzes.json` fixează amprentele conținutului recuperat. `npm run test:recovered` verifică integritatea, redarea tuturor explicațiilor, scorarea, reîncercarea, resetarea și reîncărcarea progresului fără să depindă de istoricul Git.
