# BioMed × Softly: the study platform

The user approved extending the shipped `/nou/` identity across the complete study platform while keeping the classic site available at its existing URLs. This is an extension of the approved visual direction, not a new design proposal.

## Direction contract

THESIS: One calm place to study, with the warmth of the Softly homepage and the full precision of BioMed's learning tools.

OWN-WORLD: Cream canvas, sage and lavender functional surfaces, restrained coral actions, green BioMed identity, local Outfit; Reenie Beanie only for short accents. Softly's large radii and grain are user-pinned exceptions to generic design rules. Reading text has stable contrast and an uncluttered paper surface.

STORY: Enter from the homepage, choose a lesson, read and annotate, practise, review mistakes and revisit notes. Every destination remains in the Softly edition until the user selects the classic edition.

FIRST VIEWPORT: A compact pill navigation leads into the real task. The catalog retains its introduction and anatomical preview, then all chapters. Lessons use a sage contents column beside a cream reading sheet; quizzes retain the number map and clear answer states. Statistics, notebooks, glossary, account and simulations share the same controls and surfaces.

FORM: Extend the established homepage world and existing functional page layouts, code-led. No concept seed: the user explicitly chose the shipped combination. Operate for tools and Read for lessons. Signature motion is continuity between selected navigation, opening tools and revealed results, with gentle catalog entrances; studying and writing stay still.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implementation plan

1. Generate the Softly edition from canonical static documents, with unchanged section content, IDs, filenames and search parameters. `/nou/lectii.html` is the lesson catalog; `/nou/index.html` remains the landing page. Reuse shared runtime and data, prefix asset references, and retain the canonical account callback. Build-time generation prevents divergent educational copies.
2. Add scoped `nou/study.css` for every page family and shared `nou/study.js` for purposeful motion and edition navigation. Preserve existing routing, search, highlights, quiz state, analytics, notes, account and sync ownership. No fabricated records or new backend.
3. Give the edition its own scoped worker/cache using the existing fetch policy and shared assets. Keep classic cache ownership separate. Update generation checks and coverage for every generated page plus functional representative flows.
4. Inspect desktop, compact and mobile views; test search/highlighter, legacy pages, quiz feedback, notebooks, accounts with the mock, reduced motion, print, navigation and offline. Run the complete suite; report pre-existing failures separately. Review, document and publish both editions.

## Work boundaries and review

The styling implementer owns only `nou/study.css`. The controller owns generation, navigation/motion integration and tests. CSS consumes the `softly-study` body class plus existing page classes; the generator adds that class and loads the stylesheet last. Existing canonical data and authored educational content are immutable. Shared JS changes are limited to making asset resolution independent of document nesting. Root visual files remain unchanged.

Task review checks stylesheet scope, readability, feedback semantics, responsive and reduced-motion states. Final review covers the complete diff and visual evidence before publication.
