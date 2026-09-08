# Architecture audit: bio-barrons-umf

Audit date: 2026-09-07. Baseline commit: `00f608d` (`Add nervous system chapter and interactive quizzes`).

Original scope: architecture audit only. The numbered sections below preserve that baseline and its recommendations. Subsequent authorized implementation is recorded in the migration-progress section at the end; baseline descriptions and line numbers there have not been rewritten as though later phases were completed.

## 1. Current architecture

The application is a static, Romanian biology study website for UMF Cluj admission preparation. It has 11 root HTML documents: a homepage, nine lessons, and one quiz page. There are 23 planned chapters represented in the homepage catalog, of which nine are published. “Done” on the homepage means published material, not a student's learning progress. Quiz progress is a separate browser-local feature.

There is no application package manifest, bundler, framework, backend, database, template engine, checked-in test suite, or deployment workflow in this checkout. GitHub Pages deployment is the stated hosting arrangement; its repository settings were not inspected remotely. URLs and canonical metadata use `https://danghg18.github.io/bio-barrons-umf/`. Assets and navigation generally use relative paths, which support a Pages project subdirectory.

`index.html` contains the homepage markup, a large inline stylesheet, and one inline script. The script restores dark mode, draws publication-count rings, defines `CHAPTERS`, implements the command palette, fetches lesson HTML to build a text index, and registers the service worker. `tokens.css` loads before the inline stylesheet and `home-redesign.css` after it. Homepage fonts include Fraunces in addition to Figtree and Noto Sans.

Each lesson is a complete standalone HTML document containing all its authored lesson sections. `.page-section` elements are hidden except for `.active`; navigation switches the active section rather than fetching another document. `.page-section` IDs use `page-<route>`, while public hashes generally omit `page-`. Cross-chapter navigation uses regular HTML links. All lessons load local routing code and then `assets/js/chapter-redesign.js`, which augments that code and the DOM.

The normal lesson stylesheet order, verified in all ten lesson/quiz documents, is:

1. Google Fonts stylesheet.
2. `assets/css/tokens.css`.
3. `assets/css/lesson.css`.
4. Document-local `<style>`.
5. `assets/css/chapter-redesign.css?v=20260727-highlighter6`.
6. `assets/css/quiz.css?v=20260907-quiz4` on the quiz only.

This matters: the comment in `lesson.css` says it loads after inline styles, but the actual documents load it before them. The last chapter layer compensates for earlier styles with specificity and extensive `!important` use.

### Inspection and verification coverage

The full tracked application inventory and the working tree's hidden directories were enumerated. All 11 HTML documents were parsed for structure, IDs, links, images, stylesheet/script order, inline handlers, routing, and function definitions. All five shared stylesheets and all three shared JavaScript files, the worker, quiz data, manifest, sitemap, robots file, logos, icon/image inventory, and project documentation were examined for their application roles. Image bytes were hashed across every image directory. Local editor/plugin configuration is tooling, not runtime architecture; `.github/` contains a local hook configuration, not a sitemap or Pages build workflow. `PRODUCT.md`, `DESIGN.md`, and several tooling directories were already untracked at the audit baseline; they were left untouched.

Read-only checks found:

- No duplicate authored HTML IDs in any of the 11 documents.
- No missing local file targets in authored HTML `src`/`href` attributes (query strings stripped and percent encoding decoded for filesystem checks).
- All versioned local CSS/JS references in HTML agree with the worker's precache entries; all precache file paths exist. All directly referenced local HTML images are precached.
- All 11 inline scripts and the four external scripts including `sw.js` parse with Node's JavaScript parser.
- Quiz data has 50 unique IDs, sequential numbers 51–100, A–E option sets, valid nonempty answer combinations, and explanations on non-answer options.

These are source and structural checks, not browser interaction tests or a scientific review of the teaching material. Mobile rendering, screen-reader behavior, install/update/offline lifecycle, and actual search/highlighter interactions still require browser regression checks before refactoring. File existence is not proof that a fragment opens the right section.

## 2. Repository tree relevant to the application

```text
/
├── index.html
├── introducere_anatomie_fiziologie.html       # chapter 1
├── celula_si_fiziologia_celulara.html         # chapter 3
├── oasele_si_articulatiile.html              # chapter 6
├── tesutul_muscular.html                     # chapter 8
├── tesutul_nervos.html                       # chapter 10
├── sistemul_nervos.html                     # chapter 11
├── grile_sistemul_nervos.html                # quiz 51–100
├── sistemul_renal_complet.html               # chapter 20
├── sistemul_reproducator_masculin.html        # chapter 22
├── sistemul_reproducator_feminin.html         # chapter 23
├── assets/
│   ├── css/{tokens,lesson,chapter-redesign,home-redesign,quiz}.css
│   ├── js/chapter-redesign.js
│   ├── js/quiz-player.js
│   ├── js/grile-sistemul-nervos-data.js
│   └── {logo-mark,logo-horizontal}.svg
├── imagini/                                 # 14 WebP: renal + male reproduction
├── img introducere/                         # 6 WebP
├── img celula/                              # 5 WebP
├── img oase/                                # 4 WebP
├── img muschi/                              # 2 WebP
├── img nervos/                              # 9 WebP: nervous tissue
├── img sistem nervos/                       # 10 WebP: nervous system
├── img reproducator barbati/                # 5 duplicate WebP
├── img reproducator feminin/                # 14 WebP, 10 used in HTML
├── {icon-192,icon-512,apple-touch-icon}.png
├── sw.js
├── manifest.json
├── sitemap.xml
├── robots.txt
├── .gitignore
├── CLAUDE.md                                # empty
├── Lectii                                   # empty file, not a lesson directory
├── PRODUCT.md / DESIGN.md                   # existing local product/design guidance
├── .agents/ / .claude/ / .codex/             # local agent/editor configuration
├── .github/hooks/ / .impeccable/ / .aidesigner/ # local tooling and design artifacts
├── AGENTS.md                                # added by this audit
└── docs/architecture-audit.md                # added by this audit
```

## 3. Sources of duplication

| Concern | Current owners | Consequence |
| --- | --- | --- |
| `goto()` / `closeNav()` | All nine lessons and the quiz, plus shared wrappers | Ten implementations and an additional layer of state synchronization |
| `handleHash()` | Seven newer lessons and quiz | Different defaults; two older lessons have only initial URL handling |
| Topbar / sidebar / mobile drawer | Ten HTML shells, inline CSS, shared CSS, shared JS | Markup repeats while JS inserts, moves, and repairs controls |
| Chapter themes / CSS variables | Homepage cards, `CHAPTERS`, inline roots, tokens, shared theme map, redesign token families | Multiple definitions and conflicting scopes |
| Cards / tables / grids / responsive styles | Inline lesson CSS, tokens, lesson overlay, chapter overlay | Effective behavior depends on load order and selector precedence |
| Dark mode | Homepage, two older lessons, shared JS, several CSS layers | Same storage key but different initialization and exception handling |
| Highlighter | Two older lessons plus shared fallback | Different persistence of mode, selection filters, and touch support |
| Search | Homepage index, identical legacy engine copied into two lessons, shared engine | Different normalization, indexing, caps, and DOM mutation rules |
| Metadata / route lists | Homepage markup and JS, ten nav shells, `pages`/`SUB_NAVS`, worker, sitemap | Adding material requires coordinated manual edits |

