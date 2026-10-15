const CACHE_NAME = "mimi-boss-offline-v2";
const BASE = "/mimi-boss-music/";

const FILES = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.json",
  BASE + "launchericon-512x512.png",
  BASE + "Broullion_Mïmį_Bøss_Le_Roi_Du_Terrain_x_Jolah_x_Lion.mp3.mp3",
  BASE + "MIMI BOSS X JOYAH -- MANANJARY MILALAO Sound By JX PROD.mp3",
  BASE + "MÏMĮ BØSS -- VELOGNA Sound By JX PROD.mp3",
  BASE + "MÏMĮ BØSS X JOYAH JR -- LONG TIME Sound By JX PROD.mp3",
  BASE + "MÏMĮ BØSS X SEH JUGAH -- MALAGASY Sound By JX PROD.mp3",
  BASE + "MÏMĮ BØSS X SEH-JUGAH -FETY.mp3"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    for (const file of FILES) {
      try {
        const response = await fetch(file);
        if (response.ok) {
          await cache.put(file, response);
        }
      } catch (error) {
        // Haverina alaina rehefa tsindriana ny bokotra offline.
      }
    }

    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(key =>
          key.startsWith("mimi-boss-offline-") &&
          key !== CACHE_NAME
        )
        .map(key => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    const cached = await cache.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);

      if (response.ok && response.status === 200) {
        await cache.put(request, response.clone());
      }

      return response;
    } catch (error) {
      if (request.mode === "navigate") {
        return (
          await cache.match(BASE + "index.html")
        ) || Response.error();
      }

      return Response.error();
    }
  })());
});
