'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  /** 'native' = 콘텐츠 카드처럼 | 'banner' = 얇은 배너 */
  variant?: 'native' | 'banner'
  className?: string
}

/**
 * 광고 슬롯 — 앱 디자인에 녹아드는 광고 컴포넌트
 *
 * - 실제 AdSense가 로드되면 구글 광고 표시
 * - 로드 전/실패 시 빈 공간 (레이아웃 밀림 없음)
 * - "광고" 라벨을 작게 표시 (투명도 낮게)
 */
export default function AdSlot({ variant = 'native', className = '' }: Props) {
  const adRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // AdSense 스크립트가 로드되어 있으면 push
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
        setLoaded(true)
      }
    } catch {
      // AdSense 미로드 시 무시
    }
  }, [])

  if (variant === 'banner') {
    return (
      <div className={`relative ${className}`}>
        <div ref={adRef} className="w-full min-h-[50px] flex items-center justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '50px' }}
            data-ad-client="ca-pub-7884114322521157"
            data-ad-slot="XXXXXXXXXX"
            data-ad-format="horizontal"
            data-full-width-responsive="false"
          />
        </div>
        {loaded && (
          <span className="absolute top-1 right-2 text-[9px] text-[#D0CCC7]">AD</span>
        )}
      </div>
    )
  }

  // native — 앱 카드와 동일한 스타일
  return (
    <div className={`relative ${className}`}>
      <div
        ref={adRef}
        className="bg-white rounded-xl border border-[#E8E4DF] overflow-hidden"
      >
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '100px' }}
          data-ad-client="ca-pub-7884114322521157"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="fluid"
          data-ad-layout-key="-6t+ed+2i-1n-4w"
        />
      </div>
      {loaded && (
        <span className="absolute top-2 right-3 text-[9px] text-[#D0CCC7]">광고</span>
      )}
    </div>
  )
}
