# XIII101–200 — raport de autorare și autocontrol

Status: **complete pentru autorare; necesită recenzie editorială independentă înainte de integrare**.

100 întrebări numerotate original 101–200, 500 variante și 500 explicații redactate și citite integral. Nu există explicații preexistente pentru acest lot în baseline: toate cele 500 sunt noi. Nu s-au editat producția, baremul sau numerele. JSON SHA-256: `8b973195b360869008fb9e1979c0ed0a563f43d5898b32cc199c05f50fd3e5cb`.

Cheia provine exclusiv din fixture-ul complet `tests/umf-cluj-2026-answer-key.json` și a fost comparată 100/100 cu `tmp/umf-2026/answer-key-extracted.json`. Două lecturi vizuale separate ale cheii PDF289–290. XIII182 este tipărit ACBE: fixture-ul rămâne ACBE, draftul conține aceeași mulțime sortată ABCE. Întrebările negative sunt 111 și 123.

## Lectură vizuală integrală — două treceri

Sursă: `1019145554-Grile-Biologie-UMF-Cluj-2026-1.pdf`, imagini `tmp/umf-2026/source/page-NNN.jpg`. Am citit fiecare enunț și fiecare variantă A–E, inclusiv coloanele și continuările. A doua trecere a verificat independent transcrierea deja scrisă. Numerele PDF sunt 1-based; numărul tipărit diferă în acest capitol cu +10.

| PDF | Tipărit | Interval/continuare inspectată | Trecerea 1 | Trecerea 2 |
|---|---:|---|---|---|
| 248 | 258 | 101–108; 103D/E în coloana dreaptă | complet | complet |
| 249 | 259 | 109–115; 112E în coloana dreaptă | complet | complet |
| 250 | 260 | 116–123; 119D/E continuă în dreapta | complet | complet |
| 251 | 261 | 124–131 și 132A; 128B–E în dreapta | complet | complet |
| 252 | 262 | 132B–E, 133–139, 140A; 136D/E în dreapta | complet | complet |
| 253 | 263 | 140B–E, 141–147; 144D/E în dreapta | complet | complet |
| 254 | 264 | 148–154, 155A/B | complet | complet |
| 255 | 265 | 155C–E, 156–161, 162A | complet | complet |
| 256 | 266 | 162B–E, 163–167, 168A | complet | complet |
| 257 | 267 | 168B–E, 169–174, 175A–D; 172B–E în dreapta | complet | complet |
| 258 | 268 | 175E, 176–182, 183A; 179C–E în dreapta | complet | complet |
| 259 | 269 | 183B–E, 184–189 | complet | complet |
| 260 | 270 | 190–197; 193E tot pe această pagină, în dreapta | complet | complet |
| 261 | 271 | 198–200, fără a atribui lotului întrebările ulterioare | complet | complet |
| 289 | 299 | baremul 101–120, coloana dreaptă | complet | complet |
| 290 | 300 | baremul 121–200, inclusiv ACBE la 182 | complet | complet |

## Corecturi în cursul autorării

Acestea sunt corecturi ale ciornei proprii, nu modificări ale conținutului publicat:

| Element | Înainte | După | Efect semantic |
|---|---|---|---|
| 143B | «la nivel organismul» | «la nivelul organismul» | Nu; restabilirea exactă a textului tipărit, cu dezacordul păstrat |
| 170D | «calcitoniei» | «calcitoninei» | Nu; literă omisă în transcriere |
| 185B | «denumți» | «denumiți» | Nu; literă omisă în transcriere |
| 193 sourcePages | [260,261] | [260] | Nu; E se află sus în coloana dreaptă a PDF260 |
| 142,178 lessonUrl | celulă/energie | metabolism/metabolismul-glucidelor | Trimitere către conținut real, nu secțiune goală |
| 199 lessonUrl | metabolism/introducere | metabolism/metabolismul-glucidelor | Trimitere către explicația metabolică, nu cuprins |
| 176 lessonUrl | endocrin/alte-glande-endocrine | masculin/ducte | Conținut relevant pentru bulbouretrale; întrebarea rămâne mixtă |

