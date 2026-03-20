import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { childName, senderName, messageType } = await request.json()

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 카카오 나에게 보내기 API (카카오톡 메시지)
  // OAuth 토큰으로 카카오 API 호출
  const session = await supabase.auth.getSession()
  const providerToken = session.data.session?.provider_token

  if (!providerToken) {
    return NextResponse.json({ sent: false, reason: 'no_kakao_token' })
  }

  let templateText = ''
  if (messageType === 'emergency') {
    templateText = `🚨 [도담 응급 알림]\n\n${senderName}님이 ${childName}의 응급 모드를 실행했어요.\n가까운 소아과를 찾고 있어요.\n\n확인해주세요!`
  } else if (messageType === 'record') {
    templateText = `📝 [도담 기록 알림]\n\n${senderName}님이 ${childName}의 새 기록을 남겼어요.\n\n도담에서 확인해보세요!`
  } else {
    templateText = `💌 [도담]\n\n${senderName}님이 메시지를 보냈어요.`
  }

  try {
    // 카카오 나에게 보내기 API
    const kakaoRes = await fetch('https://kapi.kakao.com/v2/api/talk/memo/default/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${providerToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        template_object: JSON.stringify({
          object_type: 'text',
          text: templateText,
          link: {
            web_url: 'https://dodam.life',
            mobile_web_url: 'https://dodam.life',
          },
          button_title: '도담 열기',
        }),
      }),
    })

    if (kakaoRes.ok) {
      return NextResponse.json({ sent: true })
    }

    const err = await kakaoRes.text()
    console.error('Kakao message error:', err)
    return NextResponse.json({ sent: false, reason: 'kakao_api_error' })
  } catch (error) {
    console.error('Kakao message failed:', error)
    return NextResponse.json({ sent: false, reason: 'network_error' })
  }
}
