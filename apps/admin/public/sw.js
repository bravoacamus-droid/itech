// Service worker — iTech ERP (offline básico para el personal)
// Estrategia:
//  - Navegaciones (HTML): network-first; si falla, cae a la última página
//    cacheada o a /offline.html.
//  - Estáticos (_next/static, iconos): cache-first (stale-while-revalidate).
//  - Nunca cachea POST ni llamadas a Supabase/API (deben ir a la red).
const CACHE = "itech-erp-v1";
const APP_SHELL = ["/offline.html", "/icons/icon-192.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // mutaciones siempre a la red

  const url = new URL(request.url);
  // No interceptar Supabase ni otros orígenes
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api")) return;

  // Navegaciones → network-first con fallback offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/offline.html")),
        ),
    );
    return;
  }

  // Estáticos → stale-while-revalidate
  if (url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/icons")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
