(() => {
  'use strict';

  // ===================================================================
  // Campus hotspots — the one source of the 11 zone shapes (2026-10-14,
  // DEVELOPMENT_PLAN.md Stage 20 / PRODUCT_REQUIREMENTS.md §30).
  //
  // Used by the desktop Campus (index.html) and the mobile Campus
  // (mobile/index.html). Loaded as a plain synchronous <script> placed
  // exactly where the <svg class="campus__zones"> belongs; it writes the
  // SVG in front of itself while the page is still being parsed, so the
  // SVG exists before main.js / mobile/main.js run, just as inline markup
  // would. `data-base` on the <script> tag is the path prefix to the repo
  // root ('' on desktop, '../' on mobile) for the SVG's own image hrefs.
  //
  // Shapes are drawn in the video's 1280x720 coordinate space (viewBox;
  // the 1920x1080 video and stills scale into it). Array order = DOM
  // order = back to front: where two shapes overlap, the later one wins
  // the pointer, and every later shape (except the presenter, which uses
  // its own segmentation mask) is cut out of an earlier zone's highlight
  // mask — that rule generates all the per-zone masks below.
  // ===================================================================

  const ZONES = [
    { key: 'building-pulse', name: 'Glonari Pulse', labelX: 95, labelY: 104, aria: 'Glonari Pulse — open section',
      d: 'M0 178L40 178A54.0 70 0 0 1 148 178L190 178L190 352L0 352Z' },
    { key: 'building-glonari-news', name: 'Glonari News', labelX: 278, labelY: 136, aria: 'Glonari News — open section',
      d: 'M200 205L247 205A40.5 65 0 0 1 328 205L356 205L356 342L200 342Z' },
    { key: 'building-global-connections', name: 'Global Connections', labelX: 436, labelY: 114, aria: 'Global Connections — open section',
      d: 'M352 172L397 172A39.5 54 0 0 1 476 172L518 172L518 306L352 306Z' },
    { key: 'building-banker', name: 'Digital Banker', labelX: 639, labelY: 40, aria: 'Digital Banker — enter',
      d: 'M528 126L578 126A59.0 68 0 0 1 696 126L750 126L750 312L528 312Z' },
    { key: 'building-global-dream', name: 'Global Dream', labelX: 846, labelY: 114, aria: 'Global Dream — open section',
      d: 'M760 174L807 174A39.5 56 0 0 1 886 174L932 174L932 306L760 306Z' },
    { key: 'building-glonari-commercial', name: 'Glonari Commercial', labelX: 997, labelY: 138, aria: 'Glonari Commercial — open section',
      d: 'M920 204L956 204A41.0 62 0 0 1 1038 204L1086 204L1086 342L920 342Z' },
    { key: 'building-glonari-homes', name: 'Glonari Homes', labelX: 1190, labelY: 104, aria: 'Glonari Homes — open section',
      d: 'M1097 178L1137 178A54.5 70 0 0 1 1246 178L1280 178L1280 356L1097 356Z' },
    { key: 'building-glonari-journey', name: 'Glonari Journey', labelX: 189, labelY: 318, aria: 'Glonari Journey — open section',
      d: 'M0 398L104 398A85.0 76 0 0 1 274 398L346 398L346 572L0 572Z' },
    { key: 'building-persona', name: 'Signature Personas', labelX: 1099, labelY: 320, aria: 'Signature Personas — open section',
      d: 'M930 400L1019 400A80.0 76 0 0 1 1179 400L1276 400L1276 582L930 582Z' },
    { key: 'fountain', name: 'Glonari', labelX: 637, labelY: 312, aria: 'Glonari — about Glonari',
      d: 'M557 398A80 80 0 0 1 717 398L722 440L790 446L860 462L888 488L882 512L840 528L700 535L570 532L532 516L528 478L548 452L560 440Z' },
    { key: 'presenter', name: 'Meet Gia', labelX: 424, labelY: 282, aria: 'Meet Gia — open',
      d: 'M437 288L416 288L403 294L389 309L372 334L367 345L365 357L367 375L353 396L349 406L337 413L332 420L312 467L292 525L292 532L300 551L302 567L317 569L329 582L351 613L348 625L348 636L344 648L345 655L332 719L402 719L409 693L418 671L420 675L420 688L416 719L483 719L494 654L495 620L487 581L476 557L494 552L510 540L523 536L527 531L535 509L543 499L558 486L583 483L617 470L623 465L622 463L600 467L587 467L586 465L588 460L585 458L563 462L553 466L519 498L512 502L505 502L497 461L488 447L493 432L493 421L487 408L488 396L480 389L478 385L479 370L473 341L465 318L454 299L446 292Z' },
  ];

  // Fountain glow: a circle around the globe (the hit shape also covers the basin).
  const FOUNTAIN_RING = { cx: 637, cy: 398, r: 82 };
  const FOUNTAIN_HALO = { cx: 637, cy: 430, rx: 190, ry: 130 };

  function markup(base) {
    const lift = `${base}assets/campus/campus-still-lift.webp`;
    const presenterCut = `<image href="${base}assets/campus/presenter-mask-cut.png" x="240" y="260" width="460" height="460"/>`;
    const presenterAdd = `<image href="${base}assets/campus/presenter-mask-add.png" x="240" y="260" width="460" height="460"/>`;
    const maskOpen = (id) => `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1280" height="720">`;

    const masks = [];
    ZONES.forEach((zone, i) => {
      if (zone.key === 'presenter') return;
      const cutouts = ZONES.slice(i + 1)
        .filter((later) => later.key !== 'presenter')
        .map((later) => `<path d="${later.d}" fill="#000"/>`)
        .join('');
      masks.push(`${maskOpen(`mask-${zone.key}`)}<path d="${zone.d}" fill="#fff"/>${cutouts}${presenterCut}</mask>`);
    });
    masks.push(`${maskOpen('mask-fountain-ring')}<rect width="1280" height="720" fill="#fff"/>${presenterCut}</mask>`);
    masks.push(`${maskOpen('mask-presenter')}${presenterAdd}</mask>`);

    const groups = ZONES.map((zone) => {
      const mask = `url(#mask-${zone.key})`;
      let body;
      if (zone.key === 'fountain') {
        // No still-frame lift here: the globe and the water move.
        body =
          `<ellipse class="zone__halo" cx="${FOUNTAIN_HALO.cx}" cy="${FOUNTAIN_HALO.cy}" rx="${FOUNTAIN_HALO.rx}" ry="${FOUNTAIN_HALO.ry}"/>` +
          `<circle class="zone__glow" cx="${FOUNTAIN_RING.cx}" cy="${FOUNTAIN_RING.cy}" r="${FOUNTAIN_RING.r}" vector-effect="non-scaling-stroke" mask="url(#mask-fountain-ring)"/>`;
      } else {
        body =
          `<image class="zone__lift" href="${lift}" width="1280" height="720" mask="${mask}"/>` +
          `<path class="zone__glow" vector-effect="non-scaling-stroke" d="${zone.d}" mask="${mask}"/>`;
      }
      return `<g class="zone" data-key="${zone.key}" data-name="${zone.name}" data-label-x="${zone.labelX}" data-label-y="${zone.labelY}" tabindex="-1" role="button" aria-label="${zone.aria}">` +
        `${body}<path class="zone__hit" d="${zone.d}"/></g>`;
    });

    return `<svg class="campus__zones" viewBox="0 0 1280 720" preserveAspectRatio="none" aria-label="Glonari Campus"><defs>` +
      '<radialGradient id="halo-grad"><stop offset="0" stop-color="#ffe9b8" stop-opacity=".38"/><stop offset="1" stop-color="#ffe9b8" stop-opacity="0"/></radialGradient>' +
      // Spotlight: everything except the active zone dims slightly; main.js
      // copies the active zone's shape and occlusion mask into #dim-hole.
      `${maskOpen('dim-mask')}<rect width="1280" height="720" fill="#fff"/><path id="dim-hole" d="" fill="#000"/></mask>` +
      `${masks.join('')}</defs>` +
      '<rect class="campus__dim" width="1280" height="720" mask="url(#dim-mask)"/>' +
      `${groups.join('')}</svg>`;
  }

  window.CampusZones = { ZONES, markup };

  const script = document.currentScript;
  if (script && script.hasAttribute('data-base')) {
    script.insertAdjacentHTML('beforebegin', markup(script.getAttribute('data-base')));
  }
})();