Whitespace-normalized selector/declaration comparisons found 84 common CSS rules between introduction and cell, 85 between bones and muscle, and 442 between renal and male reproductive pages. These comparisons establish extensive duplication, not interchangeability: declaration values, selectors, breakpoints, defaults, and content layouts still differ. Both legacy lesson search blocks, from `lessonSearchState` through setup, are byte-identical; their surrounding routing, initialization, and dark-mode code are not.

## 4. Shared functionality

### Existing reusable assets

- `tokens.css`: fonts, colors, spacing, radii, shadows, semantic elements, base focus rules, and `body.dark` variables. It is more than a token dictionary: it also styles tables, figures, headings, and links globally.
- `lesson.css`: another visual layer for heroes, figures, cards, navigation, boxes, tables, and dark mode. Its references to `kit-styles.css` describe an absent historical asset, not a current dependency.
- `chapter-redesign.css`: actual final lesson presentation, shell, navigation, search, cards, tables, highlights, dark mode, responsive rules, and renal-specific flowchart styles.
- `chapter-redesign.js`: theme inference, branding, menu/skip-link creation, link enhancement, route wrapper, accessibility repairs, drawer, search, settings, dark mode, highlighting, keyboard handling, and worker registration.
- `quiz-player.js` plus `quiz.css`: quiz rendering and interaction, though the player is coupled to the single nervous-system dataset.
- Shared logos, manifest, icons, and worker.

### Dark mode and highlighter

Dark mode uses `body.dark` and `localStorage.darkMode` values `1`/`0`. Homepage and shared helpers catch storage errors. Renal and male pages access storage without protection before later initialization; the shared wrapper cannot repair an exception already thrown by the original function or initial script. There is no system color-scheme selection or cross-tab storage synchronization implemented. Restoring the class late can expose a light-mode flash.

Shared highlighter fallback stores `highlighterMode`; both legacy implementations start `hlMode` as false instead. All shared palettes store `highlighterColor`, with yellow/green/blue/pink/violet/orange choices. Text is wrapped in `mark.hl`; a shared MutationObserver attaches color to marks created by local code. The fallback filters out controls and existing highlights and handles `mouseup` plus delayed `touchend`; local implementations use `mouseup` and broader text-node selection. Highlighted passages themselves are not serialized to storage, and no passage-management/removal implementation was found. Do not promise persistence of annotations just because the palette color or enabled state persists.

### Search

Homepage functions beginning at `index.html:832` define a 23-record `CHAPTERS` catalog. Opening the palette (`Ctrl/Cmd+K`) starts fetching the nine published lesson documents. `DOMParser` and a text-node walker index `.page-section` text without executing those documents' scripts. Searching is diacritic-insensitive, returns up to 30 displayed text results, and falls back to chapter metadata/keywords. One failed fetch rejects the entire `Promise.all`; `res.ok` is not checked. The result-limit return is inside a `forEach` callback, so it does not stop traversal of all entries.

Text results navigate using `?q=<query>&section=<route>&hit=<zero-based occurrence within section>`. Chapter fallback links use `?q=...`. This is an existing URL contract. The quiz is linked from the homepage but is not part of `SEARCHABLE_CHAPTERS`; dynamic renal flowchart text is also absent from the fetched HTML text index.

Shared lesson search walks live section text, folds diacritics with a source-offset map, caps results at 300, debounces by 140 ms, skips `mark.hl` and controls, creates owned `mark.search-found` nodes, routes to matches, and restores query parameters. Legacy search is synchronous, uncapped, lowercase-only, creates spans, includes a broader set of nodes, and closes on outside clicks. For example, homepage `rinichi` can match text identically, but an unaccented query such as `reabsorbtia` may be found globally and fail to match `reabsorbția` in the renal lesson. Occurrence numbers can also drift when the live DOM includes generated content or different excluded nodes.

Both lesson engines work per text node, so phrases spanning inline elements may not match. They can find text in collapsed containers without explicitly expanding those containers. Search and highlighter both split/wrap text nodes, so references and occurrence ordering need joint tests. Shared capture-phase keyboard handling preserves native `Ctrl/Cmd+F` by stopping legacy listeners; `/` opens lesson search and Escape closes search/drawer.

### Quizzes

`grile_sistemul_nervos.html` authors five empty range sections and repeats the range navigation and routing list. It loads inline routing, dataset, player, then chapter enhancement. At `DOMContentLoaded`, callbacks run in that registration order: route handling, quiz rendering, shared setup. A zero-delay player callback relabels shared search/back controls after shared setup. Changing loading strategy can break this implicit ordering.

The dataset exposes `window.BB_NERVOUS_QUIZ`, version 1, storage key `bb.quiz.sistem-nervos.v1`, five ranges, and 50 questions. The player renders checkboxes, requires a nonempty selection, compares exact unordered answer sets, reveals explanations, saves selections/verified/correct state, allows retry, and confirms full reset inline. Saved IDs are filtered and version mismatch resets state. Saved `correct` booleans are trusted rather than recomputed; changing answer keys without a data-version policy can leave stale scores.

The player validates precisely 50 questions numbered 51–100 and `sn-` IDs. Text, range counts, return links, and labels also hard-code this quiz. `renderOption()` assumes an answer with an explanation needs “De ce afirmația este incorectă”, an assumption tied to the current question set's wording. Generalizing must preserve question intent rather than merely renaming the global. The current separation of question data from UI is useful and should be retained.

## 5. Lesson-specific functionality

The following lists every current route in authored order; the first is the default active section. CSS/JS byte counts refer only to embedded blocks, not external files or event-handler attributes.

| Lesson file | Routes / default | Inline CSS bytes | Inline JS bytes |
| --- | --- | ---: | ---: |
| `introducere_anatomie_fiziologie.html` | `home`, `introducere`, `organizare`, `functii`, `termeni`, `cavitati` | 8,351 | 1,089 |
| `celula_si_fiziologia_celulara.html` | `home`, `introducere`, `structura`, `membrana`, `transport`, `nucleu`, `organite`, `energie`, `recapitulare` | 8,689 | 1,125 |
| `oasele_si_articulatiile.html` | `introducere`, `osul`, `articulatii` | 8,570 | 1,073 |
| `tesutul_muscular.html` | `tesutul-muscular`, `muschiul-striat`, `energia` | 7,727 | 1,095 |
| `tesutul_nervos.html` | `organizare`, `fiziologia-nervilor`, `sinapsa` | 156 | 1,081 |
| `sistemul_nervos.html` | `sistem-nervos-central`, `sistem-nervos-periferic`, `sistem-nervos-autonom` | 156 | 1,132 |
| `sistemul_renal_complet.html` | `home`, `rinichii`, `nefron`, `hormoni`, `anexe`, `mindmap` | 58,970 | 44,890 |
| `sistemul_reproducator_masculin.html` | `home`, `testiculele`, `ducte`, `hormoni` | 51,137 | 15,061 |
| `sistemul_reproducator_feminin.html` | `home`, `intro`, `organe`, `fiziologie` | 7,003 | 1,061 |
| `grile_sistemul_nervos.html` | `grile-51-60`, `grile-61-70`, `grile-71-80`, `grile-81-90`, `grile-91-100` | 156 | 1,118 |

