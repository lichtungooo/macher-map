import { useState, useMemo } from 'react'
import { X, CalendarDays, MapPin, Clock, ChevronLeft, ChevronRight, Repeat } from 'lucide-react'
import { useApp, type EventItem } from '../../context/AppContext'

const TYPE_LABELS: Record<string, string> = {
  meditation: 'Meditation',
  gebet: 'Gebet',
  stille: 'Stille',
  begegnung: 'Begegnung',
  tanz: 'Tanz',
  fest: 'Fest',
}

const TYPE_COLORS: Record<string, string> = {
  meditation: '#D4A843',
  gebet: '#A07CC0',
  stille: '#6BA3BE',
  begegnung: '#7BAE5E',
  tanz: '#D4766E',
  fest: '#E0A050',
}

const RECURRING_LABELS: Record<string, string> = {
  vollmond: 'Jeden Vollmond',
  neumond: 'Jeden Neumond',
  woechentlich: 'Woechentlich',
  monatlich: 'Monatlich',
}

const MONTHS = ['Januar', 'Februar', 'Maerz', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const DAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

interface EventCalendarProps {
  onClose: () => void
  onEventClick?: (event: EventItem) => void
}

export function EventCalendar({ onClose, onEventClick }: EventCalendarProps) {
  const { events } = useApp()
  const [view, setView] = useState<'list' | 'month'>('list')
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [monthOffset, setMonthOffset] = useState(0)

  const now = new Date()
  const viewMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)

  // Sort events by date, upcoming first
  const sortedEvents = useMemo(() => {
    return [...events]
      .filter(e => new Date(e.start) >= new Date(now.toDateString()))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }, [events])

  // Events for the current month view
  const monthEvents = useMemo(() => {
    const year = viewMonth.getFullYear()
    const month = viewMonth.getMonth()
    return events.filter(e => {
      const d = new Date(e.start)
      return d.getFullYear() === year && d.getMonth() === month
    })
  }, [events, monthOffset])

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear()
    const month = viewMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startOffset = (firstDay.getDay() + 6) % 7 // Monday = 0
    const days: { date: number; inMonth: boolean; events: EventItem[] }[] = []

    // Previous month padding
    for (let i = 0; i < startOffset; i++) {
      days.push({ date: 0, inMonth: false, events: [] })
    }

    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dayEvents = monthEvents.filter(e => e.start.startsWith(dateStr))
      days.push({ date: d, inMonth: true, events: dayEvents })
    }

    return days
  }, [monthEvents, monthOffset])

  const handleEventSelect = (event: EventItem) => {
    setSelectedEvent(event)
    if (onEventClick) onEventClick(event)
  }

  const labelStyle = { fontFamily: 'Inter, sans-serif' as const }

  return (
    <div className="fixed inset-0 z-[1500] flex items-end sm:items-stretch sm:justify-end" style={{ background: 'rgba(0,0,0,0.2)' }}>
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Calendar Panel */}
      <div
        className="relative w-full sm:w-96 max-h-[85vh] sm:max-h-full rounded-t-2xl sm:rounded-none overflow-y-auto"
        style={{ background: '#fff', borderLeft: '1px solid rgba(10,10,10,0.06)', animation: 'fade-in-up 0.25s ease-out' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4" style={{ background: '#fff', borderBottom: '1px solid rgba(10,10,10,0.06)' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.3rem', fontWeight: 500, color: '#0A0A0A' }}>
            Kalender
          </h2>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(10,10,10,0.08)' }}>
              <button
                onClick={() => setView('list')}
                className="px-3 py-1.5"
                style={{ ...labelStyle, fontSize: '0.7rem', fontWeight: 500, background: view === 'list' ? 'rgba(212,168,67,0.1)' : 'transparent', color: view === 'list' ? '#D4A843' : 'rgba(10,10,10,0.4)', border: 'none', cursor: 'pointer' }}
              >
                Liste
              </button>
              <button
                onClick={() => setView('month')}
                className="px-3 py-1.5"
                style={{ ...labelStyle, fontSize: '0.7rem', fontWeight: 500, background: view === 'month' ? 'rgba(212,168,67,0.1)' : 'transparent', color: view === 'month' ? '#D4A843' : 'rgba(10,10,10,0.4)', border: 'none', cursor: 'pointer' }}
              >
                Monat
              </button>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          {view === 'list' ? (
            /* ─── List View ─── */
            <div className="space-y-3">
              {sortedEvents.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays size={32} style={{ color: 'rgba(10,10,10,0.1)', margin: '0 auto 12px' }} />
                  <p style={{ ...labelStyle, fontSize: '0.85rem', color: 'rgba(10,10,10,0.4)' }}>
                    Noch keine Veranstaltungen.
                  </p>
                  <p style={{ ...labelStyle, fontSize: '0.75rem', color: 'rgba(10,10,10,0.25)', marginTop: '4px' }}>
                    Erstelle die erste mit dem Plus-Button.
                  </p>
                </div>
              ) : (
                sortedEvents.map(event => (
                  <button
                    key={event.id}
                    onClick={() => handleEventSelect(event)}
                    className="w-full text-left rounded-xl p-4 transition-all"
                    style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div className="flex items-start gap-3">
                      {/* Date block */}
                      <div className="shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
                        <span style={{ ...labelStyle, fontSize: '1rem', fontWeight: 600, color: '#0A0A0A', lineHeight: 1 }}>
                          {new Date(event.start).getDate()}
                        </span>
                        <span style={{ ...labelStyle, fontSize: '0.55rem', fontWeight: 500, color: 'rgba(10,10,10,0.4)', textTransform: 'uppercase' }}>
                          {MONTHS[new Date(event.start).getMonth()]?.slice(0, 3)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: TYPE_COLORS[event.type] || '#D4A843' }} />
                          <span style={{ ...labelStyle, fontSize: '0.85rem', fontWeight: 600, color: '#0A0A0A' }} className="truncate">
                            {event.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1" style={{ ...labelStyle, fontSize: '0.7rem', color: 'rgba(10,10,10,0.45)' }}>
                            <Clock size={11} />
                            {formatTime(event.start)}
                          </span>
                          <span style={{ ...labelStyle, fontSize: '0.65rem', color: TYPE_COLORS[event.type] || '#D4A843' }}>
                            {TYPE_LABELS[event.type] || event.type}
                          </span>
                          {event.recurring && (
                            <span className="flex items-center gap-1" style={{ ...labelStyle, fontSize: '0.65rem', color: 'rgba(10,10,10,0.35)' }}>
                              <Repeat size={10} />
                              {RECURRING_LABELS[event.recurring]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            /* ─── Month View ─── */
            <div>
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setMonthOffset(monthOffset - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.4)' }}>
                  <ChevronLeft size={18} />
                </button>
                <span style={{ ...labelStyle, fontSize: '0.9rem', fontWeight: 600, color: '#0A0A0A' }}>
                  {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                </span>
                <button onClick={() => setMonthOffset(monthOffset + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.4)' }}>
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS_SHORT.map(d => (
                  <div key={d} className="text-center" style={{ ...labelStyle, fontSize: '0.6rem', fontWeight: 500, color: 'rgba(10,10,10,0.35)', textTransform: 'uppercase' }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-0.5">
                {calendarDays.map((day, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg flex flex-col items-center justify-start p-1"
                    style={{
                      background: day.inMonth ? (day.events.length > 0 ? 'rgba(212,168,67,0.06)' : '#FAFAF8') : 'transparent',
                      cursor: day.events.length > 0 ? 'pointer' : 'default',
                    }}
                    onClick={() => day.events.length > 0 && handleEventSelect(day.events[0])}
                  >
                    {day.inMonth && (
                      <>
                        <span style={{ ...labelStyle, fontSize: '0.72rem', fontWeight: day.date === now.getDate() && monthOffset === 0 ? 700 : 400, color: day.date === now.getDate() && monthOffset === 0 ? '#D4A843' : 'rgba(10,10,10,0.5)' }}>
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

        {/* Event Detail */}
        {selectedEvent && (
          <div className="px-5 pb-5">
            <div className="rounded-xl p-5" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: TYPE_COLORS[selectedEvent.type] || '#D4A843' }} />
                  <span style={{ ...labelStyle, fontSize: '0.65rem', fontWeight: 500, color: TYPE_COLORS[selectedEvent.type] || '#D4A843', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {TYPE_LABELS[selectedEvent.type]}
                  </span>
                </div>
                <button onClick={() => setSelectedEvent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}>
                  <X size={16} />
                </button>
              </div>

              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', fontWeight: 500, color: '#0A0A0A', marginBottom: '8px' }}>
                {selectedEvent.title}
              </h3>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays size={13} style={{ color: 'rgba(10,10,10,0.35)' }} />
                  <span style={{ ...labelStyle, fontSize: '0.78rem', color: 'rgba(10,10,10,0.55)' }}>
                    {formatDate(selectedEvent.start)}, {formatTime(selectedEvent.start)}
                  </span>
                </div>
                {selectedEvent.recurring && (
                  <div className="flex items-center gap-2">
                    <Repeat size={13} style={{ color: 'rgba(10,10,10,0.35)' }} />
                    <span style={{ ...labelStyle, fontSize: '0.78rem', color: 'rgba(10,10,10,0.55)' }}>
                      {RECURRING_LABELS[selectedEvent.recurring]}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin size={13} style={{ color: 'rgba(10,10,10,0.35)' }} />
                  <span style={{ ...labelStyle, fontSize: '0.78rem', color: 'rgba(10,10,10,0.55)' }}>
                    {selectedEvent.position[0].toFixed(3)}, {selectedEvent.position[1].toFixed(3)}
                  </span>
                </div>
              </div>

              {selectedEvent.description && (
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.9rem', lineHeight: 1.6, color: 'rgba(10,10,10,0.55)', fontStyle: 'italic' }}>
                  {selectedEvent.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
