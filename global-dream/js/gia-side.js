/* Screen 2b photo, phone halo, gold thread, request panel and switches
   (build spec 5.2b). The text column uses the shared reveal.
   A soft gold halo sits on the phone in the man's hand. While the photo
   and the panel are side by side, a gold thread (design system 16.9) joins
   a node on the phone to a node on the panel's top border; stacked, the
   halo stays and the thread is dropped (CSS hides the SVG, which is how
   this file knows). The phone point is measured from the photo's rendered
   box (object-fit: cover crop) and the panel node from layout offsets
   (never transformed rects), on load, after the image and fonts load, and
   on resize (debounced 150ms) - never per frame.
   When the photo column is 25% visible, once: photo, halo and pulse, phone
   node, thread, panel, rows 1-3 (item, scan line, status; rows 2-3 then
   dim), quote card. Then, while the section is
   visible, a particle travels along the thread from the panel to the
   phone every 4s and the halo pulses (1.8x) as it arrives.
   Switches: on without JavaScript. With motion they start off and turn on
   one by one when the list is 35% visible; aria-checked always matches the
   visual state. A click toggles one (nothing is saved); "What she can
   share" also switches row 1 between Shared and Not shared. Under reduced
   motion, or without GSAP, everything is shown at rest. */

function initGiaSide(sectionEl) {
  if (!sectionEl) return;

  const media = sectionEl.querySelector(".gd-side__media");
  const image = sectionEl.querySelector(".gd-side__image");
  const halos = Array.from(sectionEl.querySelectorAll(".gd-side__halo"));
  const haloPulse = sectionEl.querySelector(".gd-side__halo--pulse");
  const svg = sectionEl.querySelector(".gd-side__thread");
  const panel = sectionEl.querySelector(".gd-request");
  const panelNode = sectionEl.querySelector(".gd-request__node");
  const rows = Array.from(sectionEl.querySelectorAll(".gd-request__row"));
  const shareRow = sectionEl.querySelector("[data-share-row]");
  const quote = sectionEl.querySelector(".gd-side__quote");
  const controls = sectionEl.querySelector(".gd-side__controls");
  const switches = Array.from(sectionEl.querySelectorAll(".gd-switch"));
  const shareSwitch = sectionEl.querySelector(".gd-switch[data-share]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!media || !svg || !panel || !panelNode || !shareRow || !quote || rows.length !== 3) return;

  const SVG_NS = "http://www.w3.org/2000/svg";
  const easeOut = (t) => bezier(0.22, 0.61, 0.36, 1, t); // design-system ease
  const motion = !reduced && typeof gsap !== "undefined" && "IntersectionObserver" in window;

  // Phone points as fractions of the photo (2460x3072), measured on the
  // image: the phone spans 77.5-97% of the width and 51.8-67.5% of the
  // height (its top-left corner at 82.6% / 52.5%, its left edge leaning
  // down to 79.5% / 58% before the fingers cover it). The halo sits on its
  // centre; the node on its left edge, facing the panel, above the wrist.
  const IMAGE_W = 2460;
  const IMAGE_H = 3072;
  const PHONE_CENTRE = { x: 0.87, y: 0.59 };
  const PHONE_EDGE = { x: 0.816, y: 0.555 };
  // The face with its hair, as measured on the image (30-68% of the width,
  // 10-42% of the height). The halo is 260px, and smaller only where it or
  // its pulse (1.8x) would reach this box.
  const FACE = { x0: 0.3, x1: 0.68, y0: 0.1, y1: 0.42 };
  const HALO_SIZE = 260;
  const HALO_PULSE = 1.8;

  // ---------- Switches and the share interaction ----------

  const shareStatus = shareRow.querySelector(".gd-request__status-text");

  function setShared(on) {
    const text = on ? "Shared" : "Not shared";
    shareRow.classList.toggle("is-withheld", !on);
    // Only a real change reaches the polite live region.
    if (shareStatus.textContent !== text) shareStatus.textContent = text;
  }

  function setSwitch(sw, on) {
    sw.setAttribute("aria-checked", String(on));
    if (sw === shareSwitch) setShared(on);
  }

  const touched = new Set();
  switches.forEach((sw) => {
    sw.addEventListener("click", () => {
      touched.add(sw);
      setSwitch(sw, sw.getAttribute("aria-checked") !== "true");
    });
  });

  // ---------- Missing media ----------

  let photoMissing = !image;
  if (image) {
    if (image.complete && image.naturalWidth === 0 && image.currentSrc) photoMissing = true;
    image.addEventListener("error", () => {
      photoMissing = true;
      media.classList.add("is-missing");
      measure();
    });
  }
  if (photoMissing) media.classList.add("is-missing");

  // ---------- Halo and thread ----------

  function svgEl(name, attrs) {
    const el = document.createElementNS(SVG_NS, name);
    Object.keys(attrs).forEach((key) => el.setAttribute(key, attrs[key]));
    return el;
  }

  // Drawn from the phone to the panel. pathLength="1" keeps the dash
  // values 0-1.
  const line = svgEl("path", { class: "gd-side__line", pathLength: "1" });
  const phone = svgEl("g", {});
  const phoneDot = svgEl("circle", { class: "gd-connect__end-dot", r: "5" });
  phone.append(phoneDot);
  const particle = svgEl("circle", { class: "gd-connect__particle", r: "3", opacity: "0" });
  svg.append(line, phone, particle);

  // Position of el's layout box inside the section, ignoring transforms.
  function offsetIn(el) {
    let x = 0;
    let y = 0;
    let node = el;
    while (node && node !== sectionEl) {
      x += node.offsetLeft;
      y += node.offsetTop;
      node = node.offsetParent;
      // offsetLeft/Top are measured from the parent's padding edge.
      if (node && node !== sectionEl) {
        x += node.clientLeft;
        y += node.clientTop;
      }
    }
    return node === sectionEl ? { x, y, w: el.offsetWidth, h: el.offsetHeight } : null;
  }

  // A point of the photo inside the photo column, through its cover crop.
  function photoPoint(f) {
    const w = media.clientWidth;
    const h = media.clientHeight;
    const scale = Math.max(w / IMAGE_W, h / IMAGE_H);
    const rw = IMAGE_W * scale;
    const rh = IMAGE_H * scale;
    const pos = getComputedStyle(image).objectPosition.split(" ").map((v) => parseFloat(v) / 100);
    const px = isNaN(pos[0]) ? 0.5 : pos[0];
    const py = isNaN(pos[1]) ? 0.5 : pos[1];
    return { x: (w - rw) * px + rw * f.x, y: (h - rh) * py + rh * f.y };
  }

  let threaded = false;
  function measure() {
    threaded = false;
    if (photoMissing || !media.clientWidth) return;

    const centre = photoPoint(PHONE_CENTRE);
    const faceA = photoPoint({ x: FACE.x0, y: FACE.y0 });
    const faceB = photoPoint({ x: FACE.x1, y: FACE.y1 });
    const toFaceX = Math.max(faceA.x - centre.x, 0, centre.x - faceB.x);
    const toFaceY = Math.max(faceA.y - centre.y, 0, centre.y - faceB.y);
    const size = Math.min(HALO_SIZE, Math.floor((2 * Math.hypot(toFaceX, toFaceY)) / HALO_PULSE));
    media.style.setProperty("--phone-x", `${centre.x}px`);
    media.style.setProperty("--phone-y", `${centre.y}px`);
    media.style.setProperty("--halo-size", `${size}px`);

    // CSS drops the thread (and the panel node) in the stacked layout.
    if (getComputedStyle(svg).display === "none") return;
    const m = offsetIn(media);
    const n = offsetIn(panelNode);
    if (!m || !n) return;

    svg.setAttribute("viewBox", `0 0 ${media.clientWidth} ${media.clientHeight}`);
    const from = photoPoint(PHONE_EDGE);
    const to = { x: n.x + n.w / 2 - m.x, y: n.y + n.h / 2 - m.y };
    // Leaves the phone heading left (horizontal tangent) and arrives on the
    // panel's top border from above (vertical tangent). The control points
    // stay below the phone node's height minus a margin, so the curve
    // never rises towards the face.
    const dx = (from.x - to.x) * 0.5;
    const rise = Math.min(80, Math.max(40, Math.abs(from.y - to.y)));
    line.setAttribute("d", `M${from.x} ${from.y} C${from.x - dx} ${from.y} ${to.x} ${to.y - rise} ${to.x} ${to.y}`);
    phone.setAttribute("transform", `translate(${from.x} ${from.y})`);
    threaded = true;
  }

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 150);
  });
  if (image && !image.complete) image.addEventListener("load", measure, { once: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  // The section may start hidden or lay out late; measure once it shows.
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 150);
  }).observe(media);
  measure();

  // ---------- Reduced motion / no GSAP: complete composition ----------

  if (!motion) return;

  // ---------- Starting states (JavaScript only) ----------

  const withheld = rows.filter((row) => row !== shareRow);
  const items = rows.map((row) => row.querySelector(".gd-request__item"));
  const statuses = rows.map((row) => row.querySelector(".gd-request__status"));
  const scans = rows.map((row) => row.querySelector(".gd-request__scan"));

  if (image) gsap.set(image, { opacity: 0, scale: 1.08 });
  gsap.set(halos, { opacity: 0 });
  gsap.set(phoneDot, { transformOrigin: "50% 50%", scale: 0 });
  gsap.set(line, { strokeDashoffset: 1, visibility: "hidden" });
  gsap.set(panel, { opacity: 0, y: 32, scale: 0.97 });
  gsap.set(panelNode, { scale: 0 });
  gsap.set(items, { opacity: 0 });
  gsap.set(statuses, { opacity: 0, scale: 0.8, transformOrigin: "100% 50%" });
  withheld.forEach((row) => row.classList.remove("is-withheld"));
  gsap.set(quote, { opacity: 0, y: 16 });

  switches.forEach((sw) => setSwitch(sw, false));
  // Row 1 stays "Shared" until the member changes the share switch.
  setShared(true);

  function haloPulseOnce() {
    return gsap.fromTo(haloPulse, { scale: 1, opacity: 1 }, { scale: HALO_PULSE, opacity: 0, duration: 0.9, ease: "power1.out", immediateRender: false });
  }

  // ---------- Ambient: particle from the panel to the phone ----------

  let visible = false;
  let ambient = null;

  function syncAmbient() {
    if (ambient) visible ? ambient.resume() : ambient.pause();
  }

  function buildAmbient() {
    const carry = { t: 0 };
    ambient = gsap.timeline({ repeat: -1, repeatDelay: 4 - 1.2 })
      .fromTo(carry, { t: 0 }, {
        t: 1, duration: 1.2, ease: "sine.inOut",
        onUpdate: () => {
          if (!threaded) {
            particle.setAttribute("opacity", "0");
            return;
          }
          const total = line.getTotalLength();
          const pt = line.getPointAtLength((1 - carry.t) * total);
          particle.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
          particle.setAttribute("opacity", Math.min(1, carry.t * 8, (1 - carry.t) * 8));
        },
        onComplete: () => {
          if (threaded) haloPulseOnce();
        }
      });
    syncAmbient();
  }

  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      visible = entry.isIntersecting;
      syncAmbient();
    });
  }).observe(sectionEl);

  // ---------- Sequence (once, at 25% of the photo column) ----------

  function run() {
    const tl = gsap.timeline({ onComplete: buildAmbient });

    if (image) tl.to(image, { opacity: 1, scale: 1, duration: 1.6, ease: easeOut }, 0);

    tl.to(halos[0], { opacity: 1, duration: 0.4, ease: "none" }, 0.6);
    tl.add(haloPulseOnce(), 1.0);
    tl.to(phoneDot, { scale: 1, duration: 0.3, ease: "back.out(2.5)" }, 1.0);
    tl.set(line, { visibility: "visible" }, 1.0);
    tl.to(line, { strokeDashoffset: 0, duration: 0.7, ease: "power1.inOut" }, 1.0);

    tl.to(panel, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: easeOut }, 1.5);
    tl.to(panelNode, { scale: 1, duration: 0.3, ease: "back.out(2.5)" }, 1.7);

    rows.forEach((row, i) => {
      const at = 2.2 + i * 0.7;
      tl.to(items[i], { opacity: 1, duration: 0.3, ease: "none" }, at);
      tl.fromTo(scans[i], { x: 0, opacity: 1 }, {
        x: () => row.clientWidth - 2, duration: 0.4, ease: "power1.inOut", immediateRender: false
      }, at);
      tl.to(scans[i], { opacity: 0, duration: 0.15, ease: "none" }, at + 0.4);
      tl.to(statuses[i], { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, at + 0.45);
      // The 300ms dim is a CSS transition on the item (no strike-through:
      // that marks only the member's own refusal on row 1).
      if (row !== shareRow) tl.call(() => row.classList.add("is-withheld"), null, at + 0.75);
    });

    tl.to(quote, { opacity: 1, y: 0, duration: 0.6, ease: easeOut }, 4.4);
  }

  const trigger = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    trigger.disconnect();
    run();
  }, { threshold: 0.25 });
  trigger.observe(media);

  // ---------- Switches turn on (once, at 35% of the list) ----------

  if (controls) {
    const list = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      list.disconnect();
      switches.forEach((sw, i) => {
        gsap.delayedCall(i * 0.2, () => {
          if (touched.has(sw)) return; // the member already chose
          setSwitch(sw, true);
          gsap.fromTo(sw.querySelector(".gd-switch__glow"), { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power1.out", yoyo: true, repeat: 1 });
        });
      });
    }, { threshold: 0.35 });
    list.observe(controls);
  }

  // Cubic-bezier easing (x1, y1, x2, y2) solved for x = t.
  function bezier(x1, y1, x2, y2, t) {
    let u = t;
    for (let k = 0; k < 8; k++) {
      const x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u - t;
      const dx = 3 * (1 - u) * (1 - u) * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
      if (Math.abs(x) < 1e-5 || !dx) break;
      u -= x / dx;
    }
    u = Math.min(1, Math.max(0, u));
    return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
  }
}

document.addEventListener("DOMContentLoaded", () => initGiaSide(document.getElementById("screen-side")));