The homepage separately embeds 23,745 CSS bytes and 18,808 JavaScript bytes.

Seven newer lessons and the quiz define `pages`, `goto(page)`, `closeNav()`, and `handleHash()`. They validate against a literal list, use `history.replaceState`, handle initial and later hash changes, and show back-to-top after 500 px. Empty hashes do not force reinitialization; invalid nonempty hashes route to the per-page default. The quiz limits sidebar matching to `a[onclick]`, whereas the seven lesson implementations iterate all sidebar anchors. The different defaults must remain explicit; `home` does not exist on four lessons or the quiz.

Renal and male reproductive lessons have `goto(sec, anchor)`, `SUB_NAVS`, and `scrollToAnchor()`. The second `goto` parameter is declared but not used. They render subsection links dynamically, validate by DOM existence, accept initial `?goto=` before the hash, remove the hash for `home`, and show back-to-top after 300 px. They do not install a `hashchange` handler. Subsection links use native `#<element-id>` plus delayed scrolling, but reloading such a hash does not necessarily restore its owning section. All route implementations use replacement rather than deliberately creating a history entry per section; native link defaults and later enhancement affect actual Back behavior.

Lesson-specific material includes introduction terminology layouts, cell organelle/transport comparison tables, bones term/layout rules, muscle energy flows, and the nervous-system cranial-nerve and autonomic tables. All nine lessons have figures and tables (18 tables total). These are educational structures, not duplicated infrastructure to rewrite wholesale.

The renal `#mindmap` route now contains a live five-step glomerular filtration flowchart, with local `STEPS`, dynamically created nodes/details, keyboard activation, play/reset timers, and toast feedback. Its CSS currently lives in both the page and shared chapter stylesheet. Keep this as a separately initialized lesson module. The same page retains older `INFO`, `CONN`, `showInfo`, `showConn`, `setScenario`, and simulator calculation code: their required mind-map/slider DOM IDs are absent, and the entry functions have no callers in this repository. These are deprecation candidates, not evidence of a working simulator. Preserve and review their embedded teaching text before any removal. Flowchart reset does not cancel pending animation timeouts, a separate behavior risk worth testing.

The male lesson retains a real accordion via `tog()`; renal also defines `tog()` and initial accordion synchronization. Do not infer that every legacy widget still exists merely because its CSS/function remains.

## 6. Problems with `chapter-redesign.js`

The 1,210-line file is a compatibility layer acting as the application's main controller. Its useful accessibility and consistency improvements should survive migration, but its ownership model should not.

| Patch / adapter | Evidence | Dependency and risk |
| --- | --- | --- |
| `patchGoto()` | `assets/js/chapter-redesign.js:255` | Saves original `window.goto`, forwards arguments, adds async nav/focus synchronization; original still owns routing, hash, drawer closure, and scroll |
| `setupDrawer()` | `assets/js/chapter-redesign.js:425` | Saves local `closeNav`, replaces it, adds inert/ARIA/focus state, intercepts overlay/menu clicks before old handlers |
| `setupSearch()` | `assets/js/chapter-redesign.js:784` | Decides ownership from the existence of `#lesson-search`; wraps both legacy opener globals, but keeps the old search engine and listeners |
| `setupDarkMode()` | `assets/js/chapter-redesign.js:987` | Wraps local toggle or installs fallback; cannot catch failures inside the original toggle |
| `setupHighlighter()` | `assets/js/chapter-redesign.js:1100` | Wraps local toggle or installs fallback selection engine; observes new marks to add color |
| Local FAB wrappers | Male page near 1809; renal near 2309 | Each already replaces dark/highlighter globals before shared code wraps them again |

Line numbers are navigation aids for this baseline; function names are the durable references.

Additional problems:

- `getGotoTarget()` parses JavaScript in `onclick` with a regex. Formatting and global function names become a hidden data API; dynamically generated subsection links are not declarative route records.
- `applyChapterTheme()` extracts a number from visible badge text or title. It can mistake a quiz question number for a chapter if the badge changes. It writes both `--chapter-*` and legacy `--bb-new-*` aliases inline; the latter have no consuming references in current shared CSS.
- It repairs markup at runtime: replacing brand contents, adding menu/skip links and settings, moving search/back controls, assigning card roles, and inventing accordion IDs. Authored HTML and effective DOM differ substantially.
- The route wrapper synchronizes using the requested target, not the original function's resolved fallback. A direct `goto('invalid')` may show the default section while removing correct active navigation state.
- Zero-delay timers, DOMContentLoaded order, capture listeners, and MutationObservers form an implicit lifecycle. Moving scripts to modules/defer without a lifecycle plan can change behavior.
- It hides and supersedes controls through CSS while their old listeners and wrappers remain active. It also registers the worker even where renal already does so.
- One init path serves lessons and quizzes with guessed capabilities. Owned search/highlighter are selected by DOM/global presence, not explicit configuration. No documented init/destroy or feature-event contract exists.

## 7. Problems with inline CSS

The large legacy pages contain whole design systems, not just lesson-specific presentation. Both renal and male inline styles contain 243 `!important` occurrences each. `chapter-redesign.css` adds 952 occurrences across 2,581 lines. These raw counts indicate cascade complexity, not 952 independently confirmed bugs.

Several vocabularies coexist: `--blue/--green/--purple`, `--primary/--emerald/--violet`, `--lab-*`, `--chapter-*`, `--bb-*`, and homepage `--home-*`. Colors, surfaces, spacing, fonts, and widths are redefined at root and body scopes. For example, male reproduction redefines `--primary` as teal, which influences supposedly global action colors; homepage chapter 23 is teal while its lesson/shared theme is pink. These may be intentional distinctions and must be recorded before consolidation.

Five mid-generation lessons repeat ~7–9 KB of shell/component CSS each. Nervous tissue, nervous system, and quiz have only a 156-byte theme/section block and author the redesign body class directly; other lessons rely on JS to add that class, creating a different failure/first-paint path.

Legacy responsive styles repeat 768/1024 px rules; mid-generation lessons use 900/640 px; the final shared layer uses 1024 for drawer behavior and 700 for content collapse, with additional 1240/430 px rules. The same class can therefore change at several thresholds. Tables receive styles from tokens, lesson CSS, local CSS, and chapter CSS; the final mobile rule enforces a 680 px minimum table width inside horizontal wrappers. Arbitrarily removing earlier rules can change overflow, white figure framing, or column relationships.

