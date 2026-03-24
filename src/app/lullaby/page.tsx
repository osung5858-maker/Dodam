'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'

type Category = 'lullaby' | 'nursery' | 'nature'

interface Track {
  id: string
  title: string
  category: Category
  duration: string
  youtubeId?: string
  playlistId?: string
  avgSleepMin?: number
  isRecommended?: boolean
}

const LULLABY_PLAYLIST = 'PLAyG7B7am9daqQ9u267CZoOIJzihXIYTA'
const NURSERY_PLAYLIST = 'PLAyG7B7am9dZ90gGtuco9wzMj_kdkUlMD'

// 자장가 60곡 (도하, 오늘도 유튜브 채널)
const LULLABY_TRACKS: Track[] = Array.from({ length: 60 }, (_, i) => ({
  id: `l${i + 1}`,
  title: [
    '깊은 밤 편안한 수면 자장가', '우리 아이 꿀잠 자는 음악', '숲속 빗소리 새소리 ASMR',
    '밤새 우는 아기 뚝 그치는 음악', '엄마 뱃속 같은 파도 쉬 소리', '마음이 편안해지는 숲속 소리',
    '3분 만에 잠드는 마법의 소리', '신생아 수면교육 필수 자장가', '꿈나라로 가는 피아노 자장가',
    '잠투정 심한 아기 수면음악', '숲속 빗소리 새소리 ASMR', '밤하늘 수면 음악',
    '파도 소리 통잠 음악', '신생아 3분 꿀잠 백색소음', '신생아 수면교육 음악',
    '3분 만에 잠드는 수면 유도', '구름처럼 부드러운 수면', '포근한 꿈나라 수면',
    '숲속 수면 사운드', '바다 꿀잠 유도 432Hz', '반짝이는 별밤 수면',
    '창밖의 조용한 빗소리', '구름 위를 걷는 꿈', '잔잔한 바다 수면',
    '달빛 수면 음악', '바다 수면 사운드', '바다 수면 사운드 II',
    '꿈나라 수면 사운드', '잔잔한 바다 사운드', '바다 수면 사운드 III',
    '바다 수면 사운드 IV', '구름 수면 사운드', '꿈나라 수면 II',
    '구름 수면 II', '숲 수면 사운드', '바다 브리즈 수면',
    '밤하늘 수면', '밤하늘 수면 II', '숲 수면 II',
    '2시간 30분 연속 수면', '2시간 30분 연속 수면 II', '바다 수면 #020',
    '숲 수면 #019', '바다 수면 #018', '꿀잠 수면 #016',
    '3분 꿀잠 백색소음 #015', '수면교육 음악 #014', '파도 통잠 #013',
    '밤하늘 수면 #012', '숲속 ASMR #011', '수면음악 #010',
    '피아노 자장가 #009', '수면교육 자장가 #008', '마법의 소리 #007',
    '숲속 소리 #006', '파도 쉬 소리 #005', '수면 유도 #004',
    '자연 ASMR #003', '꿀잠 음악 #002', '수면 자장가 #001',
    '수면 통합본 (4시간+)', '수면 통합본 블랙스크린',
  ][i] || `자장가 #${String(i + 1).padStart(3, '0')}`,
  category: 'lullaby' as Category,
  duration: i >= 58 ? '4:36:16' : i >= 39 ? '2:30:37' : ['2:20','3:15','2:36','3:34','2:09','2:21','3:22','3:02','3:12','7:29','6:57','3:16','4:54','5:54','4:14','4:08','7:44','8:43','3:02','4:14','7:03','10:38','6:28','7:39','6:54','7:04','5:10','9:12','9:59','5:35','7:00','11:22','9:09','10:23','5:35','7:00','9:40','6:05','9:22','8:43','8:12','10:11','8:39','13:42','8:25','13:00','11:35','8:24','8:45','9:40','9:18','9:10','9:41','10:34','6:20','8:43','5:45','8:06','9:40'][i] || '5:00',
  playlistId: LULLABY_PLAYLIST,
  isRecommended: i < 3,
}))

