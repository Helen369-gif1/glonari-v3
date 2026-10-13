/* Gia site — behavior for shared components. Load after js/site.js on pages that use them.
   Everything is driven by data attributes, so pages need no extra code.

   Approval sheet  [data-approval]
     Checkboxes .approval__check mark terms as reviewed. "Authorize Gia" [data-approval-authorize]
     refuses while a term is unreviewed and names it; otherwise it opens an explicit confirmation
     (.approval__confirm with [data-approval-confirm] / [data-approval-back]). "Not for me"
     [data-approval-decline] is a normal outcome, not an error. [data-approval-reset] starts over.
     Optional: data-log="#id" adds entries to an activity history (.log) on the page;
     data-subject="..." names the thing being authorized in messages and log entries.

   Ambient motion  [data-motion]
     Adds .is-playing while the element is in view, so CSS animations inside it run only then.
     Never added under reduced motion; CSS shows the complete still state instead.

   Play-once video  video[data-play-once]   (hero videos on every page)
     Plays once each time it comes into view: after a short pause (data-delay, ms, default 800)
     it starts from the first frame and stops on the last frame. No loop. When it leaves the
     screen it rewinds, so it can play again the next time it comes into view.
     Under reduced motion it never plays; data-still (an image of the last frame) replaces the
     poster so the complete composition is shown.

   Pulse diagram  [data-pulse="<name>"]   (hub on Introducing GLO, ecosystem on How GLO Works)
     One absolutely positioned SVG draws the wiring between the cards and Gia (.gia-core), measured from
     getBoundingClientRect and redrawn by a ResizeObserver. A diagram definition, registered with
     GiaPulse.define(name, def), gives the routes and the scenario of one cycle: pulses run along the
     wires, a status on each card spins while its pulse travels and turns into a check when it arrives.
     When the diagram comes into view the cycle plays 3 times, then it stops on its final state
     (.is-final: every check shown, wiring brighter). Hovering it with a mouse plays one more cycle.
     It pauses when it leaves the screen or the tab is hidden and resumes when back; after the final
     state, leaving the screen completely re-arms it for the next visit.
     A def's routes read CSS --pulse-layout: vertical (set by the component at its own breakpoint).
     Under reduced motion it never animates and shows the final state.

   Quiet effects (design system 10.1). One shared IntersectionObserver helper (watch). Stagger, draw
   (with card art) and shine replay on every visit, like the play-once video (replay): they play when the
   block comes into view, and only after it has left the screen completely do they quietly return to the
   start state, ready for the next visit; while any part is visible they never restart. Parallax answers
   the mouse only. Hiding start states exist only once the script has added its
   class, and CSS drops them under reduced motion, so without JS or with reduced motion everything
   shows its final state. A change of the reduced-motion setting applies without a reload.
     [data-parallax]   on .media-frame__box or .final__media (never a page hero or .gia-core): hover with a mouse
                       ((hover: hover) and (pointer: fine)) adds .is-hover: the frame grows to 1.02 with a brighter
                       border, the img / video inside grows to 1.08 and follows the pointer in the opposite
                       direction, at most 12px per axis, smoothed in requestAnimationFrame (in 400ms, back 600ms).
                       At rest the media is its normal size. Nothing on touch devices or under reduced motion.
     [data-stagger]    on a grid: its children appear 120ms apart (.stagger-on, then .is-in).
                       Not on the same element as .reveal.
     [data-spotlight]  on a card: a soft gold glow follows a mouse pointer (.spot-on, --spot-x/--spot-y).
     [data-draw]       on a container: adds .is-drawn on each visit. SVG shapes inside (path, line, polyline, polygon,
                       circle, ellipse, rect) draw through stroke-dashoffset (skip one with .no-draw);
                       .draw-x elements grow from the left (scaleX). On .flow, .steps-line, .path__steps and
                       .gc-timeline the
                       connectors open one after another (--draw-i per item; the arrowhead of a .flow follows its
                       line; a .flow-return right after a .flow opens after the last arrow, in CSS only). Every part
                       gets --draw-k, its index inside its own svg: a .flow node icon (.flow__icon) starts with the
                       arrow leaving its node, parts .1s apart (CSS).
     .card__art        an SVG in card art draws itself the same way, without an attribute: each time the
                       card comes into view, parts 0.1s apart; in a [data-stagger] grid, after its card appears.
     svg.draw-icon     a small line icon in a card (not in .card__art); draws itself like card art. Size and look
                       stay the icon's own.
     [data-shine]      on a .principle: one pass of light per visit (.is-shining), then the solid color. */
