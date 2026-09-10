# BioMed — shared interface

The homepage pilot now covers all 14 public documents: the homepage, the testing
catalog, ten lessons, and two quiz players. BioMed is the temporary name for this
local design; publishing and final brand clearance remain outside this work.

## Presentation and ownership

`assets/css/site-redesign.css` is the final presentation layer. Body classes
separate browse surfaces (`bm-browse`, plus `bm-home` or `bm-catalog`) from readers
(`bm-reader`, plus `bm-lesson` or `bm-quiz`). Chapter accents come from the existing
registry-driven theme variables. Figtree and light-only rendering remain.

`assets/js/site-redesign.js` adds presentation interactions after shared controls
initialize: the homepage account preview and sample question, reading-size
controls, and subsection navigation. Existing pilot component IDs are retained
for compatibility. `chapter-redesign.js` continues to own the drawer, search,
highlighter and settings. `lesson.js` and the existing legacy controllers retain
routing ownership. Quiz data, scoring and storage are unchanged.

The main topbar navigation uses `.bm-primary-nav`, separate from legacy section
navigation selectors. DOM order follows the visual order: menu (readers), brand,
Lecții/Testare, tools. On desktop the main navigation is centered; phones show the
symbol without the wordmark. Opening reader search replaces the mobile topbar
contents visually, while preserving the existing close/focus behavior.

Renal and male reproductive chapter CSS now scopes formerly bare `nav` selectors
to `nav:where(#sidenav)`, retaining their specificity while preventing styles from
turning the new topbar navigation into an offscreen drawer. Their existing
`#sub-nav` is repositioned beneath the active route link. It is not regenerated
by the shared presentation initializer. Other lessons derive subsection buttons
from authored headings without changing prose or public anchors.

The sidebar opens on a fresh desktop visit, can be collapsed to expand reading,
and retains its collapsed state during same-document section navigation. It is
a focus-managed drawer on smaller screens. Search and settings are mutually
exclusive. The reading size preference still uses `bb.reading.size.v1`; all
pre-existing quiz and study storage keys are retained.

## Identity and prototype boundaries

The symbol and outlined wordmark are in `assets/logo-mark.svg` and
`assets/logo-horizontal.svg`. The 192px, 512px and Apple touch icons are raster
exports of the same SVG symbol, with a light background and maskable padding.
Page titles and install metadata use BioMed; educational references to Barron's
remain intact. Public filenames and the GitHub Pages project path do not change.

Only the homepage exposes the account icon. `index.html?design=member` previews
the alternative personal-menu composition; it does not authenticate a user.
Future account actions remain disabled. The existing local continue-studying
link remains usable. No remote synchronization, payments or accounts are added.

The homepage quiz sample reads question `sn-058` from the existing dataset and
never writes quiz progress. The testing catalog reads actual resource availability
from the canonical registry; both quiz players retain answer letters and the
established green/amber/red distinction for selected correct, omitted correct,
and extra answers.

## Verification

Run `npm run generate`, `npm test`, and `git diff --check` after production changes.
The generated cache name fingerprints current assets; no new service-worker fetch
strategy is introduced.

`BB_REDESIGN_OUTPUT=tmp/biomed-review npm run test:redesign` captures all public
pages on desktop and phone, plus drawer, focus, search and settings states. The
suite also checks primary-link hit targets, logo/navigation intersections, DOM
focus order, local reading preferences, legacy subsection placement, and all
pages at 320px with touch. `test:pilot` remains an alias for this expanded suite.
The existing smoke, search/highlighter and UI suites retain routing, scoring,
protected-content, table, storage and offline regression coverage.