// 동요 59곡 (도하, 오늘도 유튜브 채널)
const NURSERY_TRACKS: Track[] = Array.from({ length: 59 }, (_, i) => ({
  id: `n${i + 1}`,
  title: [
    '동물 친구들과 춤추며 노래해요', '숫자 123 영어로 세기', '머리 어깨 무릎 발 율동',
    '손뼉 치며 배우는 리듬감', '신비로운 색깔 여행', '우리 아기 첫 색깔 공부',
    '동그라미 세모 네모 모양 놀이', '키가 쑥쑥 크는 율동 체조', '빨강 파랑 노랑 색깔 놀이',
    '풍선으로 배우는 도형 놀이', '삐뽀삐뽀 자동차 출동', '사자 호랑이 동물 소리 배우기',
    '경찰차 소방차 자동차 동요', '동물 친구들 영어 동요', '숫자 배우는 영어 동요',
    '색깔 배우는 영어 동요', '색깔 배우는 동요', '따라 움직이는 몸 놀이',
    '알록달록 보여요 색깔 인지', '동물 친구들 놀이 동요', '동요 20곡 연속 재생',
    '동요 20곡 블랙스크린', '숫자 세기 놀이 동요', '흔들흔들 쿵쿵 몸 놀이',
    '짝짝 박수 리듬', '알록달록 색깔 놀이', '흔들흔들 쿵쿵 II',
    '따라 움직이는 몸 놀이 II', '숫자 노래 1부터 10까지', '색깔 여행 동요',
    '움직여요 놀이 동요', '하늘 색깔 놀이 동요', '딸기 숫자 놀이 동요',
    '뛰뛰빵빵 자동차 숫자', '알록달록 예쁜 꽃 나들이', '꼼지락 손놀이 숫자',
    '칙칙폭폭 기차 숫자', '삐뽀삐뽀 용감한 소방차', '날씨 친구와 함께 놀아요',
    '동물 친구들 아기 동요', '숫자 노래 1부터 10까지 II', '따라 움직이는 놀이',
    '동물 친구들 동요 II', '색깔 인지 놀이 II', '경찰차 동요',
    '까딱 하나 토끼 동요', '톡톡 토끼 손놀이 동요', '부릉차 동요',
    '멍멍 강아지 동요', '빠방 자동차 동요', '까딱 로봇 동요',
    '톡톡 오리 물놀이 동요', '딸기 냠냠 동요', '바나나 냠냠 동요',
    '여우 슥슥 통통 동요', '손 씻기 동요', '숲 동물 동요',
    '달과 별 동요', '장난감 정리 정돈 동요', '오늘 하루 동요',
    '동요 통합본 (1시간+)', '동요 통합본 블랙스크린',
  ][i] || `동요 #${String(i + 1).padStart(3, '0')}`,
  category: 'nursery' as Category,
  duration: i >= 57 ? '1:08:23' : i >= 20 && i <= 21 ? '57:07' : ['1:38','1:19','1:22','1:10','1:36','3:59','3:05','3:02','2:53','3:13','2:54','3:20','2:17','1:33','1:51','2:20','2:16','2:52','2:36','3:07','57:07','57:07','2:26','3:08','2:36','3:07','2:52','3:23','3:24','2:32','2:00','3:34','2:10','1:23','2:54','2:11','2:48','2:28','1:52','2:00','2:24','2:28','2:47','3:34','1:29','1:44','3:06','2:00','3:42','3:29','2:15','1:49','2:51','1:09','2:20','1:13','2:11','2:50','2:25'][i] || '2:30',
  playlistId: NURSERY_PLAYLIST,
  isRecommended: i < 3,
}))

