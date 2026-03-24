// 서버 사이드 AI 응답 캐시 — 하루 단위
const cache = new Map<string, { data: any; expiry: number }>()

export function getCachedResponse(key: string): any | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiry) {
    cache.delete(key)
    return null
  }
  return entry.data
}

export function setCachedResponse(key: string, data: any, ttlMs = 4 * 60 * 60 * 1000) {
  // 기본 4시간 캐시 (하루에 최대 6회만 호출)
  cache.set(key, { data, expiry: Date.now() + ttlMs })

  // 캐시 크기 제한 (100개 초과 시 오래된 것 제거)
  if (cache.size > 100) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].expiry - b[1].expiry)[0]
    if (oldest) cache.delete(oldest[0])
  }
}
