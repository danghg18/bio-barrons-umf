Recenzie independentă X1–80 — Sistemul digestiv

Recenzor: `content_bones_b`. Am citit personal toate cele 80 de enunțuri, toate cele 400 de variante A–E și toate cele 400 de explicații din draft, apoi le-am verificat prin scanuri, lecție și manual. Rezultatul este `complete`, cu două explicații corectate (62D și 79D), două note actualizate și o referință nepertinentă eliminată. Celelalte 398 de explicații rămân neschimbate după audit. Niciun enunț, text de variantă, număr, răspuns corect sau `asksFalse` nu a fost schimbat. Draftul autorului și producția nu au fost modificate; nu există commit.

Draft citit: `tmp/umf-2026/drafts/X-001-080.json`, SHA-256 `f2aebd913bde2e69f489b6c2dec5cbbcf51253be8aa8f760dd00be0e36d2f07a`. Raportul autorului a fost citit integral, dar concluziile sale au fost confruntate independent cu sursele.

Lectură vizuală independentă, integrală, a următoarelor pagini și continuări:

| PDF scan | Tipărit | Enunțuri și variante citite |
|---|---|---|
| 186 | 195 | 1–6 integral; 7 enunț, A–B |
| 187 | 196 | 7 C–E; 8–13 integral; 14 enunț, A–B |
| 188 | 197 | 14 C–E; 15–20 integral; 21 enunț, A–C |
| 189 | 198 | 21 D–E; 22–27 integral; 28 enunț, A |
| 190 | 199 | 28 B–E; 29–35 integral; 36 enunț, A–C |
| 191 | 200 | 36 D–E; 37–44 integral |
| 192 | 201 | 45–51 integral; 52 enunț, A–B |
| 193 | 202 | 52 C–E; 53–60 integral; 61 enunț, A |
| 194 | 203 | 61 B–E; 62–67 integral; 68 enunț, A–B |
| 195 | 204 | 68 C–E; 69–75 integral |
| 196 | 205 | 76–80 integral |
| 197 | 206 | Toate cele 80 de combinații din barem |

Am recitit suplimentar paginile 194 și 196 după cercetarea explicațiilor 62D și 79D. Nu revendic două lecturi vizuale independente integrale pentru această recenzie: cele două lecturi ale autorului rămân separate de lectura mea integrală și revenirea mea focalizată.

Manualul Barron's 2022: citit vizual PDF 433–449, adică tipărit 425–441, toate textele, figurile și tabelele. 433 este deschiderea capitolului; 434–435 introducerea, tunicile și cavitatea orală; 436–438 dinții, glandele salivare, esofagul și deglutiția; 439–440 stomacul și secrețiile; 441–444 digestia duodenală, enzimele, absorbția și începutul colonului; 445–446 colonul și începutul ficatului; 447–448 ficatul, bila, metabolismul și pancreasul; 449 finalul pancreasului și începutul recapitulării. Imaginile acestei recenzii sunt `tmp/umf-2026/manual/x-review-digestive-433.jpg` până la `x-review-digestive-449.jpg`.

Lecția `sistemul_digestiv.html` a fost citită integral, inclusiv tabelele și legendele. Rutele folosite sunt reale: `introducere`, `tractul-gastrointestinal`, `stomacul`, `intestinele`, `organele-anexe`. Numărul paginii PDF și cel tipărit nu au fost confundate.

Baremul exclusiv de evaluare este `tests/umf-cluj-2026-answer-key.json`, capitol X. Toate cele 80 de combinații coincid cu fixture-ul și cu pagina 197. Numai 16, 18 și 20 cer variante incorecte; toate cele trei au `asksFalse: true`. Am verificat în special indicele B₂ la 37E, HCO₃⁻ la 42A, ordinea straturilor, «doar», «exclusiv», negările, 13 cm/2,5 mm, 3000–4000 versus 300–400 ml și continuările dintre coloane/pagini. Formele tipărite defectuoase 28D «doua», 36 «corecte» repetat, 52B «principalelor celule parietale», 57E lactoză/lactază inversate, 58C «gastric inferior» și 74C/E «este secretat» sunt fidele și au fost păstrate.

Corecturile exacte sunt în cele cinci intrări `review.findings`, fiecare cu `number`, `field`, `before`, `after`, `reason`, `source`:

- 62D, `why`: vechea justificare folosea numai cercetarea biochimică din 1988, negativă pentru activitatea linguală. Am adăugat rezultatul uman din 2014: la 15 adulți, orlistatul a redus lipoliza orală pentru migdale și cocos. Rezultatele depind de aliment și metodă; nu susțin o negare absolută. Barem AC păstrat.
- 79D, `why`: originea intestinală a urobilinogenului nu exclude întoarcerea sa în bilă. Am explicat circulația enterohepatică și detectarea în bilă/fecale; lista didactică a manualului nu justifică absența categorică. Barem ABC păstrat.
- Nota 62D: actualizată cu ambele studii umane și limita interpretării.
- Nota 79D/E: actualizată cu rezerva explicită despre urobilinogen; nuanța separată privind colesterolul și sărurile biliare este păstrată.
- Nota 7, `sources`: eliminată planșa histologică de pancreas, nepertinentă pentru calea limfatică a lipidelor. Păstrate paginile 434–435 tipărite ale manualului, care documentează direct absorbția.

Am confirmat și păstrat explicațiile care semnalează limitele baremului: 7E/23B pentru absorbția limfatică; 13B pentru sensul larg al relației «între»; 14C pentru acizii grași cu lanț impar și propionat, fără generalizare la lanțurile pare; 21C/E pentru pancreasul mixt și hormonii glucoreglatori; 21D pentru clasificarea acinară; 23C pentru vitaminele liposolubile; 27A/75A pentru nucleaze; 28C pentru enzimele colonice; 33E pentru cavitatea pulpară; 41C pentru glandele Brunner; 52B pentru protecția antimicrobiană prin acid; 56E/77D pentru carboxipeptidaze; 59C pentru conduita apendicitei; 62E pentru transformările microbiene ale lipidelor; 65B pentru comparația antrului; 67E pentru proteinele endogene; 79E pentru colesterolul biliar. Explicațiile disting corect afirmațiile adevărate, dar în afara categoriei cerute (de exemplu 24D, 25B/C, 26D, 29E, 30D, 34E, 68E), de afirmațiile biologic false.

Referințe citite independent pentru incertitudini (rezumatele studiilor, iar unde disponibil, pasajele originale de rezultate/discuție; nu se pretinde lectura integrală a tuturor articolelor):

