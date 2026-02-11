// service-worker.js
// PWA Service Worker for offline support and caching

const STATIC_CACHE_NAME = 'sports-vision-static-v13';
const RUNTIME_CACHE_NAME = 'sports-vision-runtime-v2';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/main.css',

  // Core JS
  '/js/navigation.js',
  '/js/themeToggle.js',
  '/js/headerScroll.js',
  '/js/countryFlags.js',
  '/js/errorHandler.js',
  '/js/searchStream.js',
  '/js/streammanager.js',
  '/js/channelsmanager.js',
  '/js/sportsEventManager.js',
  '/js/advancedFeatures.js',
  '/js/anti-popup.js',
  '/js/pwa-install.js',
  '/js/mobileFilters.js',
  '/js/uxEnhancements.js',

  // Assets
  '/assets/icons/favicon.svg',
  '/assets/icons/favicon-96.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/icon-512.svg',
];

const STATIC_ASSET_PREFIXES = ['/css/', '/js/', '/assets/', '/files/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('Opened static cache:', STATIC_CACHE_NAME);
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [STATIC_CACHE_NAME, RUNTIME_CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      )
    )
  );

  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;
  if (request.headers.has('range')) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isApiRequest(url.pathname)) return;

  if (isHtmlRequest(request, url.pathname)) {
    event.respondWith(networkFirst(request, STATIC_CACHE_NAME));
    return;
  }

  if (isStaticAssetRequest(url.pathname)) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE_NAME));
  }
});

function isApiRequest(pathname) {
  return pathname === '/api' || pathname.startsWith('/api/');
}

function isStaticAssetRequest(pathname) {
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
    if (cacheName === RUNTIME_CACHE_NAME) {
      await trimCache(cacheName, 80);
    }
  }

  return response;
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;
    throw _error;
  }
}

function isCacheableResponse(response) {
  return response && response.ok && response.type === 'basic';
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length <= maxEntries) return;

  const overflowCount = keys.length - maxEntries;
  for (let i = 0; i < overflowCount; i += 1) {
    await cache.delete(keys[i]);
  }
}
