'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

type SubTab = 'map' | 'chat' | 'market'

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
  id: string; name: string; address: string; phone: string; distance: string; category: string
}

export default function TownPage() {
  const [subTab, setSubTab] = useState<SubTab>('map')
  const [mode, setMode] = useState('parenting')

  useEffect(() => {
    const saved = localStorage.getItem('dodam_mode')
    if (saved) setMode(saved)
  }, [])

  const categories = MAP_CATEGORIES[mode] || MAP_CATEGORIES.parenting

  return (
    <div className="min-h-[100dvh] bg-[#F5F4F1]">
      <header className="sticky top-0 z-40 bg-white border-b border-[#f0f0f0]">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center h-12 px-5">
            <h1 className="text-[17px] font-bold text-[#1A1918]">동네</h1>
          </div>
          <div className="flex px-5 gap-1 pb-2">
            {[
              { key: 'map' as SubTab, label: '지도' },
              { key: 'chat' as SubTab, label: '수다' },
              { key: 'market' as SubTab, label: '장터' },
            ].map(t => (
              <button key={t.key} onClick={() => setSubTab(t.key)}
                className={`flex-1 py-2 rounded-xl text-[13px] font-semibold ${subTab === t.key ? 'bg-[#3D8A5A] text-white' : 'bg-[#F5F4F1] text-[#868B94]'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto">
        {subTab === 'map' && <MapTab categories={categories} />}
        {subTab === 'chat' && <ChatTab />}
        {subTab === 'market' && <MarketTab />}
      </div>
    </div>
  )
}

// ===== 지도 탭 — 카카오맵 직접 임베드 =====
function MapTab({ categories }: { categories: { icon: string; label: string; query: string }[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const mapObjRef = useRef<any>(null)

  const searchPlaces = useCallback((query: string) => {
    setLoading(true)
    setPlaces([])

    if (!window.kakao?.maps) { setLoading(false); return }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
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
            const results: Place[] = data.slice(0, 10).map((p: any) => ({
              id: p.id, name: p.place_name, address: p.road_address_name || p.address_name,
              phone: p.phone || '', distance: p.distance ? `${Math.round(Number(p.distance))}m` : '',
              category: p.category_group_name || '',
            }))
            setPlaces(results)

            // 지도에 마커 표시
            if (mapObjRef.current) {
              data.slice(0, 10).forEach((p: any) => {
                new window.kakao.maps.Marker({
                  map: mapObjRef.current,
                  position: new window.kakao.maps.LatLng(p.y, p.x),
                })
              })
            }
          }
          setLoading(false)
        }, { location: latlng, radius: 5000, sort: (window.kakao.maps.services as any).SortBy?.DISTANCE })
      },
      () => { setLoading(false) },
      { enableHighAccuracy: true }
    )
  }, [])

  useEffect(() => {
    // 카카오맵 SDK 로드 대기
    const initMap = () => {
      if (window.kakao?.maps) {
        window.kakao.maps.load(() => {
          searchPlaces(categories[0]?.query || '소아과')
        })
      } else {
        setTimeout(initMap, 300)
      }
    }
    initMap()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategory = (idx: number) => {
    setActiveIdx(idx)
    searchPlaces(categories[idx].query)
  }

  return (
    <div className="pb-28">
      {/* 지도 */}
      <div ref={mapRef} className="w-full h-48 bg-[#E8F0E8]" />

      {/* 카테고리 칩 */}
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar px-4 py-3">
        {categories.map((cat, i) => (
          <button key={cat.query} onClick={() => handleCategory(i)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold flex items-center gap-1 ${activeIdx === i ? 'bg-[#3D8A5A] text-white' : 'bg-white text-[#868B94] border border-[#f0f0f0]'}`}>
            <span className="text-sm">{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* 결과 리스트 */}
      <div className="px-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-[#3D8A5A]/20 border-t-[#3D8A5A] rounded-full animate-spin" /></div>
        ) : places.length === 0 ? (
          <p className="text-[13px] text-[#AEB1B9] text-center py-8">주변에 검색 결과가 없어요</p>
        ) : (
          places.map(p => (
            <Link key={p.id} href={`/map/${p.id}`} className="block bg-white rounded-xl border border-[#f0f0f0] p-3 active:bg-[#F5F4F1]">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1A1918] truncate">{p.name}</p>
                  <p className="text-[10px] text-[#868B94] mt-0.5 truncate">{p.address}</p>
                  {p.phone && <p className="text-[10px] text-[#3D8A5A] mt-0.5">{p.phone}</p>}
                </div>
                {p.distance && <span className="text-[10px] text-[#AEB1B9] shrink-0 ml-2">{p.distance}</span>}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

// ===== 수다 탭 — 바로 리스트 =====
function ChatTab() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    async function load() {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(20)
      setPosts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const handlePost = async () => {
    if (!newPost.trim() || posting) return
    setPosting(true)
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setPosting(false); return }

    const { data, error } = await supabase.from('posts').insert({ user_id: user.id, content: newPost.trim() }).select().single()
    if (!error && data) {
      setPosts(prev => [data, ...prev])
      setNewPost('')
    }
    setPosting(false)
  }

  return (
    <div className="px-4 pt-3 pb-28 space-y-2">
      {/* 글쓰기 */}
      <div className="bg-white rounded-xl border border-[#f0f0f0] p-3">
        <textarea value={newPost} onChange={e => setNewPost(e.target.value.slice(0, 500))} placeholder="동네 엄마들과 수다 떨어보세요..."
          className="w-full h-16 text-[13px] resize-none focus:outline-none" />
        <div className="flex justify-between items-center mt-1">
          <span className="text-[9px] text-[#AEB1B9]">{newPost.length}/500</span>
          <button onClick={handlePost} disabled={!newPost.trim() || posting}
            className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold ${newPost.trim() && !posting ? 'bg-[#3D8A5A] text-white' : 'bg-[#F0F0F0] text-[#AEB1B9]'}`}>
            {posting ? '...' : '올리기'}
          </button>
        </div>
      </div>

      {/* 글 목록 */}
      {loading ? (
        <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-[#3D8A5A]/20 border-t-[#3D8A5A] rounded-full animate-spin" /></div>
      ) : posts.length === 0 ? (
        <p className="text-[13px] text-[#AEB1B9] text-center py-8">첫 수다를 시작해보세요!</p>
      ) : (
        posts.map(post => (
          <div key={post.id} className="bg-white rounded-xl border border-[#f0f0f0] p-3">
            <p className="text-[13px] text-[#1A1918] leading-relaxed">{post.content}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] text-[#868B94]">❤️ {post.like_count || 0}</span>
              <span className="text-[10px] text-[#868B94]">💬 {post.comment_count || 0}</span>
              <span className="text-[10px] text-[#AEB1B9] ml-auto">{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ===== 장터 탭 — 바로 리스트 =====
function MarketTab() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data } = await supabase.from('market_items').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(20)
      setItems(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="px-4 pt-3 pb-28 space-y-2">
      {/* 등록 버튼 */}
      <Link href="/community?tab=market" className="block bg-[#F0F9F4] rounded-xl p-3 text-center active:opacity-80">
        <p className="text-[12px] text-[#3D8A5A] font-semibold">+ 장터에 올리기</p>
      </Link>

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-[#3D8A5A]/20 border-t-[#3D8A5A] rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <p className="text-[13px] text-[#AEB1B9] text-center py-8">아직 장터 글이 없어요</p>
      ) : (
        items.map(item => (
          <div key={item.id} className="bg-white rounded-xl border border-[#f0f0f0] p-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-[#1A1918] line-clamp-1 flex-1">{item.title}</p>
              <p className="text-[12px] font-bold text-[#3D8A5A] shrink-0 ml-2">{item.price > 0 ? `${item.price.toLocaleString()}원` : '나눔'}</p>
            </div>
            <p className="text-[10px] text-[#868B94] mt-0.5 line-clamp-1">{item.description}</p>
            <p className="text-[9px] text-[#AEB1B9] mt-1">{new Date(item.created_at).toLocaleDateString('ko-KR')}</p>
          </div>
        ))
      )}
    </div>
  )
}
