(() => {
  'use strict';

  // ===================================================================
  // Glonari Campus — desktop first screen, v2 (2026-10-13).
  //
  // Replaces the layered mouse-parallax scene (see DEVELOPMENT_PLAN.md
  // Stage 19 / PRODUCT_REQUIREMENTS.md §29 for what was superseded):
  //
  //   branded overlay ("explore")  →  intro video (camera pulls back from
  //   the globe, Gia walks in)     →  seamless 14 s loop (fixed camera;
  //   only the fountain jets and the globe move)  →  11 hotspots live.
  //
  // The hotspots are SVG shapes drawn in index.html in a fixed
  // 1280x720 coordinate space (viewBox; the 1920x1080 video scales into
  // it). Because the loop's camera, houses and presenter
  // never move, those shapes never have to move either: no hit-testing
  // math, no per-frame work — the browser's own SVG hit-testing does it.
  // ===================================================================

  const campus = document.getElementById('campus');
  if (!campus) return;

  const root = document.documentElement;
  const loopVideo = campus.querySelector('.campus__loop');
  const introVideo = campus.querySelector('.campus__intro');
  const zonesSvg = campus.querySelector('.campus__zones');
  const label = document.querySelector('.campus__label');
  const labelName = document.querySelector('.campus__label-name');
  const zones = Array.from(campus.querySelectorAll('.zone'));
  const dimHole = document.getElementById('dim-hole');

  // SVG viewBox size (coordinate space), not the video's pixel size.
  const FRAME_W = 1280;
  const FRAME_H = 720;

  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

  // ---------- Video sequence ----------
  let introStarted = false;
  let loopStarted = false;
  let introSafetyTimer = null;

  // No playable source at all (unsupported codec, missing file): play()
  // may then never settle, so check up front instead of waiting it out.
  function cannotPlay(video) {
    return !video || !!video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE;
  }

  function enterReady() {
    campus.classList.add('is-ready');
    document.body.classList.add('campus-ready');
  }

  // Calls cb once the video has actually put a frame on screen, so the
  // layer above it can be removed without a black flash in between.
  function onFirstFrame(video, cb) {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      cb();
    };
    if (typeof video.requestVideoFrameCallback === 'function') {
      video.requestVideoFrameCallback(() => finish());
    } else {
      video.addEventListener('playing', () => requestAnimationFrame(() => requestAnimationFrame(finish)), { once: true });
    }
    // Never strand the visitor on a held frame if the callback never comes.
    window.setTimeout(finish, 1500);
  }

  function startLoop() {
    if (loopStarted) return;
    loopStarted = true;
    window.clearTimeout(introSafetyTimer);

    const handOff = () => {
      // The loop is on screen under the intro's held last frame → drop the
      // intro layer. Both frames are the same picture, so the cut is invisible.
      campus.classList.remove('is-prelude', 'is-intro');
      enterReady();
    };

    if (reduceMotionQuery.matches || cannotPlay(loopVideo)) {
      // Reduced motion (or no playable loop): the still frame is the Campus.
      loopVideo.pause();
      handOff();
      return;
    }

    campus.classList.remove('is-prelude'); // still + loop may show under the intro now
    loopVideo.currentTime = 0;
    const playing = loopVideo.play();
    if (playing && typeof playing.catch === 'function') {
      // Autoplay refused (e.g. battery saver): the still frame underneath
      // is pixel-identical, so the Campus simply stays still.
      playing.catch(handOff);
    }
    onFirstFrame(loopVideo, handOff);
  }

  function playIntro() {
    if (introStarted || loopStarted) return;
    introStarted = true;

    if (reduceMotionQuery.matches || cannotPlay(introVideo)) {
      startLoop();
      return;
    }

    campus.classList.add('is-intro');
    introVideo.addEventListener('ended', startLoop, { once: true });
    introVideo.addEventListener('error', startLoop, { once: true });
    const source = introVideo.querySelector('source');
    if (source) source.addEventListener('error', startLoop, { once: true });

    // Safety net: if the intro stalls (slow network, a decode error that
    // fires no event), the Campus still arrives.
    const armSafety = () => {
      window.clearTimeout(introSafetyTimer);
      const ms = ((introVideo.duration || 6.3) + 5) * 1000;
      introSafetyTimer = window.setTimeout(startLoop, ms);
    };
    armSafety();
    introVideo.addEventListener('playing', armSafety, { once: true });

    introVideo.currentTime = 0;
    // The intro always plays muted (its audio track is removed).
    introVideo.play().catch(startLoop);
  }

  const introPending = root.classList.contains('intro-active');
  if (introPending && !reduceMotionQuery.matches) {
    // Behind the branded overlay: keep the stage black, so when the overlay
    // fades the intro video opens from darkness (its own first frames are
    // black) rather than from the finished Campus.
    campus.classList.add('is-prelude');
  }

  if (introPending) {
    if (window.glonariIntroExiting) {
      playIntro();
    } else {
      document.addEventListener('glonari:intro-exit', playIntro, { once: true });
    }
  } else {
    // Returning to the Campus (Back/Forward, or from a sub-site) or the
    // intro was suppressed: straight into the loop, no intro video.
    introStarted = true;
    startLoop();
  }

  reduceMotionQuery.addEventListener('change', () => {
    if (!loopStarted) return;
    if (reduceMotionQuery.matches) {
      loopVideo.pause();
    } else {
      loopVideo.play().catch(() => {});
    }
  });

  // ---------- Section modal / cross-site navigation ----------
  // Content and open/close/focus-trap behaviour live in section-modal.js
  // (shared with mobile/). NAV_TARGETS: hotspots that leave this page for
  // their own site instead of opening the modal.
  const NAV_TARGETS = {
    'building-banker': 'digital-banker/gia/index.html',
    'presenter': 'meet-gia/index.html',
  };

  const exitTransition = document.getElementById('exit-transition');
  const EXIT_FADE_MS = 550; // #exit-transition's CSS transition + margin

  function navigateWithFade(url) {
    if (!exitTransition) {
      window.location.href = url;
      return;
    }
    exitTransition.classList.add('active');
    window.setTimeout(() => {
      window.location.href = url;
    }, EXIT_FADE_MS);
  }

  // ---------- Hover / focus highlight ----------
  // Mouse hover and keyboard focus are tracked separately (so a stray
  // pointerout can't cancel a keyboard user's focus) and reconciled into
  // one highlighted zone.
  const cursorDot = document.querySelector('.cursor-dot');
  let hoveredZone = null;
  let focusedZone = null;
  let activeZone = null;

  const sectionModal = window.SectionModal.create({
    overlay: document.getElementById('modal-overlay'),
    card: document.getElementById('modal-card'),
    title: document.getElementById('modal-title'),
    desc: document.getElementById('modal-desc'),
    closeBtn: document.getElementById('modal-close'),
    onOpen: () => {
      hoveredZone = null;
      document.body.classList.add('modal-active');
      recomputeActive();
    },
    onClose: () => {
      document.body.classList.remove('modal-active');
    },
  });

  function activateZone(zone) {
    if (!zone || !campus.classList.contains('is-ready')) return;
    if (sectionModal && sectionModal.isOpen()) return;
    const key = zone.dataset.key;
    const url = NAV_TARGETS[key];
    if (url) {
      navigateWithFade(url);
      return;
    }
    if (sectionModal) sectionModal.open(key, zone);
  }

  function zoneOf(node) {
    return node && node.closest ? node.closest('.zone') : null;
  }

  function placeLabel(zone) {
    if (!label || !zone) return;
    labelName.textContent = zone.dataset.name || '';
    const rect = campus.getBoundingClientRect();
    let x = rect.left + (parseFloat(zone.dataset.labelX) * rect.width) / FRAME_W;
    let y = rect.top + (parseFloat(zone.dataset.labelY) * rect.height) / FRAME_H;
    // Keep the tag on screen: the crop can hide the frame's outer edges.
    const w = label.offsetWidth || 160;
    const h = label.offsetHeight || 32;
    const margin = 14;
    x = Math.min(Math.max(x, margin + w / 2), window.innerWidth - margin - w / 2);
    y = Math.max(y, margin + h);
    label.style.left = `${x}px`;
    label.style.top = `${y}px`;
  }

  function applyActive(zone) {
    if (zone === activeZone) return;
    if (activeZone) activeZone.classList.remove('is-active');
    activeZone = zone;
    zonesSvg.classList.toggle('has-active', zone !== null);
    if (zone) {
      zone.classList.add('is-active');
      if (dimHole) {
        const hit = zone.querySelector('.zone__hit');
        dimHole.setAttribute('d', hit ? hit.getAttribute('d') : '');
        dimHole.setAttribute('mask', `url(#mask-${zone.dataset.key})`);
      }
      placeLabel(zone);
      if (label) label.classList.add('is-visible');
    } else if (label) {
      label.classList.remove('is-visible');
    }
    if (cursorDot) cursorDot.classList.toggle('hover', zone !== null);
  }

  function recomputeActive() {
    const ready = campus.classList.contains('is-ready');
    const modalOpen = sectionModal && sectionModal.isOpen();
    applyActive(ready && !modalOpen ? hoveredZone || focusedZone : null);
  }

  zonesSvg.addEventListener('pointerover', (event) => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    hoveredZone = zoneOf(event.target);
    recomputeActive();
  });

  zonesSvg.addEventListener('pointerout', (event) => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    hoveredZone = zoneOf(event.relatedTarget);
    recomputeActive();
  });

  window.addEventListener('blur', () => {
    hoveredZone = null;
    recomputeActive();
  });

  // Click and tap (tablets ≥768px wide land on this page too).
  zonesSvg.addEventListener('click', (event) => {
    activateZone(zoneOf(event.target));
  });

  for (const zone of zones) {
    zone.addEventListener('focus', () => {
      focusedZone = zone;
      recomputeActive();
    });
    zone.addEventListener('blur', () => {
      if (focusedZone !== zone) return;
      focusedZone = null;
      recomputeActive();
    });
    zone.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
      event.preventDefault(); // Space must not scroll
      activateZone(zone);
    });
  }

  // Zones are not tabbable until the Campus is live.
  function syncTabbable() {
    const ready = campus.classList.contains('is-ready');
    zones.forEach((zone) => zone.setAttribute('tabindex', ready ? '0' : '-1'));
    recomputeActive();
  }
  syncTabbable();
  new MutationObserver(syncTabbable).observe(campus, { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('resize', () => {
    if (activeZone) placeLabel(activeZone);
  });

  // ---------- Custom cursor (fine-pointer desktop only) ----------
  if (finePointerQuery.matches) {
    const cursorRing = document.querySelector('.cursor-ring');
    if (cursorDot && cursorRing) {
      let mx = window.innerWidth / 2;
      let my = window.innerHeight / 2;
      let rx = mx;
      let ry = my;
      cursorDot.style.left = `${mx}px`;
      cursorDot.style.top = `${my}px`;
      cursorRing.style.left = `${rx}px`;
      cursorRing.style.top = `${ry}px`;

      window.addEventListener('pointermove', (event) => {
        if (event.pointerType !== 'mouse') return;
        mx = event.clientX;
        my = event.clientY;
        cursorDot.style.left = `${mx}px`;
        cursorDot.style.top = `${my}px`;
      });

      const ringLoop = () => {
        rx += (mx - rx) * 0.15;
        ry += (my - ry) * 0.15;
        cursorRing.style.left = `${rx}px`;
        cursorRing.style.top = `${ry}px`;
        requestAnimationFrame(ringLoop);
      };
      ringLoop();
    }
  }
})();
