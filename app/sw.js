const CACHE_PREFIX = "ai-memory-vault-shell-";
const LEGACY_CACHE_PREFIX = "ai-memoria-vault-shell-";
const CACHE_NAME = `${CACHE_PREFIX}v11`;
const LOCAL_ASSETS = ["./", "./index.html", "./styles.css", "./app.js", "./manifest.webmanifest", "./icon.svg", "../src/index.js", "../src/core/memory-operations.js", "../src/core/context-policy.js", "../src/core/adapter-runner.js", "../src/core/encrypted-vault.js", "../src/core/snapshot-validation.js", "../src/crypto/encrypted-envelope.js", "../src/storage/indexeddb-vault-store.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(LOCAL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => (key.startsWith(CACHE_PREFIX) || key.startsWith(LEGACY_CACHE_PREFIX)) && key !== CACHE_NAME).map((key) => caches.delete(key)),
  )));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE_NAME).then((cache) => cache.match(event.request)).then((cached) => cached || fetch(event.request)));
});
