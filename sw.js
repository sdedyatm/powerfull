const CACHE_NAME = 'fp-cache-v1';
const URLS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/gh/nextapps-de/flexsearch@0.7.31/dist/flexsearch.bundle.js',
  'https://unpkg.com/dexie/dist/dexie.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(URLS)));
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('script.google.com')) return;
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
