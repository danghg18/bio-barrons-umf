/* Pure convergence rules for owner-scoped personal records. No network or storage. */
(function () {
  'use strict';
  const prefixes = ['bb.highlight.v1:', 'bb.highlight-clear.v1:', 'bb.analytics.v1:', 'bb.analytics-clear.v1:', 'bb.simulation.v1:'];
  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const isKey = key => prefixes.some(prefix => key.startsWith(prefix));
  function stable(value) {
    if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
    if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + stable(value[key])).join(',') + '}';
    return JSON.stringify(value);
  }
  function unique(values) { return [...new Map(values.map(value => [stable(value), value])).entries()].sort(([a],[b]) => a.localeCompare(b)).map(([,value]) => clone(value)); }
  const choose = (a, b) => stable(a) <= stable(b) ? a : b;
  function mergeSimulation(a, b) {
    // Snapshots and deadlines belong to the original run, never to a device clock.
    const base = clone(choose(a, b));
    let conflicts = unique([...(a.syncConflicts || []), ...(b.syncConflicts || [])]);
    const submitted = [a,b].filter(run => run.status === 'completed');
    if (submitted.length) {
      // The acknowledged cloud submission is authoritative. Preserve all
      // competing answers/results for export; never recompute a past grade.
      const winner = clone(b.status === 'completed' ? b : a);
      for (const run of [a,b]) if (stable(run.answers) !== stable(winner.answers) || (run.result && stable(run.result) !== stable(winner.result))) {
        conflicts.push({type:run.status === 'completed' ? 'submission' : 'late-answers', answers:run.answers, result:run.result || null, completedAt:run.completedAt || null});
      }
      winner.syncConflicts = unique(conflicts);
      return winner;
    }
    const edits = {}, answers = [];
    for (let i = 0; i < base.answers.length; i++) {
      const legacy = run => ({id:'legacy:' + stable(run.answers[i]), counter:0, selected:run.answers[i]});
      const x = a.answerEdits?.[i] || legacy(a), y = b.answerEdits?.[i] || legacy(b);
      const winner = x.counter === y.counter ? (x.id >= y.id ? x : y) : (x.counter > y.counter ? x : y);
      edits[i] = clone(winner); answers[i] = clone(winner.selected);
      if (x.id !== y.id && !(x.seen || []).includes(y.id) && !(y.seen || []).includes(x.id) && (x.counter || x.selected?.length) && (y.counter || y.selected?.length) && stable(x.selected) !== stable(y.selected)) conflicts.push({type:'answer', index:i, variants:unique([x,y])});
    }
    base.answers = answers; base.answerEdits = edits;
    base.revision = Math.max(a.revision || 0,b.revision || 0);
    base.syncConflicts = unique(conflicts);
    return base;
  }
  function merge(key, local, remote) {
    if (local == null) return clone(remote);
    if (remote == null) return clone(local);
    if (stable(local) === stable(remote)) return clone(local);
    if (local.deleted || remote.deleted) return clone(local.deleted && remote.deleted ? choose(local,remote) : local.deleted ? local : remote);
    if (key.startsWith('bb.analytics.v1:') && window.BBAnalyticsSync) return window.BBAnalyticsSync.merge(key,local,remote);
    if (key.startsWith('bb.simulation.v1:') && local.version === 1 && remote.version === 1 && Array.isArray(local.answers) && Array.isArray(remote.answers)) return mergeSimulation(local,remote);
    return clone(choose(local,remote));
  }
  window.BBPersonalRecords = {isKey, merge, stable};
}());
