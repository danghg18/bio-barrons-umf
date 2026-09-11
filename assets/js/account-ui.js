/* Shared Romanian account UI. Auth credentials never enter the study cache/export. */
(function () {
  'use strict';
  function trapTab(event, dialog) {
    if (event.key !== 'Tab' || !dialog.open) return;
    const controls = [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')].filter(node => node.getClientRects().length && !node.hidden);
    if (!controls.length) { event.preventDefault(); dialog.focus(); return; }
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
  }
  function init() {
    if (!window.BBAuth || document.querySelector('.bb-account-dialog')) return;
    const actions = document.querySelector('.lab-topbar-actions');
    if (!actions) return;
    let toggle = document.getElementById('pilot-account-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.id = 'pilot-account-toggle';
      toggle.className = 'pilot-icon-button bb-account-toggle';
      toggle.type = 'button';
      toggle.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>';
      actions.append(toggle);
    }
    toggle.setAttribute('aria-haspopup', 'dialog');
    toggle.setAttribute('aria-controls', 'pilot-account-panel');
    toggle.setAttribute('aria-expanded', 'false');
    const old = document.getElementById('pilot-account-panel');
    const continueStudy = old?.querySelector('#lab-continue');
    const panel = document.createElement('dialog');
    panel.id = 'pilot-account-panel';
    panel.className = 'bb-account-dialog';
    panel.setAttribute('aria-labelledby', 'pilot-account-title');
    panel.innerHTML = '<div class="bb-account-heading"><h2 id="pilot-account-title">Contul tău</h2><button type="button" class="bb-dialog-close" aria-label="Închide contul"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><div id="bb-account-content"></div><p class="bb-account-status" id="bb-account-status" role="status" aria-live="polite"></p><p class="bb-account-message" id="bb-account-message" role="status" aria-live="polite"></p><div class="bb-account-tools"><button class="bb-account-link" type="button" id="bb-sync-retry" hidden>Reîncearcă sincronizarea</button><button class="bb-account-link" type="button" id="bb-cache-export">Exportă copia locală</button></div><p class="bb-account-footnote">Poți studia fără cont. La conectare, progresul din cloud este încărcat aici. Copiile locale înlocuite sunt păstrate pentru export în contul lor.</p>';
    if (continueStudy) panel.append(continueStudy);
    old?.remove();
    document.body.append(panel);
    const content = panel.querySelector('#bb-account-content');
    const message = panel.querySelector('#bb-account-message');
    const status = panel.querySelector('#bb-account-status');
    const retry = panel.querySelector('#bb-sync-retry');
    const title = panel.querySelector('#pilot-account-title');
    let mode = 'login';
    let busy = false;
    let returnFocus = toggle;
    let renderIdentity = '';
    let savedEmail = '';
    const auth = () => window.BBAuth.getState();
    function close() { if (panel.open) panel.close(); }
    function closeOtherPanels() {
      document.dispatchEvent(new CustomEvent('bb:account-opening'));
      document.querySelector('.bb-settings-toggle[aria-expanded="true"]')?.click();
      if (window.matchMedia('(max-width: 768px)').matches && typeof window.closeNav === 'function') window.closeNav();
      const search = document.querySelector('.lesson-search.open .lesson-search-trigger');
      search?.click();
    }
    function open(nextMode) {
      if (nextMode) { mode = nextMode; render(true); }
      if (panel.open) return;
      closeOtherPanels();
      returnFocus = document.activeElement;
      panel.showModal();
      toggle.setAttribute('aria-expanded', 'true');
      (content.querySelector('input') || panel.querySelector('.bb-dialog-close')).focus();
    }
    function setMessage(text, isError) {
      message.textContent = text || '';
      message.classList.toggle('is-error', !!isError);
    }
    function syncStatus() {
      const state = auth();
      const sync = window.BBCloudSync?.getState();
      let text = '';
      if (navigator.onLine === false) text = 'Mod offline. Progresul rămâne pe acest dispozitiv și se sincronizează la reconectare.';
      else if (!state.configured) text = 'Conturile nu sunt încă configurate. Lecțiile și grilele funcționează fără cont.';
      else if (!state.initialized) text = 'Se restaurează sesiunea…';
      else if (state.user) text = sync?.message || 'Pregătim sincronizarea…';
      else text = 'Autentifică-te pentru a sincroniza progresul și notițele.';
      if (window.BBUserStorage && !window.BBUserStorage.canPersist()) text += ' Stocarea locală nu este disponibilă. Exportă copia înainte de a închide pagina.';
      status.textContent = text;
      status.dataset.status = navigator.onLine === false ? 'offline' : sync?.status || 'idle';
      retry.hidden = !state.user || !['error', 'offline'].includes(sync?.status);
      toggle.title = state.user ? 'Contul tău · ' + state.user.email : 'Contul tău';
      toggle.setAttribute('aria-label', state.user ? 'Contul tău, ' + state.user.email : 'Contul tău');
      toggle.classList.toggle('is-authenticated', !!state.user);
    }
    function switchMode(nextMode) {
      savedEmail = content.querySelector('[name="email"]')?.value || savedEmail;
      mode = nextMode;
      setMessage('');
      render(true);
      content.querySelector('input')?.focus();
    }
    function render(force) {
      const state = auth();
      if (state.recovery) mode = 'password';
      const identity = [state.user?.id || '', state.recovery, state.configured, state.initialized, mode].join(':');
      syncStatus();
      if (!force && identity === renderIdentity) return;
      renderIdentity = identity;
      if (state.user && mode !== 'password') {
        title.textContent = 'Contul tău';
        content.innerHTML = '<p class="bb-account-email"></p><p class="bb-account-hint">Lecțiile citite, grilele și notițele tale sunt asociate acestui cont.</p><button class="bb-account-secondary" type="button" data-action="logout">Deconectare</button>';
        content.querySelector('.bb-account-email').textContent = state.user.email || 'Utilizator autentificat';
        content.querySelector('[data-action="logout"]').addEventListener('click', () => submit('logout'));
      } else if (!state.configured || !state.initialized) {
        title.textContent = 'Contul tău';
        content.innerHTML = '<p class="bb-account-hint">Continuă să înveți în ritmul tău. Progresul este salvat local atunci când browserul permite stocarea.</p>';
      } else {
        const labels = {login:['Autentificare', 'Autentifică-te'], signup:['Creează un cont', 'Creează contul'], reset:['Ai uitat parola?', 'Trimite linkul de resetare'], password:['Alege o parolă nouă', 'Salvează parola']};
        const current = labels[mode] || labels.login;
        title.textContent = current[0];
        content.innerHTML = '<form class="bb-account-form"><div class="bb-account-email-field"><label for="bb-auth-email">Email</label><input id="bb-auth-email" name="email" type="email" autocomplete="email" required maxlength="254"></div><div class="bb-account-password-field"><label for="bb-auth-password">Parolă</label><input id="bb-auth-password" name="password" type="password" required></div><button class="bb-account-primary" type="submit"></button></form><div class="bb-account-switches"></div>';
        const form = content.querySelector('form');
        const email = form.elements.email;
        const password = form.elements.password;
        email.value = savedEmail;
        email.disabled = mode === 'password';
        email.closest('div').hidden = mode === 'password';
        password.disabled = mode === 'reset';
        password.closest('div').hidden = mode === 'reset';
        password.autocomplete = mode === 'login' ? 'current-password' : 'new-password';
        password.minLength = mode === 'login' ? 1 : 8;
        if (mode === 'signup' || mode === 'password') {
          const hint = document.createElement('p'); hint.className = 'bb-account-hint'; hint.id = 'bb-password-hint';
          hint.textContent = 'Folosește cel puțin 8 caractere.'; password.after(hint); password.setAttribute('aria-describedby', hint.id);
        }
        form.querySelector('[type="submit"]').textContent = current[1];
        const switches = content.querySelector('.bb-account-switches');
        const links = mode === 'login' ? [['signup','Creează un cont'],['reset','Am uitat parola']] : mode === 'password' ? [] : [['login','Înapoi la autentificare']];
        links.forEach(([next, label]) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'bb-account-link'; button.textContent = label; button.addEventListener('click', () => switchMode(next)); switches.append(button); });
        form.addEventListener('submit', event => { event.preventDefault(); if (form.reportValidity()) submit(mode, email.value.trim(), password.value); });
      }
    }
    async function submit(action, email, password) {
      if (busy) return;
      busy = true;
      if (email) savedEmail = email;
      content.querySelectorAll('button').forEach(button => { button.disabled = true; });
      setMessage('Se procesează…');
      const result = await window.BBAuth.perform(action, email, password);
      busy = false;
      if (!result.ok) setMessage(result.error || 'Operația nu a reușit. Încearcă din nou.', true);
      else {
        if (action === 'signup') setMessage(result.session ? 'Contul a fost creat.' : 'Verifică emailul pentru a confirma contul, apoi autentifică-te.');
        else if (action === 'reset') setMessage('Dacă adresa poate primi un link de resetare, îl vei găsi în email.');
        else if (action === 'password') { mode = 'login'; setMessage('Parola a fost actualizată.'); }
        else if (action === 'logout') { mode = 'login'; savedEmail = ''; setMessage('Te-ai deconectat. Progresul contului este păstrat separat pe acest dispozitiv.'); }
        else setMessage('Te-ai autentificat.');
      }
      content.querySelectorAll('button').forEach(button => { button.disabled = false; });
      if (result.ok) render(true);
    }
    toggle.addEventListener('click', () => panel.open ? close() : open());
    panel.querySelector('.bb-dialog-close').addEventListener('click', close);
    panel.addEventListener('keydown', event => trapTab(event, panel));
    panel.addEventListener('close', () => {
      const password = content.querySelector('[name="password"]');
      if (password) password.value = '';
      toggle.setAttribute('aria-expanded', 'false');
      if (returnFocus?.isConnected) returnFocus.focus();
    });
    panel.addEventListener('click', event => { if (event.target === panel) { const box = panel.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close(); } });
    retry.addEventListener('click', async () => { retry.disabled = true; try { await window.BBCloudSync?.retry(); } finally { retry.disabled = false; syncStatus(); } });
    panel.querySelector('#bb-cache-export').addEventListener('click', () => {
      const snapshot = window.BBUserStorage?.snapshot();
      if (!snapshot) return;
      const exportData = {version:1, exported_at:new Date().toISOString(), values:snapshot.values, pending:snapshot.pending, backups:snapshot.backups};
      const url = URL.createObjectURL(new Blob([JSON.stringify(exportData, null, 2)], {type:'application/json'}));
      const link = document.createElement('a'); link.href = url; link.download = 'biomed-progres-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage('Copia locală și variantele păstrate au fost exportate.');
    });
    document.addEventListener('bb:auth-change', () => { render(); if (auth().recovery) open('password'); });
    ['bb:sync-change', 'bb:cache-change', 'bb:cache-owner-change'].forEach(event => document.addEventListener(event, syncStatus));
    window.addEventListener('online', syncStatus); window.addEventListener('offline', syncStatus);
    document.addEventListener('bb:notes-opening', close);
    window.BBAccountUI = {open, close, trapTab};
    render();
    window.BBAuth.ready.then(() => {
      render();
      const query = new URLSearchParams(location.search);
      const fragment = new URLSearchParams(location.hash.slice(1));
      if (auth().recovery) open('password');
      else if (location.pathname.endsWith('/cont.html')) {
        open();
        if (query.has('error') || fragment.has('error') || query.get('flow') === 'recovery') setMessage('Linkul de resetare nu este valid sau a expirat. Solicită un link nou din „Am uitat parola”.', true);
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
}());
