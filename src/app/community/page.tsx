'use client'

import { useState } from 'react'

type BoardType = 'birth_month' | 'region' | 'popular' | 'qna'

interface Post {
  id: string
  author: string
  authorAge: string
  content: string
  timeAgo: string
  likes: number
  comments: number
  isHot?: boolean
  isAiPick?: boolean
}

const DAILY_QUESTION = {
  question: '우리 아기 첫 이유식 뭐였어요?',
  participants: 47,
}

const POSTS: Record<BoardType, Post[]> = {
  birth_month: [
    { id: '1', author: '하은맘', authorAge: '5개월', content: '이유식 시작했는데 쌀미음부터 하면 되나요? 어떤 브랜드가 좋을까요', timeAgo: '10분 전', likes: 12, comments: 8 },
    { id: '2', author: '서준아빠', authorAge: '5개월', content: '통잠 성공했어요! 우리 서준이 8시간 내리 잤네요. 비결은 취침 루틴이었어요', timeAgo: '1시간 전', likes: 45, comments: 23, isHot: true },
    { id: '3', author: '지아맘', authorAge: '4개월', content: '뒤집기 성공! 갑자기 오늘 혼자 뒤집었어요', timeAgo: '2시간 전', likes: 67, comments: 15, isHot: true },
    { id: '4', author: '도윤맘', authorAge: '5개월', content: '체온이 37.8도인데 병원 가야할까요? 다른 증상은 없어요', timeAgo: '3시간 전', likes: 5, comments: 31 },
    { id: '9', author: '시우맘', authorAge: '5개월', content: '수면 교육 시작하려는데 퍼버법? 쉬닥법? 어떤 게 좋을까요', timeAgo: '4시간 전', likes: 28, comments: 41 },
    { id: '10', author: '유나맘', authorAge: '6개월', content: '이가 나기 시작했어요! 치발기 추천해주세요', timeAgo: '5시간 전', likes: 19, comments: 12 },
  ],
  region: [
    { id: '5', author: '역삼맘', authorAge: '7개월', content: '강남구 소아과 추천해주세요! 최근에 이사왔어요', timeAgo: '30분 전', likes: 8, comments: 14 },
    { id: '6', author: '분당맘', authorAge: '3개월', content: '판교 키즈카페 어디가 좋아요? 6개월 아기랑 가려고요', timeAgo: '1시간 전', likes: 15, comments: 9 },
    { id: '11', author: '잠실맘', authorAge: '9개월', content: '송파구 문화센터 베이비 수영 후기입니다. 아기가 너무 좋아해요!', timeAgo: '2시간 전', likes: 32, comments: 18, isHot: true },
    { id: '12', author: '마포맘', authorAge: '4개월', content: '홍대 근처 수유실 있는 카페 아시는 분?', timeAgo: '3시간 전', likes: 7, comments: 11 },
  ],
  popular: [
    { id: '2', author: '서준아빠', authorAge: '5개월', content: '통잠 성공했어요! 우리 서준이 8시간 내리 잤네요. 비결은 취침 루틴이었어요', timeAgo: '1시간 전', likes: 45, comments: 23, isHot: true },
    { id: '3', author: '지아맘', authorAge: '4개월', content: '뒤집기 성공! 갑자기 오늘 혼자 뒤집었어요', timeAgo: '2시간 전', likes: 67, comments: 15, isHot: true },
    { id: '7', author: '첫째맘', authorAge: '12개월', content: '돌잔치 간소하게 하신 분 계세요? 집에서 하려는데 팁 부탁드려요', timeAgo: '20분 전', likes: 34, comments: 42 },
    { id: '11', author: '잠실맘', authorAge: '9개월', content: '송파구 문화센터 베이비 수영 후기입니다. 아기가 너무 좋아해요!', timeAgo: '2시간 전', likes: 32, comments: 18, isHot: true },
  ],
  qna: [
    { id: '4', author: '도윤맘', authorAge: '5개월', content: '체온이 37.8도인데 병원 가야할까요? 다른 증상은 없어요', timeAgo: '3시간 전', likes: 5, comments: 31, isAiPick: true },
    { id: '8', author: '쌍둥이맘', authorAge: '2개월', content: '분유 갈아타신 분들 어떤 걸로 바꾸셨어요? 배앓이가 심해서요', timeAgo: '1시간 전', likes: 21, comments: 38, isAiPick: true },
    { id: '9', author: '시우맘', authorAge: '5개월', content: '수면 교육 시작하려는데 퍼버법? 쉬닥법? 어떤 게 좋을까요', timeAgo: '4시간 전', likes: 28, comments: 41 },
    { id: '13', author: '준서맘', authorAge: '8개월', content: '아기가 밤에 자다가 자꾸 울어요. 야경증인가요?', timeAgo: '5시간 전', likes: 14, comments: 27 },
  ],
}

const TABS = [
  { key: 'birth_month' as BoardType, label: '같은달맘' },
  { key: 'region' as BoardType, label: '동네' },
  { key: 'popular' as BoardType, label: '인기' },
  { key: 'qna' as BoardType, label: 'Q&A' },
]

