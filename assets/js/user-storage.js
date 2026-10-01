/* Immediate cache + durable, owner-scoped outbox. No network access here. */
(function () {
  'use strict';
  if (window.BBUserStorage) return;
  const personal = window.BBPersonalRecords;
  const personalKey = key => !!personal?.isKey(key);
  const index = window.BB_QUIZ_INDEX || [];
  const keys = ['bb.study.v1', ...index.map(q => q.storageKey)];
  const auxiliary = index.map(q => q.storageKey + '.attempts.v1');
  const prefix = 'bb.user-cache.v1:';
  const recordPrefix = 'bb.user-record.v1:';
  const ackPrefix = 'bb.user-ack.v1:';
  const ownerKey = 'bb.cache-owner.v1';
  const memory = new Map();
  const unpersisted = new Set();
  let persistent = true;
  let owner = 'guest';
  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const revision = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
  const scoped = (base, id) => base + encodeURIComponent(id) + ':';
  const recordName = (key, id = owner) => scoped(recordPrefix, id) + encodeURIComponent(key);
  const ackName = (key, id = owner) => scoped(ackPrefix, id) + encodeURIComponent(key);
  function read(key) {
    // Quota errors can reject writes while reads continue to succeed. A stale
    // disk value must never replace the newer session-only draft or tombstone.
    if (unpersisted.has(key)) return memory.get(key) ?? null;
    try {
      const value = window.localStorage.getItem(key);
      if (value !== null) memory.set(key, value); else memory.delete(key);
      return value;
    } catch (_) { persistent = false; return memory.get(key) ?? null; }
  }
  function write(key, value) {
    if (value === null) memory.delete(key); else memory.set(key, value);
    try {
      if (value === null) window.localStorage.removeItem(key); else window.localStorage.setItem(key, value);
      unpersisted.delete(key);
    } catch (_) { persistent = false; unpersisted.add(key); }
  }
  function parse(value, fallback) { try { return JSON.parse(value) || fallback; } catch (_) { return fallback; } }
  function metadata(id = owner) {
    const value = parse(read(prefix + id), null);
    return value && typeof value === 'object' && !Array.isArray(value)
      ? {...value, backups:Array.isArray(value.backups) ? value.backups : []}
      : {backups:[], imported:false};
  }
  function saveMetadata(value, id = owner) { write(prefix + id, JSON.stringify(value)); }
  function record(key, id = owner) {
    const saved = parse(read(recordName(key, id)), null);
    if (saved && Object.prototype.hasOwnProperty.call(saved, 'value')) return saved;
    // Preserve caches written by an earlier version of the adapter. New writes
    // override only their record; migration never rewrites unrelated records.
    const old = metadata(id);
    return {value:old.values?.[key] ?? null, revision:old.pending?.[key] || null};
  }
  function putRecord(key, value, pending, id = owner) {
    write(recordName(key, id), JSON.stringify({value:clone(value), revision:pending || null}));
  }
  function pendingRevision(key, saved, id = owner) {
    return saved.revision && read(ackName(key, id)) !== saved.revision ? saved.revision : null;
  }
  function storedKeys() {
    const names = new Set(memory.keys());
    try {
      const storage = window.localStorage;
      for (let i = 0; i < storage.length; i++) { const name = storage.key(i); if (name) names.add(name); }
    } catch (_) { persistent = false; }
    return names;
  }
  function recordKeys(id = owner) {
    const names = new Set([...keys, ...auxiliary, ...Object.keys(metadata(id).values || {})]);
    const start = scoped(recordPrefix, id);
    storedKeys().forEach(name => {
      if (!name.startsWith(start)) return;
      try { names.add(decodeURIComponent(name.slice(start.length))); } catch (_) { /* Ignore an unrelated malformed key. */ }
    });
    return names;
  }
  function vault(id = owner) {
    const meta = metadata(id);
    const result = {...meta, values:{}, pending:{}};
    recordKeys(id).forEach(key => {
      const saved = record(key, id);
      if (saved.value !== null) result.values[key] = clone(saved.value);
      const pending = pendingRevision(key, saved, id);
      if (pending) result.pending[key] = pending;
    });
    return result;
  }
  function announce(type, detail) { document.dispatchEvent(new CustomEvent(type, {detail})); }
  function mirror(key, value) {
    if (read(ownerKey) !== owner) return;
    if (keys.includes(key) || auxiliary.includes(key)) write(key, value === null ? null : JSON.stringify(value));
  }
  function mirrors(id = owner) {
    [...keys, ...auxiliary].forEach(key => mirror(key, record(key, id).value));
  }
  function dropOtherMemory() {
    for (const key of memory.keys()) {
      const privateKey = key.startsWith(prefix) || key.startsWith(recordPrefix) || key.startsWith(ackPrefix);
      const ownKey = key === prefix + owner || key.startsWith(scoped(recordPrefix, owner)) || key.startsWith(scoped(ackPrefix, owner));
      if (privateKey && !ownKey) { memory.delete(key); unpersisted.delete(key); }
    }
  }
  // A previous guest may have used an older version of the site that only wrote
  // raw keys. Import their latest mirrors before consumers initialize.
  const previousOwner = read(ownerKey);
  if (!previousOwner || previousOwner === 'guest') {
    [...keys, ...auxiliary].forEach(key => putRecord(key, parse(read(key), null), null));
  }
  // Page boot must not change another authenticated tab's identity or mirrors.
  if (!previousOwner) write(ownerKey, owner);
  function get(key) { return clone(record(key).value); }
  function set(key, value) {
    if (read(ownerKey) && read(ownerKey) !== owner) return false;
    const syncable = owner !== 'guest' && (keys.includes(key) || key.startsWith('note:') || personalKey(key));
    // One atomic localStorage write owns one value and its pending revision.
    // Concurrent changes to distinct notes/quizzes cannot overwrite each other.
    const old = record(key).value;
    if (personalKey(key) && old?.deleted) value = personal.merge(key, old, value);
    if (personalKey(key) && JSON.stringify(old) === JSON.stringify(value)) return true;
    putRecord(key, value, syncable ? revision() : null);
    mirror(key, value);
    announce('bb:cache-write', {key, owner});
    return true;
  }
  function importableGuestRecord(key, value, values) {
    // A visitor's bulk clear is local to that identity. Import surviving records,
    // never a command that would clear unrelated, already-existing account data.
    if (key.startsWith('bb.highlight-clear.v1:') || key.startsWith('bb.analytics-clear.v1:')) return false;
    if (value.deleted) return true;
    const highlight = key.startsWith('bb.highlight.v1:');
    const analytics = key.startsWith('bb.analytics.v1:');
    if (!highlight && !analytics) return true;
    const quiz = key.startsWith('bb.analytics.v1:metadata:') ? value.key : value.storageKey;
    return Object.entries(values).every(([barrierKey, barrier]) => {
      const applies = highlight ? barrierKey.startsWith('bb.highlight-clear.v1:') && (barrier.chapterNum === null || Number(barrier.chapterNum) === Number(value.chapterNum))
        : barrierKey.startsWith('bb.analytics-clear.v1:') && (!barrier.quizKey || barrier.quizKey === quiz);
      return !applies || (value.clearIds || []).includes(barrier.id);
    });
  }
  function activate(id) {
    id = id || 'guest';
    if (id === owner && read(ownerKey) === id) return;
    const guest = metadata('guest');
    const target = metadata(id);
    if (id !== 'guest' && !target.imported) {
      if (!guest.claimedBy) {
        const guestValues = vault('guest').values;
        [...new Set([...keys, ...recordKeys('guest')])].forEach(key => {
          const saved = record(key, 'guest').value;
          if (saved == null) return;
          if (personalKey(key)) {
            if (!importableGuestRecord(key,saved,guestValues)) return;
            const imported = key.startsWith('bb.simulation.v1:') ? {...saved, owner:id} : saved;
            putRecord(key, personal.merge(key, record(key,id).value, imported), revision(), id);
          } else if (keys.includes(key) && record(key, id).value == null) putRecord(key, saved, null, id);
        });
        guest.claimedBy = id;
        saveMetadata(guest, 'guest');
      }
      target.imported = true;
      saveMetadata(target, id);
    }
    owner = id;
    write(ownerKey, owner);
    mirrors();
    dropOtherMemory();
    announce('bb:cache-owner-change', {owner});
    announce('bb:cache-change', {reason:'identity'});
  }
  function backup(key, value, reason) {
    if (value == null) return;
    const data = metadata();
    const serialized = JSON.stringify(value);
    if (data.backups.some(item => item.key === key && item.reason === reason && JSON.stringify(item.value) === serialized)) return;
    data.backups.push({key, value:clone(value), reason, at:new Date().toISOString()});
    saveMetadata(data);
  }
  function hydrate(remote) {
    if (read(ownerKey) !== owner) return false;
    const all = new Set([...recordKeys(), ...Object.keys(remote)]);
    all.forEach(key => {
      if (auxiliary.includes(key) || (!personalKey(key) && key.startsWith('bb.simulation.v1:'))) return;
      const incoming = remote[key];
      const saved = record(key);
      const local = saved.value;
      if (personalKey(key)) {
        if (local != null && local.version !== 1) { if (incoming != null) backup(key,incoming,'cloud-with-unsupported-local'); return; }
        if (incoming != null && incoming.version !== 1) { backup(key, incoming, 'unsupported-cloud-version'); return; }
        if (key.startsWith('bb.analytics.v1:attempt:') && local != null && incoming != null && personal.stable(local) !== personal.stable(incoming)) backup(key,local,'immutable-attempt-conflict');
        const merged = personal.merge(key, local, incoming);
        if (merged == null) return;
        if (local != null && incoming != null && JSON.stringify(local) !== JSON.stringify(incoming) && key.startsWith('bb.simulation.v1:')) backup(key, local, 'device-before-merge');
        const needsWrite = incoming == null || personal.stable(merged) !== personal.stable(incoming);
        putRecord(key, merged, needsWrite ? (pendingRevision(key,saved) || revision()) : null);
        return;
      }
      if (pendingRevision(key, saved)) {
        if (incoming != null && JSON.stringify(incoming) !== JSON.stringify(local)) backup(key, incoming, 'cloud-before-pending-write');
        return;
      }
      if (incoming != null) {
        if (local != null && JSON.stringify(local) !== JSON.stringify(incoming)) backup(key, local, 'local-before-cloud');
        putRecord(key, incoming, null);
      } else if (local != null) {
        putRecord(key, local, revision());
      }
    });
    mirrors();
    announce('bb:cache-change', {reason:'cloud'});
  }
  function entries(start = '') {
    return Object.entries(vault().values).filter(([key]) => key.startsWith(start));
  }
  function canClaimGuestRecords() {
    const claim = metadata('guest').claimedBy;
    return owner !== 'guest' && read(ownerKey) === owner && (!claim || claim === owner);
  }
  function claimGuestRecords(records) {
    if (!canClaimGuestRecords()) return false;
    const guest = metadata('guest'); guest.claimedBy = owner; saveMetadata(guest,'guest');
    const guestValues = vault('guest').values;
    for (const [key,value] of Object.entries(records)) {
      if (!personalKey(key) || !importableGuestRecord(key,value,guestValues)) continue;
      const existing = get(key);
      if (key.startsWith('bb.analytics.v1:attempt:') && existing != null) {
        if (personal.stable(existing) !== personal.stable(value)) backup(key,value,'guest-attempt-conflict');
        continue;
      }
      set(key,personal.merge(key,existing,value));
    }
    return true;
  }
  function acceptPersonal(key, value, pending) {
    if (read(ownerKey) !== owner || !personalKey(key)) return false;
    const saved = record(key);
    if (key.startsWith('bb.analytics.v1:attempt:') && saved.value != null && personal.stable(saved.value) !== personal.stable(value)) backup(key,saved.value,'immutable-attempt-conflict');
    const merged = personal.merge(key,saved.value,value);
    const changedDuringRequest = pending && pendingRevision(key,saved) && pendingRevision(key,saved) !== pending;
    const needsWrite = (!key.startsWith('bb.analytics.v1:attempt:') && changedDuringRequest) || personal.stable(merged) !== personal.stable(value);
    putRecord(key, merged, needsWrite ? (pendingRevision(key,saved) || revision()) : null);
    announce('bb:cache-change', {reason:'personal-cloud',key});
    return true;
  }
  function acknowledge(key, pending) {
    // Acknowledgements have a separate key: a response for revision A can never
    // rewrite/delete a newer record B produced while the request was in flight.
    if (record(key).revision === pending) write(ackName(key), pending);
  }
  window.addEventListener('storage', event => {
    if (event.key === ownerKey || event.key === null) {
      const latestOwner = read(ownerKey);
      if (latestOwner !== owner) {
        const verified = window.BBAuth?.getState().user?.id;
        owner = verified && verified === latestOwner ? verified : 'guest';
        dropOtherMemory();
        announce('bb:cache-owner-change', {owner});
        announce('bb:cache-change', {reason:'identity'});
      }
    }
    const ownRecord = event.key?.startsWith(scoped(recordPrefix, owner));
    const ownAck = event.key?.startsWith(scoped(ackPrefix, owner));
    if (event.key === prefix + owner || ownRecord || ownAck || keys.includes(event.key) || event.key === null) {
      if (read(ownerKey) !== owner) return;
      // Storage events are queued and may carry an obsolete newValue. The
      // canonical current record is always read again by consumers.
      announce('bb:cache-change', {reason:'external'});
      announce('bb:cache-write', {owner});
    }
  });
  window.BBUserStorage = {
    get, set, activate, hydrate, acknowledge, entries, canClaimGuestRecords, claimGuestRecords, acceptPersonal,
    owner: () => owner,
    snapshot: () => clone(vault()),
    canPersist: () => persistent,
    keys: () => keys.slice(),
    authStorage: {getItem:read, setItem:write, removeItem:key => write(key, null)}
  };
}());
