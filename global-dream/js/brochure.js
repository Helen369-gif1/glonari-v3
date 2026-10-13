/* Screen 4 side brochure dialogs (build spec Section 5.4a).
   Each module button opens its native <dialog> with showModal(). While a
   panel is open the page is locked, and gd:brochure-open / gd:brochure-close
   on the section freeze and resume the story's progress. Closing restores
   the exact window scroll position and returns focus to the trigger.
   Deep links (#brochure-…) open on load; opening and closing update the
   hash with history.replaceState. Images load on first open (data-src). */

function initBrochures(root) {
  if (!root) return;

  const dialogs = Array.from(root.querySelectorAll("dialog.gd-brochure"));
  if (!dialogs.length || typeof HTMLDialogElement !== "function") return;

  const html = document.documentElement;
  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const stackedQuery = window.matchMedia("(max-width: 1100px)");
  const mobileQuery = window.matchMedia("(max-width: 768px)");
  const hasGsap = typeof gsap !== "undefined";

  const ease = (t) => bezier(0.22, 0.61, 0.36, 1, t); // design-system ease
  const EASE_CSS = "cubic-bezier(.22, .61, .36, 1)";
  const POWER2_IN_CSS = "cubic-bezier(.55, .085, .68, .53)"; // GSAP power2.in

  const byId = new Map(dialogs.map((dialog) => [dialog.id, dialog]));
  const triggers = new Map();
  root.querySelectorAll(".gd-module__cta[aria-controls]").forEach((button) => {
    const id = button.getAttribute("aria-controls");
    if (byId.has(id)) triggers.set(id, button);
  });

  let current = null; // { dialog, trigger, scrollX, scrollY, tl, panel, observer, closing }

  // ---------- Media (first open) ----------

  function loadMedia(dialog) {
    dialog.querySelectorAll("img[data-src]").forEach((img) => {
      const file = img.dataset.src;
      img.addEventListener("error", () => {
        const box = img.parentElement;
        if (box.classList.contains("is-missing")) return;
        box.classList.add("is-missing");
        const note = document.createElement("p");
        note.className = "gd-brochure__pending";
        note.setAttribute("aria-hidden", "true");
        note.append("Media pending", document.createElement("br"), file);
        box.appendChild(note);
      }, { once: true });
      img.src = file;
      img.removeAttribute("data-src");
    });
  }

  // ---------- Open ----------

  function open(dialog, trigger, fromHash) {
    if (current || dialog.open) return;

    const state = {
      dialog,
      trigger,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      tl: null,
      panel: null,
      observer: null,
      closing: false
    };
    current = state;

    root.dispatchEvent(new CustomEvent("gd:brochure-open", { detail: { id: dialog.id } }));

    // Lock the page; keep the story's width by compensating the scrollbar.
    const scrollbar = window.innerWidth - html.clientWidth;
    html.style.setProperty("--gd-scrollbar-comp", Math.max(0, scrollbar) + "px");
    html.classList.add("is-brochure-open");

    loadMedia(dialog);
    dialog.showModal();

    const body = dialog.querySelector(".gd-brochure__body");
    dialog.scrollTop = 0;
    if (body) body.scrollTop = 0;

    if (!fromHash) history.replaceState(history.state, "", "#" + dialog.id);

    if (hasGsap && !reducedQuery.matches) animateIn(state);

    const title = dialog.querySelector(".gd-brochure__title");
    if (title) title.focus({ preventScroll: true });
  }

  // The panel itself moves with the Web Animations API, not GSAP: GSAP
  // measures the transform of a fixed element by briefly detaching it from
  // the document, which drops focus and breaks the modal dialog's Escape.
  function slidePanel(dialog, entering) {
    if (!dialog.animate) return null;
    const mobile = mobileQuery.matches;
    const away = mobile
      ? { opacity: 0, transform: "translateY(24px)" }
      : { transform: "translateX(100%)" };
    const rest = mobile ? { opacity: 1, transform: "none" } : { transform: "none" };
    return dialog.animate(entering ? [away, rest] : [rest, away], {
      duration: entering ? (mobile ? 420 : 560) : 380,
      easing: entering ? EASE_CSS : POWER2_IN_CSS,
      fill: entering ? "none" : "forwards"
    });
  }

  function animateIn(state) {
    const { dialog } = state;
    const image = dialog.querySelector(".gd-brochure__image");
    const intro = Array.from(dialog.querySelectorAll("[data-brochure-intro]"));
    const later = Array.from(dialog.querySelectorAll("[data-brochure-reveal]"));

    state.panel = slidePanel(dialog, true);
    const tl = gsap.timeline();
    if (image) tl.fromTo(image, { scale: 1.06 }, { scale: 1, duration: 1.2, ease: ease, clearProps: "transform" }, 0);
    if (intro.length) {
      tl.fromTo(intro, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: ease, clearProps: "transform,opacity" }, 0.24);
    }
    state.tl = tl;

    // Later sections reveal once as they scroll into the scrolling column
    // (the body column, or the whole panel in the stacked layout).
    if (!later.length || !("IntersectionObserver" in window)) return;
    gsap.set(later, { opacity: 0, y: 16 });
    const scroller = stackedQuery.matches ? dialog : dialog.querySelector(".gd-brochure__body");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        gsap.to(entry.target, { opacity: 1, y: 0, duration: 0.5, ease: ease, clearProps: "transform,opacity" });
      });
    }, { root: scroller, threshold: 0.2 });
    later.forEach((el) => observer.observe(el));
    state.observer = observer;
  }

  // ---------- Close ----------

  function requestClose() {
    const state = current;
    if (!state || state.closing) return;
    state.closing = true;
    const { dialog } = state;
    if (state.tl) state.tl.kill();

    if (!hasGsap || reducedQuery.matches) {
      dialog.close();
      return;
    }
    dialog.classList.add("is-closing");
    if (state.panel) state.panel.cancel();
    state.panel = slidePanel(dialog, false);
    if (state.panel) state.panel.finished.then(() => { if (dialog.open) dialog.close(); }, () => {});
    else dialog.close();
  }

  // Runs for every close, including one forced by the browser.
  function finish(dialog) {
    const state = current;
    if (!state || state.dialog !== dialog) return;
    current = null;

    if (state.tl) state.tl.kill();
    if (state.panel) state.panel.cancel();
    if (state.observer) state.observer.disconnect();
    dialog.classList.remove("is-closing");
    if (hasGsap) {
      gsap.set(dialog.querySelectorAll("[data-brochure-intro], [data-brochure-reveal], .gd-brochure__image"), { clearProps: "transform,opacity" });
    }

    html.classList.remove("is-brochure-open");
    html.style.removeProperty("--gd-scrollbar-comp");

    const trigger = state.trigger;
    if (trigger && trigger.isConnected && !trigger.closest("[inert]")) {
      trigger.focus({ preventScroll: true });
    }
    window.scrollTo({ left: state.scrollX, top: state.scrollY, behavior: "instant" });

    if (location.hash === "#" + dialog.id) {
      history.replaceState(history.state, "", location.pathname + location.search);
    }

    root.dispatchEvent(new CustomEvent("gd:brochure-close", { detail: { id: dialog.id } }));
  }

  // ---------- Wiring ----------

  triggers.forEach((button, id) => {
    button.addEventListener("click", () => open(byId.get(id), button, false));
  });

  dialogs.forEach((dialog) => {
    dialog.querySelectorAll("[data-brochure-close]").forEach((button) => {
      button.addEventListener("click", requestClose);
    });

    // Escape: animate out instead of the instant native close.
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      requestClose();
    });

    // Backdrop (the visible strip of the story): a press and release that
    // both land outside the panel's box.
    let pressedOutside = false;
    const outside = (event) => {
      const r = dialog.getBoundingClientRect();
      return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;
    };
    dialog.addEventListener("pointerdown", (event) => {
      pressedOutside = event.target === dialog && outside(event);
    });
    dialog.addEventListener("click", (event) => {
      if (pressedOutside && event.target === dialog && outside(event)) requestClose();
      pressedOutside = false;
    });

    dialog.addEventListener("close", () => finish(dialog));
  });

  // ---------- Deep links ----------

  function openFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    const dialog = byId.get(id);
    if (dialog) open(dialog, triggers.get(id) || null, true);
  }

  // After the story has initialised and the browser has restored scroll.
  if (document.readyState === "complete") requestAnimationFrame(openFromHash);
  else window.addEventListener("load", () => requestAnimationFrame(openFromHash), { once: true });
  window.addEventListener("hashchange", openFromHash);

  function bezier(x1, y1, x2, y2, t) {
    let u = t;
    for (let k = 0; k < 8; k++) {
      const x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u - t;
      const dx = 3 * (1 - u) * (1 - u) * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
      if (Math.abs(x) < 1e-5 || !dx) break;
      u -= x / dx;
    }
    u = Math.min(1, Math.max(0, u));
    return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
  }
}

document.addEventListener("DOMContentLoaded", () => initBrochures(document.getElementById("screen-4")));
