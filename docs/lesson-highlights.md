# Evidențierile persistente ale lecțiilor

Implementare locală: 30 septembrie 2026. `assets/js/lesson-highlights.js` deține marcarea și persistența celor 17 lecții canonice. `chapter-redesign.js` păstrează paleta, preferințele și setările. Lecțiile renale și masculine folosesc același modul; vechile lor ascultătoare de selecție au fost eliminate. Paginile grilelor își păstrează evidențierea temporară.

## Utilizare

În meniul lecției: **Setări → Highlighter**, alege o culoare, apoi selectează text. Pasajul se salvează imediat. Pe telefon funcționează selecția tactilă; selecția prin tastatură este aplicată la eliberarea tastei Shift. Apasă un pasaj evidențiat (sau Enter/Space când este focalizat), apoi **Șterge evidențierea**. Escape închide opțiunile.

Paleta afișează culoarea, starea Activ/Oprit și numărul evidențierilor. Sub **Șterge evidențieri** se deschid acțiunile **Din această lecție** și **Din toate lecțiile**. Ambele cer confirmare, precizând domeniul și faptul că notițele, evidențierile din editorul de notițe, progresul și răspunsurile nu sunt afectate. Selecțiile suprapuse peste o evidențiere existentă nu creează evidențieri imbricate; pentru schimbare, șterge evidențierea și selectează din nou.

Textul panoului are 12–13 px, iar controalele tactile minimum 44 px. Animațiile scurte de deschidere și selecție respectă preferința pentru mișcare redusă. Meniul de ștergere se restrânge la închiderea paletei.

Un avertisment deasupra lecției indică numărul pasajelor care nu mai pot fi localizate. Înregistrările respective rămân salvate și pot fi eliminate prin controlul de ștergere al lecției. Stocarea locală indisponibilă produce un avertisment explicit; în această situație păstrarea după închiderea paginii nu este garantată.

## Contract de date și ancore

Fiecare evidențiere folosește cheia `bb.highlight.v1:<id>` în `BBUserStorage`. Recordul conține `version`, `id`, `chapterNum`, `sectionId`, `color`, `createdAt`, `clearIds` și `anchor`. Ancora reține citatul exact, 48 de caractere înainte și după, pozițiile în textul eligibil al secțiunii, amprenta întregului text al secțiunii și căile structurale ale nodurilor inițiale/finale. Marcajele de căutare și evidențiere sunt transparente. Editorii de notițe, controalele și conținutul exclus din programă nu intră în index.

Restaurarea folosește pozițiile doar când amprenta secțiunii este neschimbată și citatul coincide exact. După schimbări în restul secțiunii, citatul trebuie să aibă o singură potrivire cu același context pe ambele laturi. Nu există potrivire aproximativă; zero sau mai multe potriviri rămân nelocalizate. Căile structurale sunt păstrate pentru diagnostic/migrare și nu suprascriu verificarea textului. Etichetele HTML și culorile sunt construite prin DOM, fără interpretarea textului salvat ca HTML.

## Identitate, sincronizare și ștergeri

Toate accesările se fac prin `BBUserStorage`; modulul nu citește alte conturi și nu utilizează direct localStorage. Schimbarea proprietarului elimină marcajele vizibile înainte de restaurarea celor din noul cont. Prima autentificare importă evidențierile vizitatorului prin mecanismul comun; un alt cont nu primește automat aceleași date. Datele existente de notițe/progres nu sunt modificate. Evidențierile din versiunile vechi erau numai DOM și nu există un istoric salvat care să poată fi recuperat retrospectiv.

Ștergerea individuală păstrează același ID și setează `deleted:true`. Un tombstone domină orice copie ulterioară activă a aceluiași ID, conform îmbinării din `personal-records.js`.

Ștergerile în masă creează recorduri imuabile `bb.highlight-clear.v1:<id>` cu `chapterNum` numeric sau `null` pentru toate lecțiile. O evidențiere nouă include în `clearIds` toate barierele cunoscute aplicabile. La afișare, evidențierile care nu cunosc oricare barieră aplicabilă sunt ascunse. Astfel o copie de pe un dispozitiv offline, necunoscută la momentul ștergerii, nu reapare după sincronizare. Această regulă nu depinde de ceasurile dispozitivelor; un pasaj creat offline fără cunoașterea unei ștergeri concurente este conservator ascuns după reconciliere. Marcajele create după primirea barierei rămân vizibile. Recordurile cunoscute sunt și tombstonate individual. Barierele trebuie păstrate permanent la export, import și sincronizare.

Transportul și politicile SQL sunt documentate separat de infrastructura comună de sincronizare. Funcționarea cloud necesită aplicarea migrației aferente înainte de publicarea activelor noi. Nicio migrare de producție nu este executată de testele locale.

## Verificare

`npm run test:highlights` rulează verificarea panoului și a persistenței. `scripts/highlighter-panel-test.mjs` verifică tipografia, controalele, navigarea prin tastatură, lipsa depășirilor și mișcarea redusă la 1384, 390 și 320 px, pe lecția organelor de simț, ambele familii legacy și o pagină de grile.

`node scripts/lesson-highlights-test.mjs` verifică persistența, culoarea, căutarea, importul vizitatorului, izolarea proprietarilor, pasajele nelocalizabile, ștergerea individuală și în masă, barierele pentru dispozitive offline și excluderea editorului, pe desktop și telefon, atât în lecția modernă introductivă cât și în ambele familii legacy. `node scripts/search-highlighter-test.mjs` verifică regresiile de căutare peste evidențieri, fragmente multiple, procente, diacritice și selecții tactile în paginile publice. Testele cloud ale infrastructurii verifică separat transportul, conturile și reconcilierea recordurilor.
