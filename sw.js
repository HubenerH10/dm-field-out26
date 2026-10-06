// DM Field Out26 — sempre busca a versão nova quando há sinal; usa o cache só sem internet.
const CACHE = 'dmf-out26-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.hostname.includes('script.google')) return; // planilha nunca vem do cache
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok && (u.origin === location.origin || u.hostname.includes('fonts.g'))) {
        const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp));
      }
      return r;
    }).catch(() => caches.match(e.request).then(m => m || caches.match('./index.html')))
  );
});
