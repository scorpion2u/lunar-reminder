// 缓存名称
const CACHE_NAME = 'lunar-reminder-v1';

// 需要缓存的文件
const urlsToCache = [
    '/lunar-reminder/',
    '/lunar-reminder/index.html',
    '/lunar-reminder/manifest.json'
];

// 安装时缓存文件
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// 处理请求
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});

// 每天早上8点检查提醒
self.addEventListener('periodicsync', event => {
    if (event.tag === 'daily-reminder-check') {
        event.waitUntil(checkReminders());
    }
});

// 检查提醒的主函数
async function checkReminders() {
    try {
        // 获取今天的农历信息
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // 从 localStorage 获取数据（需要通过 clients 获取）
        const clients = await self.clients.matchAll();
        if (clients.length === 0) return;
        
        // 向主页面发送消息获取提醒数据
        const client = clients[0];
        const response = await new Promise(resolve => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = event => resolve(event.data);
            client.postMessage({ type: 'GET_REMINDERS' }, [messageChannel.port2]);
        });
        
        const { reminders, defaultReminderEnabled, customReminders } = response;
        
        // 过滤今天的提醒
        const todayStr = today.toDateString();
        const todayReminders = reminders.filter(r => {
            const rDate = new Date(r.date);
            rDate.setHours(0, 0, 0, 0);
            return rDate.toDateString() === todayStr;
        });
        
        if (todayReminders.length === 0) return;
        
        // 组合通知文案
        const fruitReminders = todayReminders.filter(r => r.type === '初一十五');
        const customRemindersList = todayReminders.filter(r => r.type === 'custom');
        
        let body = '';
        if (fruitReminders.length > 0) {
            body += fruitReminders.map(r => r.title).join('；');
        }
        if (customRemindersList.length > 0) {
            if (body) body += '\n';
            body += customRemindersList.map(r => r.title).join('；');
        }
        
        // 显示通知
        self.registration.showNotification('农历提醒', {
            body: body,
            icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%23c43e4c"/%3E%3Ctext x="50" y="70" font-size="50" text-anchor="middle" fill="white" font-family="Arial"%3E🌙%3C/text%3E%3C/svg%3E',
            badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%23c43e4c"/%3E%3C/svg%3E',
            vibrate: [200, 100, 200],
            actions: [
                { action: 'open', title: '查看' },
                { action: 'close', title: '关闭' }
            ]
        });
        
        // 记录今天已通知
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({ type: 'MARK_NOTIFIED', date: todayStr });
        });
        
    } catch (error) {
        console.error('检查提醒失败:', error);
    }
}

// 点击通知的处理
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/lunar-reminder/')
        );
    }
});

// 定时触发检查（备用方案）
self.addEventListener('activate', event => {
    event.waitUntil(
        self.registration.periodicSync.register('daily-reminder-check', {
            minInterval: 24 * 60 * 60 * 1000 // 24小时
        }).catch(() => {
            // 如果不支持 periodicSync，用定时器
            setInterval(() => {
                const now = new Date();
                if (now.getHours() === 8 && now.getMinutes() === 0) {
                    checkReminders();
                }
            }, 60000); // 每分钟检查一次
        })
    );
});