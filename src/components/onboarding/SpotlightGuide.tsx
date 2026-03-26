'use client'

import { useState, useEffect, useCallback } from 'react'

interface GuideStep {
  /** CSS selector for the target element */
  target: string
  /** 말풍선 텍스트 */
  title: string
  desc: string
  /** 말풍선 위치 */
  position: 'top' | 'bottom'
}

const GUIDE_STEPS: Record<string, GuideStep[]> = {
  parenting: [
    {
      target: '[data-guide="fab"]',
      title: '여기를 눌러 기록해요',
      desc: '수유 · 수면 · 기저귀 — 원탭으로 간편하게',
      position: 'top',
    },
    {
      target: '[data-guide="ai-card"]',
      title: 'AI가 분석해줘요',
      desc: '기록이 쌓이면 수유/수면 리듬을 알려드려요',
      position: 'bottom',
    },
    {
      target: '[data-guide="nav-town"]',
      title: '동네 소아과 찾기',
      desc: '급할 때 가까운 소아과를 바로 검색해요',
      position: 'top',
    },
    {
      target: '[data-guide="nav-record"]',
      title: '성장 기록',
      desc: '키 · 몸무게 · 발달 체크를 모아볼 수 있어요',
      position: 'top',
    },
    {
      target: '[data-guide="profile"]',
      title: '프로필 사진을 바꿔보세요',
      desc: '탭하면 귀여운 아바타를 선택할 수 있어요',
      position: 'bottom',
    },
  ],
  pregnant: [
    {
      target: '[data-guide="fetal-card"]',
      title: '우리 아이 이만큼 자랐어요',
      desc: '매주 태아 크기와 발달 상황을 알려드려요',
      position: 'bottom',
    },
    {
      target: '[data-guide="daily-check"]',
      title: '매일 챙기기',
      desc: '물 · 산책 · 영양제 — 탭해서 완료 표시',
      position: 'bottom',
    },
    {
      target: '[data-guide="mood"]',
      title: '오늘 기분은 어때요?',
      desc: '기분을 기록하면 AI가 맞춤 조언을 해요',
      position: 'bottom',
    },
    {
      target: '[data-guide="nav-town"]',
      title: '동네 산부인과 찾기',
      desc: '가까운 병원을 지도에서 바로 검색해요',
      position: 'top',
    },
  ],
  preparing: [
    {
      target: '[data-guide="cycle-setup"]',
      title: '주기를 설정해요',
      desc: '마지막 생리일을 입력하면 배란일을 계산해요',
      position: 'bottom',
    },
    {
      target: '[data-guide="supplements"]',
      title: '엽산 챙기셨나요?',
      desc: '매일 영양제 복용을 체크할 수 있어요',
      position: 'bottom',
    },
    {
      target: '[data-guide="ai-briefing"]',
      title: 'AI 브리핑',
      desc: '오늘의 임신 확률과 컨디션 팁을 알려줘요',
      position: 'bottom',
    },
    {
      target: '[data-guide="nav-more"]',
      title: '더 많은 기능',
      desc: '이름 짓기 · 운세 · 정부 혜택 정보도 있어요',
      position: 'top',
    },
  ],
}

interface Props {
  mode: string
  onComplete: () => void
}

export default function SpotlightGuide({ mode, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const steps = GUIDE_STEPS[mode] || GUIDE_STEPS.parenting
  const current = steps[step]
  const isLast = step === steps.length - 1

  const findTarget = useCallback(() => {
    if (!current) return
    const el = document.querySelector(current.target)
    if (el) {
      setRect(el.getBoundingClientRect())
    } else {
      // 타겟 못 찾으면 다음 스텝
      if (!isLast) setStep(s => s + 1)
      else onComplete()
    }
  }, [current, isLast, onComplete])

  useEffect(() => {
    // 약간 딜레이 후 타겟 찾기 (렌더링 완료 대기)
    const timer = setTimeout(findTarget, 300)
    return () => clearTimeout(timer)
  }, [step, findTarget])

  // 윈도우 리사이즈/스크롤 시 위치 갱신
  useEffect(() => {
    const handler = () => findTarget()
    window.addEventListener('resize', handler)
    window.addEventListener('scroll', handler, true)
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('scroll', handler, true)
    }
  }, [findTarget])

  const handleNext = () => {
    if (isLast) onComplete()
    else setStep(step + 1)
  }

  if (!current || !rect) return null

  const pad = 6
  const spotX = rect.left - pad
  const spotY = rect.top - pad
  const spotW = rect.width + pad * 2
  const spotH = rect.height + pad * 2
  const spotR = 16

  // 말풍선 위치
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(320px, calc(100vw - 40px))',
    zIndex: 102,
  }
  if (current.position === 'bottom') {
    tooltipStyle.top = spotY + spotH + 16
  } else {
    tooltipStyle.bottom = window.innerHeight - spotY + 16
  }

  return (
    <div className="fixed inset-0 z-[100]" onClick={handleNext}>
      {/* 오버레이 (스포트라이트 구멍) */}
      <svg className="fixed inset-0 w-full h-full" style={{ zIndex: 101 }}>
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={spotX} y={spotY}
              width={spotW} height={spotH}
              rx={spotR} ry={spotR}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%" height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#spotlight-mask)"
        />
        {/* 스포트라이트 테두리 */}
        <rect
          x={spotX} y={spotY}
          width={spotW} height={spotH}
          rx={spotR} ry={spotR}
          fill="none"
          stroke="white"
          strokeWidth={2}
          opacity={0.5}
        />
      </svg>

      {/* 말풍선 */}
      <div style={tooltipStyle} onClick={e => e.stopPropagation()}>
        <div className="bg-white rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <p className="text-[16px] font-bold text-[#1A1918] mb-1">{current.title}</p>
          <p className="text-[14px] text-[#6B6966] leading-relaxed">{current.desc}</p>

          <div className="flex items-center justify-between mt-4">
            {/* 스텝 인디케이터 */}
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? 'w-4 bg-[var(--color-primary)]' : 'w-1.5 bg-[#E8E4DF]'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); onComplete() }}
                className="text-[13px] text-[#9E9A95] active:opacity-60"
              >
                건너뛰기
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-[13px] font-semibold active:opacity-80"
              >
                {isLast ? '완료' : '다음'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
