/* Screen 4 scrub, horizontal modules, progress, final CTA (build spec Section 5.4).
   One normalised progress p over the 650vh runway, smoothed with the
   Screen 1 formula, drives everything: the video time, the simulated
   pull-back scale, one continuous horizontal track carrying the four
   chapter cards and the final CTA card (pure functions of p, fully
   reversible), and the chrome. Under
   reduced motion or on short viewports the static composition in
   gia-story.css is left in place and the walk video is never fetched.
   Brochures (task A6) talk to the story through gd:brochure-open /
   gd:brochure-close events on the section, which freeze and resume p. */

function initGiaStory(sectionEl) {
  if (!sectionEl) return;

  const runway = sectionEl.querySelector(".gd-story__runway");
  const stage = sectionEl.querySelector(".gd-story__stage");
  const video = sectionEl.querySelector(".gd-story__video");
  const finalEl = sectionEl.querySelector(".gd-story__final");
  const progressFill = sectionEl.querySelector(".gd-story__progress-fill");
  const counter = sectionEl.querySelector(".gd-story__counter");
  const count = sectionEl.querySelector(".gd-story__count");
  const ticks = Array.from(sectionEl.querySelectorAll(".gd-story__tick"));
  const moduleEls = Array.from(sectionEl.querySelectorAll(".gd-module"));
  if (!runway || !stage) return;

  const FALLBACK_DURATION = 8.0;
  const FRAME = 1 / 24;

  // Continuous track (build spec 5.4). Cards are spaced about 75% of the
  // stage width apart, never closer than their own width plus 12%. At p = 0
  // card 4.1 is just beyond the right edge; card 4.4 has left the screen by
  // TRACK_END; the final CTA card follows on the same track and settles in
  // the left zone at FINAL_REST, then holds.
  const SPACING = 0.75;
  const MIN_GAP = 0.12;
  const TRACK_END = 0.86;
  const FINAL_REST = 0.94;
  const COUNTER_ANCHOR = 0.35;
  const SCALE = { from: 1.04, to: 1.0, range: [0.80, 0.98] };

  // GSAP-equivalent ease: power1 is quadratic.
  const power1InOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const at = (p, range) => clamp01((p - range[0]) / (range[1] - range[0]));

  // Each card moves by translateX from its layout rest position (its zone);
  // rest positions and widths come from layout offsets, measured on resize.
  const card = (el, interactiveEl, buttonEl) => ({
    el, interactiveEl, buttonEl, rest: 0, width: 0, buttonLeft: 0, buttonWidth: 0, x: null, tx: null, interactive: null
  });
  const modules = moduleEls.map((el) => Object.assign(card(el, el, el.querySelector(".gd-module__cta")), { entrance: true }));
  const finalCard = finalEl
    ? card(finalEl.querySelector(".gd-story__final-inner") || finalEl, finalEl, finalEl.querySelector(".gd-story__final-cta"))
    : null;

  let stageW = 1;
  let spacing = 1;
  let speed = 1;

  function measureTrack() {
    stageW = Math.max(1, stage.clientWidth);
    const all = finalCard ? modules.concat(finalCard) : modules;
    all.forEach((c) => {
      c.rest = c.el.offsetLeft;
      c.width = c.el.offsetWidth;
      // The card only translates, so the button's offset inside it is fixed.
      const button = c.buttonEl || c.el;
      c.buttonLeft = button.getBoundingClientRect().left - c.el.getBoundingClientRect().left;
      c.buttonWidth = button.offsetWidth;
    });
    const widest = Math.max(0, ...modules.map((c) => c.width));
    spacing = Math.max(SPACING * stageW, widest + MIN_GAP * stageW);
    const last = modules[modules.length - 1];
    speed = (stageW + (modules.length - 1) * spacing + (last ? last.width : 0)) / TRACK_END;
  }

  // Screen-space left edge of each card, a pure function of p.
  const moduleX = (i, p) => stageW + i * spacing - speed * p;
  const finalX = (p) => finalCard.rest + speed * Math.max(0, FINAL_REST - p);

  // inert on threshold crossings only, never per frame: a card is
  // interactive only while its button is fully inside the stage.
  function place(c, x) {
    if (x !== c.x) {
      c.x = x;
      const tx = Math.round((x - c.rest) * 100) / 100;
      if (tx !== c.tx) {
        c.tx = tx;
        c.el.style.transform = `translate3d(${tx}px, 0, 0)`;
      }
    }
    const left = x + c.buttonLeft;
    const on = left >= 0 && left + c.buttonWidth <= stageW;
    if (on === c.interactive) return;
    c.interactive = on;
    c.interactiveEl.inert = !on;
    // Chapter cards play their entrance once, the first time they become
    // interactive (approved 2026-10-02); the class never comes off.
    if (on && c.entrance) c.el.classList.add("is-entered");
  }

  let scale = null;
  let activeChapter = -1;
  let counterHidden = null;

  function render(p) {
    const anchor = COUNTER_ANCHOR * stageW;
    let chapter = 0;
    let nearest = Infinity;
    modules.forEach((c, i) => {
      const x = moduleX(i, p);
      place(c, x);
      const d = Math.abs(x + c.width / 2 - anchor);
      if (d < nearest) {
        nearest = d;
        chapter = i;
      }
    });

    let finalNearest = false;
    if (finalCard) {
      const x = finalX(p);
      place(finalCard, x);
      finalNearest = Math.abs(x + finalCard.width / 2 - anchor) < nearest;
    }

    if (video) {
      const s = SCALE.from + (SCALE.to - SCALE.from) * power1InOut(at(p, SCALE.range));
      if (s !== scale) {
        scale = s;
        video.style.transform = `scale(${s.toFixed(4)})`;
      }
    }

    if (progressFill) progressFill.style.transform = `scaleX(${p.toFixed(4)})`;

    // Active chapter: the card whose centre is nearest 35% of the stage
    // width. Hidden once the final CTA card is the nearest.
    if (chapter !== activeChapter) {
      activeChapter = chapter;
      if (count) count.textContent = `${String(chapter + 1).padStart(2, "0")} / ${String(modules.length).padStart(2, "0")}`;
      ticks.forEach((tick, i) => tick.classList.toggle("is-active", i === chapter));
    }
    if (counter && finalNearest !== counterHidden) {
      counterHidden = finalNearest;
      counter.classList.toggle("is-hidden", finalNearest);
    }
  }

  function clearInline() {
    (finalCard ? modules.concat(finalCard) : modules).forEach((c) => {
      c.el.style.transform = "";
      c.interactiveEl.inert = false;
      c.x = c.tx = c.interactive = null;
    });
    if (video) video.style.transform = "";
    if (progressFill) progressFill.style.transform = "";
    scale = counterHidden = null;
    activeChapter = -1;
  }

  // ---------- Runway metrics ----------

  let runwayTop = 0;
  let runwaySpan = 1;

  function measure() {
    runwayTop = runway.getBoundingClientRect().top + window.scrollY;
    runwaySpan = Math.max(1, runway.offsetHeight - stage.offsetHeight);
    measureTrack();
    rendered = -1;
  }

  function progress() {
    return clamp01((window.scrollY - runwayTop) / runwaySpan);
  }

  // ---------- Video (blob, fetched when Screen 3 is near) ----------

  let duration = FALLBACK_DURATION;
  let videoReady = false;
  let fetchArmed = false;

  function fetchVideo() {
    if (!video || !video.dataset.src || !("fetch" in window)) return;
    fetch(video.dataset.src)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        return response.blob();
      })
      .then((blob) => {
        video.addEventListener("loadedmetadata", () => {
          if (isFinite(video.duration) && video.duration > 0) duration = video.duration;
          videoReady = true;
        }, { once: true });
        video.addEventListener("error", () => { videoReady = false; }, { once: true });
        video.preload = "auto";
        video.src = URL.createObjectURL(blob);
      })
      .catch(() => {
        // Missing video: the poster stays as a static background and the
        // card track still runs on scroll.
      });
  }

  function armFetch() {
    if (fetchArmed) return;
    fetchArmed = true;
    // Screen 3 approaching is the normal trigger; the section itself also
    // triggers it, for visitors who land past Screen 3 (anchor, restored
    // scroll).
    const targets = [document.getElementById("screen-3"), sectionEl].filter(Boolean);
    if (!("IntersectionObserver" in window)) {
      fetchVideo();
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      fetchVideo();
    }, { rootMargin: "100% 0px" });
    targets.forEach((target) => observer.observe(target));
  }

  // ---------- Loop ----------

  let smoothed = null;
  let rendered = -1;
  let frozen = false;
  let lastNow = 0;
  let rafId = 0;
  let near = false;

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const dt = lastNow ? (now - lastNow) / 1000 : 0;
    lastNow = now;

    // While a brochure is open the story keeps its current p.
    const target = frozen && smoothed !== null ? smoothed : progress();
    if (smoothed === null) smoothed = target;
    smoothed += (target - smoothed) * (1 - Math.pow(0.001, dt));
    if (Math.abs(target - smoothed) < 0.00005) smoothed = target;

    if (smoothed !== rendered) {
      rendered = smoothed;
      render(smoothed);
    }

    const time = smoothed * duration;
    if (videoReady && !video.seeking && Math.abs(video.currentTime - time) > FRAME) {
      video.currentTime = time;
    }
  }

  function start() {
    if (rafId) return;
    lastNow = 0;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  sectionEl.addEventListener("gd:brochure-open", () => { frozen = true; });
  sectionEl.addEventListener("gd:brochure-close", () => { frozen = false; });

  // ---------- Mode: pinned story or static composition ----------

  const staticQuery = window.matchMedia("(prefers-reduced-motion: reduce), (max-height: 560px)");
  let scrub = false;

  function setMode() {
    const want = !staticQuery.matches;
    if (want === scrub) return;
    scrub = want;
    sectionEl.classList.toggle("is-scrub", scrub);
    if (scrub) {
      armFetch();
      measure();
      smoothed = null;
      rendered = -1;
      render(progress());
      if (near) start();
    } else {
      stop();
      clearInline();
    }
  }

  window.addEventListener("resize", () => { if (scrub) measure(); });
  window.addEventListener("load", () => { if (scrub) measure(); });
  if (staticQuery.addEventListener) staticQuery.addEventListener("change", setMode);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        near = entry.isIntersecting;
        if (near && scrub) start();
        else stop();
      });
    }, { rootMargin: "100% 0px" }).observe(sectionEl);
  } else {
    near = true;
  }

  setMode();
}

document.addEventListener("DOMContentLoaded", () => initGiaStory(document.getElementById("screen-4")));
