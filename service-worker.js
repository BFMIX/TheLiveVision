// service-worker.js
// PWA Service Worker for offline support and caching

const CACHE_NAME = 'sports-vision-v2'; // Updated version to clear old cache
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/navigation.js',
  '/js/themeToggle.js',
  '/js/headerScroll.js',
  '/js/countryFlags.js',
  '/js/errorHandler.js',
  '/js/searchStream.js',
  '/js/favorites.js',
  '/js/streamManager.js',
  '/js/channelsManager.js',
  '/js/sportsEventManager.js',
  '/files/allchannels.csv'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache v2');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch event - Network first, fallback to cache (better for dynamic content)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});
