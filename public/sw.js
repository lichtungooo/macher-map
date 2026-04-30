// Self-destruct Service Worker
//
// Frueher war hier ein PWA-Cache-SW. Der hat im Dev alte Code-Versionen
// ausgeliefert (Dialoge die nicht mehr richtig rendern). Dieser SW ersetzt
// den alten — er deinstalliert sich selbst + loescht alle Caches sobald
// der Browser ihn das naechste Mal laedt.
//
// Wenn wir spaeter wieder PWA-Caching wollen: neuen SW unter NEUEM Pfad
// (/sw-v2.js) deployen, sonst denkt der Browser "kein Update".

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 1. Alle Caches loeschen (auch die vom alten SW, z.B. 'lichtung-v1')
      if ('caches' in self) {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      }
      // 2. Sich selbst deinstallieren
      await self.registration.unregister()
      // 3. Alle offenen Tabs neu laden, damit sie ohne SW weiterlaufen
      const clients = await self.clients.matchAll({ type: 'window' })
      for (const client of clients) {
        client.navigate(client.url)
      }
    })()
  )
})

// Fetch-Handler bewusst leer — alle Requests laufen direkt durchs Netzwerk
self.addEventListener('fetch', () => {})
