'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BowlIcon, SparkleIcon, MapPinIcon } from '@/components/ui/Icons'
import { shareMealPlan } from '@/lib/kakao/share-parenting'

interface Props {
  /** 'parenting' | 'pregnant' | 'preparing' */
  mode: string
  /** 육아: 월령, 임신: 주차 */
  value: number
  /** 준비: 주기 단계 */
  phase?: string
}

interface MealData {
  breakfast?: { menu: string; ingredients?: string; reason?: string }
  lunch?: { menu: string; ingredients?: string; reason?: string }
  dinner?: { menu: string; ingredients?: string; reason?: string }
  snack?: { menu: string; ingredients?: string; reason?: string }
  newFood?: string
  keyNutrient?: string
  avoid?: string
  tip?: string
}

function getLabel(mode: string, value: number, phase?: string) {
  if (mode === 'parenting') {
    const s = value < 6 ? '초기' : value < 8 ? '중기' : value < 10 ? '후기' : '완료기'
    return { title: `${s} 이유식 · ${value}개월`, short: s }
  }
  if (mode === 'pregnant') {
    const t = value <= 13 ? '초기' : value <= 27 ? '중기' : '후기'
    return { title: `${t} 임산부 식단`, short: t }
  }
  const phaseKo: Record<string, string> = { follicular: '난포기', fertile: '가임기', ovulation: '배란기', luteal: '황체기', tww: '착상대기', menstrual: '생리기' }
  return { title: `${phaseKo[phase || ''] || '맞춤'} 식단`, short: phaseKo[phase || ''] || '맞춤' }
}

function getApiConfig(mode: string, value: number, phase?: string) {
  if (mode === 'parenting') return { url: '/api/ai-parenting', body: { type: 'meal', ageMonths: value } }
  if (mode === 'pregnant') return { url: '/api/ai-pregnant', body: { type: 'meal', week: value } }
  return { url: '/api/ai-preparing', body: { type: 'meal', phase: phase || 'follicular' } }
}

function getCacheKey(mode: string, value: number, phase?: string) {
  const today = new Date().toISOString().split('T')[0]
  if (mode === 'parenting') return `dodam_meal_${value}_${today}`
  if (mode === 'pregnant') return `dodam_preg_meal_${value}_${today}`
  return `dodam_prep_meal_${phase}_${today}`
}

