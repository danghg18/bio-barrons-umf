# Modern Academic Editorial prototype

Status: implemented for visual review on two pages. Independent review disposition: **ship at prototype review scope**. The expanded tests passed; the reviewer confirmed the search-flow and final mechanical fixes resolved. This is not user visual approval or a full-site rollout.

- Branch: `codex/academic-editorial-prototype`.
- Implementation commit: `7d24cf7` — Build academic editorial prototype for home and introduction.
- Prototype pages: `index.html` and `introducere_anatomie_fiziologie.html` only.
- Screenshot directory: `/tmp/bb-academic-prototype/final` (42 final browser captures, all opened for visual inspection).

## Files changed

Production and tests: `index.html`, `introducere_anatomie_fiziologie.html`, `assets/css/home.css`, `assets/css/academic-lesson.css`, `assets/js/home.js`, `assets/js/academic-prototype.js`, generated `assets/js/precache-manifest.js`, and `scripts/ui-test.mjs`.

Documentation: `DESIGN.md`, `.impeccable/design.json`, and this report. `sitemap.xml` was regenerated and remained unchanged. Nine other public HTML documents plus seven shared contract files were checked byte-for-byte against `f775c96` and remain identical. No push or deployment was performed.

## What changed

The homepage was recomposed around a 12-column editorial hero: seven columns of real text and five columns of anatomical imagery. The existing `assets/images/chapters/introduction/niveluri-organizare-barrons.png.webp` figure is presented at meaningful size with a caption, and moves below the copy on phones. Curriculum groups are ruled indexes with a descriptive column, numbered chapter rows and consistent “Disponibil”/“În curând” labels. Availability is not student completion. The secondary feature and information sections use open layout and rules.

The homepage header is a 68px publication-style bar with the brand, quiet navigation and compact search, reducing to 56px on phones. The introduction header has a new brand/context/utility hierarchy: chapter and current section context sit beside search, highlighter and all-chapters access. At the 1024px drawer breakpoint, the composition becomes menu, shortened context and search; the existing highlighter controls move into the drawer.

The introduction sidebar is an integrated 272px column with an independent scroll area and fine vertical divider. Its header uses a chapter label, large number and title. Section numbers have their own narrow column; the active row uses dark semibold text and a 2px blue rule. The article uses a white reading lane, a compact masthead, open ordinary sections, restrained notes, unframed figures and readable tables. Previous/next links follow the content visually. Return-to-top remains in document flow.

`assets/css/home.css` is a complete homepage presentation replacement. The introduction replaces four prior presentation sheets with `assets/css/academic-lesson.css` after the unchanged shared token stylesheet. `assets/js/academic-prototype.js` is an introduction-only adapter: it synchronizes breadcrumb text from the shared router event and relocates the same highlighter button/palette nodes at the breakpoint. It owns no routing, search or preference logic. Six authored `span.academic-map-description` wrappers preserve inline sentence flow around search marks in chapter-map rows without changing educational text.

## Color, emoji and type

The implemented dominant blue is `#2457F5`, with hover `#1946D4`; the prototype uses canvas `#F4F6FA`, white articles, ink `#101828`, body `#475467`, muted text `#667085`, borders `#E4E7EC`/`#D0D5DD`, and subtle surface `#F5F6F8`. Chapter colors remain registry metadata and are not large tile backgrounds. The brief's approximate neutral/blue/semantic ratio is directional, not a measured screen percentage.

Prominent chapter emoji, availability checkmarks, rings and colorful result tags have been removed or hidden from prototype presentation. `home.js` no longer renders result emoji and colored tags. Registry metadata is preserved. Functional search/menu symbols and annotation swatches remain.

Figtree remains the interface and reading face; the blue homepage word “rescrisă.” uses Fraunces Italic. Actual homepage hero weight is 800 and size is `clamp(48px,5.6vw,80px)`. The introduction title is quieter at `clamp(30px,3.2vw,44px)` and declared weight 650. Its desktop reading text is 17px/1.75 with paragraphs capped at 70ch; at 640px it becomes 16px/1.75. The prototype does not introduce Fraunces into lesson prose.

