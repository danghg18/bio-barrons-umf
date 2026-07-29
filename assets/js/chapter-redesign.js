(function () {
  "use strict";

  var state = {
    drawerReturnFocus: null,
    searchReturnFocus: null,
    searchRoot: null,
    ownedSearch: false,
    searchTimer: 0,
    searchMatches: [],
    searchIndex: -1,
    suppressNextRouteFocus: false,
    highlighterEnabled: false,
    highlighterColor: "yellow",
    pageCloseNav: null,
  };

  var HIGHLIGHTER_COLORS = [
    { id: "yellow", label: "Galben" },
    { id: "green", label: "Verde" },
    { id: "blue", label: "Albastru" },
    { id: "pink", label: "Roz" },
    { id: "violet", label: "Mov" },
    { id: "orange", label: "Portocaliu" },
  ];

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // Storage may be unavailable in private browsing or embedded contexts.
    }
  }

  function normalizeHighlighterColor(value) {
    var candidate = String(value || "").toLowerCase();
    return HIGHLIGHTER_COLORS.some(function (color) {
      return color.id === candidate;
    })
      ? candidate
      : "yellow";
  }

  function getHighlighterColorLabel(value) {
    var normalized = normalizeHighlighterColor(value);
    var match = HIGHLIGHTER_COLORS.find(function (color) {
      return color.id === normalized;
    });
    return match ? match.label : "Galben";
  }

  function getGotoTarget(node) {
    if (!node) return "";
    var handler = node.getAttribute("onclick") || "";
    var match = handler.match(/goto\(\s*['\"]([^'\"]+)['\"]/);
    return match ? match[1] : "";
  }

  function getActiveSectionId() {
    var active = document.querySelector(".page-section.active");
    return active ? active.id.replace(/^page-/, "") : "home";
  }

  function applyChapterTheme() {
    var badge = document.querySelector(".nav-chapter-badge");
    var match = String(badge ? badge.textContent : document.title).match(/\d+/);
    var chapter = match ? match[0] : "";
    var themes = {
      "1": { accent: "#2563eb", light: "#eff6ff", mid: "#3b82f6" },
      "3": { accent: "#2563eb", light: "#eff6ff", mid: "#3b82f6" },
      "6": { accent: "#0891b2", light: "#ecfeff", mid: "#06b6d4" },
      "8": { accent: "#0891b2", light: "#ecfeff", mid: "#06b6d4" },
      "20": { accent: "#059669", light: "#ecfdf5", mid: "#10b981" },
      "22": { accent: "#0891b2", light: "#ecfeff", mid: "#06b6d4" },
      "23": { accent: "#db2777", light: "#fdf2f8", mid: "#ec4899" },
    };
    var theme = themes[chapter];
    if (!theme) return;

    [
      ["--chapter-accent", theme.accent],
      ["--chapter-accent-light", theme.light],
      ["--chapter-accent-mid", theme.mid],
      ["--bb-new-accent", theme.accent],
      ["--bb-new-accent-light", theme.light],
      ["--bb-new-accent-mid", theme.mid],
    ].forEach(function (entry) {
      document.body.style.setProperty(entry[0], entry[1]);
    });
  }

  function normalizeBrand() {
    var brand = document.querySelector(".lab-brand");
    var mark = brand && brand.querySelector(".lab-brand-mark");
    if (!brand || !mark) return;

    mark.innerHTML =
      '<img class="brand-logo-mark" src="assets/logo-mark.svg" alt="" width="30" height="30" decoding="async">';
    brand.removeAttribute("aria-controls");
    brand.removeAttribute("aria-expanded");
    brand.setAttribute("title", "Pagina principală");
  }

  function drawerIcon(open) {
    var path = open ? "M18 6 6 18M6 6l12 12" : "M3 6h18M3 12h18M3 18h18";
    return (
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">' +
      '<path d="' +
      path +
      '"/></svg>'
    );
  }

  function ensureMenuTrigger() {
    var topbar = document.querySelector(".lab-topbar-inner");
    var brand = topbar && topbar.querySelector(".lab-brand");
    if (!topbar || !brand) return null;
    var trigger = topbar.querySelector(".lab-menu-trigger");
    if (!trigger) {
      trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "lab-menu-trigger";
      trigger.setAttribute("aria-controls", "sidenav");
      topbar.insertBefore(trigger, brand);
    }
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", "Deschide cuprinsul");
    trigger.setAttribute("title", "Deschide cuprinsul");
    trigger.innerHTML = drawerIcon(false);
    return trigger;
  }

  function ensureSkipLink() {
    var main = document.querySelector("main");
    if (!main) return;
    if (!main.id) main.id = "main-content";
    var existing = document.querySelector(".lesson-skip, .bb-skip-link");
    if (existing) {
      existing.classList.add("lab-skip", "bb-skip-link");
      existing.href = "#" + main.id;
      return;
    }

    var link = document.createElement("a");
    link.className = "lab-skip bb-skip-link";
    link.href = "#" + main.id;
    link.textContent = "Sari la conținut";
    Object.assign(link.style, {
      position: "fixed",
      top: "8px",
      left: "8px",
      zIndex: "1000",
      padding: "10px 14px",
      borderRadius: "10px",
      background: "#0f172a",
      color: "#ffffff",
      fontWeight: "800",
      transform: "translateY(-160%)",
      transition: "transform 150ms ease-out",
    });
    link.addEventListener("focus", function () {
      link.style.transform = "translateY(0)";
    });
    link.addEventListener("blur", function () {
      link.style.transform = "translateY(-160%)";
    });
    document.body.prepend(link);
  }

  function normalizeBackAction() {
    var topbar = document.querySelector(".lab-topbar-inner");
    if (!topbar) return;
    var back = topbar.querySelector(".lab-topbar-back");
    if (!back) return;
    back.setAttribute("aria-label", "Înapoi la toate capitolele");
    back.setAttribute("title", "Toate capitolele");
    if (back.dataset.bbBackReady === "true") return;
    var label = back.textContent.replace(/^\s*[←‹]\s*/, "").trim() || "Toate capitolele";
    back.dataset.bbBackReady = "true";
    back.innerHTML =
      '<span class="lab-topbar-back-icon" aria-hidden="true">←</span>' +
      '<span class="lab-topbar-back-label">' +
      label +
      "</span>";
  }

  function enhanceGotoLinks() {
    document.querySelectorAll('a[onclick*="goto("]').forEach(function (link) {
      var target = getGotoTarget(link);
      if (!target) return;

      link.href = "#" + encodeURIComponent(target);
      link.removeAttribute("role");
      link.removeAttribute("tabindex");

      if (link.dataset.bbNativeLink === "true") return;
      link.dataset.bbNativeLink = "true";

      link.addEventListener(
        "click",
        function (event) {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            event.stopImmediatePropagation();
          }
        },
        true
      );
      link.addEventListener("click", function (event) {
        if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
          event.preventDefault();
        }
      });
    });
    syncNavigationState();
  }

  function syncNavigationState(explicitTarget) {
    var activeId = explicitTarget || getActiveSectionId();
    document.querySelectorAll("#sidenav a, .lab-nav a").forEach(function (link) {
      var target = getGotoTarget(link);
      if (!target) return;
      var current = target === activeId;
      link.classList.toggle("active", current);
      if (current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function focusActiveHeading(target) {
    var section = document.getElementById("page-" + target) || document.querySelector(".page-section.active");
    var heading = section && section.querySelector("h1");
    if (!heading) return;
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    try {
      heading.focus({ preventScroll: true });
    } catch (error) {
      heading.focus();
    }
  }

  function patchGoto() {
    if (typeof window.goto !== "function" || window.goto.__bbSharedWrapper) return;
    var originalGoto = window.goto;

    function sharedGoto() {
      var target = arguments[0] || "home";
      var suppressFocus =
        state.suppressNextRouteFocus ||
        !!(state.searchRoot && state.searchRoot.classList.contains("open"));
      state.suppressNextRouteFocus = false;
      var result = originalGoto.apply(this, arguments);

      if (prefersReducedMotion()) {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
      window.setTimeout(function () {
        syncNavigationState(target);
        if (!suppressFocus) focusActiveHeading(target);
      }, 0);
      return result;
    }

    sharedGoto.__bbSharedWrapper = true;
    sharedGoto.__bbOriginal = originalGoto;
    window.goto = sharedGoto;
  }

  function enhanceMapCardsAndAccordions() {
    document
      .querySelectorAll(
        ".chapter-map .g2 > .box, .chapter-map .g3 > .box, " +
          ".chapter-map .map-grid-split > .box, .chapter-map .map-card"
      )
      .forEach(function (card, index) {
      card.classList.add("map-card");
      card.dataset.mapIndex = String(index + 1).padStart(2, "0");
      if (!getGotoTarget(card)) return;
      if (card.dataset.bbInteractive === "true") return;
      card.dataset.bbInteractive = "true";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          card.click();
        }
      });
      });

    document.querySelectorAll('.acc-head[onclick], .accordion-head[onclick], [onclick*="tog("]').forEach(function (header, index) {
      if (header.dataset.bbInteractive === "true") return;
      var panel = header.nextElementSibling;
      if (!panel) return;

      header.dataset.bbInteractive = "true";
      header.setAttribute("role", "button");
      header.setAttribute("tabindex", "0");
      if (!panel.id) panel.id = "bb-accordion-panel-" + (index + 1);
      header.setAttribute("aria-controls", panel.id);

      function syncExpanded() {
        var expanded = header.classList.contains("open") || panel.classList.contains("show");
        header.setAttribute("aria-expanded", String(expanded));
        panel.setAttribute("aria-hidden", String(!expanded));
      }

      syncExpanded();
      header.addEventListener("click", function () {
        window.setTimeout(syncExpanded, 0);
      });
      header.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          header.click();
        }
      });
    });
  }

  function isMobileLayout() {
    return window.matchMedia ? window.matchMedia("(max-width: 1024px)").matches : window.innerWidth <= 1024;
  }

  function setDrawerClosedState(restoreFocus) {
    var nav = document.getElementById("sidenav");
    var overlay = document.getElementById("nav-overlay");
    var trigger = document.querySelector(".lab-menu-trigger");
    var main = document.querySelector("main");

    if (nav) {
      nav.classList.remove("open");
      if (isMobileLayout()) {
        nav.setAttribute("aria-hidden", "true");
        nav.inert = true;
      } else {
        nav.removeAttribute("aria-hidden");
        nav.inert = false;
      }
    }
    if (overlay) {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
      overlay.inert = true;
    }
    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-label", "Deschide cuprinsul");
      trigger.setAttribute("title", "Deschide cuprinsul");
      trigger.innerHTML = drawerIcon(false);
    }
    if (main) main.inert = false;

    if (restoreFocus && state.drawerReturnFocus && typeof state.drawerReturnFocus.focus === "function") {
      state.drawerReturnFocus.focus();
    }
    state.drawerReturnFocus = null;
  }

  function openDrawer() {
    var nav = document.getElementById("sidenav");
    var overlay = document.getElementById("nav-overlay");
    var trigger = document.querySelector(".lab-menu-trigger");
    var main = document.querySelector("main");
    if (!nav || !isMobileLayout()) return;

    closeSearch(false);
    state.drawerReturnFocus = document.activeElement;
    nav.inert = false;
    nav.removeAttribute("aria-hidden");
    nav.classList.add("open");
    if (overlay) {
      overlay.inert = false;
      overlay.setAttribute("aria-hidden", "false");
      overlay.classList.add("open");
    }
    if (trigger) {
      trigger.setAttribute("aria-expanded", "true");
      trigger.setAttribute("aria-label", "Închide cuprinsul");
      trigger.setAttribute("title", "Închide cuprinsul");
      trigger.innerHTML = drawerIcon(true);
    }
    if (main) main.inert = true;

    window.setTimeout(function () {
      var first = nav.querySelector('a[href], button:not([disabled]), [tabindex="0"]');
      if (first) first.focus();
    }, 0);
  }

  function trapDrawerFocus(event) {
    var nav = document.getElementById("sidenav");
    if (!nav || !nav.classList.contains("open") || event.key !== "Tab") return false;
    var focusable = Array.prototype.slice
      .call(nav.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]'))
      .filter(function (node) {
        return !node.hidden && node.getAttribute("aria-hidden") !== "true";
      });
    if (!focusable.length) return false;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
    return true;
  }

  function setupDrawer() {
    var trigger = document.querySelector(".lab-menu-trigger");
    var nav = document.getElementById("sidenav");
    var overlay = document.getElementById("nav-overlay");
    if (!trigger || !nav) return;

    nav.setAttribute("aria-label", nav.getAttribute("aria-label") || "Navigarea lecției");
    state.pageCloseNav = typeof window.closeNav === "function" ? window.closeNav : null;
    window.closeNav = function () {
      if (state.pageCloseNav) state.pageCloseNav.apply(this, arguments);
      setDrawerClosedState(false);
    };

    trigger.addEventListener(
      "click",
      function (event) {
        if (!isMobileLayout()) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (nav.classList.contains("open")) setDrawerClosedState(true);
        else openDrawer();
      },
      true
    );

    if (overlay) {
      overlay.addEventListener(
        "click",
        function (event) {
          event.preventDefault();
          event.stopImmediatePropagation();
          setDrawerClosedState(true);
        },
        true
      );
    }

    window.addEventListener("resize", function () {
      setDrawerClosedState(false);
    });
    setDrawerClosedState(false);
  }

  function searchIcon() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.8-3.8"/></svg>';
  }

  function createLessonSearch() {
    var topbar = document.querySelector(".lab-topbar-inner");
    if (!topbar) return null;
    var root = document.createElement("div");
    root.className = "lesson-search";
    root.id = "lesson-search";
    root.innerHTML =
      '<div class="lesson-search-panel">' +
      '<div class="lesson-search-box">' +
      searchIcon() +
      '<input id="lesson-search-input" type="search" aria-label="Caută în lecție" placeholder="Caută în lecție…" autocomplete="off">' +
      '<span id="lesson-search-count" class="lesson-search-count" aria-live="polite">0 / 0</span>' +
      '<div class="lesson-search-nav">' +
      '<button type="button" class="lesson-search-btn" id="lesson-search-prev" aria-label="Rezultatul anterior">↑</button>' +
      '<button type="button" class="lesson-search-btn" id="lesson-search-next" aria-label="Rezultatul următor">↓</button>' +
      "</div>" +
      '<button type="button" class="lesson-search-close" id="lesson-search-close" aria-label="Închide căutarea">×</button>' +
      "</div></div>";
    var back = topbar.querySelector(".lab-topbar-back");
    topbar.insertBefore(root, back || null);
    return root;
  }

  function normalizeTopbarActions() {
    var topbar = document.querySelector(".lab-topbar-inner");
    var root = state.searchRoot;
    var back = topbar && topbar.querySelector(".lab-topbar-back");
    if (!topbar || !root || !back) return;

    var actions = topbar.querySelector(".lab-topbar-actions");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = "lab-topbar-actions";
      topbar.appendChild(actions);
    }
    actions.appendChild(root);
    actions.appendChild(back);
  }

  function ensureSearchTrigger(root) {
    var trigger = root.querySelector(".lesson-search-trigger");
    if (!trigger) {
      trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "lesson-search-trigger";
      trigger.setAttribute("aria-label", "Caută în lecție");
      trigger.setAttribute("title", "Caută în lecție (/)");
      trigger.innerHTML = searchIcon();
      root.prepend(trigger);
    }
    trigger.setAttribute("aria-controls", "lesson-search-input");
    trigger.setAttribute("aria-expanded", String(root.classList.contains("open")));
    if (trigger.dataset.bbSearchTrigger !== "true") {
      trigger.dataset.bbSearchTrigger = "true";
      trigger.addEventListener("click", function () {
        if (root.classList.contains("open")) closeSearch(true);
        else openSearch(true, trigger);
      });
    }
  }

  function normalizeSearchValue(value) {
    var text = String(value || "");
    try {
      return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    } catch (error) {
      return text.toLowerCase();
    }
  }

  function indexText(text) {
    var normalized = "";
    var map = [];
    String(text || "").split("").forEach(function (character, sourceIndex) {
      var chunk = normalizeSearchValue(character);
      for (var index = 0; index < chunk.length; index += 1) {
        normalized += chunk[index];
        map.push(sourceIndex);
      }
    });
    return { normalized: normalized, map: map };
  }

  function clearOwnedSearchMarks() {
    document.querySelectorAll('.search-found[data-bb-search="true"]').forEach(function (mark) {
      var parent = mark.parentNode;
      if (!parent) return;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
      parent.normalize();
    });
  }

  function collectOwnedSearchMatches(query) {
    var needle = normalizeSearchValue(String(query || "").trim());
    if (!needle) return [];
    var matches = [];

    document.querySelectorAll(".page-section").forEach(function (section) {
      var walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
      while (walker.nextNode() && matches.length < 300) {
        var node = walker.currentNode;
        var parent = node.parentElement;
        if (!parent || parent.closest("script, style, nav, button, input, textarea, select, svg, mark.hl")) continue;
        var indexed = indexText(node.textContent || "");
        var from = 0;
        while (from < indexed.normalized.length && matches.length < 300) {
          var found = indexed.normalized.indexOf(needle, from);
          if (found < 0) break;
          var start = indexed.map[found];
          var end = indexed.map[found + needle.length - 1] + 1;
          if (typeof start !== "number" || typeof end !== "number") break;
          matches.push({ sectionId: section.id.replace(/^page-/, ""), node: node, start: start, end: end });
          from = found + Math.max(needle.length, 1);
        }
      }
    });
    return matches;
  }

  function renderOwnedSearchMarks(matches) {
    var grouped = new Map();
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
        var range = document.createRange();
        range.setStart(node, match.start);
        range.setEnd(node, match.end);
        var mark = document.createElement("mark");
        mark.className = "search-found";
        mark.dataset.bbSearch = "true";
        mark.dataset.searchIndex = String(match.index);
        range.surroundContents(mark);
        match.element = mark;
      });
    });
  }

  function updateOwnedSearchUi() {
    var count = document.getElementById("lesson-search-count");
    var previous = document.getElementById("lesson-search-prev");
    var next = document.getElementById("lesson-search-next");
    var total = state.searchMatches.length;
    if (count) count.textContent = (total ? state.searchIndex + 1 : 0) + " / " + total;
    if (previous) previous.disabled = total < 2;
    if (next) next.disabled = total < 2;
    if (state.searchRoot) {
      var input = document.getElementById("lesson-search-input");
      state.searchRoot.classList.toggle("has-query", !!(input && input.value.trim()));
      state.searchRoot.classList.toggle("has-results", total > 0);
    }
  }

  function goToOwnedSearchMatch(index) {
    var total = state.searchMatches.length;
    if (!total) {
      updateOwnedSearchUi();
      return;
    }
    if (state.searchIndex >= 0 && state.searchMatches[state.searchIndex].element) {
      state.searchMatches[state.searchIndex].element.classList.remove("search-found-current");
    }

    state.searchIndex = ((index % total) + total) % total;
    var match = state.searchMatches[state.searchIndex];
    if (match.sectionId !== getActiveSectionId() && typeof window.goto === "function") {
      state.suppressNextRouteFocus = true;
      window.goto(match.sectionId);
    }
    if (match.element) {
      match.element.classList.add("search-found-current");
      window.requestAnimationFrame(function () {
        match.element.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
      });
    }
    updateOwnedSearchUi();
  }

  function runOwnedSearch(query, preferredSection, preferredHit) {
    clearOwnedSearchMarks();
    state.searchMatches = collectOwnedSearchMatches(query);
    state.searchIndex = -1;
    if (!state.searchMatches.length) {
      updateOwnedSearchUi();
      return;
    }
    renderOwnedSearchMarks(state.searchMatches);

    var targetIndex = 0;
    if (preferredSection) {
      var sectionMatches = state.searchMatches
        .map(function (match, index) {
          return { match: match, index: index };
        })
        .filter(function (entry) {
          return entry.match.sectionId === preferredSection;
        });
      if (sectionMatches.length) {
        var hit = Math.max(0, Number(preferredHit) || 0);
        targetIndex = sectionMatches[Math.min(hit, sectionMatches.length - 1)].index;
      }
    }
    goToOwnedSearchMatch(targetIndex);
  }

  function resetOwnedSearch(resetInput) {
    window.clearTimeout(state.searchTimer);
    clearOwnedSearchMarks();
    state.searchMatches = [];
    state.searchIndex = -1;
    if (resetInput) {
      var input = document.getElementById("lesson-search-input");
      if (input) input.value = "";
    }
    updateOwnedSearchUi();
  }

  function setupOwnedSearch(root) {
    var input = root.querySelector("#lesson-search-input");
    var previous = root.querySelector("#lesson-search-prev");
    var next = root.querySelector("#lesson-search-next");
    var close = root.querySelector("#lesson-search-close");
    if (!input || !previous || !next || !close) return;

    input.addEventListener("input", function () {
      window.clearTimeout(state.searchTimer);
      state.searchTimer = window.setTimeout(function () {
        runOwnedSearch(input.value);
      }, 140);
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        goToOwnedSearchMatch(state.searchIndex + (event.shiftKey ? -1 : 1));
      }
    });
    previous.addEventListener("click", function () {
      goToOwnedSearchMatch(state.searchIndex - 1);
    });
    next.addEventListener("click", function () {
      goToOwnedSearchMatch(state.searchIndex + 1);
    });
    close.addEventListener("click", function () {
      closeSearch(true);
    });
    updateOwnedSearchUi();
  }

  function syncSearchExpanded() {
    if (!state.searchRoot) return;
    var expanded = state.searchRoot.classList.contains("open");
    var trigger = state.searchRoot.querySelector(".lesson-search-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", String(expanded));
    var navButton = document.getElementById("nav-search-btn");
    if (navButton) navButton.setAttribute("aria-expanded", String(expanded));
  }

  function openSearch(shouldFocus, returnFocus) {
    var root = state.searchRoot;
    if (!root) return;
    setDrawerClosedState(false);
    state.searchReturnFocus = returnFocus || document.activeElement;

    if (!state.ownedSearch && typeof window.openLessonSearchPanel === "function") {
      window.openLessonSearchPanel();
    } else if (!state.ownedSearch && typeof window.openLessonSearch === "function") {
      window.openLessonSearch();
    } else {
      root.classList.add("open");
    }
    root.classList.add("open");
    syncSearchExpanded();

    if (shouldFocus !== false) {
      window.setTimeout(function () {
        var input = document.getElementById("lesson-search-input");
        if (input) {
          input.focus();
          input.select();
        }
      }, 0);
    }
  }

  function closeSearch(restoreFocus) {
    var root = state.searchRoot;
    if (!root || !root.classList.contains("open")) return;

    if (state.ownedSearch) {
      resetOwnedSearch(true);
      root.classList.remove("open");
    } else {
      var close = root.querySelector("#lesson-search-close");
      if (close) close.click();
      else root.classList.remove("open");
    }
    root.classList.remove("open");
    syncSearchExpanded();

    if (restoreFocus && state.searchReturnFocus && typeof state.searchReturnFocus.focus === "function") {
      state.searchReturnFocus.focus();
    }
    state.searchReturnFocus = null;
  }

  function setupSearch() {
    var existing = document.getElementById("lesson-search");
    state.ownedSearch = !existing;
    state.searchRoot = existing || createLessonSearch();
    if (!state.searchRoot) return;

    var input = state.searchRoot.querySelector("#lesson-search-input");
    var count = state.searchRoot.querySelector("#lesson-search-count");
    if (input) input.setAttribute("aria-label", "Caută în lecție");
    if (count) count.setAttribute("aria-live", "polite");
    ensureSearchTrigger(state.searchRoot);
    normalizeTopbarActions();

    if (state.ownedSearch) {
      setupOwnedSearch(state.searchRoot);
      window.openLessonSearch = function () {
        openSearch(true, document.activeElement);
      };
    } else {
      ["openLessonSearch", "openLessonSearchPanel"].forEach(function (name) {
        var opener = window[name];
        if (typeof opener !== "function" || opener.__bbSharedWrapper) return;
        var wrapped = function () {
          if (!state.searchReturnFocus) state.searchReturnFocus = document.activeElement;
          var result = opener.apply(this, arguments);
          state.searchRoot.classList.add("open");
          syncSearchExpanded();
          return result;
        };
        wrapped.__bbSharedWrapper = true;
        window[name] = wrapped;
      });
      var close = state.searchRoot.querySelector("#lesson-search-close");
      if (close) {
        close.addEventListener("click", function () {
          window.setTimeout(function () {
            state.searchRoot.classList.remove("open");
            syncSearchExpanded();
            if (state.searchReturnFocus && typeof state.searchReturnFocus.focus === "function") {
              state.searchReturnFocus.focus();
            }
            state.searchReturnFocus = null;
          }, 0);
        });
      }
    }

    if (typeof MutationObserver !== "undefined") {
      new MutationObserver(syncSearchExpanded).observe(state.searchRoot, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
    syncSearchExpanded();
  }

  function restoreOwnedSearchFromUrl() {
    if (!state.ownedSearch) return;
    var params = new URLSearchParams(window.location.search);
    var query = String(params.get("q") || "").trim();
    if (!query) return;
    var section = String(params.get("section") || "").replace(/^page-/, "");
    var hit = params.get("hit");

    if (section && document.getElementById("page-" + section) && typeof window.goto === "function") {
      state.suppressNextRouteFocus = true;
      window.goto(section);
    }
    var input = document.getElementById("lesson-search-input");
    if (input) input.value = query;
    openSearch(false, document.querySelector(".lesson-search-trigger"));
    runOwnedSearch(query, section, hit);
  }

  function ensureSidebarControls() {
    var nav = document.getElementById("sidenav");
    if (!nav) return;
    var group = document.getElementById("nav-search-btn");
    group = group && group.closest(".nav-group");
    if (!group) group = document.getElementById("bb-sidebar-settings");
    if (!group) {
      group = document.createElement("div");
      group.className = "nav-group bb-sidebar-settings";
      group.id = "bb-sidebar-settings";
      group.innerHTML = '<div class="nav-divider"></div><div class="nav-group-label">Setări</div>';
      nav.appendChild(group);
    }

    function ensureButton(id, label, handler, controls) {
      var button = document.getElementById(id);
      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.id = id;
        button.className = "nav-settings-btn";
        button.innerHTML = '<span class="dot" aria-hidden="true"></span><span>' + label + "</span>";
        button.addEventListener("click", handler);
        group.appendChild(button);
      }
      if (controls) button.setAttribute("aria-controls", controls);
      return button;
    }

    ensureButton(
      "nav-search-btn",
      "Caută în lecție",
      function () {
        openSearch(true, document.getElementById("nav-search-btn"));
      },
      "lesson-search-input"
    ).setAttribute("aria-expanded", "false");
    ensureButton("nav-dm-btn", "Mod noapte", function () {
      if (typeof window.toggleDarkMode === "function") window.toggleDarkMode();
    });
    ensureButton("nav-hl-btn", "Evidențiator", function () {
      if (typeof window.toggleHighlighter === "function") window.toggleHighlighter();
    });
  }

  function ensureHighlighterPalette() {
    var navButton = document.getElementById("nav-hl-btn");
    if (!navButton) return null;
    var palette = document.getElementById("bb-highlighter-palette");
    if (palette) return palette;

    palette = document.createElement("div");
    palette.id = "bb-highlighter-palette";
    palette.className = "bb-highlighter-palette";
    palette.hidden = true;
    palette.innerHTML =
      '<div class="bb-highlighter-palette-head"><span>Culoare</span><strong id="bb-highlighter-color-name" aria-live="polite">Galben</strong></div>' +
      '<div class="bb-highlighter-colors" role="group" aria-label="Culoare evidențiator"></div>';

    var colorsRoot = palette.querySelector(".bb-highlighter-colors");
    HIGHLIGHTER_COLORS.forEach(function (color) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "bb-highlighter-color";
      button.dataset.highlightColor = color.id;
      button.setAttribute("aria-label", color.label);
      button.setAttribute("aria-pressed", "false");
      button.title = color.label;
      button.innerHTML = '<span class="bb-highlighter-check" aria-hidden="true">✓</span>';
      button.addEventListener("click", function () {
        setHighlighterColor(color.id);
      });
      colorsRoot.appendChild(button);
    });

    navButton.setAttribute("aria-controls", palette.id);
    navButton.insertAdjacentElement("afterend", palette);
    return palette;
  }

  function syncHighlighterPaletteUi() {
    var color = normalizeHighlighterColor(state.highlighterColor);
    var enabled = document.body.classList.contains("hl-mode");
    var palette = ensureHighlighterPalette();
    var navButton = document.getElementById("nav-hl-btn");
    state.highlighterColor = color;
    document.body.dataset.highlightColor = color;

    if (navButton) {
      navButton.dataset.highlightColor = color;
      navButton.setAttribute("aria-expanded", String(enabled));
      navButton.title = enabled
        ? "Evidențiator activ · " + getHighlighterColorLabel(color)
        : "Activează evidențiatorul";
    }
    if (!palette) return;
    palette.hidden = !enabled;

    var name = document.getElementById("bb-highlighter-color-name");
    if (name) name.textContent = getHighlighterColorLabel(color);
    palette.querySelectorAll(".bb-highlighter-color").forEach(function (button) {
      var selected = button.dataset.highlightColor === color;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function setHighlighterColor(color) {
    state.highlighterColor = normalizeHighlighterColor(color);
    safeStorageSet("highlighterColor", state.highlighterColor);
    syncHighlighterPaletteUi();
  }

  function syncDarkModeUi() {
    var dark = document.body.classList.contains("dark");
    var label = document.getElementById("nav-dm-label");
    var navButton = document.getElementById("nav-dm-btn");
    if (!label && navButton) label = navButton.querySelector("span:not(.dot)");
    if (label) label.textContent = dark ? "Mod zi" : "Mod noapte";

    [navButton, document.getElementById("dm-btn"), document.getElementById("sfab-dm")].forEach(function (button) {
      if (!button) return;
      button.classList.toggle("on", dark);
      button.setAttribute("aria-pressed", String(dark));
      button.setAttribute("aria-label", dark ? "Activează modul zi" : "Activează modul noapte");
      button.setAttribute("title", dark ? "Mod zi" : "Mod noapte");
    });
  }

  function setupDarkMode() {
    var stored = safeStorageGet("darkMode");
    if (stored === "1") document.body.classList.add("dark");
    if (stored === "0") document.body.classList.remove("dark");

    if (typeof window.toggleDarkMode === "function" && !window.toggleDarkMode.__bbSharedWrapper) {
      var pageToggle = window.toggleDarkMode;
      var wrappedToggle = function () {
        var result = pageToggle.apply(this, arguments);
        safeStorageSet("darkMode", document.body.classList.contains("dark") ? "1" : "0");
        syncDarkModeUi();
        return result;
      };
      wrappedToggle.__bbSharedWrapper = true;
      window.toggleDarkMode = wrappedToggle;
    } else if (typeof window.toggleDarkMode !== "function") {
      window.toggleDarkMode = function () {
        var dark = document.body.classList.toggle("dark");
        safeStorageSet("darkMode", dark ? "1" : "0");
        syncDarkModeUi();
      };
    }
    syncDarkModeUi();
  }

  function syncHighlighterUi() {
    var enabled = document.body.classList.contains("hl-mode");
    state.highlighterEnabled = enabled;
    var navButton = document.getElementById("nav-hl-btn");
    var label = document.getElementById("nav-hl-label");
    if (!label && navButton) label = navButton.querySelector("span:not(.dot)");
    if (label) label.textContent = enabled ? "Evidențiator activ" : "Evidențiator";

    [navButton, document.getElementById("hl-btn"), document.getElementById("sfab-hl")].forEach(function (button) {
      if (!button) return;
      button.classList.toggle("on", enabled);
      button.classList.toggle("hl-on", enabled);
      button.setAttribute("aria-pressed", String(enabled));
    });
    syncHighlighterPaletteUi();
  }

  function applyHighlight(range) {
    var ancestor = range.commonAncestorContainer;
    var root = ancestor.nodeType === Node.TEXT_NODE ? ancestor.parentNode : ancestor;
    if (!root || !root.closest || !root.closest("main, .page-section")) return;
    var pieces = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentElement;
        if (!parent || parent.closest("script, style, nav, button, input, textarea, select, svg, mark.hl")) {
          return NodeFilter.FILTER_REJECT;
        }
        try {
          return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        } catch (error) {
          return NodeFilter.FILTER_REJECT;
        }
      },
    });
    while (walker.nextNode()) {
      var node = walker.currentNode;
      var start = node === range.startContainer ? range.startOffset : 0;
      var end = node === range.endContainer ? range.endOffset : node.textContent.length;
      if (start < end) pieces.push({ node: node, start: start, end: end });
    }
    pieces.reverse().forEach(function (piece) {
      var part = document.createRange();
      part.setStart(piece.node, piece.start);
      part.setEnd(piece.node, piece.end);
      var mark = document.createElement("mark");
      mark.className = "hl";
      mark.dataset.highlightColor = state.highlighterColor;
      part.surroundContents(mark);
    });
  }

  function installHighlightColorObserver() {
    var main = document.querySelector("main");
    if (!main || typeof MutationObserver === "undefined") return;

    function colorizeMark(mark) {
      if (!mark.dataset.highlightColor) mark.dataset.highlightColor = state.highlighterColor;
    }

    main.querySelectorAll("mark.hl").forEach(colorizeMark);
    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          if (node.matches("mark.hl")) colorizeMark(node);
          node.querySelectorAll("mark.hl").forEach(colorizeMark);
        });
      });
    }).observe(main, { childList: true, subtree: true });
  }

  function installSharedHighlighterSelection() {
    function handleSelection(event) {
      if (!state.highlighterEnabled) return;
      if (event.target && event.target.closest("button, input, textarea, select, nav, .lesson-search")) return;
      window.setTimeout(function () {
        var selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.rangeCount || !selection.toString().trim()) return;
        var range = selection.getRangeAt(0);
        applyHighlight(range);
        selection.removeAllRanges();
      }, event.type === "touchend" ? 60 : 0);
    }
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("touchend", handleSelection);
  }

  function setupHighlighter() {
    state.highlighterColor = normalizeHighlighterColor(safeStorageGet("highlighterColor"));
    ensureHighlighterPalette();
    if (typeof window.toggleHighlighter === "function" && !window.toggleHighlighter.__bbSharedWrapper) {
      var pageToggle = window.toggleHighlighter;
      var wrappedToggle = function () {
        var result = pageToggle.apply(this, arguments);
        syncHighlighterUi();
        return result;
      };
      wrappedToggle.__bbSharedWrapper = true;
      window.toggleHighlighter = wrappedToggle;
    } else if (typeof window.toggleHighlighter !== "function") {
      state.highlighterEnabled = safeStorageGet("highlighterMode") === "1";
      document.body.classList.toggle("hl-mode", state.highlighterEnabled);
      window.toggleHighlighter = function () {
        state.highlighterEnabled = !state.highlighterEnabled;
        document.body.classList.toggle("hl-mode", state.highlighterEnabled);
        safeStorageSet("highlighterMode", state.highlighterEnabled ? "1" : "0");
        syncHighlighterUi();
      };
      installSharedHighlighterSelection();
    }
    installHighlightColorObserver();
    syncHighlighterUi();
  }

  function setupGlobalKeyboard() {
    document.addEventListener(
      "keydown",
      function (event) {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {
          // Preserve the browser's native Find command and stop legacy page handlers.
          event.stopImmediatePropagation();
          return;
        }

        if (trapDrawerFocus(event)) return;

        if (event.key === "Escape") {
          var drawerOpen = !!document.querySelector("#sidenav.open");
          var searchOpen = !!(state.searchRoot && state.searchRoot.classList.contains("open"));
          if (drawerOpen || searchOpen) {
            event.preventDefault();
            event.stopImmediatePropagation();
            if (searchOpen) closeSearch(true);
            if (drawerOpen) setDrawerClosedState(true);
          }
          return;
        }

        if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
          var target = event.target;
          var editing = target && (target.matches("input, textarea, select") || target.isContentEditable);
          if (editing) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          openSearch(true, document.activeElement);
        }
      },
      true
    );
  }

  function normalizeMinorControls() {
    var top = document.getElementById("top");
    if (top) top.setAttribute("aria-label", "Înapoi sus");
  }

  function registerOfflineSupport() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener(
      "load",
      function () {
        navigator.serviceWorker.register("sw.js").catch(function () {});
      },
      { once: true }
    );
  }

  function init() {
    if (!document.body || document.body.dataset.bbSharedReady === "true") return;
    document.body.dataset.bbSharedReady = "true";
    document.body.classList.add("bb-chapter-redesign");

    applyChapterTheme();
    normalizeBrand();
    ensureMenuTrigger();
    ensureSkipLink();
    normalizeBackAction();
    enhanceGotoLinks();
    patchGoto();
    enhanceMapCardsAndAccordions();
    setupSearch();
    ensureSidebarControls();
    setupDarkMode();
    setupHighlighter();
    setupDrawer();
    setupGlobalKeyboard();
    normalizeMinorControls();
    registerOfflineSupport();
    syncNavigationState();
    window.setTimeout(restoreOwnedSearchFromUrl, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
