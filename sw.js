// Service Worker: speichert alle Dateien der App, damit sie ohne Internet startet.
// Bei jeder Änderung an der App CACHE hochzählen, sonst sieht das iPad die alte Version.
// Neue Dateien in FILES eintragen (der Test tests/offline.test.mjs prüft das).
const CACHE = 'rt-app-v7';
const FILES = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'registry.js',
  'manifest.json',
  'lib/poly.js',
  'rechner/hurwitz.js',
  'ui/dom.js',
  'ui/render.js',
  'ui/hurwitz.js',
  'lib/zustandsraum-bruch.js',
  'rechner/zustandsraum.js',
  'ui/zustandsraum.js',
  'lib/regelkreis-rational.js',
  'rechner/regelkreis.js',
  'ui/regelkreis.js',
  'lib/netzwerk-algebra.js',
  'lib/netzwerk-parse.js',
  'rechner/netzwerk.js',
  'ui/netzwerk.js',
  'lib/pbz-mathe.js',
  'rechner/pbz.js',
  'ui/pbz.js',
  'rechner/sps-zahlen.js',
  'ui/sps-zahlen.js',
  'rechner/sps-logik.js',
  'lib/sps-logik-fup.js',
  'ui/sps-logik.js',
  'lib/polynom-kern.js',
  'rechner/polynom.js',
  'ui/polynom.js',
  'rechner/dgl.js',
  'ui/dgl.js',
  'lib/matrix-bruch.js',
  'rechner/matrix.js',
  'ui/matrix.js',
  'lib/linearisierung-ausdruck.js',
  'rechner/linearisierung.js',
  'ui/linearisierung.js',
  'rechner/pid.js',
  'ui/pid.js',
  'lib/signalfluss-algebra.js',
  'lib/signalfluss-s.js',
  'rechner/signalfluss.js',
  'ui/signalfluss.js',
  'ui/antwort.js',
  'inhalte/index.js',
  'inhalte/theorie-grundlagen.js',
  'inhalte/theorie-glieder.js',
  'inhalte/sps-theorie.js',
  'inhalte/python-theorie.js',
  'inhalte/python-lueckentexte.js',
  'inhalte/vorlesung-01.js',
  'inhalte/vorlesung-02.js',
  'inhalte/vorlesung-03.js',
  'inhalte/vorlesung-04.js',
  'inhalte/vorlesung-05.js',
  'inhalte/vorlesung-06.js',
  'inhalte/vorlesung-07.js',
  'inhalte/vorlesung-08.js',
  'inhalte/vorlesung-09.js',
  'ui/python-lueckentext.js',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

// cache: 'reload' = am Browser-Zwischenspeicher vorbei frisch vom Server holen,
// sonst landet bei einem Update die alte Version im neuen Speicher.
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Erst aus dem Speicher, sonst aus dem Netz.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request))
  );
});
