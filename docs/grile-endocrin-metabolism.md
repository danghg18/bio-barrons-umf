# Grile: sistemul endocrin și metabolism

## Sursă și împărțire

Import din `grile-biologie-umf-cluj-paginile-109-127.pdf`, primit la 25 septembrie 2026. PDF-ul are 19 pagini scanate, cu numerele tipărite **115–133**, diferite de intervalul din numele fișierului.

- **Sistemul endocrin:** 105 întrebări, numerele originale **1–64 și 120–160**; pagina `grile_sistemul_endocrin.html`, date `assets/js/grile-sistemul-endocrin-data.js`, cheia de stocare `bb.quiz.sistemul-endocrin.v1`.
- **Metabolism și nutriție:** 55 întrebări, numerele originale **65–119**; pagina `grile_metabolism_si_nutritie.html`, date `assets/js/grile-metabolism-data.js`, cheia de stocare `bb.quiz.metabolism.v1`.
- Împărțirea respectă cererea utilizatorului chiar pentru întrebările endocrine 61–64, 150 și 152 care tratează teme metabolice. Legăturile tematice pot trimite la lecția relevantă fără a muta întrebarea între teste.
- Exact 160 de întrebări și 800 de variante A–E, fiecare cu explicație individuală. Numerotarea nu este refăcută.

SHA-256 al PDF-ului: `ab84276e1a85269d1ef0b3fbd63458af01dd68d5e0b75d63a445ea59f28da453`.

## Autoritatea baremului și fidelitate

**Numai baremul transmis de utilizator stabilește punctajul.** Fixture-ul independent `tests/endocrin-metabolism-answer-key.json` are 160 de intrări, indexate prin `sourceNumber - 1`; literele au fost normalizate la majuscule. Observațiile biologice din explicații nu modifică cheia.

Toate paginile au fost inspectate vizual, apoi enunțurile și cele cinci variante au fost recitite în comparație cu scanarea, inclusiv continuările între coloane și pagini. O comparație OCR suplimentară a ajutat la localizarea diferențelor; imaginea scanată a rămas autoritatea. S-au unit rândurile tipografice și s-au redat indicii/sarcinile în Unicode. Greșelile tipărite și distractorii nu au fost corectați în textul întrebării.

Întrebările cu cerință negativă sunt 36, 69, 98 și 99. Explicațiile disting între afirmațiile false, afirmațiile adevărate care nu răspund cerinței și neconcordanțele dintre barem și biologie. Cazuri importante: **23C, 31A, 73B, 89B, 103A și 108D**. Nuanțele sunt documentate mai jos și în explicațiile afișate după verificare.

## Corespondența paginilor

| Pagina PDF | Pagina tipărită | Întrebări / continuări |
|---:|---:|---|
| 1 | 115 | 1–9D |
| 2 | 116 | 9E, 10–20 |
| 3 | 117 | 21–29 |
| 4 | 118 | 30–38 |
| 5 | 119 | 39–47A |
| 6 | 120 | 47B–55D |
| 7 | 121 | 55E–63C |
| 8 | 122 | 63D–71C |
| 9 | 123 | 71D–77 |
| 10 | 124 | 78–85 |
| 11 | 125 | 86–94A |
| 12 | 126 | 94B–102B |
| 13 | 127 | 102C–109 |
| 14 | 128 | 110–117A |
| 15 | 129 | 117B–125 |
| 16 | 130 | 126–136 |
| 17 | 131 | 137–145 |
| 18 | 132 | 146–154B |
| 19 | 133 | 154C–160 |

## Integrare și verificări reproductibile

Paginile folosesc același player, navigare, feedback și stil ca grilele pentru organele de simț. Registrul canonic publică resursele în catalog și în lecțiile părinte. Indexul de întrebări, legăturile tematice, sitemap-ul și inventarul offline includ ambele teste. Totalul site-ului devine 9 teste cu 611 întrebări.

