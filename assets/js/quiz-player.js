(function () {
  "use strict";

  var quiz = window.BB_QUIZ || window.BB_NERVOUS_QUIZ;
  if (!quiz) return;

  var sourceQuiz = quiz;
  var practiceMode = new URLSearchParams(location.search).get('mod') === 'greseli';
  var practiceRun = null;
  var practiceOwner = null;
  var practiceSourceRunId = new URLSearchParams(location.search).get('parcurgere');
  var practiceSource = null;
  var practiceLoading = false;
  var analyticsNoticeVersion = 0;

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
  var resetBusy = false;
  var resetConfirmation = null;
  var recovery = Promise.resolve();
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
    if (practiceMode) return {version:quiz.version, questions:practiceRun ? JSON.parse(JSON.stringify(practiceRun.answers)) : {}};
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
    if (practiceMode) return;
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

  function practiceUrl(sourceId) {
    return filename + '?mod=greseli&parcurgere=' + encodeURIComponent(sourceId);
  }

  function runLabel(run) {
    return Number.isInteger(run.number) ? 'Parcurgerea ' + run.number : 'Parcurgere anterioară';
  }

  function formatPercentage(value) {
    return new Intl.NumberFormat('ro',{maximumFractionDigits:1}).format(value) + '%';
  }

  function correctionSummary(source) {
    var correction = source && source.correction;
    if (!correction) return '';
    if (correction.complete && correction.corrected) {
      return (correction.corrected === 1 ? 'Ai corectat greșeala în ' : 'Ai corectat toate cele ' + correction.corrected + ' greșeli în ') + correction.roundCount +
        (correction.roundCount === 1 ? ' rundă de corectare.' : ' runde de corectare.');
    }
    return 'Corectate: ' + correction.corrected + ' din ' + (correction.corrected + correction.remaining) +
      ' greșeli · Rămase: ' + correction.remaining + '.';
  }

  function syncPracticeSummary() {
    if (!practiceRun || !practiceSource) return;
    var correction = practiceSource.correction;
    var verified = quiz.questions.filter(function (q) { return state.questions[q.id] && state.questions[q.id].verified; }).length;
    var finished = verified === quiz.questions.length;
    var context = document.getElementById('quiz-run-context');
    if (context) context.textContent = runLabel(practiceSource) + ' · Rezultat inițial: ' +
      formatPercentage(practiceSource.accuracy) + ' (' + practiceSource.correct + '/' + practiceSource.total + ').';
    var correctionStatus = document.getElementById('quiz-correction-status');
    if (correctionStatus) correctionStatus.textContent = correctionSummary(practiceSource);
    var reset = document.querySelector('.quiz-overall-progress .quiz-reset');
    if (reset) {
      reset.hidden = !finished || !correction.remaining || correction.currentRoundId !== practiceRun.id;
      reset.querySelector('.quiz-reset-start').textContent = correction.remaining === 1 ? 'Corectează greșeala rămasă' : 'Corectează cele ' + correction.remaining + ' greșeli rămase';
    }
    var summary = document.getElementById('quiz-restart-status');
    if (summary) summary.textContent = finished ? (correction.complete ? correctionSummary(practiceSource) :
      'Runda ' + practiceRun.roundNumber + ' este încheiată. Următoarea rundă conține doar greșelile rămase.') : '';
    if (correctionStatus && finished && correction.complete) correctionStatus.textContent = '';
  }

  function syncAnalyticsNotice() {
    if (!analytics || !analytics.getReport) return Promise.resolve();
    var expectedOwner = owner(), version = ++analyticsNoticeVersion;
    return Promise.resolve(analytics.getReport({days:'all'})).then(function (report) {
      if (expectedOwner !== owner() || version !== analyticsNoticeVersion) return;
      analyticsAvailable = report.canPersist !== false;
      var indexed = report.quizzes.find(function (item) { return item.storageKey === sourceQuiz.storageKey; });
      var current = indexed && report.runs.find(function (item) { return item.id === indexed.activeRunId; });
      if (practiceMode) {
        if (!practiceLoading && practiceRun) {
          var source = report.runs.find(function (item) { return item.id === practiceRun.sourceRunId; });
          if (!source || !source.isCurrent || !source.initialComplete) {
            resetGeneration++; practiceRun = null; practiceSource = source || null;
            showPracticeUnavailable(source, indexed);
          } else if (source.correction.currentRoundId !== practiceRun.id) {
            resetGeneration++; practiceRun = null; practiceSource = source;
            showPracticeUnavailable(source, indexed, true);
          } else { practiceSource = source; syncPracticeSummary(); }
        }
      } else {
        if (resetConfirmation && !resetBusy && (!indexed || indexed.activeRunId !== resetConfirmation.runId || resetConfirmation.owner !== owner())) {
          var reset = document.querySelector('.quiz-overall-progress .quiz-reset');
          if (reset) setResetConfirmation(reset,false);
        }
        var practiceLink = document.getElementById('quiz-practice-link');
        if (practiceLink) {
          practiceLink.hidden = !current || !current.initialComplete || !current.correction.canPractice;
          if (!practiceLink.hidden) {
            practiceLink.href = practiceUrl(current.id);
            practiceLink.textContent = 'Corectează greșelile (' + current.correction.remaining + ')';
          }
        }
        var title = document.querySelector('.quiz-progress-title');
        if (title) title.textContent = current ? runLabel(current) : 'Parcurgerea curentă';
        var context = document.getElementById('quiz-run-context');
        if (context) context.textContent = current && current.initialComplete ?
          'Rezultat inițial: ' + formatPercentage(current.accuracy) + ' (' + current.correct + '/' + current.total + ').' : '';
        var correctionStatus = document.getElementById('quiz-correction-status');
        if (correctionStatus) correctionStatus.textContent = current && current.initialComplete && current.wrong ? correctionSummary(current) : '';
      }
      syncStorageNotice();
    }).catch(function () {
      if (expectedOwner !== owner() || version !== analyticsNoticeVersion) return;
      analyticsAvailable = false; syncStorageNotice();
    });
  }

  async function bootstrapSavedRun() {
    var expectedOwner = owner(), generation = resetGeneration;
    if (practiceMode || resetBusy || !analytics || !analytics.ensureRun) return;
    try {
      var pending = analytics.pendingRestart && await analytics.pendingRestart(sourceQuiz.storageKey);
      if (pending || resetBusy || expectedOwner !== owner() || generation !== resetGeneration) return;
      var latest = loadState();
      if (Object.values(latest.questions).some(function (answer) { return answer.verified; })) await analytics.ensureRun(sourceQuiz.storageKey);
    } catch (_) { /* A concurrent restart keeps ownership of the transition. */ }
    if (expectedOwner === owner() && generation === resetGeneration) syncAnalyticsNotice();
  }

  function attemptIdFor(questionId, renew) {
    if (practiceMode) {
      if (!memoryAttempts[questionId]) memoryAttempts[questionId] = analytics.newAttemptId();
      return memoryAttempts[questionId];
    }
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
      ? (sourceQuiz === window.BB_NERVOUS_QUIZ || question.asksFalse ? "De ce afirmația este incorectă" : "Clarificare")
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
        '<fieldset aria-describedby="quiz-instruction quiz-feedback-guide">' +
          '<legend>' + escapeHtml(question.prompt) + '</legend>' +
          '<div class="quiz-options">' + question.options.map(function (option) {
            return renderOption(question, option);
          }).join("") + '</div>' +
        '</fieldset>' +
        '<div class="quiz-result" role="status" aria-live="polite" tabindex="-1"></div>' +
        '<div class="quiz-actions">' +
          '<button class="quiz-check" type="button">Verifică răspunsul</button>' +
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
          '<h1>' + (practiceMode ? 'Runda de corectare ' + practiceRun.roundNumber : 'Grilele ' + range.start + '–' + range.end) + '</h1>' +
          (practiceMode ? '<p>' + escapeHtml(lessonName) + ' · ' + quiz.questions.length + (quiz.questions.length === 1 ? ' grilă.' : ' grile.') + '</p>' : '') +
        '</div>' +
      '</div>' +
      '<div class="quiz-list">' + questions.map(renderQuestion).join("") + '</div>' +
      '<div class="page-nav quiz-page-nav">' + previousLink + '<span class="quiz-page-position">Pagina ' + (index + 1) + ' din ' + quiz.ranges.length + '</span>' + nextLink + '</div>';
  }

  function renderOverallProgress() {
    var root = document.createElement('div');
    root.className = 'quiz-overall-progress';
    root.innerHTML = '<div class="quiz-progress-panel" aria-label="Progresul grilelor">' +
        '<div class="quiz-progress-copy">' +
          '<strong class="quiz-progress-title">Parcurgerea curentă</strong>' +
          '<span id="quiz-sidebar-count" class="quiz-progress-count" aria-live="polite">0/' + quiz.questions.length + ' verificate</span>' +
        '</div>' +
        '<div id="quiz-sidebar-progress" class="quiz-progress-track" aria-hidden="true"><span></span></div>' +
        '<div class="quiz-progress-meta"><span class="quiz-score">0 răspunsuri exacte</span></div>' +
        '<div class="quiz-reset" data-reset-state="idle">' +
          '<button class="quiz-reset-start" type="button">Reîncearcă tot</button>' +
          '<span class="quiz-reset-confirmation" hidden>Parcurgerea curentă se salvează. Reiei toate grilele capitolului?</span>' +
          '<button class="quiz-reset-confirm" type="button" hidden>Da, reiau</button>' +
          '<button class="quiz-reset-cancel" type="button" hidden>Anulează</button>' +
        '</div>' +
      '</div>';
    // Retain the historical progress IDs on the single main summary.
    var summary = root.querySelector('.quiz-progress-panel');
    if (practiceMode) {
      root.querySelector('.quiz-progress-title').textContent = 'Runda de corectare ' + practiceRun.roundNumber;
      root.querySelector('.quiz-reset').hidden = true;
    } else {
      var practiceLink = document.createElement('a');
      practiceLink.id = 'quiz-practice-link'; practiceLink.className = 'quiz-practice-link';
      practiceLink.href = filename + '?mod=greseli'; practiceLink.hidden = true;
      summary.appendChild(practiceLink);
    }
    ['quiz-run-context','quiz-correction-status'].forEach(function (id) {
      var detail = document.createElement('p'); detail.id = id; detail.className = 'quiz-run-detail'; summary.appendChild(detail);
    });
    var message = document.createElement('p');
    message.id = 'quiz-restart-status'; message.setAttribute('role','status');
    summary.appendChild(message);
    var help = document.createElement('details'); help.className = 'quiz-help';
    help.innerHTML = '<summary>Instrucțiuni și culori</summary><div class="quiz-help-content">' +
      '<p>' + (practiceMode ? 'Verifică toate răspunsurile pentru a încheia această rundă.' : 'Rezolvă fiecare grilă, apoi verifică selecția pentru a vedea răspunsul și explicațiile.') + '</p>' +
      '<p id="quiz-instruction" class="quiz-instruction">Bifează toate variantele care răspund cerinței.</p>' +
      '<p id="quiz-feedback-guide" class="quiz-feedback-guide">După verificare: <span class="quiz-key-selected">verde — corect bifat</span>; <span class="quiz-key-missed">galben — corect omis</span>; <span class="quiz-key-extra">roșu — bifat în plus</span>.</p>' +
      '<div id="quiz-map-key" class="quiz-map-legend"><span>○ Necompletată</span><span>◐ În lucru</span><span>✓ Corectă</span><span>× Greșită</span></div></div>';
    root.appendChild(help);
    document.getElementById('quiz-content').prepend(root);
  }

  function owner() { return window.BBUserStorage ? window.BBUserStorage.owner() : 'guest'; }
  function locked(operation) {
    var key = 'bb-quiz-check:' + owner() + ':' + quiz.storageKey;
    return navigator.locks && navigator.locks.request ? navigator.locks.request(key, operation) : Promise.resolve().then(operation);
  }

  function requireAnswerPersistence() {
    if (storageAvailable && (!window.BBUserStorage || window.BBUserStorage.canPersist())) return;
    storageAvailable = false; syncStorageNotice();
    throw new Error('Reluarea nu a putut fi salvată. Răspunsurile sunt păstrate.');
  }

  async function recoverRestart(expectedOwner) {
    if (practiceMode || !analytics || !analytics.pendingRestart) return;
    var ticket = await analytics.pendingRestart(quiz.storageKey);
    if (!ticket || expectedOwner !== owner()) return;
    requireAnswerPersistence();
    var previousState = state, previousAttempts = memoryAttempts;
    var savedAttempts = window.BBUserStorage ? window.BBUserStorage.get(attemptKey) : localStorage.getItem(attemptKey);
    state = blankState(); memoryAttempts = {};
    if (window.BBUserStorage) window.BBUserStorage.set(attemptKey,null);
    else localStorage.removeItem(attemptKey);
    saveState();
    if (!storageAvailable) {
      // A quota/permission failure can still change the adapter's session cache.
      // Keep that recoverable copy until the pending reset can finish durably.
      state = previousState; memoryAttempts = previousAttempts;
      if (window.BBUserStorage) {
        window.BBUserStorage.set(quiz.storageKey,state);
        window.BBUserStorage.set(attemptKey,savedAttempts);
      } else {
        try {
          localStorage.setItem(quiz.storageKey,JSON.stringify(state));
          if (savedAttempts == null) localStorage.removeItem(attemptKey); else localStorage.setItem(attemptKey,savedAttempts);
        } catch (_) { /* The current page still retains its answers in memory. */ }
      }
      throw new Error('Reluarea nu a putut fi salvată. Reîncarcă pagina; parcurgerea veche este păstrată.');
    }
    await analytics.finishRestart({storageKey:quiz.storageKey,resetId:ticket.id});
    syncAllQuestionCards(); syncProgress();
  }

  function renderNavigation() {
    var root = document.getElementById("quiz-navigation");
    if (!root) return;
    var indexed = (window.BB_QUIZ_INDEX || []).find(function (item) { return item.storageKey === quiz.storageKey; });
    var chapterNum = indexed ? indexed.chapterNum : (chapter ? chapter.num : "");
    root.innerHTML =
      '<div class="quiz-sidebar-top">' +
        '<div class="quiz-sidebar-links"><a href="testare.html">← Toate testele</a><a href="' + escapeHtml(lessonUrl) + '" title="' + escapeHtml(lessonName) + '">Lecția</a>' +
        '<a href="statistici.html?capitol=' + encodeURIComponent(chapterNum) + '">Statistici ↗</a></div>' +
        (practiceMode ? '<a class="quiz-practice-back" href="' + escapeHtml(filename) + '">Înapoi la testul complet</a>' : '') +
        '<p class="quiz-map-label">Alege grila</p>' +
        '<p id="quiz-storage-notice" role="status" hidden>Salvarea locală nu este disponibilă.</p>' +
      '</div>' +
      '<div class="quiz-map-scroll"><div class="quiz-question-map" aria-label="Grilele capitolului"' + (quiz.questions.length ? ' aria-describedby="quiz-map-key"' : '') + '>' + quiz.questions.map(function (question) {
        var range = quiz.ranges.find(function (item) { return question.number >= item.start && question.number <= item.end; });
        return '<a href="#grila-' + question.number + '" data-map-question="' + question.id + '" data-range="' + range.id + '"><span class="quiz-map-number">' + question.number + '</span><span class="quiz-map-icon" aria-hidden="true">○</span></a>';
      }).join("") + '</div></div>';
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
    card.classList.toggle("is-verified", saved.verified);
    card.classList.toggle("is-correct", saved.verified && saved.correct);
    card.classList.toggle("is-review", saved.verified && !saved.correct);

    if (!saved.verified) {
      result.className = "quiz-result";
      result.textContent = "";
      status.textContent = saved.selected.length ? "În lucru" : "Necompletată";
      status.className = "quiz-question-status" + (saved.selected.length ? " is-in-progress" : "");
      check.hidden = false;
    } else {
      result.className = "quiz-result " + (saved.correct ? "is-correct" : "is-review");
      result.innerHTML = saved.correct
        ? '<strong>Răspuns corect.</strong> Ai selectat exact combinația ' + question.correct.join(", ") + "."
        : '<strong>Mai ai de revizuit.</strong> Combinația corectă este ' + question.correct.join(", ") + ".";
      status.textContent = saved.correct ? "Corectă" : "De revizuit";
      status.className = "quiz-question-status " + (saved.correct ? "is-correct" : "is-review");
      check.hidden = true;
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
    var percentage = quiz.questions.length ? Math.round((verified / quiz.questions.length) * 100) : 0;

    document.querySelectorAll(".quiz-progress-count").forEach(function (node) {
      node.textContent = verified + "/" + quiz.questions.length + " verificate";
    });
    document.querySelectorAll(".quiz-score").forEach(function (node) {
      node.textContent = correct + (correct === 1 ? " răspuns exact" : " răspunsuri exacte");
    });
    document.querySelectorAll(".quiz-progress-track span").forEach(function (node) {
      node.style.width = percentage + "%";
    });

    if (practiceMode) syncPracticeSummary();
    quiz.ranges.forEach(function (range) {
      var stats = rangeStats(range);
      var count = quiz.questions.filter(function (q) { return q.number >= range.start && q.number <= range.end; }).length;
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
    var card = button.closest('.quiz-question');
    var question = quiz.questions.find(function (item) { return item.id===card.dataset.questionId; });
    if (resetBusy || pendingChecks.has(question.id) || questionState(question).verified) return;
    var selected = selectedFromCard(card);
    var result = card.querySelector('.quiz-result');
    if (!selected.length) {
      result.className = 'quiz-result is-error'; result.textContent = 'Alege cel puțin o variantă înainte de verificare.';
      result.focus({preventScroll:true}); return;
    }
    pendingChecks.add(question.id); button.disabled = true;
    var generation = resetGeneration, expectedOwner = owner();
    try {
      await recovery;
      await (analytics ? analytics.ready : analyticsReady);
      await locked(async function () {
        if (generation!==resetGeneration || expectedOwner!==owner()) return;
        await recoverRestart(expectedOwner);
        var latest=loadState(); if (!practiceMode && storageAvailable) state=latest;
        if (questionState(question).verified) { syncAllQuestionCards(); syncProgress(); return; }
        var run = practiceMode ? await analytics.ensurePractice(quiz.storageKey, false, practiceSourceRunId) : analytics && analytics.ensureRun ? await analytics.ensureRun(quiz.storageKey) : null;
        // The answer cache can be reset on another device while this browser
        // retains its completed local traversal. An explicit verification of
        // fresh drafts starts a successor; never reuse that frozen result.
        if (!practiceMode && run && quiz.questions.every(function (item) {
          return run.answers[item.id] && run.answers[item.id].verified;
        }) && !Object.values(state.questions).some(function (answer) { return answer.verified; })) {
          var drafts = state;
          requireAnswerPersistence();
          var ticket = await analytics.prepareRestart({storageKey:quiz.storageKey,runId:run.id,resetId:analytics.newAttemptId(),answers:state.questions});
          if (!ticket || ticket.runId !== run.id || generation!==resetGeneration || expectedOwner!==owner()) throw new Error('Traversal changed');
          await recoverRestart(expectedOwner);
          if (generation!==resetGeneration || expectedOwner!==owner()) return;
          state = drafts;
          saveState();
          requireAnswerPersistence();
          syncAllQuestionCards(); syncProgress();
          run = await analytics.ensureRun(quiz.storageKey);
        }
        if (practiceMode && (!run || !practiceRun || run.id !== practiceRun.id)) throw new Error('Practice changed');
        if (generation!==resetGeneration || expectedOwner!==owner()) return;
        var attemptId=attemptIdFor(question.id,false);
        var saved={selected:selected,verified:true,correct:sameLetters(selected,question.correct)};
        if (analytics && analytics.recordAttempt) {
          var recorded=await analytics.recordAttempt({storageKey:quiz.storageKey,questionId:question.id,selected:selected,
            correct:saved.correct,attemptId:attemptId,runId:run && run.id,answerKey:question.correct.slice()});
          if (expectedOwner!==owner()) return;
          // A rejected commit may mean a reset/clear won the race. Read again;
          // the pre-write run snapshot cannot authorize saving a tentative answer.
          if (!recorded) {
            var committed = run && (practiceMode ? await analytics.ensurePractice(quiz.storageKey, false, practiceSourceRunId) : await analytics.ensureRun(quiz.storageKey));
            var answer = committed && committed.answers[question.id];
            if (!committed || committed.id!==run.id || !answer || !answer.eventId || !answer.verified) throw new Error('Verification was superseded');
            saved=answer;
          }
        }
        if (generation!==resetGeneration || expectedOwner!==owner()) return;
        state.questions[question.id]={selected:saved.selected,verified:true,correct:saved.correct};
        if (practiceMode) practiceRun.answers[question.id] = state.questions[question.id];
        saveState(question.id);
        syncQuestionCard(card,question); syncProgress(); result.focus({preventScroll:true});
        await syncAnalyticsNotice();
      });
    } catch (error) {
      if (expectedOwner===owner()) { result.className='quiz-result is-error'; result.textContent='Verificarea nu a putut fi salvată. Reîncarcă pagina și reîncearcă.'; }
    } finally { pendingChecks.delete(question.id); button.disabled=false; }
  }

  function setResetConfirmation(root, open) {
    if (!open) resetConfirmation = null;
    root.dataset.resetState = open ? "confirm" : "idle";
    root.querySelector(".quiz-reset-start").hidden = open;
    root.querySelector(".quiz-reset-confirmation").hidden = !open;
    root.querySelector(".quiz-reset-confirm").hidden = !open;
    root.querySelector(".quiz-reset-cancel").hidden = !open;
    if (open) root.querySelector(".quiz-reset-confirm").focus();
  }

  async function handleReset(action) {
    var root=action.closest('.quiz-reset');
    if (resetBusy) return;
    if (practiceMode) {
      if (!practiceRun || root.hidden || !action.classList.contains('quiz-reset-start')) return;
      resetBusy = true; action.disabled = true;
      var sourceId = practiceSourceRunId, practiceIdentity = owner(), practiceGeneration = resetGeneration;
      try {
        await locked(async function () {
          if (practiceIdentity !== owner() || practiceGeneration !== resetGeneration || sourceId !== practiceSourceRunId) return;
          await startPractice(true);
        });
      } catch (error) {
        var notice = document.getElementById('quiz-restart-status');
        if (notice && practiceIdentity === owner()) notice.textContent = 'Runda următoare nu a putut fi pregătită. Reîncarcă pagina și reîncearcă.';
      } finally { resetBusy = false; action.disabled = false; }
      return;
    }
    if (action.classList.contains('quiz-reset-start')) {
      var openingOwner = owner(), openingGeneration = resetGeneration;
      action.disabled = true;
      try {
        await recovery;
        await locked(async function () {
          if (openingOwner !== owner() || openingGeneration !== resetGeneration) return;
          await recoverRestart(openingOwner);
          if (!analytics || !analytics.ensureRun) throw new Error('History unavailable');
          var run = await analytics.ensureRun(quiz.storageKey);
          if (!run || openingOwner !== owner() || openingGeneration !== resetGeneration) return;
          resetConfirmation = {owner:openingOwner,runId:run.id};
          setResetConfirmation(root,true);
        });
      } catch (_) {
        if (openingOwner === owner()) document.getElementById('quiz-restart-status').textContent = 'Reluarea nu este disponibilă. Reîncarcă pagina și reîncearcă.';
      } finally { action.disabled = false; }
    }
    else if (action.classList.contains('quiz-reset-cancel')) { setResetConfirmation(root,false); root.querySelector('.quiz-reset-start').focus(); }
    else if (action.classList.contains('quiz-reset-confirm')) {
      var confirmation = resetConfirmation;
      if (!confirmation || confirmation.owner !== owner()) { setResetConfirmation(root,false); return; }
      resetBusy=true;
      var expectedOwner=confirmation.owner, generation=resetGeneration;
      var status=document.getElementById('quiz-restart-status'); status.textContent='Se salvează parcurgerea…';
      root.querySelectorAll('button').forEach(function (b) { b.disabled=true; });
      try {
        await recovery;
        await locked(async function () {
          if (expectedOwner!==owner() || generation!==resetGeneration || confirmation !== resetConfirmation) return;
          if (!analytics || !analytics.prepareRestart) throw new Error('Istoricul nu este disponibil. Răspunsurile sunt păstrate.');
          var activeRun = await analytics.ensureRun(quiz.storageKey);
          if (!activeRun || activeRun.id !== confirmation.runId || confirmation.owner !== owner()) {
            setResetConfirmation(root,false);
            status.textContent='Parcurgerea s-a schimbat. Verifică rezultatele curente înainte de a o relua.';
            return;
          }
          var latest=loadState(); if (!practiceMode && storageAvailable) state=latest;
          requireAnswerPersistence();
          var ticket=await analytics.prepareRestart({storageKey:quiz.storageKey,runId:confirmation.runId,resetId:analytics.newAttemptId(),answers:state.questions});
          if (expectedOwner!==owner()) return;
          if (!ticket) {
            var unchanged = await analytics.ensureRun(quiz.storageKey);
            if (!unchanged || unchanged.id !== confirmation.runId) { var stale = new Error('Traversal changed'); stale.code = 'stale-run'; throw stale; }
          }
          resetGeneration++;
          if (ticket) await recoverRestart(expectedOwner);
          else { state=blankState(); memoryAttempts={}; if(window.BBUserStorage)window.BBUserStorage.set(attemptKey,null); else localStorage.removeItem(attemptKey); saveState(); }
          syncAllQuestionCards(); syncProgress(); setResetConfirmation(root,false);
          location.hash=quiz.ranges[0].id;
          root.querySelector('.quiz-reset-start').focus({preventScroll:true});
          window.scrollTo({top:0,behavior:'instant'});
          status.textContent=ticket?'Parcurgerea a fost salvată. Poți începe din nou.':'Poți începe rezolvarea grilelor.';
        });
      } catch (error) {
        if (expectedOwner===owner()) {
          setResetConfirmation(root,false);
          var recoveredState=loadState(); if (storageAvailable) state=recoveredState;
          syncAllQuestionCards(); syncProgress();
          status.textContent=error.code === 'stale-run' ? 'Parcurgerea s-a schimbat. Răspunsurile curente sunt păstrate.' : 'Parcurgerea nu a putut fi salvată. Răspunsurile sunt păstrate; reîncearcă după reîncărcarea paginii.';
        }
      }
      finally { resetBusy=false; root.querySelectorAll('button').forEach(function (b) { b.disabled=false; }); }
    }
  }

  function installEvents() {
    window.addEventListener("storage", function (event) {
      if (practiceMode || window.BBUserStorage || (event.key !== quiz.storageKey && event.key !== null)) return;
      state = loadState();
      syncAllQuestionCards();
      syncProgress();
      bootstrapSavedRun();
    });
    document.addEventListener("bb:cache-change", function () {
      if (resetConfirmation && resetConfirmation.owner !== owner()) {
        var reset = document.querySelector('.quiz-overall-progress .quiz-reset');
        if (reset) setResetConfirmation(reset,false);
      }
      if (practiceMode) {
        if (practiceOwner !== owner()) {
          resetGeneration++; practiceRun = null; practiceSource = null; state = blankState();
          replacePracticeContent('<p class="quiz-practice-loading" role="status">Se încarcă greșelile…</p>');
          document.getElementById('quiz-navigation').innerHTML = '';
          startPractice(false).catch(showFatalError);
        }
        return;
      }
      resetGeneration += 1;
      memoryAttempts = {};
      state = loadState();
      syncAllQuestionCards();
      syncProgress();
      bootstrapSavedRun();
    });
    document.addEventListener("bb:lesson-section-change", syncQuestionMap);
    document.addEventListener("change", handleQuestionChange);
    document.addEventListener("click", function (event) {
      var check = event.target.closest(".quiz-check");
      if (check) return handleCheck(check);
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

  function replacePracticeContent(html) {
    var main = document.getElementById('quiz-content');
    main.querySelectorAll('.page-section, .quiz-overall-progress, .quiz-practice-loading').forEach(function (node) { node.remove(); });
    main.insertAdjacentHTML('afterbegin', html);
  }

  function showPracticeUnavailable(source, indexed, superseded) {
    var title, description, label = 'Continuă testul complet', href = filename;
    if (superseded) {
      title = 'O rundă nouă este deja începută';
      description = 'Continuă runda curentă a acestei parcurgeri.';
      label = 'Continuă corectarea'; href = practiceUrl(source.id);
    } else if ((source && !source.isCurrent) || (practiceSourceRunId && !source)) {
      title = 'Această parcurgere nu mai este activă';
      description = 'Rezultatele ei sunt păstrate în statistici. Continuă parcurgerea curentă a capitolului.';
    } else if (!source || !source.initialComplete) {
      title = 'Termină parcurgerea inițială';
      description = 'Verifică toate cele ' + sourceQuiz.questions.length + ' grile ale capitolului înainte de a corecta greșelile.';
    } else {
      title = source.correction.corrected ? 'Toate greșelile sunt corectate' : 'Nicio greșeală de corectat';
      description = source.correction.corrected ? correctionSummary(source) : 'Ai răspuns corect la toate grilele din parcurgerea inițială.';
      label = 'Înapoi la testul complet';
    }
    quiz = Object.assign({},sourceQuiz,{questions:[],ranges:[]}); state = blankState();
    replacePracticeContent('<section class="page-section active" id="page-greseli-1" data-practice-empty><div class="hero quiz-hero"><div><h1>' + title + '</h1><p>' + description + '</p><a class="quiz-practice-back" href="' + escapeHtml(href) + '">' + label + '</a></div></div></section>');
    renderNavigation(); syncProgress(); document.dispatchEvent(new CustomEvent('bb:quiz-ready'));
  }

  async function startPractice(restart) {
    var expectedOwner = owner(), generation = resetGeneration;
    practiceOwner = expectedOwner; practiceLoading = true;
    try {
      await analytics.ready;
      var run = await analytics.ensurePractice(sourceQuiz.storageKey, restart, practiceSourceRunId);
      var report = await analytics.getReport({days:'all'});
      if (expectedOwner !== owner() || generation !== resetGeneration) return;
      var indexed = report.quizzes.find(function (item) { return item.storageKey === sourceQuiz.storageKey; });
      var sourceId = run ? run.sourceRunId : practiceSourceRunId || indexed && indexed.activeRunId;
      var source = report.runs.find(function (item) { return item.id === sourceId; });
      practiceRun = run; practiceSource = source || null; memoryAttempts = {};
      document.body.dataset.quizMode = 'mistakes';
      document.title = 'Corectarea greșelilor · ' + lessonName;
      if (!run) { showPracticeUnavailable(source,indexed); return; }
      practiceSourceRunId = run.sourceRunId;
      var url = new URL(location.href); url.searchParams.set('parcurgere',practiceSourceRunId);
      if (restart) url.hash = 'greseli-1';
      history.replaceState(null,'',url.pathname + url.search + url.hash);
      var questions = sourceQuiz.questions.filter(function (q) { return run.questionIds.includes(q.id); });
      var ranges = [];
      for (var i = 0; i < questions.length; i += 10) {
        var group = questions.slice(i, i + 10);
        ranges.push({id:'greseli-' + (ranges.length + 1),start:group[0].number,end:group[group.length - 1].number});
      }
      quiz = Object.assign({},sourceQuiz,{questions:questions,ranges:ranges}); state = loadState();
      replacePracticeContent(ranges.map(function (range,index) {
        return '<div class="page-section' + (index ? '' : ' active') + '" id="page-' + range.id + '"></div>';
      }).join(''));
      quiz.ranges.forEach(renderRange); renderOverallProgress(); renderNavigation(); syncAllQuestionCards(); syncProgress();
      document.dispatchEvent(new CustomEvent('bb:quiz-ready'));
      if (restart) { window.scrollTo({top:0,behavior:'instant'}); document.querySelector('.quiz-progress-title')?.scrollIntoView({block:'nearest'}); }
    } finally {
      if (expectedOwner === owner() && generation === resetGeneration) { practiceLoading = false; syncAnalyticsNotice(); }
    }
  }

  function init() {
    try {
      // Session hydration may finish before DOMContentLoaded listeners are installed.
      state = loadState();
      validateData();
      if (practiceMode) {
        installEvents(); customizeSharedControls();
        if (analytics && analytics.subscribe) analytics.subscribe(syncAnalyticsNotice);
        document.getElementById('quiz-content').insertAdjacentHTML('afterbegin', '<p class="quiz-practice-loading" role="status">Se încarcă greșelile…</p>');
        startPractice(false).catch(showFatalError);
        return;
      }
      quiz.ranges.forEach(renderRange);
      renderOverallProgress();
      renderNavigation();
      syncAllQuestionCards();
      syncProgress();
      syncAnalyticsNotice();
      installEvents();
      recovery = locked(async function () {
        var expectedOwner = owner();
        await recoverRestart(expectedOwner);
        if (expectedOwner === owner() && analytics && analytics.ensureRun && Object.values(state.questions).some(function (answer) { return answer.verified; })) await analytics.ensureRun(sourceQuiz.storageKey);
        await syncAnalyticsNotice();
      }).catch(function () {
        document.getElementById('quiz-restart-status').textContent='Reluarea nu a putut fi finalizată. Reîncarcă pagina; istoricul este păstrat.';
      });
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
