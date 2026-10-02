# Separate BioMed homepage

Public URL: `https://danghg18.github.io/bio-barrons-umf/nou/`.
The original homepage, lessons, quizzes and accounts retain their existing URLs. This page is static and works under the GitHub Pages project subdirectory.

## Maintenance

- `index.html`, `homepage.css`, `homepage.js`: presentation, responsive story and unsaved interactive demonstration.
- `home-shell.js`: mobile menu and entry points to `BBAccountUI`. The shared account/auth/storage/sync scripts remain the sole owners of account behavior.
- `transitions.css`: selected transitions.dev snippets; FAQ duration is 500 ms. The native account dialog uses the same motion tokens and retains the shared controller's keyboard/focus behavior.
- `home-data.js`, `quiz-core.js`: canonical data bridge and pure demo scoring.
- `assets/`: locally hosted fonts, licenses and texture. Previous public assets are retained for compatibility but are no longer displayed by the homepage.
- `cont.html`, `auth-redirect.js`: local preview callback alias. Production confirmation and password recovery continue to use the root `cont.html`.

The independent homepage does not register its own worker and is not added to the classic site's precache. Its CSS/JS references are versioned. `npm run generate` continues to generate the classic assets; it does not change them for this isolated page.

## Verification

```sh
node scripts/homepage-separation-test.mjs
node scripts/homepage-softly-test.mjs
npm test
```

The dedicated browser check runs through the Pages subpath and injects `tests/supabase-mock.js`. It exercises login/logout, signup confirmation, password recovery, errors, offline state, switching accounts, demo isolation, responsive pinning, reverse scroll, keyboard navigation, menu, FAQ, reduced motion, printing before scrolling and direct bookmark navigation. It never uses the live Supabase service.

Desktop and phone visual checks cover 1440, 1096, 980, 775, 390 and 320 px. Pricing remains 49 lei/month and 490 lei/year **for presentation only**; no purchase is possible. Each diary card is separately marked as an illustrative example.

The full general suite passed on 2 October 2026. The earlier intermittent `quiz-restart-test.mjs:39` failure did not reproduce in this run; no unrelated quiz changes were made.
