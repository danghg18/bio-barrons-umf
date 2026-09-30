# Imaginile color Barron’s — verificare și integrare

Sursă: arhiva furnizată de utilizator `Imagini_Barrons_17_capitole.zip`, 30 septembrie 2026. Toate cele 121 de fișiere JPG sunt copiate fără recomprimare sau modificare. Corespondențele au fost verificate vizual față de figurile originale, legende și secțiunile lecțiilor.

Registrul complet, cu sursa, destinația, ruta, figura, SHA-256 și observațiile fiecărei imagini: [colored-figures-review.json](../data/colored-figures-review.json).

| Lecție | Imagini color |
| --- | ---: |
| Introducere în anatomie și fiziologie | 5 |
| Celula și fiziologia celulară | 2 |
| Oasele și articulațiile | 5 |
| Țesutul muscular | 2 |
| Țesutul nervos | 9 |
| Organizarea sistemului nervos | 10 |
| Organele de simț | 8 |
| Sistemul endocrin | 9 |
| Sângele | 7 |
| Sistemul cardiovascular | 12 |
| Sistemul limfatic și imun | 5 |
| Sistemul respirator | 9 |
| Sistemul digestiv | 11 |
| Metabolism și nutriție | 3 |
| Sistemul urinar | 9 |
| Sistemul reproducător masculin | 5 |
| Sistemul reproducător feminin | 10 |

## Cazuri tratate separat

- Figurile 3.2, 3.3, 3.4 și 19.1 nu au variantă în arhivă; originalele rămân în lecție.
- Cardiovascular `08.jpg` și `09.jpg` sunt părțile (a) și (b) ale figurii 15.8; sunt grupate sub legenda existentă. Figurile următoare nu au fost renumerotate.
- Endocrin `05.jpg` conține doar partea (a) a figurii 13.5. Originalul complet rămâne vizibil după imaginea color, păstrând schema PTH din partea (b).
- Digestiv `11.jpg` este o schemă suplimentară cu repere a–w, plasată la finalul lecției, după organele anexe, drept recapitulare, fără număr de figură sau răspunsuri inventate.
- Pentru etichetele tăiate în sursele color, figurile 10.5, 12.2, 12.5, 14.2, 15.8, 17.8 și 19.9 au legătură către originalul complet.
- Originalele rămân pe căile publice existente. Proza, legendele existente, tabelele și ancorele sunt păstrate.

## Verificare

Verificarea în browser parcurge toate figurile la 1440 px și 390 px: încărcare, dimensiuni intrinseci, rută activă și încadrare orizontală. Capturile și rapoartele de lucru sunt în `output/colored-figures-review/` (locale, nepublicate).


Rezultate locale: 126 imagini afișate (121 color și 5 originale păstrate), 252 verificări de imagine la 1440/390 px; toate cele 121 de imagini color sunt în cache și se încarcă offline. Au fost verificate suplimentar încadrarea la 320/768 px și vizibilitatea la imprimare în secțiunea activă. Toate blocurile educaționale care nu sunt figuri au rămas identice cu versiunea anterioară.

Suita completă `npm test` a trecut într-o copie curată a fișierelor versionate și a modificărilor acestei integrări. Rularea directă în directorul de lucru este blocată de duplicatul preexistent, neversionat, `assets/js/chapters-data 2.js`; fișierele duplicate ale utilizatorului nu au fost mutate sau șterse. `npm run generate:check` și `git diff --check` au trecut în directorul de lucru.
