const cacheName = 'smart-budget-v2';
const assets = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png'
];

// مرحلة التثبيت: حفظ الملفات في ذاكرة الهاتف الكاش
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    }).then(() => self.skipWaiting())
  );
});

// تفعيل السيرفس وركر ومسح الملفات القديمة تلقائيًا
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== cacheName) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// استدعاء الملفات أوفلاين: يعتمد على الكاش أولاً بشكل كامل وسريع جداً
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      return cachedResponse || fetch(e.request);
    })
  );
});
