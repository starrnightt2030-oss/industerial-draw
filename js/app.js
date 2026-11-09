/* معمل الرسم الفني — app shell, router and home screen
   مركز تدريب شركة ترسانة الإسكندرية · Designed & Developed by Mohamed-Eldawly */
(function () {
  'use strict';
  var sfx = window.DLSfx;
  var SOUND_ON = 'M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12', SOUND_OFF = 'M17 9l5 6M22 9l-5 6';
  var DL = window.DL = {
    header: function (o) {
      return '<header class="hdr"><div class="hdr-s"><a class="logo" href="#/" aria-label="الرئيسية"><img src="assets/logo.png" alt="شعار مركز تدريب شركة ترسانة الإسكندرية"></a>' +
        '<div class="brand"><b>معمل الرسم الفني</b><small>مركز تدريب شركة ترسانة الإسكندرية</small></div><span class="vsep"></span>' +
        '<div class="ttl"><small>' + o.kicker + '</small><b>' + o.title + '</b></div></div><div class="hdr-e">' + (o.actions || '') + '</div></header>';
    },
    soundBtn: function () { return '<button type="button" class="hb icon snd" aria-label="الصوت"><svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path class="sp" d="' + (sfx.on ? SOUND_ON : SOUND_OFF) + '"/></svg></button>'; },
    footer: function () { return '<footer class="ftr"><span>© مركز تدريب شركة ترسانة الإسكندرية — معمل الرسم الفني</span><span dir="ltr" class="mono">Designed &amp; Developed by <b>Mohamed-Eldawly</b></span></footer>'; },
    toast: function (t, kind) {
      var box = document.getElementById('toast'); box.innerHTML = '<span class="tdot ' + (kind || 'info') + '"></span><span>' + t + '</span>';
      box.className = 'toast show ' + (kind || 'info'); clearTimeout(DL._tt); DL._tt = setTimeout(function () { box.className = 'toast'; }, 2700);
    }
  };
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.snd'); if (!b) return;
    sfx.setOn(!sfx.on);
    Array.prototype.forEach.call(document.querySelectorAll('.snd .sp'), function (p) { p.setAttribute('d', sfx.on ? SOUND_ON : SOUND_OFF); });
    Array.prototype.forEach.call(document.querySelectorAll('.snd .sl'), function (p) { p.textContent = sfx.on ? 'الصوت' : 'بدون صوت'; });
  });

  /* ---------- fullscreen ---------- */
  var FS_IN = 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5', FS_OUT = 'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5';
  function isFs() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function enterFs() { var d = document.documentElement, r = d.requestFullscreen || d.webkitRequestFullscreen; if (!r) return Promise.resolve(); try { var pr = r.call(d, { navigationUI: 'hide' }); return (pr && pr.then ? pr : Promise.resolve()).then(function () { try { screen.orientation.lock('landscape').catch(function () {}); } catch (e) {} }).catch(function () {}); } catch (e) { return Promise.resolve(); } }
  function exitFs() { var x = document.exitFullscreen || document.webkitExitFullscreen; if (x && isFs()) try { x.call(document); } catch (e) {} }
  DL.fsBtn = function () { return '<button type="button" class="hb icon fsb" aria-label="ملء الشاشة" title="ملء الشاشة / خروج"><svg viewBox="0 0 24 24"><path class="fsp" d="' + (isFs() ? FS_OUT : FS_IN) + '"/></svg></button>'; };
  function syncFs() { var on = isFs(); Array.prototype.forEach.call(document.querySelectorAll('.fsb'), function (b) { b.querySelector('.fsp').setAttribute('d', on ? FS_OUT : FS_IN); b.setAttribute('aria-label', on ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'); b.classList.toggle('on', on); var l = b.querySelector('.fsl'); if (l) l.textContent = on ? 'خروج من ملء الشاشة' : 'ملء الشاشة'; }); }
  document.addEventListener('fullscreenchange', syncFs); document.addEventListener('webkitfullscreenchange', syncFs);
  document.addEventListener('click', function (e) { var b = e.target.closest('.fsb'); if (!b) return; sfx.tick(1200, 0.1); if (isFs()) exitFs(); else enterFs(); });
  function standalone() { try { return matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches || navigator.standalone; } catch (e) { return false; } }
  function splash(done) {
    var sp = document.createElement('div'); sp.className = 'splash';
    sp.innerHTML = '<div class="sp-in"><div class="sp-logo"><svg viewBox="0 0 200 200" aria-hidden="true"><circle class="sp-ring" cx="100" cy="100" r="92"/><circle class="sp-ring2" cx="100" cy="100" r="84"/></svg><img src="assets/logo.png" alt="شعار مركز تدريب شركة ترسانة الإسكندرية"></div>' +
      '<small>مركز تدريب شركة ترسانة الإسكندرية</small><h1>معمل <span>الرسم الفني</span></h1>' +
      '<button type="button" class="sp-go"><svg viewBox="0 0 24 24"><path d="' + FS_IN + '"/></svg>ابدأ — ملء الشاشة</button>' +
      '<button type="button" class="sp-skip">متابعة بدون ملء الشاشة</button>' +
      '<span class="sp-dev" dir="ltr">Designed &amp; Developed by <b>Mohamed-Eldawly</b></span></div>';
    document.body.appendChild(sp);
    function close(fs) { sfx.init(); if (fs) enterFs(); sp.classList.add('out'); setTimeout(function () { sp.remove(); done(); }, 650); }
    sp.querySelector('.sp-go').addEventListener('click', function () { close(true); });
    sp.querySelector('.sp-skip').addEventListener('click', function () { close(false); });
  }

  /* ---------- home ---------- */
  var HOME_PLAYED = false;
  function mountHome(el) {
    var alive = true, raf = 0;
    var tiles = [
      ['#/board', 'لوحة الرسم A3', 'مسطرة T ومثلثان وفرجار ومنقلة على لوحة خشبية، تقسيم اللوحة وكتابة الأبعاد، وتمارين المناظير لاستخراج المساقط.', ['مسطرة T', 'فرجار', 'أبعاد', 'مناظير'], '<path d="M6 34h52M6 34v8h52v-8M12 34V12l20 22M40 34l12-20v20" /><circle cx="46" cy="10" r="3"/>'],
      ['#/grid', 'الإنشاءات الهندسية', '16 إنشاءً مشروحًا خطوة بخطوة: التنصيف والأعمدة، المضلعات المنتظمة داخل دائرة، المماسات والتقسيم — ثم التنفيذ بيدك.', ['شرح متحرك', 'تطبيق موجّه', 'تصحيح فوري'], '<circle cx="32" cy="26" r="18"/><path d="M32 8l15.6 9v18L32 44l-15.6-9V17z"/><path d="M8 26h48M32 2v48" stroke-dasharray="6 2 2 2"/>'],
      ['#/lab', 'المعمل الافتراضي', '14 مجسمًا من الكتاب بمستويات صعوبة: دوّر، فكّك الأجزاء، وافرد صندوق الإسقاط لترى المساقط الثلاثة.', ['3D', 'تفكيك', 'صندوق الإسقاط'], '<path d="M32 4l24 12v24L32 52 8 40V16z"/><path d="M8 16l24 12 24-12M32 28v24"/>']
    ];
    el.innerHTML = '<div class="home">' +
      '<div class="hm-bg" aria-hidden="true"></div>' +
      '<header class="hm-top"><div class="hm-org"><img src="assets/logo.png" alt=""><span>مركز تدريب شركة ترسانة الإسكندرية</span></div><div class="hm-act">' + DL.soundBtn() + DL.fsBtn() + '</div></header>' +
      '<main class="hm-main">' +
        '<section class="hm-copy">' +
          '<span class="hm-kick">الرسم الصناعي · الصف الحادي عشر</span>' +
          '<h1 class="hm-title"><span class="l1">معمل</span><span class="l2">الرسم الفني</span></h1>' +
          '<p class="hm-lead">ارسم بالأدوات كما في المرسم الحقيقي — مسطرة T، المثلثان، الفرجار وأقلام الرصاص — وتعلّم كل إنشاء هندسي خطوة بخطوة، ثم استخرج المساقط من مجسمات حقيقية.</p>' +
          '<div class="hm-cta"><a class="hm-btn pri" href="#/board">ابدأ الرسم على اللوحة<svg viewBox="0 0 24 24"><path d="M14 6l-6 6 6 6"/></svg></a><a class="hm-btn" href="#/grid">الإنشاءات الهندسية</a></div>' +
          '<div class="hm-stats"><span><b>16</b>إنشاءً هندسيًا</span><span><b>14</b>مجسمًا</span><span><b>6</b>أقلام رصاص</span><span><b>7</b>أنواع خطوط</span></div>' +
        '</section>' +
        '<section class="hm-art" aria-hidden="true"><svg id="hm-cons" viewBox="0 0 600 600"></svg></section>' +
      '</main>' +
      '<nav class="hm-tiles">' + tiles.map(function (t, i) { return '<a class="hm-tile" href="' + t[0] + '" style="--d:' + (0.55 + i * 0.12) + 's"><span class="ti-ic"><svg viewBox="0 0 64 56">' + t[4] + '</svg></span><span class="ti-tx"><b>' + t[1] + '</b><small>' + t[2] + '</small><span class="ti-ch">' + t[3].map(function (c) { return '<i>' + c + '</i>'; }).join('') + '</span></span><span class="ti-go"><svg viewBox="0 0 24 24"><path d="M14 6l-6 6 6 6"/></svg></span></a>'; }).join('') + '</nav>' +
      '<footer class="hm-ftr"><span>© مركز تدريب شركة ترسانة الإسكندرية — معمل الرسم الفني</span><span dir="ltr" class="mono">Designed &amp; Developed by <b>Mohamed-Eldawly</b></span></footer>' +
    '</div>';
    /* construction loop: hexagon in a circle around the logo, drawn by a real compass and pencil */
    var svg = el.querySelector('#hm-cons'), C = [300, 300], R = 178, PER = 11000, t0 = performance.now(), lastPh = -1, played = {};
    var V = []; for (var k = 0; k < 6; k++) { var a = -Math.PI / 2 + k * Math.PI / 3; V.push([C[0] + R * Math.cos(a), C[1] + R * Math.sin(a)]); }
    function f(n) { return Math.round(n * 10) / 10; }
    function arc(c, r, a0, sw) { if (sw <= 0.0001) return ''; if (sw >= 2 * Math.PI - 0.001) sw = 2 * Math.PI - 0.001; var a1 = a0 + sw; return 'M' + f(c[0] + r * Math.cos(a0)) + ' ' + f(c[1] + r * Math.sin(a0)) + 'A' + r + ' ' + r + ' 0 ' + (sw > Math.PI ? 1 : 0) + ' 1 ' + f(c[0] + r * Math.cos(a1)) + ' ' + f(c[1] + r * Math.sin(a1)); }
    function seg(a, b, k) { return 'M' + f(a[0]) + ' ' + f(a[1]) + 'L' + f(a[0] + (b[0] - a[0]) * k) + ' ' + f(a[1] + (b[1] - a[1]) * k); }
    function cl(x) { return Math.max(0, Math.min(1, x)); }
    function ease(x) { x = cl(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    function compass(c, r, ang, op) {
      if (op <= 0.01) return '';
      var Lc = 250, u = [Math.cos(ang), Math.sin(ang)], n = [u[1], -u[0]], P = [c[0] + r * u[0], c[1] + r * u[1]], h = Math.sqrt(Math.max(0, Lc * Lc - r * r / 4)), H = [(c[0] + P[0]) / 2 + n[0] * h, (c[1] + P[1]) / 2 + n[1] * h];
      function leg(A, B, wa, wb) { var dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy) || 1, q = [-dy / l, dx / l]; return 'M' + f(A[0] + q[0] * wa) + ' ' + f(A[1] + q[1] * wa) + 'L' + f(B[0] + q[0] * wb) + ' ' + f(B[1] + q[1] * wb) + 'L' + f(B[0] - q[0] * wb) + ' ' + f(B[1] - q[1] * wb) + 'L' + f(A[0] - q[0] * wa) + ' ' + f(A[1] - q[1] * wa) + 'Z'; }
      function lp(A, B, t) { return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t]; }
      var N1 = lp(H, c, .9), N2 = lp(H, P, .8), G0 = [H[0] + n[0] * 16, H[1] + n[1] * 16], G1 = [H[0] + n[0] * 62, H[1] + n[1] * 62];
      return '<g opacity="' + f(op) + '" filter="url(#hmSh)"><path d="' + leg(H, N1, 7, 3) + '" fill="url(#hmMetal)"/><path d="' + leg(H, N2, 7, 4.5) + '" fill="url(#hmMetal)"/><path d="' + leg(N1, c, 2, .3) + '" fill="#C9D3E2"/><path d="' + leg(N2, P, 3.5, .5) + '" fill="#F2C94C"/><path d="' + leg(G0, G1, 9, 8) + '" fill="#2F7BEF"/><circle cx="' + f(H[0]) + '" cy="' + f(H[1]) + '" r="15" fill="url(#hmMetal)"/><circle cx="' + f(H[0]) + '" cy="' + f(H[1]) + '" r="5" fill="#4F5A6E"/></g>';
    }
    function pencil(at, op) { if (!at || op <= 0.01) return ''; return '<g opacity="' + f(op) + '" transform="translate(' + f(at[0]) + ' ' + f(at[1]) + ') rotate(32)" filter="url(#hmSh)"><path d="M0 0L-1.4 -6H1.4Z" fill="#1A1A1A"/><path d="M-1.4 -6L-6 -22H6L1.4 -6Z" fill="#E6C595"/><rect x="-6" y="-150" width="12" height="128" fill="#1C3D7A"/><rect x="-6" y="-150" width="4" height="128" fill="#fff" fill-opacity=".18"/><rect x="-6.4" y="-162" width="12.8" height="13" fill="#C9D1DC"/><rect x="-5.6" y="-172" width="11.2" height="11" rx="2.5" fill="#E9A1A1"/></g>'; }
    var defs = '<defs><linearGradient id="hmMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7E899D"/><stop offset=".45" stop-color="#F6F9FD"/><stop offset="1" stop-color="#8994A8"/></linearGradient><filter id="hmSh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="4" dy="10" stdDeviation="7" flood-color="#000" flood-opacity=".45"/></filter><radialGradient id="hmGlow"><stop offset="0" stop-color="#5E9BFF" stop-opacity=".35"/><stop offset="1" stop-color="#5E9BFF" stop-opacity="0"/></radialGradient><clipPath id="hmClip"><circle cx="300" cy="300" r="92"/></clipPath><linearGradient id="hmGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE7A3"/><stop offset="1" stop-color="#F2B33D"/></linearGradient></defs>';
    function snd(key, fn) { if (played[key] || !HOME_PLAYED) return; played[key] = 1; fn(); }
    function frame(now) {
      if (!alive) return; raf = requestAnimationFrame(frame);
      var T = (now - t0) % PER, ph = Math.floor((now - t0) / PER); if (ph !== lastPh) { lastPh = ph; played = {}; }
      var fade = T > 9800 ? 1 - cl((T - 9800) / 900) : cl(T / 300);
      var o = defs + '<circle cx="300" cy="300" r="250" fill="url(#hmGlow)"/>';
      o += '<g opacity="' + f(fade) + '">';
      // axes
      var ka = ease(T / 900);
      o += '<path d="' + seg([60, 300], [540, 300], ka) + seg([300, 60], [300, 540], ka) + '" stroke="#FF8A80" stroke-width="1.6" stroke-dasharray="22 5 4 5" fill="none" opacity=".85"/>';
      // circle by compass
      var kc = ease((T - 1500) / 2000), cAng = -Math.PI / 2 + kc * 2 * Math.PI, openK = ease((T - 900) / 600);
      o += '<path d="' + arc(C, R, -Math.PI / 2, kc * 2 * Math.PI) + '" stroke="#EAF2FF" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
      // stepping arcs
      var ks = cl((T - 3700) / 1800), stepI = Math.min(5, Math.floor(ks * 6)), arcs = '';
      for (var i = 1; i <= 6; i++) { var kk = cl(ks * 6 - (i - 1)); if (kk <= 0) break; var c0 = V[(i - 1) % 6], tg = V[i % 6], a2 = Math.atan2(tg[1] - c0[1], tg[0] - c0[0]); arcs += arc(c0, R, a2 - 0.22, 0.44 * kk); }
      o += '<path d="' + arcs + '" stroke="#9FC0FF" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
      // hexagon sides by pencil
      var kh = cl((T - 5700) / 2200), side = '', pen = null;
      for (var j = 0; j < 6; j++) { var kj = cl(kh * 6 - j); if (kj <= 0) break; side += seg(V[j], V[(j + 1) % 6], ease(kj)); if (kj < 1) pen = [V[j][0] + (V[(j + 1) % 6][0] - V[j][0]) * ease(kj), V[j][1] + (V[(j + 1) % 6][1] - V[j][1]) * ease(kj)]; }
      o += '<path d="' + side + '" stroke="url(#hmGold)" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
      V.forEach(function (v, q) { var kv = cl((T - 3700) / 1800 * 6 - q); if (kv > 0) o += '<circle cx="' + f(v[0]) + '" cy="' + f(v[1]) + '" r="' + f(4 * kv) + '" fill="#FFD678"/>'; });
      // dimensions
      var kd = ease((T - 8000) / 700);
      if (kd > 0) o += '<g opacity="' + f(kd) + '" class="mono"><path d="M300 300L' + f(300 + R * Math.cos(-0.5)) + ' ' + f(300 + R * Math.sin(-0.5)) + '" stroke="#9FC0FF" stroke-width="1.2"/><text x="' + f(300 + R * 0.62 * Math.cos(-0.5)) + '" y="' + f(300 + R * 0.62 * Math.sin(-0.5) - 10) + '" fill="#CFE0FF" font-size="20" text-anchor="middle">R 40</text><text x="300" y="' + f(300 + R + 46) + '" fill="#FFD678" font-size="19" text-anchor="middle" class="hm-ar">سداسي منتظم داخل دائرة</text></g>';
      o += '</g>';
      // logo always in centre
      o += '<circle cx="300" cy="300" r="98" fill="#FFFFFF" opacity=".96"/><image href="assets/logo.png" x="208" y="208" width="184" height="184" clip-path="url(#hmClip)" preserveAspectRatio="xMidYMid slice"/><circle cx="300" cy="300" r="98" fill="none" stroke="#2F7BEF" stroke-width="3" opacity=".7"/>';
      // tools
      var compOp = T < 900 ? 0 : (T < 5600 ? cl((T - 900) / 300) : 1 - cl((T - 5600) / 300));
      var compC = C, compA = cAng;
      if (T > 3600) { var si = Math.min(5, Math.floor(ks * 6)); compC = V[si]; var tg2 = V[(si + 1) % 6]; var aa = Math.atan2(tg2[1] - compC[1], tg2[0] - compC[0]); compA = aa - 0.22 + 0.44 * cl(ks * 6 - si); }
      o += compass(compC, R * (T < 1500 ? openK : 1), compA, compOp * fade);
      if (pen) o += pencil(pen, fade);
      svg.innerHTML = o;
      // sounds
      if (T > 1500 && T < 3500) snd('c' + Math.floor(T / 90), function () { sfx.play('pencil', .7); sfx.play('squeak', .3); });
      if (T > 3700 && T < 5500) snd('s' + Math.floor(T / 90), function () { sfx.play('pencil', .55); });
      if (T > 5700 && T < 7900) snd('h' + Math.floor(T / 90), function () { sfx.play('pencil', .8); });
      if (T > 8000) snd('done', function () { sfx.chime(); });
    }
    raf = requestAnimationFrame(frame);
    el.addEventListener('click', function (e) { if (e.target.closest('.hm-tile,.hm-btn')) sfx.tick(1400, 0.12); });
    return function () { alive = false; cancelAnimationFrame(raf); };
  }

  /* ---------- router ---------- */
  var root, unmount = null;
  var routes = { '': mountHome, home: mountHome, board: function (el) { return DLScreens.board(el); }, grid: function (el) { return DLScreens.grid(el); }, lab: function (el) { return DLScreens.lab(el); } };
  function go() {
    var r = (location.hash.replace(/^#\/?/, '') || '').split('?')[0];
    if (!routes[r]) r = '';
    if (unmount) { try { unmount(); } catch (e) {} }
    root.className = 'scr scr-' + (r || 'home');
    unmount = routes[r](root) || null;
    var titles = { '': 'معمل الرسم الفني', board: 'لوحة الرسم — معمل الرسم الفني', grid: 'ورقة المربعات — معمل الرسم الفني', lab: 'المعمل الافتراضي — معمل الرسم الفني' };
    document.title = titles[r] || titles[''];
  }
  window.addEventListener('DOMContentLoaded', function () {
    root = document.getElementById('app');
    window.addEventListener('hashchange', go);
    var full = standalone() || isFs() || (window.innerHeight >= screen.height - 4 && window.innerWidth >= screen.width - 4);
    if (full) { go(); HOME_PLAYED = true; } else { go(); splash(function () { HOME_PLAYED = true; }); }
    document.addEventListener('pointerdown', function () { sfx.init(); }, { once: true });
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) { navigator.serviceWorker.register('sw.js').catch(function () {}); }
    // fullscreen on double-tap of the logo area for classroom screens
    document.addEventListener('dblclick', function (e) { if (!e.target.closest('.logo')) return; e.preventDefault(); var d = document.documentElement; if (!document.fullscreenElement && d.requestFullscreen) d.requestFullscreen().catch(function () {}); else if (document.exitFullscreen) document.exitFullscreen(); });
  });
})();
