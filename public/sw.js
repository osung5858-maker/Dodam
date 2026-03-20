const CACHE_NAME = 'dodam-v1'
const STATIC_ASSETS = ['/', '/manifest.json', '/icons/icon-192.svg', '/icons/icon-512.svg']

// 설치: 정적 에셋 캐시
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// 활성화: 구 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// 네트워크 우선, 실패 시 캐시
self.addEventListener('fetch', (event) => {
  const { request } = event

  // API 요청은 네트워크 전용
  if (request.url.includes('/api/') || request.url.includes('supabase.co') || request.url.includes('kakao')) {
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // 성공 응답 캐시
        if (response.ok && request.method === 'GET') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
  )
})
