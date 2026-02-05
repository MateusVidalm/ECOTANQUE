
const CACHE_NAME = 'ecofuel-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map(key => caches.delete(key)));
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Ignora cache para requisições de módulos e banco de dados
  if (event.request.url.includes('esm.sh') || event.request.url.includes('supabase.co')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
