/* معمل الرسم الفني — المعمل الافتراضي
   Designed & Developed by Mohamed-Eldawly */
(function () {
  'use strict';
  var G = window.DLGeo, sfx = window.DLSfx;
  function stars(n) { return '<span>' + '★★★★★'.slice(0, n) + '</span><span class="st-off">' + '★★★★★'.slice(0, 5 - n) + '</span>'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function mountLab(el) {
    var st = { mi: 8, yaw: 38, pitch: 24, e: 0, u: 0, box: false, mode: 'faces', hidden: false, zoom: 1, sel: -1, angle: 1, spin: false };
    try { var sv = JSON.parse(localStorage.getItem('dl-lab') || 'null'); if (sv && G.MODELS[sv.mi]) { st.mi = sv.mi; st.angle = sv.angle || 1; st.mode = sv.mode || 'faces'; } } catch (e) {}
    var presets = [['أمامي', 0, 0], ['علوي', 0, 90], ['جانبي يسار', 90, 0], ['جانبي يمين', -90, 0], ['أيزومتري', 45, 35.26], ['منظور', 38, 24]];
    var modes = [['faces', 'ألوان الأوجه'], ['real', 'واقعي'], ['parts', 'الأجزاء']];
    el.innerHTML =
      DL.header({ kicker: 'الوحدة الثالثة · الإسقاط · المعمل الافتراضي', title: '<span id="lb-title"></span>', actions: '<button class="hb" id="lb-spin" type="button">دوران تلقائي</button>' + DL.soundBtn() + '<a class="hb primary" href="#/board">ارسم على اللوحة</a>' }) +
      '<div class="body">' +
      '<section class="side side-r" aria-label="التحكم">' +
        '<div class="ptitle">المجسمات <span class="muted">حسب الصعوبة</span></div>' +
        '<div class="mgroup-t">مجسمات أساسية</div><div class="mlist" id="lb-basic"></div>' +
        '<div class="mgroup-t">مجسمات مركبة</div><div class="mlist" id="lb-comp"></div>' +
        '<div class="ptitle">اتجاه النظر</div><div class="grid3" id="lb-presets">' + presets.map(function (p, i) { return '<button type="button" class="chipbtn" data-p="' + i + '">' + p[0] + '</button>'; }).join('') + '</div>' +
        '<div class="rowsb"><label class="ptitle" for="lb-ex">تفكيك المجسم</label><span class="mono accent" id="lb-epct">0%</span></div>' +
        '<input id="lb-ex" class="range" type="range" min="0" max="100" value="0">' +
        '<button type="button" class="btn primary" id="lb-exbtn">فكّك المجسم</button>' +
        '<div class="rowsb"><span class="ptitle">صندوق الإسقاط</span><button type="button" class="switch" id="lb-box" aria-pressed="false" aria-label="إظهار صندوق الإسقاط"><span></span></button></div>' +
        '<input id="lb-un" class="range" type="range" min="0" max="100" value="0" aria-label="فرد المستويات">' +
        '<button type="button" class="btn" id="lb-unbtn">افرد الصندوق على ورقة الرسم</button>' +
        '<div class="ptitle">طريقة العرض</div><div class="seg" id="lb-modes">' + modes.map(function (m) { return '<button type="button" data-m="' + m[0] + '">' + m[1] + '</button>'; }).join('') + '</div>' +
        '<div class="rowsb"><span>الخطوط المخفية على المجسم</span><button type="button" class="switch" id="lb-hid" aria-pressed="false" aria-label="إظهار الخطوط المخفية"><span></span></button></div>' +
      '</section>' +
      '<main class="center lab-center">' +
        '<canvas id="lb-cv" class="lab-cv" aria-label="المجسم ثلاثي الأبعاد — اسحب للتدوير"></canvas>' +
        '<div class="hud hud-tr"><span>yaw <b id="lb-yaw">0°</b></span><span>pitch <b id="lb-pitch">0°</b></span><span class="ok" id="lb-vn"></span></div>' +
        '<div class="hud-tl"><button type="button" class="zbtn" id="lb-zin" aria-label="تكبير">+</button><button type="button" class="zbtn" id="lb-zout" aria-label="تصغير">−</button></div>' +
        '<div class="hud hud-b">اسحب بإصبعك لتدوير المجسم · قرّب بإصبعين للتكبير · الأوجه: أصفر أمامي، أخضر جانبي، أزرق علوي</div>' +
      '</main>' +
      '<aside class="side side-l" aria-label="المساقط">' +
        '<div class="rowsb"><span class="ptitle">المساقط الثلاثة</span><div class="seg small" id="lb-ang"><button type="button" data-a="1">الزاوية الأولى</button><button type="button" data-a="3">الزاوية الثالثة</button></div></div>' +
        '<div class="sheet"><svg id="lb-sheet" viewBox="0 0 460 380" role="img" aria-label="المساقط الثلاثة"></svg></div>' +
        '<div class="rules"><span>طول الأمامي = طول الأفقي</span><span>ارتفاع الأمامي = ارتفاع الجانبي</span><span>عرض الأفقي = عرض الجانبي</span></div>' +
        '<div class="ptitle">أجزاء المجسم</div><div id="lb-parts" class="plist"></div>' +
      '</aside></div>' + DL.footer();

    var $ = function (id) { return el.querySelector('#' + id); };
    var cv = $('lb-cv'), R = new G.Renderer(cv), dirty = true, raf = 0, tw = 0, dragging = false, alive = true;
    function save() { try { localStorage.setItem('dl-lab', JSON.stringify({ mi: st.mi, angle: st.angle, mode: st.mode })); } catch (e) {} }
    function set(o) { for (var k in o) st[k] = o[k]; dirty = true; ui(); }
    function modelBtns() {
      ['basic', 'comp'].forEach(function (g) {
        $('lb-' + g).innerHTML = G.MODELS.map(function (m, i) { if (m.group !== g) return ''; return '<button type="button" class="mdl' + (i === st.mi ? ' on' : '') + '" data-mi="' + i + '"><span class="mname">' + esc(m.short) + '</span><span class="stars">' + stars(m.stars) + '</span></button>'; }).join('');
      });
    }
    function sheetUI() {
      var m = G.MODELS[st.mi], S = G.sheet(m, st.angle), first = st.angle === 1;
      $('lb-sheet').innerHTML = '<rect x="5" y="5" width="450" height="370" fill="#FBFCFE" stroke="#1A1A1A" stroke-width="1.3"/>' +
        '<path d="' + S.cons + '" fill="none" stroke="#9DB0CC" stroke-width=".8"/><path d="' + S.miter + '" fill="none" stroke="#E3141B" stroke-width="1.1"/>' +
        '<path d="' + S.hid + '" fill="none" stroke="#3A4452" stroke-width=".95" stroke-dasharray="4.5 2.5"/><path d="' + S.vis + '" fill="none" stroke="#0E1116" stroke-width="1.9" stroke-linecap="round"/>' +
        S.labels.map(function (l) { return '<text x="' + l.x + '" y="' + l.y + '" text-anchor="middle" font-size="12.5" fill="#33476B">' + l.t + '</text>'; }).join('') +
        '<g transform="translate(372 352)" stroke="#111" stroke-width="1.2" fill="none">' + (first ? '<path d="M0 -6L30 -13V13L0 6Z"/><circle cx="56" cy="0" r="13"/><circle cx="56" cy="0" r="5.5"/>' : '<circle cx="13" cy="0" r="13"/><circle cx="13" cy="0" r="5.5"/><path d="M40 -6L70 -13V13L40 6Z"/>') + '</g>';
      $('lb-parts').innerHTML = m.parts.map(function (p, i) { return '<button type="button" class="pbtn' + (st.sel === i ? ' on' : '') + '" data-pi="' + i + '"><span class="sw" style="background:' + p.color + '"></span><span>' + esc(p.name) + '</span></button>'; }).join('') + (m.parts.length < 2 ? '<div class="muted small">مجسم من جزء واحد — جرّب المجسمات المركبة للتفكيك</div>' : '');
    }
    var lastSheet = '';
    function ui() {
      var m = G.MODELS[st.mi];
      $('lb-title').innerHTML = esc(m.name) + ' — <span class="mono">' + m.dims + '</span> مم <span class="stars">' + stars(m.stars) + '</span>';
      $('lb-yaw').textContent = Math.round(((st.yaw % 360) + 540) % 360 - 180) + '°'; $('lb-pitch').textContent = Math.round(st.pitch) + '°'; $('lb-vn').textContent = G.viewName(st.yaw, st.pitch);
      $('lb-epct').textContent = Math.round(st.e * 100) + '%'; if (document.activeElement !== $('lb-ex')) $('lb-ex').value = Math.round(st.e * 100);
      if (document.activeElement !== $('lb-un')) $('lb-un').value = Math.round(st.u * 100);
      $('lb-exbtn').textContent = st.e > 0.5 ? 'ركّب الأجزاء' : 'فكّك المجسم';
      $('lb-unbtn').textContent = st.u > 0.5 ? 'أعد بناء الصندوق' : 'افرد الصندوق على ورقة الرسم';
      $('lb-box').setAttribute('aria-pressed', String(st.box)); $('lb-hid').setAttribute('aria-pressed', String(st.hidden));
      $('lb-spin').classList.toggle('on', st.spin); $('lb-spin').textContent = st.spin ? 'إيقاف الدوران' : 'دوران تلقائي';
      Array.prototype.forEach.call(el.querySelectorAll('#lb-modes button'), function (b) { b.classList.toggle('on', b.getAttribute('data-m') === st.mode); });
      Array.prototype.forEach.call(el.querySelectorAll('#lb-ang button'), function (b) { b.classList.toggle('on', +b.getAttribute('data-a') === st.angle); });
      var sk = st.mi + '|' + st.angle + '|' + st.sel; if (sk !== lastSheet) { lastSheet = sk; sheetUI(); modelBtns(); }
    }
    function tween(target, ms, onStep) {
      cancelAnimationFrame(tw); var from = {}, t0 = performance.now(); Object.keys(target).forEach(function (k) { from[k] = st[k]; });
      function step(t) { var k = Math.min(1, (t - t0) / ms), ez = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2, o = {}; Object.keys(target).forEach(function (key) { o[key] = from[key] + (target[key] - from[key]) * ez; }); if (onStep) onStep(k); set(o); if (k < 1) tw = requestAnimationFrame(step); }
      tw = requestAnimationFrame(step);
    }
    function loop() {
      if (!alive) return; raf = requestAnimationFrame(loop);
      if (st.spin && !dragging) { st.yaw += 0.35; dirty = true; ui(); }
      if (dirty) { dirty = false; try { R.draw({ model: G.MODELS[st.mi], yaw: st.yaw, pitch: st.pitch, e: st.e, u: st.u, box: st.box, mode: st.mode, hidden: st.hidden, zoom: st.zoom, sel: st.sel, fast: dragging }); } catch (err) { console.error(err); } }
    }
    // events
    el.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b || !el.contains(b)) return;
      if (b.hasAttribute('data-mi')) { var i = +b.getAttribute('data-mi'); if (i !== st.mi) { sfx.thud(0.35); sfx.tick(900, 0.1); set({ mi: i, e: 0, sel: -1 }); save(); } return; }
      if (b.hasAttribute('data-p')) { var p = presets[+b.getAttribute('data-p')]; sfx.swoosh(0.7, 0.28); tween({ yaw: p[1], pitch: p[2] }, 900); return; }
      if (b.hasAttribute('data-m')) { sfx.tick(1400, 0.12); set({ mode: b.getAttribute('data-m') }); save(); return; }
      if (b.hasAttribute('data-a')) { sfx.tick(1500, 0.12); set({ angle: +b.getAttribute('data-a') }); save(); return; }
      if (b.hasAttribute('data-pi')) { var pi = +b.getAttribute('data-pi'); sfx.tick(1200, 0.1); set({ sel: st.sel === pi ? -1 : pi }); return; }
      switch (b.id) {
        case 'lb-exbtn': if (G.MODELS[st.mi].parts.length < 2) { DL.toast('هذا المجسم من جزء واحد', 'warn'); return; } sfx.swoosh(1.1, 0.3); tween({ e: st.e > 0.5 ? 0 : 1 }, 1100, function (k) { sfx.play('slide', 0.9 * Math.sin(Math.PI * k)); if (k >= 1) sfx.thud(0.45); }); break;
        case 'lb-unbtn': set({ box: true }); sfx.swoosh(1.4, 0.3); var done = function (k) { sfx.play('slide', 0.7 * Math.sin(Math.PI * k)); if (k >= 1) sfx.thud(0.4); }; if (st.u > 0.5) tween({ u: 0, yaw: 38, pitch: 24 }, 1500, done); else tween({ u: 1, yaw: 0, pitch: 0, e: 0, zoom: 1 }, 1700, done); break;
        case 'lb-box': sfx.tick(1200, 0.14); set({ box: !st.box }); break;
        case 'lb-hid': sfx.tick(1200, 0.14); set({ hidden: !st.hidden }); break;
        case 'lb-spin': sfx.tick(1100, 0.12); set({ spin: !st.spin }); break;
        case 'lb-zin': sfx.tick(1300, 0.1); tween({ zoom: Math.min(3, st.zoom * 1.25) }, 300); break;
        case 'lb-zout': sfx.tick(1000, 0.1); tween({ zoom: Math.max(0.5, st.zoom / 1.25) }, 300); break;
      }
    });
    $('lb-ex').addEventListener('input', function (ev) { cancelAnimationFrame(tw); var v = ev.target.value / 100; if (Math.floor(v * 10) !== Math.floor(st.e * 10)) sfx.tick(700 + v * 900, 0.1); sfx.play('slide', 0.8); set({ e: v }); });
    $('lb-un').addEventListener('input', function (ev) { cancelAnimationFrame(tw); sfx.play('slide', 0.6); set({ u: ev.target.value / 100, box: true }); });
    var ptrs = {}, drag = null, pinch = null;
    cv.addEventListener('pointerdown', function (e) {
      sfx.init(); cancelAnimationFrame(tw); try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      ptrs[e.pointerId] = [e.clientX, e.clientY];
      var ids = Object.keys(ptrs);
      if (ids.length === 2) { var a = ptrs[ids[0]], b = ptrs[ids[1]]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: st.zoom }; drag = null; return; }
      drag = { x: e.clientX, y: e.clientY, yaw: st.yaw, pitch: st.pitch, lx: e.clientX, ly: e.clientY }; dragging = true;
    });
    cv.addEventListener('pointermove', function (e) {
      if (!ptrs[e.pointerId]) return; ptrs[e.pointerId] = [e.clientX, e.clientY];
      if (pinch) { var ids = Object.keys(ptrs); if (ids.length < 2) return; var a = ptrs[ids[0]], b = ptrs[ids[1]]; set({ zoom: Math.max(0.5, Math.min(3, pinch.z * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d)) }); return; }
      if (!drag) return; var sp = Math.hypot(e.clientX - drag.lx, e.clientY - drag.ly); drag.lx = e.clientX; drag.ly = e.clientY;
      sfx.play('whoosh', Math.min(1, sp / 18));
      set({ yaw: drag.yaw - (e.clientX - drag.x) * 0.42, pitch: Math.max(-10, Math.min(90, drag.pitch + (e.clientY - drag.y) * 0.34)) });
    });
    function upP(e) { delete ptrs[e.pointerId]; if (Object.keys(ptrs).length < 2) pinch = null; if (!Object.keys(ptrs).length) { drag = null; dragging = false; dirty = true; } }
    cv.addEventListener('pointerup', upP); cv.addEventListener('pointercancel', upP);
    cv.addEventListener('wheel', function (e) { e.preventDefault(); set({ zoom: Math.max(0.5, Math.min(3, st.zoom * (e.deltaY > 0 ? 0.92 : 1.08))) }); }, { passive: false });
    function onResize() { dirty = true; }
    window.addEventListener('resize', onResize);
    ui(); loop();
    return function () { alive = false; cancelAnimationFrame(raf); cancelAnimationFrame(tw); window.removeEventListener('resize', onResize); };
  }
  window.DLScreens = window.DLScreens || {};
  window.DLScreens.lab = mountLab;
})();
