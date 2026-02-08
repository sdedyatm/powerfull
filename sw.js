const CACHE_NAME = "fp-v" + Date.now(); // Dinamis agar selalu baru saat dideploy
const OFFLINE_URLS = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(OFFLINE_URLS)));
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
