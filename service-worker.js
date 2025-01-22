// Define cache name and files to cache
const CACHE_NAME = 'my-site-cache-v2';
const FALLBACK_PAGE = '/offline.html';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    FALLBACK_PAGE, // Offline fallback page
    '/images/logo.png', // Example of additional assets
];

// Install event - cache static assets
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache:', CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
            .catch(function(error) {
                console.error('Error during cache population:', error);
            })
    );
});

// Activate event - delete old caches
self.addEventListener('activate', function(event) {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve cached files or fetch from network
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Serve from cache if available
                if (response) {
                    return response;
                }

                // Fallback to network and cache dynamically
                return fetch(event.request)
                    .then(function(networkResponse) {
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Clone the response to store in cache
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then(function(cache) {
                            cache.put(event.request, responseClone);
                        });

                        return networkResponse;
                    });
            })
            .catch(function() {
                // If both cache and network fail, serve the fallback page
                return caches.match(FALLBACK_PAGE);
            })
    );
});

// Listen for the `message` event to allow manual skipWaiting
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Push notification (Optional: for future updates)
self.addEventListener('push', function(event) {
    const options = {
        body: event.data ? event.data.text() : 'New notification!',
        icon: '/images/icon.png',
        badge: '/images/badge.png',
    };

    event.waitUntil(
        self.registration.showNotification('My Site Notification', options)
    );
});