export default function AIMealCard({ mode, value, phase }: Props) {
  const [meal, setMeal] = useState<MealData | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const { title } = getLabel(mode, value, phase)

  useEffect(() => {
    const key = getCacheKey(mode, value, phase)
    try {
      const cached = localStorage.getItem(key)
      if (cached) { const d = JSON.parse(cached); if (d.breakfast) setMeal(d) }
    } catch { /* */ }
  }, [mode, value, phase])

  const fetchMeal = async () => {
    setLoading(true)
    const { url, body } = getApiConfig(mode, value, phase)
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (data.breakfast) {
        setMeal(data)
        setExpanded(true)
        try { localStorage.setItem(getCacheKey(mode, value, phase), JSON.stringify(data)) } catch { /* */ }
      }
    } catch { /* */ }
    setLoading(false)
  }

  // 식당 찾기 — 메뉴명을 검색어로 지도 페이지에 전달
  const getRestaurantQuery = () => {
    if (!meal) return ''
    // 점심 메뉴를 기본 검색어로 (가장 외식하기 좋은 끼니)
    const menu = meal.lunch?.menu || meal.dinner?.menu || meal.breakfast?.menu || ''
    // "시금치 달걀죽" → "시금치" 첫 단어만 추출 (너무 구체적이면 검색 안 됨)
    const keyword = menu.split(/[·,\s]/)[0].replace(/[()]/g, '').trim()
    return keyword || '맛집'
  }

  if (!meal && !loading) {
    return (
      <button onClick={fetchMeal} className="w-full bg-white rounded-xl border border-[#E8E4DF] p-3 flex items-center gap-2.5 active:bg-[#F5F1EC] text-left">
        <div className="w-9 h-9 rounded-full bg-[#FFF0E6] flex items-center justify-center shrink-0">
          <BowlIcon className="w-4.5 h-4.5 text-[var(--color-primary)]" />
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-[#1A1918]">{title}</p>
          <p className="text-[13px] text-[#9E9A95]">AI 오늘의 식단 추천받기</p>
        </div>
        <SparkleIcon className="w-4 h-4 text-[var(--color-primary)]" />
      </button>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E8E4DF] p-3 flex items-center gap-2.5">
        <div className="w-5 h-5 border-2 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin" />
        <p className="text-[13px] text-[#6B6966]">AI가 오늘 식단을 추천하고 있어요...</p>
      </div>
    )
  }

  const meals = [
    { label: '아침', data: meal?.breakfast },
    { label: '점심', data: meal?.lunch },
    ...(meal?.dinner ? [{ label: '저녁', data: meal.dinner }] : []),
    { label: '간식', data: meal?.snack },
  ].filter(m => m.data)

  return (
    <div className="bg-white rounded-xl border border-[#E8E4DF] overflow-hidden">
      <button onClick={() => setExpanded(v => !v)} className="w-full p-3 flex items-center gap-2.5 text-left active:bg-[#F5F1EC]">
        <div className="w-9 h-9 rounded-full bg-[#FFF0E6] flex items-center justify-center shrink-0">
          <BowlIcon className="w-4.5 h-4.5 text-[var(--color-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[#1A1918]">{title} · 오늘의 식단</p>
          <p className="text-[13px] text-[#6B6966] truncate">{meal?.breakfast?.menu} · {meal?.lunch?.menu}</p>
        </div>
        <span className="text-[12px] text-[#9E9A95]">{expanded ? '접기' : '펼치기'}</span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {meals.map(m => (
            <div key={m.label} className="p-2.5 rounded-lg bg-[var(--color-page-bg)]">
              <p className="text-[12px] font-semibold text-[#6B6966]">{m.label}</p>
              <p className="text-[13px] font-medium text-[#1A1918] mt-0.5">{m.data!.menu}</p>
              <p className="text-[11px] text-[#9E9A95]">{m.data!.ingredients || m.data!.reason}</p>
            </div>
          ))}

          {meal?.newFood && <p className="text-[12px] text-[var(--color-primary)] font-medium px-1">이번 주 새 식재료: {meal.newFood}</p>}
          {meal?.keyNutrient && <p className="text-[12px] text-[var(--color-primary)] font-medium px-1">핵심 영양소: {meal.keyNutrient}</p>}
          {meal?.avoid && <p className="text-[11px] text-[#D08068] px-1">주의: {meal.avoid}</p>}
          {meal?.tip && <p className="text-[11px] text-[#9E9A95] px-1">{meal.tip}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={fetchMeal} className="flex-1 py-1.5 text-[11px] text-[#6B6966] bg-[var(--color-page-bg)] rounded-lg active:bg-[#E8E4DF]">다른 식단</button>
            <button onClick={() => shareMealPlan(value, meal?.breakfast?.menu || '', meal?.lunch?.menu || '', meal?.snack?.menu || '')} className="flex-1 py-1.5 text-[11px] text-[var(--color-primary)] font-semibold bg-[var(--color-page-bg)] rounded-lg active:bg-[#E8E4DF]">카톡 공유</button>
            {mode === 'parenting' && (
              <Link href="/babyfood" className="flex-1 py-1.5 text-[11px] text-[var(--color-primary)] font-medium bg-[#FFF0E6] rounded-lg text-center active:bg-[#FFE0CC]">가이드</Link>
            )}
          </div>

          {/* 근처 식당 찾기 */}
          <Link
            href={`/map?q=${encodeURIComponent(getRestaurantQuery())}`}
            className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F0F4FF] border border-[#D5DFEF] active:bg-[#E0EAFF]"
          >
            <MapPinIcon className="w-4 h-4 text-[#4A6FA5] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[#4A6FA5]">근처에서 비슷한 식당 찾기</p>
              <p className="text-[11px] text-[#6B6966] truncate">"{getRestaurantQuery()}" 검색 · 동네 지도</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
