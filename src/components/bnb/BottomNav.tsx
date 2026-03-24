'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  SunIcon, HeartIcon, ShieldIcon, UsersIcon,
  PlusIcon, XIcon,
  BottleIcon, MoonIcon, DropletIcon, ThermometerIcon, PillIcon,
} from '@/components/ui/Icons'

interface Tab {
  href: string
  label: string
  icon: React.FC<{ className?: string }>
}

const TABS_BY_MODE: Record<string, Tab[]> = {
  parenting: [
    { href: '/', icon: SunIcon, label: '오늘' },
    { href: '/memory', icon: HeartIcon, label: '추억' },
    { href: '/town', icon: ShieldIcon, label: '동네' },
    { href: '/us', icon: UsersIcon, label: '우리' },
  ],
  pregnant: [
    { href: '/pregnant', icon: SunIcon, label: '오늘' },
    { href: '/waiting', icon: HeartIcon, label: '기다림' },
    { href: '/town', icon: ShieldIcon, label: '동네' },
    { href: '/us', icon: UsersIcon, label: '우리' },
  ],
  preparing: [
    { href: '/preparing', icon: SunIcon, label: '오늘' },
    { href: '/waiting', icon: HeartIcon, label: '기다림' },
    { href: '/town', icon: ShieldIcon, label: '동네' },
    { href: '/us', icon: UsersIcon, label: '우리' },
  ],
}

