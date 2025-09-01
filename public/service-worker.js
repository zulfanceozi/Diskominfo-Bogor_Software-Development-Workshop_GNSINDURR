const CACHE_NAME = "layanan-publik-v2"; // Increment version
const STATIC_CACHE = "static-v2";
const DYNAMIC_CACHE = "dynamic-v2";

const urlsToCache = [
  "/",
  "/public",
  "/admin",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// Install event - cache static resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("Opened static cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event - smart caching strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle different types of requests
  if (request.destination === 'document' || request.destination === '') {
    // For HTML pages, try network first, fallback to cache
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone the response before caching
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  } else if (request.destination === 'style' || request.destination === 'script') {
    // For CSS and JS, try cache first, fallback to network
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request).then(fetchResponse => {
            // Cache the new response
            const responseClone = fetchResponse.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
            return fetchResponse;
          });
        })
    );
  } else {
    // For other resources, try network first, fallback to cache
    event.respondWith(
      fetch(request)
        .then(response => {
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  }
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim all clients to ensure the new service worker takes control
      return self.clients.claim();
    })
  );
});

// Background sync for offline functionality
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle background sync tasks
  console.log("Background sync triggered");
  return Promise.resolve();
}

// Push notification handling
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "Update status pengajuan Anda",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Lihat Detail",
        icon: "/icon-192.png",
      },
      {
        action: "close",
        title: "Tutup",
        icon: "/icon-192.png",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification("Layanan Publik PWA", options)
  );
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/public?tab=status"));
  }
});
