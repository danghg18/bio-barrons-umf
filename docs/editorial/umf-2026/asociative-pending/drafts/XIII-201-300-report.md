# XIII 201–300 — raport de autorat și autoverificare

Draft stabil: `XIII-201-300.json`; SHA-256 `aeca9f9a0ef1f9b05127d55c15ddbf3409cd9fe45ef832e989dae692b0d96dda`.

Lotul conține exact **100 de enunțuri, 500 de variante A–E și 500 de explicații substantive**. Autor: `content_bones_b`. Toate enunțurile și variantele au fost transcrise din scan și confruntate vizual încă o dată după redactare. Acestea sunt două lecturi ale autorului, nu recenzia independentă a altui agent. Fără modificări în producție, alte drafturi, commit sau publicare.

Cheia este exclusiv cea furnizată: `answer-key-extracted.json`, capitol XIII, comparată programatic cu `tests/umf-cluj-2026-answer-key.json` și vizual cu baremul. Toate cele 100 de seturi sunt identice. `asksFalse=true` numai la 223 și 233. Niciun ID inventat.

## Evidența celor două lecturi vizuale

Fișierele sunt `tmp/umf-2026/source/page-NNN.jpg`. Numerele PDF sunt 1-based; în această porțiune pagina tipărită este PDF + 10. Fiecare rând de mai jos a fost parcurs în ambele lecturi, incluzând toate continuările A–E și traversările dintre coloane.

| PDF / tipărită | Conținut verificat în ambele lecturi |
|---|---|
| 261 / 271 | 201–204 integral; 205 enunț+A–B; continuarea lui 201 între coloane |
| 262 / 272 | 205 C–E; 206–211 integral; 212 enunț+A–C; 208E la începutul coloanei următoare |
| 263 / 273 | 212 D–E; 213–218 integral; 219 enunț+A–D |
| 264 / 274 | 219E; 220–225 integral; 226 enunț+A–B; 223 B–E între coloane |
| 265 / 275 | 226 C–E; 227–232 integral; 233 enunț+A–B; 230 B–E între coloane |
| 266 / 276 | 233 C–E; 234–239 integral; 240 enunț+A; 236 C–E între coloane |
| 267 / 277 | 240 B–E; 241–247 integral; 248 enunț+A–C; 244 C–E între coloane |
| 268 / 278 | 248 D–E; 249–255 integral; 256 enunț+A–C; 252 B–E între coloane |
| 269 / 279 | 256 D–E; 257–263 integral |
| 270 / 280 | 264–269 integral; 270 enunț+A–D; 267 B–E între coloane |
| 271 / 281 | 270E; 271–277 integral; 274 C–E între coloane |
| 272 / 282 | 278–285 integral; 286 enunț+A–B; 282 D–E între coloane |
| 273 / 283 | 286 C–E; 287–293 integral; 294 enunț+A–C; 290E între coloane |
| 274 / 284 | 294 D–E; 295–300 integral; 297E între coloane |

Paginile PDF260 și275 au fost văzute pentru delimitarea lotului; nu sunt revendicate ca lectură integrală a loturilor vecine. Nu a fost necesară reconstruirea vreunui text ilizibil. A doua lectură nu a impus corecturi de transcriere. Au fost păstrate formulările tipărite, inclusiv variantele intenționat false, cifrele, negațiile și inconsecvențele biologice. S-au normalizat numai diacriticele românești și întreruperile de rând.

Baremul: PDF289/p.299 a fost inspectat pentru identificarea capitolului; pe PDF290/p.300 au fost citite toate răspunsurile201–225 din partea inferioară a coloanei3 și226–260 din coloana4; pe PDF291/p.301,261–295 din coloana1 și296–300 din începutul coloanei2. Nu se revendică verificarea răspunsurilor din afara201–300.

## Lecții și manual