// 2단계 기록 카테고리 (사용 빈도 높은 것만)
const RECORD_CATEGORIES = [
  { key: 'eat', emoji: '🍼', label: '먹기', color: '#3D8A5A',
    items: [
      { type: 'breast_left', label: '모유(왼)', emoji: '🤱' },
      { type: 'breast_right', label: '모유(오)', emoji: '🤱' },
      { type: 'feed', label: '분유', emoji: '🍼', hasInput: 'ml' },
      { type: 'babyfood', label: '이유식', emoji: '🥣' },
      { type: 'pump', label: '유축', emoji: '🫙', hasInput: 'ml' },
    ]
  },
  { key: 'sleep', emoji: '💤', label: '잠', color: '#6366F1',
    items: [
      { type: 'sleep', label: '수면 시작/종료', emoji: '💤' },
    ]
  },
  { key: 'diaper', emoji: '🩲', label: '기저귀', color: '#D89575',
    items: [
      { type: 'pee', label: '소변', emoji: '💧' },
      { type: 'poop_normal', label: '대변 (정상)', emoji: '💩' },
      { type: 'poop_soft', label: '대변 (묽음)', emoji: '💩' },
      { type: 'poop_hard', label: '대변 (단단)', emoji: '💩' },
    ]
  },
  { key: 'health', emoji: '🏥', label: '건강', color: '#D08068',
    items: [
      { type: 'temp', label: '체온', emoji: '🌡️', hasInput: '°C' },
      { type: 'memo', label: '투약', emoji: '💊' },
    ]
  },
  { key: 'more', emoji: '📝', label: '더보기', color: '#868B94',
    items: [
      { type: 'note', label: '메모', emoji: '📝' },
    ]
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [fabOpen, setFabOpen] = useState(false)
  const [mode, setMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('dodam_mode') || 'parenting'
    return 'parenting'
  })

  // pathname 기반 모드 자동 감지 (localStorage보다 우선)
  useEffect(() => {
    if (pathname?.startsWith('/preparing') || pathname?.startsWith('/waiting')) {
      setMode('preparing')
    } else if (pathname?.startsWith('/pregnant')) {
      setMode('pregnant')
    } else {
      const saved = localStorage.getItem('dodam_mode')
      if (saved) setMode(saved)
    }
  }, [pathname])

  const tabs = TABS_BY_MODE[mode] || TABS_BY_MODE.parenting

  // 다른 페이지로 이동하면 FAB 닫기
  useEffect(() => { setFabOpen(false) }, [pathname])

  // ESC로 닫기
  useEffect(() => {
    if (!fabOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setFabOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [fabOpen])

  const [selectedCategory, setSelectedCategory] = useState<string | null>('eat')
  const [inputValue, setInputValue] = useState('')

  const handleQuickRecord = useCallback((type: string, extra?: Record<string, unknown>) => {
    if (navigator.vibrate) navigator.vibrate(30)
    window.dispatchEvent(new CustomEvent('dodam-record', { detail: { type, ...extra } }))
    setFabOpen(false)
    setSelectedCategory('eat')
    setInputValue('')
  }, [])

  if (pathname?.startsWith('/onboarding') || pathname?.startsWith('/invite') || pathname?.startsWith('/post/') || pathname?.startsWith('/market-item/')) {
    return null
  }

  return (
    <>
      {/* 기록 바텀시트 (1장 탭 전환) */}
      {fabOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40" onClick={() => { setFabOpen(false); setSelectedCategory('eat') }}>
          <div className="absolute bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white rounded-t-2xl shadow-xl animate-slideUp pb-[env(safe-area-inset-bottom)]"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 bg-[#E0E0E0] rounded-full" /></div>

            {/* 카테고리 탭 */}
            <div className="flex px-4 gap-1 mb-3">
              {RECORD_CATEGORIES.map(cat => (
                <button key={cat.key}
                  onClick={() => {
                    if (cat.items.length === 1) { handleQuickRecord(cat.items[0].type); return }
                    setSelectedCategory(cat.key)
                  }}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all ${
                    selectedCategory === cat.key ? 'bg-[#3D8A5A]' : 'bg-[#F5F4F1]'
                  }`}>
                  <span className="text-lg">{cat.emoji}</span>
                  <span className={`text-[9px] font-semibold ${selectedCategory === cat.key ? 'text-white' : 'text-[#868B94]'}`}>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* 세부 항목 */}
            <div className="px-4 pb-5">
              {(() => {
                const activeCat = RECORD_CATEGORIES.find(c => c.key === (selectedCategory || 'eat'))
                if (!activeCat) return null
                return (
                  <div className="grid grid-cols-3 gap-2">
                    {activeCat.items.map(item => (
                      <button key={item.type}
                        onClick={() => {
                          if (item.hasInput) {
                            const val = prompt(`${item.label} ${item.hasInput === 'ml' ? '(ml)' : '(°C)'}`)
                            if (val) {
                              const extra = item.hasInput === 'ml' ? { amount_ml: Number(val) } : { tags: { celsius: Number(val) } }
                              handleQuickRecord(item.type === 'pump' ? 'feed' : item.type, extra)
                            }
                          } else {
                            const extra: Record<string, unknown> = {}
                            if (item.type.startsWith('poop_')) extra.tags = { status: item.type.replace('poop_', '') }
                            if (item.type.startsWith('breast_')) extra.tags = { side: item.type.replace('breast_', '') }
                            const baseType = item.type.startsWith('poop_') ? 'poop'
                              : item.type.startsWith('breast_') ? 'feed'
                              : item.type
                            handleQuickRecord(baseType, extra)
                          }
                        }}
                        className="flex flex-col items-center gap-1.5 py-3.5 rounded-xl bg-[#F5F4F1] active:bg-[#ECECEC] active:scale-95 transition-all"
                      >
                        <span className="text-2xl">{item.emoji}</span>
                        <span className="text-[11px] font-medium text-[#1A1918]">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* BNB 바 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[65] bg-white border-t border-[#f0f0f0] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-14">
          {mode === 'preparing' || mode === 'pregnant' ? (
            /* preparing/pregnant 모드: FAB 없이 4탭 균등 */
            tabs.map((tab) => (
              <NavTab key={tab.href} tab={tab} pathname={pathname} />
            ))
          ) : (
            <>
              {/* 좌측 2탭 */}
              {tabs.slice(0, 2).map((tab) => (
                <NavTab key={tab.href} tab={tab} pathname={pathname} />
              ))}

              {/* 중앙 FAB */}
              <button
                onClick={() => setFabOpen((v) => !v)}
                className={`flex flex-col items-center justify-center -mt-5 transition-transform duration-200 ${fabOpen ? 'scale-95' : ''}`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(61,138,90,0.35)] active:scale-90 transition-all duration-200 ${
                    fabOpen ? 'bg-[#212124]' : 'bg-[#3D8A5A]'
                  }`}
                >
                  {fabOpen ? (
                    <XIcon className="w-6 h-6 text-white" />
                  ) : (
                    <PlusIcon className="w-6 h-6 text-white" />
                  )}
                </div>
                <span className={`text-[10px] mt-0.5 font-semibold ${fabOpen ? 'text-[#212124]' : 'text-[#3D8A5A]'}`}>
                  기록
                </span>
              </button>

              {/* 우측 2탭 */}
              {tabs.slice(2).map((tab) => (
                <NavTab key={tab.href} tab={tab} pathname={pathname} />
              ))}
            </>
          )}
        </div>
      </nav>

      {/* 애니메이션 keyframes */}
      <style jsx global>{`
        @keyframes fabItemPop {
          0% { opacity: 0; transform: scale(0.3) translateY(30px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  )
}

function NavTab({ tab, pathname }: { tab: Tab; pathname: string | null }) {
  const isActive = tab.href === '/'
    ? pathname === '/'
    : pathname?.startsWith(tab.href)
  const Icon = tab.icon

  return (
    <Link
      href={tab.href}
      className="flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1"
    >
      <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#212124]' : 'text-[#AEB1B9]'}`} />
      <span className={`text-[10px] transition-colors ${isActive ? 'text-[#212124] font-semibold' : 'text-[#AEB1B9]'}`}>
        {tab.label}
      </span>
    </Link>
  )
}
