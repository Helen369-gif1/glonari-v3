/* Introducing GLO (glo.html) — page script. Needs js/site.js and js/components.js loaded first.
   Section 05: the approval in the example workspace. */
(() => {
  const appr = document.getElementById('glo-appr');
  const msg = document.getElementById('glo-appr-msg');
  if (!appr) return;
  appr.addEventListener('click', (e) => {
    const b = e.target.closest('[data-appr]'); if (!b) return;
    const yes = b.dataset.appr === 'yes';
    appr.innerHTML = 'Use additional capacity for extended research ' + (yes
      ? '<span class="status status--ready">Approved</span>'
      : '<span class="status status--muted">Waiting for you</span>');
    if (msg) msg.textContent = yes
      ? 'Approved. Gia continues the extended research with available qualifying capacity.'
      : 'Not now. Gia keeps to the first pass and waits for your approval.';
  });
})();
