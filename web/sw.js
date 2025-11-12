// Clipper Aviation Logistics - Service Worker
// Desktop PWA functionality with offline support

const CACHE_NAME = 'clipper-aviation-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Resources to cache for offline functionality
const CACHE_URLS = [
  '/',
  '/offline.html',
  '/assets/desktop.css',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  
  // Essential app routes
  '/?tab=dashboard',
  '/?tab=inventory',
  '/?tab=orders',
  '/?tab=shipments',
  '/?tab=analytics',
  '/?tab=customers',
  '/?tab=suppliers',
  '/?tab=reports',
  
  // Fonts
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  
  // Icons
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('Clipper SW: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Clipper SW: Caching app shell');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('Clipper SW: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Clipper SW: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Clipper SW: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('clipper-') && cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('Clipper SW: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Clipper SW: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('Clipper SW: Serving from cache', event.request.url);
          return response;
        }
        
        // Try to fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not successful
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response for caching
            const responseToCache = response.clone();
            
            // Cache dynamic content
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Offline fallback
            console.log('Clipper SW: Network failed, serving offline page');
            
            // For navigation requests, serve offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            // For other requests, try to find a cached fallback
            if (event.request.destination === 'image') {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#999">Offline</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            
            return new Response('Offline', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Clipper SW: Background sync', event.tag);
  
  if (event.tag === 'background-sync-orders') {
    event.waitUntil(syncOrders());
  } else if (event.tag === 'background-sync-inventory') {
    event.waitUntil(syncInventory());
  }
});

// Push notifications for desktop
self.addEventListener('push', (event) => {
  console.log('Clipper SW: Push notification received');
  
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  
  const options = {
    title: data.title || 'Clipper Aviation',
    body: data.body || 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view-action.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-action.png'
      }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Clipper SW: Notification clicked', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Open the app or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Focus existing window if available
        for (let client of clientList) {
          if (client.url.includes('clipper') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Message handling from main app
self.addEventListener('message', (event) => {
  console.log('Clipper SW: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(event.data.urls);
      });
  }
});

// Sync functions
async function syncOrders() {
  try {
    console.log('Clipper SW: Syncing orders...');
    
    // Get pending orders from IndexedDB
    const pendingOrders = await getPendingOrders();
    
    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(order)
        });
        
        if (response.ok) {
          await removePendingOrder(order.id);
          console.log('Clipper SW: Order synced', order.id);
        }
      } catch (error) {
        console.error('Clipper SW: Failed to sync order', order.id, error);
      }
    }
  } catch (error) {
    console.error('Clipper SW: Sync orders failed', error);
  }
}

async function syncInventory() {
  try {
    console.log('Clipper SW: Syncing inventory...');
    
    // Get pending inventory updates from IndexedDB
    const pendingUpdates = await getPendingInventoryUpdates();
    
    for (const update of pendingUpdates) {
      try {
        const response = await fetch(`/api/inventory/${update.partId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(update.data)
        });
        
        if (response.ok) {
          await removePendingInventoryUpdate(update.id);
          console.log('Clipper SW: Inventory synced', update.partId);
        }
      } catch (error) {
        console.error('Clipper SW: Failed to sync inventory', update.partId, error);
      }
    }
  } catch (error) {
    console.error('Clipper SW: Sync inventory failed', error);
  }
}

// IndexedDB helpers (simplified)
function getPendingOrders() {
  return new Promise((resolve) => {
    // Simulate getting pending orders
    resolve([]);
  });
}

function removePendingOrder(id) {
  return new Promise((resolve) => {
    // Simulate removing pending order
    resolve();
  });
}

function getPendingInventoryUpdates() {
  return new Promise((resolve) => {
    // Simulate getting pending inventory updates
    resolve([]);
  });
}

function removePendingInventoryUpdate(id) {
  return new Promise((resolve) => {
    // Simulate removing pending inventory update
    resolve();
  });
}

// Periodic background sync (for browsers that support it)
self.addEventListener('periodicsync', (event) => {
  console.log('Clipper SW: Periodic sync', event.tag);
  
  if (event.tag === 'daily-sync') {
    event.waitUntil(performDailySync());
  }
});

async function performDailySync() {
  try {
    console.log('Clipper SW: Performing daily sync...');
    
    // Update cached data
    await updateCachedData();
    
    // Clean up old data
    await cleanupOldData();
    
    console.log('Clipper SW: Daily sync complete');
  } catch (error) {
    console.error('Clipper SW: Daily sync failed', error);
  }
}

async function updateCachedData() {
  // Update critical app data in cache
  const cache = await caches.open(CACHE_NAME);
  
  const urlsToUpdate = [
    '/api/dashboard-stats',
    '/api/inventory/summary',
    '/api/orders/recent'
  ];
  
  for (const url of urlsToUpdate) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.log('Clipper SW: Failed to update cached data', url);
    }
  }
}

async function cleanupOldData() {
  // Clean up old cached responses
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const dateHeader = response.headers.get('date');
      if (dateHeader) {
        const responseDate = new Date(dateHeader).getTime();
        if (responseDate < oneWeekAgo) {
          await cache.delete(request);
          console.log('Clipper SW: Cleaned up old cache entry', request.url);
        }
      }
    }
  }
}