Au fost consultate secțiunile relevante din toate cele17 lecții asociate mai jos, inclusiv pasajele pentru fiecare explicație. Nu se revendică o nouă lectură integrală a tuturor celor17 manuale/capitole; verificarea locală a urmărit secțiunile folosite și comparațiile cerute de itemi. Toate cele100 de rute au ancore reale. Rutele inițial prea generale au fost înlocuite la209 (`#organite`),256 (`#organele-anexe`) și258 (`#metabolismul-glucidelor`).

- `celula_si_fiziologia_celulara.html`: `#membrana`, `#nucleu`, `#organite`, `#structura`, `#transport`.
- `introducere_anatomie_fiziologie.html`: `#cavitati`, `#functii`, `#organizare`, `#termeni`.
- `metabolism_si_nutritie.html`: `#lipide-si-proteine`, `#metabolismul-glucidelor`, `#rata-si-temperatura`, `#stari-si-minerale`.
- `oasele_si_articulatiile.html`: `#articulatii`, `#osul`.
- `organele_de_simt.html`: `#alte-simturi`, `#ochiul-si-vederea`, `#urechea-si-auzul`.
- `sangele.html`: `#coagularea-sangelui`, `#globulele-rosii`, `#plasma`.
- `sistemul_cardiovascular.html`: `#cavitatile-si-vasele-inimii`, `#circulatia-sangelui-prin-inima`, `#vasele-sanguine`.
- `sistemul_digestiv.html`: `#intestinele`, `#organele-anexe`, `#tractul-gastrointestinal`.
- `sistemul_endocrin.html`: `#glandele-suprarenale`, `#hipofiza-glanda-pituitara`.
- `sistemul_limfatic_si_imun.html`: `#splina`.
- `sistemul_nervos.html`: `#sistem-nervos-autonom`, `#sistem-nervos-central`.
- `sistemul_renal_complet.html`: `#anexe`, `#hormoni`, `#nefron`, `#rinichii`.
- `sistemul_reproducator_feminin.html`: `#fiziologie`.
- `sistemul_reproducator_masculin.html`: `#hormoni`.
- `sistemul_respirator.html`: `#anatomie`, `#schimbul-de-gaze`.
- `tesutul_muscular.html`: `#muschiul-striat`, `#tesutul-muscular`.
- `tesutul_nervos.html`: `#organizare`, `#sinapsa`.

Manual: `/Users/danghergie/Downloads/734244481-Barron-s-2022.pdf`. Imaginile deja randate din `tmp/umf-2026/manual/` au fost citite vizual punctual pentru acest lot:

| PDF / pagina tipărită | Verificare |
|---|---|
| 55–59 / 48–52 | Transport pasiv/activ, osmoză, nucleu/nucleoli, subunități ribozomale, Golgi, citoschelet/flagel |
| 234–235 / 227–228 | Neuroni și formarea mielinei; desenul separă citoplasma Schwann de mielina compactă |
| 289–290 / 282–283 | Receptori tactili, echilibru static/dinamic, macule și canale semicirculare |
| 306–307 / 299–300 | ACTH, gonadotropine, tabelul hormonilor hipofizari |
| 362 / 354; 364 / 356 | Presiune sistolică/diastolică, vase, factori de reglare și circulație |
| 420–421 / 412–413 | O₂ dizolvat în plasmă sau citoplasma hematiilor; CO₂ și carbaminohemoglobină |
| 440–441 / 432–433 | Stomac, enzime, duoden, noduli limfoizi submucoși și glande Brunner |
| 494 / 486; 503–505 / 495–497 | Poziția rinichilor și raportul costal, diureză/debit ureteral, vezică și excreție |

PDF493 a fost văzut doar ca pagină de deschidere/obiective, fără a fi folosit drept dovadă biologică. Lecțiile și manualul conțin unele simplificări; explicațiile nu le transformă în reguli absolute atunci când există un conflict.

## Observații editoriale și dovezi

