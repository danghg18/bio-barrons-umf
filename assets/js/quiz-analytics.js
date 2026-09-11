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
  var database = null;
  var hadPersistentDatabase = false;
  var canPersist = true;
  var snapshot = { attempts: [], metadata: [] };
  var listeners = new Set();
  var serial = Promise.resolve();
  var channel = null;
  var notificationKey = 'bb.quiz.analytics.changed.v1';

  function current(quiz) {
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
      try { request = window.indexedDB.open('bb.quiz.analytics.v1' + scope, 1); }
      catch (error) { reject(error); return; }
      request.onupgradeneeded = function () {
        var db = request.result;
        if (!db.objectStoreNames.contains('attempts')) db.createObjectStore('attempts', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('metadata')) db.createObjectStore('metadata', { keyPath: 'key' });
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
      try { tx = (connection || database).transaction(['attempts', 'metadata'], mode); }
      catch (error) { reject(error); return; }
      var attemptsStore = tx.objectStore('attempts');
      var metadataStore = tx.objectStore('metadata');
      var result = { attempts: [], metadata: [] };
      var pending = 2;
      var value;
      function loaded() {
        pending -= 1;
        if (!pending && mutate) {
          try { value = mutate(result, attemptsStore, metadataStore); }
          catch (error) { tx.abort(); reject(error); }
        }
      }
      var attemptsRequest = attemptsStore.getAll();
      var metadataRequest = metadataStore.getAll();
      attemptsRequest.onsuccess = function () { result.attempts = attemptsRequest.result; loaded(); };
      metadataRequest.onsuccess = function () { result.metadata = metadataRequest.result; loaded(); };
      tx.oncomplete = function () { resolve({ snapshot: result, value: value }); };
      tx.onabort = tx.onerror = function () { reject(tx.error || new Error('Quiz history transaction failed')); };
    });
  }

  async function access(mutate) {
    if (database) {
      try {
        var result = await transaction(mutate ? 'readwrite' : 'readonly', mutate);
        snapshot = result.snapshot;
        return result.value;
      } catch (_) {
        canPersist = false;
        // A quota failure can leave existing history readable. Retain it in memory.
        try { snapshot = (await transaction('readonly')).snapshot; } catch (_) {}
        try { database.close(); } catch (_) {}
        database = null;
      }
    }
    return mutate ? mutate(snapshot, null, null) : undefined;
  }

  function enqueue(operation) {
    var next = serial.then(operation);
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
    await access(function (state, attemptsStore, metadataStore) {
      index.forEach(function (quiz) {
        if (state.metadata.some(function (item) { return item.key === quiz.storageKey; })) return;
        var item = baseline(quiz);
        state.metadata.push(item);
        if (metadataStore) metadataStore.put(item);
      });
    });
  }());

  function recordAttempt(input) {
    return enqueue(async function () {
      await ready;
      var quiz = input && byKey.get(input.storageKey);
      if (!quiz || !quiz.questions.some(function (q) { return q.id === input.questionId; }) ||
        typeof input.correct !== 'boolean' || typeof input.attemptId !== 'string' || !input.attemptId ||
        !Array.isArray(input.selected) || !input.selected.every(function (letter) { return /^[A-E]$/.test(letter); })) return false;
      var event = {id:input.attemptId,storageKey:input.storageKey,questionId:input.questionId,correct:input.correct,
        selected:Array.from(new Set(input.selected)).sort(),at:new Date().toISOString()};
      var added = await access(function (state, attemptsStore, metadataStore) {
        if (state.attempts.some(function (existing) { return existing.id === event.id; })) return false;
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
      var daily = [];
      for (var date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) daily.push({date:dateKey(date),attempts:0,correct:0,accuracy:null});
      var buckets = new Map(daily.map(function (day) { return [day.date, day]; }));
      var totals = emptyStats(0);
      var quizStats = new Map();
      var resultQuizzes = quizzes.map(function (quiz) {
        var stats = Object.assign({}, quiz, emptyStats(quiz.questions.length));
        var saved = current(quiz);
        quiz.questions.forEach(function (question) {
          var state = saved[question.id];
          if (state && state.verified) { stats.current.verified++; if (state.correct) stats.current.correct++; }
        });
        quizStats.set(quiz.storageKey, stats);
        return stats;
      });
      var distinct = new Map();
      var mistakes = new Map();
      var history = events.map(function (event) {
        var quiz = byKey.get(event.storageKey);
        var question = quiz.questions.find(function (item) { return item.id === event.questionId; });
        var stats = quizStats.get(event.storageKey);
        stats.attempts++;
        if (event.correct) stats.correct++;
        if (first.get(pair(event)) === event.id) { stats.firstAttempts++; if (event.correct) stats.firstCorrect++; }
        if (!distinct.has(pair(event))) { distinct.set(pair(event),true); stats.distinct++; }
        var bucket = buckets.get(dateKey(new Date(event.at)));
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
      });
      resultQuizzes.forEach(function (stats) {
        finishStats(stats);
        ['verified','correct','total'].forEach(function (key) { totals.current[key] += stats.current[key]; });
        ['attempts','distinct','correct','firstAttempts','firstCorrect'].forEach(function (key) { totals[key] += stats[key]; });
      });
      daily.forEach(function (bucket) { bucket.accuracy = accuracy(bucket.correct,bucket.attempts); });
      return {quizzes:resultQuizzes,totals:finishStats(totals),daily:daily,
        mistakes:Array.from(mistakes.values()).filter(function (item) { return item.wrong > 0; }).sort(function (a,b) { return b.wrong-a.wrong || b.lastAt.localeCompare(a.lastAt) || a.number-b.number; }),
        history:history.reverse(),canPersist:canPersist,trackingSince:since};
    });
  }

  function clearHistory(chapterNum) {
    return enqueue(async function () {
      await ready;
      var quizzes = index.filter(function (quiz) { return chapterNum == null || quiz.chapterNum === Number(chapterNum); });
      var keys = new Set(quizzes.map(function (quiz) { return quiz.storageKey; }));
      function erase(state, attemptsStore, metadataStore) {
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
    listeners.clear();
    if (channel) channel.close();
    window.removeEventListener('storage', storageChanged);
    Promise.all([serial, ready]).finally(function () { if (database) database.close(); snapshot = {attempts:[], metadata:[]}; });
  },ready:ready,newAttemptId:newAttemptId,recordAttempt:recordAttempt,getReport:getReport,clearHistory:clearHistory,
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
    recordAttempt:function (input) { return active.recordAttempt(input); },
    clearHistory:function (input) { return active.clearHistory(input); },
    getReport:async function (options) {
      var source = active;
      var result = await source.getReport(options);
      return source === active ? result : window.BBQuizAnalytics.getReport(options);
    },
    subscribe:function (fn) { subscribers.add(fn); return function () { subscribers.delete(fn); }; }
  };
}());
