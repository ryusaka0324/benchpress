const CACHE_NAME = 'ironlog-v5';
const ASSETS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('cdn') || e.request.url.includes('unpkg') || e.request.url.includes('googleapis')) {
    e.respondWith(caches.open(CACHE_NAME).then(cache =>
      cache.match(e.request).then(r => r || fetch(e.request).then(res => {
        cache.put(e.request, res.clone());
        return res;
      }))
    ));
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
