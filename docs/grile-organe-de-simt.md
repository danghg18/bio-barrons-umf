# Grilele „Organele de simț”

## Sursa și baremul

Cele 100 de întrebări și 500 de variante au fost transcrise vizual din PDF-ul furnizat de utilizator, `grile-organe-de-simt-paginile-88-101.pdf` (14 pagini scanate; numerotarea tipărită este 90–103). Ordinea întrebărilor și formulările din sursă sunt păstrate, inclusiv formulările neobișnuite, cu excepția rectificării explicite pentru 5 C descrise mai jos. La grila 100, ultima afirmație nu are litera tipărită; a fost atribuită variantei E, în ordinea A–E.

Baremul trimis de utilizator la 10 septembrie 2026, cu rectificarea explicită **3 = CDE** confirmată la 12 septembrie 2026, este autoritatea pentru punctaj. Toate cele 100 de combinații au fost comparate vizual cu pagina tipărită 104 (pagina PDF 102) din volumul complet `839517963-Grile-Bio-Umf-Cluj-2025.pdf`: coincid după această rectificare. Copia independentă folosită la validare este `tests/organe-de-simt-answer-key.json`. Nu se deduce baremul din explicații și nu se modifică pentru a rezolva neconcordanțe biologice.

Datele se află în `assets/js/grile-organe-de-simt-data.js`, separat de player. Fiecare variantă exclusă de barem are explicație. La cerințele care solicită afirmații false, variantele de selectat au și explicația falsității, iar celelalte sunt explicate ca afirmații adevărate. Explicațiile disting adevărul biologic de respectarea cerinței (structură, funcție, anatomie, fiziologie) și de convențiile manualului. O variantă adevărată, dar în afara cerinței, nu este prezentată ca falsă biologic. Neconcordanțele reale și interpretările incerte sunt numite explicit, fără inventarea unui motiv de excludere.

## Revizia integrală din 12 septembrie 2026

Au fost recitite vizual toate cele 14 pagini, toate cele 100 de cerințe și toate cele 500 de variante, apoi toate explicațiile. PDF-ul reatașat de utilizator este identic cu cel inițial (SHA-256 `dceec9984ae70cdff1b28347ac39c017e2a9c318ee8300c2a76dfbbcb508ace3`). Revizia independentă a acoperit același set complet.

- **3 D:** inclusă în răspunsul CDE; eliminată justificarea greșită despre distribuția neuniformă a discurilor Merkel.
- **4 E, 18 B, 35 D/E, 37 E, 97 C:** explicații raportate la distincția structură/funcție și, la 35 E, fiziologie normală/patologie. Sunt clarificate și ambele probleme din 96 D/E.
- **Transcriere:** la 7 B este păstrată forma tipărită „fovea centrală”; la cerința 17 este restaurat „neuronii retinieni”. Celelalte formulări sunt păstrate. La 50 C scanarea mărită confirmă „cei care conțin”. Grafiile neobișnuite ale sursei (de exemplu „Merckel”, „simpatico”, „sacul”, „semicircular”, enunțul repetitiv de la 99) nu au fost corectate editorial.
- **Explicații:** 31 de variante au explicații corectate sau completate. Restul au fost revizuite și păstrate.
- **5 C — rectificare ulterioară indicată de utilizator:** „lipsesc în foveea centrală” înlocuiește „sunt prezente în fovea centrală” din PDF-ul atașat. Varianta rectificată este falsă deoarece conurile sunt concentrate în fovee; explicația anterioară despre o neconcordanță a baremului a fost înlocuită. Baremul 5 = ADE rămâne neschimbat.
- **Ambiguități și convenții:** 27 E (originea aparentă), 37 A (enumerare/succesiune), 58 B (Meissner), 59 B/78 A (perilimfă), 66 E (localizare generală), 81 E (melanină), 87 C (vag) rămân explicate fără a transforma o afirmație adevărată într-una falsă doar pentru a justifica cheia. La 3 E/31 A se păstrează formularea de 120° din manual, cu precizarea anatomică privind planurile aproximativ perpendiculare. La 5 E/30 A/E este delimitată terminologia didactică de fiziologia pigmenților și a semnalului retinian.

