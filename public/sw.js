// Kill switch: unregister this service worker for all existing users
// who installed an old service worker from a previous deployment.
// This file can be deleted in ~4 weeks once existing caches are cleared.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Delete all caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      // Unregister self
      await self.registration.unregister();

      // Reload all open tabs so users see fresh content
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});
