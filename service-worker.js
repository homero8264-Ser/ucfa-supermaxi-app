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
    // Update cache with fresh copy
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
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
        // update cache asynchronously
        caches.open(CACHE_NAME).then(cache => cache.put(request, networkResponse.clone()));
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

