(function () {
  "use strict";

  var quiz = window.BB_QUIZ || window.BB_NERVOUS_QUIZ;
  if (!quiz) return;

  var filename = window.location.pathname.split("/").pop();
  var chapter = CHAPTERS.find(function (item) {
    return (item.resources || []).some(function (resource) { return resource.url === filename; });
  });
  var lessonUrl = chapter ? chapter.url : "sistemul_nervos.html";
  var lessonName = chapter ? chapter.name : "Organizarea sistemului nervos";

  var storageAvailable = true;
  var analyticsAvailable = true;
  var state = loadState();
  var pendingChecks = new Set();
  var resetGeneration = 0;
  var attemptKey = quiz.storageKey + ".attempts.v1";
  var memoryAttempts = {};
  var analytics = window.BBQuizAnalytics;
  var analyticsReady = analytics && analytics.ready ? Promise.resolve(analytics.ready).catch(function () {}) : Promise.resolve();

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeLetters(values) {
    return Array.from(new Set((Array.isArray(values) ? values : []).filter(function (value) {
      return /^[A-E]$/.test(value);
    }))).sort();
  }

  function sameLetters(first, second) {
    var a = normalizeLetters(first);
    var b = normalizeLetters(second);
    return a.length === b.length && a.every(function (letter, index) {
      return letter === b[index];
    });
  }

  function blankState() {
    return { version: quiz.version, questions: {} };
  }

  function loadState() {
    try {
      var parsed = window.BBUserStorage ? window.BBUserStorage.get(quiz.storageKey) : JSON.parse(window.localStorage.getItem(quiz.storageKey) || "null");
      if (!parsed || parsed.version !== quiz.version || !parsed.questions || typeof parsed.questions !== "object" || Array.isArray(parsed.questions)) {
        return blankState();
      }
      var knownQuestions = new Map(quiz.questions.map(function (question) { return [question.id, question]; }));
      // Derive current scores from the current key without creating cloud edits
      // or changing the historical scores of earlier attempts.
      Object.keys(parsed.questions).forEach(function (id) {
        if (!knownQuestions.has(id) || !parsed.questions[id] || typeof parsed.questions[id] !== "object") delete parsed.questions[id];
        else {
          parsed.questions[id].selected = normalizeLetters(parsed.questions[id].selected);
          parsed.questions[id].verified = !!parsed.questions[id].verified;
          parsed.questions[id].correct = parsed.questions[id].verified && sameLetters(parsed.questions[id].selected, knownQuestions.get(id).correct);
        }
      });
      return parsed;
    } catch (error) {
      storageAvailable = false;
      return blankState();
    }
  }

  function saveState(questionId) {
    try {
      if (questionId) {
        var updated = state.questions[questionId];
        var latest = loadState();
        if (storageAvailable) {
          latest.questions[questionId] = updated;
          state = latest;
        }
      }
      if (window.BBUserStorage) {
        window.BBUserStorage.set(quiz.storageKey, state);
        storageAvailable = window.BBUserStorage.canPersist();
      } else window.localStorage.setItem(quiz.storageKey, JSON.stringify(state));
    } catch (error) {
      storageAvailable = false;
    }
    syncStorageNotice();
  }

  function syncStorageNotice() {
    var notice = document.getElementById("quiz-storage-notice");
    if (notice) {
      notice.hidden = storageAvailable && analyticsAvailable;
      notice.textContent = storageAvailable ? "Statisticile din această sesiune nu pot fi salvate." : "Salvarea locală nu este disponibilă.";
    }
  }

  function syncAnalyticsNotice() {
    if (!analytics || !analytics.getReport) return;
    Promise.resolve(analytics.getReport()).then(function (report) {
      analyticsAvailable = report.canPersist !== false;
      syncStorageNotice();
    }).catch(function () {
      analyticsAvailable = false;
      syncStorageNotice();
    });
  }

  function attemptIdFor(questionId, renew) {
    var attempts = memoryAttempts;
    try {
      var storedAttempts = window.BBUserStorage ? (window.BBUserStorage.get(attemptKey) || {}) : JSON.parse(localStorage.getItem(attemptKey) || "{}");
      if (storedAttempts && typeof storedAttempts === "object" && !Array.isArray(storedAttempts)) attempts = storedAttempts;
    } catch (_) { /* Memory fallback. */ }
    if (renew || !attempts[questionId]) {
      attempts[questionId] = analytics && analytics.newAttemptId ? analytics.newAttemptId() : Date.now() + "-" + Math.random().toString(36).slice(2);
      try { if (window.BBUserStorage) window.BBUserStorage.set(attemptKey, attempts); else localStorage.setItem(attemptKey, JSON.stringify(attempts)); } catch (_) { storageAvailable = false; }
    }
    memoryAttempts = attempts;
    return attempts[questionId];
  }

  function validateData() {
    var expectedNumber = quiz.firstNumber || 51;
    var expectedCount = quiz.questionCount || 50;
    var idPrefix = quiz.idPrefix || "sn-";
    if (!Array.isArray(quiz.questions) || quiz.questions.length !== expectedCount) {
      throw new Error("Setul trebuie să conțină exact " + expectedCount + " de grile.");
    }
    quiz.questions.forEach(function (question) {
      if (question.number !== expectedNumber) throw new Error("Numerotarea grilelor nu este continuă.");
      if (question.id !== idPrefix + String(question.number).padStart(3, "0")) {
        throw new Error("ID invalid pentru grila " + question.number + ".");
      }
      if (!Array.isArray(question.options) || question.options.length !== 5) {
        throw new Error("Grila " + question.number + " nu are cinci variante.");
      }
      if (question.options.map(function (option) { return option.letter; }).join("") !== "ABCDE") {
        throw new Error("Litere invalide la grila " + question.number + ".");
      }
      if (question.sourceNumber !== question.number || !question.correct.length ||
          question.correct.join("") !== normalizeLetters(question.correct).join("")) {
        throw new Error("Barem sau număr sursă invalid la grila " + question.number + ".");
      }
      question.options.forEach(function (option) {
        if (question.correct.indexOf(option.letter) === -1 && !option.why) {
          throw new Error("Lipsește explicația pentru " + question.number + option.letter + ".");
        }
      });
      expectedNumber += 1;
    });
  }

  function questionState(question) {
    if (!state.questions[question.id]) {
      state.questions[question.id] = { selected: [], verified: false, correct: false };
    }
    return state.questions[question.id];
  }

  function renderOption(question, option) {
    var inputId = question.id + "-" + option.letter.toLowerCase();
    var explanationLabel = question.correct.indexOf(option.letter) !== -1
      ? (quiz === window.BB_NERVOUS_QUIZ || question.asksFalse ? "De ce afirmația este incorectă" : "Clarificare")
      : "De ce nu se selectează";
    return (
      '<div class="quiz-option-wrap" data-letter="' + option.letter + '">' +
        '<label class="quiz-option" for="' + inputId + '">' +
          '<input id="' + inputId + '" type="checkbox" name="' + question.id + '" value="' + option.letter + '">' +
          '<span class="quiz-option-letter" aria-hidden="true">' + option.letter + '</span>' +
          '<span class="quiz-option-text">' + escapeHtml(option.text) + '</span>' +
          '<span class="quiz-option-state" id="' + inputId + '-state"></span>' +
        '</label>' +
        '<div class="quiz-option-explanation" id="' + inputId + '-explanation" hidden>' +
          '<strong>' + explanationLabel + '</strong>' +
          '<p>' + escapeHtml(option.why || "") + '</p>' +
          (option.added ? '<p>' + escapeHtml(option.added) + '</p>' : '') +
        '</div>' +
      '</div>'
    );
  }

  function renderQuestion(question) {
    return (
      '<article class="quiz-question" tabindex="-1" id="grila-' + question.number + '" data-question-id="' + question.id + '">' +
        '<div class="quiz-question-head">' +
          '<span class="quiz-question-number">Grila ' + question.number + '</span>' +
          '<span class="quiz-question-status" aria-hidden="true">Necompletată</span>' +
        '</div>' +
        '<fieldset>' +
          '<legend>' + escapeHtml(question.prompt) + '</legend>' +
          '<p class="quiz-instruction">Bifează toate variantele care răspund cerinței.</p>' +
          '<div class="quiz-options">' + question.options.map(function (option) {
            return renderOption(question, option);
          }).join("") + '</div>' +
        '</fieldset>' +
        '<div class="quiz-result" role="status" aria-live="polite" tabindex="-1"></div>' +
        '<div class="quiz-actions">' +
          '<button class="quiz-check" type="button">Verifică răspunsul</button>' +
          '<button class="quiz-retry" type="button" hidden>Reîncearcă grila</button>' +
        '</div>' +
      '</article>'
    );
  }

  function renderRange(range, index) {
    var section = document.getElementById("page-" + range.id);
    if (!section) return;
    var questions = quiz.questions.filter(function (question) {
      return question.number >= range.start && question.number <= range.end;
    });
    var previous = quiz.ranges[index - 1];
    var next = quiz.ranges[index + 1];
    var previousLink = previous
      ? '<a class="outline" href="#' + previous.id + '">← Înapoi</a>'
      : '<span class="quiz-page-disabled" aria-disabled="true">← Înapoi</span>';
    var nextLink = next
      ? '<a href="#' + next.id + '">Înainte →</a>'
      : '<span class="quiz-page-disabled" aria-disabled="true">Înainte →</span>';

    section.innerHTML =
      '<div class="hero quiz-hero">' +
        '<div>' +
          '<h1>Grilele ' + range.start + '–' + range.end + '</h1>' +
          '<p>Rezolvă fiecare grilă, apoi verifică selecția pentru a vedea răspunsul și explicațiile.</p>' +
        '</div>' +
      '</div>' +
      '<div class="quiz-progress-panel" aria-label="Progresul grilelor">' +
        '<div class="quiz-progress-copy">' +
          '<strong class="quiz-progress-title">Progres general</strong>' +
          '<span class="quiz-progress-count" aria-live="polite">0 din ' + quiz.questions.length + ' verificate</span>' +
        '</div>' +
        '<div class="quiz-progress-track" aria-hidden="true"><span></span></div>' +
        '<div class="quiz-progress-meta"><span class="quiz-score">0 răspunsuri exacte</span><span class="quiz-range-score">0/' + questions.length + ' în acest set</span></div>' +
        '<div class="quiz-reset" data-reset-state="idle">' +
          '<button class="quiz-reset-start" type="button">Reia capitolul</button>' +
          '<span class="quiz-reset-confirmation" hidden>Reiei grilele de la început? Statisticile se păstrează.</span>' +
          '<button class="quiz-reset-confirm" type="button" hidden>Da, reiau</button>' +
          '<button class="quiz-reset-cancel" type="button" hidden>Anulează</button>' +
        '</div>' +
      '</div>' +
      '<p class="quiz-feedback-guide">După verificare: <span class="quiz-key-selected">verde — corect bifat</span>; <span class="quiz-key-missed">galben — corect omis</span>; <span class="quiz-key-extra">roșu — bifat în plus</span>.</p>' +
      '<div class="quiz-list">' + questions.map(renderQuestion).join("") + '</div>' +
      '<div class="page-nav quiz-page-nav">' + previousLink + '<span class="quiz-page-position">Pagina ' + (index + 1) + ' din ' + quiz.ranges.length + '</span>' + nextLink + '</div>';
  }

  function renderNavigation() {
    var root = document.getElementById("quiz-navigation");
    if (!root) return;
    var indexed = (window.BB_QUIZ_INDEX || []).find(function (item) { return item.storageKey === quiz.storageKey; });
    var chapterNum = indexed ? indexed.chapterNum : (chapter ? chapter.num : "");
    root.innerHTML =
      '<div class="quiz-sidebar-top">' +
        '<div class="quiz-sidebar-summary" aria-label="Progres general"><span id="quiz-sidebar-count">0/' + quiz.questions.length + ' verificate</span>' +
        '<span class="quiz-sidebar-track" id="quiz-sidebar-progress" aria-hidden="true"><span></span></span></div>' +
        '<div class="quiz-sidebar-links"><a href="testare.html">← Toate testele</a><a href="' + escapeHtml(lessonUrl) + '" title="' + escapeHtml(lessonName) + '">Lecția</a>' +
        '<a href="statistici.html?capitol=' + encodeURIComponent(chapterNum) + '">Statistici ↗</a></div>' +
        '<p class="quiz-map-label">Alege grila</p>' +
        '<p id="quiz-storage-notice" role="status" hidden>Salvarea locală nu este disponibilă.</p>' +
      '</div>' +
      '<div class="quiz-map-scroll"><div class="quiz-question-map" aria-label="Grilele capitolului">' + quiz.questions.map(function (question) {
        var range = quiz.ranges.find(function (item) { return question.number >= item.start && question.number <= item.end; });
        return '<a href="#grila-' + question.number + '" data-map-question="' + question.id + '" data-range="' + range.id + '"><span class="quiz-map-number">' + question.number + '</span><span class="quiz-map-icon" aria-hidden="true">○</span></a>';
      }).join("") + '</div></div>' +
      '<div class="quiz-map-legend"><span>○ Necompletată</span><span>◐ În lucru</span><span>✓ Corectă</span><span>× Greșită</span></div>';
    syncStorageNotice();
  }

  function syncQuestionMap() {
    var active = document.querySelector(".page-section.active");
    quiz.questions.forEach(function (question) {
      var link = document.querySelector('[data-map-question="' + question.id + '"]');
      if (!link) return;
      var saved = state.questions[question.id];
      var status = saved && saved.verified ? (saved.correct ? "correct" : "wrong") : (saved && saved.selected.length ? "in-progress" : "incomplete");
      var labels = {correct: "Corectă", wrong: "Greșită", "in-progress": "În lucru", incomplete: "Necompletată"};
      var icons = {correct: "✓", wrong: "×", "in-progress": "◐", incomplete: "○"};
      link.dataset.status = status;
      link.setAttribute("aria-label", "Grila " + question.number + ": " + labels[status]);
      link.setAttribute("title", "Grila " + question.number + ": " + labels[status]);
      link.querySelector(".quiz-map-icon").textContent = icons[status];
      link.classList.toggle("is-current-range", !!active && active.id === "page-" + link.dataset.range);
    });
  }

  function selectedFromCard(card) {
    return Array.from(card.querySelectorAll('input[type="checkbox"]:checked')).map(function (input) {
      return input.value;
    }).sort();
  }

  function setOptionState(wrap, question, option, saved) {
    var input = wrap.querySelector("input");
    var stateLabel = wrap.querySelector(".quiz-option-state");
    var explanation = wrap.querySelector(".quiz-option-explanation");
    var isAnswer = question.correct.indexOf(option.letter) !== -1;
    var selected = saved.selected.indexOf(option.letter) !== -1;

    input.checked = selected;
    input.disabled = saved.verified;
    if (saved.verified) input.setAttribute("aria-describedby", stateLabel.id + (option.why ? " " + explanation.id : ""));
    else input.removeAttribute("aria-describedby");
    wrap.classList.toggle("is-verified", saved.verified);
    wrap.classList.toggle("is-answer", saved.verified && isAnswer && selected);
    wrap.classList.toggle("is-missed-answer", saved.verified && isAnswer && !selected);
    wrap.classList.toggle("is-selected-extra", saved.verified && selected && !isAnswer);

    if (!saved.verified) {
      stateLabel.textContent = "";
      explanation.hidden = true;
    } else if (isAnswer) {
      stateLabel.textContent = selected ? "✓ Corect bifat" : "! Corect omis";
      explanation.hidden = !option.why;
    } else {
      stateLabel.textContent = selected ? "× Selectată în plus" : "Nu se selectează";
      explanation.hidden = false;
    }
  }

  function syncQuestionCard(card, question) {
    var saved = questionState(question);
    question.options.forEach(function (option) {
      var wrap = card.querySelector('.quiz-option-wrap[data-letter="' + option.letter + '"]');
      setOptionState(wrap, question, option, saved);
    });

    var result = card.querySelector(".quiz-result");
    var status = card.querySelector(".quiz-question-status");
    var check = card.querySelector(".quiz-check");
    var retry = card.querySelector(".quiz-retry");
    card.classList.toggle("is-verified", saved.verified);
    card.classList.toggle("is-correct", saved.verified && saved.correct);
    card.classList.toggle("is-review", saved.verified && !saved.correct);

    if (!saved.verified) {
      result.className = "quiz-result";
      result.textContent = "";
      status.textContent = saved.selected.length ? "În lucru" : "Necompletată";
      status.className = "quiz-question-status" + (saved.selected.length ? " is-in-progress" : "");
      check.hidden = false;
      retry.hidden = true;
    } else {
      result.className = "quiz-result " + (saved.correct ? "is-correct" : "is-review");
      result.innerHTML = saved.correct
        ? '<strong>Răspuns corect.</strong> Ai selectat exact combinația ' + question.correct.join(", ") + "."
        : '<strong>Mai ai de revizuit.</strong> Combinația corectă este ' + question.correct.join(", ") + ".";
      status.textContent = saved.correct ? "Corectă" : "De revizuit";
      status.className = "quiz-question-status " + (saved.correct ? "is-correct" : "is-review");
      check.hidden = true;
      retry.hidden = false;
    }
  }

  function syncAllQuestionCards() {
    quiz.questions.forEach(function (question) {
      var card = document.querySelector('[data-question-id="' + question.id + '"]');
      if (card) syncQuestionCard(card, question);
    });
  }

  function rangeStats(range) {
    var questions = quiz.questions.filter(function (question) {
      return question.number >= range.start && question.number <= range.end;
    });
    var verified = questions.filter(function (question) {
      return state.questions[question.id] && state.questions[question.id].verified;
    }).length;
    var correct = questions.filter(function (question) {
      return state.questions[question.id] && state.questions[question.id].verified && state.questions[question.id].correct;
    }).length;
    return { verified: verified, correct: correct };
  }

  function syncProgress() {
    syncQuestionMap();
    var verified = quiz.questions.filter(function (question) {
      return state.questions[question.id] && state.questions[question.id].verified;
    }).length;
    var correct = quiz.questions.filter(function (question) {
      return state.questions[question.id] && state.questions[question.id].verified && state.questions[question.id].correct;
    }).length;
    var percentage = Math.round((verified / quiz.questions.length) * 100);

    document.querySelectorAll(".quiz-progress-count").forEach(function (node) {
      node.textContent = verified + " din " + quiz.questions.length + " verificate";
    });
    document.querySelectorAll(".quiz-score").forEach(function (node) {
      node.textContent = correct + (correct === 1 ? " răspuns exact" : " răspunsuri exacte");
    });
    document.querySelectorAll(".quiz-progress-track span").forEach(function (node) {
      node.style.width = percentage + "%";
    });
    var sidebarCount = document.getElementById("quiz-sidebar-count");
    var sidebarTrack = document.querySelector("#quiz-sidebar-progress span");
    if (sidebarCount) sidebarCount.textContent = verified + "/" + quiz.questions.length + " verificate";
    if (sidebarTrack) sidebarTrack.style.width = percentage + "%";

    quiz.ranges.forEach(function (range) {
      var stats = rangeStats(range);
      var count = range.end - range.start + 1;
      document.querySelectorAll('[data-range-progress="' + range.id + '"]').forEach(function (node) {
        node.textContent = stats.verified + "/" + count;
      });
      var section = document.getElementById("page-" + range.id);
      if (section) {
        var rangeScore = section.querySelector(".quiz-range-score");
        if (rangeScore) rangeScore.textContent = stats.correct + "/" + count + " exacte în acest set";
      }
    });
  }

  function handleQuestionChange(event) {
    var input = event.target.closest('.quiz-question input[type="checkbox"]');
    if (!input) return;
    var card = input.closest(".quiz-question");
    var question = quiz.questions.find(function (item) { return item.id === card.dataset.questionId; });
    var saved = questionState(question);
    if (saved.verified) return;
    saved.selected = selectedFromCard(card);
    attemptIdFor(question.id, false);
    saveState(question.id);
    syncQuestionCard(card, question);
    syncProgress();
  }

  async function handleCheck(button) {
    var card = button.closest(".quiz-question");
    var question = quiz.questions.find(function (item) { return item.id === card.dataset.questionId; });
    if (pendingChecks.has(question.id) || questionState(question).verified) return;
    var selected = selectedFromCard(card);
    var result = card.querySelector(".quiz-result");
    if (!selected.length) {
      result.className = "quiz-result is-error";
      result.textContent = "Alege cel puțin o variantă înainte de verificare.";
      result.focus({ preventScroll: true });
      return;
    }
    pendingChecks.add(question.id);
    button.disabled = true;
    var generation = resetGeneration;
    try {
      await analyticsReady;
      var verify = function () {
        if (generation !== resetGeneration) return;
        var latest = loadState();
        if (storageAvailable) state = latest;
        if (questionState(question).verified) {
          syncQuestionCard(card, question);
          syncProgress();
          return;
        }
        var attemptId = attemptIdFor(question.id, false);
        var saved = { selected: selected, verified: true, correct: sameLetters(selected, question.correct) };
        state.questions[question.id] = saved;
        saveState(question.id);
        syncQuestionCard(card, question);
        syncProgress();
        result.focus({ preventScroll: true });
        if (analytics && analytics.recordAttempt) {
          return Promise.resolve(analytics.recordAttempt({storageKey: quiz.storageKey, questionId: question.id, selected: selected, correct: saved.correct, attemptId: attemptId})).catch(function () {});
        }
      };
      if (navigator.locks && navigator.locks.request) await navigator.locks.request("bb-quiz-check:" + quiz.storageKey, verify);
      else await verify();
    } finally {
      pendingChecks.delete(question.id);
      button.disabled = false;
    }
  }

  function handleRetry(button) {
    var card = button.closest(".quiz-question");
    var question = quiz.questions.find(function (item) { return item.id === card.dataset.questionId; });
    state.questions[question.id] = { selected: [], verified: false, correct: false };
    attemptIdFor(question.id, true);
    saveState(question.id);
    syncQuestionCard(card, question);
    syncProgress();
    var firstInput = card.querySelector('input[type="checkbox"]');
    if (firstInput) firstInput.focus({ preventScroll: true });
  }

  function setResetConfirmation(root, open) {
    root.dataset.resetState = open ? "confirm" : "idle";
    root.querySelector(".quiz-reset-start").hidden = open;
    root.querySelector(".quiz-reset-confirmation").hidden = !open;
    root.querySelector(".quiz-reset-confirm").hidden = !open;
    root.querySelector(".quiz-reset-cancel").hidden = !open;
    if (open) root.querySelector(".quiz-reset-confirm").focus();
  }

  function handleReset(action) {
    var root = action.closest(".quiz-reset");
    if (action.classList.contains("quiz-reset-start")) {
      document.querySelectorAll(".quiz-reset").forEach(function (resetRoot) {
        setResetConfirmation(resetRoot, resetRoot === root);
      });
    } else if (action.classList.contains("quiz-reset-cancel")) {
      setResetConfirmation(root, false);
      root.querySelector(".quiz-reset-start").focus();
    } else if (action.classList.contains("quiz-reset-confirm")) {
      resetGeneration += 1;
      state = blankState();
      memoryAttempts = {};
      try { if (window.BBUserStorage) window.BBUserStorage.set(attemptKey, null); else localStorage.removeItem(attemptKey); } catch (_) { /* Memory fallback. */ }
      saveState();
      syncAllQuestionCards();
      syncProgress();
      document.querySelectorAll(".quiz-reset").forEach(function (resetRoot) {
        setResetConfirmation(resetRoot, false);
      });
      var active = document.querySelector(".page-section.active .quiz-reset-start");
      if (active) active.focus();
    }
  }

  function installEvents() {
    window.addEventListener("storage", function (event) {
      if (window.BBUserStorage || (event.key !== quiz.storageKey && event.key !== null)) return;
      state = loadState();
      syncAllQuestionCards();
      syncProgress();
    });
    document.addEventListener("bb:cache-change", function () {
      resetGeneration += 1;
      memoryAttempts = {};
      state = loadState();
      syncAllQuestionCards();
      syncProgress();
    });
    document.addEventListener("bb:lesson-section-change", syncQuestionMap);
    document.addEventListener("change", handleQuestionChange);
    document.addEventListener("click", function (event) {
      var check = event.target.closest(".quiz-check");
      if (check) return handleCheck(check);
      var retry = event.target.closest(".quiz-retry");
      if (retry) return handleRetry(retry);
      var reset = event.target.closest(".quiz-reset button");
      if (reset) handleReset(reset);
    });
  }

  function customizeSharedControls() {
    window.setTimeout(function () {
      var input = document.getElementById("lesson-search-input");
      var trigger = document.querySelector(".lesson-search-trigger");
      var navSearch = document.getElementById("nav-search-btn");
      var back = document.querySelector(".lab-topbar-back");
      if (input) {
        input.placeholder = "Caută în grile…";
        input.setAttribute("aria-label", "Caută în grile");
      }
      [trigger, navSearch].forEach(function (button) {
        if (!button) return;
        button.setAttribute("aria-label", "Caută în grile");
        button.setAttribute("title", "Caută în grile (/)");
        var label = button.querySelector("span:not(.dot)");
        if (label) label.textContent = "Caută în grile";
      });
      if (back) {
        back.href = lessonUrl;
        back.setAttribute("aria-label", "Înapoi la lecție: " + lessonName);
        back.setAttribute("title", "Înapoi la lecție: " + lessonName);
      }
    }, 0);
  }

  function showFatalError(error) {
    var main = document.getElementById("quiz-content");
    if (!main) return;
    main.innerHTML = '<div class="quiz-fatal" role="alert"><h1>Grilele nu au putut fi încărcate</h1><p>' + escapeHtml(error.message) + '</p></div>';
  }

  function init() {
    try {
      // Session hydration may finish before DOMContentLoaded listeners are installed.
      state = loadState();
      validateData();
      quiz.ranges.forEach(renderRange);
      renderNavigation();
      syncAllQuestionCards();
      syncProgress();
      installEvents();
      analyticsReady.then(syncAnalyticsNotice);
      if (analytics && analytics.subscribe) analytics.subscribe(syncAnalyticsNotice);
      customizeSharedControls();
    } catch (error) {
      showFatalError(error);
      throw error;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
