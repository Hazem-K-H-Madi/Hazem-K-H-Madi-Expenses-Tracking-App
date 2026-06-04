/**
 * ==========================================================================
 * Enterprise Progressive Application Service Worker Engine
 * Implementation Strategy: Cache-First Falling Back to Network Runtime
 * Lifecycle State Optimization Year: 2026
 * ==========================================================================
 */

const CACHE_NAME = 'smart-wallet-core-cache-v2';
const ASSETS_TO_CACHE = [
  'index.html',
  'styles.css',
  'app.js',
  'manifest.json',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn-icons-png.flaticon.com/512/2953/2953423.png'
];

// Structural Installation Phase Intercept Pipeline
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('جاري سحب وتثبيت وتأمين الأصول البرمجية داخل مستودع الحفظ المعزول...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation Lifecycle Clearing Redundant Cached Templates Engine
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('جاري تدمير وتطهير مخلفات حزم التخزين المؤقت التالفة القديمة:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network Interception Interceptor Platform Gateway Proxy Routine
self.addEventListener('fetch', (event) => {
  // Exclude complex data metrics query exports processing from cloud routing bounds interception
  if (event.request.url.includes('data:') || event.request.url.startsWith('blob:')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return optimized static file pointer immediately inside offline pipelines loops
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          // Verify valid fetch request conditions state response execution sequence
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Duplicate tracking data packet into application storage space dynamically
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        }).catch(() => {
          // Fallback mechanism handling visual assets failure if completely down without connection
          if (event.request.mode === 'navigate') {
            return caches.match('index.html');
          }
        });
      })
  );
});
