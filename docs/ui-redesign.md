# Editorial UI redesign — 9 September 2026

The homepage, nine published lessons and nervous-system quiz now share a light-only editorial identity. The application remains static HTML, CSS and vanilla JavaScript at `/bio-barrons-umf/`.

## Direction and baseline

The supplied reference establishes the contrast between very heavy navy Figtree and blue italic Fraunces. The homepage keeps one real-text h1, “Biologia pentru admitere, rescrisă.”, followed by admission context, publication count and “Începe cu Capitolul 1”. Removing its promotional preview makes the next section visible sooner. The original anatomical image and lesson caption remain in their lesson.

Before editing, `npm test` passed on `main` at `c81871f`. Baseline screenshots included the working-tree search-panel adjustment, which is retained in the redesign. Local tool directories, PRODUCT.md, editor settings, `.DS_Store`, and other unrelated files were not staged or deleted. The former untracked DESIGN.md was backed up outside the repository before its explicitly requested design-system replacement.

Baseline issues included the excessive homepage hero height, mixed Figtree/Noto Sans reading typography, theme controls and restoration code, ambiguous publication counts/checkmarks, boxed chapter mastheads, narrow legacy map titles, mobile table overrides cancelled by the final shared layer, and conflicting global/legacy colors. Review additionally identified a quiz search label crowding the mobile topbar, floating back-to-top controls over reading text, side-by-side mobile previous/next links, and low-contrast search marks within blue links.

## System and ownership

| Owner | Responsibility |
| --- | --- |
| `assets/css/tokens.css` | Figtree body/display and Fraunces editorial stacks; semantic canvas, surfaces, text, borders, actions, states; spacing, radii, focus, selection and caret |
| `assets/css/home.css` | Entire homepage, curriculum rows, global search, responsive hero and footer; former `home-redesign.css` consolidated here |
| `assets/css/chapter-redesign.css` | Shared chapter shell, topbar, sidebar/drawer, reading surfaces, maps, figures, tables, search/highlighter and responsive/print presentation |
| `assets/css/lesson-components.css` | Existing common authored lesson vocabulary; retained below the canonical presentation layer |
| `assets/css/lesson.css` | Residual legacy callout/accordion/keyword/list vocabulary; obsolete hero, card, figure and topbar uplift removed |
| `assets/css/chapters/` | Genuine chapter widgets plus remaining legacy presentation adapters; obsolete dark rules and duplicate standard table rules removed |
| `assets/css/quiz.css` | Question, selection, verification, retry/reset and existing quiz-progress presentation |
| `assets/js/light-mode.js` | Synchronous light-only initialization and safe retirement of the old theme key |
| `assets/js/chapter-redesign.js` | Existing search/drawer/highlighter integration; shared table presentation classification and back-to-top placement |

No new final override stylesheet was added. The two existing homepage layers are one file. Chapter compatibility rules still use specificity and some `!important` declarations because legacy widgets and authored inline presentation remain; this was not a full architecture migration.

### Typography, color and spacing

Figtree is the sole primary sans-serif for body, headings, tables, captions, navigation, controls and quiz content. Fraunces Italic appears selectively in the homepage emphasis. Google Fonts requests include normal and italic Figtree plus italic Fraunces; Noto Sans is no longer requested or used. Both actual font faces were loaded in Chromium and a specimen of `ă â î ș ț Ă Â Î Ș Ț` was captured and visually checked.

The semantic palette uses canvas `#F4F6FA`, surface white, subtle surface `#F8FAFC`, ink `#0F172A`, body `#334155`, muted text `#64748B`, border `#DCE3EC`, strong border `#C8D2DF`, action blue `#2563EB`, hover blue `#1D4ED8` and soft blue `#EFF6FF`. Chapter accents identify routes, badges and small markers; global actions remain blue. Cards are flat, ordinary mastheads are unboxed, and informational chapter-map rows avoid nested colored panels. Shadows remain for genuine overlays.

The spacing scale is 4, 8, 12, 16, 20, 24, 32, 40 and 48px. The shared lesson shell is at most 1344px, sidebar normally 264px (244px at the intermediate desktop breakpoint), and prose is capped at 70ch. Common chapter radii are 8/12/14px; touch controls are at least 44px where they are primary actions. Fine-pointer highlighter swatches remain 36px and grow for coarse pointers.

### Availability, navigation and content

All 23 planned chapters remain discoverable: nine available and fourteen forthcoming. Publication labels read “Disponibil” or “În curând”; category totals state “N din M lecții disponibile”. Counts derive from the canonical records represented in each group, avoiding dependency on presentation category spelling. Publication rings and checkmarks are removed. Existing quiz progress is retained; it is not lesson-completion tracking.

The sidebar has a quiet background and a narrow chapter accent on the active route. The mobile drawer remains at 1024px and below, with independent scrolling and safe-area bottom padding. Previous/next links form one column on phones. Back-to-top moves into document flow at the end of the lesson on small screens so it cannot cover reading material; its desktop behavior remains available.

Routes were not migrated or rewritten. Seven lessons continue to use `lesson.js`; renal, male-reproductive and quiz pages retain their legacy routers. Stable HTML filenames, section IDs, subsection anchors, hashes, legacy `goto`, and search parameters remain intact.

### Tables and figures

The shared initializer classifies a table as stackable only when every body cell has an authored `data-label` and no body cell spans rows/columns. Fourteen of eighteen tables use this mode; four legacy tables keep their column relationships and horizontal scrolling. Unwrapped tables receive a `.table-wrap` container. Wide-table containers are keyboard-focusable regions with accessible names.

