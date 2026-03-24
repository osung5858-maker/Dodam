'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'

type SubTab = 'town' | 'story' | 'market'

const MAP_CATEGORIES: Record<string, { icon: string; label: string; query: string }[]> = {
  preparing: [
    { icon: '🏥', label: '산부인과', query: '산부인과' },
    { icon: '🧪', label: '난임클리닉', query: '난임클리닉' },
    { icon: '💊', label: '약국', query: '약국' },
    { icon: '🧘', label: '요가', query: '임산부요가' },
  ],
  pregnant: [
    { icon: '🏥', label: '산부인과', query: '산부인과' },
    { icon: '🤱', label: '산후조리원', query: '산후조리원' },
    { icon: '👶', label: '베이비용품', query: '유아용품점' },
    { icon: '💊', label: '약국', query: '약국' },
  ],
  parenting: [
    { icon: '🏥', label: '소아과', query: '소아과' },
    { icon: '🚨', label: '응급소아과', query: '응급소아과' },
    { icon: '🎪', label: '키즈카페', query: '키즈카페' },
    { icon: '📚', label: '문화센터', query: '문화센터' },
    { icon: '🌳', label: '놀이터', query: '어린이놀이터' },
    { icon: '💊', label: '약국', query: '약국' },
  ],
}

interface Place {
  id: string; name: string; address: string; phone: string; distance: string; lat: number; lng: number
}

export default function TownPage() {
  return <Suspense><TownPageInner /></Suspense>
}

function TownPageInner() {
  const [mode, setMode] = useState('parenting')
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('dodam_mode')
    if (saved) setMode(saved)
  }, [])

  const categories = MAP_CATEGORIES[mode] || MAP_CATEGORIES.parenting

  const handleTab = (key: string) => {
    if (key === 'story') router.push('/community')
    else if (key === 'market') router.push('/community?tab=market')
  }

  return (
    <div className="min-h-[100dvh] bg-[#F5F4F1]">
      <header className="sticky top-0 z-40 bg-white border-b border-[#f0f0f0]">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center h-12 px-5">
            <h1 className="text-[17px] font-bold text-[#1A1918]">동네</h1>
          </div>
          <div className="flex px-5 gap-1 pb-2">
            {[
              { key: 'town', label: '동네' },
              { key: 'story', label: '이야기' },
              { key: 'market', label: '도담장터' },
            ].map(t => (
              <button key={t.key} onClick={() => handleTab(t.key)}
                className={`flex-1 py-2 rounded-xl text-[13px] font-semibold ${t.key === 'town' ? 'bg-[#3D8A5A] text-white' : 'bg-[#F5F4F1] text-[#868B94]'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto">
        <MapTab categories={categories} />
      </div>
    </div>
  )
}

// ===== 동네(지도) 탭 =====
function MapTab({ categories }: { categories: { icon: string; label: string; query: string }[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const mapObjRef = useRef<any>(null)

  const searchPlaces = useCallback((query: string) => {
    setLoading(true); setPlaces([])
    if (!window.kakao?.maps) { setLoading(false); return }

    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords
      const latlng = new window.kakao.maps.LatLng(latitude, longitude)

      if (!mapObjRef.current && mapRef.current) {
        mapObjRef.current = new window.kakao.maps.Map(mapRef.current, { center: latlng, level: 5 })
      } else if (mapObjRef.current) {
        mapObjRef.current.setCenter(latlng)
      }

      const ps = new window.kakao.maps.services.Places()
      ps.keywordSearch(query, (data: any[], status: string) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setPlaces(data.slice(0, 10).map((p: any) => ({
            id: p.id, name: p.place_name, address: p.road_address_name || p.address_name,
            phone: p.phone || '', distance: p.distance ? `${Math.round(Number(p.distance))}m` : '',
            lat: Number(p.y), lng: Number(p.x),
          })))
          if (mapObjRef.current) {
            data.slice(0, 10).forEach((p: any) => {
              new window.kakao.maps.Marker({ map: mapObjRef.current, position: new window.kakao.maps.LatLng(p.y, p.x) })
            })
          }
        }
        setLoading(false)
      }, { location: latlng, radius: 5000, sort: (window.kakao.maps.services as any).SortBy?.DISTANCE })
    }, () => setLoading(false), { enableHighAccuracy: true })
  }, [])

  useEffect(() => {
    const initMap = () => {
      if (window.kakao?.maps) {
        window.kakao.maps.load(() => searchPlaces(categories[0]?.query || '소아과'))
      } else setTimeout(initMap, 300)
    }
    initMap()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="pb-28">
      <div ref={mapRef} className="w-full h-48 bg-[#E8F0E8]" />

      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar px-4 py-3">
        {categories.map((cat, i) => (
          <button key={cat.query} onClick={() => { setActiveIdx(i); searchPlaces(cat.query) }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold flex items-center gap-1 ${activeIdx === i ? 'bg-[#3D8A5A] text-white' : 'bg-white text-[#868B94] border border-[#f0f0f0]'}`}>
            <span className="text-sm">{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-[#3D8A5A]/20 border-t-[#3D8A5A] rounded-full animate-spin" /></div>
        ) : places.length === 0 ? (
          <p className="text-[13px] text-[#AEB1B9] text-center py-8">주변에 검색 결과가 없어요</p>
        ) : (
          places.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-[#f0f0f0] p-3">
              <Link href={`/map/${p.id}`} className="block active:opacity-80">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1A1918] truncate">{p.name}</p>
                    <p className="text-[10px] text-[#868B94] mt-0.5 truncate">{p.address}</p>
                  </div>
                  {p.distance && <span className="text-[10px] text-[#AEB1B9] shrink-0 ml-2">{p.distance}</span>}
                </div>
              </Link>
              {/* 전화 · 길찾기 · 리뷰 */}
              <div className="flex gap-2 mt-2 pt-2 border-t border-[#f0f0f0]">
                {p.phone ? (
                  <a href={`tel:${p.phone}`} className="flex-1 py-1.5 bg-[#F0F9F4] rounded-lg text-center text-[11px] text-[#3D8A5A] font-semibold active:opacity-80">
                    📞 전화
                  </a>
                ) : (
                  <div className="flex-1 py-1.5 bg-[#F5F4F1] rounded-lg text-center text-[11px] text-[#AEB1B9]">📞 전화</div>
                )}
                <a href={`https://map.kakao.com/link/to/${encodeURIComponent(p.name)},${p.lat},${p.lng}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-1.5 bg-[#F0F9F4] rounded-lg text-center text-[11px] text-[#3D8A5A] font-semibold active:opacity-80">
                  🧭 길찾기
                </a>
                <Link href={`/map/${p.id}/review`}
                  className="flex-1 py-1.5 bg-[#F0F9F4] rounded-lg text-center text-[11px] text-[#3D8A5A] font-semibold active:opacity-80">
                  ⭐ 리뷰
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

