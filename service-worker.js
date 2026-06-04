/**
 * محرك التشغيل المستقل وعازل الموارد والشبكة (Service Worker)
 * المطور: Hazem K H Madi - Senior Product Designer
 * إدارة حزم التخزين المؤقت الفائقة والعمل المستمر بلا اتصال بالإنترنت 100%.
 */

const CACHE_NAME = 'smart-financier-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap',
    'https://cdn-icons-png.flaticon.com/512/2489/2489756.png'
];

// 1. مرحلة التثبيت الأولي: حجز وضخ الموارد والملفات الأساسية في الذاكرة الصلبة للمتصفح
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] تم حصر وتخزين الهيكل البنيوي والملفات بنجاح.');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting()) // تفعيل فوري دون انتظار إغلاق التبويبات المفتوحة مسبقاً
    );
});

// 2. مرحلة التنشيط: تطهير حزم التخزين القديمة والمستهلكة تلقائياً عند تحديث النظام
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] يتم الآن تدمير وتطهير حزمة التخزين القديمة:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. استراتيجية اعتراض ومعالجة الطلبات الشبكية الذكية (Stale-While-Revalidate Strategy)
// توفر تجربة فتح فورية للمستخدم عن طريق جلب البيانات من الكاش أولاً، وتحديثها من الشبكة في الخلفية
self.addEventListener('fetch', (event) => {
    // استثناء طلبات البيانات الخارجية غير القابلة للتخزين (مثل بروتوكولات معينة أو تتبع خارجي)
    if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('https://fonts.googleapis.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // إرسال النسخة المخزنة فوراً لإنعاش الشاشة، ثم جلب وتحديث الملف في الخلفية للزيارة القادمة
                fetch(event.request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, networkResponse);
                            });
                        }
                    })
                    .catch(() => { /* صامت - الشبكة مقطوعة والملف المخزن كافٍ */ });
                    
                return cachedResponse;
            }

            // في حال عدم توفر المورد في الكاش، يتم جلبه من الشبكة مباشرة كحالة افتراضية
            return fetch(event.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                
                return networkResponse;
            });
        })
    );
});
