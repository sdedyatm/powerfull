// Ganti angka dibelakang v menjadi lebih tinggi setiap kali Anda update HTML
const CACHE_NAME = "atm-power-v5";

const OFFLINE_URLS = ["./", "./index.html", "./manifest.json"];

// Force SW untuk segera aktif setelah install
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(OFFLINE_URLS)));
});

// Menghapus cache lama secara otomatis
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Menghapus cache lama:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.url.includes("script.google.com")) return;
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
