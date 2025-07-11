// service-worker.js
const CACHE_NAME = 'block-breaker-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap',
    'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMwLtVKj7fPnwiF.woff2', // Inter font woff2
    'https://placehold.co/192x192/0095DD/FFFFFF?text=BB', // Placeholder icon 192x192
    'https://placehold.co/512x512/0095DD/FFFFFF?text=BB'  // Placeholder icon 512x512
];

// インストールイベント: キャッシュにファイルを保存
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching assets');
                return cache.addAll(urlsToCache);
            })
    );
});

// フェッチイベント: キャッシュからリソースを提供
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // キャッシュにリソースがあればそれを使用
                if (response) {
                    return response;
                }
                // なければネットワークから取得し、キャッシュに追加
                return fetch(event.request).then(
                    response => {
                        // 有効なレスポンスか確認
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        // レスポンスをクローンしてキャッシュに保存
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    }
                );
            })
    );
});

// アクティベートイベント: 古いキャッシュを削除
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
