/* Shared reveal (build spec Section 4.5).
   Elements with [data-reveal] animate once to rest when 25% visible.
   [data-reveal-delay="n"] adds n x 120ms. The hidden starting state in
   base.css applies only after .js is on <html>, so content stays visible
   if this file fails to load. */

document.documentElement.classList.add("js");

function initReveal(root) {
  const scope = root || document;
  const items = Array.from(scope.querySelectorAll("[data-reveal]:not(.is-revealed)"));
  if (!items.length) return;

  items.forEach((el) => {
    const n = parseInt(el.getAttribute("data-reveal-delay"), 10);
    if (n > 0) el.style.transitionDelay = n * 120 + "ms";
  });

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.25 });

  items.forEach((el) => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", () => initReveal(document));
