/* Screen 2a photo, memory panel, gold threads and quote animation (build
   spec 5.2a). The header and the closing row use the shared reveal.
   From 1200px up, gold threads (design system 16.9) join each memory row
   to a node on the tablet's right frame edge, and the tablet's bottom
   frame edge to a node on the quote card's top border. The tablet points
   are measured from the photo's rendered box (object-fit: cover crop) and
   the layout offsets of the rows and the card (never transformed rects),
   on load, after the image and fonts load, and on resize (debounced
   150ms) - never per frame.
   When the stage is 25% visible, once: photo, memory panel, rows with
   their threads, tablet node, highlights, the thread to the card, quote
   card, outcome line. Then, while the section is visible, a particle
   travels along the threads of rows 2-4 in turn and the tablet node
   pulses as it arrives. Under reduced motion, or without GSAP, everything
   is shown at rest, threads drawn. */

function initGiaKnows(sectionEl) {
  if (!sectionEl) return;

  const visual = sectionEl.querySelector(".gd-knows__visual");
  const stage = sectionEl.querySelector(".gd-knows__stage");
  const image = sectionEl.querySelector(".gd-knows__image");
  const svg = sectionEl.querySelector(".gd-knows__threads");
  const panel = sectionEl.querySelector(".gd-memory");
  const rows = Array.from(sectionEl.querySelectorAll(".gd-memory__item"));
  const used = rows.filter((row) => row.hasAttribute("data-used"));
  const quote = sectionEl.querySelector(".gd-knows__quote");
  const cardNode = sectionEl.querySelector(".gd-knows__card-node");
  const sentences = Array.from(sectionEl.querySelectorAll(".gd-knows__quote .gd-quote__outcome span"));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = window.matchMedia("(min-width: 1200px)");

  if (!visual || !stage || !svg || !panel || !quote || !cardNode || rows.length !== 5) return;

  const SVG_NS = "http://www.w3.org/2000/svg";
  const easeOut = (t) => bezier(0.22, 0.61, 0.36, 1, t); // design-system ease

  // Tablet frame points as fractions of the photo (3640x2048), measured on
  // the image: the frame leans, so its right edge is at 68.2% of the width
  // at the screen's vertical centre (53.5% of the height), and its bottom
  // edge is at 74.7% of the height at 62% of the width.
  const IMAGE_W = 3640;
  const IMAGE_H = 2048;
  const TABLET_SIDE = { x: 0.682, y: 0.535 };
  const TABLET_BOTTOM = { x: 0.62, y: 0.747 };

  // ---------- Missing media ----------

  let photoMissing = false;
  if (image) {
    const missing = () => {
      photoMissing = true;
      stage.classList.add("is-missing");
      measure();
    };
    if (image.complete && image.naturalWidth === 0 && image.currentSrc) photoMissing = true;
    if (photoMissing) stage.classList.add("is-missing");
    image.addEventListener("error", missing);
  } else {
    photoMissing = true;
  }

  // ---------- Threads ----------

  function svgEl(name, attrs) {
    const el = document.createElementNS(SVG_NS, name);
    Object.keys(attrs).forEach((key) => el.setAttribute(key, attrs[key]));
    return el;
  }

  // One thread per row, then the tablet-to-card thread. pathLength="1"
  // keeps the dash values 0-1.
  const threads = rows.map((row) => svgEl("path", {
    class: row.hasAttribute("data-used") ? "gd-knows__thread" : "gd-knows__thread gd-knows__thread--faint",
    pathLength: "1"
  }));
  const down = svgEl("path", { class: "gd-knows__thread", pathLength: "1" });
  svg.append(...threads, down);

  // Tablet node (the Screen 3 node and pulse ring), above every thread.
  const tablet = svgEl("g", {});
  const pulse = svgEl("circle", { class: "gd-connect__end-pulse", r: "5" });
  const dot = svgEl("circle", { class: "gd-connect__end-dot", r: "5" });
  tablet.append(pulse, dot);
  svg.append(tablet);

  const particle = svgEl("circle", { class: "gd-connect__particle", r: "3", opacity: "0" });
  svg.append(particle);

  // Position of el's layout box inside the visual, ignoring transforms.
  function offsetIn(el) {
    let x = 0;
    let y = 0;
    let node = el;
    while (node && node !== visual) {
      x += node.offsetLeft;
      y += node.offsetTop;
      node = node.offsetParent;
      // offsetLeft/Top are measured from the parent's padding edge.
      if (node && node !== visual) {
        x += node.clientLeft;
        y += node.clientTop;
      }
    }
    return node === visual ? { x, y, w: el.offsetWidth, h: el.offsetHeight } : null;
  }

  // A point of the photo, through its object-fit: cover crop.
  function photoPoint(fx, fy) {
    const s = offsetIn(stage);
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const scale = Math.max(w / IMAGE_W, h / IMAGE_H);
    const rw = IMAGE_W * scale;
    const rh = IMAGE_H * scale;
    const pos = getComputedStyle(image).objectPosition.split(" ").map((v) => parseFloat(v) / 100);
    const px = isNaN(pos[0]) ? 0.5 : pos[0];
    const py = isNaN(pos[1]) ? 0.5 : pos[1];
    return {
      x: s.x + stage.clientLeft + (w - rw) * px + rw * fx,
      y: s.y + stage.clientTop + (h - rh) * py + rh * fy
    };
  }

  // Cubic curves with horizontal tangents at both ends (vertical for the
  // thread to the card); the control points stay between the two ends, so
  // a thread never reaches over the tablet screen.
  function curve(from, to, vertical) {
    if (vertical) {
      const dy = (to.y - from.y) / 2;
      return `M${from.x} ${from.y} C${from.x} ${from.y + dy} ${to.x} ${to.y - dy} ${to.x} ${to.y}`;
    }
    const dx = (to.x - from.x) / 2;
    return `M${from.x} ${from.y} C${from.x + dx} ${from.y} ${to.x - dx} ${to.y} ${to.x} ${to.y}`;
  }

  let ready = false;
  function measure() {
    ready = false;
    if (!wide.matches || photoMissing || !image) {
      svg.style.display = "none";
      return;
    }
    const p = offsetIn(panel);
    const c = offsetIn(cardNode);
    const r = rows.map(offsetIn);
    if (!p || !c || r.includes(null) || !stage.clientWidth) return;
    svg.style.display = "";

    svg.setAttribute("viewBox", `0 0 ${visual.offsetWidth} ${visual.offsetHeight}`);
    const side = photoPoint(TABLET_SIDE.x, TABLET_SIDE.y);
    const bottom = photoPoint(TABLET_BOTTOM.x, TABLET_BOTTOM.y);
    const card = { x: c.x + c.w / 2, y: c.y + c.h / 2 };

    // Each row's thread leaves the panel's left edge at the row's centre.
    r.forEach((row, i) => {
      const from = { x: p.x, y: row.y + row.h / 2 };
      threads[i].setAttribute("d", curve(from, side, false));
    });
    down.setAttribute("d", curve(bottom, card, true));
    tablet.setAttribute("transform", `translate(${side.x} ${side.y})`);
    ready = true;
  }

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 150);
  });
  if (image && !image.complete) image.addEventListener("load", measure, { once: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure();

  // ---------- Reduced motion / no GSAP: complete composition ----------

  if (reduced || typeof gsap === "undefined" || !("IntersectionObserver" in window)) return;

  // ---------- Starting states (JavaScript only) ----------

  if (image) gsap.set(image, { opacity: 0, scale: 1.08 });
  gsap.set(panel, { opacity: 0, x: 40 });
  gsap.set(rows, { opacity: 0, x: 16 });
  used.forEach((row) => row.classList.add("is-waiting"));
  gsap.set([...threads, down], { strokeDashoffset: 1, visibility: "hidden" });
  gsap.set([dot, pulse], { transformOrigin: "50% 50%" });
  gsap.set(dot, { scale: 0 });
  gsap.set(pulse, { opacity: 0 });
  gsap.set(quote, { opacity: 0, y: 32, scale: 0.97 });
  gsap.set(cardNode, { scale: 0 });
  gsap.set(sentences, { opacity: 0 });

  function pulseOnce() {
    return gsap.fromTo(pulse, { scale: 1, opacity: 0.6 }, { scale: 2.6, opacity: 0, duration: 0.7, ease: "power1.out", immediateRender: false });
  }

  // ---------- Ambient: particle along rows 2-4 (while visible) ----------

  let visible = false;
  let ambient = null;

  function syncAmbient() {
    if (ambient) visible ? ambient.resume() : ambient.pause();
  }

  function buildAmbient() {
    const usedThreads = used.map((row) => threads[rows.indexOf(row)]);
    let next = 0;
    const carry = { t: 0, path: null };

    ambient = gsap.timeline({ repeat: -1, repeatDelay: 3.5 - 1.2 })
      .call(() => {
        carry.path = ready ? usedThreads[next] : null;
        next = (next + 1) % usedThreads.length;
      })
      .fromTo(carry, { t: 0 }, {
        t: 1, duration: 1.2, ease: "sine.inOut",
        onUpdate: () => {
          if (!carry.path || !ready) {
            particle.setAttribute("opacity", "0");
            return;
          }
          const pt = carry.path.getPointAtLength(carry.t * carry.path.getTotalLength());
          particle.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
          particle.setAttribute("opacity", Math.min(1, carry.t * 8, (1 - carry.t) * 8));
        },
        onComplete: () => {
          if (carry.path && ready) pulseOnce();
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

  // ---------- Sequence (once, at 25% visible) ----------

  function run() {
    const tl = gsap.timeline({ onComplete: buildAmbient });

    if (image) tl.to(image, { opacity: 1, scale: 1, duration: 1.6, ease: easeOut }, 0);
    tl.to(panel, { opacity: 1, x: 0, duration: 0.7, ease: easeOut }, 0.5);

    rows.forEach((row, i) => {
      const at = 0.9 + i * 0.3;
      tl.to(row, { opacity: 1, x: 0, duration: 0.5, ease: easeOut }, at);
      tl.set(threads[i], { visibility: "visible" }, at + 0.2);
      tl.to(threads[i], { strokeDashoffset: 0, duration: 0.6, ease: "power1.inOut" }, at + 0.2);
    });

    tl.to(dot, { scale: 1, duration: 0.3, ease: "back.out(2.5)" }, 2.6);
    tl.add(pulseOnce(), 2.6);
    // The 400ms highlight fade is the CSS transition on the row.
    used.forEach((row, i) => {
      tl.call(() => row.classList.remove("is-waiting"), null, 2.6 + i * 0.12);
    });

    tl.set(down, { visibility: "visible" }, 3.2);
    tl.to(down, { strokeDashoffset: 0, duration: 0.7, ease: "power1.inOut" }, 3.2);

    tl.to(quote, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: easeOut }, 3.9);
    tl.to(cardNode, { scale: 1, duration: 0.3, ease: "back.out(2.5)" }, 3.9);

    sentences.forEach((sentence, i) => {
      tl.to(sentence, { opacity: 1, duration: 0.4, ease: "none" }, 4.6 + i * 0.25);
    });
  }

  const trigger = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    trigger.disconnect();
    run();
  }, { threshold: 0.25 });
  trigger.observe(stage);

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

document.addEventListener("DOMContentLoaded", () => initGiaKnows(document.getElementById("screen-knows")));
