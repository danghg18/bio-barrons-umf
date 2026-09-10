---
name: "Barron's Biologie – UMF Cluj"
description: "A premium editorial Romanian biology textbook, built for focused admission study."
colors:
  primary: "#2563EB"
  primary-light: "#EFF6FF"
  primary-mid: "#3B82F6"
  primary-dark: "#1D4ED8"
  emerald: "#059669"
  emerald-light: "#ECFDF5"
  teal: "#0891B2"
  teal-light: "#ECFEFF"
  violet: "#7C3AED"
  violet-light: "#F5F3FF"
  rose: "#E11D48"
  rose-light: "#FFF1F2"
  orange: "#EA580C"
  orange-light: "#FFF7ED"
  amber: "#D97706"
  amber-light: "#FFFBEB"
  slate-900: "#0F172A"
  slate-800: "#1E293B"
  slate-700: "#334155"
  slate-600: "#475569"
  slate-500: "#64748B"
  slate-400: "#94A3B8"
  slate-300: "#CBD5E1"
  slate-200: "#E2E8F0"
  slate-100: "#F1F5F9"
  slate-50: "#F8FAFC"
  bg-page: "#F4F6FA"
  bg-surface: "#FFFFFF"
  border: "#DCE3EC"
  border-strong: "#C8D2DF"
typography:
  display:
    fontFamily: "Figtree, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(3.6rem, 7.2vw, 6rem)"
    fontWeight: 900
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  editorial:
    fontFamily: "Fraunces, Georgia, serif"
    fontWeight: 400
  headline:
    fontFamily: "Figtree, system-ui, -apple-system, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 900
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  content-heading:
    fontFamily: "Figtree, system-ui, -apple-system, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 900
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Figtree, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.72
  label:
    fontFamily: "Figtree, system-ui, -apple-system, sans-serif"
    fontSize: "0.84rem"
    fontWeight: 700
    lineHeight: 1.3
rounded:
  xs: ".5rem"
  sm: ".65rem"
  md: ".9rem"
  lg: "1rem"
  xl: "1.2rem"
  2xl: "1.5rem"
  pill: "2rem"
  full: "9999px"
  chapter-sm: "8px"
  chapter-md: "12px"
  chapter-lg: "14px"
  control: "10px"
  term: "7px"
  flat: "0"
spacing:
  "1": ".25rem"
  "2": ".5rem"
  "3": ".75rem"
  "4": "1rem"
  "5": "1.25rem"
  "6": "1.5rem"
  "8": "2rem"
  "10": "2.5rem"
  "12": "3rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg-surface}"
    rounded: "{rounded.control}"
    padding: "11px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.slate-700}"
    rounded: "{rounded.control}"
    padding: "11px 18px"
  search-field:
    textColor: "{colors.slate-900}"
    height: "44px"
  navigation-active:
    backgroundColor: "{colors.bg-surface}"
    textColor: "{colors.slate-900}"
    rounded: "{rounded.flat}"
    typography: "{typography.label}"
    padding: "0.65rem 0.78rem"
  chapter-term:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    rounded: "{rounded.term}"
    padding: "4px 9px"
  reading-card:
    backgroundColor: "{colors.bg-surface}"
    textColor: "{colors.slate-700}"
    rounded: "{rounded.chapter-md}"
  chapter-map-row:
    backgroundColor: "transparent"
    textColor: "{colors.slate-700}"
    rounded: "{rounded.flat}"
    padding: "17px 16px 17px 62px"
---

# Design System: Barron's Biologie – UMF Cluj

## Overview

**Creative North Star: "The Editorial Biology Textbook"**

The interface is a premium editorial Romanian biology textbook: cool paper, navy ink, precise rules and a restrained blue accent. Figtree gives navigation and educational prose one coherent voice; a selective Fraunces italic supplies the homepage’s editorial signature.

Reading hierarchy comes from type, spacing, figures and meaningful grouping. Chapter outlines read as numbered contents lists, and controls remain quiet but clear. The light-only surface supports sustained study without turning publication availability into a claim about a student’s learning progress.

**Key Characteristics:**

