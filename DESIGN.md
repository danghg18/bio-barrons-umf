---
name: "BioMed — Barron's Biologie"
description: "A calm, compact Romanian study workspace for UMF Cluj admission."
colors:
  ink: "#23473d"
  muted: "#566b61"
  canvas: "#f5f7f5"
  frame: "#e8ede9"
  surface: "#ffffff"
  soft: "#edf3ee"
  notebook-paper: "#fffef9"
typography:
  ui: "Figtree, system-ui, sans-serif"
  title: "600; clamp(28px, 4vw, 46px); line-height 1.1"
  body: "400; 16px; line-height 1.7"
  notebook-title: "Caveat, cursive; 600"
rounded:
  surface: "24px"
  frame: "30px"
  control: "14px"
  pill: "999px"
spacing:
  control: "44px minimum touch target"
  panel: "20–30px"
  frame: "4–6px"
---

# BioMed visual system

## Direction and ownership

All 30 public pages follow the approved statistics workspace: a very pale sage canvas, white primary surfaces, deep green ink, Figtree and restrained rounded framing. Keep the study task near the top of the page. Moderate spacing and short introductions take precedence over decorative oversized heroes. Educational prose, images, tables, captions and explanations remain complete.

`assets/css/tokens.css` owns the shared `--ui-*` palette, radii, spacing and motion values. `site-redesign.css` owns the shared header, primary frames, buttons, reading shell and responsive navigation. `statistics.css`, `testing-analytics.css`, `home.css`, `notebooks.css`, `glossary.css`, `accounts.css` and `quiz.css` retain page-specific arrangements. Existing chapter CSS preserves authored semantic distinctions and legacy compatibility. Do not copy another shell into a lesson.

## Surfaces, type and motion

Use one white main surface with a 4–6px sage frame, rounded 24–30px corners and 20–30px interior spacing. Inside it, prefer headings, whitespace and fine separators to repeated cards. Shadows are subtle on the detached header and functional overlays. Colorful callouts remain when they convey an educational distinction or answer state.

Figtree serves headings, prose and controls. Page titles are normally 28–46px, weight 600; lesson titles stay around 27–38px. Compact labels use 12–14px with sufficient contrast. Keep lesson prose near 70ch where possible; figures and tables can use more width. Caveat belongs only to the handwritten notebook title. No new body fonts or decorative text treatments are needed.

Primary actions are compact dark-green pills; search and frequent tools are directly available through labelled icon controls. Keep visible focus, native keyboard behavior and at least 44px frequent touch targets. State changes use short opacity/transform transitions with `--ui-ease`; reduced-motion preference disables animation. Do not add perpetual motion or animate reading content.

## Header and reading layout

The white header is detached from viewport edges and centers the visible “Lecții” and “Testare” navigation. It remains sticky in lessons, quizzes and notebooks. Narrow pages use two compact rows for identity/tools and navigation; the approved statistics header keeps its compact single-row arrangement. Search, notes and account access remain reachable at 320px.

Desktop lessons use a maximum 1328px shell with a compact 240px contents column and a single reading surface. Contents and the quiz number map start visible; retain the existing hide control and preference behavior. At 1024px and below, contents use the existing accessible drawer with Escape, focus containment and focus return. Sticky tools and anchor offsets consume the shared header offset. Tables retain their responsive scrolling or authored labelled stacking. Print excludes tools and framing while keeping educational content.

## Page arrangements

- **Homepage:** retain “Biologie, pe înțelesul tău.” and the original introduction on the left, with the working lesson image and quiz preview visible on the right. Stack these on tablet/phone. Follow with “Continuă studiul” when progress exists and the complete compact chapter catalog in its established order. The main hero action jumps directly to chapters. Glossary, notebooks and the platform description have discreet access.
- **Testare:** retain “Ce ai învățat, pus în practică.” and the original introduction on the left. The right panel shows lifetime distinct-question progress and real recent activity, linking to statistics. Keep this panel compact and stack it below the introduction on phones. Rows show chapter, question count, current traversal progress and the main action; initial/corrected scores stay together in statistics. The available/all filter preserves registry order and saved progress.
- **Lessons:** the chosen section stays open, with all its authored text and media. Remove decorative inner frames without collapsing the subject matter. Search, highlighter, section URLs and legacy navigation keep their existing behavior.
- **Quizzes:** retain ten questions per range and the visible desktop number map. One main summary describes the current traversal. Common instructions and the feedback legend live in compact accessible help; checked answers and explanations remain visible. “Reîncearcă tot” is secondary and retains confirmation. Initial score is immutable; later mistake-only correction rounds belong to the same traversal.
- **Glossary:** short title, search, filters and complete definitions. Progressive reveal and source references remain intact.
- **Account:** `cont.html` shows the existing controller's form inline. Other pages keep the account dialog. Secondary data tools use a disclosure; failures and synchronization messages stay visible. Failed persistence exposes export immediately.
- **Statistics:** keep the approved Rezumat, Greșeli and Istoric arrangement, paired “Inițial”/“După corectare” scores and five history traversals per page. Detailed activity remains secondary. Do not rebuild this reference page as a different visual design.