// 자연음 10곡
const NATURE_TRACKS: Track[] = [
  { id: 'w1', title: '빗소리', category: 'nature', duration: '∞', youtubeId: 'yIQd2Ya0Ziw', avgSleepMin: 10, isRecommended: true },
  { id: 'w2', title: '파도소리', category: 'nature', duration: '∞', youtubeId: 'Nep1qytq9JM', avgSleepMin: 12 },
  { id: 'w3', title: '백색소음', category: 'nature', duration: '∞', youtubeId: 'nMfPqeZjc2c', avgSleepMin: 14 },
  { id: 'w4', title: '심장소리 (엄마 뱃속)', category: 'nature', duration: '∞', youtubeId: 'dfeIYStsEtI', avgSleepMin: 9 },
  { id: 'w5', title: '진공청소기', category: 'nature', duration: '∞', youtubeId: 'I-5f5FbgVPk', avgSleepMin: 8 },
  { id: 'w6', title: '헤어드라이어', category: 'nature', duration: '∞', youtubeId: '2wg7FMiEKBE', avgSleepMin: 7 },
  { id: 'w7', title: '세탁기 소리', category: 'nature', duration: '∞', youtubeId: 'KJzOJKCt3M4', avgSleepMin: 11 },
  { id: 'w8', title: '시냇물 소리', category: 'nature', duration: '∞', youtubeId: 'IvjMgVS6kng', avgSleepMin: 13 },
  { id: 'w9', title: '새소리 (숲)', category: 'nature', duration: '∞', youtubeId: 'xNN7iTA57jM', avgSleepMin: 15 },
  { id: 'w10', title: '뱃속 소리 (자궁음)', category: 'nature', duration: '∞', youtubeId: 'u0gk2Hn6dLA', avgSleepMin: 8, isRecommended: true },
]

const TRACKS: Track[] = [...LULLABY_TRACKS, ...NURSERY_TRACKS, ...NATURE_TRACKS]

const CATEGORY_LABELS: Record<Category, string> = {
  lullaby: '자장가',
  nursery: '동요',
  nature: '자연음',
}

type TimerOption = 30 | 60 | 0

