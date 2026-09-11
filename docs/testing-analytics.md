# Testare și statistici

The testing catalog and `statistici.html` share `analytics-ui.js` and `testing-analytics.css`. The interface remains static, light-only, and compatible with the GitHub Pages project path. The generated quiz directory is derived from registered quiz resources and their trusted local data scripts at build time. It contains identifiers, numbering, ranges and storage metadata, not a second authored question bank.

## Results and history

- Current answer progress remains in each quiz's existing localStorage key and version. It is independent of the selected reporting period. Quiz playback remains usable when persistence is denied.
- `BBQuizAnalytics.ready` initializes IndexedDB `bb.quiz.analytics.v1`, with `attempts` and `metadata` stores. All reporting surfaces use `getReport({chapterNum, days})`; periods are 7, 30 or `all`, using local calendar days inclusive of today.
- Only a valid verification records an attempt. The player grades exact answer sets using the unchanged answer key. A distinct ID deduplicates the verification transaction. Web Locks serialize same-quiz verification across tabs where available; per-question updates merge the latest saved responses. Separate attempt-ID metadata does not change the legacy answer schema.
- A first attempt is the first committed recorded verification of that question, not its first verification within the selected period. First-attempt accuracy counts only first events within the period. First-event IDs disambiguate equal timestamps.
- Questions already verified when history initializes have an unknown first attempt. They contribute to current progress, but no prior event, date or result is invented. Subsequent attempts contribute to overall accuracy; they do not become a known first attempt.
- Distinct questions and total attempts use the selected chapter and period. Overall accuracy is correct attempts divided by all attempts. Global values sum observations, not chapter percentages. Empty denominators display a dash; dates without events have zero activity and no accuracy value.
- Retry and “Reia capitolul” clear answers for practice, preserving history. Scoped history deletion confirms the selected chapter or all chapters and includes events outside the selected date range; it preserves saved answers. Failure to delete durable history is an error, never reported as successful deletion.
- BroadcastChannel (with a storage-event fallback) refreshes open analytics views. Storage failure is visible and uses session memory where possible. This is local browser data; there is no account or cross-device sync.

## Navigation and presentation

Quiz sections retain their existing `page-grile-X-Y` IDs and public range hashes. The five-column map links to the original question number (`#grila-N`), activates its containing range and moves to the question. Native links preserve modified-click behavior and browser history. Programmatic `goto()` leaves focus management to the shared compatibility/search controller, so typing and result navigation keep working.

`statistici.html?capitol=11&perioada=7` opens a filtered report. Missing or invalid filters use all chapters and 30 days. Filters create history entries, and changing a filter resets the 20-row history pagination. Catalog first-attempt metrics cover all recorded history, alongside current answer progress; its activity preview covers the last 30 days. Long daily histories scroll horizontally at a readable chart height; accessible data tables accompany every SVG.

## Verification and publishing

Run `npm run generate` after production edits, then `npm test` and `git diff --check`. The three analytics suites cover real IndexedDB, failed durable deletion, local-date boundaries, unknown first attempts, weighted totals, cross-tab writes, duplicate clicks, navigation/search focus, history pagination and responsive overflow. UI tests compare all seven question datasets against pre-change hashes and every rendered prompt/option/explanation against those protected datasets. The older lesson-content fixture is unchanged.

The generated precache digest intentionally changes with the production files. Existing worker upgrade and offline tests include the new public page and assets. The worker has a scoped canonical-shell fallback for analytics filter URLs not yet visited online; other pages keep their existing exact-query caching behavior. Reverting a release must also regenerate the precache digest; deleting student history is not part of rollback.
