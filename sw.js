const CACHE_NAME = "atm-pwa-v-" + Date.now();
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./worker-search.js", // Penting untuk pencarian cepat
  "./manifest.json",
  "./icon-192.png", // Ikon PWA Anda
  "./icon-512.png", // Ikon PWA Anda
  // Bootstrap 5.3 + Icons
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css",
  // Fonts
  "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
  // Library eksternal
  "https://cdn.jsdelivr.net/gh/nextapps-de/flexsearch@0.7.31/dist/flexsearch.bundle.js",
  "https://unpkg.com/dexie/dist/dexie.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Selalu network first untuk sync data (Google Apps Script)
  if (event.request.url.includes("script.google.com")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Offline: kembalikan response kosong (data tetap dari IndexedDB lokal)
        return new Response(JSON.stringify({}), {
          headers: { "Content-Type": "application/json" }
        });
      })
    );
    return;
  }

  // Untuk assets lain: cache first, fallback network, update cache di background
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Update cache di background agar tetap fresh
        fetch(event.request)
          .then((networkResponse) => {
            caches
              .open(CACHE_NAME)
              .then((cache) =>
                cache.put(event.request, networkResponse.clone())
              );
          })
          .catch(() => {}); // Jika offline, abaikan update
        return cachedResponse;
      }

      // Jika tidak ada di cache, ambil dari network
      return fetch(event.request).catch(() => {
        // Offline fallback: kembalikan index.html agar tampilan app tetap muncul
        return caches.match("./index.html");
      });
    })
  );
});
