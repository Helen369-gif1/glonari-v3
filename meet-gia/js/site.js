/* Gia site — shared shell script, loaded on every page before the page script.
   Header menu, scroll progress, active section in the nav, reveal on scroll.
   Exposes window.GiaSite = { reduce, clamp, lerp } for page scripts. */
(() => {
  document.body.classList.remove('no-js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  window.GiaSite = { reduce, clamp, lerp };

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    const setMenu = (open) => {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
    });
    // The menu exists only at 1100px and below; close it when the desktop header returns.
    const desktopShell = window.matchMedia('(min-width: 1101px)');
    const onShell = () => { if (desktopShell.matches) setMenu(false); };
    if (desktopShell.addEventListener) desktopShell.addEventListener('change', onShell); else desktopShell.addListener(onShell);
  }

  /* ---------- Scroll progress ---------- */
  const progressEl = document.querySelector('.progress');
  if (progressEl) {
    const update = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      progressEl.style.transform = `scaleX(${total > 0 ? clamp(window.scrollY / total, 0, 1) : 0})`;
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* ---------- Active section in the in-page navigation (level 2 and the mobile menu) ----------
     Only links to sections of this page (href="#id") take part.
     A section can point to another nav item with data-nav="id". */
  const navLinks = [...document.querySelectorAll('.subnav a[href^="#"], .mobile-menu a[href^="#"]:not(.btn)')];
  const subnav = document.querySelector('.subnav__inner');
  const sections = [...document.querySelectorAll('main > section[id]')];
  if (navLinks.length && sections.length) {
    let activeId = null;
    const setActive = (id) => {
      if (id === activeId) return;
      activeId = id;
      navLinks.forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === '#' + id ? 'true' : 'false'));
      // Keep the active item visible when the section row scrolls sideways (narrow desktop windows).
      const cur = subnav && subnav.querySelector('a[aria-current="true"]');
      if (cur && subnav.scrollWidth > subnav.clientWidth) {
        const left = cur.offsetLeft - (subnav.clientWidth - cur.offsetWidth) / 2;
        subnav.scrollTo({ left: Math.max(0, left), behavior: reduce ? 'auto' : 'smooth' });
      }
    };
    // The active section is the one crossing a line at 45% of the viewport height.
    // Past the last section (final CTA, footer) or above the first one, nothing is marked.
    let ticking = false;
    const pick = () => {
      ticking = false;
      const line = window.innerHeight * 0.45;
      const hit = sections.find(s => { const r = s.getBoundingClientRect(); return r.top <= line && r.bottom > line; });
      setActive(hit ? (hit.dataset.nav || hit.id) : null);
    };
    const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(pick); } };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    pick();
  }

  /* ---------- Reveal (runs once per element) ---------- */
  const revObs = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); revObs.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));
})();
