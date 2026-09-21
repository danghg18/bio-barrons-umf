# Glosarul Barron’s

## Sursă și audit editorial

Glosarul transcrie fișierul furnizat `glosar_paginile_587-598.pdf`, extras de 12 pagini. Numerele 587–598 din numele fișierului sunt pozițiile din PDF-ul inițial; paginile tipărite ale glosarului sunt **579–590**.

`assets/js/glossary-data.js` este unica sursă de date publică: 471 de intrări, în ordinea paginilor și coloanelor din manual. Fiecare intrare are un `id` stabil pentru link, `term`, `definition` și `sourcePage` (pagina tipărită unde începe definiția). Datele nu se generează din lecții și nu sunt completate din alte surse.

Fiecare pagină a fost transcrisă vizual și verificată integral într-o a doua trecere independentă. Au fost reunite cuvintele despărțite la capăt de rând și normalizate diacriticele la caracterele românești moderne. S-au păstrat textul, ordinea, trimiterile și particularitățile sursei, inclusiv definițiile discutabile biologic, formele „nervi micști”, „oscioare”, „nervoscu” și dublele puncte din definițiile „adrenalină” și „endoderm”. Acestea nu sunt erori introduse automat de căutare și nu trebuie corectate incidental.

| Pagina tipărită | Intrări | Prima | Ultima |
| --- | ---: | --- | --- |
| 579 | 40 | abdomen | artere |
| 580 | 47 | arteriole | ciclu cardiac |
| 581 | 42 | ciclu Krebs | diencefal |
| 582 | 43 | difuziune | fecundare |
| 583 | 41 | făt | glande paratiroide |
| 584 | 36 | glande sudoripare | imunitate mediată celular |
| 585 | 42 | imunoglobulină | menopauză |
| 586 | 40 | menstruație | nod atrioventricular |
| 587 | 45 | nod sinoatrial | posterior |
| 588 | 42 | potențial de acțiune | sistem nervos simpatic |
| 589 | 38 | somatotrop | valve semilunare |
| 590 | 15 | vas deferens | zigot |

Definiția „imunitate mediată celular” include continuarea de pe pagina 585; „lichid sinovial” include continuarea din coloana următoare.

## Interfață și contracte

- `glosar.html` este o pagină statică publică în `BIO_SITE.pages`, fără cont necesar. Linkul homepage este după întregul catalog, înainte de prezentarea platformei. Lecțiile și grilele au link comun în Setări.
- `glossary-search.js` folosește normalizarea comună `BBSearchText.normalize`. Căutarea normală cere toate cuvintele în aceeași intrare și prioritizează termenul complet, prefixul, fragmentul și apoi definiția. Modul exact acceptă numai numele integral tipărit; de exemplu „ADN” este găsit în modul normal, dar nu este un alias exact inventat pentru „acid dezoxiribonucleic (ADN)”.
- Parametrii `q`, `exact=1` și `letter` păstrează filtrele la reîncărcare. Ancorele `#termen-<id>` deschid intrarea chiar dacă nu se află în primele 25. Filtrele și selectarea unui termen înlocuiesc intrarea curentă în istoric, astfel încât Înapoi să poată reveni direct la pagina-sursă.
- Interfața folosește noduri text și elemente `mark` pentru potriviri, fără inserarea interogării ca HTML. Definițiile nu sunt trunchiate. Lista se extinde cu câte 25 de intrări.
- `glossary-navigation.js` deține contextul temporar de revenire din aceeași filă. Este încărcat înaintea controllerului comun; inițializarea sa este idempotentă. Contextul nu conține răspunsuri, notițe sau progres și nu intră în sincronizarea contului.
- `?context=<token>` identifică un snapshot în sessionStorage; destinația trebuie să fie o lecție sau grilă din registrul local, pe aceeași origine. Contextele absente, expirate sau corupte conduc la homepage. Navigarea modificată (Ctrl/Cmd/clic mijloc) rămâne nativă, fără context de revenire creat pentru fila nouă.
- Revenirea păstrează URL-ul complet, secțiunea activă, ancorarea vizuală și elementele expandate. Restaurarea este limitată în timp, așteaptă routerul/playerul și se oprește la intervenția utilizatorului. Preferă istoricul validat; are fallback prin URL. Persistența răspunsurilor rămâne exclusiv la player și infrastructura existentă.
- Service worker-ul permite glosarului cu filtre/context să folosească offline shell-ul precache, inclusiv pentru interogări nevizitate. Politica celorlalte URL-uri de lecții rămâne neschimbată. Resursele glosarului sunt descoperite din referințele HTML și incluse prin `npm run generate`.

## Verificare

`npm run test:glossary` verifică inventarul editorial, căutarea, interfața, revenirea și funcționarea offline. Testele de date verifică inclusiv continuarea între pagini; nu înlocuiesc auditul vizual al scanului. Suita `npm test` păstrează și regresiile existente pentru lecții, căutare, quizuri, conturi și worker.

La modificări ulterioare: păstrează identificatorii publici, reverifică definiția în scan, rulează generarea și testele și inspectează vizual desktop/telefon. Nicio publicare nu este implicită prin generarea fișierelor.