Nicio corectură de enunț/variantă nu schimbă sensul intenționat al scanului. Au fost păstrate, între altele: 114D «de glandelor», 120E «alveolei dentară», 128A «pe o secțiunea», 136E «canalul epididimar», 137B «exclusiv miozină», 138D «tapetat un epiteliu», 143B «nivelul organismul», 188 spațiul înainte de ?, 191A majuscula, 192B K fără indice de sarcină, 194A «cel mai des întâlnite», 197A «circulația sistemice», 200C «plexului toracic». Afirmațiile greșite nu au fost reparate în textul variantelor.

Explicațiile au fost redactate după text și sens, apoi rafinate după manual și primare. În special, s-au eliminat motive presupuse pentru excluderea din barem la 112E, 128D, 134B/E, 142A, 149A/B, 151C, 155B, 164E, 183B/E și 184B. La 107E, 130B, 173B și 184B se precizează limitele modelelor experimentale. Aceste rafinări nu sunt prezentate ca revizii față de explicații publicate, deoarece toate explicațiile lotului sunt noi.

## Lecții și manual

Am citit integral conținutul celor 17 lecții relevante în această rundă XIII: introducere, celulă, oase/articulații, țesut muscular, țesut nervos, sistem nervos, simțuri, endocrin, sânge, cardiovascular, limfatic/imun, respirator, digestiv, metabolism/nutriție, renal, reproducător masculin și feminin. Explicațiile de bază provin din aceste lecții. Cele 49 de trimiteri distincte din întrebări și trimiterile suplimentare din note au fost verificate contra ID-urilor reale (51 de URL-uri locale distincte în total). Nu s-au folosit secțiuni goale ca destinații.

Din `734244481-Barron-s-2022.pdf` am recitit vizual în această rundă **22 de pagini selectate**, pentru afirmațiile și conflictele relevante. Aceasta nu reprezintă o nouă lectură integrală a tuturor capitolelor manualului:

| PDF | Tipărit | Motivul consultării |
|---|---|---|
| 55 | 48 | membrană și transport |
| 259 | 252 | tabelul diencefalului, eroarea vizual/auditiv |
| 261 | 254 | formațiunea reticulată bulbară și activarea cortexului |
| 287 | 280 | gust, hartă și proiecție corticală |
| 290 | 283 | aparatul vestibular |
| 310 | 303 | PTH, absorbție/reabsorbție intestinală, calcitonină |
| 311 | 304 | insulină și pancreas |
| 314 | 307 | timus, topografie și epifiză |
| 335 | 327 | leucocite, eozinofil bilobat |
| 357 | 349 | automatism cardiac |
| 365 | 357 | ramuri aortice și trunchi brahiocefalic |
| 439 | 431 | suc gastric, pepsină, labferment și factor intrinsec |
| 443 | 435 | tabel enzimatic intestinal și absorbție |
| 474 | 466 | clasificarea aminoacizilor |
| 475 | 467 | lipide și proteine vegetale «frecvent» incomplete |
| 480 | 472 | vitamine și introducerea RMB |
| 481 | 473 | definiția RMB pe kilogram și dimensiuni corporale |
| 498 | 490 | nefron și transport |
| 499 | 491 | ramura ascendentă și contracurent |
| 500 | 492 | contracurent, uree și secreție |
| 538 | 530 | scrot și dartos |
| 544 | 536 | glande anexe și țesut erectil |

## Registru editorial și surse primare

Cele 51 note de mai jos sunt și în JSON. Sursele externe sunt cercetări originale sau baza oficială NCBI Gene. Unde a fost accesibil numai rezumatul ori indexarea, nu pretind citirea integrală a articolului. Rezultatele pe șoareci/oi/maimuțe, în culturi, în tumori ori în condiții experimentale sunt delimitate de fiziologia umană normală. Articolul de coculturi Sertoli–Leydig a fost consultat anterior în auditul XII, nu recitit integral acum. Nicio sursă externă nu schimbă baremul autoritativ.

1. **XIII103 — A,D** (`didactic-precision`). Mineralul principal este hidroxiapatita; grupările hidroxil nu înseamnă depozite de Ca(OH)₂ pur. Efectul PTH asupra absorbției intestinale este în principal indirect, prin calcitriol; D rămâne exclusă.

   Surse: `oasele_si_articulatiile.html#osul`; `sistemul_endocrin.html#glandele-paratiroide`; `Barron PDF310 / tipărit303`.

