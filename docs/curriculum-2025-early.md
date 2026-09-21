# Verificare curriculară 2025 — capitolele 1, 3, 6, 8, 10 și 12

Sursa: PDF-ul furnizat `734244481-Barron-s-2022.pdf`, ediția română 2022, 604 pagini scanate. Pagina PDF este numerotată de la 1. Pentru fiecare interval de mai jos, antetul tipărit și limitele au fost verificate vizual; în aceste intervale pagina PDF = pagina tipărită + 7. Această relație nu este presupusă pentru alte intervale.

| Capitol | Pagini tipărite | Pagini PDF | Acoperire |
|---|---|---|---|
| 1 | 1–11 | 8–18 | Obiective, introducere, niveluri de organizare, funcții, homeostazie, termeni, planuri, cavități și membrane; fără întrebările recapitulative care încep pe 11 |
| 3 | 45–52 | 52–59 | Obiective relevante; structura celulei, membrană, transport, nucleu și citoplasmă până înainte de «Celulele și energia» pe 52 |
| 6 | 115–126 | 122–133 | Obiective, os, osificare, remodelare, articulații; fără «Tipuri de diartroze» de pe 123–124; «Mișcările articulare» din partea inferioară a paginii 124 este inclus integral |
| 8 | 167–179 | 174–186 | Obiective relevante; tipuri și structură musculară până înainte de «Funcția mușchilor striați — mecanismul de glisare…» pe 171; apoi «Energia necesară contracției musculare» din mijlocul paginii 176 și pagina 177 |
| 10 | 223–235 | 230–242 | Obiective; organizare, celule, neuroni, mielină, nervi, activitate nervoasă, arc reflex, impuls nervos, sinapsă și neurotransmițători |
| 12 | 271–283 | 278–290 | Obiective; receptori, ochi, vedere și tulburări, ureche și auz, gust, miros, tact și echilibru |

La capitolul 8, blocul major «Funcțiile mușchiului neted și cardiac» de pe 178–179 este exclus în întregime, inclusiv subcapitolele și tabelul 8.3 din interior. Limita a fost reconfirmată de coordonator la revizia independentă. Descrierile structurale generale din pagina 168 și tabelul 8.1 rămân incluse. Nu s-au eliminat mențiuni sau referințe la funcții excluse din alte paragrafe incluse.

Textul a fost extras prin OCR Apple Vision din imaginile native și reconciliat cu scanurile vizualizate pentru toate paginile incluse. Au fost refăcute paragrafele, tabelele și legendele ca HTML căutabil; `data-source-page` indică pagina tipărită de început a fiecărui paragraf, tabel, figură sau listă de obiective. Paragrafele care traversează pagina au rămas unite. Au fost păstrate formulările sursei, inclusiv referințe interne aparent neobișnuite (de exemplu tabelul 12.2 în descrierea urechii). Nu au fost introduse explicații alternative.

## Figuri și tabele

Toate figurile folosite sunt decupaje din scanul original, cu etichetele originale; fișierele anterioare rămân pe disc pentru compatibilitate. Imaginile noi au sufixul `-sursa-2022.webp` în directorul capitolului.

| Capitol | Figuri incluse | Tabele HTML |
|---|---|---|
| 1 | 1.1–1.5 | 1.1, 1.2 |
| 3 | 3.1–3.5 | 3.1 |
| 6 | 6.1–6.4, 6.6 | 6.1, 6.3 |
| 8 | 8.1, 8.5 | 8.1 |
| 10 | 10.1–10.9 | 10.1, 10.2 |
| 12 | 12.1–12.8 | 12.1, 12.2 |

Figurile 6.5, 8.2–8.4 și tabelele 6.2, 8.2, 8.3 apar în blocurile excluse. Decupajul 8.5 a fost extins după revizia independentă pentru a păstra atomul O inferior al structurii ATP. Capitolul 11 a fost transferat coordonatorului pentru reconstrucție și verificare separată; nu este certificat prin acest raport.

## Verificări și limite

Toate cele șase documente păstrează toate ID-urile din `tests/curriculum-legacy-anchors.json`. Parsarea DOM confirmă că toate elementele `.page-section` sunt copii direcți ai `main`. Rutele excluse existente din capitolul 3 rămân notificări cu `data-curriculum-excluded="true"`, fără navigare de studiu. Fișierele și căile publice existente nu au fost șterse.

Revizia independentă a tuturor celor șase capitole a confruntat toate paginile incluse, tabelele, legendele și cele 34 de imagini livrate cu scanurile sursei. Au fost remediate mici erori OCR («scade», «ATP-ul», «celulare», «substanță», «mușchii» și ghilimele) și marginile figurilor 8.5 și 10.8. Nu au rămas omisiuni semnalate după reconcilierea reviziei. Coordonatorul execută testele de integrare, navigare și afișare; acest raport nu echivalează verificarea sursei cu validarea completă în browser.

Fișiere de lucru pentru reproducerea extragerii (temporare, nu dependințe ale site-ului): `/tmp/barrons-early/ocr.jsonl`, `/tmp/barrons-early/native/pN.png`, `/tmp/barrons-early/text/pN.txt`; selecțiile exacte de linii și decupaje sunt în `/tmp/build-early.py`, `/tmp/build-cell.py`, `/tmp/build-bones.py`, `/tmp/build-muscle.py`, `/tmp/build-tissue.py`, `/tmp/build-senses.py`. Retușurile finale de obiective, accentuare și corectură sunt aplicate în HTML și în scripturi temporare separate.
