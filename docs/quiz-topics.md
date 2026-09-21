# Subdiviziunile tematice ale grilelor

Registrul editorial separat `data/quiz-topics.json` asociază fiecare ID stabil de întrebare cu o singură temă principală. Nu modifică enunțurile, opțiunile, explicațiile, baremele sau contractele de salvare. Este indexat după `storageKey`, astfel încât întrebările cu numere identice din seturi diferite nu se confundă.

## Contractul generat

`scripts/generate-site-assets.mjs` publică în fiecare element din `window.BB_QUIZ_INDEX`:

- `topics: [{ id, label, lessonUrl }]`; ordinea din registru este ordinea de prezentare.
- `questions[].topicId`, asociat prin ID, independent de ordinea sau numărul întrebării.

Intervalele existente de câte zece întrebări rămân intervale de navigare. Temele sunt subdiviziuni ale materiei și pot cuprinde întrebări din mai multe intervale. ID-urile temelor sunt unice în cadrul testului.

## Criterii editoriale

Au fost inspectate enunțurile și opțiunile tuturor celor 451 de întrebări, etichetele `topic` / `lessonSection` existente și secțiunile/titlurile lecțiilor publicate. Etichetele existente oferă indicii, nu sunt folosite automat ca autoritate: unele sunt generice, altele denumesc numai o parte dintre afirmații.

O întrebare cu un subiect explicit (de exemplu membrana, nervii cranieni, uterul) este atribuită acelui subiect, inclusiv când distractorii compară structura cu alte organe. Întrebările generale care verifică inseparabil mai multe subdiviziuni sunt în "Recapitulare mixtă". Nu sunt distribuite procentual și nu sunt numărate de mai multe ori. Un rezultat la o întrebare mixtă nu devine artificial o greșeală la fiecare subcapitol.

Grupele sunt normalizate la o granularitate utilă pentru recapitulare: de exemplu anatomia și funcțiile rinichilor, filtrare, reabsorbție, contracurent, secreție, hormoni, urină, căi urinare. Nu există clasificare automată după cuvinte-cheie la rularea site-ului.

Nu sunt introduse subdiviziuni fără întrebări proprii: de exemplu cerebelul apare în întrebări mixte, iar capitolul celular nu are o întrebare exclusiv despre secțiunea energie. O secțiune fără întrebări nu este prezentată drept capitol parcurs sau neparcurs.

## Decizii care cer atenție

- `rm-069` păstrează locul și conținutul din testul masculin, dar enunțul este despre gonada feminină. Tema explicită "Gonada feminină" trimite la ovare în lecția feminină; vechea etichetă `lessonSection: Testiculele — Funcții` nu este folosită pentru destinație. Întrebarea nu a fost mutată sau corectată.
- `sn-057`, `sn-098`, `sn-099` țin de impulsul nervos/reflexe și trimit la secțiunea existentă din `tesutul_nervos.html`; `sn-100` trimite la organizare și celulele nervoase din aceeași lecție. `sn-097` combină nervii, integrarea și reflexele, deci rămâne mixtă.
- `ia-012` combină raporturi, cavități și seroase; `ia-023` combină planuri și termeni direcționali. Sunt mixte chiar dacă etichetele anterioare sugerau un singur grup.
- `os-035`, `os-072`, `os-073`, `os-096` combină mai multe subdiviziuni ale vederii (fotoreceptori, focalizare, anatomie, tulburări). Sunt mixte în cadrul aceluiași analizator. `os-023` și `os-080` verifică tipurile de receptori și stimulii, deci apar la receptorii generali.
- Întrebările renale `ur-016`, `ur-053` verifică simultan filtrarea, reabsorbția și secreția, fără un proces principal; `ur-072–075`, `ur-077–080` combină procese, anatomie, hormoni sau compoziția urinei. Sunt mixte.
- Grupele citoplasmatice includ întrebările formulate explicit despre organite, inclusiv opțiunile comparative despre nucleol/cromatină. Întrebările generale despre componentele celulei care combină membrană, nucleu și organite rămân mixte.

## Destinațiile către lecții

Destinațiile folosesc numai rute existente (`#route`) sau căutarea existentă (`?q=Titlu&section=route`). Titlurile căutate sunt prezente efectiv în elementele h1–h6 ale secțiunii respective. Nu sunt inventate ancore pentru subcapitole și nu se schimbă HTML-ul educațional. Destinația de recapitulare mixtă deschide cuprinsul lecției sau prima sa secțiune când nu există rută home; ea nu pretinde că toate afirmațiile sunt explicate într-un singur paragraf.

Validarea statică garantează existența fișierului de lecție publicat, a rutei și a titlului căutat. Comportamentul de deschidere, focus și căutare în browser trebuie verificat separat prin testele de navigare.

## Acoperire explicită

### bb.quiz.celula.v1

