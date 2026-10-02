/* Homepage presentation only. The shared account controller owns authentication. */
(function () {
  'use strict';
  function init() {
    document.querySelectorAll('[data-account-open]').forEach(button => {
      button.addEventListener('click', () => window.BBAccountUI?.open(window.BBAuth?.getState().user ? undefined : button.dataset.accountOpen));
    });
    // Pin creation changes document geometry and ScrollTrigger's first refresh
    // resets native fragment scrolling. Resolve the initial bookmark after
    // fonts, images and pin spacing settle, without overriding user navigation.
    const initialHash = location.hash;
    let interacted = false;
    const markInteraction = () => { interacted = true; };
    const inputEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    inputEvents.forEach(type => window.addEventListener(type, markInteraction, {once: true, passive: true}));
    const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => window.addEventListener('load', resolve, {once: true}));
    Promise.all([loaded, document.fonts.ready]).then(() => {
      window.ScrollTrigger?.refresh();
      requestAnimationFrame(() => {
        inputEvents.forEach(type => window.removeEventListener(type, markInteraction));
        if (interacted || !initialHash || location.hash !== initialHash || performance.getEntriesByType('navigation')[0]?.type === 'back_forward') return;
        let id;
        try { id = decodeURIComponent(initialHash.slice(1)); } catch (_) { return; }
        document.getElementById(id)?.scrollIntoView({behavior: 'instant', block: 'start'});
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true}); else init();
}());
