/**
 * Production High-Performance Offline-First Service Worker Engine Core Implementation
 * Caching Policy: Cache First with Immediate Network Fallback Synchronization Strategies.
 */

const CACHE_VERSION_ID_TOKEN = "HAZEM_FINTECH_CACHE_V1";
const STATIC_APPLICATION_SHELL_ASSETS = [
  "index.html",
  "styles.css",
  "app.js",
  "manifest.json",
  "https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap"
];

// Instantiating activation lifecycle events captures
self.addEventListener("install", (workerInstallLifecycleEvent) => {
  workerInstallLifecycleEvent.waitUntil(
    caches.open(CACHE_VERSION_ID_TOKEN).then((instantiatedCacheRegistryInstance) => {
      return instantiatedCacheRegistryInstance.addAll(STATIC_APPLICATION_SHELL_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Purging outdated residual legacy tracking cache parameters structures mapping storage layers
self.addEventListener("activate", (workerActivationLifecycleEvent) => {
  workerActivationLifecycleEvent.waitUntil(
    caches.keys().then((registeredCacheKeysCollection) => {
      return Promise.all(
        registeredCacheKeysCollection.map((activeCacheKeyName) => {
          if (activeCacheKeyName !== CACHE_VERSION_ID_TOKEN) {
            return caches.delete(activeCacheKeyName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Network interceptor fetch pipeline management hooks handlers actions
self.addEventListener("fetch", (networkFetchInterceptEvent) => {
  // Restricting storage fetching interceptors exclusively to standardized internal get requests structures
  if (networkFetchInterceptEvent.request.method !== "GET") return;

  networkFetchInterceptEvent.respondWith(
    caches.match(networkFetchInterceptEvent.request).then((matchingCachedAssetResponseInstance) => {
      if (matchingCachedAssetResponseInstance) {
        // Dynamic continuous caching update execution sequences background threads runs loop
        fetch(networkFetchInterceptEvent.request).then((freshNetworkResponsePayload) => {
          if (freshNetworkResponsePayload.status === 200) {
            caches.open(CACHE_VERSION_ID_TOKEN).then((activeCacheInstanceObject) => {
              activeCacheInstanceObject.put(networkFetchInterceptEvent.request, freshNetworkResponsePayload);
            });
          }
        }).catch(() => { /* Swallow background sync exceptions silently without disturbing main thread execution state */ });

        return matchingCachedAssetResponseInstance;
      }

      return fetch(networkFetchInterceptEvent.request).then((activeNetworkResponsePayload) => {
        if (!activeNetworkResponsePayload || activeNetworkResponsePayload.status !== 200 || activeNetworkResponsePayload.type !== "basic") {
          return activeNetworkResponsePayload;
        }

        const payloadClonedCopyInstance = activeNetworkResponsePayload.clone();
        caches.open(CACHE_VERSION_ID_TOKEN).then((targetCacheStoreWriteObject) => {
          targetCacheStoreWriteObject.put(networkFetchInterceptEvent.request, payloadClonedCopyInstance);
        });

        return activeNetworkResponsePayload;
      }).catch(() => {
        // Fallback interface logic can be mapped here safely if necessary parameters parameters checks elements are matched
      });
    })
  );
});