At 640px and below, labelled tables remove minimum widths, expose the authored cell labels, and retain table/row/cell roles. At 641px and above, they display as ordinary semantic tables. Complex tables scroll inside their own container rather than widening the document. The old unconditional minimum width and duplicate chapter mobile-table rules were removed.

Figures preserve source URLs, image content and captions. Images fit their available width without cropping; shared white framing, restrained borders and readable captions replace heavy shadows. The table/content regression fixture protects authored relationships rather than merely checking file existence.

### Light-only initialization

All public pages load `light-mode.js` synchronously in the head. It sets `color-scheme: light`, removes any body `dark` class at initialization, and attempts to remove only `localStorage.darkMode` inside a catch-protected block. Lessons author their shared body class so first paint uses the intended canvas without waiting for controller startup.

Removed: homepage button/feature/footer entry, legacy lesson buttons and settings rows, shared generated theme controls, restore/toggle/save functions, wrapper code, old mode-specific CSS, and tests expecting a theme toggle. Manifest and HTML theme-color metadata now use the light canvas. Highlighter keys and quiz state are untouched; highlighted passages remain temporary and are not persisted.

## Verification performed

`npm run generate`, `npm test`, and the Impeccable detector were run. The detector returned no findings. The test command now includes the existing validation/smoke suite and `test:ui`.

| Coverage | Evidence |
| --- | --- |
| Public documents | Homepage, all nine lessons and quiz |
| Routes | All 46 authored section/range IDs; every direct route reload and invalid fallback in smoke tests; all sections at every responsive test size |
| Viewports | 1440×900, 1280×800, 1024×768, 390×844, 430×932, 640×900, 641×900, 768×1024, 1023×768, 1025×768 |
| Content | SHA-256 fingerprints of every section's normalized text and table text plus exact image URL/order; all match the pre-redesign browser baseline |
| Typography | Both actual font faces loaded on every page; Romanian glyph specimen visually inspected |
| Layout | No page-level horizontal overflow across the route/viewport matrix; all 18 tables checked; local images loaded |
| Navigation and controls | Simple-router Back/Forward and modified clicks, search results, drawer open/Escape/overlay/focus return/reverse Tab/resize cleanup, highlighter mode and color selection, desktop back-to-top |
| Quiz | All 50 exact answer sets score correctly, first-answer verification, retry, saved verified answers after reload, reset cancellation and confirmed reset |
| Theme retirement | Old values `1`, `0`, missing key and a throwing localStorage getter on every public page; identical intended light canvas, no old controls |
| Reflow | 640×400 CSS viewport as the layout equivalent of a 1280×800 window at 200% zoom; no horizontal overflow |
| PWA | Fresh installation/control, synthetic v16 upgrade, actual pre-redesign controlled session upgrade, stale dark preference, scoped cache cleanup, offline public documents, ten previously visited exact query/hash URLs |

Desktop/mobile screenshots of every default, curriculum, search, drawer, palette, tables and quiz states were opened in the visual review. The other viewport sizes were exercised by browser automation; do not describe them as individually reviewed screenshots. The 200% check is CSS-viewport reflow, not an OS/browser zoom-menu measurement. No claim is made for Safari, Firefox, physical-phone input, screen-reader output, or medical/scientific accuracy.

The independent visual reviewer checked all 59 main evidence images and requested corrections for masthead metadata placement, map widths, mobile occlusion/navigation, search contrast and capture validity. Drawer screenshots now wait for actual visible geometry and settled rendering. Palette evidence scrolls the settings into view. Two uniquely named nervous-lesson palette proofs closed the remaining repeated-image display ambiguity; the final independent disposition is “ship”, with all seven findings closed.

## PWA rollout and rollback

Production CSS/JS references use `v=20260909-editorial1`, including shared metadata/controller scripts. This is necessary: with unversioned references, a pre-redesign worker could serve old theme JavaScript to new HTML during upgrade. The actual old-worker test reproduced that mismatch; versioned requests eliminated it.

The generator computes the new precache name from content. `sw.js` fetch strategies and origin-cache scoping are unchanged. The old-worker upgrade was tested with dark mode enabled, an unrelated cache present, and subsequent offline query/hash navigation. The unrelated cache remained intact and the old theme preference was retired.

Offline query URLs are verified after an online visit to those exact URLs. The existing worker's fallback for an unseen query URL and first-install external-font caching limitation are not redesigned here. Google Fonts still require initial network acquisition before reliable cached availability.

No deployment or push was performed. Rollback should publish the previous complete HTML/CSS/JS set with a regenerated/new precache digest and intentional asset URLs, then exercise a controlled client update. Reverting a source file alone does not invalidate an already active worker.

## Evidence and remaining debt

Temporary evidence lives outside the repository at `/tmp/bb-ui-redesign/`: `before/`, `final/`, `final-tests.log`, `worker-upgrade.json`, and `design-findings.json`. Set `BB_UI_OUTPUT` to reproduce the screenshot set elsewhere. No browser profiles, downloaded fonts or temporary screenshots are committed.

Remaining architectural debt is explicit: legacy routing/search in renal and male lessons, the quiz's legacy range router, historical CSS declarations beneath the shared chapter owner, and repeated authored homepage markup. Those compatibility layers are retained to protect educational widgets and stable navigation; they are not invitations to migrate the architecture in a design patch.

Educational prose, tables, figures/captions, quiz dataset, answers and explanations were preserved. This work did not review their scientific accuracy. No `bb.study.v1`, lesson completion, last-visited state, saved passages, bookmarks, notes, recall, accounts, sync, gamification or other roadmap study-state feature was added.
