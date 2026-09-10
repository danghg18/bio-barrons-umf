# Redesign pilot — homepage and nervous system

Historical pilot notes. The full-site rollout supersedes this scope; see
[BioMed shared interface](biomed-redesign.md) for current assets and behavior.

The pilot is scoped to `index.html` (`pilot-home`) and `sistemul_nervos.html`
(`pilot-lesson`). Other lessons and the quiz/catalog page retain their existing
presentation. The visual direction is a light study app, compact controls,
restrained chapter accents, and the existing Figtree font.

## UI ownership

- `assets/css/redesign-pilot.css` is the final, scoped presentation layer on these
  two pages. Existing stylesheet order is otherwise unchanged.
- `assets/js/redesign-pilot.js` initializes the account preview, homepage sample
  question, subsection buttons, and reading-size control after the shared code.
- `chapter-redesign.js` still owns search, highlighter, settings, mobile drawer,
  and focus handling. Its pilot-only desktop toggle hides the sidebar without
  patching routing. `lesson.js` remains the route owner.
- The catalog retains its registry synchronization and public `#lab-bento`
  destination. Lesson links, search parameters, and saved study/quiz keys remain.

## Design previews and future integration

The homepage account icon opens the guest view. Use `index.html?design=member`
for the alternative account-menu composition; this query is only a design
variant and never represents an authenticated session. Future account actions
are disabled and the panel says the personal area is in preparation. The
existing local “continue studying” link remains usable inside this panel.

No accounts, payments, remote storage, or synchronization are implemented.
Account services can later replace the panel content without changing the
lesson navigation. The original brand is temporary until a separate name is
selected.

The homepage sample uses question `sn-058` directly from the nervous-system quiz
dataset. Exact-set scoring is transient and never writes to quiz progress.
The image links to the complete lesson. Its text and answers are not a new copy
of the educational dataset.

Reading size uses the isolated `bb.reading.size.v1` local preference with
`small`, `normal`, and `large` values. The default is normal. Storage failure
does not block reading. Highlighter storage and behavior remain shared.

## Validation

Run `npm run generate` after asset changes. The generated precache name hashes
asset contents, so the pilot gets a new offline cache without changing worker
fetch strategies. Run `npm test` and `git diff --check`.

`BB_PILOT_OUTPUT=tmp/redesign-pilot npm run test:pilot` saves visual evidence.
The focused test covers desktop sidebar collapse, route changes, subsection
focus, text settings, account dismissal, sample-question scoring, and mobile
geometry. Browser regression suites still cover legacy lessons and offline use.

The pre-existing nervous-system content baseline differed only by the already
removed “Exersează cu grilele 51–100” navigation link. Reconstructing that link
reproduced the old hash exactly. Only that expected hash was updated; authored
lesson prose, figures, captions, and tables are unchanged.

This is a local pilot for visual acceptance, not a deployment or a rollout to
all pages.
