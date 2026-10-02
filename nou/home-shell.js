/* Homepage presentation only. The shared account controller owns authentication. */
(function () {
  'use strict';
  function init() {
    const trigger = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let closingTimer;
    function closeMenu(returnFocus = false) {
      clearTimeout(closingTimer);
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-label', 'Deschide meniul');
      menu.inert = true;
      menu.classList.remove('is-open');
      menu.classList.add('is-closing');
      if (returnFocus) trigger.focus();
      closingTimer = setTimeout(() => { menu.hidden = true; menu.classList.remove('is-closing'); }, reduced.matches ? 0 : 150);
    }
    trigger.addEventListener('click', () => {
      if (trigger.getAttribute('aria-expanded') === 'true') return closeMenu();
      clearTimeout(closingTimer);
      menu.hidden = false;
      menu.inert = false;
      menu.classList.remove('is-closing');
      void menu.offsetHeight;
      menu.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      trigger.setAttribute('aria-label', 'Închide meniul');
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
    document.addEventListener('click', event => {
      if (!menu.contains(event.target) && !trigger.contains(event.target)) closeMenu();
    });
    menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('bb:account-opening', () => closeMenu());
    matchMedia('(min-width:1100px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
    document.querySelectorAll('[data-account-open]').forEach(button => {
      button.addEventListener('click', () => window.BBAccountUI?.open(window.BBAuth?.getState().user ? undefined : button.dataset.accountOpen));
    });
    const updateAccount = () => {
      document.querySelector('.account-label').textContent = window.BBAuth?.getState().user ? 'Contul tău' : 'Intră în cont';
    };
    document.addEventListener('bb:auth-change', updateAccount);
    updateAccount();
    if (window.ScrollTrigger) ScrollTrigger.create({start: 40, end: 'max', onToggle: self => document.querySelector('.site-header').classList.toggle('is-scrolled', self.isActive)});

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
