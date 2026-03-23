'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'

// ===== 주기 계산 =====
function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function isSameDay(a: Date, b: Date): boolean {
  return formatDate(a) === formatDate(b)
}

function getCycleInfo(lastPeriodStart: string, cycleLength: number) {
  const start = new Date(lastPeriodStart)
  const ovulationDay = addDays(start, cycleLength - 14)
  const fertileStart = addDays(ovulationDay, -5)
  const fertileEnd = addDays(ovulationDay, 1)
  const nextPeriod = addDays(start, cycleLength)
  const today = new Date()
  const cycleDay = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1

  return { ovulationDay, fertileStart, fertileEnd, nextPeriod, cycleDay }
}

// ===== 체크리스트 =====
const CHECKLIST = [
  { id: 'folic', icon: '💊', title: '엽산 복용', desc: '임신 3개월 전부터 하루 400~800μg' },
  { id: 'checkup', icon: '🏥', title: '산전 건강검진', desc: '혈액·소변·풍진항체 검사' },
  { id: 'dental', icon: '🦷', title: '치과 검진', desc: '임신 중 치료 어려우니 미리' },
  { id: 'vaccine', icon: '💉', title: '예방접종 확인', desc: '풍진·수두·A형간염 항체' },
  { id: 'weight', icon: '⚖️', title: '적정 체중 관리', desc: 'BMI 18.5~24.9 유지' },
  { id: 'nosmoking', icon: '🚭', title: '금연 · 금주', desc: '임신 3개월 전부터' },
  { id: 'exercise', icon: '🏃‍♀️', title: '규칙적 운동', desc: '걷기·요가·수영 주 3회' },
  { id: 'stress', icon: '🧘', title: '스트레스 관리', desc: '충분한 수면·명상·취미' },
]

