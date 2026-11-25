// Precaches the built app so it opens offline. precache-plugin.ts fills in VERSION and FILES.
const VERSION = "3c89860faf78";
const FILES = ["apple-touch-icon.png","assets/index-B_LaVvuD.js","assets/index-CM5oocJn.css","assets/msal-BHcubxYM.js","assets/types-BEXNIAtB.js","icon-192.png","icon-512.png","icon.svg","index.html","manifest.webmanifest"];

const CACHE = `chordpro-${VERSION}`;
const scope = self.registration.scope;
const absolute = (path) => new URL(path, scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.all(
          FILES.map((file) => cache.add(new Request(absolute(file), { cache: 'reload' }))),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('chordpro-') && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Sign-in and Graph traffic is never answered from the cache or stored in it. The scope check
// below already skips other origins. This list keeps it true if that check ever changes.
const PASS_THROUGH_HOSTS = ['login.microsoftonline.com', 'login.live.com', 'graph.microsoft.com'];

// Every screen is one document, so any navigation inside the scope gets index.html.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (PASS_THROUGH_HOSTS.includes(new URL(request.url).hostname)) return;
  if (request.method !== 'GET' || !request.url.startsWith(scope)) return;
  const wanted = request.mode === 'navigate' ? absolute('index.html') : request.url;
  event.respondWith(
    caches
      .open(CACHE)
      .then((cache) => cache.match(wanted))
      .then((hit) => hit ?? fetch(request)),
  );
});
