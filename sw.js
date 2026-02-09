const CACHE_NAME = "atm-pwa-v-" + Date.now();
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png', // Tambahkan ini
  './icon-512.png', // Tambahkan ini
  'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/gh/nextapps-de/flexsearch@0.7.31/dist/flexsearch.bundle.js',
  'https://unpkg.com/dexie/dist/dexie.js'
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    )
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.url.includes("script.google.com")) return;
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
