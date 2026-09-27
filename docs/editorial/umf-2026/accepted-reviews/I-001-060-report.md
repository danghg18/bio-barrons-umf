# I 1–60 — Recitire editorială independentă

**Status: complete.** Reviewer: `/root/review_intro`. Au fost citite individual toate cele **60 de enunțuri, 300 de variante și 300 de explicații**, inclusiv explicațiile preexistente păstrate de autor. Copia revizuită este `reviews/I-001-060.json`. Draftul autorului și fișierele de producție nu au fost modificate; nu s-a făcut commit.

## Acoperire vizuală

Comparație directă cu toate imaginile originale relevante, nu aprobare pe baza schemei JSON. Paginile sunt numerotate PDF / tipărit:

| PDF / tipărit | Fragment verificat vizual |
|---|---|
| 6 / 9 | 1–10: toate enunțurile și A–E |
| 7 / 10 | 11–18: toate enunțurile și A–E |
| 8 / 11 | 19–24 integral; 25 enunț și A–D |
| 9 / 12 | 25E; 26–32 integral; 33 enunț și A–C |
| 10 / 13 | 33D–E; 34–41 integral; 42 enunț și A–B |
| 11 / 14 | 42C–E; 43–49 integral; enunțul 43 verificat suplimentar mărit |
| 12 / 15 | 50–56 integral; 57 enunț și A–C |
| 13 / 16 | 57D–E; 58–60 integral; 61 doar ca limită a lotului |

Singura diferență nouă de transcriere găsită este enunțul 43: sursa are **„Următori”**, nu „Următorii”. Greșeala gramaticală tipărită este păstrată. Restul celor 60 de enunțuri și 300 de variante corespund sursei, cu normalizarea despărțirilor de rând și diacriticelor. Nu rămâne text ilizibil.

## Cheie și explicații

Cheia tuturor celor 60 de întrebări corespunde atât `tests/umf-cluj-2026-answer-key.json`, cât și `answer-key-extracted.json`. Nu s-a modificat nicio literă de răspuns. Cerințele negative au fost confirmate vizual: 24, 25, 26, 39, 43. Au fost verificate toate cele cinci explicații de la fiecare întrebare, în contextul cerinței; nu doar variantele selectate de barem.

Lecția locală `introducere_anatomie_fiziologie.html` a fost citită prin textul integral și confruntată cu HTML-ul secțiunilor relevante: introducere, organizare (inclusiv tabelul 1.1), funcții/homeostazie, termeni (inclusiv tabelul 1.2 și planurile), cavități/regiuni/membrane. Legăturile către secțiuni au rute existente.

Surse consultate în recitirea independentă, pentru faptele care necesită precizare:

