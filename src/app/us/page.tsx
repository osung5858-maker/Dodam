'use client'

import Link from 'next/link'

const MENU_GROUPS = [
  {
    label: '가족',
    items: [
      { href: '/settings/caregivers', icon: '👥', bg: 'bg-[#C8F0D8]', title: '공동양육자', desc: '가족 초대 · 기록 공유' },
      { href: '/settings/caregivers/invite', icon: '💌', bg: 'bg-[#FEF0E8]', title: '가족 초대하기', desc: '카카오톡으로 초대 링크 보내기' },
    ],
  },
  {
    label: '동네',
    items: [
      { href: '/map', icon: '🗺️', bg: 'bg-[#E0F0F8]', title: '동네 육아 지도', desc: '소아과 · 키즈카페 · 문화센터' },
      { href: '/emergency', icon: '🚨', bg: 'bg-[#FDE8E8]', title: '응급 소아과 찾기', desc: '지금 영업 중인 가까운 소아과' },
    ],
  },
  {
    label: '설정',
    items: [
      { href: '/settings', icon: '⚙️', bg: 'bg-[#F0F0F0]', title: '설정', desc: '알림 · 계정 · 다크 모드' },
      { href: '/settings/children', icon: '👶', bg: 'bg-[#F5F5FA]', title: '아기 프로필', desc: '이름 · 생일 · 특이사항 관리' },
    ],
  },
]

export default function UsPage() {
  return (
    <div className="min-h-[100dvh] bg-[#F5F4F1]">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[#f0f0f0]">
        <div className="flex items-center h-14 px-5 max-w-lg mx-auto">
          <h1 className="text-[17px] font-bold text-[#1A1918]">우리</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4 pb-28 space-y-5">
        {MENU_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[12px] font-semibold text-[#9C9B99] uppercase tracking-wide mb-2 px-1">{group.label}</p>
            <div className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
              {group.items.map((item, i) => (
                <Link
                  key={item.href + item.title}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-4 py-3.5 active:bg-[#F7F8FA] transition-colors ${
                    i > 0 ? 'border-t border-[#f0f0f0]' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                    <span className="text-lg">{item.icon}</span>
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
        ))}

        {/* 앱 정보 */}
        <div className="text-center pt-4">
          <p className="text-[11px] text-[#AEB1B9]">도담 v1.0 · 오늘도 도담하게</p>
        </div>
      </div>
    </div>
  )
}
