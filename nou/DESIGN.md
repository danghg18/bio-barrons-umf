# BioMed × Softly

This visual direction applies only to `/nou/`. The study site's existing design at the project root is unchanged.

## Surface and type

- Cream `#FDFCF8`, stone `#292524`, sage `#E8EFE8`, lavender `#EFEDF4`, coral `#FFB7B2`; the BioMed identity remains green `#295343`.
- Secondary text is `#6C645E`, slightly darker than the original brief to retain contrast on pastel surfaces. Quiz feedback keeps distinct green, yellow and red semantics.
- Local Outfit in 400/500/600; local Reenie Beanie for brief handwritten accents only. Source licenses are in `assets/*-OFL.txt`.
- Pill navigation and buttons; 32–64 px marketing containers, smaller controls. The static grain uses SVG turbulence at .65, opacity .35 and overlay blending, with no pointer events. Blur, texture and large radii are deliberate requirements of the approved Softly brief.

## Motion and responsive behavior

- A continuous 5.4-viewport-height ScrollTrigger sequence pins the method section. Its progress bar and scroll instruction stay visible; the floating header withdraws while the section is pinned.
- Three staggered phone frames appear only at 1180 × 900 px or larger. Smaller desktop windows use a single panel; the 775 × 688 layout retains a 24 px pin offset. Phones under 641 px and windows under 560 px tall use selectable steps without pinning.
- Decorative shapes move ±10 px over a six-second cycle while in view. Scroll reveals use 30 px and .8 seconds. Interactive feedback remains immediate.
- Reduced motion removes floating, pinning and transitions, and shows all three educational panels. Print also exposes all panels.

## Content and controls

Efferd hero/header/pricing/auth/testimonial compositions are adapted as static HTML/CSS/JavaScript. No React, shadcn runtime, backend or payment flow is introduced. Prices and diary examples are explicitly demonstrative.

The demonstration reads canonical question `sn-058` and its explanations through `home-data.js`. It never records an answer or an attempt. Authentication and synchronization belong to the existing shared controllers; `home-shell.js` only opens that interface and handles navigation. The local `/nou/cont.html` alias preserves query and fragment and immediately returns to the canonical account page.
