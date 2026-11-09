/* معمل الرسم الفني — لوحة الرسم الخشبية وورقة المربعات (محرك الرسم بالأدوات)
   Designed & Developed by Mohamed-Eldawly */
(function () {
  'use strict';
  var sfx = window.DLSfx;
  var PX = { x: 194, y: 75, w: 1060, h: 750 };
  function cfgOf(v) {
    return v === 'grid'
      ? { K: 1060 / 297, t45: 286, t3060: { '30': [433, 250], '60': [250, 433] }, ruL: 714, ruW: 76, compL: 330, protR: 178, paperMM: [297, 210] }
      : { K: 1060 / 420, t45: 303, t3060: { '30': [437, 252], '60': [252, 437] }, ruL: 0, ruW: 0, compL: 270, protR: 126, paperMM: [420, 297] };
  }
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
  function segInfo(p, a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1, t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2, tc = Math.max(0, Math.min(1, t)), q = [a[0] + dx * tc, a[1] + dy * tc]; return { d: dist(p, q), t: t, tc: tc, q: q, L: Math.sqrt(L2) }; }
  function inPoly(p, P) { var c = false; for (var i = 0, j = P.length - 1; i < P.length; j = i++) { if (((P[i][1] > p[1]) !== (P[j][1] > p[1])) && (p[0] < (P[j][0] - P[i][0]) * (p[1] - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0])) c = !c; } return c; }
  function segX(a, b, c, d) { var r = [b[0] - a[0], b[1] - a[1]], s = [d[0] - c[0], d[1] - c[1]], den = r[0] * s[1] - r[1] * s[0]; if (Math.abs(den) < 1e-9) return null; var t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den, u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den; if (t < -0.001 || t > 1.001 || u < -0.001 || u > 1.001) return null; return [a[0] + r[0] * t, a[1] + r[1] * t]; }
  function wrapA(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
  function fx(n) { return Math.round(n * 10) / 10; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function arcD(cx, cy, r, a0, sw) {
    if (Math.abs(sw) >= 2 * Math.PI - 0.02) return 'M' + fx(cx + r) + ' ' + fx(cy) + 'A' + fx(r) + ' ' + fx(r) + ' 0 1 1 ' + fx(cx - r) + ' ' + fx(cy) + 'A' + fx(r) + ' ' + fx(r) + ' 0 1 1 ' + fx(cx + r) + ' ' + fx(cy);
    var a1 = a0 + sw, p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)], p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
    return 'M' + fx(p0[0]) + ' ' + fx(p0[1]) + 'A' + fx(r) + ' ' + fx(r) + ' 0 ' + (Math.abs(sw) > Math.PI ? 1 : 0) + ' ' + (sw > 0 ? 1 : 0) + ' ' + fx(p1[0]) + ' ' + fx(p1[1]);
  }
  function angIn(a, a0, sw) { if (Math.abs(sw) >= 2 * Math.PI - 0.05) return true; var d = a - a0; if (sw >= 0) { d = ((d % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); return d <= sw + 0.02; } d = ((-d % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); return d <= -sw + 0.02; }

  var PENS = [
    ['2h', 'خشبي صلب جدًا', 'خطوط إنشاء خفيفة', '2H', '#7C8DA6', 'rgba(105,112,126,.55)', false],
    ['h', 'خشبي صلب', 'خطوط الإنشاء والمساعدة', 'H', '#5B6E8C', 'rgba(82,88,100,.75)', false],
    ['hb', 'خشبي متوسط', 'الأكثر استخدامًا', 'HB', '#1C3D7A', 'rgba(38,42,50,.92)', false],
    ['b', 'خشبي لين', 'خط غامق للإخراج', 'B', '#1A1A1A', 'rgba(16,17,20,.97)', false],
    ['m05', 'ميكانيكي 0.5', 'الخطوط الرفيعة', '0.5', '#2F7BEF', 'rgba(40,44,52,.92)', true],
    ['m07', 'ميكانيكي 0.7', 'الحواف الظاهرة', '0.7', '#C81E26', 'rgba(30,32,38,.95)', true]
  ];
  var LTYPES = [
    ['visible', 'الخط الظاهر', 0.7, '', '#FFFFFF'],
    ['hidden', 'الخط المخفي', 0.4, '3 1.6', '#FFFFFF'],
    ['center', 'خط المحور', 0.3, '12 2 2 2', '#FF8A80'],
    ['dim', 'خط البُعد', 0.3, '', '#9CC6FF'],
    ['hatch', 'خط التهشير', 0.3, '', '#B7C5DF'],
    ['cut', 'خط القطع', 0.7, '12 2 2 2', '#F2C94C'],
    ['cons', 'خط إنشاء خفيف', 0.2, '', '#8A97AE']
  ];
  var COLORS = [['', 'رصاص', '#3A3F48'], ['#D62828', 'أحمر', '#D62828'], ['#1F6FEB', 'أزرق', '#1F6FEB'], ['#2E9E5B', 'أخضر', '#2E9E5B'], ['#E07B00', 'برتقالي', '#E07B00'], ['#7B3FE4', 'بنفسجي', '#7B3FE4']];
  var PF = { '2h': 0.55, h: 0.75, hb: 1, b: 1.4, m05: 0.7, m07: 1.05 };
  function pfOf(pc) { return PF[pc] || 1; }
  function penOf(pc) { return PENS.find(function (x) { return x[0] === pc; }) || PENS[2]; }
  function lineStyle(lt, pc, K, ink) {
    var L = LTYPES.find(function (x) { return x[0] === lt; }) || LTYPES[0], P = penOf(pc);
    var col = ink ? ink : (lt === 'cons' ? 'rgba(110,118,134,.6)' : P[5]);
    var dash = L[3] ? L[3].split(' ').map(function (n) { return fx(Number(n) * K); }).join(' ') : 'none';
    return { w: fx(Math.max(0.45, L[2] * K * 1.1 * pfOf(pc))), dash: dash, col: col };
  }

  var ICON = {
    pencil: 'M22 4l6 6L12 26l-8 2 2-8z M18 8l6 6', hand: 'M4 24c4-8 6 2 9-6s5 6 8-2 4 4 7 0M6 28h20',
    compass: 'M16 3v5M16 8l-7 20M16 8l7 20M11 17h10', dim: 'M4 12v10M28 12v10M4 17h24M4 17l4-3M4 17l4 3M28 17l-4-3M28 17l-4 3',
    text: 'M7 8V5h18v3M16 5v22M11 27h10', eraser: 'M6 20l10-12 10 8-8 10H12zM12 26h14',
    ruler: 'M3 22L22 3l7 7-19 19zM8 17l2 2M12 13l2 2M16 9l2 2', t45: 'M6 26V6l20 20zM10 22v-6l6 6z', t3060: 'M6 26V4l22 22zM10 22V14l8 8z',
    flip: 'M16 4v24M12 8L4 24h8zM20 8l8 16h-8z', orient: 'M26 16a10 10 0 1 1-3-7M26 4v6h-6', combine: 'M4 26V10l16 16zM14 26l12-12v12z',
    prot: 'M4 24a12 12 0 0124 0zM16 24l6-8M16 24V14', tape: 'M16 9a7 7 0 100 14 7 7 0 000-14zM16 13a3 3 0 100 6 3 3 0 000-6zM23 16h6'
  };
  var HANDLE = '<circle r="15" fill="#FFFFFF" fill-opacity=".92" stroke="#2F7BEF" stroke-width="2"/><path d="M-6 -2a6 6 0 1 1 1 6" fill="none" stroke="#2F7BEF" stroke-width="2" stroke-linecap="round"/>';

  function mountBoard(el, variant) {
    var grid = variant === 'grid', C = cfgOf(variant), K = C.K;
    var s = {
      tY: 560,
      t45: grid ? { show: true, x: 960, y: 660, rot: 0, flip: false, mode: 'free' } : { show: true, x: 380, rot: 0, flip: false, mode: 'blade' },
      t3060: grid ? { show: false, x: 1200, y: 700, rot: 0, flip: true, orient: '60', mode: 'free', s: 40 } : { show: true, x: 860, rot: 0, flip: false, orient: '30', mode: 'blade', s: 40 },
      ru: { show: grid, x: 240, y: 712, rot: 0 }, pr: { show: false, x: 760, y: 470, rot: 0 },
      sel: 't45', tool: 'pencil', pencil: 'hb', line: grid ? 'center' : 'visible',
      strokes: [], hist: [], fut: [], comp: null, dim: null, draft: null, freeDraft: null, hover: null, chip: null,
      taped: true, assist: false, rec: false, tab: grid ? 'steps' : 'pens', text: 'مسقط أمامي', tsize: 5, lastDim: -1,
      dv: { L: 61, W: 50, H: 64, T: 50 }, showHint: false, toast: null, demo: false, demoAt: -1, lesson: 0, phase: 'explain', ink: '', panels: true, pv: null
    };
    try { var saved = JSON.parse(localStorage.getItem('dl-' + variant) || 'null'); if (saved && saved.strokes) { s.strokes = saved.strokes; s.lesson = saved.lesson || 0; s.phase = saved.phase || 'explain'; } } catch (e) {}
    try { s.panels = localStorage.getItem('dl-panels') !== '0'; } catch (e) {}
    var timers = [], raf = 0, drag = null, svg, alive = true;
    function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
    function persist() { try { localStorage.setItem('dl-' + variant, JSON.stringify({ strokes: s.strokes, lesson: s.lesson, phase: s.phase })); } catch (e) {} }
    var pending = false;
    function set(o) { for (var k in o) s[k] = o[k]; if (!pending) { pending = true; requestAnimationFrame(function () { pending = false; if (alive) render(); }); } }
    function toast(t, kind) { DL.toast(t, kind); }
    var LS = window.DLLessons, lessonCache = {}, demoStop = false;
    if (!LS.list[s.lesson]) s.lesson = 0;
    function L() { return lessonCache[s.lesson] || (lessonCache[s.lesson] = LS.build(s.lesson, K, PX)); }
    function ldone(st) { return LS.check(L(), st || s.strokes, K); }
    function curStep(dn) { dn = dn || ldone(); return dn.findIndex(function (v) { return !v; }); }

    /* ---------- tool geometry ---------- */
    function pose(id) {
      if (id === 'ru') return { x: s.ru.x, y: s.ru.y, rot: s.ru.rot, sx: 1, w: C.ruL, h: C.ruW };
      if (id === 'pr') return { x: s.pr.x, y: s.pr.y, rot: s.pr.rot, sx: 1, R: C.protR };
      var T = s[id], wh = id === 't45' ? [C.t45, C.t45] : C.t3060[T.orient];
      if (T.mode === 'free') return { x: T.x, y: T.y, rot: T.rot, sx: T.flip ? -1 : 1, w: wh[0], h: wh[1] };
      if (T.mode === 'on45') {
        var v = verts(pose('t45')), O = v[0], B = v[1], Tp = v[2], Lh = dist(B, Tp), d = [(B[0] - Tp[0]) / Lh, (B[1] - Tp[1]) / Lh];
        var rot = Math.atan2(d[1], d[0]), sx = 1, up = [Math.sin(rot), -Math.cos(rot)];
        if ((O[0] - Tp[0]) * up[0] + (O[1] - Tp[1]) * up[1] > 0) { rot += Math.PI; sx = -1; }
        var sMax = Math.max(0, Lh - wh[0]), sv = Math.max(0, Math.min(sMax, T.s));
        return { x: Tp[0] + d[0] * sv, y: Tp[1] + d[1] * sv, rot: rot * 180 / Math.PI, sx: sx, w: wh[0], h: wh[1], d: d, L: sMax };
      }
      return { x: T.x, y: s.tY, rot: 0, sx: T.flip ? -1 : 1, w: wh[0], h: wh[1] };
    }
    function wpt(p, l) { var a = p.rot * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a), lx = l[0] * p.sx; return [p.x + lx * c - l[1] * sn, p.y + lx * sn + l[1] * c]; }
    function verts(p) { return [wpt(p, [0, 0]), wpt(p, [p.w, 0]), wpt(p, [0, -p.h])]; }
    function rulerPoly(p) { return [[0, 0], [p.w, 0], [p.w, p.h], [0, p.h]].map(function (l) { return wpt(p, l); }); }
    function edges() {
      var E = [];
      function add(a, b, c) { var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, n = [-dy / l, dx / l], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; if (n[0] * (m[0] - c[0]) + n[1] * (m[1] - c[1]) < 0) n = [-n[0], -n[1]]; E.push({ a: a, b: b, o: [n[0] * 1.7, n[1] * 1.7] }); }
      if (!grid) { add([64, s.tY], [1344, s.tY], [700, s.tY + 23]); add([64, s.tY + 46], [1344, s.tY + 46], [700, s.tY + 23]); }
      if (grid && s.ru.show) { var P = rulerPoly(pose('ru')), rc = pivot('ru'); add(P[0], P[1], rc); add(P[3], P[2], rc); }
      ['t45', 't3060'].forEach(function (id) { if (!s[id].show) return; var v = verts(pose(id)), c = pivot(id); add(v[0], v[1], c); add(v[1], v[2], c); add(v[2], v[0], c); });
      if (s.pr.show) { var p = pose('pr'); add(wpt(p, [-p.R, 0]), wpt(p, [p.R, 0]), wpt(p, [0, -p.R / 2])); }
      return E;
    }
    function pivot(id) { var P = pose(id); if (id === 'ru') return wpt(P, [P.w / 2, P.h / 2]); if (id === 'pr') return [P.x, P.y]; var v = verts(P); return [(v[0][0] + v[1][0] + v[2][0]) / 3, (v[0][1] + v[1][1] + v[2][1]) / 3]; }
    function hitTool(p) {
      if (!grid && p[0] >= 18 && p[0] <= 64 && p[1] >= s.tY - 74 && p[1] <= s.tY + 120) return { k: 'tsq' };
      var ids = ['t3060', 't45'];
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i]; if (!s[id].show) continue; var P = pose(id), v = verts(P);
        if (grid && dist(p, wpt(P, [30, -30])) < 22) return { k: 'rot', id: id };
        if (inPoly(p, v)) return { k: 'tri', id: id };
      }
      if (grid && s.ru.show) { var R = pose('ru'); if (dist(p, wpt(R, [R.w - 34, R.h / 2])) < 22) return { k: 'rot', id: 'ru' }; if (inPoly(p, rulerPoly(R))) return { k: 'ru' }; }
      if (s.pr.show) { var Q = pose('pr'); if (grid && dist(p, wpt(Q, [0, -Q.R * 0.62])) < 22) return { k: 'rot', id: 'pr' }; var loc = [p[0] - Q.x, p[1] - Q.y], a = -Q.rot * Math.PI / 180, ly = loc[0] * Math.sin(a) + loc[1] * Math.cos(a); if (dist(p, [Q.x, Q.y]) < Q.R && ly < 4) return { k: 'pr' }; }
      if (!grid && p[0] >= 34 && p[0] <= 1344 && p[1] >= s.tY && p[1] <= s.tY + 46) return { k: 'tsq' };
      return null;
    }
    function onPaper(p) { return p[0] >= PX.x && p[0] <= PX.x + PX.w && p[1] >= PX.y && p[1] <= PX.y + PX.h; }
    var snapFor = null, snapCache = [];
    function snapPts() {
      var st = s.strokes; if (snapFor === st) return snapCache;
      var P = [], lines = st.filter(function (x) { return x.k === 'line'; }), arcs = st.filter(function (x) { return x.k === 'arc'; });
      lines.forEach(function (l) { P.push([l.x1, l.y1], [l.x2, l.y2]); });
      arcs.forEach(function (a) { P.push([a.cx, a.cy]); });
      for (var i = 0; i < lines.length; i++) for (var j = i + 1; j < lines.length; j++) { var x = segX([lines[i].x1, lines[i].y1], [lines[i].x2, lines[i].y2], [lines[j].x1, lines[j].y1], [lines[j].x2, lines[j].y2]); if (x) P.push(x); }
      arcs.forEach(function (a) { lines.forEach(function (l) { var A = [l.x1, l.y1], B = [l.x2, l.y2], dx = B[0] - A[0], dy = B[1] - A[1], f0 = A[0] - a.cx, g0 = A[1] - a.cy, aa = dx * dx + dy * dy, bb = 2 * (f0 * dx + g0 * dy), cc = f0 * f0 + g0 * g0 - a.r * a.r, D = bb * bb - 4 * aa * cc; if (D < 0 || aa < 1e-9) return; [(-bb - Math.sqrt(D)) / (2 * aa), (-bb + Math.sqrt(D)) / (2 * aa)].forEach(function (t) { if (t >= -0.001 && t <= 1.001) { var q = [A[0] + dx * t, A[1] + dy * t]; if (angIn(Math.atan2(q[1] - a.cy, q[0] - a.cx), a.a0, a.sw)) P.push(q); } }); }); });
      for (var m = 0; m < arcs.length; m++) for (var n = m + 1; n < arcs.length; n++) { var a = arcs[m], b = arcs[n], d = dist([a.cx, a.cy], [b.cx, b.cy]); if (d < 1e-6 || d > a.r + b.r || d < Math.abs(a.r - b.r)) continue; var xx = (d * d + a.r * a.r - b.r * b.r) / (2 * d), h = Math.sqrt(Math.max(0, a.r * a.r - xx * xx)), ux = (b.cx - a.cx) / d, uy = (b.cy - a.cy) / d; [[a.cx + ux * xx - uy * h, a.cy + uy * xx + ux * h], [a.cx + ux * xx + uy * h, a.cy + uy * xx - ux * h]].forEach(function (q) { if (angIn(Math.atan2(q[1] - a.cy, q[0] - a.cx), a.a0, a.sw) && angIn(Math.atan2(q[1] - b.cy, q[0] - b.cx), b.a0, b.sw)) P.push(q); }); }
      if (grid) L().snap.forEach(function (q) { P.push(q); });
      snapFor = st; snapCache = P; return P;
    }
    function snap(p, r) {
      var best = null, bd = r || 10; snapPts().forEach(function (q) { var d = dist(p, q); if (d < bd) { bd = d; best = q; } });
      if (!best && grid) { var g = K * 5, q = [PX.x + Math.round((p[0] - PX.x) / g) * g, PX.y + Math.round((p[1] - PX.y) / g) * g]; if (dist(p, q) < 5) best = q; }
      return best ? [best[0], best[1]] : p;
    }
    function snapAlong(E, sv) {
      var Lh = dist(E.a, E.b), u = [(E.b[0] - E.a[0]) / Lh, (E.b[1] - E.a[1]) / Lh], best = sv, bd = 9;
      snapPts().forEach(function (q) { var t = (q[0] - E.a[0]) * u[0] + (q[1] - E.a[1]) * u[1], perp = Math.abs((q[0] - E.a[0]) * u[1] - (q[1] - E.a[1]) * u[0]); if (perp < 2.5 && Math.abs(t - sv) < bd) { bd = Math.abs(t - sv); best = t; } });
      return Math.max(0, Math.min(Lh, best));
    }
    function commit(next, msg) {
      var before = grid && !s.demo ? ldone() : null;
      set({ strokes: next, hist: s.hist.concat([s.strokes]).slice(-80), fut: [] }); persist();
      if (before) { var after = ldone(next); for (var i = 0; i < after.length; i++) if (after[i] && !before[i]) { sfx.chime(); toast('أحسنت! الخطوة ' + (i + 1) + ' صحيحة', 'ok'); if (after.every(Boolean)) later(function () { toast('ممتاز! أكملت التمرين بنجاح', 'ok'); }, 1400); return; } }
      if (msg) msg();
    }
    function cgeo(cp) {
      var Lc = C.compL, u = [Math.cos(cp.ang), Math.sin(cp.ang)], n = cp.flip ? [-u[1], u[0]] : [u[1], -u[0]], c = [cp.cx, cp.cy], P = [cp.cx + cp.r * u[0], cp.cy + cp.r * u[1]];
      var h = Math.sqrt(Math.max(0, Lc * Lc - cp.r * cp.r / 4)), H = [(c[0] + P[0]) / 2 + n[0] * h, (c[1] + P[1]) / 2 + n[1] * h];
      var lab = [H[0] + n[0] * 110, H[1] + n[1] * 110];
      return { c: c, P: P, H: H, ax: n, G: [H[0] + n[0] * 52, H[1] + n[1] * 52], Kn: [H[0] + (P[0] - H[0]) * 0.5, H[1] + (P[1] - H[1]) * 0.5], lab: lab, F: [lab[0] + 86, lab[1]], F2: [lab[0] - 86, lab[1]] };
    }
    function maxR() { return C.compL * 1.9; }
    function compassHit(p) {
      var g = cgeo(s.comp);
      if (dist(p, g.F) < 22) return 'flip';
      if (dist(p, g.F2) < 22) return 'mirror';
      if (dist(p, g.P) < 26) return 'draw';
      if (dist(p, g.Kn) < 20) return 'open';
      if (dist(p, g.G) < 38 || dist(p, [g.H[0] + g.ax[0] * 26, g.H[1] + g.ax[1] * 26]) < 22) return 'rot';
      if (dist(p, g.H) < 30 || segInfo(p, g.H, g.c).d < 15 || segInfo(p, g.H, g.P).d < 15) return 'move';
      return null;
    }
    function anim(ms, frame, done) { var t0 = performance.now(); function step(t) { if (!alive) return; var k = Math.min(1, (t - t0) / ms); frame(k); if (k < 1) raf = requestAnimationFrame(step); else if (done) done(); } raf = requestAnimationFrame(step); }

    /* ---------- demo (teacher shows the steps) ---------- */
    function runDemo(steps) {
      if (s.demo) return; demoStop = false; set({ demo: true, tool: 'pencil', showHint: false });
      var A = {
        line: function (a, b, lt, pc) { return function (next) { var Ld = dist(a, b); anim(Math.max(420, Math.min(950, Ld * 2.2)), function (k) { sfx.play('pencil', 0.85); set({ draft: { a: a, b: [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], lt: lt, pc: pc } }); }, function () { set({ draft: null }); commit(s.strokes.concat([{ k: 'line', x1: a[0], y1: a[1], x2: b[0], y2: b[1], lt: lt, pc: pc, anim: 1 }])); sfx.clack(); later(next, 160); }); }; },
        arc: function (c, R, a0, sw) { return function (next) {
          var prev = s.comp, from = prev && dist([prev.cx, prev.cy], c) < 1 ? prev.r : 0;
          set({ tool: 'compass', comp: { cx: c[0], cy: c[1], r: from, ang: a0, stage: 'open' } });
          anim(Math.abs(R - from) < 1 ? 120 : 480, function (k) { sfx.play('squeak', 0.6); set({ comp: { cx: c[0], cy: c[1], r: from + (R - from) * k, ang: a0, stage: 'open' } }); }, function () {
            anim(Math.max(420, Math.abs(sw) / (2 * Math.PI) * 1700), function (k) { sfx.play('pencil', 0.8); sfx.play('squeak', 0.25); set({ comp: { cx: c[0], cy: c[1], r: R, ang: a0 + sw * k, stage: 'draw', a0: a0, sw: sw * k } }); }, function () {
              commit(s.strokes.concat([{ k: 'arc', cx: c[0], cy: c[1], r: R, a0: a0, sw: sw, lt: 'visible', pc: 'h', anim: 1 }])); set({ comp: { cx: c[0], cy: c[1], r: R, ang: a0 + sw, stage: 'ready' } }); later(next, 200);
            });
          });
        }; }
      };
      var seq = [];
      steps.forEach(function (i) {
        seq.push(function (next) { set({ demoAt: i }); if (steps.length > 1) toast('الخطوة ' + (i + 1) + ': ' + L().steps[i].title, 'info'); later(next, steps.length > 1 ? 650 : 0); });
        LS.demo(L(), i).forEach(function (a) { seq.push(a.k === 'line' ? A.line(a.a, a.b, a.lt || 'visible', a.pc || 'h') : A.arc(a.c, a.r, a.a0, a.sw)); });
      });
      var j = 0;
      (function go() {
        if (demoStop || j >= seq.length) { var fin = !demoStop; demoStop = false; set({ demo: false, demoAt: -1, draft: null, tool: 'pencil' }); if (fin && steps.length > 1) { sfx.chime(); toast('انتهى الشرح — اضغط «ابدأ التنفيذ بنفسك» وطبّق الخطوات بيدك', 'ok'); } return; }
        seq[j++](go);
      })();
    }
    /* ---------- paper division ---------- */
    function divDraw() {
      var pm = C.paperMM, d = s.dv, Lm = +d.L || 0, Wm = +d.W || 0, Hm = +d.H || 0, Tm = +d.T || 0;
      var sx = (pm[0] - Lm - Wm) / 3, sy = (pm[1] - Hm - Tm) / 3; if (sx <= 0 || sy <= 0) { sfx.err(); toast('المساقط أكبر من مساحة الورقة', 'err'); return; }
      function X(mm) { return PX.x + mm * K; } function Y(mm) { return PX.y + mm * K; }
      var fr = 10, xs = [sx, sx + Lm, 2 * sx + Lm, 2 * sx + Lm + Wm], ys = [sy, sy + Hm, 2 * sy + Hm, 2 * sy + Hm + Tm], items = [];
      xs.forEach(function (x) { items.push({ k: 'line', x1: X(x), y1: Y(fr), x2: X(x), y2: Y(pm[1] - fr), lt: 'cons', pc: 'h', anim: 1 }); });
      ys.forEach(function (y) { items.push({ k: 'line', x1: X(fr), y1: Y(y), x2: X(pm[0] - fr), y2: Y(y), lt: 'cons', pc: 'h', anim: 1 }); });
      function r1(v) { return String(Math.round(v * 10) / 10); }
      var bx = [0].concat(xs, [pm[0]]), vx = [sx, Lm, sx, Wm, sx];
      vx.forEach(function (v, i) { items.push({ k: 'text', x: X((bx[i] + bx[i + 1]) / 2), y: Y(fr + 6), t: r1(v), fs: 4, pc: 'h' }); });
      var by = [0].concat(ys, [pm[1]]), vy = [sy, Hm, sy, Tm, sy];
      vy.forEach(function (v, i) { items.push({ k: 'text', x: X(fr + 7), y: Y((by[i] + by[i + 1]) / 2) + 4, t: r1(v), fs: 4, pc: 'h' }); });
      items.push({ k: 'text', x: X(sx + Lm / 2), y: Y(sy + Hm / 2), t: 'أمامي', fs: 5, pc: '2h' }, { k: 'text', x: X(2 * sx + Lm + Wm / 2), y: Y(sy + Hm / 2), t: 'جانبي', fs: 5, pc: '2h' }, { k: 'text', x: X(sx + Lm / 2), y: Y(2 * sy + Hm + Tm / 2), t: 'أفقي', fs: 5, pc: '2h' });
      var i = 0; set({ hist: s.hist.concat([s.strokes]).slice(-80), fut: [] });
      (function go() { if (i >= items.length) { sfx.chime(); persist(); toast('تم تقسيم اللوحة — المسافة الأفقية ' + r1(sx) + ' مم والرأسية ' + r1(sy) + ' مم', 'ok'); return; } var it = items[i++]; set({ strokes: s.strokes.concat([it]) }); for (var q = 0; q < 6; q++) later(function () { sfx.play('pencil', it.k === 'text' ? 0.9 : 0.6); }, q * 40); later(go, it.k === 'text' ? 170 : 260); })();
    }
    /* ---------- dims ---------- */
    function dimGeo(x) {
      var a = x.a, b = x.b, Ld = dist(a, b) || 1, u = [(b[0] - a[0]) / Ld, (b[1] - a[1]) / Ld], n = [-u[1], u[0]], off = x.off, sg = off >= 0 ? 1 : -1;
      var A = [a[0] + n[0] * off, a[1] + n[1] * off], B = [b[0] + n[0] * off, b[1] + n[1] * off], g = 1 * K * sg, ov = 2 * K * sg, al = 3 * K, aw = 0.6 * K;
      var lines = 'M' + fx(a[0] + n[0] * g) + ' ' + fx(a[1] + n[1] * g) + 'L' + fx(A[0] + n[0] * ov) + ' ' + fx(A[1] + n[1] * ov) + 'M' + fx(b[0] + n[0] * g) + ' ' + fx(b[1] + n[1] * g) + 'L' + fx(B[0] + n[0] * ov) + ' ' + fx(B[1] + n[1] * ov) + 'M' + fx(A[0]) + ' ' + fx(A[1]) + 'L' + fx(B[0]) + ' ' + fx(B[1]);
      function arr(P, dir) { return 'M' + fx(P[0]) + ' ' + fx(P[1]) + 'L' + fx(P[0] + dir[0] * al + n[0] * aw) + ' ' + fx(P[1] + dir[1] * al + n[1] * aw) + 'L' + fx(P[0] + dir[0] * al - n[0] * aw) + ' ' + fx(P[1] + dir[1] * al - n[1] * aw) + 'Z'; }
      var deg = Math.atan2(u[1], u[0]) * 180 / Math.PI; if (deg > 90) deg -= 180; if (deg < -90) deg += 180;
      var mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], up = [Math.sin(deg * Math.PI / 180), -Math.cos(deg * Math.PI / 180)], tp = [mid[0] + up[0] * 1.2 * K, mid[1] + up[1] * 1.2 * K];
      var mmv = Ld / K, val = Math.abs(mmv - Math.round(mmv)) < 0.15 ? String(Math.round(mmv)) : String(Math.round(mmv * 10) / 10);
      return { A: A, B: B, lines: lines, arrows: arr(A, u) + arr(B, [-u[0], -u[1]]), tt: 'translate(' + fx(tp[0]) + ' ' + fx(tp[1]) + ') rotate(' + fx(deg) + ')', t: (x.pfx || '') + val };
    }
    function diaGeo(x) {
      var c = [x.cx, x.cy], u = [Math.cos(x.ang), Math.sin(x.ang)], n = [-u[1], u[0]], P1 = [c[0] + u[0] * x.r, c[1] + u[1] * x.r], P2 = [c[0] - u[0] * x.r, c[1] - u[1] * x.r], al = 3 * K, aw = 0.6 * K, ext = [P1[0] + u[0] * 12 * K, P1[1] + u[1] * 12 * K];
      function arr(P, dir) { return 'M' + fx(P[0]) + ' ' + fx(P[1]) + 'L' + fx(P[0] + dir[0] * al + n[0] * aw) + ' ' + fx(P[1] + dir[1] * al + n[1] * aw) + 'L' + fx(P[0] + dir[0] * al - n[0] * aw) + ' ' + fx(P[1] + dir[1] * al - n[1] * aw) + 'Z'; }
      var deg = x.ang * 180 / Math.PI; if (deg > 90) deg -= 180; if (deg < -90) deg += 180;
      var tp = [ext[0] - u[0] * 4 * K + Math.sin(deg * Math.PI / 180) * 1.2 * K, ext[1] - u[1] * 4 * K - Math.cos(deg * Math.PI / 180) * 1.2 * K];
      var mmv = 2 * x.r / K, val = Math.abs(mmv - Math.round(mmv)) < 0.15 ? String(Math.round(mmv)) : String(Math.round(mmv * 10) / 10);
      return { lines: 'M' + fx(P2[0]) + ' ' + fx(P2[1]) + 'L' + fx(ext[0]) + ' ' + fx(ext[1]), arrows: arr(P1, [-u[0], -u[1]]) + arr(P2, u), tt: 'translate(' + fx(tp[0]) + ' ' + fx(tp[1]) + ') rotate(' + fx(deg) + ')', t: (x.pfx === undefined ? 'Ø' : x.pfx) + val };
    }
    function freeD(pts) { if (pts.length < 2) return ''; var d = 'M' + fx(pts[0][0]) + ' ' + fx(pts[0][1]); for (var i = 1; i < pts.length - 1; i++) { var m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; d += 'Q' + fx(pts[i][0]) + ' ' + fx(pts[i][1]) + ' ' + fx(m[0]) + ' ' + fx(m[1]); } var l = pts[pts.length - 1]; return d + 'L' + fx(l[0]) + ' ' + fx(l[1]); }
    function eraseAt(p) {
      var st = s.strokes, bi = -1, bd = 11;
      st.forEach(function (x, i) {
        var d = 1e9;
        if (x.k === 'line') d = segInfo(p, [x.x1, x.y1], [x.x2, x.y2]).d;
        else if (x.k === 'arc') { var a = Math.atan2(p[1] - x.cy, p[0] - x.cx); d = angIn(a, x.a0, x.sw) ? Math.abs(dist(p, [x.cx, x.cy]) - x.r) : 1e9; }
        else if (x.k === 'text') d = Math.abs(p[0] - x.x) < x.t.length * x.fs * 1.4 + 8 && Math.abs(p[1] - x.y + 6) < 14 ? 0 : 1e9;
        else if (x.k === 'dim') { var g = dimGeo(x); d = segInfo(p, g.A, g.B).d; }
        else if (x.k === 'dia') d = segInfo(p, [x.cx - x.r * Math.cos(x.ang), x.cy - x.r * Math.sin(x.ang)], [x.cx + x.r * Math.cos(x.ang), x.cy + x.r * Math.sin(x.ang)]).d;
        else if (x.k === 'free') { for (var j = 1; j < x.pts.length; j++) d = Math.min(d, segInfo(p, x.pts[j - 1], x.pts[j]).d); }
        if (d < bd) { bd = d; bi = i; }
      });
      if (bi >= 0) { commit(st.filter(function (_, i) { return i !== bi; })); sfx.play('rub', 1); }
    }
    /* ---------- pointer ---------- */
    function pt(e) { var m = svg.getScreenCTM(); if (!m) return [0, 0]; var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; var q = p.matrixTransform(m.inverse()); return [q.x, q.y]; }
    function down(e) {
      var p = pt(e); sfx.init(); try { svg.setPointerCapture(e.pointerId); } catch (x) {}
      if (s.demo) return;
      if (s.tool === 'compass' && s.comp && s.comp.r >= 4 && s.comp.stage !== 'draw') {
        var ch = compassHit(p), cg = cgeo(s.comp);
        if (ch === 'draw') { var an0 = Math.atan2(p[1] - s.comp.cy, p[0] - s.comp.cx); drag = { k: 'cdraw', last: an0, a0: s.comp.ang, sw: 0, lp: p }; set({ comp: Object.assign({}, s.comp, { stage: 'draw', a0: s.comp.ang, sw: 0 }) }); return; }
        if (ch === 'flip' || ch === 'mirror') {
          // flip = mirror up/down (hinge to the other side), mirror = left/right (lead swaps to the other side of the needle)
          var cm = s.comp, na = ch === 'mirror' ? Math.PI - cm.ang : -cm.ang;
          sfx.clack(); sfx.swoosh(0.8, 0.2);
          set({ comp: Object.assign({}, cm, { ang: Math.atan2(Math.sin(na), Math.cos(na)), flip: !cm.flip }) });
          toast(ch === 'mirror' ? 'قلب الفرجار يمين / شمال' : 'قلب الفرجار فوق / تحت', 'info'); return;
        }
        if (ch === 'open') { drag = { k: 'copen2', r0: s.comp.r, d0: dist(p, cg.c), lp: p }; sfx.tick(1400, 0.12); return; }
        if (ch === 'rot') { drag = { k: 'crot', last: Math.atan2(p[1] - s.comp.cy, p[0] - s.comp.cx), lp: p }; sfx.tick(1100, 0.1); return; }
        if (ch === 'move') { drag = { k: 'cmove', off: [p[0] - s.comp.cx, p[1] - s.comp.cy], lp: p }; sfx.tick(1000, 0.1); return; }
      }
      var hit = hitTool(p);
      if (hit && hit.k === 'tsq' && (p[0] <= 64 || s.tool !== 'pencil')) { drag = { k: 'tsq', off: p[1] - s.tY, ly: p[1] }; return; }
      if (s.tool === 'pencil') {
        if (!s.taped && !grid) { sfx.err(); toast('ثبّت الورقة بالشريط اللاصق أولًا', 'err'); return; }
        var best = null; edges().forEach(function (E) { var I = segInfo(p, E.a, E.b); if (I.d < 18 && I.t > -0.02 && I.t < 1.02 && (!best || I.d < best.I.d)) best = { E: E, I: I }; });
        if (best && onPaper(p)) { var s0 = snapAlong(best.E, best.I.tc * best.I.L); drag = { k: 'draw', E: best.E, s0: s0, s1: s0, lp: p, len: best.I.L }; updDraft(); return; }
      }
      if (hit) {
        if (hit.k === 'rot') { drag = { k: 'rot', id: hit.id, c: pivot(hit.id), a0: 0, r0: pose(hit.id).rot }; drag.a0 = Math.atan2(p[1] - drag.c[1], p[0] - drag.c[0]); if (hit.id !== 'ru' && hit.id !== 'pr') set({ sel: hit.id }); return; }
        if (hit.k === 'tri') { var T = s[hit.id]; drag = { k: 'tri', id: hit.id, p0: p, x0: T.x, y0: T.y, s0: T.s, lp: p }; set({ sel: hit.id }); sfx.tick(900, 0.08); return; }
        if (hit.k === 'ru') { drag = { k: 'ru', p0: p, x0: s.ru.x, y0: s.ru.y, lp: p }; sfx.tick(900, 0.08); return; }
        if (hit.k === 'pr') { drag = { k: 'pr', p0: p, x0: s.pr.x, y0: s.pr.y, lp: p }; return; }
        if (hit.k === 'tsq') { drag = { k: 'tsq', off: p[1] - s.tY, ly: p[1] }; return; }
      }
      if (!onPaper(p)) return;
      if (s.tool === 'hand') { drag = { k: 'hand', lp: p }; set({ freeDraft: [p] }); return; }
      if (s.tool === 'pencil') {
        if (s.assist) { var a0 = snap(p, 12); drag = { k: 'free', a: a0, b: a0, lp: p }; set({ draft: { a: a0, b: a0, lt: s.line, pc: s.pencil } }); return; }
        sfx.err(); toast(grid ? 'ضع القلم على حافة المسطرة أو المثلث لترسم خطًا مستقيمًا — أو استخدم «الكتابة باليد»' : 'ضع القلم على حافة مسطرة T أو المثلث لترسم خطًا مستقيمًا — أو استخدم «الكتابة باليد»', 'err'); return;
      }
      if (s.tool === 'compass') {
        var cp = s.comp;
        if (!cp) { var c = snap(p, 14); drag = { k: 'copen', c: c }; set({ comp: { cx: c[0], cy: c[1], r: 0, ang: 0, stage: 'open' } }); sfx.tick(1400, 0.12); return; }
        toast('اسحب سن القلم (الحلقة الحمراء) للرسم · المقبض الأزرق للّف بدون رسم · الذراع للنقل · المسمار الأصفر للفتحة', 'info'); return;
      }
      if (s.tool === 'dim') {
        if (s.dim && s.dim.stage === 'off') { var dm = s.dim; commit(s.strokes.concat([{ k: 'dim', a: dm.a, b: dm.b, off: dm.off, pfx: '', pc: 'hb', ink: s.ink }])); set({ dim: null, lastDim: s.strokes.length - 1 }); sfx.tick(1500, 0.15); sfx.write(); return; }
        var a = snap(p, 12);
        if (a === p) { var arc = s.strokes.find(function (x) { return x.k === 'arc' && Math.abs(dist(p, [x.cx, x.cy]) - x.r) < 9; }); if (arc) { commit(s.strokes.concat([{ k: 'dia', cx: arc.cx, cy: arc.cy, r: arc.r, ang: Math.atan2(p[1] - arc.cy, p[0] - arc.cx), pc: 'hb' }])); set({ lastDim: s.strokes.length - 1 }); sfx.tick(1500, 0.15); sfx.write(); return; } }
        drag = { k: 'dim', a: a }; set({ dim: { a: a, b: a, off: 10 * K, stage: 'ab' } }); return;
      }
      if (s.tool === 'text') { var t = (s.text || '').trim(); if (!t) return; commit(s.strokes.concat([{ k: 'text', x: p[0], y: p[1], t: t, fs: s.tsize, pc: s.pencil, ink: s.ink }])); sfx.write(); return; }
      if (s.tool === 'eraser') { drag = { k: 'erase', lp: p }; eraseAt(p); return; }
    }
    function updDraft() { var d = drag, E = d.E, Lh = dist(E.a, E.b), u = [(E.b[0] - E.a[0]) / Lh, (E.b[1] - E.a[1]) / Lh], o = E.o || [0, 0]; set({ draft: { a: [E.a[0] + u[0] * d.s0 + o[0], E.a[1] + u[1] * d.s0 + o[1]], b: [E.a[0] + u[0] * d.s1 + o[0], E.a[1] + u[1] * d.s1 + o[1]], lt: s.line, pc: s.pencil } }); }
    function move(e) {
      var p = pt(e), d = drag;
      if (!d) {
        if ((s.tool === 'pencil' || s.tool === 'hand') && onPaper(p) && !s.demo && e.pointerType !== 'touch') set({ hover: p }); else if (s.hover) set({ hover: null });
        if (s.dim && s.dim.stage === 'off') { var dm = s.dim, Ld = dist(dm.a, dm.b) || 1, n = [-(dm.b[1] - dm.a[1]) / Ld, (dm.b[0] - dm.a[0]) / Ld]; set({ dim: Object.assign({}, dm, { off: (p[0] - dm.a[0]) * n[0] + (p[1] - dm.a[1]) * n[1] }) }); }
        return;
      }
      var sp = d.lp ? dist(p, d.lp) : 0; d.lp = p;
      if (d.k === 'tsq') { var y = Math.max(100, Math.min(820, p[1] - d.off)); sfx.play('ruler', Math.min(1, Math.abs(p[1] - (d.ly || p[1])) / 14)); d.ly = p[1]; set({ tY: y, chip: { p: [80, y - 54], t: 'Y = ' + Math.round((y - PX.y) / K) + ' mm' } }); return; }
      if (d.k === 'tri') {
        var T = s[d.id], o = {}; sfx.play('slide', Math.min(1, sp / 12));
        if (T.mode === 'free') o[d.id] = Object.assign({}, T, { x: d.x0 + p[0] - d.p0[0], y: d.y0 + p[1] - d.p0[1] });
        else if (T.mode === 'on45') { var P = pose(d.id), ds = (p[0] - d.p0[0]) * P.d[0] + (p[1] - d.p0[1]) * P.d[1]; o[d.id] = Object.assign({}, T, { s: Math.max(0, Math.min(P.L, d.s0 + ds)) }); }
        else { var w = pose(d.id).w; o[d.id] = Object.assign({}, T, { x: Math.max(80 + (T.flip ? w : 0), Math.min(1330 - (T.flip ? 0 : w), d.x0 + p[0] - d.p0[0])) }); }
        set(o); return;
      }
      if (d.k === 'ru') { sfx.play('slide', Math.min(1, sp / 12)); set({ ru: Object.assign({}, s.ru, { x: d.x0 + p[0] - d.p0[0], y: d.y0 + p[1] - d.p0[1] }) }); return; }
      if (d.k === 'pr') { sfx.play('slide', Math.min(1, sp / 12)); set({ pr: Object.assign({}, s.pr, { x: d.x0 + p[0] - d.p0[0], y: d.y0 + p[1] - d.p0[1] }) }); return; }
      if (d.k === 'rot') {
        var a = Math.atan2(p[1] - d.c[1], p[0] - d.c[0]), r = d.r0 + (a - d.a0) * 180 / Math.PI, sn = Math.round(r / 15) * 15; r = Math.abs(r - sn) < 2.5 ? sn : Math.round(r * 2) / 2;
        sfx.play('slide', Math.min(1, sp / 10));
        var c0 = pivot(d.id), key = d.id, prev = s[key]; s[key] = Object.assign({}, prev, { rot: r }); var c1 = pivot(key); s[key] = prev;
        var oo = {}; oo[key] = Object.assign({}, prev, { rot: r, x: prev.x + (c0[0] - c1[0]), y: prev.y + (c0[1] - c1[1]) });
        oo.chip = { p: [d.c[0] - 50, d.c[1] - 70], t: (((Math.round(r) % 360) + 360) % 360) + '°' }; set(oo); return;
      }
      if (d.k === 'draw') { d.s1 = snapAlong(d.E, segInfo(p, d.E.a, d.E.b).tc * d.len); sfx.play('pencil', Math.min(1, sp / 7)); updDraft(); set({ chip: { p: [p[0] + 30, p[1] - 60], t: (Math.round(Math.abs(d.s1 - d.s0) / K * 10) / 10) + ' mm' } }); return; }
      if (d.k === 'free') { var b = snap(p, 12); if (b === p) { var dx = p[0] - d.a[0], dy = p[1] - d.a[1], Lf = Math.hypot(dx, dy), ang = Math.atan2(dy, dx), sa = Math.round(ang / (Math.PI / 12)) * (Math.PI / 12); if (Math.abs(ang - sa) < 0.05) b = [d.a[0] + Lf * Math.cos(sa), d.a[1] + Lf * Math.sin(sa)]; } sfx.play('pencil', Math.min(1, sp / 7)); set({ draft: { a: d.a, b: b, lt: s.line, pc: s.pencil }, chip: { p: [p[0] + 30, p[1] - 60], t: (Math.round(dist(d.a, b) / K * 10) / 10) + ' mm' } }); return; }
      if (d.k === 'hand') { if (sp < 1.2) return; sfx.play('pencil', Math.min(1, sp / 5)); set({ freeDraft: s.freeDraft.concat([p]), hover: p }); return; }
      if (d.k === 'cmove') { sfx.play('slide', Math.min(1, sp / 10)); set({ comp: Object.assign({}, s.comp, { cx: p[0] - d.off[0], cy: p[1] - d.off[1] }) }); return; }
      if (d.k === 'copen2') { var r2 = Math.max(4, Math.min(maxR(), d.r0 + (dist(p, [s.comp.cx, s.comp.cy]) - d.d0) * 2)); r2 = Math.round(r2 / K * 2) / 2 * K; sfx.play('squeak', Math.min(1, sp / 10)); set({ comp: Object.assign({}, s.comp, { r: r2 }) }); return; }
      if (d.k === 'crot') { var cr = s.comp, an2 = Math.atan2(p[1] - cr.cy, p[0] - cr.cx), da = wrapA(an2 - d.last); d.last = an2; sfx.play('slide', Math.min(1, sp / 10)); set({ comp: Object.assign({}, cr, { ang: cr.ang + da }) }); return; }
      if (d.k === 'copen') { var cc = d.c, rr = Math.min(maxR(), Math.round(dist(p, cc) / K * 2) / 2 * K); sfx.play('squeak', Math.min(1, sp / 10)); set({ comp: { cx: cc[0], cy: cc[1], r: rr, ang: Math.atan2(p[1] - cc[1], p[0] - cc[0]), stage: 'open' } }); return; }
      if (d.k === 'cdraw') { var cp = s.comp, an = Math.atan2(p[1] - cp.cy, p[0] - cp.cx); d.sw += wrapA(an - d.last); d.last = an; d.sw = Math.max(-2 * Math.PI, Math.min(2 * Math.PI, d.sw)); sfx.play('pencil', Math.min(1, sp / 8)); sfx.play('squeak', Math.min(0.5, sp / 20)); set({ comp: Object.assign({}, cp, { ang: d.a0 + d.sw, sw: d.sw, stage: 'draw' }) }); return; }
      if (d.k === 'dim') { set({ dim: Object.assign({}, s.dim, { b: snap(p, 12) }) }); return; }
      if (d.k === 'erase') { if (sp > 0) sfx.play('rub', Math.min(1, sp / 6)); eraseAt(p); return; }
    }
    function up() {
      var d = drag; drag = null; if (!d) return;
      if (d.k === 'tsq' || d.k === 'tri' || d.k === 'ru' || d.k === 'pr' || d.k === 'rot') { sfx.clack(); set({ chip: null }); return; }
      if (d.k === 'hand') { var pts = s.freeDraft || []; set({ freeDraft: null }); if (pts.length > 1) commit(s.strokes.concat([{ k: 'free', pts: pts.map(function (q) { return [fx(q[0]), fx(q[1])]; }), pc: s.pencil, ink: s.ink }])); return; }
      if (d.k === 'draw' || d.k === 'free') {
        var dr = s.draft; set({ draft: null, chip: null }); if (!dr || dist(dr.a, dr.b) < 4) return;
        sfx.tick(700, 0.06); var line = s.line, pen = penOf(s.pencil);
        commit(s.strokes.concat([{ k: 'line', x1: dr.a[0], y1: dr.a[1], x2: dr.b[0], y2: dr.b[1], lt: s.line, pc: s.pencil, ink: s.ink }]), function () {
          if (grid) { var dn = ldone(), cur = curStep(dn), need = LS.lineType(L(), cur); if (need && line !== need) toast(need === 'center' ? 'هذه الخطوة تُرسم بنوع «خط المحور»' : 'هذه الخطوة تُرسم بـ «الخط الظاهر»', 'warn'); else if (dn.extra) toast('أضلاع صحيحة: ' + dn.extra, 'info'); }
          else if (pen[0] === 'm05' && line === 'visible') toast('للخط الظاهر (0.7) استخدم القلم الميكانيكي 0.7', 'warn');
        });
        return;
      }
      if (d.k === 'copen2' || d.k === 'crot') { sfx.clack(); set({ comp: Object.assign({}, s.comp, { stage: 'ready' }) }); return; }
      if (d.k === 'cmove') { var cm = s.comp, c = snap([cm.cx, cm.cy], 14); sfx.clack(); set({ comp: Object.assign({}, cm, { cx: c[0], cy: c[1], stage: 'ready' }) }); return; }
      if (d.k === 'copen') { var co = s.comp; if (!co || co.r < 4) { set({ comp: null }); return; } sfx.tick(1200, 0.12); set({ comp: Object.assign({}, co, { stage: 'ready' }) }); return; }
      if (d.k === 'cdraw') {
        var cp = s.comp; if (Math.abs(d.sw) < 0.04) { set({ comp: Object.assign({}, cp, { stage: 'ready' }) }); return; }
        var sw = Math.abs(d.sw) > 2 * Math.PI - 0.12 ? 2 * Math.PI : d.sw;
        set({ comp: Object.assign({}, cp, { stage: 'ready' }) });
        commit(s.strokes.concat([{ k: 'arc', cx: cp.cx, cy: cp.cy, r: cp.r, a0: d.a0, sw: sw, lt: s.line, pc: s.pencil, ink: s.ink }]), function () { if (!grid) return; var cs = curStep(); var msg = cs >= 0 ? LS.arcFeedback(L(), cs, cp, K) : ''; if (msg) { sfx.err(); toast(msg, 'err'); } });
        return;
      }
      if (d.k === 'dim') { var dm = s.dim; if (!dm || dist(dm.a, dm.b) < 6) { set({ dim: null }); return; } set({ dim: Object.assign({}, dm, { stage: 'off' }) }); toast('حرّك لتحديد مكان خط البُعد ثم اضغط للتثبيت', 'info'); return; }
    }

    /* ---------- static DOM ---------- */
    var railDefs = [['pencil', 'القلم بالأدوات'], ['hand', 'الكتابة باليد'], ['compass', 'الفرجار'], ['dim', 'البُعد'], ['text', 'نص جاهز'], ['eraser', 'الممحاة']];
    var tabsList = grid ? [['steps', 'الخطوات'], ['pens', 'الأقلام'], ['write', 'الكتابة']] : [['pens', 'الأقلام'], ['div', 'التقسيم'], ['write', 'الكتابة']];
    el.innerHTML =
      DL.header({ kicker: grid ? 'الوحدة الثانية · ورقة المربعات · تطبيق موجّه' : 'الوحدة الأولى · لوحة الرسم الخشبية', title: grid ? 'التطبيق بالأدوات خطوة بخطوة' : 'الرسم بالأدوات على لوحة A3',
        actions: '<button class="hb pvbtn" id="bd-pv" type="button" aria-label="منظور للتمرين"><svg viewBox="0 0 24 24"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/></svg><span class="lbl">منظور للتمرين</span></button>' +
          '<button class="hb icon" id="bd-panels" type="button" aria-label="تكبير مساحة الرسم" title="إخفاء/إظهار اللوحات"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16M8 10l2 2-2 2"/></svg></button>' +
          '<button class="hb rec" id="bd-rec" type="button"><span class="dot"></span><span class="lbl">تسجيل الشرح</span></button>' + DL.soundBtn() + DL.fsBtn() +
          '<button class="hb icon" id="bd-undo" type="button" aria-label="تراجع"><svg viewBox="0 0 24 24"><path d="M15 7l4 4-4 4"/><path d="M19 11H9a5 5 0 000 10h2"/></svg></button>' +
          '<button class="hb icon" id="bd-redo" type="button" aria-label="إعادة"><svg viewBox="0 0 24 24"><path d="M9 7l-4 4 4 4"/><path d="M5 11h10a5 5 0 010 10h-2"/></svg></button>' +
          '<button class="hb wide" id="bd-clear" type="button">ورقة جديدة</button>' +
          '<a class="hb primary wide" href="' + (grid ? '#/board' : '#/grid') + '">' + (grid ? 'لوحة A3' : 'ورقة المربعات') + '</a>' }) +
      '<div class="body">' +
      '<nav class="rail" id="bd-rail" aria-label="أدوات الرسم"></nav>' +
      '<main class="center board-center">' +
        '<svg id="bd-svg" class="bsvg" viewBox="0 0 1448 900" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + (grid ? 'ورقة مربعات للرسم بالأدوات' : 'لوحة رسم خشبية عليها ورقة A3') + '">' + defs() + surface() +
        '<g id="L-paper"></g><g id="L-tape"></g><g id="L-given"></g><g id="L-strokes" filter="url(#graphite)"></g><g id="L-draft" filter="url(#graphite)"></g><g id="L-tools"></g><g id="L-top"></g></svg>' +
        '<div class="untaped" id="bd-untaped" hidden>الورقة غير مثبتة — ثبّتها بالشريط اللاصق قبل الرسم</div>' +
        '<div class="status" id="bd-status"></div>' +
        '<button type="button" class="reopen" id="bd-reopen" aria-label="إظهار اللوحات"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg><span>الأدوات</span></button>' +
        '<div class="pvwin" id="bd-pvwin" hidden></div>' +
      '</main>' +
      '<aside class="side side-l bpanel" aria-label="لوحة الخيارات"><div class="seg tabs" id="bd-tabs" role="tablist">' + tabsList.map(function (t) { return '<button type="button" role="tab" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div><div id="bd-panel" class="panel-body"></div></aside>' +
      '</div>' + DL.footer();
    svg = el.querySelector('#bd-svg');
    function defs() {
      return '<defs>' +
        '<filter id="bGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.11" numOctaves="4" seed="11"/><feColorMatrix type="matrix" values="0 0 0 0 0.32  0 0 0 0 0.18  0 0 0 0 0.07  0.9 0 0 0 -0.28"/></filter>' +
        '<filter id="bShadow" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="22" stdDeviation="20" flood-color="#000" flood-opacity=".55"/></filter>' +
        '<filter id="pShadow" x="-5%" y="-5%" width="110%" height="112%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#2A1A0A" flood-opacity=".4"/></filter>' +
        '<filter id="tShadow" x="-15%" y="-25%" width="130%" height="170%"><feDropShadow dx="3" dy="7" stdDeviation="4.5" flood-color="#1A1206" flood-opacity=".38"/></filter>' +
        '<filter id="graphite" filterUnits="userSpaceOnUse" x="0" y="0" width="1448" height="900"><feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.55" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in" result="g"/><feDisplacementMap in="g" in2="n" scale="0.9" xChannelSelector="R" yChannelSelector="G"/></filter>' +
        '<linearGradient id="bWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C9945B"/><stop offset=".5" stop-color="#B98149"/><stop offset="1" stop-color="#A86F3A"/></linearGradient>' +
        '<linearGradient id="bEdge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7B4D24"/><stop offset="1" stop-color="#A06A37"/></linearGradient>' +
        '<linearGradient id="acr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B5D6FF" stop-opacity=".5"/><stop offset=".42" stop-color="#7FB2FF" stop-opacity=".2"/><stop offset=".48" stop-color="#E8F2FF" stop-opacity=".42"/><stop offset=".56" stop-color="#7FB2FF" stop-opacity=".2"/><stop offset="1" stop-color="#B5D6FF" stop-opacity=".42"/></linearGradient>' +
        '<linearGradient id="acrG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A8F2D4" stop-opacity=".5"/><stop offset=".42" stop-color="#4CC79E" stop-opacity=".2"/><stop offset=".48" stop-color="#E6FFF5" stop-opacity=".42"/><stop offset=".56" stop-color="#4CC79E" stop-opacity=".2"/><stop offset="1" stop-color="#A8F2D4" stop-opacity=".42"/></linearGradient>' +
        '<linearGradient id="acrY" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF4C8" stop-opacity=".78"/><stop offset=".5" stop-color="#FFE38A" stop-opacity=".55"/><stop offset="1" stop-color="#F7CF55" stop-opacity=".7"/></linearGradient>' +
        '<linearGradient id="tHead" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#121D42"/><stop offset=".45" stop-color="#2E4689"/><stop offset="1" stop-color="#121D42"/></linearGradient>' +
        '<linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7E899D"/><stop offset=".4" stop-color="#F6F9FD"/><stop offset=".6" stop-color="#C9D1DC"/><stop offset="1" stop-color="#8994A8"/></linearGradient>' +
        '<radialGradient id="screw" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#B7C0CD"/><stop offset="1" stop-color="#5C6678"/></radialGradient>' +
        '<linearGradient id="mech" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5E6879"/><stop offset=".45" stop-color="#E4E9F0"/><stop offset="1" stop-color="#6D7789"/></linearGradient>' +
        '<linearGradient id="bodyG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".4" stop-color="#FFF" stop-opacity=".28"/><stop offset=".55" stop-color="#FFF" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>' +
        '<pattern id="mmH" width="' + K + '" height="20" patternUnits="userSpaceOnUse"><line x1=".35" y1="0" x2=".35" y2="6" stroke="#0B2A66" stroke-width=".6"/></pattern>' +
        '<pattern id="mmB" width="' + K + '" height="20" patternUnits="userSpaceOnUse"><line x1=".35" y1="14" x2=".35" y2="20" stroke="#0B2A66" stroke-width=".6"/></pattern>' +
        '<pattern id="cmH" width="' + K * 10 + '" height="20" patternUnits="userSpaceOnUse"><line x1=".5" y1="0" x2=".5" y2="13" stroke="#0B2A66" stroke-width="1"/><line x1="' + K * 5 + '" y1="0" x2="' + K * 5 + '" y2="9" stroke="#0B2A66" stroke-width=".8"/></pattern>' +
        '<pattern id="mmV" width="20" height="' + K + '" patternUnits="userSpaceOnUse"><line x1="0" y1=".35" x2="6" y2=".35" stroke="#0B2A66" stroke-width=".6"/></pattern>' +
        '<pattern id="cmV" width="20" height="' + K * 10 + '" patternUnits="userSpaceOnUse"><line x1="0" y1=".5" x2="12" y2=".5" stroke="#0B2A66" stroke-width="1"/></pattern>' +
        '<pattern id="g5" width="' + K * 5 + '" height="' + K * 5 + '" patternUnits="userSpaceOnUse" x="194" y="75"><path d="M' + K * 5 + ' 0H0V' + K * 5 + '" fill="none" stroke="#C9DAF0" stroke-width=".7"/></pattern>' +
        '<pattern id="g10" width="' + K * 10 + '" height="' + K * 10 + '" patternUnits="userSpaceOnUse" x="194" y="75"><path d="M' + K * 10 + ' 0H0V' + K * 10 + '" fill="none" stroke="#9FBCE3" stroke-width="1"/></pattern>' +
        '</defs>';
    }
    function surface() {
      if (grid) return '<rect x="44" y="40" width="1360" height="820" rx="18" fill="#132447"/>';
      return '<g filter="url(#bShadow)"><rect x="44" y="40" width="1360" height="820" rx="10" fill="url(#bWood)"/></g><rect x="44" y="40" width="1360" height="820" rx="10" filter="url(#bGrain)"/><rect x="44" y="40" width="14" height="820" rx="6" fill="url(#bEdge)"/><rect x="44" y="40" width="1360" height="820" rx="10" fill="none" stroke="#6E441E" stroke-width="2"/>';
    }
    function paperSvg() {
      var o = '<g transform="' + (s.taped || grid ? '' : 'rotate(-0.7 724 450)') + '"><g filter="url(#pShadow)"><rect x="194" y="75" width="1060" height="750" fill="#FCFCF8"/></g>';
      if (grid) o += '<rect x="194" y="75" width="1060" height="750" fill="url(#g5)"/><rect x="194" y="75" width="1060" height="750" fill="url(#g10)"/><rect x="194" y="75" width="1060" height="34" fill="#FCFCF8" fill-opacity=".92"/><text x="1240" y="98" text-anchor="end" font-size="15" fill="#33476B">ورقة عمل — مربعات 5 مم · الاسم: ...................</text>';
      else o += '<rect x="219.2" y="100.2" width="1009.6" height="699.6" fill="none" stroke="#1A1A1A" stroke-width="1.8"/><g stroke="#1A1A1A" stroke-width="1.1" fill="none"><rect x="775" y="739" width="454" height="61"/><line x1="775" y1="759.3" x2="1229" y2="759.3"/><line x1="775" y1="779.6" x2="1229" y2="779.6"/><line x1="1089" y1="739" x2="1089" y2="800"/><line x1="919" y1="739" x2="919" y2="800"/></g><g font-size="11.5" fill="#222"><text x="1223" y="753.5" text-anchor="end">المدرسة: مركز التدريب</text><text x="1223" y="773.8" text-anchor="end">الاسم:</text><text x="1223" y="794" text-anchor="end">الصف:          الشعبة:</text><text x="1083" y="753.5" text-anchor="end">التاريخ:</text><text x="1083" y="773.8" text-anchor="end">رقم اللوحة:</text><text x="1083" y="794" text-anchor="end">نوع الأبعاد: مم</text><text x="913" y="753.5" text-anchor="end">مقياس الرسم: 1:1</text><text x="913" y="773.8" text-anchor="end">خاص بالمعلم:</text></g>';
      return o + '</g>';
    }
    function tapeSvg() { return s.taped && !grid ? '<g class="fadein" fill="#EDE3C8" fill-opacity=".86" stroke="#D5C7A2" stroke-width=".8"><rect x="166" y="62" width="70" height="26" transform="rotate(-38 201 75)"/><rect x="1212" y="62" width="70" height="26" transform="rotate(38 1247 75)"/><rect x="166" y="812" width="70" height="26" transform="rotate(38 201 825)"/><rect x="1212" y="812" width="70" height="26" transform="rotate(-38 1247 825)"/></g>' : ''; }

    /* ---------- dynamic SVG ---------- */
    function strokeSvg(x) {
      if (x.k === 'line') { var st = lineStyle(x.lt, x.pc, K, x.ink); return '<line x1="' + fx(x.x1) + '" y1="' + fx(x.y1) + '" x2="' + fx(x.x2) + '" y2="' + fx(x.y2) + '" stroke="' + st.col + '" stroke-width="' + st.w + '"' + (st.dash !== 'none' ? ' stroke-dasharray="' + st.dash + '"' : '') + ' stroke-linecap="round"' + (x.anim ? ' class="' + (st.dash === 'none' ? 'drawin' : 'fadein') + '"' : '') + '/>'; }
      if (x.k === 'arc') { var sa = lineStyle(x.lt, x.pc, K, x.ink); return '<path d="' + arcD(x.cx, x.cy, x.r, x.a0, x.sw) + '" fill="none" stroke="' + sa.col + '" stroke-width="' + sa.w + '"' + (sa.dash !== 'none' ? ' stroke-dasharray="' + sa.dash + '"' : '') + ' stroke-linecap="round"' + (x.anim ? ' class="' + (sa.dash === 'none' ? 'drawin' : 'fadein') + '"' : '') + '/>'; }
      if (x.k === 'dim' || x.k === 'dia') { var g = x.k === 'dim' ? dimGeo(x) : diaGeo(x), col = x.ink || 'rgba(38,42,50,.92)'; return '<g><path d="' + g.lines + '" fill="none" stroke="' + col + '" stroke-width="' + fx(Math.max(0.6, 0.3 * K)) + '"/><path d="' + g.arrows + '" fill="' + col + '"/><text transform="' + g.tt + '" text-anchor="middle" class="hand" font-size="' + fx(4.2 * K) + '" fill="' + col + '">' + esc(g.t) + '</text></g>'; }
      if (x.k === 'text') return '<text x="' + fx(x.x) + '" y="' + fx(x.y) + '" text-anchor="middle" class="hand" font-size="' + fx(x.fs * K * 1.15) + '" fill="' + (x.ink || penOf(x.pc)[5]) + '">' + esc(x.t) + '</text>';
      if (x.k === 'free') return '<path d="' + freeD(x.pts) + '" fill="none" stroke="' + (x.ink || penOf(x.pc)[5]) + '" stroke-width="' + fx(Math.max(0.7, 0.45 * K * pfOf(x.pc))) + '" stroke-linecap="round" stroke-linejoin="round"/>';
      return '';
    }
    function compassSvg(cp) {
      var g = cgeo(cp), c = g.c, P = g.P, H = g.H, ax = g.ax, act = s.tool === 'compass' && !s.demo;
      function leg(A, B, wa, wb) { var dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy) || 1, n = [-dy / l, dx / l]; return 'M' + fx(A[0] + n[0] * wa) + ' ' + fx(A[1] + n[1] * wa) + 'L' + fx(B[0] + n[0] * wb) + ' ' + fx(B[1] + n[1] * wb) + 'L' + fx(B[0] - n[0] * wb) + ' ' + fx(B[1] - n[1] * wb) + 'L' + fx(A[0] - n[0] * wa) + ' ' + fx(A[1] - n[1] * wa) + 'Z'; }
      function lerp(A, B, t) { return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t]; }
      var N1 = lerp(H, c, 0.9), N2 = lerp(H, P, 0.78), N3 = lerp(H, P, 0.94), Kj = lerp(H, c, 0.45), G0 = [H[0] + ax[0] * 18, H[1] + ax[1] * 18], G1 = [H[0] + ax[0] * 84, H[1] + ax[1] * 84], kn = '';
      for (var i = 0; i < 8; i++) { var q = lerp(G0, G1, 0.12 + i * 0.1), pn = [-ax[1] * 12, ax[0] * 12]; kn += 'M' + fx(q[0] + pn[0]) + ' ' + fx(q[1] + pn[1]) + 'L' + fx(q[0] - pn[0]) + ' ' + fx(q[1] - pn[1]); }
      var mm = Math.round(cp.r / K * 10) / 10, lab = g.lab, F = g.F;
      return '<g filter="url(#tShadow)">' +
        '<path d="' + leg(H, N1, 9, 4) + '" fill="url(#metal)" stroke="#5E697C" stroke-width=".9" stroke-linejoin="round"/>' +
        '<path d="' + leg(H, N2, 9, 5.5) + '" fill="url(#metal)" stroke="#5E697C" stroke-width=".9" stroke-linejoin="round"/>' +
        '<path d="' + leg(N1, c, 2.4, 0.4) + '" fill="#3B4250"/><path d="' + leg(N2, N3, 7, 6) + '" fill="#26304A"/><path d="' + leg(N3, P, 2.2, 0.5) + '" fill="#111"/>' +
        '<circle cx="' + fx(Kj[0]) + '" cy="' + fx(Kj[1]) + '" r="5" fill="url(#screw)"/>' +
        '<path d="' + leg(G0, G1, 13, 12) + '" fill="#2F7BEF" stroke="#1B4FA8" stroke-width="1"/><path d="' + kn + '" stroke="#1B4FA8" stroke-width="1.6"/>' +
        '<circle cx="' + fx(H[0]) + '" cy="' + fx(H[1]) + '" r="22" fill="url(#metal)" stroke="#5E697C" stroke-width="1.2"/><circle cx="' + fx(H[0]) + '" cy="' + fx(H[1]) + '" r="8" fill="#4F5A6E"/>' +
        '<circle cx="' + fx(g.Kn[0]) + '" cy="' + fx(g.Kn[1]) + '" r="9" fill="url(#screw)" stroke="' + (act ? '#F2C94C' : '#5E697C') + '" stroke-width="' + (act ? 2.5 : 1) + '"/></g>' +
        (act ? '<circle cx="' + fx(P[0]) + '" cy="' + fx(P[1]) + '" r="15" fill="rgba(227,20,27,.12)" stroke="#E3141B" stroke-width="2" stroke-dasharray="5 4"/>' : '') +
        '<g class="mono" pointer-events="none"><rect x="' + fx(lab[0] - 59) + '" y="' + fx(lab[1] - 15) + '" width="118" height="30" rx="9" fill="#0A1630" fill-opacity=".92"/><text x="' + fx(lab[0]) + '" y="' + fx(lab[1] + 6) + '" text-anchor="middle" fill="#FFFFFF" font-size="14" font-weight="600">R = ' + mm + ' mm</text></g>' +
        (act ? '<g transform="translate(' + fx(F[0]) + ' ' + fx(F[1]) + ')"><circle r="19" fill="#FFFFFF" fill-opacity=".95" stroke="#2F7BEF" stroke-width="2"/><path d="M-4 -9V8l-4 -4M4 9V-8l4 4" fill="none" stroke="#1B4FA8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><title>اقلب الفرجار فوق / تحت</title></g>' +
          '<g transform="translate(' + fx(g.F2[0]) + ' ' + fx(g.F2[1]) + ')"><circle r="19" fill="#FFFFFF" fill-opacity=".95" stroke="#E07B00" stroke-width="2"/><path d="M-9 -4H8l-4 -4M9 4H-8l4 4" fill="none" stroke="#B35F00" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><title>اقلب الفرجار يمين / شمال</title></g>' : '');
    }
    function triSvg(id) {
      var P = pose(id), T = s[id], w = P.w, h = P.h, ins = id === 't45' ? 26 : 24;
      var iw = w - ins - ins * (w / h + Math.sqrt(1 + (w / h) * (w / h))), ih = h - ins - ins * (h / w + Math.sqrt(1 + (h / w) * (h / w)));
      var inner = iw > 20 && ih > 20 ? 'M' + ins + ' ' + (-ins) + 'L' + fx(ins + iw) + ' ' + (-ins) + 'L' + ins + ' ' + fx(-ins - ih) + 'Z' : '';
      var angs = id === 't45' ? ['45°', '45°'] : (T.orient === '30' ? ['30°', '60°'] : ['60°', '30°']), ink = id === 't45' ? '#0B2A66' : '#0E4D38';
      function lbl(x, y, t) { return '<g transform="translate(' + fx(x) + ' ' + fx(y) + ') scale(' + P.sx + ' 1)"><text text-anchor="middle" class="mono" font-size="15" font-weight="600" fill="' + ink + '">' + t + '</text></g>'; }
      return '<g transform="translate(' + fx(P.x) + ' ' + fx(P.y) + ') rotate(' + fx(P.rot) + ') scale(' + P.sx + ' 1)" filter="url(#tShadow)">' +
        '<path d="M0 0L' + w + ' 0L0 ' + (-h) + 'Z' + inner + '" fill="' + (id === 't45' ? 'url(#acr)' : 'url(#acrG)') + '" fill-rule="evenodd" stroke="' + (id === 't45' ? '#D2E5FF' : '#C9F5E2') + '" stroke-width="1.4" stroke-linejoin="round"/>' +
        '<path d="M3 -3L' + fx(w - 8) + ' -3M3 -3L3 ' + fx(-h + 8) + '" fill="none" stroke="#FFFFFF" stroke-opacity=".55" stroke-width="1"/>' +
        '<rect x="2" y="-20" width="' + fx(w * 0.7) + '" height="20" fill="url(#mmB)"/><rect x="0" y="' + fx(-h * 0.72) + '" width="9" height="' + fx(h * 0.7) + '" fill="url(#mmV)"/><rect x="0" y="' + fx(-h * 0.72) + '" width="14" height="' + fx(h * 0.7) + '" fill="url(#cmV)"/>' +
        lbl(w - 64, -12, angs[0]) + lbl(18, -h + 70, angs[1]) + lbl(44, -32, '90°') + (grid ? '<g transform="translate(30 -30)">' + HANDLE + '</g>' : '') + '</g>';
    }
    function rulerSvg() {
      var P = pose('ru'), nums = ''; for (var i = 0; i <= 20; i++) nums += '<text x="' + fx(20 + i * 10 * K + 0.5) + '" y="28" text-anchor="middle" class="mono" font-size="12" fill="#3D2E00">' + i + '</text>';
      return '<g transform="translate(' + fx(P.x) + ' ' + fx(P.y) + ') rotate(' + fx(P.rot) + ')" filter="url(#tShadow)"><rect x="0" y="0" width="' + P.w + '" height="' + P.h + '" rx="4" fill="url(#acrY)" stroke="#D9B23E" stroke-width="1.2"/><rect x="0" y="0" width="' + P.w + '" height="3" fill="#FFFFFF" fill-opacity=".6"/><rect x="20" y="0" width="' + fx(200 * K) + '" height="9" fill="url(#mmH)"/><rect x="20" y="0" width="' + fx(200 * K) + '" height="15" fill="url(#cmH)"/>' + nums + '<text x="' + fx(P.w / 2 - 40) + '" y="' + fx(P.h - 12) + '" class="mono" font-size="11" fill="#7A5E10" letter-spacing="2">20 cm · mm</text><g transform="translate(' + fx(P.w - 34) + ' ' + fx(P.h / 2) + ')">' + HANDLE + '</g></g>';
    }
    var protTicks = null;
    function protSvg() {
      var P = pose('pr'), R = P.R, ri = R * 0.42;
      if (!protTicks) { protTicks = ''; for (var a = 0; a <= 180; a++) { var Lt = a % 10 === 0 ? 16 : (a % 5 === 0 ? 11 : 6), t = Math.PI - a * Math.PI / 180, c = Math.cos(t), sn = -Math.sin(t); protTicks += 'M' + fx(c * R) + ' ' + fx(sn * R) + 'L' + fx(c * (R - Lt)) + ' ' + fx(sn * (R - Lt)); } }
      var nums = ''; for (var b = 0; b <= 180; b += 10) { var tt = Math.PI - b * Math.PI / 180; nums += '<text x="' + fx(Math.cos(tt) * (R - 28)) + '" y="' + fx(-Math.sin(tt) * (R - 28) + 4) + '" text-anchor="middle" class="mono" font-size="' + (grid ? 11 : 9) + '" fill="#0B2A66">' + b + '</text>'; }
      return '<g transform="translate(' + fx(P.x) + ' ' + fx(P.y) + ') rotate(' + fx(P.rot) + ')" filter="url(#tShadow)"><path d="M' + (-R) + ' 0A' + R + ' ' + R + ' 0 0 1 ' + R + ' 0Z M' + fx(-ri) + ' -8A' + fx(ri) + ' ' + fx(ri) + ' 0 0 1 ' + fx(ri) + ' -8Z" fill="url(#acr)" fill-rule="evenodd" stroke="#D2E5FF" stroke-width="1.2"/><path d="' + protTicks + '" stroke="#0B2A66" stroke-width=".7"/>' + nums + '<line x1="0" y1="-8" x2="0" y2="8" stroke="#E3141B"/><line x1="-8" y1="0" x2="8" y2="0" stroke="#E3141B"/>' + (grid ? '<g transform="translate(0 ' + fx(-R * 0.62) + ')">' + HANDLE + '</g>' : '') + '</g>';
    }
    function tsqSvg() {
      var nums = ''; for (var i = 0; i < 10; i++) nums += '<text x="' + fx(70 + i * 50 * K + 0.5) + '" y="26" text-anchor="middle">' + i * 50 + '</text>';
      return '<g transform="translate(0 ' + fx(s.tY) + ')"><g filter="url(#tShadow)"><rect x="34" y="0" width="1310" height="46" rx="3" fill="url(#acr)" stroke="#D2E5FF" stroke-opacity=".9" stroke-width="1.2"/><rect x="34" y="0" width="1310" height="3" fill="#FFFFFF" fill-opacity=".55"/><rect x="70" y="0.5" width="1262" height="8" fill="url(#mmH)"/><rect x="70" y="0.5" width="1262" height="14" fill="url(#cmH)"/><line x1="36" y1="44" x2="1342" y2="44" stroke="#FFFFFF" stroke-opacity=".35"/></g>' +
        '<g class="mono" font-size="10" fill="#0B2A66">' + nums + '</g><g filter="url(#tShadow)"><rect x="18" y="-74" width="46" height="194" rx="8" fill="url(#tHead)" stroke="#3E5BA0"/><rect x="56" y="-74" width="8" height="194" fill="#0A1230" opacity=".55"/><circle cx="41" cy="-46" r="7" fill="url(#screw)"/><line x1="36" y1="-46" x2="46" y2="-46" stroke="#4A5466" stroke-width="1.6"/><circle cx="41" cy="92" r="7" fill="url(#screw)"/><line x1="36" y1="92" x2="46" y2="92" stroke="#4A5466" stroke-width="1.6"/><text x="41" y="23" text-anchor="middle" transform="rotate(-90 41 23)" class="mono" font-size="11" fill="#9FB6E8" letter-spacing="3">T-60</text></g></g>';
    }
    function pencilSvg(at) {
      var P = penOf(s.pencil);
      var body = P[6]
        ? '<path d="M0 0L-1.2 -7H1.2Z" fill="#1A1A1A"/><path d="M-1.6 -7L-4 -16H4L1.6 -7Z" fill="url(#mech)"/><rect x="-6" y="-66" width="12" height="50" rx="3" fill="#2A2F38"/><path d="M-6 -60H6M-6 -54H6M-6 -48H6M-6 -42H6M-6 -36H6M-6 -30H6M-6 -24H6" stroke="#4A5160" stroke-width="1.2"/><rect x="-7" y="-160" width="14" height="96" rx="4" fill="' + P[4] + '"/><rect x="-7" y="-160" width="14" height="96" rx="4" fill="url(#bodyG)"/><rect x="-5.5" y="-182" width="11" height="24" rx="3" fill="url(#mech)"/><rect x="5" y="-176" width="3" height="46" rx="1.5" fill="url(#mech)"/><text x="0" y="-100" text-anchor="middle" transform="rotate(-90 0 -100)" class="mono" font-size="8.5" font-weight="600" fill="#FFFFFF">' + P[3] + '</text>'
        : '<path d="M0 0L-1.6 -7H1.6Z" fill="#1E1E1E"/><path d="M-1.6 -7L-7 -26H7L1.6 -7Z" fill="#E6C595"/><rect x="-7" y="-178" width="14" height="152" fill="' + P[4] + '"/><rect x="-7" y="-178" width="14" height="152" fill="url(#bodyG)"/><rect x="-7.4" y="-192" width="14.8" height="16" fill="url(#mech)"/><rect x="-6.6" y="-204" width="13.2" height="13" rx="3" fill="#E9A1A1"/><text x="0" y="-110" text-anchor="middle" transform="rotate(-90 0 -110)" class="mono" font-size="9" font-weight="600" fill="#F2C94C">' + P[3] + '</text>';
      return '<g transform="translate(' + fx(at[0]) + ' ' + fx(at[1]) + ') rotate(34)" filter="url(#tShadow)" pointer-events="none">' + body + '</g>';
    }
    var cache = {};
    function setL(id, html) { if (cache[id] === html) return; cache[id] = html; var n = el.querySelector('#' + id); if (n) n.innerHTML = html; }
    function render() {
      if (!alive) return;
      setL('L-paper', paperSvg()); setL('L-tape', tapeSvg());
      el.querySelector('#bd-untaped').hidden = s.taped || grid;
      // given + ghost
      var gv = '';
      if (grid) {
        var Gs = L(), G = Gs.given, cur = curStep();
        if (s.showHint && cur >= 0 && !s.demo) gv += '<path d="' + LS.ghost(Gs, cur) + '" fill="none" stroke="#2F7BEF" stroke-width="2.2" stroke-dasharray="6 6" opacity=".6"/>';
        G.circles.forEach(function (c) { gv += '<path d="' + arcD(c[0][0], c[0][1], c[1] * K, 0, 2 * Math.PI) + '" fill="none" stroke="#1A1D24" stroke-width="2.2"/>'; });
        G.segs.forEach(function (sg) { gv += '<line x1="' + fx(sg[0][0]) + '" y1="' + fx(sg[0][1]) + '" x2="' + fx(sg[1][0]) + '" y2="' + fx(sg[1][1]) + '" stroke="#1A1D24" stroke-width="2.4" stroke-linecap="round"/>'; });
        G.pts.forEach(function (q) { var c = q[0]; gv += '<path d="M' + fx(c[0] - 6) + ' ' + fx(c[1] - 6) + 'L' + fx(c[0] + 6) + ' ' + fx(c[1] + 6) + 'M' + fx(c[0] + 6) + ' ' + fx(c[1] - 6) + 'L' + fx(c[0] - 6) + ' ' + fx(c[1] + 6) + '" stroke="#E3141B" stroke-width="1.6"/>'; if (q[1]) gv += '<text x="' + fx(c[0] + (q[2] || 10)) + '" y="' + fx(c[1] + (q[3] || -10)) + '" font-size="22" font-weight="700" fill="#C0392B" class="kufi">' + q[1] + '</text>'; });
      }
      setL('L-given', gv);
      setL('L-strokes', s.strokes.map(strokeSvg).join(''));
      var dr = '';
      if (s.draft) dr += strokeSvg({ k: 'line', x1: s.draft.a[0], y1: s.draft.a[1], x2: s.draft.b[0], y2: s.draft.b[1], lt: s.draft.lt, pc: s.draft.pc, ink: s.demo ? '' : s.ink });
      if (s.freeDraft) dr += strokeSvg({ k: 'free', pts: s.freeDraft, pc: s.pencil, ink: s.ink });
      if (s.comp && s.comp.stage === 'draw' && s.comp.sw) dr += strokeSvg({ k: 'arc', cx: s.comp.cx, cy: s.comp.cy, r: s.comp.r, a0: s.comp.a0, sw: s.comp.sw, lt: s.demo ? 'visible' : s.line, pc: s.demo ? 'h' : s.pencil, ink: s.demo ? '' : s.ink });
      if (s.dim && dist(s.dim.a, s.dim.b) > 4) dr += strokeSvg(Object.assign({ k: 'dim' }, s.dim));
      setL('L-draft', dr);
      var tl = '';
      if (s.pr.show) tl += protSvg();
      if (grid && s.ru.show) tl += rulerSvg();
      ['t45', 't3060'].forEach(function (id) { if (s[id].show) tl += triSvg(id); });
      if (!grid) tl += tsqSvg();
      if (s.comp && (s.tool === 'compass' || s.demo)) tl += compassSvg(s.comp);
      var at = s.draft ? s.draft.b : (s.freeDraft ? s.freeDraft[s.freeDraft.length - 1] : (s.hover && (s.tool === 'pencil' || s.tool === 'hand') && !drag ? s.hover : null));
      if (at && !(s.tool === 'compass')) tl += pencilSvg(at);
      setL('L-tools', tl);
      var top = '';
      if (s.chip) { var cw = Math.max(84, s.chip.t.length * 10 + 24); top += '<g pointer-events="none"><rect x="' + fx(s.chip.p[0]) + '" y="' + fx(s.chip.p[1]) + '" width="' + cw + '" height="34" rx="10" fill="#0A1630" fill-opacity=".94" stroke="#5E9BFF" stroke-opacity=".5"/><text x="' + fx(s.chip.p[0] + cw / 2) + '" y="' + fx(s.chip.p[1] + 23) + '" text-anchor="middle" class="mono" font-size="16" font-weight="600" fill="#FFFFFF">' + s.chip.t + '</text></g>'; }
      setL('L-top', top);
      renderRail(); renderPanel(); renderStatus();
      var rec = el.querySelector('#bd-rec'); rec.classList.toggle('on', s.rec); rec.querySelector('.lbl').textContent = s.rec ? 'جارٍ التسجيل…' : 'تسجيل الشرح';
    }
    function renderRail() {
      var h = railDefs.map(function (t) { return '<button type="button" class="rbtn' + (s.tool === t[0] ? ' on' : '') + '" data-tool="' + t[0] + '" aria-pressed="' + (s.tool === t[0]) + '" aria-label="' + t[1] + '"><svg viewBox="0 0 32 32"><path d="' + ICON[t[0]] + '"/></svg><span>' + t[1] + '</span></button>'; }).join('') + '<span class="rsep"></span>';
      function tog(id, label, icon, on) { return '<button type="button" class="rbtn tog' + (on ? ' on' : '') + '" data-tog="' + id + '" aria-pressed="' + !!on + '" aria-label="' + label + '"><svg viewBox="0 0 32 32"><path d="' + icon + '"/></svg><span>' + label + '</span></button>'; }
      if (grid) h += tog('ru', 'المسطرة', ICON.ruler, s.ru.show);
      h += tog('t45', 'مثلث 45°', ICON.t45, s.t45.show) + tog('t3060', 'مثلث 30/60°', ICON.t3060, s.t3060.show) + tog('flip', 'قلب المثلث', ICON.flip, false) + tog('orient', s.t3060.orient === '30' ? 'تدوير 30/60' : 'تدوير 60/30', ICON.orient, false);
      if (!grid) h += tog('combine', 'تركيب المثلثين', ICON.combine, s.t3060.mode === 'on45');
      h += tog('pr', 'المنقلة', ICON.prot, s.pr.show);
      if (!grid) h += tog('tape', 'الشريط اللاصق', ICON.tape, s.taped);
      setL2('bd-rail', h);
    }
    function setL2(id, html) { if (cache[id] === html) return; cache[id] = html; el.querySelector('#' + id).innerHTML = html; }
    function renderPanel() {
      Array.prototype.forEach.call(el.querySelectorAll('#bd-tabs button'), function (b) { var on = b.getAttribute('data-tab') === s.tab; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); });
      var h = '';
      if (s.tab === 'pens') {
        h += '<div class="ptitle">لون الخط</div><div class="swatches">' + COLORS.map(function (c) { return '<button type="button" class="swb' + (s.ink === c[0] ? ' on' : '') + '" data-ink="' + c[0] + '" aria-label="' + c[1] + '" title="' + c[1] + '"><span style="background:' + c[2] + '"></span></button>'; }).join('') + '</div>';
        h += '<div class="ptitle">أقلام الرصاص</div><div class="penlist">' + PENS.map(function (p) { return '<button type="button" class="item' + (s.pencil === p[0] ? ' on' : '') + '" data-pen="' + p[0] + '"><svg class="pensw" viewBox="0 0 104 20"><path d="M2 10L18 4V16Z" fill="#E7C79A"/><path d="M2 10L7 8.1V11.9Z" fill="#2A2A2A"/><rect x="18" y="4" width="78" height="12" rx="1.5" fill="' + p[4] + '"/><rect x="94" y="4" width="8" height="12" rx="1.5" fill="#C9CFD8"/></svg><span class="it-t"><b>' + p[1] + '</b><small>' + p[2] + '</small></span><svg class="thk" viewBox="0 0 54 16" aria-hidden="true"><path d="M3 10C14 4 24 13 36 7S48 6 51 8" fill="none" stroke="' + p[5] + '" stroke-width="' + fx(3.2 * pfOf(p[0])) + '" stroke-linecap="round"/></svg><span class="code">' + p[3] + '</span></button>'; }).join('') + '</div>';
        h += '<div class="ptitle">نوع الخط <span class="muted">جدول (2-1)</span></div><div class="linelist">' + LTYPES.map(function (l) { return '<button type="button" class="item' + (s.line === l[0] ? ' on' : '') + '" data-line="' + l[0] + '"><span class="it-n">' + l[1] + '</span><svg class="linesw" viewBox="0 0 90 12"><line x1="2" y1="6" x2="88" y2="6" stroke="' + l[4] + '" stroke-width="' + fx(Math.max(0.6, l[2] * 4.4 * pfOf(s.pencil))) + '"' + (l[3] ? ' stroke-dasharray="' + l[3].split(' ').map(function (n) { return n * 3; }).join(' ') + '"' : '') + '/></svg><span class="code small">' + l[2] + '</span></button>'; }).join('') + '</div>';
      } else if (s.tab === 'div') {
        var d = s.dv;
        h += '<div class="ptitle">تقسيم لوحة الرسم ' + (grid ? 'A4' : 'A3') + '</div><div class="grid2">' +
          [['L', 'طول المسقط الأمامي'], ['W', 'عرض المسقط الجانبي'], ['H', 'ارتفاع المسقط الأمامي'], ['T', 'عرض المسقط الأفقي']].map(function (f) { return '<label class="lab">' + f[1] + '<input class="bin" type="number" inputmode="decimal" data-dv="' + f[0] + '" value="' + esc(d[f[0]]) + '"></label>'; }).join('') + '</div>' +
          '<div class="calc">' + calcHtml() + '</div>' +
          '<button type="button" class="btn primary" data-act="div">ارسم خطوط التقسيم واكتب المقاسات (قلم H)</button>';
      } else if (s.tab === 'steps') {
        var Ls = L(), dn = ldone(), cur = curStep(dn), groups = [];
        LS.list.forEach(function (x) { if (groups.indexOf(x.group) < 0) groups.push(x.group); });
        h += '<label class="lab">اختر الإنشاء الهندسي<select class="bin lsel" data-lsel="1">' + groups.map(function (g) { return '<optgroup label="' + g + '">' + LS.list.filter(function (x) { return x.group === g; }).map(function (x) { return '<option value="' + x.i + '"' + (x.i === s.lesson ? ' selected' : '') + '>' + (x.i + 1) + '. ' + x.short + '</option>'; }).join('') + '</optgroup>'; }).join('') + '</select></label>';
        h += '<div class="lnav"><button type="button" class="chipbtn" data-lnav="-1" aria-label="السابق">→ السابق</button><span class="muted small">' + (s.lesson + 1) + ' / ' + LS.list.length + '</span><button type="button" class="chipbtn" data-lnav="1" aria-label="التالي">التالي ←</button></div>';
        h += '<div class="ptitle">' + Ls.title + '</div><div class="given">' + Ls.given.text + '</div>';
        h += '<div class="seg small phases"><button type="button" data-phase="explain" class="' + (s.phase === 'explain' ? 'on' : '') + '">١ · شرح الخطوات</button><button type="button" data-phase="practice" class="' + (s.phase === 'practice' ? 'on' : '') + '">٢ · التنفيذ بيدك</button></div>';
        if (s.phase === 'explain') {
          h += '<div class="steps all">' + Ls.steps.map(function (x, i) { var c = s.demo && s.demoAt === i; return '<div class="step' + (c ? ' cur' : '') + (s.demo && s.demoAt > i ? ' done' : '') + '"><span class="badge">' + (i + 1) + '</span><span class="st"><b>' + x.title + '</b><small>' + x.text + '</small></span></div>'; }).join('') + '</div>' +
            (s.demo ? '<button type="button" class="btn" data-act="stop">إيقاف الشرح</button>' : '<button type="button" class="btn primary" data-act="demoall">▶ شاهد الشرح كاملًا على الورقة</button>') +
            '<button type="button" class="btn ok" data-act="practice">ابدأ التنفيذ بنفسك ←</button>';
        } else {
          h += '<div class="steps">' + Ls.steps.map(function (x, i) { var done = dn[i], c = i === cur; return '<div class="step' + (done ? ' done' : '') + (c ? ' cur' : '') + '"><span class="badge">' + (done ? '✓' : i + 1) + '</span><span class="st"><b>' + x.title + (c && dn.extra ? ' (' + dn.extra + ')' : '') + '</b><small>' + x.text + '</small></span></div>'; }).join('') + '</div>' +
            (cur < 0 ? '<div class="donebox">ممتاز! أكملت الإنشاء بنجاح ✓</div>' : '') +
            '<div class="row2"><button type="button" class="btn" data-act="hint">' + (s.showHint ? 'إخفاء التلميح' : 'إظهار التلميح') + '</button><button type="button" class="btn primary" data-act="demo"' + (cur < 0 || s.demo ? ' disabled' : '') + '>' + (cur < 0 ? 'اكتمل التمرين' : 'ارسم الخطوة ' + (cur + 1) + ' أمامي') + '</button></div>' +
            '<button type="button" class="btn ghost" data-act="reset">ابدأ التمرين من جديد</button>';
        }
      } else if (s.tab === 'write') {
        h += '<div class="ptitle">الكتابة باليد</div><div class="help">اختر «الكتابة باليد» من الأدوات واكتب بإصبعك أو بالقلم على الورقة: الأبعاد، الحروف، أسماء المساقط — بنفس قلم الرصاص المختار.</div>' +
          '<button type="button" class="btn primary" data-act="hand">ابدأ الكتابة باليد</button>' +
          '<div class="ptitle">نص جاهز بخط هندسي</div><label class="lab">النص (اضغط على الورقة لكتابته)<input class="bin txt" type="text" data-text="1" value="' + esc(s.text) + '"></label>' +
          '<div class="chips">' + ['مسقط أمامي', 'مسقط جانبي', 'مسقط أفقي', 'مقياس 1:1', 'أ', 'ب'].map(function (t) { return '<button type="button" class="chipbtn" data-chip="' + t + '">' + t + '</button>'; }).join('') + '</div>' +
          '<div class="rowc"><span class="muted">حجم الخط</span>' + [3.5, 5, 7].map(function (v) { return '<button type="button" class="chipbtn' + (s.tsize === v ? ' on' : '') + '" data-tsize="' + v + '">' + v + ' مم</button>'; }).join('') + '</div>' +
          '<div class="ptitle">الأبعاد التلقائية</div><div class="help">أداة «البُعد»: اسحب من نقطة لنقطة، ثم حرّك لتحديد مكان خط البُعد واضغط للتثبيت. اضغط على دائرة لكتابة القطر.</div>' +
          '<div class="rowc"><button type="button" class="chipbtn" data-pfx="Ø">إضافة Ø</button><button type="button" class="chipbtn" data-pfx="R">إضافة R</button><button type="button" class="chipbtn" data-pfx="">رقم فقط</button></div>';
      }
      h += '<button type="button" class="btn assist' + (s.assist ? ' on' : '') + '" data-act="assist">' + (s.assist ? 'الوضع المساعد: يعمل (خطوط حرة بالسحب)' : 'الوضع الواقعي: الرسم بالأدوات فقط') + '</button>';
      var pb = el.querySelector('#bd-panel'); var key = 'P' + h; if (cache.panel !== key) { var foc = document.activeElement, fk = foc && foc.getAttribute && (foc.getAttribute('data-dv') || foc.getAttribute('data-text')); if (fk && pb.contains(foc)) return; cache.panel = key; pb.innerHTML = h; }
    }
    function calcHtml() {
      var pm = C.paperMM, d = s.dv, Lm = +d.L || 0, Wm = +d.W || 0, Hm = +d.H || 0, Tm = +d.T || 0; function r1(v) { return Math.round(v * 10) / 10; }
      return '<span class="accent">تقسيم الطول</span><span>١) ' + Lm + ' + ' + Wm + ' = ' + (Lm + Wm) + '</span><span>٢) ' + pm[0] + ' − ' + (Lm + Wm) + ' = ' + (pm[0] - Lm - Wm) + '</span><span class="ok">٣) ' + (pm[0] - Lm - Wm) + ' ÷ 3 = ' + r1((pm[0] - Lm - Wm) / 3) + ' مم</span>' +
        '<span class="accent">تقسيم العرض</span><span>١) ' + Hm + ' + ' + Tm + ' = ' + (Hm + Tm) + '</span><span>٢) ' + pm[1] + ' − ' + (Hm + Tm) + ' = ' + (pm[1] - Hm - Tm) + '</span><span class="ok">٣) ' + (pm[1] - Hm - Tm) + ' ÷ 3 = ' + r1((pm[1] - Hm - Tm) / 3) + ' مم</span>';
    }
    function renderStatus() {
      var pen = penOf(s.pencil), ln = (LTYPES.find(function (l) { return l[0] === s.line; }) || LTYPES[0])[1];
      var last = s.strokes.slice().reverse().find(function (x) { return x.k === 'line'; });
      var a = grid ? 'زاوية المسطرة: ' + (((Math.round(s.ru.rot) % 360) + 360) % 360) + '°' : 'مسطرة T: ' + Math.round((s.tY - PX.y) / K) + ' مم من حافة الورقة';
      setL2('bd-status', '<span>' + a + '</span><span>القلم: <b>' + pen[1] + ' ' + pen[3] + '</b></span><span>الخط: <b>' + ln + '</b></span><span>اللون: <b style="color:' + ((COLORS.find(function (c) { return c[0] === s.ink; }) || COLORS[0])[2]) + '">' + ((COLORS.find(function (c) { return c[0] === s.ink; }) || COLORS[0])[1]) + '</b></span>' + (last ? '<span>آخر خط: <b class="mono">' + Math.round(Math.hypot(last.x2 - last.x1, last.y2 - last.y1) / K * 10) / 10 + ' مم</b></span>' : ''));
    }
    /* ---------- UI events ---------- */
    function setPfx(p) { var i = s.lastDim; if (i < 0 || !s.strokes[i] || (s.strokes[i].k !== 'dim' && s.strokes[i].k !== 'dia')) { toast('ارسم بُعدًا أولًا', 'warn'); return; } var next = s.strokes.slice(); next[i] = Object.assign({}, next[i], { pfx: p }); commit(next); sfx.tick(1300, 0.1); }
    el.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b || !el.contains(b) || b.closest('.lab-center')) return;
      var a;
      if ((a = b.getAttribute('data-tool'))) { sfx.tick(1500, 0.12); if (s.tool === a && a !== 'pencil') { set({ tool: 'pencil', dim: null }); return; } set({ tool: a, hover: null, dim: null }); if (a === 'compass') toast(s.comp ? 'سن القلم (الحلقة الحمراء) للرسم · المقبض الأزرق للّف بدون رسم · الذراع للنقل · المسمار الأصفر للفتحة' : 'اضغط مكان السن ثم اسحب لفتح الفرجار', 'info'); if (a === 'hand') toast('اكتب بإصبعك أو بالقلم على الورقة', 'info'); return; }
      if ((a = b.getAttribute('data-tog'))) {
        var o = {};
        if (a === 'ru') { sfx.clack(); o.ru = Object.assign({}, s.ru, { show: !s.ru.show }); }
        else if (a === 't45' || a === 't3060') { sfx.clack(); o[a] = Object.assign({}, s[a], { show: !s[a].show }); o.sel = a; }
        else if (a === 'flip') { var id = s.sel === 't3060' ? 't3060' : 't45'; sfx.tick(1100, 0.12); o[id] = Object.assign({}, s[id], { flip: !s[id].flip }); }
        else if (a === 'orient') { sfx.tick(1100, 0.12); o.t3060 = Object.assign({}, s.t3060, { orient: s.t3060.orient === '30' ? '60' : '30', mode: s.t3060.mode === 'on45' ? (grid ? 'free' : 'blade') : s.t3060.mode }); }
        else if (a === 'combine') { sfx.clack(); var on45 = s.t3060.mode !== 'on45'; o.t3060 = Object.assign({}, s.t3060, { mode: on45 ? 'on45' : 'blade', orient: on45 ? '60' : s.t3060.orient, s: 30, show: true }); o.t45 = Object.assign({}, s.t45, { show: true }); o.sel = 't3060'; if (on45) toast('المثلث 30/60 على وتر مثلث 45: خطوط بزوايا 15° و75°', 'info'); }
        else if (a === 'pr') { sfx.clack(); o.pr = Object.assign({}, s.pr, { show: !s.pr.show }); }
        else if (a === 'tape') { sfx.rip(); o.taped = !s.taped; }
        set(o); return;
      }
      if ((a = b.getAttribute('data-tab'))) { sfx.tick(1300, 0.1); set({ tab: a }); return; }
      if (b.hasAttribute('data-ink')) { sfx.tick(1250, 0.1); set({ ink: b.getAttribute('data-ink') }); var cn = COLORS.find(function (c) { return c[0] === b.getAttribute('data-ink'); }); toast('لون الخط: ' + (cn ? cn[1] : ''), 'info'); return; }
      if ((a = b.getAttribute('data-pen'))) { sfx.tick(1200, 0.1); set({ pencil: a }); return; }
      if ((a = b.getAttribute('data-line'))) { sfx.tick(1200, 0.1); set({ line: a }); return; }
      if ((a = b.getAttribute('data-chip'))) { sfx.tick(1300, 0.1); set({ text: a, tool: 'text' }); return; }
      if ((a = b.getAttribute('data-tsize'))) { set({ tsize: +a }); return; }
      if (b.hasAttribute('data-pfx')) { setPfx(b.getAttribute('data-pfx')); return; }
      if (b.id === 'bd-reopen') { togglePanels(); return; }
      if ((a = b.getAttribute('data-lnav'))) { var nl = (s.lesson + +a + LS.list.length) % LS.list.length; pickLesson(nl); return; }
      if ((a = b.getAttribute('data-phase'))) { if (s.demo) return; sfx.tick(1300, 0.1); if (a === 'practice' && s.phase !== 'practice') { startPractice(); } else set({ phase: a }); persist(); return; }
      if ((a = b.getAttribute('data-pvm'))) { pvSet({ mi: +a }); return; }
      if ((a = b.getAttribute('data-pvmode'))) { pvSet({ mode: a, reveal: false }); return; }
      switch (b.getAttribute('data-act') || b.id) {
        case 'div': divDraw(); break;
        case 'hint': sfx.tick(1300, 0.1); set({ showHint: !s.showHint }); break;
        case 'demo': var cur = curStep(); if (cur < 0) toast('أكملت كل الخطوات — أحسنت!', 'ok'); else runDemo([cur]); break;
        case 'demoall': if (s.demo) return; sfx.rip(); set({ strokes: [], hist: s.hist.concat([s.strokes]), comp: null, phase: 'explain' }); later(function () { runDemo(L().steps.map(function (_, i) { return i; })); }, 350); break;
        case 'stop': demoStop = true; break;
        case 'practice': startPractice(); break;
        case 'bd-panels': togglePanels(); break;
        case 'bd-pv': if (s.pv) pvClose(); else pvOpen(); break;
        case 'reset': sfx.rip(); commit([]); set({ comp: null }); break;
        case 'hand': sfx.tick(1500, 0.12); set({ tool: 'hand' }); toast('اكتب بإصبعك أو بالقلم على الورقة', 'info'); break;
        case 'assist': sfx.tick(1200, 0.1); set({ assist: !s.assist }); break;
        case 'bd-undo': if (s.hist.length) { sfx.tick(900, 0.1); set({ strokes: s.hist[s.hist.length - 1], hist: s.hist.slice(0, -1), fut: [s.strokes].concat(s.fut) }); persist(); } break;
        case 'bd-redo': if (s.fut.length) { sfx.tick(1100, 0.1); set({ strokes: s.fut[0], fut: s.fut.slice(1), hist: s.hist.concat([s.strokes]) }); persist(); } break;
        case 'bd-clear': sfx.rip(); commit([]); set({ comp: null }); break;
        case 'bd-rec': sfx.tick(s.rec ? 700 : 1500, 0.15); set({ rec: !s.rec }); break;
      }
    });

    /* ---------- perspective exercise window (choose a solid, derive views) ---------- */
    var GEO = window.DLGeo, pvR = null, pvDirty = false, pvRaf = 0, pvDrag = null;
    var PVMODES = [['3d', 'المجسم والأبعاد'], ['third', 'استنتج المسقط الثالث'], ['iso', 'ارسم المنظور']];
    function pvDefault() { var v = null; try { v = JSON.parse(localStorage.getItem('dl-pv') || 'null'); } catch (e) {} return Object.assign({ mi: 0, mode: '3d', reveal: false, yaw: 38, pitch: 26, angle: 1, min: false, x: null, y: null }, v || {}, { reveal: false }); }
    function pvSave() { try { var v = s.pv; localStorage.setItem('dl-pv', JSON.stringify({ mi: v.mi, mode: v.mode, angle: v.angle, x: v.x, y: v.y })); } catch (e) {} }
    function pvOpen() { sfx.swoosh(0.9, 0.25); sfx.thud(0.3); s.pv = pvDefault(); pvBuild(); el.querySelector('#bd-pv').classList.add('on'); }
    function pvClose() { sfx.tick(900, 0.1); s.pv = null; cancelAnimationFrame(pvRaf); var w = el.querySelector('#bd-pvwin'); w.hidden = true; w.innerHTML = ''; pvR = null; el.querySelector('#bd-pv').classList.remove('on'); }
    function pvSet(o) { var re = ('mi' in o && o.mi !== s.pv.mi) || ('mode' in o && o.mode !== s.pv.mode) || ('angle' in o) || ('reveal' in o) || ('min' in o); if ('mi' in o && o.mi !== s.pv.mi) { sfx.thud(0.3); o.reveal = false; } else sfx.tick(1300, 0.1); Object.assign(s.pv, o); pvSave(); if (re) pvBuild(); else { pvDirty = true; } }
    function pvStars(n) { return '<span class="stars">' + '★★★★★'.slice(0, n) + '<span class="st-off">' + '★★★★★'.slice(0, 5 - n) + '</span></span>'; }
    function pvBuild() {
      var v = s.pv, w = el.querySelector('#bd-pvwin'), m = GEO.MODELS[v.mi]; if (!m) { v.mi = 0; m = GEO.MODELS[0]; }
      w.hidden = false; w.classList.toggle('min', !!v.min);
      var show3d = v.mode === '3d' || (v.mode === 'iso' && v.reveal);
      var head = '<div class="pv-h" data-pvdrag="1"><span class="pv-grip" aria-hidden="true">⋮⋮</span><b>' + esc(m.name) + '</b><span class="mono muted">' + m.dims + ' مم</span>' + pvStars(m.stars) +
        '<span class="sp"></span><button type="button" class="pv-x" data-pvact="min" aria-label="' + (v.min ? 'تكبير النافذة' : 'تصغير النافذة') + '">' + (v.min ? '▢' : '—') + '</button><button type="button" class="pv-x" data-pvact="close" aria-label="إغلاق">✕</button></div>';
      if (v.min) { w.innerHTML = head; pvPlace(); return; }
      var hint = v.mode === '3d' ? 'اسحب المجسم لتدويره وتأمّله من كل الجهات، ثم استخرج المساقط الثلاثة وارسمها على اللوحة بالأبعاد المكتوبة.' :
        v.mode === 'third' ? 'معطى المسقطان الأمامي والأفقي بالأبعاد. استنتج المسقط الجانبي وارسمه على اللوحة، ثم اضغط «إظهار الحل» للمقارنة.' :
        'معطاة المساقط الثلاثة بالأبعاد. ارسم المنظور الأيزومتري للمجسم على اللوحة، ثم اضغط «إظهار المجسم» للتحقق.';
      w.innerHTML = head +
        '<div class="pv-models">' + GEO.MODELS.map(function (x, i) { return '<button type="button" class="pv-m' + (i === v.mi ? ' on' : '') + '" data-pvm="' + i + '">' + esc(x.short) + '<small>' + '★★★★★'.slice(0, x.stars) + '</small></button>'; }).join('') + '</div>' +
        '<div class="seg small pv-modes">' + PVMODES.map(function (x) { return '<button type="button" data-pvmode="' + x[0] + '" class="' + (v.mode === x[0] ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div>' +
        '<div class="pv-stage">' + (show3d ? '<canvas class="pv-cv" id="bd-pvcv" aria-label="المجسم — اسحب للتدوير"></canvas><span class="pv-tag">' + GEO.viewName(v.yaw, v.pitch) + '</span>' : '<svg class="pv-sheet" viewBox="0 0 460 380" role="img" aria-label="المساقط">' + pvSheet() + '</svg>') + '</div>' +
        '<div class="pv-help">' + hint + '</div>' +
        '<div class="pv-f">' +
          (show3d ? '<button type="button" class="chipbtn" data-pvact="iso">أيزومتري</button><button type="button" class="chipbtn" data-pvact="front">أمامي</button><button type="button" class="chipbtn" data-pvact="top">علوي</button><button type="button" class="chipbtn" data-pvact="side">جانبي</button>' : '<div class="seg small"><button type="button" data-pvact="a1" class="' + (v.angle === 1 ? 'on' : '') + '">الزاوية الأولى</button><button type="button" data-pvact="a3" class="' + (v.angle === 3 ? 'on' : '') + '">الثالثة</button></div>') +
          (v.mode === 'third' ? '<button type="button" class="btn ' + (v.reveal ? '' : 'primary') + ' pv-rev" data-pvact="reveal">' + (v.reveal ? 'إخفاء الحل' : 'إظهار الحل') + '</button>' : '') +
          (v.mode === 'iso' ? '<button type="button" class="btn ' + (v.reveal ? '' : 'primary') + ' pv-rev" data-pvact="reveal">' + (v.reveal ? 'العودة للمساقط' : 'إظهار المجسم') + '</button>' : '') +
        '</div>';
      pvPlace();
      var cv = w.querySelector('#bd-pvcv'); pvR = cv ? new GEO.Renderer(cv) : null; pvDirty = true; cancelAnimationFrame(pvRaf); if (pvR) pvLoop();
      if (cv) pvBindCanvas(cv);
    }
    function pvSheet() {
      var v = s.pv, m = GEO.MODELS[v.mi], hide = v.mode === 'third' && !v.reveal ? 'side' : '', S = GEO.sheet(m, v.angle, 460, 380, { dims: true, hide: hide }), first = v.angle === 1;
      return '<rect x="4" y="4" width="452" height="372" fill="#FBFCFE" stroke="#1A1A1A" stroke-width="1.2"/>' +
        (hide ? '' : '<path d="' + S.cons + '" fill="none" stroke="#B9C7DC" stroke-width=".7"/><path d="' + S.miter + '" fill="none" stroke="#E3141B" stroke-width=".9"/>') +
        '<path d="' + S.hid + '" fill="none" stroke="#3A4452" stroke-width=".95" stroke-dasharray="4.5 2.5"/><path d="' + S.vis + '" fill="none" stroke="#0E1116" stroke-width="1.8" stroke-linecap="round"/>' +
        '<path d="' + S.dimLines + '" fill="none" stroke="#1F6FEB" stroke-width=".75"/><path d="' + S.dimArrows + '" fill="#1F6FEB"/>' +
        S.dimText.map(function (t) { return '<text x="' + fx(t.x) + '" y="' + fx(t.y) + '" text-anchor="middle" font-size="12" fill="#1F4FA8" class="mono"' + (t.r ? ' transform="rotate(' + t.r + ' ' + fx(t.x) + ' ' + fx(t.y) + ')"' : '') + '>' + t.t + '</text>'; }).join('') +
        S.labels.map(function (l) { return '<text x="' + l.x + '" y="' + l.y + '" text-anchor="middle" font-size="12.5" fill="' + (l.t.indexOf('؟') >= 0 ? '#C0392B' : '#33476B') + '"' + (l.t.indexOf('؟') >= 0 ? ' font-weight="700"' : '') + '>' + l.t + '</text>'; }).join('') +
        (v.mode === 'iso' ? '' : '<g transform="translate(372 352)" stroke="#111" stroke-width="1.1" fill="none">' + (first ? '<path d="M0 -6L30 -13V13L0 6Z"/><circle cx="56" cy="0" r="13"/><circle cx="56" cy="0" r="5.5"/>' : '<circle cx="13" cy="0" r="13"/><circle cx="13" cy="0" r="5.5"/><path d="M40 -6L70 -13V13L40 6Z"/>') + '</g>');
    }
    function pvPlace() {
      var w = el.querySelector('#bd-pvwin'), host = w.parentNode, v = s.pv; if (!v) return;
      var hw = host.clientWidth, hh = host.clientHeight, ww = w.offsetWidth || 420, wh = w.offsetHeight || 300;
      if (v.x === null || v.y === null) { v.x = 14; v.y = 14; }
      v.x = Math.max(4, Math.min(hw - ww - 4, v.x)); v.y = Math.max(4, Math.min(Math.max(4, hh - wh - 4), v.y));
      w.style.left = v.x + 'px'; w.style.top = v.y + 'px';
    }
    function pvLoop() {
      if (!alive || !s.pv || !pvR) return; pvRaf = requestAnimationFrame(pvLoop);
      if (!pvDirty) return; pvDirty = false; var v = s.pv;
      try { pvR.draw({ model: GEO.MODELS[v.mi], yaw: v.yaw, pitch: v.pitch, e: 0, u: 0, box: false, mode: 'real', hidden: false, zoom: 0.92, sel: -1, dims: true, noArrow: true, fast: !!pvDrag }); } catch (err) { console.error(err); }
      var tg = el.querySelector('.pv-tag'); if (tg) tg.textContent = GEO.viewName(v.yaw, v.pitch);
    }
    function pvTween(yaw, pitch) {
      var v = s.pv, y0 = v.yaw, p0 = v.pitch, t0 = performance.now(); sfx.swoosh(0.7, 0.25);
      var dy = ((yaw - y0) % 360 + 540) % 360 - 180;
      (function st(t) { if (!s.pv) return; var k = Math.min(1, (t - t0) / 800), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; v.yaw = y0 + dy * e; v.pitch = p0 + (pitch - p0) * e; pvDirty = true; if (k < 1) requestAnimationFrame(st); })(t0);
    }
    function pvBindCanvas(cv) {
      var d = null;
      cv.addEventListener('pointerdown', function (e) { e.stopPropagation(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} d = { x: e.clientX, y: e.clientY, yaw: s.pv.yaw, pitch: s.pv.pitch, lx: e.clientX, ly: e.clientY }; pvDrag = d; });
      cv.addEventListener('pointermove', function (e) { if (!d) return; var sp = Math.hypot(e.clientX - d.lx, e.clientY - d.ly); d.lx = e.clientX; d.ly = e.clientY; sfx.play('whoosh', Math.min(1, sp / 18)); s.pv.yaw = d.yaw - (e.clientX - d.x) * 0.45; s.pv.pitch = Math.max(-10, Math.min(90, d.pitch + (e.clientY - d.y) * 0.36)); pvDirty = true; });
      function end() { d = null; pvDrag = null; pvDirty = true; }
      cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    }
    (function () {
      var w = el.querySelector('#bd-pvwin');
      w.addEventListener('pointerdown', function (e) {
        var h = e.target.closest('[data-pvdrag]'); if (!h || e.target.closest('button')) return;
        try { h.setPointerCapture(e.pointerId); } catch (x) {} pvDrag = { wx: e.clientX - s.pv.x, wy: e.clientY - s.pv.y, h: h };
      });
      w.addEventListener('pointermove', function (e) { if (!pvDrag || !pvDrag.h) return; s.pv.x = e.clientX - pvDrag.wx; s.pv.y = e.clientY - pvDrag.wy; pvPlace(); });
      function endW() { if (pvDrag && pvDrag.h) { pvDrag = null; pvSave(); } }
      w.addEventListener('pointerup', endW); w.addEventListener('pointercancel', endW);
      w.addEventListener('click', function (e) {
        var b = e.target.closest('[data-pvact]'); if (!b) return; e.stopPropagation(); var a = b.getAttribute('data-pvact');
        if (a === 'close') pvClose(); else if (a === 'min') pvSet({ min: !s.pv.min });
        else if (a === 'reveal') { sfx.chime(); pvSet({ reveal: !s.pv.reveal }); }
        else if (a === 'a1' || a === 'a3') pvSet({ angle: a === 'a1' ? 1 : 3 });
        else if (a === 'iso') pvTween(45, 35.26); else if (a === 'front') pvTween(0, 0); else if (a === 'top') pvTween(0, 90); else if (a === 'side') pvTween(s.pv.angle === 3 ? -90 : 90, 0);
      });
      window.addEventListener('resize', function () { if (s.pv) { pvPlace(); pvDirty = true; } });
    })();
    function pickLesson(li) { if (s.demo || li === s.lesson) return; sfx.rip(); set({ lesson: li, strokes: [], hist: s.hist.concat([s.strokes]), comp: null, showHint: false, phase: 'explain' }); persist(); }
    function startPractice() { if (s.demo) return; sfx.rip(); set({ phase: 'practice', strokes: [], hist: s.hist.concat([s.strokes]), comp: null, showHint: false }); persist(); toast('طبّق الخطوة 1: ' + L().steps[0].title, 'info'); }
    function togglePanels() { sfx.tick(1200, 0.1); s.panels = !s.panels; try { localStorage.setItem('dl-panels', s.panels ? '1' : '0'); } catch (e) {} applyPanels(); }
    function applyPanels() { var bd = el.querySelector('.body'); bd.classList.toggle('collapsed', !s.panels); var t = el.querySelector('#bd-panels'); if (t) { t.classList.toggle('on', !s.panels); t.setAttribute('aria-pressed', String(!s.panels)); } }
    el.addEventListener('change', function (ev) { var t = ev.target; if (t.getAttribute && t.getAttribute('data-lsel')) { pickLesson(+t.value); t.blur(); } });
    el.addEventListener('input', function (ev) {
      var t = ev.target, k;
      if ((k = t.getAttribute('data-dv'))) { var dv = Object.assign({}, s.dv); dv[k] = t.value; s.dv = dv; var calc = el.querySelector('#bd-panel .calc'); if (calc) calc.innerHTML = calcHtml(); }
      if (t.getAttribute('data-text')) s.text = t.value;
    });
    svg.addEventListener('pointerdown', down);
    svg.addEventListener('pointermove', move);
    svg.addEventListener('pointerup', up);
    svg.addEventListener('pointercancel', up);
    svg.addEventListener('pointerleave', function () { if (!drag && s.hover) set({ hover: null }); });
    render(); applyPanels();
    return function () { alive = false; cancelAnimationFrame(pvRaf); timers.forEach(clearTimeout); cancelAnimationFrame(raf); };
  }
  window.DLScreens = window.DLScreens || {};
  window.DLScreens.board = function (el) { return mountBoard(el, 'board'); };
  window.DLScreens.grid = function (el) { return mountBoard(el, 'grid'); };
})();