Playerul validează acum numerele în raport cu intervalele declarate, acceptând discontinuitatea intenționată 64→120; lipsurile, duplicatele, ordinea greșită și suprapunerile rămân respinse. Seturile existente și cheile lor de stocare sunt păstrate. Toate paginile publice cer versiuni noi pentru registru, index și player, astfel încât un service worker vechi cu strategia cache-first să nu servească validatorul incompatibil în timpul actualizării. Amprentele tuturor întrebărilor noi sunt în `tests/quiz-content-hashes.json`; cele existente nu sunt schimbate.

- `npm run test:endocrin-metabolism`: fixture independent, toate combinațiile corecte verificate efectiv în browser, variante omise/selectate în plus, resetare/anulare/reîncărcare, izolare față de testele existente, catalog și lecții, numere/hash/history, căutare, mobil, statistici, exersarea greșelilor și service worker offline sub `/bio-barrons-umf/`.
- `scripts/quiz-cache-upgrade-test.mjs`: service worker real cu URL-urile vechi precache-uite și corpuri-martor, verificând că prima încărcare folosește resursele noi înaintea actualizării workerului; fără dependență de istoricul Git în CI.
- `npm test`: întreaga suită a site-ului, inclusiv fingerprint-uri, teme, navigare, căutare, conturi simulate și offline.
- Verificarea editorială vizuală și verificarea faptelor sunt distincte de testele automate; testele structurale nu demonstrează singure fidelitatea sau corectitudinea explicațiilor.

### Rezultat local al verificării — 25 septembrie 2026

Testul dedicat celor 160 de grile și regresia cache-ului au trecut. `npm test` a parcurs cu succes generarea, validarea, programa, smoke, căutarea, interfața, testele existente și verificările analiticii până la aserțiunea veche 7→9 teste disponibile din `study-flow-ui-test.mjs`. După actualizarea exclusiv a celor două așteptări numerice, acel test a fost rerulat cu succes, apoi `test:accounts` și `test:glossary` au trecut integral. Verificările deja trecute nu au fost repetate inutil. `generate:check` și `git diff --check` au trecut la final.

Au fost inspectate capturile ambelor teste la 1440 px și 390 px, inclusiv feedbackul după un răspuns greșit. Separat de fixture-ul automat, a fost reprodusă și verificată tranziția cu workerul și resursele reale din commitul anterior `207480b`: catalogul, cele 105/55 întrebări, indexul și legăturile către lecții funcționează cât timp workerul vechi rămâne activ. Aceasta este validare locală; nu s-a făcut publicare.

## Audit: 1–64

### Neconcordanțe și ambiguități importante pentru editor

Cheia utilizatorului este păstrată în toate cazurile. Explicațiile nu prezintă o afirmație biologic adevărată drept falsă doar pentru a justifica excluderea ei.