Markup itself has many `style` attributes, particularly renal and male pages (123 and 61 raw occurrences, including authored script strings). Inline JS also sets layout and visual styles. Migration should distinguish structural/infrastructure styles from styles encoding meaningful diagrams or teaching comparisons.

## 8. Problems with inline JavaScript

Ten local routers and repeated handlers make fixes laborious. Compact one-line implementations differ in defaults and selectors, so “copy the common router” is unsafe. Global lexical declarations such as `pages` coexist with window functions that inline handlers require; converting scripts into modules makes those functions inaccessible unless call sites change.

The two older lessons combine routing, subsection metadata, common settings, search, highlighting, and educational widgets in a single script. Unguarded storage errors can prevent later statements from running. Legacy initialization also applies `decodeURIComponent(q)` after `URLSearchParams` has already decoded it: a query containing a literal percent can throw, and percent sequences can be decoded twice.

Inline handlers couple code to specific IDs and source syntax. Search replaces DOM text, subsection navigation replaces `innerHTML`, and quiz rendering creates more inline route handlers. Refactoring only script tags leaves these dependencies intact.

Educational strings inside renal widget data and quiz data are content too. Moving infrastructure must not accidentally omit them from snapshots, search planning, or review.

## 9. Chapter metadata duplication

Current chapter identity is repeated in:

1. Homepage `CHAPTERS`: 23 numbers, titles, categories, colors, publication flags, URLs, keywords.
2. Homepage card markup, category labels/colors, count rings, publication totals, and footer links.
3. Document titles, descriptions, canonical and Open Graph metadata, browser theme-color.
4. Each lesson's sidebar badge/title, top navigation, map links, section headings, and page navigation.
5. Local `pages` arrays or `SUB_NAVS` plus section IDs in markup.
6. `applyChapterTheme()`'s nine-entry numeric theme map and inline chapter variables.
7. Worker page/asset inventory and `sitemap.xml` URL list.
8. Quiz ranges in data, HTML sections, sidebar links, local `pages`, and hard-coded player totals.

Not all repetition should disappear from delivered HTML: titles and navigation must remain useful static markup. The issue is repeated **authoring** without a generating source or validation. The quiz should be a resource attached to chapter 11, not counted as a tenth published chapter.

### Sitemap generation today

There is a checked-in `sitemap.xml` containing 11 URLs: the homepage root, nine lessons, and the quiz. `robots.txt` points to it. There is no sitemap generator, package script, hook, or workflow that produces it in the inspected repository. Its current maintenance mechanism is manual/static; an external process cannot be ruled out, but is not defined here. `lastmod` values are explicit dates and cannot be assumed to follow the latest file changes. Preserve meaningful dates rather than replacing all with the current build date.

## 10. Service worker maintainability issues

`sw.js` uses `biologie-atlas-v14` and computes `BASE` from its own URL, which is appropriate for the project subdirectory. Installation precaches one hand-maintained list with `cache.addAll`, then calls `skipWaiting`. Activation deletes every differently named cache on the origin and claims clients. HTML is network-first with cached-request then homepage fallback; ordinary assets are cache-first; Google Fonts are network-first with cache fallback.

Risks and limitations:

- Cache name, versioned HTML asset references, and precache strings must be updated together manually. They currently agree; the maintainability issue is the lack of an automated guarantee.
- One missing/failed required asset can reject `cache.addAll` and prevent the new worker from installing.
- Activation deletes unrelated origin caches as well as old app caches. Other Pages projects on the same origin can share Cache Storage; cleanup needs an application-specific prefix.
- Immediate activation and client claiming can mix an already-open document with a new cache generation. There is no visible update protocol or compatibility policy.
- HTML responses are cached without checking status. An HTTP error response may replace a good cached document; fallback only covers network rejection.
- HTML cache writes are not included in `event.waitUntil`. Font writes likewise are not awaited as lifecycle work.
- Cache keys include query strings. A precached lesson without a query does not directly satisfy an unvisited `?q=...&section=...&hit=...` request offline; the fallback may serve homepage HTML under the lesson URL. This is a source-derived risk, not a tested installed-PWA observation.
- Non-preloaded ordinary assets fetched successfully are not added to the cache; the catch-all branch is broader than its “local assets” comment. Fonts remain dependent on prior successful retrieval and do not have an explicit missing-cache response.
- Registration errors are silently swallowed. Registration exists in homepage, shared chapter JS, and additionally renal inline JS. No offline-ready state or install failure feedback exists.

Preserve `sw.js` URL/scope during migration. Generated precache data should eventually derive from validated published outputs and intentional image lists, not a blind crawl of tooling directories.

## 11. Image organization problems

There are 69 WebP lesson image files across nine directories, plus three PNG icons and two SVG logos: 74 image assets totaling 4,228,616 bytes. Naming mixes spaces, abbreviations, uppercase letters, and double extensions such as `.png.webp`. `imagini/` combines two chapters, while nervous tissue and nervous-system figures have similar but separate directory names. This makes manual inventory and case-sensitive deployment checks harder.

SHA-256 comparison confirmed five exact duplicate pairs between `imagini/` and `img reproducator barbati/`:

- `spermatogeneza_barrons.webp`.
- `sist_rep_masculin_barrons.webp`.
- `ducte_organe_masculine_barrons.webp`.
- `structura_spermatozoid_barrons.webp` versus `Structura_spermatozoid_barrons.webp`.
- `sistem_ducte_barrons.webp` versus `Sistem_ducte_barrons.webp`.

The male lesson uses `imagini/`; the duplicate directory has no direct HTML references. Four female images have no direct HTML references or precache entries: `foite_embrionare_barrons.png.webp`, `etapele_dezvoltarii_barrons.png.webp`, `membranele_embrionului_barrons.png.webp`, and `fat_inainte_nastere_barrons.png.webp`. This does not authorize deletion: they may be retained source material or externally linked assets. `icon-512.png` is used by the manifest despite lacking a direct HTML reference; the horizontal logo is precached. An HTML-only unused-file report is insufficient.

There is no central image inventory with chapter ownership, source/provenance, dimensions, captions, intended usage, and offline inclusion. Many figures are lazy-loaded and have alt text, but existing image paths should remain stable. Start with an inventory; use a consistent directory convention for future images, without moving or deleting old files.

## 12. Technical risks

The five largest architectural problems are:

1. **Split behavior ownership:** ten local routers plus shared wrappers, and two competing search/highlighter implementations.
2. **An override-based CSS system:** repeated shell styles and token dictionaries across HTML and three lesson styling layers.
3. **No authoritative metadata source:** publication state, identity, routes, themes, sitemap, and offline lists must agree by manual effort.
4. **Infrastructure mixed with teaching widgets:** especially renal, where active flowchart content and obsolete simulator code coexist with navigation and settings.
5. **Fragile offline release management:** manually synchronized versions, query-sensitive fallbacks, and origin-wide cache cleanup.

