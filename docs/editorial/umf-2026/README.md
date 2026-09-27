# Auditul grilelor UMF Cluj 2026

## Publicarea curentă

La cererea utilizatorului din 28 septembrie 2026, publicarea include **17 seturi, 1.590 de întrebări unice și 7.950 de explicații A–E**. Cele **400 de asociative** sunt amânate; drafturile și recenziile neîncheiate sunt păstrate în [asociative-pending](asociative-pending/README.md), fără înregistrare în catalogul site-ului.

| Set | Capitolul cărții / numere originale | Grile |
|---|---|---:|
| Introducere în anatomie și fiziologie | I: 1–60 | 60 |
| Celula și fiziologia celulară | I: 61–110 | 50 |
| Oasele și articulațiile | II: 1–180 | 180 |
| Țesutul muscular | III: 1–70 și 156–240 | 155 |
| Țesutul nervos | III: 71–155 | 85 |
| Organizarea sistemului nervos | IV: 1–100 | 100 |
| Organele de simț | V: 1–100 | 100 |
| Sistemul endocrin | VI: 1–64 și 120–160 | 105 |
| Metabolism și nutriție | VI: 65–119 | 55 |
| Sângele | VII: 1–80 | 80 |
| Sistemul cardiovascular | VIII: 1–74 și 131–135 și 138–140 | 82 |
| Sistemul limfatic și imun | VIII: 75–130 și 136–137 | 58 |
| Sistemul respirator | IX: 1–160 | 160 |
| Sistemul digestiv | X: 1–80 | 80 |
| Sistemul urinar | XI: 1–100 | 100 |
| Sistemul reproducător masculin | XII: 1–68 și 140 | 69 |
| Sistemul reproducător feminin | XII: 69–139 | 71 |

## Autoritatea răspunsurilor și auditul editorial

`tests/umf-cluj-2026-answer-key.json` păstrează toate cele 1.990 de chei tipărite, capitolul, numărul original, pagina PDF și pagina tipărită, precum și hashul PDF-ului sursă. Ordinea neobișnuită ACBE la XIII/182 este păstrată; punctajul compară mulțimea literelor. Nicio explicație ori sursă externă nu modifică această cheie.

Cele 22 de loturi pentru capitolele I–XII au trecut autorarea/auditul și recitirea vizuală independentă. `accepted-review-ledger.json` păstrează întrebările acoperite, recenzentul, paginile, constatările, observațiile de conținut și hashul fiecărui lot. Rapoartele din `accepted-reviews` delimitează exact paginile manualului și sursele punctuale consultate, inclusiv situațiile în care s-a citit numai rezumatul unui studiu. Explicațiile disting convențiile manualului, neclaritățile și contradicțiile baremului de adevărul biologic; nu inventează intenția autorului.

`data/umf-2026-editorial-audit.json` leagă toate cele 1.590 de grile publicate de recenzia acceptată și enumeră câmpurile schimbate. `tests/quiz-content-hashes.json` fixează textul final al tuturor celor 17 seturi. Șapte chei existente sunt aliniate baremului: I/11, I/12, V/3, XI/58, XII/8, XII/36 și XII/108. Cele 469 de explicații anterior lipsă sunt completate; toate celelalte explicații au fost recitite, nu doar numărate.

## Compatibilitate și progres

- Numerele din carte și intervalele de maximum zece întrebări sunt păstrate, inclusiv împărțirile disjuncte muscular/endocrin/cardiovascular.
- ID-urile și cheile de stocare existente rămân stabile. Femininul afișează 69–139 și rezolvă vechile linkuri; 135, 136, 138 și 139 sunt marcate mixte.
- Duplicatul masculin XII/69 este retras din exercițiile active; selecțiile, rezultatele și corectările lui istorice rămân păstrate.
- Scorul curent se recalculează din selecțiile salvate și cheia actuală. Scorurile încercărilor istorice nu sunt rescrise.
- `data/umf-2026-semantic-revisions.json` documentează 72 de corecturi ale transcrierii: 18 schimbă sensul și solicită reverificare, păstrând rezultatul anterior. Restul mențin verificarea existentă.
- O reverificare pentru o revizie de conținut primește un identificator nou de încercare; retry și reload păstrează acel identificator. Istoricul corectărilor folosește întrebările parcurgerii originale, inclusiv cele retrase.
- Căutarea exclude explicațiile ascunse înainte de verificare și le include când devin vizibile. Lecțiile și imaginile lor nu au fost rescrise în auditul grilelor.

## Verificări de release

`npm run test:umf2026` verifică acoperirea exactă a celor 1.590 de grile, baremul, explicațiile, reviziile semantice, vechile linkuri, istoricul și toate cele **50.880 de combinații** prin playerul real (32 pentru fiecare grilă). Testul de browser verifică toate cele 17 seturi pe desktop și telefon. Suita `npm test` include suplimentar căutarea, istoricul/statisticile, conturile simulate și izolarea datelor, greșelile, simularea, serviciul offline și actualizarea cache-ului sub `/bio-barrons-umf/`.

Testele nu înlocuiesc recenzia editorială: cele două tipuri de dovezi sunt separate. Conturile live și serviciile externe nu sunt modificate de testele locale. Publicarea și verificarea remote se consemnează separat după finalizarea testelor.
