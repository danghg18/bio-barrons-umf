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
const EXPLANATIONS={
1:{A:{isCorrect:true,text:"Corect. Gonada feminină are funcție gametogenă: la nivelul ovarului se formează oocitele, adică gameții feminini.",added:""},B:{isCorrect:true,text:"Corect. Ovarul are și funcție endocrină; corpul galben ovarian secretă progesteron, mai ales în a doua jumătate a ciclului menstrual.",added:""},C:{isCorrect:false,text:"Greșit. GnRH nu este secretat de gonada feminină, ci de hipotalamus; în plus, GnRH este hormon eliberator de gonadotropine, nu hormon sterolic ovarian.",added:"Hormonii sterolici derivați din colesterol sunt estrogenii și progesteronul."},D:{isCorrect:false,text:"Greșit pentru cerință. Foliculii sunt structuri ale ovarului, dar itemul cere funcțiile gonadei feminine, nu elemente de structură.",added:"În grile, diferența dintre funcție și structură contează mult."},E:{isCorrect:false,text:"Greșit. Controlul ovarian se face prin FSH și LH, hormoni tropi adenohipofizari. Melatonina nu este inclusă în controlul gonadal din lecția Barron's.",added:""}},
2:{A:{isCorrect:true,text:"Corect. Ovarul este susținut în cavitatea pelviană prin ligamentul ovarian și ligamentul suspensor, la care se adaugă mezovariumul ca pliu peritoneal de fixare.",added:""},B:{isCorrect:false,text:"Greșit. Ovarul se leagă de uter prin ligamentul ovarian; ligamentul suspensor leagă ovarul de peretele lateral al pelvisului și conține vase ovariene.",added:""},C:{isCorrect:false,text:"Greșit. Dimensiunile sunt inversate: ovarul are aproximativ 5 cm lungime și 2,5 cm lățime, nu 2,5 cm lungime și 5 cm lățime.",added:""},D:{isCorrect:true,text:"Corect. Vaginul este posterior față de uretră; uretra feminină este mai scurtă și se află anterior de vagin.",added:""},E:{isCorrect:true,text:"Corect. Uterul se află deasupra vaginului și a vezicii urinare, în regiunea anterioară a cavității pelviene.",added:""}},
3:{A:{isCorrect:false,text:"Greșit pentru cerință. Uterul își mărește mult dimensiunile în sarcină, dar aceasta este o modificare, nu una dintre funcțiile cerute de item.",added:""},B:{isCorrect:true,text:"Corect. Trompa uterină transportă zigotul și stadiile lui timpurii spre cavitatea uterină.",added:""},C:{isCorrect:true,text:"Corect. Vaginul permite eliminarea materialului menstrual, inclusiv stratul funcțional necrozat al endometrului.",added:""},D:{isCorrect:true,text:"Corect. Uterul protejează mecanic fătul în timpul sarcinii și îi asigură mediul de dezvoltare.",added:""},E:{isCorrect:false,text:"Greșit pentru cerință. Fimbriile sunt prelungiri ale infundibulului orientate spre ovar, dar afirmația descrie anatomie, nu funcția sistemului.",added:""}},
4:{A:{isCorrect:false,text:"Greșit pentru cerință. Localizarea în cavitatea pelviană este caracteristică anatomică, nu caracteristică funcțională.",added:""},B:{isCorrect:false,text:"Greșit pentru cerință. Faptul că ovarele sunt glande pereche descrie organizarea lor, nu funcția lor.",added:""},C:{isCorrect:true,text:"Corect. Activitatea ovarului este controlată de hormonii tropi ai hipofizei anterioare: FSH și LH.",added:""},D:{isCorrect:true,text:"Corect. Ovarele produc gameți feminini, adică oocite/ovule.",added:""},E:{isCorrect:true,text:"Corect. Ovarele secretă hormonii sexuali feminini principali: estrogeni și progesteron.",added:""}},
5:{A:{isCorrect:true,text:"Corect. FSH stimulează creșterea și maturarea câte unui folicul ovarian pe lună.",added:""},B:{isCorrect:false,text:"Greșit. Ovulația este declanșată în principal de creșterea bruscă a LH, nu de FSH.",added:""},C:{isCorrect:true,text:"Corect. FSH stimulează foliculul ovarian în curs de dezvoltare să producă estrogeni.",added:""},D:{isCorrect:false,text:"Greșit. Secreția corpului luteal este susținută mai ales de LH, iar după fecundație de hCG, nu de FSH.",added:""},E:{isCorrect:false,text:"Greșit. Îngroșarea mucoasei uterine este efect al estrogenilor asupra endometrului, nu efect direct al FSH.",added:""}},
6:{A:{isCorrect:true,text:"Corect. LH stimulează luteinizarea celulelor foliculare și susține producția de progesteron de către corpul galben.",added:""},B:{isCorrect:false,text:"Greșit. LH declanșează ovulația, dar momentul obișnuit într-un ciclu de 28 de zile este în jurul zilei 14, nu ziua 16.",added:""},C:{isCorrect:true,text:"Corect. În lecție, LH stimulează foliculul în curs de dezvoltare să producă hormoni ovarieni, în special în etapa preovulatorie.",added:""},D:{isCorrect:false,text:"Greșit. Creșterea și maturarea foliculilor ovarieni sunt atribuite FSH-ului.",added:""},E:{isCorrect:true,text:"Corect. După ovulație, LH determină transformarea foliculului rezidual în corp galben.",added:""}},
7:{A:{isCorrect:false,text:"Adevărat, deci nu trebuia bifat. Uterul este un organ cavitar, cu perete muscular gros și cavitate uterină.",added:"Itemul cere afirmațiile false."},B:{isCorrect:true,text:"Fals, deci corect de bifat. Vaginul se inseră la nivelul colului uterin, nu la nivelul corpului uterin.",added:""},C:{isCorrect:false,text:"Adevărat, deci nu trebuia bifat. Uterul este localizat în porțiunea anterioară a cavității pelvine.",added:""},D:{isCorrect:false,text:"Adevărat, deci nu trebuia bifat. Uterul este interpus între trompele uterine, superior, și vagin, inferior.",added:""},E:{isCorrect:true,text:"Fals, deci corect de bifat. Estrogenii și progesteronul sunt secretați de ovare, mai ales de folicul și corpul galben, nu de uter.",added:""}},
8:{A:{isCorrect:true,text:"Corect. Dacă fecundația nu are loc, corpul galben involuează după aproximativ 12-14 zile.",added:""},B:{isCorrect:true,text:"Corect. Corpul galben secretă cantități mari de progesteron, hormon important pentru menținerea endometrului.",added:""},C:{isCorrect:true,text:"Corect. Formarea corpului galben din foliculul rezidual este stimulată de LH.",added:""},D:{isCorrect:true,text:"Corect. Corpul galben secretă și estrogeni, în cantități mai mici decât progesteronul.",added:""},E:{isCorrect:false,text:"Greșit. Dacă fecundația se produce, hCG menține corpul galben funcțional temporar; nu îl face să degenereze imediat.",added:""}},
9:{A:{isCorrect:false,text:"Greșit. Capătul trompei uterine dinspre ovar are formă de pâlnie și se numește infundibul, nu ampulă.",added:"Ampula este regiunea mai largă dintre infundibul și istm."},B:{isCorrect:true,text:"Corect. Fiecare trompă uterină are aproximativ 12,5 cm lungime.",added:""},C:{isCorrect:true,text:"Corect. Trompele uterine se deschid medial în cavitatea uterină.",added:""},D:{isCorrect:true,text:"Corect. Dinspre uter spre ovar, trompa are trei regiuni: istm, ampulă și infundibul.",added:""},E:{isCorrect:false,text:"Greșit. Hrănirea fătului în timpul dezvoltării este funcție a uterului și a placentei, nu a trompelor uterine.",added:""}},
10:{A:{isCorrect:true,text:"Corect. Endometrul este stratul intern al peretelui uterin și include strat funcțional și strat bazal.",added:""},B:{isCorrect:false,text:"Greșit. Stratul funcțional aparține endometrului; perimetrul este stratul extern, seros, al uterului.",added:""},C:{isCorrect:false,text:"Greșit. Miometrul este alcătuit din mușchi neted, nu din mușchi striat.",added:""},D:{isCorrect:true,text:"Corect. Perimetrul, stratul extern al uterului, se continuă cu mezoteliul ligamentului larg.",added:""},E:{isCorrect:false,text:"Greșit conform baremului folosit aici. Stratul bazal regenerează stratul funcțional după menstruație, dar varianta nu este inclusă în răspunsul acestei grile.",added:"Reține totuși ideea pentru lecție: stratul bazal nu se elimină la menstruație."}},
11:{A:{isCorrect:true,text:"Corect. Trompele uterine se află de-a lungul marginii superioare a ligamentului larg al uterului.",added:""},B:{isCorrect:false,text:"Greșit. Dinspre uter spre ovar ordinea este istm, ampulă, infundibul; ampula nu este distală față de infundibul.",added:""},C:{isCorrect:true,text:"Corect. Istmul este segmentul scurt, medial, care se unește cu peretele uterin.",added:""},D:{isCorrect:false,text:"Greșit. Trompele uterine au musculatură netedă, nu striată; contracțiile peristaltice ajută transportul ovocitului.",added:""},E:{isCorrect:false,text:"Greșit. Segmentul apropiat de ovar captează ovocitul prin fimbrii și îl transportă; nu are rol de degenerare a ovulelor nefecundate.",added:""}},
12:{A:{isCorrect:true,text:"Corect. Ligamentul ovarian se află medial de ovar și îl leagă de uter.",added:""},B:{isCorrect:true,text:"Corect. Ligamentul suspensor este lateral de ovar și îl ancorează spre peretele lateral pelvian.",added:""},C:{isCorrect:false,text:"Greșit. Formularea nu descrie un raport direct relevant pentru sistemul reproducător feminin; ureterul are raporturi pelviene proprii, nu este reperul cerut aici.",added:""},D:{isCorrect:false,text:"Greșit pentru raport direct. Uterul este posterior față de simfiza pubiană doar cu vezica urinară interpusă, deci nu este raport direct.",added:""},E:{isCorrect:false,text:"Greșit pentru raport direct. Istmul uterin este între corp și col; raportul direct cu vaginul este realizat de colul uterin, nu de istm.",added:""}},
13:{A:{isCorrect:false,text:"Greșit. Vaginul nu conține doar mușchi neted; peretele său include mucoasă, musculatură netedă și țesut fibros.",added:""},B:{isCorrect:true,text:"Corect. Fornixul vaginal se formează în jurul colului uterin, deci are raport direct cu acesta.",added:""},C:{isCorrect:true,text:"Corect. Prin vagin se elimină materialul menstrual, inclusiv endometrul necrozat.",added:""},D:{isCorrect:true,text:"Corect. În structura vaginului există și țesut fibros, cu rol de susținere și rezistență.",added:""},E:{isCorrect:false,text:"Greșit. Musculatura netedă vaginală nu este descrisă ca un singur strat simplu; peretele are organizare musculară mai complexă.",added:""}},
14:{A:{isCorrect:true,text:"Corect. În prima jumătate a ciclului menstrual predomină secreția de estrogeni de către foliculii ovarieni.",added:""},B:{isCorrect:false,text:"Greșit pentru cerință. Corticala și medulara sunt elemente de structură ovariană, nu funcții ale ovarului.",added:""},C:{isCorrect:false,text:"Greșit. Estrogenii inhibă în principal secreția de FSH prin feedback negativ; LH are creștere bruscă înainte de ovulație.",added:""},D:{isCorrect:true,text:"Corect. În a doua jumătate a ciclului, corpul galben secretă predominant progesteron.",added:""},E:{isCorrect:false,text:"Greșit. Corpul galben se formează din foliculul ovarian rezidual din corticală, nu din medulară.",added:""}},
15:{A:{isCorrect:true,text:"Corect. După pubertate, lunar, un ovocit primar își finalizează prima diviziune meiotică și devine ovocit secundar.",added:""},B:{isCorrect:true,text:"Corect. Ovocitele primare sunt prezente în ovar încă de la naștere, blocate în profaza I.",added:""},C:{isCorrect:true,text:"Corect. Al doilea globul polar apare numai dacă ovocitul secundar este stimulat de pătrunderea spermatozoidului și finalizează meioza II.",added:""},D:{isCorrect:false,text:"Greșit. Cavitatea plină cu lichid, numită antru, aparține foliculului matur, nu ovocitului primar ca atare.",added:""},E:{isCorrect:false,text:"Greșit pentru cerință. Corpul galben rămâne activ aproximativ 12 zile, dar afirmația nu descrie oogeneză propriu-zisă.",added:""}},
16:{A:{isCorrect:true,text:"Corect. Creșterea bruscă a LH determină ruperea foliculului matur și eliberarea ovocitului.",added:""},B:{isCorrect:true,text:"Corect. Celulele foliculare reziduale se transformă în corp galben după ovulație.",added:""},C:{isCorrect:false,text:"Greșit. Ordinea este inversă: corpul galben poate degenera și deveni corp alb, nu corpul alb devine corp galben.",added:""},D:{isCorrect:false,text:"Greșit. Nutrienții din faza secretorie sunt secretați de glandele endometriale din uter, nu de ovar.",added:""},E:{isCorrect:true,text:"Corect. Dacă apare fecundația, gonadotropina corionică hCG menține corpul galben funcțional.",added:""}},
17:{A:{isCorrect:true,text:"Corect. Glanda mamară se află pe fața anterioară a toracelui.",added:""},B:{isCorrect:false,text:"Greșit. Prolactina stimulează secreția laptelui; oxitocina stimulează ejecția sau expulzia laptelui.",added:""},C:{isCorrect:true,text:"Corect. Posterior de glanda mamară se află fascia superficială a mușchiului pectoral mare.",added:""},D:{isCorrect:true,text:"Corect. Glanda mamară conține glande alveolare și ducte care transportă laptele spre mamelon.",added:""},E:{isCorrect:true,text:"Corect. Lobii glandei mamare converg prin ducte spre regiunea mamelonului.",added:""}},
18:{A:{isCorrect:false,text:"Greșit. Afirmația combină incorect numărul ligamentelor; pentru ovar se rețin ligamentul ovarian, ligamentul suspensor și mezovariumul, iar uterul este susținut mai ales prin ligamentul larg.",added:""},B:{isCorrect:true,text:"Corect. Scăderea estrogenilor și progesteronului determină ischemia și necroza stratului funcțional endometrial, deci menstruația.",added:""},C:{isCorrect:true,text:"Corect. Glandele Bartholin și Skene sunt glande exocrine asociate organelor genitale externe feminine.",added:""},D:{isCorrect:true,text:"Corect. Secreția lactată este stimulată de prolactină, hormon adenohipofizar.",added:""},E:{isCorrect:true,text:"Corect. Glandele mamare sunt glande sudoripare modificate, organizate în lobi cu unități glandulare de tip apocrin/alveolar.",added:""}},
19:{A:{isCorrect:false,text:"Greșit. Fecundația are loc de obicei în porțiunea ampulară a trompei uterine, nu în treimea internă apropiată de uter.",added:""},B:{isCorrect:true,text:"Corect. Fecundația duce la apariția hCG, care menține corpul galben; acesta continuă să secrete estrogeni și progesteron aproximativ trei luni.",added:""},C:{isCorrect:true,text:"Corect. După fecundație, blastocistul ajunge la endometru și implantarea se finalizează în aproximativ 5 zile.",added:""},D:{isCorrect:false,text:"Greșit conform baremului acestui item. Afirmația descrie migrarea blastocistului după ovulație, nu fenomenul central al fecundației cerut aici.",added:"Pentru lecție: blastocistul ajunge în uter la aproximativ 4-5 zile după ovulație."},E:{isCorrect:false,text:"Greșit conform baremului acestui item. Morula apare prin segmentarea zigotului, dar varianta ține de evenimentele de după fecundație, nu de fecundația propriu-zisă.",added:""}},
20:{A:{isCorrect:true,text:"Corect. Gonadele feminine produc gameți feminini, adică oocite/ovule.",added:""},B:{isCorrect:false,text:"Greșit pentru cerință. Localizarea ovarelor este caracteristică anatomică, nu funcție gonadală.",added:""},C:{isCorrect:true,text:"Corect. Gonadele feminine secretă hormoni sexuali feminini: estrogeni și progesteron.",added:""},D:{isCorrect:false,text:"Greșit. Ovarele sunt organe pereche, nu nepereche.",added:""},E:{isCorrect:false,text:"Greșit pentru cerință. Ligamentul ovarian și ligamentul suspensor sunt elemente de susținere, nu funcții ale gonadelor.",added:""}},
21:{A:{isCorrect:false,text:"Greșit. La menstruație se elimină stratul funcțional al endometrului, nu stratul bazal.",added:"Stratul bazal rămâne și regenerează funcționalul."},B:{isCorrect:false,text:"Greșit. Perimetrul este tunica seroasă externă a uterului; tunica musculară este miometrul.",added:""},C:{isCorrect:true,text:"Corect. Miometrul este stratul muscular al uterului și este alcătuit din fibre musculare netede.",added:""},D:{isCorrect:true,text:"Corect. Endometrul are două straturi: strat funcțional superficial și strat bazal profund.",added:""},E:{isCorrect:false,text:"Greșit. Endometrul este tunica mucoasă internă, nu tunica seroasă a uterului.",added:""}},
22:{A:{isCorrect:true,text:"Corect. Glandele mamare sunt glande de tip alveolar, organizate în lobi și ducte.",added:""},B:{isCorrect:false,text:"Greșit. Laptele este secretat sub controlul prolactinei; oxitocina controlează ejecția laptelui.",added:""},C:{isCorrect:false,text:"Greșit. Ejecția laptelui are loc sub acțiunea oxitocinei, nu a prolactinei.",added:"Prolactina stimulează producerea/secreția laptelui."},D:{isCorrect:true,text:"Corect. Canalele/ductele glandei mamare converg anterior spre mamelon.",added:""},E:{isCorrect:true,text:"Corect. Actul suptului stimulează reflex secreția lactată și ejecția laptelui prin prolactină și oxitocină.",added:""}},
23:{A:{isCorrect:true,text:"Corect. Uterul comunică lateral cu trompele uterine la nivelul fundului uterin.",added:""},B:{isCorrect:false,text:"Greșit. Uterul este un organ cavitar median, dar este situat în regiunea anterioară a cavității pelviene, nu posterioară.",added:""},C:{isCorrect:true,text:"Corect. Canalul cervical se deschide în vagin prin orificiul extern al colului uterin.",added:""},D:{isCorrect:true,text:"Corect. Uterul protejează și hrănește fătul în timpul sarcinii.",added:""},E:{isCorrect:false,text:"Greșit. Protecția deschiderii vaginului și a uretrei este atribuită labiilor mici, nu uterului.",added:""}},
24:{A:{isCorrect:true,text:"Corect. În faza proliferativă, endometrul se îngroașă sub influența estrogenilor.",added:""},B:{isCorrect:false,text:"Greșit. Ovulația din jurul zilei 14 este declanșată de creșterea LH; FSH participă la maturarea foliculului, dar nu acționează exclusiv.",added:""},C:{isCorrect:true,text:"Corect. În faza secretorie, corpul galben secretă progesteron și cantități mici de estrogeni.",added:""},D:{isCorrect:false,text:"Greșit. În faza menstruală se elimină stratul funcțional al endometrului, nu al miometrului.",added:""},E:{isCorrect:true,text:"Corect. Ciclul menstrual are de obicei aproximativ 28 de zile.",added:""}},
25:{A:{isCorrect:true,text:"Corect. Prima diviziune meiotică produce ovocitul secundar și primul globul polar.",added:""},B:{isCorrect:true,text:"Corect. Ovocitul secundar poate finaliza a doua diviziune meiotică și forma ovulul, dacă are loc fecundația.",added:""},C:{isCorrect:false,text:"Greșit. După pubertate nu se formează ovocite primare noi din oogonii; ovocitele primare sunt deja prezente de la naștere.",added:""},D:{isCorrect:true,text:"Corect. Ambele diviziuni meiotice sunt asimetrice și produc globuli polari haploizi.",added:""},E:{isCorrect:true,text:"Corect. Ovocitul secundar este cel eliberat din ovar prin ovulație.",added:""}},
26:{A:{isCorrect:true,text:"Corect. Estrogenii sunt sintetizați în principal de foliculii ovarieni în curs de dezvoltare.",added:""},B:{isCorrect:false,text:"Greșit. În lecție se reține că estrogenii inhibă producția de FSH, nu secreția hipotalamică de FSH; FSH este hormon adenohipofizar.",added:""},C:{isCorrect:true,text:"Corect. Estrogenii stimulează dezvoltarea caracterelor sexuale feminine.",added:""},D:{isCorrect:true,text:"Corect. Estrogenii intervin în faza proliferativă, stimulând îngroșarea endometrului.",added:""},E:{isCorrect:false,text:"Greșit. Creșterea foliculilor ovarieni este stimulată de FSH; estrogenii sunt produși de folicul și acționează mai ales asupra țintelor periferice și feedbackului hormonal.",added:""}},
27:{A:{isCorrect:true,text:"Corect. Capacitația fragilizează și modifică membrana spermatozoidului, permițând eliberarea enzimelor acrozomale.",added:""},B:{isCorrect:true,text:"Corect. Placenta se formează prin unirea vilozităților coriale ale blastocistului cu țesuturile uterine.",added:""},C:{isCorrect:false,text:"Greșit. Prin fecundare se formează zigotul diploid, cu 46 de cromozomi, nu haploid.",added:""},D:{isCorrect:true,text:"Corect. Formarea zigotului are loc de obicei la nivelul trompelor uterine.",added:""},E:{isCorrect:false,text:"Greșit. Ovocitul secundar își finalizează meioza II după pătrunderea spermatozoidului, nu înainte de fecundație.",added:""}},
28:{A:{isCorrect:false,text:"Greșit. hCG menține corpul galben funcțional în primele luni de sarcină; nu îl face să involueze.",added:""},B:{isCorrect:true,text:"Corect. Corpul galben se formează din celulele foliculare reziduale sub acțiunea LH.",added:""},C:{isCorrect:true,text:"Corect. Dacă nu are loc fecundația, corpul galben produce progesteron și estrogeni aproximativ 12 zile, apoi involuează.",added:""},D:{isCorrect:false,text:"Greșit. Corpul galben se transformă în corp alb dacă fecundația nu a avut loc; dacă fecundația are loc, hCG îl menține temporar.",added:""},E:{isCorrect:false,text:"Greșit. Hormonii corpului galben mențin endometrul; eliminarea mucoasei endometriale apare când estrogenii și progesteronul scad.",added:""}},
29:{A:{isCorrect:false,text:"Greșit. Volumul uterin crește mult în timpul sarcinii.",added:""},B:{isCorrect:true,text:"Corect. Infundibulul trompelor uterine prezintă fimbrii dispuse în vecinătatea ovarului, pentru captarea ovocitului.",added:""},C:{isCorrect:true,text:"Corect. Clitorisul este organ erectil feminin.",added:""},D:{isCorrect:false,text:"Greșit. Direcția este inversă: foliculul primar se dezvoltă spre folicul matur/vezicular, nu foliculul matur devine folicul primar.",added:""},E:{isCorrect:false,text:"Greșit. Blastocistul ajunge în cavitatea uterină la aproximativ 4-5 zile după ovulație și se implantează ulterior, nu la 12 zile după ovulație.",added:""}},
30:{A:{isCorrect:true,text:"Corect. Sistemul reproducător feminin produce, susține, hrănește și transportă ovulele/ovocitele.",added:""},B:{isCorrect:true,text:"Corect. Unele organe ale tractului genital feminin sunt cuprinse în ligamentul larg al uterului, un pliu peritoneal.",added:""},C:{isCorrect:false,text:"Greșit. Trompele se deschid lateral spre cavitatea pelviană în vecinătatea ovarelor; formularea cu medial de ovare este greșită.",added:""},D:{isCorrect:false,text:"Greșit. Ligamentul larg se fixează pe pereții laterali ai pelvisului, nu pe pereții mediali ai planșeului pelvian.",added:""},E:{isCorrect:true,text:"Corect. Ovarele produc gameți feminini și secretă hormonii sexuali feminini.",added:""}},
31:{A:{isCorrect:false,text:"Greșit conform baremului folosit aici. Ovarele sunt în cavitatea pelviană și sunt acoperite/legate de peritoneu prin mezovarium, dar varianta intraperitoneal nu este acceptată în această grilă.",added:""},B:{isCorrect:true,text:"Corect. Ovarul este susținut de ligamentul ovarian și ligamentul suspensor.",added:""},C:{isCorrect:true,text:"Corect. Ovarul conține grupuri de celule numite foliculi, care înconjoară ovocitele.",added:""},D:{isCorrect:true,text:"Corect. Prin ovulație, ovarul eliberează ovocitul secundar.",added:""},E:{isCorrect:false,text:"Greșit. După ovulație, foliculul devine corp galben; corpul albicans apare ulterior, prin degenerarea corpului galben.",added:""}},
32:{A:{isCorrect:true,text:"Corect. Trompele uterine sunt situate de-a lungul marginii superioare a ligamentului larg.",added:""},B:{isCorrect:true,text:"Corect. Capătul trompei apropiat de ovar se numește infundibul.",added:""},C:{isCorrect:true,text:"Corect. Trompa se deschide în cavitatea uterină prin segmentul scurt numit istm.",added:""},D:{isCorrect:true,text:"Corect. Epiteliul trompelor, inclusiv în regiunea ampulară, are cili care ajută transportul ovocitului/zigotului.",added:""},E:{isCorrect:false,text:"Greșit. Contracțiile peristaltice sunt produse de musculatură netedă, nu striată.",added:""}},
33:{A:{isCorrect:false,text:"Greșit. Uterul este situat în porțiunea anterioară a cavității pelviene, nu posterioară.",added:""},B:{isCorrect:true,text:"Corect. Uterul este susținut de ligamentele largi.",added:""},C:{isCorrect:true,text:"Corect. Fundul uterin este regiunea superioară, unde se unesc trompele uterine cu uterul.",added:""},D:{isCorrect:true,text:"Corect. Istmul se află în porțiunea inferioară a uterului, între corp și col.",added:""},E:{isCorrect:false,text:"Greșit. În sarcină, uterul își modifică masiv dimensiunile și forma; nu își păstrează forma tipică de pară.",added:""}},
34:{A:{isCorrect:false,text:"Greșit. Locul obișnuit al fecundației este trompa uterină, nu ovarul.",added:""},B:{isCorrect:true,text:"Corect. Trompa lui Falloppio transportă zigotul și stadiile lui timpurii spre uter.",added:""},C:{isCorrect:true,text:"Corect. Uterul hrănește și protejează fătul în timpul sarcinii.",added:""},D:{isCorrect:true,text:"Corect. Vaginul conduce fătul în timpul nașterii.",added:""},E:{isCorrect:false,text:"Greșit. Protecția deschiderii vaginului și a uretrei este atribuită labiilor mici; labiile mari protejează mai general organele genitale externe.",added:""}},
35:{A:{isCorrect:true,text:"Corect. Organele genitale externe feminine sunt cunoscute generic sub denumirea de vulvă.",added:""},B:{isCorrect:true,text:"Corect. Glandele Bartholin și Skene contribuie la lubrifierea regiunii vestibulare/vaginale.",added:""},C:{isCorrect:false,text:"Greșit. Vestibulul vaginal este delimitat de labiile mici, nu de labiile mari.",added:""},D:{isCorrect:true,text:"Corect. Clitorisul este situat anterior față de orificiul uretral.",added:""},E:{isCorrect:false,text:"Greșit. Mons pubis este situat anterior, peste simfiza pubiană, nu în spatele acesteia.",added:""}},
36:{A:{isCorrect:false,text:"Greșit. Glanda mamară este glandă exocrină de tip alveolar/apocrin, nu structură lobulară formată din glande endocrine.",added:""},B:{isCorrect:true,text:"Corect. Glandele mamare sunt glande de tip alveolar.",added:""},C:{isCorrect:true,text:"Corect. Rolul lor este secreția laptelui, proces numit lactație.",added:""},D:{isCorrect:true,text:"Corect. Secreția laptelui este controlată de prolactină.",added:""},E:{isCorrect:true,text:"Corect. Oxitocina controlează expulzia laptelui din glanda mamară.",added:""}},
37:{A:{isCorrect:true,text:"Corect. Într-un ciclu menstrual de 28 de zile, ovulația apare aproximativ în ziua 14.",added:""},B:{isCorrect:false,text:"Greșit. În faza menstruală estrogenii și progesteronul sunt scăzuți; regenerarea endometrului are loc ulterior, în faza proliferativă, sub influența estrogenilor.",added:""},C:{isCorrect:false,text:"Greșit. Corpul galben secretă progesteron și cantități mici de estrogen în faza secretorie, nu în faza proliferativă.",added:""},D:{isCorrect:true,text:"Corect. Dacă fecundația nu are loc, corpul galben involuează.",added:""},E:{isCorrect:true,text:"Corect. Menstruația marchează prima zi a unui nou ciclu menstrual.",added:""}},
38:{A:{isCorrect:true,text:"Corect. Oogeneza este procesul prin care se formează ovulele în ovar.",added:""},B:{isCorrect:false,text:"Greșit. Oogeneza începe înainte de naștere, în viața intrauterină, nu imediat după naștere.",added:""},C:{isCorrect:true,text:"Corect. Celulele germinale primitive feminine se numesc oogonii/ovogonii.",added:""},D:{isCorrect:true,text:"Corect. Ovocitele primare, împreună cu straturile celulare înconjurătoare, formează foliculii primari.",added:""},E:{isCorrect:true,text:"Corect. La pubertate rămân aproximativ 75.000 de foliculi în ovare.",added:""}},
39:{A:{isCorrect:true,text:"Corect. Oogeneza începe în timpul vieții intrauterine.",added:""},B:{isCorrect:true,text:"Corect. Foliculii primari sunt prezenți în ovare încă de la naștere.",added:""},C:{isCorrect:false,text:"Greșit. Hipotalamusul începe secreția de GnRH la pubertate, nu imediat după naștere.",added:""},D:{isCorrect:false,text:"Greșit. FSH stimulează creșterea și maturarea câte unui folicul pe lună; LH este legat de ovulație și corpul galben.",added:""},E:{isCorrect:true,text:"Corect. FSH stimulează producerea de estrogen la nivelul foliculului în curs de dezvoltare.",added:""}},
40:{A:{isCorrect:true,text:"Corect. GnRH stimulează hipofiza anterioară să producă și să elibereze FSH și LH.",added:""},B:{isCorrect:true,text:"Corect. FSH stimulează creșterea foliculului ovarian și producția de estrogeni.",added:""},C:{isCorrect:true,text:"Corect. LH stimulează ovulația prin ruptura foliculului matur.",added:""},D:{isCorrect:false,text:"Greșit. Prolactina stimulează secreția lactată; nu o inhibă.",added:""},E:{isCorrect:false,text:"Greșit. Oxitocina este sintetizată în hipotalamus și eliberată prin neurohipofiză; neurohipofiza nu este locul sintezei.",added:""}},
41:{A:{isCorrect:true,text:"Corect. Fecundația produce ovulul fecundat, adică zigotul, cu 46 de cromozomi.",added:""},B:{isCorrect:true,text:"Corect. Pentru ca un spermatozoid să pătrundă ovocitul, sunt necesare enzime acrozomale eliberate de mai mulți spermatozoizi.",added:""},C:{isCorrect:true,text:"Corect. Eliberarea enzimelor din acrozom are loc după capacitația spermatozoidului.",added:""},D:{isCorrect:false,text:"Greșit. Fecundația are loc de obicei în trompa uterină, nu la nivelul uterului.",added:""},E:{isCorrect:true,text:"Corect. Ovulul fecundat poartă numele de zigot.",added:""}},
42:{A:{isCorrect:true,text:"Corect. După fecundație, zigotul se divide prin segmentare și formează morula.",added:""},B:{isCorrect:true,text:"Corect. Morula se transformă într-o structură cavitară plină cu lichid, numită blastocist.",added:""},C:{isCorrect:false,text:"Greșit. Blastocistul nu ajunge imediat în cavitatea uterină; ajunge în uter la aproximativ 4-5 zile după ovulație.",added:""},D:{isCorrect:true,text:"Corect. Fixarea blastocistului în endometru se numește implantare.",added:""},E:{isCorrect:true,text:"Corect. După fecundație, corpul galben continuă să producă hormoni, fiind menținut inițial de hCG.",added:""}}
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
  const detailed=(EXPLANATIONS[q.id]||{})[opt.letter];
  if(detailed)return detailed;
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
      rows+='<div class="expl-row '+(exp.isCorrect?'expl-correct':'expl-wrong')+'"><span class="expl-letter">'+(exp.isCorrect?'✓':'✗')+'</span><span class="expl-text"><strong>'+opt.letter+'.</strong> '+escapeHtml(exp.text)+(exp.added?'<span class="added-note"><span class="added-marker">*</span>'+escapeHtml(exp.added)+'</span>':'')+'</span></div>';
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
        let detailRows='';
        err.wrongOptions.forEach(function(letter){
          const optText=q.options[letter]||'';
          const expl=(EXPLANATIONS[q.id]||{})[letter];
          detailRows+='<div class="an-err-opt an-ew"><div class="an-err-opt-lbl">✗ Bifat greșit: '+letter+'. '+escapeHtml(optText)+'</div><div class="an-err-opt-txt">'+escapeHtml(expl?expl.text:(REASONS[q.id]||'Revezi explicațiile grilei.'))+'</div></div>';
        });
        err.missedOptions.forEach(function(letter){
          const optText=q.options[letter]||'';
          const expl=(EXPLANATIONS[q.id]||{})[letter];
          detailRows+='<div class="an-err-opt an-em"><div class="an-err-opt-lbl">! Omis: '+letter+'. '+escapeHtml(optText)+'</div><div class="an-err-opt-txt">'+escapeHtml(expl?expl.text:(REASONS[q.id]||'Revezi explicațiile grilei.'))+'</div></div>';
        });
        html+='<div class="an-err-opt"><div class="an-err-opt-lbl">Întrebarea '+q.id+' · bifat: '+(err.selected.length?err.selected.join(', '):'nimic')+' · corect: '+q.correct.join(', ')+'</div>'+detailRows+'</div>';
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
