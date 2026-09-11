# Livrare: conturi și sincronizare

Branch: `feature/supabase-accounts-sync`, creat peste starea locală existentă din `codex/testare-analytics`. Modificările de grile/statistici deja prezente au fost păstrate. Codul nu a fost publicat pe GitHub Pages. Migrarea a fost aplicată proiectului real prin SQL Editor în Safari pe 11 septembrie 2026.

## Arhitectură

- Site static, scripturi clasice, SDK Supabase compilat local și inclus în precache.
- Client singleton → Auth → stocare separată per proprietar → sincronizare cu debounce/upsert.
- API-ul `BBStudyState` și toate cele șapte formate de quiz păstrate; cache-urile brute rămân compatibile.
- Notițe pe capitol/secțiune, autosave local imediat, panou desktop și dialog mobil accesibil.
- Vizitatorul poate studia fără cont. Datele curate din cloud sunt prioritare; modificările offline ale aceluiași cont rămân în outbox. Variantele înlocuite sunt păstrate pentru export.
- Istoricul statisticilor este local, izolat între utilizatori, fără a inventa încercări din progresul cloud.

## Fișiere create

- `assets/js/user-storage.js`, `supabase-client.js`, `auth-state.js`, `cloud-sync.js`, `account-ui.js`, `notes.js`.
- `assets/js/supabase-config.js`, `assets/js/supabase-config.example.js`.
- `assets/js/vendor/supabase.js`, `assets/js/vendor/supabase.LICENSE.txt` (generate).
- `assets/css/accounts.css`, `cont.html`.
- `scripts/build-supabase.mjs`, `scripts/supabase-entry.mjs`.
- `scripts/accounts-core-test.mjs`, `scripts/accounts-storage-test.mjs`, `scripts/accounts-sync-race-test.mjs`, `scripts/accounts-sql-test.mjs`, `scripts/accounts-browser-test.mjs`, `tests/supabase-mock.js`.
- `supabase/migrations/20260911160700_accounts_sync.sql`.
- `docs/supabase-setup.md`, `docs/supabase-schema-verification.md`, acest raport și `docs/superpowers/plans/2026-09-11-supabase.md`.

## Fișiere existente extinse

- `assets/js/study-state.js`, `quiz-player.js`, `quiz-analytics.js`, `home.js`, `site-redesign.js`, `chapters-data.js`.
- `scripts/generate-site-assets.mjs`, `scripts/redesign-test.mjs`, `scripts/ui-test.mjs`.
- `package.json`, `package-lock.json`, `sw.js`, `.gitignore`, `AGENTS.md`, `README.md`, `docs/architecture-audit.md`, `docs/biomed-redesign.md`.
- `sitemap.xml`, `assets/js/precache-manifest.js` (generate).
- Documentele publice existente primesc numai legăturile comune CSS/JS; homepage-ul elimină placeholderul contului:
  `index.html`, `testare.html`, `statistici.html`,
  `introducere_anatomie_fiziologie.html`, `celula_si_fiziologia_celulara.html`, `oasele_si_articulatiile.html`, `tesutul_muscular.html`, `tesutul_nervos.html`, `sistemul_nervos.html`, `organele_de_simt.html`, `sistemul_renal_complet.html`, `sistemul_reproducator_masculin.html`, `sistemul_reproducator_feminin.html`,
  `grile_introducere_anatomie_fiziologie.html`, `grile_celula.html`, `grile_sistemul_nervos.html`, `grile_organele_de_simt.html`, `grile_sistemul_urinar.html`, `grile_sistemul_reproducator_masculin.html`, `grile_sistemul_reproducator_feminin.html`.

Lista nu revendică drept schimbări noi restul modificărilor preexistente din working tree. Dataseturile educaționale, imaginile și baremele nu au fost editate.

## Activarea proiectului real

Project URL și publishable key sunt completate cu valorile furnizate de proprietar. Verificarea inițială read-only a primit HTTP 200 de la setările Auth și HTTP 404/PGRST205 pentru `study_state` absent. Ulterior, cu contul administratorului deschis în Safari, migrarea integrală a fost executată cu rezultatul „Success. No rows returned”. O interogare separată a confirmat pentru fiecare dintre `notes`, `quiz_states`, `study_state`: `rls_enabled = true`, patru politici și `anonymous_select = false`.

Site URL de producție și toate cele șase redirecturi exacte (GitHub Pages, localhost:8000 și 127.0.0.1:8000, fiecare cu callback normal și recovery) au fost salvate și verificate în dashboard. Signup și providerul Email sunt active; confirmarea emailului rămâne obligatorie. Custom SMTP este dezactivat și nu au fost furnizate datele unui serviciu de email. Nu s-a efectuat niciun signup/login/reset live și nu s-au trimis emailuri.

Rămân configurarea SMTP, publicarea fișierelor statice și testarea cu două conturi reale proprii, inclusiv un worker nou și unul actualizat. Pașii exacți, configurația, schema și limitele sunt în [supabase-setup.md](supabase-setup.md). Nu reaplica această migrare în proiectul existent: SQL Editor nu înregistrează automat istoricul CLI; reconciliază istoricul înaintea unui viitor `db push`.

## Verificare finală

Rulare secvențială pe implementarea finală: `npm run generate`, `npm test`, `git diff --check` — toate încheiate cu exit code 0.

| Verificare | Rezultat |
| --- | --- |
| Generare și verificarea fișierelor generate | PASS |
| Validare statică | 21 pagini, 10 capitole publicate, 52 fișiere JavaScript |
| Smoke în browser | Homepage, 10 lecții, 7 grile, navigare, preferințe, mobil și offline — PASS |
| Căutare/highlighter | 17 pagini și selecție tactilă pe telefon — PASS |
| UI | 21 pagini, 20 tabele, toate rutele la 10 dimensiuni — PASS |
| BioMed | Focus, subsecțiuni, preferințe, cont, demo grile și responsive — PASS |
| Grile recuperate și celulă | 251 + 50 întrebări; integritate, scoring, retry/reset/reload — PASS |
| Statistici și navigarea grilelor | Toate cele trei suite existente — PASS |
| Adapter lecții | PASS |
| Stocare locală/izolare/cache indisponibil | 40 aserțiuni — PASS |
| Concurență între taburi | 4 scenarii cu/fără Web Locks și citiri/scrieri întârziate — PASS |
| Migrare SQL și RLS | 92 aserțiuni; migrare executată pe două baze PostgreSQL PGlite independente — PASS |
| Conturi în browser, client mock injectabil | 17 scenarii; toate cele 7 storageKey-uri din registry — PASS |
| Whitespace | `git diff --check` — PASS |

Panourile de cont și notițe au fost inspectate și vizual pe desktop și mobil, inclusiv la lățimea de 320 px. Datele celor șapte quizuri au fost comparate cu copia de dinaintea implementării și sunt identice; ID-urile secțiunilor documentelor existente au fost păstrate. Testele automate nu folosesc un proiect Supabase real. RLS a fost verificat prin execuție SQL, nu numai prin mock.

O rulare anterioară, în paralel cu alte procese de browser, a întâlnit timeout-ul de 5 secunde al testului existent de căutare. Rularea finală secvențială de mai sus a trecut integral fără mărirea timeout-ului.

## Limite deliberate

Ultima scriere acceptată pentru același rând câștigă; nu există realtime/merge colaborativ sau sincronizarea istoricului datat. Cache-ul local nu este criptat. Fără localStorage, datele nesincronizate pot fi pierdute la închiderea paginii; exportul este disponibil. Un proiect real, SMTP și emailuri reale nu sunt simulate de testele de unitate/integrare.
