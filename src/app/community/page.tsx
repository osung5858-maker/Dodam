'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Post {
  id: string
  user_id: string
  board_type: string
  content: string
  like_count: number
  comment_count: number
  created_at: string
}

const DAILY_QUESTIONS = [
  '우리 아기 첫 이유식 뭐였어요?',
  '통잠 성공 비결이 있다면?',
  '가장 유용했던 육아템은?',
  '요즘 아기가 좋아하는 놀이는?',
  '육아하면서 가장 감동적이었던 순간은?',
  '오늘 아기와 뭐 했어요?',
  '추천하고 싶은 소아과가 있나요?',
]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return '방금'
  if (min < 60) return `${min}분 전`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}시간 전`
  return `${Math.floor(hr / 24)}일 전`
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set())
  const [writeOpen, setWriteOpen] = useState(false)
  const [writeText, setWriteText] = useState('')
  const [posting, setPosting] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const dailyQuestion = DAILY_QUESTIONS[new Date().getDay() % DAILY_QUESTIONS.length]

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/onboarding'); return }
      setUserId(user.id)

      const { data: likes } = await supabase
        .from('post_likes').select('post_id').eq('user_id', user.id)
      if (likes) setUserLikes(new Set(likes.map((l: { post_id: string }) => l.post_id)))

      // 전체 글 최신순 (게시판 구분 없이)
      const { data } = await supabase
        .from('posts').select('*')
        .order('created_at', { ascending: false }).limit(30)
      setPosts((data as Post[]) || [])
      setLoading(false)
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePost = useCallback(async () => {
    if (!writeText.trim() || !userId || posting) return
    setPosting(true)
    const { data, error } = await supabase
      .from('posts').insert({ user_id: userId, board_type: 'general', content: writeText.trim() })
      .select().single()
    if (!error && data) setPosts((prev) => [data as Post, ...prev])
    setWriteText(''); setWriteOpen(false); setPosting(false)
  }, [writeText, userId, posting, supabase])

  const toggleLike = useCallback(async (postId: string) => {
    if (!userId) return
    if (userLikes.has(postId)) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId)
      setUserLikes((prev) => { const n = new Set(prev); n.delete(postId); return n })
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, like_count: Math.max(0, p.like_count - 1) } : p))
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: userId })
      setUserLikes((prev) => new Set(prev).add(postId))
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, like_count: p.like_count + 1 } : p))
    }
  }, [userId, userLikes, supabase])

  const handleDelete = useCallback(async (postId: string) => {
    await supabase.from('posts').delete().eq('id', postId)
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[100dvh]">
        <div className="w-8 h-8 border-3 border-[#3D8A5A]/20 border-t-[#3D8A5A] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#F5F4F1]">
      <header className="sticky top-0 z-40 bg-white border-b border-[#f0f0f0]">
        <div className="flex items-center justify-between h-14 px-5 max-w-lg mx-auto">
          <h1 className="text-[17px] font-bold text-[#1A1918]">소통</h1>
          <button
            onClick={() => setWriteOpen(true)}
            className="text-[12px] font-semibold text-white bg-[#3D8A5A] px-3 py-1.5 rounded-lg active:opacity-80"
          >
            글쓰기
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 pb-28">
        {/* 오늘의 질문 */}
        <div className="mt-3 p-4 bg-white rounded-xl border border-[#f0f0f0]">
          <p className="text-[10px] font-semibold text-[#3D8A5A] mb-1">오늘의 질문</p>
          <p className="text-[14px] font-bold text-[#1A1918] mb-2">{dailyQuestion}</p>
          <button
            onClick={() => { setWriteText(`${dailyQuestion}\n\n`); setWriteOpen(true) }}
            className="text-[11px] font-semibold text-[#3D8A5A]"
          >
            답변하기 →
          </button>
        </div>

        {/* 피드 */}
        <div className="mt-3 space-y-2">
          {posts.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-[#f0f0f0] text-center">
              <p className="text-2xl mb-2">💬</p>
              <p className="text-[13px] text-[#868B94]">아직 글이 없어요</p>
              <p className="text-[11px] text-[#AEB1B9] mt-1">첫 번째 글을 남겨보세요!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl p-4 border border-[#f0f0f0]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#F5F4F1] flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#3D8A5A]">도</span>
                    </div>
                    <p className="text-[10px] text-[#AEB1B9]">{timeAgo(post.created_at)}</p>
                  </div>
                  {post.user_id === userId && (
                    <button onClick={() => handleDelete(post.id)} className="text-[10px] text-[#AEB1B9]">삭제</button>
                  )}
                </div>
                <p className="text-[13px] text-[#1A1918] leading-relaxed mb-3 whitespace-pre-line">{post.content}</p>
                <div className="flex items-center gap-4 pt-2 border-t border-[#f0f0f0]">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1 text-[11px] active:scale-110 transition-transform ${
                      userLikes.has(post.id) ? 'text-[#3D8A5A] font-semibold' : 'text-[#868B94]'
                    }`}
                  >
                    {userLikes.has(post.id) ? '♥' : '♡'} {post.like_count}
                  </button>
                  <span className="text-[11px] text-[#868B94]">💬 {post.comment_count}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 글쓰기 모달 */}
      {writeOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40" onClick={() => setWriteOpen(false)}>
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#f0f0f0]">
              <button onClick={() => setWriteOpen(false)} className="text-[13px] text-[#868B94]">취소</button>
              <p className="text-[14px] font-bold text-[#1A1918]">글쓰기</p>
              <button
                onClick={handlePost}
                disabled={writeText.trim().length === 0 || posting}
                className={`text-[13px] font-semibold ${writeText.trim().length > 0 ? 'text-[#3D8A5A]' : 'text-[#AEB1B9]'}`}
              >
                {posting ? '등록 중...' : '등록'}
              </button>
            </div>
            <div className="px-5 py-4">
              <textarea
                value={writeText}
                onChange={(e) => setWriteText(e.target.value.slice(0, 2000))}
                placeholder="육아 이야기를 나눠보세요..."
                className="w-full h-32 text-[14px] text-[#1A1918] resize-none focus:outline-none"
                autoFocus
              />
              <div className="flex items-center justify-end pt-3 border-t border-[#f0f0f0]">
                <p className="text-[11px] text-[#AEB1B9]">{writeText.length}/2000</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
