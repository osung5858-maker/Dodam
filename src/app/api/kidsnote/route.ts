import { NextRequest, NextResponse } from 'next/server'

const KN_BASE = 'https://www.kidsnote.com/api'

// 프록시 — 사용자 비밀번호 서버 저장 안 함, 세션만 전달
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, username, password, sessionCookie, childId, page } = body

  try {
    // === 로그인 ===
    if (action === 'login') {
      const res = await fetch(`${KN_BASE}/web/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        redirect: 'manual',
      })

      // 쿠키 추출
      const setCookies = res.headers.getSetCookie?.() || []
      const cookies = setCookies.map(c => c.split(';')[0]).join('; ')

      if (!cookies) {
        const errText = await res.text().catch(() => '')
        return NextResponse.json({ error: '로그인 실패. 아이디/비밀번호를 확인해주세요.', detail: errText }, { status: 401 })
      }

      // 내 정보 가져오기
      const infoRes = await fetch(`${KN_BASE}/v1/me/info`, {
        headers: { Cookie: cookies },
      })
      const info = await infoRes.json().catch(() => null)

      return NextResponse.json({
        success: true,
        sessionCookie: cookies,
        info,
      })
    }

    // === 내 아이 목록 ===
    if (action === 'children') {
      if (!sessionCookie) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

      const res = await fetch(`${KN_BASE}/v1/me/info`, {
        headers: { Cookie: sessionCookie },
      })
      const data = await res.json()

      return NextResponse.json(data)
    }

    // === 앨범 (알림장) ===
    if (action === 'albums') {
      if (!sessionCookie || !childId) return NextResponse.json({ error: '파라미터 부족' }, { status: 400 })

      const res = await fetch(`${KN_BASE}/v1_2/children/${childId}/albums?page=${page || 1}&page_size=20`, {
        headers: { Cookie: sessionCookie },
      })
      const data = await res.json()

      return NextResponse.json(data)
    }

    // === 알림장 (reports) ===
    if (action === 'reports') {
      if (!sessionCookie || !childId) return NextResponse.json({ error: '파라미터 부족' }, { status: 400 })

      const res = await fetch(`${KN_BASE}/v1_2/children/${childId}/reports?page=${page || 1}&page_size=20`, {
        headers: { Cookie: sessionCookie },
      })
      const data = await res.json()

      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: `서버 오류: ${e}` }, { status: 500 })
  }
}
