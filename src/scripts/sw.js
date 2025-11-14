/* ===== WORKBOX PRECACHING ===== */
import { precacheAndRoute } from "workbox-precaching";
precacheAndRoute(self.__WB_MANIFEST || []);

const API_CACHE = "api-cache-v3";

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Jangan intercept POST/PUT/DELETE, langsung lanjutkan ke network
  if (req.method !== "GET") {
    event.respondWith(fetch(req));
    return;
  }

  // Network-first untuk GET /stories
  if (req.url.includes("/stories")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Simpan response ke cache jika berhasil
          caches.open(API_CACHE).then((cache) => cache.put(req, res.clone()));
          return res;
        })
        .catch(async () => {
          // Jika gagal, ambil data dari cache
          const cached = await caches.match(req);
          if (cached) return cached;

          return new Response(
            JSON.stringify({
              error: true,
              message: "Offline – no cached stories available",
              data: [],
            }),
            {
              headers: { "Content-Type": "application/json" },
            }
          );
        })
    );
  }
});
