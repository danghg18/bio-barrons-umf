/* Static adaptation of Efferd header-2. Existing study controllers own their tools. */
(function () {
  'use strict';
  const icon = paths => '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  const arrow = icon('<path d="M7 17 17 7M7 7h10v10"/>');
  function init() {
    const header = document.querySelector('.lab-topbar, .site-header');
    if (!header || header.dataset.efferdReady) return;
    header.dataset.efferdReady = 'true';
    header.id = 'bb-site-header';
    document.body.classList.add('bb-site-shell');
    const landing = document.body.classList.contains('softly-home');
    const softly = landing || document.body.classList.contains('softly-study');
    const file = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
    const homepage = landing || (!softly && file === 'index.html');
    header.classList.toggle('bb-header-study', !homepage);
    const catalog = softly ? 'lectii.html#lab-bento' : 'index.html#lab-bento';
    let inner = header.querySelector('.lab-topbar-inner');
    if (!inner) {
      inner = document.createElement('div'); inner.className = 'lab-topbar-inner';
      header.querySelector('#mobile-menu')?.remove();
      header.querySelector('#menu-toggle')?.remove();
      header.querySelector('.header-action')?.remove();
      inner.append(...header.children); header.append(inner);
    }
    const brand = inner.querySelector('.lab-brand, .brand');
    brand.classList.add('bb-header-brand');
    let nav = inner.querySelector('.bm-primary-nav, .desktop-nav');
    if (!nav) { nav = document.createElement('nav'); inner.append(nav); }
    nav.className = 'bm-primary-nav'; nav.setAttribute('aria-label', 'Navigare principală');
    if (landing) nav.innerHTML = '<a href="lectii.html#lab-bento">Lecții</a><a href="testare.html">Testare</a>';
    nav.querySelector('a')?.setAttribute('href', catalog);
    let actions = inner.querySelector('.lab-topbar-actions');
    if (!actions) { actions = document.createElement('div'); actions.className = 'lab-topbar-actions'; inner.append(actions); }
    let account = document.getElementById('pilot-account-toggle');
    if (!account) {
      account = document.createElement('a'); account.href = 'cont.html'; account.className = 'bb-header-account';
      account.innerHTML = icon('<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>') + '<span>Intră în cont</span>';
      actions.append(account);
    } else {
      account.classList.add('bb-header-account');
      if (!account.querySelector('span')) { const label = document.createElement('span'); label.className = 'account-label'; account.append(label); }
    }
    function accountLabel() {
      const label = account.querySelector('span');
      const text = window.BBAuth?.getState().user ? 'Contul meu' : 'Intră în cont';
      if (label) label.textContent = text;
      account.setAttribute('aria-label', text);
      account.title = text;
    }
    accountLabel(); document.addEventListener('bb:auth-change', accountLabel);
    const chapter = typeof CHAPTERS !== 'undefined' ? CHAPTERS.find(item => item.url === file) : null;
    const quiz = chapter?.resources?.find(item => item.kind === 'quiz');
    const cta = document.createElement('a'); cta.className = 'bb-header-cta';
    cta.href = quiz?.url || (landing ? catalog : 'testare.html');
    cta.innerHTML = (landing ? 'Începe să înveți' : 'Rezolvă grile') + arrow;
    if (homepage) actions.append(cta);
    const toggle = document.createElement('button'); toggle.type = 'button'; toggle.id = 'menu-toggle';
    toggle.className = 'bb-header-menu'; toggle.setAttribute('aria-label','Deschide meniul');
    toggle.setAttribute('aria-controls','mobile-menu'); toggle.setAttribute('aria-expanded','false');
    toggle.innerHTML = icon('<path d="M5 8h14M5 16h14"/>'); actions.append(toggle);
    const dialog = document.createElement('dialog'); dialog.id = 'mobile-menu'; dialog.className = 'bb-header-dialog';
    dialog.setAttribute('aria-labelledby','bb-header-menu-title');
    dialog.innerHTML = '<div class="bb-header-dialog-top"><h2 id="bb-header-menu-title">BioMed</h2><button type="button" aria-label="Închide meniul">' + icon('<path d="m6 6 12 12M18 6 6 18"/>') + '</button></div><nav class="bb-header-links" aria-label="Navigare mobilă"></nav><div class="bb-header-tools" aria-label="Instrumente de studiu"></div><div class="bb-header-dialog-bottom"></div>';
    document.body.append(dialog);
    const links = [[catalog,'Lecții'],['testare.html','Testare'],['notite.html','Caietele mele'],['statistici.html','Progres'],['glosar.html','Glosar']];
    for (const [href,label] of links) {
      const link = document.createElement('a'); link.href = href; link.innerHTML = '<span>' + label + '</span>' + arrow;
      if (href.split('#')[0] === file || (label === 'Lecții' && chapter)) link.setAttribute('aria-current','page');
      dialog.querySelector('nav').append(link);
    }
    function closeMenu() {
      if (!dialog.open) return;
      dialog.close(); dialog.classList.remove('is-open');
      toggle.setAttribute('aria-expanded','false'); document.body.classList.remove('bb-header-menu-open');
    }
    function proxy(selector,label) {
      const original = document.querySelector(selector);
      if (!original) return;
      const button = document.createElement('button'); button.type = 'button';
      button.textContent = label;
      // Do not let the proxy's original click reach outside-click handlers and
      // immediately dismiss the settings panel it has just opened.
      button.addEventListener('click', event => {
        event.stopPropagation(); closeMenu(); original.click();
        if (original.matches('.bb-settings-toggle')) {
          document.querySelector('#bb-sidebar-settings-panel:not([hidden]) button')?.focus();
        }
      });
      dialog.querySelector('.bb-header-tools').append(button);
    }
    proxy('.bb-settings-toggle','Setări de lectură');
    proxy('#bb-notes-toggle','Deschide notițele');
    const menuAccount = document.createElement('button'); menuAccount.type = 'button'; menuAccount.className = 'bb-header-account-action';
    menuAccount.addEventListener('click', event => { event.stopPropagation(); closeMenu(); account.click(); });
    const menuCTA = cta.cloneNode(true);
    dialog.querySelector('.bb-header-dialog-bottom').append(menuAccount);
    if (homepage) dialog.querySelector('.bb-header-dialog-bottom').append(menuCTA);
    const menuLast = homepage ? menuCTA : menuAccount;
    toggle.addEventListener('click', () => {
      if (dialog.open) { closeMenu(); return; }
      window.closeNav?.();
      const search = document.querySelector('.lesson-search.open .lesson-search-close'); search?.click();
      menuAccount.textContent = window.BBAuth?.getState().user ? 'Contul meu' : 'Intră în cont';
      dialog.showModal(); dialog.classList.add('is-open');
      toggle.setAttribute('aria-expanded','true'); document.body.classList.add('bb-header-menu-open');
    });
    dialog.querySelector('.bb-header-dialog-top button').addEventListener('click', closeMenu);
    dialog.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const first = dialog.querySelector('.bb-header-dialog-top button');
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); menuLast.focus(); }
      else if (!event.shiftKey && document.activeElement === menuLast) { event.preventDefault(); first.focus(); }
    });
    dialog.addEventListener('close', () => { toggle.setAttribute('aria-expanded','false'); document.body.classList.remove('bb-header-menu-open'); });
    dialog.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('bb:account-opening', closeMenu);
    const settingsPanel = document.getElementById('bb-sidebar-settings-panel');
    if (settingsPanel) new MutationObserver(() => {
      // The lesson controller closes this panel, including captured Escape.
      // Its desktop trigger is hidden on phones; return to the visible menu.
      if (settingsPanel.hidden && settingsPanel.contains(document.activeElement) && matchMedia('(max-width:999px)').matches) toggle.focus();
    }).observe(settingsPanel, {attributes:true, attributeFilter:['hidden']});
    matchMedia('(min-width:1000px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
    let scheduled = false;
    const update = () => { header.classList.toggle('is-scrolled', scrollY > 10); scheduled = false; };
    addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }, {passive:true});
    addEventListener('pageshow',update); update();
  }
  // This deferred script runs while readyState is interactive, before the older
  // controllers' DOMContentLoaded handlers mount account, search and note tools.
  if (document.readyState !== 'complete') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
