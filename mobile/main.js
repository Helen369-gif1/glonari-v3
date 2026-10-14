(() => {
  'use strict';

  // ===================================================================
  // Glonari Campus — mobile first screen (2026-10-14, DEVELOPMENT_PLAN.md
  // Stage 20 / PRODUCT_REQUIREMENTS.md §30).
  //
  // Replaces the old branded intro overlay and the carousel of cut-out
  // buildings. Same media and same 11 hotspots as the desktop Campus:
  //
  //   opening video, full screen, at a fixed horizontal position  →
  //   seamless loop  →  the Campus can be swiped sideways (inertia, stops
  //   softly at the frame's edges), tap a zone to highlight it, tap again
  //   (or tap its name tag) to open it.
  //
  // The opening, the still, the loop and the SVG zones all live in one
  // 16:9 box (.campus); panning is ONE transform on that box, written once
  // per animation frame. Nothing inside the box ever moves.
  // ===================================================================

  const stage = document.getElementById('stage');
  const campus = document.getElementById('campus');
  if (!stage || !campus) return;

  const root = document.documentElement;
  const loopVideo = campus.querySelector('.campus__loop');
  const openingVideo = campus.querySelector('.campus__opening');
  const zonesSvg = campus.querySelector('.campus__zones');
  const zones = Array.from(campus.querySelectorAll('.zone'));
  const dimHole = document.getElementById('dim-hole');
  const tag = document.querySelector('.campus__tag');
  const tagName = document.querySelector('.campus__tag-name');
  const edgeLeft = document.querySelector('.campus__edge--left');
  const edgeRight = document.querySelector('.campus__edge--right');

  // SVG viewBox size (coordinate space), not the video's pixel size.
  const FRAME_W = 1280;

  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ---------- Framing / pan state ----------
  // glonariCampusFrame() lives in index.html's <head> (the inline script
  // there places the box before the first paint with the same numbers).
  let frame = glonariCampusFrame(stage.clientWidth, stage.clientHeight);
  let tx = frame.openingTx; // horizontal offset of the box, px (≤ 0)
  let panEnabled = false; // only once the loop is on (fixed during the opening)

  const clampTx = (value) => Math.min(0, Math.max(frame.minTx, value));
  const scale = () => frame.w / FRAME_W; // px per zone unit

  // Zone extents in zone units (1280x720), from the hit shapes themselves.
  const zoneBox = new Map();
  for (const zone of zones) {
    const hit = zone.querySelector('.zone__hit');
    const box = hit.getBBox();
    zoneBox.set(zone, { left: box.x, right: box.x + box.width, cx: box.x + box.width / 2 });
  }
  // Edge plates point at buildings only (not the fountain or Gia).
  const buildings = zones.filter((zone) => zone.dataset.key.startsWith('building-'));

  let renderQueued = false;
  function render() {
    renderQueued = false;
    campus.style.transform = `translate3d(${tx}px,${frame.top}px,0)`;
    if (selectedZone) placeTag(selectedZone);
    updateEdges();
  }
  function requestRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(render);
  }

  // ---------- Glide (inertia and "bring into view") ----------
  // Exponential approach to a target: fast at first, easing out to a stop.
  // The target is always inside the pan range, so it stops exactly at an
  // edge rather than overshooting into empty space.
  let glideTarget = null;
  let glideTau = 0;
  let glideLast = 0;

  function glideTo(target, tau) {
    target = clampTx(target);
    if (reduceMotionQuery.matches || Math.abs(target - tx) < 0.5) {
      stopGlide();
      tx = target;
      requestRender();
      return;
    }
    const wasGliding = glideTarget !== null;
    glideTarget = target;
    glideTau = tau;
    if (!wasGliding) {
      glideLast = performance.now();
      requestAnimationFrame(glideStep);
    }
  }

  function stopGlide() {
    glideTarget = null;
  }

  function glideStep(now) {
    if (glideTarget === null) return;
    const dt = Math.min(64, now - glideLast);
    glideLast = now;
    tx += (glideTarget - tx) * (1 - Math.exp(-dt / glideTau));
    if (Math.abs(glideTarget - tx) < 0.3) {
      tx = glideTarget;
      glideTarget = null;
    }
    render();
    if (glideTarget !== null) requestAnimationFrame(glideStep);
  }

  // ---------- Video sequence (same logic as the desktop main.js) ----------
  let openingStarted = false;
  let loopStarted = false;
  let openingSafetyTimer = null;

  // Already failed (unsupported codec, missing file). networkState is not
  // checked: it reads NETWORK_NO_SOURCE for a moment at the start of every
  // load. Later failures arrive as 'error' / a rejected play() / timers.
  function cannotPlay(video) {
    return !video || !!video.error;
  }

  function enterReady() {
    campus.classList.add('is-ready');
    document.body.classList.add('campus-ready');
    panEnabled = true;
    updateEdges();
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
    window.setTimeout(finish, 1500);
  }

  function startLoop() {
    if (loopStarted) return;
    loopStarted = true;
    window.clearTimeout(openingSafetyTimer);

    const handOff = () => {
      if (root.classList.contains('opening-pending')) {
        // Shown (or skipped by a fallback) once → not again in this tab's
        // session, on mobile or desktop; both <head> scripts read it.
        try {
          sessionStorage.setItem('glonari.openingSeen', '1');
        } catch (e) {
          // No sessionStorage: every load behaves like a first visit.
        }
      }
      root.classList.remove('opening-pending');
      campus.classList.remove('is-handoff');
      if (openingVideo) openingVideo.pause();
      enterReady();
    };

    if (reduceMotionQuery.matches || cannotPlay(loopVideo)) {
      // Reduced motion (or no playable loop): the still frame is the Campus.
      loopVideo.pause();
      handOff();
      return;
    }

    campus.classList.add('is-handoff'); // still + loop may show under the opening now
    loopVideo.currentTime = 0;
    const playing = loopVideo.play();
    if (playing && typeof playing.catch === 'function') {
      // Autoplay refused (e.g. Low Power Mode): the still frame underneath
      // is pixel-identical, so the Campus simply stays still.
      playing.catch(handOff);
    }
    onFirstFrame(loopVideo, handOff);
  }

  function playOpening() {
    if (openingStarted || loopStarted) return;
    openingStarted = true;

    if (reduceMotionQuery.matches || cannotPlay(openingVideo)) {
      startLoop();
      return;
    }

    openingVideo.addEventListener('ended', startLoop, { once: true });
    openingVideo.addEventListener('error', startLoop, { once: true });

    // Safety net: never more than 4 s on the poster if playback doesn't
    // start; once it plays, its length plus a margin if it stalls.
    openingSafetyTimer = window.setTimeout(startLoop, 4000);
    openingVideo.addEventListener('playing', () => {
      window.clearTimeout(openingSafetyTimer);
      const ms = ((openingVideo.duration || 8.4) + 5) * 1000;
      openingSafetyTimer = window.setTimeout(startLoop, ms);
    }, { once: true });

    // Muted + playsinline: allowed to autoplay without a gesture. If the
    // browser still refuses, go straight to the interactive Campus.
    openingVideo.currentTime = 0;
    const playing = openingVideo.play();
    if (playing && typeof playing.catch === 'function') playing.catch(startLoop);
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
  // Same targets as the desktop main.js; everything else opens the shared
  // section modal (section-modal.js).
  const NAV_TARGETS = {
    'building-banker': '../digital-banker/gia/index.html',
    'presenter': '../meet-gia/index.html',
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

  const sectionModal = window.SectionModal
    ? window.SectionModal.create({
        overlay: document.getElementById('modal-overlay'),
        card: document.getElementById('modal-card'),
        title: document.getElementById('modal-title'),
        desc: document.getElementById('modal-desc'),
        closeBtn: document.getElementById('modal-close'),
        onOpen: () => {
          document.body.classList.add('modal-active');
          document.getElementById('modal-card').scrollTop = 0;
        },
        // On close, section-modal.js returns focus to the zone, which keeps
        // it selected (as desktop keeps its focus highlight): one more tap
        // reopens it, a tap on empty ground clears it.
        onClose: () => {
          document.body.classList.remove('modal-active');
        },
      })
    : null;

  const modalX = document.querySelector('#modal-card .modal-x');
  if (modalX && sectionModal) modalX.addEventListener('click', () => sectionModal.close());

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

  // Back/Forward can restore this page from the back/forward cache as it
  // was left — black fade on top, loop paused, a zone selected.
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    if (exitTransition) exitTransition.classList.remove('active');
    select(null);
    if (loopStarted && !reduceMotionQuery.matches && !cannotPlay(loopVideo)) {
      loopVideo.play().catch(() => {});
    }
  });

  // ---------- Selection (tap = desktop hover) ----------
  let selectedZone = null;
  const TAG_MARGIN = 14;

  function select(zone) {
    if (zone === selectedZone) return;
    if (selectedZone) selectedZone.classList.remove('is-active');
    selectedZone = zone;
    zonesSvg.classList.toggle('has-active', zone !== null);
    if (zone) {
      zone.classList.add('is-active');
      if (dimHole) {
        const hit = zone.querySelector('.zone__hit');
        dimHole.setAttribute('d', hit ? hit.getAttribute('d') : '');
        dimHole.setAttribute('mask', `url(#mask-${zone.dataset.key})`);
      }
      tagName.textContent = zone.dataset.name || '';
      tag.setAttribute('aria-label', zone.getAttribute('aria-label') || '');
      placeTag(zone);
      tag.classList.add('is-visible');
      tag.removeAttribute('aria-hidden');
      tag.tabIndex = 0;
    } else {
      tag.classList.remove('is-visible');
      tag.setAttribute('aria-hidden', 'true');
      tag.tabIndex = -1;
    }
  }

  function placeTag(zone) {
    const s = scale();
    let x = tx + parseFloat(zone.dataset.labelX) * s;
    let y = frame.top + parseFloat(zone.dataset.labelY) * s;
    const w = tag.offsetWidth || 160;
    const h = tag.offsetHeight || 36;
    const vw = stage.clientWidth;
    x = Math.min(Math.max(x, TAG_MARGIN + w / 2), vw - TAG_MARGIN - w / 2);
    y = Math.max(y, TAG_MARGIN + h);
    tag.style.left = `${x}px`;
    tag.style.top = `${y}px`;
  }

  // Buttons over the Campus (name tag, edge plates): a finger acts on
  // pointerup straight away, without waiting for the browser's
  // compatibility click (which is then cancelled, so it can't act twice);
  // the mouse and the keyboard (Enter/Space) go through click.
  function onPress(el, action) {
    if (!el) return;
    let downId = null;
    el.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse') downId = event.pointerId;
    });
    el.addEventListener('pointerup', (event) => {
      if (event.pointerId !== downId) return;
      downId = null;
      action();
    });
    el.addEventListener('pointercancel', () => { downId = null; });
    el.addEventListener('touchend', (event) => {
      if (event.cancelable) event.preventDefault();
    }, { passive: false });
    el.addEventListener('click', (event) => {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      action();
    });
  }

  onPress(tag, () => {
    if (selectedZone) activateZone(selectedZone);
  });

  // A zone partly beyond a screen edge glides fully into view (or is
  // centred if it is wider than the screen).
  const VIEW_MARGIN = 16;
  function bringIntoView(zone) {
    const box = zoneBox.get(zone);
    const s = scale();
    const vw = stage.clientWidth;
    const left = tx + box.left * s;
    const right = tx + box.right * s;
    let target = tx;
    if (right - left > vw - 2 * VIEW_MARGIN) {
      target = vw / 2 - box.cx * s;
    } else if (left < VIEW_MARGIN) {
      target = tx + (VIEW_MARGIN - left);
    } else if (right > vw - VIEW_MARGIN) {
      target = tx - (right - (vw - VIEW_MARGIN));
    }
    if (clampTx(target) !== tx) glideTo(target, 160);
  }

  function centreOn(zone) {
    const box = zoneBox.get(zone);
    glideTo(stage.clientWidth / 2 - box.cx * scale(), 170);
  }

  // ---------- Edge plates ----------
  // Nearest building whose centre is beyond each edge of the screen.
  let edgeLeftZone = null;
  let edgeRightZone = null;

  function setEdge(el, zone) {
    if (!el) return;
    el.querySelector('.campus__edge-name').textContent = zone ? zone.dataset.name : '';
    el.classList.toggle('is-visible', !!zone);
    el.setAttribute('aria-hidden', zone ? 'false' : 'true');
    el.setAttribute('aria-label', zone ? `Go to ${zone.dataset.name}` : '');
    el.tabIndex = zone ? 0 : -1;
  }

  function updateEdges() {
    let left = null;
    let right = null;
    if (panEnabled) {
      const s = scale();
      const vw = stage.clientWidth;
      let leftX = -Infinity;
      let rightX = Infinity;
      for (const zone of buildings) {
        const cx = tx + zoneBox.get(zone).cx * s;
        if (cx < 0 && cx > leftX) {
          leftX = cx;
          left = zone;
        } else if (cx > vw && cx < rightX) {
          rightX = cx;
          right = zone;
        }
      }
    }
    if (left !== edgeLeftZone) setEdge(edgeLeft, (edgeLeftZone = left));
    if (right !== edgeRightZone) setEdge(edgeRight, (edgeRightZone = right));
  }

  onPress(edgeLeft, () => { if (edgeLeftZone) centreOn(edgeLeftZone); });
  onPress(edgeRight, () => { if (edgeRightZone) centreOn(edgeRightZone); });

  // ---------- Swipe / drag / tap ----------
  // Pointer events cover touch, pen and the mouse alike. A gesture is a
  // tap only while it stays within TAP_SLOP px of where it started; past
  // that it is a pan and can no longer select or open anything.
  const TAP_SLOP = 10;
  const INERTIA_TAU = 325; // ms; how far a flick carries (≈ v × τ)
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let startTx = 0;
  let isPan = false;
  let samples = []; // recent {t, x} for the release velocity

  stage.addEventListener('pointerdown', (event) => {
    if (pointerId !== null) return; // one finger at a time
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    isPan = false;
    stopGlide(); // a finger on a gliding Campus catches it
    startTx = tx;
    samples = [{ t: event.timeStamp, x: event.clientX }];
    try {
      stage.setPointerCapture(pointerId);
    } catch (e) {
      // Synthetic pointer ids can't be captured; tracking still works.
    }
  });

  stage.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (!isPan && (Math.abs(dx) > TAP_SLOP || Math.abs(dy) > TAP_SLOP)) {
      isPan = true;
      startX = event.clientX; // no jump when the pan takes over
      startTx = tx;
    }
    if (!isPan || !panEnabled) return;
    tx = clampTx(startTx + (event.clientX - startX));
    samples.push({ t: event.timeStamp, x: event.clientX });
    while (samples.length > 2 && event.timeStamp - samples[0].t > 100) samples.shift();
    requestRender();
  });

  function endGesture(event, cancelled) {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    if (isPan) {
      if (!panEnabled || cancelled) return;
      // Release velocity over the last ~100 ms; a finger that stopped
      // before lifting carries no inertia.
      const last = samples[samples.length - 1];
      const first = samples[0];
      const dt = last.t - first.t;
      const idle = event.timeStamp - last.t;
      const v = dt > 0 && idle < 80 ? (last.x - first.x) / dt : 0; // px/ms
      if (Math.abs(v) > 0.05 && !reduceMotionQuery.matches) glideTo(tx + v * INERTIA_TAU, INERTIA_TAU);
      return;
    }
    if (cancelled) return;
    onTap(event.clientX, event.clientY);
  }

  stage.addEventListener('pointerup', (event) => endGesture(event, false));
  stage.addEventListener('pointercancel', (event) => endGesture(event, true));

  // Taps are handled on pointerup above. The browser's own compatibility
  // click for a touch comes a moment later, hit-tested at the same spot —
  // by then a just-opened modal's backdrop is there, and that click would
  // close it again at once. Cancelling touchend suppresses that click.
  stage.addEventListener('touchend', (event) => {
    if (event.cancelable) event.preventDefault();
  }, { passive: false });

  function onTap(x, y) {
    if (!campus.classList.contains('is-ready')) return;
    // A zone focused by the modal's close (focus goes back to it) would
    // keep its keyboard ring next to the newly tapped one — a tap is a
    // pointer interaction, so drop that leftover focus.
    const focused = document.activeElement;
    if (focused && focused.closest && focused.closest('.zone')) focused.blur();
    const hit = document.elementFromPoint(x, y);
    const zone = hit && hit.closest ? hit.closest('.zone') : null;
    if (!zone) {
      select(null); // tap on empty ground clears the selection
      return;
    }
    if (zone === selectedZone) {
      activateZone(zone); // second tap = desktop click
      return;
    }
    select(zone);
    bringIntoView(zone);
  }

  // ---------- Keyboard ----------
  // Zones are focusable once the Campus is live: focus selects (and
  // brings into view), Enter/Space opens.
  for (const zone of zones) {
    zone.addEventListener('focus', () => {
      select(zone);
      bringIntoView(zone);
    });
    zone.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
      event.preventDefault();
      activateZone(zone);
    });
  }

  function syncTabbable() {
    const ready = campus.classList.contains('is-ready');
    zones.forEach((zone) => zone.setAttribute('tabindex', ready ? '0' : '-1'));
  }
  syncTabbable();
  new MutationObserver(syncTabbable).observe(campus, { attributes: true, attributeFilter: ['class'] });

  // ---------- Resize / rotation ----------
  // Keep the point at the screen's centre where it was (during the
  // opening: the fixed opening framing for the new size).
  let lastVw = stage.clientWidth;
  window.addEventListener('resize', () => {
    const centreUnits = (lastVw / 2 - tx) / scale(); // with the old size
    lastVw = stage.clientWidth;
    frame = glonariCampusFrame(stage.clientWidth, stage.clientHeight);
    campus.style.width = `${frame.w}px`;
    campus.style.height = `${frame.h}px`;
    stopGlide();
    tx = panEnabled ? clampTx(lastVw / 2 - centreUnits * scale()) : frame.openingTx;
    render();
  });

  render();

  // ---------- Start ----------
  // Last, so every handler above exists if a fallback hands off at once.
  if (root.classList.contains('opening-pending')) {
    playOpening();
  } else {
    // Returning to the Campus, or the opening was already seen: straight
    // into the loop (index.html already removed the opening element).
    openingStarted = true;
    startLoop();
  }
})();
