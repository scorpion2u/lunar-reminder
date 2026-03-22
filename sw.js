self.addEventListener('install', e => {
  self.skipWaiting();
  console.log('Service Worker 安装成功');
});

self.addEventListener('activate', e => {
  clients.claim();
  console.log('Service Worker 激活');
});

// 推送
self.addEventListener('push', function(event) {
  const data = event.data.json();

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: 'icon-192.png'
  });
});