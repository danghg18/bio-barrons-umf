(function () {
  function extractTarget(node) {
    if (!node) return "";
    const onclick = node.getAttribute("onclick") || "";
    const match = onclick.match(/goto\('([^']+)'/);
    return match ? match[1] : "";
  }

  function countSubsections(sectionId) {
    if (window.SUB_NAVS && Array.isArray(window.SUB_NAVS[sectionId])) {
      return window.SUB_NAVS[sectionId].length;
    }
    const section = document.getElementById("page-" + sectionId);
    if (!section) return 0;
    return section.querySelectorAll("section[id]").length || section.querySelectorAll("section").length;
  }

  function getProgressNumbers() {
    const text = document.getElementById("progress-text")?.textContent || "";
    const match = text.match(/(\d+)\s*\/\s*(\d+)/);
    if (!match) return { submitted: 0, total: 0 };
    return {
      submitted: Number(match[1]) || 0,
      total: Number(match[2]) || 0,
    };
  }

  function getQuestionCount() {
    if (Array.isArray(window.QUESTIONS)) return window.QUESTIONS.length;
    return getProgressNumbers().total;
  }

  function getSubmittedCount() {
    if (window.quizState && typeof window.quizState === "object") {
      return Object.values(window.quizState).filter(function (entry) {
        return entry && entry.submitted;
      }).length;
    }
    return getProgressNumbers().submitted;
  }

  function ensureHeroCopy(hero) {
    let copy = hero.querySelector(":scope > .bb-hero-copy");
    if (copy) return copy;

    copy = document.createElement("div");
    copy.className = "bb-hero-copy";

    Array.from(hero.children).forEach(function (child) {
      if (
        child.classList.contains("bb-hero-copy") ||
        child.classList.contains("bb-home-dashboard") ||
        child.classList.contains("bb-section-pills")
      ) {
        return;
      }
      copy.appendChild(child);
    });

    hero.prepend(copy);
    return copy;
  }

  function getChapterNumber() {
    const badge = document.querySelector(".nav-chapter-badge")?.textContent || "";
    const match = badge.match(/\d+/);
    return match ? match[0] : "";
  }

  function getCleanTitle(rawTitle) {
    return (rawTitle || "")
      .replace(/^[^\p{L}\p{N}]+/u, "")
      .replace(/^Capitolul\s+\d+\s*[–-]\s*/i, "")
      .replace(/^\d+(?:\.\d+)*\.\s*/, "")
      .trim();
  }

  function renderSplitTitle(titleEl, title) {
    if (!titleEl || titleEl.dataset.bbTitleReady === "true") return;

    const words = title.split(/\s+/).filter(Boolean);
    const accent = words.length > 1 ? words.pop() : "";
    const main = words.join(" ") || title;

    titleEl.textContent = "";
    titleEl.classList.add("bb-lab-title");

    const mainSpan = document.createElement("span");
    mainSpan.className = "bb-title-main";
    mainSpan.textContent = main;
    titleEl.appendChild(mainSpan);

    if (accent) {
      titleEl.appendChild(document.createTextNode(" "));
      const accentSpan = document.createElement("span");
      accentSpan.className = "bb-title-accent";
      accentSpan.textContent = accent;
      titleEl.appendChild(accentSpan);
    }

    titleEl.dataset.bbTitleReady = "true";
  }

  function enhanceHomeHero() {
    const hero = document.querySelector(".chapter-home .hero");
    if (!hero) return;

    hero.querySelectorAll(".bb-home-dashboard").forEach(function (node) {
      node.remove();
    });

    const copy = ensureHeroCopy(hero);
    copy.classList.add("bb-home-copy");

    const titleEl = copy.querySelector("h1");
    const title = getCleanTitle(titleEl?.textContent || document.querySelector(".nav-chapter-title")?.textContent);
    const chapterNumber = getChapterNumber();

    if (!copy.querySelector(".bb-chapter-kicker")) {
      const kicker = document.createElement("div");
      kicker.className = "bb-chapter-kicker";
      kicker.textContent =
        (chapterNumber ? "Capitol " + chapterNumber + " · " : "") +
        "UMF Cluj · Barron's Biologie";
      copy.prepend(kicker);
    }

    renderSplitTitle(titleEl, title || "Capitol");
  }

  function enhanceSectionHeroes() {
    document.querySelectorAll(".page-section:not(.chapter-home) .hero").forEach(function (hero) {
      const pageSection = hero.closest(".page-section");
      if (!pageSection) return;

      const sectionId = pageSection.id.replace(/^page-/, "");
      const copy = ensureHeroCopy(hero);
      const titleEl = copy.querySelector("h1");
      if (titleEl && titleEl.dataset.bbSectionTitleReady !== "true") {
        titleEl.textContent = getCleanTitle(titleEl.textContent);
        titleEl.dataset.bbSectionTitleReady = "true";
      }

      if (!copy.querySelector(".bb-section-eyebrow")) {
        const eyebrow = document.createElement("div");
        eyebrow.className = "bb-section-eyebrow";
        eyebrow.textContent = sectionId === "grile" ? "Suprafață de antrenament" : "Lecție";
        copy.prepend(eyebrow);
      }

      if (hero.querySelector(".bb-section-pills")) return;

      const pills = document.createElement("div");
      pills.className = "bb-section-pills";

      let labels;
      if (sectionId === "grile") {
        labels = [
          getQuestionCount() + " întrebări",
          "feedback pe opțiuni",
          "analiză progres",
        ];
      } else if (sectionId === "mindmap") {
        const flowNodes = document.querySelectorAll("#fc-wrap .fc-node").length;
        labels = [
          (flowNodes || 5) + " etape interactive",
          "Play / Reset",
          "explicații complete",
        ];
      } else {
        const subsectionCount = countSubsections(sectionId);
        labels = [
          subsectionCount + " subsecțiuni",
          "lecție ilustrată",
          "recapitulare rapidă",
        ];
      }

      labels.forEach(function (label) {
        const pill = document.createElement("span");
        pill.className = "bb-section-pill";
        pill.textContent = label;
        pills.appendChild(pill);
      });

      hero.appendChild(pills);
    });
  }

  function enhanceMapCards() {
    const cards = document.querySelectorAll(".chapter-map .map-card");
    cards.forEach(function (card, index) {
      card.removeAttribute("style");
      card.setAttribute("data-map-index", String(index + 1).padStart(2, "0"));

      if (!card.querySelector(".bb-map-meta")) {
        const meta = document.createElement("span");
        meta.className = "bb-map-meta";
        meta.textContent = /grile/i.test(card.textContent) ? "Antrenament" : "Materie";
        card.appendChild(meta);
      }
    });
  }

  function normalizeHomeMapCards() {
    const home = document.querySelector(".chapter-home");
    if (!home) return;

    const mapCard = Array.from(home.querySelectorAll(":scope > .card")).find(function (card) {
      return /harta\s+capitolului/i.test(card.querySelector("h2")?.textContent || "");
    });
    if (!mapCard) return;

    mapCard.classList.add("chapter-map");

    const grid = mapCard.querySelector(".map-grid-split, .g2, .g3");
    if (!grid) return;

    const targets = Array.from(document.querySelectorAll("#sidenav a"))
      .map(extractTarget)
      .filter(function (target) {
        return target && target !== "home";
      });

    const tones = ["blue", "green", "purple", "orange", "teal", "emerald"];
    const icons = ["🔬", "🧬", "🩺", "📚", "📝", "✨"];

    Array.from(grid.children).forEach(function (item, index) {
      item.classList.add("map-card");

      const tone =
        tones.find(function (name) {
          return item.classList.contains(name) || item.classList.contains("tone-" + name);
        }) || tones[index % tones.length];
      item.classList.add("tone-" + tone);

      const first = item.firstElementChild;
      if (!first || first.tagName !== "DIV" || !first.textContent.trim().match(/^[^\p{L}\p{N}]+$/u)) {
        const icon = document.createElement("div");
        icon.textContent = icons[index % icons.length];
        item.prepend(icon);
      }

      if (!extractTarget(item)) {
        const target = targets[index];
        if (target) {
          item.setAttribute("onclick", "goto('" + target + "')");
          item.setAttribute("role", "button");
          item.setAttribute("tabindex", "0");
          item.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              window.goto?.(target);
            }
          });
        }
      }
    });
  }

  function syncProgressWidgets() {
    const total = getQuestionCount();
    const submitted = getSubmittedCount();
    const pct = total ? Math.round((submitted / total) * 100) : 0;

    document.querySelectorAll("[data-bb-progress-value]").forEach(function (node) {
      node.textContent = submitted + "/" + total;
    });

    document.querySelectorAll("[data-bb-progress-note]").forEach(function (node) {
      node.textContent = total ? pct + "% rezolvat" : "Începe din lecții";
    });
  }

  function syncTopbarTabs() {
    const activeId =
      document.querySelector(".page-section.active")?.id?.replace(/^page-/, "") || "home";
    document.querySelectorAll(".lab-nav a").forEach(function (link, index) {
      if (link.classList.contains("bb-topbar-extra-link")) return;
      const target = extractTarget(link);
      if (!link.dataset.bbLabelReady) {
        if (index === 0) link.textContent = "Lecție";
        if (target === "grile") link.textContent = "Grile UMF";
        link.dataset.bbLabelReady = "true";
      }
      const isQuiz = target === "grile";
      const active = isQuiz ? activeId === "grile" : activeId !== "grile";
      link.classList.toggle("active", active);
    });
  }

  function applyChapterTheme() {
    const chapter = getChapterNumber();
    const title = (
      document.querySelector(".nav-chapter-title")?.textContent ||
      document.title ||
      ""
    ).toLowerCase();

    const themes = {
      "20": { accent: "#059669", light: "#ecfdf5", mid: "#10b981" },
      "22": { accent: "#0891b2", light: "#ecfeff", mid: "#06b6d4" },
      "23": { accent: "#db2777", light: "#fdf2f8", mid: "#ec4899" },
    };

    let theme = themes[chapter];
    if (!theme && title.includes("feminin")) theme = themes["23"];
    if (!theme && title.includes("urinar")) theme = themes["20"];
    if (!theme && title.includes("masculin")) theme = themes["22"];
    if (!theme) return;

    document.body.style.setProperty("--chapter-accent", theme.accent);
    document.body.style.setProperty("--chapter-accent-light", theme.light);
    document.body.style.setProperty("--chapter-accent-mid", theme.mid);
    document.body.style.setProperty("--bb-new-accent", theme.accent);
    document.body.style.setProperty("--bb-new-accent-light", theme.light);
    document.body.style.setProperty("--bb-new-accent-mid", theme.mid);
  }

  function normalizeBrandMark() {
    const mark = document.querySelector(".lab-brand-mark");
    if (!mark || mark.querySelector(".brand-star")) return;

    mark.innerHTML =
      '<svg class="brand-star" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.3l-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z"/></svg>' +
      '<svg class="brand-menu" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
  }

  function patchDesktopBrandClose() {
    if (typeof window.closeNav !== "function" || window.__bbCloseNavPatched) return;
    const originalCloseNav = window.closeNav;
    window.closeNav = function () {
      originalCloseNav.apply(this, arguments);
      if (window.innerWidth > 1024) normalizeBrandMark();
    };
    window.__bbCloseNavPatched = true;
  }

  function searchIconSvg() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.8-3.8"/></svg>';
  }

  function createLessonSearch() {
    const topbar = document.querySelector(".lab-topbar-inner");
    if (!topbar) return null;

    const root = document.createElement("div");
    root.className = "lesson-search";
    root.id = "lesson-search";
    root.innerHTML =
      '<div class="lesson-search-panel">' +
      '<div class="lesson-search-box">' +
      searchIconSvg() +
      '<input id="lesson-search-input" type="text" placeholder="Caută în lecție..." autocomplete="off">' +
      '<span id="lesson-search-count" class="lesson-search-count">0 / 0</span>' +
      '</div>' +
      '<div class="lesson-search-nav">' +
      '<button class="lesson-search-btn" id="lesson-search-prev" aria-label="Rezultatul anterior">↑</button>' +
      '<button class="lesson-search-btn" id="lesson-search-next" aria-label="Rezultatul următor">↓</button>' +
      '</div>' +
      '<button class="lesson-search-close" id="lesson-search-close" aria-label="Închide căutarea">×</button>' +
      '</div>';

    const back = topbar.querySelector(".lab-topbar-back");
    topbar.insertBefore(root, back || null);
    return root;
  }

  function unwrapSharedSearchHighlights() {
    document.querySelectorAll(".search-found, .search-found-current").forEach(function (mark) {
      if (!mark.parentNode) return;
      const parent = mark.parentNode;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
    });
  }

  function collectSharedSearchMatches(term) {
    const needle = String(term || "").trim().toLowerCase();
    if (!needle) return [];
    const matches = [];

    document.querySelectorAll(".page-section").forEach(function (section) {
      if (section.id === "page-grile") return;
      const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const textNode = walker.currentNode;
        const parent = textNode.parentNode;
        if (!parent || !parent.closest) continue;
        if (parent.closest("script, style, nav, button, input, textarea")) continue;

        const text = String(textNode.textContent || "");
        const lower = text.toLowerCase();
        let from = 0;
        while (from < lower.length) {
          const index = lower.indexOf(needle, from);
          if (index === -1) break;
          matches.push({
            sectionId: section.id,
            node: textNode,
            start: index,
            end: index + needle.length,
          });
          from = index + Math.max(1, needle.length);
        }
      }
    });

    return matches.sort(function (a, b) {
      const aHome = document.getElementById(a.sectionId)?.classList.contains("chapter-home") ? 1 : 0;
      const bHome = document.getElementById(b.sectionId)?.classList.contains("chapter-home") ? 1 : 0;
      return aHome - bHome;
    });
  }

  function installLessonSearchCollectorOverride() {
    if (typeof window.collectSearchMatches !== "function") return;
    window.collectSearchMatches = collectSharedSearchMatches;
  }

  function setupSharedLessonSearch(root) {
    if (!root || root.dataset.bbSharedSearchReady === "true") return;
    if (typeof window.searchAndScrollTo === "function") return;

    const input = root.querySelector("#lesson-search-input");
    const count = root.querySelector("#lesson-search-count");
    const prevBtn = root.querySelector("#lesson-search-prev");
    const nextBtn = root.querySelector("#lesson-search-next");
    const closeBtn = root.querySelector("#lesson-search-close");
    if (!input || !count || !prevBtn || !nextBtn || !closeBtn) return;

    root.dataset.bbSharedSearchReady = "true";

    const state = {
      matches: [],
      currentIndex: -1,
    };

    function updateUi() {
      const total = state.matches.length;
      const current = total ? state.currentIndex + 1 : 0;
      count.textContent = current + " / " + total;
      prevBtn.disabled = total < 2;
      nextBtn.disabled = total < 2;
    }

    function clear(resetInput) {
      unwrapSharedSearchHighlights();
      state.matches = [];
      state.currentIndex = -1;
      if (resetInput) input.value = "";
      updateUi();
    }

    function setOpen(isOpen, shouldFocus) {
      root.classList.toggle("open", !!isOpen);
      if (isOpen && typeof window.closeNav === "function") window.closeNav();
      if (isOpen && shouldFocus !== false) {
        setTimeout(function () {
          input.focus();
          input.select();
        }, 40);
      }
    }

    function highlight(matches) {
      const grouped = new Map();
      matches.forEach(function (match, index) {
        match.index = index;
        if (!grouped.has(match.node)) grouped.set(match.node, []);
        grouped.get(match.node).push(match);
      });

      grouped.forEach(function (nodeMatches, node) {
        nodeMatches.sort(function (a, b) {
          return b.start - a.start;
        });
        nodeMatches.forEach(function (match) {
          const range = document.createRange();
          range.setStart(node, match.start);
          range.setEnd(node, match.end);
          const span = document.createElement("span");
          span.className = "search-found";
          span.setAttribute("data-search-index", String(match.index));
          range.surroundContents(span);
          match.element = span;
        });
      });
    }

    function goTo(index) {
      const total = state.matches.length;
      if (!total) {
        updateUi();
        return;
      }
      const normalized = ((index % total) + total) % total;
      if (state.currentIndex >= 0) {
        const previous = state.matches[state.currentIndex];
        if (previous.element) previous.element.classList.remove("search-found-current");
      }

      state.currentIndex = normalized;
      const target = state.matches[normalized];
      if (target.element) {
        target.element.classList.add("search-found-current");
        const targetSection = target.sectionId.replace(/^page-/, "");
        const activeSection = document.querySelector(".page-section.active");
        const activeSectionId = activeSection ? activeSection.id.replace(/^page-/, "") : "";
        if (activeSectionId !== targetSection && typeof window.goto === "function") {
          window.goto(targetSection);
        }
        requestAnimationFrame(function () {
          target.element.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
      updateUi();
    }

    function search(term) {
      const cleanTerm = String(term || "").trim();
      if (!cleanTerm) {
        clear(false);
        return;
      }
      unwrapSharedSearchHighlights();
      state.matches = collectSharedSearchMatches(cleanTerm);
      state.currentIndex = -1;
      if (!state.matches.length) {
        updateUi();
        return;
      }
      highlight(state.matches);
      goTo(0);
    }

    input.addEventListener("input", function () {
      search(input.value);
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        goTo(state.currentIndex + (event.shiftKey ? -1 : 1));
      }
      if (event.key === "Escape") {
        event.preventDefault();
        clear(true);
        setOpen(false, false);
      }
    });
    prevBtn.addEventListener("click", function () {
      goTo(state.currentIndex - 1);
    });
    nextBtn.addEventListener("click", function () {
      goTo(state.currentIndex + 1);
    });
    closeBtn.addEventListener("click", function () {
      clear(true);
      setOpen(false, false);
    });
    document.addEventListener("keydown", function (event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        setOpen(true, true);
      }
    });
    updateUi();
  }

  function ensureLessonSearchControl() {
    let root = document.getElementById("lesson-search");
    if (!root) root = createLessonSearch();
    if (!root) return;

    root.classList.add("bb-search-compact");
    if (!root.querySelector(".lesson-search-trigger")) {
      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "lesson-search-trigger";
      trigger.setAttribute("aria-label", "Caută în lecție");
      trigger.setAttribute("title", "Caută în lecție");
      trigger.innerHTML = searchIconSvg();
      root.prepend(trigger);
      trigger.addEventListener("click", function () {
        if (root.classList.contains("open")) {
          const closeBtn = root.querySelector("#lesson-search-close");
          if (closeBtn) closeBtn.click();
          else root.classList.remove("open");
          return;
        }
        if (typeof window.openLessonSearchPanel === "function") {
          window.openLessonSearchPanel();
        } else if (typeof window.openLessonSearch === "function") {
          window.openLessonSearch();
        } else {
          root.classList.add("open");
          const input = root.querySelector("#lesson-search-input");
          if (input) setTimeout(function () { input.focus(); }, 40);
        }
      });
    }

    setupSharedLessonSearch(root);
  }

  function ensureSidebarSettings() {
    const sidenav = document.getElementById("sidenav");
    if (!sidenav) return;

    const navSearchButton = document.getElementById("nav-search-btn");
    let settingsGroup =
      navSearchButton?.closest(".nav-group") ||
      document.getElementById("bb-sidebar-settings");
    if (!settingsGroup) {
      settingsGroup = document.createElement("div");
      settingsGroup.className = "nav-group";
      settingsGroup.innerHTML =
        '<div class="nav-divider"></div>' +
        '<div class="nav-group-label">Setări</div>';
      sidenav.appendChild(settingsGroup);
    }
    settingsGroup.id = "bb-sidebar-settings";
    settingsGroup.classList.add("bb-sidebar-settings");

    function moveOrCreateButton(id, label, handlerName) {
      let button = document.getElementById(id);
      if (!button) {
        button = document.createElement("button");
        button.id = id;
        button.className = "nav-settings-btn";
        button.type = "button";
        button.setAttribute("onclick", handlerName + "()");
        button.innerHTML = '<span class="dot"></span> <span>' + label + "</span>";
      }
      button.classList.add("nav-settings-btn");
      button.style.display = "";
      settingsGroup.appendChild(button);
    }

    if (typeof window.toggleDarkMode === "function") {
      moveOrCreateButton("nav-dm-btn", "Mod noapte", "toggleDarkMode");
    }
    if (typeof window.toggleHighlighter === "function") {
      moveOrCreateButton("nav-hl-btn", "Evidențiator", "toggleHighlighter");
    }
  }

  function watchPageChanges() {
    syncTopbarTabs();
    const main = document.querySelector("main");
    if (!main || typeof MutationObserver === "undefined") return;

    const observer = new MutationObserver(function () {
      syncTopbarTabs();
    });

    observer.observe(main, {
      attributes: true,
      subtree: true,
      attributeFilter: ["class"],
    });
  }

  function normalizeTopbarShape() {
    const links = Array.from(document.querySelectorAll(".lab-nav a"));
    const hasQuizTab = links.some(function (link) {
      return extractTarget(link) === "grile";
    });
    if (!hasQuizTab) {
      document.body.classList.add("bb-compact-topbar");
      links.forEach(function (link, index) {
        if (index === 0) {
          link.textContent = "Lecție";
          link.dataset.bbLabelReady = "true";
          link.classList.add("active");
        } else {
          link.remove();
        }
      });
    }
    if (!document.getElementById("lesson-search")) {
      document.body.classList.add("bb-no-lesson-search");
    }
  }

  function normalizeSidebarState() {
    const links = Array.from(document.querySelectorAll("#sidenav a"));
    if (!links.length) return;
    const hasActiveLink = links.some(function (link) {
      return link.classList.contains("active");
    });
    if (!hasActiveLink) links[0].classList.add("active");
  }

  function observeProgress() {
    syncProgressWidgets();

    const progressTarget = document.getElementById("progress-text");
    if (!progressTarget || typeof MutationObserver === "undefined") return;

    const observer = new MutationObserver(function () {
      syncProgressWidgets();
    });

    observer.observe(progressTarget, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  function init() {
    if (document.body.dataset.bbRedesignReady === "true") return;
    document.body.dataset.bbRedesignReady = "true";
    document.body.classList.add("bb-chapter-redesign");

    applyChapterTheme();
    normalizeBrandMark();
    patchDesktopBrandClose();
    ensureLessonSearchControl();
    installLessonSearchCollectorOverride();
    normalizeTopbarShape();
    ensureSidebarSettings();
    normalizeSidebarState();
    enhanceHomeHero();
    enhanceSectionHeroes();
    normalizeHomeMapCards();
    enhanceMapCards();
    observeProgress();
    watchPageChanges();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
