const CACHE_NAME = 'field-pro-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/gh/nextapps-de/flexsearch@0.7.31/dist/flexsearch.bundle.js',
  'https://unpkg.com/dexie/dist/dexie.js'
];

// Install: Simpan semua aset UI ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: Hapus cache lama jika ada update versi
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch: Ambil dari cache dulu, jika tidak ada baru ambil ke network
self.addEventListener('fetch', (event) => {
  // Biarkan request ke GAS (API) lewat tanpa masuk ke Cache Storage 
  // karena kita sudah mengelolanya via IndexedDB (Dexie) di index.html
  if (event.request.url.includes('script.google.com')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
