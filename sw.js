// ==========================================
// Zenix Service Worker
// استراتژی:
//   - HTML (navigate): Network-First → همیشه آخرین نسخه‌ی صفحه‌ها
//   - Assets (JS/CSS/تصاویر): Cache-First → سرعت بالا
// نسخه: zenix-v3.7
// ==========================================

const CACHE_VERSION = 'zenix-v3.7';
const STATIC_CACHE  = CACHE_VERSION + '-static';
const HTML_CACHE    = CACHE_VERSION + '-html';

const PRECACHE_URLS = [
    './',
    './index.html'
];

// ── INSTALL ──
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
            .then(() => self.skipWaiting())
    );
});

// ── ACTIVATE: پاک‌سازی کش‌های نسخه‌های قدیمی ──
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((k) => k.indexOf(CACHE_VERSION) !== 0)
                    .map((k) => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// ── FETCH ──
self.addEventListener('fetch', (event) => {
    const req = event.request;

    // فقط GET و فقط هم‌مبدأ (same-origin)
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    const accept = req.headers.get('accept') || '';
    const isHTML = req.mode === 'navigate' || accept.indexOf('text/html') !== -1;

    // ── HTML: Network-First (همیشه آخرین نسخه) ──
    if (isHTML) {
        event.respondWith(
            fetch(req)
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

    // ── بقیه assets: Cache-First ──
    event.respondWith(
        caches.match(req).then((cached) => {
            if (cached) return cached;
            return fetch(req).then((res) => {
                if (res && res.ok && res.status === 200) {
                    const copy = res.clone();
                    caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
                }
                return res;
            }).catch(() => cached);
        })
    );
});