| Temă | Întrebări |
|---|---|
| Tipuri de celule | cel-093, cel-102 |
| Membrana plasmatică | cel-061, cel-066, cel-069, cel-070, cel-094, cel-104, cel-107 |
| Transportul prin membrană | cel-071, cel-076, cel-077, cel-082, cel-088, cel-089, cel-095, cel-096, cel-099, cel-105, cel-108, cel-109 |
| Nucleul | cel-072, cel-078, cel-086, cel-106, cel-110 |
| Citoplasma și organitele | cel-067, cel-073, cel-074, cel-075, cel-079, cel-080, cel-084, cel-085, cel-091, cel-092, cel-097, cel-098, cel-100, cel-101 |
| Recapitulare mixtă | cel-062, cel-063, cel-064, cel-065, cel-068, cel-081, cel-083, cel-087, cel-090, cel-103 |

### bb.quiz.introducere.v1

| Temă | Întrebări |
|---|---|
| Anatomie și fiziologie | ia-039 |
| Celula și nivelurile de organizare | ia-006, ia-024, ia-040, ia-055 |
| Țesuturi și organe | ia-002, ia-003, ia-016, ia-025 |
| Sisteme de organe și tegument | ia-001, ia-004, ia-017, ia-054, ia-059 |
| Funcțiile organismului | ia-007, ia-013, ia-014, ia-027, ia-050, ia-056 |
| Homeostazie și feedback | ia-008, ia-022, ia-028, ia-042, ia-057 |
| Poziția anatomică și termenii direcționali | ia-009, ia-010, ia-011, ia-019, ia-029, ia-030, ia-031, ia-043, ia-060 |
| Planurile corpului | ia-021, ia-032, ia-044, ia-051 |
| Cavitățile corpului | ia-018, ia-020, ia-033, ia-034, ia-036, ia-045, ia-047, ia-052, ia-053 |
| Regiunile abdomino-pelviene | ia-035, ia-041, ia-046, ia-058 |
| Membranele seroase | ia-037, ia-038, ia-048 |
| Recapitulare mixtă | ia-005, ia-012, ia-015, ia-023, ia-026, ia-049 |

### bb.quiz.sistem-nervos.v1

| Temă | Întrebări |
|---|---|
| Organizarea sistemului nervos central | sn-088 |
| Măduva spinării | sn-061, sn-062, sn-063, sn-064, sn-081 |
| Meninge și lichid cefalorahidian | sn-073, sn-080 |
| Emisferele cerebrale | sn-076, sn-082 |
| Diencefalul și sistemul limbic | sn-053, sn-077, sn-079 |
| Trunchiul cerebral | sn-054, sn-058, sn-072, sn-085 |
| Nervii cranieni | sn-056, sn-074, sn-075, sn-078, sn-086, sn-091, sn-095 |
| Nervii spinali și plexurile | sn-092 |
| Sistemul nervos autonom | sn-051, sn-055, sn-059, sn-060, sn-087, sn-093, sn-094 |
| Impulsul nervos și reflexele | sn-057, sn-098, sn-099 |
| Neuronii și celulele gliale | sn-100 |
| Recapitulare mixtă | sn-052, sn-065, sn-066, sn-067, sn-068, sn-069, sn-070, sn-071, sn-083, sn-084, sn-089, sn-090, sn-096, sn-097 |

### bb.quiz.organe-simt.v1

| Temă | Întrebări |
|---|---|
| Simțurile și receptorii | os-002, os-023, os-039, os-080 |
| Anatomia ochiului | os-004, os-008, os-011, os-016, os-032, os-041, os-042, os-044, os-063, os-064, os-065, os-067, os-068, os-069, os-070, os-081, os-089 |
| Retina și fotoreceptorii | os-005, os-007, os-017, os-018, os-030, os-033, os-045, os-046, os-084 |
| Structurile accesorii ale ochiului | os-071, os-095 |
| Calea optică | os-006, os-015, os-040, os-082 |
| Focalizarea imaginilor | os-043, os-083 |
| Tulburările de vedere | os-085, os-090, os-099 |
| Anatomia urechii | os-009, os-010, os-019, os-020, os-021, os-022, os-036, os-037, os-048, os-059, os-091, os-097 |
| Fiziologia auzului | os-047, os-049, os-054, os-062, os-074, os-075, os-086 |
| Gustul | os-025, os-026, os-038, os-050, os-051, os-055, os-056, os-087, os-092 |
| Mirosul | os-027, os-028, os-029, os-052, os-057, os-093 |
| Simțul tactil și simțurile înrudite | os-053, os-058, os-061 |
| Echilibrul | os-024, os-034, os-060, os-076, os-077, os-094 |
| Recapitulare mixtă | os-001, os-003, os-012, os-013, os-014, os-031, os-035, os-066, os-072, os-073, os-078, os-079, os-088, os-096, os-098, os-100 |

