# Barron's Biologie – UMF Cluj

Static Romanian biology lessons for UMF Cluj admission preparation. The deployed application is plain HTML, CSS, and JavaScript and remains compatible with GitHub Pages under `/bio-barrons-umf/`.

## Local checks

Requires Node.js 22 or newer.

```bash
npm ci
npx playwright install chromium
npm test
```

`npm run generate` refreshes `sitemap.xml` and the service-worker precache manifest. `npm run validate` checks the registry, links, fragments, local assets, JavaScript syntax, and generated files. `npm run test:smoke` exercises the homepage, every lesson, the quiz, mobile controls, preferences, navigation, and offline loading in Chromium.

## How to add or publish a chapter

1. Add or update one record in `assets/js/chapters-data.js`. This is the only chapter metadata registry. Set its stable chapter number, title, category, search keywords, publication state, public `.html` URL, `updated` date, and lesson theme. Attach related quizzes through the record's `resources` list.
2. Create the lesson at the exact public URL in that record. Keep educational content in `.page-section` elements named `page-<route>`, mark the authored default section with `.active`, and use ordinary `href="#route"` navigation links.
3. Load `assets/js/chapters-data.js`, then `assets/js/lesson.js`, then `assets/js/chapter-redesign.js`. Put reusable behavior and presentation in shared assets; add a chapter-specific CSS or JavaScript file only for a real chapter-specific need.
4. Put figures in `assets/images/chapters/<lowercase-kebab-chapter>/` with lowercase kebab-case names and update their lesson references.
5. Run `npm run generate`, then `npm test`. The registry drives homepage publication/search state and themes; the generator updates the sitemap and service-worker inventory, so those files do not need hand editing.

Keep existing `.html` URLs and section hashes stable. Treat lesson prose, figures, tables, quiz questions, answer keys, and explanations as reviewed educational content rather than infrastructure text.

## Interface and regression evidence

The interface is intentionally light-only. Figtree owns reading and controls; Fraunces Italic supplies the homepage accent. See [the UI redesign record](docs/ui-redesign.md) for component ownership, compatibility boundaries, verified behavior, and rollback guidance.

`npm test` includes `npm run test:ui`: every lesson route at ten viewport sizes, protected-content fingerprints, both fonts, legacy theme preferences, storage failure, tables, and keyboard controls. Set `BB_UI_OUTPUT=/absolute/output/path` to save screenshots and its JSON report outside the repository. `tests/educational-content.json` protects the pre-redesign section text, table content, and image order; do not regenerate it for incidental infrastructure changes.