- **23C, cheia ABD:** „influențează activitatea osteoclastică” este adevărat despre estrogeni. Există dovadă experimentală directă pentru inhibarea resorbției osteoclastice și promovarea apoptozei osteoclastelor. Explicația semnalează explicit neconcordanța.
- **31A, cheia BCE:** glucocorticoizii pot stimula glicogenogeneza/depunerea hepatică de glicogen, chiar dacă favorizează concomitent gluconeogeneza. Excluderea este și în tensiune cu includerea efectului ACTH asupra glicogenului în 27B. Explicația semnalează explicit neconcordanța; a fost verificată cercetare primară, nu doar o sinteză online.
- **4A/E, cheia CD:** „secreția hormonală a nucleilor hipotalamici” este prea generală dacă include hormonii eliberatori/inhibitori; cheia implică numai ADH/oxitocina. Explicația limitează sensul fără a nega existența hormonilor hipotalamici din sistemul port.
- **7C, cheia ABD:** clasificarea lecției separă proteinele de peptidele scurte; GH este proteină de 191 aa. Nu este obligatoriu o eroare de barem: în sens biochimic larg GH este polipeptid, dar în convenția didactică este „proteic”. Explicația spune explicit acest lucru.
- **10B, cheia BD:** în lecție este folosită o schemă generală de mesageri secundari pentru non-steroizi. Receptorul prolactinei semnalizează în principal prin JAK2–STAT5; nu trebuie transformată explicația într-o afirmație incorectă că AMPc este obligatoriu mediatorul prolactinei.
- **10A:** categoria didactică a prolactinei este proteică, distinctă de glicoproteinele FSH/LH/TSH; există însă forme glicozilate reale, menționate ca nuanță în explicație.
- **12B:** baremul urmărește progesteronul steroidian; nu susținem că corpul galben nu produce niciun hormon peptidic (secreția luteală de relaxină/oxitocină este documentată). Nu am declarat o eroare certă de barem pentru stimularea particulară prin LH.
- **15A/D și 59A:** răspunsul didactic urmărește resorbția osoasă din expunerea persistentă la PTH. PTH acționează pe celule din linia osteoblastică și poate fi anabolic când este administrat intermitent; explicațiile păstrează această precizare.
- **16D/E:** relațiile pancreasului sunt regionale (col anterior de AMS, proces uncinat posterior de vase; coada este excepție de la retroperitonealitate).
- **18E:** glucagonul scade după o masă glucidică, dar poate crește după o masă proteică; „postprandial” fără specificarea mesei este prea general.
- **20D:** valabil în comparația didactică diabet insipid central/diabet zaharat insulinodeficient; nu toate formele clinice sunt hiposecreții.
- **22E:** setea excesivă nu este aleasă de barem, dar poate apărea în hiperglicemia/diabetul secundar Cushing; explicația nu afirmă imposibilitatea.
- **24A:** timusul poate ocupa mediastinul superior și compartimentul anterior al celui inferior. Cheia exclude localizarea inferioară, conform schemei simplificate.
- **29A:** „secretată” poate însemna sintetizată sau eliberată. ADH este sintetizat în hipotalamus și eliberat din neurohipofiză. Excluderea variantei este justificabilă numai dacă „secretată” este folosit în sens de „produsă”.
- **36B:** schema manualului are doi lobi majori. Lobul intermediar rudimentar poate fi descris separat în alte clasificări; itemul este cu cerință negativă.
- **37C, 40C–E, 53B/C, 54E, 56C/E, 59C, 60C:** afirmații adevărate care nu îndeplinesc categoria cerută, nu afirmații biologic false. Explicațiile fac distincția.
- **45A:** lactația abundentă este inhibată în sarcină de estrogeni/progesteron; colostrul prenatal și dezvoltarea secretorie există. Nu este afirmată absența absolută a oricărei secreții prenatale.
- **52A:** cortizonul are schelet carbon-hidrogen, dar și oxigen. Baremul îl include; explicația evită o compoziție elementală exclusiv C/H.
- **54A:** gluconeogeneza din aminoacizi este adevărată; excluderea ține probabil de categoria „metabolism proteic”, deși delimitarea este discutabilă.
- **55B/D:** creșterea țesuturilor moi prin GH și pigmentarea prin MSH sunt adevărate; cheia le exclude ca efecte de creștere/pigmentare, nu ca efecte metabolice specifice cerute.
- **56A/D și 58D:** glucocorticoizii au inclusiv efect permisiv vascular; nu toate prostaglandinele sunt vasoconstrictoare; insulina inhibă lipaza hormon-sensibilă, dar nu toate lipazele. Explicațiile restrâng corect domeniul.
- **57A:** secretina este produsă în celule enteroendocrine duodenale și influențează digestia. Excluderea pare să se bazeze pe „glande endocrine” distincte, nu celule dispersate; ambiguă, semnalată.

### Surse consultate pentru explicații

Lecțiile locale `sistemul_endocrin.html` (în special clasificarea hormonilor, hipofiza, tabelul de efecte) și `metabolism_si_nutritie.html` (metabolism general, glucide, chilomicroni) au furnizat cadrul didactic. URL-urile de mai jos verifică nuanțele care nu pot fi tratate simplist:

1. GH proteină 191 aa: https://www.ncbi.nlm.nih.gov/books/NBK279056/ ; clasificarea didactică este explicită și la liniile 50–53 și 64 ale lecției endocrine locale.
2. Semnalizare prolactină JAK–STAT: https://www.ncbi.nlm.nih.gov/books/NBK557556/ și https://www.ncbi.nlm.nih.gov/sites/books/NBK27/?report=printable
3. Estrogen/osteoclaste, cercetare primară: https://pubmed.ncbi.nlm.nih.gov/9254647/
4. Glucocorticoizi/glicogenogeneză hepatică, cercetare primară: https://pubmed.ncbi.nlm.nih.gov/6809510/ și https://pubmed.ncbi.nlm.nih.gov/6413207/ ; clasificare MeSH NIH: https://www.ncbi.nlm.nih.gov/mesh/68005938
5. Timus în compartimentele superior/anterior: https://www.ncbi.nlm.nih.gov/sites/books/NBK539819/ și https://www.ncbi.nlm.nih.gov/books/NBK539748/?report=classic
6. PTH, estrogen și os: raport oficial Surgeon General, https://www.ncbi.nlm.nih.gov/books/NBK45504/
7. Cushing, efecte și diabet secundar: NIDDK, https://www.niddk.nih.gov/health-information/endocrine-diseases/cushings-syndrome
8. Lactație și inhibiția din sarcină: manual OMS, https://ncbi.nlm.nih.gov/books/NBK148970/ ; https://www.ncbi.nlm.nih.gov/books/NBK507829/
9. Forme glicozilate ale prolactinei, cercetare primară: https://pubmed.ncbi.nlm.nih.gov/8144855/
10. Secreția peptidelor de corpul galben, cercetare primară umană: https://pubmed.ncbi.nlm.nih.gov/2918060/ ; stimulare hCG: https://pubmed.ncbi.nlm.nih.gov/1633896/


## Audit: 65–119

### Observații de fidelitate

- 75D păstrează spațiul tipărit în „pH -ul”.
- 93B păstrează H₂O, nu este schimbat în CO₂.
- 97D păstrează vitamina B₁, așa cum apare în scanare, deși cobaltul aparține vitaminei B₁₂; explicația clarifică.
- 99D păstrează „melatonina”, fără schimbare în „metionina”.
- 102 păstrează forma tipărită „Metabolismului lipidic implică”.
- 103B păstrează „radiații ionice”; 103D păstrează „inspirație”, fără înlocuire cu „perspirație”.
- 114C păstrează „moleculelor mici”, chiar dacă definiția didactică uzuală vorbește de molecule mari.
- Indicii chimici tipăriți au fost redați Unicode; despărțirile la capăt de rând au fost reunite, păstrând cratimele lexicale din sursă.

### Barem: conflicte clare și ambiguități explicate în opțiuni

**Necesită atenție editorială prioritară, fără schimbarea cheii:**

- **73B** (barem CDE): glicerolul este precursor gluconeogenic; opțiunea omisă este adevărată și confirmată explicit de lecția existentă.
- **89B** (barem ACD): calorimetria indirectă este o metodă reală; excluderea se poate explica numai prin utilizarea restrânsă a termenului „calorimetrie” pentru dispozitivul direct din lecție.
- **103A** (barem CE): transferul energiei către apa care se evaporă descrie fizic un mecanism adevărat, deși opțiunea este omisă.
- **108D** (barem ABE): întreținerea funcțiilor metabolice descrie în esență cheltuiala bazală; formularea este incompletă, dar nu falsă biologic.

**Ambiguități sau simplificări, semnalate fără a fabrica justificări:**

