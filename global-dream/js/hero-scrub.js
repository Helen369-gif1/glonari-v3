/* Screen 1 scroll-to-video binding and phrase timeline (build spec Section 5.1).
   Adapted from the Global Reserve Screen 1 technique: the hero video is
   fetched as a blob, the runway's scroll progress sets a target video time,
   the time is smoothed exponentially, and one paused GSAP timeline measured
   in video seconds is driven with .time(smoothed). Block 1 is nudged in on
   load without scroll. Under reduced motion, or without GSAP, the static
   composition in screens.css is left in place. */

function initHeroScrub(sectionEl) {
  if (!sectionEl) return;

  const runway = sectionEl.querySelector(".gd-hero__runway");
  const stage = sectionEl.querySelector(".gd-hero__stage");
  const video = sectionEl.querySelector(".gd-hero__video");
  const cta = sectionEl.querySelector(".gd-hero__cta");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || typeof gsap === "undefined" || !runway || !stage) return;

  const FALLBACK_DURATION = 8.0;
  const FRAME = 1 / 24;
  const WORD_DURATION = 0.7;
  const WORD_STAGGER = 0.03;
  const CTA_IN = 5.5;

  // In / Out times in video seconds (build spec 5.1 table). Out is the
  // time each exit starts.
  const blocks = [
    { el: sectionEl.querySelector(".gd-hero__block--1"), tIn: 0.0, tOut: 2.03 },
    { el: sectionEl.querySelector(".gd-hero__block--2"), tIn: 3.0, tOut: 4.54 },
    { el: sectionEl.querySelector(".gd-hero__block--3"), tIn: 5.3, tOut: null }
  ];

  sectionEl.classList.add("is-scrub");

  // ---------- Words and timeline ----------

  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    return words.map((word, i) => {
      if (i) el.append(" ");
      const span = document.createElement("span");
      span.className = "word";
      span.textContent = word;
      el.append(span);
      return span;
    });
  }

  const span = (count) => WORD_DURATION + WORD_STAGGER * (count - 1);
  const tl = gsap.timeline({ paused: true });

  blocks.forEach((block) => {
    block.words = Array.from(block.el.querySelectorAll("[data-split]")).flatMap(splitWords);
  });

  blocks.forEach((block, i) => {
    tl.fromTo(block.words,
      { y: 36, opacity: 0 },
      { y: 0, opacity: 1, duration: WORD_DURATION, stagger: WORD_STAGGER, ease: "power3.out" },
      block.tIn);

    if (block.tOut === null) return;
    // Each exit must finish by the next block's In time, so the exit starts
    // at the table's Out time, or earlier if the staggered exit would
    // otherwise still be running at the next In.
    const next = blocks[i + 1];
    const exitStart = Math.min(block.tOut, next.tIn - span(block.words.length));
    tl.fromTo(block.words,
      { y: 0, opacity: 1 },
      { y: -26, opacity: 0, duration: WORD_DURATION, stagger: WORD_STAGGER, ease: "power2.in", immediateRender: false },
      exitStart);
  });

  if (cta) {
    tl.fromTo(cta,
      { y: 36, opacity: 0 },
      { y: 0, opacity: 1, duration: WORD_DURATION, ease: "power3.out" },
      CTA_IN);
  }

  // Block 1 appears on load without scroll: elapsed time since init is
  // used as a floor for the text time, capped at block 1's fade-in length.
  const NUDGE_CAP = span(blocks[0].words.length);

  // ---------- Button interactivity (toggled on threshold crossings) ----------

  let ctaInteractive = null;

  function updateCta() {
    if (!cta) return;
    const on = gsap.getProperty(cta, "opacity") >= 0.5;
    if (on === ctaInteractive) return;
    ctaInteractive = on;
    cta.classList.toggle("is-interactive", on);
    if (on) cta.removeAttribute("tabindex");
    else cta.setAttribute("tabindex", "-1");
  }

  // ---------- Runway metrics ----------

  let runwayTop = 0;
  let runwaySpan = 1;

  function measure() {
    runwayTop = runway.getBoundingClientRect().top + window.scrollY;
    runwaySpan = Math.max(1, runway.offsetHeight - stage.offsetHeight);
  }

  function progress() {
    const p = (window.scrollY - runwayTop) / runwaySpan;
    return p < 0 ? 0 : p > 1 ? 1 : p;
  }

  measure();
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);

  // ---------- Video (blob) ----------

  let duration = FALLBACK_DURATION;
  let videoReady = false;

  if (video && video.dataset.src && "fetch" in window) {
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
        // text timeline still runs on scroll.
      });
  }

  // ---------- Loop ----------

  const startedAt = performance.now();
  let smoothed = null;
  let textTime = -1;
  let lastNow = 0;
  let rafId = 0;

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const dt = lastNow ? (now - lastNow) / 1000 : 0;
    lastNow = now;

    const target = progress() * duration;
    if (smoothed === null) smoothed = target;
    smoothed += (target - smoothed) * (1 - Math.pow(0.001, dt));
    if (Math.abs(target - smoothed) < 0.0005) smoothed = target;

    const nudge = Math.min((now - startedAt) / 1000, NUDGE_CAP);
    const t = Math.max(smoothed, nudge);
    if (t !== textTime) {
      textTime = t;
      tl.time(t);
      updateCta();
    }

    if (videoReady && !video.seeking && Math.abs(video.currentTime - smoothed) > FRAME) {
      video.currentTime = smoothed;
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

  tl.time(0);
  updateCta();

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
    }, { rootMargin: "100% 0px" }).observe(sectionEl);
  } else {
    start();
  }
}

document.addEventListener("DOMContentLoaded", () => initHeroScrub(document.getElementById("screen-1")));