export default function LullabyPage() {
  const [category, setCategory] = useState<Category>('lullaby')
  const [playing, setPlaying] = useState<string | null>(null)
  const [timer, setTimer] = useState<TimerOption>(30)
  const [timerLeft, setTimerLeft] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const filtered = TRACKS.filter((t) => t.category === category)
  const currentTrack = TRACKS.find((t) => t.id === playing)

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (playing && timer > 0) {
      setTimerLeft(timer * 60)
      timerRef.current = setInterval(() => {
        setTimerLeft((prev) => {
          if (prev === null || prev <= 1) {
            setPlaying(null)
            if (timerRef.current) clearInterval(timerRef.current)
            return null
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [playing, timer])

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const togglePlay = useCallback((trackId: string) => {
    if (playing === trackId) {
      setPlaying(null)
      setTimerLeft(null)
    } else {
      setPlaying(trackId)
    }
  }, [playing])

  const getYouTubeEmbedUrl = (track: Track): string | null => {
    if (track.youtubeId) {
      return `https://www.youtube.com/embed/${track.youtubeId}?autoplay=1&loop=1&playlist=${track.youtubeId}`
    }
    if (track.playlistId) {
      // playlist 내 곡 인덱스 계산 (역순 — YouTube playlist는 최신이 먼저)
      const catTracks = TRACKS.filter(t => t.category === track.category && t.playlistId === track.playlistId)
      const idx = catTracks.length - 1 - catTracks.indexOf(track)
      return `https://www.youtube.com/embed/videoseries?list=${track.playlistId}&index=${Math.max(0, idx)}&autoplay=1`
    }
    return null
  }

  return (
    <div className="min-h-[100dvh] bg-[#1A1918] text-white pb-[env(safe-area-inset-bottom)]">
      <header className="sticky top-0 z-40 bg-[#1A1918]/90 backdrop-blur-xl">
        <div className="flex items-center justify-between h-14 px-5 max-w-lg mx-auto w-full">
          <Link href="/" className="text-white/60 text-sm">←</Link>
          <h1 className="text-[15px] font-bold">수면 도우미</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="max-w-lg mx-auto w-full pb-40">
        {/* YouTube player */}
        {currentTrack && getYouTubeEmbedUrl(currentTrack) && (
          <div className="mx-5 mt-2 rounded-xl overflow-hidden bg-black aspect-video">
            <iframe
              src={getYouTubeEmbedUrl(currentTrack)!}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={currentTrack.title}
            />
          </div>
        )}

        {currentTrack && !getYouTubeEmbedUrl(currentTrack) && (
          <div className="mx-5 mt-2 rounded-xl bg-[#2a2a2a] p-6 text-center">
            <p className="text-[14px] font-medium text-white/80">{currentTrack.title}</p>
            <p className="text-[11px] text-white/40 mt-1">재생 준비 중...</p>
          </div>
        )}

        {/* 카테고리별 곡 수 표시 */}
        {!currentTrack && (
          <div className="mx-5 mt-4 text-center">
            <p className="text-3xl mb-2">🌙</p>
            <p className="text-[16px] font-bold text-white/90">수면 도우미</p>
            <p className="text-[12px] text-white/50 mt-1">자장가 {LULLABY_TRACKS.length}곡 · 동요 {NURSERY_TRACKS.length}곡 · 자연음 {NATURE_TRACKS.length}곡</p>
          </div>
        )}

        {/* Category tabs */}
        <div className="flex gap-2 px-5 mt-4">
          {(['lullaby', 'nursery', 'nature'] as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-colors ${
                category === cat ? 'bg-white text-[#1A1918]' : 'bg-[#2a2a2a] text-white/60'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Track list */}
        <div className="mt-3 px-5 space-y-1.5">
          {filtered.map((track) => {
            const isPlaying = playing === track.id
            const hasAudio = !!(track.youtubeId || track.playlistId)
            return (
              <button
                key={track.id}
                onClick={() => hasAudio ? togglePlay(track.id) : undefined}
                disabled={!hasAudio}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  isPlaying ? 'bg-[#3D8A5A]/20 border border-[#3D8A5A]/40' : hasAudio ? 'bg-[#2a2a2a] border border-transparent' : 'bg-[#2a2a2a]/50 border border-transparent opacity-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  isPlaying ? 'bg-[#3D8A5A]' : 'bg-[#3a3a3a]'
                }`}>
                  <span className="text-white text-sm">{isPlaying ? '⏸' : hasAudio ? '▶' : '🔒'}</span>
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-[13px] font-medium ${isPlaying ? 'text-[#3D8A5A]' : 'text-white/90'}`}>
                    {track.title}
                  </p>
                  <p className="text-[11px] text-white/40">{track.duration}</p>
                </div>
                {track.avgSleepMin && (
                  <span className="text-[10px] text-[#3D8A5A] font-semibold shrink-0">
                    ~{track.avgSleepMin}분
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* YouTube link */}
        <div className="mx-5 mt-4 text-center">
          <a
            href={category === 'nursery'
              ? `https://www.youtube.com/playlist?list=${NURSERY_PLAYLIST}`
              : `https://www.youtube.com/playlist?list=${LULLABY_PLAYLIST}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-white/40 font-medium"
          >
            YouTube에서 전체 {CATEGORY_LABELS[category]} 듣기 →
          </a>
        </div>
      </div>

      {/* Bottom control bar */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#2a2a2a] border-t border-[#3a3a3a] pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-lg mx-auto w-full">
            <div className="flex items-center gap-3 px-5 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white truncate">{currentTrack.title}</p>
                <p className="text-[11px] text-white/40">{CATEGORY_LABELS[currentTrack.category]}</p>
              </div>
              <button
                onClick={() => togglePlay(currentTrack.id)}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center"
              >
                <span className="text-[#1A1918] text-sm">⏹</span>
              </button>
            </div>

            <div className="flex items-center justify-between px-5 pb-3">
              <div className="flex gap-1.5">
                {([30, 60, 0] as TimerOption[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimer(t)}
                    className={`px-3 py-1 rounded-full text-[10px] font-semibold ${
                      timer === t ? 'bg-[#3D8A5A] text-white' : 'bg-[#3a3a3a] text-white/40'
                    }`}
                  >
                    {t === 0 ? '무한' : `${t}분`}
                  </button>
                ))}
              </div>
              {timerLeft !== null && (
                <span className="text-[11px] text-white/40 font-mono">
                  {formatTimer(timerLeft)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
