/* Section notes save synchronously into the active user's cache on every input. */
(function () {
  'use strict';
  function init() {
    if (!window.BBAuth || !window.BBUserStorage || typeof CHAPTERS === 'undefined') return;
    const filename = location.pathname.split('/').pop();
    const chapter = CHAPTERS.find(item => item.done && item.url === filename);
    const sections = [...document.querySelectorAll('.page-section[id^="page-"]')];
    const actions = document.querySelector('.lab-topbar-actions');
    if (!chapter || !sections.length || !actions || document.getElementById('bb-notes-toggle')) return;
    const button = document.createElement('button');
    button.type = 'button'; button.id = 'bb-notes-toggle'; button.className = 'bb-notes-toggle';
    button.setAttribute('aria-label', 'Notițe'); button.title = 'Notițe';
    button.setAttribute('aria-controls', 'bb-notes-panel'); button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 3h14v18H5zM8 8h8M8 12h8M8 16h5"/></svg><span>Notițe</span>';
    actions.prepend(button);
    const panel = document.createElement('dialog');
    panel.id = 'bb-notes-panel'; panel.className = 'bb-notes-panel'; panel.setAttribute('aria-labelledby', 'bb-notes-title');
    panel.innerHTML = '<div class="bb-account-heading"><h2 id="bb-notes-title">Notițe</h2><button type="button" class="bb-dialog-close" aria-label="Închide notițele"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><p class="bb-notes-chapter"></p><p class="bb-notes-section" id="bb-notes-section"></p><div class="bb-notes-guest"><p>Autentifică-te pentru a scrie și sincroniza notițe personale pentru această secțiune.</p><button type="button" class="bb-account-primary" id="bb-notes-login">Autentifică-te</button></div><div class="bb-notes-editor"><label for="bb-note-body">Notița ta pentru această secțiune</label><textarea id="bb-note-body" maxlength="20000" placeholder="Idei de reținut, conexiuni, întrebări…" aria-describedby="bb-notes-section bb-note-status bb-note-limit"></textarea><div class="bb-notes-meta"><p id="bb-note-status" role="status" aria-live="polite"></p><span id="bb-note-limit">0 / 20.000</span></div></div>';
    panel.querySelector('.bb-notes-chapter').textContent = chapter.name;
    document.body.append(panel);
    const textarea = panel.querySelector('textarea');
    const sectionName = panel.querySelector('.bb-notes-section');
    const status = panel.querySelector('#bb-note-status');
    const count = panel.querySelector('#bb-note-limit');
    const media = window.matchMedia('(max-width: 768px)');
    let key = null;
    let currentOwner = null;
    let returnFocus = button;
    let presentationCloses = 0;
    function activeSection() { return sections.find(section => section.classList.contains('active')) || sections[0]; }
    function signedIn() { const user = window.BBAuth.getState().user; return !!user && user.id === window.BBUserStorage.owner(); }
    function updateStatus() {
      count.textContent = new Intl.NumberFormat('ro').format(textarea.value.length) + ' / 20.000';
      if (!signedIn()) { status.textContent = ''; return; }
      if (!window.BBUserStorage.canPersist()) { status.textContent = 'Stocare locală indisponibilă. Păstrează pagina deschisă și exportă copia din cont.'; return; }
      if (!navigator.onLine) { status.textContent = 'Salvat pe dispozitiv. Se sincronizează la reconectare.'; return; }
      const sync = window.BBCloudSync?.getState();
      const pending = window.BBUserStorage.snapshot().pending[key];
      if (sync?.status === 'error') status.textContent = 'Salvat pe dispozitiv. Sincronizarea a eșuat; reîncearcă din meniul contului.';
      else if (pending) status.textContent = 'Se salvează…';
      else status.textContent = textarea.value ? 'Salvat' : 'Notița se salvează automat.';
    }
    function load(force) {
      const section = activeSection();
      const sectionId = section.id.slice(5);
      const nextKey = 'note:' + chapter.num + ':' + sectionId;
      const owner = window.BBUserStorage.owner();
      const changed = nextKey !== key || owner !== currentOwner;
      key = nextKey; currentOwner = owner;
      sectionName.textContent = (section.querySelector('.page-title, .section-title, h1, h2')?.textContent || sectionId).trim();
      const authenticated = signedIn();
      panel.querySelector('.bb-notes-guest').hidden = authenticated;
      panel.querySelector('.bb-notes-editor').hidden = !authenticated;
      textarea.disabled = !authenticated;
      if (changed || force) textarea.value = authenticated ? window.BBUserStorage.get(key)?.body || '' : '';
      updateStatus();
    }
    function close() { if (panel.open) panel.close(); }
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
      (signedIn() ? textarea : panel.querySelector('#bb-notes-login')).focus();
    }
    textarea.addEventListener('input', () => {
      // Capture ownership and section now; no deferred callback can change this key.
      if (!signedIn() || currentOwner !== window.BBUserStorage.owner() || !key) return;
      const previous = window.BBUserStorage.get(key);
      const now = new Date().toISOString();
      const sectionId = key.split(':').slice(2).join(':');
      const saved = window.BBUserStorage.set(key, {chapter_num:chapter.num, section_id:sectionId, body:textarea.value.slice(0, 20000), created_at:previous?.created_at || now, updated_at:now});
      updateStatus();
      if (!saved) status.textContent = 'Contul s-a schimbat într-o altă filă. Redeschide notițele după autentificare.';
    });
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
    document.addEventListener('bb:auth-change', () => load(true));
    document.addEventListener('bb:cache-owner-change', () => load(true));
    document.addEventListener('bb:cache-change', () => load(true));
    document.addEventListener('bb:sync-change', updateStatus);
    window.addEventListener('online', updateStatus); window.addEventListener('offline', updateStatus);
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
