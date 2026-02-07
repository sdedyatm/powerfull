const BASE = "/powerfull/";
const CACHE = "atm-enterprise-v2";
const ASSETS = [
  BASE,
  BASE + "index.html",
  BASE + "app.js",
  BASE + "worker-search.js",
  BASE + "manifest.json"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(self.clients.claim());
});
