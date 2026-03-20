'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type InviteStatus = 'loading' | 'valid' | 'expired' | 'accepted' | 'error'

export default function InviteAcceptPage() {
  const params = useParams()
  const token = params.token as string
  const supabase = createClient()

  const [status, setStatus] = useState<InviteStatus>('loading')
  const [childName, setChildName] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    async function checkInvite() {
      // 토큰으로 초대 조회
      const { data: invite } = await supabase
        .from('caregivers')
        .select('*, children(name)')
        .eq('invite_token', token)
        .single()

      if (!invite) { setStatus('expired'); return }

      // 만료 확인
      if (invite.invite_expires_at && new Date(invite.invite_expires_at) < new Date()) {
        setStatus('expired'); return
      }

      // 이미 수락됨
      if (invite.accepted_at) { setStatus('accepted'); return }

      setChildName((invite.children as { name: string })?.name || '도담이')
      setStatus('valid')
    }
    checkInvite()
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAccept = async () => {
    setProcessing(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // 비로그인 → 카카오 로그인 후 돌아오기
      await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/invite/${token}`,
          scopes: 'profile_nickname profile_image',
        },
      })
      return
    }

    // 초대 수락: user_id 업데이트 + accepted_at 설정
    const { error } = await supabase
      .from('caregivers')
      .update({
        user_id: user.id,
        accepted_at: new Date().toISOString(),
      })
      .eq('invite_token', token)

    if (error) {
      console.error('Accept error:', error)
      setStatus('error')
      setProcessing(false)
      return
    }

    window.location.href = '/'
  }

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center px-6">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#FF6F0F]/20 border-t-[#FF6F0F] rounded-full animate-spin" />
          <p className="text-[13px] text-[#868B94]">초대를 확인하는 중이에요...</p>
        </div>
      )}

      {status === 'valid' && (
        <div className="text-center max-w-xs">
          <div className="w-20 h-20 rounded-full bg-[#FFF0E6] flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">💌</span>
          </div>
          <h1 className="text-[22px] font-bold text-[#212124] mb-2">
            {childName}의 가족이 되어주세요
          </h1>
          <p className="text-[14px] text-[#868B94] leading-relaxed mb-8">
            함께 기록하면 더 도담해요.<br />
            아이의 기록을 함께 볼 수 있어요.
          </p>
          <button
            onClick={handleAccept}
            disabled={processing}
            className="w-full h-[52px] rounded-2xl font-semibold text-[15px] bg-[#FF6F0F] text-white active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {processing ? '연결하는 중...' : '수락하기'}
          </button>
          <p className="text-[11px] text-[#AEB1B9] mt-4">
            카카오 로그인이 필요할 수 있어요
          </p>
        </div>
      )}

      {status === 'expired' && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#F7F8FA] flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⏰</span>
          </div>
          <h1 className="text-[18px] font-bold text-[#212124] mb-1">초대가 만료되었어요</h1>
          <p className="text-[13px] text-[#868B94]">다시 초대해달라고 해주세요</p>
        </div>
      )}

      {status === 'accepted' && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-[18px] font-bold text-[#212124] mb-1">이미 연결되었어요!</h1>
          <button onClick={() => window.location.href = '/'} className="mt-4 text-[14px] font-semibold text-[#FF6F0F]">
            홈으로 가기
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center">
          <h1 className="text-[18px] font-bold text-[#212124] mb-1">오류가 발생했어요</h1>
          <p className="text-[13px] text-[#868B94]">다시 시도해주세요</p>
        </div>
      )}
    </div>
  )
}