const GOV_SUPPORTS = [
  { title: '난임 시술비 지원', desc: '체외수정 최대 110만원, 인공수정 30만원' },
  { title: '산전검사 무료 쿠폰', desc: '보건소에서 기본 산전검사 무료' },
  { title: '엽산/철분제 무료 지급', desc: '보건소 등록 시 임신 전~출산까지' },
]

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function PreparingPage() {
  // 생리 주기 데이터 (localStorage)
  const [lastPeriod, setLastPeriod] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('dodam_last_period') || ''
    return ''
  })
  const [cycleLength, setCycleLength] = useState<number>(() => {
    if (typeof window !== 'undefined') return Number(localStorage.getItem('dodam_cycle_length')) || 28
    return 28
  })
  const [periodRecords, setPeriodRecords] = useState<Record<string, 'start' | 'end' | 'flow'>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dodam_period_records')
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })
  const [bbtRecords, setBbtRecords] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dodam_bbt_records')
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })
  const [ovulationTests, setOvulationTests] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dodam_ovulation_tests')
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dodam_preparing_checks')
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })
  const [editingCycle, setEditingCycle] = useState(!lastPeriod)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // 편지
  const [letters, setLetters] = useState<{ text: string; date: string; from: string; reply: string }[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dodam_letters')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [letterText, setLetterText] = useState('')
  const [letterOpen, setLetterOpen] = useState(false)

  // 영양제 트래커
  const [supplements, setSupplements] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const today = new Date().toISOString().split('T')[0]
      const saved = localStorage.getItem(`dodam_suppl_${today}`)
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })

  // 감정 기록
  const [todayMood, setTodayMood] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const today = new Date().toISOString().split('T')[0]
      return localStorage.getItem(`dodam_mood_${today}`) || ''
    }
    return ''
  })

  // 임신 테스트 기록
  const [pregTests, setPregTests] = useState<{ date: string; result: string; dpo: number }[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dodam_preg_tests')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  // 파트너 건강 체크
  const [partnerChecks, setPartnerChecks] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dodam_partner_checks')
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })

  // 주기 정보
  const cycle = useMemo(() => {
    if (!lastPeriod) return null
    return getCycleInfo(lastPeriod, cycleLength)
  }, [lastPeriod, cycleLength])

  // 캘린더
  const now = new Date()
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [calYear, setCalYear] = useState(now.getFullYear())

  const calDates = useMemo(() => {
    const dates: Date[] = []
    const d = new Date(calYear, calMonth, 1)
    while (d.getMonth() === calMonth) {
      dates.push(new Date(d))
      d.setDate(d.getDate() + 1)
    }
    return dates
  }, [calYear, calMonth])

  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay()

  const savePeriodStart = (date: string) => {
    setLastPeriod(date)
    localStorage.setItem('dodam_last_period', date)
    const newRecords = { ...periodRecords, [date]: 'start' as const }
    setPeriodRecords(newRecords)
    localStorage.setItem('dodam_period_records', JSON.stringify(newRecords))
    setEditingCycle(false)
  }

  const saveCycleLength = (len: number) => {
    setCycleLength(len)
    localStorage.setItem('dodam_cycle_length', String(len))
  }

  const toggleCheck = (id: string) => {
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    localStorage.setItem('dodam_preparing_checks', JSON.stringify(next))
  }

  // AI 답장 생성 (로컬)
  const generateReply = (text: string): string => {
    const replies = [
      `엄마 아빠, 마음이 느껴져요. 빨리 만나고 싶어요 🌱`,
      `따뜻한 마음 고마워요. 건강하게 준비하고 있을게요 💛`,
      `사랑이 가득한 편지네요. 덕분에 용기가 나요 ☺️`,
      `엄마 아빠의 목소리가 들리는 것 같아요. 조금만 기다려주세요 🌟`,
      `이렇게 기다려주셔서 감사해요. 세상에서 가장 행복한 아기가 될 거예요 🎀`,
      `매일 저를 생각해주시는 거 알아요. 곧 만나요! 🤗`,
      `엄마 아빠가 준비하는 모습이 느껴져요. 힘내세요! 💪`,
    ]
    if (text.includes('건강')) return '건강하게 자라고 있을게요! 엄마 아빠도 건강 챙기세요 🌿'
    if (text.includes('사랑')) return '저도 엄마 아빠를 정말 많이 사랑해요 💕'
    if (text.includes('기다')) return '조금만 기다려주세요. 곧 만날 수 있을 거예요! 🌈'
    if (text.includes('이름')) return '어떤 이름이든 엄마 아빠가 지어주면 좋을 거예요 ✨'
    return replies[Math.floor(Math.random() * replies.length)]
  }

  const saveLetter = () => {
    if (!letterText.trim()) return
    const reply = generateReply(letterText)
    const newLetter = {
      text: letterText.trim(),
      date: new Date().toISOString(),
      from: '엄마',
      reply,
    }
    const next = [newLetter, ...letters]
    setLetters(next)
    localStorage.setItem('dodam_letters', JSON.stringify(next))
    setLetterText('')
    setLetterOpen(false)
  }

  const toggleSupplement = (key: string) => {
    const today = new Date().toISOString().split('T')[0]
    const next = { ...supplements, [key]: !supplements[key] }
    setSupplements(next)
    localStorage.setItem(`dodam_suppl_${today}`, JSON.stringify(next))
  }

  const saveMood = (mood: string) => {
    const today = new Date().toISOString().split('T')[0]
    setTodayMood(mood)
    localStorage.setItem(`dodam_mood_${today}`, mood)
  }

  const addPregTest = (result: string) => {
    const dpo = cycle ? Math.floor((Date.now() - cycle.ovulationDay.getTime()) / 86400000) : 0
    const entry = { date: new Date().toISOString().split('T')[0], result, dpo }
    const next = [entry, ...pregTests]
    setPregTests(next)
    localStorage.setItem('dodam_preg_tests', JSON.stringify(next))
  }

  const togglePartnerCheck = (key: string) => {
    const next = { ...partnerChecks, [key]: !partnerChecks[key] }
    setPartnerChecks(next)
    localStorage.setItem('dodam_partner_checks', JSON.stringify(next))
  }

  const recordBBT = useCallback((date: string, temp: number) => {
    const next = { ...bbtRecords, [date]: temp }
    setBbtRecords(next)
    localStorage.setItem('dodam_bbt_records', JSON.stringify(next))
  }, [bbtRecords])

  const recordOvulationTest = useCallback((date: string, positive: boolean) => {
    const next = { ...ovulationTests, [date]: positive }
    setOvulationTests(next)
    localStorage.setItem('dodam_ovulation_tests', JSON.stringify(next))
  }, [ovulationTests])

  // 날짜별 상태 (캘린더 셀 색상)
  const getDateStatus = (date: Date): string => {
    if (!cycle) return 'none'
    const ds = formatDate(date)
    if (periodRecords[ds]) return 'period'
    if (isSameDay(date, cycle.ovulationDay)) return 'ovulation'
    if (date >= cycle.fertileStart && date <= cycle.fertileEnd) return 'fertile'
    return 'none'
  }

  // 주기 설정 화면
  if (editingCycle) {
    return (
      <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center px-6">
        <h1 className="text-[22px] font-bold text-[#1A1918] mb-2">생리 주기를 알려주세요</h1>
        <p className="text-[13px] text-[#868B94] mb-6">배란일과 가임기를 예측해드릴게요</p>

        <div className="w-full max-w-xs space-y-4">
          <div>
            <p className="text-[12px] font-semibold text-[#868B94] mb-1">마지막 생리 시작일</p>
            <input
              type="date"
              defaultValue={lastPeriod}
              onChange={(e) => e.target.value && savePeriodStart(e.target.value)}
              className="w-full h-12 rounded-xl border border-[#f0f0f0] px-4 text-[14px] text-[#1A1918]"
            />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#868B94] mb-1">평균 주기 ({cycleLength}일)</p>
            <input
              type="range" min={21} max={40} value={cycleLength}
              onChange={(e) => saveCycleLength(Number(e.target.value))}
              className="w-full accent-[#3D8A5A]"
            />
            <div className="flex justify-between text-[10px] text-[#AEB1B9]">
              <span>21일</span><span>28일</span><span>40일</span>
            </div>
          </div>
        </div>

        {lastPeriod && (
          <button onClick={() => setEditingCycle(false)} className="mt-6 text-[13px] text-[#3D8A5A] font-semibold">
            완료 →
          </button>
        )}
      </div>
    )
  }

  const checkedCount = CHECKLIST.filter((c) => checked[c.id]).length

  return (
    <div className="min-h-[100dvh] bg-[#F5F4F1]">
      <header className="sticky top-0 z-40 bg-white border-b border-[#f0f0f0]">
        <div className="flex items-center justify-between h-14 px-5 max-w-lg mx-auto">
          <div>
            <p className="text-[12px] text-[#868B94]">임신 준비</p>
            <p className="text-[16px] font-bold text-[#1A1918]">
              {cycle ? `주기 ${cycle.cycleDay}일차` : '주기 설정 필요'}
            </p>
          </div>
          <button onClick={() => setEditingCycle(true)} className="text-[11px] text-[#868B94]">주기 수정</button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 pt-4 pb-28 space-y-3">

        {/* AI 요약 */}
        {cycle && (
          <div className="bg-white rounded-xl border border-[#f0f0f0] p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">✨</span>
              <p className="text-[14px] font-bold text-[#1A1918]">AI 케어</p>
            </div>
            {(() => {
              const today = new Date()
              if (today >= cycle.fertileStart && today <= cycle.fertileEnd) {
                return <p className="text-[13px] text-[#1A1918] leading-relaxed">지금은 <span className="text-[#3D8A5A] font-semibold">가임기</span>예요. 임신 확률이 가장 높은 시기입니다.</p>
              }
              if (isSameDay(today, cycle.ovulationDay)) {
                return <p className="text-[13px] text-[#1A1918] leading-relaxed">오늘이 <span className="text-[#3D8A5A] font-semibold">배란 예정일</span>이에요!</p>
              }
              const daysToFertile = Math.ceil((cycle.fertileStart.getTime() - today.getTime()) / 86400000)
              if (daysToFertile > 0 && daysToFertile <= 7) {
                return <p className="text-[13px] text-[#1A1918] leading-relaxed">가임기까지 <span className="text-[#3D8A5A] font-semibold">{daysToFertile}일</span> 남았어요. 컨디션 관리에 신경 써보세요.</p>
              }
              const daysToNextPeriod = Math.ceil((cycle.nextPeriod.getTime() - today.getTime()) / 86400000)
              return <p className="text-[13px] text-[#1A1918] leading-relaxed">다음 생리 예정일까지 <span className="font-semibold">{daysToNextPeriod}일</span>. 엽산 복용과 규칙적인 운동을 유지해보세요.</p>
            })()}
          </div>
        )}

        {/* ✉️ 아이에게 보내는 편지 */}
        <div className="bg-white rounded-xl border border-[#f0f0f0] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">✉️</span>
              <p className="text-[14px] font-bold text-[#1A1918]">아이에게 보내는 편지</p>
            </div>
            <p className="text-[11px] text-[#868B94]">{letters.length}통</p>
          </div>

          {/* 아기 시각화 */}
          <div className="text-center py-4 mb-3 bg-[#F5F4F1] rounded-xl">
            <div className="text-4xl mb-2">🌱</div>
            <p className="text-[12px] text-[#868B94]">아직 작은 씨앗이지만</p>
            <p className="text-[13px] font-semibold text-[#3D8A5A]">엄마 아빠의 사랑으로 자라고 있어요</p>
            {letters.length >= 10 && <p className="text-[10px] text-[#3D8A5A] mt-1">🌿 편지 {letters.length}통의 사랑을 받았어요</p>}
            {letters.length >= 30 && <p className="text-[10px] text-[#3D8A5A] mt-1">🌳 동화책을 만들 수 있어요!</p>}
          </div>

          {/* 최근 편지 */}
          {letters.length > 0 && (
            <div className="space-y-3 mb-3">
              {letters.slice(0, 2).map((l, i) => (
                <div key={i}>
                  <div className="p-3 bg-[#F0F9F4] rounded-xl rounded-bl-sm">
                    <p className="text-[12px] text-[#1A1918] leading-relaxed">{l.text}</p>
                    <p className="text-[9px] text-[#AEB1B9] mt-1 text-right">{l.from} · {new Date(l.date).toLocaleDateString('ko-KR')}</p>
                  </div>
                  <div className="p-3 bg-[#FFF8F3] rounded-xl rounded-tr-sm mt-1 ml-6">
                    <p className="text-[12px] text-[#1A1918] leading-relaxed">💌 {l.reply}</p>
                    <p className="text-[9px] text-[#AEB1B9] mt-1">아이의 답장 (AI)</p>
                  </div>
                </div>
              ))}
              {letters.length > 2 && (
                <p className="text-[11px] text-[#AEB1B9] text-center">+ {letters.length - 2}통 더</p>
              )}
            </div>
          )}

          {/* 편지 쓰기 */}
          {letterOpen ? (
            <div>
              <textarea
                value={letterText}
                onChange={(e) => setLetterText(e.target.value.slice(0, 500))}
                placeholder="아이에게 하고 싶은 말을 적어보세요..."
                className="w-full h-24 text-[13px] text-[#1A1918] p-3 bg-[#F5F4F1] rounded-xl resize-none focus:outline-none"
                autoFocus
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] text-[#AEB1B9]">{letterText.length}/500</p>
                <div className="flex gap-2">
                  <button onClick={() => setLetterOpen(false)} className="text-[12px] text-[#868B94]">취소</button>
                  <button
                    onClick={saveLetter}
                    disabled={!letterText.trim()}
                    className={`text-[12px] font-semibold px-3 py-1 rounded-lg ${letterText.trim() ? 'bg-[#3D8A5A] text-white' : 'bg-[#F0F0F0] text-[#AEB1B9]'}`}
                  >
                    보내기 ✉️
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setLetterOpen(true)}
              className="w-full py-3 text-center text-[13px] font-semibold text-[#3D8A5A] bg-[#F0F9F4] rounded-xl active:bg-[#C8F0D8]"
            >
              오늘의 편지 쓰기 ✉️
            </button>
          )}

          {/* 동화책 만들기 (편지 30통 이상) */}
          {letters.length >= 30 && (
            <div className="mt-3 p-3 bg-gradient-to-r from-[#F0F9F4] to-[#FFF8F3] rounded-xl text-center border border-[#C8F0D8]">
              <p className="text-[12px] font-semibold text-[#3D8A5A]">📖 "{letters.length}통의 편지" 동화책 만들기</p>
              <p className="text-[10px] text-[#868B94] mt-0.5">AI가 편지를 엮어 세상에 하나뿐인 동화책을 만들어드려요</p>
            </div>
          )}
        </div>

        {/* 💊 오늘의 영양제 */}
        <div className="bg-white rounded-xl border border-[#f0f0f0] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-bold text-[#1A1918]">오늘의 영양제</p>
            <p className="text-[11px] text-[#3D8A5A] font-semibold">
              {Object.values(supplements).filter(Boolean).length}/4
            </p>
          </div>
          {[
            { key: 'folic', name: '엽산 400μg', time: '아침 식후' },
            { key: 'vitd', name: '비타민D', time: '아침 식후' },
            { key: 'iron', name: '철분', time: '점심 식후' },
            { key: 'omega3', name: '오메가3', time: '저녁 식후' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => toggleSupplement(s.key)}
              className="w-full flex items-center gap-3 py-2 active:bg-[#F5F4F1] rounded-lg"
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${supplements[s.key] ? 'bg-[#3D8A5A] border-[#3D8A5A]' : 'border-[#AEB1B9]'}`}>
                {supplements[s.key] && <span className="text-white text-[10px]">✓</span>}
              </div>
              <span className={`text-[13px] flex-1 text-left ${supplements[s.key] ? 'text-[#AEB1B9] line-through' : 'text-[#1A1918]'}`}>{s.name}</span>
              <span className="text-[10px] text-[#AEB1B9]">{s.time}</span>
            </button>
          ))}
        </div>

        {/* 😊 오늘 기분 */}
        <div className="bg-white rounded-xl border border-[#f0f0f0] p-4">
          <p className="text-[14px] font-bold text-[#1A1918] mb-3">오늘 기분은?</p>
          <div className="flex gap-2">
            {[
              { emoji: '😊', label: '희망적', key: 'hopeful' },
              { emoji: '😌', label: '평온', key: 'calm' },
              { emoji: '😰', label: '불안', key: 'anxious' },
              { emoji: '😢', label: '지침', key: 'tired' },
              { emoji: '🥰', label: '설렘', key: 'excited' },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => saveMood(m.key)}
                className={`flex-1 py-2 rounded-xl text-center transition-colors ${
                  todayMood === m.key ? 'bg-[#3D8A5A] ring-2 ring-[#3D8A5A]/30' : 'bg-[#F5F4F1]'
                }`}
              >
                <p className="text-lg">{m.emoji}</p>
                <p className={`text-[9px] mt-0.5 ${todayMood === m.key ? 'text-white font-semibold' : 'text-[#868B94]'}`}>{m.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 🤞 투윅웨이트 (배란 후 표시) */}
        {cycle && (() => {
          const dpo = Math.floor((Date.now() - cycle.ovulationDay.getTime()) / 86400000)
          if (dpo < 0 || dpo > 16) return null
          const twwTips = [
            '너무 이른 시기예요. 평소처럼 지내세요.',
            '착상이 시작되는 시기예요. 무리하지 마세요.',
            '착상이 진행 중일 수 있어요. 따뜻한 차 한 잔 어때요?',
            '카페인을 줄이고 충분히 쉬어보세요.',
            '아직 조급해하지 않아도 돼요. 자신을 돌보는 시간을 가져보세요.',
            '이 시기가 가장 기다려지죠. 좋아하는 일에 집중해보세요.',
            '빠르면 임신 테스트가 가능해요. 하지만 서두르지 않아도 괜찮아요.',
            '생리 예정일이 다가오고 있어요. 결과를 기다려봐요.',
          ]
          const tipIdx = Math.min(Math.floor(dpo / 2), twwTips.length - 1)
          return (
            <div className="bg-white rounded-xl border border-[#f0f0f0] p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[14px] font-bold text-[#1A1918]">🤞 투윅웨이트</p>
                <p className="text-[12px] font-semibold text-[#3D8A5A]">배란 후 {dpo}일</p>
              </div>
              <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full mb-3">
                <div className="h-full bg-[#3D8A5A] rounded-full" style={{ width: `${Math.min((dpo / 14) * 100, 100)}%` }} />
              </div>
              <p className="text-[13px] text-[#1A1918] leading-relaxed">{twwTips[tipIdx]}</p>
            </div>
          )
        })()}

        {/* 🧪 임신 테스트 기록 */}
        <div className="bg-white rounded-xl border border-[#f0f0f0] p-4">
          <p className="text-[14px] font-bold text-[#1A1918] mb-3">임신 테스트</p>
          <div className="flex gap-2 mb-3">
            <button onClick={() => addPregTest('양성')} className="flex-1 py-2 rounded-xl bg-[#F0F9F4] text-[12px] font-semibold text-[#3D8A5A] active:bg-[#C8F0D8]">양성 ✚</button>
            <button onClick={() => addPregTest('음성')} className="flex-1 py-2 rounded-xl bg-[#F5F4F1] text-[12px] font-semibold text-[#868B94] active:bg-[#E0E0E0]">음성 −</button>
          </div>
          {pregTests.length > 0 ? (
            <div className="space-y-1.5">
              {pregTests.slice(0, 3).map((t, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <span className="text-[12px] text-[#1A1918]">{t.date}</span>
                  <span className={`text-[12px] font-semibold ${t.result === '양성' ? 'text-[#3D8A5A]' : 'text-[#868B94]'}`}>
                    {t.result} {t.dpo > 0 && `(배란 후 ${t.dpo}일)`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#AEB1B9] text-center py-2">아직 기록이 없어요</p>
          )}
          {cycle && (() => {
            const dpo = Math.floor((Date.now() - cycle.ovulationDay.getTime()) / 86400000)
            if (dpo >= 0 && dpo < 10) return <p className="text-[10px] text-[#868B94] mt-2">💡 배란 후 10일 이후에 테스트하면 정확도가 높아져요</p>
            return null
          })()}
        </div>

        {/* 👨 파트너 건강 */}
        <div className="bg-white rounded-xl border border-[#f0f0f0] p-4">
          <p className="text-[14px] font-bold text-[#1A1918] mb-3">파트너 건강 체크</p>
          {[
            { key: 'p_nosmoking', label: '금연 (3개월 전부터)' },
            { key: 'p_nodrink', label: '금주 또는 절주' },
            { key: 'p_vitamin', label: '비타민·아연 복용' },
            { key: 'p_checkup', label: '건강검진 (정액검사)' },
            { key: 'p_nosauna', label: '사우나·핫터브 자제' },
            { key: 'p_weight', label: '적정 체중 유지' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => togglePartnerCheck(item.key)}
              className="w-full flex items-center gap-3 py-2 active:bg-[#F5F4F1] rounded-lg"
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${partnerChecks[item.key] ? 'bg-[#3D8A5A] border-[#3D8A5A]' : 'border-[#AEB1B9]'}`}>
                {partnerChecks[item.key] && <span className="text-white text-[10px]">✓</span>}
              </div>
              <span className={`text-[13px] ${partnerChecks[item.key] ? 'text-[#AEB1B9] line-through' : 'text-[#1A1918]'}`}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* 주기 캘린더 */}
        <div className="bg-white rounded-xl border border-[#f0f0f0] p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) } else setCalMonth(calMonth - 1) }} className="text-[#868B94] px-2">←</button>
            <p className="text-[14px] font-bold text-[#1A1918]">{calYear}년 {calMonth + 1}월</p>
            <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) } else setCalMonth(calMonth + 1) }} className="text-[#868B94] px-2">→</button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[9px] text-[#AEB1B9] font-medium">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }, (_, i) => <div key={`e-${i}`} className="aspect-square" />)}
            {calDates.map((date) => {
              const status = getDateStatus(date)
              const isToday = formatDate(date) === formatDate(now)
              const ds = formatDate(date)
              const hasBBT = bbtRecords[ds]
              const hasOvTest = ovulationTests[ds] !== undefined
              return (
                <button
                  key={ds}
                  onClick={() => setSelectedDate(ds === selectedDate ? null : ds)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-medium relative ${
                    isToday ? 'ring-2 ring-[#3D8A5A]' :
                    status === 'period' ? 'bg-[#FDE8E8] text-[#D08068]' :
                    status === 'ovulation' ? 'bg-[#3D8A5A] text-white' :
                    status === 'fertile' ? 'bg-[#C8F0D8] text-[#3D8A5A]' :
                    'bg-[#F7F8FA] text-[#1A1918]'
                  }`}
                >
                  {date.getDate()}
                  {(hasBBT || hasOvTest) && <span className="absolute bottom-0.5 text-[6px]">•</span>}
                </button>
              )
            })}
          </div>

          {/* 범례 */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-[#FDE8E8]" /><span className="text-[9px] text-[#868B94]">생리</span></div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-[#C8F0D8]" /><span className="text-[9px] text-[#868B94]">가임기</span></div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-[#3D8A5A]" /><span className="text-[9px] text-[#868B94]">배란일</span></div>
          </div>
        </div>

        {/* 날짜 선택 시 기록 패널 */}
        {selectedDate && (
          <div className="bg-white rounded-xl border border-[#f0f0f0] p-4">
            <p className="text-[13px] font-semibold text-[#1A1918] mb-3">{selectedDate} 기록</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#868B94]">기초체온 (BBT)</span>
                <input
                  type="number" step="0.01" min="35" max="38"
                  value={bbtRecords[selectedDate] || ''}
                  onChange={(e) => recordBBT(selectedDate, Number(e.target.value))}
                  placeholder="36.50"
                  className="w-20 h-8 rounded-lg border border-[#f0f0f0] px-2 text-[12px] text-right"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#868B94]">배란 테스트</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => recordOvulationTest(selectedDate, true)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-medium ${ovulationTests[selectedDate] === true ? 'bg-[#3D8A5A] text-white' : 'bg-[#F0F0F0] text-[#868B94]'}`}
                  >양성</button>
                  <button
                    onClick={() => recordOvulationTest(selectedDate, false)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-medium ${ovulationTests[selectedDate] === false ? 'bg-[#D08068] text-white' : 'bg-[#F0F0F0] text-[#868B94]'}`}
                  >음성</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 체크리스트 */}
        <div className="bg-white rounded-xl border border-[#f0f0f0] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-bold text-[#1A1918]">임신 준비 체크리스트</p>
            <p className="text-[11px] text-[#868B94]">{checkedCount}/{CHECKLIST.length}</p>
          </div>
          <div className="space-y-1">
            {CHECKLIST.map((item) => (
              <button key={item.id} onClick={() => toggleCheck(item.id)} className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left active:bg-[#F5F4F1]">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${checked[item.id] ? 'bg-[#3D8A5A] border-[#3D8A5A]' : 'border-[#AEB1B9]'}`}>
                  {checked[item.id] && <span className="text-white text-[10px]">✓</span>}
                </div>
                <div className="flex-1">
                  <p className={`text-[13px] ${checked[item.id] ? 'text-[#AEB1B9] line-through' : 'text-[#1A1918]'}`}>{item.icon} {item.title}</p>
                  <p className="text-[11px] text-[#868B94]">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 정부 지원 */}
        <div className="bg-white rounded-xl border border-[#f0f0f0] p-4">
          <p className="text-[14px] font-bold text-[#1A1918] mb-3">정부 지원 정보</p>
          {GOV_SUPPORTS.map((item) => (
            <div key={item.title} className="p-3 bg-[#F5F4F1] rounded-xl mb-2 last:mb-0">
              <p className="text-[13px] font-semibold text-[#1A1918]">{item.title}</p>
              <p className="text-[11px] text-[#868B94] mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* 모드 전환 */}
        <div className="bg-[#F0F9F4] rounded-xl border border-[#C8F0D8] p-4 text-center">
          <p className="text-[13px] font-semibold text-[#3D8A5A] mb-1">임신이 확인되면</p>
          <p className="text-[12px] text-[#6D6C6A]">임신 모드로 전환하면 주차별 태아 성장 정보를 볼 수 있어요</p>
          <Link href="/onboarding" className="inline-block mt-3 px-4 py-2 bg-[#3D8A5A] text-white text-[12px] font-semibold rounded-lg">
            모드 변경하기
          </Link>
        </div>
      </div>
    </div>
  )
}
