self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

// A simple fetch handler is required by Chrome to trigger the "Install App" prompt
self.addEventListener('fetch', (event) => {
  // Let the browser handle the request natively
});
