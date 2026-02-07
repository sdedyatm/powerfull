const CACHE = "atm-enterprise-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/app.js",
  "/worker-search.js",
  "/manifest.json"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => clients.claim());

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

self.addEventListener("sync", e => {
  if (e.tag === "atm-bg-sync") {
    e.waitUntil(fetch("/"));
  }
});