2. **XIII107 — D** (`scope-ambiguity`). Aldosteronul este exclus de barem. Un studiu observațional la pacienți cu aldosteronism primar asociază boala cu tulburări ale metabolismului mineral și osteoporoză; nu demonstrează singur o acțiune directă asupra fiecărei celule osoase. Explicația nu neagă efecte osoase indirecte.

   Surse: [https://pubmed.ncbi.nlm.nih.gov/28794160/](https://pubmed.ncbi.nlm.nih.gov/28794160/).

3. **XIII107 — E** (`key-science-conflict`). Oxitocina este exclusă, deși studiul original arată fenotip osos la șoareci și receptori/efecte în culturi osoase, inclusiv umane. S-au citit rezumatul și legendele figurilor relevante; rezultatul experimental nu este prezentat ca indicație clinică.

   Surse: [https://pubmed.ncbi.nlm.nih.gov/19369205/](https://pubmed.ncbi.nlm.nih.gov/19369205/); [https://pmc.ncbi.nlm.nih.gov/articles/PMC2678458/](https://pmc.ncbi.nlm.nih.gov/articles/PMC2678458/).

4. **XIII110,114,146,147,165,166 — B,C,D,E** (`question-category`). Unele afirmații adevărate nu corespund categoriei cerute: 110E placenta nu este gonadă; 114B/C/E sunt anatomie într-o întrebare de fiziologie; 146C privește circulația pulmonară, nu vascularizația nutritivă; 147D ureea este organică; 165A/B/D și 166D/E descriu acțiuni ale unor hormoni produși în afara sistemului reproducător cerut. Explicațiile precizează categoria fără a falsifica informația biologică.

   Surse: `sistemul_reproducator_feminin.html#organe`; `sistemul_cardiovascular.html#circulatia-coronariana`; `sistemul_renal_complet.html#nefron`; `sistemul_respirator.html#schimbul-de-gaze`.

5. **XIII112 — E** (`synthesis-versus-release`). Feedbackul pozitiv estrogenic asupra axei nu dovedește automat creșterea biosintezei GnRH. Harris 1998 a măsurat la oi modificările ARNm în jurul vârfului de secreție și a descris disocierea biosinteză–secreție. Rezumatul original a fost citit din indexarea PubMed; accesul direct a afișat ulterior CAPTCHA. Nu extrapolăm mecanismul experimental ca regulă umană absolută.

   Surse: [https://pubmed.ncbi.nlm.nih.gov/9421398/](https://pubmed.ncbi.nlm.nih.gov/9421398/); [https://pubmed.ncbi.nlm.nih.gov/9209087/](https://pubmed.ncbi.nlm.nih.gov/9209087/).

6. **XIII113,186 — A,B,D** (`manual-science-conflict`). 113B este inclusă conform proiecției parietale din manual (PDF287/tipărit280). Studiul PET original la om localizează regiuni gustative în insulă/operculul frontal. Explicațiile diferențiază modelul didactic de anatomia funcțională; 113A precizează că există și teritorii gustative inervate de X.

   Surse: `organele_de_simt.html#alte-simturi`; `Barron PDF287 / tipărit280`; [https://pubmed.ncbi.nlm.nih.gov/10457193/](https://pubmed.ncbi.nlm.nih.gov/10457193/).

7. **XIII116 — A** (`key-science-conflict`). Secreția gastrică de bicarbonat a fost demonstrată la 14 voluntari sănătoși, deși varianta este exclusă de barem. Rezumatul original JCI a fost citit integral. Se separă secreția protectoare mucoasă de secreția acidă parietală.

   Surse: [https://www.jci.org/articles/view/110969](https://www.jci.org/articles/view/110969).

8. **XIII118 — B** (`terminology-conflict`). Stereocilii auditivi sunt prelungiri cu actină, structural microvilozități specializate. Studiul ultrastructural original consultat privește urechea de șopârlă; este probă pentru organizarea fasciculului, nu eșantion uman. Baremul CD rămâne fix.

   Surse: [https://pubmed.ncbi.nlm.nih.gov/6893452/](https://pubmed.ncbi.nlm.nih.gov/6893452/); `organele_de_simt.html#urechea-si-auzul`.

9. **XIII119 — E** (`anatomical-scope`). Raportul cu jugulara nu este raportul mediastinal obișnuit prezentat de lecție. Timusul poate avea extensii cervicale; explicația evită afirmația absolută că niciun raport cervical ar fi posibil. Figura 13.9 și textul au fost verificate vizual.

   Surse: `Barron PDF314 / tipărit307`; `sistemul_limfatic_si_imun.html#timusul`.

10. **XIII121,198 — A,E** (`key-science-conflict`). Hipotalamusul controlează indirect epifiza prin circuite circadiene/autonome; 121E este exclusă în ciuda acestui fapt. Studiul original pe șase maimuțe rhesus cu leziuni SCN susține rolul în antrenarea fotoperiodică, dar consemnează și reapariția unor ritmuri, deci nu dovedește un control unic. 198A amestecă acest circuit cu axa hipotalamo-hipofizară metabolică.

   Surse: [https://pmc.ncbi.nlm.nih.gov/articles/PMC6564130/](https://pmc.ncbi.nlm.nih.gov/articles/PMC6564130/); `sistemul_nervos.html#sistem-nervos-central`.

11. **XIII122 — B,C,D** (`normalization`). Manualul definește RMB pe kilogram și unitate de timp, apoi leagă dimensiunile corporale mai mari de o rată mai mică. B nu trebuie justificată confundând această rată normalizată cu consumul energetic absolut. Vârsta și sexul indică tendințe, nu formule exacte sau cauzalitate independentă de compoziția corporală.

   Surse: `Barron PDF480–481 / tipărit472–473`; `metabolism_si_nutritie.html#rata-si-temperatura`.

12. **XIII124,190 — C,D** (`didactic-precision`). Schema hipofizară a MSH nu epuizează sistemul melanocortinic. Studiul original pe celule cutanate umane demonstrează producție locală POMC/α-MSH; 190D nu trebuie interpretată ca dependență exclusivă a pigmentării de MSH circulant din hipofiză.

   Surse: [https://pubmed.ncbi.nlm.nih.gov/17317724/](https://pubmed.ncbi.nlm.nih.gov/17317724/); `sistemul_endocrin.html#hipofiza-glanda-pituitara`.

13. **XIII128 — D** (`key-manual-conflict`). D este exclusă, însă manualul descrie explicit formațiunea reticulată bulbară, continuată în punte/mezencefal, și activarea corticală. Nici localizarea, nici funcția nu sunt negate pentru a justifica baremul AB.

   Surse: `Barron PDF261 / tipărit254`; `sistemul_nervos.html#sistem-nervos-central`.

14. **XIII130 — B** (`key-science-conflict`). B exclude astrocitele. Chung 2013 demonstrează experimental fagocitarea sinapselor prin MEGF10/MERTK la șoareci; rezumatul și rezultatele relevante au fost citite. Explicația declară modelul animal și nu confundă această capacitate cu rolul microgliei ca fagocit specializat.

   Surse: [https://pubmed.ncbi.nlm.nih.gov/24270812/](https://pubmed.ncbi.nlm.nih.gov/24270812/); [https://pmc.ncbi.nlm.nih.gov/articles/PMC3969024/](https://pmc.ncbi.nlm.nih.gov/articles/PMC3969024/).

15. **XIII134 — B** (`scope-ambiguity`). Formularea «pot» permite adipocite brune, spre deosebire de adipocitul alb unilocular. Articolul original Cypess 2009 prezintă țesut adipos brun adult uman; descrierea explicită a nucleilor centrali din rezultate privește un hibernom, iar figura arată separat BAT din biopsie cervicală. Nu s-a confundat leziunea cu întreaga probă normală.

   Surse: [https://pmc.ncbi.nlm.nih.gov/articles/PMC2859951/](https://pmc.ncbi.nlm.nih.gov/articles/PMC2859951/); [https://www.sochob.cl/web1/wp-content/uploads/2020/01/Identification-and-Importance-of-Brown-Adipose-Tissue-in-Adult-Humans.pdf](https://www.sochob.cl/web1/wp-content/uploads/2020/01/Identification-and-Importance-of-Brown-Adipose-Tissue-in-Adult-Humans.pdf).

16. **XIII134 — E** (`scope-ambiguity`). Nucleii centrali apar în regenerarea fibrelor scheletice, deși periferia este poziția tipică în fibra adultă sănătoasă. Studiul uman cu leziune indusă de efort și biopsii la 30 zile susține limita lui «pot». Baremul exclude E și rămâne neschimbat.

   Surse: [https://pubmed.ncbi.nlm.nih.gov/37573332/](https://pubmed.ncbi.nlm.nih.gov/37573332/).

17. **XIII136 — E** (`printed-false-assertion`). Scanul spune «canalul epididimar», nu ependimar. Textul fals a fost păstrat; explicația indică termenul anatomic corect, fără a altera distractorul.

   Surse: `PDF grile252 / tipărit262`; `sistemul_nervos.html#sistem-nervos-central`.

18. **XIII141 — B** (`didactic-precision`). Dezaminarea furnizează azot pentru ciclul ureei; nu produce singură uree. Baremul include rezumatul, dar explicația separă cele două procese.

   Surse: `metabolism_si_nutritie.html#lipide-si-proteine`.

19. **XIII142 — A** (`scope-ambiguity`). Fluxul prin canale nu este cataliză, dar pompele și alte enzime susțin gradientele/excitabilitatea. Baremul exclude A; «pot interveni» nu justifică negarea contribuțiilor indirecte.

   Surse: `tesutul_nervos.html#fiziologia-nervilor`; `celula_si_fiziologia_celulara.html#transport`.

20. **XIII143 — B,C** (`key-science-conflict`). B și C sunt incluse. Studiul uman cu trasori stabili demonstrează sinteza acidului arahidonic din linoleic; necesitatea alimentară directă nu este universală. S-a citit rezumatul original, fără a pretinde textul integral.

   Surse: [https://pubmed.ncbi.nlm.nih.gov/10471130/](https://pubmed.ncbi.nlm.nih.gov/10471130/); `metabolism_si_nutritie.html#lipide-si-proteine`.

21. **XIII144 — B,E** (`scope-ambiguity`). Distincția atac inițial prin amilaze versus digestie completă nu permite negarea contribuției enzimelor marginii în perie. Lucrările originale despre maltază–glucoamilază umană includ structură/cinetică și degradarea in vitro a amidonului de către domeniu recombinant. Aceasta nu măsoară contribuția cantitativă normală in vivo și nici nu echivalează toate enzimele cu enzime libere în suc.

   Surse: [https://pubmed.ncbi.nlm.nih.gov/18036614/](https://pubmed.ncbi.nlm.nih.gov/18036614/); [https://pubmed.ncbi.nlm.nih.gov/17485087/](https://pubmed.ncbi.nlm.nih.gov/17485087/); `Barron PDF443 / tipărit435`.

22. **XIII146 — E** (`anatomical-precision`). Baremul include vecinătatea ambelor cave; ostiul sinusului coronarian este mai precis vecin cu ostiul cavei inferioare și valva tricuspidă. Nu se afirmă aceeași apropiere imediată de cava superioară.

   Surse: `sistemul_cardiovascular.html#circulatia-coronariana`.

23. **XIII149 — A,B** (`key-scope-conflict`). A: tiroxina are influențe asupra remodelării, deși schema principală prezintă hormonii calciotropi. B: atât absorbția intestinală, cât și reabsorbția renală reglează calciul. Manualul însuși folosește «reabsorbție» intestinală; aceasta nu poate fi inventată ca explicație certă a excluderii.

   Surse: `Barron PDF310 / tipărit303`; `sistemul_endocrin.html#glandele-paratiroide`; `metabolism_si_nutritie.html#stari-si-minerale`.

24. **XIII150 — C** (`morphology`). Eozinofilul are de regulă nucleu bilobat, deși aparține granulocitelor cu nucleu lobat. Manualul și figura au fost citite; explicația păstrează această precizie.

   Surse: `Barron PDF335 / tipărit327`; `sangele.html#globulele-albe`.

25. **XIII151 — C** (`anatomical-scope`). Dartosul este neted, dar cremasterul include fibre striate cu inervație somatică. Studiul anatomic original pe cadavre/specimene operatorii descrie și fibre netede în cremaster. Nu se pretinde că întregul cremaster este exclusiv striat; limita topografică a peretelui scrotal este explicită.

   Surse: [https://anatomypubs.onlinelibrary.wiley.com/doi/10.1002/ar.20711](https://anatomypubs.onlinelibrary.wiley.com/doi/10.1002/ar.20711); `Barron PDF538 / tipărit530`.

26. **XIII155 — B** (`key-terminology-conflict`). Prima ramură normală este numită și «right brachiocephalic trunk» într-un articol clinic original cu ecocardiografie. B poate denumi același vas ca D; nu se inventează un vas inexistent. Figura manualului păstrează denumirea fără lateralitate.

   Surse: [https://pmc.ncbi.nlm.nih.gov/articles/PMC6750178/](https://pmc.ncbi.nlm.nih.gov/articles/PMC6750178/); `Barron PDF365 / tipărit357`.

27. **XIII156 — C** (`anatomical-direction`). Canalele perforante conectează transversal canalele centrale ale osteonilor. C inversează rolurile descriptive, dar canalele formează o rețea comunicantă; explicația nu neagă comunicarea bidirecțională dintre ele.

   Surse: `oasele_si_articulatiile.html#osul`.

28. **XIII159 — C** (`question-category`). Efectul hipocalcemiant sistemic nu specifică o acțiune renală. Calcitonina are însă efecte renale demonstrate: studiul 1971 la hipoparatiroidieni a găsit creșteri ale calciuriei, iar studiul 1997 în hipercalcemie acută a găsit conservare renală a calciului. S-au citit rezumatele originale; condițiile diferite împiedică o regulă universală despre direcție.

   Surse: [https://pubmed.ncbi.nlm.nih.gov/5166965/](https://pubmed.ncbi.nlm.nih.gov/5166965/); [https://pubmed.ncbi.nlm.nih.gov/9058369/](https://pubmed.ncbi.nlm.nih.gov/9058369/).

29. **XIII163 — B,E** (`manual-science-conflict`). Labfermentul la sugar este inclus de barem și manual. NCBI Gene identifică CYMP uman drept pseudogen validat, nu dovadă de chimozină umană activă. Rolul coagulării cazeinei este atribuit prezentării didactice. E urmează prezentarea manualului despre absorbția gastrică redusă; sediul major al absorbției glucozei și apei rămâne intestinul subțire.

   Surse: `Barron PDF439 / tipărit431`; [https://www.ncbi.nlm.nih.gov/gene/643160](https://www.ncbi.nlm.nih.gov/gene/643160); `sistemul_digestiv.html#stomacul`.

30. **XIII164 — A,E** (`segment-precision`). A simplifică sensibilitatea distală la ADH. E omite deosebirea segmentelor ascendente: studiul original pe segmente subțiri microperfuzate de la șoareci ClC-K1 arată conductanță pasivă pentru Cl⁻. Rezumatul, metodele și rezultatele relevante au fost citite; baremul ACD rămâne fix.

   Surse: `Barron PDF498–500 / tipărit490–492`; [https://pubmed.ncbi.nlm.nih.gov/11832425/](https://pubmed.ncbi.nlm.nih.gov/11832425/); [https://journals.physiology.org/doi/10.1152/ajprenal.0192.2001](https://journals.physiology.org/doi/10.1152/ajprenal.0192.2001).

31. **XIII169 — E** (`physiological-context`). Insulina poate crește activitatea lipoprotein-lipazei adipocitare. Studiul uman cu clamp arată dependență de nivelul insulinei/glucozei; explicația nu extinde rezultatul la fiecare situație metabolică.

   Surse: [https://pubmed.ncbi.nlm.nih.gov/6389242/](https://pubmed.ncbi.nlm.nih.gov/6389242/).

32. **XIII170 — C** (`physical-condition`). Vasodilatația favorizează transferul căldurii spre piele, dar sensul schimbului cu mediul depinde de gradientul termic. Formularea nu trebuie înțeleasă ca pierdere obligatorie de căldură la orice temperatură externă.

   Surse: `metabolism_si_nutritie.html#rata-si-temperatura`.

33. **XIII172 — E** (`physiological-context`). Baremul include mobilizarea lipidică. Perea 1995 arată efecte în adipocite umane izolate, iar Gravholt 2001 nu găsește lipoliză crescută în microdializa a șapte bărbați la glucagon fiziologic. Ambele rezumate originale au fost citite; diferența de model este păstrată.

   Surse: [https://pubmed.ncbi.nlm.nih.gov/7590626/](https://pubmed.ncbi.nlm.nih.gov/7590626/); [https://pubmed.ncbi.nlm.nih.gov/11344211/](https://pubmed.ncbi.nlm.nih.gov/11344211/).

34. **XIII173 — B** (`limited-evidence`). Aromataza a fost identificată în hipofiză de șobolan și în adenoame hipofizare umane. Expresia enzimei nu demonstrează singură fluxul normal de estrogeni secretat de adenohipofiza umană. B rămâne exclusă, fără a nega categoric orice steroidogeneză locală.

   Surse: [https://eurjanat.com/data/pdf/eja.110031jc.pdf](https://eurjanat.com/data/pdf/eja.110031jc.pdf); [https://pubmed.ncbi.nlm.nih.gov/26578364/](https://pubmed.ncbi.nlm.nih.gov/26578364/).

35. **XIII176 — B,C** (`didactic-precision`). Bartholin lubrifiază în special vestibulul/intrarea vaginală. «Activează spermatozoizii» pentru glandele bulbouretrale este prezentarea manualului; nu se transformă în dovada unei capacitații directe exclusive.

   Surse: `Barron PDF544 / tipărit536`; `sistemul_reproducator_masculin.html#ducte`; `sistemul_reproducator_feminin.html#organe`.

36. **XIII177 — C** (`direct-versus-reflex`). Trigemenul nu inervează motor mușchii extrinseci oculari, dar are contribuții senzitive și reflexe în regiune. Explicația diferențiază inervația directă III/IV/VI de influențele indirecte.

   Surse: `sistemul_nervos.html#sistem-nervos-periferic`.

37. **XIII179 — D** (`scope-ambiguity`). Circulația venoasă transportă celule imune, iar venulele sunt implicate în recrutarea leucocitară. Excluderea din barem nu poate fi explicată prin absența oricărei participări imunitare.

   Surse: `sangele.html#globulele-albe`; `sistemul_cardiovascular.html#vasele-sanguine`.

38. **XIII182,190 — C,D** (`direct-versus-indirect`). LH stimulează direct celulele Leydig; FSH acționează în principal pe Sertoli și poate influența indirect steroidogeneza. Articolul original cu coculturi umane a fost consultat în auditul XII anterior, nu recitit integral în această rundă XIII. Explicațiile nu confundă controlul principal cu absența cooperării paracrine.

   Surse: [https://onlinelibrary.wiley.com/doi/full/10.1111/j.1365-2605.1998.00105.x](https://onlinelibrary.wiley.com/doi/full/10.1111/j.1365-2605.1998.00105.x); `sistemul_reproducator_masculin.html#hormoni`.

39. **XIII182 — A,B,C,E** (`printed-key-order`). Cheia tipărită este ACBE. Fixture-ul păstrează această ordine; draftul sortează aceeași mulțime ca A,B,C,E. Nu este o corectură a baremului.

   Surse: `PDF grile290 / tipărit300`; `tests/umf-cluj-2026-answer-key.json`.

40. **XIII183 — B,E** (`scope-ambiguity`). Acizii grași liberi circulă pe albumină, iar cei esterificați se găsesc și în chilomicroni. «Metabolizați» include sinteza citosolică, nu numai β-oxidarea organelară. B/E sunt excluse, dar absența calificărilor este păstrată explicit ca ambiguitate.

   Surse: `metabolism_si_nutritie.html#lipide-si-proteine`.

41. **XIII184 — B,D** (`direct-versus-indirect`). Resorbția este executată de osteoclaste, dar PTH poate induce în osteoblaste semnalizarea RANKL care susține osteoclastogeneza. Studiul original Yasuda 1998 pe celule murine a fost citit în rezumat, metode și rezultate relevante. D descrie conservarea calciului osos, nu stimulare universală directă a formării de os.

   Surse: [https://pmc.ncbi.nlm.nih.gov/articles/PMC19881/](https://pmc.ncbi.nlm.nih.gov/articles/PMC19881/); `sistemul_endocrin.html#glandele-paratiroide`.

42. **XIII185 — A** (`taste-map`). Studiul uman regional original arată detectarea gusturilor în mai multe regiuni, cu diferențe de intensitate, nu hărți exclusive. Baremul exclude A; explicația nu afirmă că umami ar lipsi anterolateral.

   Surse: [https://pubmed.ncbi.nlm.nih.gov/25485034/](https://pubmed.ncbi.nlm.nih.gov/25485034/); [https://pmc.ncbi.nlm.nih.gov/articles/PMC4254731/](https://pmc.ncbi.nlm.nih.gov/articles/PMC4254731/).

43. **XIII186 — E** (`scope-ambiguity`). Miocardul are automatism și nu necesită impuls nervos pentru fiecare bătaie. Modulația autonomă rămâne reală; termenul «pot iniția» este mai larg decât descrierea bătăii normale și nu trebuie folosit pentru o negare absolută.

   Surse: `Barron PDF357 / tipărit349`; `sistemul_cardiovascular.html#muschiul-cardiac`.

44. **XIII188 — C** (`unit-precision`). −55 mV este un potențial de prag orientativ, nu intensitatea impulsului. Varianta este inclusă; termenul tipărit nu a fost corectat tacit.

   Surse: `tesutul_nervos.html#fiziologia-nervilor`.

45. **XIII191 — E** (`classification`). GH este clasificat separat de hormonii tropi glandulari în lecție, dar induce IGF-1. Excluderea nu implică imposibilitatea de a stimula un alt semnal endocrin.

   Surse: `sistemul_endocrin.html#hipofiza-glanda-pituitara`.

46. **XIII192 — B** (`key-science-conflict`). Neurotransmițătorii pot regla canale postsinaptice K⁺. Experimentul original cu GABA/baclofen și blocantul phaclofen demonstrează răspunsul inhibitor lent în felii hipocampice. B rămâne exclusă; nu se limitează arbitrar toate canalele postsinaptice la Na⁺.

   Surse: [https://www.nature.com/articles/332156a0](https://www.nature.com/articles/332156a0).

47. **XIII193 — D** (`key-science-conflict`). Nu toate proteinele vegetale sunt incomplete. Tabelul 1 din studiul randomizat cu soia/zer listează toți cei nouă aminoacizi esențiali în produsul de soia; studiul uman cu 15N măsoară separat digestibilitatea/utilizarea. Tabelul și rezumatul relevante au fost citite. Nu se afirmă echivalență nutrițională universală pentru toate plantele.

   Surse: [https://pmc.ncbi.nlm.nih.gov/articles/PMC7312446/](https://pmc.ncbi.nlm.nih.gov/articles/PMC7312446/); [https://www.sciencedirect.com/science/article/pii/S0022316623023726](https://www.sciencedirect.com/science/article/pii/S0022316623023726); `Barron PDF475 / tipărit467`.

48. **XIII194 — A,E** (`scope-and-wording`). A este adevărată în sensul mineralului cel mai abundent, nu al celui mai abundent element chimic. E folosește «activitate articulară» nespecific, dar rolul calciului în contracție este cert. Se păstrează și dezacordul tipărit «cel mai des întâlnite».

   Surse: `metabolism_si_nutritie.html#stari-si-minerale`.

49. **XIII197 — B** (`anatomical-precision`). Confluența standard este splenică plus mezenterică superioară; mezenterica inferioară se varsă frecvent în splenică. Formularea plurală din barem reprezintă aportul mezenteric schematic.

   Surse: `sistemul_cardiovascular.html#tipuri-de-circulatie-sanguina`.

50. **XIII198 — D** (`key-manual-science-conflict`). Baremul și tabelul 11.2 din manual exclud eronat vederea/auzul din releele talamice. LGN și MGN sunt relee talamice vizuale/auditive; articolul de localizare funcțională umană consultat confirmă ambele. Au fost citite rezumatul și discuția relevantă, fără a deduce o explicație falsă pentru barem.

   Surse: `Barron PDF259 / tipărit252`; [https://pmc.ncbi.nlm.nih.gov/articles/PMC11092475/](https://pmc.ncbi.nlm.nih.gov/articles/PMC11092475/).

51. **XIII200 — A** (`stimulus-precision`). Semnalul hipoxic pentru chemoreceptorii periferici este în principal PO₂ arterială, nu simpla concentrație totală de oxigen legată de hemoglobină. Formularea este explicată fără a schimba cheia AB.

   Surse: `sistemul_respirator.html#respiratie`.

## Validare finală

- 100 numere consecutive, fiecare cu sourceNumber și sourceChapter corecte; cinci litere A–E și cinci explicații la fiecare întrebare.
- 100/100 mulțimi de răspunsuri identice cu ambele fișiere de barem; ordinea tipărită specială de la 182 nu a fost pierdută din fixture.
- Toate paginile și continuările din lot sunt reprezentate în sourcePages; verificarea vizuală rămâne dovada transcrierii, nu simpla parsare JSON.
- Toate cele 500 de explicații au fost citite și verificate editorial. Verificările de structură/ancore nu sunt prezentate ca dovadă separată de corectitudine biologică.
- Nicio pagină de producție, cheie autoritativă sau fișier al altui autor nu a fost modificat de această sarcină. Nu s-au executat teste de browser/npm pentru fișierele JSON de lucru; integrarea și recenzia independentă aparțin etapelor următoare.
