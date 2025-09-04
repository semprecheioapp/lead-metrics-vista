const CACHE_NAME = 'dashboard-mbk-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/885ae572-dec3-4868-92e1-8b1fcd6023e6.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip external requests
  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Serve from cache
          return cachedResponse;
        }
        
        // Fetch from network and cache dynamic content
        return fetch(request)
          .then(response => {
            // Don't cache error responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Cache dynamic content
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Offline fallback
            if (request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-leads') {
    event.waitUntil(syncOfflineActions());
  }
});

// Sync offline actions when back online
async function syncOfflineActions() {
  try {
    // Get pending actions from IndexedDB or localStorage
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        await executeAction(action);
        await removePendingAction(action.id);
      } catch (error) {
        console.log('Failed to sync action:', error);
      }
    }
  } catch (error) {
    console.log('Sync failed:', error);
  }
}

// Helper functions (implement based on your data structure)
async function getPendingActions() {
  // Implementation depends on your offline storage strategy
  return [];
}

async function executeAction(action) {
  // Execute the pending action
  console.log('Executing action:', action);
}

async function removePendingAction(actionId) {
  // Remove from pending actions
  console.log('Removing action:', actionId);
}