- Cool paper and navy ink with restrained blue interaction.
- Figtree for UI and body, selective Fraunces italic for editorial emphasis.
- Flat reading surfaces, fine rules and numbered contents.
- Readable Romanian text, responsive tables and practical touch controls.

This is the implemented visual system. `assets/css/tokens.css` owns core primitives. `assets/css/home.css` owns the consolidated homepage and testing-catalog presentation; `assets/css/chapter-redesign.css` owns the shared lesson shell and final content presentation with legacy adapters. `lesson.css` retains residual widgets, and `quiz.css` supplies quiz-player presentation last. Existing compatibility selectors are not templates for duplicating a new shell.

## Colors

The palette combines cool paper neutrals with a clear medical blue. Frontmatter records source values; CSS semantic aliases remain the implementation authority.

- **Primary:** `primary` marks actions, links, chapter numbers and the selective editorial word; `primary-dark` is the hover partner and `primary-light` a quiet interaction tint.
- **Neutral:** `bg-page` is the light-only canvas, `bg-surface` the white reading surface, `slate-900` the heading ink, `slate-700` body text and `slate-500` secondary information. `border` and `border-strong` divide and frame content. `bg-sunken` resolves to `slate-50` in CSS.
- **Context and status:** the emerald, teal, violet, rose, orange and amber pairs remain available for authored chapter context and semantic states. They are not a mandate to color every chapter block. Quiz correctness and review states retain labels and explanations alongside color.
- **Search and highlighting:** search matches retain dark ink on the highlight; user-selected highlighter swatches use their existing paired background, ink and edge values. These are functional annotations, not additional brand accents.

## Typography

Figtree is the body and UI family. Fraunces is a selective italic editorial voice; its italic style is documented here because the frontmatter typography schema does not include `fontStyle`.

**The Selective Italic Rule.** Use Fraunces italic selectively for the blue homepage word “rescrisă.” Keep lesson prose, navigation, labels and controls in Figtree.

The frontmatter display role describes the desktop homepage heading. On phones it becomes `clamp(2.2rem, 11vw, 3.6rem)` with `1.04` line height and `-0.03em` tracking. Chapter-home headings use the headline role and reduce to `2.25rem` at the drawer breakpoint, then `2rem` at 430px. Lesson cards use the content-heading and body roles; body text has a 70ch reading measure. Homepage introductory copy uses `clamp(1rem, 1.45vw, 1.15rem)` with `1.68` line height, reducing to `0.96rem/1.62` on phones. Avoid forcing one display scale into every surface.

## Layout

The homepage is an editorial masthead followed by a ruled curriculum index and study-tool band. `testare.html` is the second top-level catalog page: it uses a compact introduction followed by the same ruled category-and-row structure, with quiz availability independent from lesson availability. Main catalog sections have a 1280px outer maximum with 28px desktop inset. Categories use a descriptive column beside numbered rows, becoming one column at 900px. Phone hero gutters are 16–20px; surrounding content follows its authored responsive insets.

The lesson shell has a 1344px outer maximum, a 264px sidebar and up to 960px main column. Between 1025px and 1240px the sidebar is 244px. The 70ch measure applies to reading text, not to every figure or table. These effective chapter values take precedence over older generic layout variables in `tokens.css`.

At 1024px and below the navigation becomes a drawer, the topbar is 58px, and the drawer width is `min(320px, 86vw)`. Main content uses 14px side padding. At 700px, multicolumn learning blocks and previous/next actions stack. At 640px, tables explicitly prepared with `bb-table-stacked` and `data-label` become labelled vertical rows; other tables remain horizontally scrollable rather than losing their relationships. Quiz actions become full width at the same phone breakpoint.

Primary controls use at least 44px touch targets; homepage actions are 46px, then 48px on phones. Legacy subordinate navigation links retain their existing smaller sizing. The core spacing rhythm is rem-based in quarter-rem steps; use the documented scale without compressing educational content to fit a decorative composition.

## Elevation & Depth

**The Flat Reading Rule.** Use spacing, fine borders and surface tone to structure reading. Reserve shadows for temporary overlays and feedback.

