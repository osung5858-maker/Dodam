import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 서비스 역할 클라이언트 — RLS 바이패스
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// GET /api/invite?token=xxx — 토큰 조회 (RLS 우회)
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  const supabase = getAdminClient()
  const { data: invite, error } = await supabase
    .from('caregivers')
    .select('*, children(name)')
    .eq('invite_token', token)
    .single()

  if (error || !invite) {
    return NextResponse.json({ status: 'expired' })
  }

  if (invite.invite_expires_at && new Date(invite.invite_expires_at) < new Date()) {
    return NextResponse.json({ status: 'expired' })
  }

  if (invite.accepted_at) {
    return NextResponse.json({ status: 'accepted' })
  }

  return NextResponse.json({
    status: 'valid',
    childName: (invite.children as { name: string })?.name || '도담이',
  })
}

// POST /api/invite — 초대 수락 (RLS 우회)
export async function POST(request: NextRequest) {
  const { token, userId } = await request.json()
  if (!token || !userId) {
    return NextResponse.json({ error: 'Token and userId required' }, { status: 400 })
  }

  const supabase = getAdminClient()

  const { error } = await supabase
    .from('caregivers')
    .update({
      user_id: userId,
      accepted_at: new Date().toISOString(),
    })
    .eq('invite_token', token)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
