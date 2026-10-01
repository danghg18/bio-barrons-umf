# Public metadata and availability

Audit: 30 September 2026. At this audit, the canonical published inventory contains **17 lessons, 17 quiz sets and 1,590 questions**. The 400 deferred associative questions are not registered as published resources and are excluded. These numbers describe the audit snapshot; public numbers are computed during generation rather than copied from this document.

## Source and generation

`assets/js/chapters-data.js` remains the only publication registry. `BIO_SITE.admissionYear` now identifies 2026 explicitly. A lesson is published only if `done` is true and `url` is present. Quiz resources of published chapters are included unless explicitly marked `done:false`; standalone quiz collections require `done:true`. Counts come from the actual question arrays loaded from each registered public page's dataset, not from the first interval in the resource title.

`scripts/generate-site-assets.mjs` calls `scripts/public-metadata.mjs` after validating and building the quiz index, before discovering/hashing offline assets. It writes these existing public HTML fields in place:

- Homepage and Testare SEO/OG descriptions: actual published lesson/set/question counts and the configured admission year.
- Lesson and quiz SEO/OG descriptions: canonical name, actual dataset count where applicable, admission year. Obsolete references to admission 2025 are removed; the textbook's historical edition remains unchanged in educational content.
- Existing homepage and Testare catalog entries: link/button availability, label, chapter name, group availability totals and actual quiz size. Authored visual groupings and home topic tags are retained.
- Testare's overall total: sets and questions, visible even when JavaScript is disabled.
- Simulation SEO/OG description: biology training and the unconfirmed detailed admission formula for the configured year.

`npm run generate:check` refuses stale generated HTML just as it refuses a stale index or precache manifest. Generation is idempotent. It does not serialize or rewrite educational lesson bodies, quiz datasets, answers, IDs, URLs or section anchors. Catalog scaffolding remains authored HTML; when adding a chapter, add its catalog item/group along with the stable document as required by the existing chapter workflow, then regenerate.

`home.js` uses the generated quiz index for runtime counts; it no longer misreads discontinuous source ranges as one interval. The analytics catalog uses the same actual question counts. The free-access statement is retained. Account/history copy must reflect the implemented synchronization release and its required database migration; visitors retain browser-local data.

## Audit findings corrected

The delivered homepage had a ten-lesson SEO description, outdated pending labels and category totals despite runtime patches. Testare's delivered HTML marked published sets as pending. Some lesson descriptions still named admission 2025. Simulation Open Graph copy was generic and its result label could be read as confirmation of official current scoring. All these descriptions/statuses are now reconciled before delivery. The three excluded-section notices retain their exact original 2025 curriculum references: their source is `data/curriculum-2025.json`, not a newly verified 2026 curriculum. Details of official score verification are recorded in [simulation-scoring-sources.md](simulation-scoring-sources.md).

## Checks

`node scripts/public-metadata-test.mjs` checks delivered HTML against the registry/index, draft exclusion, changed publication state and generation idempotence. `node scripts/public-metadata-browser-test.mjs` exercises the delivered catalogs with and without JavaScript at desktop and phone widths, including discontinuous-range counts, links, free access and matching SEO/OG descriptions. The release workflow must still regenerate the complete offline manifest and run the project suite after integrating shared assets.

Mențiunile din secțiunile excluse despre programa UMF Cluj 2025 sunt păstrate: ele identifică programa-sursă efectiv folosită, din `data/curriculum-2025.json`. Nu sunt transformate în afirmații despre validarea programei 2026 și nu se schimbă conținutul educațional protejat. Anul admiterii vizate pentru metadatele site-ului este distinct de această proveniență.
