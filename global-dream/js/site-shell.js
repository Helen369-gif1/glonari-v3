/* Header behaviour (build spec Section 5.5).
   At 1100px and below the nav collapses behind a hamburger. The menu
   closes on a link click, Escape (focus returns to the hamburger), an
   outside click, and when the viewport grows past the breakpoint. */

function initSiteShell(header) {
  if (!header) return;

  const toggle = header.querySelector(".gd-header__toggle");
  const menu = header.querySelector(".gd-header__nav");
  if (!toggle || !menu) return;

  const collapsedQuery = window.matchMedia("(max-width: 1100px)");

  function isOpen() {
    return header.classList.contains("is-menu-open");
  }

  function setOpen(open) {
    header.classList.toggle("is-menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", () => setOpen(!isOpen()));

  menu.addEventListener("click", (event) => {
    if (isOpen() && event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !isOpen()) return;
    setOpen(false);
    toggle.focus();
  });

  document.addEventListener("click", (event) => {
    if (isOpen() && !header.contains(event.target)) setOpen(false);
  });

  collapsedQuery.addEventListener("change", (event) => {
    if (!event.matches && isOpen()) setOpen(false);
  });
}

document.addEventListener("DOMContentLoaded", () => initSiteShell(document.querySelector(".gd-header")));
