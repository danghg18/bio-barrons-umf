(function(){
const STORAGE_KEY='reproducator_feminin_quiz_v1';
const QUESTIONS=[
{id:1,original:69,topic:"Gonada feminină",text:"Care dintre afirmațiile privind funcțiile gonadei feminine sunt adevărate?",options:{A:"produce oocite",B:"secretă progesteron",C:"secretă GnRH, hormon sterolic sintetizat din colesterol",D:"conține numeroase grupuri de celule ce formează foliculi",E:"se află sub controlul hormonilor tropi: foliculostimulant, luteinizant și melatonină"},correct:["A","B"]},
{id:2,original:70,topic:"Ovar, uter, vagin",text:"Selectați afirmațiile corecte:",options:{A:"ovarul este susținut în cavitatea pelviană de ligamentul ovarian și de ligamentul suspensor",B:"ovarul se leagă de uter prin ligamentul suspensor",C:"dimensiunile ovarului sunt de aproximativ 2,5 cm lungime și 5 cm lățime",D:"vaginul este localizat posterior de uretră",E:"uterul este localizat deasupra vaginului și a vezicii urinare"},correct:["A","D","E"]},
{id:3,original:71,topic:"Funcții",text:"Care dintre afirmațiile privind funcțiile sistemului reproducător feminin sunt corecte?",options:{A:"uterul are dimensiuni mărite considerabil în timpul sarcinii",B:"trompa uterină transportă zigotul spre uter",C:"vaginul elimină mucoasa endometrială în timpul menstruației",D:"uterul asigură protecția mecanică a fătului",E:"fimbriile sunt prelungiri spre ovar, cu originea în infundibul"},correct:["B","C","D"]},
{id:4,original:72,topic:"Ovare",text:"Ovarele au următoarele caracteristici funcționale:",options:{A:"sunt situate în cavitatea pelviană",B:"sunt glande pereche",C:"sunt controlate de hormoni tropi ai hipofizei anterioare",D:"produc gameți feminini",E:"secretă hormoni sexuali feminini"},correct:["C","D","E"]},
{id:5,original:73,topic:"FSH",text:"Următoarele efecte aparțin FSH-ului:",options:{A:"stimulează creșterea și maturarea câte unui folicul pe lună",B:"stimulează ovulația",C:"stimulează producția de estrogeni",D:"stimulează secreția de estrogeni și progesteron de către corpul luteal",E:"îngroașă mucoasa uterului"},correct:["A","C"]},
{id:6,original:74,topic:"LH",text:"LH-ul stimulează:",options:{A:"producția de progesteron",B:"ovulația, care se petrece în ziua a 16-a a ciclului menstrual",C:"foliculul în curs de dezvoltare să producă hormoni",D:"creșterea foliculilor ovarieni",E:"formarea corpului galben din foliculul ovarian"},correct:["A","C","E"]},
{id:7,original:75,topic:"Uter",text:"Alegeți afirmațiile false privitoare la uter:",options:{A:"este un organ cavitar",B:"permite inserarea vaginului la nivelul corpului uterin",C:"este localizat în porțiunea anterioară a cavității pelvine",D:"este interpus între trompele uterine și vagin",E:"secretă estrogeni și progesteron"},correct:["B","E"]},
{id:8,original:76,topic:"Corpul galben",text:"Alegeți afirmațiile corecte privitoare la corpul galben:",options:{A:"involuează dacă fecundația nu are loc",B:"secretă progesteron",C:"formarea lui este stimulată de LH",D:"secretă estrogen",E:"degenerează dacă fecundația se produce"},correct:["A","B","C","D"]},
{id:9,original:77,topic:"Trompe uterine",text:"Trompele uterine:",options:{A:"spre ovare au formă de pâlnie, numită ampulă",B:"măsoară fiecare, aproximativ 12,5 cm lungime",C:"se deschid în cavitatea uterină",D:"se împart în trei regiuni, dinspre uter: istm, ampulă și infundibul",E:"hrănesc fătul în timpul dezvoltării sale"},correct:["B","C","D"]},
{id:10,original:78,topic:"Uter",text:"Afirmațiile adevărate referitoare la structura uterului sunt:",options:{A:"endometrul este stratul intern al peretelui uterin",B:"stratul funcțional al uterului este perimetrul",C:"miometrul este compus dintr-un strat gros de mușchi striat",D:"perimetrul se continuă cu mezoteliul ligamentului larg",E:"stratul bazal al endometrului asigură regenerarea stratului funcțional după menstruație"},correct:["A","D"]},
{id:11,original:79,topic:"Trompe uterine",text:"Selectați afirmațiile corecte despre trompele uterine:",options:{A:"sunt situate la nivelul marginii superioare a ligamentului larg al uterului",B:"ampula se găsește distal de infundibul",C:"istmul se unește cu peretele uterin",D:"prezintă musculatură striată la nivelul căreia există contracții peristaltice",E:"în segmentul situat proximal de ovar, asigură degenerarea ovulelor nefecundate"},correct:["A","C"]},
{id:12,original:80,topic:"Raporturi anatomice",text:"Următoarele raporturi directe sunt adevărate:",options:{A:"ligamentul ovarian se găsește medial de ovar",B:"ligamentul suspensor este situat lateral de ovar",C:"ureteral este situat lateral de rect",D:"uterul este situat posterior de simfiza pubiană",E:"istmul uterin este situat superior de vagin"},correct:["A","B"]},
{id:13,original:81,topic:"Vagin",text:"Despre vagin sunt adevărate următoarele afirmații:",options:{A:"în structura lui conține doar mușchi netezi",B:"fornixul are raport direct cu colul uterin",C:"prin el se elimină endometrul necrozat la menstruație",D:"în structura lui există și țesut fibros",E:"musculatura netedă este dispusă într-un singur strat"},correct:["B","C","D"]},
{id:14,original:82,topic:"Ovar",text:"Despre funcția ovarelor sunt adevărate următoarele afirmații:",options:{A:"în prima jumătate a ciclului menstrual, secretă predominant estrogeni",B:"prezintă corticala la exterior și medulara la interior",C:"prin producția de estrogeni inhibă producția de LH",D:"în a doua jumătate a ciclului menstrual secretă predominant progesteron",E:"corpul galben, format în medulară, secretă estrogeni și progesteron"},correct:["A","D"]},
{id:15,original:83,topic:"Ovogeneză",text:"Despre oogeneză sunt adevărate următoarele afirmații:",options:{A:"transformarea oocitului primar în cel secundar are loc la pubertate",B:"oocitul primar este prezent la naștere în ovar",C:"al doilea globul polar se formează doar în prezența spermatozoizilor",D:"oocitul primar se găsește într-o cavitate plină cu lichid numită antru",E:"corpul galben rămâne activ aproximativ 12 zile"},correct:["A","B","C"]},
{id:16,original:84,topic:"Ovare",text:"Următoarele procese au loc la nivelul ovarelor:",options:{A:"LH determină ruperea foliculului matur",B:"foliculul rezidual se transformă în corp galben",C:"corpul alb degenerează în corpul galben",D:"în faza secretorie se secretă nutrienți pentru hrănirea embrionului",E:"corpul galben este stimulat de gonadotropina corionică"},correct:["A","B","E"]},
{id:17,original:85,topic:"Glanda mamară",text:"Despre glanda mamară sunt adevărate următoarele afirmații:",options:{A:"se găsește pe fața anterioară a toracelui",B:"secretă lapte sub controlul oxitocinei",C:"posterior de ea se găsește fascia superficială a mușchiului pectoral mare",D:"este o glandă ce conține glande alveolare și ducte",E:"este formată din lobi ce se reunesc la nivelul mamelonului"},correct:["A","C","D","E"]},
{id:18,original:86,topic:"Afirmații mixte",text:"Selectați afirmațiile corecte:",options:{A:"ovarul prezintă 3 ligamente și uterul 2 ligamente",B:"scăderea nivelului sanguin al estrogenilor și al progesteronului induce menstruația",C:"glandele Bartholin și Skene sunt glande exocrine situate la nivelul organelor genitale externe",D:"secreția lactată este determinată de un hormon adenohipofizar",E:"conțin mai mulți lobi alcătuiți din glande apocrine"},correct:["B","C","D","E"]},
{id:19,original:87,topic:"Fecundație",text:"Despre fecundație sunt adevărate următoarele afirmații:",options:{A:"are loc în treimea internă a trompei uterine",B:"determină persistența corpului galben care continuă să secrete estrogeni și progesteron încă 3 luni",C:"este urmată, după 5 zile de la producere, de implantarea blastocistului în endometru",D:"blastocistul ajunge în uter la 4-5 zile după ovulație",E:"morula rezultă printr-un proces de segmentare a zigotului"},correct:["B","C"]},
{id:20,original:88,topic:"Gonade feminine",text:"Selectați afirmațiile corecte referitoare la funcțiile gonadelor feminine:",options:{A:"produc gameți feminini",B:"sunt situate retroperitoneal, la nivelul cavității pelviene",C:"secretă hormoni sexuali feminini",D:"sunt organe nepereche care produc ovule",E:"sunt susținute de ligamentul ovarian și de ligamentul suspensor"},correct:["A","C"]},
{id:21,original:89,topic:"Peretele uterin",text:"Peretele uterin este format din:",options:{A:"endometru - al cărui strat bazal se elimină în timpul menstruației",B:"perimetru - tunica musculară a uterului",C:"miometru - alcătuit din fibre musculare netede",D:"endometru - alcătuit din două straturi: funcțional și bazal",E:"endometru - tunica seroasă a uterului"},correct:["C","D"]},
{id:22,original:90,topic:"Glande mamare",text:"Selectați afirmațiile corecte referitoare la glandele mamare:",options:{A:"sunt glande de tip alveolar",B:"secretă lapte sub acțiunea oxitocinei",C:"ejecția laptelui are loc sub acțiunea prolactinei",D:"canalele alveolare se găsesc în partea anterioară a glandei mamare",E:"secreția glandei mamare este stimulată prin actul suptului"},correct:["A","D","E"]},
{id:23,original:91,topic:"Uter",text:"Uterul:",options:{A:"comunică lateral cu trompele uterine",B:"este un organ cavitar median, situat în regiunea posterioară a cavității pelviene",C:"comunică cu vaginul prin orificiul extern al colului uterin",D:"protejează și hrănește fătul în timpul dezvoltării sale",E:"protejează deschiderea vaginului și a uretrei"},correct:["A","C","D"]},
{id:24,original:92,topic:"Ciclu menstrual",text:"Selectați afirmațiile corecte referitoare la ciclul menstrual:",options:{A:"în faza proliferativă are loc îngroșarea endometrului",B:"în ziua a 14-a are loc ovulația sub acțiunea exclusivă a FSH-ului",C:"în faza secretorie, corpul galben secretă progesteron și cantități mici de estrogeni",D:"în faza menstruală este eliminat stratul funcțional al miometrului",E:"are, de obicei, o durată de 28 de zile"},correct:["A","C","E"]},
{id:25,original:93,topic:"Oogeneză",text:"În timpul oogenezei:",options:{A:"prin prima diviziune meiotică se formează oocitul secundar și un globul polar",B:"oocitul secundar, prin a doua diviziune meiotică, conduce la formarea unui ovul",C:"după pubertate, din oogonie se formează prin mitoză oocitul primar",D:"ambele diviziuni meiotice conduc și la formarea de globuli polari haploizi",E:"oocitul secundar părăsește ovarul prin ovulație"},correct:["A","B","D","E"]},
{id:26,original:94,topic:"Estrogeni",text:"Hormonii estrogeni:",options:{A:"sunt sintetizați de foliculii ovarieni",B:"inhibă secreția hipotalamică de FSH",C:"stimulează dezvoltarea caracterelor sexuale feminine",D:"intervin în faza proliferativă a ciclului menstrual",E:"stimulează creșterea foliculilor ovarieni"},correct:["A","C","D"]},
{id:27,original:95,topic:"Fecundație și implantare",text:"Selectați afirmațiile corecte:",options:{A:"în timpul capacitației, membrana spermatozoidului este fragilizată, permițând eliberarea enzimelor acrozomale",B:"placenta se formează prin unirea vilozităților coriale cu țesuturile uterine",C:"prin fecundarea ovulului se formează zigotul haploid",D:"formarea zigotului are loc la nivelul trompelor uterine",E:"oocitul secundar își finalizează meioza și eliberează globulul polar înainte de fecundație"},correct:["A","B","D"]},
{id:28,original:96,topic:"Corp galben",text:"Corpul galben ovarian:",options:{A:"involuează în prezența hCG",B:"se formează din celulele foliculare reziduale sub acțiunea LH",C:"dacă nu are loc fecundația, timp de aproximativ 12 zile produce progesteron și estrogeni",D:"involuează și se transformă în corp alb dacă fecundația a avut loc",E:"prin hormonii secretați, determină eliminarea mucoasei endometriale la aproximativ 5 zile după fecundație"},correct:["B","C"]},
{id:29,original:97,topic:"Afirmații corecte",text:"Selectați afirmațiile corecte:",options:{A:"volumul uterin nu se modifică în timpul sarcinii",B:"infundibulul trompelor uterine prezintă fimbrii dispuse în vecinătatea ovarului",C:"clitorisul este un organ erectil feminin",D:"în timpul ciclului menstrual, foliculul vezicular matur se dezvoltă, devenind folicul primar",E:"la 12 zile după ovulație, blastocistul ajunge în cavitatea uterină și, ulterior, se implantează"},correct:["B","C"]},
{id:30,original:98,topic:"Sistem reproducător feminin",text:"Despre sistemul reproducător feminin sunt adevărate următoarele afirmații:",options:{A:"produce, înmagazinează, hrănește și transportă ovulele",B:"unele organe ale tractului genital feminin sunt cuprinse într-un pliu al peritoneului numit ligament larg al uterului",C:"trompele uterine se deschid în cavitatea pelviană, medial de ovare",D:"ligamentul larg al uterului se fixează pe pereții mediali ai planșeului pelvian",E:"ovarele sunt responsabile pentru producerea gameților și a hormonilor"},correct:["A","B","E"]},
{id:31,original:99,topic:"Ovare",text:"Despre ovare se pot afirma următoarele:",options:{A:"sunt dispuse intraperitoneal",B:"prezintă ca elemente de susținere ligamentul ovarian și ligamentul suspensor",C:"conține grupuri de celule numite foliculi",D:"eliberează oocitul secundar prin ovulație",E:"după menstruație, foliculul devine corp albicans"},correct:["B","C","D"]},
{id:32,original:100,topic:"Trompe uterine",text:"Selectați afirmațiile corecte referitoare la trompele uterine:",options:{A:"sunt situate de-a lungul marginii superioare a ligamentului larg",B:"capetele din apropierea ovarului poartă numele de infundibul",C:"se deschid în cavitatea uterină printr-un segment scurt numit istm",D:"epiteliul regiunii lor ampulare prezintă cili",E:"contracțiile peristaltice ale musculaturii striate ampulare favorizează transportul ovulului"},correct:["A","B","C","D"]},
{id:33,original:101,topic:"Uter",text:"Uterul:",options:{A:"este situat în porțiunea posterioară a cavității pelviene, deasupra vezicii urinare",B:"este susținut prin ligamentele largi",C:"prezintă regiunea fundului uterin, locul de unire cu trompele uterine",D:"prezintă istmul în porțiunea inferioară",E:"își păstrează forma specifică de pară pe parcursul sarcinii"},correct:["B","C","D"]},
{id:34,original:102,topic:"Funcții organe",text:"Alegeți funcțiile îndeplinite de organele sistemului reproducător feminin:",options:{A:"ovarul este locul fecundației",B:"trompa lui Falloppio transportă zigotul în diferite faze de dezvoltare",C:"uterul hrănește fătul în timpul dezvoltării",D:"vaginul conduce fătul în timpul nașterii",E:"labiile mari protejează deschiderea vaginului și a uretrei"},correct:["B","C","D"]},
{id:35,original:103,topic:"Organe genitale externe",text:"Alegeți afirmațiile corecte despre organele genitale externe feminine:",options:{A:"sunt cunoscute sub denumirea generică de vulvă",B:"glandele Bartholin și Skene lubrifiază vaginul",C:"vestibulul vaginal este delimitat de labiile mari",D:"clitorisul este situat anterior față de orificiul uretral",E:"mons pubis este situat în spatele simfizei pubiene"},correct:["A","B","D"]},
{id:36,original:104,topic:"Glande mamare",text:"Glandele mamare:",options:{A:"au o structură lobulară formată din glande endocrine",B:"sunt glande de tip alveolar",C:"au rol în secreția laptelui, proces numit lactație",D:"secreția lor este controlată de prolactină",E:"oxitocina controlează expulzia laptelui de la nivelul acestora"},correct:["B","C","D","E"]},
{id:37,original:105,topic:"Ciclu menstrual",text:"Selectați afirmațiile corecte referitoare la ciclul menstrual:",options:{A:"dacă acesta durează 28 de zile, ovulația are loc aproximativ în ziua 14",B:"nivelul crescut al estrogenilor și progesteronului din timpul fazei menstruale determină regenerarea endometrului",C:"în timpul fazei proliferative, corpul galben secretă progesteron și cantități mici de estrogen",D:"corpul galben involuează în absența fecundației",E:"menstruația marchează prima zi a unui nou ciclu menstrual"},correct:["A","D","E"]},
{id:38,original:106,topic:"Oogeneză",text:"Oogeneza:",options:{A:"reprezintă procesul prin care se formează ovulele în ovar",B:"începe imediat după naștere",C:"celulele germinale primitive poartă numele de oogonii",D:"oocitele primare formează împreună cu straturile celulare înconjurătoare foliculii primari",E:"la pubertate, ovarele conțin aproximativ 75.000 de foliculi"},correct:["A","C","D","E"]},
{id:39,original:107,topic:"Oogeneză",text:"Selectați afirmațiile corecte:",options:{A:"procesul de oogeneză începe în timpul vieții intrauterine",B:"foliculii primari sunt prezenți în ovare încă de la naștere",C:"imediat după naștere, hipotalamusul începe secreția de GnRH",D:"LH-ul stimulează creșterea și maturarea unui folicul pe lună",E:"FSH-ul stimulează producerea de estrogen la nivelul foliculului în curs de dezvoltare"},correct:["A","B","E"]},
{id:40,original:108,topic:"Hormoni",text:"Alegeți afirmațiile corecte despre hormonii cu acțiune asupra sistemului reproducător feminin:",options:{A:"GnRH stimulează producerea de FSH și LH",B:"FSH-ul stimulează creșterea foliculului ovarian și producția de estrogeni",C:"LH-ul stimulează ovulația",D:"prolactina inhibă secreția lactată",E:"oxitocina este sintetizată de neurohipofiză"},correct:["A","B","C"]},
{id:41,original:109,topic:"Fecundație",text:"Despre fecundație sunt adevărate următoarele afirmații:",options:{A:"rezultă ovul fecundat, cu 46 de cromozomi",B:"se produce în urma eliberării de enzime acrozomale ale unui număr mare de spermatozoizi",C:"eliberarea enzimelor din acrozom are loc în urma procesului de capacitație",D:"fecundația are loc la nivelul uterului",E:"ovulul fecundat poartă numele de zigot"},correct:["A","B","C","E"]},
{id:42,original:110,topic:"După fecundație",text:"Selectați fenomenele care au loc după fecundație:",options:{A:"în urma procesului de segmentare se formează morula",B:"morula devine o structură celulară plină cu lichid, numită blastocist",C:"blastocistul ajunge în cavitatea uterină imediat după fecundație",D:"fixarea blastocistului în endometru poartă numele de implantare",E:"corpul galben din ovar continuă să producă hormoni"},correct:["A","B","D","E"]}
];
const REASONS={
1:"Gonada feminină are funcție gametogenă și endocrină: produce oocite și secretă progesteron. GnRH este hipotalamic, iar melatonina nu este hormon trop gonadal.",
2:"Ovarul este susținut de ligamentul ovarian și suspensor, vaginul este posterior de uretră, iar uterul se află deasupra vaginului și vezicii urinare. Ligamentul suspensor nu leagă ovarul de uter, iar dimensiunile sunt inversate.",
3:"Trompa transportă zigotul, vaginul elimină materialul menstrual, iar uterul protejează mecanic fătul. Mărirea uterului și fimbriile sunt caracteristici anatomice, nu funcțiile cerute de item.",
4:"Ca funcții, ovarele sunt controlate de FSH/LH, produc gameți feminini și secretă hormoni sexuali feminini. Localizarea și faptul că sunt pereche sunt caracteristici anatomice.",
5:"FSH stimulează creșterea foliculului ovarian și producția de estrogen. Ovulația și corpul galben sunt dependente mai ales de LH, iar îngroșarea endometrului este efect estrogenic.",
6:"LH susține producția de progesteron, stimulează foliculul să producă hormoni și determină transformarea foliculului în corp galben. Ovulația este în jurul zilei 14, nu 16, iar creșterea foliculului este rol FSH.",
7:"Itemul cere afirmațiile false: vaginul se inseră la nivelul colului, nu al corpului uterin, iar estrogenii și progesteronul sunt secretați de ovare/corp galben, nu de uter.",
8:"Corpul galben se formează sub acțiunea LH, secretă progesteron și estrogen, apoi involuează dacă nu are loc fecundația. Dacă fecundația are loc, hCG îl menține temporar.",
9:"Trompele au aproximativ 12,5 cm, se deschid în cavitatea uterină și includ istm, ampulă, infundibul. Capătul în formă de pâlnie este infundibulul, iar hrănirea fătului ține de uter/placentă.",
10:"Endometrul este stratul intern, iar perimetrul se continuă cu mezoteliul ligamentului larg. Stratul funcțional aparține endometrului, miometrul are mușchi neted, iar baremul acestei grile marchează A și D.",
11:"Trompele merg pe marginea superioară a ligamentului larg, iar istmul se unește cu peretele uterin. Ampula este proximală de infundibul, peristaltismul e prin mușchi neted, nu striat.",
12:"Ligamentul ovarian este medial, iar ligamentul suspensor este lateral față de ovar. Celelalte raporturi din item nu corespund formulei cerute de barem.",
13:"Fornixul are raport cu colul uterin, vaginul elimină endometrul necrozat la menstruație și are țesut fibros. Nu conține doar mușchi neted, iar musculatura nu este într-un singur strat.",
14:"În prima jumătate predomină estrogenii, iar în a doua jumătate corpul galben secretă predominant progesteron. Corticala/medulara este structură, estrogenii inhibă FSH, iar corpul galben nu se formează în medulară.",
15:"Oocitul primar este prezent la naștere, trecerea spre oocit secundar începe la pubertate, iar al doilea globul polar apare doar dacă are loc fecundația. Antrul aparține foliculului matur, nu oocitului primar.",
16:"La nivel ovarian, LH rupe foliculul matur, resturile foliculare formează corpul galben, iar hCG poate menține corpul galben după fecundație. Nutrienții fazei secretorii sunt secretați de endometru.",
17:"Glanda mamară este anterioară toracic, are ducte și glande alveolare, iar lobii converg spre mamelon. Secreția laptelui este controlată de prolactină, nu de oxitocină.",
18:"Menstruația apare prin scăderea estrogenilor/progesteronului; Bartholin și Skene sunt glande exocrine; lactația depinde de prolactină, un hormon adenohipofizar; glanda mamară are lobi cu glande apocrine.",
19:"Fecundația menține corpul galben prin hCG și este urmată de implantarea blastocistului. Localizarea, momentul ajungerii în uter și segmentarea morulei nu sunt cele din baremul acestui item.",
20:"Funcțiile gonadelor feminine sunt producerea gameților și secreția hormonilor sexuali feminini. Localizarea și susținerea sunt caracteristici anatomice, iar ovarele sunt organe pereche.",
21:"Peretele uterin include miometru cu mușchi neted și endometru cu strat funcțional și bazal. Perimetrul este seroasa, iar stratul bazal nu se elimină la menstruație.",
22:"Glandele mamare sunt alveolare, au canale/ducte anterioare și secreția este menținută de supt. Prolactina stimulează secreția laptelui, iar oxitocina controlează ejecția.",
23:"Uterul comunică lateral cu trompele, inferior cu vaginul prin col și protejează/hrănește fătul. Este anterior în pelvis, iar protecția deschiderilor externe ține de labiile mici.",
24:"Faza proliferativă îngroașă endometrul, faza secretorie implică progesteron și puțin estrogen din corpul galben, iar ciclul durează de obicei 28 de zile. Ovulația nu e exclusiv FSH, iar la menstruație se elimină endometru, nu miometru.",
25:"Prima meioză dă oocit secundar și globul polar, a doua poate da ovul, ambele produc globuli polari, iar oocitul secundar este ovulat. După pubertate nu se formează oocite primare noi din oogonii.",
26:"Estrogenii sunt sintetizați de foliculii ovarieni, dezvoltă caracterele sexuale feminine și susțin faza proliferativă. Nu inhibă secreția hipotalamică de FSH, iar creșterea foliculilor este efect FSH.",
27:"Capacitația permite reacția acrozomală, placenta rezultă din vilozități coriale plus țesut uterin, iar zigotul se formează în trompele uterine. Zigotul este diploid, iar meioza se finalizează după pătrunderea spermatozoidului.",
28:"Corpul galben se formează din celulele foliculare sub LH și, fără fecundație, secretă estrogen/progesteron aproximativ 12 zile. hCG îl menține, nu îl involuează, iar hormonii lui mențin endometrul.",
29:"Infundibulul are fimbrii lângă ovar, iar clitorisul este organ erectil. Uterul crește în sarcină, foliculul primar devine matur, iar blastocistul ajunge în uter mai devreme decât ziua 12.",
30:"Sistemul feminin produce și transportă ovulele, organe din tract sunt prinse în ligamentul larg, iar ovarele produc gameți și hormoni. Trompele se deschid lateral de ovare, iar ligamentul larg se fixează pe pereții laterali.",
31:"Ovarele sunt susținute de ligamentul ovarian și suspensor, conțin foliculi și eliberează oocitul secundar prin ovulație. Nu sunt nepereche/intraperitoneale în sensul itemului, iar corpul alb provine din corpul galben.",
32:"Trompele sunt pe marginea superioară a ligamentului larg, au infundibul lângă ovar, se deschid în uter prin istm și au epiteliu ciliat în ampulă. Musculatura trompei este netedă, nu striată.",
33:"Uterul este susținut de ligamentele largi, are fund uterin la unirea cu trompele și istm inferior. Este anterior în pelvis și își schimbă mult dimensiunile/forma în sarcină.",
34:"Trompa transportă zigotul, uterul hrănește fătul, iar vaginul conduce fătul la naștere. Fecundația are loc de obicei în trompă, iar protecția uretrei/vaginului este atribuită labiilor mici în tabelul lecției.",
35:"Vulva este denumirea organelor externe, Bartholin și Skene lubrifiază, iar clitorisul e anterior de orificiul uretral. Vestibulul este delimitat de labiile mici, iar mons pubis este anterior simfizei pubiene.",
36:"Glandele mamare sunt alveolare, realizează lactația, sunt controlate secretor de prolactină, iar oxitocina expulzează laptele. Nu sunt glande endocrine.",
37:"La un ciclu de 28 de zile ovulația este în jurul zilei 14; corpul galben involuează fără fecundație; menstruația este ziua 1 a ciclului. Faza menstruală are hormoni scăzuți, iar corpul galben nu aparține fazei proliferative.",
38:"Oogeneza formează ovulele în ovar, începe intrauterin, pornește de la oogonii, iar oocitele primare cu celule înconjurătoare formează foliculii primari. Nu începe după naștere.",
39:"Oogeneza începe intrauterin, foliculii primari există de la naștere, iar FSH stimulează producția de estrogen în folicul. GnRH începe la pubertate, iar FSH, nu LH, stimulează creșterea lunară a foliculului.",
40:"GnRH stimulează FSH și LH; FSH stimulează foliculul și estrogenii; LH stimulează ovulația. Prolactina stimulează lactația, iar oxitocina este eliberată de neurohipofiză.",
41:"Fecundația produce zigot diploid cu 46 cromozomi, are nevoie de enzime acrozomale după capacitație, iar ovulul fecundat se numește zigot. Locul obișnuit este trompa uterină, nu uterul.",
42:"După fecundație, segmentarea formează morula, aceasta devine blastocist, implantarea înseamnă fixarea în endometru, iar corpul galben continuă să secrete hormoni. Blastocistul nu ajunge imediat în cavitatea uterină."
};
let state=loadState();
let filterUnanswered=false;
function byId(id){return document.getElementById(id)}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]})}
function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{}}catch(e){return{}}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function sameSet(a,b){return a.length===b.length&&a.every(function(x){return b.includes(x)})}
function optionExplanation(q,letter){
  const isCorrect=q.correct.includes(letter);
  return '<div class="quiz-explanation '+(isCorrect?'ok':'bad')+'"><strong>'+(isCorrect?'Corect':'Greșit')+'.</strong> '+escapeHtml(REASONS[q.id]||'Explicația se bazează pe baremul acestei grile și pe lecția din capitol.')+'</div>';
}
function cardHtml(q){
  const saved=state[q.id]||{selected:[],submitted:false};
  const selected=saved.selected||[];
  const submitted=!!saved.submitted;
  const ok=submitted&&sameSet(selected,q.correct);
  const options=Object.keys(q.options).map(function(letter){
    let cls='quiz-option';
    if(selected.includes(letter))cls+=' selected';
    if(submitted){
      if(q.correct.includes(letter)&&selected.includes(letter))cls+=' correct';
      else if(!q.correct.includes(letter)&&selected.includes(letter))cls+=' wrong';
      else if(q.correct.includes(letter)&&!selected.includes(letter))cls+=' missed';
    }
    return '<label class="'+cls+'" data-q="'+q.id+'" data-letter="'+letter+'"><input type="checkbox" '+(selected.includes(letter)?'checked':'')+' '+(submitted?'disabled':'')+'><span class="quiz-letter">'+letter+'</span><span>'+escapeHtml(q.options[letter])+'</span>'+optionExplanation(q,letter)+'</label>';
  }).join('');
  return '<article class="quiz-card '+(submitted?'submitted':'')+'" id="female-q'+q.id+'"><div class="quiz-head"><div class="quiz-num">'+q.id+'</div><div><h3 class="quiz-title">'+escapeHtml(q.text)+'</h3><div class="quiz-topic">'+escapeHtml(q.topic)+' · original '+q.original+'</div></div></div><div class="quiz-options">'+options+'</div><div class="quiz-actions"><button class="quiz-btn" onclick="femaleQuizSubmit('+q.id+')" '+(submitted?'disabled':'')+'>Verifică</button><button class="quiz-btn secondary" onclick="femaleQuizClear('+q.id+')">Șterge</button>'+(submitted?'<span class="quiz-result '+(ok?'ok':'bad')+'">'+(ok?'Corect':'Mai verifică')+'</span>':'')+'</div><div class="quiz-key">Barem: <strong>'+q.correct.join(', ')+'</strong></div></article>';
}
function render(){
  const root=byId('femaleQuiz');
  if(!root)return;
  const list=filterUnanswered?QUESTIONS.filter(function(q){return !state[q.id]?.submitted}):QUESTIONS;
  root.innerHTML=list.map(cardHtml).join('')||'<article class="quiz-card"><strong>Ai completat toate grilele.</strong></article>';
  updateProgress();
}
function updateProgress(){
  const submitted=QUESTIONS.filter(function(q){return state[q.id]?.submitted});
  const correct=submitted.filter(function(q){return sameSet(state[q.id].selected||[],q.correct)}).length;
  const progressText=byId('femaleQuizProgressText');
  const scoreText=byId('femaleQuizScoreText');
  const progressBar=byId('femaleQuizProgressBar');
  const final=byId('femaleQuizFinal');
  if(progressText)progressText.textContent=submitted.length+' / '+QUESTIONS.length+' completate';
  if(scoreText)scoreText.textContent=correct+' corecte';
  if(progressBar)progressBar.style.width=Math.round(submitted.length/QUESTIONS.length*100)+'%';
  if(final){
    if(submitted.length===QUESTIONS.length){final.style.display='block';final.innerHTML='<h2>Rezultat final: '+correct+'/'+QUESTIONS.length+'</h2><p>'+correct+' grile corecte complet, '+(QUESTIONS.length-correct)+' de revăzut.</p>'}
    else final.style.display='none';
  }
}
document.addEventListener('change',function(e){
  const option=e.target.closest?.('.quiz-option');
  if(!option||!byId('femaleQuiz')?.contains(option))return;
  const id=option.dataset.q;
  const letter=option.dataset.letter;
  const saved=state[id]||{selected:[],submitted:false};
  if(saved.submitted)return;
  saved.selected=e.target.checked?[...new Set([...(saved.selected||[]),letter])]:(saved.selected||[]).filter(function(x){return x!==letter});
  state[id]=saved;
  saveState();
  render();
});
window.femaleQuizSubmit=function(id){
  const saved=state[id]||{selected:[],submitted:false};
  if(!saved.selected.length)return;
  saved.submitted=true;
  state[id]=saved;
  saveState();
  render();
  byId('female-q'+id)?.scrollIntoView({behavior:'smooth',block:'center'});
};
window.femaleQuizClear=function(id){delete state[id];saveState();render()};
window.femaleQuizReset=function(){if(confirm('Resetezi progresul pentru grilele de reproducător feminin?')){state={};saveState();render()}};
window.femaleQuizShowOnlyUnanswered=function(){filterUnanswered=true;render()};
window.femaleQuizShowAll=function(){filterUnanswered=false;render()};
window.renderFemaleQuiz=render;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();