Cele30 de note de mai jos sunt incluse și în JSON. Ele disting conflictul propriu-zis de barem, ambiguitatea, simplificarea didactică și afirmațiile adevărate care nu se încadrează în categoria cerută. Nicio notă nu modifică setul de răspunsuri.

- **201E** — E este exclusă, deși axonema flagelului spermatic este citoscheletică și microtubulii/dineina susțin motilitatea. Cheia AC este păstrată.
  Referință: Barron 2022 PDF59/p.52; celula_si_fiziologia_celulara.html#organite.
  Sursă: [dovadă consultată](https://pubmed.ncbi.nlm.nih.gov/36593309/).
- **202B** — Golgi modifică și sortează proteine/lipide/glucide, însă procesarea în cisterne trebuie deosebită de ambalarea și transportul în vezicule. Baremul exclude B; nu negăm funcțiile reale Golgi.
  Referință: Barron 2022 PDF58/p.51; celula_si_fiziologia_celulara.html#organite.
- **203E, 233B, 276C** — Nucleul poate avea unul sau mai mulți nucleoli; precursorii subunităților ribozomale se asamblează în nucleu/nucleol; învelișul nuclear are pori. Sunt excluse 203 E/276 C și selectată 233 B drept falsă. La 276 C, separarea didactică a nucleului de organitele citoplasmatice poate explica clasificarea, fără a infirma porii. La 233 B nu confundăm asamblarea subunităților cu asocierea lor într-un ribozom activ.
  Referință: Barron 2022 PDF57–58/p.50–51; celula_si_fiziologia_celulara.html#nucleu și #organite.
- **206D, 287C** — Descrierea măduvei galbene diafizare se referă predominant la adult; distribuția măduvei roșii diferă la copil. Măduva ocupă spații osoase, nu matricea compactă.
  Referință: oasele_si_articulatiile.html#osul.
- **208D** — Modelul didactic al difuziunii lipidice nu exclude participarea proteinelor de captare. Studiul pe țesut uman localizează CD 36 apical în duoden și jejun; explicația distinge transportul facilitat de transportul activ direct.
  Referință: sistemul_digestiv.html#intestinele.
  Sursă: [dovadă consultată](https://pubmed.ncbi.nlm.nih.gov/11561009/).
- **209A, 209D** — Acetilcolinesteraza hidrolizează mediatorul din fantă după disociere; hidroliza completă a trigliceridelor dă glicerol și acizi grași, dar digestia intestinală produce predominant și monogliceride.
  Referință: tesutul_nervos.html#sinapsa; sistemul_digestiv.html#intestinele.
- **210E** — Maculele sunt asociate didactic echilibrului static, dar răspund și accelerațiilor liniare. Excluderea nu înseamnă lipsa contribuției la echilibrul în mișcare.
  Referință: Barron 2022 PDF289–290/p.282–283; organele_de_simt.html#alte-simturi.
  Sursă: [dovadă consultată](https://pubmed.ncbi.nlm.nih.gov/305181/).
- **215A, 215C, 215E, 288C, 288E** — Sfincterul esofagian inferior este în mare parte funcțional; celulele contractile mamare sunt mioepiteliale, nu fibre musculare propriu-zise; cardiomiocitele sunt de regulă mononucleate, dar există binucleate; endocardul poate conține celule netede fără ca acestea să reprezinte miocardul.
  Referință: tesutul_muscular.html#tesutul-muscular; sistemul_digestiv.html#tractul-gastrointestinal.
  Sursă: [dovadă consultată](https://pubmed.ncbi.nlm.nih.gov/8631040/).
- **217C** — Necesitatea vibrației timpanului este valabilă pentru conducerea aeriană obișnuită; conducerea osoasă constituie o cale distinctă.
  Referință: organele_de_simt.html#urechea-si-auzul.
- **222A, 297B** — Descrierile structurale sunt adevărate; excluderea poate reflecta solicitarea funcțiilor/funcționării. Intenția baremului este prezentată ca interpretare posibilă, nu certitudine.
  Referință: Barron 2022 PDF58/p.51; tesutul_nervos.html#sinapsa.
- **228A, 230C, 262E, 263E, 277C** — 228 A: lobul stâng hepatic ajunge și în hipocondrul stâng. 230 C: traheea are predominant raport superior cu inima. 262 E: orificiile ureterale se află la colțurile superioare ale trigonului, pe baza posteroinferioară. 263 E: raportul costal privește mai ales partea superioară posterioară a rinichiului stâng, nu majoritatea marginii laterale. 277 C: diafragma separă direct toracele de abdomen. Cheile sunt păstrate, fără opoziții anatomice absolute inventate.
  Referință: Barron 2022 PDF494/p.486 fig.20.1 și PDF503–504/p.495–496; sistemul_renal_complet.html#rinichii și #anexe; introducere_anatomie_fiziologie.html#cavitati; sistemul_digestiv.html#organele-anexe.
- **229D, 229E** — Cotransportul luminal SGLT 1 este secundar activ pentru glucoză; Na⁺ coboară gradientul. Aldosteronul reglează retenția/conținutul de Na⁺, în timp ce concentrația plasmatică depinde puternic de balanța apei/ADH/sete.
  Referință: sistemul_digestiv.html#intestinele; sistemul_renal_complet.html#hormoni; sistemul_endocrin.html#glandele-suprarenale.
- **232C, 274C, 274D** — Nu toate ligamentele sinoviale derivă din capsulă. Osteoblastele sintetizează matrice organică și organizează mineralizarea extracelulară. Hidroxiapatita este parte reală, dar nu întreaga matrice; excluderea 274 D poate reflecta caracterul incomplet.
  Referință: oasele_si_articulatiile.html#articulatii și #osul.
- **233D** — D este selectată drept falsă prin distincția didactică difuziune facilitată/osmoză. Aquaporinele permit transport pasiv al apei; osmoza descrie forța și direcția fluxului, fără a exclude o cale proteică.
  Referință: Barron 2022 PDF55–56/p.48–49; celula_si_fiziologia_celulara.html#transport.
  Sursă: [dovadă consultată](https://pubmed.ncbi.nlm.nih.gov/8506291/).
  Sursă: [dovadă consultată](https://www.reactome.org/content/detail/R-HSA-507868).
- **235D** — Manualul tabel 13. 2 atribuie ACTH creșterea ratei metabolice. Explicația prezintă efectele metabolice indirecte prin glucocorticoizi și distinge controlul clasic al metabolismului bazal de către hormonii tiroidieni.
  Referință: Barron 2022 PDF306–307/p.299–300; sistemul_endocrin.html#hipofiza-glanda-pituitara.
- **235E** — Ficatul și rinichii participă la activarea vitamineiD, dar există și căi de catabolizare a metaboliților. E nu este negată biologic doar pentru că baremul o exclude. Studiile citate examinează enzime/căi hepatice umane.
  Referință: sistemul_digestiv.html#organele-anexe.
  Sursă: [dovadă consultată](https://pubmed.ncbi.nlm.nih.gov/16207822/).
  Sursă: [dovadă consultată](https://pubmed.ncbi.nlm.nih.gov/23212742/).
- **238D, 238E** — Localizarea olfactivă „în interior” este aproximativă. Neuronii corticospinali nu sunt exclusiv celule Betz mari; studiul original la macac a identificat neuroni corticomotoneuronali de dimensiuni variate, inclusiv mici. Nu îl prezentăm ca studiu uman.
  Referință: sistemul_nervos.html#sistem-nervos-central.
  Sursă: [dovadă consultată](https://pmc.ncbi.nlm.nih.gov/articles/PMC1461407/).
- **243E** — 120/80 mmHg reprezintă presiunea sistolică/diastolică, nu presiunea arterială medie; aproximarea uzuală produce circa 93 mmHg. Baremul ADE și formularea tipărită sunt păstrate.
  Referință: Barron 2022 PDF362/p.354 și sistemul_cardiovascular.html#vasele-sanguine.
- **245A** — Nu susținem o diminuare monotonă a amplitudinii de-a lungul tuturor arterelor: amplificarea aortă–artere periferice este demonstrată prin înregistrări umane. Afirmația globală din variantă rămâne exclusă.
  Sursă: [dovadă consultată](https://pubmed.ncbi.nlm.nih.gov/8449191/).
- **254A** — Numărul alveolelor nu este constant. Studiul stereologic original pe 6 plămâni umani adulți raportează media 480 milioane și variația 274–790 milioane. Nu schimbăm cifra imprimată de 900 milioane sau cheia.
  Referință: sistemul_respirator.html#anatomie.
  Sursă: [dovadă consultată](https://pubmed.ncbi.nlm.nih.gov/14512270/).
- **255B, 255E, 298D** — 255 B: procentul carbamino nu e o valoare fixă a venelor pulmonare. 255 E: manualul spune 2%O₂ dizolvat în plasmă SAU citoplasma hematiilor; nu negăm dizolvarea intracelulară. 298 D: în plasmă Na⁺ și HCO₃⁻ sunt disociați; NaHCO₃ este o convenție de reprezentare.
  Referință: Barron 2022 PDF420–421/p.412–413; sistemul_respirator.html#schimbul-de-gaze.
- **257D** — Nodulul limfoid submucos duodenal este demonstrat într-o preparare histologică a University of Utah. Varianta este validă; nu confundăm nodulii cu glandele Brunner sau cu plăcile Peyer ileale.
  Referință: Barron 2022 PDF441/p.433; sistemul_digestiv.html#intestinele.
  Sursă: [dovadă consultată](https://webpath.med.utah.edu/HISTHTML/NORMAL/NORM131.html).
- **258B** — Energia utilizabilă provine din bilanțul favorabil al hidrolizei ATP, nu din ruperea izolată a unei legături chimice.
  Referință: metabolism_si_nutritie.html#metabolismul-glucidelor.
- **262D, 300E** — Manualul însuși dă atât 5 ml/minut, cât și 1–2 litri/zi; prima valoare nu poate fi debit mediu normal continuu. Capacitatea vezicală de 400 ml nu este maxim universal; manualul dă 600 ml orientativ.
  Referință: Barron 2022 PDF503/p.495; sistemul_renal_complet.html#anexe.
- **265D** — Mulți receptori hormonali sunt glicoproteine, dar nu orice glicoproteină/glicolipid de suprafață este receptor hormonal. Cheia păstrează formularea generală tipărită.
  Referință: celula_si_fiziologia_celulara.html#membrana.
- **267B, 267D, 289B, 296C** — Prelungirile periferice pseudounipolare numite didactic dendrite au structură axonală. Neurilema periferică nucleată este distinctă de mielina compactă; nu extindem termenul la SNC. Mielinizarea descrie axonul, nu întregul interneuron.
  Referință: Barron 2022 PDF234–235/p.227–228; tesutul_nervos.html#organizare.
  Sursă: [dovadă consultată](https://histologyguide.org/EM-view/EM-152-peripheral-nerve/06-photo-1.html).
  Sursă: [dovadă consultată](https://histologyguide.org/slideview/MH-051-dorsal-root-ganglion/06-slide-1.html).
- **281B, 281D** — Osteocitele întrețin matricea și schimburile prin canalicule; nu sunt fagocite specializate. Resorbția perilacunară osteocitară este demonstrată experimental la șoareci în lactație, deși baremul excludeD și rezervă didactic resorbția osteoclastelor.
  Referință: oasele_si_articulatiile.html#osul.
  Sursă: [dovadă consultată](https://pubmed.ncbi.nlm.nih.gov/22308018/).
- **289D** — Interneuron este o clasă funcțională, nu structurală. Există interneuroni și în plexul mienteric uman, deci „doar în SNC” este prea restrictiv.
  Sursă: [dovadă consultată](https://pubmed.ncbi.nlm.nih.gov/12077095/).
  Sursă: [dovadă consultată](https://pubmed.ncbi.nlm.nih.gov/32839997/).
- **277D, 291A** — Pericardul are componentă seroasă și fibroasă. La membrana respiratorie oxigenul vine imediat din aerul alveolar, care diferă de aerul atmosferic inhalat.
  Referință: introducere_anatomie_fiziologie.html#cavitati; sistemul_respirator.html#schimbul-de-gaze.
- **295C, 295E, 298A, 298C, 299D** — Trombina nu este enzimă digestivă; sărurile biliare nu sunt enzime; eritrocitele/eozinofilele sunt elemente figurate, nu plasmă; placenta secretă hCG, dar nu este gonadă. Explicațiile separă adevărul afirmației de categoria solicitată.
  Referință: sangele.html#coagularea-sangelui și #plasma; sistemul_digestiv.html#intestinele; sistemul_reproducator_feminin.html#fiziologie.

Accesul la studiile PubMed a inclus rezumatele originale indexate, nu revendicarea lecturii textului integral. Pentru Rathelot–Strick2006 (`PMC1461407`) au fost citite și rezultatele/discuția relevante despre distribuția mărimii neuronilor. Pentru University of Utah și Histology Guide au fost citite descrierile preparărilor originale. Unele deschideri directe PubMed au afișat CAPTCHA; acestea nu au fost tratate drept acces reușit, iar nota se bazează pe conținutul rezumatelor efectiv disponibil prin indexare. Studiul Wang2013 despre vitaminaD a fost consultat prin informația indexată și schema metabolismului, nu printr-un text integral inaccesibil.

Surse primare suplimentare consultate pentru delimitare: [structura flagelului uman](https://pubmed.ncbi.nlm.nih.gov/29426884/), [limfocite vilozitare și agregate submucoase umane](https://pubmed.ncbi.nlm.nih.gov/9834269/), [căi hepatice de catabolism vitaminaD](https://pmc.ncbi.nlm.nih.gov/articles/PMC3310418/). Pentru transportul apei, [Reactome](https://www.reactome.org/content/detail/R-HSA-507868) a oferit curarea mecanismului și trimiterea la experimentul original Preston1992; dovada originală de distribuție CHIP28 consultată este Bondy1993, PMID8506291.

## Autoverificare finală

- Exact201–300, fără lipsuri/dubluri; sourceNumber=number și sourceChapter=XIII pentru toate100.
- Cinci variante A–E în ordine la fiecare item;500 texte și500 explicații ne-goale, cea mai scurtă explicație având70 de caractere. Această verificare structurală completează lectura editorială, nu o înlocuiește.
- Toate100 cheile identice cu fixture-ul independent și extracția; cheile au rămas neschimbate.
- Toate sourcePages corespund continuărilor din tabel; numai223 și233 solicită variante false.
- Toate100 lessonUrl rezolvă un fișier local și un id `page-<hash>` real.
- Explicațiile au fost redactate individual pentru toate500 de variante. În închiderea auditului au fost ajustate11 explicații (222A,228A,230C,255B/E,257D,262D,274D,281D,297B,300E), după confruntarea surselor; nu au fost schimbate enunțuri, variante sau chei.
- JSON parsează și trece verificările de schemă, ordine, ancore și cheie. Nu s-au rulat teste de producție/browser, deoarece livrarea constă exclusiv într-un draft editorial.

Stare: **autorat complet, pregătit pentru recitire independentă**. Contradicțiile și ambiguitățile sunt explicate în variante și enumerate în notes; nu există text-sursă rămas netranscris sau explicații lipsă.
