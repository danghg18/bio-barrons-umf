/* Owner-scoped, local-first synchronization. Cloud is authoritative for clean caches. */
(function () {
  'use strict';
  const storage = window.BBUserStorage;
  const personal = window.BBPersonalRecords;
  const remoteRevisions = new Map();
  const unsupported = new Set();
  const quizzes = new Map((window.BB_QUIZ_INDEX || []).map(q => [q.storageKey, q]));
  const messages = {
    unconfigured:'Conturile nu sunt încă disponibile. Progresul se păstrează pe acest dispozitiv.',
    signedout:'Studiezi fără cont. Progresul se păstrează pe acest dispozitiv.',
    syncing:'Sincronizare în curs…', synced:'Sincronizat',
    offline:'Mod offline. Modificările rămân pe dispozitiv și se sincronizează la reconectare.',
    error:'Sincronizarea nu a reușit. Datele locale sunt păstrate. Reîncearcă.',
    local:'Modificări salvate local. Se pregătește sincronizarea…'
  };
  let status = 'unconfigured';
  let epoch = 0;
  let loadedOwner = null;
  let timer;
  let running = false;
  let again = false;
  function state() {
    return {status, message:messages[status] + (unsupported.size ? ' Unele date provin dintr-o versiune mai nouă. Actualizează aplicația; copiile locale sunt păstrate.' : '') + (storage.canPersist() ? '' : ' Salvarea locală nu este disponibilă; exportă datele înainte de a închide pagina.')};
  }
  function publish(next) {
    status = next;
    document.dispatchEvent(new CustomEvent('bb:sync-change', {detail:state()}));
  }
  function identity() { return window.BBAuth.getState().user?.id || null; }
  function validIdentity(id, generation) { return id && identity() === id && storage.owner() === id && generation === epoch; }
  function validState(key, value) {
    const version = key === 'bb.study.v1' ? 1 : quizzes.get(key)?.version;
    return value && typeof value === 'object' && !Array.isArray(value) && value.version === version &&
      (key === 'bb.study.v1' ? value.lessons && typeof value.lessons === 'object' : value.questions && typeof value.questions === 'object');
  }
  function noteKey(note) {
    if (!Number.isInteger(note.chapter_num) || note.chapter_num <= 0 || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,159}$/.test(note.section_id) ||
      typeof note.body !== 'string' || note.body.length > 20000) throw Error('Invalid note');
    return 'note:' + note.chapter_num + ':' + note.section_id;
  }
  async function fetchRemote(client, id) {
    const results = await Promise.all(['study_state','quiz_states','notes'].map(table => client.from(table).select('*').eq('user_id', id)));
    if (results.some(result => result.error)) throw Error('Cloud read failed');
    const remote = {};
    for (const row of results[0].data || []) {
      if (row.user_id !== id || row.version !== 1 || !validState('bb.study.v1', row.state)) throw Error('Invalid study state');
      remote['bb.study.v1'] = row.state;
      remoteRevisions.set(id + ':bb.study.v1', row.revision);
    }
    for (const row of results[1].data || []) {
      if (!quizzes.has(row.quiz_key)) continue; // Future quizzes remain untouched in cloud.
      if (row.user_id !== id || row.version !== quizzes.get(row.quiz_key).version || !validState(row.quiz_key, row.state)) throw Error('Unsupported quiz state');
      remote[row.quiz_key] = row.state;
      remoteRevisions.set(id + ':' + row.quiz_key,row.revision);
    }
    for (const row of results[2].data || []) {
      if (row.user_id !== id) throw Error('Invalid note owner');
      remoteRevisions.set(id + ':' + noteKey(row),row.revision);
      remote[noteKey(row)] = {chapter_num:row.chapter_num, section_id:row.section_id, body:row.body, created_at:row.created_at, updated_at:row.updated_at};
    }
    if (personal) {
      // Supabase paginates responses: never truncate histories at the API cap.
      for (let offset = 0; ; offset += 500) {
        const result = await client.from('personal_records').select('*').eq('user_id',id).order('record_key').range(offset,offset + 499);
        if (result.error) throw Error('Personal history read failed');
        const rows = result.data || [];
        for (const row of rows) {
          if (row.user_id !== id) throw Error('Invalid personal record owner');
          if (!personal.isKey(row.record_key)) continue;
          if (row.payload?.version !== 1) unsupported.add(row.record_key); else unsupported.delete(row.record_key);
          remote[row.record_key] = row.payload;
          remoteRevisions.set(id + ':' + row.record_key,row.revision);
        }
        if (rows.length < 500) break;
      }
    }
    return remote;
  }
  function rowFor(key, value, id) {
    if (key.startsWith('note:')) {
      if (noteKey(value) !== key) throw Error('Invalid note association');
      return {table:'notes', conflict:'user_id,chapter_num,section_id', row:{user_id:id,
        chapter_num:value.chapter_num, section_id:value.section_id, body:value.body}};
    }
    if (!validState(key, value)) throw Error('Unsupported local state');
    return key === 'bb.study.v1'
      ? {table:'study_state', conflict:'user_id', row:{user_id:id, version:1, state:value}}
      : {table:'quiz_states', conflict:'user_id,quiz_key', row:{user_id:id, quiz_key:key, version:quizzes.get(key).version, state:value}};
  }
  async function synchronize() {
    await window.BBAuth.ready;
    if (running) { again = true; return; }
    const id = identity();
    if (!id || storage.owner() !== id) {
      publish(window.BBAuth.getState().configured ? 'signedout' : 'unconfigured'); return;
    }
    if (!navigator.onLine) { publish('offline'); return; }
    const generation = epoch;
    running = true;
    publish('syncing');
    try {
      const client = window.BBSupabase.get();
      async function cycle() {
        if (!validIdentity(id, generation)) return;
        // Include the read and hydration in the same cross-tab lock as writes.
        // Otherwise an old SELECT can arrive after another tab's acknowledged upsert.
        if (loadedOwner !== id) {
          const beforeRead = storage.snapshot();
          const remote = await fetchRemote(client, id);
          if (!validIdentity(id, generation)) return;
          // Fallback for browsers without Web Locks: don't roll back a record
          // changed/acknowledged in another tab while this SELECT was in flight.
          const afterRead = storage.snapshot();
          const skip = new Set();
          for (const key of Object.keys(afterRead.values)) {
            if (personal?.isKey(key)) continue; // Merge against the actual cloud value; preserve in-flight offline edits.
            if (JSON.stringify(afterRead.values[key]) !== JSON.stringify(beforeRead.values[key]) ||
                afterRead.pending[key] !== beforeRead.pending[key]) {
              if (!afterRead.pending[key]) skip.add(key);
            }
          }
          if (storage.hydrate(remote, skip) === false) return;
          loadedOwner = id;
          document.dispatchEvent(new CustomEvent("bb:cloud-hydrated"));
        }
        const data = storage.snapshot();
        for (const [key,value] of Object.entries(data.values)) {
          if (personal?.isKey(key) && value?.version !== 1) unsupported.add(key);
        }
        for (const [key, revision] of Object.entries(data.pending)) {
          if (!validIdentity(id, generation) || !navigator.onLine) return;
          if (storage.snapshot().pending[key] !== revision) { again = true; continue; }
          if (personal?.isKey(key) && data.values[key]?.version !== 1) unsupported.add(key);
          if (unsupported.has(key)) continue;
          if (personal?.isKey(key)) {
            // Compare-and-swap is atomic on the server, so a second device
            // cannot silently replace a record read before our offline edit.
            for (let attempt = 0; attempt < 5; attempt++) {
              if (!validIdentity(id,generation)) return;
              const pending = storage.snapshot().pending[key];
              if (!pending) break;
              const value = storage.get(key);
              const response = await client.rpc('bb_put_personal_record', {p_owner:id, p_key:key, p_payload:value, p_expected:remoteRevisions.get(id + ':' + key) || 0});
              if (!validIdentity(id,generation)) return;
              if (response.error || !response.data?.record) throw Error('Personal history write failed');
              const row = response.data.record;
              if (row.user_id !== id || row.record_key !== key) throw Error('Invalid personal response');
              if (row.payload?.version !== 1) { unsupported.add(key); break; }
              remoteRevisions.set(id + ':' + key,row.revision);
              storage.acceptPersonal(key,row.payload,pending);
              if (response.data.accepted) break;
              if (attempt === 4) throw Error('Concurrent personal writes; retry');
            }
            continue;
          }
          for (let attempt = 0; attempt < 5; attempt++) {
            const pending = storage.snapshot().pending[key];
            if (!pending || !validIdentity(id,generation)) break;
            const value = storage.get(key);
            const record = rowFor(key,value,id);
            if (record.table === 'notes') await window.BBNoteMedia?.flush(record.row.body,id);
            if (!validIdentity(id,generation)) return;
            const result = await client.rpc('bb_put_account_state', {p_owner:id,p_key:key,p_payload:value,p_expected:remoteRevisions.get(id + ':' + key) || 0});
            if (!validIdentity(id,generation)) return;
            if (result.error || !result.data?.record) throw Error('Cloud write failed');
            const row = result.data.record;
            if (row.user_id !== id || !Number.isSafeInteger(row.revision) || row.revision < 1 ||
                (record.table === 'quiz_states' && row.quiz_key !== key) ||
                (record.table === 'notes' && noteKey(row) !== key)) throw Error('Invalid cloud response');
            const incoming = record.table === 'notes'
              ? {chapter_num:row.chapter_num,section_id:row.section_id,body:row.body,created_at:row.created_at,updated_at:row.updated_at} : row.state;
            if (record.table !== 'notes' && !validState(key,incoming)) throw Error('Unsupported cloud response');
            remoteRevisions.set(id + ':' + key,row.revision);
            storage.acceptState(key,incoming,pending,result.data.accepted ? value : undefined);
            if (result.data.accepted) break;
            if (attempt === 4) throw Error('Concurrent cloud writes; retry');
          }
        }
      }
      if (navigator.locks?.request) await navigator.locks.request('bb-cloud-sync:' + id, cycle); else await cycle();
      if (validIdentity(id, generation)) {
        const pending = Object.keys(storage.snapshot().pending).filter(key => !unsupported.has(key)).length;
        publish(!navigator.onLine ? 'offline' : pending ? 'local' : unsupported.size ? 'error' : 'synced');
        if (pending && navigator.onLine) again = true;
      }
    } catch (_) {
      if (validIdentity(id, generation)) publish(navigator.onLine ? 'error' : 'offline');
    } finally {
      running = false;
      if (again) { again = false; schedule(); }
    }
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(synchronize, 600); }
  function retry() {
    clearTimeout(timer);
    // Refresh cloud on explicit retry/focus; pending local changes survive hydration.
    loadedOwner = null;
    return synchronize();
  }
  document.addEventListener('bb:cache-owner-change', () => {
    epoch++; loadedOwner = null; remoteRevisions.clear(); unsupported.clear(); clearTimeout(timer);
    publish('signedout');
  });
  document.addEventListener('bb:auth-change', () => { setTimeout(synchronize, 0); });
  document.addEventListener('bb:cache-write', () => {
    if (!identity()) return;
    publish(navigator.onLine ? 'local' : 'offline'); schedule();
  });
  window.addEventListener('offline', () => { if (identity()) publish('offline'); });
  window.addEventListener('online', retry);
  window.addEventListener('focus', () => { if (identity() && !running) retry(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') synchronize(); });
  window.BBCloudSync = {
    getState:state, retry, isHydrated:() => loadedOwner === identity() && !!loadedOwner,
    noteStatus:key => {
      if (!navigator.onLine) return 'Offline · salvat local';
      if (status === 'error') return 'Eroare de sincronizare · textul este păstrat local';
      return storage.snapshot().pending[key] ? 'Se salvează…' : 'Salvat';
    }
  };
  if (typeof setInterval === 'function') setInterval(() => {
    if (identity() && navigator.onLine && document.visibilityState !== 'hidden' && !running) retry();
  }, 30000);
  window.BBAuth.ready.then(synchronize);
}());
