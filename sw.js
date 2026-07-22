const CACHE_NAME = 'ironlog-v20';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon.svg'
];

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
  const url = e.request.url;
  if (url.includes('cdn') || url.includes('unpkg') || url.includes('googleapis')) {
    e.respondWith(caches.open(CACHE_NAME).then(cache =>
      cache.match(e.request).then(r => r || fetch(e.request).then(res => {
        cache.put(e.request, res.clone());
        return res;
      }))
    ));
    return;
  }

  // Keep the app available offline while letting updated HTML be picked up after SW version changes.
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