(() => {
  const { reduce } = window.GiaSite || { reduce: window.matchMedia('(prefers-reduced-motion: reduce)').matches };

  /* ---------- Approval sheet ---------- */
  document.querySelectorAll('[data-approval]').forEach((sheet) => {
    const items = [...sheet.querySelectorAll('.approval__item')];
    const actions = sheet.querySelector('.approval__actions');
    const confirmBox = sheet.querySelector('.approval__confirm');
    const msg = sheet.querySelector('.approval__msg');
    const log = sheet.dataset.log ? document.querySelector(sheet.dataset.log) : null;
    const subject = sheet.dataset.subject || 'this project';
    const resetBtn = sheet.querySelector('[data-approval-reset]');

    const say = (text, tone) => { if (!msg) return; msg.textContent = text; msg.className = 'approval__msg' + (tone ? ' is-' + tone : ''); };
    const addLog = (text, status, cls) => {
      if (!log) return;
      const li = document.createElement('li');
      li.className = 'is-new';
      li.innerHTML = `${text}<small>Just now</small><span class="status ${cls}">${status}</span>`;
      log.prepend(li);
    };
    const syncItem = (it) => {
      const box = it.querySelector('.approval__check');
      const st = it.querySelector('[data-state]');
      it.classList.toggle('is-open', !box.checked);
      if (st) {
        st.textContent = box.checked ? 'Reviewed' : 'Not reviewed';
        st.className = 'status ' + (box.checked ? 'status--ready' : 'status--review');
      }
    };
    const setStage = (stage) => {
      if (actions) actions.hidden = stage !== 'review';
      if (confirmBox) confirmBox.hidden = stage !== 'confirm';
      if (resetBtn) resetBtn.hidden = stage !== 'done';
      sheet.classList.toggle('is-done', stage === 'done');
      items.forEach(it => { it.querySelector('.approval__check').disabled = stage === 'done'; });
    };

    items.forEach((it) => {
      syncItem(it);
      it.querySelector('.approval__check').addEventListener('change', () => { syncItem(it); say(''); });
    });

    sheet.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b || !sheet.contains(b)) return;
      if (b.hasAttribute('data-approval-authorize')) {
        const open = items.filter(it => !it.querySelector('.approval__check').checked);
        if (open.length) {
          const name = open[0].querySelector('.approval__label').textContent.trim();
          say(`Review every term first. Still open: ${name}${open.length > 1 ? ` and ${open.length - 1} more` : ''}.`, 'warn');
          open[0].querySelector('.approval__check').focus();
          return;
        }
        say('');
        setStage('confirm');
        const c = confirmBox && confirmBox.querySelector('[data-approval-confirm]');
        if (c) c.focus();
      } else if (b.hasAttribute('data-approval-back')) {
        setStage('review');
        const a = sheet.querySelector('[data-approval-authorize]'); if (a) a.focus();
      } else if (b.hasAttribute('data-approval-confirm')) {
        setStage('done');
        say(`Authorized. Gia starts ${subject} and brings questions and milestones back to you.`, 'ok');
        addLog(`Authorized Gia for ${subject}`, 'Authorized', 'status--ready');
        if (resetBtn) resetBtn.focus();
      } else if (b.hasAttribute('data-approval-decline')) {
        setStage('done');
        say(`Declined. Nothing starts, and Gia keeps looking for projects that fit.`);
        addLog(`Declined ${subject}`, 'Declined', 'status--muted');
        if (resetBtn) resetBtn.focus();
      } else if (b.hasAttribute('data-approval-reset')) {
        items.forEach(it => { it.querySelector('.approval__check').checked = false; syncItem(it); });
        say('');
        setStage('review');
        items[0] && items[0].querySelector('.approval__check').focus();
      }
    });
    setStage('review');
  });

  /* ---------- Ambient motion ---------- */
  document.querySelectorAll('[data-motion]').forEach((el) => {
    if (reduce) return;
    new IntersectionObserver((entries) => {
      entries.forEach((en) => el.classList.toggle('is-playing', en.isIntersecting));
    }, { threshold: 0.2 }).observe(el);
  });

  /* ---------- Play-once video ---------- */
  document.querySelectorAll('video[data-play-once]').forEach((v) => {
    v.muted = true; v.loop = false; v.playsInline = true;
    v.removeAttribute('autoplay');
    if (reduce) {
      v.pause();
      if (v.dataset.still) v.poster = v.dataset.still;
      v.preload = 'none';
      return;
    }
    const delay = Number(v.dataset.delay || 800);
    let timer = null;
    let played = false;   // already played during this visit to the screen
    const start = () => {
      timer = null;
      if (played || document.hidden) return;
      played = true;
      try { v.currentTime = 0; } catch (e) {}
      const p = v.play(); if (p) p.catch(() => { played = false; });
    };
    new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          if (!played && !timer) timer = setTimeout(start, delay);
        } else {
          if (timer) { clearTimeout(timer); timer = null; }
          v.pause();
          played = false;
          try { v.currentTime = 0; } catch (e) {}
        }
      });
    }, { threshold: 0.5 }).observe(v);
  });

  /* ---------- Quiet effects ---------- */
  const motionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onChange = (mq, fn) => { if (mq.addEventListener) mq.addEventListener('change', fn); else mq.addListener(fn); };

  // Shared IntersectionObserver helper: one observer per (margin, threshold).
  // once: the callback runs the first time the element is in view, then it is dropped.
  const pool = new Map();
  const watch = (el, cb, { margin = '0px 0px -10% 0px', threshold = 0, once = true } = {}) => {
    const key = margin + '|' + threshold;
    let o = pool.get(key);
    if (!o) {
      const subs = new Map();
      const io = new IntersectionObserver((entries) => entries.forEach((en) => {
        const list = subs.get(en.target); if (!list) return;
        list.forEach((s) => {
          if (s.once && !en.isIntersecting) return;
          s.cb(en);
          if (s.once) list.delete(s);
        });
        if (!list.size) { subs.delete(en.target); io.unobserve(en.target); }
      }), { rootMargin: margin, threshold });
      o = { io, subs }; pool.set(key, o);
    }
    if (!o.subs.has(el)) { o.subs.set(el, new Set()); o.io.observe(el); }
    o.subs.get(el).add({ cb, once });
  };
  // Replays on every visit, like the play-once video: play() when the element comes into view;
  // reset() quietly once it has left the screen completely (not a pixel visible), which re-arms it.
  // While any part of it stays visible it does not play again, so nothing flickers at the edge.
  const replay = (el, play, reset, margin = '0px 0px -10% 0px') => {
    let played = false;
    watch(el, (en) => { if (en.isIntersecting && !played) { played = true; play(); } }, { margin, once: false });
    watch(el, (en) => { if (!en.isIntersecting && played) { played = false; reset(); } }, { margin: '0px', once: false });
  };

  // Parallax on hover: CSS scales the frame (1.02) and the media (1.08) on .is-hover; the script moves the
  // media against the pointer through the `translate` property, smoothed in requestAnimationFrame.
  const PARALLAX_SHIFT = 12, PARALLAX_MEDIA_SCALE = 1.08;
  const PARALLAX_FOLLOW = 120, PARALLAX_RETURN = 150;   // ms time constants: follow the pointer, settle back (~600ms)
  const fineMQ = window.matchMedia('(hover: hover) and (pointer: fine)');
  const parallaxOk = () => fineMQ.matches && !motionMQ.matches;
  document.querySelectorAll('[data-parallax]').forEach((el) => {
    if (!el.matches('.media-frame__box, .final__media') || el.closest('.page-hero, .gia-core, .card__art')) return;
    const media = el.querySelector('img, video');
    if (!media) return;
    el.classList.add('parallax-on');
    media.classList.add('parallax-media');
    let raf = 0, last = 0, x = 0, y = 0, tx = 0, ty = 0, over = false;
    const step = (now) => {
      const dt = Math.min(64, now - (last || now)); last = now;
      const k = 1 - Math.exp(-dt / (over ? PARALLAX_FOLLOW : PARALLAX_RETURN));
      x += (tx - x) * k; y += (ty - y) * k;
      const done = !over && Math.abs(x) < 0.05 && Math.abs(y) < 0.05;
      if (done) { x = y = 0; media.style.translate = ''; raf = 0; last = 0; return; }
      media.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
      raf = requestAnimationFrame(step);
    };
    const run = () => { if (!raf) raf = requestAnimationFrame(step); };
    const aim = (e) => {
      const r = el.getBoundingClientRect();
      // The 1.08 scale leaves 4% of the frame on each side; never shift further, so no edge shows.
      const mx = Math.min(PARALLAX_SHIFT, r.width * (PARALLAX_MEDIA_SCALE - 1) / 2 - 1);
      const my = Math.min(PARALLAX_SHIFT, r.height * (PARALLAX_MEDIA_SCALE - 1) / 2 - 1);
      const nx = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1));
      const ny = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1));
      tx = -nx * mx; ty = -ny * my;   // against the pointer
    };
    const leave = () => { over = false; tx = ty = 0; el.classList.remove('is-hover'); run(); };
    el.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || !parallaxOk()) return;
      over = true; el.classList.add('is-hover'); aim(e); run();
    });
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      if (!parallaxOk()) { if (over) leave(); return; }
      if (!over) { over = true; el.classList.add('is-hover'); }
      aim(e); run();
    });
    el.addEventListener('pointerleave', leave);
    onChange(motionMQ, () => { if (motionMQ.matches) { leave(); cancelAnimationFrame(raf); raf = 0; last = 0; x = y = 0; media.style.translate = ''; } });
  });

  // Staggered entry
  document.querySelectorAll('[data-stagger]').forEach((grid) => {
    const kids = [...grid.children];
    if (!kids.length) return;
    kids.forEach((k, i) => k.style.setProperty('--stagger-i', i));
    grid.classList.add('stagger-on');
    let timer = 0;
    replay(grid, () => {
      grid.classList.add('is-in');
      grid.giaStaggerAt = performance.now();
      grid.dispatchEvent(new CustomEvent('gia:stagger-in'));
      // After the last child arrives, drop the classes so later hover transitions have no delay.
      timer = setTimeout(() => grid.classList.remove('stagger-on', 'is-in'), (kids.length - 1) * 120 + 800);
    }, () => {
      // Back to the start state; transitions live only on .is-in, so this is instant.
      clearTimeout(timer);
      grid.giaStaggerAt = 0;
      grid.classList.remove('is-in');
      grid.classList.add('stagger-on');
    });
  });

  // Spotlight
  document.querySelectorAll('[data-spotlight]').forEach((card) => {
    card.classList.add('spot-on');
    let raf = 0, cx = 0, cy = 0;
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || motionMQ.matches) return;
      cx = e.clientX; cy = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0;
        const r = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', (cx - r.left).toFixed(0) + 'px');
        card.style.setProperty('--spot-y', (cy - r.top).toFixed(0) + 'px');
      });
    });
  });

  // Line drawing
  const DRAW_SHAPES = 'svg path, svg line, svg polyline, svg polygon, svg circle, svg ellipse, svg rect';
  // --draw-k numbers the parts inside their own svg, so CSS can stagger the parts of each icon (.flow node icons).
  const drawPrep = (box, step) => {
    const parts = new Map();
    [...box.querySelectorAll(DRAW_SHAPES)].filter((p) => !p.closest('.no-draw')).forEach((p, i) => {
      const k = parts.get(p.ownerSVGElement) || 0;
      parts.set(p.ownerSVGElement, k + 1);
      p.setAttribute('pathLength', '1');
      p.classList.add('draw-path');
      p.style.setProperty('--draw-k', k);
      if (step) p.style.setProperty('--draw-delay', (i * step).toFixed(2) + 's');
    });
    box.classList.add('draw-on');
  };
  document.querySelectorAll('[data-draw]').forEach((box) => {
    drawPrep(box);
    // .flow, .steps-line, .path__steps and .gc-timeline draw their connectors (pseudo-elements) one after another, by item order.
    if (box.matches('.flow, .steps-line, .path__steps, .gc-timeline')) [...box.children].forEach((li, i) => li.style.setProperty('--draw-i', i));
    // Removing .is-drawn is instant: the transitions live only on .is-drawn.
    replay(box, () => box.classList.add('is-drawn'), () => box.classList.remove('is-drawn'));
  });

  // Card art and draw icons (svg.draw-icon) draw themselves when their card comes into view, parts 0.1s apart.
  // In a [data-stagger] grid they start once their own card has appeared.
  const STAGGER_STEP = 120, ART_AFTER_CARD = 300;
  document.querySelectorAll('.card__art, svg.draw-icon').forEach((art) => {
    if (!(art.matches('svg') || art.querySelector('svg')) || art.closest('[data-draw]')) return;
    drawPrep(art, 0.1);
    const grid = art.closest('[data-stagger]');
    const kid = grid && [...grid.children].find((k) => k.contains(art));
    let timer = 0;
    const draw = () => art.classList.add('is-drawn');
    const wait = () => { timer = setTimeout(draw, Math.max(0, grid.giaStaggerAt + [...grid.children].indexOf(kid) * STAGGER_STEP + ART_AFTER_CARD - performance.now())); };
    replay(art, () => {
      if (!kid || motionMQ.matches) draw();
      else if (grid.giaStaggerAt) wait();
      else if (grid.classList.contains('stagger-on')) grid.addEventListener('gia:stagger-in', wait, { once: true });
      else draw();
    }, () => {
      clearTimeout(timer);
      if (grid) grid.removeEventListener('gia:stagger-in', wait);
      art.classList.remove('is-drawn');
    });
  });

  // Shine
  document.querySelectorAll('[data-shine]').forEach((el) => {
    let timer = 0;
    const end = () => { clearTimeout(timer); el.classList.remove('is-shining'); };
    replay(el, () => {
      if (motionMQ.matches) return;
      el.classList.add('is-shining');
      el.addEventListener('animationend', end, { once: true });
      timer = setTimeout(end, 2400);   // in case the animation never runs
    }, () => { el.removeEventListener('animationend', end); end(); }, '0px 0px -15% 0px');
  });

  /* ---------- Pulse diagram ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const svg = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  };
  const STATUS_HTML =
    '<span class="pulse-status__spin"><svg viewBox="0 0 16 16"><circle class="pulse-status__track" cx="8" cy="8" r="6.5"/><path class="pulse-status__arc" d="M8 1.5a6.5 6.5 0 0 1 6.5 6.5"/></svg></span>' +
    '<span class="pulse-status__check"><svg viewBox="0 0 16 16"><circle class="pulse-status__disc" cx="8" cy="8" r="8"/><path class="pulse-status__tick" pathLength="1" d="M4.7 8.3l2.2 2.2 4.4-4.6"/></svg></span>';
  const CYCLES = 3;
  const COMET = [[64, 0.22, 1], [30, 0.5, 1.25], [10, 1, 1.75]];   // comet layers, tail to head: [length px, opacity, width]
  const EASE = 'cubic-bezier(.22, .61, .36, 1)';

  // Orthogonal route with rounded corners: path data plus the cleaned corner points.
  const route = (raw, radius = 12) => {
    const p = [];
    raw.forEach((q) => { const l = p[p.length - 1]; if (!l || Math.hypot(q[0] - l[0], q[1] - l[1]) > 0.5) p.push(q); });
    for (let i = p.length - 2; i > 0; i--) {
      const a = p[i - 1], b = p[i], c = p[i + 1];
      if (Math.abs((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])) < 0.5) p.splice(i, 1);
    }
    const f = (q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1);
    let d = 'M' + f(p[0]);
    for (let i = 1; i < p.length - 1; i++) {
      const a = p[i - 1], b = p[i], c = p[i + 1];
      const l1 = Math.hypot(b[0] - a[0], b[1] - a[1]), l2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
      const k = Math.min(radius, l1 / 2, l2 / 2);
      d += ' L' + f([b[0] + (a[0] - b[0]) * k / l1, b[1] + (a[1] - b[1]) * k / l1]) +
           ' Q' + f(b) + ' ' + f([b[0] + (c[0] - b[0]) * k / l2, b[1] + (c[1] - b[1]) * k / l2]);
    }
    return { d: d + ' L' + f(p[p.length - 1]), pts: p };
  };
  const segLen = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  // Distance along a polyline to a point on it.
  const along = (pts, q) => {
    let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], len = segLen(a, b);
      if (Math.abs(segLen(a, q) + segLen(q, b) - len) < 1) return acc + segLen(a, q);
      acc += len;
    }
    return acc;
  };

  class PulseDiagram {
    constructor(root, def) {
      this.root = root; this.def = def;
      this.anims = []; this.clock = null; this.left = 0;
      this.state = 'idle';          // idle | running | final
      this.paused = false; this.inView = false; this.armed = true;
      const core = root.querySelector('.gia-core');
      if (core) {
        this.glow = document.createElement('span');
        this.glow.className = 'gia-core__glow'; this.glow.setAttribute('aria-hidden', 'true');
        core.querySelector('.gia-core__photo').after(this.glow);
      }
      this.nodes = def.nodes(root);
      this.nodes.forEach((n) => {
        const s = document.createElement('span');
        s.className = 'pulse-status'; s.setAttribute('aria-hidden', 'true'); s.innerHTML = STATUS_HTML;
        n.appendChild(s);
      });
      (def.highlights ? def.highlights(root) : []).forEach((el) => {
        const s = document.createElement('span'); s.className = 'pulse-hl'; s.setAttribute('aria-hidden', 'true'); el.appendChild(s);
      });
      this.wires = svg('svg', { class: 'pulse-wires', 'aria-hidden': 'true', focusable: 'false' });
      root.prepend(this.wires);
      this.build();

      let raf = 0;
      const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => this.relayout()); });
      [root, core, ...this.nodes].forEach((el) => el && ro.observe(el));

      if (reduce) { this.state = 'final'; root.classList.add('is-final'); return; }
      new IntersectionObserver(([en]) => {
        if (en.intersectionRatio >= 0.35) this.inView = true;
        else if (!en.isIntersecting) { this.inView = false; if (this.state === 'final') this.armed = true; }
        this.sync();
      }, { threshold: [0, 0.35] }).observe(root);
      document.addEventListener('visibilitychange', () => this.sync());
      root.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse' && this.state === 'final' && this.inView && !document.hidden) this.play(1);
      });
    }

    rect(el) {
      const R = this.root.getBoundingClientRect(), r = el.getBoundingClientRect();
      const l = r.left - R.left, t = r.top - R.top;
      return { l, t, r: l + r.width, b: t + r.height, cx: l + r.width / 2, cy: t + r.height / 2 };
    }

    build() {
      const vertical = getComputedStyle(this.root).getPropertyValue('--pulse-layout').trim() === 'vertical';
      const specs = this.def.routes({ root: this.root, rect: (el) => this.rect(el), vertical });
      this.wires.setAttribute('viewBox', `0 0 ${this.root.offsetWidth} ${this.root.offsetHeight}`);
      this.wires.textContent = '';
      const lines = svg('g', { class: 'pulse-lines' }, this.wires);
      const comets = svg('g', { class: 'pulse-comets' }, this.wires);
      const dotLayer = svg('g', {}, this.wires);
      const dotAt = new Map();
      this.paths = {};
      specs.forEach((s) => {
        const { d, pts } = route(s.pts);
        const base = svg('path', { d, class: 'pulse-line' + (s.muted ? ' pulse-line--muted' : '') }, lines);
        if (s.arrow) {
          const a = pts[pts.length - 2], b = pts[pts.length - 1], n = segLen(a, b) || 1;
          const ux = (b[0] - a[0]) / n, uy = (b[1] - a[1]) / n, bx = b[0] - ux * 7, by = b[1] - uy * 7;
          svg('path', { class: 'pulse-arrow', d: `M${b[0]} ${b[1]} L${bx - uy * 4.5} ${by + ux * 4.5} L${bx + uy * 4.5} ${by - ux * 4.5} Z` }, lines);
        }
        if (s.muted) return;
        const len = base.getTotalLength();
        let poly = 0; for (let i = 1; i < pts.length; i++) poly += segLen(pts[i - 1], pts[i]);
        const cmax = Math.min(COMET[0][0], len * 0.9);
        const layers = COMET.map(([c, o, w]) => {
          const cl = Math.min(c, cmax);
          const el = svg('path', { d, class: 'pulse-comet', 'stroke-width': w, 'stroke-opacity': o, 'stroke-dasharray': `${cl} ${len + cmax + cl + 10}` }, comets);
          return { el, len: cl };
        });
        const dots = [...(s.dots || []), pts[pts.length - 1]].map((q) => {
          const key = Math.round(q[0]) + ',' + Math.round(q[1]);
          if (!dotAt.has(key)) dotAt.set(key, svg('circle', { class: 'pulse-dot', cx: q[0], cy: q[1], r: 2.5 }, dotLayer));
          return { el: dotAt.get(key), dist: along(pts, q) * len / (poly || 1) };
        });
        this.paths[s.key] = { node: s.node, len, cmax, layers, dots };
      });
    }

    relayout() {
      this.build();
      if (this.state === 'running') this.cycle();   // restart the current cycle on the new geometry
    }

    sync() {
      const active = this.inView && !document.hidden;
      if (this.state === 'running') { if (active) this.resume(); else this.pause(); }
      else if (active && this.armed) { this.armed = false; this.play(CYCLES); }
    }

    play(cycles) {
      const fromFinal = this.state === 'final';
      this.left = cycles; this.state = 'running'; this.paused = false;
      this.root.classList.remove('is-final');
      this.cycle(fromFinal ? 450 : 0, fromFinal);
    }

    cycle(lead = 0, fromFinal = false) {
      this.stop();
      const A = (el, keyframes, at, duration, opts) => {
        const a = el.animate(keyframes, Object.assign({ delay: lead + at, duration, fill: 'forwards', easing: EASE }, opts));
        this.anims.push(a);
        return a;
      };
      const checks = this.nodes.map((n) => n.querySelector('.pulse-status__check'));
      if (fromFinal) checks.forEach((c) => A(c, [{ opacity: 1 }, { opacity: 0 }], -lead, 400));
      const tl = {
        // A pulse along a route; returns the time its head arrives at the end.
        pulse: (key, at, dur = 1000) => {
          const p = this.paths[key];
          if (!p) return at;
          const span = p.len + p.cmax;
          p.layers.forEach((c) => A(c.el, [{ strokeDashoffset: c.len, opacity: 1 }, { strokeDashoffset: c.len - span, opacity: 1 }], at, dur, { easing: 'linear', fill: 'none' }));
          p.dots.forEach(({ el, dist }) => A(el,
            [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1.3)', offset: 0.3 }, { opacity: 0, transform: 'scale(.6)' }],
            at + dur * dist / span - 80, 650, { fill: 'none' }));
          return at + dur * p.len / span;
        },
        // Card status: spinner from `at`, check from `done`.
        status: (node, at, done) => {
          const spin = node.querySelector('.pulse-status__spin'), check = node.querySelector('.pulse-status__check');
          A(spin, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], at, 220);
          A(spin.firstElementChild, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], at, 800, { iterations: Infinity, easing: 'linear', fill: 'none' });
          A(spin, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.6)' }], done, 200);
          A(check, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], done, 320);
          A(check.querySelector('.pulse-status__tick'), [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], done + 120, 360);
        },
        run: (key, at, dur) => {
          const done = tl.pulse(key, at, dur);
          if (this.paths[key]) tl.status(this.paths[key].node, at, done);
          return done;
        },
        flash: (at) => { if (this.glow) A(this.glow, [{ opacity: 0 }, { opacity: 1, offset: 0.35 }, { opacity: 0 }], at, 800, { fill: 'none', easing: 'ease-in-out' }); },
        highlight: (el, at) => { const h = el.querySelector('.pulse-hl'); if (h) A(h, [{ opacity: 0 }, { opacity: 1, offset: 0.4 }, { opacity: 0 }], at, 700, { fill: 'none' }); },
      };
      const settle = this.def.scenario(tl, this.root);
      let total = settle + 200;
      if (this.left > 1) {
        const fadeAt = settle + (this.def.pause || 1500);
        checks.forEach((c) => A(c, [{ opacity: 1 }, { opacity: 0 }], fadeAt, 700));
        total = Math.max(this.def.cycle || 0, fadeAt + 900);
      }
      this.clock = new Animation(new KeyframeEffect(null, null, { duration: lead + total }), document.timeline);
      this.clock.onfinish = () => this.next();
      this.clock.play();
      if (this.paused) { this.paused = false; this.pause(); }
    }

    next() {
      this.left -= 1;
      if (this.left > 0) { this.cycle(); return; }
      this.state = 'final';
      this.root.classList.add('is-final');
      this.stop();
    }

    stop() {
      this.anims.forEach((a) => a.cancel());
      this.anims = [];
      if (this.clock) { this.clock.onfinish = null; this.clock.cancel(); this.clock = null; }
    }

    pause() {
      if (this.paused) return;
      this.paused = true;
      this.anims.forEach((a) => { if (a.playState === 'running') a.pause(); });
      if (this.clock) this.clock.pause();
    }

    resume() {
      if (!this.paused) return;
      this.paused = false;
      this.anims.forEach((a) => { if (a.playState === 'paused') a.play(); });
      if (this.clock) this.clock.play();
    }
  }

  window.GiaPulse = {
    define(name, def) {
      document.querySelectorAll(`[data-pulse="${name}"]`).forEach((el) => {
        if (!el.giaPulse) el.giaPulse = new PulseDiagram(el, def);
      });
    },
  };

  /* Hub: Gia decides what each task needs, so pulses run out from Gia to the resources, in pairs.
     Wide: a bus on each side between Gia and the cards. Vertical (960px and below): side rails. */
  window.GiaPulse.define('hub', {
    cycle: 8000, pause: 2200,
    nodes: (root) => [...root.querySelectorAll('.hub__node')],
    routes({ root, rect, vertical }) {
      const core = rect(root.querySelector('.gia-core__photo'));
      const plate = rect(root.querySelector('.gia-core__plate'));
      const out = [];
      ['left', 'right'].forEach((side) => {
        const list = root.querySelector('.hub__side--' + side), box = rect(list);
        [...list.children].forEach((node, i) => {
          const r = rect(node), key = side[0] + i;
          if (!vertical) {
            const west = side === 'left', x0 = west ? core.l : core.r, x1 = west ? r.r : r.l, bus = (x0 + x1) / 2;
            const y = Math.abs(r.cy - core.cy) < 2 ? core.cy : r.cy;
            out.push({ key, node, pts: [[x0, core.cy], [bus, core.cy], [bus, y], [x1, y]], dots: y === core.cy ? [] : [[bus, core.cy]] });
          } else {
            const up = side === 'left', rail = up ? box.l - 14 : box.r + 14;
            const y0 = up ? core.t : plate.b, yb = up ? (box.b + core.t) / 2 : (plate.b + box.t) / 2;
            out.push({ key, node, pts: [[core.cx, y0], [core.cx, yb], [rail, yb], [rail, r.cy], [up ? r.l : r.r, r.cy]], dots: [[rail, r.cy]] });
          }
        });
      });
      return out;
    },
    scenario(tl) {
      tl.flash(0);
      let done = 0;
      [0, 1, 2].forEach((i) => ['l', 'r'].forEach((s) => { done = Math.max(done, tl.run(s + i, 500 + i * 500, 1100)); }));
      return done + 400;
    },
  });
})();
