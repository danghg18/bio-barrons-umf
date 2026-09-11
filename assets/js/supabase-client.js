(function () {
  'use strict';
  let client = null;
  const config = window.BB_SUPABASE_CONFIG || {};
  const callback = new URL('cont.html', location.href);
  function configured() {
    try {
      const url = new URL(config.url);
      return (url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname))) &&
        /^sb_publishable_[A-Za-z0-9_-]+$/.test(config.publishableKey);
    } catch (_) { return false; }
  }
  function get() {
    if (client) return client;
    // Factory injection is a dependency boundary; tests supply it before page scripts.
    if (window.BBSupabaseFactory) { client = window.BBSupabaseFactory(); return client; }
    if (!configured() || !window.BBSupabaseSDK) return null;
    try {
      client = window.BBSupabaseSDK.createClient(config.url, config.publishableKey, {
        auth:{persistSession:true, autoRefreshToken:true, flowType:'implicit',
          detectSessionInUrl:location.pathname.endsWith('/cont.html'),
          storage:window.BBUserStorage.authStorage, storageKey:'bb.supabase.auth.v1'},
        global:{fetch: async (url, options = {}) => {
          const controller = new AbortController();
          const abort = () => controller.abort();
          options.signal?.addEventListener('abort', abort, {once:true});
          const timer = setTimeout(abort, 12000);
          try { return await fetch(url, {...options, signal:controller.signal}); }
          finally { clearTimeout(timer); options.signal?.removeEventListener('abort', abort); }
        }}
      });
    } catch (_) { client = null; }
    return client;
  }
  function redirect(recovery) {
    const local = ['localhost','127.0.0.1'].includes(location.hostname);
    const url = local ? callback : new URL('https://danghg18.github.io/bio-barrons-umf/cont.html');
    return url.href + (recovery ? '?flow=recovery' : '');
  }
  window.BBSupabase = {get, redirect};
}());
