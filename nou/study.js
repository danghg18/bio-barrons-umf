/* Presentation only. Routing, educational data and personal records remain shared. */
(function () {
  'use strict';
  const body = document.body;
  if (!body.classList.contains('softly-study')) return;
  const q = selector => document.querySelector(selector);
  const qa = selector => [...document.querySelectorAll(selector)];

  function editionLinks(root = document) {
    for (const link of root.querySelectorAll('a[href]')) {
      const href = link.getAttribute('href');
      if (href.startsWith('index.html#lab-bento')) link.setAttribute('href', href.replace('index.html', 'lectii.html'));
    }
    const classic = q('[data-classic-edition]');
    if (classic) classic.href = '../' + body.dataset.softlySource + location.search + location.hash;
  }

  function navigationPill() {
    const nav = q('.bm-primary-nav');
    if (!nav) return;
    nav.classList.add('t-tabs');
    nav.querySelectorAll('a').forEach(link => link.classList.add('t-tab'));
    const pill = document.createElement('span');
    pill.className = 't-tabs-pill'; pill.setAttribute('aria-hidden','true'); nav.prepend(pill);
    function place(instant) {
      const selected = nav.querySelector('[aria-current="page"]');
      pill.hidden = !selected;
      if (!selected) return;
      if (instant) pill.style.transition = 'none';
      pill.style.width = selected.offsetWidth + 'px';
      pill.style.transform = `translateX(${selected.offsetLeft}px)`;
      pill.style.height = selected.offsetHeight + 'px';
      pill.style.top = selected.offsetTop + 'px';
      if (instant) { void pill.offsetWidth; pill.style.removeProperty('transition'); }
    }
    const resize = new ResizeObserver(() => place(true)); resize.observe(nav);
    const selected = new MutationObserver(() => place(false)); selected.observe(nav,{subtree:true,attributes:true,attributeFilter:['aria-current']});
    place(true); document.fonts.ready.then(() => place(true));
  }

  function accountMotion() {
    const dialog = q('dialog#pilot-account-panel');
    if (!dialog) return;
    dialog.classList.add('t-modal');
    const sync = () => dialog.classList.toggle('is-open', dialog.open);
    new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['open']}); sync();
  }

  function motion() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      // Only browse surfaces have scroll reveals. Reading and editable text remain steady.
      const browse = qa('.lab-home-catalog .lab-bento-cat, .testing-chapter-row, .notebook-library-row');
      if (browse.length) ScrollTrigger.batch(browse, {start:'top 97%',once:true,onEnter:elements => {
        gsap.fromTo(elements,{opacity:.65,y:18},{opacity:1,y:0,duration:.65,stagger:.045,ease:'power2.out',clearProps:'opacity,transform'});
      }});
      let lastSection = q('.page-section.active');
      const surface = q('main');
      const seenResults = new WeakSet();
      function refreshStates() {
        const active = q('.page-section.active');
        if (active && active !== lastSection) {
          const heading = active.querySelector('h1,h2,.section-title');
          if (heading) gsap.fromTo(heading,{opacity:.72,y:8},{opacity:1,y:0,duration:.28,ease:'power2.out',clearProps:'opacity,transform',overwrite:true});
          lastSection = active;
        }
        for (const result of qa('.quiz-question.is-verified .quiz-result')) {
          if (seenResults.has(result) || !result.getClientRects().length) continue;
          seenResults.add(result);
          gsap.fromTo(result,{opacity:.72,y:8},{opacity:1,y:0,duration:.3,ease:'power2.out',clearProps:'opacity,transform'});
        }
      }
      const changes = new MutationObserver(refreshStates);
      if (surface) changes.observe(surface,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden']});
      document.addEventListener('bb:lesson-section-change',refreshStates);
      document.fonts.ready.then(() => ScrollTrigger.refresh());
      return () => { changes.disconnect(); document.removeEventListener('bb:lesson-section-change',refreshStates); };
    });
  }

  function init() {
    editionLinks(); navigationPill(); accountMotion(); motion();
    addEventListener('pageshow',() => editionLinks());
    addEventListener('hashchange',() => editionLinks());
    document.addEventListener('bb:quiz-ready',() => editionLinks());
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
