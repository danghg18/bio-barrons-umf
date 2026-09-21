/* A glossary visit keeps only per-tab navigation context, never answers or notes. */
(function () {
  'use strict';
  var PREFIX = 'bb.glossary.context.', PENDING = 'bb.glossary.return', running = false;
  var base = new URL('.', location.href);
  function read(token) {
    if (!/^[a-z0-9-]{12,80}$/i.test(token || '')) return null;
    try {
      var value = JSON.parse(sessionStorage.getItem(PREFIX + token));
      if (!value || typeof value.url !== 'string' || !Number.isFinite(value.created) || value.created > Date.now() || Date.now() - value.created > 86400000) return null;
      if (typeof value.section !== 'string' || !value.section.startsWith('page-') || !Number.isFinite(value.x) || !Number.isFinite(value.y) || value.y < 0) return null;
      if (typeof value.pending !== 'boolean' || !Number.isInteger(value.sourceHistoryLength) || value.sourceHistoryLength < 1) return null;
      if (value.anchor !== null && (typeof value.anchor !== 'string' || !Number.isFinite(value.offset))) return null;
      if (!Array.isArray(value.details) || !Array.isArray(value.accordions) || !value.details.concat(value.accordions).every(function (item) { return typeof item === 'boolean'; })) return null;
      if (value.flowchart !== undefined && (!Array.isArray(value.flowchart) || !value.flowchart.every(function (item) { return typeof item === 'boolean'; }))) return null;
      value.info = sourceInfo(value.url);
      if (!value.info) return null;
      value.url = new URL(value.url, base).href;
      return value;
    } catch (_) { return null; }
  }
  function save(token, value) { try { sessionStorage.setItem(PREFIX + token, JSON.stringify(value)); return true; } catch (_) { return false; } }
  function sourceInfo(href) {
    try {
      var url = new URL(href, base);
      if (url.origin !== location.origin || url.username || url.password) return null;
      var chapters = typeof CHAPTERS === 'undefined' ? [] : CHAPTERS;
      for (var i = 0; i < chapters.length; i++) {
        var chapter = chapters[i];
        if (chapter.done && chapter.url && new URL(chapter.url, base).pathname === url.pathname) return {kind: 'lesson', name: chapter.name};
        var resources = chapter.resources || [];
        for (var j = 0; j < resources.length; j++) {
          if (resources[j].kind === 'quiz' && new URL(resources[j].url, base).pathname === url.pathname) return {kind: 'quiz', name: chapter.name};
        }
      }
    } catch (_) {}
    return null;
  }
  function marker(value) { history.replaceState(Object.assign({}, history.state, {bbGlossary: value}), '', location.href); }
  function plain(event) { return !event.defaultPrevented && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey; }
  function pathFor(node, root) {
    if (node.id) return '#' + CSS.escape(node.id);
    var path = [];
    while (node && node !== root) {
      path.unshift(node.tagName.toLowerCase() + ':nth-child(' + (Array.prototype.indexOf.call(node.parentNode.children, node) + 1) + ')');
      node = node.parentElement;
    }
    return path.length ? path.join(' > ') : null;
  }
  function snapshot() {
    var section = document.querySelector('.page-section.active'), anchor = null, distance = Infinity;
    if (section) section.querySelectorAll('h1,h2,h3,h4,p,li,table,img,.quiz-question,[id]').forEach(function (node) {
      var box = node.getBoundingClientRect(), d = Math.abs(box.top - 100);
      if (box.height && box.bottom > 0 && d < distance) { anchor = node; distance = d; }
    });
    return {url: location.href, created: Date.now(), pending: true, info: sourceInfo(location.href), section: section && section.id,
      y: scrollY, x: scrollX, width: innerWidth, anchor: anchor && pathFor(anchor, section), offset: anchor && anchor.getBoundingClientRect().top,
      details: Array.from(document.querySelectorAll('main details'), function (node) { return node.open; }),
      accordions: Array.from(document.querySelectorAll('main .acc-head,main .accordion-head,main [onclick*="tog("]'), function (node) { return node.classList.contains('open') || !!(node.nextElementSibling && node.nextElementSibling.classList.contains('show')); }),
      flowchart: Array.from(document.querySelectorAll('main .fc-node[aria-controls],main .fc-diamond-wrap[aria-controls]'), function (node) { return node.getAttribute('aria-expanded') === 'true'; }),
      sourceHistoryLength: history.length};
  }
  function open(event) {
    if (!plain(event) || !sourceInfo(location.href)) return;
    var value = snapshot(), token = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
    if (!save(token, value)) return;
    marker({token: token, role: 'source'});
    if (typeof window.closeNav === 'function') window.closeNav();
    event.preventDefault();
    location.assign(new URL('glosar.html?context=' + token, base).href);
  }
  function setupBack() {
    var link = document.getElementById('glossary-back');
    if (!link) return;
    var token = new URLSearchParams(location.search).get('context'), value = read(token);
    var origin = document.getElementById('glossary-origin');
    if (origin) { origin.hidden = !value; origin.textContent = value ? value.info.name : ''; }
    var label = link.querySelector('span') || link;
    if (!value) { link.href = 'index.html#lab-bento'; label.textContent = 'Înapoi la lecții'; return; }
    var previous = history.state && history.state.bbGlossary;
    var safe = previous && previous.role === 'glossary' && previous.token === token && previous.safe;
    if (!previous && document.referrer === value.url.split('#')[0] && history.length === value.sourceHistoryLength + 1) safe = true;
    marker({role: 'glossary', token: token, safe: !!safe});
    value.pending = true; save(token, value);
    link.href = value.url;
    label.textContent = value.info.kind === 'quiz' ? 'Înapoi la grile' : 'Înapoi la lecție';
    link.title = value.info.name;
    if (link.dataset.bbGlossaryBound) return;
    link.dataset.bbGlossaryBound = 'true';
    link.addEventListener('click', function (event) {
      if (!plain(event)) return;
      try { sessionStorage.setItem(PENDING, token); } catch (_) {}
      if (safe && history.length === value.sourceHistoryLength + 1) { event.preventDefault(); history.back(); }
    });
  }
  function restore() {
    if (running || !sourceInfo(location.href)) return;
    var state = history.state && history.state.bbGlossary, token = state && state.role === 'source' ? state.token : null;
    try { token = token || sessionStorage.getItem(PENDING); } catch (_) {}
    var value = read(token);
    if (!value || !value.pending || new URL(value.url).pathname !== location.pathname || new URL(value.url).search !== location.search) return;
    running = true;
    var started = performance.now(), cancelled = false, timer, lastChange = started, lastY = null;
    var savedHistory = Object.assign({}, history.state, {bbGlossary: {token: token, role: 'source'}});
    var oldRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    function finish() {
      if (cancelled) return;
      cancelled = true; running = false; clearTimeout(timer);
      value.pending = false; save(token, value);
      try { if (sessionStorage.getItem(PENDING) === token) sessionStorage.removeItem(PENDING); } catch (_) {}
      history.scrollRestoration = oldRestoration;
      ['pointerdown','wheel','touchstart','keydown'].forEach(function (name) { window.removeEventListener(name, finish, true); });
    }
    ['pointerdown','wheel','touchstart','keydown'].forEach(function (name) { window.addEventListener(name, finish, {capture: true, passive: true}); });
    function tick() {
      if (cancelled) return;
      var section = document.getElementById(value.section), now = performance.now();
      if (section && !section.classList.contains('active')) {
        if (window.BBLessonNavigation) window.BBLessonNavigation.navigate(value.section.slice(5), {focus: false, scroll: false, source: 'glossary'});
        else if (typeof window.goto === 'function') window.goto(value.section.slice(5));
      }
      document.querySelectorAll('main details').forEach(function (node, i) { if (typeof value.details[i] === 'boolean') node.open = value.details[i]; });
      document.querySelectorAll('main .acc-head,main .accordion-head,main [onclick*="tog("]').forEach(function (node, i) {
        if (typeof value.accordions[i] !== 'boolean') return;
        var open = value.accordions[i]; node.classList.toggle('open', open); node.setAttribute('aria-expanded', String(open));
        if (node.nextElementSibling) { node.nextElementSibling.classList.toggle('show', open); node.nextElementSibling.setAttribute('aria-hidden', String(!open)); }
      });
      // The renal chapter owns this interaction; use its existing control handler.
      document.querySelectorAll('main .fc-node[aria-controls],main .fc-diamond-wrap[aria-controls]').forEach(function (node, i) {
        var open = (value.flowchart || [])[i];
        if (typeof open === 'boolean' && (node.getAttribute('aria-expanded') === 'true') !== open) node.click();
      });
      var anchor = null;
      try { anchor = section && value.anchor && section.querySelector(value.anchor); } catch (_) {}
      var y = anchor ? scrollY + anchor.getBoundingClientRect().top - value.offset : value.y;
      if (lastY === null || Math.abs(y - lastY) > 1 || Math.abs(scrollY - Math.min(y, document.documentElement.scrollHeight - innerHeight)) > 2) lastChange = now;
      lastY = y;
      window.scrollTo({left: value.x, top: y, behavior: 'instant'});
      if (location.href !== value.url || !history.state || !history.state.bbGlossary) history.replaceState(savedHistory, '', value.url);
      var imagesReady = !section || Array.from(section.querySelectorAll('img')).every(function (img) { return img.complete || img.loading === 'lazy' && img.getBoundingClientRect().top > innerHeight; });
      var ready = !!section && !document.querySelector('.quiz-practice-loading') && document.readyState === 'complete' && (!document.fonts || document.fonts.status === 'loaded') && imagesReady;
      if (now - started > 6000 || ready && now - started > 1500 && now - lastChange > 450) finish();
      else timer = setTimeout(tick, 50);
    }
    timer = setTimeout(tick, 0);
  }
  function init() {
    var link = document.getElementById('nav-glossary-link');
    if (link && !link.dataset.bbGlossaryBound) { link.dataset.bbGlossaryBound = 'true'; link.addEventListener('click', open); }
    setupBack();
  }
  window.BBGlossaryNavigation = Object.freeze({init: init});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true}); else init();
  window.addEventListener('pageshow', function () { init(); restore(); });
}());
