/* Global Connections (global-connections.html) — page script. Needs js/site.js and js/components.js first.
   03 recommendation (Review / Decline), 05 milestone review and the inspect tabs.
   The approval sheet in 04 is the shared component (js/components.js). */
(() => {
  /* ---------- 03 Recommendation ---------- */
  const card = document.getElementById('gc-rec');
  const recState = document.getElementById('gc-rec-state');
  const recMsg = document.getElementById('gc-rec-msg');
  const recActions = document.getElementById('gc-rec-actions');
  if (card && recActions) {
    const original = recActions.innerHTML;
    card.addEventListener('click', (e) => {
      const el = e.target.closest('[data-rec]'); if (!el) return;
      const kind = el.dataset.rec;
      if (kind === 'review') {
        recState.textContent = 'Terms open';
        recState.className = 'status status--review';
        recMsg.textContent = 'Terms opened for your review below. Nothing starts until you authorize Gia.';
      } else if (kind === 'decline') {
        card.classList.add('is-declined');
        recState.textContent = 'Declined';
        recState.className = 'status status--muted';
        recMsg.textContent = 'Declined. That is a normal answer; Gia keeps looking for projects that fit.';
        recActions.innerHTML = '<button class="btn btn--ghost btn--sm" type="button" data-rec="undo">Show the recommendation again</button>';
        recActions.querySelector('button').focus();
      } else if (kind === 'undo') {
        card.classList.remove('is-declined');
        recState.textContent = 'Recommended';
        recState.className = 'status status--working';
        recMsg.textContent = '';
        recActions.innerHTML = original;
      }
    });
  }

  /* ---------- 05 Milestone review ---------- */
  const ms = document.getElementById('gc-milestone');
  if (ms) {
    ms.addEventListener('click', (e) => {
      if (!e.target.closest('[data-milestone]')) return;
      const st = ms.querySelector('.status');
      st.textContent = 'Reviewed by you';
      st.className = 'status status--ready';
      ms.querySelector('small').textContent = 'You approved the source list; Gia finalizes the analysis';
      e.target.closest('[data-milestone]').remove();
    });
  }

  /* ---------- 05 Inspect tabs (Sources / Assumptions / Open questions) ---------- */
  const tabs = [...document.querySelectorAll('.gc-tabs [role="tab"]')];
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });
})();
