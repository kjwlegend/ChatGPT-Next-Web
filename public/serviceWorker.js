const CHATGPT_NEXT_WEB_CACHE = "chatgpt-next-web-cache"

self.addEventListener("activate", function (event) {
  console.log("ServiceWorker activated.")
})



self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CHATGPT_NEXT_WEB_CACHE).then(function (cache) {
      return cache.addAll([])
    }),
  )
})

self.addEventListener("fetch", (e) => { })


// self.addEventListener('activate', event => {
//   event.waitUntil(
//     self.registration.installations.then(installations => {
//       return Promise.all(installations.values().map(installation => {
//         if (installation.state === 'installed') {
//           return installation.unregister()
//         }
//       }))
//     })
//   ).catch(err => {
//     console.error('Activate event failed: ', err)
//   })
// })

// self.addEventListener('install', event => {
//   event.waitUntil(
//     caches.keys().then(cacheNames => {
//       return Promise.all(cacheNames.map(cacheName => {
//         if (cacheName !== CHATGPT_NEXT_WEB_CACHE) {
//           return caches.delete(cacheName)
//         }
//       }))
//     })
//   ).catch(err => {
//     console.error('Install event failed: ', err)
//   })
// })

// self.addEventListener('fetch', event => {
//   event.respondWith(caches.match(event.request))
//     .catch(err => {
//       console.error('Fetch event failed: ', err)
//       fetch(event.request) // Fallback to network if cache not available.
//     })
// })