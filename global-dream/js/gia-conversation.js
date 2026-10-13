/* Screen 2 conversation rail animation (build spec Section 5.2).
   When the rail is 35% visible, once: the gold line grows from node 1 to
   node 4, each node activates as the line reaches it and its phrase fades
   in (CSS transitions on .is-active). After that, an ambient gold dot with
   a 40% trail travels down the rail, waits, and repeats, paused while the
   section is out of view. Under reduced motion, or without GSAP, the rail
   is shown complete. The left column uses the shared reveal. */

function initGiaConversation(sectionEl) {
  if (!sectionEl) return;

  const rail = sectionEl.querySelector(".gd-conversation__rail");
  if (!rail) return;

  const track = rail.querySelector(".gd-rail__track");
  const fill = rail.querySelector(".gd-rail__fill");
  const lead = rail.querySelector(".gd-rail__runner:not(.gd-rail__runner--trail)");
  const trail = rail.querySelector(".gd-rail__runner--trail");
  const items = Array.from(rail.querySelectorAll(".gd-rail__item"));
  const nodes = items.map((item) => item.querySelector(".gd-rail__node"));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!track || !fill || items.length < 2 || nodes.includes(null)) return;

  const LINE_DURATION = 2.4;
  const DOT_DURATION = 2.8;
  const DOT_WAIT = 5;
  const DOT_FADE = 0.3;
  const TRAIL_LAG = 0.12;
  const TRAIL_OPACITY = 0.4;
  const AMBIENT_DELAY = 0.6; // lets the last phrase settle first

  // ---------- Geometry ----------
  // The track spans node 1's centre to the last node's centre. stops holds
  // each node's position along it (0-1), used to activate nodes in time.

  let stops = nodes.map((_, i) => i / (nodes.length - 1));

  function measure() {
    const base = rail.getBoundingClientRect().top;
    const centres = nodes.map((node) => {
      const r = node.getBoundingClientRect();
      return r.top + r.height / 2 - base;
    });
    const first = centres[0];
    const length = Math.max(1, centres[centres.length - 1] - first);
    track.style.top = first + "px";
    track.style.height = length + "px";
    stops = centres.map((c) => (c - first) / length);
  }

  let resizeTimer = 0;
  measure();
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 150);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  // ---------- Activation ----------

  let activated = 0;

  function activateUpTo(p) {
    while (activated < items.length && p >= stops[activated] - 0.001) {
      items[activated].classList.add("is-active");
      activated++;
    }
  }

  function complete() {
    activateUpTo(1);
    rail.classList.add("is-complete");
  }

  if (reduced || typeof gsap === "undefined" || !("IntersectionObserver" in window)) {
    complete();
    return;
  }

  // ---------- Ambient dot ----------

  let ambient = null;
  let visible = false;

  function syncAmbient() {
    if (!ambient) return;
    if (visible) ambient.resume();
    else ambient.pause();
  }

  function buildAmbient() {
    ambient = gsap.timeline({ paused: true, repeat: -1, repeatDelay: DOT_WAIT });
    [[lead, 0, 1], [trail, TRAIL_LAG, TRAIL_OPACITY]].forEach(([runner, at, peak]) => {
      if (!runner) return;
      ambient
        .fromTo(runner, { yPercent: 0 }, { yPercent: 100, duration: DOT_DURATION, ease: "sine.inOut" }, at)
        .fromTo(runner, { opacity: 0 }, { opacity: peak, duration: DOT_FADE, ease: "none" }, at)
        .to(runner, { opacity: 0, duration: DOT_FADE, ease: "none" }, at + DOT_DURATION - DOT_FADE);
    });
    syncAmbient();
  }

  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      visible = entry.isIntersecting;
      syncAmbient();
    });
  }).observe(sectionEl);

  // ---------- Line (once, at 35% visible) ----------

  gsap.set(fill, { scaleY: 0, transformOrigin: "50% 0%" });

  function run() {
    activateUpTo(0);
    gsap.to(fill, {
      scaleY: 1,
      duration: LINE_DURATION,
      ease: "power1.inOut",
      onUpdate: () => activateUpTo(gsap.getProperty(fill, "scaleY")),
      onComplete: () => {
        complete();
        gsap.delayedCall(AMBIENT_DELAY, buildAmbient);
      }
    });
  }

  const trigger = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    trigger.disconnect();
    run();
  }, { threshold: 0.35 });
  trigger.observe(rail);
}

document.addEventListener("DOMContentLoaded", () => initGiaConversation(document.getElementById("screen-2")));
