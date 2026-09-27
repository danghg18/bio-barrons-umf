# Recenzie editorială independentă VI 1–80

Status: **complete**. Recenzor: `/root/content_tissue_c`. Autorul lotului: `/root/review_intro`.

Am recitit integral draftul și raportul autorului, toate cele 80 de enunțuri, 400 de variante și 400 de explicații, inclusiv explicațiile existente înaintea acestui import și cele 45 de note ale autorului. Am confruntat independent fiecare enunț și variantă cu imaginile sursei, am citit baremul vizual și am verificat manualul și lecțiile relevante. Fișierul de recenzie este o copie completă, cu 47 de note după recenzie. Nu am modificat draftul autorului, producția sau baremul.

Rezultat: **3 explicații corectate (3C, 45D, 73E), 3 trimiteri la lecție corectate (55, 61, 80), 2 note noi și 1 notă completată**. Cele 9 modificări sunt înregistrate cu valorile exacte înainte/după în `review.findings`. Nu există corecturi ale enunțurilor, variantelor, numerelor, paginilor sau răspunsurilor.

## Sursa vizuală: trecere independentă integrală

Această listă documentează propria citire vizuală; nu transformă cele două treceri declarate de autor în citiri ale recenzorului. Au fost urmărite ambele coloane și toate continuările.

| PDF | Tipărit | Interval verificat independent |
| --- | --- | --- |
| 109 | 115 | 1–8 integral; 9 enunț și A–D |
| 110 | 116 | 9E; 10–20 integral, inclusiv 15D/E în coloana dreaptă |
| 111 | 117 | 21–29 integral, inclusiv 25E în coloana dreaptă |
| 112 | 118 | 30–38 integral |
| 113 | 119 | 39–46 integral, inclusiv 42E; 47 enunț și A |
| 114 | 120 | 47B–E; 48–54 integral, inclusiv 52B–E; 55 enunț și A–D |
| 115 | 121 | 55E; 56–62 integral, inclusiv 59C–E; 63 enunț și A–C |
| 116 | 122 | 63D/E; 64–70 integral, inclusiv 67E; 71 enunț și A–C |
| 117 | 123 | 71D/E; 72–77 integral |
| 118 | 124 | 78–80 integral; limita lotului înainte de 81 |
| 128 | 134 | Baremul tuturor întrebărilor 1–80 |
| 129 | 135 | Continuarea tabelului de barem, 121–160, inspectată pentru context; nu conține răspunsuri din lotul 1–80 |

Transcrierea păstrează și formulările tipărite imperfecte: `sa` la 3E, `ventricului` la 39A, repetiția „asupra” la 42, `proteină cu 191` la 59E, `acizi grași` la 75A și `pH -ul` la 75D. La 57C este tipărit **melatonina**, nu melanina. Nu am corectat aceste texte. Întrebările negative sunt exact **36 și 69**; `asksFalse` le identifică corect.

## Manualul și lecțiile citite

Am citit vizual imaginile Barron’s 2022: endocrine PDF **303–315**, pagini tipărite **296–308**, și metabolism PDF **462–464, 471–475, 478, 481–482**, pagini tipărite **454–456, 463–467, 470, 473–474**. Maparea a fost verificată pe numărul tipărit al fiecărei imagini; nu am aplicat un decalaj global comun capitolelor.

Am citit integral conținutul local din `sistemul_endocrin.html` și `metabolism_si_nutritie.html`, apoi am verificat în HTML amplasarea efectivă a secțiunilor. Toate cele 80 de trimiteri finale au ancore existente. Secțiunea metabolică `#introducere` este numai cuprinsul; teoria introductivă și tabelul 19.1 se află sub `#metabolismul-glucidelor`, motivul corecturilor 61/80.

Manualul fundamentează clasificările, anatomia și fiziologia de bază, dar nu a fost folosit ca argument pentru a nega fenomene reale: de exemplu efectul estrogenilor asupra osteoclastelor, secreția prenatală de colostru sau gluconeogeneza din glicerol.

## Verificarea biologică și a ambiguităților

Am verificat independent rezumatele a **21 de articole primare**, accesate în PubMed și/sau prin înregistrările MED din Europe PMC. Nu declar lectura integrală a articolelor. Rezumatele și identificatorii folosiți sunt păstrați în `VI-001-080-primary-evidence.json`; concluziile de mai jos nu extind rezultatele din rozătoare, culturi sau post la toate condițiile umane.

