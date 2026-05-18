(function(){
const STORAGE_KEY='introducere_quiz_v1';
const ANALYSIS_KEY='introducere_analysis_v1';
const RUN_META_KEY='introducere_run_recorded_v1';
const PAGE_SIZE=7;
const RAW_QUESTIONS=[
{id:1,topic:"Tegument",lessonSection:"1.2 Niveluri de organizare structurală",lessonPage:"organizare",text:"Despre tegument se pot afirma următoarele:",options:{A:"este format din piele, păr, unghii, glande endocrine",B:"acoperă și protejează corpul",C:"prezintă cartilaje, păr, unghii",D:"conține receptori",E:"prezintă glande sudoripare"},correct:["B","D","E"],basis:"Tegumentul este alcătuit din piele, păr, unghii și glande sudoripare, acoperă și protejează corpul și conține receptori."},
{id:2,topic:"Țesuturi",lessonSection:"1.2 Niveluri de organizare structurală",lessonPage:"organizare",text:"Principalele tipuri de țesuturi sunt:",options:{A:"țesutul conjunctiv",B:"țesutul epitelial",C:"țesutul nervos",D:"țesutul cartilaginos",E:"sângele"},correct:["A","B","C"],basis:"Lecția reține țesutul epitelial, conjunctiv, muscular și nervos ca tipuri principale; sângele și cartilajul aparțin țesuturilor conjunctive."},
{id:3,topic:"Țesuturi și organe",lessonSection:"1.2 Niveluri de organizare structurală",lessonPage:"organizare",text:"În structura stomacului se întâlnesc următoarele tipuri de țesuturi:",options:{A:"epitelial",B:"muscular striat",C:"nervos",D:"conjunctiv",E:"epidermal"},correct:["A","C","D"],basis:"Stomacul este compus din țesut epitelial, muscular neted, nervos și conjunctiv."},
{id:4,topic:"Sisteme de organe",lessonSection:"1.2 Niveluri de organizare structurală",lessonPage:"organizare",text:"Integrarea activității întregului organism este realizată de:",options:{A:"sistemul osos",B:"sistemul circulator",C:"sistemul imunitar",D:"sistemul nervos",E:"sistemul digestiv"},correct:["D"],basis:"Sistemul nervos primește stimuli, integrează informații și coordonează funcțiile organismului."},
{id:5,topic:"Organizare și funcții",lessonSection:"1.3 Funcții ale organismului",lessonPage:"functii",text:"Care dintre enunțurile următoare sunt corecte?",options:{A:"sistemul digestiv este alcătuit din mai multe organe cu funcții complementare",B:"un organ este compus din două sau trei tipuri diferite de țesuturi",C:"în cadrul catabolismului se consumă de obicei energie",D:"conductibilitatea este caracteristică doar celulelor nervoase",E:"în procesele de creștere a organismului este implicată reproducerea asexuată"},correct:["A","E"],basis:"Sistemele reunesc organe cu funcții complementare, organele au două sau mai multe țesuturi, catabolismul produce energie, iar reproducerea asexuată intervine în creștere și reparație."},
{id:6,topic:"Celulă",lessonSection:"1.2 Niveluri de organizare structurală",lessonPage:"organizare",text:"Selectați afirmațiile corecte referitoare la celulă:",options:{A:"celula procariotă prezintă nucleu și organite",B:"citoplasma celulei eucariote are consistență de gel",C:"componentele principale ale celulei sunt membrana celulară și nucleul",D:"toate celulele corpului uman conțin nuclei",E:"celulele eucariote se divid mitotic"},correct:["B","E"],basis:"Celula eucariotă are citoplasmă cu consistență de gel și se poate divide mitotic; celula procariotă nu are nucleu delimitat, iar nu toate celulele umane mature au nucleu."},
{id:7,topic:"Celulă musculară",lessonSection:"1.3 Funcții ale organismului",lessonPage:"functii",text:"Despre celula musculară se pot afirma următoarele:",options:{A:"este o celulă procariotă",B:"la nivelul inimii, prezintă mai mulți nuclei poziționați central",C:"se contractă sub acțiunea unui stimul",D:"prezintă metabolism propriu",E:"cea striată scheletică, prezintă miofibrile alcătuite din sarcomere"},correct:["C","D","E"],basis:"Celula musculară este eucariotă, are metabolism propriu și este specializată pentru contracție; fibra musculară striată scheletică are miofibrile organizate în sarcomere."},
{id:8,topic:"Homeostazie",lessonSection:"1.3 Funcții ale organismului",lessonPage:"functii",text:"Dezechilibrul mediului intern poate să apară în următoarele condiții:",options:{A:"aport optim de substanțe organice",B:"boală",C:"căldură excesivă",D:"aport scăzut de oxigen",E:"durere"},correct:["B","C","D","E"],basis:"Boala, căldura excesivă, durerea și lipsa de oxigen perturbă homeostazia; aportul optim susține funcționarea normală."},
{id:9,topic:"Poziție anatomică",lessonSection:"1.4 Termeni direcționali",lessonPage:"termeni",text:"Membrele superioare sunt în poziție anatomică dacă sunt:",options:{A:"în abducție",B:"în adducție",C:"pe lângă corp",D:"cu policele spre exterior",E:"cu palmele în pronație"},correct:["B","C","D"],basis:"În poziție anatomică membrele superioare sunt pe lângă corp, palmele sunt orientate anterior, iar policele este orientat spre exterior."},
{id:10,topic:"Poziție anatomică",lessonSection:"1.4 Termeni direcționali",lessonPage:"termeni",text:"Care dintre următoarele structuri sunt situate în partea posterioară a corpului aflat în poziție anatomică?",options:{A:"sternul",B:"scapula",C:"coatele",D:"fața dorsală a mâinii",E:"patela (rotula)"},correct:["B","C","D"],basis:"Posterior înseamnă partea din spate a corpului; sternul și patela sunt anterioare."},
{id:11,topic:"Raporturi anatomice",lessonSection:"1.4 Termeni direcționali",lessonPage:"termeni",text:"Inima se găsește:",options:{A:"în raport anterior cu sternul",B:"în raport inferior cu diafragmul",C:"superior față de diafragm",D:"medial față de plămâni",E:"posterior de coloana vertebrală, într-un plan coronal"},correct:["A","C","D"],basis:"Inima se află în cavitatea pericardică din mediastin, posterior de stern, superior de diafragm și medial față de plămâni."},
{id:12,topic:"Raporturi anatomice",lessonSection:"1.5 Cavități și regiuni",lessonPage:"cavitati",text:"Plămânii sunt:",options:{A:"situați profund față de coaste",B:"în raport medial cu inima",C:"localizați superior față de diafragm",D:"înveliți de foița parietală a pleurei",E:"plasați în cavitatea pleurală a mediastinului"},correct:["A","C"],basis:"Plămânii sunt în cavitățile pleurale, profund față de coaste și superior de diafragm; mediastinul este regiunea dintre cavitățile pleurale."},
{id:13,topic:"Asocieri funcționale",lessonSection:"1.3 Funcții ale organismului",lessonPage:"functii",text:"Selectați asocierile corecte:",options:{A:"sistem digestiv - transport de substanțe în organism",B:"sistem respirator - îndepărtarea unor produși de degradare rezultați din metabolism",C:"catabolism - consum de energie",D:"reproducere sexuată - diviziunea unei celule",E:"conductibilitate - propagarea unei unde de depolarizare de-a lungul unui neuron"},correct:["B","E"],basis:"Sistemul respirator elimină dioxidul de carbon, conductibilitatea presupune transmiterea stimulilor, iar catabolismul produce de obicei energie."},
{id:14,topic:"Funcții ale organismului",lessonSection:"1.3 Funcții ale organismului",lessonPage:"functii",text:"Despre funcțiile organismului sunt adevărate următoarele afirmații:",options:{A:"mișcarea, rezultată din contracția celulelor musculare, poate fi voluntară sau involuntară",B:"excreția reprezintă procesul de eliminare a moleculelor absorbite digestiv",C:"reproducerea asexuată asigură dezvoltarea unui nou individ",D:"sistemul urinar cuprinde rinichii, vezica urinară și căile urinare asociate",E:"excitabilitatea reprezintă capacitatea organismului de a răspunde la stimuli interni sau externi"},correct:["A","E"],basis:"Mișcarea poate fi voluntară sau involuntară, excitabilitatea este răspunsul la stimuli, excreția elimină produși de degradare, iar reproducerea sexuată formează un nou individ."},
{id:15,topic:"Homeostazie și planuri",lessonSection:"1.3 Funcții ale organismului",lessonPage:"functii",text:"Următoarele afirmații sunt adevărate:",options:{A:"lipsa de oxigen afectează homeostazia mediului intern",B:"receptorii detectează orice deviere de la valoarea normală a unui parametru al mediului intern al organismului",C:"insulina se eliberează din pancreas în caz de hipoglicemie",D:"planul parasagital împarte corpul în două părți simetrice, dreaptă și stângă",E:"în poziție anatomică, policele este orientat medial"},correct:["A","B"],basis:"Lipsa de oxigen perturbă homeostazia, receptorii detectează devieri, insulina scade glicemia crescută, iar planul parasagital produce părți inegale."},
{id:16,topic:"Țesuturi",lessonSection:"1.2 Niveluri de organizare structurală",lessonPage:"organizare",text:"Despre principalele tipuri de țesuturi sunt adevărate următoarele enunțuri:",options:{A:"cel epitelial intră în alcătuirea unui organ abdominal situat în cavitatea peritoneală",B:"cel conjunctiv intră în alcătuirea scheletului",C:"cel muscular este de un singur tip",D:"cel nervos intră în alcătuirea unor organe de simț",E:"cel endocrin intră și în alcătuirea hipofizei"},correct:["A","B","D"],basis:"Principalele țesuturi sunt epitelial, conjunctiv, muscular și nervos; țesutul conjunctiv include țesutul osos, iar organele pot conține mai multe tipuri de țesuturi."},
{id:17,topic:"Sisteme de organe",lessonSection:"1.2 Niveluri de organizare structurală",lessonPage:"organizare",text:"Despre sistemele de organe se poate afirma că:",options:{A:"sistemul circulator este format doar din inimă și vase sanguine",B:"sistemul imunitar cuprinde limfocite, cu rol în apărarea organismului",C:"sistemul urinar se găsește în pelvis",D:"sistemul digestiv absoarbe toți componenții din hrana ingerată",E:"cuprind organe cu aceeași funcție"},correct:["B"],basis:"Sistemul imunitar interacționează cu agenții străini; sistemele de organe reunesc organe cu funcții complementare, nu strict identice."},
{id:18,topic:"Cavitate abdominală",lessonSection:"1.5 Cavități și regiuni",lessonPage:"cavitati",text:"Despre cavitatea abdominală sunt adevărate următoarele afirmații:",options:{A:"este delimitată superior de diafragmă",B:"în regiunea ombilicală se găsesc ansele intestinului subțire",C:"în hipocondrul stâng se găsește ficatul",D:"conține toate segmentele intestinului subțire și gros",E:"cuprinde și organe retroperitoneale"},correct:["A","B","E"],basis:"Cavitatea abdominală este sub diafragmă, include organe digestive și regiunea ombilicală centrală; ficatul este în dreapta, iar unele organe sunt retroperitoneale."},
{id:19,topic:"Termeni direcționali",lessonSection:"1.4 Termeni direcționali",lessonPage:"termeni",text:"Membrele superioare:",options:{A:"sunt perechi și controlaterale",B:"prezintă femurul, localizat proximal față de tibie",C:"prezintă carpienele situate proximal față de falange",D:"prezintă ulna situată medial față de radius",E:"cuprind sternul, situat anterior față de inimă"},correct:["A","C","D"],basis:"Proximal înseamnă mai aproape de atașarea la trunchi, medial înseamnă spre linia mediană, iar membrele pereche sunt pe părți opuse ale corpului."},
{id:20,topic:"Cavități principale",lessonSection:"1.5 Cavități și regiuni",lessonPage:"cavitati",text:"Despre cavitățile principale ale corpului sunt adevărate următoarele afirmații:",options:{A:"cavitatea dorsală a corpului conține toate componentele sistemului nervos central",B:"cavitatea anterioară a corpului este divizată de un mușchi neted, diafragma",C:"în subdiviziunea abdomino-pelviană, median, se găsesc regiunile: epigastrică, ombilicală și hipogastrică",D:"subdiviziunea pelviană include și regiunile iliacă stângă, iliacă dreaptă și epigastrică",E:"subdiviziunea abdominală cuprinde 2 flancuri pereche"},correct:["A","C","E"],basis:"Cavitatea dorsală include cavitatea craniană și canalul rahidian, cavitatea ventrală este separată de diafragmă, iar regiunile mediane sunt epigastrică, ombilicală și hipogastrică."},
{id:21,topic:"Planuri anatomice",lessonSection:"1.4 Termeni direcționali",lessonPage:"termeni",text:"Despre planurile corpului sunt adevărate următoarele afirmații:",options:{A:"planul coronal împarte corpul într-o regiune superioară și una inferioară",B:"planul parasagital este paralel cu planul mediosagital",C:"planul orizontal împarte corpul în 2 părți: cranială și caudală",D:"un plan sagital este vertical și împarte întotdeauna corpul în 2 părți egale, dreaptă și stângă",E:"cele 3 planuri importante ale corpului, sagital, frontal și coronal sunt perpendiculare unul pe celălalt"},correct:["B","C"],basis:"Planul sagital împarte dreapta-stânga, parasagitalul este paralel cu mediosagitalul, frontalul împarte anterior-posterior, iar orizontalul împarte cranial-caudal."},
{id:22,topic:"Homeostazie",lessonSection:"1.3 Funcții ale organismului",lessonPage:"functii",text:"Despre homeostazie sunt adevărate următoarele afirmații:",options:{A:"pentru menținerea ei, în hiperglicemie crește secreția de glucagon",B:"fiziologic, se menține și în cazul variațiilor din mediul extern al organismului",C:"este menținută prin sisteme de autoreglare, realizate și cu ajutorul hormonilor",D:"pentru menținerea ei, crește secreția de insulină în caz de hipoglicemie",E:"este menținută prin feedback negativ, ce presupune creșterea permanentă a unui parametru al mediului intern al organismului"},correct:["B","C"],basis:"Homeostazia menține mediul intern în limite normale în ciuda variațiilor externe, prin mecanisme de autoreglare și feedback negativ."},
{id:23,topic:"Planuri și raporturi",lessonSection:"1.4 Termeni direcționali",lessonPage:"termeni",text:"Pentru organismul uman, alegeți enunțurile corecte privind planurile și raporturile anatomice:",options:{A:"planul medio-sagital divide corpul în două jumătăți egale, stânga și dreapta",B:"femurul se articulează proximal cu tibia și cu rotula",C:"planul sagital împarte corpul într-o parte anterioară și una posterioară",D:"regiunea lombară a coloanei vertebrale este situată caudal față de regiunea toracală",E:"planul orizontal împarte corpul într-o parte superioară și una inferioară"},correct:["A","D","E"],basis:"Planul mediosagital împarte în jumătăți egale dreapta-stânga, planul orizontal în superior-inferior, iar caudal indică direcția spre partea inferioară."},
{id:24,topic:"Celulă",lessonSection:"1.2 Niveluri de organizare structurală",lessonPage:"organizare",text:"Care dintre afirmațiile cu privire la celulă nu sunt corecte?",options:{A:"reprezintă un nivel de organizare funcțională",B:"reprezintă unitatea fundamentală a organismelor vii",C:"reprezintă un nivel de organizare intermediar/ inferior moleculei și organismului",D:"reprezintă cel mai simplu nivel de organizare structurală",E:"reprezintă nivelul final de organizare structurală"},correct:["A","C","D","E"],askIncorrect:true,basis:"Celula este unitatea fundamentală a organismelor vii; atomul este cel mai simplu nivel, iar sistemele de organe reprezintă nivelul superior."},
{id:25,topic:"Țesuturi",lessonSection:"1.2 Niveluri de organizare structurală",lessonPage:"organizare",text:"Selectați enunțurile incorecte privind țesutul:",options:{A:"reprezintă un grup de celule care îndeplinesc aceeași funcție",B:"nu este inferior organului",C:"sunt patru tipuri principale în organism",D:"fiecare țesut îndeplinește anumite roluri în organism",E:"reprezintă un grup de celule cu structură diferită"},correct:["B","E"],askIncorrect:true,basis:"Țesutul este un grup de celule cu structură similară și aceeași funcție; organul este nivelul superior țesutului."},
{id:26,topic:"Afirmații mixte",lessonSection:"1.5 Cavități și regiuni",lessonPage:"cavitati",text:"Selectați afirmațiile incorecte:",options:{A:"coastele sunt situate în profunzime față de plămâni",B:"planul parasagital divide corpul în două părți inegale (anterioară și posterioară)",C:"mediastinul conține inima, timusul, esofagul, plămânii, traheea, bronhiile, precum și vase sanguine și limfatice",D:"lichidul seros dintre membranele seroase permite organelor să alunece cu ușurință pe pereții cavităților corpului",E:"termenul medial se referă la o direcție apropiată de linia medială a corpului"},correct:["A","B","C","E"],askIncorrect:true,basis:"Coastele sunt superficiale față de plămâni, parasagitalul împarte dreapta-stânga inegal, mediastinul exclude plămânii, iar termenul corect este linia mediană."},
{id:27,topic:"Reproducere",lessonSection:"1.3 Funcții ale organismului",lessonPage:"functii",text:"Care dintre afirmațiile cu privire la reproducere sunt corecte?",options:{A:"poate fi asexuată atunci când se obțin două celule diferite, necesare creșterii sau reparației țesuturilor",B:"este sexuată atunci când implică producerea de spermatozoizi și ovule și contopirea acestora",C:"poate fi asexuată și sexuată",D:"este o caracteristică importantă a homeostaziei",E:"reprezintă capacitatea organismului de a procrea"},correct:["B","C","E"],basis:"Reproducerea este capacitatea de a procrea; poate fi sexuată, prin ovule și spermatozoizi, sau asexuată, prin diviziunea unei celule în două celule fiice identice."},
{id:28,topic:"Feedback",lessonSection:"1.3 Funcții ale organismului",lessonPage:"functii",text:"Selectați afirmațiile corecte privind valoarea de referință a unui mecanism de feed-back:",options:{A:"reprezintă valoarea normală a unui factor variabil",B:"în caz de modificare, devierea ei este detectată de un efector",C:"reprezintă punctul față de care se îndepărtează sistemul prin feed-back negativ",D:"este o expresie a menținerii relativ constante a parametrilor mediului intern",E:"poate fi menținută și prin intervenția sistemului endocrin"},correct:["A","D","E"],basis:"Valoarea de referință este valoarea normală a factorului variabil, devierea este detectată de receptori, iar sistemele endocrin și nervos pot interveni în reglare."},
{id:29,topic:"Poziție anatomică",lessonSection:"1.4 Termeni direcționali",lessonPage:"termeni",text:"În poziție anatomică, nasul este poziționat:",options:{A:"cranial și anterior",B:"cefalic și dorsal",C:"caudal și anterior",D:"cefalic și anterior/ ventral",E:"lateral față de ochi"},correct:["A","D"],basis:"Cranial și cefalic indică spre cap, anterior sau ventral indică partea din față, iar nasul este medial față de ochi."},
{id:30,topic:"Raporturi anatomice",lessonSection:"1.4 Termeni direcționali",lessonPage:"termeni",text:"În poziție anatomică, vezica biliară și splina sunt poziționate:",options:{A:"ipsilateral",B:"controlateral",C:"în hipocondrul drept",D:"în epigastru",E:"controlateral, în flancuri"},correct:["B"],basis:"Vezica biliară și splina sunt pe părți opuse ale corpului, deci sunt controlaterale."},
{id:31,topic:"Raporturi anatomice",lessonSection:"1.4 Termeni direcționali",lessonPage:"termeni",text:"În poziție anatomică, următoarele afirmații privind raporturile anatomice sunt corecte:",options:{A:"antebrațul este situat distal față de braț",B:"colonul ascendent și cel descendent sunt situate ipsilateral",C:"trunchiul pulmonar este situat caudal de arcul aortic",D:"palma stângă este în pronație, ipsilateral cu splina",E:"antebrațul este situat proximal de articulația cotului"},correct:["A","C"],basis:"Distal înseamnă mai departe de atașarea membrului, ipsilateral înseamnă aceeași parte, iar în poziție anatomică palmele sunt orientate anterior, nu în pronație."},
{id:32,topic:"Planuri anatomice",lessonSection:"1.4 Termeni direcționali",lessonPage:"termeni",text:"Pentru organismul uman, alegeți afirmațiile corecte privind planurile anatomice:",options:{A:"planul mediosagital trece prin coloana vertebrală, stern și inimă",B:"în plan frontal, ficatul este inferior față de plămânul drept și diafragmă",C:"un plan parasagital divide corpul în două jumătăți inegale, anterioară și posterioară",D:"planul frontal împarte corpul în 2 jumătăți egale",E:"planul orizontal este perpendicular pe planul sagital"},correct:["A","B","E"],basis:"Planul mediosagital trece prin linia mediană, planul frontal permite raporturi superior-inferior, iar planul orizontal este perpendicular pe planul sagital."},
{id:33,topic:"Cavități principale",lessonSection:"1.5 Cavități și regiuni",lessonPage:"cavitati",text:"Într-o secțiune prin planul mediosagital, se disting:",options:{A:"două cavități, cea posterioară și abdomino-pelviană",B:"o singură cavitate, cea toracică, situată superior de diafragmă",C:"două cavități principale, anterioară și posterioară",D:"trei cavități, posterioară, toracică și abdomino-pelviană",E:"patru cavități: posterioară, anterioară, ventrală și toracică"},correct:["C","D"],basis:"Cavitățile principale sunt posterioară și anterioară; cavitatea anterioară se subdivide în toracică și abdomino-pelviană."},
{id:34,topic:"Cavitatea toracică",lessonSection:"1.5 Cavități și regiuni",lessonPage:"cavitati",text:"Cavitatea toracică cuprinde:",options:{A:"două cavități pleurale, dreaptă și stângă, și o cavitate peritoneală",B:"cavitatea pericardică, medial de cavitățile pleurale",C:"cavitatea craniană și canalul rahidian",D:"epigastru și hipogastru",E:"două cavități pleurale și o cavitate pericardică"},correct:["B","E"],basis:"Cavitatea toracică include cavitățile pleurale dreaptă și stângă și cavitatea pericardică situată medial."},
{id:35,topic:"Regiuni abdomino-pelviene",lessonSection:"1.5 Cavități și regiuni",lessonPage:"cavitati",text:"Față de regiunea ombilicală:",options:{A:"hipocondrul drept este situat cranial, lateral, dreapta",B:"hipogastrul se găsește caudal",C:"epigastrul este anterior",D:"regiunile inghinale (iliace) sunt dispuse caudal și lateral",E:"flancul stâng este situat medial"},correct:["A","B","D"],basis:"Regiunea ombilicală este centrală; epigastrica este superior, hipogastrica inferior, hipocondrurile sunt superolaterale, flancurile laterale, iar regiunile iliace inferolaterale."},
{id:36,topic:"Cavitatea abdomino-pelviană",lessonSection:"1.5 Cavități și regiuni",lessonPage:"cavitati",text:"Cavitatea abdomino-pelviană:",options:{A:"aparține cavității ventrale",B:"conține organele interne abdominale și pelviene",C:"are două membrane seroase, pleură și pericard",D:"este separată de cavitatea posterioară prin diafragmă",E:"conține stomacul și splina"},correct:["A","B","E"],basis:"Cavitatea abdomino-pelviană este subdiviziune a cavității ventrale, separată de torace prin diafragmă, și conține stomacul, splina și alte organe abdominale și pelviene."},
{id:37,topic:"Membrane seroase",lessonSection:"1.5 Cavități și regiuni",lessonPage:"cavitati",text:"Selectați afirmațiile corecte privind membranele seroase:",options:{A:"sunt reprezentate de pleure, pericard și peritoneu",B:"sunt formate din două foițe între care se găsește o cantitate mare de lichid seros",C:"acoperă total sau parțial organe din regiunea toracică și abdomino-pelviană",D:"una dintre ele, peritoneul, acoperă organele retroperitoneale doar pe fața lor anterioară",E:"foița parietală acoperă diferite organe interne"},correct:["A","C","D"],basis:"Membranele seroase sunt pleura, pericardul și peritoneul; au foiță viscerală și parietală, cu o cantitate mică de lichid seros între ele."},
{id:38,topic:"Membrane seroase",lessonSection:"1.5 Cavități și regiuni",lessonPage:"cavitati",text:"Selectați afirmațiile corecte:",options:{A:"cavitatea pericardică se află între inimă și mediastin",B:"foița viscerală a pleurei tapetează cavitatea în care se află inima",C:"pericardul visceral se numește epicard",D:"lichidul seros secretat de membranele seroase este produs de celulele sanguine din aceste membrane",E:"lichidul seros permite organelor să alunece cu ușurință între ele, fără frecare"},correct:["C","E"],basis:"Foița viscerală acoperă organul, foița parietală căptușește cavitatea, iar lichidul seros permite alunecarea fără frecare; pericardul visceral este epicardul."},
{id:39,topic:"Subdiviziuni",lessonSection:"1.1 Introducere",lessonPage:"introducere",text:"Dintre subdiviziunile anatomiei nu face parte:",options:{A:"anatomia dezvoltării",B:"anatomia macroscopică",C:"histologia",D:"anatomia microscopică",E:"citologia"},correct:["E"],basis:"Subdiviziunile anatomiei sunt anatomia macroscopică, anatomia microscopică sau histologia și anatomia dezvoltării; citologia este subdiviziune a fiziologiei."},
{id:40,topic:"Celulă",lessonSection:"1.2 Niveluri de organizare structurală",lessonPage:"organizare",text:"Selectați afirmațiile corecte privind celula:",options:{A:"este cel mai simplu nivel de organizare",B:"este nivelul imediat superior atomului",C:"conține și structuri subcelulare, precum ribozomii sau lizozomii",D:"este unitatea fundamentală a organismelor vii",E:"cele cu structură și funcție similare formează țesuturi"},correct:["C","D","E"],basis:"Celula este unitatea fundamentală a organismelor vii, conține structuri subcelulare, iar celulele asemănătoare formează țesuturi; atomul este cel mai simplu nivel."},
{id:41,topic:"Regiuni abdomino-pelviene",lessonSection:"1.5 Cavități și regiuni",lessonPage:"cavitati",text:"Față de flancul drept:",options:{A:"flancul stâng este controlateral",B:"hipocondrul drept este caudal",C:"regiunea ombilicală este plasată lateral",D:"regiunea inghinală stângă (iliacă) este plasată cranial",E:"hipogastrul este plasat caudal și medial"},correct:["A","E"],basis:"Flancurile sunt laterale de regiunea ombilicală, hipocondrurile sunt superioare, iar hipogastrul este inferior și median."},
{id:42,topic:"Homeostazie",lessonSection:"1.3 Funcții ale organismului",lessonPage:"functii",text:"Care dintre următoarele afirmații referitoare la homeostazie sunt adevărate?",options:{A:"reprezintă procesul de oprire a unei hemoragii",B:"reprezintă capacitatea organismului de a menține în limite normale parametrii mediului înconjurător",C:"reprezintă capacitatea organismului de a menține în limite normale parametrii mediului intern",D:"constă în distrugerea hematiilor sub acțiunea unei soluții hipotone",E:"poate fi perturbată în condiții de hipoxie"},correct:["C","E"],basis:"Homeostazia menține în limite normale parametrii mediului intern și poate fi perturbată de lipsa de oxigen."},
{id:43,topic:"Termeni direcționali",lessonSection:"1.4 Termeni direcționali",lessonPage:"termeni",text:"Următorii termeni direcționali sunt corecți, cu excepția:",options:{A:"medial - de aceeași parte a corpului",B:"lateral - de partea opusă a corpului",C:"distal - la distanță față de locul de atașare a unui membru de trunchi",D:"superficial - spre suprafața corpului",E:"caudal - spre partea superioară a unei structuri"},correct:["A","B","E"],askIncorrect:true,basis:"Medial înseamnă aproape de linia mediană, lateral înseamnă departe de linia mediană, distal înseamnă departe de atașare, superficial spre suprafață, iar caudal spre partea inferioară."},
{id:44,topic:"Planuri anatomice",lessonSection:"1.4 Termeni direcționali",lessonPage:"termeni",text:"Planul mediosagital:",options:{A:"divide corpul în două jumătăți egale: superioară și inferioară",B:"este un plan vertical, similar planului coronal",C:"permite realizarea unor secțiuni transversale/ paralele cu planul",D:"împarte corpul în două jumătăți egale: stângă și dreaptă",E:"separă corpul în două părți inegale"},correct:["B","D"],basis:"Planul mediosagital este vertical și împarte corpul în două jumătăți egale, stângă și dreaptă; planul orizontal împarte superior-inferior."},
{id:45,topic:"Cavități",lessonSection:"1.5 Cavități și regiuni",lessonPage:"cavitati",text:"Care dintre afirmațiile următoare referitoare la cavitățile organismului sunt corecte:",options:{A:"cavitatea peritoneală conține organele interne toracice, abdominale și pelviene",B:"cavitatea toracică prezintă o regiune centrală, cavitatea pleurală, și două cavități laterale, pericardică",C:"cavitatea posterioară a corpului este delimitată de pereți osoși și adăpostește sistemul nervos central",D:"la nivelul cavității rahidiene se găsește măduva spinării înconjurată de meningele spinal",E:"mediastinul este situat în centrul cavității toracice"},correct:["C","D","E"],basis:"Cavitatea posterioară este delimitată de structuri osoase și adăpostește encefalul și măduva spinării; mediastinul este regiunea centrală a cavității toracice."},
{id:46,topic:"Regiuni abdomino-pelviene",lessonSection:"1.5 Cavități și regiuni",lessonPage:"cavitati",text:"Cavitatea abdomino-pelviană este subîmpărțită în următoarele regiuni:",options:{A:"epigastrică - situată în centrul abdomenului",B:"ombilicală - situată inferior de regiunea epigastrică",C:"hipogastrică - situată superior față de regiunea ombilicală",D:"inghinale - dispuse lateral față de regiunea hipogastrică",E:"flancurile - situate inferior față de hipocondrul și superior față de regiunea iliacă"},correct:["B","D","E"],basis:"Regiunea ombilicală este centrală și inferior de epigastrică, hipogastrica este inferior de ombilicală, iar inghinalele sunt laterale de hipogastrică."},
{id:47,topic:"Mediastin",lessonSection:"1.5 Cavități și regiuni",lessonPage:"cavitati",text:"La nivelul mediastinului întâlnim:",options:{A:"cavitatea pericardică",B:"cavitățile pleurale",C:"traheea",D:"timusul",E:"esofagul"},correct:["A","C","D","E"],basis:"Mediastinul conține inima în cavitatea pericardică, timusul, o parte din esofag, traheea, bronhiile, vasele și nodulii limfatici; plămânii și cavitățile pleurale sunt laterale."},
{id:48,topic:"Membrane seroase",lessonSection:"1.5 Cavități și regiuni",lessonPage:"cavitati",text:"Următoarele afirmații privind seroasele sunt corecte:",options:{A:"au două foițe: parietală și viscerală",B:"foița viscerală tapetează la interior pereții unei cavități",C:"foița parietală învelește un viscer",D:"sunt reprezentate de pleură, endocard și peritoneu",E:"conțin, în spațiul dintre cele două foițe, o cantitate redusă de lichid seros cu rol de lubrifiere"},correct:["A","E"],basis:"Membranele seroase au foiță viscerală și parietală, cu o cantitate mică de lichid seros între ele; exemplele sunt pleura, pericardul și peritoneul."},
{id:49,topic:"Afirmații mixte",lessonSection:"1.5 Cavități și regiuni",lessonPage:"cavitati",text:"Selectați afirmațiile corecte:",options:{A:"unitatea fundamentală a organismelor vii este țesutul",B:"în cazul poziției anatomice, policele este orientat spre exterior, iar palmele sunt orientate spre posterior",C:"traheea este situată anterior față de esofag",D:"cavitatea pelviană conține și vezica urinară",E:"lichidul seros permite glisarea celor două foițe ale membranelor seroase fără frecare"},correct:["C","D","E"],basis:"Celula este unitatea fundamentală, în poziție anatomică palmele sunt anterioare, traheea este anterior de esofag, cavitatea pelviană conține vezica urinară, iar lichidul seros reduce frecarea."},
{id:50,topic:"Reproducere",lessonSection:"1.3 Funcții ale organismului",lessonPage:"functii",text:"Care dintre următoarele afirmații privind funcția de reproducere sunt adevărate?",options:{A:"este una dintre funcțiile importante",B:"se realizează exclusiv pe cale sexuată",C:"pe cale asexuată, se contopesc un spermatozoid cu un ovul pentru a forma un ovul fecundat",D:"poate fi sexuată sau asexuată",E:"reprezintă capacitatea organismului de a procrea"},correct:["A","D","E"],basis:"Reproducerea este o funcție importantă, reprezintă capacitatea de a procrea și poate fi sexuată sau asexuată."},
{id:51,topic:"Planuri anatomice",lessonSection:"1.4 Termeni direcționali",lessonPage:"termeni",text:"Despre planurile corpului uman sunt adevărate afirmațiile următoare:",options:{A:"planul sagital este vertical și împarte corpul într-o parte dreaptă și una stângă",B:"planul sagital poartă numele și de plan coronal",C:"planul frontal împarte corpul într-o parte ventrală și una dorsală",D:"planul mediosagital divide corpul în două părți inegale",E:"planul orizontal împarte corpul într-o parte superioară și una inferioară"},correct:["A","C","E"],basis:"Planul sagital împarte dreapta-stânga, planul frontal sau coronal împarte ventral-dorsal, iar planul orizontal împarte superior-inferior."},
{id:52,topic:"Cavitatea toracică",lessonSection:"1.5 Cavități și regiuni",lessonPage:"cavitati",text:"Următoarele afirmații referitoare la cavitatea toracică sunt adevărate:",options:{A:"este delimitată de coaste și mușchi intercostali",B:"face parte din cavitatea posterioară a corpului",C:"conține o cavitate pleurală stângă și una dreaptă",D:"adăpostește plămânii, localizați în mediastin",E:"conține cavitatea pericardică, situată medial față de cavitățile pleurale"},correct:["A","C","E"],basis:"Cavitatea toracică este delimitată de coaste și mușchi intercostali, conține cavitățile pleurale și cavitatea pericardică; plămânii nu sunt în mediastin."},
{id:53,topic:"Cavitatea abdomino-pelviană",lessonSection:"1.5 Cavități și regiuni",lessonPage:"cavitati",text:"Afirmațiile corecte despre cavitatea abdomino-pelviană sunt:",options:{A:"este mai des întâlnită sub denumirea de cavitate pelviană",B:"este separată de cavitatea toracică printr-un mușchi numit diafragmă",C:"subdiviziunea abdominală conține două glande digestive mari",D:"subdiviziunea pelviană conține vezica urinară și intestinele",E:"subdiviziunea abdominală conține organe precum stomacul, splina și ficatul"},correct:["B","C","E"],basis:"Cavitatea abdomino-pelviană este separată de torace prin diafragmă; subdiviziunea abdominală conține stomacul, splina, ficatul și alte organe."},
{id:54,topic:"Tegument",lessonSection:"1.2 Niveluri de organizare structurală",lessonPage:"organizare",text:"Selectați afirmațiile corecte despre tegument:",options:{A:"este format din piele, păr, unghii, glande endocrine",B:"acoperă și protejează corpul",C:"este format din cartilaje, păr, unghii",D:"realizează protecția corpului și integrează activitățile organismului",E:"este format din piele, păr, unghii, glande sudoripare"},correct:["B","E"],basis:"Tegumentul este format din piele, păr, unghii și glande sudoripare și are rol de acoperire și protecție."},
{id:55,topic:"Organizare structurală",lessonSection:"1.2 Niveluri de organizare structurală",lessonPage:"organizare",text:"În organizarea structurală a corpului uman sunt cuprinse:",options:{A:"moleculele, la cel mai simplu nivel",B:"atomi de O, C, N și Na",C:"molecule ca apă, clorură de sodiu",D:"organe compuse dintr-un singur țesut",E:"sisteme de organe cu aceeași funcție"},correct:["B","C"],basis:"Atomii sunt cel mai simplu nivel, moleculele rezultă prin combinarea atomilor, organele au mai multe țesuturi, iar sistemele reunesc organe cu funcții complementare."},
{id:56,topic:"Funcții ale organismului",lessonSection:"1.3 Funcții ale organismului",lessonPage:"functii",text:"Selectați afirmațiile corecte:",options:{A:"homeostazia menține parametrii mediului extern în limite normale",B:"excreția reprezintă procesul de eliminare a produșilor de sinteză",C:"metabolismul prezintă două subcategorii: catabolismul și anabolismul",D:"mișcarea voluntară este rezultatul contracției mușchilor scheletici",E:"conductibilitatea este proprietatea unor celule de a propaga potențiale de acțiune sub formă de undă de depolarizare"},correct:["C","D","E"],basis:"Metabolismul include anabolismul și catabolismul, mișcarea voluntară implică mușchii scheletici, iar conductibilitatea este transmiterea stimulilor; homeostazia privește mediul intern."},
{id:57,topic:"Feedback",lessonSection:"1.3 Funcții ale organismului",lessonPage:"functii",text:"Sistemele de autoreglare ale organismului cuprind:",options:{A:"feed-back-ul pozitiv, care determină devierea de la valoarea de referință până la obținerea răspunsului dorit",B:"valoarea de referință, care reprezintă valoarea normală a unui factor variabil",C:"feed-back-ul negativ, care intervine în mod excepțional pentru menținerea homeostaziei",D:"receptorul, care detectează devierile de la valoarea de referință",E:"efectorii, care readuce organismul la starea de echilibru"},correct:["A","B","D","E"],basis:"Feedbackul pozitiv amplifică devierea până la răspunsul dorit, feedbackul negativ este principalul mecanism homeostatic, iar mecanismul include valoare de referință, receptori, centru de control și efectori."},
{id:58,topic:"Regiuni abdomino-pelviene",lessonSection:"1.5 Cavități și regiuni",lessonPage:"cavitati",text:"Alegeți afirmațiile corecte cu privire la diviziunile suplimentare ale cavității abdomino-pelviene:",options:{A:"regiunea ombilicală se află în centrul abdomenului",B:"regiunea hipogastrică se află superior față de regiunea ombilicală",C:"regiunea epigastrică este situată între hipocondrul drept și stâng",D:"lateral de regiunea ombilicală se află flancurile stâng și drept",E:"lateral de regiunea hipogastrică se află regiunile iliace"},correct:["A","C","D","E"],basis:"Regiunea ombilicală este centrală, epigastrica este între hipocondruri, flancurile sunt laterale de ombilicală, iar regiunile iliace sunt laterale de hipogastrică."},
{id:59,topic:"Sisteme de organe",lessonSection:"1.2 Niveluri de organizare structurală",lessonPage:"organizare",text:"Despre sisteme se pot afirma următoarele:",options:{A:"endocrin - coordonează și integrează mecanic activitățile organismului",B:"nervos - integrează informațiile primite prin stimuli și coordonează funcțiile organismului",C:"circulator - transportă celule și substanțe în tot corpul",D:"imunitar - interacționează cu agenți străini",E:"respirator - colectează dioxidul de carbon și elimină oxigenul"},correct:["B","C","D"],basis:"Sistemul nervos integrează informații și coordonează funcții, circulatorul transportă celule și substanțe, imunitarul interacționează cu agenți străini, respiratorul colectează oxigen și elimină dioxid de carbon."},
{id:60,topic:"Raporturi anatomice",lessonSection:"1.4 Termeni direcționali",lessonPage:"termeni",text:"Selectați afirmațiile corecte:",options:{A:"esofagul este situat anterior de trahee",B:"colonul ascendent și colonul descendent sunt situate ipsilateral",C:"tibia se află distal față de femur",D:"humerusul este localizat proximal de ulnă",E:"inima este situată posterior față de stern"},correct:["C","D","E"],basis:"Traheea este anterior de esofag, colonul ascendent și descendent sunt controlaterale, iar distal/proximal descriu distanța față de atașarea membrului."}
];
const OPTION_NOTES={
1:{A:"Tegumentul este alcătuit din piele, păr, unghii și glande sudoripare, nu din glande endocrine.",B:"Tegumentul acoperă și protejează corpul, conform tabelului sistemelor de organe.",C:"Cartilajele aparțin sistemului scheletic, nu tegumentului.",D:"Tegumentul conține receptori, deci participă la recepția stimulilor.",E:"Glandele sudoripare sunt enumerate ca parte a tegumentului."},
2:{A:"Țesutul conjunctiv este unul dintre tipurile principale de țesut.",B:"Țesutul epitelial este unul dintre tipurile principale de țesut.",C:"Țesutul nervos este unul dintre tipurile principale de țesut.",D:"Cartilajul nu este listat ca tip principal separat; ține de țesutul conjunctiv.",E:"Sângele este exemplu de țesut conjunctiv, nu tip principal separat."},
3:{A:"Stomacul are țesut epitelial în structura lui.",B:"Stomacul are țesut muscular neted, nu muscular striat.",C:"Stomacul conține țesut nervos.",D:"Stomacul conține țesut conjunctiv.",E:"Epidermul este exemplu de țesut epitelial al pielii, nu țesut specific stomacului."},
4:{A:"Sistemul osos are rol de protecție și suport, nu de integrare a activității întregului organism.",B:"Sistemul circulator transportă celule și substanțe.",C:"Sistemul imunitar interacționează cu agenți străini.",D:"Sistemul nervos integrează informațiile și coordonează funcțiile organismului.",E:"Sistemul digestiv realizează digestia și absorbția nutrienților."},
5:{A:"Un sistem de organe reunește organe cu funcții complementare; sistemul digestiv respectă această regulă.",B:"Un organ este alcătuit din două sau mai multe tipuri de țesuturi, nu obligatoriu doar două sau trei.",C:"Catabolismul descompune materia organică și de obicei produce energie.",D:"Conductibilitatea apare la celule specializate, precum cele nervoase și musculare.",E:"Reproducerea asexuată apare în creștere, reparare și înlocuirea celulelor."},
6:{A:"Celula procariotă nu are nucleu delimitat și organite ca celula eucariotă.",B:"Citoplasma celulei eucariote are consistență de gel.",C:"Componentele celulei nu sunt doar membrana și nucleul; lecția menționează și citoplasmă și structuri subcelulare.",D:"Nu toate celulele corpului uman păstrează nucleul.",E:"Celulele eucariote se pot divide prin mitoză."},
7:{A:"Celula musculară a organismului uman este eucariotă, nu procariotă.",B:"La nivelul inimii nu se descriu mai mulți nuclei poziționați central ca regulă pentru celula musculară.",C:"Celula musculară se contractă sub acțiunea unui stimul.",D:"Fiind celulă vie, are metabolism propriu.",E:"Fibra musculară striată scheletică are miofibrile alcătuite din sarcomere."},
8:{A:"Aportul optim de substanțe organice susține funcționarea normală, nu dezechilibrul.",B:"Boala este menționată ca factor care perturbă homeostazia.",C:"Căldura excesivă perturbă homeostazia.",D:"Lipsa sau aportul scăzut de oxigen perturbă homeostazia.",E:"Durerea este menționată ca factor care perturbă homeostazia."},
9:{A:"În poziție anatomică membrele superioare sunt pe lângă corp, nu îndepărtate în abducție.",B:"Membrele superioare sunt apropiate de corp, deci în adducție.",C:"Poziția anatomică presupune membrele superioare pe lângă corp.",D:"În poziție anatomică policele este orientat spre exterior.",E:"Palmele sunt orientate înainte, nu în pronație."},
10:{A:"Sternul este pe fața anterioară a corpului.",B:"Scapula este situată posterior.",C:"Coatele se află posterior când corpul este în poziție anatomică.",D:"Fața dorsală a mâinii este pe partea posterioară.",E:"Patela este situată anterior la genunchi."},
11:{A:"Inima este posterior de stern, deci are raport anterior cu sternul.",B:"Diafragma este inferior față de inimă; formularea cere raport inferior al inimii cu diafragmul și nu este acceptată în barem.",C:"Inima este situată superior față de diafragm.",D:"Inima se află medial față de plămâni, în mediastin.",E:"Coloana vertebrală este posterior față de inimă, nu invers."},
12:{A:"Plămânii sunt profund față de coaste.",B:"Inima este medial față de plămâni, deci plămânii nu sunt medial față de inimă.",C:"Plămânii sunt superior față de diafragm.",D:"Foița viscerală acoperă organul; foița parietală căptușește cavitatea.",E:"Plămânii sunt în cavitățile pleurale, iar mediastinul este regiunea dintre ele."},
13:{A:"Transportul celulelor și substanțelor este rolul sistemului circulator.",B:"Sistemul respirator elimină dioxidul de carbon, produs al metabolismului.",C:"Catabolismul produce de obicei energie, nu o consumă.",D:"Diviziunea unei singure celule aparține reproducerii asexuate.",E:"Conductibilitatea presupune propagarea stimulului de-a lungul celulelor excitabile."},
14:{A:"Mișcarea rezultă din contracția celulelor musculare și poate fi voluntară sau involuntară.",B:"Excreția elimină produși de degradare ai organismului, nu moleculele absorbite digestiv.",C:"Formarea unui nou individ aparține reproducerii sexuate.",D:"Afirmația descrie sistemul urinar, dar itemul cere funcții ale organismului.",E:"Excitabilitatea este capacitatea de a răspunde la stimuli interni sau externi."},
15:{A:"Lipsa de oxigen este menționată ca factor care perturbă homeostazia.",B:"Receptorii detectează devierile față de valoarea de referință.",C:"Insulina se eliberează când glicemia crește, pentru a o scădea.",D:"Planul parasagital împarte corpul în părți dreaptă și stângă inegale, nu simetrice.",E:"În poziție anatomică policele este orientat spre exterior, nu medial."},
16:{A:"Stomacul, organ abdominal, conține țesut epitelial.",B:"Scheletul conține țesut conjunctiv, prin țesutul osos și cartilaginos.",C:"Țesutul muscular nu este de un singur tip.",D:"Organele de simț includ țesut nervos.",E:"Țesutul endocrin nu este unul dintre cele patru tipuri principale reținute aici."},
17:{A:"Sistemul circulator include și sângele și structurile limfatice, nu doar inima și vasele.",B:"Sistemul imunitar cuprinde limfocite cu rol în apărare.",C:"Sistemul urinar nu este localizat doar în pelvis.",D:"Sistemul digestiv absoarbe nutrienți solubili, nu toți componenții hranei.",E:"Sistemele reunesc organe cu funcții complementare, nu neapărat aceeași funcție."},
18:{A:"Cavitatea abdominală este delimitată superior de diafragmă.",B:"Regiunea ombilicală este centrală și poate conține anse intestinale.",C:"Ficatul este asociat cu partea dreaptă, nu cu hipocondrul stâng.",D:"Afirmația este prea absolută; lecția spune stomac, intestin subțire și gros și alte organe, nu toate segmentele.",E:"Peritoneul acoperă anterior organe retroperitoneale, deci acestea sunt legate de regiunea abdomino-pelviană."},
19:{A:"Membrele superioare sunt perechi, situate pe părți opuse ale corpului.",B:"Femurul și tibia aparțin membrului inferior.",C:"Carpienele sunt mai aproape de atașarea membrului decât falangele, deci sunt proximale.",D:"În poziție anatomică ulna este medială față de radius.",E:"Sternul aparține trunchiului, nu membrelor superioare."},
20:{A:"Cavitatea dorsală include cavitatea craniană și canalul rahidian, care adăpostesc sistemul nervos central.",B:"Diafragma este mușchi scheletic, nu mușchi neted.",C:"Regiunile mediane sunt epigastrică, ombilicală și hipogastrică.",D:"Regiunea epigastrică este superioară, nu în subdiviziunea pelviană.",E:"Subdiviziunea abdominală are flanc drept și flanc stâng."},
21:{A:"Planul coronal împarte corpul în parte anterioară și posterioară.",B:"Planul parasagital este paralel cu planul mediosagital.",C:"Planul orizontal împarte corpul în parte cranială și caudală.",D:"Doar planul mediosagital împarte corpul în două părți egale.",E:"Sagital, frontal și orizontal sunt cele trei planuri principale; formularea repetă frontal/coronal și omite orizontal."},
22:{A:"În hiperglicemie crește secreția de insulină, nu de glucagon.",B:"Homeostazia se menține în ciuda variațiilor mediului extern.",C:"Sistemele de autoreglare, inclusiv cele hormonale, ajută la menținerea homeostaziei.",D:"Insulina nu crește în hipoglicemie; ea scade glicemia.",E:"Feedbackul negativ readuce parametrul spre valoarea de referință, nu îl crește permanent."},
23:{A:"Planul mediosagital împarte corpul în două jumătăți egale, stângă și dreaptă.",B:"Femurul se articulează distal cu tibia și rotula, nu proximal.",C:"Planul sagital împarte dreapta și stânga, nu anterior și posterior.",D:"Regiunea lombară este caudală față de regiunea toracală.",E:"Planul orizontal împarte corpul în parte superioară și inferioară."},
24:{A:"Celula este unitate structurală de bază, nu doar nivel funcțional.",B:"Celula este unitatea fundamentală a organismelor vii.",C:"Celula este superioară moleculei, nu inferioară moleculei.",D:"Atomul este cel mai simplu nivel de organizare structurală.",E:"Nivelul superior menționat este sistemul de organe, nu celula."},
25:{A:"Țesutul este grup de celule care lucrează împreună pentru aceeași funcție.",B:"Țesutul este inferior organului, deoarece organele sunt alcătuite din țesuturi.",C:"În organism sunt patru tipuri principale de țesuturi.",D:"Fiecare țesut are roluri specifice în organism.",E:"Celulele unui țesut au structură similară, nu diferită."},
26:{A:"Coastele sunt superficiale față de plămâni, nu în profunzime.",B:"Planul parasagital împarte dreapta și stânga inegal, nu anterior și posterior.",C:"Mediastinul conține componentele toracice cu excepția plămânilor.",D:"Lichidul seros permite alunecarea organelor pe pereții cavităților.",E:"Termenul medial se raportează la linia mediană, nu la linia medială."},
27:{A:"În reproducerea asexuată se obțin celule fiice identice, nu două celule diferite.",B:"Reproducerea sexuată implică ovule, spermatozoizi și contopirea lor.",C:"Reproducerea poate fi sexuată sau asexuată.",D:"Homeostazia este menținerea mediului intern; reproducerea este o funcție distinctă.",E:"Reproducerea reprezintă capacitatea organismului de a procrea."},
28:{A:"Valoarea de referință este valoarea normală a unui factor variabil.",B:"Devierea este detectată de receptori, nu de efectori.",C:"Feedbackul negativ reduce devierea față de valoarea de referință.",D:"Menținerea valorii de referință exprimă constanța mediului intern.",E:"Sistemul endocrin poate participa la reglarea valorii de referință."},
29:{A:"Cranial indică spre cap, iar anterior spre fața corpului.",B:"Dorsal indică posterior, iar nasul este pe fața anterioară.",C:"Caudal indică spre partea inferioară, nu spre nas.",D:"Cefalic și anterior/ventral descriu poziția nasului.",E:"Nasul este medial față de ochi, nu lateral."},
30:{A:"Vezica biliară și splina nu sunt de aceeași parte a corpului.",B:"Vezica biliară și splina sunt pe părți opuse, deci controlaterale.",C:"Doar vezica biliară este asociată cu partea dreaptă.",D:"Epigastrul este regiune mediană superioară, nu poziția ambelor organe.",E:"Cele două structuri sunt controlaterale, dar nu sunt ambele în flancuri."},
31:{A:"Antebrațul este mai departe de atașarea membrului decât brațul, deci distal.",B:"Colonul ascendent și descendent sunt pe părți opuse, deci controlaterale.",C:"Trunchiul pulmonar este inferior față de arcul aortic.",D:"În poziție anatomică palma este orientată anterior, nu în pronație.",E:"Antebrațul este distal față de articulația cotului, nu proximal."},
32:{A:"Planul mediosagital trece prin linia mediană a corpului.",B:"Ficatul este inferior față de plămânul drept și diafragmă.",C:"Planul parasagital împarte dreapta și stânga inegal, nu anterior și posterior.",D:"Planul frontal împarte anterior și posterior; nu este definit prin jumătăți egale.",E:"Planul orizontal este perpendicular pe planul sagital."},
33:{A:"Cavitatea abdomino-pelviană este subdiviziune a cavității anterioare, nu cavitate principală alături de cea posterioară.",B:"Cavitatea toracică este doar subdiviziune a cavității anterioare.",C:"Cavitățile principale sunt anterioară și posterioară.",D:"Se pot distinge cavitatea posterioară și subdiviziunile toracică și abdomino-pelviană.",E:"Anterioară și ventrală denumesc aceeași cavitate, nu două cavități diferite."},
34:{A:"Cavitatea peritoneală aparține abdomino-pelvianului, nu toracelui.",B:"Cavitatea pericardică este medială față de cavitățile pleurale.",C:"Cavitatea craniană și canalul rahidian țin de cavitatea posterioară.",D:"Epigastrul și hipogastrul sunt regiuni abdomino-pelviene.",E:"Toracele cuprinde două cavități pleurale și cavitatea pericardică."},
35:{A:"Hipocondrul drept este superior și lateral față de regiunea ombilicală.",B:"Hipogastrul este inferior, adică caudal față de ombilicală.",C:"Epigastrul este superior, nu anterior față de ombilicală.",D:"Regiunile inghinale sunt inferioare și laterale față de ombilicală.",E:"Flancul stâng este lateral, nu medial."},
36:{A:"Cavitatea abdomino-pelviană aparține cavității ventrale.",B:"Ea conține organe interne abdominale și pelviene.",C:"Pleura și pericardul sunt membrane seroase toracice, nu ale cavității abdomino-pelviene.",D:"Diafragma separă cavitatea toracică de cea abdomino-pelviană.",E:"Stomacul și splina se află în subdiviziunea abdominală."},
37:{A:"Membranele seroase sunt pleura, pericardul și peritoneul.",B:"Între foițe se găsește o cantitate mică de lichid seros, nu mare.",C:"Aceste membrane acoperă organe din torace și abdomino-pelvis.",D:"Peritoneul acoperă anterior organele retroperitoneale.",E:"Foița viscerală acoperă organele; parietala căptușește cavitatea."},
38:{A:"Cavitatea pericardică este spațiul asociat pericardului din jurul inimii, nu spațiul dintre inimă și mediastin.",B:"Pleura viscerală acoperă plămânul, nu cavitatea inimii.",C:"Pericardul visceral poartă numele de epicard.",D:"Lichidul seros este produs de membrana seroasă, nu de celulele sanguine.",E:"Lichidul seros permite alunecarea fără frecare."},
39:{A:"Anatomia dezvoltării este subdiviziune a anatomiei.",B:"Anatomia macroscopică este subdiviziune a anatomiei.",C:"Histologia este anatomie microscopică.",D:"Anatomia microscopică este subdiviziune a anatomiei.",E:"Citologia este subdiviziune a fiziologiei, nu a anatomiei."},
40:{A:"Atomul este cel mai simplu nivel de organizare.",B:"Nivelul imediat superior atomului este molecula.",C:"Celula conține structuri subcelulare precum ribozomi și lizozomi.",D:"Celula este unitatea fundamentală a organismelor vii.",E:"Celulele cu structură și funcție similare formează țesuturi."},
41:{A:"Flancul stâng este pe partea opusă față de flancul drept.",B:"Hipocondrul drept este superior față de flancul drept, nu caudal.",C:"Regiunea ombilicală este medială față de flancuri, nu laterală.",D:"Regiunea inghinală stângă este inferior, nu cranial.",E:"Hipogastrul este inferior și median față de flancul drept."},
42:{A:"Oprirea hemoragiei este exemplu de feedback pozitiv, nu definiția homeostaziei.",B:"Homeostazia se referă la mediul intern, nu la mediul înconjurător.",C:"Homeostazia menține parametrii mediului intern în limite normale.",D:"Distrugerea hematiilor în soluție hipotonă nu definește homeostazia.",E:"Hipoxia, adică lipsa de oxigen, perturbă homeostazia."},
43:{A:"Medial înseamnă aproape de linia mediană, nu de aceeași parte a corpului.",B:"Lateral înseamnă departe de linia mediană, nu de partea opusă a corpului.",C:"Distal înseamnă la distanță față de locul de atașare al membrului.",D:"Superficial înseamnă spre suprafața corpului.",E:"Caudal înseamnă spre partea inferioară, nu superioară."},
44:{A:"Împărțirea în superior și inferior aparține planului orizontal.",B:"Planul mediosagital este vertical, la fel ca planul coronal.",C:"Secțiunile transversale sunt paralele cu planul orizontal, nu cu mediosagitalul.",D:"Planul mediosagital împarte corpul în jumătăți egale stângă și dreaptă.",E:"Planul parasagital separă corpul în părți inegale."},
45:{A:"Cavitatea peritoneală aparține abdomino-pelvianului, nu conține organele toracice.",B:"Cavitățile pleurale sunt laterale, iar cavitatea pericardică este centrală.",C:"Cavitatea posterioară are pereți osoși și adăpostește sistemul nervos central.",D:"Canalul rahidian conține măduva spinării învelită de meningele spinal.",E:"Mediastinul este regiunea centrală a cavității toracice."},
46:{A:"Regiunea epigastrică este superioară celei ombilicale, nu centrul abdomenului.",B:"Regiunea ombilicală este inferior de regiunea epigastrică.",C:"Hipogastrica este inferior de ombilicală, nu superior.",D:"Regiunile inghinale sunt laterale față de hipogastrică.",E:"Flancurile sunt între hipocondruri și regiunile iliace."},
47:{A:"Cavitatea pericardică se află în mediastin.",B:"Cavitățile pleurale conțin plămânii și sunt laterale mediastinului.",C:"Traheea se află în mediastin.",D:"Timusul se află în mediastin.",E:"Esofagul este menționat ca fiind, cel puțin parțial, în mediastin."},
48:{A:"Seroasele au foiță parietală și foiță viscerală.",B:"Foița viscerală acoperă organul; parietala căptușește peretele cavității.",C:"Foița parietală căptușește cavitatea, nu învelește viscerul.",D:"Seroasele sunt pleura, pericardul și peritoneul; endocardul nu este în listă.",E:"Între foițe există o cantitate redusă de lichid seros cu rol lubrifiant."},
49:{A:"Unitatea fundamentală a organismelor vii este celula, nu țesutul.",B:"În poziție anatomică palmele sunt orientate anterior, nu posterior.",C:"Traheea este anterior față de esofag.",D:"Cavitatea pelviană conține vezica urinară.",E:"Lichidul seros reduce frecarea dintre foițele seroase."},
50:{A:"Reproducerea este una dintre funcțiile importante ale organismului.",B:"Reproducerea poate fi și asexuată, nu exclusiv sexuată.",C:"Contopirea spermatozoidului cu ovulul este reproducere sexuată, nu asexuată.",D:"Reproducerea poate fi sexuată sau asexuată.",E:"Reproducerea este capacitatea organismului de a procrea."},
51:{A:"Planul sagital este vertical și împarte corpul în dreapta și stânga.",B:"Planul coronal este plan frontal, nu sagital.",C:"Planul frontal împarte corpul în parte ventrală și dorsală.",D:"Planul mediosagital împarte corpul în două părți egale, nu inegale.",E:"Planul orizontal împarte corpul în superior și inferior."},
52:{A:"Cavitatea toracică este delimitată de coaste și mușchi intercostali.",B:"Cavitatea toracică este parte a cavității anterioare, nu posterioare.",C:"Toracele conține cavitate pleurală stângă și dreaptă.",D:"Plămânii sunt în cavitățile pleurale; mediastinul îi exclude.",E:"Cavitatea pericardică este medială față de cavitățile pleurale."},
53:{A:"Denumirea folosită este cavitate abdomino-pelviană sau peritoneală, nu doar cavitate pelviană.",B:"Diafragma separă cavitatea toracică de cea abdomino-pelviană.",C:"Subdiviziunea abdominală conține ficatul și pancreasul, glande digestive mari.",D:"Subdiviziunea pelviană conține vezica urinară și rectul, nu intestinele în general.",E:"Stomacul, splina și ficatul sunt organe ale subdiviziunii abdominale."},
54:{A:"Tegumentul are glande sudoripare, nu glande endocrine.",B:"Tegumentul acoperă și protejează corpul.",C:"Cartilajele aparțin scheletului, nu tegumentului.",D:"Integrarea activităților organismului este rolul sistemului nervos.",E:"Tegumentul este format din piele, păr, unghii și glande sudoripare."},
55:{A:"Atomii, nu moleculele, reprezintă cel mai simplu nivel.",B:"Oxigenul, carbonul, azotul și sodiul sunt exemple de elemente alcătuite din atomi.",C:"Apa și clorura de sodiu sunt exemple de molecule.",D:"Organele sunt alcătuite din două sau mai multe tipuri de țesuturi.",E:"Sistemele de organe au funcții complementare, nu aceeași funcție."},
56:{A:"Homeostazia menține mediul intern, nu mediul extern.",B:"Excreția elimină produși de degradare, nu produși de sinteză.",C:"Metabolismul include anabolismul și catabolismul.",D:"Mișcarea voluntară rezultă din contracția mușchilor scheletici.",E:"Conductibilitatea este propagarea unui stimul sub formă de undă de depolarizare."},
57:{A:"Feedbackul pozitiv amplifică devierea până la răspunsul dorit.",B:"Valoarea de referință este valoarea normală a factorului variabil.",C:"Feedbackul negativ este principalul mecanism de menținere a homeostaziei, nu unul excepțional.",D:"Receptorul detectează devierea de la valoarea de referință.",E:"Efectorii produc răspunsul care readuce organismul spre echilibru."},
58:{A:"Regiunea ombilicală este în centrul abdomenului.",B:"Hipogastrica este inferior față de ombilicală, nu superior.",C:"Epigastrica este între hipocondrul drept și cel stâng.",D:"Flancurile drept și stâng sunt laterale de regiunea ombilicală.",E:"Regiunile iliace sunt laterale de regiunea hipogastrică."},
59:{A:"Sistemul endocrin coordonează chimic activitățile organismului, nu mecanic.",B:"Sistemul nervos integrează informațiile primite prin stimuli și coordonează funcțiile.",C:"Sistemul circulator transportă celule și substanțe în corp.",D:"Sistemul imunitar interacționează cu agenți străini.",E:"Sistemul respirator colectează oxigenul și elimină dioxidul de carbon."},
60:{A:"Traheea este anterior față de esofag, deci esofagul este posterior față de trahee.",B:"Colonul ascendent și descendent sunt pe părți opuse, deci controlaterale.",C:"Tibia este distală față de femur.",D:"Humerusul este proximal față de ulnă.",E:"Inima este posterior față de stern."}
};
const QUESTIONS=RAW_QUESTIONS.map(function(q){
  const explanations={};
  Object.keys(q.options).forEach(function(letter){
    const inAnswer=q.correct.includes(letter);
    const customNote=(OPTION_NOTES[q.id]||{})[letter];
    const prefix=q.askIncorrect
      ? (inAnswer?'Corect pentru cerință. Afirmația este incorectă: ':'Greșit pentru cerință. Afirmația este corectă: ')
      : (inAnswer?'Corect. ':'Greșit. ');
    explanations[letter]={isCorrect:inAnswer,text:prefix+(customNote||q.basis),added:''};
  });
  return Object.assign({},q,{explanations:explanations});
});
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
function getLessonInfo(q){return {section:q.lessonSection,page:q.lessonPage}}
function explanationFor(q,opt){return q.explanations[opt.letter]}
function totalPages(){return Math.ceil(QUESTIONS.length/PAGE_SIZE)}
function isQuizComplete(){return QUESTIONS.every(function(q){return quizState[q.id]&&quizState[q.id].submitted})}
function correctStatus(q,selected){
  const cSet=new Set(q.correct);
  const full=selected.length===q.correct.length&&selected.every(function(s){return cSet.has(s)});
  const partial=!full&&selected.some(function(s){return cSet.has(s)});
  return {full:full,partial:partial};
}
function showToast(msg){
  let t=byId('intro-toast');
  if(!t){t=document.createElement('div');t.id='intro-toast';t.className='toast';document.body.appendChild(t)}
  t.textContent=msg;t.classList.add('show');
  setTimeout(function(){t.classList.remove('show')},2200);
}
function renderPagination(targetId){
  const target=byId(targetId);
  if(!target)return;
  const total=totalPages();
  target.innerHTML='<button class="gbtn gbtn-secondary" type="button" onclick="introQuizPrevPage()" '+(currentPage<=1?'disabled':'')+'>← Pagina anterioară</button><span class="page-indicator">Pagina '+currentPage+' / '+total+'</span><button class="gbtn gbtn-secondary" type="button" onclick="introQuizNextPage()" '+(currentPage>=total?'disabled':'')+'>Pagina următoare →</button>';
}
function buildQuiz(keepPosition){
  const container=byId('intro-questions-container');
  if(!container)return;
  const total=totalPages();
  currentPage=Math.min(Math.max(currentPage,1),total);
  const start=(currentPage-1)*PAGE_SIZE;
  container.innerHTML='';
  QUESTIONS.slice(start,start+PAGE_SIZE).forEach(function(q){renderQuestion(q,container)});
  renderPagination('intro-pagination-top');
  renderPagination('intro-pagination-bottom');
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
    optHtml+='<div class="option '+cls+' '+(submitted?'disabled':'')+'" onclick="introQuizToggleOption('+q.id+',\''+opt.letter+'\')"><div class="opt-letter">'+opt.letter+'</div><div class="opt-text">'+escapeHtml(opt.text)+'</div>'+(submitted?'<div class="opt-icon">'+icon+'</div>':'')+'</div>';
  });
  let explanationHtml='';
  if(submitted){
    let rows='';
    getOptions(q).forEach(function(opt){
      const exp=explanationFor(q,opt);
      rows+='<div class="expl-row '+(exp.isCorrect?'expl-correct':'expl-wrong')+'"><span class="expl-letter">'+(exp.isCorrect?'✓':'✗')+'</span><span class="expl-text"><strong>'+opt.letter+'.</strong> '+escapeHtml(exp.text)+'</span></div>';
    });
    const lesson=getLessonInfo(q);
    explanationHtml='<div class="explanation show"><div class="expl-header">Explicații — '+escapeHtml(q.topic)+'</div><div class="expl-body">'+rows+'<div class="lesson-ref"><strong>Găsești în lecție la:</strong> '+escapeHtml(lesson.section)+' — <a href="#" onclick="goto(\''+lesson.page+'\');return false;">'+escapeHtml(lesson.page)+'</a></div></div></div>';
  }
  const actions=submitted
    ? '<div class="q-actions"><button class="gbtn gbtn-secondary" type="button" onclick="introQuizClear('+q.id+')">Reîncearcă întrebarea</button></div>'
    : '<div class="q-actions"><button class="gbtn gbtn-primary" type="button" onclick="introQuizSubmit('+q.id+')">Verifică răspunsul</button></div>';
  const card=document.createElement('article');
  card.className='question-card '+cardClass;
  card.id='intro-q-'+q.id;
  card.innerHTML='<div class="q-num">Întrebarea '+q.id+' — '+escapeHtml(q.topic)+' '+badge+'</div><div class="q-text">'+escapeHtml(q.text)+'</div><div class="options" id="intro-opts-'+q.id+'">'+optHtml+'</div>'+actions+explanationHtml;
  container.appendChild(card);
}
function updateOptionDom(qId){
  const q=QUESTIONS.find(function(item){return item.id===qId});
  const opts=byId('intro-opts-'+qId);
  if(!q||!opts)return;
  const state=quizState[qId]||{selected:[],submitted:false};
  opts.innerHTML=getOptions(q).map(function(opt){
    const selected=state.selected.includes(opt.letter);
    return '<div class="option '+(selected?'selected':'')+'" onclick="introQuizToggleOption('+q.id+',\''+opt.letter+'\')"><div class="opt-letter">'+opt.letter+'</div><div class="opt-text">'+escapeHtml(opt.text)+'</div></div>';
  }).join('');
}
window.introQuizToggleOption=function(qId,letter){
  const state=quizState[qId]||{selected:[],submitted:false};
  if(state.submitted)return;
  const idx=state.selected.indexOf(letter);
  if(idx>=0)state.selected.splice(idx,1);else state.selected.push(letter);
  quizState[qId]=state;
  saveState(quizState);
  updateOptionDom(qId);
};
window.introQuizSubmit=function(qId){
  const state=quizState[qId]||{selected:[],submitted:false};
  if(state.selected.length===0){showToast('Selectează cel puțin un răspuns.');return}
  state.submitted=true;
  quizState[qId]=state;
  saveState(quizState);
  recordToAnalysis(qId,state.selected);
  buildQuiz(true);
  byId('intro-q-'+qId)?.scrollIntoView({behavior:'smooth',block:'center'});
};
window.introQuizClear=function(qId){
  quizState[qId]={selected:[],submitted:false};
  saveState(quizState);
  setRunRecorded(false);
  buildQuiz(true);
};
window.introQuizPrevPage=function(){if(currentPage>1){currentPage--;buildQuiz(false)}};
window.introQuizNextPage=function(){if(currentPage<totalPages()){currentPage++;buildQuiz(false)}};
window.introQuizReset=function(){
  if(!confirm('Resetezi progresul pentru grilele din Capitolul 1?'))return;
  quizState={};
  saveState(quizState);
  setRunRecorded(false);
  byId('intro-final-score')?.classList.remove('show');
  buildQuiz(true);
  renderAnalysis();
};
function updateProgress(){
  const submitted=QUESTIONS.filter(function(q){return quizState[q.id]?.submitted});
  const progress=byId('intro-progress-text');
  const bar=byId('intro-progress-bar');
  if(progress)progress.textContent=submitted.length+' / '+QUESTIONS.length+' completate';
  if(bar)bar.style.width=Math.round(submitted.length/QUESTIONS.length*100)+'%';
  updateAnalysisResetState();
}
function checkShowFinalScore(shouldScroll){
  const scoreEl=byId('intro-final-score');
  if(!scoreEl)return;
  if(!isQuizComplete()){scoreEl.classList.remove('show');return}
  let correct=0,partial=0;
  QUESTIONS.forEach(function(q){
    const selected=(quizState[q.id]||{}).selected||[];
    const status=correctStatus(q,selected);
    if(status.full)correct++;else if(status.partial)partial++;
  });
  const pct=Math.round(correct/QUESTIONS.length*100);
  const circle=byId('intro-score-circle');
  if(circle){circle.textContent=correct+'/'+QUESTIONS.length;circle.className='score-circle '+(pct>=70?'score-good':pct>=40?'score-mid':'score-bad')}
  if(byId('intro-score-title'))byId('intro-score-title').textContent=pct>=70?'Bine făcut!':pct>=40?'Mai studiază puțin':'Continuă să repeți';
  if(byId('intro-score-sub'))byId('intro-score-sub').textContent=correct+' corecte complet, '+partial+' parțiale, '+(QUESTIONS.length-correct-partial)+' greșite';
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
  const container=byId('intro-analysis-content');
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
  if(!sessions.length)html+='<div class="an-topic-card"><div class="an-tc-detail">Aici apar rezultatele după ce termini toate cele 60 de grile.</div></div>';
  sessions.forEach(function(s){
    const sp=Math.round(s.cor/s.att*100);
    const col=sp>=70?'#059669':sp>=40?'#D97706':'#E11D48';
    html+='<div class="an-topic-card"><div class="an-tc-head"><span>'+escapeHtml(s.date)+'</span><span style="color:'+col+'">'+s.cor+'/'+s.att+'</span></div><div class="an-tc-bar-wrap"><div class="an-tc-bar" style="width:'+sp+'%;background:'+col+'"></div></div><div class="an-tc-detail">'+sp+'% corecte</div></div>';
  });
  html+='</div></div>';
  const weakTopics=topicList.filter(function(t){return t.errors.length>0}).sort(function(a,b){return b.errors.length-a.errors.length});
  if(weakTopics.length){
    html+='<div class="an-sec-h">Unde greșești exact</div><button class="an-accordion-btn" id="intro-err-toggle" type="button" onclick="introQuizToggleErrDetails()"><span>▾ Vezi detalii greșeli</span><span>'+weakTopics.length+' topice</span></button><div class="an-accordion-body" id="intro-err-body" hidden>';
    weakTopics.forEach(function(t){
      html+='<div class="an-err-card"><div class="an-err-card-head"><strong>'+escapeHtml(t.topic)+'</strong><span class="an-err-badge">'+t.errors.length+' greșeli</span></div>';
      t.errors.slice(-4).reverse().forEach(function(err){
        const q=QUESTIONS.find(function(item){return item.id===err.qId});
        if(!q)return;
        let detailRows='';
        err.wrongOptions.forEach(function(letter){
          const optText=q.options[letter]||'';
          const expl=(q.explanations||{})[letter];
          detailRows+='<div class="an-err-opt an-ew"><div class="an-err-opt-lbl">✗ Bifat greșit: '+letter+'. '+escapeHtml(optText)+'</div><div class="an-err-opt-txt">'+escapeHtml(expl?expl.text:q.basis)+'</div></div>';
        });
        err.missedOptions.forEach(function(letter){
          const optText=q.options[letter]||'';
          const expl=(q.explanations||{})[letter];
          detailRows+='<div class="an-err-opt an-em"><div class="an-err-opt-lbl">! Omis: '+letter+'. '+escapeHtml(optText)+'</div><div class="an-err-opt-txt">'+escapeHtml(expl?expl.text:q.basis)+'</div></div>';
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
window.introQuizToggleErrDetails=function(){
  const body=byId('intro-err-body');
  const btn=byId('intro-err-toggle');
  if(!body||!btn)return;
  const open=!body.hasAttribute('hidden');
  if(open)body.setAttribute('hidden','');else body.removeAttribute('hidden');
  btn.classList.toggle('is-open',!open);
  const label=btn.querySelector('span');
  if(label)label.textContent=(open?'▾':'▴')+' Vezi detalii greșeli';
};
function updateAnalysisResetState(){
  const btn=byId('intro-analysis-reset-btn');
  if(!btn)return;
  btn.disabled=!isQuizComplete();
  btn.title=isQuizComplete()?'':'Finalizează toate întrebările înainte să poți reseta analiza.';
}
window.introQuizResetAnalysis=function(){
  if(!isQuizComplete()){showToast('Finalizează toate întrebările înainte să resetezi analiza.');return}
  if(!confirm('Ștergi analiza pentru grilele din Capitolul 1?'))return;
  localStorage.removeItem(ANALYSIS_KEY);
  renderAnalysis();
};
window.introQuizSwitchTab=function(tab,btn){
  document.querySelectorAll('#page-grile .gtab-panel').forEach(function(panel){panel.classList.remove('active')});
  document.querySelectorAll('#page-grile .gtab-btn').forEach(function(button){button.classList.remove('active')});
  byId('gtab-'+tab)?.classList.add('active');
  btn?.classList.add('active');
  if(tab==='analysis')renderAnalysis();
};
window.renderIntroQuiz=function(){buildQuiz(true);renderAnalysis()};
window.INTRO_QUIZ_QUESTIONS=QUESTIONS;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',window.renderIntroQuiz);else window.renderIntroQuiz();
})();
