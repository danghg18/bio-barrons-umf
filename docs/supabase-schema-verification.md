# Verificarea schemei și RLS

Migrarea aplicabilă este [`20260911160700_accounts_sync.sql`](../supabase/migrations/20260911160700_accounts_sync.sql). Creează trei tabele în `public`, fără modificări asupra conținutului educațional:

| Tabel | Cheie primară | Date |
| --- | --- | --- |
| `study_state` | `user_id` | `version`, `state jsonb`, `updated_at` |
| `quiz_states` | `user_id, quiz_key` | `version`, `state jsonb`, `updated_at` |
| `notes` | `user_id, chapter_num, section_id` | `body`, `created_at`, `updated_at` |

Fiecare `user_id` referă `auth.users(id)` cu `ON DELETE CASCADE`. Cheile primare încep cu `user_id`, acoperind căutările de proprietar și verificările RLS. Fiecare tabel are patru politici explicite: SELECT/DELETE verifică proprietarul, INSERT verifică noul proprietar, UPDATE verifică atât proprietarul existent, cât și cel propus. Rolurile `PUBLIC` și `anon` nu primesc privilegii pe aceste tabele; `authenticated` primește numai SELECT, INSERT, UPDATE, DELETE.

`state` trebuie să fie un obiect JSON de cel mult 1 MiB după serializarea PostgreSQL, cu `state.version` numeric și egal cu coloana `version`, strict pozitivă. Nu sunt rescrise ID-urile întrebărilor sau contractele JSON existente. `quiz_key` păstrează storageKey-ul complet: `bb.quiz.<slug>.vN`, cel mult 160 de caractere. Notițele acceptă maximum 20.000 de caractere Unicode, un capitol strict pozitiv și `section_id` conform expresiei `^[a-zA-Z0-9][a-zA-Z0-9_-]{0,159}$`.

Triggerul de timestamp rulează cu `SECURITY INVOKER` și `search_path` gol. Serverul atribuie `updated_at` la INSERT și UPDATE. Pentru notițe, serverul atribuie `created_at` la INSERT și îl păstrează la UPDATE. Aceste coloane măsoară acceptarea scrierii în cloud; `visitedAt`/`updatedAt` din JSON rămân parte a progresului clientului.

## Test automat fără proiect Supabase

```sh
node scripts/accounts-sql-test.mjs
```

Testul execută SQL-ul migrării într-un motor PostgreSQL integrat, PGlite. Doar schema minimală `auth.users`, rolurile și funcția `auth.uid()` sunt simulate; politicile și interogările sunt executate de PostgreSQL, nu verificate prin căutări text.

Suita verifică 92 de aserțiuni: doi utilizatori, CRUD propriu, izolarea citirii/modificării/ștergerii, refuzul unui INSERT sau upsert pentru alt proprietar, refuzul schimbării proprietarului, lipsa accesului anonim, lipsa accesului unui rol autentificat fără UID, ambele ramuri ale upsert-ului, limite JSON/notițe/identificatori, note în capitole/secțiuni distincte, timestampuri, `ON DELETE CASCADE` și reconstruirea migrării într-o a doua bază goală. Migrarea se aplică o singură dată prin istoricul CLI; reproducibilitatea nu înseamnă reaplicarea sa peste tabele existente.

## Verificare rămasă pe infrastructura reală

Acest test nu pornește Auth, PostgREST, SMTP sau gateway-ul Supabase. După conectare și aplicarea migrării, se verifică folosind **două conturi pilot autentificate** și clientul cu cheia publicabilă:

1. Contul A creează progres și o notiță; contul B nu le poate citi/modifica/șterge, nici trimițând explicit UID-ul contului A.
2. Un client deconectat nu poate citi sau scrie niciunul dintre cele trei tabele.
3. Fiecare cont poate face upsert pe propriul progres și propriile notițe.
4. Dashboard-ul arată RLS activ pe toate cele trei tabele, câte patru politici și nicio politică suplimentară permisivă.
5. Security Advisor nu semnalează tabele expuse fără RLS sau funcții cu permisiuni nepotrivite.

Pașii pentru migrare, configurare Auth/SMTP și publicare sunt în [`supabase-setup.md`](supabase-setup.md). Nu folosi cheia `service_role` pentru verificarea izolării: aceasta ocolește RLS și nu intră niciodată în frontend.

Modelul urmează [documentația oficială Supabase pentru RLS](https://supabase.com/docs/guides/database/postgres/row-level-security): granturile stabilesc operațiile posibile, iar politicile stabilesc rândurile accesibile. Nu activa providerul de autentificare anonimă pentru acest pilot; conturile sunt prin email și parolă.