- [NCBI Gene CYMP](https://www.ncbi.nlm.nih.gov/gene/643160): adnotarea umană ca pseudogenă, pentru 4A/25E/72C.
- [Smith și colab., 1987](https://pubmed.ncbi.nlm.nih.gov/3621813/): porțiuni superficială și profundă ale parotidei, pentru 12A.
- [Sugden și colab., 1984](https://pubmed.ncbi.nlm.nih.gov/6477599/): formare de glucoză din acizi grași cu lanț impar în hepatocite de șobolan, sprijin mecanistic pentru 14C.
- [Jones și colab., 1998](https://journals.physiology.org/doi/full/10.1152/ajpendo.1998.275.5.E843): conversia propionatului marcat în glucoză la om, rezumat și rezultate, pentru 14C.
- [Digital Histology — pancreas, acinar compus](https://digitalhistology.org/tissues/epithelium/glandular/exocrine/compound/compound-9/): atlas universitar al preparatului, pentru 21D; comparat cu [definițiile unităților secretorii](https://digitalhistology.org/tissues/epithelium/glandular/exocrine/overview/overview-exocrine-1/).
- [Traber și colab., 2019](https://pubmed.ncbi.nlm.nih.gov/31495886/): studiu uman cu trasori, rolul asamblării chilomicronilor în absorbția vitaminei E, pentru 23C.
- [Love și Hewitt, 1979](https://pubmed.ncbi.nlm.nih.gov/115887/): DNaza pancreatică umană, pentru 27A/75A; [Weissmüller și colab., 2008](https://pubmed.ncbi.nlm.nih.gov/18924612/): enzime apicale epiteliale pentru nucleotide, pasajul despre CD73, fără a-l prezenta ca măsurare directă a întregii digestii alimentare.
- [Børkje și colab., 1986](https://pubmed.ncbi.nlm.nih.gov/3775257/): enzime măsurate în biopsii de colon uman, pentru 28C.
- [American Association of Endodontists](https://www.aae.org/patients/root-canal-treatment/what-is-a-root-canal/root-canal-explained/): anatomia pulpei până în rădăcini, pentru 33E.
- [Coutinho și colab., 1996](https://pubmed.ncbi.nlm.nih.gov/8771411/): IgA, IgM, componentă secretorie și lizozim în glande Brunner umane, pentru 41C.
- [Ait-Omar și colab., 2011](https://pmc.ncbi.nlm.nih.gov/articles/PMC3178286/): GLUT2 apical în anumite condiții patologice umane. 46D este păstrată deoarece explicația identifică explicit calea principală didactică, fără a pretinde exclusivitate fiziologică universală.
- [Tennant și colab., 2008](https://pmc.ncbi.nlm.nih.gov/articles/PMC2223456/): rezumat și discuție privind acidul gastric și rezistența la infecții, model experimental murin, pentru 52B.
- [IUBMB EC 3.4.17.1](https://iubmb.qmul.ac.uk/enzyme/EC3/4/17/1.html): reacția carboxipeptidazei A, pentru 24C/56E/76C/77D; [Wu și colab., 2011](https://pmc.ncbi.nlm.nih.gov/articles/PMC3162075/): hidroliza dipeptidei glicil-L-tirozină dependentă de pH, studiu mecanistic, pentru 56E.
- [CODA, 2020](https://www.nejm.org/doi/abs/10.1056/NEJMoa2014320): studiu randomizat, rezultate și discuție privind alternativa antibiotică evaluată medical, pentru 59C. Nu este transformat în recomandare clinică universală.
- [Moreau și colab., 1988](https://pubmed.ncbi.nlm.nih.gov/3169491/): lipază în homogenate de la doi donatori și biopsii fundice umane; [Kulkarni și Mattes, 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4159735/): rezumat, metode și discuție despre masticație, alimente și inhibiția lipazică la 15 adulți. Acestea fundamentează corectura 62D.
- [Devillard și colab., 2007](https://pubmed.ncbi.nlm.nih.gov/17209019/): tulpini bacteriene intestinale umane care transformă acid linoleic, pentru 62E.
- [Miner-Williams și colab., 2014](https://pubmed.ncbi.nlm.nih.gov/24398648/): proteine endogene în digesta ileală umană, pentru 67E, completat de [studiul din 2012](https://pubmed.ncbi.nlm.nih.gov/22836032/) care diferențiază proteinele din celule mucoase intacte. Nu demonstrează că toate celulele descuamate sunt digerate complet.
- [Tiruppathi și Balasubramanian, 1982](https://pubmed.ncbi.nlm.nih.gov/7126632/): lipază izolată din suc gastric uman, pentru 73A.
- [Lester și Schmid, 1964](https://www.nature.com/articles/201711a0): rezumatul cercetării cu urobilinogen marcat la șobolan; [Lester și colab., 1965](https://www.nejm.org/doi/abs/10.1056/NEJM196505062721803): pagina și introducerea studiului uman (textul integral nu a fost disponibil); [Kotal și Fevery, 1991](https://www.sciencedirect.com/science/article/abs/pii/000989819190250G): rezumatul complet al determinării urobilinogenului în bilă și fecale, pentru 79D. Ultima sursă documentează direct probele analizate; cele două articole istorice nu sunt prezentate ca fiind citite integral.
- [Xiao și colab., 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10575946/): rezumat, rezultate și discuție despre NPC1L1, transportul colesterolului și acizii biliari, pe modele celulare/murine, pentru limita mecanistică din 79E.

Unele URL-uri PubMed/PMC au returnat verificare de browser la accesul direct. În aceste cazuri am citit rezumatele și pasajele originale indexate de motorul de căutare, ori aceeași lucrare pe pagina editorului; nu am interpretat blocarea tehnică drept dovadă biologică.

Validare finală executată: 80 de numere continue, 400 A–E/why, 80 de chei identice cu fixture-ul independent, exact trei cerințe negative, toate ancorele și toate intervalele reale de pagini, metadata `review` completă, exact două schimbări de explicație și zero schimbări de enunț/opțiune/barem. Draftul autorului are în continuare hash-ul inițial. SHA-256 al copiei revizuite: `b566430b7848a576b7715148fefe189b824c6ba3456d7e1feb9b4f13bcc0079a`.
