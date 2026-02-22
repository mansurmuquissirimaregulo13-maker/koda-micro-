// Kill-switch Service Worker
// This replaces the old caching worker and forces the browser to delete all caches and unregister.
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    console.log('Deleting cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            self.registration.unregister();
        }).then(() => {
            return self.clients.matchAll();
        }).then((clients) => {
            clients.forEach(client => {
                if (client.url && "navigate" in client) {
                    client.navigate(client.url);
                }
            });
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Pass through all requests to network
    event.respondWith(fetch(event.request));
});

