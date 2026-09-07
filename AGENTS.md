# Project guidance for Codex agents

## Project and constraints

`bio-barrons-umf` is a Romanian biology study website for students preparing for UMF Cluj admission. It currently consists of a homepage, nine standalone lesson HTML files, one quiz page, shared CSS/JavaScript, anatomical images, and a service worker/PWA.

Keep the application static and compatible with GitHub Pages at `/bio-barrons-umf/`. Do not introduce a backend, database, server-only routing, React/Next.js, or an Astro migration without an explicit task requesting that architectural change. Build-time tooling may eventually generate static files; deployed pages must work without a running build server.

Educational prose, tables, captions, figures, quiz answer keys/explanations, and teaching strings embedded in JavaScript are protected content. Do not casually rewrite, summarize, remove, or “correct” them during infrastructure work. Preserve Romanian diacritics and semantic relationships. Content changes require a specific content task and separate review from infrastructure extraction.

Preserve existing public `.html` filenames, section IDs/fragments, subsection anchors, `q`/`section`/`hit` search parameters, and legacy `goto` query support where present. Keep relative asset links compatible with the Pages project subdirectory. Do not rename or delete images as incidental cleanup; duplicate bytes do not prove a public path is unused.

Read [the architecture audit](docs/architecture-audit.md) before architecture work. Its numbered sections record the original audit and proposed phased target; the migration-progress section records completed changes. Proposed files are not an instruction to perform the whole migration. Only chapter-data extraction has been completed so far.

## Current architecture conventions

- `assets/js/chapters-data.js` is the canonical chapter metadata source. It exposes the global lexical binding `CHAPTERS` to classic scripts (not a `window` property). Load it once before the consuming homepage script, without `async`, `defer`, or module conversion. Preserve the existing field names and record order; `done` means published availability. Consumers must not mutate the dataset or declare another copy. Homepage cards, lesson metadata/themes, sitemap, and worker page lists still need manual synchronization until later phases migrate them.
- Lessons store authored content inside `.page-section` elements with `page-<route>` IDs; `.active` selects the visible section. Not every lesson has a `home` route.
- The actual CSS order is `tokens.css`, `lesson.css`, local styles, then `chapter-redesign.css`; quiz CSS comes last. Preserve this order during mechanical extraction even where old comments disagree.
- `assets/js/chapter-redesign.js` is currently a compatibility controller: it wraps local `goto`, `closeNav`, dark-mode/highlighter toggles, and legacy search openers. Do not remove a local function without accounting for its wrappers and inline callers.
- Renal and male reproductive pages have older routing/search/settings implementations and dynamic subsection navigation. Compare them individually with newer lessons.
- Quiz data lives in `assets/js/grile-sistemul-nervos-data.js`; interaction lives in `assets/js/quiz-player.js`. Keep question content separate from rendering. Preserve question IDs and the `bb.quiz.sistem-nervos.v1` storage contract unless a migration is explicitly implemented.
- Preferences currently use `darkMode`, `highlighterMode`, and `highlighterColor`. Highlight passages are not persisted. Do not imply otherwise.
- `sw.js` is public infrastructure, not disposable generated clutter. Runtime asset changes need an intentional cache-version/precache update. Do not delete unrelated origin caches or assume query URLs share the same cache entry.
- `sitemap.xml` is currently a static hand-maintained file; no generator is checked in. Do not claim generation exists until it is implemented.

## Shared functionality and intended direction

Common infrastructure must not be copied into each lesson. Routing, drawer state, search normalization, theme/preferences, highlighter behavior, accessibility controls, and offline registration belong in shared JavaScript under `assets/js/`. Shared tokens, themes, shell, cards, tables, and responsive behavior belong under `assets/css/`.

Avoid expanding the global-wrapper pattern in `chapter-redesign.js`. Migrate one feature at a time toward an explicit shared initializer and APIs/events. A migrated feature must have one owner; a temporary legacy adapter is acceptable when documented and tested. Keep genuine chapter-specific interactions in dedicated lesson modules, such as a future renal flowchart module, rather than adding them to every lesson's shared controller.

The recommended future architecture is static HTML output assembled from shared templates, a canonical chapter/resource registry, per-lesson configuration, preserved content fragments, and small vanilla JavaScript modules. Generate repeated shell metadata, sitemap, search index, and precache inventory when the build step is introduced. Retain existing output URLs and current appearance. Do not combine this migration with a redesign.

## Adding chapters

Until a generator exists, edit the canonical catalog in `assets/js/chapters-data.js` and inspect all current integration points for necessary targeted updates: lesson file, homepage cards/counts/links, theme metadata, sitemap, and worker inventory. Validate agreement; do not treat unpublished chapters as working URLs. Reuse the shared infrastructure and record temporary compatibility needs rather than copying an entire legacy lesson's styles and scripts.

Once the target authoring system exists, add one chapter registry record, its route/default/subsection configuration, preserved educational HTML, and image metadata; use shared templates to generate the page, navigation, index, sitemap, and offline inventory. Add only genuinely lesson-specific CSS/JS. Link quizzes as chapter resources, not additional chapters. Exact stable section IDs belong in configuration/content with validation, not several independently maintained arrays.

## Working and verification

- Keep changes small and reviewable. Capture current behavior before extraction and distinguish deliberate bug fixes from refactor regressions.
- Inspect `git status` first; local tooling/design documents may already be untracked. Do not overwrite, stage, or remove unrelated work.
- Test every affected implementation family, including both legacy lessons; similar files are not necessarily identical.
- For navigation changes, verify defaults, valid/invalid/empty hashes, bookmark reload, subsection links, search parameters, modified clicks, Back/Forward, focus, drawer Escape/overlay/Tab behavior, and mobile resize.
- For text features, test search and highlighter together, Romanian diacritics, literal percent signs, match ordering, clear/retry, collapsed content, and touch.
- For styling changes, compare desktop/phone, light/dark, reduced motion, tables, figures, and print. Preserve computed appearance before deleting override rules.
- For quiz changes, verify exact answer-set scoring, all data IDs, retry/reset/reload, and saved-state version behavior. Do not silently discard student progress.
- For releases, test fresh and previously installed workers, offline section/search URLs, asset version agreement, and project-subdirectory hosting. Keep rollback deployable; a source revert alone may not reverse active cache behavior.
- State what was actually verified. Source parsing and file-existence checks do not establish browser behavior or educational accuracy.
