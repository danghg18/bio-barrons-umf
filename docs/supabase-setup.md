# Conturi și progres cu Supabase

Site-ul rămâne HTML/CSS/JavaScript static, publicabil sub `/bio-barrons-umf/`. Nu are server propriu. Lecțiile și grilele funcționează fără cont. Autentificarea și sincronizarea sunt servicii externe Supabase; istoricul statisticilor rămâne local, separat pentru fiecare cont.

## Starea proiectului

Proiectul indicat de proprietar este `uqwiyawlxuyzbsjsyfoy`. URL-ul și cheia **publishable** furnizate au fost completate în `assets/js/supabase-config.js`; fișierul exemplu rămâne gol. Pe 11 septembrie 2026, migrarea a fost aplicată prin SQL Editor din contul administratorului deschis în Safari. Verificarea SQL ulterioară confirmă toate cele trei tabele, RLS activ, câte patru politici și lipsa privilegiului SELECT pentru `anon`. Site URL și cele șase redirecturi descrise mai jos sunt salvate. Email/password și signup sunt active, cu confirmare email obligatorie; Custom SMTP nu este configurat. Publicarea frontendului și testele cu conturi/emailuri reale rămân de efectuat.

**Pentru acest proiect existent, nu executa din nou migrarea.** Pașii de creare/aplicare de mai jos sunt pentru un proiect nou. Aplicarea din SQL Editor nu completează istoricul CLI; înainte de primul `db push` pe proiectul existent, verifică schema și reconciliază istoricul conform pasului 4. Cheia publică nu poate executa DDL.

Nu pune niciodată `service_role`, `sb_secret_…`, parola bazei de date sau un access token administrativ în frontend, repository, capturi, loguri ori exemple. Cheia publishable este intenționat publică; protecția datelor este RLS. Configurația acceptă numai chei `sb_publishable_…`, nu cheile legacy JWT.

## Crearea și conectarea proiectului

