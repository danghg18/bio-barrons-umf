(function () {
  "use strict";

  var STORAGE_KEY = "bb.study.v1";
  var VERSION = 1;
  var listeners = [];
  var canPersist = true;
  var currentState = loadState();
  var deferredVisit = null;

  function emptyState() {
    return { version: VERSION, lastVisited: null, lessons: {} };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function validChapterNum(value) {
    var number = Number(value);
    if (!Number.isInteger(number) || number <= 0) return "";
    if (
      typeof CHAPTERS !== "undefined" &&
      Array.isArray(CHAPTERS) &&
      !CHAPTERS.some(function (chapter) { return chapter.num === number; })
    ) {
      return "";
    }
    return String(number);
  }

  function validSectionId(value) {
    var sectionId = String(value || "").replace(/^page-/, "").trim();
    return sectionId && sectionId.length <= 160 ? sectionId : "";
  }

  function validTimestamp(value) {
    return typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : "";
  }

  function normalize(raw) {
    if (!raw || typeof raw !== "object" || raw.version !== VERSION) return emptyState();

    var normalized = emptyState();
    var visit = raw.lastVisited;
    if (visit && typeof visit === "object") {
      var visitChapter = validChapterNum(visit.chapterNum);
      var visitSection = validSectionId(visit.sectionId);
      var visitedAt = validTimestamp(visit.visitedAt);
      if (visitChapter && visitSection && visitedAt) {
        normalized.lastVisited = {
          chapterNum: Number(visitChapter),
          sectionId: visitSection,
          visitedAt: visitedAt,
        };
      }
    }

    if (raw.lessons && typeof raw.lessons === "object" && !Array.isArray(raw.lessons)) {
      Object.keys(raw.lessons).forEach(function (key) {
        var chapter = validChapterNum(key);
        var lesson = raw.lessons[key];
        if (!chapter || !lesson || typeof lesson !== "object") return;

        var seen = {};
        var completedSections = Array.isArray(lesson.completedSections)
          ? lesson.completedSections.reduce(function (result, value) {
              var sectionId = validSectionId(value);
              if (sectionId && !seen[sectionId]) {
                seen[sectionId] = true;
                result.push(sectionId);
              }
              return result;
            }, [])
          : [];
        var updatedAt = validTimestamp(lesson.updatedAt);
        if (completedSections.length || updatedAt) {
          normalized.lessons[chapter] = {
            completedSections: completedSections,
            updatedAt: updatedAt || new Date(0).toISOString(),
          };
        }
      });
    }
    return normalized;
  }

  function loadState() {
    var stored = null;
    try {
      stored = window.BBUserStorage ? JSON.stringify(window.BBUserStorage.get(STORAGE_KEY)) : window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      canPersist = false;
      return emptyState();
    }
    if (!stored) return emptyState();
    try {
      return normalize(JSON.parse(stored));
    } catch (error) {
      return emptyState();
    }
  }

  function persist() {
    if (!canPersist) return;
    try {
      if (window.BBUserStorage) window.BBUserStorage.set(STORAGE_KEY, currentState);
      else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    } catch (error) {
      canPersist = false;
    }
  }

  function announce(reason) {
    var snapshot = clone(currentState);
    listeners.slice().forEach(function (listener) {
      try {
        listener(snapshot, reason);
      } catch (error) {
        window.setTimeout(function () {
          throw error;
        }, 0);
      }
    });
    document.dispatchEvent(
      new CustomEvent("bb:study-state-change", {
        detail: { state: snapshot, reason: reason },
      })
    );
  }

  function commit(reason) {
    persist();
    announce(reason);
    return clone(currentState);
  }

  function ensureLesson(chapter) {
    if (!currentState.lessons[chapter]) {
      currentState.lessons[chapter] = { completedSections: [], updatedAt: new Date().toISOString() };
    }
    return currentState.lessons[chapter];
  }

  function recordVisit(chapterNum, sectionId) {
    var chapter = validChapterNum(chapterNum);
    var section = validSectionId(sectionId);
    if (!chapter || !section) return clone(currentState);
    if (window.BBAuth && (!window.BBAuth.getState().initialized ||
        (window.BBAuth.getState().user && !window.BBCloudSync?.isHydrated() &&
         ["offline", "error"].indexOf(window.BBCloudSync?.getState().status) === -1))) {
      deferredVisit = {chapter: chapterNum, section: sectionId};
      return clone(currentState);
    }
    currentState.lastVisited = {
      chapterNum: Number(chapter),
      sectionId: section,
      visitedAt: new Date().toISOString(),
    };
    return commit("visit");
  }

  function flushDeferredVisit() {
    if (!deferredVisit || !window.BBAuth?.getState().initialized) return;
    var user = window.BBAuth.getState().user;
    if (window.BBUserStorage.owner() !== (user ? user.id : "guest")) return;
    var visit = deferredVisit;
    deferredVisit = null;
    currentState.lastVisited = {chapterNum:Number(visit.chapter), sectionId:validSectionId(visit.section), visitedAt:new Date().toISOString()};
    commit("visit");
  }
  document.addEventListener("bb:cloud-hydrated", flushDeferredVisit);
  document.addEventListener("bb:auth-ready", function () { if (!window.BBAuth.getState().user) flushDeferredVisit(); });
  document.addEventListener("bb:sync-change", function (event) {
    if (["offline", "error"].indexOf(event.detail.status) !== -1 ||
        (["signedout", "unconfigured"].indexOf(event.detail.status) !== -1 && !window.BBAuth.getState().user)) flushDeferredVisit();
  });

  function completeSection(chapterNum, sectionId) {
    var chapter = validChapterNum(chapterNum);
    var section = validSectionId(sectionId);
    if (!chapter || !section) return clone(currentState);
    var lesson = ensureLesson(chapter);
    if (lesson.completedSections.indexOf(section) !== -1) return clone(currentState);
    lesson.completedSections.push(section);
    lesson.updatedAt = new Date().toISOString();
    return commit("section-completed");
  }

  function completeLesson(chapterNum, sectionIds) {
    var chapter = validChapterNum(chapterNum);
    if (!chapter || !Array.isArray(sectionIds)) return clone(currentState);
    var seen = {};
    var sections = sectionIds.reduce(function (result, value) {
      var section = validSectionId(value);
      if (section && !seen[section]) {
        seen[section] = true;
        result.push(section);
      }
      return result;
    }, []);
    if (!sections.length) return clone(currentState);
    var lesson = ensureLesson(chapter);
    var changed = false;
    sections.forEach(function (section) {
      if (lesson.completedSections.indexOf(section) === -1) {
        lesson.completedSections.push(section);
        changed = true;
      }
    });
    if (!changed) return clone(currentState);
    lesson.updatedAt = new Date().toISOString();
    return commit("lesson-completed");
  }

  function resetLesson(chapterNum) {
    var chapter = validChapterNum(chapterNum);
    if (!chapter || !currentState.lessons[chapter]) return clone(currentState);
    delete currentState.lessons[chapter];
    return commit("lesson-reset");
  }

  function getLessonProgress(chapterNum, sectionIds) {
    var chapter = validChapterNum(chapterNum);
    var seen = {};
    var sections = Array.isArray(sectionIds)
      ? sectionIds.reduce(function (result, value) {
          var section = validSectionId(value);
          if (section && !seen[section]) {
            seen[section] = true;
            result.push(section);
          }
          return result;
        }, [])
      : [];
    var saved = chapter && currentState.lessons[chapter]
      ? currentState.lessons[chapter].completedSections
      : [];
    var completedSections = sections.filter(function (section) {
      return saved.indexOf(section) !== -1;
    });
    return {
      completed: completedSections.length,
      total: sections.length,
      isComplete: sections.length > 0 && completedSections.length === sections.length,
      completedSections: completedSections,
    };
  }

  function subscribe(listener) {
    if (typeof listener !== "function") return function () {};
    listeners.push(listener);
    return function () {
      var index = listeners.indexOf(listener);
      if (index !== -1) listeners.splice(index, 1);
    };
  }

  window.addEventListener("storage", function (event) {
    if (window.BBUserStorage || event.key !== STORAGE_KEY) return;
    try {
      currentState = event.newValue ? normalize(JSON.parse(event.newValue)) : emptyState();
      announce("external-change");
    } catch (error) {
      currentState = emptyState();
      announce("external-change");
    }
  });

  document.addEventListener("bb:cache-change", function (event) {
    currentState = loadState();
    announce(event.detail.reason);
  });

  window.BBStudyState = {
    getState: function () { return clone(currentState); },
    recordVisit: recordVisit,
    completeSection: completeSection,
    completeLesson: completeLesson,
    resetLesson: resetLesson,
    subscribe: subscribe,
    getLessonProgress: getLessonProgress,
  };
})();
