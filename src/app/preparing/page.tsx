'use client'

import { useState } from 'react'
import Link from 'next/link'

const HEALTH_CHECKLIST = [
  { id: 'folic', title: '엽산 복용 시작', desc: '임신 3개월 전부터 하루 400~800μg', icon: '💊' },
  { id: 'checkup', title: '산전 건강검진', desc: '혈액검사 · 소변검사 · 풍진항체', icon: '🏥' },
  { id: 'dental', title: '치과 검진', desc: '임신 중 치료 어려우니 미리', icon: '🦷' },
  { id: 'vaccine', title: '예방접종 확인', desc: '풍진 · 수두 · A형간염 항체 확인', icon: '💉' },
  { id: 'weight', title: '적정 체중 관리', desc: 'BMI 18.5~24.9 유지', icon: '⚖️' },
  { id: 'smoking', title: '금연 · 금주', desc: '임신 3개월 전부터 필수', icon: '🚭' },
  { id: 'exercise', title: '규칙적 운동', desc: '걷기 · 요가 · 수영 주 3회', icon: '🏃‍♀️' },
  { id: 'stress', title: '스트레스 관리', desc: '충분한 수면 · 명상 · 취미활동', icon: '🧘' },
]

const GOV_SUPPORTS = [
  { title: '난임 시술비 지원', desc: '체외수정 최대 110만원, 인공수정 30만원', link: '건강보험공단' },
  { title: '산전검사 무료 쿠폰', desc: '보건소에서 기본 산전검사 무료', link: '관할 보건소' },
  { title: '엽산/철분제 무료 지급', desc: '보건소 등록 시 임신 전~출산까지', link: '관할 보건소' },
  { title: '고위험 임산부 의료비', desc: '19대 질환 입원치료비 최대 300만원', link: '사회서비스' },
]

const AI_TIPS = [
  { title: '이번 주 AI 제안', content: '배란일이 다가오고 있어요. 이번 주는 충분한 수면과 엽산 복용을 유지해보세요.', type: 'routine' },
  { title: '영양 제안', content: '임신 준비 중에는 엽산 외에도 비타민D, 철분, 오메가3 섭취를 권장해요.', type: 'nutrition' },
  { title: '운동 제안', content: '가벼운 유산소 운동이 혈액순환과 호르몬 균형에 도움돼요. 하루 30분 걷기를 추천해요.', type: 'exercise' },
]

export default function PreparingPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dodam_preparing_checks')
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })

  const toggleCheck = (id: string) => {
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    localStorage.setItem('dodam_preparing_checks', JSON.stringify(next))
  }

  const checkedCount = HEALTH_CHECKLIST.filter((c) => checked[c.id]).length

  return (
    <div className="min-h-[100dvh] bg-[#F5F4F1]">
      <header className="sticky top-0 z-40 bg-white border-b border-[#f0f0f0]">
        <div className="flex items-center justify-between h-14 px-5 max-w-lg mx-auto">
          <div>
            <p className="text-[12px] text-[#868B94]">임신 준비 중</p>
            <p className="text-[16px] font-bold text-[#1A1918]">건강하게 시작해요</p>
          </div>
          <Link href="/" className="text-[11px] text-[#3D8A5A] font-semibold">모드 변경 →</Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 pt-4 pb-28 space-y-3">

        {/* AI 제안 카드 */}
        <div className="bg-white rounded-xl border border-[#f0f0f0] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#F0F9F4] flex items-center justify-center">
              <span className="text-sm">✨</span>
            </div>
            <p className="text-[14px] font-bold text-[#1A1918]">AI 케어</p>
          </div>
          <div className="space-y-3">
            {AI_TIPS.map((tip) => (
              <div key={tip.title} className="p-3 bg-[#F5F4F1] rounded-xl">
                <p className="text-[11px] font-semibold text-[#3D8A5A] mb-1">{tip.title}</p>
                <p className="text-[13px] text-[#1A1918] leading-relaxed">{tip.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 건강 체크리스트 */}
        <div className="bg-white rounded-xl border border-[#f0f0f0] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-bold text-[#1A1918]">임신 준비 체크리스트</p>
            <p className="text-[11px] text-[#868B94]">{checkedCount}/{HEALTH_CHECKLIST.length}</p>
          </div>
          <div className="space-y-1">
            {HEALTH_CHECKLIST.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left active:bg-[#F5F4F1]"
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  checked[item.id] ? 'bg-[#3D8A5A] border-[#3D8A5A]' : 'border-[#AEB1B9]'
                }`}>
                  {checked[item.id] && <span className="text-white text-[10px]">✓</span>}
                </div>
                <div className="flex-1">
                  <p className={`text-[13px] ${checked[item.id] ? 'text-[#AEB1B9] line-through' : 'text-[#1A1918] font-medium'}`}>
                    {item.icon} {item.title}
                  </p>
                  <p className="text-[11px] text-[#868B94]">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 정부 지원 정보 */}
        <div className="bg-white rounded-xl border border-[#f0f0f0] p-4">
          <p className="text-[14px] font-bold text-[#1A1918] mb-3">🏛 정부 지원 정보</p>
          <div className="space-y-2">
            {GOV_SUPPORTS.map((item) => (
              <div key={item.title} className="p-3 bg-[#F5F4F1] rounded-xl">
                <p className="text-[13px] font-semibold text-[#1A1918]">{item.title}</p>
                <p className="text-[11px] text-[#868B94] mt-0.5">{item.desc}</p>
                <p className="text-[10px] text-[#3D8A5A] mt-1">📍 {item.link}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 다음 단계 안내 */}
        <div className="bg-[#F0F9F4] rounded-xl border border-[#C8F0D8] p-4 text-center">
          <p className="text-[13px] font-semibold text-[#3D8A5A] mb-1">임신이 확인되면</p>
          <p className="text-[12px] text-[#6D6C6A]">임신 모드로 전환하면 주차별 태아 성장 정보를 확인할 수 있어요</p>
          <Link href="/onboarding" className="inline-block mt-3 px-4 py-2 bg-[#3D8A5A] text-white text-[12px] font-semibold rounded-lg">
            모드 변경하기
          </Link>
        </div>
      </div>
    </div>
  )
}
