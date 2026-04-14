import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, X as XIcon, Lock, Unlock } from 'lucide-react'
import * as api from '../../api/client'

const MONTHS = ['Januar', 'Februar', 'Maerz', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

interface SlotManagerProps {
  lichtungId: string
}

export function SlotManager({ lichtungId }: SlotManagerProps) {
  const [monthOffset, setMonthOffset] = useState(0)
  const [slots, setSlots] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slotStatus, setSlotStatus] = useState('open')
  const [maxEvents, setMaxEvents] = useState('1')
  const [note, setNote] = useState('')

  const font = { fontFamily: 'Inter, sans-serif' as const }
  const now = new Date()
  const viewMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const y = viewMonth.getFullYear(), m = viewMonth.getMonth()
  const from = `${y}-${String(m + 1).padStart(2, '0')}-01`
  const to = `${y}-${String(m + 2 > 12 ? 1 : m + 2).padStart(2, '0')}-01`

  useEffect(() => {
    api.getLichtungSlots(lichtungId, from, to).then(setSlots).catch(() => {})
  }, [lichtungId, monthOffset])

  const slotMap = useMemo(() => {
    const map: Record<string, any> = {}
    slots.forEach(s => { map[s.date] = s })
    return map
  }, [slots])

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

  const handleSave = async () => {
    if (!selectedDate) return
    await api.setLichtungSlot(lichtungId, selectedDate, slotStatus, Number(maxEvents) || 1, note)
    api.getLichtungSlots(lichtungId, from, to).then(setSlots)
    setSelectedDate(null)
  }

  const handleDateClick = (date: string) => {
    setSelectedDate(date)
    const s = slotMap[date]
    if (s) {
      setSlotStatus(s.status)
      setMaxEvents(String(s.max_events || 1))
      setNote(s.note || '')
    } else {
      setSlotStatus('open')
      setMaxEvents('1')
      setNote('')
    }
  }

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setMonthOffset(monthOffset - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.35)' }}>
          <ChevronLeft size={16} />
        </button>
        <span style={{ ...font, fontSize: '0.82rem', fontWeight: 600, color: '#0A0A0A' }}>
          {MONTHS[m]} {y}
        </span>
        <button onClick={() => setMonthOffset(monthOffset + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.35)' }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center" style={{ ...font, fontSize: '0.55rem', fontWeight: 500, color: 'rgba(10,10,10,0.3)', textTransform: 'uppercase' }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-0.5 mb-4">
        {calDays.map((day, i) => {
          const slot = slotMap[day.date]
          const isClosed = slot?.status === 'closed'
          const isToday = day.date === now.toISOString().slice(0, 10)
          return (
            <button key={i} onClick={() => day.inMonth && handleDateClick(day.date)}
              className="aspect-square rounded-lg flex flex-col items-center justify-center"
              style={{
                background: isClosed ? 'rgba(200,60,60,0.06)' : slot ? 'rgba(123,174,94,0.08)' : day.inMonth ? '#FAFAF8' : 'transparent',
                border: isToday ? '2px solid #D4A843' : selectedDate === day.date ? '2px solid #7BAE5E' : 'none',
                cursor: day.inMonth ? 'pointer' : 'default',
              }}>
              {day.inMonth && (
                <>
                  <span style={{ ...font, fontSize: '0.65rem', fontWeight: isToday ? 700 : 400, color: isClosed ? '#c44' : 'rgba(10,10,10,0.5)' }}>
                    {day.day}
                  </span>
                  {slot && (
                    <span style={{ ...font, fontSize: '0.45rem', color: isClosed ? '#c44' : '#7BAE5E' }}>
                      {isClosed ? '✕' : slot.max_events}
                    </span>
                  )}
                </>
              )}
            </button>
          )
        })}
      </div>

      {/* Slot Editor */}
      {selectedDate && (
        <div className="rounded-xl p-4" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ ...font, fontSize: '0.82rem', fontWeight: 600, color: '#0A0A0A' }}>{selectedDate}</span>
            <button onClick={() => setSelectedDate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}>
              <XIcon size={14} />
            </button>
          </div>

          <div className="flex gap-2 mb-3">
            <button onClick={() => setSlotStatus('open')} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg"
              style={{ ...font, fontSize: '0.72rem', fontWeight: 500, background: slotStatus === 'open' ? 'rgba(123,174,94,0.1)' : '#fff', color: slotStatus === 'open' ? '#7BAE5E' : 'rgba(10,10,10,0.4)', border: `1px solid ${slotStatus === 'open' ? '#7BAE5E' : 'rgba(10,10,10,0.08)'}`, cursor: 'pointer' }}>
              <Unlock size={12} /> Offen
            </button>
            <button onClick={() => setSlotStatus('closed')} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg"
              style={{ ...font, fontSize: '0.72rem', fontWeight: 500, background: slotStatus === 'closed' ? 'rgba(200,60,60,0.08)' : '#fff', color: slotStatus === 'closed' ? '#c44' : 'rgba(10,10,10,0.4)', border: `1px solid ${slotStatus === 'closed' ? '#c44' : 'rgba(10,10,10,0.08)'}`, cursor: 'pointer' }}>
              <Lock size={12} /> Ruhetag
            </button>
          </div>

          {slotStatus === 'open' && (
            <div className="mb-3">
              <label style={{ ...font, fontSize: '0.62rem', color: 'rgba(10,10,10,0.4)', display: 'block', marginBottom: '4px' }}>Max. Veranstaltungen</label>
              <input type="number" min="1" max="10" value={maxEvents} onChange={e => setMaxEvents(e.target.value)}
                className="w-full px-3 py-2 rounded-lg outline-none" style={{ border: '1px solid rgba(10,10,10,0.08)', ...font, fontSize: '0.82rem', background: '#fff' }} />
            </div>
          )}

          <div className="mb-3">
            <label style={{ ...font, fontSize: '0.62rem', color: 'rgba(10,10,10,0.4)', display: 'block', marginBottom: '4px' }}>Notiz (optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="z.B. Nur vormittags"
              className="w-full px-3 py-2 rounded-lg outline-none" style={{ border: '1px solid rgba(10,10,10,0.08)', ...font, fontSize: '0.82rem', background: '#fff' }} />
          </div>

          <button onClick={handleSave} className="w-full py-2.5 rounded-lg"
            style={{ ...font, fontSize: '0.78rem', fontWeight: 500, color: '#fff', background: '#7BAE5E', border: 'none', cursor: 'pointer' }}>
            Speichern
          </button>
        </div>
      )}

      <p style={{ ...font, fontSize: '0.62rem', color: 'rgba(10,10,10,0.3)', marginTop: '8px' }}>
        Klicke auf einen Tag, um ihn als offen oder Ruhetag zu markieren.
        Gruene Tage haben Slots, rote sind Ruhetage.
      </p>
    </div>
  )
}
