import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ArrowLeft, Lock, Unlock, Plus, Trash2 } from 'lucide-react'
import * as api from '../../api/client'

const MONTHS = ['Januar', 'Februar', 'Maerz', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 6:00 - 23:00

interface SlotManagerProps {
  lichtungId: string
  myRole?: string | null
}

export function SlotManager({ lichtungId, myRole }: SlotManagerProps) {
  const [monthOffset, setMonthOffset] = useState(0)
  const [monthSlots, setMonthSlots] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [daySlots, setDaySlots] = useState<any[]>([])
  const [dayEvents, setDayEvents] = useState<any[]>([])
  const [showNewSlot, setShowNewSlot] = useState(false)
  const [newSlot, setNewSlot] = useState({ startHour: 9, endHour: 11, parallelSlots: 1, note: '' })

  const font = { fontFamily: 'Inter, sans-serif' as const }
  const now = new Date()
  const viewMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const y = viewMonth.getFullYear(), m = viewMonth.getMonth()
  const isHueter = myRole === 'owner'

  const from = `${y}-${String(m + 1).padStart(2, '0')}-01`
  const to = `${y}-${String(m + 2 > 12 ? 1 : m + 2).padStart(2, '0')}-01`

  useEffect(() => {
    api.getLichtungSlots(lichtungId, from, to).then(setMonthSlots).catch(() => {})
  }, [lichtungId, monthOffset])

  useEffect(() => {
    if (selectedDate) {
      api.getSlotsForDate(lichtungId, selectedDate).then(setDaySlots).catch(() => {})
      // Auch die Events des Tages holen
      api.getLichtungEvents(lichtungId).then(events => {
        setDayEvents(events.filter((e: any) => e.start_time.startsWith(selectedDate)))
      }).catch(() => {})
    }
  }, [selectedDate, lichtungId])

  // Slots pro Tag: Map<date, { status: 'open'|'closed'|'partial', slots: count }>
  const daySlotMap = useMemo(() => {
    const map: Record<string, { status: string; slots: number; hasTimeSlots: boolean }> = {}
    for (const s of monthSlots) {
      const existing = map[s.date] || { status: 'open', slots: 0, hasTimeSlots: false }
      if (s.start_hour !== null && s.start_hour !== undefined) {
        existing.hasTimeSlots = true
        existing.slots++
      } else {
        // Ganztags-Status
        existing.status = s.status
      }
      map[s.date] = existing
    }
    return map
  }, [monthSlots])

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
    api.getSlotsForDate(lichtungId, selectedDate!).then(setDaySlots)
    api.getLichtungSlots(lichtungId, from, to).then(setMonthSlots)
  }

  const handleCloseDayToggle = async () => {
    if (!selectedDate) return
    const dayInfo = daySlotMap[selectedDate]
    const newStatus = dayInfo?.status === 'closed' ? 'open' : 'closed'
    await api.setLichtungSlot(lichtungId, selectedDate, newStatus, 1, '')
    api.getLichtungSlots(lichtungId, from, to).then(setMonthSlots)
    api.getSlotsForDate(lichtungId, selectedDate).then(setDaySlots)
  }

  // ─── Tag-Ansicht ───
  if (selectedDate) {
    const dayInfo = daySlotMap[selectedDate]
    const isClosed = dayInfo?.status === 'closed'
    const timeSlots = daySlots.filter(s => s.start_hour !== null && s.start_hour !== undefined).sort((a, b) => a.start_hour - b.start_hour)
    const dayDate = new Date(selectedDate)
    const dayLabel = dayDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setSelectedDate(null)} className="flex items-center gap-1" style={{ ...font, fontSize: '0.78rem', color: 'rgba(10,10,10,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={14} /> Zurueck
          </button>
          <span style={{ ...font, fontSize: '0.82rem', fontWeight: 600, color: '#0A0A0A' }}>{dayLabel}</span>
        </div>

        {/* Ganztag sperren (nur Hueter) */}
        {isHueter && (
          <button onClick={handleCloseDayToggle}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg mb-4"
            style={{ background: isClosed ? 'rgba(200,60,60,0.1)' : '#FAFAF8', border: `1px solid ${isClosed ? '#c44' : 'rgba(10,10,10,0.08)'}`, ...font, fontSize: '0.75rem', fontWeight: 500, color: isClosed ? '#c44' : 'rgba(10,10,10,0.5)', cursor: 'pointer' }}>
            {isClosed ? <Lock size={13} /> : <Unlock size={13} />}
            {isClosed ? 'Ganzer Tag gesperrt — klick zum Oeffnen' : 'Ganzen Tag sperren'}
          </button>
        )}

        {isClosed && !isHueter && (
          <div className="rounded-xl p-3 mb-4 text-center" style={{ background: 'rgba(200,60,60,0.06)', border: '1px solid rgba(200,60,60,0.15)' }}>
            <Lock size={14} style={{ color: '#c44', margin: '0 auto 4px' }} />
            <p style={{ ...font, fontSize: '0.75rem', color: '#c44' }}>Ruhetag</p>
          </div>
        )}

        {/* Zeit-Slots */}
        {!isClosed && (
          <>
            <div className="space-y-1.5 mb-3">
              {timeSlots.length === 0 && (
                <p style={{ ...font, fontSize: '0.75rem', color: 'rgba(10,10,10,0.4)', textAlign: 'center', padding: '20px 0' }}>
                  Noch keine Zeit-Slots geoeffnet.
                </p>
              )}
              {timeSlots.map(s => {
                const eventsInSlot = dayEvents.filter(e => {
                  const h = new Date(e.start_time).getHours()
                  return h >= s.start_hour && h < s.end_hour
                })
                const slotFull = eventsInSlot.length >= s.parallel_slots
                return (
                  <div key={s.id} className="flex items-center gap-2 rounded-lg p-3" style={{ background: slotFull ? '#FAFAF8' : 'rgba(123,174,94,0.06)', border: `1px solid ${slotFull ? 'rgba(10,10,10,0.08)' : 'rgba(123,174,94,0.2)'}` }}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span style={{ ...font, fontSize: '0.82rem', fontWeight: 600, color: '#0A0A0A' }}>
                          {String(s.start_hour).padStart(2, '0')}:00 - {String(s.end_hour).padStart(2, '0')}:00
                        </span>
                        <span style={{ ...font, fontSize: '0.65rem', color: slotFull ? '#c44' : '#7BAE5E' }}>
                          {eventsInSlot.length}/{s.parallel_slots} Gruppen
                        </span>
                      </div>
                      {s.note && <span style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.4)' }}>{s.note}</span>}
                      {eventsInSlot.length > 0 && (
                        <div className="mt-1.5 space-y-0.5">
                          {eventsInSlot.map((e: any) => (
                            <div key={e.id} className="flex items-center gap-1">
                              <div className="w-1 h-1 rounded-full" style={{ background: '#D4A843' }} />
                              <span style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.55)' }}>{e.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {isHueter && (
                      <button onClick={() => handleDeleteSlot(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)', padding: '2px' }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Neuer Slot (nur Hueter) */}
            {isHueter && !showNewSlot && (
              <button onClick={() => setShowNewSlot(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg"
                style={{ background: 'rgba(123,174,94,0.08)', border: '1px solid rgba(123,174,94,0.25)', ...font, fontSize: '0.75rem', fontWeight: 500, color: '#7BAE5E', cursor: 'pointer' }}>
                <Plus size={14} /> Zeit-Slot oeffnen
              </button>
            )}

            {isHueter && showNewSlot && (
              <div className="rounded-xl p-4 mt-2" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <label style={{ ...font, fontSize: '0.65rem', color: 'rgba(10,10,10,0.5)' }}>Von</label>
                  <select value={newSlot.startHour} onChange={e => setNewSlot({ ...newSlot, startHour: Number(e.target.value) })}
                    className="px-2 py-1.5 rounded-lg outline-none" style={{ ...font, fontSize: '0.75rem', border: '1px solid rgba(10,10,10,0.08)', background: '#fff' }}>
                    {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
                  </select>
                  <label style={{ ...font, fontSize: '0.65rem', color: 'rgba(10,10,10,0.5)' }}>Bis</label>
                  <select value={newSlot.endHour} onChange={e => setNewSlot({ ...newSlot, endHour: Number(e.target.value) })}
                    className="px-2 py-1.5 rounded-lg outline-none" style={{ ...font, fontSize: '0.75rem', border: '1px solid rgba(10,10,10,0.08)', background: '#fff' }}>
                    {HOURS.concat(24).map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label style={{ ...font, fontSize: '0.65rem', color: 'rgba(10,10,10,0.5)', display: 'block', marginBottom: '3px' }}>Parallele Gruppen</label>
                  <input type="number" min="1" max="5" value={newSlot.parallelSlots} onChange={e => setNewSlot({ ...newSlot, parallelSlots: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg outline-none" style={{ ...font, fontSize: '0.78rem', border: '1px solid rgba(10,10,10,0.08)', background: '#fff' }} />
                </div>
                <div className="mb-3">
                  <label style={{ ...font, fontSize: '0.65rem', color: 'rgba(10,10,10,0.5)', display: 'block', marginBottom: '3px' }}>Notiz (optional)</label>
                  <input type="text" value={newSlot.note} onChange={e => setNewSlot({ ...newSlot, note: e.target.value })}
                    placeholder="z.B. Yoga-Slot" className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{ ...font, fontSize: '0.78rem', border: '1px solid rgba(10,10,10,0.08)', background: '#fff' }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCreateSlot} className="flex-1 py-2 rounded-lg"
                    style={{ background: '#7BAE5E', border: 'none', ...font, fontSize: '0.75rem', fontWeight: 500, color: '#fff', cursor: 'pointer' }}>
                    Slot oeffnen
                  </button>
                  <button onClick={() => setShowNewSlot(false)} className="px-3 py-2 rounded-lg"
                    style={{ background: 'none', border: '1px solid rgba(10,10,10,0.08)', ...font, fontSize: '0.72rem', color: 'rgba(10,10,10,0.5)', cursor: 'pointer' }}>
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // ─── Monats-Ansicht ───
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setMonthOffset(monthOffset - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.35)' }}>
          <ChevronLeft size={16} />
        </button>
        <span style={{ ...font, fontSize: '0.82rem', fontWeight: 600, color: '#0A0A0A' }}>{MONTHS[m]} {y}</span>
        <button onClick={() => setMonthOffset(monthOffset + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.35)' }}>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center" style={{ ...font, fontSize: '0.55rem', fontWeight: 500, color: 'rgba(10,10,10,0.3)', textTransform: 'uppercase' }}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-4">
        {calDays.map((day, i) => {
          const info = daySlotMap[day.date]
          const isClosed = info?.status === 'closed'
          const hasSlots = info?.hasTimeSlots
          const isToday = day.date === now.toISOString().slice(0, 10)
          let bg = 'transparent'
          if (day.inMonth) {
            if (isClosed) bg = 'rgba(200,60,60,0.08)'
            else if (hasSlots) bg = 'rgba(123,174,94,0.12)'
            else bg = '#FAFAF8'
          }
          return (
            <button key={i} onClick={() => day.inMonth && setSelectedDate(day.date)}
              className="aspect-square rounded-lg flex flex-col items-center justify-center"
              style={{ background: bg, border: isToday ? '2px solid #D4A843' : 'none', cursor: day.inMonth ? 'pointer' : 'default' }}>
              {day.inMonth && (
                <>
                  <span style={{ ...font, fontSize: '0.68rem', fontWeight: isToday ? 700 : 400, color: isClosed ? '#c44' : 'rgba(10,10,10,0.6)' }}>{day.day}</span>
                  {isClosed && <span style={{ fontSize: '0.6rem', color: '#c44' }}>✕</span>}
                  {!isClosed && hasSlots && <span style={{ ...font, fontSize: '0.5rem', color: '#7BAE5E', fontWeight: 600 }}>{info.slots}</span>}
                </>
              )}
            </button>
          )
        })}
      </div>

      <p style={{ ...font, fontSize: '0.62rem', color: 'rgba(10,10,10,0.35)', lineHeight: 1.5 }}>
        Klicke auf einen Tag um Zeit-Slots zu sehen.
        <br />
        Gruen mit Zahl = offene Slots. Rot = Ruhetag.
      </p>
    </div>
  )
}
