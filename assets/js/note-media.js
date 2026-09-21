/* Private note images: durable per-owner blobs; cloud references never contain public URLs. */
(function () {
  'use strict';
  const bucket = 'note-images';
  const validId = value => /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(value || '');
  const urls = new Map();
  function owner() { const id = window.BBAuth?.getState().user?.id; return id && id === window.BBUserStorage.owner() ? id : null; }
  function ensure(id) { if (!id || owner() !== id) throw Error('Contul s-a schimbat. Redeschide notița.'); }
  async function database(id) {
    ensure(id);
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('bb.note-media.v1:' + id, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('images', {keyPath:'id'});
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(Error('Imaginile nu pot fi salvate pe acest dispozitiv. Verifică spațiul disponibil.'));
    });
  }
  async function record(id, key, value) {
    const db = await database(id);
    try {
      ensure(id);
      return await new Promise((resolve, reject) => {
        const tx = db.transaction('images', value ? 'readwrite' : 'readonly');
        const request = value ? tx.objectStore('images').put(value) : tx.objectStore('images').get(key);
        tx.oncomplete = () => resolve(request.result);
        tx.onerror = tx.onabort = () => reject(Error('Imaginea nu a putut fi salvată. Verifică spațiul disponibil.'));
      });
    } finally { db.close(); }
  }
  async function add(file, id) {
    ensure(id);
    if (!['image/png','image/jpeg','image/webp'].includes(file.type)) throw Error('Alege o imagine PNG, JPEG sau WebP.');
    if (file.size > 10 * 1024 * 1024) throw Error('Imaginea este prea mare. Alege un fișier de maximum 10 MB.');
    let bitmap;
    try { bitmap = await createImageBitmap(file); } catch (_) { throw Error('Imaginea nu poate fi deschisă. Alege un alt fișier.'); }
    const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', .86));
    if (!blob || blob.type !== 'image/webp' || blob.size > 2097152) throw Error('Imaginea este prea detaliată. Alege o versiune mai mică.');
    ensure(id); const key = crypto.randomUUID();
    await record(id, key, {id:key, blob, pending:true}); ensure(id);
    return key;
  }
  async function blobFor(key, id) {
    ensure(id); if (!validId(key)) throw Error('Invalid image');
    const local = await record(id, key); ensure(id);
    if (local) return local.blob;
    if (!navigator.onLine) throw Error('Imaginea nu a fost încă descărcată pe acest dispozitiv.');
    const {data, error} = await window.BBSupabase.get().storage.from(bucket).download(id + '/' + key + '.webp');
    ensure(id);
    if (error || !data || data.size > 2097152 || data.type !== 'image/webp') throw Error('Imaginea nu poate fi încărcată momentan.');
    await record(id, key, {id:key, blob:data, pending:false}); return data;
  }
  async function flush(body, id) {
    const keys = [...new Set([...body.matchAll(/data-bb-image="([a-f0-9-]+)"/g)].map(match => match[1]))];
    for (const key of keys) {
      ensure(id); if (!validId(key)) continue;
      const local = await record(id, key); ensure(id);
      if (!local?.pending) continue;
      const {error} = await window.BBSupabase.get().storage.from(bucket).upload(id + '/' + key + '.webp', local.blob, {upsert:true, contentType:'image/webp', cacheControl:'3600'});
      ensure(id); if (error) throw Error('Image upload failed');
      await record(id, key, {...local, pending:false});
    }
  }
  async function render(root) {
    const id = owner(); if (!id) return;
    await Promise.all([...root.querySelectorAll('figure[data-bb-image]')].map(async figure => {
      if (figure.querySelector('img') || figure.dataset.imageLoading) return;
      figure.dataset.imageLoading = 'true';
      figure.querySelectorAll('.bb-image-loading').forEach(hint => hint.remove());
      const key = figure.dataset.bbImage;
      const hint = document.createElement('span'); hint.className = 'bb-image-loading'; hint.dataset.noteControl = ''; hint.textContent = 'Se încarcă imaginea…'; figure.prepend(hint);
      try {
        const blob = await blobFor(key, id); ensure(id);
        if (!figure.isConnected) return;
        const cacheKey = id + ':' + key;
        if (!urls.has(cacheKey)) urls.set(cacheKey, URL.createObjectURL(blob));
        const img = document.createElement('img'); img.src = urls.get(cacheKey); img.alt = figure.querySelector('figcaption')?.textContent || 'Imagine atașată notiței'; img.decoding = 'async';
        figure.prepend(img); hint.remove();
      } catch (_) {
        if (owner() !== id || !figure.isConnected) return;
        hint.textContent = navigator.onLine ? 'Imagine indisponibilă momentan.' : 'Imaginea nu a fost descărcată pe acest dispozitiv.';
        const retry = document.createElement('button'); retry.type = 'button'; retry.textContent = 'Reîncearcă'; retry.dataset.noteControl = '';
        retry.addEventListener('click', () => { hint.remove(); retry.remove(); void render(root); }); hint.append(retry);
      } finally { delete figure.dataset.imageLoading; }
    }));
  }
  function clear() { urls.forEach(url => URL.revokeObjectURL(url)); urls.clear(); }
  document.addEventListener('bb:cache-owner-change', clear);
  document.addEventListener('bb:auth-change', () => { if (!owner()) clear(); });
  window.BBNoteMedia = {add, render, flush, validId};
}());
