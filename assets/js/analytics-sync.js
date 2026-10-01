/* Pure merges for real quiz-history rows. No synthetic attempts or dates. */
(function () {
  'use strict';
  var clone = function (value) { return value == null ? value : JSON.parse(JSON.stringify(value)); };
  function stable(value) {
    if (!value || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
    return '{' + Object.keys(value).sort().map(function (key) { return JSON.stringify(key) + ':' + stable(value[key]); }).join(',') + '}';
  }
  function union(a, b) { return Array.from(new Set((a || []).concat(b || []))).sort(); }
  function first(a, b) { return [a, b].filter(Boolean).sort()[0] || null; }
  function last(a, b) { return [a, b].filter(Boolean).sort().pop() || null; }
  function winner(a, b) {
    var order = (a.syncUpdatedAt || '').localeCompare(b.syncUpdatedAt || '');
    return order ? (order > 0 ? a : b) : stable(a) > stable(b) ? a : b;
  }
  function merge(key, local, remote) {
    if (!local || !remote) return clone(local || remote);
    if (local.deleted || remote.deleted) return clone(local.deleted ? local : remote);
    var a = clone(local), b = clone(remote), result = clone(winner(a, b));
    if (key.indexOf('bb.analytics.v1:attempt:') === 0) {
      // A stable ID identifies one immutable verification, including its original key.
      return clone(b); // Vault/cloud original is authoritative; storage retains divergent local backups.
    }
    if (key.indexOf('bb.analytics.v1:metadata:') === 0) {
      var ac = a.clearIds || [], bc = b.clearIds || [];
      if (ac.some(function (id) { return !bc.includes(id); }) || bc.some(function (id) { return !ac.includes(id); })) {
        result = clone(ac.length > bc.length ? a : bc.length > ac.length ? b : winner(a, b));
        result.clearIds = union(ac, bc);
        return result;
      }
      result.first = {};
      union(Object.keys(a.first || {}), Object.keys(b.first || {})).forEach(function (id) { result.first[id] = first((a.first || {})[id], (b.first || {})[id]); });
      result.unknown = union(a.unknown, b.unknown);
      result.since = first(a.since, b.since);
      result.nextRunNumber = Math.max(a.nextRunNumber || 1, b.nextRunNumber || 1);
      if (a.clearedAt !== b.clearedAt && (a.clearedAt || b.clearedAt)) result.first = clone((a.clearedAt || '') > (b.clearedAt || '') ? a.first : b.first) || {};
      return result;
    }
    if (key.indexOf('bb.analytics.v1:run:') !== 0) return result;
    result.clearIds = union(a.clearIds, b.clearIds);
    result.answers = {};
    result.answerConflicts = {};
    union(Object.keys(a.answers || {}), Object.keys(b.answers || {})).forEach(function (id) {
      var candidates = [a.answers && a.answers[id], b.answers && b.answers[id]]
        .concat((a.answerConflicts || {})[id] || [], (b.answerConflicts || {})[id] || []).filter(Boolean);
      var unique = Array.from(new Map(candidates.map(function (answer) { return [stable(answer), answer]; })).values());
      unique.sort(function (x, y) {
        return Number(!!y.verified) - Number(!!x.verified) || (x.at || '').localeCompare(y.at || '') || stable(x).localeCompare(stable(y));
      });
      result.answers[id] = unique[0];
      if (unique.filter(function (answer) { return answer.verified; }).length > 1) result.answerConflicts[id] = unique;
    });
    if (!Object.keys(result.answerConflicts).length) delete result.answerConflicts;
    result.startedAt = a.startedAt === null || b.startedAt === null ? null : first(a.startedAt, b.startedAt);
    result.lastAt = last(a.lastAt, b.lastAt);
    result.closedAt = first(a.closedAt, b.closedAt);
    result.completedAt = first(a.completedAt, b.completedAt);
    var ids = result.questionIds || [];
    if (ids.length && ids.every(function (id) { return result.answers[id] && result.answers[id].verified; })) {
      result.status = 'completed';
      result.completedAt = result.completedAt || ids.map(function (id) { return result.answers[id].at; }).filter(Boolean).sort().pop() || null;
    } else if (result.closedAt) result.status = 'stopped';
    return result;
  }
  window.BBAnalyticsSync = {merge:merge, stable:stable};
}());
