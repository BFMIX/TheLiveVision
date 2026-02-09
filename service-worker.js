// service-worker.js
// PWA Service Worker for offline support and caching

const CACHE_NAME = "sports-vision-v7"; // Updated version to clear old cache
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/css/style.css",

  // Core JS
  "/js/navigation.js",
  "/js/themeToggle.js",
  "/js/headerScroll.js",
  "/js/countryFlags.js",
  "/js/errorHandler.js",
  "/js/searchStream.js",
  "/js/streammanager.js",
  "/js/streammanager.js?v=7",
  "/js/channelsmanager.js",
  "/js/sportsEventManager.js",

  // Assets
  "/assets/icons/favicon.svg",
  "/assets/icons/favicon-96.png",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
  "/assets/icons/icon-512.svg",

  // Optional data
  "/files/allchannels.csv",
];

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache v7");
      return cache.addAll(urlsToCache);
    }),
  );
  self.skipWaiting();
});

// Fetch event - Network first, fallback to cache (better for dynamic content)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request);
      }),
  );
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  return self.clients.claim();
});
