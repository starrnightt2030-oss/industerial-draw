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

  /* ---------- home ---------- */
  function mountHome(el) {
    var timers = [];
    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function span(a, b, name, lvl) { for (var t = a; t < b; t += 45) (function (t) { at(t, function () { sfx.play(name, typeof lvl === 'function' ? lvl((t - a) / (b - a)) : lvl); }); })(t); }
    function soundtrack() {
      sfx.init(); at(150, function () { sfx.thud(); }); [750, 850, 950, 1050].forEach(function (t) { at(t, function () { sfx.rip(); }); });
      span(700, 1500, 'ruler', function (k) { return Math.sin(Math.PI * k) * 0.9; }); span(1500, 2200, 'ruler', function (k) { return Math.sin(Math.PI * k) * 0.6; });
      at(2200, function () { sfx.clack(); }); span(2100, 2900, 'slide', function (k) { return Math.sin(Math.PI * k); }); at(2900, function () { sfx.clack(); }); at(3200, function () { sfx.clack(); });
      span(3200, 4300, 'pencil', 0.9); span(4250, 5100, 'pencil', 0.95); span(5400, 7100, 'pencil', 0.85); span(5400, 7100, 'squeak', 0.4);
      at(7150, function () { sfx.clack(); }); span(7150, 7600, 'pencil', 0.8); at(7700, function () { sfx.chime(); });
    }
    var compact = window.innerHeight < 560 || window.innerWidth < 900;
    if (compact) {
      el.innerHTML = '<div class="mhome"><div class="mh-brand"><img src="assets/logo.png" alt="شعار مركز تدريب شركة ترسانة الإسكندرية"><div><small>مركز تدريب شركة ترسانة الإسكندرية</small><h1>معمل <span>الرسم الفني</span></h1><p>ارسم بالأدوات الحقيقية وطبّق كل خطوة بيدك.</p></div></div>' +
        '<div class="mh-cards"><a href="#/board" class="mh-card"><b>لوحة الرسم</b><small>مسطرة T · مثلثان · فرجار · أبعاد</small></a><a href="#/grid" class="mh-card"><b>ورقة المربعات</b><small>تطبيق موجّه خطوة بخطوة</small></a><a href="#/lab" class="mh-card"><b>المعمل الافتراضي</b><small>14 مجسمًا · تفكيك · مساقط</small></a></div>' +
        '<div class="mh-foot"><button type="button" class="hb snd-txt snd"><svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path class="sp" d="' + (sfx.on ? SOUND_ON : SOUND_OFF) + '"/></svg><span class="sl">' + (sfx.on ? 'الصوت' : 'بدون صوت') + '</span></button><span dir="ltr" class="mono">Designed &amp; Developed by <b>Mohamed-Eldawly</b></span></div></div>';
      return function () {};
    }
    el.innerHTML = '<style>' + window.DL_HOME_CSS + '</style><div class="home-fit"><div class="home-stage">' + window.DL_HOME_TPL + '</div></div>';
    var stage = el.querySelector('.home-stage'), scene = el.querySelector('#hm-scene'), sceneHtml = scene.innerHTML;
    function fit() { var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080); stage.style.transform = 'translate(-50%,-50%) scale(' + s + ')'; }
    fit(); window.addEventListener('resize', fit);
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act="replay"]'); if (!b) return;
      timers.forEach(clearTimeout); timers = []; if (!sfx.on) sfx.setOn(true);
      scene.innerHTML = ''; void scene.offsetWidth; scene.innerHTML = sceneHtml; soundtrack();
    });
    return function () { timers.forEach(clearTimeout); window.removeEventListener('resize', fit); };
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
    window.addEventListener('hashchange', go); go();
    document.addEventListener('pointerdown', function () { sfx.init(); }, { once: true });
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) { navigator.serviceWorker.register('sw.js').catch(function () {}); }
    // fullscreen on double-tap of the logo area for classroom screens
    document.addEventListener('dblclick', function (e) { if (!e.target.closest('.logo')) return; e.preventDefault(); var d = document.documentElement; if (!document.fullscreenElement && d.requestFullscreen) d.requestFullscreen().catch(function () {}); else if (document.exitFullscreen) document.exitFullscreen(); });
  });
})();
