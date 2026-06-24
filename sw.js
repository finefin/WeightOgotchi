const CACHE = 'weightogotchi-v5';

const PRECACHE_URLS = [
  '.',
  'index.html',
  'app.js',
  'style.css',
  'manifest.json',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'img/pet.svg',
  'img/actions/sports.svg',
  'img/actions/candySome.svg',
  'img/actions/candyLots.svg',
  'img/actions/foodFast.svg',
  'img/actions/foodHealthy.svg',
  'img/actions/sportStairs.svg',
  'img/actions/sportWalk.svg',
  'img/actions/sportTramp.svg',
  'img/actions/sportMarathon.svg',
  'img/actions/alcoholSome.svg',
  'img/actions/alcoholLots.svg',
  'img/actions/smokingSome.svg',
  'img/actions/smokingLots.svg',
  'img/actions/sleepWell.svg',
  'img/actions/sleepPoorly.svg',
  'img/actions/sleepShort.svg',
  'img/actions/sleepLong.svg',
  'src/dom.js',
  'src/state.js',
  'src/bmi.js',
  'src/messages.js',
  'src/chart.js',
  'src/dialogs.js',
  'src/io.js',
  'src/views.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('index.html').then((cached) => cached || fetch(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        fetch(event.request).then((response) => {
          if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response));
        }).catch(() => {});
        return cached;
      }
      return fetch(event.request).then((response) => {
        if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
        return response;
      }).catch(() => caches.match(event.request));
    })
  );
});
