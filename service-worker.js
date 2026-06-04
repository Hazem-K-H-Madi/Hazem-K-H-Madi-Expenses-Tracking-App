/**
 * PWA Service Worker Network Isolation Engine
 * Implements Instant-Load Cache First Optimization Architecture Strategy
 */

const CACHE_NAME = 'fin-pwa-v1-engine-assets';
const ASSETS_TO_CACHE = [
    'index.html',
    'styles.css',
    'app.js',
    'manifest.json',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap'
];

// SW Installation Phase: Force Structural Assets Into Core Local Cache Storage
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => {
            return self.skipWaiting();
        })
    );
});

// SW Activation Phase: Clean Out Outdated Historic Version Stacks Instantly
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// SW Intercept Fetch Handling: Serve Offline Cache with Zero Network Overhead Network Fallback
self.addEventListener('fetch', (e) => {
    // Restrict processing scope only onto native relative web fetch queries
    if (!e.request.url.startsWith(self.location.origin) && !e.request.url.startsWith('https://fonts.')) {
        return;
    }

    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(e.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, responseToCache);
                });
                return networkResponse;
            }).catch(() => {
                // Fallback graceful degradation configuration profiles could go here
            });
        })
    );
});
