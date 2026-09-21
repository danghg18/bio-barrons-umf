/* Local quiz history. Saved quiz answers remain owned by quiz-player.js. */
(function () {
  'use strict';
  if (window.BBQuizAnalytics) return;

  function createAnalytics(scope) {

  var index = (window.BB_QUIZ_INDEX || []).filter(function (quiz) {
    return quiz && Number.isFinite(quiz.chapterNum) && typeof quiz.storageKey === 'string' &&
      typeof quiz.url === 'string' && Array.isArray(quiz.questions) && Array.isArray(quiz.ranges) &&
      quiz.questions.every(function (question) {
        return typeof question.id === 'string' && Number.isFinite(question.number) && quiz.ranges.some(function (range) {
          return range.id === question.rangeId && question.number >= range.start && question.number <= range.end;
        });
      }) && new Set(quiz.questions.map(function (question) { return question.id; })).size === quiz.questions.length;
  });
  var byKey = new Map(index.map(function (quiz) { return [quiz.storageKey, quiz]; }));
  var disposed = false;
  var database = null;
  var hadPersistentDatabase = false;
  var canPersist = true;
  var snapshot = { attempts: [], metadata: [], runs: [] };
  var listeners = new Set();
  var serial = Promise.resolve();
  var channel = null;
  var notificationKey = 'bb.quiz.analytics.changed.v1';

  function current(quiz) {
    if (disposed) return {};
    try {
      var saved = window.BBUserStorage ? window.BBUserStorage.get(quiz.storageKey) : JSON.parse(window.localStorage.getItem(quiz.storageKey) || 'null');
      if (!saved || saved.version !== quiz.version || !saved.questions || typeof saved.questions !== 'object') return {};
      return saved.questions;
    } catch (_) {
      // Malformed saved JSON is recoverable; denied storage is reported separately.
      try { window.localStorage.getItem(quiz.storageKey); } catch (_) { canPersist = false; }
      return {};
    }
  }

  function currentCorrect(question, state) {
    // Older indexes omit keys. New generated indexes allow a direct analytics
    // visit to reflect corrected keys without rewriting answers or attempts.
    if (!Array.isArray(question.correct) || !question.correct.length) return !!state.correct;
    var selected = Array.from(new Set((Array.isArray(state.selected) ? state.selected : []).filter(function (letter) {
      return /^[A-E]$/.test(letter);
    }))).sort();
    return selected.join('') === question.correct.join('');
  }

  function baseline(quiz) {
    var saved = current(quiz);
    return { key: quiz.storageKey, since: new Date().toISOString(), first: {}, unknown: quiz.questions.filter(function (question) {
      return saved[question.id] && saved[question.id].verified;
    }).map(function (question) { return question.id; }) };
  }

  function newAttemptId() {
    try { return window.crypto.randomUUID(); } catch (_) {
      return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2) + '-' + Math.random().toString(36).slice(2);
    }
  }

  function notify(broadcast) {
    listeners.forEach(function (callback) { try { callback(); } catch (_) {} });
    if (!broadcast) return;
    if (channel) { try { channel.postMessage('changed'); } catch (_) {} }
    else { try { window.localStorage.setItem(notificationKey, newAttemptId()); } catch (_) {} }
  }

  try {
    channel = new window.BroadcastChannel('bb.quiz.analytics.v1' + scope);
    channel.onmessage = function () { notify(false); };
  } catch (_) {}
  function storageChanged(event) {
    if (event.key === notificationKey || event.key === null || byKey.has(event.key)) notify(false);
  }
  window.addEventListener('storage', storageChanged);

  function openDatabase() {
    return new Promise(function (resolve, reject) {
      var request;
      try { request = window.indexedDB.open('bb.quiz.analytics.v1' + scope, 2); }
      catch (error) { reject(error); return; }
      request.onupgradeneeded = function () {
        var db = request.result;
        if (!db.objectStoreNames.contains('attempts')) db.createObjectStore('attempts', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('metadata')) db.createObjectStore('metadata', { keyPath: 'key' });
        if (!db.objectStoreNames.contains('runs')) db.createObjectStore('runs', { keyPath: 'id' });
      };
      request.onerror = function () { reject(request.error); };
      request.onblocked = function () { reject(new Error('Quiz history database is blocked')); };
      request.onsuccess = function () { resolve(request.result); };
    });
  }

  // Both stores are read in one transaction, so a report never mixes clear/write states.
  // Mutations run inside the readwrite transaction, including ID deduplication.
  function transaction(mode, mutate, connection) {
    return new Promise(function (resolve, reject) {
      var tx;
      try { tx = (connection || database).transaction(['attempts', 'metadata', 'runs'], mode); }
      catch (error) { reject(error); return; }
      var attemptsStore = tx.objectStore('attempts');
      var metadataStore = tx.objectStore('metadata');
      var result = { attempts: [], metadata: [], runs: [] };
      var runsStore = tx.objectStore('runs');
      var pending = 3;
      var value;
      function loaded() {
        pending -= 1;
        if (!pending && mutate) {
          try {
            if (disposed) throw new Error('Identity changed');
            value = mutate(result, attemptsStore, metadataStore, runsStore);
          }
          catch (error) {
            // A lifecycle guard is not a quota/IndexedDB failure. Preserve the
            // connection and durability guarantees when the transaction refuses it.
            error.analyticsMutationRejected = true;
            tx.abort(); reject(error);
          }
        }
      }
      var attemptsRequest = attemptsStore.getAll();
      var metadataRequest = metadataStore.getAll();
      var runsRequest = runsStore.getAll();
      runsRequest.onsuccess = function () { result.runs = runsRequest.result; loaded(); };
      attemptsRequest.onsuccess = function () { result.attempts = attemptsRequest.result; loaded(); };
      metadataRequest.onsuccess = function () { result.metadata = metadataRequest.result; loaded(); };
      tx.oncomplete = function () { resolve({ snapshot: result, value: value }); };
      tx.onabort = tx.onerror = function () { reject(tx.error || new Error('Quiz history transaction failed')); };
    });
  }

  async function access(mutate) {
    if (disposed) throw new Error('Identity changed');
    if (database) {
      try {
        var result = await transaction(mutate ? 'readwrite' : 'readonly', mutate);
        snapshot = result.snapshot;
        return result.value;
      } catch (error) {
        if (error.analyticsMutationRejected) throw error;
        canPersist = false;
        // A quota failure can leave existing history readable. Retain it in memory.
        try { snapshot = (await transaction('readonly')).snapshot; } catch (_) {}
        try { database.close(); } catch (_) {}
        database = null;
      }
    }
    if (disposed) throw new Error('Identity changed');
    return mutate ? mutate(snapshot, null, null, null) : undefined;
  }

  function enqueue(operation) {
    var next = serial.then(function () { if (disposed) throw new Error('Identity changed'); return operation(); });
    serial = next.catch(function () {});
    return next;
  }

  var ready = (async function () {
    try {
      database = await openDatabase();
      hadPersistentDatabase = true;
      database.onversionchange = function () {
        database.close(); database = null; canPersist = false; notify(false);
      };
    } catch (_) { canPersist = false; }
    if (disposed) { if (database) database.close(); database = null; return; }
    await access(function (state, attemptsStore, metadataStore, runsStore) {
      index.forEach(function (quiz) {
        var item = state.metadata.find(function (meta) { return meta.key === quiz.storageKey; });
        if (!item) { item = baseline(quiz); state.metadata.push(item); }
        // Number known old traversals once, before any date filtering. Undated
        // preexisting runs retain an unknown number rather than an invented order.
        var old = state.runs.filter(function (run) { return run.storageKey === quiz.storageKey && run.mode !== 'mistakes'; });
        var next = Math.max(Number.isInteger(item.nextRunNumber) ? item.nextRunNumber : 1,
          old.reduce(function (max, run) { return Number.isInteger(run.number) ? Math.max(max, run.number + 1) : max; }, 1));
        old.filter(function (run) { return !Number.isInteger(run.number) && run.startedAt && Number.isFinite(new Date(run.startedAt).getTime()); })
          .sort(function (a, b) { return a.startedAt.localeCompare(b.startedAt) || a.id.localeCompare(b.id); })
          .forEach(function (run) { run.number = next++; if (runsStore) runsStore.put(run); });
        item.nextRunNumber = next;
        if (metadataStore) metadataStore.put(item);
      });
    }).catch(function (error) { if (!disposed) throw error; });
  }());

  function copy(value) { return JSON.parse(JSON.stringify(value)); }

  function cleanAnswers(quiz, answers) {
    var result = {};
    quiz.questions.forEach(function (question) {
      var saved = answers && answers[question.id];
      if (!saved || (!saved.verified && !(saved.selected || []).length)) return;
      result[question.id] = {selected:Array.from(new Set((saved.selected || []).filter(function (v) { return /^[A-E]$/.test(v); }))).sort(),
        verified:!!saved.verified,correct:!!saved.verified && currentCorrect(question, saved),at:null,imported:true};
    });
    return result;
  }

  function makeRun(quiz, answers) {
    var initial = cleanAnswers(quiz, answers);
    return {id:newAttemptId(),storageKey:quiz.storageKey,startedAt:Object.values(initial).some(function (answer) { return answer.verified; }) ? null : new Date().toISOString(),
      lastAt:null,completedAt:null,closedAt:null,status:'active',answers:initial};
  }

  function initialComplete(quiz, run) {
    return !!run && quiz.questions.every(function (q) { return run.answers[q.id] && run.answers[q.id].verified; });
  }

  function makeFullRun(quiz, answers, meta, state) {
    var run = makeRun(quiz, answers);
    run.number = Math.max(Number.isInteger(meta.nextRunNumber) ? meta.nextRunNumber : 1,
      state.runs.reduce(function (next, item) { return item.storageKey === quiz.storageKey && item.mode !== 'mistakes' && Number.isInteger(item.number) ? Math.max(next, item.number + 1) : next; }, 1));
    meta.nextRunNumber = run.number + 1;
    if (initialComplete(quiz, run)) run.status = 'completed';
    return run;
  }

  function isCurrentRun(run, meta) {
    return !!run && !!meta && meta.activeRunId === run.id && run.mode !== 'mistakes' && !run.closedAt && !meta.pendingReset;
  }

  function importSavedAnswers(quiz, run) {
    if (run.closedAt || initialComplete(quiz, run)) return false;
    var saved = cleanAnswers(quiz, current(quiz));
    var changed = false;
    quiz.questions.forEach(function (q) {
      if (!saved[q.id] || !saved[q.id].verified || (run.answers[q.id] && run.answers[q.id].verified)) return;
      run.answers[q.id] = saved[q.id]; changed = true;
    });
    if (changed) {
      if (!run.lastAt) run.startedAt = null;
      if (initialComplete(quiz, run)) run.status = 'completed';
    }
    return changed;
  }

  function correctionState(quiz, source, state) {
    var wrongIds = quiz.questions.filter(function (q) { return source.answers[q.id] && source.answers[q.id].verified && !source.answers[q.id].correct; }).map(function (q) { return q.id; });
    var rounds = state.runs.filter(function (run) { return run.storageKey === quiz.storageKey && run.mode === 'mistakes' && run.sourceRunId === source.id; })
      .sort(function (a, b) { return (a.roundNumber || 0) - (b.roundNumber || 0) || (a.startedAt || '').localeCompare(b.startedAt || '') || a.id.localeCompare(b.id); });
    var latest = new Map();
    rounds.forEach(function (run) { wrongIds.forEach(function (id) {
      if (run.answers[id] && run.answers[id].verified) latest.set(id, run.answers[id].correct);
    }); });
    return { rounds: rounds, wrongIds: wrongIds,
      correctedIds: wrongIds.filter(function (id) { return latest.get(id) === true; }),
      remainingIds: wrongIds.filter(function (id) { return latest.get(id) !== true; }) };
  }

  function ensureRun(storageKey) {
    return enqueue(async function () {
      await ready;
      var quiz = byKey.get(storageKey);
      if (!quiz) throw new Error('Unknown quiz');
      var changed = false;
      var result = await access(function (state, attemptsStore, metadataStore, runsStore) {
        var meta = state.metadata.find(function (item) { return item.key === storageKey; });
        if (meta.pendingReset) throw new Error('Restart requires recovery');
        var run = state.runs.find(function (item) { return item.id === meta.activeRunId; });
        if (!run) {
          run = makeFullRun(quiz, current(quiz), meta, state);
          state.runs.push(run); meta.activeRunId = run.id;
          if (runsStore) runsStore.put(run);
          if (metadataStore) metadataStore.put(meta);
          changed = true;
        } else if (importSavedAnswers(quiz, run)) {
          if (runsStore) runsStore.put(run);
          changed = true;
        }
        return copy(run);
      });
      if (changed) notify(true);
      return result;
    });
  }

  function ensurePractice(storageKey, restart, sourceRunId) {
    return enqueue(async function () {
      await ready;
      var quiz = byKey.get(storageKey);
      if (!quiz) throw new Error('Unknown quiz');
      var result = await access(function (state, attemptsStore, metadataStore, runsStore) {
        var meta = state.metadata.find(function (item) { return item.key === storageKey; });
        if (meta.pendingReset) return null;
        var source = state.runs.find(function (item) { return item.id === meta.activeRunId && item.storageKey === storageKey && item.mode !== 'mistakes'; });
        // A bare practice URL can recover an entirely verified saved chapter.
        // An explicit missing/archived source must never create a substitute.
        if (sourceRunId && (!source || source.id !== sourceRunId)) return null;
        if (!source) {
          var answers = cleanAnswers(quiz, current(quiz));
          if (!initialComplete(quiz, { answers: answers })) return null;
          source = makeFullRun(quiz, answers, meta, state);
          state.runs.push(source); meta.activeRunId = source.id;
          if (runsStore) runsStore.put(source);
          if (metadataStore) metadataStore.put(meta);
        }
        if (!isCurrentRun(source, meta)) return null;
        if (importSavedAnswers(quiz, source) && runsStore) runsStore.put(source);
        if (!initialComplete(quiz, source)) return null;
        var run = state.runs.find(function (item) { return item.id === meta.practiceRunId; });
        if (run && (run.sourceRunId !== source.id || run.storageKey !== storageKey || run.closedAt)) run = null;
        // Never discard an unfinished round. The final completed round also
        // remains resumable, including after all original errors are corrected.
        if (run && (!restart || run.status !== 'completed')) return copy(run);
        var progress = correctionState(quiz, source, state);
        if (!progress.remainingIds.length) return null;
        if (run) {
          run.closedAt = new Date().toISOString();
          if (runsStore) runsStore.put(run);
        }
        run = makeRun(quiz, {});
        run.mode = 'mistakes'; run.sourceRunId = source.id;
        run.questionIds = progress.remainingIds;
        run.roundNumber = progress.rounds.reduce(function (max, item) { return Math.max(max, item.roundNumber || 0); }, 0) + 1;
        state.runs.push(run); meta.practiceRunId = run.id;
        if (runsStore) runsStore.put(run);
        if (metadataStore) metadataStore.put(meta);
        return run ? copy(run) : null;
      });
      notify(true);
      return result;
    });
  }

  // Restart must durably archive before the player clears its separate answer cache.
  // Its ticket survives a crash between those operations and is completed on reload.
  async function durable(mutate) {
    if (database) {
      try { var result = await transaction('readwrite', mutate); snapshot = result.snapshot; return result.value; }
      catch (error) { if (!error.analyticsMutationRejected) { canPersist = false; notify(false); } throw error; }
    }
    if (hadPersistentDatabase || !canPersist) throw new Error('Parcurgerea nu poate fi salvată. Răspunsurile sunt păstrate.');
    return access(mutate);
  }

  function prepareRestart(input) {
    return enqueue(async function () {
      await ready;
      var quiz = byKey.get(input.storageKey);
      if (!quiz || !input.resetId) throw new Error('Invalid restart');
      var ticket = await durable(function (state, attemptsStore, metadataStore, runsStore) {
        var meta = state.metadata.find(function (item) { return item.key === quiz.storageKey; });
        if (meta.pendingReset) return copy(meta.pendingReset);
        var run = state.runs.find(function (item) { return item.id === meta.activeRunId; });
        if (input.runId && (!run || input.runId !== run.id)) return null;
        var answers = cleanAnswers(quiz, input.answers || current(quiz));
        if (!run && !Object.keys(answers).length) return null;
        if (!run) { run = makeFullRun(quiz, answers, meta, state); state.runs.push(run); }
        Object.keys(answers).forEach(function (id) { if (!run.answers[id] || !run.answers[id].verified) run.answers[id] = answers[id]; });
        if (!Object.keys(run.answers).length) return null;
        run.closedAt = new Date().toISOString();
        var completed = quiz.questions.every(function (q) { return run.answers[q.id] && run.answers[q.id].verified; });
        run.status = completed ? 'completed' : 'stopped';
        if (completed && !run.completedAt) run.completedAt = run.closedAt;
        // Parent and child close together, before the separate answer cache is
        // cleared. Other tabs cannot commit another correction after this point.
        state.runs.forEach(function (child) {
          if (child.mode !== 'mistakes' || child.sourceRunId !== run.id || child.storageKey !== quiz.storageKey || child.closedAt) return;
          child.closedAt = run.closedAt;
          if (child.status === 'active') child.status = 'stopped';
          if (runsStore) runsStore.put(child);
          if (meta.practiceRunId === child.id) delete meta.practiceRunId;
        });
        meta.activeRunId = run.id;
        meta.pendingReset = {id:input.resetId,runId:run.id};
        if (runsStore) runsStore.put(run);
        if (metadataStore) metadataStore.put(meta);
        return copy(meta.pendingReset);
      });
      if (ticket) notify(true);
      return ticket;
    });
  }

  function pendingRestart(storageKey) {
    return enqueue(async function () { await ready; await access(); var meta = snapshot.metadata.find(function (item) { return item.key === storageKey; }); return meta && meta.pendingReset ? copy(meta.pendingReset) : null; });
  }

  function finishRestart(input) {
    return enqueue(async function () {
      await ready;
      var done = await durable(function (state, attemptsStore, metadataStore) {
        var meta = state.metadata.find(function (item) { return item.key === input.storageKey; });
        if (!meta || !meta.pendingReset || meta.pendingReset.id !== input.resetId) return false;
        delete meta.pendingReset; delete meta.activeRunId;
        if (metadataStore) metadataStore.put(meta);
        return true;
      });
      if (done) notify(true);
      return done;
    });
  }

  function recordAttempt(input) {
    return enqueue(async function () {
      await ready;
      var quiz = input && byKey.get(input.storageKey);
      if (!quiz || !quiz.questions.some(function (q) { return q.id === input.questionId; }) ||
        typeof input.correct !== 'boolean' || typeof input.attemptId !== 'string' || !input.attemptId ||
        !Array.isArray(input.selected) || !input.selected.every(function (letter) { return /^[A-E]$/.test(letter); })) return false;
      var event = {id:input.attemptId,storageKey:input.storageKey,questionId:input.questionId,correct:input.correct,
        selected:Array.from(new Set(input.selected)).sort(),at:new Date().toISOString()};
      if (Array.isArray(input.answerKey)) event.answerKey = input.answerKey.slice().sort();
      if (input.runId) event.runId = input.runId;
      var added = await access(function (state, attemptsStore, metadataStore, runsStore) {
        if (state.attempts.some(function (existing) { return existing.id === event.id; })) return false;
        if (event.runId) {
          var run = state.runs.find(function (item) { return item.id === event.runId && item.storageKey === quiz.storageKey; });
          var runMeta = state.metadata.find(function (item) { return item.key === quiz.storageKey; });
          if (!run || runMeta.pendingReset ||
            (run.mode === 'mistakes' ? runMeta.practiceRunId : runMeta.activeRunId) !== run.id || run.closedAt ||
            (run.mode === 'mistakes' && !run.questionIds.includes(event.questionId)) ||
            (run.answers[event.questionId] && run.answers[event.questionId].verified)) return false;
          if (run.mode === 'mistakes') {
            var source = state.runs.find(function (item) { return item.id === run.sourceRunId && item.storageKey === quiz.storageKey; });
            if (!isCurrentRun(source, runMeta) || !initialComplete(quiz, source) ||
              !source.answers[event.questionId] || source.answers[event.questionId].correct) return false;
          }
          run.answers[event.questionId] = {selected:event.selected.slice(),verified:true,correct:event.correct,at:event.at,eventId:event.id,answerKey:event.answerKey};
          run.lastAt = event.at;
          if ((run.questionIds || quiz.questions.map(function (q) { return q.id; })).every(function (id) { return run.answers[id] && run.answers[id].verified; })) {
            run.status = 'completed'; run.completedAt = event.at;
          }
          if (runsStore) runsStore.put(run);
        }
        state.attempts.push(event);
        var meta = state.metadata.find(function (item) { return item.key === event.storageKey; });
        if (meta && !(meta.unknown || []).includes(event.questionId)) {
          if (!meta.first) meta.first = {};
          if (!Object.prototype.hasOwnProperty.call(meta.first, event.questionId)) {
            meta.first[event.questionId] = event.id;
            if (metadataStore) metadataStore.put(meta);
          }
        }
        if (attemptsStore) attemptsStore.add(event);
        return true;
      });
      if (added) notify(true);
      return added;
    });
  }

  function dateKey(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }
  function accuracy(correct, attempts) { return attempts ? correct / attempts * 100 : null; }
  function emptyStats(total) {
    return {current:{verified:0,correct:0,total:total},attempts:0,distinct:0,correct:0,firstAttempts:0,firstCorrect:0,accuracy:null,firstAccuracy:null};
  }
  function finishStats(stats) {
    stats.accuracy = accuracy(stats.correct, stats.attempts);
    stats.firstAccuracy = accuracy(stats.firstCorrect, stats.firstAttempts);
    return stats;
  }
  function pair(event) { return event.storageKey + '\u0000' + event.questionId; }

  // Answer caches can arrive from another origin/device without dated history.
  // Project that evidence into reports; never create synthetic attempts or dates.
  function savedResults(quizzes, allEvents, runs) {
    var savedRuns = runs || snapshot.runs;
    var practiceRuns = new Set(savedRuns.filter(function (run) { return run.mode === 'mistakes'; }).map(function (run) { return run.id; }));
    // A practice verification cannot be the source of a saved full-quiz answer:
    // practice deliberately never writes the full-quiz answer cache.
    var fullEvents = allEvents.filter(function (event) { return !practiceRuns.has(event.runId); });
    var known = new Set(fullEvents.map(pair));
    var saved = new Map();
    function include(quiz, answers, run) {
      quiz.questions.forEach(function (question) {
        var answer = answers && answers[question.id];
        var key = quiz.storageKey + '\u0000' + question.id;
        if (!answer || !answer.verified) return;
        if (run && (!answer.imported || answer.at)) return;
        // A closed snapshot is evidence of an earlier result even if this
        // question is verified again in a later traversal. Older dated events
        // may already describe that same saved answer and must not be counted twice.
        if (known.has(key) && (!run || !run.closedAt || fullEvents.some(function (event) {
          return pair(event) === key && (event.at < run.closedAt ||
            (event.at === run.closedAt && (!event.runId || event.runId === run.id)));
        }))) return;
        saved.set(key, {storageKey:quiz.storageKey,questionId:question.id,at:null,
          correct:run ? !!answer.correct : currentCorrect(question, answer),
          selected:Array.from(new Set((Array.isArray(answer.selected) ? answer.selected : []).filter(function (v) { return /^[A-E]$/.test(v); }))).sort(),
          chapterNum:quiz.chapterNum,chapterName:quiz.name,quizUrl:quiz.url,number:question.number});
      });
    }
    quizzes.forEach(function (quiz) {
      savedRuns.filter(function (run) { return run.storageKey === quiz.storageKey && run.mode !== 'mistakes'; })
        .forEach(function (run) { include(quiz, run.answers, run); });
      include(quiz, current(quiz), null);
    });
    return Array.from(saved.values());
  }
  function resultSummary(events) {
    var correct = events.filter(function (event) { return event.correct; }).length;
    return {solved:events.length,correct:correct,distinct:new Set(events.map(pair)).size,
      accuracy:accuracy(correct,events.length),undated:events.filter(function (event) { return !event.at; }).length};
  }

  function getReport(options) {
    return enqueue(async function () {
      await ready;
      await access();
      options = options || {};
      var now = options.now ? new Date(options.now) : new Date();
      if (!Number.isFinite(now.getTime())) now = new Date();
      var days = options.days === 7 || options.days === 'all' ? options.days : 30;
      var quizzes = index.filter(function (quiz) { return options.chapterNum == null || quiz.chapterNum === Number(options.chapterNum); });
      var keys = new Set(quizzes.map(function (quiz) { return quiz.storageKey; }));
      var metadata = snapshot.metadata.filter(function (meta) { return keys.has(meta.key); });
      var since = metadata.map(function (meta) { return meta.since; }).sort()[0] || now.toISOString();
      var start = new Date(now); start.setHours(0, 0, 0, 0);
      if (days !== 'all') start.setDate(start.getDate() - days + 1);
      else { start = new Date(Math.min(new Date(since).getTime(), now.getTime())); start.setHours(0, 0, 0, 0); }
      var end = new Date(now); end.setHours(23, 59, 59, 999);
      var allEvents = snapshot.attempts.filter(function (event) {
        var quiz = byKey.get(event.storageKey);
        return keys.has(event.storageKey) && quiz && quiz.questions.some(function (q) { return q.id === event.questionId; }) &&
          typeof event.correct === 'boolean' && Number.isFinite(new Date(event.at).getTime());
      }).sort(function (a, b) { return a.at.localeCompare(b.at) || a.id.localeCompare(b.id); });
      var first = new Map();
      var unknown = new Set();
      metadata.forEach(function (meta) {
        (meta.unknown || []).forEach(function (id) { unknown.add(meta.key + '\u0000' + id); });
        Object.keys(meta.first || {}).forEach(function (id) { first.set(meta.key + '\u0000' + id, meta.first[id]); });
      });
      allEvents.forEach(function (event) {
        if (!unknown.has(pair(event)) && !first.has(pair(event))) first.set(pair(event), event.id);
        if (days === 'all' && new Date(event.at) < start) { start = new Date(event.at); start.setHours(0, 0, 0, 0); }
      });
      var events = allEvents.filter(function (event) { var time = new Date(event.at); return time >= start && time <= end; });
      var recovered = savedResults(quizzes, allEvents);
      var results = days === 'all' ? recovered.concat(events) : events;
      var daily = [];
      for (var date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) daily.push({date:dateKey(date),attempts:0,correct:0,accuracy:null});
      var buckets = new Map(daily.map(function (day) { return [day.date, day]; }));
      var totals = emptyStats(0);
      var quizStats = new Map();
      var resultQuizzes = quizzes.map(function (quiz) {
        var stats = Object.assign({}, quiz, emptyStats(quiz.questions.length));
        stats.current.wrongIds = [];
        var saved = current(quiz);
        quiz.questions.forEach(function (question) {
          var state = saved[question.id];
          if (state && state.verified) {
            stats.current.verified++;
            if (currentCorrect(question, state)) stats.current.correct++;
            else stats.current.wrongIds.push(question.id);
          }
        });
        quizStats.set(quiz.storageKey, stats);
        return stats;
      });
      var distinct = new Map();
      var mistakes = new Map();
      var history = results.map(function (event) {
        var quiz = byKey.get(event.storageKey);
        var question = quiz.questions.find(function (item) { return item.id === event.questionId; });
        var stats = quizStats.get(event.storageKey);
        if (event.at) {
          stats.attempts++;
          if (event.correct) stats.correct++;
          if (first.get(pair(event)) === event.id) { stats.firstAttempts++; if (event.correct) stats.firstCorrect++; }
          if (!distinct.has(pair(event))) { distinct.set(pair(event),true); stats.distinct++; }
        }
        var bucket = event.at && buckets.get(dateKey(new Date(event.at)));
        if (bucket) { bucket.attempts++; if (event.correct) bucket.correct++; }
        var mistake = mistakes.get(pair(event));
        if (!mistake) {
          mistake = {quizUrl:quiz.url,chapterNum:quiz.chapterNum,chapterName:quiz.name,questionId:event.questionId,number:question.number,wrong:0,attempts:0,lastAt:event.at};
          mistakes.set(pair(event), mistake);
        }
        mistake.attempts++;
        if (!event.correct) mistake.wrong++;
        mistake.lastAt = event.at;
        return Object.assign({},event,{selected:event.selected.slice(),chapterNum:quiz.chapterNum,chapterName:quiz.name,quizUrl:quiz.url,number:question.number});
      }).filter(function (event) { return event.at; });
      resultQuizzes.forEach(function (stats) {
        stats.summary = resultSummary(results.filter(function (event) { return event.storageKey === stats.storageKey; }));
        finishStats(stats);
        ['verified','correct','total'].forEach(function (key) { totals.current[key] += stats.current[key]; });
        ['attempts','distinct','correct','firstAttempts','firstCorrect'].forEach(function (key) { totals[key] += stats[key]; });
      });
      daily.forEach(function (bucket) { bucket.accuracy = accuracy(bucket.correct,bucket.attempts); });
      var topicRows = [];
      resultQuizzes.forEach(function (quiz) {
        (quiz.topics || []).forEach(function (topic) {
          var questions = quiz.questions.filter(function (q) { return q.topicId === topic.id; });
          var ids = new Set(questions.map(function (q) { return q.id; }));
          var rows = results.filter(function (e) { return e.storageKey === quiz.storageKey && ids.has(e.questionId); });
          var wrong = rows.filter(function (e) { return !e.correct; }).length;
          var count = new Set(rows.map(function (e) { return e.questionId; })).size;
          topicRows.push(Object.assign({},topic,{chapterNum:quiz.chapterNum,chapterName:quiz.name,storageKey:quiz.storageKey,
            total:questions.length,distinct:count,attempts:rows.length,correct:rows.length-wrong,wrong:wrong,
            errorRate:accuracy(wrong,rows.length),eligible:count>=3,questionNumbers:questions.map(function (q) { return q.number; }),quizUrl:quiz.url}));
        });
      });
      topicRows.sort(function (a,b) { return Number(b.eligible)-Number(a.eligible) || (b.errorRate ?? -1)-(a.errorRate ?? -1) || b.wrong-a.wrong || a.label.localeCompare(b.label,'ro'); });
      var latest = new Map();
      recovered.forEach(function (e) { latest.set(pair(e),e); });
      allEvents.filter(function (e) { return new Date(e.at)<=end; }).forEach(function (e) { latest.set(pair(e),e); });
      var errorTypes = {omitted:0,extra:0,both:0,unknown:0};
      function diagnostic(event) {
        var q = byKey.get(event.storageKey).questions.find(function (item) { return item.id===event.questionId; });
        var key = event.answerKey || q.correct;
        if (!key) return {omitted:[],extra:[],keyKnown:false,usesCurrentKey:true};
        return {omitted:key.filter(function (v) { return !event.selected.includes(v); }),
          extra:event.selected.filter(function (v) { return !key.includes(v); }),keyKnown:true,usesCurrentKey:!event.answerKey};
      }
      results.filter(function (e) { return !e.correct; }).forEach(function (e) {
        var d = diagnostic(e);
        errorTypes[d.omitted.length && d.extra.length ? 'both' : d.omitted.length ? 'omitted' : d.extra.length ? 'extra' : 'unknown']++;
      });
      var resultMistakes = Array.from(mistakes.values()).filter(function (m) { return m.wrong>0; }).map(function (m) {
        var quiz = byKey.get(results.find(function (e) { return e.questionId===m.questionId && byKey.get(e.storageKey).chapterNum===m.chapterNum; }).storageKey);
        var q = quiz.questions.find(function (q) { return q.id===m.questionId; });
        var wrong = results.filter(function (e) { return e.storageKey===quiz.storageKey && e.questionId===m.questionId && !e.correct; }).at(-1);
        var last = latest.get(pair(wrong));
        var topic = (quiz.topics || []).find(function (t) { return t.id===q.topicId; });
        return Object.assign(m,diagnostic(wrong),{selected:wrong.selected.slice(),resolved:!!last.correct,lastResultAt:last.at,
          topicId:q.topicId,topicLabel:topic && topic.label,lessonUrl:topic && topic.lessonUrl});
      }).filter(function (m) { return !options.topicId || m.topicId===options.topicId; }).sort(function (a,b) {
        return Number(a.resolved)-Number(b.resolved) || b.wrong-a.wrong || (b.lastAt || '').localeCompare(a.lastAt || '') || a.number-b.number;
      });
      function inPeriod(run) {
        if (!Object.keys(run.answers).length) return false;
        return (days === 'all' && Object.values(run.answers).some(function (a) { return a.verified && a.imported && !a.at; })) ||
          [run.lastAt,run.closedAt,...Object.values(run.answers).map(function (a) { return a.at; })].some(function (at) { return at && new Date(at)>=start && new Date(at)<=end; });
      }
      function summarizeRun(run) {
        var quiz = byKey.get(run.storageKey);
        var answers = Object.values(run.answers).filter(function (a) { return a.verified; });
        var correct = answers.filter(function (a) { return a.correct; }).length;
        var meta = metadata.find(function (item) { return item.key === run.storageKey; });
        var parent = run.sourceRunId && snapshot.runs.find(function (item) { return item.id === run.sourceRunId && item.storageKey === run.storageKey; });
        return Object.assign(copy(run),{chapterNum:quiz.chapterNum,chapterName:quiz.name,quizUrl:quiz.url,total:run.questionIds ? run.questionIds.length : quiz.questions.length,
          number:run.mode !== 'mistakes' && Number.isInteger(run.number) ? run.number : null,
          isCurrent:run.mode === 'mistakes' ? !!meta && meta.practiceRunId === run.id && !run.closedAt && isCurrentRun(parent, meta) : isCurrentRun(run, meta),
          verified:answers.length,correct:correct,wrong:answers.length-correct,accuracy:accuracy(correct,answers.length),
          questions:quiz.questions.filter(function (q) { return !run.questionIds || run.questionIds.includes(q.id); }).map(function (q) { return {id:q.id,number:q.number}; })});
      }
      var runs = snapshot.runs.filter(function (run) {
        if (!keys.has(run.storageKey)) return false;
        return inPeriod(run) || (run.mode !== 'mistakes' && snapshot.runs.some(function (child) {
          return child.mode === 'mistakes' && child.sourceRunId === run.id && child.storageKey === run.storageKey && inPeriod(child);
        }));
      }).map(function (run) {
        var result = summarizeRun(run);
        if (run.mode === 'mistakes') return result;
        var quiz = byKey.get(run.storageKey);
        var meta = metadata.find(function (item) { return item.key === run.storageKey; });
        var progress = correctionState(quiz, run, snapshot);
        var counted = progress.rounds.filter(function (child) { return Object.values(child.answers).some(function (a) { return a.verified; }); });
        result.initialComplete = initialComplete(quiz, run);
        result.correction = {
          rounds:counted.map(summarizeRun),roundCount:counted.length,
          currentRoundId:result.isCurrent && progress.rounds.some(function (child) { return child.id === meta.practiceRunId && !child.closedAt; }) ? meta.practiceRunId : null,
          correctedIds:progress.correctedIds,remainingIds:progress.remainingIds,
          corrected:progress.correctedIds.length,remaining:progress.remainingIds.length,
          accuracy:result.initialComplete ? accuracy(result.correct + progress.correctedIds.length, quiz.questions.length) : null,
          complete:result.initialComplete && !progress.remainingIds.length,
          canPractice:result.isCurrent && result.initialComplete && progress.remainingIds.length > 0
        };
        return result;
      }).sort(function (a,b) { return (b.closedAt || b.lastAt || '').localeCompare(a.closedAt || a.lastAt || ''); });
      var filteredHistory = history.filter(function (e) {
        return !options.topicId || byKey.get(e.storageKey).questions.some(function (q) { return q.id===e.questionId && q.topicId===options.topicId; });
      }).reverse();
      resultQuizzes.forEach(function (quiz) {
        var meta = metadata.find(function (item) { return item.key === quiz.storageKey; });
        var source = snapshot.runs.find(function (run) { return meta && run.id === meta.activeRunId && run.storageKey === quiz.storageKey; });
        quiz.activeRunId = isCurrentRun(source, meta) ? source.id : null;
        quiz.mistakeIds = quiz.activeRunId && initialComplete(quiz, source) ? correctionState(quiz, source, snapshot).remainingIds : [];
      });
      return {quizzes:resultQuizzes,totals:finishStats(totals),daily:daily,topics:topicRows,errorTypes:errorTypes,
        summary:resultSummary(results),savedResults:recovered,
        mistakes:resultMistakes,runs:runs,history:filteredHistory,legacyHistory:filteredHistory.filter(function (e) { return !e.runId; }),
        canPersist:canPersist,trackingSince:since};
    });
  }

  function clearHistory(chapterNum) {
    return enqueue(async function () {
      await ready;
      var quizzes = index.filter(function (quiz) { return chapterNum == null || quiz.chapterNum === Number(chapterNum); });
      var keys = new Set(quizzes.map(function (quiz) { return quiz.storageKey; }));
      function erase(state, attemptsStore, metadataStore, runsStore) {
        state.runs = state.runs.filter(function (run) { if (!keys.has(run.storageKey)) return true; if (runsStore) runsStore.delete(run.id); return false; });
        state.attempts = state.attempts.filter(function (event) {
          if (!keys.has(event.storageKey)) return true;
          if (attemptsStore) attemptsStore.delete(event.id);
          return false;
        });
        state.metadata = state.metadata.filter(function (meta) { return !keys.has(meta.key); });
        quizzes.forEach(function (quiz) {
          var meta = baseline(quiz);
          state.metadata.push(meta);
          if (metadataStore) metadataStore.put(meta);
        });
      }
      // Clearing is destructive: session fallback must never masquerade as durable deletion.
      if (database) {
        try { snapshot = (await transaction('readwrite', erase)).snapshot; }
        catch (error) { canPersist = false; notify(false); throw error; }
      } else if (hadPersistentDatabase) {
        var connection;
        try {
          connection = await openDatabase();
          await transaction('readwrite', erase, connection);
        } catch (error) { canPersist = false; notify(false); throw error; }
        finally { if (connection) connection.close(); }
        // Keep unrelated session-only attempts after clearing the durable target.
        erase(snapshot, null, null);
      } else {
        erase(snapshot, null, null);
      }
      notify(true);
    });
  }

  return {dispose:function () {
    disposed = true;
    listeners.clear();
    if (channel) channel.close();
    window.removeEventListener('storage', storageChanged);
    Promise.all([serial, ready]).finally(function () { if (database) database.close(); snapshot = {attempts:[], metadata:[], runs:[]}; });
  },ready:ready,newAttemptId:newAttemptId,recordAttempt:recordAttempt,ensureRun:ensureRun,ensurePractice:ensurePractice,prepareRestart:prepareRestart,pendingRestart:pendingRestart,finishRestart:finishRestart,getReport:getReport,clearHistory:clearHistory,
    subscribe:function (callback) { if (typeof callback !== 'function') return function () {}; listeners.add(callback); return function () { listeners.delete(callback); }; }};
  }
  function scope() {
    var owner = window.BBUserStorage ? window.BBUserStorage.owner() : 'guest';
    return owner === 'guest' ? '' : ':' + owner;
  }
  var activeScope = scope();
  var active = createAnalytics(activeScope);
  var subscribers = new Set();
  function announce() { subscribers.forEach(function (fn) { try { fn(); } catch (_) {} }); }
  active.subscribe(announce);
  document.addEventListener('bb:cache-owner-change', function () {
    if (scope() === activeScope) return;
    active.dispose();
    activeScope = scope();
    active = createAnalytics(activeScope);
    active.subscribe(announce);
    announce();
    active.ready.then(announce);
  });
  document.addEventListener('bb:cache-change', announce);
  window.BBQuizAnalytics = {
    get ready() { return active.ready; },
    newAttemptId:function () { return active.newAttemptId(); },
    ensureRun:function (key) { return active.ensureRun(key); },
    ensurePractice:function (key, restart, sourceRunId) { return active.ensurePractice(key, restart, sourceRunId); },
    prepareRestart:function (input) { return active.prepareRestart(input); },
    pendingRestart:function (key) { return active.pendingRestart(key); },
    finishRestart:function (input) { return active.finishRestart(input); },
    recordAttempt:function (input) { return active.recordAttempt(input); },
    clearHistory:function (input) { return active.clearHistory(input); },
    getReport:async function (options) {
      var source = active;
      var result;
      try { result = await source.getReport(options); }
      catch (error) {
        if (source !== active) return window.BBQuizAnalytics.getReport(options);
        throw error;
      }
      return source === active ? result : window.BBQuizAnalytics.getReport(options);
    },
    subscribe:function (fn) { subscribers.add(fn); return function () { subscribers.delete(fn); }; }
  };
}());
