/* How GLO Works (how-glo-works.html) — page script. Needs js/site.js and js/components.js loaded first.
   The hero diagram build-up is driven by [data-motion] in js/components.js and CSS in css/pages/how-glo-works.css;
   option details use native details/summary.
   Section 06: the ecosystem is a pulse diagram [data-pulse="eco"] (engine in js/components.js). Work flows
   into Gia from You, Work requests and GLO capacity, Gia flashes, the pulse goes on to Deliverable, then the
   "After the work" paths light up one by one. Wide: straight wires with arrows. Vertical (860px and below):
   the three inputs join on a rail on the left, Deliverable sits below Gia. */
(() => {
  if (!window.GiaPulse) return;
  window.GiaPulse.define('eco', {
    cycle: 9000, pause: 1500,
    nodes: (root) => [...root.querySelectorAll('.eco__node')],
    highlights: (root) => [...root.querySelectorAll('.eco__path')],
    routes({ root, rect, vertical }) {
      const q = (s) => root.querySelector(s);
      const core = rect(q('.gia-core__photo')), plate = rect(q('.gia-core__plate'));
      const you = rect(q('.eco__you')), req = rect(q('.eco__req')), glo = rect(q('.eco__glo')), out = rect(q('.eco__out'));
      if (!vertical) {
        const after = rect(q('.eco__after-label'));
        return [
          { key: 'you', node: q('.eco__you'), arrow: true, pts: [[core.cx, you.b], [core.cx, core.t]] },
          { key: 'req', node: q('.eco__req'), arrow: true, pts: [[req.r, core.cy], [core.l, core.cy]] },
          { key: 'glo', node: q('.eco__glo'), arrow: true, pts: [[core.cx, glo.t], [core.cx, plate.b]] },
          { key: 'out', node: q('.eco__out'), arrow: true, pts: [[core.r, core.cy], [out.l, core.cy]] },
          { key: 'after', muted: true, pts: [[core.cx, glo.b], [core.cx, after.t - 8]] },
        ];
      }
      const rail = Math.min(you.l, req.l, glo.l) - 14, yb = (glo.b + core.t) / 2;
      const into = (key, sel, r) => ({ key, node: q(sel), arrow: true, pts: [[r.l, r.cy], [rail, r.cy], [rail, yb], [core.cx, yb], [core.cx, core.t]], dots: [[rail, r.cy]] });
      return [
        into('you', '.eco__you', you), into('req', '.eco__req', req), into('glo', '.eco__glo', glo),
        { key: 'out', node: q('.eco__out'), arrow: true, pts: [[core.cx, plate.b], [core.cx, out.t]] },
      ];
    },
    scenario(tl, root) {
      let done = 0;
      ['you', 'req', 'glo'].forEach((k, i) => { done = Math.max(done, tl.run(k, i * 300, 1100)); });
      tl.flash(done + 100);
      const end = tl.run('out', done + 900, 1000);
      const paths = [...root.querySelectorAll('.eco__path')];
      paths.forEach((p, i) => tl.highlight(p, end + 400 + i * 350));
      return end + 400 + paths.length * 350 + 350;
    },
  });
})();
