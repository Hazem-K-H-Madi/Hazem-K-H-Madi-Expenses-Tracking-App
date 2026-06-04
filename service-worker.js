/**
 * عامل الخدمة المعزول (Service Worker) - استراتيجية الكاش أولاً للموثوقية الكاملة
 */

const CACHE_NAME = 'fintech-pwa-cache-v1';
const OFFLINE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json'
];

// مرحلة التثبيت والتحميل المسبق للأصول المستقرة والساكنة
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// تنشيط وتطهير الكاشات القديمة لضمان الأمان الهيكلي للذاكرة
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
    }).then(() => self.clients.claim())
  );
});

// جسر جلب البيانات واعتراض الطلبات للتشغيل المستقل تماماً بدون شبكة (Offline Isolation)
self.addEventListener('fetch', (event) => {
  // عدم اعتراض أي طلبات خارجية بخلاف واجهات التطبيق الأساسية المحددة في أصولنا
  if (event.request.mode === 'navigate' || OFFLINE_ASSETS.some(asset => event.request.url.includes(asset.replace('./', '')))) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).catch(() => {
          return caches.match('./index.html');
        });
      })
    );
  }
});