### bb.quiz.sistemul-urinar.v1

| Temă | Întrebări |
|---|---|
| Anatomia și funcțiile rinichilor | ur-001, ur-002, ur-011, ur-028, ur-035, ur-046, ur-049, ur-056, ur-057, ur-058, ur-071 |
| Vascularizația renală și nefronul | ur-010, ur-012, ur-027, ur-038, ur-042, ur-059, ur-060 |
| Filtrarea glomerulară | ur-003, ur-007, ur-013, ur-031, ur-041, ur-063 |
| Reabsorbția tubulară | ur-004, ur-014, ur-019, ur-048, ur-061, ur-064, ur-065 |
| Ansa Henle și concentrarea urinei | ur-005, ur-008, ur-015, ur-017, ur-020, ur-022, ur-032, ur-054 |
| Secreția tubulară | ur-006, ur-018, ur-066 |
| Reglarea hormonală | ur-009, ur-021, ur-044, ur-067 |
| Compoziția și proprietățile urinei | ur-023, ur-040, ur-045, ur-047, ur-052, ur-068 |
| Ureterele | ur-026, ur-039, ur-069 |
| Vezica urinară și micțiunea | ur-043, ur-070 |
| Uretra și căile urinare | ur-024, ur-050 |
| Alte organe excretorii | ur-025, ur-034, ur-036, ur-051, ur-076 |
| Recapitulare mixtă | ur-016, ur-029, ur-030, ur-033, ur-037, ur-053, ur-055, ur-062, ur-072, ur-073, ur-074, ur-075, ur-077, ur-078, ur-079, ur-080 |

### bb.quiz.reproducator-masculin.v1

| Temă | Întrebări |
|---|---|
| Testiculele și celulele testiculare | rm-001, rm-004, rm-005, rm-009, rm-013, rm-015, rm-024, rm-031, rm-041, rm-061 |
| Spermatogeneza și meioza | rm-008, rm-011, rm-012, rm-025, rm-032, rm-042, rm-051, rm-055, rm-063 |
| Spermatozoizii | rm-014, rm-028, rm-033, rm-043, rm-053 |
| Epididimul | rm-034, rm-044, rm-057 |
| Ductul deferent | rm-035, rm-062 |
| Uretra masculină | rm-016, rm-036 |
| Vezicula seminală | rm-037, rm-064 |
| Prostata | rm-038, rm-047, rm-067 |
| Glandele anexe și sperma | rm-056, rm-060 |
| Penisul | rm-066 |
| Gonadotropinele și reglarea hormonală | rm-002, rm-003, rm-007, rm-019, rm-027, rm-040, rm-059 |
| Testosteronul | rm-006, rm-020, rm-026, rm-039, rm-065 |
| Gonada feminină | rm-069 |
| Recapitulare mixtă | rm-010, rm-017, rm-018, rm-021, rm-022, rm-023, rm-029, rm-030, rm-045, rm-046, rm-048, rm-049, rm-050, rm-052, rm-054, rm-058, rm-068 |

### bb.quiz.reproducator-feminin.v1

| Temă | Întrebări |
|---|---|
| Ovarele | rf-001, rf-004, rf-014, rf-020, rf-031 |
| Trompele uterine | rf-009, rf-011, rf-032 |
| Uterul | rf-007, rf-010, rf-021, rf-023, rf-033 |
| Vaginul și vulva | rf-013, rf-035 |
| Glandele mamare | rf-017, rf-022, rf-036 |
| Ciclul menstrual și reglarea hormonală | rf-005, rf-006, rf-008, rf-016, rf-024, rf-026, rf-028, rf-037 |
| Ovogeneza | rf-015, rf-025, rf-038, rf-039 |
| Fecundația și implantarea | rf-019, rf-027, rf-041, rf-042 |
| Recapitulare mixtă | rf-002, rf-003, rf-012, rf-018, rf-029, rf-030, rf-034, rf-040 |

## Întreținere și verificare

Pentru întrebări noi, adăugați explicit ID-ul în registrul testului. Pentru o temă nouă, alegeți un ID stabil, o etichetă românească și o destinație verificabilă din lecțiile publicate. Nu modificați fișierul generat manual.

- `node scripts/quiz-topics-test.mjs`: acoperire integrală, respingerea ID-urilor lipsă/suplimentare, temelor inexistente/duplicate și destinațiilor invalide; verifică amprentele educaționale existente.
- `node scripts/generate-site-assets.mjs --validate-quiz-topics`: validare fără scrierea fișierelor generate.
- `npm run generate`, apoi `npm run generate:check`: regenerarea coordonată a indexului și precache-ului.

Validarea nu constituie o nouă verificare științifică a baremelor. Registrul este o clasificare editorială explicită, revizuibilă independent de conținut.
