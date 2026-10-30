// ==========================================
// Zenix Service Worker — نسخه‌ی Aggressive Update
// نسخه: zenix-v4.7
// استراتژی:
//   - HTML و dashboard.js و sw.js: Network-First + no-store
//   - بقیه assets: Stale-While-Revalidate
// ==========================================

const CACHE_VERSION = 'zenix-v4.7';
const STATIC_CACHE  = CACHE_VERSION + '-static';
const HTML_CACHE    = CACHE_VERSION + '-html';

const PRECACHE_URLS = [
    './',
    './index.html',
    './dashboard.html'
];

// ── INSTALL: skipWaiting فوری ──
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
            .then(() => self.skipWaiting())
    );
});

// ── ACTIVATE: پاک‌سازی کامل کش‌های قدیمی + claim فوری ──
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((k) => k.indexOf(CACHE_VERSION) !== 0)
                    .map((k) => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

// ── پیام skipWaiting از سمت کلاینت ──
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// ── FETCH ──
self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    const accept = req.headers.get('accept') || '';
    const isHTML = req.mode === 'navigate' || accept.indexOf('text/html') !== -1;

    // ★★ HTML: همیشه از شبکه، بدون HTTP Cache ★★
    if (isHTML) {
        event.respondWith(
            fetch(req, { cache: 'no-store' })
                .then((res) => {
                    const copy = res.clone();
                    caches.open(HTML_CACHE).then((c) => c.put(req, copy));
                    return res;
                })
                .catch(() =>
                    caches.match(req).then((cached) =>
                        cached || caches.match('./index.html')
                    )
                )
        );
        return;
    }

    // ★★ فایل‌های حیاتی: Network-First + no-store ★★
    const isCriticalJS =
        url.pathname.endsWith('/dashboard.js') ||
        url.pathname.endsWith('/dashboard.html');

    if (isCriticalJS) {
        event.respondWith(
            fetch(req, { cache: 'no-store' })
                .then((res) => {
                    if (res && res.ok && res.status === 200) {
                        const copy = res.clone();
                        caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
                    }
                    return res;
                })
                .catch(() => caches.match(req))
        );
        return;
    }

    // ── بقیه assets: Stale-While-Revalidate ──
    event.respondWith(
        caches.match(req).then((cached) => {
            const networkFetch = fetch(req)
                .then((res) => {
                    if (res && res.ok && res.status === 200) {
                        const copy = res.clone();
                        caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
                    }
                    return res;
                })
                .catch(() => cached);
            return cached || networkFetch;
        })
    );
});
