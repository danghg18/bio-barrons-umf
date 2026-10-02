---
name: BioMed × Softly
description: Warm, calm surfaces for precise biology study.
colors:
  green: "#295343"
  sage: "#E8EFE8"
  lavender: "#EFEDF4"
  coral: "#FFB7B2"
  paper: "#FDFCF8"
  reading-paper: "#FFFEFB"
  ink: "#292524"
  muted: "#6C645E"
  line: "#E6E1D9"
rounded:
  control: "16px"
  study-panel: "32px"
  study-frame: "38px"
  pill: "999px"
---

# Design System: BioMed × Softly

## Overview

This is the approved visual world for `/nou/`: the Softly landing page and the complete study edition. Its cream canvas, pastel surfaces, green BioMed identity, generous curves and restrained motion extend the established homepage. The classic edition keeps its existing appearance and URLs. The surface direction is recorded in `../docs/softly-platform.md`.

The landing page introduces the product; study pages prioritize reading, choosing an answer, writing and reviewing progress. Warmth comes from material and color. Authored content, figures, semantic feedback and familiar study layouts retain their meaning.

## Colors

Green identifies BioMed, active navigation and progress. Sage structures contents and supporting surfaces; lavender frames previews, tools and dialogs. Coral marks primary study actions. Cream and reading paper provide steady backgrounds, with stone ink and darker muted text for contrast.

**The Feedback Rule.** Quiz correctness keeps the shared green, yellow and red semantics: selected correct, omitted correct and extra answers remain distinguishable. User-selected highlighter colors and educational callouts keep their existing owners.

## Typography

Local Outfit (400/500/600, with `system-ui, sans-serif` fallback) carries navigation, controls, headings and study text. Headings generally use medium weight with slightly tightened spacing (−.025em). Lesson paragraphs and lists use an open line height (1.75); answer options use 16px text with a 1.65 line height. Preserve the canonical hierarchy instead of forcing every page family into one type scale.

Reenie Beanie remains a brief handwritten accent on the landing page. Notebook paper retains its existing Caveat heading and writing geometry. Font licenses are kept with the local assets; see `README.md`.

## Layout

The landing and study pages share the static Efferd header-2 adaptation. It starts at a maximum 1280px width and contracts to 1120px after scrolling, with a cream surface, 24px corners and an 8px top offset. Below 1000px a 64px single row opens a native modal menu for the complete study navigation and tools. Buttons have 44px touch targets. The landing header still gives way to the pinned method sequence. See `../docs/efferd-header.md`. Content keeps the canonical page structures: complete ordered catalog, contents beside the lesson sheet, quiz map and ranges, notebook library/editor, and statistics summary/mistakes/history.

Reading sheets use comfortable padding (30px 34px), reduced to 22px 20px on phones and 16px horizontal padding at 390px and below. Tables retain the shared responsive layouts and figures retain their captions. Study controls, writing surfaces and long reading passages stay still while in use.

The landing method sequence retains its continuous ScrollTrigger story (5.4 viewport heights). Three phone frames sit side by side from 980 × 680px; at 641–979px and at least 680px tall, the active phone moves to the front of the stack. Shorter desktop windows use a single panel. Below 641px, all three phones form a selectable, unpinned stack; windows under 560px tall also use unpinned steps.

## Elevation & Depth

Sage frames and paper surfaces provide most study-page separation. A restrained shadow (0 4px 20px −2px at approximately 5% stone ink) lifts headers and previews; dialogs use stronger depth and a blurred backdrop. The landing page retains its atmospheric blur and soft shadows.

**The Quiet Paper Rule.** Reuse the static grain SVG, with no pointer events. The landing uses .35 opacity with overlay blending; study pages use .045 opacity with multiply blending so texture recedes behind dense reading. Print removes grain, shadows and rounded sheet framing.

## Shapes

Pills identify navigation and action buttons. Study sheets and cards use the study-panel radius, with larger study frames and smaller controls. Phone sheets generally reduce to 28px. Marketing containers retain their broader 32–64px curves. Large radii, texture and blur are intentional features of this approved world.

## Components

- **Navigation:** a sage pill follows the selected link and is remeasured after resize and font loading. Study pages include an explicit classic-edition link; the current query and fragment are retained.
- **Actions:** coral primary buttons use dark text, a warmer hover and brief press feedback. Sage secondary buttons retain green text. Keyboard focus uses a visible green outline (3px, offset 4px on study pages).
- **Inputs and dialogs:** paper dialogs use curved edges and the shared account controller's native focus and keyboard behavior. Account inputs have an explicit 1px boundary, green focus and red invalid state; placeholder text remains readable.
- **Reading and practice:** sage contents and sheet framing unify lessons and quizzes. Table headings retain their authored hierarchy and readable contrast. Answer feedback, highlights and notebook ruling are functional content, not decorative palette targets.
- **Study motion:** GSAP reveals catalog/tool rows by 18px over .65s, quiz results by 8px over .3s, and a newly selected section heading by 8px over .28s. These movements explain entry or state changes; they do not animate the reading body or editable text.
- **Landing motion:** in-view ambient shapes move ±10px over a six-second cycle; reveals use 30px over .8s. The method story keeps its progress bar and withdraws the header while pinned. The FAQ retains its 500ms transition.
- **Reduced motion and print:** reduced motion disables study transitions and GSAP entrances. On the landing it also removes floating and pinning and exposes all three panels. Print exposes the landing panels, removes study navigation and texture, and uses plain paper surfaces.

## Do's and Don'ts

- **Do** apply study presentation through the scoped `study.css` layer and reuse the canonical layouts and behavior.
- **Do** reuse the existing BioMed logo, textbook figures and locally licensed fonts. No new raster imagery was introduced for the study extension.
- **Do** preserve real progress and all educational text, figures, answer keys and explanation relationships.
- **Don't** carry the landing's stronger texture, decorative motion or oversized composition into the reading and writing surfaces.
- **Don't** turn demonstrative landing prices, diary examples or the unsaved quiz into real purchases, testimonials or study history.
