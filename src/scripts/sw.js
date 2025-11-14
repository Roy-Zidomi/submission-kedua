/* ===== WORKBOX PRECACHING ===== */
import { precacheAndRoute } from 'workbox-precaching';

// Workbox injects assets automatically
precacheAndRoute(self.__WB_MANIFEST || []);

/* ===== CUSTOM CACHE FOR API ===== */
const API_CACHE = 'api-cache-v3';

self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  // Network-first for API "/stories"
  if (req.url.includes('/stories')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          caches.open(API_CACHE).then(cache => cache.put(req, res.clone()));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;

          return new Response(JSON.stringify({
            error: true,
            message: "Offline – no cached stories available",
            data: []
          }), {
            headers: { "Content-Type": "application/json" }
          });
        })
    );
  }
});

/* ===== PUSH NOTIFICATION ===== */
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (err) {
    payload = { title: 'StoryApp', body: event.data?.text() };
  }

  const title = payload.title || "StoryApp";
  const options = {
    body: payload.body || "Ada cerita baru!",
    icon: "/icons/dicoding192x192.png",
    badge: "/icons/dicoding512x512.png",
    data: { storyId: payload.storyId }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/* ===== CLICK NOTIFICATION ===== */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const storyId = event.notification.data?.storyId;
  const url = storyId ? `/#/detail/${storyId}` : '/#/home';

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client)
            return client.focus();
        }
        return clients.openWindow(url);
      })
  );
});