The largest migration risk is breaking bookmarked section/search URLs while changing route ownership, combined with an installed PWA still serving older assets. Other risks include annotation DOM damage, lost quiz state, incorrect teaching table layout, focus traps remaining active after resize, and silently inaccessible sections when JavaScript fails. Print styling does not explicitly reveal every inactive section; retain current behavior until a separate print requirement is agreed.

Modern APIs and CSS (`inert`, optional chaining, `color-mix`, `oklch`, `100dvh`) appear without a documented browser baseline. This is a compatibility requirement to establish, not a reason to redesign the site. There is also no automated content/route baseline today. Existing untracked tooling files should not be accidentally included in a deployment or broad commit.

## 13. Proposed target architecture

Keep a static multipage site with the same root `.html` filenames, fragments, query contracts, and image URLs. Use plain JavaScript modules and a small, deterministic **build-time** template/data step when ready; Node tooling may run locally or in CI, but deployed files must need only static hosting. No React, Next.js, Astro, backend, or database is required.

Recommended ownership:

- **Catalog data:** a canonical chapter/resource registry for identity, URLs, publication state, category, theme reference, keywords, and quiz relationships. Store explicit stable section IDs/defaults/subsection anchors in per-lesson configuration. Avoid duplicating those IDs in independent hand-maintained arrays; validate configuration against content IDs.
- **Authored content:** retained HTML fragments containing the existing prose, tables, figures, section IDs, and educational widget data. Start from current markup, not a Markdown conversion or rewrite.
- **Static templates:** shared head, topbar, sidebar, and page navigation render into complete HTML at build time. Each chapter's differing navigation remains configuration. Generated repetition is acceptable; copy-pasted infrastructure sources are not.
- **Runtime shell:** one initializer composes routing, drawer, search, preferences, highlighter, and accessibility. A router reports the resolved section and emits a documented section-change event. Other features subscribe rather than replace global functions.
- **Lesson extensions:** optional modules such as the renal flowchart initialize within their own root; they do not override navigation/settings. Educational data stays local to the lesson or its dedicated data file.
- **CSS:** one token/theme source, base semantic rules, shared shell/components, then genuinely lesson-specific styles. Preserve computed appearance during consolidation. Keep compatibility overrides isolated until their final consumer is migrated; do not delete `!important` indiscriminately.
- **Search:** shared normalization and text eligibility rules for homepage and lesson search. Generate a static text index with the same rules once content assembly is stable. Preserve old `q/section/hit` links; new stable match anchors can be added only with compatibility handling.
- **Quiz:** keep data separate, pass an explicit dataset/configuration into a generic player, and use a documented storage-version migration policy. Make question intent explicit if explanation labels are generalized.
- **Publishing:** generate sitemap and precache inventory from validated outputs. Keep current root output paths, manifest scope behavior, and worker URL. Validate under `/bio-barrons-umf/`, not only a server root.

During transition, allow one explicitly named legacy adapter to translate current global calls. Do not scatter new wrappers across lessons. Migrated pages should opt into the new initializer and bypass the old feature owners; never initialize both controllers for the same feature.

## 14. Migration plan divided into small phases

Each row is a separate, reviewable change or a short series of per-feature/per-page changes. Do not run all phases as one refactor. Every runtime phase needs a deliberate worker version/precache update and tests with both fresh and previously installed caches.

| Phase | Small scope and completion gate |
| --- | --- |
| 0. Record contracts | Add a route/query/default inventory and representative browser baselines for every page. Capture content text/IDs/figure paths, quiz IDs/storage, light/dark and mobile behavior. Record existing bugs separately from migration regressions. No application refactor. |
| 1. Extract homepage metadata | Move the exact `const CHAPTERS = [...]` declaration unchanged from `index.html` into `assets/js/chapters-data.js`, loaded as a classic script immediately before the existing inline script. Do not wrap it, make it async, or change record values/order. Update worker precache and version. Homepage output, search results, and counts must remain unchanged. |
| 2. Establish runtime boundaries | Extract shared utilities/preferences into modules behind the current entry point; one feature per change. Characterize and preserve legacy behavior first. Keep `chapter-redesign.js` as the stable compatibility entry URL. Do not simultaneously change routing, CSS, and highlighter behavior. |
| 3a. Pilot explicit routing | Add explicit default/section configuration and a shared router on introduction only. Preserve fragment/replacement semantics, focus behavior, and search contracts. Disable `patchGoto` for that migrated owner. Use a temporary documented global adapter for existing inline callers. |
| 3b. Roll out routing/drawer | Migrate other simple lessons individually, then quiz, then legacy lessons. Add subsection/`?goto=` compatibility before renal/male migration. Centralize drawer state and back-to-top without changing thresholds accidentally. Remove a local function only when its replacement is active and verified. |
| 4. Unify search/highlighter | Share normalization and indexing rules; then migrate the two legacy engines independently. Address diacritic behavior as an explicit bug fix. Test live text mutations together. Preserve storage keys and clearly retain the current nonpersistent nature of passage marks. |
| 5. Consolidate styles | Extract local CSS verbatim at its current cascade position before deduplication. Compare computed styles/screenshots; consolidate one component family at a time. Keep chapter 23's pink lesson theme and other deliberate differences. Isolate renal flowchart styles. |
| 6. Generate static shells | Introduce a minimal template build, pilot one chapter, then expand. Move catalog to canonical JSON and generate its browser data file; generate head/navigation from catalog + per-lesson config. Preserve educational HTML fragments and exact output URLs. Make generation deterministic and document deployment. |
| 7. Generate indexes and offline inventory | Generate sitemap, search index, and precache inventory from validated outputs. Fix app-scoped cache cleanup and explicit offline query handling in separate changes. Exercise install/update/rollback and never let failed generation publish partial outputs. |
| 8. Isolate extensions and retire adapters | Extract the renal flowchart and generalize quiz configuration only when earlier contracts are stable. Review obsolete renal code separately. Retire old overlay/adapter files only after every consumer migrates; inventory images without deleting them. |

**Exact first refactor recommendation:** phase 1, after phase 0's baseline: extract the unchanged homepage `CHAPTERS` declaration into one external classic script. It removes the metadata from a large mixed-purpose document without touching lesson controllers. This does not yet eliminate homepage markup duplication; it establishes the first shared source that later generation can consume. Only `index.html`, the new data script, and `sw.js` need runtime changes for that step. Do not use this extraction as permission to start the remaining phases.

## 15. Files that should eventually be created

These are proposed paths, not current dependencies. Introduce them when the associated phase needs them.

