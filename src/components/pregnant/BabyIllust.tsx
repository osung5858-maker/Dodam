'use client'

// 주차별 아기 일러스트 — SVG 기반 감성 캐릭터
export default function BabyIllust({ week }: { week: number }) {
  // 주차별 크기/표정/색상 계산
  const size = Math.min(20 + (week / 40) * 60, 80) // 20~80
  const bodyColor = '#FFE0C2'
  const cheekColor = '#FFB8B8'
  const eyeOpen = week >= 28

  // 주차별 단계
  if (week < 8) {
    // 초기 — 작은 씨앗
    return (
      <svg viewBox="0 0 100 100" width="80" height="80">
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF8F0" />
            <stop offset="100%" stopColor="#F0F9F4" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#glow)" />
        <ellipse cx="50" cy="52" rx={size / 4} ry={size / 3} fill={bodyColor} />
        <circle cx="50" cy="42" r={size / 5} fill={bodyColor} />
        {/* 잠자는 눈 */}
        <path d="M44 41 Q46 39 48 41" fill="none" stroke="#8B7355" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M52 41 Q54 39 56 41" fill="none" stroke="#8B7355" strokeWidth="1.2" strokeLinecap="round" />
        {/* 하트 */}
        <text x="50" y="68" textAnchor="middle" fontSize="8" fill="#FFB8B8">♥</text>
        <text x="50" y="90" textAnchor="middle" fontSize="7" fill="#AEB1B9">아직 작지만 열심히!</text>
      </svg>
    )
  }

  if (week < 16) {
    // 초기~중기 — 작은 아기
    return (
      <svg viewBox="0 0 100 100" width="80" height="80">
        <defs>
          <radialGradient id="glow2" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FFF8F0" />
            <stop offset="100%" stopColor="#F0F9F4" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#glow2)" />
        {/* 몸 */}
        <ellipse cx="50" cy="58" rx={size / 3} ry={size / 2.5} fill={bodyColor} />
        {/* 머리 */}
        <circle cx="50" cy="38" r={size / 3.5} fill={bodyColor} />
        {/* 잠자는 눈 */}
        <path d="M43 37 Q46 35 49 37" fill="none" stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M51 37 Q54 35 57 37" fill="none" stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round" />
        {/* 볼 터치 */}
        <circle cx="40" cy="41" r="3" fill={cheekColor} opacity="0.4" />
        <circle cx="60" cy="41" r="3" fill={cheekColor} opacity="0.4" />
        {/* 입 */}
        <path d="M47 43 Q50 45 53 43" fill="none" stroke="#D4A88C" strokeWidth="1" strokeLinecap="round" />
        {/* 작은 손 */}
        <circle cx="38" cy="52" r="3" fill={bodyColor} />
        <circle cx="62" cy="52" r="3" fill={bodyColor} />
        <text x="50" y="90" textAnchor="middle" fontSize="7" fill="#AEB1B9">조금씩 자라는 중</text>
      </svg>
    )
  }

  if (week < 28) {
    // 중기 — 움직이는 아기
    return (
      <svg viewBox="0 0 100 100" width="80" height="80">
        <defs>
          <radialGradient id="glow3" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FFF8F0" />
            <stop offset="100%" stopColor="#F0F9F4" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#glow3)" />
        {/* 몸 */}
        <ellipse cx="50" cy="58" rx="16" ry="18" fill={bodyColor} />
        {/* 머리 */}
        <circle cx="50" cy="35" r="14" fill={bodyColor} />
        {/* 머리카락 */}
        <path d="M38 28 Q42 22 50 24 Q58 22 62 28" fill="none" stroke="#C4A35A" strokeWidth="2" strokeLinecap="round" />
        {/* 눈 — 반짝 */}
        <circle cx="44" cy="34" r="2.5" fill="#5D4E37" />
        <circle cx="56" cy="34" r="2.5" fill="#5D4E37" />
        <circle cx="45" cy="33" r="1" fill="white" />
        <circle cx="57" cy="33" r="1" fill="white" />
        {/* 볼 */}
        <circle cx="38" cy="38" r="4" fill={cheekColor} opacity="0.35" />
        <circle cx="62" cy="38" r="4" fill={cheekColor} opacity="0.35" />
        {/* 웃는 입 */}
        <path d="M45 41 Q50 45 55 41" fill="none" stroke="#D4A88C" strokeWidth="1.5" strokeLinecap="round" />
        {/* 손 인사 */}
        <path d="M34 48 L28 42" stroke={bodyColor} strokeWidth="4" strokeLinecap="round" />
        <circle cx="27" cy="41" r="3" fill={bodyColor} />
        <path d="M66 50 L70 46" stroke={bodyColor} strokeWidth="4" strokeLinecap="round" />
        <circle cx="71" cy="45" r="3" fill={bodyColor} />
        {/* 발 */}
        <ellipse cx="43" cy="75" rx="5" ry="3" fill={bodyColor} />
        <ellipse cx="57" cy="75" rx="5" ry="3" fill={bodyColor} />
        <text x="50" y="95" textAnchor="middle" fontSize="7" fill="#AEB1B9">반가워요!</text>
      </svg>
    )
  }

  // 후기 — 큰 아기
  return (
    <svg viewBox="0 0 100 100" width="80" height="80">
      <defs>
        <radialGradient id="glow4" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FFF8F0" />
          <stop offset="100%" stopColor="#F0F9F4" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#glow4)" />
      {/* 몸 */}
      <ellipse cx="50" cy="58" rx="18" ry="20" fill={bodyColor} />
      {/* 머리 */}
      <circle cx="50" cy="32" r="16" fill={bodyColor} />
      {/* 머리카락 */}
      <path d="M36 25 Q40 18 50 20 Q60 18 64 25" fill="none" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M42 22 Q48 16 54 22" fill="none" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" />
      {/* 눈 — 반짝 (크게) */}
      <circle cx="43" cy="31" r="3" fill="#5D4E37" />
      <circle cx="57" cy="31" r="3" fill="#5D4E37" />
      <circle cx="44" cy="30" r="1.2" fill="white" />
      <circle cx="58" cy="30" r="1.2" fill="white" />
      {/* 볼 */}
      <circle cx="36" cy="36" r="4.5" fill={cheekColor} opacity="0.4" />
      <circle cx="64" cy="36" r="4.5" fill={cheekColor} opacity="0.4" />
      {/* 큰 웃음 */}
      <path d="M43 39 Q50 46 57 39" fill="none" stroke="#D4A88C" strokeWidth="2" strokeLinecap="round" />
      {/* 두 손 하트 */}
      <path d="M32 48 Q28 40 35 44" stroke={bodyColor} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M68 48 Q72 40 65 44" stroke={bodyColor} strokeWidth="4" fill="none" strokeLinecap="round" />
      <text x="50" y="52" textAnchor="middle" fontSize="8" fill="#FFB8B8">♥</text>
      {/* 발 */}
      <ellipse cx="42" cy="77" rx="6" ry="3.5" fill={bodyColor} />
      <ellipse cx="58" cy="77" rx="6" ry="3.5" fill={bodyColor} />
      <text x="50" y="96" textAnchor="middle" fontSize="7" fill="#AEB1B9">곧 만나요!</text>
    </svg>
  )
}
