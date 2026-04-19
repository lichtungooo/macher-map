import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, X, Plus, Trash2, Lock, Unlock } from 'lucide-react'
import * as api from '../../api/client'

const MONTHS = ['Januar', 'Februar', 'Maerz', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const DAYS_LONG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
const DAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

interface FullCalendarProps {
  lichtungId: string
  lichtungName: string
  myRole: string | null
  onClose: () => void
}

export function FullCalendar({ lichtungId, lichtungName, myRole, onClose }: FullCalendarProps) {
  const [view, setView] = useState<'month' | 'week' | 'day' | 'list'>('week')
  const [weekOffset, setWeekOffset] = useState(0)
  const [monthOffset, setMonthOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [monthSlots, setMonthSlots] = useState<any[]>([])
  const [daySlots, setDaySlots] = useState<any[]>([])
  const [dayEvents, setDayEvents] = useState<any[]>([])
  const [allEvents, setAllEvents] = useState<any[]>([])
  const [showNewSlot, setShowNewSlot] = useState(false)
  const [newSlot, setNewSlot] = useState({ startHour: 9, endHour: 11, parallelSlots: 1, note: '' })

  const font = { fontFamily: 'Inter, sans-serif' as const }
  const now = new Date()
  const viewMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const y = viewMonth.getFullYear(), m = viewMonth.getMonth()
  const isHueter = myRole === 'owner'
  const isGaertner = myRole === 'admin' || myRole === 'owner'

  const from = `${y}-${String(m + 1).padStart(2, '0')}-01`
  const to = `${y}-${String(m + 2 > 12 ? 1 : m + 2).padStart(2, '0')}-01`

  // Wochenansicht: Mo-So der aktuellen Woche
  const weekDays = useMemo(() => {
    const today = new Date()
    today.setDate(today.getDate() + weekOffset * 7)
    const dow = (today.getDay() + 6) % 7 // Mo=0
    const monday = new Date(today)
    monday.setDate(today.getDate() - dow)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return { date: d.toISOString().slice(0, 10), day: d.getDate(), month: d.getMonth(), label: DAYS_SHORT[i] }
    })
  }, [weekOffset])

  // Slots fuer die ganze Woche
  const [weekSlotsByDate, setWeekSlotsByDate] = useState<Record<string, any[]>>({})

  // Mondphasen (on-the-fly, 24 Monate)
  const [moonPhases, setMoonPhases] = useState<{ type: 'neumond' | 'vollmond'; time: string }[]>([])
  const [selectedMoon, setSelectedMoon] = useState<{ type: string; time: string } | null>(null)

  useEffect(() => {
    api.getMoonPhases(24).then(setMoonPhases).catch(() => {})
  }, [])

  // Mondphase pro Datum
  const moonByDate = useMemo(() => {
    const map: Record<string, { type: 'neumond' | 'vollmond'; time: string }> = {}
    for (const p of moonPhases) {
      const d = new Date(p.time)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      map[key] = p
    }
    return map
  }, [moonPhases])

  useEffect(() => {
    api.getLichtungSlots(lichtungId, from, to).then(setMonthSlots).catch(() => {})
    api.getLichtungEvents(lichtungId).then(setAllEvents).catch(() => {})
  }, [lichtungId, monthOffset])

  useEffect(() => {
    if (view !== 'week') return
    const weekFrom = weekDays[0]?.date
    const weekTo = weekDays[6]?.date
    if (!weekFrom || !weekTo) return
    api.getLichtungSlots(lichtungId, weekFrom, weekTo).then((all: any[]) => {
      const map: Record<string, any[]> = {}
      for (const s of all) {
        if (!map[s.date]) map[s.date] = []
        map[s.date].push(s)
      }
      setWeekSlotsByDate(map)
    }).catch(() => {})
  }, [lichtungId, weekOffset, view])

  useEffect(() => {
    if (selectedDate) {
      api.getSlotsForDate(lichtungId, selectedDate).then(setDaySlots).catch(() => {})
      setDayEvents(allEvents.filter((e: any) => e.start_time.startsWith(selectedDate)))
    }
  }, [selectedDate, allEvents])

  const daySlotMap = useMemo(() => {
    const map: Record<string, { status: string; timeSlots: number; occupied: number; total: number }> = {}
    for (const s of monthSlots) {
      const existing = map[s.date] || { status: 'open', timeSlots: 0, occupied: 0, total: 0 }
      if (s.start_hour !== null && s.start_hour !== undefined) {
        existing.timeSlots++
        existing.total += s.parallel_slots || 1
        // Gucken wie viele Events in diesem Slot sind
        const eventsInSlot = allEvents.filter((e: any) => {
          if (!e.start_time.startsWith(s.date)) return false
          const h = new Date(e.start_time).getHours()
          return h >= s.start_hour && h < s.end_hour
        })
        existing.occupied += eventsInSlot.length
      } else {
        existing.status = s.status
      }
      map[s.date] = existing
    }
    return map
  }, [monthSlots, allEvents])

  const calDays = useMemo(() => {
    const first = new Date(y, m, 1), last = new Date(y, m + 1, 0)
    const offset = (first.getDay() + 6) % 7
    const days: { date: string; day: number; inMonth: boolean }[] = []
    for (let i = 0; i < offset; i++) days.push({ date: '', day: 0, inMonth: false })
    for (let d = 1; d <= last.getDate(); d++) {
      const date = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ date, day: d, inMonth: true })
    }
    return days
  }, [monthOffset])

  const upcomingEvents = useMemo(() =>
    [...allEvents]
      .filter(e => new Date(e.start_time) >= new Date(now.toDateString()))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [allEvents]
  )

  const handleCreateSlot = async () => {
    if (!selectedDate) return
    await api.createTimeSlot(lichtungId, selectedDate, newSlot)
    api.getSlotsForDate(lichtungId, selectedDate).then(setDaySlots)
    api.getLichtungSlots(lichtungId, from, to).then(setMonthSlots)
    setShowNewSlot(false)
    setNewSlot({ startHour: 9, endHour: 11, parallelSlots: 1, note: '' })
  }

  const handleDeleteSlot = async (slotId: string) => {
    await api.deleteTimeSlot(lichtungId, slotId)
    if (selectedDate) api.getSlotsForDate(lichtungId, selectedDate).then(setDaySlots)
    api.getLichtungSlots(lichtungId, from, to).then(setMonthSlots)
  }

  const handleCloseDayToggle = async () => {
    if (!selectedDate) return
    const dayInfo = daySlotMap[selectedDate]
    const newStatus = dayInfo?.status === 'closed' ? 'open' : 'closed'
    await api.setLichtungSlot(lichtungId, selectedDate, newStatus, 1, '')
    api.getLichtungSlots(lichtungId, from, to).then(setMonthSlots)
  }

  const timeSlotsSorted = daySlots.filter(s => s.start_hour !== null && s.start_hour !== undefined).sort((a, b) => a.start_hour - b.start_hour)
  const dayInfo = selectedDate ? daySlotMap[selectedDate] : null
  const isClosed = dayInfo?.status === 'closed'

  // Datum-Label je nach View
  const dateLabel = (() => {
    if (view === 'month') return `${MONTHS[m]} ${y}`
    if (view === 'week') {
      const a = weekDays[0], b = weekDays[6]
      if (!a || !b) return ''
      return `${a.day}. ${MONTHS[a.month]?.slice(0, 3)} \u2013 ${b.day}. ${MONTHS[b.month]?.slice(0, 3)} ${y}`
    }
    if (view === 'day' && selectedDate) {
      const d = new Date(selectedDate)
      return `${DAYS_SHORT[(d.getDay() + 6) % 7]}, ${d.getDate()}. ${MONTHS[d.getMonth()]?.slice(0, 3)} ${d.getFullYear()}`
    }
    return 'Kommende Termine'
  })()

  const navPrev = () => {
    if (view === 'month') setMonthOffset(monthOffset - 1)
    else if (view === 'week') setWeekOffset(weekOffset - 1)
    else if (view === 'day' && selectedDate) {
      const d = new Date(selectedDate); d.setDate(d.getDate() - 1)
      setSelectedDate(d.toISOString().slice(0, 10))
    }
  }
  const navNext = () => {
    if (view === 'month') setMonthOffset(monthOffset + 1)
    else if (view === 'week') setWeekOffset(weekOffset + 1)
    else if (view === 'day' && selectedDate) {
      const d = new Date(selectedDate); d.setDate(d.getDate() + 1)
      setSelectedDate(d.toISOString().slice(0, 10))
    }
  }

  return (
    <div className="fixed inset-0 z-[2500] flex flex-col" style={{ background: '#FDFCF9' }}>
      {/* Kompakter Header: Name + Datum-Nav + Tabs + X in einer Zeile */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b flex-wrap" style={{ borderColor: 'rgba(10,10,10,0.06)', background: '#fff' }}>
        {/* Lichtung-Name */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-2 h-2 rounded-full" style={{ background: '#7BAE5E' }} />
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.92rem', fontWeight: 500, color: '#0A0A0A' }} className="truncate max-w-[150px]">
            {lichtungName}
          </span>
        </div>

        {/* Navigation + Datum */}
        {view !== 'list' && (
          <div className="flex items-center gap-1">
            <button onClick={navPrev} className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'transparent', border: '1px solid rgba(10,10,10,0.08)', cursor: 'pointer' }}>
              <ChevronLeft size={13} />
            </button>
            <span style={{ ...font, fontSize: '0.78rem', fontWeight: 600, color: '#0A0A0A', minWidth: '120px', textAlign: 'center' }}>
              {dateLabel}
            </span>
            <button onClick={navNext} className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'transparent', border: '1px solid rgba(10,10,10,0.08)', cursor: 'pointer' }}>
              <ChevronRight size={13} />
            </button>
          </div>
        )}
        {view === 'list' && (
          <span style={{ ...font, fontSize: '0.78rem', fontWeight: 600, color: '#0A0A0A' }}>{dateLabel}</span>
        )}

        <div className="flex-1" />

        {/* View-Tabs */}
        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(10,10,10,0.08)' }}>
          {(['month', 'week', 'day', 'list'] as const).map(v => (
            <button key={v} onClick={() => { if (v === 'day' && !selectedDate) setSelectedDate(now.toISOString().slice(0, 10)); setView(v) }}
              style={{ ...font, fontSize: '0.65rem', fontWeight: 500, padding: '4px 8px', background: view === v ? 'rgba(123,174,94,0.1)' : '#fff', color: view === v ? '#7BAE5E' : 'rgba(10,10,10,0.4)', border: 'none', cursor: 'pointer' }}>
              {v === 'month' ? 'Monat' : v === 'week' ? 'Woche' : v === 'day' ? 'Tag' : 'Liste'}
            </button>
          ))}
        </div>

        <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.08)', cursor: 'pointer' }}>
          <X size={13} style={{ color: 'rgba(10,10,10,0.5)' }} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Content */}
        {view === 'month' && (
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS_LONG.map(d => (
                  <div key={d} className="text-center py-2" style={{ ...font, fontSize: '0.72rem', fontWeight: 600, color: 'rgba(10,10,10,0.4)' }}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calDays.map((day, i) => {
                  const info = daySlotMap[day.date]
                  const closed = info?.status === 'closed'
                  const hasSlots = info?.timeSlots || 0
                  const occupied = info?.occupied || 0
                  const total = info?.total || 0
                  const free = total - occupied
                  const isToday = day.date === now.toISOString().slice(0, 10)

                  let bg = '#fff', border = 'rgba(10,10,10,0.04)'
                  if (day.inMonth) {
                    if (closed) { bg = 'rgba(200,60,60,0.06)'; border = 'rgba(200,60,60,0.15)' }
                    else if (hasSlots && free === 0) { bg = 'rgba(212,168,67,0.08)'; border = 'rgba(212,168,67,0.25)' }
                    else if (hasSlots) { bg = 'rgba(123,174,94,0.06)'; border = 'rgba(123,174,94,0.2)' }
                  }

                  const moon = moonByDate[day.date]

                  return (
                    <button key={i} onClick={() => day.inMonth && (setSelectedDate(day.date), setView('day'))}
                      className="relative rounded-xl p-2 text-left transition-all hover:shadow-sm"
                      style={{ background: day.inMonth ? bg : 'transparent', border: `1px solid ${isToday ? '#D4A843' : border}`, minHeight: '90px', cursor: day.inMonth ? 'pointer' : 'default' }}>
                      {day.inMonth && (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <span style={{ ...font, fontSize: '0.9rem', fontWeight: isToday ? 700 : 500, color: closed ? '#c44' : '#0A0A0A' }}>{day.day}</span>
                            <div className="flex items-center gap-1">
                              {moon && (
                                <span
                                  onClick={(e) => { e.stopPropagation(); setSelectedMoon(moon) }}
                                  title={moon.type === 'vollmond' ? 'Vollmond' : 'Neumond'}
                                  style={{
                                    width: 10, height: 10, borderRadius: '50%', display: 'inline-block',
                                    background: moon.type === 'vollmond' ? '#F5E090' : 'transparent',
                                    border: `1.5px solid ${moon.type === 'vollmond' ? '#D4A843' : '#6B4C8A'}`,
                                    boxShadow: moon.type === 'vollmond' ? '0 0 4px rgba(245,224,144,0.6)' : 'none',
                                    cursor: 'pointer',
                                  }}
                                />
                              )}
                              {closed && <Lock size={11} style={{ color: '#c44' }} />}
                            </div>
                          </div>

                          {closed && (
                            <span style={{ ...font, fontSize: '0.62rem', color: '#c44' }}>Ruhetag</span>
                          )}

                          {!closed && hasSlots > 0 && (
                            <div className="space-y-0.5">
                              <span style={{ ...font, fontSize: '0.62rem', fontWeight: 600, color: '#7BAE5E' }}>
                                {hasSlots} Slot{hasSlots !== 1 ? 's' : ''}
                              </span>
                              <div style={{ ...font, fontSize: '0.6rem', color: free > 0 ? 'rgba(10,10,10,0.5)' : '#D4A843' }}>
                                {occupied}/{total} belegt
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: 'rgba(123,174,94,0.06)', border: '1px solid rgba(123,174,94,0.2)' }} />
                  <span style={{ ...font, fontSize: '0.72rem', color: 'rgba(10,10,10,0.5)' }}>Freie Slots</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.25)' }} />
                  <span style={{ ...font, fontSize: '0.72rem', color: 'rgba(10,10,10,0.5)' }}>Alle belegt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: 'rgba(200,60,60,0.06)', border: '1px solid rgba(200,60,60,0.15)' }} />
                  <span style={{ ...font, fontSize: '0.72rem', color: 'rgba(10,10,10,0.5)' }}>Ruhetag</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'week' && (
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {/* Wochen-Grid: Stunden-Spalte + 7 Tag-Spalten */}
              <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
                {/* Tag-Header */}
                <div className="grid" style={{ gridTemplateColumns: '44px repeat(7, 1fr)', borderBottom: '1px solid rgba(10,10,10,0.08)' }}>
                  <div style={{ background: '#FAFAF8' }} />
                  {weekDays.map(d => {
                    const isToday = d.date === now.toISOString().slice(0, 10)
                    const dayInfoFromMonth = daySlotMap[d.date]
                    const isClosed = dayInfoFromMonth?.status === 'closed' || (weekSlotsByDate[d.date]?.find(s => s.start_hour === null && s.status === 'closed'))
                    const moon = moonByDate[d.date]
                    return (
                      <button key={d.date} onClick={() => { setSelectedDate(d.date); setView('day') }}
                        className="relative text-center py-3 transition-colors hover:bg-gray-50"
                        style={{ borderLeft: '1px solid rgba(10,10,10,0.06)', background: isToday ? 'rgba(212,168,67,0.06)' : isClosed ? 'rgba(200,60,60,0.04)' : '#fff', cursor: 'pointer', border: 'none', borderLeftWidth: '1px', borderLeftStyle: 'solid', borderLeftColor: 'rgba(10,10,10,0.06)' }}>
                        <div style={{ ...font, fontSize: '0.62rem', fontWeight: 600, color: 'rgba(10,10,10,0.4)', textTransform: 'uppercase' }}>{d.label}</div>
                        <div style={{ ...font, fontSize: '1.1rem', fontWeight: isToday ? 700 : 500, color: isClosed ? '#c44' : isToday ? '#D4A843' : '#0A0A0A' }}>
                          {d.day}
                        </div>
                        {isClosed && <Lock size={10} style={{ color: '#c44', margin: '2px auto 0' }} />}
                        {moon && (
                          <span
                            onClick={(e) => { e.stopPropagation(); setSelectedMoon(moon) }}
                            title={moon.type === 'vollmond' ? 'Vollmond' : 'Neumond'}
                            style={{
                              position: 'absolute', top: 6, right: 6,
                              width: 9, height: 9, borderRadius: '50%', display: 'inline-block',
                              background: moon.type === 'vollmond' ? '#F5E090' : 'transparent',
                              border: `1.5px solid ${moon.type === 'vollmond' ? '#D4A843' : '#6B4C8A'}`,
                              boxShadow: moon.type === 'vollmond' ? '0 0 4px rgba(245,224,144,0.6)' : 'none',
                              cursor: 'pointer',
                            }}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Stunden-Grid */}
                {HOURS.map(h => (
                  <div key={h} className="grid" style={{ gridTemplateColumns: '44px repeat(7, 1fr)', borderBottom: '1px solid rgba(10,10,10,0.04)', minHeight: '32px' }}>
                    <div className="px-3 py-2" style={{ background: '#FAFAF8', borderRight: '1px solid rgba(10,10,10,0.06)' }}>
                      <span style={{ ...font, fontSize: '0.68rem', fontWeight: 600, color: 'rgba(10,10,10,0.4)' }}>
                        {String(h).padStart(2, '0')}:00
                      </span>
                    </div>
                    {weekDays.map(d => {
                      const dSlots = weekSlotsByDate[d.date] || []
                      const dayInfoFromMonth = daySlotMap[d.date]
                      const dayClosed = dayInfoFromMonth?.status === 'closed'
                      const slot = dSlots.find(s => s.start_hour !== null && h >= s.start_hour && h < s.end_hour)
                      const isFirstHour = slot && slot.start_hour === h
                      const eventsInHour = allEvents.filter((e: any) => e.start_time.startsWith(d.date) && new Date(e.start_time).getHours() === h)
                      const slotFull = slot && eventsInHour.length >= slot.parallel_slots

                      let bg = '#fff'
                      if (dayClosed) bg = 'rgba(200,60,60,0.03)'
                      else if (slot) {
                        bg = slotFull ? 'rgba(212,168,67,0.08)' : 'rgba(123,174,94,0.06)'
                      }

                      const handleCellClick = () => {
                        if (dayClosed) return
                        if (!slot && isHueter) {
                          // Hueter: Zeit-Slot oeffnen
                          setSelectedDate(d.date)
                          setNewSlot({ startHour: h, endHour: h + 2, parallelSlots: 1, note: '' })
                          setShowNewSlot(true)
                          setView('day')
                        } else {
                          // Tag-Detail oeffnen
                          setSelectedDate(d.date)
                          setView('day')
                        }
                      }

                      return (
                        <button key={d.date + h} onClick={handleCellClick}
                          className="relative p-1 text-left transition-all"
                          style={{ background: bg, borderLeft: '1px solid rgba(10,10,10,0.04)', cursor: dayClosed ? 'default' : 'pointer', border: 'none', borderLeftWidth: '1px', borderLeftStyle: 'solid', borderLeftColor: 'rgba(10,10,10,0.04)' }}>
                          {slot && isFirstHour && (
                            <div className="rounded px-1.5 py-0.5 mb-0.5" style={{ background: slotFull ? 'rgba(212,168,67,0.2)' : 'rgba(123,174,94,0.18)' }}>
                              <div style={{ ...font, fontSize: '0.55rem', fontWeight: 600, color: slotFull ? '#D4A843' : '#5A8A3C' }}>
                                {slot.note || `${String(slot.start_hour).padStart(2, '0')}-${String(slot.end_hour).padStart(2, '0')}`}
                              </div>
                              <div style={{ ...font, fontSize: '0.5rem', color: slotFull ? '#D4A843' : '#7BAE5E' }}>
                                {eventsInHour.length}/{slot.parallel_slots}
                              </div>
                            </div>
                          )}
                          {eventsInHour.map((e: any) => (
                            <div key={e.id} className="rounded px-1.5 py-0.5 mb-0.5 truncate" style={{ background: 'rgba(212,168,67,0.25)' }}>
                              <span style={{ ...font, fontSize: '0.58rem', fontWeight: 500, color: '#0A0A0A' }}>{e.title}</span>
                            </div>
                          ))}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: 'rgba(123,174,94,0.06)', border: '1px solid rgba(123,174,94,0.2)' }} />
                  <span style={{ ...font, fontSize: '0.7rem', color: 'rgba(10,10,10,0.5)' }}>Offener Slot</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.25)' }} />
                  <span style={{ ...font, fontSize: '0.7rem', color: 'rgba(10,10,10,0.5)' }}>Belegt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: 'rgba(200,60,60,0.06)', border: '1px solid rgba(200,60,60,0.15)' }} />
                  <span style={{ ...font, fontSize: '0.7rem', color: 'rgba(10,10,10,0.5)' }}>Ruhetag</span>
                </div>
                {isHueter && (
                  <span style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.4)', marginLeft: '12px' }}>
                    Klick auf leere Zelle = neuen Slot oeffnen
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'day' && selectedDate && (
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              {moonByDate[selectedDate] && (
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span
                    onClick={() => setSelectedMoon(moonByDate[selectedDate])}
                    title={moonByDate[selectedDate].type === 'vollmond' ? 'Vollmond' : 'Neumond'}
                    style={{
                      width: 14, height: 14, borderRadius: '50%', display: 'inline-block',
                      background: moonByDate[selectedDate].type === 'vollmond' ? '#F5E090' : 'transparent',
                      border: `2px solid ${moonByDate[selectedDate].type === 'vollmond' ? '#D4A843' : '#6B4C8A'}`,
                      boxShadow: moonByDate[selectedDate].type === 'vollmond' ? '0 0 6px rgba(245,224,144,0.7)' : 'none',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ ...font, fontSize: '0.72rem', color: 'rgba(10,10,10,0.5)' }}>
                    {moonByDate[selectedDate].type === 'vollmond' ? 'Vollmond' : 'Neumond'}
                  </span>
                </div>
              )}

              {/* Ganztag sperren */}
              {isHueter && (
                <button onClick={handleCloseDayToggle}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-4"
                  style={{ background: isClosed ? 'rgba(200,60,60,0.08)' : '#fff', border: `1px solid ${isClosed ? '#c44' : 'rgba(10,10,10,0.08)'}`, ...font, fontSize: '0.82rem', fontWeight: 500, color: isClosed ? '#c44' : 'rgba(10,10,10,0.5)', cursor: 'pointer' }}>
                  {isClosed ? <Lock size={14} /> : <Unlock size={14} />}
                  {isClosed ? 'Tag ist gesperrt — klicke zum Oeffnen' : 'Ganzen Tag sperren'}
                </button>
              )}

              {isClosed ? (
                <div className="rounded-xl p-12 text-center" style={{ background: 'rgba(200,60,60,0.04)', border: '1px solid rgba(200,60,60,0.12)' }}>
                  <Lock size={32} style={{ color: '#c44', margin: '0 auto 12px' }} />
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', color: '#c44' }}>Ruhetag</p>
                  <p style={{ ...font, fontSize: '0.82rem', color: 'rgba(200,60,60,0.7)', marginTop: '4px' }}>An diesem Tag finden keine Veranstaltungen statt.</p>
                </div>
              ) : (
                <>
                  {/* Zeit-Slots als Timeline */}
                  <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
                    {HOURS.map(h => {
                      const slot = timeSlotsSorted.find(s => h >= s.start_hour && h < s.end_hour)
                      const eventsInHour = dayEvents.filter(e => new Date(e.start_time).getHours() === h)
                      const isFirstHourOfSlot = slot && slot.start_hour === h
                      return (
                        <div key={h} className="flex border-b" style={{ borderColor: 'rgba(10,10,10,0.04)', minHeight: '48px' }}>
                          <div className="w-16 flex-shrink-0 px-3 py-2 border-r" style={{ borderColor: 'rgba(10,10,10,0.04)', background: '#FAFAF8' }}>
                            <span style={{ ...font, fontSize: '0.72rem', fontWeight: 600, color: 'rgba(10,10,10,0.4)' }}>
                              {String(h).padStart(2, '0')}:00
                            </span>
                          </div>
                          <div className="flex-1 p-2 relative">
                            {slot && isFirstHourOfSlot && (
                              <div className="rounded-lg p-3 mb-1" style={{ background: 'rgba(123,174,94,0.08)', border: '1px solid rgba(123,174,94,0.2)' }}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span style={{ ...font, fontSize: '0.82rem', fontWeight: 600, color: '#0A0A0A' }}>
                                      {String(slot.start_hour).padStart(2, '0')}:00 - {String(slot.end_hour).padStart(2, '0')}:00
                                    </span>
                                    {slot.note && <span style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.5)', marginLeft: '8px' }}>· {slot.note}</span>}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span style={{ ...font, fontSize: '0.68rem', color: '#7BAE5E' }}>
                                      {eventsInHour.length}/{slot.parallel_slots} Gruppen
                                    </span>
                                    {isHueter && (
                                      <button onClick={() => handleDeleteSlot(slot.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}>
                                        <Trash2 size={13} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            {eventsInHour.map((e: any) => (
                              <div key={e.id} className="rounded-lg px-3 py-1.5" style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.25)' }}>
                                <span style={{ ...font, fontSize: '0.78rem', fontWeight: 500, color: '#0A0A0A' }}>{e.title}</span>
                                <span style={{ ...font, fontSize: '0.65rem', color: 'rgba(10,10,10,0.45)', marginLeft: '8px' }}>
                                  {new Date(e.start_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Neuer Slot */}
                  {isHueter && !showNewSlot && (
                    <button onClick={() => setShowNewSlot(true)}
                      className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl"
                      style={{ background: 'rgba(123,174,94,0.08)', border: '1px solid rgba(123,174,94,0.25)', ...font, fontSize: '0.82rem', fontWeight: 500, color: '#7BAE5E', cursor: 'pointer' }}>
                      <Plus size={14} /> Zeit-Slot oeffnen
                    </button>
                  )}

                  {isHueter && showNewSlot && (
                    <div className="mt-4 rounded-xl p-5" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.08)' }}>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.5)', display: 'block', marginBottom: '4px' }}>Von</label>
                          <select value={newSlot.startHour} onChange={e => setNewSlot({ ...newSlot, startHour: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg outline-none" style={{ ...font, fontSize: '0.82rem', border: '1px solid rgba(10,10,10,0.08)', background: '#FAFAF8' }}>
                            {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.5)', display: 'block', marginBottom: '4px' }}>Bis</label>
                          <select value={newSlot.endHour} onChange={e => setNewSlot({ ...newSlot, endHour: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg outline-none" style={{ ...font, fontSize: '0.82rem', border: '1px solid rgba(10,10,10,0.08)', background: '#FAFAF8' }}>
                            {HOURS.concat(24).map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.5)', display: 'block', marginBottom: '4px' }}>Parallele Gruppen</label>
                        <input type="number" min="1" max="5" value={newSlot.parallelSlots} onChange={e => setNewSlot({ ...newSlot, parallelSlots: Number(e.target.value) || 1 })}
                          className="w-full px-3 py-2 rounded-lg outline-none" style={{ ...font, fontSize: '0.82rem', border: '1px solid rgba(10,10,10,0.08)', background: '#FAFAF8' }} />
                      </div>
                      <div className="mb-4">
                        <label style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.5)', display: 'block', marginBottom: '4px' }}>Notiz (z.B. Yoga-Slot)</label>
                        <input type="text" value={newSlot.note} onChange={e => setNewSlot({ ...newSlot, note: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg outline-none" style={{ ...font, fontSize: '0.82rem', border: '1px solid rgba(10,10,10,0.08)', background: '#FAFAF8' }} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleCreateSlot} className="flex-1 py-2.5 rounded-lg"
                          style={{ background: '#7BAE5E', border: 'none', ...font, fontSize: '0.82rem', fontWeight: 500, color: '#fff', cursor: 'pointer' }}>
                          Slot oeffnen
                        </button>
                        <button onClick={() => setShowNewSlot(false)} className="px-4 py-2.5 rounded-lg"
                          style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.08)', ...font, fontSize: '0.78rem', color: 'rgba(10,10,10,0.5)', cursor: 'pointer' }}>
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {view === 'list' && (
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              {upcomingEvents.length === 0 ? (
                <p style={{ ...font, fontSize: '0.85rem', color: 'rgba(10,10,10,0.4)', textAlign: 'center', padding: '40px 0' }}>
                  Noch keine Termine geplant.
                </p>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map((e: any) => {
                    const d = new Date(e.start_time)
                    return (
                      <div key={e.id} className="rounded-xl p-4 flex items-center gap-4" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
                        <div className="text-center" style={{ minWidth: '60px' }}>
                          <div style={{ ...font, fontSize: '1.4rem', fontWeight: 600, color: '#0A0A0A', lineHeight: 1 }}>{d.getDate()}</div>
                          <div style={{ ...font, fontSize: '0.65rem', color: 'rgba(10,10,10,0.4)', textTransform: 'uppercase' }}>{MONTHS[d.getMonth()].slice(0, 3)}</div>
                        </div>
                        <div className="flex-1">
                          <div style={{ ...font, fontSize: '0.95rem', fontWeight: 600, color: '#0A0A0A' }}>{e.title}</div>
                          <div style={{ ...font, fontSize: '0.72rem', color: 'rgba(10,10,10,0.45)', marginTop: '2px' }}>
                            {DAYS_SHORT[(d.getDay() + 6) % 7]} &middot; {d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isGaertner && (
        <div className="px-6 py-3 border-t" style={{ borderColor: 'rgba(10,10,10,0.06)', background: '#fff' }}>
          <p style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.4)', textAlign: 'center' }}>
            {isHueter ? 'Als Hueter kannst du Slots oeffnen und Tage sperren.' : 'Als Gaertner kannst du Termine in offene Slots eintragen.'}
          </p>
        </div>
      )}

      {/* Mondphase-Popup */}
      {selectedMoon && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4" onClick={() => setSelectedMoon(null)}
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()}
            className="rounded-2xl p-6 shadow-xl max-w-xs text-center"
            style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
            <div className="flex justify-center mb-3">
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: selectedMoon.type === 'vollmond' ? '#F5E090' : 'transparent',
                border: `3px solid ${selectedMoon.type === 'vollmond' ? '#D4A843' : '#6B4C8A'}`,
                boxShadow: selectedMoon.type === 'vollmond' ? '0 0 20px rgba(245,224,144,0.7)' : 'none',
              }} />
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.3rem', fontWeight: 500, color: '#0A0A0A', marginBottom: '6px' }}>
              {selectedMoon.type === 'vollmond' ? 'Vollmond' : 'Neumond'}
            </h3>
            <p style={{ ...font, fontSize: '0.8rem', color: 'rgba(10,10,10,0.55)' }}>
              {new Date(selectedMoon.time).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
            </p>
            <p style={{ ...font, fontSize: '0.65rem', color: 'rgba(10,10,10,0.35)', marginTop: '10px' }}>
              Ortszeit deines Geraets
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
