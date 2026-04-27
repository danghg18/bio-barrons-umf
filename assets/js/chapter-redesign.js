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
    return section ? section.querySelectorAll("section[id]").length : 0;
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
    }
    if (!document.getElementById("lesson-search")) {
      document.body.classList.add("bb-no-lesson-search");
    }
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

    normalizeTopbarShape();
    enhanceHomeHero();
    enhanceSectionHeroes();
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