| Path | Purpose |
| --- | --- |
| `assets/js/chapters-data.js` | First extracted classic-script catalog; later generated from canonical data |
| `data/chapters.json` | Canonical published/planned chapter and resource metadata after template build adoption |
| `data/lessons/<chapter-id>.json` | Default route, ordered sections, subsection anchors, theme reference, optional feature configuration |
| `data/images.json` | Existing image ownership, hashes, provenance, captions/dimensions where known, offline policy |
| `src/templates/{home,lesson,quiz}.html` | Static page layouts |
| `src/templates/partials/{head,topbar,sidebar,page-nav}.html` | Shared authored shell fragments |
| `src/content/<chapter-id>.html` | Preserved educational markup, with existing IDs and figure URLs |
| `assets/js/core/{storage,motion,router,drawer}.js` | Small shared primitives and authoritative navigation/drawer behavior |
| `assets/js/features/{theme,search,highlighter}.js` | Shared user-facing features with explicit APIs |
| `assets/js/search/{normalize,text-index}.js` | Matching/eligibility rules shared with index generation |
| `assets/js/{home,lesson}.js` | Explicit entry points composing features in known order |
| `assets/js/legacy-adapter.js` | Temporary adapter for remaining inline/global callers |
| `assets/js/lessons/renal-flowchart.js` | Renal-specific interaction; teaching data preserved |
| `assets/css/{base,themes,shell,components,home}.css` | Consolidated styles alongside retained `tokens.css` and `quiz.css` |
| `assets/css/lessons/renal.css` | Styles belonging only to the renal extension |
| `assets/data/search-index.json` | Generated static cross-lesson search data |
| `scripts/{build,generate-sitemap,generate-search-index,generate-precache,validate-site}.mjs` | Deterministic local/CI tooling; worker output remains `sw.js` |
| `src/sw.js` / `assets/data/precache-manifest.json` | Worker source and generated asset inventory if that split is adopted |
| `package.json` / lockfile | Only when actual build/test dependencies are introduced |
| `tests/fixtures/route-contracts.json` | All existing defaults, routes, query forms, and representative subsection links |
| `tests/{navigation,search-highlighter,quiz,offline}.spec.js` | Behavior regressions across simple, legacy, and quiz families |
| `.github/workflows/validate.yml` | Run build/validation; add publishing only after existing Pages settings are checked |
| `docs/{chapter-authoring,url-contracts,release-process}.md` | Authoring, compatibility, and offline release instructions |

Do not create every proposed module immediately or introduce a framework to implement this directory structure. Keep interfaces small and merge modules where separation would add no useful ownership boundary.

## 16. Files that should eventually be removed or deprecated

- Deprecate the implementation inside `assets/js/chapter-redesign.js` as each owner migrates; retain a compatibility entry or its URL as needed for cached documents. Remove the file only with a deliberate old-client strategy.
- Deprecate `assets/css/lesson.css`, `assets/css/chapter-redesign.css`, and `assets/css/home-redesign.css` as override layers after equivalent consolidated styling is verified on every consumer. These are not safe immediate deletions.
- Remove duplicated infrastructure `<style>`, `<script>`, and inline handlers from generated lesson sources only after their replacements own the behavior. Do not remove the lesson documents themselves.
- Deprecate local `pages`, `SUB_NAVS`, theme dictionaries, and manually authored catalog/navigation copies in favor of registry/configuration-generated output.
- Remove hidden legacy settings FAB markup/styles and local wrapper IIFEs after shared controls pass regression checks.
- Review the renal orphaned mind-map/simulator code and corresponding unused styles separately; do not mistake its educational strings for disposable scaffolding.
- Replace the manually maintained contents of `sitemap.xml` and the precache array with generated output; keep public `sitemap.xml`, `robots.txt`, `manifest.json`, and `sw.js` paths.
- `Lectii` and empty `CLAUDE.md` are housekeeping candidates, not runtime architecture. Their removal is optional and outside this audit.

Keep all public HTML filenames, all images (including duplicate and currently unreferenced files), quiz data, icons, and logos. The audit authorizes no deletion.

## 17. Regression risks for each phase

| Phase | Main regressions to prevent | Required verification before moving on |
| --- | --- | --- |
| 0 | Baselines omit legacy differences or dynamic teaching content | Cover all 11 pages, every route/default, legacy subsection targets, dynamic flowchart text, quiz data; distinguish known defects |
| 1 | `CHAPTERS` unavailable due to script order/scope; offline palette failure | Compare all 23 records/order, nine published URLs, palette metadata/text results and offline load; precache the exact new URL |
| 2 | Double toggles, storage exceptions, changed preference state, lifecycle races | Test dark/highlighter controls on simple + both legacy lessons, storage denied, refresh, repeated init; preserve keys and color |
| 3a | Wrong fallback, unwanted new history entries, focus/scroll jumps | Introduction: every section, empty/invalid hash, `q/section/hit`, modified clicks, Back/Forward, heading focus |
| 3b | Lost non-home defaults, legacy `?goto=`, subsection ownership, stuck mobile inert state | Entire route matrix, loaded-page hash edits, bookmark reloads, drawer Escape/overlay/Tab/focus return and resize across 1024 px; quiz cross-links |
| 4 | Wrong occurrence destination, lost text, nested/leftover marks, hidden matches, touch failures | Accented/unaccented and percent queries, inline-element boundaries, cross-section hits, search while highlighting, highlight then search, clear/retry, collapsed content and touch |
| 5 | Table clipping, dark contrast changes, diagram layout damage, flashes | All nine lessons + quiz at desktop, 1024 boundary, 700/640 and narrow phone widths; light/dark, reduced motion, print and white-background figures |
| 6 | Rewritten/missing teaching text, changed anchors/canonical URLs, wrong nav labels | Compare content/IDs/image URLs before and after generation, validate all generated links and metadata, deterministic rebuild; serve under project subpath |
| 7 | Installation fails, stale mixed assets, offline query opens homepage, unrelated caches deleted | Fresh install, old-version upgrade with an open tab, failed resource, offline routes/query URLs, font fallback, unrelated cache survival, sitemap and inventory consistency |
| 8 | Flowchart timers/events break; quiz state resets or scoring changes; cached pages lose old assets | Play/reset repeatedly, all flowchart details/keyboard actions, all 50 quiz answers/retry/reset/reload/version changes; no remaining adapter references, old-cache compatibility |

For each phase, keep the previous deployable revision available and define rollback before publishing. Reverting HTML alone does not reliably undo an activated worker. Complete the documentation audit here; architecture implementation requires a subsequent task.

## Migration progress

### Completed: chapter-data extraction (2026-09-07)

- Extracted the exact 23-record `CHAPTERS` declaration into canonical `assets/js/chapters-data.js`. No field values, record order, URLs, or normalization logic changed. `done` still means publication state; unpublished records still omit URLs.
- The file documents its global lexical binding for non-module scripts. `index.html` loads it synchronously as a classic script immediately before the existing consumer script; there is no second `CHAPTERS` declaration in the homepage. No bundler or module migration was introduced.
- Added the exact new asset URL to `sw.js` precache and changed the cache name from `biologie-atlas-v14` to `biologie-atlas-v15`. Worker strategies and registration remain unchanged.
- Remaining metadata copies have **not** been migrated: homepage cards/category colors/counts/footer links, lesson head metadata and navigation, local route lists/`SUB_NAVS`, inline themes and `applyChapterTheme()`, sitemap URLs/dates, worker page inventory, and quiz range metadata. Treat these as compatibility copies to validate against the catalog where applicable, not additional authoritative catalogs.

