const cacheName = 'budget-v1';
const assets = [
  'index.html',
  'manifest.json'
];

// تثبيت وحفظ الملفات في الكاش
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll(assets);
    })
  );
});

// تشغيل التطبيق واستدعاء الملفات من الكاش مباشرة (أوفلاين)
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      return cachedResponse || fetch(e.request);
    })
  );
});
