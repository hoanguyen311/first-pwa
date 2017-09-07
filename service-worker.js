var cacheName = 'wheather-app-shell-v1';
var dataCacheName = 'wheather-app-data-v1';
var filesToCache = [
    '/',
    '/index.html',
    '/scripts/app.js',
    '/styles/inline.css',
    '/images/clear.png',
    '/images/cloudy-scattered-showers.png',
    '/images/cloudy.png',
    '/images/fog.png',
    '/images/ic_add_white_24px.svg',
    '/images/ic_refresh_white_24px.svg',
    '/images/partly-cloudy.png',
    '/images/rain.png',
    '/images/scattered-showers.png',
    '/images/sleet.png',
    '/images/snow.png',
    '/images/thunderstorm.png',
    '/images/wind.png'
];

self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Install');

    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    )
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
      caches.keys().then(function(keys) {
          return Promise.all(keys.map(function(key) {
              if (key !== cacheName) {
                  console.log('[ServiceWorker] removing old cache');
                  return caches.delete(key);
              }
          }))
      })
  );
  return self.clients.claim();
});

// self.addEventListener('fetch', function(e) {
//     // console.log('[ServiceWorker] fetch', e.request.url);
//     e.respondWith(caches.match(e.request));
// });
self.addEventListener('fetch', function(e) {
    // console.log('[ServiceWorker] fetch', e.request.url);
    const url = e.request.url;
    const dataUrl = 'https://query.yahooapis.com/v1/public/yql';
    if (url.indexOf(dataUrl) > -1) {
        e.respondWith(
            caches.open(dataCacheName).then(function(cache) {
                return fetch(e.request).then(function(response) {
                    cache.put(url, response.clone());
                    return response;
                })
            })
        )
    } else {
        e.respondWith(
            caches.match(e.request)
                .then(function(response) {
                    // console.log('[ServiceWorker] fetch cache', response, e.request.url);
                    if (response) {
                        console.log(`[ServiceWorker] fetch ${e.request.url} from cache`);
                    } else {
                        console.log(`[ServiceWorker] fetch ${e.request.url} from network`);
                    }
                    return response || fetch(e.request);
                })
        );
    }

});
