# Verificarea punctajului simulării

Verificat la **30 septembrie 2026**. Anul vizat este **2026**: documentația existentă `docs/simulation.md` îl preciza deja, iar seturile active provin din culegerea UMF Cluj 2026 (`docs/editorial/umf-2026/`). `BIO_SITE.admissionYear` îl face acum explicit și pentru metadatele generate. Anul nu este dedus din ceasul browserului.

## Surse oficiale consultate

- [Pagina UMF Cluj — Admitere iulie 2026](https://umfcluj.ro/programe-studii/admitere-licenta/admitere-iulie-2026/) oferă atât ghidul 2026, cât și regulamentul. Pagina păstrează și legături mai vechi; s-au verificat documentele 2026 efective.
- [Ghid admitere 2026](https://cdn.umfcluj.ro/uploads/2026/07/GHID-ADMITERE-2026.pdf): pagina tipărită 9 (PDF 10) precizează biologie și chimie pentru Medicină/Medicină Dentară; paginile 15–18 (PDF 16–19) descriu desfășurarea și completarea grilei; paginile 19–20 (PDF 20–21) descriu rezultatele/clasificarea. Ghidul are 27 de pagini PDF. Nu s-a identificat în document un tabel al punctajelor parțiale, ponderi pe întrebare sau o formulă numerică de conversie în nota finală.
- [Regulamentul pentru admiterea 2026](https://cdn.umfcluj.ro/uploads/2026/02/Admitere-2026-Regulament-de-organizare-si-desfasurare-a-concursului-de-admitere-in-ciclul-de-studii-universitare-de-licenta.pdf#page=11): anexa la hotărârea Senatului nr. 1 din 16 decembrie 2025, 26 de pagini. Paginile 11–13, secțiunile 3.5–3.7, stabilesc proba de biologie și chimie, răspunsuri simple/multiple și clasificarea. Nu precizează algoritmul numeric detaliat.
- [Ghidul UMF Cluj 2023](https://cdn.umfcluj.ro/uploads/2023/08/Ghid-Admitere-2023-UMFDigital.pdf#page=16), pagina tipărită 18 (PDF 16), este sursa istorică a tabelului de concordanțe deja implementat. Nu îl prezentăm ca dovadă a formulei din 2026.

## Concluzie și comportament

Formula detaliată **nu a putut fi confirmată oficial pentru 2026** din documentele consultate. Este posibil să fie identică celei din 2023; această posibilitate nu dovedește echivalența. Nu s-au preluat formule ale altor universități.

Se păstrează tabelul existent de concordanțe și identificatorul `umf-cluj-2023-equal-weights-v1`. Un răspuns exact primește 1; o diferență primește 0,5 când baremul are cel puțin două variante; două diferențe primesc 0,25 când are cel puțin trei. Răspunsul gol și restul situațiilor primesc 0. Scorul de antrenament este `10 × suma punctelor / 35`, fără punct din oficiu, cu afișare finală la două zecimale.

Ponderea egală, cele 35 de întrebări, repartizarea între capitole, duratele selectabile și normalizarea la 10 sunt alegeri de antrenament BioMed. Nu se pretinde confirmarea lor ca structură/formulă oficială 2026. Rezultatul privește numai biologia. Lipsesc componenta chimie și confirmarea modului de combinare/conversie; prin urmare aplicația nu calculează nota examenului complet.

Nu există modificare de algoritm, deci nu se creează o versiune nouă doar pentru schimbarea etichetei. Rezultatele predate, versiunile de scorare/conținut, baremele și explicațiile rămân intacte. O confirmare oficială viitoare care schimbă regulile necesită o versiune separată și compatibilitate cu rezultatele vechi, nu recalcularea lor.

## Verificare locală

`node scripts/simulation-core-test.mjs` verifică toate cele 960 de combinații barem/răspuns pentru bareme cu 1–4 variante corecte, inclusiv răspunsuri goale, punctaj parțial, notele extreme și copierea versiunii sursei. Suitele de stocare și sincronizare verifică separat păstrarea rezultatelor predate. Aceste teste validează implementarea de antrenament; nu confirmă formula oficială absentă din sursele consultate.
