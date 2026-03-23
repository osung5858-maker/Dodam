'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Mode = null | 'preparing' | 'pregnant' | 'parenting'
type Step = 'mode' | 'login'

export default function OnboardingPage() {
  const [mode, setMode] = useState<Mode>(null)
  const [step, setStep] = useState<Step>('mode')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleModeSelect = (selected: Mode) => {
    setMode(selected)
    if (selected) {
      localStorage.setItem('dodam_mode', selected)
      setStep('login')
    }
  }

  const handleLogin = async (provider: 'kakao' | 'google') => {
    setLoading(provider)
    setError(null)

    const supabase = createClient()
    const scopes = provider === 'kakao' ? 'profile_nickname profile_image' : 'profile email'

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes,
      },
    })

    if (error) {
      setError('로그인에 실패했어요. 다시 시도해주세요.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* 상단 로고 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-[#3D8A5A] flex items-center justify-center shadow-[0_4px_20px_rgba(61,138,90,0.25)]">
          <span className="text-3xl font-bold text-white">도</span>
        </div>
        <h1 className="mt-6 text-[28px] font-bold text-[#212124]">도담</h1>
        <p className="mt-2 text-[15px] text-[#868B94] text-center">오늘도 도담하게</p>

        {step === 'mode' && (
          <div className="mt-10 w-full max-w-xs space-y-3">
            <p className="text-[14px] font-semibold text-[#212124] text-center mb-4">지금 어떤 상태인가요?</p>

            {[
              { key: 'preparing' as Mode, emoji: '💝', title: '임신을 준비하고 있어요', desc: '배란일 · 건강 체크 · 준비 가이드' },
              { key: 'pregnant' as Mode, emoji: '🤰', title: '임신 중이에요', desc: '주차별 태아 성장 · D-day · 체크리스트' },
              { key: 'parenting' as Mode, emoji: '👶', title: '아이를 키우고 있어요', desc: '수유 · 수면 · 성장 기록 · AI 인사이트' },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => handleModeSelect(option.key)}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
                  mode === option.key ? 'border-[#3D8A5A] bg-[#F0F9F4]' : 'border-[#ECECEC] bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{option.emoji}</span>
                  <div>
                    <p className="text-[15px] font-bold text-[#212124]">{option.title}</p>
                    <p className="text-[12px] text-[#868B94] mt-0.5">{option.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 'login' && (
          <p className="mt-8 text-[13px] text-[#AEB1B9] text-center leading-relaxed max-w-[260px]">
            {mode === 'preparing'
              ? '임신 준비부터 도담이가\n함께할게요. 건강하게 시작해요'
              : mode === 'pregnant'
                ? '임신 기간 동안 도담이가\n아기의 성장을 함께 지켜볼게요'
                : '아이의 하루 리듬을 이해하고\nAI 케어 파트너가 되어줄게요'
            }
          </p>
        )}
      </div>

      {/* 하단 로그인 (모드 선택 후 표시) */}
      {step === 'login' && (
        <div className="px-6 pb-12 pt-6 space-y-3">
          {error && (
            <div className="mb-1 p-3 rounded-2xl bg-[#FFF0E6] text-[13px] text-[#D08068] text-center font-medium">
              {error}
            </div>
          )}

          <button
            onClick={() => handleLogin('kakao')}
            disabled={loading !== null}
            className="w-full h-[52px] rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: '#FEE500', color: '#191919' }}
          >
            {loading === 'kakao' ? (
              <div className="w-5 h-5 border-2 border-[#191919]/30 border-t-[#191919] rounded-full animate-spin" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 1C4.58 1 1 3.8 1 7.22c0 2.2 1.46 4.14 3.65 5.24-.16.58-.58 2.1-.66 2.43-.1.41.15.4.32.29.13-.09 2.1-1.43 2.95-2.01.56.08 1.14.12 1.74.12 4.42 0 8-2.8 8-6.07C17 3.8 13.42 1 9 1z" fill="#191919" />
                </svg>
                카카오로 시작하기
              </>
            )}
          </button>

          <button
            onClick={() => handleLogin('google')}
            disabled={loading !== null}
            className="w-full h-[52px] rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 border border-[#DADCE0] bg-white text-[#3C4043]"
          >
            {loading === 'google' ? (
              <div className="w-5 h-5 border-2 border-[#4285F4]/30 border-t-[#4285F4] rounded-full animate-spin" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Google로 시작하기
              </>
            )}
          </button>

          <button
            onClick={() => setStep('mode')}
            className="w-full py-2 text-[13px] text-[#AEB1B9] text-center"
          >
            ← 다시 선택하기
          </button>

          <p className="mt-2 text-xs text-[#9B9B9B] text-center leading-relaxed">
            시작하면{' '}
            <a href="/terms" className="underline">서비스 이용약관</a>,{' '}
            <a href="/privacy" className="underline">개인정보처리방침</a>에 동의하게 됩니다.
          </p>
        </div>
      )}
    </div>
  )
}
