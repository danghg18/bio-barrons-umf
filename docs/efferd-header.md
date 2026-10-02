# Shared Efferd header for both BioMed editions

The user requested `@efferd/header-2` on every page of both editions. The shared implementation in `assets/js/site-header.js` and `assets/css/site-header.css` follows the [official block](https://efferd.com/r/default/header-2.json): brand, inline desktop links, account/primary actions, a header that contracts after scrolling, and a separate mobile menu.

The shadcn skill was installed locally with `npx skills add shadcn/ui`. CLI inspection identifies this repository as a manual static project without Tailwind or a React import alias. The registry block uses React, shadcn Button, a Portal, and useScroll. Its behavior is therefore adapted to vanilla JavaScript/CSS; no React project, components.json placeholder, runtime CDN or build-server dependency is introduced. The CLI block itself is not installed as unused TSX.

## Integration

- 41 classic documents, the Softly landing page and 41 generated Softly study documents use one header controller and stylesheet. The generator places the shared header stylesheet after each edition's presentation layers.
- Edition-relative links retain the classic catalog or Softly catalog; lesson CTAs use the canonical chapter quiz resource. The logo retains each page's existing homepage destination.
- Existing account, notes, contents, search, settings, highlighter and routing controllers remain the owners of their behavior. The header initializes after their DOMContentLoaded setup, reuses the account button, and exposes mobile settings/notes proxies. Closing the settings panel returns focus to the visible mobile entry.
- A native dialog provides modal isolation, Escape, cyclic keyboard focus and focus return. Resizing to desktop closes it. Animations are disabled for reduced motion; the header is absent from print.
- Desktop: 1280px maximum before scroll, 1120px after 10px of scroll, 8px top offset. Mobile/tablet below 1000px: full width, 64px height. Classic and Softly retain their own typography/palette and use 14px/24px scrolled corners.
- The landing page's old menu/scroll owner was removed from `nou/home-shell.js`; its versioned URL changes. Generated cache inventories cover both new shared assets. Educational content and personal storage are unchanged.

## Design review

The one intentional detector exception is the 300ms header-width transition from the reference block. It changes only the bounded, fixed-height navigation surface (1280 → 1120px), never the lesson layout or reading width, and is removed for reduced motion. The shared header uses a dedicated green/stone palette, 10px action corners and a 12px menu-close corner; these belong to this component rather than replacing the editions’ content tokens.

## Verification

`node scripts/site-header-test.mjs` covers all 83 documents at 1440, 1120, 1000, 775, 390 and 320px, single account ownership, visible controls, CTA contrast, edition-relative links and modal keyboard behavior. It also covers both legacy lesson families, settings focus, resizing, scroll contraction and print. Existing compact layout and controller tests now use the responsive menu when necessary; their content, routing, storage and account assertions are retained.

Visual review includes Softly desktop scrolling, mobile menu/settings, the classic renal lesson at desktop/320px, and the 775px landing page. The project regression suite, generated inventory check and offline upgrade checks remain release requirements. Authentication tests use the injected mock; no live account credentials or study records are changed.