| Întrebări | Sursa primară și concluzia verificată |
| --- | --- |
| 3C | [Christ și colab., 1999](https://pubmed.ncbi.nlm.nih.gov/10086974/) și [studiul pe ducte colectoare, 2002](https://pubmed.ncbi.nlm.nih.gov/12429032/): creșteri rapide ale AMPc sub aldosteron în celule musculare vasculare porcine și ducte colectoare de șobolan; nu presupun un efect universal. |
| 10A | [Glicozilarea prolactinei, 1993](https://pubmed.ncbi.nlm.nih.gov/8144855/): există forme glicozilate; clasificarea didactică drept proteină nu le neagă. |
| 10B | [MGF–STAT5, 1995](https://pubmed.ncbi.nlm.nih.gov/7744007/): semnalizarea prolactinei prin JAK2/STAT5 nu trebuie redusă obligatoriu la AMPc. |
| 12B | [Secreția corpului galben uman, 1989](https://pubmed.ncbi.nlm.nih.gov/2918060/): relaxină și oxitocină, pe lângă progesteron. [Studiul hCG, 1992](https://pubmed.ncbi.nlm.nih.gov/1633896/) privește hCG și celule luteinizate; nu este prezentat drept demonstrație directă a aceluiași efect pentru LH. |
| 15A/D, 59A | [PTH și supraviețuirea osteoblastelor, 1999](https://pubmed.ncbi.nlm.nih.gov/10449436/): efect anabolic al administrării intermitente și efecte asupra osteoblastelor; nu se confundă cu excesul continuu. |
| 18E | [Aportul oral de proteine, 2023](https://pubmed.ncbi.nlm.nih.gov/37480216/): secreția de glucagon poate crește postprandial după proteine. |
| 23C | [Estrogen și osteoclaste, 1997](https://pubmed.ncbi.nlm.nih.gov/9254647/): inhibarea resorbției și apoptoza osteoclastelor sunt reale, deși C este exclus de barem. |
| 27B, 31A | [Glicogen hepatic, 1982](https://pubmed.ncbi.nlm.nih.gov/6809510/) și [mecanism, 1983](https://pubmed.ncbi.nlm.nih.gov/6413207/): glucocorticoizii pot favoriza sinteza/depunerea glicogenului hepatic; experimentele sunt pe rozătoare. |
| 37D | [Lipază pancreatică și insulină, 1991](https://pubmed.ncbi.nlm.nih.gov/1719525/) și [axa insulo-acinară, 1985](https://pubmed.ncbi.nlm.nih.gov/2410239/): efecte dependente de context asupra sintezei și secreției enzimelor pancreatice la șobolan; nu se transformă în regulă universală despre toate lipazele. |
| 45A | [Compoziția secreției mamare, 1981](https://pubmed.ncbi.nlm.nih.gov/7236122/): secreție limitată de componente ale laptelui înainte de naștere, distinctă de lactația abundentă ulterioară. |
| 45D | [Klein și colab., 1998](https://pubmed.ncbi.nlm.nih.gov/9661615/): supresia estradiolului prin tratament cu agonist GnRH în pubertatea precoce și rolul estradiolului în dezvoltarea mamară. Contribuția indirectă a axei GnRH–FSH/LH–ovare este o sinteză fiziologică a acestui rezultat și a manualului, nu o afirmație despre acțiunea directă a GnRH pe sân. |
| 52B/C | [Aldosteron, 1998](https://pubmed.ncbi.nlm.nih.gov/9679179/): efecte rapide negenomice în celule renale MDCK, inclusiv la membrană. |
| 55A | [ACTH în țesut adipos uman/șoarece, 2003](https://pubmed.ncbi.nlm.nih.gov/12925881/): răspuns lipolitic la șoarece și absența răspunsului semnificativ uman în condițiile testate; fără negare sau generalizare absolută. |
| 73B | [Gluconeogeneza din glicerol, 1995](https://pubmed.ncbi.nlm.nih.gov/7647479/): contribuția demonstrată prin trasori la oameni confirmă și textul explicit din manual. |
| 73E | [Reichard și colab., 1979](https://pubmed.ncbi.nlm.nih.gov/438326/): la oameni în post, eliminarea respiratorie/urinară reprezenta 2–30% din producția de acetonă, restul fiind metabolizat. Aceasta infirmă generalizarea din explicația anterioară; nu extrapolez procentele la toate condițiile. |
| 76E | [Calorimetre indirecte, 2022](https://pubmed.ncbi.nlm.nih.gov/35920141/): măsurarea schimburilor gazoase în camere calorimetrice indirecte este reală. |
| 79E | [Uree în transpirație, 1984](https://pubmed.ncbi.nlm.nih.gov/6720887/): excreția prin transpirație este demonstrată la oameni în efort. |

Au fost recitite și acceptate, cu baremul păstrat, precizările autorului despre: sfera largă a nucleilor hipotalamici (4A/C/E); GH proteină versus polipeptid (7C); dezvoltare/maturare foliculară (12A); poziția timusului și extensia sa inferioară (24A); sinteza hipotalamică versus eliberarea neurohipofizară a vasopresinei (29A); epifiza în epitalamus (39); hormonii cu efecte indirecte și clasificarea tropilor (40, 44); secreții hormonale abdominale din celule endocrine (57A); glucagon și metabolismul aminoacizilor (54A); efectele reale ale STH/MSH neincluse în baremul larg formulat (55B/D); lipaze diferite sub insulină (58); absorbția monozaharidelor în sânge prin interstițiu (71E); acizi grași esterificați în chilomicroni (73A); direcția schimbului de căldură prin convecție (77E); HDL ca asociere statistică, fără garanție universală (78C); aportul proteic vegetarian echilibrat (79B). Niciuna dintre aceste excluderi nu a fost transformată într-o regulă biologică inventată.

## Corecturi exacte

### 1. VI3 — options.C.why

**Înainte:** Mecanismul clasic al aldosteronului folosește receptorul mineralocorticoid intracelular, nu AMPc ca mesager secundar principal.

**După:** Baremul exclude C. În schema clasică, aldosteronul acționează prin receptorul mineralocorticoid intracelular. Totuși, au fost demonstrate și creșteri rapide ale AMPc induse de aldosteron în anumite celule; mecanismul clasic nu justifică negarea lor. Expresia „AMPc activat” este imprecisă: se modifică producția acestui mesager.

**Motiv:** Varianta folosește „poate”; prezentarea exclusivă a mecanismului genomic omite creșteri reale ale AMPc pe căi rapide. Studiile privesc celule musculare vasculare porcine și ducte colectoare de șobolan, nu demonstrează un efect universal.

**Sursă:** Barron’s PDF 303–304 / tipărit 296–297; https://pubmed.ncbi.nlm.nih.gov/10086974/; https://pubmed.ncbi.nlm.nih.gov/12429032/

### 2. VI45 — options.D.why

**Înainte:** GnRH controlează gonadotropinele; nu este hormonul care produce direct lactația sau ejecția laptelui.

**După:** Baremul exclude D. GnRH stimulează secreția hipofizară de FSH și LH, care controlează hormonii ovarieni; aceștia influențează dezvoltarea glandei mamare. Este un efect indirect. Cerința nu precizează că sunt vizate numai acțiunile directe sau lactația, astfel că excluderea nu poate fi justificată prin negarea acestei axe.

**Motiv:** Explicația anterioară restrângea cerința la lactație/ejecție directă, deși aceasta întreabă larg despre acțiunea asupra glandelor mamare. Axa gonadotropă are o contribuție indirectă reală la dezvoltarea mamară.

**Sursă:** Barron’s PDF 305–307 și 314 / tipărit 298–300 și 307; https://pubmed.ncbi.nlm.nih.gov/9661615/

### 3. VI73 — options.E.why

**Înainte:** Acetoacetatul și beta-hidroxibutiratul sunt utilizați de țesuturile extrahepatice prin conversie în acetil-CoA. Formularea didactică generalizează: acetona este în mare parte eliminată și nu urmează aceeași cale.

**După:** Acetoacetatul și beta-hidroxibutiratul sunt utilizați de țesuturile extrahepatice prin conversie în acetil-CoA. Formularea didactică generalizează: acetona poate fi metabolizată sau eliminată, dar nu urmează aceeași cale de cetoliză.

**Motiv:** Eliminată afirmația generală că acetona este „în mare parte eliminată”. Studiul cu trasori la oameni în post a găsit eliminare respiratorie și urinară de 2–30% din producție, restul fiind metabolizat; procentele din post nu sunt generalizate la toate condițiile.

**Sursă:** Barron’s PDF 473–474 / tipărit 465–466; https://pubmed.ncbi.nlm.nih.gov/438326/

### 4. VI55 — lessonUrl

**Înainte:** metabolism_si_nutritie.html#introducere

**După:** metabolism_si_nutritie.html#lipide-si-proteine

**Motiv:** Ruta #introducere afișează numai cuprinsul. Secțiunea lipidelor și proteinelor conține paragrafele despre reglarea hormonală a lipolizei și sintezei proteice, relevante pentru întrebare.

**Sursă:** metabolism_si_nutritie.html#lipide-si-proteine

### 5. VI61 — lessonUrl

**Înainte:** metabolism_si_nutritie.html#introducere

**După:** metabolism_si_nutritie.html#metabolismul-glucidelor

**Motiv:** Ruta #introducere afișează numai cuprinsul. Definițiile anabolismului/catabolismului, oxidoreducerea și tabelul comparativ 19.1 se află efectiv în secțiunea #metabolismul-glucidelor.

**Sursă:** metabolism_si_nutritie.html#metabolismul-glucidelor

### 6. VI80 — lessonUrl

**Înainte:** metabolism_si_nutritie.html#introducere

**După:** metabolism_si_nutritie.html#metabolismul-glucidelor

**Motiv:** Ruta #introducere afișează numai cuprinsul. Definițiile anabolismului/catabolismului, oxidoreducerea și tabelul comparativ 19.1 se află efectiv în secțiunea #metabolismul-glucidelor.

**Sursă:** metabolism_si_nutritie.html#metabolismul-glucidelor

### 7. VI3 — notes.C

**Înainte:** null

**După:** {"number": 3, "options": ["C"], "type": "non-genomic-signalling", "text": "BDE păstrat. Schema genomică a aldosteronului nu exclude efectele rapide asupra producției AMPc, demonstrate în anumite celule. „AMPc activat” este o formulare imprecisă; nu este justificată o negare universală a legăturii aldosteron–AMPc.", "source": "https://pubmed.ncbi.nlm.nih.gov/10086974/", "sources": ["https://pubmed.ncbi.nlm.nih.gov/10086974/", "https://pubmed.ncbi.nlm.nih.gov/12429032/", "Barron’s PDF 303–304 / tipărit 296–297"]}

**Motiv:** Documentarea explicită a precizării introduse la recenzia independentă.

**Sursă:** https://pubmed.ncbi.nlm.nih.gov/10086974/; https://pubmed.ncbi.nlm.nih.gov/12429032/; Barron’s PDF 303–304 / tipărit 296–297

### 8. VI45 — notes.D

**Înainte:** null

**După:** {"number": 45, "options": ["D"], "type": "ambiguous-directness", "text": "BE păstrat. GnRH are o contribuție indirectă la dezvoltarea glandei mamare prin FSH/LH și hormonii ovarieni. Cerința nu spune „direct” și nu se limitează la lactație; motivul excluderii nu trebuie inventat.", "source": "Barron’s PDF 305–307 și 314 / tipărit 298–300 și 307", "sources": ["Barron’s PDF 305–307 și 314 / tipărit 298–300 și 307", "https://pubmed.ncbi.nlm.nih.gov/9661615/"]}

**Motiv:** Documentarea explicită a precizării introduse la recenzia independentă.

**Sursă:** Barron’s PDF 305–307 și 314 / tipărit 298–300 și 307; https://pubmed.ncbi.nlm.nih.gov/9661615/

### 9. VI73 — notes.E

**Înainte:** {"number": 73, "options": ["E"], "type": "ketone-specificity", "text": "CDE păstrat. Conversia în acetil-CoA privește în principal acetoacetatul și beta-hidroxibutiratul în țesuturi extrahepatice; acetona nu urmează aceeași cale didactică.", "source": "Barron’s 2022, pagini tipărite 454–456, 463–467, 470, 473–474 / PDF 462–464, 471–475, 478, 481–482; metabolism_si_nutritie.html", "sources": ["Barron’s 2022, pagini tipărite 454–456, 463–467, 470, 473–474 / PDF 462–464, 471–475, 478, 481–482; metabolism_si_nutritie.html"]}

**După:** {"number": 73, "options": ["E"], "type": "ketone-specificity", "text": "CDE păstrat. Conversia în acetil-CoA privește în principal acetoacetatul și beta-hidroxibutiratul în țesuturi extrahepatice. Acetona are alte căi metabolice și poate fi și eliminată; studiul uman în post nu susține generalizarea „în mare parte eliminată”.", "source": "https://pubmed.ncbi.nlm.nih.gov/438326/", "sources": ["https://pubmed.ncbi.nlm.nih.gov/438326/", "Barron’s 2022, pagini tipărite 454–456, 463–467, 470, 473–474 / PDF 462–464, 471–475, 478, 481–482; metabolism_si_nutritie.html"]}

**Motiv:** Adăugată sursa primară care susține precizarea metabolismului acetonei.

**Sursă:** https://pubmed.ncbi.nlm.nih.gov/438326/

## Validare finală

- 80 de întrebări distincte, exact 1–80; 400 de opțiuni A–E și 400 de explicații substantive recitite.
- 80/80 combinații finale identice cu `tests/umf-cluj-2026-answer-key.json`, capitolul VI, și cu `answer-key-extracted.json`; verificarea automată completează lectura vizuală a baremului.
- 80/80 trimiteri finale la fișiere și ancore reale; cele trei rute corectate au fost verificate și semantic în conținut.
- Diferențe față de draft: numai cele 3 câmpuri `why`, 3 `lessonUrl`, 2 note adăugate, 1 notă completată și metadatele recenziei. Toate textele tipărite și răspunsurile au rămas identice.
- Nu există incertitudini nerezolvate care să împiedice livrarea; conflictele dintre barem, formulare și biologie sunt documentate, fără schimbarea scorării.

SHA-256 al draftului autorului, păstrat neschimbat: `77a97b66aa362a5fa5ad401f0b5db072838d5afb8363f2f5f9fe3c4e484b8e6d`.
