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
    highlighterPaletteOpen: false,
    settingsOpen: false,
    setSettingsOpen: null,
    pageCloseNav: null,
    desktopSidebarHidden: false,
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

  function navigateLessonSection(target, options) {
    if (window.BBLessonNavigation && typeof window.BBLessonNavigation.navigate === "function") {
      return window.BBLessonNavigation.navigate(target, options || {});
    }
    if (typeof window.goto === "function") return window.goto(target);
    return false;
  }

  function applyChapterTheme() {
    var badge = document.querySelector(".nav-chapter-badge");
    var match = String(badge ? badge.textContent : document.title).match(/\d+/);
    var chapter = match ? match[0] : "";
    var chapterData = typeof CHAPTERS !== "undefined"
      ? CHAPTERS.find(function (item) { return String(item.num) === chapter; })
      : null;
    var theme = chapterData && chapterData.theme;
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

  function ensureLessonResourceNavigation() {
    if (document.body.classList.contains("bm-reader")) return null;
    var topbar = document.querySelector(".lab-topbar-inner");
    if (!topbar || typeof CHAPTERS === "undefined") return null;

    var file = decodeURIComponent(window.location.pathname.split("/").pop() || "index.html");
    var chapter = CHAPTERS.find(function (item) {
      return item.done && item.url === file;
    });
    var quiz = chapter && (chapter.resources || []).find(function (resource) {
      return resource.kind === "quiz" && resource.url;
    });
    if (!quiz) return null;

    var nav = topbar.querySelector(".bb-resource-nav");
    if (!nav) {
      nav = document.createElement("nav");
      nav.className = "lab-nav bb-resource-nav";
      topbar.insertBefore(nav, topbar.querySelector(".lab-topbar-back") || null);
    }

    nav.setAttribute("aria-label", "Navigare între lecție și grile");
    nav.replaceChildren();

    var lessonLink = document.createElement("a");
    lessonLink.href = chapter.url;
    lessonLink.textContent = "Lecție";
    lessonLink.className = "active";
    lessonLink.setAttribute("aria-current", "page");

    var quizLink = document.createElement("a");
    quizLink.href = quiz.url;
    quizLink.textContent = "Grile";
    quizLink.title = quiz.title || "Deschide grilele";

    nav.append(lessonLink, quizLink);
    return nav;
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
    if (window.BBLessonNavigation) return;
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

  function dispatchLegacySectionChange(target, source) {
    var section = document.getElementById("page-" + target) || document.querySelector(".page-section.active");
    if (!section) return;
    document.dispatchEvent(
      new CustomEvent("bb:lesson-section-change", {
        detail: { route: target, section: section, source: source || "legacy" },
      })
    );
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
    if (window.BBLessonNavigation) return;
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
        dispatchLegacySectionChange(target, "legacy");
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
    var readerDesktop = document.body.classList.contains("bm-reader") && !isMobileLayout();

    if (nav) {
      nav.classList.remove("open");
      if (isMobileLayout()) {
        nav.setAttribute("aria-hidden", "true");
        nav.inert = true;
      } else {
        nav.removeAttribute("aria-hidden");
        nav.inert = false;
        if (readerDesktop && state.desktopSidebarHidden) {
          nav.setAttribute("aria-hidden", "true");
          nav.inert = true;
        }
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
      if (readerDesktop) {
        var expanded = !state.desktopSidebarHidden;
        trigger.setAttribute("aria-expanded", String(expanded));
        trigger.setAttribute("aria-label", expanded ? "Ascunde cuprinsul" : "Deschide cuprinsul");
        trigger.setAttribute("title", expanded ? "Ascunde cuprinsul" : "Deschide cuprinsul");
        trigger.innerHTML = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M5.5 8h1M5.5 12h1"/></svg>';
      }
    }
    if (main) main.inert = false;
    if (isMobileLayout() && state.setSettingsOpen) state.setSettingsOpen(false, false);

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

    var first = Array.from(nav.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]'))
      .find(function (node) { return node.getClientRects().length > 0; });
    if (first) first.focus({ preventScroll: true });
  }

  function trapDrawerFocus(event) {
    var nav = document.getElementById("sidenav");
    if (!nav || !nav.classList.contains("open") || event.key !== "Tab") return false;
    var focusable = Array.prototype.slice
      .call(nav.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]'))
      .filter(function (node) {
        return !node.hidden && node.getAttribute("aria-hidden") !== "true" && node.getClientRects().length > 0;
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
        if (!isMobileLayout() && document.body.classList.contains("bm-reader")) {
          state.desktopSidebarHidden = !state.desktopSidebarHidden;
          document.body.classList.toggle("bm-sidebar-hidden", state.desktopSidebarHidden);
          setDrawerClosedState(false);
          return;
        }
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
    document.addEventListener("bb:lesson-section-change", function () {
      setDrawerClosedState(false);
    });
    setDrawerClosedState(false);
  }

  function searchIcon(className) {
    var classAttribute = className ? ' class="' + className + '"' : "";
    return '<svg' + classAttribute + ' viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.25"/><path d="M15.2 15.2L20 20"/></svg>';
  }

  function searchArrowIcon(direction) {
    var paths = direction === "previous"
      ? '<path d="M12 19V5"/><path d="m7 10 5-5 5 5"/>'
      : '<path d="M12 5v14"/><path d="m7 14 5 5 5-5"/>';
    return '<svg class="lesson-search-arrow-icon" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + "</svg>";
  }

  function searchCloseIcon() {
    return '<svg class="lesson-search-close-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg>';
  }

  function highlighterIcon() {
    return '<svg class="bb-highlighter-icon bb-settings-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="bb-highlighter-icon-fill" d="m13 4 7 7-8 8H5v-7z"/><path d="m9 8 7 7M4 21h10"/></svg>';
  }

  function settingsIcon() {
    return '<svg class="bb-settings-toggle-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>';
  }

  function settingsChevronIcon() {
    return '<svg class="bb-settings-chevron" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 8 4 4 4-4"/></svg>';
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
      searchIcon("lesson-search-field-icon") +
      '<input id="lesson-search-input" type="search" aria-label="Caută în lecție" placeholder="Caută în lecție…" autocomplete="off">' +
      '<span id="lesson-search-count" class="lesson-search-count" aria-live="polite">0 / 0</span>' +
      '<div class="lesson-search-nav">' +
      '<button type="button" class="lesson-search-btn" id="lesson-search-prev" aria-label="Rezultatul anterior" title="Rezultatul anterior">' + searchArrowIcon("previous") + "</button>" +
      '<button type="button" class="lesson-search-btn" id="lesson-search-next" aria-label="Rezultatul următor" title="Rezultatul următor">' + searchArrowIcon("next") + "</button>" +
      "</div>" +
      '<button type="button" class="lesson-search-close" id="lesson-search-close" aria-label="Închide căutarea" title="Închide căutarea">' + searchCloseIcon() + "</button>" +
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
      root.prepend(trigger);
    }
    trigger.innerHTML = searchIcon("lesson-search-trigger-icon");
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

  function upgradeSearchControls(root) {
    var fieldIcon = root.querySelector(".lesson-search-box > svg");
    var input = root.querySelector("#lesson-search-input");
    var previous = root.querySelector("#lesson-search-prev");
    var next = root.querySelector("#lesson-search-next");
    var close = root.querySelector("#lesson-search-close");
    if (fieldIcon) fieldIcon.outerHTML = searchIcon("lesson-search-field-icon");
    if (input) input.type = "search";
    if (previous) {
      previous.innerHTML = searchArrowIcon("previous");
      previous.title = "Rezultatul anterior";
    }
    if (next) {
      next.innerHTML = searchArrowIcon("next");
      next.title = "Rezultatul următor";
    }
    if (close) {
      close.innerHTML = searchCloseIcon();
      close.title = "Închide căutarea";
      close.setAttribute("aria-label", "Închide căutarea");
      close.removeAttribute("aria-hidden");
      close.removeAttribute("tabindex");
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

  // Highlight/search wrappers are transparent to matching. Authored element
  // boundaries stay separate, so unrelated labels, cells and blocks cannot join.
  // One logical hit may own several per-text-node markers; never extract a range
  // across elements, which would split or clone the student's highlight markup.
  function collectSearchTextMatches(query, options) {
    var needle = normalizeSearchValue(String(query || "").trim());
    if (!needle) return [];
    var matches = [];
    var limit = options && options.limit || Infinity;

    document.querySelectorAll(".page-section").forEach(function (section) {
      var text = "";
      var pieces = [];
      function flush() {
        var indexed = indexText(text);
        var from = 0;
        while (from < indexed.normalized.length && matches.length < limit) {
          var found = indexed.normalized.indexOf(needle, from);
          if (found < 0) break;
          var start = indexed.map[found];
          var end = indexed.map[found + needle.length - 1] + 1;
          // Include a decomposed accent with its final source character.
          while (end < text.length && /[\u0300-\u036f]/.test(text[end])) end += 1;
          var parts = pieces.filter(function (piece) {
            return piece.start < end && piece.end > start;
          }).map(function (piece) {
            return { node: piece.node, start: Math.max(start, piece.start) - piece.start,
              end: Math.min(end, piece.end) - piece.start };
          });
          matches.push({ sectionId: options && options.fullSectionId ? section.id : section.id.replace(/^page-/, ""), parts: parts });
          from = found + needle.length;
        }
        text = "";
        pieces = [];
      }
      function visit(node) {
        if (matches.length >= limit) return;
        if (node.nodeType === Node.TEXT_NODE) {
          var value = node.textContent || "";
          if (value) pieces.push({ node: node, start: text.length, end: text.length + value.length });
          text += value;
          return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.matches("script, style, nav, button, input, textarea, select, svg")) {
          flush();
          return;
        }
        var transparent = node.matches('mark.hl, .search-found[data-bb-search="true"]');
        if (!transparent) flush();
        Array.from(node.childNodes).forEach(visit);
        if (!transparent) flush();
      }
      visit(section);
      flush();
    });
    return matches;
  }

  function collectOwnedSearchMatches(query) {
    return collectSearchTextMatches(query, { limit: 300 });
  }

  function renderOwnedSearchMarks(matches) {
    var grouped = new Map();
    matches.forEach(function (match, index) {
      match.index = index;
      match.elements = [];
      match.parts.forEach(function (part, partIndex) {
        if (!grouped.has(part.node)) grouped.set(part.node, []);
        grouped.get(part.node).push({ match: match, part: part, partIndex: partIndex });
      });
    });
    grouped.forEach(function (nodeParts, node) {
      nodeParts.sort(function (a, b) {
        return b.part.start - a.part.start;
      });
      nodeParts.forEach(function (entry) {
        var range = document.createRange();
        range.setStart(node, entry.part.start);
        range.setEnd(node, entry.part.end);
        var mark = document.createElement("mark");
        mark.className = "search-found";
        mark.dataset.bbSearch = "true";
        mark.dataset.searchIndex = String(entry.match.index);
        range.surroundContents(mark);
        entry.match.elements[entry.partIndex] = mark;
        if (entry.partIndex === 0) entry.match.element = mark;
      });
    });
  }

  function setSearchMatchCurrent(match, current) {
    if (!match) return;
    (match.elements || []).forEach(function (element) {
      element.classList.toggle("search-found-current", current);
    });
  }

  // The two legacy controllers retain their routing, URL restoration and UI.
  // Only their text/marker operations delegate to this shared implementation.
  window.BBLessonSearchText = {
    collect: collectSearchTextMatches,
    render: renderOwnedSearchMarks,
    clear: clearOwnedSearchMarks,
    setCurrent: setSearchMatchCurrent,
  };

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

  function scrollOwnedSearchMatchIntoView(element) {
    if (!element) return;
    var topbar = document.querySelector(".lab-topbar");
    var topbarHeight = topbar ? topbar.getBoundingClientRect().height : 0;
    var readingAnchor = Math.max(topbarHeight + 24, Math.min(window.innerHeight * 0.28, 220));
    var targetTop = Math.max(0, window.scrollY + element.getBoundingClientRect().top - readingAnchor);
    window.scrollTo({
      top: Math.round(targetTop),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    element.classList.remove("search-found-arriving");
    window.requestAnimationFrame(function () {
      element.classList.add("search-found-arriving");
      window.setTimeout(function () {
        element.classList.remove("search-found-arriving");
      }, 360);
    });
  }

  function goToOwnedSearchMatch(index) {
    var total = state.searchMatches.length;
    if (!total) {
      updateOwnedSearchUi();
      return;
    }
    if (state.searchIndex >= 0 && state.searchMatches[state.searchIndex].element) {
      setSearchMatchCurrent(state.searchMatches[state.searchIndex], false);
    }

    state.searchIndex = ((index % total) + total) % total;
    var match = state.searchMatches[state.searchIndex];
    if (match.sectionId !== getActiveSectionId()) {
      state.suppressNextRouteFocus = true;
      navigateLessonSection(match.sectionId, { focus: false, source: "search" });
    }
    if (match.element) {
      setSearchMatchCurrent(match, true);
      window.requestAnimationFrame(function () {
        scrollOwnedSearchMatchIntoView(match.element);
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
    if (document.body.classList.contains("bm-reader") && state.setSettingsOpen) {
      state.setSettingsOpen(false, false);
    }
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
    upgradeSearchControls(state.searchRoot);
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

    if (section && document.getElementById("page-" + section)) {
      state.suppressNextRouteFocus = true;
      navigateLessonSection(section, { focus: false, source: "search" });
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
      group.innerHTML = '<div class="nav-divider"></div>';
      nav.appendChild(group);
    }

    group.id = "bb-sidebar-settings";
    group.classList.add("bb-sidebar-settings");
    var oldLabel = group.querySelector(":scope > .nav-group-label");
    if (oldLabel) oldLabel.remove();

    var toggle = group.querySelector(".bb-settings-toggle");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "bb-settings-toggle";
      toggle.setAttribute("aria-controls", "bb-sidebar-settings-panel");
      toggle.innerHTML = settingsIcon() + '<span>Setări</span>' + settingsChevronIcon();
      var divider = group.querySelector(":scope > .nav-divider");
      if (divider) divider.insertAdjacentElement("afterend", toggle);
      else group.prepend(toggle);
    }

    var panel = group.querySelector("#bb-sidebar-settings-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "bb-sidebar-settings-panel";
      panel.className = "bb-settings-panel";
      panel.hidden = true;
      toggle.insertAdjacentElement("afterend", panel);
    }

    function setSettingsOpen(open, restoreFocus) {
      if (open && document.body.classList.contains("bm-reader")) closeSearch(false);
      state.settingsOpen = !!open;
      panel.hidden = !state.settingsOpen;
      group.classList.toggle("is-open", state.settingsOpen);
      toggle.setAttribute("aria-expanded", String(state.settingsOpen));
      if (!state.settingsOpen) {
        setHighlighterPaletteOpen(false);
        if (restoreFocus && group.contains(document.activeElement)) toggle.focus();
      }
    }

    state.setSettingsOpen = setSettingsOpen;

    toggle.addEventListener("click", function () {
      setSettingsOpen(!state.settingsOpen, true);
    });
    toggle.setAttribute("aria-expanded", "false");
    panel.hidden = true;
    state.settingsOpen = false;

    function ensureButton(id, label, controls) {
      var button = document.getElementById(id);
      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.id = id;
        button.className = "nav-settings-btn";
        button.innerHTML = "<span>" + label + "</span>";
      }
      button.removeAttribute("onclick");
      if (controls) button.setAttribute("aria-controls", controls);
      panel.appendChild(button);
      return button;
    }

    var searchButton = ensureButton("nav-search-btn", "Caută în lecție", "lesson-search-input");
    searchButton.innerHTML = searchIcon("bb-settings-icon") + "<span>Caută în lecție</span>";
    searchButton.setAttribute("aria-expanded", "false");
    searchButton.addEventListener("click", function () {
      openSearch(true, searchButton);
    });

    var highlighterButton = ensureButton("nav-hl-btn", "Highlighter", "bb-highlighter-palette");
    highlighterButton.innerHTML = highlighterIcon() + '<span id="nav-hl-label">Highlighter</span>';
    highlighterButton.setAttribute("aria-haspopup", "true");
    highlighterButton.addEventListener("click", function () {
      setHighlighterPaletteOpen(!state.highlighterPaletteOpen);
    });

    document.addEventListener("bb:lesson-section-change", function () {
      setSettingsOpen(false, false);
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
      '<div class="bb-highlighter-palette-head"><span>Alege culoarea</span><button class="bb-highlighter-disable" type="button">Oprește</button></div>' +
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
        setHighlighterEnabled(true);
        setHighlighterPaletteOpen(false, true);
      });
      colorsRoot.appendChild(button);
    });

    palette.querySelector(".bb-highlighter-disable").addEventListener("click", function () {
      setHighlighterEnabled(false);
      setHighlighterPaletteOpen(false, true);
    });

    navButton.setAttribute("aria-controls", palette.id);
    navButton.insertAdjacentElement("afterend", palette);
    return palette;
  }

  function setHighlighterPaletteOpen(open, restoreFocus) {
    var palette = ensureHighlighterPalette();
    var navButton = document.getElementById("nav-hl-btn");
    state.highlighterPaletteOpen = !!open && state.settingsOpen;
    if (palette) palette.hidden = !state.highlighterPaletteOpen;
    if (navButton) navButton.setAttribute("aria-expanded", String(state.highlighterPaletteOpen));
    if (!state.highlighterPaletteOpen && restoreFocus && navButton) navButton.focus();
  }

  function setHighlighterEnabled(enabled) {
    var current = document.body.classList.contains("hl-mode");
    if (current === !!enabled) return;
    if (typeof window.toggleHighlighter === "function") window.toggleHighlighter();
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
      navButton.setAttribute("aria-expanded", String(state.highlighterPaletteOpen));
      navButton.title = enabled
        ? "Highlighter activ · " + getHighlighterColorLabel(color)
        : "Alege culoarea pentru Highlighter";
    }
    if (!palette) return;
    palette.hidden = !state.highlighterPaletteOpen;

    var disable = palette.querySelector(".bb-highlighter-disable");
    if (disable) disable.hidden = !enabled;
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

  function syncHighlighterUi() {
    var enabled = document.body.classList.contains("hl-mode");
    state.highlighterEnabled = enabled;
    var navButton = document.getElementById("nav-hl-btn");
    var label = document.getElementById("nav-hl-label");
    if (!label && navButton) label = navButton.querySelector("span");
    if (label) label.textContent = "Highlighter";

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
          if (state.highlighterPaletteOpen) {
            event.preventDefault();
            event.stopImmediatePropagation();
            setHighlighterPaletteOpen(false, true);
            return;
          }
          if (drawerOpen || searchOpen) {
            event.preventDefault();
            event.stopImmediatePropagation();
            if (searchOpen) closeSearch(true);
            if (drawerOpen) setDrawerClosedState(true);
          } else if (state.settingsOpen && state.setSettingsOpen) {
            event.preventDefault();
            event.stopImmediatePropagation();
            state.setSettingsOpen(false, true);
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
    if (top) {
      top.setAttribute("aria-label", "Înapoi sus");
      document.querySelector("main").appendChild(top);
    }
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

  function getStudyChapter() {
    if (document.body.classList.contains("bb-quiz-page") || document.body.classList.contains("bb-testing-page")) {
      return null;
    }
    if (typeof CHAPTERS === "undefined") return null;
    var filename = window.location.pathname.split("/").pop();
    return CHAPTERS.find(function (chapter) {
      return chapter.done && chapter.url === filename;
    }) || null;
  }

  function getStudyRoute(section) {
    return section && section.id.indexOf("page-") === 0 ? section.id.slice(5) : "";
  }

  function getNavigationRoute(link) {
    var legacyTarget = getGotoTarget(link);
    if (legacyTarget) return legacyTarget;
    var href = link && link.getAttribute("href");
    if (!href || href.charAt(0) !== "#") return "";
    try {
      return decodeURIComponent(href.slice(1));
    } catch (error) {
      return href.slice(1);
    }
  }

  function setupStudyProgress() {
    var study = window.BBStudyState;
    var chapter = getStudyChapter();
    var main = document.querySelector("main");
    var nav = document.getElementById("sidenav");
    if (!study || !chapter || !main || !nav) return;

    var contentSections = Array.prototype.slice.call(
      main.querySelectorAll(".page-section[id^='page-']:not(.chapter-home)")
    );
    var sectionIds = contentSections.map(getStudyRoute).filter(Boolean);
    if (!sectionIds.length) return;

    var navHeader = nav.querySelector(".nav-header");
    var progress = document.createElement("div");
    progress.className = "bb-lesson-progress";
    progress.innerHTML =
      '<div class="bb-lesson-progress-copy"><span>Progres capitol</span><strong>0/' +
      sectionIds.length +
      '</strong></div><div class="bb-lesson-progress-track" role="progressbar" aria-label="Progres capitol" aria-valuemin="0" aria-valuemax="' +
      sectionIds.length +
      '" aria-valuenow="0"><span></span></div>';
    if (navHeader) navHeader.insertAdjacentElement("afterend", progress);
    else nav.prepend(progress);

    var controls = document.createElement("section");
    controls.className = "bb-lesson-completion";
    controls.setAttribute("aria-labelledby", "bb-lesson-completion-title");
    controls.innerHTML =
      '<div class="bb-lesson-completion-copy"><h2 id="bb-lesson-completion-title">Finalizează lecția</h2>' +
      '<p class="bb-lesson-completion-status" aria-live="polite"></p></div>' +
      '<div class="bb-lesson-completion-actions"><button type="button" class="bb-lesson-completion-button">Marchează lecția ca parcursă</button>' +
      '<a class="bb-next-lesson" hidden></a></div>';
    main.appendChild(controls);

    var completionButton = controls.querySelector(".bb-lesson-completion-button");
    var completionStatus = controls.querySelector(".bb-lesson-completion-status");
    var nextLessonLink = controls.querySelector(".bb-next-lesson");
    var observer = null;
    var observedSentinel = null;
    var fallbackFrame = 0;

    contentSections.forEach(function (section) {
      var sentinel = document.createElement("span");
      sentinel.className = "bb-section-end-sentinel";
      sentinel.setAttribute("aria-hidden", "true");
      section.appendChild(sentinel);
    });

    function nextPublishedChapter() {
      var currentIndex = CHAPTERS.findIndex(function (item) { return item.num === chapter.num; });
      for (var index = currentIndex + 1; index < CHAPTERS.length; index += 1) {
        if (CHAPTERS[index].done && CHAPTERS[index].url) return CHAPTERS[index];
      }
      return null;
    }

    function updateNavigation(completedSections) {
      nav.querySelectorAll("a").forEach(function (link) {
        var route = getNavigationRoute(link);
        if (sectionIds.indexOf(route) === -1) return;
        var completed = completedSections.indexOf(route) !== -1;
        link.classList.toggle("is-completed", completed);
        var mark = link.querySelector(".bb-nav-progress-mark");
        if (!mark) {
          mark = document.createElement("span");
          mark.className = "bb-nav-progress-mark";
          mark.setAttribute("aria-hidden", "true");
          link.appendChild(mark);
        }
        mark.textContent = completed ? "✓" : "";
      });
    }

    function renderProgress() {
      var lessonProgress = study.getLessonProgress(chapter.num, sectionIds);
      var copy = progress.querySelector(".bb-lesson-progress-copy strong");
      var bar = progress.querySelector(".bb-lesson-progress-track");
      copy.textContent = lessonProgress.completed + "/" + lessonProgress.total;
      bar.setAttribute("aria-valuenow", String(lessonProgress.completed));
      bar.querySelector("span").style.width =
        Math.round((lessonProgress.completed / lessonProgress.total) * 100) + "%";
      updateNavigation(lessonProgress.completedSections);

      completionButton.classList.toggle("is-reset", lessonProgress.isComplete);
      completionButton.textContent = lessonProgress.isComplete
        ? "Resetează progresul lecției"
        : "Marchează lecția ca parcursă";
      completionStatus.textContent = lessonProgress.isComplete
        ? "Lecție completă · " + lessonProgress.completed + " din " + lessonProgress.total + " secțiuni parcurse."
        : lessonProgress.completed + " din " + lessonProgress.total + " secțiuni parcurse.";

      var next = lessonProgress.isComplete ? nextPublishedChapter() : null;
      if (next) {
        nextLessonLink.hidden = false;
        nextLessonLink.href = next.url;
        nextLessonLink.textContent = "Continuă cu capitolul " + next.num + " →";
      } else {
        nextLessonLink.hidden = true;
        nextLessonLink.removeAttribute("href");
        nextLessonLink.textContent = "";
        if (lessonProgress.isComplete) {
          completionStatus.textContent += " Ai parcurs toate lecțiile disponibile.";
        }
      }
    }

    function activeContentSection() {
      var active = main.querySelector(".page-section.active");
      return active && !active.classList.contains("chapter-home") ? active : null;
    }

    function completeActiveAtEnd() {
      fallbackFrame = 0;
      var active = activeContentSection();
      if (!active) return;
      var rect = active.getBoundingClientRect();
      if (rect.bottom >= 0 && rect.bottom <= window.innerHeight + 1) {
        study.completeSection(chapter.num, getStudyRoute(active));
      }
    }

    function scheduleEndCheck() {
      if (fallbackFrame) return;
      fallbackFrame = window.requestAnimationFrame(completeActiveAtEnd);
    }

    function observeActiveSection() {
      var active = activeContentSection();
      var sentinel = active && active.querySelector(".bb-section-end-sentinel");
      if (observer) {
        if (observedSentinel) observer.unobserve(observedSentinel);
        observedSentinel = sentinel;
        if (sentinel) observer.observe(sentinel);
      }
      scheduleEndCheck();
    }

    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var section = entry.target.closest(".page-section.active");
          if (section && !section.classList.contains("chapter-home")) {
            study.completeSection(chapter.num, getStudyRoute(section));
          }
        });
      });
    } else {
      window.addEventListener("scroll", scheduleEndCheck, { passive: true });
      window.addEventListener("resize", scheduleEndCheck);
    }

    completionButton.addEventListener("click", function () {
      var lessonProgress = study.getLessonProgress(chapter.num, sectionIds);
      if (lessonProgress.isComplete) {
        if (window.confirm("Resetezi progresul acestei lecții?")) study.resetLesson(chapter.num);
      } else {
        study.completeLesson(chapter.num, sectionIds);
      }
    });

    document.addEventListener("bb:lesson-section-change", function (event) {
      var detail = event.detail || {};
      if (!window.BBLessonNavigation && detail.route) {
        study.recordVisit(chapter.num, detail.route);
      }
      observeActiveSection();
    });
    study.subscribe(renderProgress);

    if (!window.BBLessonNavigation) {
      var initial = document.querySelector(".page-section.active");
      if (initial) study.recordVisit(chapter.num, getStudyRoute(initial));
    }
    renderProgress();
    observeActiveSection();
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
    ensureLessonResourceNavigation();
    enhanceGotoLinks();
    patchGoto();
    enhanceMapCardsAndAccordions();
    setupSearch();
    ensureSidebarControls();
    document.querySelectorAll('main table').forEach(function (table) {
      var cells = Array.from(table.querySelectorAll('tbody td'));
      var simple = cells.length && cells.every(function (cell) {
        return cell.hasAttribute('data-label') && cell.colSpan === 1 && cell.rowSpan === 1;
      });
      if (simple) {
        table.classList.add('bb-table-stacked');
        table.setAttribute('role', 'table');
        table.querySelectorAll('thead, tbody, tfoot').forEach(function (group) { group.setAttribute('role', 'rowgroup'); });
        table.querySelectorAll('tr').forEach(function (row) { row.setAttribute('role', 'row'); });
        table.querySelectorAll('th').forEach(function (cell) { cell.setAttribute('role', 'columnheader'); });
        cells.forEach(function (cell) { cell.setAttribute('role', 'cell'); });
      }
      var wrapper = table.closest('.table-wrap');
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'table-wrap';
        table.before(wrapper);
        wrapper.appendChild(table);
      }
      if (!simple) {
        wrapper.tabIndex = 0;
        wrapper.setAttribute('role', 'region');
        wrapper.setAttribute('aria-label', table.caption ? table.caption.textContent.trim() : 'Tabel derulabil orizontal');
      }
    });
    setupHighlighter();
    setupDrawer();
    setupStudyProgress();
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
