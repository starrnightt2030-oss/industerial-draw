/* معمل الرسم الفني — offline cache (Designed & Developed by Mohamed-Eldawly) */
var CACHE = 'dl-v3';
var FILES = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/sfx.js', 'js/dl-geo.js', 'js/lessons.js', 'js/board.js', 'js/lab.js', 'js/app.js',
  'assets/logo.png', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/maskable-192.png', 'assets/icons/maskable-512.png', 'assets/icons/apple-touch.png',
  'assets/fonts/reem-kufi-arabic-700-normal.woff2', 'assets/fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2', 'assets/fonts/ibm-plex-sans-arabic-arabic-500-normal.woff2', 'assets/fonts/ibm-plex-sans-arabic-arabic-600-normal.woff2', 'assets/fonts/ibm-plex-sans-arabic-arabic-700-normal.woff2',
  'assets/fonts/ibm-plex-sans-arabic-latin-400-normal.woff2', 'assets/fonts/ibm-plex-sans-arabic-latin-500-normal.woff2', 'assets/fonts/ibm-plex-sans-arabic-latin-600-normal.woff2', 'assets/fonts/ibm-plex-sans-arabic-latin-700-normal.woff2',
  'assets/fonts/ibm-plex-mono-latin-400-normal.woff2', 'assets/fonts/ibm-plex-mono-latin-600-normal.woff2', 'assets/fonts/architects-daughter-latin-400-normal.woff2', 'assets/fonts/reem-kufi-arabic-400-normal.woff2'
];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (r) {
    var net = fetch(e.request).then(function (res) { if (res && res.ok && new URL(e.request.url).origin === location.origin) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); } return res; }).catch(function () { return r; });
    return r || net;
  }));
});
