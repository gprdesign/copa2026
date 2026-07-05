const CACHE = 'copa2026-v3';
const OFFLINE = ['/copa2026/', '/copa2026/index.html'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(OFFLINE); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Para a API sempre buscar da rede (placares em tempo real)
  if(e.request.url.includes('worldcup26.ir')) {
    e.respondWith(fetch(e.request).catch(function(){return new Response('[]');}));
    return;
  }
  // Para o resto: cache first, fallback pra rede
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request).then(function(resp) {
        return caches.open(CACHE).then(function(c) {
          c.put(e.request, resp.clone());
          return resp;
        });
      });
    })
  );
});
