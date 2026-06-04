/**
 * Production Resilient Service Worker Blueprint Framework
 * Handles instantaneous offline asset isolation management caching strategies.
 */

const CACHE_VERSION_NAME_VAULT_SIGNATURE = 'finance-engine-static-v1';
const ISOLATED_CORE_ASSETS_MANIFEST_ARRAY = [
  'index.html',
  'styles.css',
  'app.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// SW Install Lifecycle Phase Event Hook Interceptor Line
self.addEventListener('install', (installLifecycleEvent) => {
  installLifecycleEvent.waitUntil(
    caches.open(CACHE_VERSION_NAME_VAULT_SIGNATURE).then((openedCacheVaultInstance) => {
      return openedCacheVaultInstance.addAll(ISOLATED_CORE_ASSETS_MANIFEST_ARRAY);
    }).then(() => self.skipWaiting())
  );
});

// SW Activation Phase Purging Unused Caches Sequences Hooks Pipeline Channels Maps
self.addEventListener('activate', (activationLifecycleEvent) => {
  activationLifecycleEvent.waitUntil(
    caches.keys().then((associatedCacheKeysCollectionList) => {
      return Promise.all(
        associatedCacheKeysCollectionList.map((existingCacheKeySignatureString) => {
          if (existingCacheKeySignatureString !== CACHE_VERSION_NAME_VAULT_SIGNATURE) {
            return caches.delete(existingCacheKeySignatureString);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Cache-First Isolation Interception Interceptor Network Streams Implementation Strategy Mapping Loops
self.addEventListener('fetch', (networkFetchInterceptEvent) => {
  // Ignore external analytic post requests types configurations safely
  if (networkFetchInterceptEvent.request.method !== 'GET') return;

  networkFetchInterceptEvent.respondWith(
    caches.match(networkFetchInterceptEvent.request).then((stashedCacheAssetNodeFallbackResponse) => {
      if (stashedCacheAssetNodeFallbackResponse) {
        return stashedCacheAssetNodeFallbackResponse;
      }
      
      return fetch(networkFetchInterceptEvent.request).then((liveNetworkFetchStreamPayloadResultResponse) => {
        // Evaluate valid network asset payload capture characteristics before stashing dynamically
        if (!liveNetworkFetchStreamPayloadResultResponse || liveNetworkFetchStreamPayloadResultResponse.status !== 200 || liveNetworkFetchStreamPayloadResultResponse.type !== 'basic') {
          return liveNetworkFetchStreamPayloadResultResponse;
        }

        const networkPayloadCloneForCachingStorageChannel = liveNetworkFetchStreamPayloadResultResponse.clone();
        caches.open(CACHE_VERSION_NAME_VAULT_SIGNATURE).then((targetCacheVaultAllocationWriteBlock) => {
          targetCacheVaultAllocationWriteBlock.put(networkFetchInterceptEvent.request, networkPayloadCloneForCachingStorageChannel);
        });

        return liveNetworkFetchStreamPayloadResultResponse;
      }).catch(() => {
        // Fallback interface maps error handling responses structures targets contexts matches
      });
    })
  );
});