### Personal notebooks — scoped exception

**The Notebook Boundary Rule.** The notebook material applies only to the page opened from the homepage’s “Notițe” link. The library uses compact rows with a cover thumbnail, chapter title and note state. Keep all chapters and the shared site navigation. Opening a chapter reveals one continuous cream sheet with 32px outer desktop margins and 12px phone margins. The contents list is a disclosure above the sheet, closed by default on every viewport; it never consumes a permanent side column.

Use the common canvas `#f5f7f5`, paper `#fffef9`, ink `#303c34` and the restrained green writing accent `#345742`. Thin horizontal rules repeat at 32px inside each editor; a pale vertical margin belongs to the sheet. Paper-edge depth is local to notebooks. Preserve the existing muted chapter cover colors; sticky-note colors describe personal content rather than additional interface accents.

**The Written Title Rule.** The chapter title sits inside the top of the paper, in locally bundled Caveat 600 (`clamp(38px, 4.5vw, 68px)`, 1.08 leading; 40px on phones). The included font and OFL license come from Google Fonts. Figtree remains the body/control family; note text is 16px with 32px ruled leading. The library uses the shared Figtree labels. Do not apply the handwriting face to the controls or the lesson prose.

Every authored main lesson section appears in order, including empty sections. Each fixed heading labels a directly editable, borderless area with at least four writing lines. Section height grows with its content. Remove edit/finish/add-note modes. A single compact toolbar sticks below the site header and follows the focused section without moving its caret. Show the save status and counter for the active section only; keep global offline or storage failures visible. Section links and `#nota-…` bookmarks remain available.

The notebook stays still while writing: no perpetual animations, automatic selection scrolling, card hover motion inside the sheet, or floating canvas layers. Preserve visible keyboard focus and reduced motion. Print removes tools, links, status, paper depth and ruling while retaining the title, headings, text and attached objects.

### Shared personal-note editor

**The Note Materials Rule.** The lesson panel and notebook share the editor, sanitization and storage. Keep compact accessible icon controls for text color, highlighting, images and sticky notes. The highlighter remains active for subsequent text selections until cleared.

Adding a sticky opens four unlabeled visual swatches (yellow, sage, rose, blue) with accessible names. Choosing a swatch inserts the sticky at the cursor, closes the palette and focuses its text. Reopen its palette through the small color button; never leave the swatches permanently on the paper.

Images retain their proportions, editable captions and saved placement. Their controls provide removal and a 44px corner resize target; images have no drag handle or movement menu, and swiping over an image scrolls the page. Sticky notes retain their 44px drag handle, color and removal controls, visible on hover, focus, selection and touch. Sticky dragging previews a semantic position between paragraphs and a left/right/block alignment. Floats reserve space for surrounding text; each editor contains its own floats. Never persist absolute coordinates. Missing alignment on older notes means a separate row. Phone layouts and the narrow lesson panel display blocks while retaining the desktop alignment in storage.

The move handle also opens keyboard-operable controls for alignment, moving earlier/later and transferring to another subtitle in the same notebook. Color/move menus dismiss on Escape. Transfers validate the target note and preserve the original image reference. The destination must be accepted before the source object is removed; failed transfers leave the source intact. UI controls and drag previews never enter serialized note content.

## Verification and constraints

Preserve public URLs, anchors, search parameters, owner-scoped data, authentication and offline behavior. This remains a static GitHub Pages site. Publication is a separate action from local implementation.

Check every public page at desktop, tablet, 390px and 320px; inspect representative screenshots and both legacy lesson families. Verify keyboard focus, drawer/search behavior, no horizontal overflow, all 17 notebooks, complete educational fingerprints and the 70% initial → 100% after three correction rounds scenario. Generate offline assets and run the complete existing regression suite alongside the new compact-surface checks.
