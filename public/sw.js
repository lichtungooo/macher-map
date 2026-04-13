const CACHE_NAME = 'lichtung-v1'
const PRECACHE_URLS = [
  '/',
  '/index.html',
]

// Install: Pre-cache essential resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

// Activate: Clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: Network-first, fallback to cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

// Push notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Lichtung'
  const options = {
    body: data.body || 'Eine Friedensmeditation beginnt.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: data.url || '/',
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data))
})
