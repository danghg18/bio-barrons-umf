(function () {
  "use strict";

  var sections = [];
  var routes = new Map();
  var defaultRoute = "";
  var initialized = false;

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function routeFromSection(section) {
    return section && section.id.indexOf("page-") === 0 ? section.id.slice(5) : "";
  }

  function routeFromHash() {
    var hash = window.location.hash.slice(1);
    if (!hash) return "";
    try {
      return decodeURIComponent(hash);
    } catch (error) {
      return hash;
    }
  }

  function routeFromLink(link) {
    if (!link || !link.hash) return "";
    var url = new URL(link.href, window.location.href);
    if (
      url.origin !== window.location.origin ||
      url.pathname !== window.location.pathname ||
      url.search !== window.location.search
    ) {
      return "";
    }
    var route = url.hash.slice(1);
    try {
      route = decodeURIComponent(route);
    } catch (error) {
      // Keep the literal hash when it is not valid percent-encoding.
    }
    return routes.has(route) ? route : "";
  }

  function syncNavigation(route) {
    document.querySelectorAll("#sidenav a, .lab-nav a").forEach(function (link) {
      var current = routeFromLink(link) === route;
      link.classList.toggle("active", current);
      if (current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function focusHeading(section) {
    var heading = section && section.querySelector("h1");
    if (!heading) return;
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    try {
      heading.focus({ preventScroll: true });
    } catch (error) {
      heading.focus();
    }
  }

  function activate(route, options) {
    var section = routes.get(route);
    if (!section) return false;
    options = options || {};

    sections.forEach(function (candidate) {
      candidate.classList.toggle("active", candidate === section);
    });
    syncNavigation(route);

    if (options.scroll !== false) {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
    if (options.focus !== false) focusHeading(section);

    document.dispatchEvent(
      new CustomEvent("bb:lesson-section-change", {
        detail: { route: route, section: section, source: options.source || "api" },
      })
    );
    return true;
  }

  function navigate(route, options) {
    if (!initialized) init();
    route = routes.has(route) ? route : defaultRoute;
    options = options || {};
    var hash = "#" + encodeURIComponent(route);

    if (window.location.hash !== hash) {
      if (options.history === "push") window.history.pushState(null, "", hash);
      else window.history.replaceState(null, "", hash);
    }
    return activate(route, options);
  }

  function handleLocation(source, focus) {
    var route = routeFromHash();
    if (!route) return activate(defaultRoute, { source: source, focus: focus });
    if (routes.has(route)) return activate(route, { source: source, focus: focus });

    // Keep valid in-page anchors (for example the skip link) outside the router.
    if (document.getElementById(route)) return false;
    return navigate(defaultRoute, { source: "invalid-hash", focus: focus });
  }

  function handleSameRouteClick(event) {
    var link = event.target.closest("a[href]");
    var route = routeFromLink(link);
    if (!route || window.location.hash !== link.hash) return;
    event.preventDefault();
    activate(route, { source: "link" });
  }

  function setupBackToTop() {
    var button = document.getElementById("top");
    if (!button) return;
    window.addEventListener("scroll", function () {
      button.style.display = window.scrollY > 500 ? "flex" : "none";
    });
  }

  function init() {
    if (initialized) return;
    sections = Array.prototype.slice.call(document.querySelectorAll(".page-section[id^='page-']"));
    if (!sections.length) return;

    sections.forEach(function (section) {
      var route = routeFromSection(section);
      if (route && !routes.has(route)) routes.set(route, section);
    });
    var authoredDefault = sections.find(function (section) {
      return section.classList.contains("active") && routes.has(routeFromSection(section));
    });
    defaultRoute = routeFromSection(authoredDefault || sections[0]);
    initialized = true;

    document.addEventListener("click", handleSameRouteClick);
    window.addEventListener("hashchange", function () {
      handleLocation("history", true);
    });
    setupBackToTop();
    handleLocation("initial", false);
  }

  window.BBLessonNavigation = {
    init: init,
    navigate: navigate,
    hasRoute: function (route) {
      if (!initialized) init();
      return routes.has(route);
    },
    getRoutes: function () {
      if (!initialized) init();
      return Array.from(routes.keys());
    },
    getDefaultRoute: function () {
      if (!initialized) init();
      return defaultRoute;
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
