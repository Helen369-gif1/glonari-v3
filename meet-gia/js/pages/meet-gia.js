/* Meet Gia (index.html) — page script. Needs js/site.js and js/pages/meet-gia-frames.js loaded first.
   Hero scroll video, section 03 video, In action states, Memory, permission, work approval, waitlist. */
(() => {
  const { reduce, clamp, lerp } = window.GiaSite;

  /* ---------- Section 03 video: plays once each time the screen is entered ----------
     Enter (40% visible) -> play from the start, then hold on the last frame.
     Leave completely -> rewind to the first frame, ready to play again on the next visit.
     Reduced motion -> never plays; shows the final frame as a still. */
  const calm = document.querySelector('.breather__video');
  if (calm) {
    if (typeof WITH_YOU_VIDEO !== 'undefined') {
      const bin = atob(WITH_YOU_VIDEO), buf = new Uint8Array(bin.length);
      for (let k = 0; k < bin.length; k++) buf[k] = bin.charCodeAt(k);
      calm.src = URL.createObjectURL(new Blob([buf], { type: 'video/mp4' }));
    }
    calm.muted = true;
    if (reduce) {
      calm.preload = 'none';
      calm.poster = calm.dataset.endPoster;
    } else {
      let armed = true;
      new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting && en.intersectionRatio >= 0.4 && armed) {
            armed = false;
            try { calm.currentTime = 0; } catch (e) {}
            const pr = calm.play(); if (pr) pr.catch(() => { armed = true; });
          } else if (!en.isIntersecting) {
            calm.pause();
            try { calm.currentTime = 0; } catch (e) {}
            armed = true;
          }
        });
      }, { threshold: [0, 0.4] }).observe(calm);
    }
  }

  /* ---------- Hero scroll video (frame sequence on canvas) ---------- */
  const hero = document.querySelector('.hero');
  const canvas = document.querySelector('.hero__canvas');
  const ctx = canvas.getContext('2d');
  const caps = [...document.querySelectorAll('.cap')];
  const hint = document.querySelector('.hero__hint');
  const loadBar = document.querySelector('.hero__loading');
  const N = FRAMES.length;
  const imgs = new Array(N);
  let loaded = 0;
  const VIDEO_END = 0.85;   // video finishes at 85% of the hero scroll; last 15% holds the final frame
  // caption windows: [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd]
  const WINDOWS = [[-1, 0, 0.16, 0.22], [0.22, 0.27, 0.40, 0.46], [0.48, 0.53, 0.68, 0.74], [0.80, 0.86, 9, 10]];

  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
  }
  // Gia's horizontal position in the frame across the video (measured from frames)
  const FOCUS = [[0, 0.45], [0.5, 0.42], [0.75, 0.5], [1, 0.34]];
  function focusAt(t) {
    for (let k = 1; k < FOCUS.length; k++) {
      if (t <= FOCUS[k][0]) { const [t0, v0] = FOCUS[k - 1], [t1, v1] = FOCUS[k]; return lerp(v0, v1, (t - t0) / (t1 - t0)); }
    }
    return FOCUS[FOCUS.length - 1][1];
  }
  // Vertical anchor: Gia's head sits at the top of every frame, so any excess height is cropped mostly from the bottom
  const FOCUS_Y = 0.1;
  function drawImg(img, p, alpha) {
    if (!img || !img.complete || !img.naturalWidth) return false;
    const cw = canvas.width, ch = canvas.height, iw = img.naturalWidth, ih = img.naturalHeight;
    const s = Math.max(cw / iw, ch / ih);
    const dw = iw * s, dh = ih * s;
    const fx = focusAt(clamp(p / VIDEO_END, 0, 1)); // horizontal focus follows Gia on narrow screens
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, -(dw - cw) * fx, -(dh - ch) * FOCUS_Y, dw, dh);
    ctx.globalAlpha = 1;
    return true;
  }
  function nearestLoaded(i) {
    for (let d = 0; d < N; d++) {
      if (imgs[i - d] && imgs[i - d].complete) return imgs[i - d];
      if (imgs[i + d] && imgs[i + d].complete) return imgs[i + d];
    }
    return null;
  }
  function render(p) {
    const i = Math.round(clamp(p / VIDEO_END, 0, 1) * (N - 1));
    ctx.imageSmoothingQuality = 'high';
    const base = imgs[i] && imgs[i].complete ? imgs[i] : nearestLoaded(i);
    drawImg(base, p, 1);
  }
  function captions(p) {
    caps.forEach((c, k) => {
      const [a, b, x, y] = WINDOWS[k];
      let o = p < b ? (p - a) / (b - a) : p > x ? 1 - (p - x) / (y - x) : 1;
      o = clamp(o, 0, 1);
      c.style.opacity = o.toFixed(3);
      c.style.transform = `translateY(${((1 - o) * 16).toFixed(1)}px)`;
      c.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      c.style.pointerEvents = o > 0.6 ? 'auto' : 'none';
    });
    hint.style.opacity = clamp(1 - p / 0.1, 0, 1);
  }
  function heroProgress() {
    const total = hero.offsetHeight - window.innerHeight;
    return total > 0 ? clamp(-hero.getBoundingClientRect().top / total, 0, 1) : 1;
  }

  let target = 0, current = 0, raf = 0;
  function tick() {
    current += (target - current) * 0.18;
    if (Math.abs(target - current) < 0.0005) current = target;
    render(current);
    captions(current);
    raf = current !== target ? requestAnimationFrame(tick) : 0;
  }
  function onScroll() {
    if (reduce) return;
    target = heroProgress();
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function loadFrames() {
    // In reduced motion, only the final frame is needed.
    const order = reduce ? [N - 1] : [0, N - 1, ...Array.from({ length: N }, (_, k) => k).filter(k => k && k !== N - 1)];
    order.forEach((k) => {
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => {
        loaded++;
        loadBar.style.transform = `scaleX(${loaded / order.length})`;
        if (loaded === order.length) loadBar.style.opacity = 0;
        if (reduce) render(1); else if (k === 0 || !raf) render(current);
      };
      im.src = FRAMES[k];
      imgs[k] = im;
    });
  }

  sizeCanvas();
  if (reduce) captions(1);
  loadFrames();
  window.addEventListener('resize', () => { sizeCanvas(); render(reduce ? 1 : current); }, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (!reduce) { current = target = heroProgress(); captions(current); }

  /* ---------- 04 In action: state machine ---------- */
  const phoneBody = document.getElementById('phone-body');
  const phoneState = document.getElementById('phone-state');
  const phoneCount = document.getElementById('phone-count');
  const rows = [...document.querySelectorAll('.arow')];
  const giaHead = '<div class="gia-tag"><span class="gia-dot"></span>Gia</div>';
  const M = {
    user: '<div class="bubble bubble--user">My flight to New York was changed.</div>',
    research: `<div>${giaHead}<div class="activity">
      <div>Searching same-day flights<span class="status status--ready">Done</span></div>
      <div>Comparing fares<span class="status status--ready">Done</span></div>
      <div>Checking connection times<span class="status status--working">Checking</span></div></div></div>`,
    options: `<div>${giaHead}<div class="bubble bubble--gia">I found two alternatives. Option 1 gets you there three hours earlier and costs $40 more. Option 2 keeps the same fare but arrives late.</div></div>
      <div class="opts">
        <div class="opt PICK"><span class="opt__name">Option 1</span><span class="opt__big">6:05 PM</span><span class="opt__meta">Arrives JFK, 1 stop</span><span class="opt__price--up">+$40</span></div>
        <div class="opt"><span class="opt__name">Option 2</span><span class="opt__big">9:10 PM</span><span class="opt__meta">Arrives JFK, nonstop</span><span class="opt__price--same">Same fare</span></div>
      </div>`,
    review: '<div class="btn-row" style="gap:8px"><span class="btn btn--secondary btn--sm">Review options</span></div>',
    approval: `<div class="card-inline">
      <strong>Change to Option 1?</strong>
      <dl><dt>Flight</dt><dd>Departs 1:20 PM, arrives 6:05 PM</dd><dt>Seat</dt><dd>Aisle, as you prefer</dd><dt>Cost</dt><dd>+$40 to card ending 4821</dd></dl>
      <span class="caption">Nothing changes until you confirm.</span>
      <div class="btn-row" style="gap:8px"><span class="btn btn--primary btn--sm">Confirm change</span><span class="btn btn--ghost btn--sm">Keep current flight</span></div></div>`,
    done: `<div class="bubble bubble--user">Confirm.</div>
      <div class="card-inline"><span class="done-mark"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6"/></svg>Flight changed successfully.</span>
      <span class="small">New arrival 6:05 PM. Confirmation sent to your email. Your aisle seat was kept.</span></div>`,
    unsure: `<div>${giaHead}<div class="bubble bubble--gia unsure">I could not verify the connection time for Option 1. Want me to check with the airline?</div></div>
      <div class="btn-row" style="gap:8px"><span class="btn btn--primary btn--sm">Check with the airline</span><span class="btn btn--ghost btn--sm">Choose Option 2</span></div>`
  };
  const STATES = [
    { name: 'Request', parts: ['user'] },
    { name: 'Research', parts: ['user', 'research'] },
    { name: 'Options', parts: ['user', 'options', 'review'] },
    { name: 'Approval', parts: ['user', 'options', 'approval'] },
    { name: 'Completed', parts: ['user', 'options', 'approval', 'done'] },
    { name: 'Uncertainty', parts: ['user', 'options', 'unsure'] }
  ];
  let actState = -1;
  function setAction(n) {
    if (n === actState) return;
    const prev = actState >= 0 ? STATES[actState].parts : [];
    actState = n;
    const parts = STATES[n].parts;
    const pick = n === 3 || n === 4;
    phoneBody.innerHTML = parts.map((p, k) => {
      const html = M[p].replace('PICK', pick ? 'is-picked' : '');
      const isNew = prev[k] !== p;
      return `<div class="${isNew ? 'msg-in' : ''}" style="display:grid;gap:10px">${html}</div>`;
    }).join('');
    phoneBody.scrollTop = phoneBody.scrollHeight;
    phoneState.textContent = STATES[n].name;
    phoneCount.textContent = n < 5 ? `${n + 1} / 5` : 'Alternate';
    rows.forEach((r, k) => r.classList.toggle('is-active', k === n));
  }
  setAction(0);
  const desktop = window.matchMedia('(min-width: 901px)');
  const panelEl = document.querySelector('.action__panel');
  rows.forEach((r, k) => r.querySelector('button').addEventListener('click', () => {
    setAction(k);
    if (!desktop.matches) panelEl.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }));
  const rowObs = new IntersectionObserver((entries) => {
    if (!desktop.matches) return;
    entries.forEach(en => { if (en.isIntersecting) setAction(rows.indexOf(en.target)); });
  }, { rootMargin: '-48% 0px -48% 0px' });
  rows.forEach(r => rowObs.observe(r));

  /* ---------- 05 Memory ---------- */
  const MEM = {
    builder: { you: 'We are looking for a home with a shorter commute, room for a child, and a budget we already discussed.', gia: "Got it. I'll only show homes within the budget you set on Sep 12, under 30 minutes from your office, with at least three bedrooms.",
      items: [['Looking for a shorter commute', 'Added Sep 12'], ['Needs room for a child', 'Added Sep 12'], ['Budget agreed on Sep 12', 'Added Sep 12'], ['Prefers neighborhoods near a park', 'Added Sep 20']] },
    pro: { you: 'Keep my preferred meeting windows and the companies I am researching.', gia: "Saved. I'll suggest times between 9–11 AM and 2–4 PM, and keep both companies in your weekly briefing.",
      items: [['Meetings: 9–11 AM and 2–4 PM', 'Added today'], ['Researching Northwind Logistics', 'Added today'], ['Researching Halden Freight', 'Added today'], ['Briefings as one-page summaries', 'Added Aug 30']] },
    parent: { you: 'Remember school pickup times and that Tuesdays are already full.', gia: "Done. I won't propose anything on Tuesdays, or between 2:45 and 3:45 PM on school days.",
      items: [['School pickup at 3:15 PM, weekdays', 'Added today'], ['Tuesdays are full', 'Added today'], ['Soccer practice Thursdays, 5 PM', 'Added Sep 3'], ['Groceries ordered on Sundays', 'Added Aug 28'], ['Two kids: Mia (8), Leo (5)', 'Added Aug 28']] },
    talk: { you: 'Continue the idea we discussed last week instead of starting over.', gia: 'Picking up where we left off: you wanted to test the neighborhood book club with five people before inviting everyone.',
      items: [['Idea: neighborhood book club', 'Added Sep 24'], ['Start small: five people first', 'Added Sep 24'], ['Prefers questions over answers when brainstorming', 'Added Sep 10']] }
  };
  const memChat = document.getElementById('mem-chat');
  const memList = document.getElementById('mem-list');
  const memCount = document.getElementById('mem-count');
  const memToast = document.getElementById('mem-toast');
  const memEdit = document.getElementById('mem-edit');
  const tabs = [...document.querySelectorAll('.tab')];
  let memKey = 'builder', editing = false;
  const esc = (s) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function drawMem() {
    const d = MEM[memKey];
    memChat.innerHTML = `<div class="bubble bubble--user msg-in">${esc(d.you)}</div><div class="msg-in">${giaHead}<div class="bubble bubble--gia">${esc(d.gia)}</div></div>`;
    memList.innerHTML = d.items.map((it, k) => editing
      ? `<li class="mem__item"><input value="${esc(it[0])}" data-k="${k}" aria-label="Memory item ${k + 1}"><small>${esc(it[1])}</small></li>`
      : `<li class="mem__item"><span>${esc(it[0])}</span><small>${esc(it[1])}</small><button class="forget" type="button" data-k="${k}">Forget this</button></li>`).join('');
    memCount.textContent = `${d.items.length} item${d.items.length === 1 ? '' : 's'}`;
    memEdit.textContent = editing ? 'Done' : 'Edit memory';
  }
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => { x.setAttribute('aria-selected', String(x === t)); x.tabIndex = x === t ? 0 : -1; });
    memKey = t.dataset.mem; editing = false; memToast.textContent = ''; drawMem();
  }));
  document.querySelector('.tabs').addEventListener('keydown', (e) => {
    const i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
    const j = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : -1;
    if (j >= 0) { tabs[j].click(); tabs[j].focus(); }
  });
  memList.addEventListener('click', (e) => {
    const b = e.target.closest('.forget'); if (!b) return;
    const removed = MEM[memKey].items.splice(+b.dataset.k, 1)[0];
    memToast.textContent = `Forgotten: “${removed[0]}”. Gia won't use it again.`;
    drawMem();
  });
  memEdit.addEventListener('click', () => {
    if (editing) memList.querySelectorAll('input').forEach(inp => { const v = inp.value.trim(); if (v) MEM[memKey].items[+inp.dataset.k][0] = v; });
    editing = !editing; memToast.textContent = editing ? '' : 'Memory updated.'; drawMem();
    if (editing) { const f = memList.querySelector('input'); if (f) f.focus(); }
  });
  drawMem();

  /* ---------- 06 Permission ---------- */
  const permResult = document.getElementById('perm-result');
  const log = document.getElementById('log');
  document.getElementById('perm-choices').addEventListener('click', (e) => {
    const b = e.target.closest('[data-perm]'); if (!b) return;
    const choice = b.dataset.perm;
    const text = choice === "Don't share" ? 'Kept your aisle-seat preference private' : `Shared aisle-seat preference (${choice.toLowerCase()})`;
    permResult.textContent = `You chose “${choice}”. It's now in your activity history.`;
    const li = document.createElement('li');
    li.className = 'is-new';
    li.innerHTML = `${text}<small>Just now</small><span class="status ${choice === "Don't share" ? 'status--muted' : 'status--ready'}">${choice === "Don't share" ? 'Not shared' : 'Shared'}</span>`;
    log.prepend(li);
  });

  /* ---------- 07 Work approval ---------- */
  const appr = document.getElementById('appr-share');
  appr.addEventListener('click', (e) => {
    const b = e.target.closest('[data-appr]'); if (!b) return;
    appr.innerHTML = b.dataset.appr === 'yes'
      ? 'Share the draft with Maya <span class="status status--ready">Approved</span>'
      : 'Share the draft with Maya <span class="status status--muted">Waiting for you</span>';
  });

  /* ---------- 09 Waitlist (draft: nothing is sent) ---------- */
  const form = document.getElementById('waitlist');
  const msg = document.getElementById('wl-msg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = form.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { msg.className = 'waitlist__msg'; msg.textContent = 'Enter an email address like name@example.com.'; form.email.focus(); return; }
    msg.className = 'waitlist__msg is-ok';
    msg.textContent = `You're on the waitlist. We'll write to ${v} when your Gia is ready.`;
    form.reset();
  });
})();