Verification used the existing bundled Playwright/Chromium runtime and a temporary static server at `/bio-barrons-umf/`; no testing dependencies were added to this repository. Before/after checks covered homepage load, all nine published card destinations, fourteen disabled cards, disabled unpublished palette results, all homepage links, 28 query cases (including ș/s, ț/t, ă/a, â/a, î/i), exact search results/order/rendered palette markup, result destination parameters, and dark-mode toggling/persistence. The extracted declaration is byte-identical and the remaining inline behavior script is unchanged apart from the removed data and its surrounding whitespace. Four full-page screenshot comparisons (desktop/mobile × light/dark) had zero changed pixels. Clean v15 installation, v14-to-v15 upgrade with an open homepage, installed-worker reload, and offline homepage search were checked without page or console errors. Lesson, quiz, CSS, and image files remain unchanged.

Compatibility note: switching offline immediately after the very first installation, before an online reload under worker control, can produce a Google Fonts stylesheet network error. This was reproduced against the unchanged v14 baseline; chapter data still loads. After the controlled online reload, fresh v15 and upgraded v15 offline checks passed without console errors. The existing font-cache limitation was not changed in this extraction.

At the completion of chapter-data extraction, the next recommendation was to extract shared storage helpers. The later, explicitly authorized router pilot below superseded that ordering; storage helpers have not been extracted.

### Completed: shared lesson-router pilot (2026-09-08)

The pilot migrates only `tesutul_muscular.html`. It adds `assets/js/lesson.js`, updates the pilot markup, adds a narrow compatibility boundary in `assets/js/chapter-redesign.js`, precaches the runtime in `sw.js` as part of cache v16, and records the ownership rules in `AGENTS.md` and this audit. No other lesson HTML, CSS, image, URL, section ID, or educational content was changed.

`assets/js/lesson.js` is the sole routing owner on the pilot. It discovers routes in document order from `.page-section[id^="page-"]`, removes the `page-` prefix for public hashes, and derives the default from the authored active section. Ordinary `href="#route"` links now drive navigation. The runtime applies the active section, synchronizes sidebar and top-navigation state plus `aria-current`, handles initial and changed hashes, normalizes unknown hashes to the default route, scrolls, focuses the active heading after user/history navigation, and owns the pilot's back-to-top behavior. Existing non-route anchors such as `#lesson-content` remain normal document anchors.

The pilot no longer declares a `pages` array or local `goto()`, `closeNav()`, or `handleHash()`, and it has no inline `goto()`/drawer/back-to-top handler. It loads `lesson.js` before `chapter-redesign.js`. The latter explicitly skips its legacy route wrapper and route-state synchronizer when `window.BBLessonNavigation` exists. Shared search uses a small adapter: it calls `BBLessonNavigation.navigate()` on migrated pages and falls back to the existing `window.goto()` on legacy pages. The shared router emits `bb:lesson-section-change`; the existing drawer controller consumes that event and closes the mobile drawer before the router moves focus. Search, drawer accessibility, highlighter, dark mode, and other shared enhancements remain in `chapter-redesign.js` for this phase.

There are two intentional behavior changes. Semantic section-link clicks now create normal browser history entries, so Back and Forward traverse visited lesson sections; the old local `goto()` used `history.replaceState()` and collapsed those visits. Programmatic cross-section search still replaces the current hash to avoid adding a history entry for every result. The pilot's back-to-top button now calls `window.scrollTo()` from the shared runtime; the prior inline handler resolved `scrollTo` against the button element in Chromium and did not move the page. The router also leaves the generated `#lesson-content` skip anchor alone instead of classifying it as an invalid lesson route.

Browser regression checks used a temporary static server and the existing bundled Playwright/Chromium runtime; no test dependency was added to the repository. Checks passed for no-hash load, all three direct hashes, refresh on every valid hash, invalid-hash normalization, every sidebar and top-navigation route, previous/next links, Back/Forward, keyboard activation and heading focus, desktop and 390-pixel mobile layouts, drawer link/overlay/Escape closure and focus return, cross-section search, highlighter, dark-mode persistence, back-to-top, and zero application console errors. A legacy compatibility sweep loaded and navigated all other eight lessons plus the nervous-system quiz without application errors. Shared search navigated a newer legacy lesson, and the two older local-search implementations navigated renal and male-reproductive sections through their retained wrapped `goto()` functions.

Deterministic screenshots compared all three pilot sections at 1440×1000 and 390×844 against the pre-migration baseline with image pixels hidden while retaining their layout boxes; all six comparisons had zero changed pixels. WebP rasterization itself varied between repeated headless captures, so image URLs/order and the authored `<main>` content were also compared directly. Image sources and inline styles are unchanged, and the educational `<main>` is byte-identical after removing only obsolete inline `goto()` attributes.

Service-worker checks passed for a fresh v16 installation and an open-page v15-to-v16 upgrade. The exact `assets/js/lesson.js?v=20260907-router1` request is precached, the v16 worker claims the existing page, the migrated markup loads after controlled reload, and the lesson works offline with section navigation. Install-time precache requests use `cache: 'reload'` so the new cache cannot be populated from a stale browser HTTP-cache copy during an upgrade. This is the only worker-strategy adjustment in the pilot. The previously documented Google Fonts error when going offline immediately after a first install and before a controlled reload remains unchanged; tested controlled offline use is not worse than the v15 baseline.

At pilot completion, the router was ready for individually baselined simple lessons but not the three legacy implementations. The authorized simple-lesson rollout below supersedes the pilot-only state.

### Completed: simple-lesson router rollout (2026-09-08)

The validated `assets/js/lesson.js` runtime now owns generic routing for all seven simple lessons. This rollout added the existing script before `chapter-redesign.js`, removed local route arrays/functions/listeners and generic back-to-top handlers, and changed authored navigation to semantic hashes in:

| Lesson | Authored default | Routes | Compatibility finding |
| --- | --- | ---: | --- |
| `tesutul_muscular.html` | `tesutul-muscular` | 3 | Previously completed pilot; no `home` route |
| `oasele_si_articulatiile.html` | `introducere` | 3 | No `home` route |
| `tesutul_nervos.html` | `organizare` | 3 | No `home` route |
| `sistemul_nervos.html` | `sistem-nervos-central` | 3 | No `home` route; final link still leads to the separate quiz page |
| `sistemul_reproducator_feminin.html` | `home` | 4 | Top navigation intentionally omits `intro`; sidebar contains every route |
| `introducere_anatomie_fiziologie.html` | `home` | 6 | Top navigation intentionally omits `introducere`; sidebar contains every route |
| `celula_si_fiziologia_celulara.html` | `home` | 9 | Top navigation is a four-route subset; seven chapter-map `div` controls became semantic hash anchors |

No shared-router code changed during this rollout: all route/default and partial-topbar differences were already supported by DOM discovery and link-by-link active-state synchronization. The cell chapter's map cards were the only non-anchor route controls in scope; converting them to `<a class="map-card" href="#route">` preserved their layout and gives them native link semantics. Educational text, section IDs, styles, image markup/order, public filenames, and hashes are unchanged. Native section clicks retain the pilot's intentional history behavior: Back and Forward traverse section visits, while programmatic search navigation replaces the current hash.

