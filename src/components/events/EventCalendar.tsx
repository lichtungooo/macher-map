import { useState, useMemo } from 'react'
import { X, CalendarDays, Clock, ChevronLeft, ChevronRight, Repeat } from 'lucide-react'
import { useApp, type EventItem } from '../../context/AppContext'
import { EventDetail } from './EventDetail'

const TYPE_COLORS: Record<string, string> = {
  meditation: '#D4A843', gebet: '#A07CC0', stille: '#6BA3BE',
  begegnung: '#7BAE5E', tanz: '#D4766E', fest: '#E0A050',
}

const RECURRING_LABELS: Record<string, string> = {
  vollmond: 'Vollmond', neumond: 'Neumond', woechentlich: 'Woechentlich', monatlich: 'Monatlich',
}

const MONTHS = ['Januar', 'Februar', 'Maerz', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const DAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

interface EventCalendarProps {
  onClose: () => void
}

export function EventCalendar({ onClose }: EventCalendarProps) {
  const { events } = useApp()
  const [view, setView] = useState<'list' | 'month'>('list')
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [monthOffset, setMonthOffset] = useState(0)

  const now = new Date()
  const viewMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)

  const sortedEvents = useMemo(() =>
    [...events]
      .filter(e => new Date(e.start) >= new Date(now.toDateString()))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [events]
  )

  const monthEvents = useMemo(() => {
    const y = viewMonth.getFullYear(), m = viewMonth.getMonth()
    return events.filter(e => { const d = new Date(e.start); return d.getFullYear() === y && d.getMonth() === m })
  }, [events, monthOffset])

  const calendarDays = useMemo(() => {
    const y = viewMonth.getFullYear(), m = viewMonth.getMonth()
    const first = new Date(y, m, 1), last = new Date(y, m + 1, 0)
    const offset = (first.getDay() + 6) % 7
    const days: { date: number; inMonth: boolean; events: EventItem[] }[] = []
    for (let i = 0; i < offset; i++) days.push({ date: 0, inMonth: false, events: [] })
    for (let d = 1; d <= last.getDate(); d++) {
      const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ date: d, inMonth: true, events: monthEvents.filter(e => e.start.startsWith(ds)) })
    }
    return days
  }, [monthEvents, monthOffset])

  const font = { fontFamily: 'Inter, sans-serif' as const }

  if (selectedEvent) {
    return <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} onBack={() => setSelectedEvent(null)} />
  }

  return (
    <div
      className="fixed z-[1500] rounded-2xl shadow-xl overflow-hidden"
      style={{
        top: '70px', right: '16px', width: '340px', maxHeight: 'calc(100vh - 90px)',
        background: '#fff', border: '1px solid rgba(10,10,10,0.06)',
        animation: 'fade-in-up 0.2s ease-out',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(10,10,10,0.04)' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', fontWeight: 500, color: '#0A0A0A' }}>
          Kalender
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full overflow-hidden" style={{ border: '1px solid rgba(10,10,10,0.08)' }}>
            {(['list', 'month'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ ...font, fontSize: '0.65rem', fontWeight: 500, padding: '4px 12px', background: view === v ? 'rgba(212,168,67,0.1)' : 'transparent', color: view === v ? '#D4A843' : 'rgba(10,10,10,0.35)', border: 'none', cursor: 'pointer' }}>
                {v === 'list' ? 'Liste' : 'Monat'}
              </button>
            ))}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.25)' }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
        {view === 'list' ? (
          <div className="p-4 space-y-2">
            {sortedEvents.length === 0 ? (
              <div className="text-center py-10">
                <CalendarDays size={28} style={{ color: 'rgba(10,10,10,0.08)', margin: '0 auto 8px' }} />
                <p style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.35)' }}>Noch keine Veranstaltungen.</p>
              </div>
            ) : sortedEvents.map(event => (
              <button key={event.id} onClick={() => setSelectedEvent(event)}
                className="w-full text-left rounded-xl p-3.5 transition-all"
                style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.03)', cursor: 'pointer' }}>
                <div className="flex items-start gap-3">
                  {/* Date block */}
                  <div className="shrink-0 w-11 h-11 rounded-lg flex flex-col items-center justify-center" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.05)' }}>
                    <span style={{ ...font, fontSize: '0.95rem', fontWeight: 600, color: '#0A0A0A', lineHeight: 1 }}>
                      {new Date(event.start).getDate()}
                    </span>
                    <span style={{ ...font, fontSize: '0.5rem', fontWeight: 500, color: 'rgba(10,10,10,0.35)', textTransform: 'uppercase' }}>
                      {MONTHS[new Date(event.start).getMonth()]?.slice(0, 3)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: TYPE_COLORS[event.type] || '#D4A843' }} />
                      <span style={{ ...font, fontSize: '0.82rem', fontWeight: 600, color: '#0A0A0A' }} className="truncate">{event.title}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1" style={{ ...font, fontSize: '0.65rem', color: 'rgba(10,10,10,0.4)' }}>
                        <Clock size={10} /> {formatTime(event.start)}
                      </span>
                      {event.recurring && (
                        <span className="flex items-center gap-1" style={{ ...font, fontSize: '0.6rem', color: 'rgba(10,10,10,0.3)' }}>
                          <Repeat size={9} /> {RECURRING_LABELS[event.recurring]}
                        </span>
                      )}
                      {(event as any).participantCount > 0 && (
                        <span style={{ ...font, fontSize: '0.6rem', color: '#D4A843' }}>
                          {(event as any).participantCount} Teilnehmer
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setMonthOffset(monthOffset - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.35)' }}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ ...font, fontSize: '0.85rem', fontWeight: 600, color: '#0A0A0A' }}>
                {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
              </span>
              <button onClick={() => setMonthOffset(monthOffset + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.35)' }}>
                <ChevronRight size={16} />
              </button>
            </div>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS_SHORT.map(d => (
                <div key={d} className="text-center" style={{ ...font, fontSize: '0.55rem', fontWeight: 500, color: 'rgba(10,10,10,0.3)', textTransform: 'uppercase' }}>{d}</div>
              ))}
            </div>
            {/* Grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((day, i) => (
                <div key={i}
                  className="aspect-square rounded-lg flex flex-col items-center justify-start pt-1"
                  style={{ background: day.inMonth ? (day.events.length > 0 ? 'rgba(212,168,67,0.06)' : '#FAFAF8') : 'transparent', cursor: day.events.length > 0 ? 'pointer' : 'default' }}
                  onClick={() => day.events.length > 0 && setSelectedEvent(day.events[0])}>
                  {day.inMonth && (
                    <>
                      <span style={{ ...font, fontSize: '0.68rem', fontWeight: day.date === now.getDate() && monthOffset === 0 ? 700 : 400, color: day.date === now.getDate() && monthOffset === 0 ? '#D4A843' : 'rgba(10,10,10,0.45)' }}>
                        {day.date}
                      </span>
                      {day.events.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {day.events.slice(0, 3).map((e, j) => (
                            <div key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: TYPE_COLORS[e.type] || '#D4A843' }} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
