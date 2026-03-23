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
