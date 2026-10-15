const CACHE_NAME = "mimi-boss-offline-v1";
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
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith("mimi-boss-offline-")
            && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
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

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(request, copy)
          );
        }
        return response;
      }).catch(() => {
        if (request.mode === "navigate") {
          return caches.match(BASE + "index.html");
        }
        return Response.error();
      });
    })
  );
});
