// 极简 service worker：缓存静态资源，支持离线打开（PWA 安装）
const CACHE = 'outfit-v1';
const ASSETS = [
  './', './index.html', './src/main.js',
  './src/styles.css', './src/lib/db.js', './src/lib/categories.js',
  './src/lib/crawlerData.js', './src/lib/removeBg.js', './src/lib/ui.js',
  './src/pages/home.js', './src/pages/plans.js', './src/pages/profile.js', './src/pages/match.js',
  './public/manifest.json', './public/icon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(()=>caches.match('./index.html')))
  );
});
