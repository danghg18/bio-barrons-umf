# XIII301–400 — autorare și audit propriu

Lot complet: **100 de întrebări, 500 de opțiuni, 500 de explicații individuale**, toate noi. Nu au fost modificate producția, ID-urile existente, alte loturi sau baremul. Niciun commit. Nu am delegat acest lot. Recitirea independentă de către alt autor rămâne etapa următoare; prezentul raport descrie auditul autorului.

## Acoperirea vizuală exactă

Am citit fiecare enunț și toate variantele A–E din imaginile sursei în două treceri distincte. Prima a produs transcrierea și explicațiile; a doua a comparat din nou fiecare text cu imaginea și a recitit fiecare explicație. Toate continuările între coloane și pagini au fost incluse. Tabelul se aplică ambelor treceri.

| PDF scan | Tipărit | Conținut inspectat |
|---|---|---|
| 274 | 284 | 301 enunț+A |
| 275 | 285 | 301B–E; 302–308 integral |
| 276 | 286 | 309–315 integral; 316 enunț+A–D |
| 277 | 287 | 316E; 317–322 integral; 323 enunț+A–D |
| 278 | 288 | 323E; 324–330 integral; 331 enunț+A |
| 279 | 289 | 331B–E; 332–337 integral; 338 enunț+A |
| 280 | 290 | 338B–E; 339–345 integral |
| 281 | 291 | 346–352 integral; 353 enunț+A–D |
| 282 | 292 | 353E; 354–360 integral |
| 283 | 293 | 361–367 integral |
| 284 | 294 | 368–374 integral |
| 285 | 295 | 375–382 integral |
| 286 | 296 | 383–389 integral; 390 enunț+A–C |
| 287 | 297 | 390D–E; 391–397 integral; 398 enunț+A |
| 288 | 298 | 398B–E; 399–400 integral |
| 291 | 301 | Barem 301–400, confruntat integral de două ori |

Sursa de punctaj exclusivă este `tests/umf-cluj-2026-answer-key.json`, verificată și cu `tmp/umf-2026/answer-key-extracted.json`. Toate cele 100 de seturi sunt identice cu ambele fișiere și cu baremul vizual din PDF291. Toate cerințele sunt afirmative (`asksFalse: false`). „Lobul” la 394 este enunțul scurt tipărit, fără completare inventată. Majusculele, numerele și distractorii au rămas conforme scanului; doar despărțirile de rând, diacriticele cu virgulă și indicii echivalenți Unicode au fost normalizați. În a doua trecere nu am găsit alte abateri de transcriere. Nu am schimbat distractori precum 11 cartilaje, sistem transportor de protoni,0 în grupele sanguine sau „venule leagă venele de capilare”.

## Lecții și manual efectiv consultate

În timpul acestui lot am citit integral conținutul didactic din lecțiile: `celula_si_fiziologia_celulara.html`, `oasele_si_articulatiile.html`, `tesutul_muscular.html`, `organele_de_simt.html`, `sangele.html`, `sistemul_limfatic_si_imun.html` și `sistemul_nervos.html`. Pentru `sistemul_renal_complet.html` am citit pasajele despre nefron, filtrare, reabsorbție, secreție și control hormonal. Pentru introducere, țesut nervos, endocrin/metabolism, cardiovascular, respirator, digestiv și reproducător am folosit și lecturile integrale făcute personal în loturile anterioare ale aceluiași audit; nu pretind o nouă lectură integrală a fiecărui capitol în acest lot. Pasajele relevante au fost confruntate cu explicațiile și, unde era nevoie, redeschise punctual. Toate cele 17 fișiere de lecție folosite în `lessonUrl` există și toate fragmentele au fost validate în HTML.

Din manualul `/Users/danghergie/Downloads/734244481-Barron-s-2022.pdf`, următoarele imagini au fost citite vizual în acest lot, inclusiv figurile și tabelele din paginile deschise:

| PDF manual | Tipărit | Conținut |
|---|---|---|
| 54–59 | 47–52 | Membrană, transport, nucleu, organite, citoschelet |
| 125–129 | 118–122 | Matrice, creștere/remodelare osoasă, articulații |
| 175–178; 183–184 | 168–171; 176–177 | Tipuri musculare, învelișuri, sarcomer, mecanism, energie/lactat |
| 233 | 226 | Neuroni, clasificare și limitele schemei interneuronilor |
| 255–259; 265 | 248–252; 258 | Rădăcini, encefal, funcții corticale, LCR, cerebel/diencefal, mediatori autonomi |
| 280–281; 285–286 | 273–274; 278–279 | Camere versus compartimente oculare, tunici, auz și organ Corti |
| 328–331; 335–337 | 320–323; 327–329 | Plasmă, eritrocite/hemoglobină, leucocite/plachete |
| 497–502 | 489–494 | Filtrare și procese tubulare, reglarea renală |
| 438 | 430 | Glande salivare și esofag, redeschidere punctuală |

