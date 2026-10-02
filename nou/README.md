# BioMed × Softly edition

Public entry: `https://danghg18.github.io/bio-barrons-umf/nou/`. The landing page opens the Softly study catalog at `lectii.html`. The classic edition remains available at its existing root URLs. Both editions are static and work under the GitHub Pages project subdirectory.

## Generated study pages

`scripts/generate-softly.mjs` generates 41 study HTML files from the canonical registry and root documents: the catalog, 17 lessons, 17 quizzes, notes, statistics, testing, simulation, glossary and account. Root `index.html` becomes `nou/lectii.html`; `nou/index.html` remains the separately authored landing page. Other public filenames, IDs and lesson fragments are preserved.

The generator adjusts relative assets, catalog links and edition navigation, removes remote font links, and loads the scoped study presentation last. Educational text, figures, quiz data and behavior remain canonical. Generated study HTML must not be edited directly: change the authorized canonical source or the generator, then regenerate.

```sh
npm run generate
npm run generate:check
```

Generation first builds the shared SDK and classic assets, then the Softly pages, manifest, worker and precache. Generated study pages retain canonical metadata and use `noindex,follow`.

## Maintenance and ownership

- `study.css`: the final presentation layer scoped to `body.softly-study`, including local Outfit, quiet grain, page-family surfaces, responsive controls, reduced motion and print.
- `study.js`: edition links, the selected navigation pill, dialog presentation, purposeful GSAP entrances and registration of `nou/sw.js`. Routing, search, highlights, answer checking, notes and personal records stay in the shared controllers.
- `index.html`, `homepage.css`, `homepage.js`: the landing composition, responsive story and unsaved interactive demonstration.
- `home-shell.js`: the landing mobile menu and entry points to `BBAccountUI`. `home-data.js` and `quiz-core.js` bridge canonical question `sn-058` and score the demo without recording an answer or attempt.
- `transitions.css`: reused transitions.dev patterns for selection, FAQ and dialog presentation; native controller ownership of keyboard and focus behavior remains intact.
- `cont.html`: the generated Softly account page. A plain visit stays in the edition. `auth-redirect.js` forwards a query or fragment unchanged to `../cont.html` for canonical callback handling; production confirmation and recovery continue to use the root account page.

Both editions share the existing owner-scoped storage and account/sync APIs. Switching edition keeps the same genuine progress and records; it does not create another account, storage namespace or fabricated attempts. Pricing (49 lei/month, 490 lei/year) and diary examples remain explicitly demonstrative, with no purchase flow.

## Offline scope

The edition owns `nou/manifest.json`, `nou/sw.js` and `nou/precache-manifest.js`. Its manifest scope is `./` and its start URL is `./lectii.html`. The worker registers from study pages and controls `/bio-barrons-umf/nou/`; its public precache includes the landing, generated study pages, local presentation assets and shared static assets.

Softly uses the content-derived `biomed-softly-` cache namespace and reads only its current cache. It preserves the established HTML/network and asset/cache strategies, exact-query behavior and supported shell fallbacks. Activation deletes only obsolete Softly caches. The classic worker/cache remains separate, and classic HTML is excluded from Softly's precache. Authentication and private API data must not enter either public cache.

## Assets and visual guidance

`DESIGN.md` documents the shared Softly visual world and its calmer study expression. Existing BioMed logos, textbook figures and local fonts are reused unchanged; the study extension adds no raster artwork. Outfit and Reenie Beanie licenses are in `assets/Outfit-OFL.txt` and `assets/ReenieBeanie-OFL.txt`. The grain is the existing SVG. Older public assets remain for compatibility even when the current landing does not display them.

Visual evidence belongs in local output, outside publication. The extension's captures are stored in the main checkout's `output/softly-platform-20261002/`; they are not generated site inputs.

## Verification

```sh
npm run test:softly
npm test
```

`test:softly` runs the landing separation and browser checks, generation checks, then the study-platform browser check. It is also included in `npm test`.

- Generation checks compare all authored body text, IDs, figures and alt text, check local references, and ensure canonical pages do not receive the Softly layer.
- The platform browser check visits all 41 study pages at 1440, 775, 390 and 320px through the Pages subpath. It checks local fonts, overflow, assets and in-edition navigation, plus representative shared/legacy routes, bookmarked search, omitted-answer feedback, shared quiz progress, mock account/notes persistence, simulation, reduced motion and print.
- Offline checks install both workers, exercise both editions and prove that Softly does not read a stale shared asset from the classic cache.
- Landing checks cover the unsaved demo, account flows, responsive pinning, reverse scroll, keyboard/menu/FAQ behavior, reduced motion, printing before scroll and bookmarks. Account checks inject `tests/supabase-mock.js`; live service validation is separate.

Automated coverage is a verification specification, not a claim that every current run passed. Review rendered desktop, compact and phone views for readable figures/tables, focus, form boundaries and preserved answer/highlight semantics before release; record the actual run and finish-review verdict separately.
