self.addEventListener('install', () => {
  console.log('Service Worker installed');
});

self.addEventListener('fetch', () => {
  // Optional: handle fetch events
});
