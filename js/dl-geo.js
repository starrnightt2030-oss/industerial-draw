/* معمل الرسم الفني — 3D solids engine (models, hidden-line drawings, software z-buffer renderer)
   Designed & Developed by Mohamed-Eldawly */
(function (root) {
  'use strict';
  /* ---------- profile helpers ---------- */
  function mkRing(items) {
    var pts = [], sm = [];
    function push(p, smooth) { if (pts.length) sm[pts.length - 1] = smooth; pts.push(p); }
    items.forEach(function (it) {
      if (it.arc) {
        var a = it.arc, cx = a[0], cy = a[1], r = a[2], a0 = a[3], a1 = a[4], n = a[5];
        for (var k = 0; k <= n; k++) {
          var ang = (a0 + (a1 - a0) * k / n) * Math.PI / 180, p = [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
          if (k === 0 && pts.length) { var q = pts[pts.length - 1]; if (Math.abs(q[0] - p[0]) < 1e-6 && Math.abs(q[1] - p[1]) < 1e-6) continue; }
          push(p, k > 0);
        }
      } else push(it, false);
    });
    sm[pts.length - 1] = false;
    return { pts: pts, sm: sm };
  }
  function mkCircle(cx, cy, r, n) { var pts = [], sm = []; for (var k = 0; k < n; k++) { var a = 2 * Math.PI * (k + 0.5) / n; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); sm.push(true); } return { pts: pts, sm: sm }; }
  function mkPoly(cx, cy, r, n, rot) { var pts = [], sm = []; for (var k = 0; k < n; k++) { var a = (rot || 0) * Math.PI / 180 + 2 * Math.PI * k / n; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); sm.push(false); } return { pts: pts, sm: sm }; }
  function orient(R, ccw) {
    var A = 0, p = R.pts, n = p.length; for (var i = 0; i < n; i++) { var a = p[i], b = p[(i + 1) % n]; A += a[0] * b[1] - b[0] * a[1]; }
    if ((A > 0) === ccw) return R;
    var np = p.slice().reverse(), ns = []; for (var j = 0; j < n - 1; j++) ns[j] = R.sm[n - 2 - j]; ns[n - 1] = R.sm[n - 1];
    return { pts: np, sm: ns };
  }
  function asRing(x) { return x.pts ? x : mkRing(x); }
  function map3(axis, u, v, w) { return axis === 'y' ? [u, w, v] : axis === 'x' ? [w, u, v] : [u, v, w]; }
  function nrm3(axis, nu, nv) { return axis === 'y' ? [nu, 0, nv] : axis === 'x' ? [0, nu, nv] : [nu, nv, 0]; }
  function capN(axis, s) { return axis === 'y' ? [0, s, 0] : axis === 'x' ? [s, 0, 0] : [0, 0, s]; }
  /* extruded prism -> faces */
  function prism(axis, outer, from, to, holes) {
    var O = orient(asRing(outer), true), H = (holes || []).map(function (h) { return orient(asRing(h), false); });
    var rings = [O].concat(H), faces = [];
    [[from, -1], [to, 1]].forEach(function (cw) {
      faces.push({ rings: rings.map(function (R) { return R.pts.map(function (q) { return map3(axis, q[0], q[1], cw[0]); }); }), n: capN(axis, cw[1]), smooth: false });
    });
    rings.forEach(function (R) {
      var n = R.pts.length;
      for (var i = 0; i < n; i++) {
        var a = R.pts[i], b = R.pts[(i + 1) % n], du = b[0] - a[0], dv = b[1] - a[1], L = Math.hypot(du, dv) || 1;
        faces.push({ rings: [[map3(axis, a[0], a[1], from), map3(axis, b[0], b[1], from), map3(axis, b[0], b[1], to), map3(axis, a[0], a[1], to)]], n: nrm3(axis, dv / L, -du / L), smooth: R.sm[i] });
      }
    });
    return faces;
  }
  function newell(r) { var n = [0, 0, 0]; for (var i = 0; i < r.length; i++) { var a = r[i], b = r[(i + 1) % r.length]; n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]); } var L = Math.hypot(n[0], n[1], n[2]) || 1; return [n[0] / L, n[1] / L, n[2] / L]; }
  /* pyramid / cone with apex above base polygon (z0 base) */
  function apexSolid(baseRing, z0, apex, smooth) {
    var R = orient(baseRing, true), faces = [];
    faces.push({ rings: [R.pts.slice().reverse().map(function (q) { return [q[0], q[1], z0]; })], n: [0, 0, -1], smooth: false });
    for (var i = 0; i < R.pts.length; i++) {
      var a = R.pts[i], b = R.pts[(i + 1) % R.pts.length], tri = [[a[0], a[1], z0], [b[0], b[1], z0], apex];
      faces.push({ rings: [tri], n: newell(tri), smooth: !!smooth });
    }
    return faces;
  }
  function frustum(baseRing, z0, z1, scale, cxy, smooth) {
    var R = orient(baseRing, true), faces = [], top = R.pts.map(function (q) { return [cxy[0] + (q[0] - cxy[0]) * scale, cxy[1] + (q[1] - cxy[1]) * scale]; });
    faces.push({ rings: [R.pts.slice().reverse().map(function (q) { return [q[0], q[1], z0]; })], n: [0, 0, -1], smooth: false });
    faces.push({ rings: [top.map(function (q) { return [q[0], q[1], z1]; })], n: [0, 0, 1], smooth: false });
    for (var i = 0; i < R.pts.length; i++) {
      var j = (i + 1) % R.pts.length, quad = [[R.pts[i][0], R.pts[i][1], z0], [R.pts[j][0], R.pts[j][1], z0], [top[j][0], top[j][1], z1], [top[i][0], top[i][1], z1]];
      faces.push({ rings: [quad], n: newell(quad), smooth: !!smooth });
    }
    return faces;
  }
  function cat() { var o = []; for (var i = 0; i < arguments.length; i++) o = o.concat(arguments[i]); return o; }

  /* ---------- library of solids ---------- */
  var C1 = '#5E9BFF', C2 = '#3FAF7A', C3 = '#F07E52', C4 = '#B58CF0';
  function part(name, color, ex, faces) { return { name: name, color: color, ex: ex, faces: faces }; }
  var MODELS = [];
  function add(m) { m.solid = m.solid || cat.apply(null, m.parts.map(function (p) { return p.faces; })); MODELS.push(m); }
  // basic solids
  add({ id: 'box', group: 'basic', name: 'منشور رباعي (متوازي مستطيلات)', short: 'منشور رباعي', stars: 1, dims: '60×40×30', parts: [part('المنشور', C1, [0, 0, 0], prism('z', [[0, 0], [60, 0], [60, 40], [0, 40]], 0, 30))] });
  add({ id: 'tri', group: 'basic', name: 'منشور ثلاثي', short: 'منشور ثلاثي', stars: 1, dims: '60×50×45', parts: [part('المنشور', C1, [0, 0, 0], prism('y', [[0, 0], [60, 0], [30, 45]], 0, 50))] });
  add({ id: 'hex', group: 'basic', name: 'منشور سداسي منتظم', short: 'منشور سداسي', stars: 1, dims: '56×48×45', parts: [part('المنشور', C1, [0, 0, 0], prism('z', mkPoly(28, 24.25, 28, 6, 0), 0, 45))] });
  add({ id: 'cyl', group: 'basic', name: 'أسطوانة قائمة', short: 'أسطوانة', stars: 1, dims: 'Ø50×55', parts: [part('الأسطوانة', C1, [0, 0, 0], prism('z', mkCircle(25, 25, 25, 40), 0, 55))] });
  add({ id: 'pyr', group: 'basic', name: 'هرم رباعي قائم', short: 'هرم رباعي', stars: 2, dims: '50×50×60', parts: [part('الهرم', C1, [0, 0, 0], apexSolid(mkRing([[0, 0], [50, 0], [50, 50], [0, 50]]), 0, [25, 25, 60], false))] });
  add({ id: 'cone', group: 'basic', name: 'مخروط قائم', short: 'مخروط', stars: 2, dims: 'Ø56×60', parts: [part('المخروط', C1, [0, 0, 0], apexSolid(mkCircle(28, 28, 28, 40), 0, [28, 28, 60], true))] });
  add({ id: 'frus', group: 'basic', name: 'هرم رباعي ناقص', short: 'هرم ناقص', stars: 2, dims: '60×60×40',
    parts: [part('الهرم الناقص', C1, [0, 0, 0], frustum(mkRing([[0, 0], [60, 0], [60, 60], [0, 60]]), 0, 40, 0.5, [30, 30], false))] });
  // compound solids
  add({ id: 'u', group: 'comp', name: 'كتلة بمجرى', short: 'كتلة بمجرى', stars: 2, dims: '60×40×35',
    solid: prism('y', [[0, 0], [60, 0], [60, 35], [42, 35], [42, 20], [18, 20], [18, 35], [0, 35]], 0, 40),
    parts: [part('القاعدة', C1, [0, 0, 0], prism('y', [[0, 0], [60, 0], [60, 20], [0, 20]], 0, 40)), part('الكتف الأيسر', C2, [-26, 0, 24], prism('y', [[0, 20], [18, 20], [18, 35], [0, 35]], 0, 40)), part('الكتف الأيمن', C3, [26, 0, 24], prism('y', [[42, 20], [60, 20], [60, 35], [42, 35]], 0, 40))] });
  add({ id: 'step', group: 'comp', name: 'مجسم مدرّج', short: 'مجسم مدرّج', stars: 2, dims: '60×50×64',
    solid: cat(prism('y', [[0, 0], [60, 0], [60, 20], [20, 20], [20, 64], [0, 64]], 0, 50), prism('y', [[20, 20], [50, 20], [50, 40], [20, 40]], 25, 50)),
    parts: [part('القاعدة', C1, [0, 0, 0], prism('y', [[0, 0], [60, 0], [60, 20], [0, 20]], 0, 50)), part('العمود الرأسي', C2, [-30, 0, 26], prism('y', [[0, 20], [20, 20], [20, 64], [0, 64]], 0, 50)), part('الكتلة العلوية', C3, [34, -14, 46], prism('y', [[20, 20], [50, 20], [50, 40], [20, 40]], 25, 50))] });
  add({ id: 'tee', group: 'comp', name: 'مجسم على شكل حرف T', short: 'مجسم T', stars: 3, dims: '70×40×50',
    solid: prism('y', [[0, 0], [70, 0], [70, 15], [45, 15], [45, 50], [25, 50], [25, 15], [0, 15]], 0, 40),
    parts: [part('الشفة السفلية', C1, [0, 0, 0], prism('y', [[0, 0], [70, 0], [70, 15], [0, 15]], 0, 40)), part('العصب الرأسي', C3, [0, 0, 34], prism('y', [[25, 15], [45, 15], [45, 50], [25, 50]], 0, 40))] });
  add({ id: 'slope', group: 'comp', name: 'كتلة بسطح مائل', short: 'سطح مائل', stars: 3, dims: '70×45×50',
    solid: prism('y', [[0, 0], [70, 0], [70, 18], [35, 50], [0, 50]], 0, 45),
    parts: [part('القاعدة', C1, [0, 0, 0], prism('y', [[0, 0], [70, 0], [70, 18], [0, 18]], 0, 45)), part('الجزء المائل', C3, [-12, 0, 36], prism('y', [[0, 18], [70, 18], [35, 50], [0, 50]], 0, 45))] });
  add({ id: 'vblock', group: 'comp', name: 'كتلة بمجرى على شكل V', short: 'مجرى V', stars: 3, dims: '70×40×40',
    solid: prism('y', [[0, 0], [70, 0], [70, 40], [50, 40], [35, 22], [20, 40], [0, 40]], 0, 40),
    parts: [part('الكتلة', C1, [0, 0, 0], prism('y', [[0, 0], [70, 0], [70, 40], [50, 40], [35, 22], [20, 40], [0, 40]], 0, 40))] });
  add({ id: 'brk', group: 'comp', name: 'حامل بمجرى وضلع تقوية', short: 'حامل بضلع', stars: 4, dims: '80×50×60',
    parts: [part('القاعدة بالمجرى', C1, [0, 0, 0], prism('z', [[0, 0], [30, 0], [30, 22], [50, 22], [50, 0], [80, 0], [80, 50], [0, 50]], 0, 14)),
      part('الجدار الخلفي', C2, [0, 34, 30], prism('y', [[6, 14], [74, 14], [74, 60], [6, 60]], 36, 50)),
      part('ضلع التقوية', C3, [0, -34, 34], prism('x', [[24, 14], [36, 14], [36, 48]], 34, 46))] });
  add({ id: 'brg', group: 'comp', name: 'كرسي محور بثقوب', short: 'كرسي محور', stars: 5, dims: '90×50×68',
    parts: [part('القاعدة بثقبين', C1, [0, 0, 0], prism('z', [[0, 0], [90, 0], [90, 50], [0, 50]], 0, 12, [mkCircle(14, 25, 5, 24), mkCircle(76, 25, 5, 24)])),
      part('الكرسي بنهاية دائرية', C3, [0, 0, 44], prism('y', [[25, 12], [65, 12], [65, 48], { arc: [45, 48, 20, 0, 180, 18] }], 18, 32, [mkCircle(45, 48, 9, 28)]))] });

  MODELS.forEach(function (m) {
    var mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    m.solid.forEach(function (f) { f.rings.forEach(function (r) { r.forEach(function (p) { for (var i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], p[i]); mx[i] = Math.max(mx[i], p[i]); } }); }); });
    m.bb = { min: mn, max: mx }; m.center = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2];
    m.radius = Math.hypot(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) / 2;
  });

  /* ---------- camera ---------- */
  function cam(yaw, pitch) { var t = yaw * Math.PI / 180, p = pitch * Math.PI / 180; return { ct: Math.cos(t), st: Math.sin(t), cp: Math.cos(p), sp: Math.sin(p) }; }
  function rot(c, v) { var x1 = v[0] * c.ct - v[1] * c.st, y1 = v[0] * c.st + v[1] * c.ct; return [x1, y1 * c.cp - v[2] * c.sp, y1 * c.sp + v[2] * c.cp]; }

  /* ---------- hidden line removal ---------- */
  function edgeMap(faces) {
    if (faces._edges) return faces._edges;
    var E = {};
    function key(p) { return p[0].toFixed(3) + ',' + p[1].toFixed(3) + ',' + p[2].toFixed(3); }
    faces.forEach(function (f, id) {
      f.rings.forEach(function (r) {
        for (var i = 0; i < r.length; i++) {
          var a = r[i], b = r[(i + 1) % r.length], ka = key(a), kb = key(b), k = ka < kb ? ka + '|' + kb : kb + '|' + ka;
          if (!E[k]) E[k] = { a: a, b: b, f: [] }; if (E[k].f.indexOf(id) < 0) E[k].f.push(id);
        }
      });
    });
    var arr = Object.keys(E).map(function (k) { return E[k]; });
    try { Object.defineProperty(faces, '_edges', { value: arr, enumerable: false }); } catch (e) {}
    return arr;
  }
  function pip(x, y, rings) { var inside = false; for (var r = 0; r < rings.length; r++) { var R = rings[r]; for (var i = 0, j = R.length - 1; i < R.length; j = i++) { var xi = R[i][0], yi = R[i][1], xj = R[j][0], yj = R[j][1]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside; } } return inside; }
  function hlr(faces, yaw, pitch, opts) {
    var c = cam(yaw, pitch), E = 1e-6, edges = edgeMap(faces), maxN = (opts && opts.maxN) || 36;
    var occ = [];
    faces.forEach(function (f, id) {
      var n = rot(c, f.n); if (Math.abs(n[1]) < 1e-5) return;
      var p0 = rot(c, f.rings[0][0]), d = n[0] * p0[0] + n[1] * p0[1] + n[2] * p0[2];
      var r2 = f.rings.map(function (r) { return r.map(function (p) { var q = rot(c, p); return [q[0], q[2]]; }); });
      var mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9; r2[0].forEach(function (q) { if (q[0] < mnx) mnx = q[0]; if (q[0] > mxx) mxx = q[0]; if (q[1] < mnz) mnz = q[1]; if (q[1] > mxz) mxz = q[1]; });
      occ.push({ id: id, n: n, d: d, r2: r2, bb: [mnx - 0.01, mxx + 0.01, mnz - 0.01, mxz + 0.01] });
    });
    var nyOf = faces.map(function (f) { return rot(c, f.n)[1]; });
    var vis = [], hid = [], minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
    edges.forEach(function (e) {
      var fs = e.f, draw;
      if (fs.length === 1) draw = true;
      else if (fs.some(function (i) { return !faces[i].smooth; })) { var n0 = faces[fs[0]].n; draw = !fs.every(function (i) { var n = faces[i].n; return n[0] * n0[0] + n[1] * n0[1] + n[2] * n0[2] > 0.9999; }); }
      else { var mn = 1e9, mx = -1e9; fs.forEach(function (i) { mn = Math.min(mn, nyOf[i]); mx = Math.max(mx, nyOf[i]); }); draw = mn < -E && mx > E; }
      if (!draw) return;
      var A = rot(c, e.a), B = rot(c, e.b), len = Math.hypot(B[0] - A[0], B[2] - A[2]); if (len < 1e-4) return;
      if (A[0] < minX) minX = A[0]; if (B[0] < minX) minX = B[0]; if (A[0] > maxX) maxX = A[0]; if (B[0] > maxX) maxX = B[0];
      if (A[2] < minZ) minZ = A[2]; if (B[2] < minZ) minZ = B[2]; if (A[2] > maxZ) maxZ = A[2]; if (B[2] > maxZ) maxZ = B[2];
      var N = Math.max(2, Math.min(maxN, Math.ceil(len / 2))), state = null, sx = A[0], sz = A[2];
      for (var k = 0; k < N; k++) {
        var t = (k + 0.5) / N, X = A[0] + (B[0] - A[0]) * t, Y = A[1] + (B[1] - A[1]) * t, Z = A[2] + (B[2] - A[2]) * t, h = false;
        for (var o = 0; o < occ.length && !h; o++) {
          var O = occ[o]; if (fs.indexOf(O.id) >= 0) continue;
          if (X < O.bb[0] || X > O.bb[1] || Z < O.bb[2] || Z > O.bb[3]) continue;
          var yf = (O.d - O.n[0] * X - O.n[2] * Z) / O.n[1];
          if (yf < Y - 0.03 && pip(X, Z, O.r2)) h = true;
        }
        if (state === null) state = h;
        else if (h !== state) { var tx = A[0] + (B[0] - A[0]) * (k / N), tz = A[2] + (B[2] - A[2]) * (k / N); (state ? hid : vis).push([sx, sz, tx, tz]); sx = tx; sz = tz; state = h; }
      }
      (state ? hid : vis).push([sx, sz, B[0], B[2]]);
    });
    function onSeg(x, z, g) { var dx = g[2] - g[0], dz = g[3] - g[1], L2 = dx * dx + dz * dz; if (L2 < 1e-9) return false; var t = ((x - g[0]) * dx + (z - g[1]) * dz) / L2; if (t < -0.002 || t > 1.002) return false; var ex = g[0] + t * dx - x, ez = g[1] + t * dz - z; return ex * ex + ez * ez < 0.0025; }
    if (!(opts && opts.keepDup)) hid = hid.filter(function (g) { var P = [[g[0], g[1]], [(g[0] + g[2]) / 2, (g[1] + g[3]) / 2], [g[2], g[3]], [g[0] * .75 + g[2] * .25, g[1] * .75 + g[3] * .25], [g[0] * .25 + g[2] * .75, g[1] * .25 + g[3] * .75]]; return !P.every(function (p) { return vis.some(function (v) { return onSeg(p[0], p[1], v); }); }); });
    return { vis: vis, hid: hid, minX: minX, maxX: maxX, minZ: minZ, maxZ: maxZ };
  }
  function pathOf(segs, f) { var s = ''; for (var i = 0; i < segs.length; i++) { var g = segs[i]; s += 'M' + f(g[0], g[1]) + 'L' + f(g[2], g[3]); } return s; }

  /* ---------- 2D drawing sheet with the three views ---------- */
  var sheetCache = {};
  function sheet(m, angle, SW, SH, opts) {
    SW = SW || 460; SH = SH || 380; opts = opts || {};
    var key = m.id + '|' + angle + '|' + SW + 'x' + SH + '|' + (opts.dims ? 1 : 0) + (opts.hide || ''); if (sheetCache[key]) return sheetCache[key];
    var first = angle === 1;
    var vc = m._views || (m._views = {});
    function V(y, p) { var k = y + ',' + p; return vc[k] || (vc[k] = hlr(m.solid, y, p)); }
    var fv = V(0, 0), tv = V(0, 90), sv = first ? V(90, 0) : V(-90, 0);
    var wf = fv.maxX - fv.minX, hf = fv.maxZ - fv.minZ, wt = tv.maxX - tv.minX, ht = tv.maxZ - tv.minZ, ws = sv.maxX - sv.minX, hs = sv.maxZ - sv.minZ, G = 22;
    var pos = first ? { f: [0, 0], s: [wf + G, 0], t: [0, hf + G] } : { t: [0, 0], f: [0, ht + G], s: [wf + G, ht + G] };
    var Wt = wf + G + ws, Ht = hf + G + ht, P2 = 34, k = Math.min((SW - 2 * P2) / Wt, (SH - 2 * P2 - 24) / Ht);
    var X0 = (SW - k * Wt) / 2, Y0 = (SH - 24 - k * Ht) / 2;
    function sx(x) { return (X0 + k * x).toFixed(1); } function sy(y) { return (Y0 + k * y).toFixed(1); }
    function vf(v, o) { return function (X, Z) { return sx(o[0] + X - v.minX) + ' ' + sy(o[1] + v.maxZ - Z); }; }
    var vis = '', hid = '';
    [[fv, pos.f, 'front'], [tv, pos.t, 'top'], [sv, pos.s, 'side']].forEach(function (a) { if (opts.hide === a[2]) return; var f = vf(a[0], a[1]); vis += pathOf(a[0].vis, f); hid += pathOf(a[0].hid, f); });
    function L(x1, y1, x2, y2) { return 'M' + sx(x1) + ' ' + sy(y1) + 'L' + sx(x2) + ' ' + sy(y2); }
    var cons = '', miter = '', cx, cy, yA, yB, xA, xB;
    if (first) {
      cons += L(wf, 0, wf + G, 0) + L(wf, hf, wf + G, hf) + L(0, hf, 0, hf + G) + L(wf, hf, wf, hf + G);
      cx = wf + G / 2; cy = hf + G / 2; yA = hf + G; yB = hf + G + ht; xA = cx + (yA - cy); xB = cx + (yB - cy);
      cons += L(wf, yA, xA, yA) + L(wf, yB, xB, yB) + L(xA, yA, xA, hf) + L(xB, yB, xB, hf);
      miter = L(cx - 4, cy - 4, xB + 6, yB + 6);
    } else {
      cons += L(wf, ht + G, wf + G, ht + G) + L(wf, ht + G + hf, wf + G, ht + G + hf) + L(0, ht, 0, ht + G) + L(wf, ht, wf, ht + G);
      cx = wf + G / 2; cy = ht + G / 2; xA = cx + cy; xB = cx + (cy - ht);
      cons += L(wf, 0, xA, 0) + L(wf, ht, xB, ht) + L(xA, 0, xA, ht + G) + L(xB, ht, xB, ht + G);
      miter = L(cx - 4, cy + 4, xA + 6, -6);
    }
    function lab(o, w, h, t) { return { x: +(X0 + k * (o[0] + w / 2)).toFixed(0), y: +(Y0 + k * (o[1] + h) + 17).toFixed(0), t: t }; }
    var labels = [lab(pos.f, wf, hf, 'المسقط الأمامي'), lab(pos.t, wt, ht, 'المسقط الأفقي'), lab(pos.s, ws, hs, opts.hide === 'side' ? 'المسقط الجانبي = ؟' : (first ? 'الجانبي (من اليسار)' : 'الجانبي (من اليمين)'))];
    var dl = '', da = '', dt = [];
    if (opts.dims) {
      var g = 7, ah = 5, aw = 1.8;
      var dimH = function (x1, x2, y, ext0, t) { var a = +sx(x1), b = +sx(x2), yy = +sy(y), e0 = +sy(ext0); dl += 'M' + a + ' ' + e0 + 'V' + yy + 'M' + b + ' ' + e0 + 'V' + yy + 'M' + a + ' ' + yy + 'H' + b; da += 'M' + a + ' ' + yy + 'l' + ah + ' ' + (-aw) + 'v' + (2 * aw) + 'zM' + b + ' ' + yy + 'l' + (-ah) + ' ' + (-aw) + 'v' + (2 * aw) + 'z'; dt.push({ x: (a + b) / 2, y: yy - 3, t: t, r: 0 }); };
      var dimV = function (x, y1, y2, ext0, t) { var a = +sy(y1), b = +sy(y2), xx = +sx(x), e0 = +sx(ext0); dl += 'M' + e0 + ' ' + a + 'H' + xx + 'M' + e0 + ' ' + b + 'H' + xx + 'M' + xx + ' ' + a + 'V' + b; da += 'M' + xx + ' ' + a + 'l' + (-aw) + ' ' + ah + 'h' + (2 * aw) + 'zM' + xx + ' ' + b + 'l' + (-aw) + ' ' + (-ah) + 'h' + (2 * aw) + 'z'; dt.push({ x: xx - 3, y: (a + b) / 2, t: t, r: -90 }); };
      var r0 = function (v) { return String(Math.round(v)); };
      var fy = pos.f[1], fx0 = pos.f[0];
      if (first) dimH(fx0, fx0 + wf, fy - g, fy, r0(wf)); else dimH(fx0, fx0 + wf, fy + hf + g, fy + hf, r0(wf));
      dimV(fx0 - g, fy, fy + hf, fx0, r0(hf));
      if (opts.hide !== 'side') { if (first) dimH(pos.s[0], pos.s[0] + ws, pos.s[1] - g, pos.s[1], r0(ws)); else dimH(pos.s[0], pos.s[0] + ws, pos.s[1] - g, pos.s[1], r0(ws)); }
      else dimV(pos.t[0] - g, pos.t[1], pos.t[1] + ht, pos.t[0], r0(ht));
    }
    var res = { vis: vis, hid: hid, cons: cons, miter: miter, labels: labels, dimLines: dl, dimArrows: da, dimText: dt };
    sheetCache[key] = res; return res;
  }

  /* ---------- software renderer ---------- */
  var LIGHT = (function () { var l = [-0.42, -0.62, 0.78], L = Math.hypot(l[0], l[1], l[2]); return [l[0] / L, l[1] / L, l[2] / L]; })();
  var SHADOW_DIR = [0.35, 0.55, -1];
  function hexRgb(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  var FACE_COL = { x: hexRgb('#3FAF7A'), y: hexRgb('#E9A93B'), z: hexRgb('#4C8DF5') };
  var STEEL = hexRgb('#B9C4D3');
  function shadeCol(base, n, view, mode) {
    var lam = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
    var k = mode === 'real' ? 0.42 + 0.62 * lam : 0.62 + 0.42 * lam;
    var spec = 0;
    if (mode === 'real') { var h = [LIGHT[0] + view[0], LIGHT[1] + view[1], LIGHT[2] + view[2]], hl = Math.hypot(h[0], h[1], h[2]) || 1, nd = Math.max(0, (n[0] * h[0] + n[1] * h[1] + n[2] * h[2]) / hl); spec = Math.pow(nd, 28) * 120; }
    return [Math.min(255, base[0] * k + spec), Math.min(255, base[1] * k + spec), Math.min(255, base[2] * k + spec)];
  }
  function Renderer(canvas) { this.cv = canvas; this.ctx = canvas.getContext('2d'); this.off = document.createElement('canvas'); this.sh = document.createElement('canvas'); this.w = 0; this.h = 0; }
  Renderer.prototype.resize = function () {
    var cw = this.cv.clientWidth || 800, ch = this.cv.clientHeight || 600, dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = Math.round(cw * dpr), H = Math.round(ch * dpr);
    if (W !== this.w || H !== this.h) {
      this.w = W; this.h = H; this.cv.width = W; this.cv.height = H; this.off.width = W; this.off.height = H; this.sh.width = W; this.sh.height = H;
      this.img = this.off.getContext('2d').createImageData(W, H); this.buf = new Uint32Array(this.img.data.buffer); this.z = new Float32Array(W * H);
    }
    this.dpr = dpr; this.cw = cw; this.ch = ch;
  };
  /* st: {model, yaw, pitch, e, u, box, mode, hidden, zoom, sel} */
  Renderer.prototype.draw = function (st) {
    this.resize();
    var m = st.model, W = this.w, H = this.h, dpr = this.dpr, ctx = this.ctx, c = cam(st.yaw, Math.max(-89.9, Math.min(89.9, st.pitch)));
    var u = st.u || 0, e = st.e || 0, ca = Math.cos(u * Math.PI / 2), sa = Math.sin(u * Math.PI / 2);
    var bb = m.bb, Yb = bb.max[1] + 26, zf = -22, Xw = bb.max[0] + 26, x0 = bb.min[0] - 18, y0 = bb.min[1] - 22, zt = bb.max[2] + 22, D = Yb - y0;
    var uc = [(x0 + Xw + D) / 2, Yb, (zt + zf - D) / 2];
    var ctr = [m.center[0] + (uc[0] - m.center[0]) * u, m.center[1] + (uc[1] - m.center[1]) * u, m.center[2] + (uc[2] - m.center[2]) * u];
    var fitR = m.radius * (1 + 1.25 * u) + 14;
    var k = Math.min(this.cw, this.ch) / (2.25 * fitR) * (st.zoom || 1);
    var CX = this.cw / 2, CY = this.ch / 2 + 6;
    function P(p) { var r = rot(c, [p[0] - ctr[0], p[1] - ctr[1], p[2] - ctr[2]]); return [(CX + k * r[0]) * dpr, (CY - k * r[2]) * dpr, r[1]]; }
    var view = rot({ ct: c.ct, st: -c.st, cp: c.cp, sp: -c.sp }, [0, -1, 0]);
    // viewer direction (world) = inverse rotation of (0,-1,0)
    view = [-c.cp * c.st, -c.cp * c.ct, c.sp];
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
    // ---------- ground grid ----------
    var showBox = st.box || u > 0.001;
    if (!showBox) {
      ctx.lineWidth = 1 * dpr; ctx.strokeStyle = 'rgba(110,160,255,0.13)'; ctx.beginPath();
      var gx0 = Math.floor((bb.min[0] - 60) / 10) * 10, gx1 = bb.max[0] + 60, gy0 = Math.floor((bb.min[1] - 60) / 10) * 10, gy1 = bb.max[1] + 60;
      for (var gx = gx0; gx <= gx1; gx += 10) { var a1 = P([gx, gy0, 0]), a2 = P([gx, gy1, 0]); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(a2[0], a2[1]); }
      for (var gy = gy0; gy <= gy1; gy += 10) { var b1 = P([gx0, gy, 0]), b2 = P([gx1, gy, 0]); ctx.moveTo(b1[0], b1[1]); ctx.lineTo(b2[0], b2[1]); }
      ctx.stroke();
    }
    // ---------- projection box ----------
    function floorT(p) { var dy = p[1] - Yb, dz = p[2] - zf; return [p[0], Yb + dy * ca - dz * sa, zf + dy * sa + dz * ca]; }
    function sideT(p) { var dx = p[0] - Xw, dy = p[1] - Yb; return [Xw + dx * ca - dy * sa, Yb + dx * sa + dy * ca, p[2]]; }
    function poly(pts, fill, stroke) { ctx.beginPath(); pts.forEach(function (p, i) { var q = P(p); if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.2 * dpr; ctx.stroke(); } }
    if (showBox) {
      var vc = m._views || (m._views = {});
      var V = function (y, p) { var kk = y + ',' + p; return vc[kk] || (vc[kk] = hlr(m.solid, y, p)); };
      var wf = 'rgba(94,155,255,0.10)', ws = 'rgba(150,190,255,0.6)';
      var lines = function (res, map, col) {
        ctx.lineWidth = 1.7 * dpr; ctx.strokeStyle = col || '#FFFFFF'; ctx.setLineDash([]); ctx.beginPath();
        res.vis.forEach(function (g) { var a = P(map(g[0], g[1])), b = P(map(g[2], g[3])); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }); ctx.stroke();
        ctx.lineWidth = 1.1 * dpr; ctx.strokeStyle = 'rgba(207,224,255,0.85)'; ctx.setLineDash([5 * dpr, 3.5 * dpr]); ctx.beginPath();
        res.hid.forEach(function (g) { var a = P(map(g[0], g[1])), b = P(map(g[2], g[3])); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }); ctx.stroke(); ctx.setLineDash([]);
      };
      poly([[x0, Yb, zf], [Xw, Yb, zf], [Xw, Yb, zt], [x0, Yb, zt]], wf, ws);
      lines(V(0, 0), function (X, Z) { return [X, Yb - 0.2, Z]; });
      poly([[x0, y0, zf], [Xw, y0, zf], [Xw, Yb, zf], [x0, Yb, zf]].map(floorT), wf, ws);
      lines(V(0, 90), function (X, Z) { return floorT([X, Z, zf + 0.2]); });
      poly([[Xw, y0, zf], [Xw, Yb, zf], [Xw, Yb, zt], [Xw, y0, zt]].map(sideT), wf, ws);
      lines(V(90, 0), function (X, Z) { return sideT([Xw - 0.2, -X, Z]); });
      ctx.font = '600 ' + (15 * dpr) + 'px "IBM Plex Sans Arabic", sans-serif'; ctx.fillStyle = '#9FC0FF'; ctx.textAlign = 'center';
      [[[(x0 + Xw) / 2, Yb, zt + 6], 'المسقط الأمامي'], [floorT([(x0 + Xw) / 2, y0 - 8, zf]), 'المسقط الأفقي'], [sideT([Xw, (y0 + Yb) / 2, zt + 6]), 'المسقط الجانبي']].forEach(function (L) { var q = P(L[0]); ctx.fillText(L[1], q[0], q[1]); });
    }
    // ---------- object faces (with explode) ----------
    var parts = m.parts, items = [];
    parts.forEach(function (pt, pi) {
      var o = [pt.ex[0] * e, pt.ex[1] * e, pt.ex[2] * e];
      pt.faces.forEach(function (f) { items.push({ f: f, o: o, pi: pi }); });
    });
    // shadow
    if (!showBox) {
      var sctx = this.sh.getContext('2d'); sctx.setTransform(1, 0, 0, 1, 0, 0); sctx.clearRect(0, 0, W, H); sctx.fillStyle = '#000'; sctx.beginPath();
      items.forEach(function (it) {
        it.f.rings.forEach(function (r) {
          r.forEach(function (p, i) { var w = [p[0] + it.o[0], p[1] + it.o[1], p[2] + it.o[2]], t = w[2] / -SHADOW_DIR[2], g = [w[0] + SHADOW_DIR[0] * t, w[1] + SHADOW_DIR[1] * t, 0], q = P(g); if (i) sctx.lineTo(q[0], q[1]); else sctx.moveTo(q[0], q[1]); });
          sctx.closePath();
        });
      });
      sctx.fill('nonzero');
      ctx.save(); ctx.globalAlpha = 0.34 * (1 - u); try { ctx.filter = 'blur(' + (7 * dpr) + 'px)'; } catch (x) {} ctx.drawImage(this.sh, 0, 0); ctx.restore(); try { ctx.filter = 'none'; } catch (x) {}
    }
    // z-buffer raster
    var buf = this.buf, z = this.z; buf.fill(0); z.fill(1e9);
    var mode = st.mode || 'faces';
    for (var ii = 0; ii < items.length; ii++) {
      var it = items[ii], f = it.f, nr = rot(c, f.n);
      if (nr[1] > -1e-4) continue;
      var base = mode === 'faces' ? (Math.abs(f.n[0]) >= Math.abs(f.n[1]) && Math.abs(f.n[0]) >= Math.abs(f.n[2]) ? FACE_COL.x : (Math.abs(f.n[1]) >= Math.abs(f.n[2]) ? FACE_COL.y : FACE_COL.z)) : mode === 'parts' ? hexRgb(parts[it.pi].color) : STEEL;
      if (st.sel === it.pi) base = [Math.min(255, base[0] * 1.15 + 30), Math.min(255, base[1] * 1.15 + 30), Math.min(255, base[2] * 1.15 + 30)];
      var col = shadeCol(base, f.n, view, mode), px = (255 << 24) | ((col[2] | 0) << 16) | ((col[1] | 0) << 8) | (col[0] | 0);
      var p0 = f.rings[0][0], r0 = rot(c, [p0[0] + it.o[0] - ctr[0], p0[1] + it.o[1] - ctr[1], p0[2] + it.o[2] - ctr[2]]), dc = nr[0] * r0[0] + nr[1] * r0[1] + nr[2] * r0[2];
      var Ac = -nr[0] / (nr[1] * k * dpr), Bc = nr[2] / (nr[1] * k * dpr), Cc = (dc + nr[0] * CX / k - nr[2] * CY / k) / nr[1];
      var rings = f.rings.map(function (r) { return r.map(function (p) { var q = P([p[0] + it.o[0], p[1] + it.o[1], p[2] + it.o[2]]); return q; }); });
      var ymin = 1e9, ymax = -1e9; rings[0].forEach(function (q) { if (q[1] < ymin) ymin = q[1]; if (q[1] > ymax) ymax = q[1]; });
      var ys = Math.max(0, Math.ceil(ymin - 0.5)), ye = Math.min(H - 1, Math.floor(ymax - 0.5));
      var xs = [];
      for (var y = ys; y <= ye; y++) {
        var yc = y + 0.5; xs.length = 0;
        for (var ri = 0; ri < rings.length; ri++) { var R = rings[ri]; for (var a = 0, b = R.length - 1; a < R.length; b = a++) { var ya = R[a][1], yb = R[b][1]; if ((ya <= yc && yb > yc) || (yb <= yc && ya > yc)) xs.push(R[a][0] + (yc - ya) * (R[b][0] - R[a][0]) / (yb - ya)); } }
        if (xs.length < 2) continue; xs.sort(function (p, q) { return p - q; });
        for (var s = 0; s + 1 < xs.length; s += 2) {
          var xa = Math.max(0, Math.ceil(xs[s] - 0.5)), xb = Math.min(W - 1, Math.floor(xs[s + 1] - 0.5)), row = y * W, dd = Ac * (xa + 0.5) + Bc * yc + Cc;
          for (var x = xa; x <= xb; x++, dd += Ac) { var idx = row + x; if (dd < z[idx]) { z[idx] = dd; buf[idx] = px; } }
        }
      }
    }
    var octx = this.off.getContext('2d'); octx.putImageData(this.img, 0, 0);
    // edges
    var eFaces = []; items.forEach(function (it) { if (it.o[0] || it.o[1] || it.o[2]) eFaces.push({ rings: it.f.rings.map(function (r) { return r.map(function (p) { return [p[0] + it.o[0], p[1] + it.o[1], p[2] + it.o[2]]; }); }), n: it.f.n, smooth: it.f.smooth }); else eFaces.push(it.f); });
    var hr = hlr(eFaces, st.yaw, Math.max(-89.9, Math.min(89.9, st.pitch)), { maxN: st.fast ? 14 : 30 });
    var cr = rot(c, [-ctr[0], -ctr[1], -ctr[2]]);
    function S(X, Z) { return [(CX + k * (X + cr[0])) * dpr, (CY - k * (Z + cr[2])) * dpr]; }
    octx.lineCap = 'round'; octx.lineJoin = 'round';
    octx.strokeStyle = mode === 'real' ? 'rgba(18,24,38,0.9)' : 'rgba(10,21,48,0.95)'; octx.lineWidth = 1.7 * dpr; octx.beginPath();
    hr.vis.forEach(function (g) { var a = S(g[0], g[1]), b = S(g[2], g[3]); octx.moveTo(a[0], a[1]); octx.lineTo(b[0], b[1]); }); octx.stroke();
    if (st.hidden) {
      octx.globalCompositeOperation = 'source-over'; octx.strokeStyle = 'rgba(255,255,255,0.85)'; octx.lineWidth = 1.3 * dpr; octx.setLineDash([6 * dpr, 4 * dpr]); octx.beginPath();
      hr.hid.forEach(function (g) { var a = S(g[0], g[1]), b = S(g[2], g[3]); octx.moveTo(a[0], a[1]); octx.lineTo(b[0], b[1]); }); octx.stroke(); octx.setLineDash([]);
    }
    ctx.save(); ctx.globalAlpha = 1 - 0.85 * u; ctx.drawImage(this.off, 0, 0); ctx.restore();
    if (st.dims && u < 0.02 && e < 0.02) {
      var mn = bb.min, mx = bb.max, off = 9;
      var dim3 = function (a, b, o, t) {
        var A = P([a[0] + o[0], a[1] + o[1], a[2] + o[2]]), B = P([b[0] + o[0], b[1] + o[1], b[2] + o[2]]), A0 = P(a), B0 = P(b);
        ctx.strokeStyle = 'rgba(255,214,120,.95)'; ctx.fillStyle = '#FFD678'; ctx.lineWidth = 1.3 * dpr; ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(A0[0], A0[1]); ctx.lineTo(A[0], A[1]); ctx.moveTo(B0[0], B0[1]); ctx.lineTo(B[0], B[1]); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
        var an = Math.atan2(B[1] - A[1], B[0] - A[0]), hs = 9 * dpr;
        [[A, an], [B, an + Math.PI]].forEach(function (q) { ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[0][0] + Math.cos(q[1] - 0.3) * hs, q[0][1] + Math.sin(q[1] - 0.3) * hs); ctx.lineTo(q[0][0] + Math.cos(q[1] + 0.3) * hs, q[0][1] + Math.sin(q[1] + 0.3) * hs); ctx.closePath(); ctx.fill(); });
        var mxp = (A[0] + B[0]) / 2, myp = (A[1] + B[1]) / 2; ctx.font = '600 ' + (14 * dpr) + 'px "IBM Plex Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        var tw = ctx.measureText(t).width + 10 * dpr; ctx.fillStyle = 'rgba(10,22,48,.9)'; ctx.fillRect(mxp - tw / 2, myp - 10 * dpr, tw, 20 * dpr); ctx.fillStyle = '#FFD678'; ctx.fillText(t, mxp, myp); ctx.textBaseline = 'alphabetic';
      };
      var sx2 = view[0] > 0 ? mx[0] : mn[0], sy2 = view[1] > 0 ? mx[1] : mn[1];
      dim3([mn[0], sy2, mn[2]], [mx[0], sy2, mn[2]], [0, (view[1] > 0 ? 1 : -1) * off, 0], String(Math.round(mx[0] - mn[0])));
      dim3([sx2, mn[1], mn[2]], [sx2, mx[1], mn[2]], [(view[0] > 0 ? 1 : -1) * off, 0, 0], String(Math.round(mx[1] - mn[1])));
      var zx = view[0] > 0 ? mn[0] : mx[0];
      dim3([zx, sy2, mn[2]], [zx, sy2, mx[2]], [(view[0] > 0 ? -1 : 1) * off, (view[1] > 0 ? 1 : -1) * off * 0.0, 0], String(Math.round(mx[2] - mn[2])));
    }
    // viewing direction arrow
    if (u < 0.02 && e < 0.02 && !st.noArrow) {
      var a1 = P([m.center[0], bb.min[1] - 46, m.center[2]]), a2 = P([m.center[0], bb.min[1] - 8, m.center[2]]);
      ctx.strokeStyle = '#E3141B'; ctx.fillStyle = '#E3141B'; ctx.lineWidth = 3.5 * dpr; ctx.beginPath(); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(a2[0], a2[1]); ctx.stroke();
      var ang = Math.atan2(a2[1] - a1[1], a2[0] - a1[0]), hs = 12 * dpr; ctx.beginPath(); ctx.moveTo(a2[0] + Math.cos(ang) * 4 * dpr, a2[1] + Math.sin(ang) * 4 * dpr); ctx.lineTo(a2[0] - Math.cos(ang - 0.45) * hs, a2[1] - Math.sin(ang - 0.45) * hs); ctx.lineTo(a2[0] - Math.cos(ang + 0.45) * hs, a2[1] - Math.sin(ang + 0.45) * hs); ctx.closePath(); ctx.fill();
      ctx.font = '600 ' + (13 * dpr) + 'px "IBM Plex Sans Arabic", sans-serif'; ctx.fillStyle = '#FF9A9E'; ctx.textAlign = 'center'; ctx.fillText('اتجاه النظر للمسقط الأمامي', a1[0], a1[1] + (a1[1] > a2[1] ? 22 : -12) * dpr);
    }
  };
  function viewName(yaw, pitch) {
    function near(a, b) { return Math.abs(((a - b + 540) % 360) - 180) < 3; }
    if (Math.abs(pitch - 90) < 3) return 'مسقط أفقي';
    if (Math.abs(pitch) < 3 && near(yaw, 0)) return 'مسقط أمامي';
    if (Math.abs(pitch) < 3 && near(yaw, 90)) return 'مسقط جانبي (يسار)';
    if (Math.abs(pitch) < 3 && near(yaw, -90)) return 'مسقط جانبي (يمين)';
    if (Math.abs(pitch - 35.26) < 3 && (near(yaw, 45) || near(yaw, -45))) return 'منظور أيزومتري';
    return 'منظور حر';
  }
  root.DLGeo = { MODELS: MODELS, hlr: hlr, sheet: sheet, Renderer: Renderer, viewName: viewName, pathOf: pathOf };
})(typeof window !== 'undefined' ? window : globalThis);
