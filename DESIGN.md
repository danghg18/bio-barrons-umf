---
name: "Barron's Biologie – UMF Cluj"
description: "Modern Academic Editorial prototype on the homepage and introduction; remaining lessons retain the incumbent system."
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
  academic-blue: "#2457F5"
  academic-blue-hover: "#1946D4"
  academic-soft-blue: "#EEF3FF"
  academic-selection: "#DCE5FF"
  academic-ink: "#101828"
  academic-body: "#475467"
  academic-muted: "#667085"
  academic-line: "#E4E7EC"
  academic-line-strong: "#D0D5DD"
  academic-note-edge: "#98A2B3"
  academic-sunken: "#F5F6F8"
typography:
  academic-display:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "clamp(48px, 5.6vw, 80px)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  academic-editorial:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1em"
    fontWeight: 400
    lineHeight: 1.1
  academic-lesson-title:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "clamp(30px, 3.2vw, 44px)"
    fontWeight: 650
    lineHeight: 1.16
    letterSpacing: "-0.035em"
  academic-home-body:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: 1.6
  academic-lesson-body:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "17px"
    lineHeight: 1.75
  incumbent-body:
    fontFamily: "Figtree, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.72
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
  academic-control: "4px"
  academic-swatch: "3px"
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
  academic-primary-action:
    backgroundColor: "{colors.academic-blue}"
    textColor: "{colors.bg-surface}"
    rounded: "{rounded.academic-control}"
    padding: "10px 18px"
  academic-primary-action-hover:
    backgroundColor: "{colors.academic-blue-hover}"
  academic-search-dialog:
    backgroundColor: "{colors.bg-surface}"
    rounded: "{rounded.academic-control}"
    width: "min(680px, 100%)"
  academic-sidebar-route:
    textColor: "{colors.academic-body}"
    rounded: "{rounded.flat}"
    padding: "12px 0 12px 12px"
  academic-sidebar-route-active:
    textColor: "{colors.academic-ink}"
  academic-note:
    backgroundColor: "{colors.academic-sunken}"
    textColor: "{colors.academic-body}"
    padding: "20px 24px"
---

# Design System: Barron's Biologie – UMF Cluj

## Overview

**Creative North Star: "Modern Academic Editorial" — prototype direction, awaiting visual approval.**

University-press authority, clear medical reference typography and quiet product utilities define the proposed direction. Structure comes from proportion, numbered contents, fine rules and meaningful anatomical imagery. Figtree carries interface and reading text; a selective Fraunces italic provides editorial emphasis. This supports the clarity and supportive, mature character described in PRODUCT.md.

**Scope is binding.** Only `index.html` and `introducere_anatomie_fiziologie.html` implement this replacement. Review disposition is **ship at prototype review scope**, not visual approval, publication approval or authorization to migrate the remaining lessons. See `docs/academic-editorial-prototype.md` for the surface brief, evidence and rollout boundary.

The homepage's complete presentation belongs to `assets/css/home.css`. The introduction loads `assets/css/academic-lesson.css` after `tokens.css`, replacing its four former presentation stylesheets. Other lessons and the quiz retain their current stylesheet order and incumbent presentation. Shared `tokens.css` remains unchanged and includes semantic element styling as well as primitives; the prototype intentionally overrides relevant base rules. Do not treat this coexistence as permission for automatic drift repair.

**Key Characteristics:**

- Predominantly neutral canvas and white article surfaces, navy ink and blue actions.
- Numbered, ruled contents instead of decorative chapter tiles.
- Quiet reading hierarchy and useful anatomical figures.
- Existing navigation, search and annotation behavior with a new presentation.

## Colors

### Primary

The `academic-*` palette applies only to the two prototype pages. `academic-blue` owns the dominant interaction accent, selective hero italic and narrow active-route rule. `academic-blue-hover` deepens primary actions; `academic-soft-blue` signals quiet hover/search states. The brief's approximately 85% neutral, 10% blue and 5% chapter/semantic balance is a direction, not a measured pixel ratio.

### Neutral

`bg-page` and `bg-surface` remain shared canvas and white primitives. Prototype text uses `academic-ink`, `academic-body` and `academic-muted`; separators use `academic-line` and `academic-line-strong`. Sidebar and notes use `academic-sunken`; `academic-note-edge` is a restrained callout edge.

### Incumbent context

Unprefixed primary, slate, border and semantic accent tokens in frontmatter preserve the unchanged `tokens.css` values for other pages. They are not the new prototype palette. Emerald, teal, violet, rose, orange and amber remain available to existing educational and quiz components. Registry chapter colors and emoji remain compatibility data; prototype curriculum and search results do not expose a rainbow of colored tags.

Functional highlighter colors retain separate background/ink/edge values in the introduction stylesheet. They are annotation choices, not brand accents. Search selection uses `academic-selection` with dark ink and a blue current-match outline.

## Typography

The prototype uses Figtree for interface, prose, tables and headings. Fraunces is italic only, used on the homepage word “rescrisă.”; its style is recorded in prose because the frontmatter schema has no fontStyle field. Actual hero weight is 800, rather than the brief's suggested Black weight. The lesson title declares weight 650; the Google Fonts request supplies discrete weights including 600 and 700, so rendering follows browser font matching.

