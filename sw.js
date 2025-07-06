
const CACHE_NAME = 'banana-graphic-studio-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.tsx',
  '/metadata.json',
  '/components/ui/ButtonComponents.tsx',
  '/components/ui/InputComponents.tsx',
  '/components/HeaderControls.tsx',
  '/components/PreviewArea.tsx',
  '/components/TextModuleEditor.tsx',
  '/components/ProfileLibraryView.tsx',
  '/components/VisualFontMapper.tsx',
  '/manifest.json',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/screenshots/screenshot1.png',
  '/assets/screenshots/screenshot2.png',
  '/favicon.ico',
  '/profiles/profiles-list.json',
  '/profiles/Default_Profile_config.json',
  '/profiles/AA1STONE.json',
  'https://cdn.tailwindcss.com',
];

// URLs to fetch from network first, then cache (for dynamic content from esm.sh)
const networkFirstUrls = [
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0/',
  'https://esm.sh/react@^19.1.0/',
  'https://esm.sh/@google/genai@^1.3.0',
  'https://esm.sh/jszip@3.10.1'
];


self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        const cachePromises = urlsToCache.map(urlToCache => {
          return cache.add(urlToCache).catch(err => {
            console.warn(`Failed to cache ${urlToCache}:`, err);
          });
        });
        return Promise.all(cachePromises);
      })
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Don't cache Gemini API requests
  if (requestUrl.hostname.includes('generativelanguage.googleapis.com')) {
    return;
  }
  
  // Network-first for dynamic esm.sh modules
  if (networkFirstUrls.some(url => requestUrl.href.startsWith(url))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200) { // Removed type check for opaque responses
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // If network fails, try the cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Cache-first for all other requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200) { // Removed type check for opaque responses
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});


self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