- [OpenStax A&P 1.1](https://openstax.org/books/anatomy-and-physiology-2e/pages/1-1-overview-of-anatomy-and-physiology): citologia este inclusă în anatomia microscopică; confirmă rezerva de la 39E.
- [OpenStax A&P 1.2](https://openstax.org/books/anatomy-and-physiology-2e/pages/1-2-structural-organization-of-the-human-body): celula este unitate funcțională; organizarea țesuturilor poate include tipuri celulare înrudite; confirmă rezervele 24A și 25E.
- [OpenStax A&P 1.6](https://openstax.org/books/anatomy-and-physiology-2e/pages/1-6-anatomical-terminology): planuri, cavități, foițe și spații seroase; fundamentează corecturile 33A/B, 47B, 52D și menținerea precizărilor 12E/38A.
- [OpenStax A&P 23.1](https://openstax.org/books/anatomy-and-physiology-2e/pages/23-1-overview-of-the-digestive-system): țesuturile/plexurile peretelui digestiv și spațiul peritoneal; susține 3A/C/D și distincția 16A/53A.
- [IMAIOS — lobul stâng al ficatului](https://www.imaios.com/en/e-anatomy/anatomical-structures/left-lobe-of-liver-1541093220) și [Texas Tech — ficat](https://anatomy.ttuhscep.edu/schemes/liver_ans.html): predominanța dreaptă nu exclude extensia lobului stâng în hipocondrul stâng; contradicția 18C este explicitată.
- [University of Leeds — hipofiză](https://histology.leeds.ac.uk/home/glandular/pituitary/): adenohipofiza glandulară este epitelială; explicația 16E distinge faptul anatomic adevărat de clasificarea principalelor țesuturi.
- [OpenStax A&P 10.7](https://openstax.org/books/anatomy-and-physiology-2e/pages/10-7-cardiac-muscle-tissue), [A&P 10.1](https://openstax.org/books/anatomy-and-physiology-2e/pages/10-1-overview-of-muscle-tissues) și [University of Minnesota — preparat de miocard](https://histologyguide.com/slideview/MH-054-cardiac-muscle/04-slide-1.html): nucleu central, de obicei unic, uneori doi; confirmă nuanța 7B.
- [OpenStax Chemistry 4.1](https://openstax.org/books/chemistry-atoms-first-2e/pages/4-1-ionic-bonding): NaCl este ionic; rezerva 55C rămâne explicită, fără schimbarea baremului.
- [OpenStax Biology 41.4](https://openstax.org/books/biology-2e/pages/41-4-nitrogenous-wastes): sinteză hepatică și excreție urinară a ureei; confirmă nuanța 56B.
- [OpenStax Clinical Nursing Skills 18.1](https://openstax.org/books/clinical-nursing-skills/pages/18-1-respiratory-system): hipoxia înseamnă oxigenare tisulară insuficientă; precizează 42E.
- [OpenStax A&P 23.5](https://openstax.org/books/anatomy-and-physiology-2e/pages/23-5-the-small-and-large-intestines) și [Texas Tech — colon](https://anatomy.ttuhscep.edu/modules/abdominal_viscera_module/abdominal_07.html): sigmoidul și rectul au localizare pelviană; 53D rămâne o formulare ambiguă exclusă de barem, fără a inventa motivul excluderii.
- [American Physiological Society — Role of aquaporin water channels in pleural fluid dynamics](https://journals.physiology.org/doi/full/10.1152/ajpcell.2000.279.6.C1744): filtrarea microvasculară și traversarea barierei mezoteliale susțin precizarea de la 38D; celulele sanguine nu sunt prezentate drept celulele secretoare ale seroasei.

11A/B și 12B sunt corect explicate în draft: structura care constituie raportul anterior/inferior/medial nu este confundată cu poziția inimii sau a plămânului. 14D rămâne o enumerare anatomic adevărată, în afara cerinței despre funcții. Nicio explicație nu schimbă baremul pentru a ascunde un conflict. Contradicțiile certe și ambiguitățile de formulare sunt documentate; acestea nu reprezintă text necitit sau incertitudine de transcriere.

## Corecturi față de draft

### 43 — prompt

- Înainte: Următorii termeni direcționali sunt corecți, cu excepția:
- După: Următori termeni direcționali sunt corecți, cu excepția:
- Motiv: Sursa tipărește «Următori», cu un singur i final. Nu corectăm tacit greșeala gramaticală a originalului.
- Sursă: tmp/umf-2026/source/page-011.jpg, pagina tipărită 14; enunț verificat suplimentar prin mărire

### 18 — options.C.why

- Înainte: Baremul exclude C și asociază ficatul în principal hipocondrului drept și epigastrului. Lobul stâng se extinde însă spre stânga, astfel că afirmația nu trebuie transformată în regula că ficatul se află exclusiv în partea dreaptă.
- După: Baremul exclude C, însă lobul stâng al ficatului se extinde în epigastru și hipocondrul stâng. Cea mai mare parte a ficatului este în hipocondrul drept; această predominanță nu înseamnă că hipocondrul stâng nu poate conține țesut hepatic. Cheia rămâne A, B, E.
- Motiv: Precizează că extensia lobului stâng ajunge chiar în hipocondrul stâng; simpla formulare «spre stânga» putea ascunde contradicția anatomică a excluderii.
- Sursă: https://www.imaios.com/en/e-anatomy/anatomical-structures/left-lobe-of-liver-1541093220 ; https://anatomy.ttuhscep.edu/schemes/liver_ans.html

### 33 — options.A.why

- Înainte: Cavitatea abdomino-pelviană este subdiviziune a cavității anterioare, nu cavitate principală alături de cea posterioară.
- După: Enumerarea a numai două cavități este incompletă: secțiunea evidențiază și cavitatea toracică. Cavitatea anterioară cuprinde atât subdiviziunea toracică, cât și pe cea abdomino-pelviană, iar posterior se află cavitatea dorsală.
- Motiv: Enunțul nu cere exclusiv cavități principale. Motivul respingerii enumerării este omisiunea toracelui, nu doar amestecarea nivelurilor de clasificare.
- Sursă: introducere_anatomie_fiziologie.html#cavitati, figura 1.4; https://openstax.org/books/anatomy-and-physiology-2e/pages/1-6-anatomical-terminology

### 33 — options.B.why

- Înainte: Cavitatea toracică este doar subdiviziune a cavității anterioare.
- După: Cavitatea toracică este într-adevăr superior de diafragmă, dar nu este singura cavitate vizibilă în secțiune: se disting și cavitatea posterioară și subdiviziunea abdomino-pelviană.
- Motiv: Distinge partea adevărată a variantei de cuantificatorul fals «o singură».
- Sursă: introducere_anatomie_fiziologie.html#cavitati, figura 1.4; https://openstax.org/books/anatomy-and-physiology-2e/pages/1-6-anatomical-terminology

### 42 — options.E.why

- Înainte: Hipoxia, adică lipsa de oxigen, perturbă homeostazia.
- După: Hipoxia înseamnă oxigenare insuficientă a țesuturilor și poate perturba homeostazia. Nu presupune neapărat absența completă a oxigenului.
- Motiv: Diferențiază insuficiența oxigenării de absența completă a oxigenului; păstrează caracterul posibil din enunț.
- Sursă: https://openstax.org/books/clinical-nursing-skills/pages/18-1-respiratory-system

### 47 — options.B.why

- Înainte: Cavitățile pleurale conțin plămânii și sunt laterale mediastinului.
- După: Cavitățile pleurale se află lateral de mediastin, în jurul plămânilor. Strict, fiecare cavitate pleurală este spațiul îngust dintre foițele pleurei, nu spațiul ocupat de țesutul pulmonar.
- Motiv: Menține distincția dintre compartimentul pulmonar și spațiul seros, deja explicată la 12E.
- Sursă: introducere_anatomie_fiziologie.html#cavitati, Membranele; https://openstax.org/books/anatomy-and-physiology-2e/pages/1-6-anatomical-terminology

### 52 — options.D.why

- Înainte: Plămânii sunt în cavitățile pleurale; mediastinul îi exclude.
- După: Toracele adăpostește plămânii în compartimentele laterale, de o parte și de alta a mediastinului. Localizarea lor în mediastin este partea falsă a variantei.
- Motiv: Identifică explicit componenta falsă fără a confunda organul cu spațiul pleural dintre foițe.
- Sursă: introducere_anatomie_fiziologie.html#cavitati; https://openstax.org/books/anatomy-and-physiology-2e/pages/1-6-anatomical-terminology

### 53 — options.D.why

- Înainte: Baremul exclude formularea care atribuie pelvisului „intestinele” în ansamblu. În pelvis există totuși rectul și pot ajunge sigmoidul și anse intestinale; nu trebuie învățat că pelvisul nu conține intestin.
- După: Baremul exclude D, însă pelvisul conține vezica urinară și segmente intestinale, inclusiv rectul și colonul sigmoid; pot coborî și anse ale intestinului subțire. Formularea „intestinele” este imprecisă: nu toate segmentele sunt pelviene, dar prezența intestinului în pelvis nu este falsă. Cheia rămâne B, C, E.
- Motiv: Nu atribuie autorului baremului un motiv nedocumentat și nu introduce implicit «toate» în varianta tipărită; prezintă ambiguitatea și anatomia reală.
- Sursă: introducere_anatomie_fiziologie.html#cavitati; https://openstax.org/books/anatomy-and-physiology-2e/pages/23-5-the-small-and-large-intestines ; https://anatomy.ttuhscep.edu/modules/abdominal_viscera_module/abdominal_07.html

## Verificări finale

Validare locală reușită: 60 numere consecutive, 300 variante A–E, 300 explicații nevidate, cheie identică în ambele fișiere independente, toate cerințele negative corecte, metadate de recitire pentru 1–60 și PDF 6–13. Comparația draft/copie arată exact o corectură de enunț și șapte precizări de explicații; nicio variantă tipărită și nicio cheie nu au fost schimbate. Nu s-au executat teste de interfață: acest lot privește exclusiv recitirea editorială.
