# Subdiviziunile tematice ale grilelor

Registrul editorial separat `data/quiz-topics.json` asociază fiecare ID stabil de întrebare cu o singură temă principală. Nu modifică enunțurile, opțiunile, explicațiile, baremele sau contractele de salvare. Este indexat după `storageKey`, astfel încât întrebările cu numere identice din seturi diferite nu se confundă.

## Contractul generat

`scripts/generate-site-assets.mjs` publică în fiecare element din `window.BB_QUIZ_INDEX`:

- `topics: [{ id, label, lessonUrl }]`; ordinea din registru este ordinea de prezentare.
- `questions[].topicId`, asociat prin ID, independent de ordinea sau numărul întrebării.

Intervalele existente de câte zece întrebări rămân intervale de navigare. Temele sunt subdiviziuni ale materiei și pot cuprinde întrebări din mai multe intervale. ID-urile temelor sunt unice în cadrul testului.

## Criterii editoriale

Au fost inspectate enunțurile și opțiunile celor 451 de întrebări din importurile inițiale, etichetele `topic` / `lessonSection` existente și secțiunile/titlurile lecțiilor publicate. Etichetele existente oferă indicii, nu sunt folosite automat ca autoritate: unele sunt generice, altele denumesc numai o parte dintre afirmații.

O întrebare cu un subiect explicit (de exemplu membrana, nervii cranieni, uterul) este atribuită acelui subiect, inclusiv când distractorii compară structura cu alte organe. Întrebările generale care verifică inseparabil mai multe subdiviziuni sunt în "Recapitulare mixtă". Nu sunt distribuite procentual și nu sunt numărate de mai multe ori. Un rezultat la o întrebare mixtă nu devine artificial o greșeală la fiecare subcapitol.

Grupele sunt normalizate la o granularitate utilă pentru recapitulare: de exemplu anatomia și funcțiile rinichilor, filtrare, reabsorbție, contracurent, secreție, hormoni, urină, căi urinare. Nu există clasificare automată după cuvinte-cheie la rularea site-ului.

Nu sunt introduse subdiviziuni fără întrebări proprii: de exemplu cerebelul apare în întrebări mixte, iar capitolul celular nu are o întrebare exclusiv despre secțiunea energie. O secțiune fără întrebări nu este prezentată drept capitol parcurs sau neparcurs.

Importul endocrin/metabolism adaugă 160 de întrebări, iar importul circulator adaugă 140, pentru un total de **751 întrebări în 11 teste**. Fidelitatea, limitele baremelor și sursele sunt descrise în [auditul endocrin/metabolism](grile-endocrin-metabolism.md) și [auditul cardiovascular/limfatic](grile-circulator.md).

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

### bb.quiz.sistemul-endocrin.v1

| Temă | Întrebări |
|---|---|
| Hormoni: mecanisme și efecte | end-001, end-002, end-003, end-034, end-035, end-038, end-041, end-042, end-046, end-052, end-053, end-054, end-055, end-056, end-057, end-058, end-059, end-060, end-120, end-121, end-123, end-129, end-130, end-144, end-146, end-148, end-159 |
| Hipotalamus și hipofiză | end-004, end-005, end-006, end-007, end-008, end-009, end-010, end-011, end-012, end-020, end-026, end-027, end-028, end-029, end-036, end-040, end-043, end-044, end-045, end-124, end-125, end-131, end-132, end-133, end-134, end-139, end-149, end-151, end-153 |
| Tiroida | end-013, end-014, end-033, end-047, end-135, end-136, end-140, end-154 |
| Paratiroide și homeostazia calciului | end-015, end-032, end-126, end-137, end-141, end-156 |
| Pancreasul endocrin | end-016, end-017, end-018, end-019, end-037, end-048, end-049, end-127, end-142, end-143, end-145, end-147, end-157, end-160 |
| Glandele suprarenale | end-021, end-022, end-030, end-031, end-050, end-051, end-122, end-138, end-158 |
| Alte glande endocrine | end-023, end-024, end-025, end-039, end-128, end-155 |
| Anabolism și catabolism | end-061 |
| Metabolismul glucidelor | end-062, end-064 |
| Metabolismul lipidelor | end-063 |
| Termoreglare | end-150 |
| Absorbția vitaminelor | end-152 |

### bb.quiz.metabolism.v1

| Temă | Întrebări |
|---|---|
| Metabolismul glucidelor | met-071, met-072, met-082, met-083, met-084, met-085, met-107, met-116 |
| Metabolismul lipidelor | met-065, met-069, met-073, met-075, met-078, met-086, met-087, met-090, met-098, met-102, met-106, met-113, met-115, met-117 |
| Metabolismul proteinelor | met-067, met-074, met-079, met-088, met-091, met-111 |
| Stări metabolice | met-095, met-101, met-110 |
| Minerale | met-068, met-097, met-105, met-119 |
| Rata metabolică | met-076, met-108 |
| Termoreglare | met-070, met-077, met-089, met-096, met-103, met-112 |
| Anabolism, catabolism și recapitulare | met-066, met-080, met-081, met-092, met-093, met-094, met-099, met-100, met-104, met-109, met-114, met-118 |

### bb.quiz.sistemul-cardiovascular.v1

| Temă | Întrebări |
|---|---|
| Circulația pulmonară și sistemică | cv-001, cv-002, cv-026, cv-028, cv-032, cv-069 |
| Vase și hemodinamică | cv-003, cv-010, cv-014, cv-015, cv-021, cv-022, cv-023, cv-024, cv-025, cv-027, cv-029, cv-039, cv-040, cv-041, cv-042, cv-044, cv-045, cv-046, cv-047, cv-049, cv-051, cv-052, cv-053, cv-055, cv-060, cv-062, cv-066, cv-071, cv-073, cv-074, cv-131, cv-133, cv-138, cv-140 |
| Cavitățile inimii | cv-011, cv-061 |
| Valve cardiace | cv-005, cv-006, cv-012, cv-030, cv-058, cv-063, cv-070 |
| Circulația coronariană | cv-007, cv-013, cv-018, cv-031, cv-068 |
| Miocard și țesut excitoconductor | cv-009, cv-019, cv-020, cv-033, cv-034, cv-035, cv-038, cv-065, cv-072, cv-139 |
| Ciclul și debitul cardiac | cv-004, cv-008, cv-036, cv-037, cv-054, cv-056, cv-067, cv-132 |
| Inima: structură și recapitulare | cv-016, cv-017, cv-048, cv-050, cv-057, cv-059, cv-064, cv-134, cv-135 |
| Circulația portală | cv-043 |

### bb.quiz.sistemul-limfatic.v1

| Temă | Întrebări |
|---|---|
| Vase limfatice și recapitulare | lim-075, lim-076, lim-077, lim-078, lim-079, lim-080, lim-083, lim-084, lim-085, lim-092, lim-093, lim-099, lim-102, lim-104, lim-105, lim-106, lim-109, lim-110, lim-111, lim-112, lim-113, lim-114, lim-121, lim-123, lim-125, lim-126, lim-130, lim-137 |
| Noduli și țesuturi limfoide | lim-081, lim-082, lim-090, lim-094, lim-097, lim-098, lim-100, lim-103, lim-115, lim-119, lim-122, lim-127, lim-129 |
| Timus | lim-088, lim-096, lim-117, lim-128, lim-136 |
| Splină | lim-086, lim-087, lim-089, lim-095, lim-108, lim-116, lim-118, lim-120, lim-124 |
| Limfă și edem | lim-091, lim-101, lim-107 |