Lecturi vizuale personale anterioare reutilizate pentru acest lot: endocrin PDF303–315/tipărit 296–308; metabolism PDF462–464,471–475,478,481–482/tipărit 454–456,463–467,470,473–474; cardiovascular PDF352–367/tipărit 344–359; limfatic PDF383–384/tipărit 375–376; respirator PDF410–422/tipărit 402–414; digestiv PDF433–449/tipărit 425–441; masculin PDF538–545/tipărit 530–537; feminin PDF557–570/tipărit 549–562. Acestea sunt documentate în rapoartele loturilor personale VI1–80, VIII1–70, IX81–160, X1–80, XII71–140 și recenzia XII1–70. Nu am aplicat un offset unic întregului manual: înainte de pagina 326, paginile consultate aici au offset 7; mai târziu, cele enumerate au offset 8.

## Revizuiri în timpul auditului propriu

Fiecare explicație a fost formulată după citirea textului complet și recitită. În trecerea finală am precizat:325B compoziția matricei și ambiguitatea lipsei „exclusiv”;332B antigenele ABO solubile;337C reperul de 1000 ml din manual;351C cele 11 cartilaje apar în manual, însă varianta descrie structură, nu rol;382B distincția explicită cameră/compartiment. Am înlăturat presupunerile despre intenția baremului la 329C,338D,346C,352E,362E,369B,394C–E; am întărit explicațiile 346D,353C,368C,384D și 388E cu limitele dovezilor. Am corectat „sechestrează” și spațierea în proza proprie. Legăturile 375/395 folosesc#ducte,387#lipide-si-proteine,359#grupele-sanguine,321#functii. Toate sunt ancore existente.

## Dovezi și contradicții

Registrul complet de 52 note este și în JSON. Listele de mai jos identifică exact observația, sursele efectiv citite și limitele lor. Majoritatea studiilor primare au fost citite la nivelul rezumatului integral, suficient pentru afirmația punctuală; nu se pretinde lectura integrală a articolelor. Excepțiile și pasajele suplimentare sunt precizate individual. Nicio sursă găsită numai după titlu nu este folosită ca dovadă. Sursele educaționale instituționale și nomenclatura NLM sunt marcate ca atare, fără a le prezenta drept experimente.