Clarificările au fost confruntate cu [OpenStax — Sensory Perception](https://openstax.org/books/anatomy-and-physiology-2e/pages/14-1-sensory-perception) (receptori, cale vizuală, gust), [OpenStax — Balance](https://openstax.org/books/introduction-behavioral-neuroscience/pages/7-4-balance-a-sense-of-where-you-are) (orientarea canalelor), [MedlinePlus — Eye color](https://medlineplus.gov/genetics/understanding/traits/eyecolor/) (melanina din iris) și [Endolymphatic Sodium Homeostasis](https://pmc.ncbi.nlm.nih.gov/articles/PMC3849662/) (diferența ionică dintre endolimfă și perilimfă). Aceste surse clarifică biologia; nu înlocuiesc cheia de punctaj confirmată de utilizator.

Explicațiile se raportează în primul rând la lecția existentă `organele_de_simt.html`. Pentru clarificările anatomice privind foveea și conurile, corneea, orientarea canalelor semicirculare și căile senzoriale au fost consultate și sursele primare educaționale [OpenStax: Sensory Perception](https://openstax.org/books/anatomy-and-physiology/pages/14-1-sensory-perception), [OpenStax: Vision](https://openstax.org/books/biology-2e/pages/36-5-vision) și [OpenStax: Physics of the Eye](https://openstax.org/books/college-physics/pages/26-1-physics-of-the-eye). Convențiile didactice din lecție, de exemplu localizările preferențiale ale gusturilor, sunt numite ca atare în explicații.

## Integrare

- `testare.html` include testul „Organele de simț” alături de celelalte teste înregistrate; legăturile directe existente sunt păstrate.
- `grile_organele_de_simt.html` conține zece intervale, cu hash-uri `#grile-1-10` până la `#grile-91-100`.
- Resursa este asociată capitolului 12 în `CHAPTERS`; pagina de catalog este în `BIO_SITE.pages` pentru sitemap și precache.
- `quiz-player.js` și routerul existent `legacy/quiz-navigation.js` sunt comune. Routerul descoperă intervalele din HTML și rezolvă legăturile directe către grile în intervalul corespunzător.
- Playerul găsește lecția-părinte prin relația capitol–resursă din registru. Legăturile de întoarcere duc la lecția testului, inclusiv după acces direct sau reîncărcare.
- Starea nouă folosește `bb.quiz.organe-simt.v1`, ID-uri `os-001`–`os-100`, versiunea 1. Contractul `bb.quiz.sistem-nervos.v1` și ID-urile `sn-051`–`sn-100` sunt păstrate.
- După verificare, varianta corectă bifată este verde; varianta corectă omisă este galbenă; varianta bifată în plus este roșie. Etichetele text și descrierile accesibile fac distincția și fără culoare.

## Verificare

Revizia din 12 septembrie adaugă `npm run test:simt`: verifică punctarea CDE, marcarea galbenă a lui D omis, recalcularea la afișare a răspunsurilor vechi CE/CDE, accesul direct la statistici, hidratarea și izolarea conturilor. Calculul punctajului curent este fără scrieri: nu generează revizii cloud și nu schimbă selecțiile salvate sau istoricul încercărilor. Indexul generat include cheile curente pentru ca statisticile să nu depindă de vizitarea prealabilă a paginii de grile. Capturile de la grilele 3 și 4 sunt verificate la 1440 și 390 px.

La încheierea reviziei, suita completă `npm test` a trecut: generare, validare, browser/offline, căutare, UI, toate familiile de grile, statistici și conturi. Verificarea automată confirmă funcționarea; verificarea transcrierii și a explicațiilor se bazează pe lectura sursei și revizia de conținut descrise mai sus.

`npm test` verifică datele și baremul independent, punctajul exact pentru toate cele 100 de grile ale capitolului, selecția parțială/în plus, culoarea și eticheta omisiunilor, reîncărcarea, reîncercarea, confirmarea/anularea resetării și izolarea stării față de celelalte teste. Sunt acoperite legăturile lecție–test, catalogul, intervalele directe, hash-ul invalid, parametrii de căutare, drawer-ul mobil, pornirea light-only, paginile offline și actualizarea workerului.

Inventarul offline și versiunea cache-ului sunt regenerate prin `npm run generate`; strategia `sw.js` nu este schimbată. O adresă de căutare cu query este o intrare distinctă și este verificată offline după acces online, conform comportamentului existent al workerului.

Verificarea vizuală de la integrarea inițială a acoperit catalogul, butonul din lecție și răspunsurile corectate la 1440 și 390 px. Revizia curentă verifică direct capturile grilelor 3 și 4 la aceleași lățimi. Suita UI acoperă cele 21 de pagini publice la zece dimensiuni; amprentele conținutului celorlalte teste sunt păstrate.

## Explicații în lecție

Lecția include patru explicații anatomice și funcționale în formulări proprii, cu paragrafe și liste roșii, fără casete sau trimiteri la grile. Ele sunt păstrate numai în secțiunile despre auz și echilibru: regiunile urechii, compartimentele cohleei, organizarea labirinturilor și receptorii vestibulari. Textul original și baremul nu au fost modificate. Clarificările folosesc și sursele educaționale OpenStax citate anterior: [Sensory Perception](https://openstax.org/books/anatomy-and-physiology-2e/pages/14-1-sensory-perception) și [Balance](https://openstax.org/books/introduction-behavioral-neuroscience/pages/7-4-balance-a-sense-of-where-you-are).

La echilibru este adăugată imaginea furnizată de utilizator, cu creditul ginamed.ro păstrat, în `assets/images/chapters/sense-organs/labirint-osos-membranos-ginamed.png`. Stilul paragrafelor este local lecției, în `assets/css/chapters/sense-organs.css`.
