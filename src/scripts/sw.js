import { precacheAndRoute } from "workbox-precaching";
precacheAndRoute(self.__WB_MANIFEST || []);

const API_CACHE = "api-cache-v3";
const IMAGE_CACHE = "image-cache-v1";

self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. POST/PUT/DELETE - Langsung ke network
  if (req.method !== "GET") {
    event.respondWith(
      fetch(req)
        .then(response => {
          console.log(`${req.method} ${url.pathname} - Success`);
          return response;
        })
        .catch(error => {
          console.log(`${req.method} ${url.pathname} - Failed (offline)`);
          // Return error response yang informatif
          return new Response(
            JSON.stringify({
              error: true,
              message: "Offline - request will be retried when online",
              offline: true
            }),
            {
              status: 503,
              statusText: "Service Unavailable",
              headers: { "Content-Type": "application/json" }
            }
          );
        })
    );
    return;
  }

  // 2. API Stories (GET) - Network First, fallback to Cache
  if (url.pathname.includes("/stories")) {
    event.respondWith(
      fetch(req)
        .then(async (response) => {
          // Clone response untuk cache
          const responseClone = response.clone();
          
          // Simpan ke cache jika berhasil
          if (response.ok) {
            const cache = await caches.open(API_CACHE);
            cache.put(req, responseClone);
            console.log(`Cached: ${url.pathname}`);
          }
          
          return response;
        })
        .catch(async () => {
          console.log(`Offline - loading from cache: ${url.pathname}`);
          
          // Coba ambil dari cache
          const cached = await caches.match(req);
          if (cached) {
            console.log(`Found in cache: ${url.pathname}`);
            return cached;
          }

          // Jika tidak ada di cache, return empty response
          console.log(`Not found in cache: ${url.pathname}`);
          return new Response(
            JSON.stringify({
              error: false,
              message: "Showing cached/offline data",
              listStory: []
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" }
            }
          );
        })
    );
    return;
  }

  // 3. Images - Cache First, fallback to Network
  if (req.destination === "image" || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          console.log(`image from cache: ${url.pathname}`);
          return cached;
        }

        return fetch(req).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(IMAGE_CACHE).then((cache) => {
              cache.put(req, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // 4. Default - Network First
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

//BACKGROUND SYNC (untuk sync otomatis saat online)
self.addEventListener("sync", (event) => {
  console.log("Background Sync triggered:", event.tag);
  
  if (event.tag === "sync-stories") {
    event.waitUntil(syncStories());
  }
});

async function syncStories() {
  try {
    console.log("Starting background sync of offline stories...");
    
    // Kirim message ke clients untuk trigger sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: "SYNC_OFFLINE_STORIES"
      });
    });
    
    console.log("Background sync message sent to clients");
  } catch (error) {
    console.error("Background sync failed:", error);
    throw error;
  }
}

//LISTEN TO MESSAGES FROM CLIENT
self.addEventListener("message", (event) => {
  console.log("📨 SW received message:", event.data);
  
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith("api-cache") || cacheName.startsWith("image-cache")) {
              console.log("Clearing cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
});