/**
 * Resilient Cache-First Service Worker Engine
 * Provides Instant Load and Total Offline Autonomy
 */

const CACHE_NAME = 'HAZEM_FINTECH_CACHE_V1';
const ASSETS_TO_CACHE = [
    'index.html',
    'styles.css',
    'app.js',
    'manifest.json',
    'icons/icon-192.png',
    'icons/icon-512.png'
];

// مرحلة التثبيت المبدئي وحظر الموارد الأساسية في الذاكرة المعزولة
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('عزل وتأمين كاش الموارد الفينتك الثابتة...');
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

// تفعيل وتطهير الإصدارات السابقة لضمان عدم تعارض البيانات أو جمود الواجهات
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('تنظيف وتدمير الكاش القديم المتهالك:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// استراتيجية الجلب الذكية (Cache-First with Network Fallback Strategy)
self.addEventListener('fetch', (event) => {
    // عدم تتبع أو اعتراض طلبات الامتدادات الخارجية أو روابط التحقق الخارجية لعدم إعاقة الأداء
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                
                // نسخ المورد الجديد في الكاش ديناميكياً لتأمين الطلبات المستقبلية
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            });
        }).catch(() => {
            // توفير مستند الأمان البديل في حال السقوط التام للاتصال وعدم العثور على المورد
            if (event.request.mode === 'navigate') {
                return caches.match('index.html');
            }
        })
    );
});
