# Simulare de biologie

`testare.html#simulation-builder` configures 35-question practice exams from available quiz resources. The chapter order and availability come from the registry/index. `simulare.html?test=<id>#intrebarea-N` resumes a local simulation, with ten questions per group. Existing chapter answers, traversals, statistics and mistake rounds are not modified.

## Sampling and scoring

`simulation-core.js` allocates one question per selected non-exhausted chapter in shuffled rounds until 35 slots are assigned. The preview allocation is the allocation used to create the run. It samples without replacement, shuffles questions, preserves A–E option order, and copies complete question data and source metadata (key, URL, number, dataset version) into the run.

The partial-credit table follows the UMF Cluj **2023** admissions guide, printed page 18 (PDF page 16): https://cdn.umfcluj.ro/uploads/2023/08/Ghid-Admitere-2023-UMFDigital.pdf#page=16 . A concordance is a correct box selection or a correctly unselected incorrect box. One correct option requires all five concordances; two correct options earn 1 for five concordances and 0.5 for four; three or four correct options additionally earn 0.25 for three concordances. Other answers and blanks earn zero. Do not import another university's cancellation/penalty rules.

Equal weight of one point per question and `10 * points / 35` without a default point are explicitly **training** choices approved for this feature, not a verified 2026 admission-grade formula. Display two decimals only at the end. Scoring version is `umf-cluj-2023-equal-weights-v1` and submitted results are frozen.

## Data and persistence

The existing site generator emits `assets/data/simulation/<storageKey>.json` from each registered authored quiz dataset, exposes its `bankUrl` in the quiz index, and precaches every bank. Runtime loads only selected banks. No datasets are hand-copied or rewritten.

When HTML is opened directly from disk (`file:`), browser policy blocks JSON fetches. The generator also emits identical `.json.js` companions, loaded as classic scripts only for the selected chapters in this mode. Hosted pages continue to request JSON. Missing local files have a specific error; data validation and storage remain shared between both modes.

`simulation-store.js` stores each run separately through `BBUserStorage`, using `bb.simulation.v1:<uuid>`. These records are local to the browser and owner, excluded from cloud hydration and not imported from a guest into an account. They never enter the cloud outbox. Owner changes immediately remove previous content. Unsupported versions are retained without attempting to interpret them. No account, database or remote schema changes are required.

Web Locks serialize read/compare/write across tabs; a persisted integer revision rejects stale edits. Browsers lacking Web Locks cannot start a simulation and receive a visible explanation. No new browser dependency is installed. UI operations are queued with owner/epoch and expected revisions. A completed run rejects all further writes.

The timer is off by default, or 60/90/120 minutes. Store the absolute deadline; reload/background time does not extend it. A write after expiry finalizes first, without applying that answer. The completion timestamp is capped to the deadline. Timekeeping is a local training aid, not proctored exam enforcement.

Storage failure retains the in-memory run, shows a warning and offers a JSON export. Starting a new page is blocked if its run could not persist. Existing history remains readable when writes fail. Exports contain the full local snapshot; this version does not implement import or cloud sync.

## Verification and release

`npm run test:simulation` covers all 960 valid-key/answer-mask pairs, balanced sampling, exact authored-data preservation, owner isolation, hydration exclusion, stale writes, snapshots and deadline enforcement. Browser cases cover real creation/review, history, two tabs, storage quota/export, failed bank requests, navigation/reload, keyboard selection, dialog Escape/Tab/Enter and focus restoration, reduced motion, responsive 1440/768/390/320 widths, fresh offline creation and an installed cache-first worker's first upgrade visit.

After asset changes run `npm run generate`, `npm test`, and `git diff --check`. Changed shared index/storage URLs are versioned in every public consumer. The service worker explicitly permits the simulation query URL to fall back to the precached shell; the UUID identifies local data, never a public server resource. Cache replacement must retain study data. For rollback, regenerate the manifest and deploy the reverted assets together; do not delete simulation records or unrelated caches.
