'use client'

import Link from 'next/link'

const CARE_ITEMS = [
  {
    href: '/lullaby',
    icon: '🌙',
    bg: 'bg-[#E8E0F8]',
    title: '자장가',
    desc: 'AI 수면 도우미 · 자장가 59곡 · 동요 57곡',
  },
  {
    href: '/lullaby',
    icon: '🌧️',
    bg: 'bg-[#E0F0F8]',
    title: '자연음',
    desc: '빗소리 · 파도소리 · 백색소음 · 심장소리',
  },
]

const TIPS = [
  { icon: '🍼', title: '수유 팁', desc: '월령별 적정 수유량 가이드' },
  { icon: '💤', title: '수면 팁', desc: '통잠 유도하는 5가지 방법' },
  { icon: '🌡️', title: '응급 대처', desc: '아이가 열날 때 체크리스트' },
  { icon: '🥄', title: '이유식 가이드', desc: '단계별 이유식 시작하기' },
]

export default function CarePage() {
  return (
    <div className="min-h-[100dvh] bg-[#F5F4F1]">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[#f0f0f0]">
        <div className="flex items-center h-14 px-5 max-w-lg mx-auto">
          <h1 className="text-[17px] font-bold text-[#1A1918]">케어</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4 pb-28 space-y-4">
        {/* 수면 도우미 */}
        <div>
          <p className="text-[12px] font-semibold text-[#9C9B99] uppercase tracking-wide mb-2 px-1">수면 도우미</p>
          <div className="space-y-2">
            {CARE_ITEMS.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center gap-3.5 p-4 bg-white rounded-2xl border border-[#f0f0f0] active:scale-[0.98] transition-transform"
              >
                <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                  <span className="text-xl">{item.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#1A1918]">{item.title}</p>
                  <p className="text-[11px] text-[#9C9B99]">{item.desc}</p>
                </div>
                <span className="text-[#D1D0CD] text-sm">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 육아 팁 */}
        <div>
          <p className="text-[12px] font-semibold text-[#9C9B99] uppercase tracking-wide mb-2 px-1">육아 가이드</p>
          <div className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
            {TIPS.map((tip, i) => (
              <div
                key={tip.title}
                className={`flex items-center gap-3.5 px-4 py-3.5 ${i > 0 ? 'border-t border-[#f0f0f0]' : ''}`}
              >
                <div className="w-9 h-9 rounded-lg bg-[#F5F4F1] flex items-center justify-center shrink-0">
                  <span className="text-base">{tip.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[#1A1918]">{tip.title}</p>
                  <p className="text-[11px] text-[#9C9B99]">{tip.desc}</p>
                </div>
                <span className="text-[11px] text-[#D1D0CD]">준비 중</span>
              </div>
            ))}
          </div>
        </div>

        {/* 응급 안내 */}
        <div className="bg-[#FDE8E8] rounded-2xl p-4 border border-[#F5CDCD]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🚨</span>
            <span className="text-[13px] font-bold text-[#D08068]">응급 모드</span>
          </div>
          <p className="text-[12px] text-[#8B5E4E] leading-relaxed">
            아이가 아플 때, 핸드폰을 흔들면 가까운 소아과를 바로 찾아줘요.
          </p>
        </div>
      </div>
    </div>
  )
}
