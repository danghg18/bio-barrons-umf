# Evidențieri, istoric și simulări sincronizate

Implementare locală, 30 septembrie 2026. Nu s-au aplicat modificări proiectului Supabase de producție și nu s-a publicat site-ul.

## Utilizare

În lecție, deschide Setări → Highlighter și alege culoarea. Selectează pasajul; evidențierea rămâne după reîncărcare. Apasă sau activează din tastatură pasajul evidențiat pentru „Șterge această evidențiere”. Paleta conține ștergerea tuturor evidențierilor din lecție sau din toate lecțiile, cu confirmare care precizează că notițele, progresul și răspunsurile nu sunt afectate. Dacă textul sursă nu mai poate fi identificat exact, înregistrarea rămâne salvată și apare o avertizare în lecție.

Istoricul statisticilor și al simulărilor se încarcă în cont pe fiecare dispozitiv. O simulare activă se continuă din Testare → Istoricul simulărilor. Fiecare intrare are și „Șterge”, cu confirmare. Termenul absolut se păstrează; schimbarea dispozitivului nu prelungește timpul. La editări simultane ale aceleiași întrebări, aplicația afișează o avertizare, păstrează variantele în export și permite revizuirea răspunsului înainte de predare. Rezultatul deja predat rămâne neschimbat. Cont → Datele tale → Exportă copia locală include variantele păstrate și datele în așteptare.

Contul afișează sincronizare în curs, sincronizat, offline sau eroare recuperabilă. Reîncearcă sincronizarea permite o nouă încercare. O eroare de rețea sau lipsa migrației nu șterge datele. Dispozitivele vizibile citesc periodic și la focus/reconectare; nu este necesar un canal Realtime. Modificările sunt trimise după o întârziere scurtă pentru grupare.

## Transferul datelor existente

`user-storage.js` rămâne proprietarul datelor locale, reviziilor pendinte, identității și importului vizitatorului. `auth-state.js` schimbă sincron identitatea; `cloud-sync.js` este singurul proprietar al transportului. Scripturile nu accesează conturile altor utilizatori și nu introduc chei secrete.

Istoricul real din IndexedDB se copiază idempotent în înregistrări individuale, apoi IndexedDB devine proiecția locală. ID-urile, momentele reale, rundele, corectările și versiunile rămân aceleași. Nu se construiesc încercări din totaluri sau din răspunsuri care nu au istoric. Baza veche a vizitatorului este păstrată. Se importă numai înregistrările care supraviețuiesc ștergerilor vizitatorului; barierele sale de ștergere rămân locale și nu pot șterge date preexistente ale contului. Doar contul care are dreptul asupra importului vizitatorului poate prelua acea bază. Simulările locale sunt transferate ca instantanee complete și nu sunt regenerate.

`personal_records` conține cheia și datele fiecărei evidențieri, bariere de ștergere, încercări, runde, metadate și simulări. RPC `bb_put_personal_record` are privilegii de invocator, extrage identitatea din `auth.uid()`, o compară și cu proprietarul așteptat al cererii (pentru schimbarea sesiunii înaintea expedierii), verifică revizia citită și returnează înregistrarea curentă când există conflict. RLS limitează SELECT/INSERT/UPDATE la utilizatorul propriu. DELETE fizic nu este acordat clientului; ștergerea contului poate elimina prin FK propriile rânduri.

Ștergerile individuale sunt tombstone-uri permanente pentru acel ID. Ștergerea globală/din lecție sau a istoricului adaugă bariere imuabile. O înregistrare trebuie să cunoască toate barierele aplicabile ca să fie afișată; astfel datele de pe un dispozitiv offline nu reapar. Consecința deliberată: și o evidențiere/încercare nouă creată offline fără a cunoaște o ștergere concurentă este ascunsă, dar înregistrarea rămâne în export. După reconectare, creațiile noi cunosc barierele și sunt afișate.

Transportul citește în pagini de 500 de rânduri și verifică identitatea/epoca după fiecare cerere. Rândurile din versiuni viitoare nu sunt rescrise; datele locale incompatibile sunt păstrate, starea cere actualizarea aplicației, iar celelalte înregistrări continuă să se sincronizeze. Încercările cu același ID sunt imuabile: originalul confirmat de cloud primează, variantele locale divergente rămân în backup.

## Pași înainte de publicare

1. Exportă/salvează datele proiectului Supabase conform procedurii administrative obișnuite. Verifică migrațiile deja aplicate. Nicio comandă de mai jos nu a fost executată în producție de acest task.
2. Aplică mai întâi `supabase/migrations/20260930162516_personal_study_records.sql` în mediul de test, apoi în proiectul real prin mecanismul normal de migrații. Migrația necesită tabela standard `auth.users` și rolurile Supabase `anon`/`authenticated`; nu schimbă tabelele existente de progres/notițe. Verifică înregistrarea migrației în istoric, RLS și drepturile RPC. Nu acorda DELETE fizic sau acces anonim.
3. Verifică în test două conturi, două dispozitive, deconectare/reconectare și datele locale existente. Confirmă setările Data API pentru tabela și funcția noi. Testele automate folosesc exclusiv PGlite și servicii simulate; conectarea la proiectul real și livrarea emailurilor rămân o verificare manuală separată.
4. Rulează `npm run generate`, `npm test`, `git diff --check`. În acest checkout există copii locale neversionate cu sufixul „2”; ele nu fac parte din livrare și nu trebuie incluse. Verificarea integrală se poate face într-o copie curată cu fișierele versionate plus fișierele noi ale taskului, fără a șterge copiile utilizatorului.
5. Publică activele împreună numai după aprobarea publicării. Hashul manifestului offline se schimbă intenționat odată cu aceste scripturi/HTML; workerul păstrează datele private în stocările lor și înlocuiește doar cacheurile publice ale aplicației. Pentru revenire, regenerează activele versiunii anterioare; păstrează tabela și tombstone-urile, nu executa migrații distructive.

## Verificări automate

`test:personal`: convergență, import, CAS/SQL/RLS, curse SELECT și răspunsuri întârziate, versiuni viitoare, încercări imuabile, două contexte autentificate, offline/reconectare, paginare, simulări, termene, predare și schimbarea contului.

`test:highlights`: desktop/telefon, lecții moderne/renale/masculine, refresh, reluare offline, culori, ancore exacte/ambigue, căutare, ștergeri și două conturi/servicii simulate.

`test:metadata`: HTML livrat și interfață fără/cu JavaScript. Formula de antrenament și sursele oficiale sunt explicate separat în [verificarea punctajului](simulation-scoring-sources.md).
