/* Section notes save synchronously into the active user's cache on every input. */
(function () {
  'use strict';
  function signedIn() { const user = window.BBAuth.getState().user; return !!user && user.id === window.BBUserStorage.owner(); }
  function renderNoteBody(target, body) { window.BBNotesContent.render(target, body); }
  function makeNotesButton() {
    const button = document.createElement('button');
    button.type = 'button'; button.id = 'bb-notes-toggle'; button.className = 'bb-notes-toggle';
    button.setAttribute('aria-label', 'Notițe'); button.title = 'Notițe';
    button.setAttribute('aria-controls', 'bb-notes-panel'); button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 3h14v18H5zM8 8h8M8 12h8M8 16h5"/></svg><span>Notițe</span>';
    return button;
  }
  function initNotebooks(root) {
    const chapters = CHAPTERS.filter(chapter => chapter.done && chapter.url);
    const selected = chapters.find(chapter => String(chapter.num) === new URLSearchParams(location.search).get('capitol'));
    const sections = selected ? window.BB_NOTEBOOK_SECTIONS?.[selected.num] || [] : [];
    const entries = new Map();
    let owner = null, initialized = false, generation = 0, initialAnchor = true, layoutPending = false;
    let paper, nav, tools, intro, status;
    function element(tag, className, text) {
      const node = document.createElement(tag); node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    }
    function link(className, text, href) { const node = element('a', className, text); node.href = href; return node; }
    function notes(chapter) {
      const prefix = 'note:' + chapter.num + ':';
      return Object.entries(window.BBUserStorage.snapshot().values).filter(([key, note]) => key.startsWith(prefix) && typeof note?.body === 'string').map(([key, note]) => ({id:key.slice(prefix.length), body:note.body}));
    }
    function nonempty(chapter) {
      return notes(chapter).filter(note => { const div = document.createElement('div'); renderNoteBody(div, note.body); return window.BBNotesContent.hasContent(div); }).length;
    }
    function countLabel(count) { return count === 1 ? '1 notiță' : count + ' notițe'; }
    function updateStatus() {
      if (!status) return;
      const sync = window.BBCloudSync?.getState();
      status.textContent = !signedIn() ? '' : !window.BBUserStorage.canPersist() ? 'Stocare locală indisponibilă. Păstrează pagina deschisă și exportă copia din cont.' : !navigator.onLine ? 'Salvat pe dispozitiv. Se sincronizează la reconectare.' : sync?.status === 'error' ? 'Salvat pe dispozitiv. Sincronizarea nu a reușit; reîncearcă din meniul contului.' : '';
    }
    function scrollToAnchor() {
      if (!initialAnchor || !location.hash || root.dataset.sectionsReady !== 'true') return;
      try { const target = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (target) { initialAnchor = false; target.scrollIntoView({block:'start',behavior:'instant'}); } } catch (_) { /* Invalid external fragment. */ }
    }
    function finishLayout() {
      if (layoutPending || root.dataset.sectionsReady === 'true') return;
      layoutPending = true; const token = generation;
      const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => window.addEventListener('load', resolve, {once:true}));
      const settled = initialAnchor && location.hash ? Promise.all([loaded,document.fonts.ready]) : Promise.resolve();
      void settled.then(() => requestAnimationFrame(() => {
        if (token !== generation) return;
        layoutPending = false; root.dataset.sectionsReady = 'true'; scrollToAnchor();
      }));
    }
    function clear() {
      generation++; entries.forEach(entry => entry.controller.destroy()); entries.clear();
      root.replaceChildren(); initialized = false; layoutPending = false; status = null; paper = null;
    }
    function activate(controller) {
      entries.forEach(entry => { entry.article.classList.toggle('is-active', entry.controller === controller); if (entry.controller !== controller) entry.controller.closePalettes(); });
    }
    function reconcile() {
      if (!paper || !signedIn()) return;
      const focused = root.contains(document.activeElement) ? document.activeElement : null;
      const selection = window.getSelection();
      // A live Range collapses when its article is detached. Keep node endpoints.
      const savedSelection = focused && selection?.rangeCount && focused.contains(selection.anchorNode) && focused.contains(selection.focusNode)
        ? {anchor:selection.anchorNode, anchorOffset:selection.anchorOffset, focus:selection.focusNode, focusOffset:selection.focusOffset} : null;
      let reordered = false;
      const stored = notes(selected);
      const ordered = [...(sections || [])];
      stored.forEach(note => { if (!ordered.some(section => section.id === note.id)) ordered.push({id:note.id, title:note.id.replace(/[-_]/g, ' ')}); });
      ordered.forEach((section, index) => {
        let entry = entries.get(section.id);
        if (!entry) {
          const article = element('article', 'nb-entry'); article.dataset.section = section.id; article.id = 'nota-' + section.id;
          const heading = element('div', 'nb-entry-heading');
          const title = element('h2', '', section.title); title.id = article.id + '-title';
          heading.append(element('span', 'nb-entry-number', String(index + 1).padStart(2, '0')), title);
          const host = element('div', 'nb-live-editor');
          article.append(heading, host);
          paper.append(article);
          const controller = window.BBNoteEditor.mount(host, {chapter:selected, section:section.id, idPrefix:'bb-note-' + selected.num + '-' + section.id, headingId:title.id, toolbarHost:tools, isOpen:() => signedIn(), onActivate:activate, peers:() => [...entries.values()].map(item => ({controller:item.controller, title:item.title.textContent}))});
          const anchor = link('', section.title, '#' + encodeURIComponent(article.id)); nav.append(anchor);
          entry = {article, controller, title, anchor}; entries.set(section.id, entry);
        }
        entry.title.textContent = section.title; entry.anchor.textContent = section.title;
        entry.article.querySelector('.nb-entry-number').textContent = String(index + 1).padStart(2, '0');
        // Reorder only when metadata changes; never detach the focused editor on input.
        const articles = paper.querySelectorAll('.nb-entry');
        if (articles[index] !== entry.article) { paper.insertBefore(entry.article, articles[index] || null); reordered = true; }
        if (nav.children[index] !== entry.anchor) nav.insertBefore(entry.anchor, nav.children[index] || null);
      });
      if (reordered && focused?.isConnected) {
        focused.focus({preventScroll:true});
        if (savedSelection?.anchor.isConnected && savedSelection.focus.isConnected) selection.setBaseAndExtent(savedSelection.anchor,savedSelection.anchorOffset,savedSelection.focus,savedSelection.focusOffset);
      }
      if (!tools.children.length) entries.values().next().value?.controller.activate();
      intro.textContent = 'Capitolul ' + selected.num + ' · ' + countLabel(nonempty(selected));
      scrollToAnchor();
    }
    function render() {
      const nextOwner = signedIn() ? window.BBUserStorage.owner() : null;
      if (!initialized || nextOwner !== owner) {
        clear(); owner = nextOwner; initialized = true;
        root.dataset.sectionsReady = 'false';
        const header = element('header', 'nb-heading'); root.append(header);
        if (selected) {
          root.closest('main').classList.add('nb-main-open');
          header.append(link('nb-back', '← Toate caietele', 'notite.html'));
          document.title = selected.name + ' · Caietele mele · BioMed';
        } else header.append(element('h1', '', 'Caietele mele'), element('p', 'nb-intro', 'Tot ce ai notat. Un caiet pentru fiecare capitol.'));
        if (!nextOwner) {
          const guest = element('div', 'nb-guest'); guest.append(element('h2', '', 'Păstrează-ți ideile aproape.'), element('p', '', 'Autentifică-te pentru a-ți deschide caietele cu notițe din lecții.'));
          if (selected) guest.prepend(element('h1', 'nb-guest-title', selected.name));
          const login = element('button', 'bb-account-primary', 'Autentifică-te'); login.type = 'button'; login.addEventListener('click', () => window.BBAccountUI?.open('login')); guest.append(login); root.append(guest); return;
        }
        status = element('p', 'nb-status'); status.setAttribute('role', 'status'); root.append(status);
        if (selected) {
          const toc = element('details', 'nb-toc'); toc.append(element('summary', '', 'Cuprinsul caietului'));
          nav = element('nav', ''); nav.setAttribute('aria-label', 'Cuprinsul caietului'); toc.append(nav); header.append(toc);
          paper = element('div', 'nb-paper');
          const paperHeader = element('header', 'nb-paper-heading'); paperHeader.append(element('h1', '', selected.name));
          intro = element('p', 'nb-intro'); paperHeader.append(intro); paper.append(paperHeader);
          tools = element('div', 'nb-tools'); tools.setAttribute('aria-label', 'Instrumentele secțiunii active'); paper.append(tools);
          root.append(paper);
        } else {
          const grid = element('div', 'nb-grid');
          chapters.forEach(chapter => {
            const cover = link('nb-cover', '', 'notite.html?capitol=' + chapter.num); cover.dataset.chapter = chapter.num; cover.style.setProperty('--nb-color', chapter.color);
            const face = element('span', 'nb-cover-face', String(chapter.num).padStart(2, '0')); face.setAttribute('aria-hidden', 'true');
            const label = element('div', 'nb-cover-label'); label.append(element('h2', '', chapter.name), element('span', 'nb-cover-count'));
            const arrow = element('span', 'nb-cover-arrow', '↗'); arrow.setAttribute('aria-hidden', 'true');
            cover.append(face, label, arrow); grid.append(cover);
          }); root.append(grid);
        }
      }
      if (!nextOwner) return;
      updateStatus();
      if (selected) { reconcile(); finishLayout(); }
      else {
        chapters.forEach(chapter => { const count = nonempty(chapter); root.querySelector('[data-chapter="' + chapter.num + '"] .nb-cover-count').textContent = count ? countLabel(count) : 'Încă fără notițe'; });
        root.dataset.sectionsReady = 'true';
      }
    }
    ['bb:auth-change', 'bb:cache-owner-change', 'bb:cache-change', 'bb:cache-write'].forEach(event => document.addEventListener(event, render));
    document.addEventListener('bb:sync-change', updateStatus);
    window.addEventListener('online', updateStatus); window.addEventListener('offline', updateStatus);
    window.addEventListener('pageshow', render);
    render();
  }
  function init() {
    if (!window.BBAuth || !window.BBUserStorage || typeof CHAPTERS === 'undefined') return;
    const filename = location.pathname.split('/').pop();
    const chapter = CHAPTERS.find(item => item.done && item.url === filename);
    const sections = [...document.querySelectorAll('.page-section[id^="page-"]')];
    const actions = document.querySelector('.lab-topbar-actions');
    if (filename === 'notite.html') { const root = document.getElementById('notebooks'); if (root) initNotebooks(root); return; }
    if (!chapter || !sections.length || !actions || document.getElementById('bb-notes-toggle')) return;
    const button = makeNotesButton();
    actions.prepend(button);
    const mobileTools = document.createElement('div');
    mobileTools.className = 'bb-notes-mobile-tools';
    document.querySelector('main').prepend(mobileTools);
    const mobilePlacement = window.matchMedia('(max-width: 700px)');
    function placeNotesButton() {
      const focused = document.activeElement === button;
      (mobilePlacement.matches ? mobileTools : actions).prepend(button);
      if (focused) button.focus({preventScroll:true});
    }
    mobilePlacement.addEventListener('change', placeNotesButton);
    placeNotesButton();
    const panel = document.createElement('dialog');
    panel.id = 'bb-notes-panel'; panel.className = 'bb-notes-panel'; panel.setAttribute('aria-labelledby', 'bb-notes-title');
    panel.innerHTML = '<div class="bb-account-heading"><h2 id="bb-notes-title">Notițe</h2><button type="button" class="bb-dialog-close" aria-label="Închide notițele"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><p class="bb-notes-chapter"></p><p class="bb-notes-section" id="bb-notes-section"></p><div class="bb-notes-guest"><p>Autentifică-te pentru a scrie și sincroniza notițe personale pentru această secțiune.</p><button type="button" class="bb-account-primary" id="bb-notes-login">Autentifică-te</button></div><div class="bb-notes-editor"></div>';
    panel.querySelector('.bb-notes-chapter').textContent = chapter.name;
    document.body.append(panel);
    const sectionName = panel.querySelector('.bb-notes-section');
    const media = window.matchMedia('(max-width: 768px)');
    let returnFocus = button, presentationCloses = 0;
    function activeSection() { return sections.find(section => section.classList.contains('active')) || sections[0]; }
    const controller = window.BBNoteEditor.mount(panel.querySelector('.bb-notes-editor'), {chapter, section:activeSection().id.slice(5), isOpen:() => panel.open});
    const editor = controller.editor;
    function closePalettes() { controller.closePalettes(); }
    function load(force) {
      const section = activeSection();
      sectionName.textContent = (section.querySelector('.page-title, .section-title, h1, h2')?.textContent || section.id.slice(5)).trim();
      panel.querySelector('.bb-notes-guest').hidden = signedIn(); panel.querySelector('.bb-notes-editor').hidden = !signedIn();
      controller.setSection(section.id.slice(5)); controller.load(force);
    }
    function close() { closePalettes(); if (panel.open) panel.close(); }
    function open() {
      if (panel.open) return;
      returnFocus = document.activeElement;
      document.dispatchEvent(new CustomEvent('bb:notes-opening'));
      document.querySelector('.bb-settings-toggle[aria-expanded="true"]')?.click();
      if (media.matches && typeof window.closeNav === 'function') window.closeNav();
      document.querySelector('.lesson-search.open .lesson-search-trigger')?.click();
      load(true);
      if (media.matches) panel.showModal(); else panel.show();
      document.body.classList.add('bb-notes-open');
      button.setAttribute('aria-expanded', 'true');
      (signedIn() ? editor : panel.querySelector('#bb-notes-login')).focus();
    }
    button.addEventListener('click', () => panel.open ? close() : open());
    panel.querySelector('.bb-dialog-close').addEventListener('click', close);
    panel.querySelector('#bb-notes-login').addEventListener('click', () => { close(); window.BBAccountUI?.open('login'); });
    panel.addEventListener('close', () => {
      if (presentationCloses > 0) { presentationCloses -= 1; return; }
      button.setAttribute('aria-expanded', 'false'); document.body.classList.remove('bb-notes-open');
      if (returnFocus?.isConnected) returnFocus.focus();
    });
    panel.addEventListener('keydown', event => { if (media.matches) window.BBAccountUI?.trapTab(event, panel); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && panel.open) { event.preventDefault(); close(); } });
    document.addEventListener('bb:account-opening', close);
    document.addEventListener('bb:lesson-section-change', () => load());
    // The editor detects owner/section/content changes itself. Rebuilding an
    // unchanged body on sync or token refresh discards the live caret and scroll.
    document.addEventListener('bb:auth-change', () => load());
    document.addEventListener('bb:cache-owner-change', () => load());
    document.addEventListener('bb:cache-change', () => load());
    // Legacy lesson routers change section classes without a shared router API.
    const observer = new MutationObserver(() => load());
    sections.forEach(section => observer.observe(section, {attributes:true, attributeFilter:['class']}));
    media.addEventListener('change', () => {
      if (!panel.open) return;
      const focused = document.activeElement;
      presentationCloses += 1;
      panel.close();
      if (media.matches) panel.showModal(); else panel.show();
      // Consume this particular queued close event without closing the new presentation.
      if (focused && panel.contains(focused)) focused.focus();
    });
    load(true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
}());
