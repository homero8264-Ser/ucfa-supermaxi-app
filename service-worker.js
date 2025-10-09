/*
 Improved service worker with:
 - cache versioning
 - network-first for navigation (index.html) and JSON
 - cache-first for static assets (css/js/images)
 - skipWaiting via message
 - clients.claim on activate
*/

const CACHE_VERSION = 'v2';
const CACHE_NAME = `ucfa-cache-${CACHE_VERSION}`;
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './datos.json',
  './goleadores.json',
  './proxima_fecha.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // try to activate new SW asap
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  clients.claim();
});

// Helper to perform network-first for HTML/JSON
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    // Update cache with fresh copy (only for successful, cachable responses)
    try {
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        try {
          await cache.put(request, response.clone());
        } catch (e) {
          // cloning/put can fail if the body stream was already used or for opaque responses
          console.warn('Cache put failed (networkFirst):', e);
        }
      }
    } catch (e) {
      console.warn('Opening cache failed (networkFirst):', e);
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const acceptHeader = request.headers.get('accept') || '';

  // Navigation requests (SPA / index.html) -> network-first
  if (acceptHeader.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // JSON/API requests -> network-first
  if (request.url.endsWith('.json') || acceptHeader.includes('application/json')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // For other requests (css/js/images) serve from cache first, then fetch in background
  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request).then(networkResponse => {
        // update cache asynchronously for cachable responses
        (async () => {
          try {
            if (networkResponse && networkResponse.ok) {
              const cache = await caches.open(CACHE_NAME);
              try {
                await cache.put(request, networkResponse.clone());
              } catch (e) {
                console.warn('Cache put failed (fetch handler):', e);
              }
            }
          } catch (e) {
            console.warn('Cache open failed (fetch handler):', e);
          }
        })();
        return networkResponse;
      }).catch(() => null);
      return cached || fetchPromise;
    })
  );
});

// Listen for messages (skipWaiting)
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