- 71E: „direct în sânge” poate contrasta cu limfa (adevărat) ori poate exclude spațiul interstițial (imprecis).
- 72A: scăderea receptorilor este o simplificare a rezistenței insulinice, nu mecanism obligatoriu pentru fiecare caz de tip 2.
- 72D, 74D/E: afirmații adevărate, excluse deoarece nu tratează tipul de metabolism cerut.
- 73A: particulele conțin resturi de acizi grași esterificați; baremul pare să ceară termenul trigliceride și să respingă fracția liberă.
- 73E, 115E: acetoacetatul și beta-hidroxibutiratul pot fi utilizați ca acetil-CoA; acetona nu urmează aceeași cale.
- 76E: există calorimetre indirecte; lecția folosește „calorimetru” pentru camera de măsurare directă.
- 77B: convecția poate încălzi sau răci în funcție de gradient; contextul lecției tratează răcirea. 77E selectată: contracția produce căldură, iar „conservă” este imprecis.
- 78C: HDL mare nu garantează că toate celelalte fracții lipidice sunt scăzute. 78E compară proporțiile în particule, nu masele plasmatice absolute.
- 79B: o dietă vegetariană dezechilibrată poate fi insuficientă, dar una variată poate furniza toți aminoacizii esențiali.
- 89E: frigul crește cheltuiala termoreglatoare; definiția strictă a măsurării bazale presupune termoneutralitate.
- 95B/D: răspunsul descris presupune masă mixtă cu glucide; mesele predominant proteice pot stimula și glucagonul.
- 96B/C: vasodilatația și transpirația sunt caracteristice remiterii febrei; baremul vizează ascensiunea sub acțiunea pirogenilor.
- 100E: acetil-CoA este precursor cetogenic, însă acetona nu este acidul responsabil de cetoacidoză.
- 101D: insulina predomină postprandial; glucagonul nu devine complet absent.
- 102E: 129 ATP este bilanțul istoric al oxidării complete; beta-oxidarea izolată nu produce acest total. Calculul modern uzual pentru palmitat este 106 net.
- 105D: sulful apare în feomelanină; baremul urmează asocierea didactică a cuprului cu melanogeneza și nu acoperă această nuanță.
- 107C: captarea stimulată de insulină se aplică unor țesuturi, nu tuturor celulelor.
- 112B: clasificarea „central/periferic” pentru senzori viscerali diferă între taxonomii; lecția grupează senzorii profunzi cu cei centrali.
- 114C: compușii mici pot fi efectiv catabolizați până la produși excretabili; baremul vizează definiția inițială mare→mic.
- 115B: cetoza de post nu este automat cetoacidoză severă.
- 117A: ficatul captează resturi de chilomicroni, mușchiul predominant acizi grași eliberați. 117D implică oxidarea după hidroliză, nu ATP direct prin hidroliză. 117E efectul colesterolului asupra fluidității depinde de temperatură și nu este general tuturor lipidelor.
- 118E: arahidonicul este condiționat esențial și poate fi sintetizat din linoleic; baremul păstrează clasificarea veche din lecție.

### Surse de verificare

Baza explicațiilor: `metabolism_si_nutritie.html`, în special textul cu `data-source-page` 454–474. Sursele externe au fost utilizate punctual pentru verificarea ambiguităților, nu pentru rescrierea întrebărilor.

- Absorbția monozaharidelor, GLUT2 și spațiul interstițial (71): https://www.ncbi.nlm.nih.gov/books/NBK597379/
- Compoziția și transportul lipoproteinelor (65, 73, 78, 98, 106, 117): https://www.ncbi.nlm.nih.gov/books/NBK351/ și https://www.ncbi.nlm.nih.gov/books/NBK305896/
- Mecanisme de schimb termic și definiția BMR (70, 76–77, 89, 103, 108): https://openstax.org/books/anatomy-and-physiology-2e/pages/24-6-energy-and-heat-balance
- Calorimetrie indirectă (76E, 89B): https://www.ncbi.nlm.nih.gov/books/NBK278963/
- Termoreceptori centrali și periferici (70, 112): https://www.ncbi.nlm.nih.gov/books/NBK507838/; nuanța anatomică senzori periferici viscerali: https://pmc.ncbi.nlm.nih.gov/articles/PMC6034117/
- Metabolismul corpilor cetonici (73E, 100E, 115E): https://www.ncbi.nlm.nih.gov/books/NBK554523/ și https://www.ncbi.nlm.nih.gov/books/NBK493179/
- Randamentul modern 106 ATP/palmitat (102E): https://everydaybiochemistry.com/mitochondrial-fatty-acid-oxidation/ (curs al profesorului Roger Miesfeld, bazat pe propriul manual). Calcul: 8×10 + 7×2,5 + 7×1,5 − 2 = 106.
- Acizi grași esențiali (118E): https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/
- Feomelanină cu sulf, tirozinază dependentă de cupru (105D): https://www.ncbi.nlm.nih.gov/books/NBK459156/
- Diete vegetariene și aminoacizi esențiali (79B): https://www.canada.ca/en/health-canada/services/food-guide/explore/dietary-guidelines/applying/considerations-vegetarian-diets.html