1. În [dashboard](https://supabase.com/dashboard), creează un proiect într-o organizație aleasă de tine. Păstrează parola bazei în managerul de parole, nu în fișierele site-ului. Pentru proiectul deja furnizat nu trebuie creat altul.
2. Pluginul Supabase poate fi conectat prin interfața de pluginuri Codex și fluxul OAuth al Supabase. Nu are rol în rularea site-ului și nu este necesar pentru teste. Vezi [configurarea MCP oficială](https://supabase.com/docs/guides/getting-started/mcp).
3. Alternativ, folosește CLI oficial prin npm, fără instalare globală. Comenzile au fost verificate cu CLI `2.117.0`:

```sh
npx supabase@2.117.0 --help
npx supabase@2.117.0 login
npx supabase@2.117.0 init
npx supabase@2.117.0 link --project-ref uqwiyawlxuyzbsjsyfoy
npx supabase@2.117.0 db push --dry-run
npx supabase@2.117.0 db push
```

Rulează `init` numai dacă nu ai deja `supabase/config.toml`. Autentifică CLI interactiv. Dacă solicită parola bazei, introdu-o doar în terminalul propriu; nu o adăuga în comandă, shell history sau chat. Revizuiește lista migrărilor înainte de push. Nu folosi `db reset` pe un proiect de producție.

4. Fără CLI: deschide SQL Editor în proiect și rulează integral `supabase/migrations/20260911160700_accounts_sync.sql`, o singură dată. Este o tranzacție pentru o bază inițială fără aceste tabele. Nu o rula de două ori peste tabele existente. Aplicarea prin SQL Editor nu înregistrează automat istoricul CLI; înainte de a folosi ulterior `db push`, reconciliază istoricul cu `supabase migration repair --help` și verifică schema. Preferă CLI/plugin pentru aplicarea urmărită a migrărilor.

## Schema și accesul

SQL-ul reproductibil este în [migrare](../supabase/migrations/20260911160700_accounts_sync.sql).

| Tabel | Cheie primară | Date |
| --- | --- | --- |
| `public.study_state` | `user_id` | `version`, `state jsonb`, `updated_at` |
| `public.quiz_states` | `user_id, quiz_key` | `version`, `state jsonb`, `updated_at` |
| `public.notes` | `user_id, chapter_num, section_id` | `body`, `created_at`, `updated_at` |

Toate `user_id` referă `auth.users(id)` cu ștergere în cascadă. Toate tabelele au RLS și politici SELECT/INSERT/UPDATE/DELETE `TO authenticated`, limitate la `(select auth.uid()) = user_id`. UPDATE verifică atât rândul vechi, cât și noul proprietar. `anon` și `public` nu au privilegii pe tabele. Nu activa Anonymous Sign-Ins: această versiune folosește exclusiv conturi email/password.

JSON trebuie să fie obiect, cu versiune numerică identică versiunii rândului, maximum 1 MiB. `quiz_key` păstrează exact cheia existentă `bb.quiz.<nume>.vN`. Notițele au maximum 20.000 caractere, capitol pozitiv și `section_id` de maximum 160 caractere alfanumerice/underscore/cratimă, cu primul caracter alfanumeric. Timestampurile rândurilor sunt stabilite de trigger pe server; `created_at` al unei notițe nu se schimbă la editare. Datele `visitedAt`/`updatedAt` din JSON păstrează contractul existent.

## Configurația publică și build

Toate paginile încarcă `assets/js/supabase-config.js` înaintea clientului. Fișierul conține doar:

```js
window.BB_SUPABASE_CONFIG = { url: '', publishableKey: '' };
```

Completează `url` cu **Project URL** și `publishableKey` cu cheia din **Settings → API Keys → Publishable key**. Configurația curentă este deja completată cu valorile furnizate; nu mai trebuie copiate din acest document. Pentru alt mediu, copiază exemplul și completează numai valori publice. Configurația goală sau invalidă afișează modul fără cont, fără blocarea lecțiilor.

`@supabase/supabase-js` și esbuild sunt versiuni exacte în `devDependencies` și lockfile. `scripts/build-supabase.mjs` creează bundle-ul IIFE local `assets/js/vendor/supabase.js`. Fișierul se publică împreună cu site-ul; `node_modules` nu se publică și nu există CDN runtime pentru Supabase.

```sh
npm ci
npm run generate
npm test
```

`generate` reconstruiește bundle-ul și generatorul parcurge referințele HTML pentru precache. `generate:check` verifică inclusiv identitatea bundle-ului. `cont.html` este în registry pentru verificare și offline shell. Workerul nu interceptează cereri autentificate, metode non-GET sau servicii externe în afara fonturilor. Datele Auth/PostgREST nu sunt stocate în Cache API.

## Auth Providers, email și redirecturi

În **Authentication → Sign In / Providers**, activează Email cu parolă. Nu sunt implementate OAuth, telefon sau autentificare anonimă. Setează o parolă minimă de cel puțin 8 caractere. Formularele folosesc `signUp`, `signInWithPassword`, `resetPasswordForEmail`, `updateUser` și `signOut({scope:'local'})`. Sesiunea SDK persistă în `bb.supabase.auth.v1`; resetarea este detectată exclusiv pe pagina de callback, nu pe hashurile lecțiilor.

În **Authentication → URL Configuration**:

- Site URL: `https://danghg18.github.io/bio-barrons-umf/`
- Redirect URL: `https://danghg18.github.io/bio-barrons-umf/cont.html`
- Redirect URL: `https://danghg18.github.io/bio-barrons-umf/cont.html?flow=recovery`
- Dezvoltare: `http://localhost:8000/bio-barrons-umf/cont.html` și aceeași adresă cu `?flow=recovery`.
- Dacă folosești `127.0.0.1`, adaugă separat aceleași două adrese pentru `http://127.0.0.1:8000`.

Nu adăuga wildcarduri largi în producție. Linkurile sunt construite din ruta fixă `cont.html`; aplicația nu acceptă un redirect arbitrar din query. În template-urile email păstrează linkul de confirmare furnizat de Supabase și verifică dacă template-ul respectă redirectul solicitat. Fluxul implicit client-only permite deschiderea emailului și într-un alt browser. Linkul trebuie deschis online; unul expirat afișează instrucțiuni pentru solicitarea unui link nou.

După resetare, noua parolă se introduce în dialogul deschis de `PASSWORD_RECOVERY`. O sesiune obișnuită și parametrul `?flow=recovery` singur nu autorizează schimbarea parolei în această interfață. După refresh în timpul schimbării parolei se poate solicita un link nou.

### Pilot și distribuție mai largă

**A. Pilot cu confirmarea emailului oprită temporar:** înscrierea poate crea direct sesiunea. Acest lucru nu verifică deținerea adresei de email. Oprirea confirmării nu elimină necesitatea emailurilor pentru resetarea parolei. Această modificare nu este făcută automat de aplicație.

**B. SMTP propriu înainte de distribuție mai largă:** configurează **Authentication → SMTP Settings** cu furnizorul și adresa expeditorului, verifică domeniul și înregistrările SPF/DKIM cerute de furnizor, apoi activează confirmarea emailului și testează livrarea. Creditele SMTP se introduc numai în dashboard. Serviciul email implicit este destinat testării, are restricții de destinatari și limite; nu îl considera serviciu de distribuție către studenți. Verifică [SMTP oficial](https://supabase.com/docs/guides/auth/auth-smtp) și [Auth cu parole](https://supabase.com/docs/guides/auth/passwords) pentru regulile curente.

## Local-first, migrare și schimbarea contului

`BBStudyState` își păstrează API-ul. `bb.study.v1` și toate cele șapte chei de quiz sunt cache-uri compatibile, actualizate imediat. Cheile grilelor sunt descoperite din `quiz-index.js`, generat din registry/dataseturi; nu există o listă hard-codată în sincronizator. Reset/retry salvează un nou JSON gol sau răspunsul reluat, nu șterg istoricul statisticilor.

Datele efective și reviziile nesincronizate sunt în înregistrări independente `bb.user-record.v1:<proprietar>:<cheie>`, iar confirmările în `bb.user-ack.v1:`. Metadatele de import și backupurile sunt în `bb.user-cache.v1:`. Înregistrările diferite nu se suprascriu între file. Cheile brute sunt oglinzi de compatibilitate ale contului activ. La pornire, UI nu expune contul precedent înaintea restaurării sesiunii. O schimbare de proprietar invalidează răspunsurile cloud în zbor, încarcă starea noului cont și reface lecțiile/grilele prin evenimente.

La prima autentificare, toate cele trei tabele sunt citite înainte de orice import. Pentru un rând absent, se importă progresul local existent. Dacă rândul există, cloud-ul înlocuiește copia locală curată; copia diferită este păstrată în backupul local și poate fi exportată din meniul contului. Un eșec de citire nu este interpretat ca lipsă de date.

Snapshotul inițial de vizitator este oferit automat unui singur cont. La logout revine progresul vizitatorului, fără notițele contului; alt cont nou nu primește automat progresul primului cont și nici același import de vizitator deja atribuit. Pentru un transfer intenționat păstrează exportul și importă-l administrativ după verificarea proprietarului. Nu există import de fișiere JSON în UI.

**Excepția necesară pentru offline:** scrierile nesincronizate ale aceluiași cont supraviețuiesc refreshului și au prioritate la reconectare. Versiunea cloud diferită se păstrează în backup înaintea rescrierii. Astfel, un reset făcut offline nu este anulat de progresul vechi din cloud. Upserturile sunt seriale, debounced 600 ms, iar confirmarea șterge doar revizia trimisă, nu o editare mai nouă. Nu este un editor colaborativ: pentru același rând pe două dispozitive, ultima scriere acceptată câștigă. Nu există merge per răspuns sau realtime; recitirea cloud are loc la autentificare, revenirea conexiunii, focus și reîncercare explicită.

Notițele salvează local fiecare input cu cheia capturată `note:<capitol>:<secțiune>`, apoi sincronizează cu debounce. Navigarea rapidă nu mută textul în altă secțiune. Textul gol este salvat ca notiță goală, pentru a propaga ștergerea conținutului. La închiderea panoului/ieșirea din cont, draftul persistat rămâne numai în cache-ul acelui cont. Un vizitator primește invitația de autentificare înainte de a putea edita.

La deconectare, memoria activă este golită de datele contului, iar cache-ul de pe disc și outboxul se păstrează sub ID-ul acelui cont pentru reconectare. Autentificarea nu criptează localStorage sau IndexedDB: pe un dispozitiv partajat, folosește un profil privat și șterge datele site-ului după ce ai exportat/sincronizat ce dorești. Interfața nu afișează cache-ul altui cont. Logoutul folosește sesiunea browserului curent, fără deconectarea celorlalte dispozitive; o eroare SDK este afișată, fără a pretinde succesul.

Statisticile istorice nu fac parte din cele trei tabele. Baza guest existentă `bb.quiz.analytics.v1` se păstrează. Fiecare cont folosește o bază IndexedDB separată, sufixată cu ID-ul său; istoricul guest nu este revendicat ca istoric datat al contului. Progresul curent sincronizat este vizibil în statistici, dar fără inventarea încercărilor sau a datelor lipsă.

Dacă localStorage lipsește sau depășește cota, starea funcționează în memorie, cu avertisment vizibil. Închiderea paginii poate pierde scrierile încă nesincronizate; folosește exportul din cont. Stocarea locală nu înlocuiește backupul serverului.

## Testare locală și publicare

Pentru a păstra calea GitHub Pages la testarea manuală, servește folderul părinte printr-un alias temporar:

```sh
mkdir -p /tmp/biomed-preview
ln -s "$PWD" /tmp/biomed-preview/bio-barrons-umf
python3 -m http.server 8000 --directory /tmp/biomed-preview
```

Deschide `http://localhost:8000/bio-barrons-umf/`. Nu folosi `file://`. Dacă aliasul există deja, verifică destinația și nu îl suprascrie fără să verifici.

Testele automate folosesc un factory injectabil `BBSupabaseFactory`; configurarea reală este înlocuită cu una goală în suitele de conturi și domeniul Supabase este blocat în acele contexte. Nu creează utilizatori reali și nu trimit emailuri. Migrarea este executată în PostgreSQL/PGlite cu identități controlate. Detalii: [verificarea schemei](supabase-schema-verification.md).

```sh
npm run test:accounts
npm run generate
npm test
git diff --check
```

Pentru GitHub Pages, publică HTML, `assets/`, workerul și celelalte fișiere statice din repository după generare. Nu publica `node_modules`, `.env`, fișiere CLI temporare sau loguri. Nu este necesar un proces Node la runtime. Actualizarea configurației și a modulelor modifică hashul precache. Testează un browser nou și unul cu worker vechi, apoi offline după un reload controlat. Cacheurile publice vechi sunt înlocuite; cache-urile altor aplicații de pe origin nu sunt șterse.

## Verificarea proiectului real

După migrare și configurarea emailului, folosește două conturi de test proprii A/B:

1. Creează A, confirmă emailul, salvează lecție/grilă/notiță. Verifică refreshul și un al doilea dispozitiv.
2. Deconectează A, autentifică B în același browser și verifică lipsa datelor lui A. Reautentifică A și verifică restaurarea.
3. Dintr-un client autentificat B, solicită filtrat rândurile lui A: trebuie să fie invizibile. INSERT cu `user_id=A` trebuie refuzat; UPDATE care schimbă proprietarul trebuie refuzat. Nu testa RLS din SQL Editor ca `postgres`, fiindcă acest rol ocolește politicile.
4. O cerere fără sesiune nu trebuie să poată citi sau scrie progres/notițe. Verifică RLS Enabled pentru fiecare tabel și eventualele politici suplimentare din dashboard.
5. Testează resetarea reală prin email, link expirat, offline/reconectare și salvare eșuată. Nu dezactiva RLS pentru a „repara” erorile.

## Backup, export și rotația cheii

Meniul contului exportă numai cache-ul proprietarului activ, outboxul și variantele păstrate; nu exportă sesiuni, parole sau tokenuri. Exportul nu este un backup complet al Auth ori al altor dispozitive.

Folosește backupurile disponibile planului Supabase și/sau exporturi administrate ale tabelelor. Verifică periodic restaurarea într-un proiect separat. Pentru export CLI începe cu `npx supabase@2.117.0 db dump --help`; nu publica dumpurile și nu pune parole în comenzi. Gestionarea backupurilor Auth și a stocării necesită verificarea documentației planului. Vezi [backupuri Supabase](https://supabase.com/docs/guides/platform/backups).

Pentru rotația cheii publice, creează o nouă publishable key în dashboard, înlocuiește numai `publishableKey`, rulează `npm run generate` și testele, publică, verifică actualizarea workerului și accesul cu noua cheie, apoi revocă vechea cheie când clienții au fost actualizați. Clienții care au rămas offline cu un bundle/config vechi vor trebui să se reconecteze și să reîncarce. Nu înlocui cheia publică cu una secretă și nu dezactiva RLS. Vezi [API keys](https://supabase.com/docs/guides/api/api-keys).