A final mechanical pass added explicit white CTA/skip-link hover text and changed footer subsection headings from h5 to h3 with the same styles.

## Responsive and behavior boundary

Homepage stacking occurs at 700px, with 20px gutters and the full-width image beneath the copy. The introduction drawer begins at 1024px, with width `min(320px,86vw)` and the same shared overlay, Escape, focus, inert-state and return-focus behavior. At 640px educational grids stack and prepared tables retain their labelled mobile representation. Tables that are not prepared for stacking keep their scroll wrapper. Reduced motion disables presentation transitions. Print suppresses navigation and exposes lesson sections.

The implementation preserves public filenames, routes and section anchors; the shared router continues to own hash/history behavior. Search parameters, Romanian normalization, highlighter preferences, native same-document links and existing PWA strategy remain shared. Highlight passages are not persisted. Quiz data, IDs, scoring and saved state are unchanged. Educational prose, captions, figures and table relationships are protected and are not rewritten by this prototype.

## Verification and evidence

- The full original `npm test` suite passed, including public documents under `/bio-barrons-umf/`, both legacy lesson implementations and worker-controlled offline behavior.
- Added regression coverage exercises adapter breakpoint moves, history/context, selected color and actual highlighting; chapter-map search marks are checked at 390px and 1440px, including clearing the search. Final expanded `npm test` passed; log: `/tmp/bb-academic-prototype/final-test.log`.
- A real previous-worker upgrade check passed. Ten exact search/hash offline URLs worked after upgrade, and an unrelated origin cache was preserved.
- All 42 final browser screenshots were opened for visual inspection. The first 28 cover requested homepage sizes, lesson defaults/content, tablet/phone, drawer, figures, tables, navigation, search and highlighter controls. Supplemental evidence covers full homepage desktop/phone, definitions desktop/phone, actual callouts desktop/phone, mobile highlighter/search/global search, print, cleared-search desktop/phone, and two hover-state captures.
- Supplemental inspection found an inline search-mark sentence split in chapter-map grid rows. Six description wrappers fix the flow; the exact authored text is retained. Reviewer re-review disposition: ship; inline-flow fix resolved and representative callouts accepted. The final mechanical review scored the hover contrast and footer heading fixes resolved.

Screenshots are actual browser output, not mockups. Source or test assertions alone do not establish educational accuracy. The user must review the visual direction before the remaining lessons are migrated.

The [local prototype](http://127.0.0.1:4173/bio-barrons-umf/) and [screenshot gallery](http://127.0.0.1:4173/review/review.html) are served for this review session. The gallery source is `/tmp/bb-academic-prototype/review.html`; the capture inventory is `/tmp/bb-academic-prototype/final/captures.json`. The print image verifies browser print styling, not physical printer pagination.

## Later rollout and remaining debt

A later approved rollout would affect the eight remaining lesson HTML documents, the quiz page if included explicitly, their linked presentation sheets under `assets/css/chapters/`, `lesson.css`, `lesson-components.css`, `chapter-redesign.css`, nervous-system theme styles and quiz CSS. The shared controller and the two legacy lesson modules must be evaluated individually if their presentation adapters change. Any shared replacement should give each feature one owner and retain the renal/male routing and quiz storage contracts. The canonical chapter registry, generated sitemap/precache inventory and intentional worker cache version must be considered when production asset references change; generated output must come from `npm run generate`.

The shared token file still mixes primitives and semantic base rules. The introduction intentionally overrides these; extracting them is separate infrastructure work. Other lessons retain the incumbent design and compatibility layers. The prototype adapter is intentionally local until the direction is approved. Google Fonts remains a network dependency, with system/Georgia fallbacks; first-load offline font availability is not guaranteed. The declared 650 lesson title weight is matched against the currently requested discrete font weights. No all-site visual migration is claimed.
