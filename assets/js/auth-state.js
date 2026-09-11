(function () {
  'use strict';
  let user = null;
  let recovery = false;
  let initialized = false;
  let client;
  let resolveReady;
  const ready = new Promise(resolve => { resolveReady = resolve; });
  function snapshot() { return {user:user ? {id:user.id, email:user.email} : null, recovery, configured:!!client, initialized}; }
  function publish(event, session) {
    user = session?.user || null;
    recovery = !!user && (event === 'PASSWORD_RECOVERY' || recovery);
    if (event === 'SIGNED_OUT') recovery = false;
    window.BBUserStorage.activate(user?.id);
    document.dispatchEvent(new CustomEvent('bb:auth-change', {detail:{...snapshot(), event}}));
  }
  async function init() {
    client = window.BBSupabase.get();
    if (!client) { initialized = true; publish('INITIAL_SESSION', null); resolveReady(); return; }
    let received = false;
    client.auth.onAuthStateChange((event, session) => {
      received = true;
      // Synchronous callback: no Supabase awaits inside the SDK auth lock.
      initialized = true;
      publish(event, session);
    });
    try {
      const result = await client.auth.getSession();
      if (!received) publish('INITIAL_SESSION', result.error ? null : result.data.session);
    } catch (_) { if (!received) publish('INITIAL_SESSION', null); }
    initialized = true;
    resolveReady();
    document.dispatchEvent(new CustomEvent('bb:auth-ready'));
  }
  function friendly(error) {
    if (!navigator.onLine) return 'Ești offline. Încearcă din nou după reconectare.';
    if (error?.code === 'invalid_credentials') return 'Emailul sau parola nu sunt corecte.';
    if (error?.code === 'email_not_confirmed') return 'Confirmă adresa de email înainte de autentificare.';
    if (error?.code === 'weak_password') return 'Alege o parolă mai lungă și mai greu de ghicit.';
    if (error?.status === 429 || error?.code === 'over_email_send_rate_limit') return 'Prea multe încercări. Așteaptă puțin și reîncearcă.';
    return 'Operația nu a reușit. Verifică conexiunea și încearcă din nou.';
  }
  async function perform(action, email, password) {
    await ready;
    if (!client) return {error:'Conturile nu sunt încă disponibile. Poți studia fără cont.'};
    try {
      let result;
      if (action === 'signup') result = await client.auth.signUp({email, password, options:{emailRedirectTo:window.BBSupabase.redirect(false)}});
      else if (action === 'login') result = await client.auth.signInWithPassword({email, password});
      else if (action === 'reset') result = await client.auth.resetPasswordForEmail(email, {redirectTo:window.BBSupabase.redirect(true)});
      else if (action === 'password' && user && recovery) result = await client.auth.updateUser({password});
      else if (action === 'logout') {
        // The local scope removes this browser session; revoke failures are visible and retryable.
        result = await client.auth.signOut({scope:'local'});
        if (!result.error) publish('SIGNED_OUT', null);
      } else return {error:'Deschide din nou linkul de resetare primit prin email.'};
      if (result.error) return {error:friendly(result.error)};
      if (action === 'password') { recovery = false; document.dispatchEvent(new CustomEvent('bb:auth-change', {detail:snapshot()})); }
      return {ok:true, session:!!result.data?.session};
    } catch (error) { return {error:friendly(error)}; }
  }
  window.BBAuth = {ready, getState:snapshot, perform};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
}());
