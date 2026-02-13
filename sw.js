const CACHE_NAME = "atm-pwa-v-" + Date.now(); // Update otomatis versi cache berdasarkan timestamp saat ini

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./app.js", // <--- File utama aplikasi (Logika Sync & UI)
  "./worker-search.js", // <--- File Web Worker (Mesin Pencari FlexSearch)
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  // Bootstrap 5.3 + Icons (CDN)
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css",
  // Fonts
  "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
  // External Libraries
  "https://cdn.jsdelivr.net/gh/nextapps-de/flexsearch@0.7.31/dist/flexsearch.bundle.js",
  "https://unpkg.com/dexie/dist/dexie.js"
];

// 1. EVENT: INSTALL (Penyimpanan Awal Assets)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("SW: Mengunduh Assets ke Cache...");
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. EVENT: ACTIVATE (Pembersihan Cache Lama)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log("SW: Menghapus Cache Lama:", name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. EVENT: FETCH (Proxy Permintaan Data)
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // STRATEGI A: Khusus Google Apps Script (Network First)
  // Kita ingin data terbaru dari server, jika offline baru kirim respons kosong
  if (url.includes("script.google.com")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ offline: true, data: [] }), {
          headers: { "Content-Type": "application/json" }
        });
      })
    );
    return;
  }

  // STRATEGI B: Assets Aplikasi (Stale-While-Revalidate)
  // Ambil dari Cache (Cepat), lalu update Cache di background (Fresh)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Update di latar belakang
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          })
          .catch(() => {}); // Abaikan jika gagal update karena offline

        return cachedResponse; // Kembalikan versi cache yang tersedia segera
      }

      // Jika tidak ada di cache, ambil dari jaringan
      return fetch(event.request).catch(() => {
        // Jika benar-benar offline dan request adalah navigasi halaman, balikkan index.html
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