Homepage hero copy is 17px/1.65 with a 49ch maximum. Homepage section headings are 40px/1.15, weight 700. At 1024px the hero becomes 54px; at 700px it becomes `clamp(38px, 10.3vw, 52px)` and the section headings become 32px. Introduction titles become 36px at 1200px, then 30px/1.2 at 640px. Lesson body becomes 16px/1.75 at 640px; card paragraphs retain a 70ch maximum and hero introductions 66ch.

Incumbent lessons retain their existing Figtree roles and shared presentation. The `incumbent-body` role records the shared lesson reading convention, not a global override for the prototype. Fonts are still requested through Google Fonts; fallback is system sans-serif or Georgia. First-load offline availability of external fonts is not guaranteed.

## Layout

The prototype homepage uses a 1280px maximum container, 28px desktop gutters and a 12-column hero with a 7/5 copy/image split and 24px gap. Hero padding is 64px above and 68px below. Curriculum categories use a 260px descriptive column, 54px gap and numbered rows with 40px / flexible / 100px columns. At 1024px category columns become 220px with 28px gap. At 700px the hero, categories and feature band stack; gutters become 20px, the image follows the copy at full width up to 430px, and row status sits beneath the title. Homepage header height is 68px, then 56px at 700px.

The introduction shell has a 1600px outer maximum, a 272px sidebar and a flexible white article lane. The sidebar is sticky below the 68px header and scrolls independently. Main padding is `44px clamp(32px, 5vw, 80px) 48px`; sections are at most 1000px, figures 840px. At 1200px main padding becomes 36px. At 1024px the header becomes 56px, sidebar becomes a `min(320px, 86vw)` drawer, main padding becomes 36px 40px and sections cap at 860px. At 640px main padding becomes 28px 20px 36px, learning grids stack and prepared tables become labelled rows. Other tables retain horizontal scrolling within their wrapper.

The topbar moves from brand/context/utilities to menu/context/search. The same highlighter nodes move into the drawer below 1024px. Previous/next stays in a two-sided row, allows text wrapping and is ordered after section content. Return-to-top is in document flow. Common controls have 44px targets; compact lesson-search arrows are 36px wide, then 32px on phones, while retaining 44px height.

Remaining lessons retain the incumbent 1344px shell maximum, 264px sidebar (244px at the intermediate breakpoint), 58px mobile topbar and their existing per-family responsive rules. Those dimensions are not prototype recommendations.

## Elevation & Depth

**The Flat Reading Rule.** Prototype reading sections use whitespace, rules and neutral tones; figures have no shadow or ornamental frame. The homepage search palette and lesson utilities have borders and no decorative shadow. Scrims communicate modal depth. The introduction drawer uses a 200ms ease-out transform, removed under reduced motion. Both prototype stylesheets disable motion under reduced-motion preferences.

Shared shadow primitives remain unchanged: the ordinary xs/sm/md/lg/hover shadows are `none`; `shadow-float` remains `0 3px 12px rgba(37,99,235,.30)` for incumbent consumers. Existing lesson drawer/toast shadows are legacy presentation and are not propagated into this prototype.

## Shapes

Prototype article sections and curriculum rows have square, ruled edges. Primary homepage actions and search dialog use `academic-control`; keyboard hints and highlighter swatches use `academic-swatch`. The retained unprefixed radius/spacing scales describe existing shared widgets and lessons, not a requirement to apply large rounded surfaces to the new direction.

## Components

### Buttons and search

The homepage has one filled blue action and an underlined secondary action. Header navigation and lesson utilities are compact text or functional monochrome symbols. Global search uses a 680px maximum dialog, strong input and quiet result hierarchy. Lesson search remains a shared-controller panel. Focus uses a 2px blue outline with 4px offset, with a quieter 1px gray outline on the focused lesson heading.

### Navigation

The introduction sidebar has a small chapter label, large chapter number, title and numbered section rows. Active navigation has semibold dark text and a 2px blue start rule. The breadcrumb follows shared router events. Mobile drawer accessibility continues to belong to the shared controller; the presentation adapter does not create a second router or focus manager.

### Curriculum and chapter map

Homepage rows pair chapter numbers and titles with aligned “Disponibil” or “În curând” labels. Availability is not completion. Registry emoji and ring selectors remain compatibility hooks but are hidden. The introduction chapter map becomes ruled title/description rows, stacking on phones.

### Reading, figures and tables

Ordinary information and definition blocks use open content or a fine top rule. Summaries, examples and warning-class notes share a neutral surface and narrow gray edge; authored headings preserve meaning. Figures remain real repository artwork with captions, no cropping or fake anatomical replacements. Tables keep headings, data relationships and opt-in mobile labels. Previous/next links remain ordinary route links.

### Highlighter

Six restrained swatches retain the shared color identifiers and storage behavior. The existing button and palette relocate between desktop utilities and mobile drawer, preserving node identity and handlers. Passage highlights are not persisted. Search and highlighter remain separate functions; presentation does not invent study progress.

## Do's and Don'ts

- Do treat this as a two-page prototype awaiting visual review.
- Do preserve educational prose, figures, captions, Romanian diacritics and URL contracts.
- Do distinguish `academic-*` tokens from incumbent tokens when adding or reviewing a surface.
- Do use meaningful imagery, typographic hierarchy, restrained color and visible focus.
- Don't roll this system into another lesson before approval and an explicit migration task.
- Don't silently rewrite shared tokens or delete legacy CSS as documentation drift repair.
- Don't add decorative gradients, emoji chapter identities, progress rings, fake progress or persistent-highlight claims to the prototype.
- Don't interpret retained semantic colors or old radius tokens as approval for colorful chapter tiles.
