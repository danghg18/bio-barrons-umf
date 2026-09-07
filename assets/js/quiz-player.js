(function () {
  "use strict";

  var quiz = window.BB_NERVOUS_QUIZ;
  if (!quiz) return;

  var state = loadState();

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeLetters(values) {
    return Array.from(new Set((values || []).filter(function (value) {
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
      var parsed = JSON.parse(window.localStorage.getItem(quiz.storageKey) || "null");
      if (!parsed || parsed.version !== quiz.version || typeof parsed.questions !== "object") {
        return blankState();
      }
      var knownIds = new Set(quiz.questions.map(function (question) { return question.id; }));
      Object.keys(parsed.questions).forEach(function (id) {
        if (!knownIds.has(id)) delete parsed.questions[id];
        else {
          parsed.questions[id].selected = normalizeLetters(parsed.questions[id].selected);
          parsed.questions[id].verified = !!parsed.questions[id].verified;
          parsed.questions[id].correct = !!parsed.questions[id].correct;
        }
      });
      return parsed;
    } catch (error) {
      return blankState();
    }
  }

  function saveState() {
    try {
      window.localStorage.setItem(quiz.storageKey, JSON.stringify(state));
    } catch (error) {
      // The quiz remains usable when storage is unavailable.
    }
  }

  function validateData() {
    var expectedNumber = 51;
    if (!Array.isArray(quiz.questions) || quiz.questions.length !== 50) {
      throw new Error("Setul trebuie să conțină exact 50 de grile.");
    }
    quiz.questions.forEach(function (question) {
      if (question.number !== expectedNumber) throw new Error("Numerotarea grilelor nu este continuă.");
      if (question.id !== "sn-" + String(question.number).padStart(3, "0")) {
        throw new Error("ID invalid pentru grila " + question.number + ".");
      }
      if (!Array.isArray(question.options) || question.options.length !== 5) {
        throw new Error("Grila " + question.number + " nu are cinci variante.");
      }
      if (question.options.map(function (option) { return option.letter; }).join("") !== "ABCDE") {
        throw new Error("Litere invalide la grila " + question.number + ".");
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
      ? "De ce afirmația este incorectă"
      : "De ce nu se selectează";
    return (
      '<div class="quiz-option-wrap" data-letter="' + option.letter + '">' +
        '<label class="quiz-option" for="' + inputId + '">' +
          '<input id="' + inputId + '" type="checkbox" name="' + question.id + '" value="' + option.letter + '">' +
          '<span class="quiz-option-letter" aria-hidden="true">' + option.letter + '</span>' +
          '<span class="quiz-option-text">' + escapeHtml(option.text) + '</span>' +
          '<span class="quiz-option-state" aria-hidden="true"></span>' +
        '</label>' +
        '<div class="quiz-option-explanation" id="' + inputId + '-explanation" hidden>' +
          '<strong>' + explanationLabel + '</strong>' +
          '<p>' + escapeHtml(option.why || "") + '</p>' +
        '</div>' +
      '</div>'
    );
  }

  function renderQuestion(question) {
    return (
      '<article class="quiz-question" id="grila-' + question.number + '" data-question-id="' + question.id + '">' +
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
      ? '<a class="outline" href="#' + previous.id + '" onclick="goto(\'' + previous.id + '\')">← Grilele ' + previous.start + '–' + previous.end + '</a>'
      : '<a class="outline" href="sistemul_nervos.html">← Înapoi la lecție</a>';
    var nextLink = next
      ? '<a href="#' + next.id + '" onclick="goto(\'' + next.id + '\')">Grilele ' + next.start + '–' + next.end + ' →</a>'
      : '<a href="sistemul_nervos.html">Revezi lecția →</a>';

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
          '<span class="quiz-progress-count" aria-live="polite">0 din 50 verificate</span>' +
        '</div>' +
        '<div class="quiz-progress-track" aria-hidden="true"><span></span></div>' +
        '<div class="quiz-progress-meta"><span class="quiz-score">0 răspunsuri exacte</span><span class="quiz-range-score">0/10 în acest set</span></div>' +
        '<div class="quiz-reset" data-reset-state="idle">' +
          '<button class="quiz-reset-start" type="button">Resetează progresul</button>' +
          '<span class="quiz-reset-confirmation" hidden>Ștergi toate răspunsurile salvate?</span>' +
          '<button class="quiz-reset-confirm" type="button" hidden>Da, resetează</button>' +
          '<button class="quiz-reset-cancel" type="button" hidden>Anulează</button>' +
        '</div>' +
      '</div>' +
      '<div class="quiz-list">' + questions.map(renderQuestion).join("") + '</div>' +
      '<div class="page-nav quiz-page-nav">' + previousLink + nextLink + '</div>';
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
    if (saved.verified && option.why) input.setAttribute("aria-describedby", explanation.id);
    else input.removeAttribute("aria-describedby");
    wrap.classList.toggle("is-verified", saved.verified);
    wrap.classList.toggle("is-answer", saved.verified && isAnswer);
    wrap.classList.toggle("is-selected-extra", saved.verified && selected && !isAnswer);

    if (!saved.verified) {
      stateLabel.textContent = "";
      explanation.hidden = true;
    } else if (isAnswer) {
      stateLabel.textContent = "✓ Se selectează";
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
    var verified = quiz.questions.filter(function (question) {
      return state.questions[question.id] && state.questions[question.id].verified;
    }).length;
    var correct = quiz.questions.filter(function (question) {
      return state.questions[question.id] && state.questions[question.id].verified && state.questions[question.id].correct;
    }).length;
    var percentage = Math.round((verified / quiz.questions.length) * 100);

    document.querySelectorAll(".quiz-progress-count").forEach(function (node) {
      node.textContent = verified + " din 50 verificate";
    });
    document.querySelectorAll(".quiz-score").forEach(function (node) {
      node.textContent = correct + (correct === 1 ? " răspuns exact" : " răspunsuri exacte");
    });
    document.querySelectorAll(".quiz-progress-track span").forEach(function (node) {
      node.style.width = percentage + "%";
    });
    var sidebarCount = document.getElementById("quiz-sidebar-count");
    var sidebarTrack = document.querySelector("#quiz-sidebar-progress span");
    if (sidebarCount) sidebarCount.textContent = verified + "/50 verificate";
    if (sidebarTrack) sidebarTrack.style.width = percentage + "%";

    quiz.ranges.forEach(function (range) {
      var stats = rangeStats(range);
      document.querySelectorAll('[data-range-progress="' + range.id + '"]').forEach(function (node) {
        node.textContent = stats.verified + "/10";
      });
      var section = document.getElementById("page-" + range.id);
      if (section) {
        var rangeScore = section.querySelector(".quiz-range-score");
        if (rangeScore) rangeScore.textContent = stats.correct + "/10 exacte în acest set";
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
    saveState();
    syncQuestionCard(card, question);
  }

  function handleCheck(button) {
    var card = button.closest(".quiz-question");
    var question = quiz.questions.find(function (item) { return item.id === card.dataset.questionId; });
    var saved = questionState(question);
    saved.selected = selectedFromCard(card);
    var result = card.querySelector(".quiz-result");
    if (!saved.selected.length) {
      result.className = "quiz-result is-error";
      result.textContent = "Alege cel puțin o variantă înainte de verificare.";
      result.focus({ preventScroll: true });
      return;
    }
    saved.verified = true;
    saved.correct = sameLetters(saved.selected, question.correct);
    saveState();
    syncQuestionCard(card, question);
    syncProgress();
    result.focus({ preventScroll: true });
  }

  function handleRetry(button) {
    var card = button.closest(".quiz-question");
    var question = quiz.questions.find(function (item) { return item.id === card.dataset.questionId; });
    state.questions[question.id] = { selected: [], verified: false, correct: false };
    saveState();
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
      state = blankState();
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
        back.setAttribute("aria-label", "Înapoi la lecția 11");
        back.setAttribute("title", "Înapoi la lecția 11");
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
      validateData();
      quiz.ranges.forEach(renderRange);
      syncAllQuestionCards();
      syncProgress();
      installEvents();
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
