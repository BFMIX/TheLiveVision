// service-worker.js
// Versioned runtime caching with network-only HTML to avoid mixed old/new app shells.

const SW_VERSION = new URL(self.location.href).searchParams.get('v') || 'dev';
const STATIC_CACHE_NAME = `sports-vision-static-${SW_VERSION}`;
const RUNTIME_CACHE_NAME = `sports-vision-runtime-${SW_VERSION}`;

const STATIC_ASSET_PREFIXES = ['/js/', '/assets/', '/files/'];
const STATIC_EXACT_PATHS = ['/manifest.json'];
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [STATIC_CACHE_NAME, RUNTIME_CACHE_NAME];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;
  if (request.headers.has('range')) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isApiRequest(url.pathname)) return;
  if (isServiceWorkerAsset(url.pathname)) return;

  if (isHtmlRequest(request, url.pathname)) {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  if (isStaticAssetRequest(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
  }
});

function isApiRequest(pathname) {
  return pathname === '/api' || pathname.startsWith('/api/');
}

function isServiceWorkerAsset(pathname) {
  return pathname === '/service-worker.js';
}

function isStaticAssetRequest(pathname) {
  if (STATIC_EXACT_PATHS.includes(pathname)) return true;
  return STATIC_ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isHtmlRequest(request, pathname) {
  if (request.mode === 'navigate') return true;
  if (pathname === '/' || pathname === '/index.html') return true;

  const accept = request.headers.get('accept') || '';
  return accept.includes('text/html');
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) return cachedResponse;

  const response = await fetch(request);
  if (isCacheableResponse(response)) {
    await cache.put(request, response.clone());
    await trimCache(cacheName, 120);
  }

  return response;
}

function isCacheableResponse(response) {
  return response && response.ok && response.type === 'basic';
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length <= maxEntries) return;

  const overflowCount = keys.length - maxEntries;
  for (let index = 0; index < overflowCount; index += 1) {
    await cache.delete(keys[index]);
  }
}
