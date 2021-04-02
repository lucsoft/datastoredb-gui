const cacheName = 'js13kPWA-v2';
const contentToCache = [
    '/',
    '/index.html',
    '/index.js',
    '/index.css',
    '/favicon.ico'
];

self.addEventListener('install', function (event) {
    console.log('install')
    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(contentToCache);
        })
    );
});
self.addEventListener('fetch', function (event) {
    console.log('fetch')
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});