export default function CommunityPage() {
  const [board, setBoard] = useState<BoardType>('birth_month')
  const [writeOpen, setWriteOpen] = useState(false)
  const [writeText, setWriteText] = useState('')
  const posts = POSTS[board]

  const groupInfo: Record<BoardType, { label: string; count: number } | null> = {
    birth_month: { label: '2025년 10월 맘', count: 127 },
    region: { label: '강남구', count: 89 },
    popular: null,
    qna: null,
  }
  const info = groupInfo[board]

  return (
    <div className="min-h-[100dvh] bg-[#F5F4F1]">
      <header className="sticky top-0 z-40 bg-white border-b border-[#f0f0f0]">
        <div className="flex items-center justify-between h-14 px-5 max-w-lg mx-auto">
          <h1 className="text-[17px] font-bold text-[#1A1918]">소통</h1>
          <button
            onClick={() => setWriteOpen(true)}
            className="text-[12px] font-semibold text-white bg-[#3D8A5A] px-3 py-1.5 rounded-lg"
          >
            글쓰기
          </button>
        </div>

        <div className="flex px-5 pb-2 max-w-lg mx-auto gap-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setBoard(tab.key)}
              className={`flex-1 py-2 text-[12px] font-semibold text-center rounded-lg transition-colors ${
                board === tab.key ? 'bg-[#3D8A5A] text-white' : 'bg-[#F0F0F0] text-[#AEB1B9]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 pb-28">
        {/* 그룹 정보 */}
        {info && (
          <div className="mt-3 flex items-center justify-between p-3 bg-white rounded-xl border border-[#f0f0f0]">
            <p className="text-[13px] font-semibold text-[#1A1918]">{info.label}</p>
            <p className="text-[11px] text-[#868B94]">{info.count}명 참여 중</p>
          </div>
        )}

        {/* 오늘의 질문 */}
        {board === 'birth_month' && (
          <div className="mt-3 p-4 bg-white rounded-xl border border-[#f0f0f0]">
            <p className="text-[10px] font-semibold text-[#3D8A5A] mb-1">오늘의 질문</p>
            <p className="text-[14px] font-bold text-[#1A1918] mb-2">{DAILY_QUESTION.question}</p>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-[#868B94]">{DAILY_QUESTION.participants}명 참여</p>
              <button className="text-[11px] font-semibold text-[#3D8A5A]">답변하기 →</button>
            </div>
          </div>
        )}

        {/* AI 추천 (Q&A) */}
        {board === 'qna' && (
          <div className="mt-3 p-3 bg-[#F0F9F4] rounded-xl border border-[#C8F0D8]">
            <p className="text-[12px] text-[#3D8A5A]">✨ AI가 내 아기 월령에 맞는 Q&A를 추천해요</p>
          </div>
        )}

        {/* 게시글 */}
        <div className="mt-3 space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl p-4 border border-[#f0f0f0]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-[#F5F4F1] flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-[#3D8A5A]">{post.author.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[12px] font-semibold text-[#1A1918]">{post.author}</p>
                    {post.isHot && <span className="text-[9px] text-[#D08068] font-bold">🔥</span>}
                    {post.isAiPick && <span className="text-[9px] text-[#3D8A5A] font-bold">✨AI</span>}
                  </div>
                  <p className="text-[10px] text-[#AEB1B9]">{post.authorAge} · {post.timeAgo}</p>
                </div>
              </div>

              <p className="text-[13px] text-[#1A1918] leading-relaxed mb-3">{post.content}</p>

              <div className="flex items-center gap-4 pt-2 border-t border-[#f0f0f0]">
                <button className="flex items-center gap-1 text-[11px] text-[#868B94] active:text-[#3D8A5A]">
                  ♥ {post.likes}
                </button>
                <button className="flex items-center gap-1 text-[11px] text-[#868B94]">
                  💬 {post.comments}
                </button>
              </div>
            </div>
          ))}
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
                onClick={() => { setWriteOpen(false); setWriteText('') }}
                className={`text-[13px] font-semibold ${writeText.length > 0 ? 'text-[#3D8A5A]' : 'text-[#AEB1B9]'}`}
                disabled={writeText.length === 0}
              >
                등록
              </button>
            </div>
            <div className="px-5 py-4">
              <div className="flex gap-2 mb-3">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${
                      board === tab.key ? 'bg-[#3D8A5A] text-white' : 'bg-[#F0F0F0] text-[#868B94]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <textarea
                value={writeText}
                onChange={(e) => setWriteText(e.target.value)}
                placeholder="육아 이야기를 나눠보세요..."
                className="w-full h-32 text-[14px] text-[#1A1918] resize-none focus:outline-none"
                autoFocus
              />
              <div className="flex items-center justify-between pt-3 border-t border-[#f0f0f0]">
                <div className="flex gap-3">
                  <button className="text-[13px] text-[#868B94]">📷</button>
                  <button className="text-[13px] text-[#868B94]">😊</button>
                </div>
                <p className="text-[11px] text-[#AEB1B9]">{writeText.length}/500</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