## Audit: 120–160

### Fidelitate

S-au păstrat textul, ordinea A–E, formulările și erorile sursei. S-au unit doar rândurile tipografice și s-au redat indicii tipografici ca Unicode (T₃, T₄, B₁₂). Numărul sursă este separat de prompt.

Formulări de păstrat: 145B „afinitatea transportorului”, 149C „tubului contort proximal”, 151D „corpului galben preovulator”, 153C „glandei corticosuprarenale”, 158C „feed-back”, 159C „de hormonii”, 160A „hormon steroid”. Niciuna nu a fost corectată în enunț; explicațiile clarifică eroarea unde este cazul.

### Ambiguități și limite ale baremului

- **125A/D:** STH este separat didactic de hormonii tropi; efectele prin IGF-1 fac clasificarea mai complexă. Semnalizarea STH se face prin receptor membranar și în principal JAK2–STAT; explicația nu inventează un mecanism AMPc obligatoriu pentru a justifica „mesagerii secundari”.
- **127B, 129B/D, 130A/C, 131A:** lecția distinge strict peptidele scurte (ADH/oxitocină) de proteine (insulină/prolactină/STH). Termenul biologic larg „peptidic/polipeptidic” poate include și insulina sau prolactina. Baremul este păstrat, distincția este explicită.
- **131B:** cheia exclude „este secretat de neurohipofiză”, dar neurohipofiza eliberează realmente ADH în sânge. Explicația separă sinteza hipotalamică de eliberare și semnalează ambiguitatea verbului.
- **135B/D:** cheia ACE exclude hipercalcemia și lipsa de energie. Clinic, hipercalcemia poate apărea în hipertiroidism, iar oboseala este menționată explicit de NIDDK pentru Graves. Aceste variante nu sunt declarate universal imposibile.
- **137A, 140B, 156B:** explicațiile urmăresc schema homeostaziei calciului, evitând confuzia cu efectul anabolic al administrării intermitente terapeutice de PTH.
- **138A/D:** lecția atribuie dezechilibrul Na/K și tegumentele pigmentate bolii Addison. Ele pot exista și în unele forme de Cushing; explicațiile păstrează cheia BCE fără a afirma că ar fi imposibile clinic.
- **139A, 153A/D:** efectele ACTH asupra glicogenului/metabolismului sunt cele enumerate în tabelul lecției, dar sunt explicate ca efecte ale axei endocrine, în principal prin glucocorticoizi, nu ca acțiune hepatică directă demonstrată a ACTH.
- **144B:** sursa folosește „boala Cushing” în sens larg; explicația diferențiază sindromul de boala Cushing hipofizară.
- **145B:** cheia acceptă „crește afinitatea transportorului membranar pentru glucoză”. Mecanismul clasic este translocarea GLUT4 la membrană și creșterea capacității transportului, nu simpla modificare a afinității. Nu s-a fabricat o justificare moleculară falsă.
- **147E:** efectul glucagonului asupra lipolizei/acizilor grași la om este dependent de context, cu rezultate experimentale diferite; cheia ACE este păstrată și explicația menționează limita.
- **148C/E:** hormonii tiroidieni sunt excepția importantă dintre hormonii non-steroidieni, cu liposolubilitate și receptori intracelulari.
- **149E:** prolactina stimulează realmente sinteza laptelui, dar este adenohipofizară, deci nu răspunde cerinței despre hormonii neurohipofizari.
- **152B:** baremul exclude calcitonina și urmărește PTH, însă efecte stimulatoare ale calcitoninei asupra activării vitaminei D au fost demonstrate experimental. Explicația notează simplificarea, fără să răstoarne cheia.
- **158D/E:** cheia reală este **ABD**. D este susținută și de lecție prin rolul glucocorticoizilor în vasoconstricție. E nu este selectată; răspunsul rapid „fight or flight” aparține catecolaminelor/simpaticului, deși cortizolul contribuie la răspunsul general la stres.
- **159B/C:** terminologia istorică „cretinism” și greșeala gramaticală „de hormonii” sunt păstrate; explicațiile sunt distincte de enunț.