1. **301 / B — qualification.** Necesitatea absolută a sărurilor biliare este mai largă decât sprijinul biochimic. Studii enzimatice descriu lipaza și în absența lor; interfața lipidică și colipaza contează. Au fost citite rezumatele, nu extrapolate măsurători clinice. Surse: [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/7126621/); [www.sciencedirect.com](https://www.sciencedirect.com/science/article/pii/S0022227520344904); Manual PDF 441–449 / tipărit 433–441.

2. **301, 388 / 301D, 388E — key-inconsistency.** 301D acceptă digestia acizilor nucleici până la nucleotide, 388E exclude formularea analogă pentru DNaza pancreatică. DNaza pancreatică umană este documentată; fragmentele rezultate nu trebuie confundate cu absorbția mononucleotidelor. Love/Hewitt 1979: rezumat citit; CD73 nu a fost folosit ca dovadă de digestie completă a ADN-ului. Surse: [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/115887/); Manual PDF 441–449 / tipărit 433–441.

3. **301, 303, 334, 344, 351, 354, 368 / 301E, 303C, 303E, 334B, 334E, 344D, 351C, 354B, 354C, 368E — scope.** Enunțurile cer explicit enzime, funcții, morfologie, fiziologie sau acțiuni metabolice. Explicațiile disting enunțurile adevărate care descriu altă categorie, fără să le transforme în falsuri biologice. Surse: Scan PDF 274–275, 279, 280–284; Lecțiile locale indicate de fiecare lessonUrl.

4. **304 / E — key-conflict.** Ovarul este pereche și intraperitoneal; suprafața sa neacoperită de peritoneu visceral nu îl face retroperitoneal. Verificat pasajul universitar indexat; PDF-ul de 23 MB nu a fost deschis integral. Refolosit și contextul verificat personal pentru XII88B/99A. Surse: [anatomie.lf2.cuni.cz](https://anatomie.lf2.cuni.cz/sites/anatomie/files/page/files/2026/21_female_genital_system_ms.pdf); tmp/umf-2026/drafts/XII-071-140-report.md.

5. **307 / C — qualification.** Clasificarea funcțională separă diartrozele de amfiartroze; mobilitatea diartrozelor nu înseamnă aceeași amplitudine pentru toate tipurile. Surse: Manual PDF 128–129 / tipărit 121–122.

6. **309 / D — unit-qualification.** Decibelul exprimă nivelul raportat logaritmic, intensitatea fizică are unitate W/m². Textul de examen rămâne cel din manual. Surse: Manual PDF 285 / tipărit 278; lecția organele_de_simt.html.

7. **310, 311, 373 / 310A, 311D, 373E — classification.** Clasificarea glandulotropă și descrierea inelelor steroidice sunt didactice. GH este adenohipofizar și stimulează inclusiv IGF-1, dar nu este glandulotrop în schema folosită. Surse: Manual PDF 303–307 / tipărit 296–300.

8. **312 / C — key-qualification.** Nu este justificată absența oricărui efect electrolitic glucocorticoid. Stewart 1988: rezumatul studiului uman în deficit de 11β-HSD arată retenție de sodiu și pierdere de potasiu după hidrocortizon. Este o situație patologică particulară, nu dovada că glucocorticoizii sunt regulatorul normal principal. Surse: [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/3164727/); Manual PDF 312–313 / tipărit 305–306.

9. **313, 341, 348, 369 / 313D, 341B, 348A, 369B — plasma-qualification.** 40 % privește totalul globulinelor; albumina influențează presiunea oncotică, nu singură osmolaritatea totală. Gama-globulinele sunt apărare adaptativă; „primar” nu este interpretat ca prima barieră înnăscută. Surse: Manual PDF 328–329 / tipărit 320–321; sangele.html.

10. **314 / B — key-qualification.** Agranulocitele pot avea granule azurofile/lizozomi; termenul privește lipsa granulelor specifice. Descrierea frotiului uman de la Histology Guide menționează granule azurofile în monocite; a fost citită descrierea, nu inspectată întreaga lamă interactivă. Surse: [histologyguide.com](https://histologyguide.com/slideview/MH-034bhr-bone-marrow-smear/08-slide-7.html); Manual PDF 335–337 / tipărit 327–329.

11. **315, 335, 337 / 315A, 315D, 335A, 337A, 337C, 337D — reference-values.** Valorile sunt reperele didactice ale manualului: 75×70=5250 ml/min; frecvență 70–80/min; volum curent 500 ml; volum rezidual aproximativ 1000 ml. Nu sunt constante identice la toți oamenii. Surse: Manual cardiovascular PDF 352–367 / tipărit 344–359; respirator PDF 418 / tipărit 410.

12. **316 / B — terminology.** Denumirea tipărită „transportor de protoni” rămâne exclusă; lanțul transportor de electroni pompează totuși protoni, folosiți în chemiosmoză. Surse: Manual PDF 183 / tipărit 176.

13. **318 / C — causality-qualification.** Demielinizarea centrală caracterizează scleroza multiplă, dar o leziune de mielină nu implică obligatoriu această boală. Surse: tesutul_nervos.html; manual capitol 10.

14. **319 / A, B, D — anatomical-qualification.** Se disting receptorii din mușchi de rolul său efector, rădăcinile de corpurile neuronale și eferențele somatice de cele vegetative. Surse: Manual PDF 255 / tipărit 248; sistemul_nervos.html.

15. **320, 372 / 320B, 320C, 320D, 372D, 372E — anatomical-qualification.** Corpurile neuronilor auditivi sunt în ganglionul spiral; prelungirile periferice contactează celulele ciliate. Organul Corti este pe membrana bazilară; mișcarea relativă față de structurile tectoriale produce transducția. Surse: Manual PDF 285–286 / tipărit 278–279; organele_de_simt.html.

16. **325 / B — key-ambiguity.** Hidroxiapatita este componentă reală a matricei mineralizate, alături de colagen. Cuvântul „exclusiv” nu apare; baremul rămâne ACD și explicația declară ambiguitatea. Surse: Manual PDF 125–127 / tipărit 118–120.

17. **328 / C, D, E — anatomical-qualification.** Formațiunea reticulată din manual aparține trunchiului cerebral; nucleii senzitivi bulbari nu sunt arii corticale. Originea aparentă bulbară a XI folosește convenția clasică, cu componentă spinală separată. Surse: Manual capitol 11; sistemul_nervos.html.

18. **329 / C — key-qualification.** Nirenberg 1996: rezumat/introducere și începutul metodelor citite; imunomicroscopie electronică în neuroni dopaminergici de șobolan, VMAT2 somatodendritic în compartimente tubuloveziculare și alte organite. Nu se afirmă că toate soma au vezicule sinaptice abundente. Surse: [pmc.ncbi.nlm.nih.gov](https://pmc.ncbi.nlm.nih.gov/articles/PMC6579002/).

19. **332 / B — key-conflict.** Tilley 1975: rezumat integral citit, activitate antigenică A/B în fracții glicolipidice din ser uman. Nu se generalizează la concentrații identice în toate persoanele; explicația nu confundă antigenele cu anticorpii. Surse: [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/1114783/); Manual PDF 333–334 / tipărit 325–326; sangele.html.

20. **333 / A — key-qualification.** Sistemul enteric periferic conține interneuroni. Studiul cu trasare DiI pe colon uman și imunohistochimie confirmă interneuroni ascendenți/descendenți; rezumat integral citit. Surse: [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/32839997/); Manual PDF 233 / tipărit 226; caseta limitează didactic interneuronii la SNC.

21. **336, 350 / 336C, 350A — generalization.** Distribuția nodulilor și rolul lor în filtrarea limfei sunt descrise la nivel de schemă; nu se afirmă prezența unui nodul în fiecare țesut sau organ. Surse: sistemul_limfatic_si_imun.html; manual PDF 383–384 / tipărit 375–376.

22. **338 / D — key-conflict.** Mioglobina poate lega CO. Depozitul structural 5CMV și rezumatul studiului Barends 2015 descriu complexul și fotodisocierea legăturii Fe–CO; aceasta este dovadă biochimică, nu o măsurare clinică a rolului CO. Surse: [www.rcsb.org](https://www.rcsb.org/structure/5CMV); [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/26359336/).

23. **338 / E — qualification.** Insulina este hormonul hipoglicemiant principal în schema manualului; formularea nu exclude influențe indirecte ale altor hormoni. Surse: sistemul_endocrin.html; manual PDF 310–311 / tipărit 303–304.

24. **345 / A — key-ambiguity.** „Left lymphatic duct” apare ca sinonim al ductului toracic în introducerea unui raport de caz primar; sinonimia nu face fals drenajul jumătății superioare stângi. Citit pasajul relevant, nu folosite alte afirmații embriologice din articol. Surse: [pmc.ncbi.nlm.nih.gov](https://pmc.ncbi.nlm.nih.gov/articles/PMC4855420/); Manual PDF 383–384 / tipărit 375–376.

25. **346 / A — key-conflict.** Secreția tubulară proximală de medicamente este reală. Studiu NPT4: rezumat și legende fig 3/4 citite, imunolocalizare în rinichi uman și transport medicamentos în ovocite Xenopus. Nu este studiu clinic de clearance. Surse: [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/20810651/).

26. **346 / C — key-qualification.** Neumann/Rector 1976: rezumat citit, perfuzie proximală la șobolan și componentă pasivă a reabsorbției NaCl. Nu toate etapele reabsorbției sunt transport activ direct. Surse: [www.jci.org](https://www.jci.org/articles/view/108563).

27. **346 / D — key-conflict.** Flessner 1993: rezumat citit, segmente descendente subțiri izolate de la șobolan/chinchilla; secreție pasivă NH3/NH4 sub gradiente adecvate. Nu se extrapolează fluxul cantitativ la om. Surse: [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/8456952/).

28. **348 / D, E — key-qualification.** D: studiu in vitro pe sânge de la 25 voluntari arată efecte ale concentrației albuminei asupra coagulării; E: studii cu plasmă umană, macrofage și modele animale arată modularea PGE2/răspunsului imun. Citite rezumatele și pasajele de rezultate descrise în raport; albumina nu este imunoglobulină sau factor clasic de coagulare. Surse: [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/28800610/); [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/24728410/); [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/28859868/).

29. **351 / C — manual-discrepancy.** 11 cartilaje este formularea manualului, față de 9 în nomenclatura NLM. În această întrebare oricum este descriere structurală, nu rol. Nicio corectare a numărului tipărit. Surse: [meshb-prev.nlm.nih.gov](https://meshb-prev.nlm.nih.gov/record/ui?ui=D007817); Manual PDF 411 / tipărit 403.

30. **352 / E — key-ambiguity.** „Leagă” nu precizează sensul. Continuitatea capilare–venule–vene este reală, cheia BD este păstrată. Surse: sistemul_cardiovascular.html; manual capitol15.

31. **353, 365 / 353A, 353C, 353D, 365E — key-conflict.** Carotidele și corpusculii aortici răspund la CO2/H+. Dahan 2007: rezumat integral,3 oameni după rezecție carotidiană bilaterală; Lahiri 1981: rezumat integral,35 pisici. Recepția periferică a O2 și integrarea centrală se disting; „monitorizează” nu specifică direct/indirect. Surse: [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/17676946/); [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/7263424/); Manual PDF 419 / tipărit 411.

32. **355 / E — qualification.** Absorbția colonică privește unele vitamine; nu este generalizată la toate vitaminele ori prezentată ca loc predominant de absorbție. Surse: sistemul_digestiv.html; manual PDF 445–446 / tipărit 437–438.

33. **357, 377 / 357B, 357C, 377C, 377D — timing-qualification.** Zilele și durata luteală sunt modelul didactic orientativ; distinse fazele uterine/ovariene și sprijinul corpului galben prin hCG în sarcina timpurie. Surse: sistemul_reproducator_feminin.html; manual PDF 560–563 / tipărit 552–555.

34. **362, 376 / 362E, 376E — key-qualification.** Conexiunile lombare ascendente aduc și drenaj abdominal sistemului azygos. Studiu pe 15 cadavre/30 disecții: rezumat citit și pasaj introductiv; tributare musculare și variații. Nu rezultă că fiecare mușchi abdominal sau respirator are exclusiv acest traseu. Surse: [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/42415736/); Manual cardiovascular PDF 365–367 / tipărit 357–359.

35. **364 / E — anatomical-qualification.** Bariera Sertoli separă compartimentele epiteliului seminifer; nu izolează întregul tub de orice schimb sanguin. Surse: sistemul_reproducator_masculin.html; manual PDF 538–540 / tipărit 530–532.

36. **366 / D — clinical-qualification.** Anemia se referă la hemoglobină; numărul eritrocitar nu scade obligatoriu în toate formele. Studiu de discriminare IDA/β-talasemie: rezumat citit, număr eritrocitar mai mare în β-TT decât în IDA; fără recomandări diagnostice în explicație. Surse: [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/28811791/); Manual PDF 337 / tipărit 329.

37. **368 / C — species-qualification.** Studiul ACTH: rezumat integral citit, lipoliză la șoarece dar lipsa răspunsului direct în țesutul adipos uman testat și lipsa receptorului detectabil. Enumerarea didactică este calificată fără schimbarea cheiiC. Surse: [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/12925881/); sistemul_endocrin.html.

38. **374 / E — key-conflict.** Aster 1966: citite primele trei pagini alePDF, metode 51Cr și rezultate pentru distribuția plachetelor la oameni; splina constituie un compartiment plachetar real. Nu se declară lectură integrală a articolului. Surse: [www.jci.org](https://www.jci.org/articles/view/105380).

39. **375 / C — qualification.** Fair/Cordonnier 1978: rezumat citit, pH mediu 7,31 în secreția prostatică normală umană exprimată,8,34 în infecție. Nu se afirmă pH invariabil și nu se transferă valorile canine omului. Surse: [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/32404/); Manual PDF 541 / tipărit 533.

40. **378 / E — hemodynamic-qualification.** Îngustarea crește rezistența; la debit dat crește gradientul necesar. Se distinge de scăderea locală de presiune în aval de stenoză. Surse: sistemul_cardiovascular.html.

41. **381 / A — support-qualification.** Ligamentul larg contribuie la raporturi/fixare; susținerea mecanică nu este redusă la acest pliu peritoneal. Surse: sistemul_reproducator_feminin.html; manual capitol23.

42. **382 / B — terminology-resolved.** Manualul distinge explicit compartimentul posterior vitros de camera posterioară cu umoare apoasă. Ambele camere apoase aparțin compartimentului anterior; explicația se bazează pe figura și textul citite. Surse: Manual PDF 280–281 / tipărit 273–274.

43. **384 / D — key-qualification.** Wolf 1998: rezumat integral citit. Imunoanalize, imunohistochimie și hibridizare in situ arată kalicreină tisulară, serin-proteinază, în glande salivare umane și salivă. Nu este dovadă că saliva este sediul principal al digestiei proteinelor alimentare. Surse: [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/9826127/).

44. **385 / B — key-conflict.** Receptori presinaptici există. Marchi 1990: rezumat integral citit, sinaptozomi din neocortex uman, autoreceptori muscarinici care inhibă eliberarea ACh. Surse: [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/2207644/).

45. **385, 387, 389 / 385E, 387D, 387E, 389E — mechanistic-qualification.** Se disting lactatul de acidul nedisociat, citosolul de organitele beta-oxidării, efectele glucocorticoide periferice de inducția proteinelor hepatice, intrarea secundar activă a glucozei renale de ieșirea facilitată. Surse: tesutul_muscular.html; metabolism_si_nutritie.html; sistemul_renal_complet.html; manual PDF 184 / tipărit 177, PDF 471–475 / tipărit 463–467, PDF 499–502 / tipărit 491–494.

46. **389 / B — manual-qualification.** Absorbția gastrică redusă a glucozei este afirmația explicită a manualului, calificată prin predominanța absorbției intestinale. Nu a fost găsit/citit un studiu primar specific și nu s-a inventat o contradicție. Surse: sistemul_digestiv.html; manual PDF 440–441 / tipărit 432–433.

47. **390 / D — key-qualification.** ACTH influențează indirect metabolismul prin corticosuprarenală, însă creșterea caracteristică a ratei metabolice bazale este legată de axa TSH–T3/T4. Cheia BCDE rămâne neschimbată. Surse: sistemul_endocrin.html; manual PDF 306–309 / tipărit 299–302.

48. **391 / A, C, D — bone-qualification.** PTH stimulează indirect osteoclastele; acestea resorb și modelează osul fără a depune matrice nouă. Estrogenii influențează supraviețuirea osteoclastelor: rezumat al studiului pe osteoclaste purificate citit, fără extrapolare la măsurători clinice umane. Surse: [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/9254647/); Manual PDF 127–128 / tipărit 120–121.

49. **392 / A — qualification.** LCR participă la mediul nutritiv, fără a înlocui aportul sanguin principal. Surse: Manual PDF 256,258 / tipărit 249,251.

50. **394 / C, D, E — key-qualification.** Clasificarea funcțiilor principale nu exclude rețelele distribuite. C: chiar figura manualului include memorie vizuală temporală; D: rezumate fMRI/localizare sonoră și studiu de leziune prefrontală citite; E: rezumat studiu 144 pacienți cu AVC și deficit executiv după leziuni insulare. Nu se identifică „gândirea” cu o singură sarcină experimentală. Surse: [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/18364040/); [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/2598034/); [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/29248158/); Manual PDF 257 / tipărit 250.

51. **397 / E — causality-qualification.** Excesul T3/T4 este consecința stimulării autoimune în Graves, nu cauza primară a bolii. Surse: sistemul_endocrin.html; manual capitol13.

52. **398, 399 / 398D, 399B, 399C — generalization.** Filtrarea reține majoritatea proteinelor, nu absolut toate; hormonii hepatici au funcții reale, fără cuantificare universală „extrem de mici”; sângele sinusoidal este amestec portal+arterial. Surse: sistemul_renal_complet.html; sistemul_digestiv.html; sistemul_endocrin.html.

## Validarea finală

- 100 numere consecutive 301–400, fără dubluri sau lipsuri; `sourceNumber` și `sourceChapter` corecte.
- 500 variante în ordinea A–E și 500 explicații substanțiale, fără substituenți sau șabloane generice.
- 100 potriviri exacte cu fixture-ul și extracția baremului; niciun set ajustat după știință.
- 15 pagini de întrebări și toate continuările verificate în metadata; pagina 291 pentru cheie.
- Toate 100 `lessonUrl` trimit la fișier și rută existentă; `topicId` corespunde rutei.
- Validare JSON și `git diff --check` fără erori. Aceste verificări mecanice nu înlocuiesc cele două lecturi vizuale/editoriale declarate mai sus.

SHA-256 al draftului stabil: `5a82f44c109c76404263998af48672ef3feaacc9f43b22dc314edbf66a741174`.
