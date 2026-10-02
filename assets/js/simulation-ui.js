(function () {
  'use strict';
  const core = window.BBSimulationCore, store = window.BBSimulationStore;
  const html = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const number = (value, digits = 2) => Number(value).toLocaleString('ro-RO',{minimumFractionDigits:digits,maximumFractionDigits:digits});
  const duration = milliseconds => {
    const seconds = Math.max(0,Math.floor(milliseconds / 1000));
    return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2,'0');
  };
  const localLoads = new Map();
  const assetBase = document.body?.dataset.assetBase || '';
  function registerBank(bank) {
    const pending = localLoads.get(bank.storageKey);
    if (pending) pending.bank = bank;
  }
  function loadLocalBank(entry) {
    if (localLoads.has(entry.storageKey)) return localLoads.get(entry.storageKey).promise;
    const pending = {};
    localLoads.set(entry.storageKey,pending);
    pending.promise = new Promise((resolve,reject)=>{
      const script = document.createElement('script');
      const finish = error => {
        script.remove();localLoads.delete(entry.storageKey);
        if (error || !pending.bank) reject(new Error('Fișierul cu grile nu s-a putut încărca. Deschide pagina din dosarul complet al site-ului și încearcă din nou.'));
        else resolve(pending.bank);
      };
      script.src = assetBase + entry.bankUrl + '.js';
      script.onload = () => finish(false);
      script.onerror = () => finish(true);
      document.head.append(script);
    });
    return pending.promise;
  }
  async function loadBank(entry) {
    // Browsers block fetch(file:). Generated classic scripts support direct local previews.
    if (window.location.protocol === 'file:') return loadLocalBank(entry);
    let response;
    try { response = await fetch(assetBase + entry.bankUrl); } catch (_) { throw new Error('Grilele nu sunt disponibile. Verifică conexiunea și încearcă din nou.'); }
    if (!response.ok) throw new Error('Grilele nu s-au putut încărca. Încearcă din nou după reconectare.');
    return response.json();
  }
  async function start(chapterNums, minutes, allocation, owner) {
    const entries = (window.BB_QUIZ_INDEX || []).filter(item=>chapterNums.includes(item.chapterNum));
    if (entries.length !== chapterNums.length) throw new Error('Un capitol nu mai este disponibil. Alege capitolele din nou.');
    const banks = await Promise.all(entries.map(async entry=>{
      const bank = await loadBank(entry);
      if (bank.storageKey !== entry.storageKey || bank.chapterNum !== entry.chapterNum || !Array.isArray(bank.questions) || bank.questions.length !== entry.questions.length) throw new Error('Datele testului s-au actualizat. Reîncarcă pagina și încearcă din nou.');
      return bank;
    }));
    const run = core.create(banks,allocation || core.allocate(banks),minutes,Date.now(),crypto.randomUUID());
    return store.create(run,owner);
  }
  function exportRun(run) {
    if (!run) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(run,null,2)],{type:'application/json'}));
    const link = document.createElement('a'); link.href=url; link.download='simulare-biologie-'+run.id+'.json'; link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  window.BBSimulationUI = {html,number,duration,start,exportRun,registerBank};
}());