Each newly migrated lesson was baselined, edited, and tested before work began on the next. Per-lesson checks covered no-hash defaults, every valid direct hash and refresh, invalid hashes, sidebar and available topbar links, previous/next links, Back/Forward, keyboard heading focus, modified clicks, cross-section search, highlighter, dark-mode persistence, back-to-top, 390-pixel drawer operation, overlay and Escape closure, focus trapping/return, route-event closure, and application console errors. A final matrix reran the same suite on all seven migrated lessons; every check passed with zero application console errors.

Visual comparisons covered the default and a non-default section at 1440×1000 and 390×844 for every newly migrated lesson. Image pixels were hidden while retaining their layout boxes to avoid nondeterministic headless WebP rasterization. All 24 new comparisons had zero changed pixels; the six muscular-pilot comparisons remain zero as previously recorded. Direct source checks also confirmed identical educational text, inline styles, image attributes/order, and section IDs for all six newly migrated documents.

The compatibility matrix kept `sistemul_renal_complet.html`, `sistemul_reproducator_masculin.html`, and `grile_sistemul_nervos.html` unchanged. Renal and male direct hashes, legacy `?goto`, all sidebar routes, local cross-section search, mobile drawer, and the wrapped legacy `goto()` path passed. The quiz rendered all 50 questions, navigated all five ranges, accepted and verified an answer, persisted its existing storage record, and passed mobile drawer checks. No application console errors occurred.

`sw.js` remains at v16 and was not modified for this rollout because `lesson.js` and every lesson document were already in its inventory. A fresh v16 install cached the exact versioned router asset, a worker-controlled reload loaded it, and offline direct-hash navigation passed on all seven migrated lessons. The previously documented first-install Google Fonts limitation is unchanged.

The remaining legacy pages still require dedicated migrations. Renal and male need explicit adapters or a shared-router extension for dynamic `SUB_NAVS`, subsection anchors, `?goto`, local search, and lesson-specific controls. The quiz needs a separate router integration around generated range content and its `bb.quiz.sistem-nervos.v1` state contract. Do not add `lesson.js` to any of those three pages as incidental cleanup.

### Completed: final architecture cleanup (2026-09-08)

The deployed application remains a static, root-HTML GitHub Pages site. This cleanup changed source ownership and generated infrastructure without changing public HTML filenames, lesson hashes, educational text, quiz data/scoring/storage, or the established user interface.

**JavaScript ownership.** `assets/js/lesson.js` remains the sole router for the seven migrated simple lessons. The renal, male reproductive, and quiz routers still require their legacy semantics, so `chapter-redesign.js` continues to skip routing on migrated pages and wrap `goto()` only on those three consumers. Their unchanged inline code was moved to `assets/js/chapters/renal-system.js`, `assets/js/chapters/male-reproductive-system.js`, and `assets/js/legacy/quiz-navigation.js`. Homepage behavior moved unchanged to `assets/js/home.js`. Quiz data remains in `grile-sistemul-nervos-data.js` and generic rendering/state behavior remains in `quiz-player.js`; question IDs, answers, scoring, and `bb.quiz.sistem-nervos.v1` were not changed.

`assets/js/chapters-data.js` now also owns site dates, per-lesson themes, and chapter resources. Every public document loads it before its consumers. `chapter-redesign.js` reads the record theme instead of maintaining a second chapter-number theme map. Homepage publication state, titles/icons, category counts, links for newly published planned chapters, and search availability are synchronized from the same registry.

**CSS ownership.** All HTML style blocks were extracted. Homepage styles are in `assets/css/home.css`; chapter-only rules are in `assets/css/chapters/`; the three chapter 10/11/quiz documents share `assets/css/themes/nervous-system.css`. Forty-five byte-equivalent shell, sidebar, card, table, and base component rules shared by introduction, cell, bones, muscle, and female reproduction were consolidated into `assets/css/lesson-components.css`, removing about 19 KB of repeated CSS across those five files. The two large legacy stylesheets were extracted intact but remain separate because blindly combining their intertwined widget and responsive rules would risk the renal flowchart and male lesson. Existing `tokens.css`, `lesson.css`, and `chapter-redesign.css` stay as compatibility layers pending a future visual-system redesign, which was outside this behavior-preserving task.

**Images.** All 69 chapter image files now live under `assets/images/chapters/<lowercase-kebab-case-chapter>/` with lowercase kebab-case filenames. Every HTML reference and offline entry follows the new paths. No image was deleted. The five byte-duplicate, previously unreferenced male files are retained under `male-reproductive-system/legacy-duplicates/`; four currently unreferenced female source images are retained beside that chapter's used figures.

**Generated publishing infrastructure.** `scripts/generate-site-assets.mjs` reads the classic-script registry through `scripts/site-registry.mjs`, generates the 11-URL `sitemap.xml`, crawls the public entry documents and their local references, and emits `assets/js/precache-manifest.js`. Its cache name is a content hash, so production-asset changes invalidate the cache without a hand-maintained version number. `sw.js` imports that manifest and retains its install, HTML network-first, local asset cache-first, and Google Fonts network-first behavior. Activation now deletes only obsolete `biologie-atlas-` caches instead of every cache on the origin. `npm run generate:check` fails if either generated file is stale.

**Validation and regression coverage.** `scripts/validate-site.mjs` checks all registry URLs/resources, duplicate IDs, local links/assets, route-style fragments, absence of inline style/script blocks, the single `CHAPTERS` declaration, JavaScript syntax, and generated-file freshness. `scripts/smoke-test.mjs` serves the site at `/bio-barrons-umf/` and exercises the homepage catalog/search/diacritics/dark mode; every direct lesson hash and invalid fallback; simple-router Back/Forward and modified links; cross-section search; dark-mode storage; desktop and mobile drawer controls; highlighter; back-to-top; all 50 quiz cards and saved state; fresh worker control; v16 cache upgrade; and offline navigation to every public page. CI runs the same checks in Chromium.

Visual comparison covered the default section of all 11 pages at 1440×900 and 390×844 against commit `a262c0f`. Nineteen comparisons were pixel-identical. The three remaining phone captures differed only in 15 homepage-header pixels and 90 pixels in each nervous-system header (at most 0.0273% of a viewport), confined to SVG/text antialiasing in the topbar; geometry, content, and computed layout were unchanged. No layout difference was found.

**Remaining technical debt.** The legacy renal/male routing and copied local search implementations still need dedicated compatibility migrations before `patchGoto()` can be removed. The quiz retains its replace-history range router for saved-state compatibility. The three older shared CSS layers still overlap, and the two legacy chapter stylesheets still share many historical rules; further deletion requires component-by-component visual testing. Homepage card/tag markup is still authored HTML for the fixed 23-chapter plan, although its metadata and publication state now come from the registry. Google Fonts still depend on the existing network-first runtime cache and retain the documented first-install-offline limitation.
