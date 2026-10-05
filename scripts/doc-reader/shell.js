/* =========================================================================
   Reader shell behaviour — vanilla, single file, zero network, file:// safe.
   ========================================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORE_KEY = "vm-doc-theme";
  var MODES = ["auto", "light", "dark"];

  /* ---- UI strings ----------------------------------------------------
     The generator emits window.__DOC_UI for the document's language; every
     lookup falls back to the English literal, so the shell still reads
     correctly if the table is missing or incomplete. -------------------- */
  var UI = window.__DOC_UI || {};
  function t(key, fallback) {
    var v = UI[key];
    return (typeof v === "string" && v) ? v : fallback;
  }
  function tf(key, fallback, vars) {
    return t(key, fallback).replace(/\{(\w+)\}/g, function (m, k) {
      return Object.prototype.hasOwnProperty.call(vars, k) ? vars[k] : m;
    });
  }

  /* ---- storage helpers (file:// can throw on localStorage access) ---- */
  function readStore(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function writeStore(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }

  /* ---- theme: applied immediately, before first paint ---- */
  var mode = readStore(STORE_KEY);
  if (MODES.indexOf(mode) === -1) mode = "auto";

  function applyTheme(next) {
    mode = next;
    root.setAttribute("data-theme-mode", mode);
    if (mode === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", mode);
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      var label = t("theme_" + mode, mode === "auto" ? "system" : mode);
      btn.setAttribute("aria-label", tf("theme_aria", "Colour theme: {label}. Click to change.", { label: label }));
      btn.title = tf("theme_title", "Theme: {label}", { label: label });
    }
  }
  applyTheme(mode);

  /* ---- everything else once the DOM exists ---- */
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    var body = document.body;
    var topbar = document.querySelector(".topbar");
    var sidebar = document.getElementById("sidebar");
    var main = document.getElementById("main");
    var searchInput = document.getElementById("toc-search");
    var navToggle = document.getElementById("nav-toggle");
    var themeToggle = document.getElementById("theme-toggle");
    var toTop = document.getElementById("to-top");
    var content = main ? main.querySelector(".prose") : null;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var isMobile = window.matchMedia("(max-width: 1023.98px)");

    applyTheme(mode); /* re-run so the button gets its label */

    /* the document title is derived from the bar so the title string is
       substituted in exactly one place at assembly time */
    var titleEl = document.querySelector(".topbar__title");
    if (titleEl && titleEl.textContent.trim()) document.title = titleEl.textContent.trim();

    function topbarHeight() {
      return topbar ? Math.round(topbar.getBoundingClientRect().height) : 52;
    }

    /* =====================================================================
       Theme toggle — auto -> light -> dark -> auto
       ===================================================================== */
    if (themeToggle) {
      themeToggle.addEventListener("click", function () {
        var next = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
        applyTheme(next);
        writeStore(STORE_KEY, next);
      });
    }
    /* keep "auto" honest when the OS flips while the page is open */
    var schemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    var onScheme = function () { if (mode === "auto") applyTheme("auto"); };
    if (schemeQuery.addEventListener) schemeQuery.addEventListener("change", onScheme);
    else if (schemeQuery.addListener) schemeQuery.addListener(onScheme);

    /* =====================================================================
       Skip link — move real focus into the article
       ===================================================================== */
    var skip = document.querySelector(".skip-link");
    if (skip && main) {
      skip.addEventListener("click", function () {
        main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: true });
        window.setTimeout(function () { main.removeAttribute("tabindex"); }, 800);
      });
    }

    /* =====================================================================
       Mobile drawer
       ===================================================================== */
    var backdrop = document.createElement("div");
    backdrop.className = "nav-backdrop";
    backdrop.setAttribute("hidden", "");
    document.body.appendChild(backdrop);

    var scrollLockY = 0;
    function openNav() {
      if (root.classList.contains("nav-open")) return;
      scrollLockY = window.scrollY || window.pageYOffset || 0;
      backdrop.removeAttribute("hidden");
      root.classList.add("nav-open");
      if (navToggle) navToggle.setAttribute("aria-expanded", "true");
      var first = sidebar ? sidebar.querySelector(".toc__link") : null;
      if (first) first.focus({ preventScroll: true });
    }
    function closeNav(restoreFocus) {
      if (!root.classList.contains("nav-open")) return;
      root.classList.remove("nav-open");
      if (navToggle) navToggle.setAttribute("aria-expanded", "false");
      window.setTimeout(function () {
        if (!root.classList.contains("nav-open")) backdrop.setAttribute("hidden", "");
      }, 240);
      if (restoreFocus && navToggle) navToggle.focus({ preventScroll: true });
      if (scrollLockY) window.scrollTo(0, scrollLockY);
    }
    function toggleNav() {
      if (root.classList.contains("nav-open")) closeNav(true); else openNav();
    }

    if (navToggle) navToggle.addEventListener("click", toggleNav);
    backdrop.addEventListener("click", function () { closeNav(false); });

    /* close the drawer when a TOC entry is chosen, or the viewport grows */
    if (sidebar) {
      sidebar.addEventListener("click", function (ev) {
        var link = ev.target.closest ? ev.target.closest(".toc__link") : null;
        if (link && isMobile.matches) closeNav(false);
      });
    }
    var onBreak = function (ev) { if (!ev.matches) closeNav(false); };
    if (isMobile.addEventListener) isMobile.addEventListener("change", onBreak);
    else if (isMobile.addListener) isMobile.addListener(onBreak);

    /* =====================================================================
       Table of contents: scrollspy + filter
       ===================================================================== */
    var tocLinks = sidebar ? Array.prototype.slice.call(sidebar.querySelectorAll(".toc__link")) : [];
    var linkFor = Object.create(null);
    var headings = [];
    var activeLink = null;

    tocLinks.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;
      var id = href.slice(1);
      try { id = decodeURIComponent(id); } catch (e) {}
      if (!linkFor[id]) linkFor[id] = link;
    });

    if (content) {
      headings = Array.prototype.slice
        .call(content.querySelectorAll("h1[id], h2[id], h3[id], h4[id]"))
        .filter(function (h) { return !!linkFor[h.id]; });
    }

    function scrollActiveIntoView(link) {
      if (!sidebar || !link) return;
      if (isMobile.matches && !root.classList.contains("nav-open")) return;
      var sr = sidebar.getBoundingClientRect();
      var lr = link.getBoundingClientRect();
      var pad = 24;
      if (lr.top < sr.top + pad) sidebar.scrollTop -= (sr.top + pad - lr.top);
      else if (lr.bottom > sr.bottom - pad) sidebar.scrollTop += (lr.bottom - (sr.bottom - pad));
    }

    function setActive(link) {
      if (link === activeLink) return;
      if (activeLink) {
        activeLink.classList.remove("is-active");
        activeLink.removeAttribute("aria-current");
      }
      activeLink = link || null;
      if (activeLink) {
        activeLink.classList.add("is-active");
        activeLink.setAttribute("aria-current", "location");
        scrollActiveIntoView(activeLink);
      }
    }

    function computeActive() {
      if (!headings.length) return;
      var line = topbarHeight() + 28;
      var current = null;
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].getBoundingClientRect().top - line <= 0) current = headings[i];
        else break;
      }
      /* at the very bottom, own the last section outright */
      var docH = document.documentElement.scrollHeight;
      if (window.innerHeight + window.scrollY >= docH - 4) current = headings[headings.length - 1];
      if (!current) current = headings[0];
      setActive(linkFor[current.id] || null);
    }

    /* rAF is paused in a background tab, so the frame callback that clears
       `ticking` may never run — every later schedule() would then no-op and
       the spy would stay dead. The pending id is tracked so waking the tab
       can cancel it, clear the latch and recompute. */
    var ticking = false;
    var rafId = 0;
    function schedule() {
      if (ticking) return;
      ticking = true;
      rafId = window.requestAnimationFrame(function () { ticking = false; computeActive(); });
    }
    function flushSpy() {
      if (rafId) window.cancelAnimationFrame(rafId);
      ticking = false;
      rafId = 0;
      computeActive();
    }

    if (headings.length && "IntersectionObserver" in window) {
      var observer = new IntersectionObserver(schedule, {
        rootMargin: "-" + (topbarHeight() + 8) + "px 0px -62% 0px",
        threshold: [0, 1]
      });
      headings.forEach(function (h) { observer.observe(h); });
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) flushSpy();
    });
    window.addEventListener("pageshow", flushSpy);
    computeActive(); /* synchronous, so the first paint already has an active item */

    /* ---- TOC filter ---- */
    var tocItems = sidebar ? Array.prototype.slice.call(sidebar.querySelectorAll(".toc__item")) : [];
    var emptyNote = null;

    function filterToc(raw) {
      var q = (raw || "").trim().toLowerCase().replace(/\s+/g, " ");
      var shown = 0;
      for (var i = 0; i < tocItems.length; i++) {
        var item = tocItems[i];
        var text = item.dataset.filterText;
        if (text === undefined) {
          text = (item.textContent || "").toLowerCase().replace(/\s+/g, " ").trim();
          item.dataset.filterText = text;
        }
        var hit = !q || text.indexOf(q) !== -1;
        if (hit) { item.removeAttribute("hidden"); shown++; }
        else item.setAttribute("hidden", "");
      }
      if (sidebar) {
        if (!shown && q) {
          if (!emptyNote) {
            emptyNote = document.createElement("p");
            emptyNote.className = "toc__empty";
            emptyNote.setAttribute("role", "status");
            sidebar.appendChild(emptyNote);
          }
          emptyNote.textContent = tf("toc_empty", "No sections match “{query}”", { query: raw.trim() });
          emptyNote.removeAttribute("hidden");
        } else if (emptyNote) {
          emptyNote.setAttribute("hidden", "");
        }
      }
      if (!q) scrollActiveIntoView(activeLink);
    }

    if (searchInput) {
      searchInput.setAttribute("title", "Filter sections (press / to focus)");
      searchInput.addEventListener("input", function () { filterToc(searchInput.value); });
      searchInput.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape") {
          ev.stopPropagation();
          if (searchInput.value) { searchInput.value = ""; filterToc(""); }
          else searchInput.blur();
        }
      });
    }

    /* =====================================================================
       Copy buttons
       ===================================================================== */
    var canExec = false;
    try { canExec = !!document.queryCommandSupported && document.queryCommandSupported("copy"); } catch (e) { canExec = false; }
    var canClip = !!(navigator.clipboard && navigator.clipboard.writeText);

    if (!canClip && !canExec) {
      Array.prototype.forEach.call(document.querySelectorAll(".codeblock__copy"), function (b) {
        b.setAttribute("hidden", "");
      });
    }

    function legacyCopy(text) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0;";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }

    function flashCopied(btn, ok) {
      var original = btn.dataset.label || btn.textContent || t("copy", "Copy");
      btn.dataset.label = original;
      btn.textContent = ok ? t("copied", "Copied") : t("copy", "Copy");
      if (ok) btn.classList.add("is-copied");
      window.clearTimeout(btn._resetTimer);
      btn._resetTimer = window.setTimeout(function () {
        btn.textContent = btn.dataset.label || t("copy", "Copy");
        btn.classList.remove("is-copied");
      }, 1600);
    }

    document.addEventListener("click", function (ev) {
      var btn = ev.target.closest ? ev.target.closest(".codeblock__copy") : null;
      if (!btn) return;
      var block = btn.closest(".codeblock");
      var code = block ? block.querySelector("pre code") : null;
      if (!code) return;
      var text = code.textContent || "";
      if (canClip) {
        navigator.clipboard.writeText(text).then(
          function () { flashCopied(btn, true); },
          function () { flashCopied(btn, canExec && legacyCopy(text)); }
        );
      } else {
        flashCopied(btn, legacyCopy(text));
      }
    });

    /* =====================================================================
       Back to top
       ===================================================================== */
    if (toTop) {
      toTop.addEventListener("click", function () {
        try {
          window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
        } catch (e) { window.scrollTo(0, 0); }
        if (main) {
          main.setAttribute("tabindex", "-1");
          main.focus({ preventScroll: true });
          window.setTimeout(function () { main.removeAttribute("tabindex"); }, 800);
        }
      });
      var toTopTick = false;
      var toTopRaf = 0;
      var applyToTop = function () {
        toTop.classList.toggle("is-visible", (window.scrollY || window.pageYOffset || 0) > 640);
      };
      var updateToTop = function () {
        if (toTopTick) return;
        toTopTick = true;
        toTopRaf = window.requestAnimationFrame(function () { toTopTick = false; applyToTop(); });
      };
      window.addEventListener("scroll", updateToTop, { passive: true });
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) return;
        if (toTopRaf) window.cancelAnimationFrame(toTopRaf);
        toTopTick = false;
        applyToTop();
      });
      applyToTop();
    }

    /* =====================================================================
       Tall tables get an internal scroller so the header row can stick
       ===================================================================== */
    Array.prototype.forEach.call(document.querySelectorAll(".tablewrap"), function (wrap) {
      var table = wrap.querySelector("table");
      if (!table) return;
      if (table.tBodies[0] && table.tBodies[0].rows.length >= 14) wrap.classList.add("tablewrap--tall");
      /* wrappers that scroll horizontally are focusable so keyboard users can pan */
      if (wrap.scrollWidth > wrap.clientWidth + 1) {
        wrap.setAttribute("tabindex", "0");
        wrap.setAttribute("role", "region");
        wrap.setAttribute("aria-label", t("table_scrollable", "Scrollable table"));
      }
    });

    /* =====================================================================
       Keyboard shortcuts
       ===================================================================== */
    document.addEventListener("keydown", function (ev) {
      var t = ev.target;
      var typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);

      if (ev.key === "/" && !typing && !ev.metaKey && !ev.ctrlKey && !ev.altKey) {
        ev.preventDefault();
        if (searchInput) { searchInput.focus(); searchInput.select(); }
        return;
      }
      if (ev.key === "Escape") {
        if (root.classList.contains("nav-open")) { closeNav(true); return; }
        if (searchInput && searchInput.value) { searchInput.value = ""; filterToc(""); }
      }
    });

    /* =====================================================================
       Hash handling — keep the sticky bar off the target, sync the TOC
       ===================================================================== */
    function syncFromHash() {
      var id = window.location.hash.slice(1);
      if (!id) return;
      try { id = decodeURIComponent(id); } catch (e) {}
      var link = linkFor[id];
      if (link) setActive(link);
      schedule();
    }
    window.addEventListener("hashchange", syncFromHash);
    if (window.location.hash) window.setTimeout(syncFromHash, 60);
  });
  /* ---- diagrams: legibility floor, scroll affordance, click-to-enlarge ---- */
  ready(function () {
    var MIN_TEXT_PX = 9.5;
    var figs = [].slice.call(document.querySelectorAll("figure.diagram"));
    if (!figs.length) return;
    var lb = null, stage = null, pct = null, ttl = null;
    var openFig = null, holder = null, baseW = 0, z = 1, lastFocus = null;

    function smallestFont(svg) {
      var min = Infinity, nodes = svg.querySelectorAll("text, tspan, foreignObject div, foreignObject span, foreignObject p");
      for (var i = 0; i < nodes.length; i++) {
        if (!(nodes[i].textContent || "").trim()) continue;
        var fs = parseFloat(getComputedStyle(nodes[i]).fontSize);
        if (fs && fs < min) min = fs;
      }
      return isFinite(min) ? min : 0;
    }
    function syncScroll(fig) { fig.classList.toggle("is-scrollable", fig.scrollWidth - fig.clientWidth > 2); }
    /* Only force a width floor when downscaling would actually make labels
       illegible — and only when the floor buys >5% over the fitted width,
       so a diagram never scrolls just to gain a few pixels. */
    function applyFloor(fig) {
      if (!fig._vbw || !fig._mf) return;
      var cs = getComputedStyle(fig);
      var avail = fig.clientWidth - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0);
      var floorW = fig._vbw * Math.min(1, MIN_TEXT_PX / fig._mf);
      if (avail > 0 && floorW > avail * 1.05) fig.style.setProperty("--diagram-min-w", Math.round(floorW) + "px");
      else fig.style.removeProperty("--diagram-min-w");
    }
    function setZoom(v) {
      z = Math.min(4, Math.max(0.1, v));
      var svg = stage.querySelector("svg");
      if (!svg || !baseW) return;
      svg.style.width = Math.round(baseW * z) + "px";
      pct.textContent = Math.round(z * 100) + "%";
    }
    function fit() { setZoom(baseW ? (stage.clientWidth - 40) / baseW : 1); }
    function build() {
      lb = document.createElement("div");
      lb.className = "lightbox"; lb.setAttribute("hidden", "");
      lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
      lb.setAttribute("aria-label", t("lightbox_aria", "Enlarged diagram"));
      lb.innerHTML =
        '<div class="lightbox__bar"><span class="lightbox__title"></span>' +
        '<div class="lightbox__tools">' +
        '<button type="button" class="lightbox__btn" data-act="out" aria-label="' + t("zoom_out", "Zoom out") + '">&#8722;</button>' +
        '<span class="lightbox__pct">100%</span>' +
        '<button type="button" class="lightbox__btn" data-act="in" aria-label="' + t("zoom_in", "Zoom in") + '">+</button>' +
        '<button type="button" class="lightbox__btn" data-act="fit">' + t("zoom_fit", "Fit") + '</button>' +
        '<button type="button" class="lightbox__btn" data-act="full">100%</button>' +
        '<button type="button" class="lightbox__btn" data-act="close" aria-label="' + t("close_esc", "Close (Esc)") + '">&#10005;</button>' +
        '</div></div><div class="lightbox__stage"></div>';
      document.body.appendChild(lb);
      stage = lb.querySelector(".lightbox__stage");
      pct = lb.querySelector(".lightbox__pct");
      ttl = lb.querySelector(".lightbox__title");
      lb.addEventListener("click", function (ev) {
        var b = ev.target.closest ? ev.target.closest("[data-act]") : null;
        if (b) {
          var a = b.getAttribute("data-act");
          if (a === "close") closeLb();
          else if (a === "in") setZoom(z * 1.25);
          else if (a === "out") setZoom(z / 1.25);
          else if (a === "fit") fit();
          else if (a === "full") setZoom(1);
          return;
        }
        if (ev.target === stage) closeLb();
      });
    }
    function openLb(fig) {
      var svg = fig.querySelector("svg"); if (!svg) return;
      if (!lb) build();
      lastFocus = document.activeElement; openFig = fig;
      holder = document.createElement("span");
      holder.className = "diagram__slot"; holder.hidden = true;
      fig.style.minHeight = Math.round(fig.getBoundingClientRect().height) + "px";
      svg.parentNode.insertBefore(holder, svg);
      stage.appendChild(svg);
      baseW = (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width) || svg.getBoundingClientRect().width || 1;
      ttl.textContent = (fig.getAttribute("data-mermaid") || t("diagram", "Diagram")) +
        " · " + tf("diagram_width", "{px}px wide", { px: Math.round(baseW) });
      lb.removeAttribute("hidden");
      document.documentElement.classList.add("lb-open");
      /* Enlarge means "make it readable": always open at natural size and let
         the stage scroll. "Fit" is one click away for an overview. */
      setZoom(1);
      lb.querySelector('[data-act="close"]').focus();
    }
    function closeLb() {
      if (!openFig) return;
      var svg = stage.querySelector("svg");
      if (svg && holder && holder.parentNode) {
        svg.style.width = ""; holder.parentNode.replaceChild(svg, holder);
      }
      openFig.style.minHeight = ""; syncScroll(openFig);
      lb.setAttribute("hidden", "");
      document.documentElement.classList.remove("lb-open");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      openFig = null; holder = null;
    }
    document.addEventListener("keydown", function (ev) {
      if (!openFig) return;
      if (ev.key === "Escape") { ev.preventDefault(); closeLb(); }
      else if (ev.key === "+" || ev.key === "=") { ev.preventDefault(); setZoom(z * 1.25); }
      else if (ev.key === "-") { ev.preventDefault(); setZoom(z / 1.25); }
      else if (ev.key === "0") { ev.preventDefault(); fit(); }
    });

    figs.forEach(function (fig) {
      var svg = fig.querySelector("svg"); if (!svg) return;
      var vbw = (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width) || 0;
      var mf = vbw ? smallestFont(svg) : 0;
      fig._vbw = vbw; fig._mf = mf;
      applyFloor(fig);
      fig.classList.add("is-zoomable");
      var btn = document.createElement("button");
      btn.type = "button"; btn.className = "diagram__zoom";
      btn.setAttribute("aria-label", t("enlarge_aria", "Enlarge diagram"));
      btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6.2 2.2H2.2v4M9.8 2.2h4v4M9.8 13.8h4v-4M6.2 13.8H2.2v-4"/></svg><span>' + t("enlarge", "Enlarge") + '</span>';
      btn.addEventListener("click", function (ev) { ev.stopPropagation(); openLb(fig); });
      fig.appendChild(btn);
      svg.addEventListener("click", function () { openLb(fig); });
      syncScroll(fig);
      var hint = document.createElement("span");
      hint.className = "diagram__hint";
      hint.textContent = t("diagram_hint", "↔ scroll · click to enlarge");
      fig.appendChild(hint);
    });
    var rt; addEventListener("resize", function () {
      clearTimeout(rt); rt = setTimeout(function () {
        figs.forEach(function (f) { if (f !== openFig) { applyFloor(f); syncScroll(f); } });
      }, 150);
    });
  });

})();
