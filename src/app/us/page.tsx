'use client'

import Link from 'next/link'

const MENU_GROUPS = [
  {
    label: '케어',
    items: [
      { href: '/lullaby', icon: '🌙', title: '자장가 · 동요', desc: '수면 도우미 · 120곡+' },
      { href: '/memory', icon: '📋', title: '발달 체크리스트', desc: '월령별 발달 확인 · AI 분석' },
    ],
  },
  {
    label: '가족',
    items: [
      { href: '/settings/caregivers', icon: '👥', title: '공동양육자', desc: '가족 초대 · 기록 공유' },
      { href: '/settings/caregivers/invite', icon: '💌', title: '가족 초대하기', desc: '카카오톡으로 초대 링크 보내기' },
    ],
  },
  {
    label: '동네',
    items: [
      { href: '/map', icon: '🗺️', title: '동네 육아 지도', desc: '소아과 · 키즈카페 · 문화센터' },
      { href: '/emergency', icon: '🚨', title: '응급 소아과 찾기', desc: '지금 영업 중인 가까운 소아과' },
    ],
  },
  {
    label: '설정',
    items: [
      { href: '/settings', icon: '⚙️', title: '설정', desc: '알림 · 계정 · 다크 모드' },
      { href: '/settings/children', icon: '👶', title: '아기 프로필', desc: '이름 · 생일 · 특이사항 관리' },
    ],
  },
  {
    label: '콘텐츠',
    items: [
      { href: 'https://www.youtube.com/@todaydoha', icon: '🎬', title: '도하, 오늘도', desc: '육아 가이드 · 유튜브 채널', external: true },
    ],
  },
]

export default function UsPage() {
  return (
    <div className="min-h-[100dvh] bg-[#F5F4F1]">
      <header className="sticky top-0 z-40 bg-white border-b border-[#f0f0f0]">
        <div className="flex items-center h-14 px-5 max-w-lg mx-auto">
          <h1 className="text-[17px] font-bold text-[#1A1918]">우리</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 pt-4 pb-28 space-y-3">
        {MENU_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[13px] font-semibold text-[#868B94] mb-2">{group.label}</p>
            <div className="bg-white rounded-xl border border-[#f0f0f0] overflow-hidden">
              {group.items.map((item, i) => {
                const isExt = 'external' in item
                const Comp = isExt ? 'a' : Link
                const props = isExt
                  ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
                  : { href: item.href }
                return (
                  <Comp
                    key={item.href + item.title}
                    {...(props as any)}
                    className={`flex items-center gap-3 px-4 py-3 active:bg-[#F5F4F1] transition-colors ${
                      i > 0 ? 'border-t border-[#f0f0f0]' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#F5F4F1] flex items-center justify-center shrink-0">
                      <span className="text-base">{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-[#1A1918]">{item.title}</p>
                      <p className="text-[11px] text-[#868B94]">{item.desc}</p>
                    </div>
                    <span className="text-[#AEB1B9] text-sm">{isExt ? '↗' : '→'}</span>
                  </Comp>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