Core `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg` and `shadow-hover` are `none`. Reading cards, outlines, homepage categories and primary actions remain flat. The mobile lesson drawer retains `16px 0 36px rgba(15, 23, 42, 0.18)` to signal an overlay; lesson toasts retain `0 12px 28px rgba(15, 23, 42, 0.22)`. Do not propagate these overlay shadows to ordinary content. Motion primarily communicates state, with 150–300ms core durations and reduced-motion overrides.

## Shapes

Use fine rules and square edges for curriculum rows and chapter outlines. Chapter surface radii are 8px, 12px and 14px; common action buttons are 10px. Keyword tags use 7px. The broader core radius scale remains available for existing widgets and figures, so its rem values are preserved exactly in frontmatter rather than rounded to approximate pixels. Do not make every object a pill simply because pill tokens exist.

## Components

### Buttons

Blue primary actions use white text, a 10px radius and no shadow; the homepage button has `11px 18px` padding. Hover deepens the blue without lifting the control. Secondary homepage actions are transparent with a fine border, while lesson outline actions use white. Quiz checking retains its navy action treatment. Focus remains visible: the core ring is 2px blue with 2px offset; the shared lesson layer uses its 3px mixed-blue ring and 3px offset.

### Inputs and search

Search controls use a white surface, fine border and legible dark input text. The homepage palette is at most 640px wide with a 12px radius, a dark scrim and no decorative shadow. Its input and close action provide 44px targets. Lesson search retains its shared controller, and mobile panels fit within the viewport. Keep labels, keyboard dismissal and dark search-match ink intact.

### Navigation

The persistent top navigation treats “Lecții” and “Testare” as two separate catalog pages and marks the current page with text, surface and underline rather than color alone; it remains visible on phones. Inside lessons, the desktop sidebar is a quiet chapter index. The active row uses navy text, a white surface and a 2px accent start rule with square edges. The mobile drawer preserves its overlay, Escape and focus behavior. Chapter outlines are neutral numbered rows with separators and subtle hover tone. Previous/next actions stack on small screens; return-to-top is in normal document flow at the drawer breakpoint.

### Testing catalog

The testing catalog mirrors the lesson curriculum order and category groupings. Every chapter in the canonical registry has one numbered row; only chapters with a quiz resource become links, while the remaining rows are disabled and labelled “În curând.” Counts are derived from the canonical resource metadata, and available rows use the chapter accent plus the explicit action “Rezolvă.” The catalog does not duplicate the lesson sidebar or embed itself in the homepage.

### Tags and reading cards

Tags communicate terms or chapter context with a restrained tint, a fine border and compact Figtree labels. Reading cards use white, a fine border and chapter radii with no shadow. Internal hierarchy comes from headings, paragraphs, figures and lists. Preserve authored semantic callouts rather than recoloring all educational distinctions into one undifferentiated surface.

### Figures, tables and quiz feedback

Figures remain on white with their original image and caption relationships. Tables use clear headers, row rules and controlled overflow; labelled stacking is opt-in through the existing table preparation. Quiz options retain native selection controls, explicit result labels and explanations. Existing quiz saved state is a quiz feature; publication counts are availability, and highlights are not persisted passages.

## Do's and Don'ts

### Do:

- Do preserve Romanian diacritics, authored explanations, figures and semantic table relationships.
- Do use the canonical core tokens and the established surface-specific aliases.
- Do keep prose near 70ch where the lesson layout permits and let figures and tables use the wider content area.
- Do maintain visible keyboard focus, accessible search, reduced-motion behavior and readable phone layouts.
- Do describe chapter counts as publication availability; keep existing quiz results distinct from study progress.

### Don't:

- Don’t introduce Noto Sans or a second body font into the current visual system.
- Don’t turn curriculum lists into floating decorative card grids or add ornamental gradients.
- Don’t obscure phone reading with floating controls; the lesson return-to-top action stays in document flow on small screens.
- Don’t use color alone for quiz correctness, selected controls or navigation state.
- Don’t add study-progress tracking, persistence claims or roadmap features through visual documentation.
