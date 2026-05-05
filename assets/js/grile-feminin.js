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
const ANALYSIS_KEY='reproducator_feminin_analysis_v1';
const RUN_META_KEY='reproducator_feminin_run_recorded_v1';
const PAGE_SIZE=7;
let quizState=loadState();
let currentPage=1;

function byId(id){return document.getElementById(id)}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]})}
function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{}}catch(e){return{}}}
function saveState(s){localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}
function loadAnalysis(){try{const parsed=JSON.parse(localStorage.getItem(ANALYSIS_KEY)||'{}');return {topicErrors:parsed.topicErrors||{},sessions:parsed.sessions||[]}}catch(e){return{topicErrors:{},sessions:[]}}}
function saveAnalysis(a){localStorage.setItem(ANALYSIS_KEY,JSON.stringify(a))}
function isRunRecorded(){return localStorage.getItem(RUN_META_KEY)==='1'}
function setRunRecorded(v){localStorage.setItem(RUN_META_KEY,v?'1':'0')}
function sameSet(a,b){return a.length===b.length&&a.every(function(x){return b.includes(x)})}
function getOptions(q){return Object.keys(q.options).map(function(letter){return {letter:letter,text:q.options[letter]}})}
function getLessonInfo(q){
  const t=q.topic.toLowerCase();
  if(t.includes('ciclu')||t.includes('oogenez')||t.includes('fecunda')||t.includes('hormon')||t.includes('fsh')||t.includes('lh')||t.includes('estrogen')||t.includes('corp galben'))return {section:'23.3 Fiziologia reproducerii',page:'fiziologie'};
  if(t.includes('uter')||t.includes('ovar')||t.includes('tromp')||t.includes('vagin')||t.includes('gland')||t.includes('genitale')||t.includes('perete')||t.includes('raport'))return {section:'23.2 Ovarele și organele anexe',page:'organe'};
  return {section:'23.1 Introducere',page:'intro'};
}
function explanationFor(q,opt){
  const isCorrect=q.correct.includes(opt.letter);
  const verdict=isCorrect?'Corect':'Greșit';
  const status=isCorrect?'este în barem':'nu intră în barem';
  return {
    isCorrect:isCorrect,
    text:verdict+'. Varianta '+opt.letter+' („'+opt.text+'”) '+status+'. '+(REASONS[q.id]||'Verifică baremul și ideea-cheie din lecție.'),
    added:isCorrect?'':'Răspuns corect pentru grila aceasta: '+q.correct.join(', ')+'.'
  };
}
function totalPages(){return Math.ceil(QUESTIONS.length/PAGE_SIZE)}
function isQuizComplete(){return QUESTIONS.every(function(q){return quizState[q.id]&&quizState[q.id].submitted})}
function correctStatus(q,selected){
  const cSet=new Set(q.correct);
  const full=selected.length===q.correct.length&&selected.every(function(s){return cSet.has(s)});
  const partial=!full&&selected.some(function(s){return cSet.has(s)});
  return {full:full,partial:partial};
}
function showToast(msg){
  let t=byId('female-toast');
  if(!t){t=document.createElement('div');t.id='female-toast';t.className='toast';document.body.appendChild(t)}
  t.textContent=msg;t.classList.add('show');
  setTimeout(function(){t.classList.remove('show')},2200);
}
function renderPagination(targetId){
  const target=byId(targetId);
  if(!target)return;
  const total=totalPages();
  target.innerHTML='<button class="gbtn gbtn-secondary" type="button" onclick="femaleQuizPrevPage()" '+(currentPage<=1?'disabled':'')+'>← Pagina anterioară</button><span class="page-indicator">Pagina '+currentPage+' / '+total+'</span><button class="gbtn gbtn-secondary" type="button" onclick="femaleQuizNextPage()" '+(currentPage>=total?'disabled':'')+'>Pagina următoare →</button>';
}
function buildQuiz(keepPosition){
  const container=byId('female-questions-container');
  if(!container)return;
  const total=totalPages();
  currentPage=Math.min(Math.max(currentPage,1),total);
  const start=(currentPage-1)*PAGE_SIZE;
  container.innerHTML='';
  QUESTIONS.slice(start,start+PAGE_SIZE).forEach(function(q){renderQuestion(q,container)});
  renderPagination('female-pagination-top');
  renderPagination('female-pagination-bottom');
  updateProgress();
  checkShowFinalScore(false);
  if(!keepPosition)window.scrollTo({top:byId('page-grile')?.offsetTop||0,behavior:'smooth'});
}
function renderQuestion(q,container){
  const state=quizState[q.id]||{selected:[],submitted:false};
  const selected=state.selected||[];
  const submitted=!!state.submitted;
  const status=correctStatus(q,selected);
  let cardClass='',badge='';
  if(submitted){
    if(status.full){cardClass='answered-correct';badge='<span class="result-badge badge-correct">Corect</span>'}
    else if(status.partial){cardClass='answered-partial';badge='<span class="result-badge badge-partial">Parțial</span>'}
    else{cardClass='answered-wrong';badge='<span class="result-badge badge-wrong">Greșit</span>'}
  }
  let optHtml='';
  getOptions(q).forEach(function(opt){
    const isSel=selected.includes(opt.letter);
    const isCorr=q.correct.includes(opt.letter);
    let cls='',icon='';
    if(submitted){
      if(isSel&&isCorr){cls='result-correct';icon='✓'}
      else if(isSel&&!isCorr){cls='result-wrong';icon='✗'}
      else if(!isSel&&isCorr){cls='result-missed';icon='!'}
    }else if(isSel)cls='selected';
    optHtml+='<div class="option '+cls+' '+(submitted?'disabled':'')+'" onclick="femaleQuizToggleOption('+q.id+',\''+opt.letter+'\')"><div class="opt-letter">'+opt.letter+'</div><div class="opt-text">'+escapeHtml(opt.text)+'</div>'+(submitted?'<div class="opt-icon">'+icon+'</div>':'')+'</div>';
  });
  let explanationHtml='';
  if(submitted){
    let rows='';
    getOptions(q).forEach(function(opt){
      const exp=explanationFor(q,opt);
      rows+='<div class="expl-row '+(exp.isCorrect?'expl-correct':'expl-wrong')+'"><span class="expl-letter">'+(exp.isCorrect?'✓':'✗')+'</span><span class="expl-text"><strong>'+opt.letter+'.</strong> '+escapeHtml(exp.text)+(exp.added?'<span class="added-note">'+escapeHtml(exp.added)+'</span>':'')+'</span></div>';
    });
    const lesson=getLessonInfo(q);
    explanationHtml='<div class="explanation show"><div class="expl-header">Explicații — '+escapeHtml(q.topic)+'</div><div class="expl-body">'+rows+'<div class="lesson-ref"><strong>Găsești în lecție la:</strong> '+escapeHtml(lesson.section)+' — <a href="#" onclick="goto(\''+lesson.page+'\');return false;">'+escapeHtml(lesson.page)+'</a></div></div></div>';
  }
  const actions=submitted
    ? '<div class="q-actions"><button class="gbtn gbtn-secondary" type="button" onclick="femaleQuizClear('+q.id+')">Reîncearcă întrebarea</button></div>'
    : '<div class="q-actions"><button class="gbtn gbtn-primary" type="button" onclick="femaleQuizSubmit('+q.id+')">Verifică răspunsul</button></div>';
  const card=document.createElement('article');
  card.className='question-card '+cardClass;
  card.id='female-q-'+q.id;
  card.innerHTML='<div class="q-num">Întrebarea '+q.id+' — '+escapeHtml(q.topic)+' '+badge+'</div><div class="q-text">'+escapeHtml(q.text)+'</div><div class="options" id="female-opts-'+q.id+'">'+optHtml+'</div>'+actions+explanationHtml;
  container.appendChild(card);
}
function updateOptionDom(qId){
  const q=QUESTIONS.find(function(item){return item.id===qId});
  const opts=byId('female-opts-'+qId);
  if(!q||!opts)return;
  const state=quizState[qId]||{selected:[],submitted:false};
  opts.innerHTML=getOptions(q).map(function(opt){
    const selected=state.selected.includes(opt.letter);
    return '<div class="option '+(selected?'selected':'')+'" onclick="femaleQuizToggleOption('+q.id+',\''+opt.letter+'\')"><div class="opt-letter">'+opt.letter+'</div><div class="opt-text">'+escapeHtml(opt.text)+'</div></div>';
  }).join('');
}
window.femaleQuizToggleOption=function(qId,letter){
  const state=quizState[qId]||{selected:[],submitted:false};
  if(state.submitted)return;
  const idx=state.selected.indexOf(letter);
  if(idx>=0)state.selected.splice(idx,1);else state.selected.push(letter);
  quizState[qId]=state;
  saveState(quizState);
  updateOptionDom(qId);
};
window.femaleQuizSubmit=function(qId){
  const state=quizState[qId]||{selected:[],submitted:false};
  if(state.selected.length===0){showToast('Selectează cel puțin un răspuns.');return}
  state.submitted=true;
  quizState[qId]=state;
  saveState(quizState);
  recordToAnalysis(qId,state.selected);
  buildQuiz(true);
  byId('female-q-'+qId)?.scrollIntoView({behavior:'smooth',block:'center'});
};
window.femaleQuizClear=function(qId){
  quizState[qId]={selected:[],submitted:false};
  saveState(quizState);
  setRunRecorded(false);
  buildQuiz(true);
};
window.femaleQuizPrevPage=function(){if(currentPage>1){currentPage--;buildQuiz(false)}};
window.femaleQuizNextPage=function(){if(currentPage<totalPages()){currentPage++;buildQuiz(false)}};
window.femaleQuizReset=function(){
  if(!confirm('Resetezi progresul pentru grilele de reproducător feminin?'))return;
  quizState={};
  saveState(quizState);
  setRunRecorded(false);
  byId('female-final-score')?.classList.remove('show');
  buildQuiz(true);
  renderAnalysis();
};
function updateProgress(){
  const submitted=QUESTIONS.filter(function(q){return quizState[q.id]?.submitted});
  const correct=submitted.filter(function(q){return sameSet(quizState[q.id].selected||[],q.correct)}).length;
  const progress=byId('female-progress-text');
  const bar=byId('female-progress-bar');
  if(progress)progress.textContent=submitted.length+' / '+QUESTIONS.length+' completate';
  if(bar)bar.style.width=Math.round(submitted.length/QUESTIONS.length*100)+'%';
  updateAnalysisResetState();
}
function checkShowFinalScore(shouldScroll){
  const scoreEl=byId('female-final-score');
  if(!scoreEl)return;
  if(!isQuizComplete()){scoreEl.classList.remove('show');return}
  let correct=0,partial=0;
  QUESTIONS.forEach(function(q){
    const selected=(quizState[q.id]||{}).selected||[];
    const status=correctStatus(q,selected);
    if(status.full)correct++;else if(status.partial)partial++;
  });
  const pct=Math.round(correct/QUESTIONS.length*100);
  const circle=byId('female-score-circle');
  if(circle){circle.textContent=correct+'/'+QUESTIONS.length;circle.className='score-circle '+(pct>=70?'score-good':pct>=40?'score-mid':'score-bad')}
  if(byId('female-score-title'))byId('female-score-title').textContent=pct>=70?'Bine făcut!':pct>=40?'Mai studiază puțin':'Continuă să repeți';
  if(byId('female-score-sub'))byId('female-score-sub').textContent=correct+' corecte complet, '+partial+' parțiale, '+(QUESTIONS.length-correct-partial)+' greșite';
  scoreEl.classList.add('show');
  if(!isRunRecorded()){
    const analysis=loadAnalysis();
    analysis.sessions.push({date:new Date().toLocaleDateString('ro-RO'),att:QUESTIONS.length,cor:correct});
    saveAnalysis(analysis);
    setRunRecorded(true);
    renderAnalysis();
  }
  if(shouldScroll)scoreEl.scrollIntoView({behavior:'smooth',block:'center'});
}
function recordToAnalysis(qId,selected){
  const q=QUESTIONS.find(function(item){return item.id===qId});
  if(!q)return;
  const analysis=loadAnalysis();
  const lesson=getLessonInfo(q);
  const status=correctStatus(q,selected);
  const wrongOptions=selected.filter(function(s){return !q.correct.includes(s)});
  const missedOptions=q.correct.filter(function(c){return !selected.includes(c)});
  if(!analysis.topicErrors[q.topic])analysis.topicErrors[q.topic]={topic:q.topic,attempts:0,correct:0,errors:[],lessonSection:lesson.section,lessonPage:lesson.page};
  analysis.topicErrors[q.topic].attempts++;
  if(status.full)analysis.topicErrors[q.topic].correct++;
  else analysis.topicErrors[q.topic].errors.push({qId:qId,date:new Date().toLocaleDateString('ro-RO'),wrongOptions:wrongOptions,missedOptions:missedOptions,selected:selected});
  saveAnalysis(analysis);
  renderAnalysis();
}
function getCurrentAnalysisSnapshot(){
  const topicMap={};
  let totalAnswered=0,totalCorrect=0;
  QUESTIONS.forEach(function(q){
    const state=quizState[q.id];
    if(!state||!state.submitted)return;
    const lesson=getLessonInfo(q);
    const selected=state.selected||[];
    const status=correctStatus(q,selected);
    totalAnswered++;
    if(!topicMap[q.topic])topicMap[q.topic]={topic:q.topic,attempts:0,correct:0,errors:[],lessonSection:lesson.section,lessonPage:lesson.page};
    topicMap[q.topic].attempts++;
    if(status.full){topicMap[q.topic].correct++;totalCorrect++}
    else topicMap[q.topic].errors.push({qId:q.id,wrongOptions:selected.filter(function(s){return !q.correct.includes(s)}),missedOptions:q.correct.filter(function(c){return !selected.includes(c)}),selected:selected});
  });
  return {topicList:Object.values(topicMap),totalAnswered:totalAnswered,totalCorrect:totalCorrect,totalWrong:totalAnswered-totalCorrect};
}
function renderAnalysis(){
  const container=byId('female-analysis-content');
  if(!container)return;
  const analysis=loadAnalysis();
  const snapshot=getCurrentAnalysisSnapshot();
  const topicList=snapshot.topicList;
  if(snapshot.totalAnswered===0){
    container.innerHTML='<div class="no-data"><h3>Nicio grilă completată încă</h3><p>Mergi la tabul Grile și rezolvă câteva întrebări pentru analiza pe capitole.</p></div>';
    updateAnalysisResetState();
    return;
  }
  const pct=snapshot.totalAnswered?Math.round(snapshot.totalCorrect/snapshot.totalAnswered*100):0;
  const color=pct>=70?'#059669':pct>=40?'#D97706':'#E11D48';
  let html='<div class="an-analysis-top"><div class="an-stats-row"><div class="an-stat-box"><div class="an-snum">'+snapshot.totalAnswered+'</div><div class="an-slbl">Întrebări</div></div><div class="an-stat-box"><div class="an-snum" style="color:#059669">'+snapshot.totalCorrect+'</div><div class="an-slbl">Corecte</div></div><div class="an-stat-box"><div class="an-snum" style="color:#E11D48">'+snapshot.totalWrong+'</div><div class="an-slbl">Greșite</div></div><div class="an-stat-box"><div class="an-snum" style="color:'+color+'">'+pct+'%</div><div class="an-slbl">Acuratețe</div></div></div><div class="an-gauge-inline"><div class="an-gauge-meta"><strong>Scor general</strong><span>'+snapshot.totalCorrect+' / '+snapshot.totalAnswered+' corecte</span></div><div class="an-gauge-track"><div class="an-gauge-fill" style="width:'+pct+'%;background:'+color+'"></div></div><div class="an-gauge-labels"><span>0%</span><span>40%</span><span>70%</span><span>100%</span></div></div></div>';
  html+='<div class="an-two-col"><div><div class="an-sec-h">Performanță pe topice</div>';
  topicList.sort(function(a,b){return (a.correct/a.attempts)-(b.correct/b.attempts)}).forEach(function(t){
    const tp=Math.round(t.correct/t.attempts*100);
    const col=tp>=70?'#059669':tp>=40?'#D97706':'#E11D48';
    html+='<div class="an-topic-card"><div class="an-tc-head"><span>'+escapeHtml(t.topic)+'</span><span style="color:'+col+'">'+tp+'%</span></div><div class="an-tc-bar-wrap"><div class="an-tc-bar" style="width:'+tp+'%;background:'+col+'"></div></div><div class="an-tc-detail">'+t.attempts+' întrebări · '+t.correct+' corecte · <a href="#" onclick="goto(\''+t.lessonPage+'\');return false;">Revezi '+escapeHtml(t.lessonSection)+'</a></div></div>';
  });
  html+='</div><div><div class="an-sec-h">Sesiuni complete</div>';
  const sessions=(analysis.sessions||[]).filter(function(s){return s.att===QUESTIONS.length}).slice(-5).reverse();
  if(!sessions.length)html+='<div class="an-topic-card"><div class="an-tc-detail">Aici apar rezultatele după ce termini toate cele 42 de grile.</div></div>';
  sessions.forEach(function(s){
    const sp=Math.round(s.cor/s.att*100);
    const col=sp>=70?'#059669':sp>=40?'#D97706':'#E11D48';
    html+='<div class="an-topic-card"><div class="an-tc-head"><span>'+escapeHtml(s.date)+'</span><span style="color:'+col+'">'+s.cor+'/'+s.att+'</span></div><div class="an-tc-bar-wrap"><div class="an-tc-bar" style="width:'+sp+'%;background:'+col+'"></div></div><div class="an-tc-detail">'+sp+'% corecte</div></div>';
  });
  html+='</div></div>';
  const weakTopics=topicList.filter(function(t){return t.errors.length>0}).sort(function(a,b){return b.errors.length-a.errors.length});
  if(weakTopics.length){
    html+='<div class="an-sec-h">Unde greșești exact</div><button class="an-accordion-btn" id="female-err-toggle" type="button" onclick="femaleQuizToggleErrDetails()"><span>▾ Vezi detalii greșeli</span><span>'+weakTopics.length+' topice</span></button><div class="an-accordion-body" id="female-err-body" hidden>';
    weakTopics.forEach(function(t){
      html+='<div class="an-err-card"><div class="an-err-card-head"><strong>'+escapeHtml(t.topic)+'</strong><span class="an-err-badge">'+t.errors.length+' greșeli</span></div>';
      t.errors.slice(-4).reverse().forEach(function(err){
        const q=QUESTIONS.find(function(item){return item.id===err.qId});
        if(!q)return;
        html+='<div class="an-err-opt an-ew"><div class="an-err-opt-lbl">Întrebarea '+q.id+' · bifat: '+(err.selected.length?err.selected.join(', '):'nimic')+'</div><div class="an-err-opt-txt">Corect era: '+q.correct.join(', ')+'. '+escapeHtml(REASONS[q.id]||'Revezi explicațiile grilei.')+'</div></div>';
      });
      html+='</div>';
    });
    html+='</div>';
  }
  container.innerHTML=html;
  updateAnalysisResetState();
}
window.femaleQuizToggleErrDetails=function(){
  const body=byId('female-err-body');
  const btn=byId('female-err-toggle');
  if(!body||!btn)return;
  const open=!body.hasAttribute('hidden');
  if(open)body.setAttribute('hidden','');else body.removeAttribute('hidden');
  btn.classList.toggle('is-open',!open);
  const label=btn.querySelector('span');
  if(label)label.textContent=(open?'▾':'▴')+' Vezi detalii greșeli';
};
function updateAnalysisResetState(){
  const btn=byId('female-analysis-reset-btn');
  if(!btn)return;
  btn.disabled=!isQuizComplete();
  btn.title=isQuizComplete()?'':'Finalizează toate întrebările înainte să poți reseta analiza.';
}
window.femaleQuizResetAnalysis=function(){
  if(!isQuizComplete()){showToast('Finalizează toate întrebările înainte să resetezi analiza.');return}
  if(!confirm('Ștergi analiza pentru grilele de reproducător feminin?'))return;
  localStorage.removeItem(ANALYSIS_KEY);
  renderAnalysis();
};
window.femaleQuizSwitchTab=function(tab,btn){
  document.querySelectorAll('#page-grile .gtab-panel').forEach(function(panel){panel.classList.remove('active')});
  document.querySelectorAll('#page-grile .gtab-btn').forEach(function(button){button.classList.remove('active')});
  byId('gtab-'+tab)?.classList.add('active');
  btn?.classList.add('active');
  if(tab==='analysis')renderAnalysis();
};
window.renderFemaleQuiz=function(){buildQuiz(true);renderAnalysis()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',window.renderFemaleQuiz);else window.renderFemaleQuiz();
})();