### Surse pentru verificarea explicațiilor

Sursa didactică locală principală: `sistemul_endocrin.html`, în special clasificarea hormonilor (rândurile 49–53), tabelul hormonilor hipofizari (71), tiroida (77–80), pancreasul (90–96), suprarenalele (100–104). Sursele externe de mai jos sunt verificări ale mecanismelor/ambiguităților; nu au furnizat enunțurile sau cheia.

- OpenStax, clasificare și mecanisme hormonale: https://openstax.org/books/anatomy-and-physiology-2e/pages/17-2-hormones — steroizi, peptide/proteine, excepția hormonilor tiroidieni, feedback.
- OpenStax, hipofiză/hipotalamus: https://openstax.org/books/anatomy-and-physiology-2e/pages/17-3-the-pituitary-gland-and-hypothalamus — originea și eliberarea hormonilor neurohipofizari.
- OpenStax, suprarenale: https://openstax.org/books/anatomy-and-physiology-2e/pages/17-6-the-adrenal-glands — catecolamine și răspunsul la stres.
- NIDDK, Graves: https://www.niddk.nih.gov/health-information/endocrine-diseases/graves-disease — inclusiv oboseala, relevantă la 135D.
- Daly et al., studiu clinic al calcemiei în hipertiroidism: https://pubmed.ncbi.nlm.nih.gov/6627696/ — limita baremului la 135B.
- NIDDK, Cushing: https://www.niddk.nih.gov/health-information/endocrine-diseases/cushings-syndrome — hipercortizolism, hipertensiune, slăbiciune, față rotundă.
- Endotext, Florid Cushing's Syndrome, sursă editorială originală: https://www.endotext.org/wp-content/uploads/word/florid-cushings-syndrome.pdf — posibilitatea pigmentării în forme severe.
- Endotext, Cushing's Syndrome: https://www.endotext.org/wp-content/uploads/pdfs/cushings-syndrome.pdf — variații clinice/hipokaliemie.
- Argetsinger et al., identificarea experimentală a JAK2 asociată receptorului GH: https://pubmed.ncbi.nlm.nih.gov/8343952/ — 125D.
- Suzuki și Kono, experimentul translocării transportorului glucozei: https://pubmed.ncbi.nlm.nih.gov/6771756/ — 145B.
- Perea et al., efect lipolitic în adipocite umane izolate: https://pubmed.ncbi.nlm.nih.gov/7590626/ — 147E, context experimental.
- Gravholt et al., concentrații fiziologice de glucagon fără creșterea lipolizei în studiul uman: https://pubmed.ncbi.nlm.nih.gov/11344211/ — 147E, limita generalizării.
- NIH ODS, vitamina B12: https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/ — factor intrinsec/absorbție ileală, 152A.
- NIH ODS, vitamina K: https://ods.od.nih.gov/factsheets/VitaminK-HealthProfessional/ — prezență hepatică/rezerve relativ reduse, 152E.
- Studiu experimental despre calcitonină și 1-alfa-hidroxilaza renală: https://pubmed.ncbi.nlm.nih.gov/10393981/ — nuanța 152B, rezultate în șobolani, nu dovadă că baremul uman trebuie schimbat.
