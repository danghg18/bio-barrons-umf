/* Identity-scoped simulation records synchronized through the durable personal outbox. Web Locks serialize read/check/write
 * across tabs; revisions reject stale editors and completed results are immutable. */
(function () {
  'use strict';
  const storage = window.BBUserStorage, core = window.BBSimulationCore;
  const prefix = 'bb.simulation.v1:';
  function valid(run) {
    return run && !run.deleted && run.version === 1 && run.scoringVersion === core.SCORING && typeof run.id === 'string' &&
      ['active','completed'].includes(run.status) && Array.isArray(run.questions) && run.questions.length === core.COUNT &&
      Array.isArray(run.answers) && run.answers.length === core.COUNT;
  }
  function get(id) {
    const run = storage.get(prefix + id);
    return valid(run) && run.owner === storage.owner() ? run : null;
  }
  function list() {
    return Object.entries(storage.snapshot().values).filter(([key,run]) => key.startsWith(prefix) && valid(run) && run.owner === storage.owner())
      .map(([,run])=>run).sort((a,b)=>b.startedAt-a.startedAt || a.id.localeCompare(b.id));
  }
  function lock(id, owner, operation) {
    if (!navigator.locks) return Promise.reject(new Error('Browserul nu permite salvarea sigură între file. Deschide testul într-un browser actualizat.'));
    return navigator.locks.request(prefix + owner + ':' + id, () => {
      if (owner !== storage.owner()) throw new Error('S-a schimbat contul. Deschide din nou simularea.');
      return operation();
    });
  }
  function save(run) {
    if (!storage.set(prefix + run.id,run)) throw new Error('S-a schimbat contul. Deschide din nou simularea.');
    document.dispatchEvent(new CustomEvent('bb:simulation-change',{detail:{id:run.id}}));
    return run;
  }
  function create(run, owner) {
    return lock(run.id,owner,()=>{
      if (!valid(run) || storage.get(prefix + run.id)) throw new Error('Simularea nu a putut fi creată. Încearcă din nou.');
      return save({...run,owner,revision:1});
    });
  }
  function update(id, revision, owner, operation) {
    return lock(id,owner,()=>{
      const run = get(id);
      if (!run) throw new Error('Simularea nu este disponibilă în acest cont.');
      if (run.status === 'completed') throw new Error('Testul a fost deja predat.');
      if (run.revision !== revision) throw new Error('Testul s-a schimbat în altă filă. Am încărcat răspunsurile salvate; repetă ultima modificare.');
      const now = Date.now(), expired = run.deadline !== null && now >= run.deadline;
      if (operation.type === 'finish' || expired) {
        run.completedAt = expired ? run.deadline : now;
        run.status = 'completed'; run.result = core.result(run);
        run.submissionId = crypto.randomUUID();
      } else if (operation.type === 'answer') {
        if (!Number.isInteger(operation.index) || operation.index < 0 || operation.index >= core.COUNT) throw new Error('Întrebarea nu este validă.');
        run.answers[operation.index] = core.normalize(operation.selected);
        run.answerEdits ||= {};
        const previous = run.answerEdits[operation.index];
        run.answerEdits[operation.index] = {id:crypto.randomUUID(), counter:(previous?.counter || 0)+1, selected:run.answers[operation.index], seen:[...new Set([...(previous?.seen || []), ...(previous ? [previous.id] : [])])]};
      } else throw new Error('Acțiunea nu este validă.');
      run.revision++;
      return save(run);
    });
  }
  function remove(id, owner) {
    return lock(id,owner,() => {
      const run = get(id);
      if (!run) return;
      save({version:1,id,owner,deleted:true});
    });
  }
  window.BBSimulationStore = {get,list,create,update,remove};
}());
