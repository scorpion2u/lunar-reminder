const CACHE_NAME = 'v3';

const urlsToCache = [
  '/lunar-reminder/',
  '/lunar-reminder/index.html'
];

// 安装
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 激活
self.addEventListener('activate', event => {
  clients.claim();
});

// 请求拦截（关键）
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match('/lunar-reminder/index.html');
    })
  );
});

// 推送
self.addEventListener('push', event => {
  const data = event.data.json();

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: 'icon-192.png'
  });
});
