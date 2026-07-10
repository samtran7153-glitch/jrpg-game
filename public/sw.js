self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  // Always return the cached save if requested, otherwise fall through to network
  if (url.pathname === '/__save.json' && event.request.method === 'GET') {
    event.respondWith(
      caches.open('pixelQuestSaveCache').then((cache) =>
        cache.match('/__save.json').then((response) => response || new Response('null', { headers: { 'Content-Type': 'application/json' } }))
      )
    )
    return
  }
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)))
})
