# VIII 1–70 — recitire independentă /root

Toate cele 70 de enunțuri, 350 de variante și 350 de explicații au fost citite integral, independent de autor. Enunțurile și variantele au fost comparate vizual cu PDF 142–151, inclusiv continuările 8, 16, 24, 33, 47, 54 și 69. Nu s-au găsit alte diferențe de transcriere. Baremul 1–70 a fost citit vizual din PDF161 și retastat independent: toate cele70 de combinații coincid exact cu fixture-ul nou și draftul. Nicio cheie modificată.

Au fost citite vizual toate cele19 pagini de manual relevante: PDF351–367 și383–384 (pagini tipărite343–359 și375–376), cu figurile și tabelele. Lecția locală cardiovasculară a fost citită integral, inclusiv pasajele recuperate separat după trunchierea inițială a unui output. Toate39 de note ale autorului au fost citite. Ancorele tuturor celor70 de întrebări, sourcePages și metadatele au fost validate. Cerințele sunt afirmative, inclusiv39, care cere identificarea vasului fără medie.

## Trei precizări suplimentare în explicații

- 26D: mută și în explicația vizibilă precizarea că rolul nutritiv atribuit circulației bronșice nu exclude orice aport de nutrienți prin circulația pulmonară. Studiul consultat a măsurat consumul de glucoză în lobi umani ex vivo perfuzați prin artera pulmonară; nu demonstrează singur întreaga afirmație despre oxigen/nutrienți din grilă. Cheia BCE rămâne.
- 45D: absența tunicii musculare proprii nu dovedește absența oricărui mecanism contractil capilar. Este precizată observația experimentală asupra pericitelor cerebrale de șoarece, fără universalizare la toate vasele/speciile. Cheia ACE rămâne.
- 52D: explicitată ambiguitatea «din țesuturi»: și plămânul conține țesuturi. Explicația nu introduce tacit «sistemice» drept condiție tipărită. Cheia AB rămâne.

S-au adăugat două note, iar nota26 și sursele notelor3/55 au fost completate. Restul347 de explicații din draft au fost citite și acceptate, nu copiate fără audit. JSON-ul review păstrează înainte/după și motivul fiecărei modificări. Nu există schimbări semantice în enunțuri/variante în acest lot.

## Verificări externe punctuale

Referințele primare au fost verificate prin rezumatele PubMed/EuropePMC și pasajele relevante, nu revendicăm citirea integrală a tuturor articolelor. Dovezile și limitele:

- PMID12883329, rezumat integral: hiperoxia experimentală la adulți sănătoși poate modifica presiunea arterială, susținând precauția10B.
- PMID16129790, rezumat integral: raportul esofagului posterior atriului stâng în disecțiile/histologia cadaverică, pentru59C.
- PMID26227785 / PMC5588268, rezumat integral: raportul sinusului coronarian cu linia vena pulmonară inferioară stângă–inel mitral, pentru13B; nu dovedește distanță universală față de toate venele.
- PMID26230395 / PMC4521946, rezumat integral: volume auriculare variabile, pentru50C, fără a afirma golire completă.
- PMID29494288, rezumat integral: contribuția respirației spontane în hipovolemie experimentală, pentru37A.
- PMID5437410 / DOI10.1161/01.CIR.41.4.659, rezumatul și metodele vizibile în PDF-ul primar AHA: presiunea aortică diastolică asociată insuficienței aortice, pentru6D. Endpoint-ul EuropePMC nu furnizează rezumat pentru acest articol.
- PMID15302061 / DOI10.1016/j.ejcts.2004.05.027, rezumat integral:44 de pacienți cu prolaps aortic, pentru64C; rezolvă căutarea inițială fără rezultat a titlului.
- PMID11481218, rezumat integral: microvalve limfatice la șobolan, pentru48B; traseul uman este verificat separat în manual.
- PMID36925951 / PMC10012904: rezumat și text integral relevant anatomiei normale/variantei, inclusiv artera pulmonară dreaptă sub arc; PDF353 din manual rămâne dovada directă a figurii15.2.
- PMID31434960 / PMC6704181: rezumat și metodele/rezultatele integrale relevante perfuziei lobare umane ex vivo, pentru26D. XML salvat în scratch.
- PMID33603231 / DOI10.1038/s41593-020-00793-2: rezumatul și descrierea figurii1 din Nature, pentru45D, confirmă experimental capilare cerebrale de șoarece. Accesul EuropePMC fullTextXML a eșuat repetat500; nu pretindem lectura integrală a articolului.
- Preparatele universitare MH065–066 aortă/cavă, [Histology Guide găzduit Penn State](https://histopathology.pennstatehealth.net/slideview/MH-065-066-aorta-and-vena-cava/09-slide-1.html), descrierile complete ale preparatelor și [SIU cardiovascular](https://histology.siu.edu/crr/cvguide.htm), pentru histologia vasculară/pericite. UAB a fost inaccesibil acestei recitiri; nu pretindem reverificarea paginii UAB de către root.

Fișierul `VIII-001-070-primary-abstracts.json` păstrează rezultatele căutărilor, inclusiv căutările fără rezultat. Regex-ul folosit inițial pentru eliminarea tagurilor din rezumate a fost restrâns la taguri alfabetice, fiindcă semnele matematice «<» puteau elimina text; toate pasajele recuperate au fost recitite înaintea acceptării. Nu a afectat textele grilelor.

SHA256 autor: `2a546be9f568ec0aa8511fd6081bbd7bc57d3884e157521aea256ea2c3607e51`.

SHA256 review: `4746a8fb8198ae03e3ac2b125e42814eadfbe8b586fc8d4f0778dbdf1bbb6b53`.

Verificare structurală: `python3 tmp/umf-2026/review-viii-a.py` PASS70chei retastate/70ancore/350explicații. Integrarea și testele de interfață urmează separat după acceptarea lotului71–140.
