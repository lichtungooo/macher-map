import { useState, useMemo, useEffect } from 'react'
import { X, CalendarDays, Clock, ChevronLeft, ChevronRight, Repeat, Navigation as NavIcon, Plus } from 'lucide-react'
import { useApp, type EventItem } from '../../context/AppContext'
import { EventDetail } from './EventDetail'
import * as api from '../../api/client'

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const TYPE_COLORS: Record<string, string> = {
  meditation: '#E8751A', gebet: '#A07CC0', stille: '#6BA3BE',
  begegnung: '#E8751A', tanz: '#D4766E', fest: '#E0A050',
}

const RECURRING_LABELS: Record<string, string> = {
  vollmond: 'Vollmond', neumond: 'Neumond', woechentlich: 'Woechentlich', monatlich: 'Monatlich',
}

const MONTHS = ['Januar', 'Februar', 'Maerz', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const DAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

function formatDist(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

interface EventCalendarProps {
  onClose: () => void
  mapRadius?: number
  onRadiusSlide?: (radiusKm: number) => void
  onCreateEvent?: () => void
}

export function EventCalendar({ onClose, mapRadius, onRadiusSlide, onCreateEvent }: EventCalendarProps) {
  const { events } = useApp()
  const [view, setView] = useState<'list' | 'month'>('list')
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [monthOffset, setMonthOffset] = useState(0)
  const [radiusKm, setRadiusKm] = useState(100)
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [moonPhases, setMoonPhases] = useState<{ type: 'neumond' | 'vollmond'; time: string }[]>([])
  const [moonPopup, setMoonPopup] = useState<{ type: string; time: string } | null>(null)

  useEffect(() => {
    api.getMoonPhases(24).then(setMoonPhases).catch(() => {})
  }, [])

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
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      )
    }
  }, [])

  // Zoom-Sync: exakter Radius aus der sichtbaren Kartenflaeche
  useEffect(() => {
    if (mapRadius != null && mapRadius > 0) {
      setRadiusKm(Math.min(mapRadius, 500))
    }
  }, [mapRadius])

  const now = new Date()
  const viewMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)

  // Events + Distanz berechnen
  const eventsWithDist = useMemo(() => {
    return events.map(e => ({
      ...e,
      dist: userPos ? distanceKm(userPos[0], userPos[1], e.position[0], e.position[1]) : null,
    }))
  }, [events, userPos])

  const filteredEvents = useMemo(() => {
    if (!userPos) return eventsWithDist
    return eventsWithDist.filter(e => e.dist != null && e.dist <= radiusKm)
  }, [eventsWithDist, radiusKm, userPos])

  const sortedEvents = useMemo(() =>
    [...filteredEvents]
      .filter(e => new Date(e.start) >= new Date(now.toDateString()))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [filteredEvents]
  )

  const monthEvents = useMemo(() => {
    const y = viewMonth.getFullYear(), m = viewMonth.getMonth()
    return filteredEvents.filter(e => { const d = new Date(e.start); return d.getFullYear() === y && d.getMonth() === m })
  }, [filteredEvents, monthOffset])

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
    return <EventDetail event={selectedEvent} userPos={userPos} onClose={() => { setSelectedEvent(null); onClose() }} onBack={() => setSelectedEvent(null)} />
  }

  return (
    <div
      className="fixed z-[1500] rounded-2xl shadow-xl overflow-hidden"
      style={{ top: '70px', right: '16px', width: '340px', maxHeight: 'calc(100vh - 90px)', background: '#fff', border: '1px solid rgba(10,10,10,0.06)', animation: 'fade-in-up 0.2s ease-out' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(10,10,10,0.04)' }}>
        <div className="flex items-center gap-2.5">
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.2rem', fontWeight: 500, color: '#1A1A1A' }}>Kalender</h2>
          {onCreateEvent && (
            <div className="relative group">
              <button onClick={onCreateEvent}
                className="rounded-full flex items-center justify-center"
                style={{ width: 26, height: 26, background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)', cursor: 'pointer' }}>
                <Plus size={14} style={{ color: '#E8751A' }} />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
                style={{ background: '#1A1A1A', whiteSpace: 'nowrap', zIndex: 10 }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', color: '#fff' }}>Neuer Eintrag</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full overflow-hidden" style={{ border: '1px solid rgba(10,10,10,0.08)' }}>
            {(['list', 'month'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ ...font, fontSize: '0.65rem', fontWeight: 500, padding: '3px 10px', background: view === v ? 'rgba(212,168,67,0.1)' : 'transparent', color: view === v ? '#E8751A' : 'rgba(10,10,10,0.35)', border: 'none', cursor: 'pointer' }}>
                {v === 'list' ? 'Liste' : 'Monat'}
              </button>
            ))}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.25)' }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Umkreis-Slider */}
      <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(10,10,10,0.03)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <NavIcon size={11} style={{ color: userPos ? '#E8751A' : 'rgba(10,10,10,0.2)' }} />
            <span style={{ ...font, fontSize: '0.65rem', color: 'rgba(10,10,10,0.4)' }}>Umkreis</span>
          </div>
          <span style={{ ...font, fontSize: '0.7rem', fontWeight: 600, color: '#E8751A' }}>
            {radiusKm >= 500 ? 'Alle' : `${radiusKm} km`}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="500"
          value={radiusKm}
          onChange={e => {
            const v = Number(e.target.value)
            setRadiusKm(v)
            if (onRadiusSlide) onRadiusSlide(v)
          }}
          className="w-full"
          style={{ accentColor: '#E8751A', height: '4px' }}
        />
        <div className="flex justify-between mt-0.5">
          <span style={{ ...font, fontSize: '0.5rem', color: 'rgba(10,10,10,0.2)' }}>1 km</span>
          <span style={{ ...font, fontSize: '0.5rem', color: 'rgba(10,10,10,0.2)' }}>500 km</span>
        </div>
      </div>

      {/* Mondphase-Popup */}
      {moonPopup && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4"
          onClick={() => setMoonPopup(null)}
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()}
            className="rounded-2xl p-5 shadow-xl text-center"
            style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)', minWidth: '220px' }}>
            <div className="flex justify-center mb-3">
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: moonPopup.type === 'vollmond' ? '#F5E090' : 'transparent',
                border: `3px solid ${moonPopup.type === 'vollmond' ? '#E8751A' : '#6B4C8A'}`,
                boxShadow: moonPopup.type === 'vollmond' ? '0 0 16px rgba(245,224,144,0.7)' : 'none',
              }} />
            </div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.2rem', fontWeight: 500, color: '#1A1A1A', marginBottom: '4px' }}>
              {moonPopup.type === 'vollmond' ? 'Vollmond' : 'Neumond'}
            </h3>
            <p style={{ ...font, fontSize: '0.78rem', color: 'rgba(10,10,10,0.55)' }}>
              {new Date(moonPopup.time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
            <p style={{ ...font, fontSize: '0.62rem', color: 'rgba(10,10,10,0.3)', marginTop: '6px' }}>
              Ortszeit deines Geraets
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
        {view === 'list' ? (
          <div className="p-4 space-y-2">
            {sortedEvents.length === 0 ? (
              <div className="text-center py-10">
                <CalendarDays size={28} style={{ color: 'rgba(10,10,10,0.08)', margin: '0 auto 8px' }} />
                <p style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.35)' }}>
                  {userPos && radiusKm < 500 ? `Keine Veranstaltungen im Umkreis von ${radiusKm} km.` : 'Noch keine Veranstaltungen.'}
                </p>
              </div>
            ) : sortedEvents.map(event => (
              <button key={event.id} onClick={() => setSelectedEvent(event)}
                className="w-full text-left rounded-xl p-3.5 transition-all"
                style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.03)', cursor: 'pointer' }}>
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-11 h-11 rounded-lg flex flex-col items-center justify-center" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.05)' }}>
                    <span style={{ ...font, fontSize: '0.95rem', fontWeight: 600, color: '#1A1A1A', lineHeight: 1 }}>{new Date(event.start).getDate()}</span>
                    <span style={{ ...font, fontSize: '0.5rem', fontWeight: 500, color: 'rgba(10,10,10,0.35)', textTransform: 'uppercase' }}>{MONTHS[new Date(event.start).getMonth()]?.slice(0, 3)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: TYPE_COLORS[event.type] || '#E8751A' }} />
                      <span style={{ ...font, fontSize: '0.82rem', fontWeight: 600, color: '#1A1A1A' }} className="truncate">{event.title}</span>
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
                      {(event as any).dist != null && (
                        <span style={{ ...font, fontSize: '0.6rem', fontWeight: 500, color: '#E8751A' }}>
                          {formatDist((event as any).dist)}
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
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setMonthOffset(monthOffset - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.35)' }}><ChevronLeft size={16} /></button>
              <span style={{ ...font, fontSize: '0.85rem', fontWeight: 600, color: '#1A1A1A' }}>{MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}</span>
              <button onClick={() => setMonthOffset(monthOffset + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.35)' }}><ChevronRight size={16} /></button>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {DAYS_SHORT.map(d => (
                <div key={d} className="text-center" style={{ ...font, fontSize: '0.55rem', fontWeight: 500, color: 'rgba(10,10,10,0.3)', textTransform: 'uppercase' }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((day, i) => {
                const y = viewMonth.getFullYear(), m = viewMonth.getMonth()
                const dateKey = day.inMonth ? `${y}-${String(m + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}` : ''
                const moon = dateKey ? moonByDate[dateKey] : undefined
                return (
                  <div key={i} className="relative aspect-square rounded-lg flex flex-col items-center justify-start pt-1"
                    style={{ background: day.inMonth ? (day.events.length > 0 ? 'rgba(212,168,67,0.06)' : '#FAFAF8') : 'transparent', cursor: day.events.length > 0 ? 'pointer' : 'default' }}
                    onClick={() => day.events.length > 0 && setSelectedEvent(day.events[0])}>
                    {day.inMonth && (
                      <>
                        <span style={{ ...font, fontSize: '0.68rem', fontWeight: day.date === now.getDate() && monthOffset === 0 ? 700 : 400, color: day.date === now.getDate() && monthOffset === 0 ? '#E8751A' : 'rgba(10,10,10,0.45)' }}>{day.date}</span>
                        {day.events.length > 0 && (
                          <div className="flex gap-0.5 mt-0.5">
                            {day.events.slice(0, 3).map((e, j) => (
                              <div key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: TYPE_COLORS[e.type] || '#E8751A' }} />
                            ))}
                          </div>
                        )}
                        {moon && (
                          <span
                            onClick={(e) => { e.stopPropagation(); setMoonPopup(moon) }}
                            title={`${moon.type === 'vollmond' ? 'Vollmond' : 'Neumond'} um ${new Date(moon.time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr`}
                            style={{
                              position: 'absolute', top: 2, right: 2,
                              width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
                              background: moon.type === 'vollmond' ? '#F5E090' : 'transparent',
                              border: `1.2px solid ${moon.type === 'vollmond' ? '#E8751A' : '#6B4C8A'}`,
                              boxShadow: moon.type === 'vollmond' ? '0 0 3px rgba(245,224,144,0.6)' : 'none',
                              cursor: 'pointer',
                            }}
                          />
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legende */}
            <div className="flex items-center justify-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid rgba(10,10,10,0.04)' }}>
              <div className="flex items-center gap-1.5">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F5E090', border: '1.5px solid #E8751A' }} />
                <span style={{ ...font, fontSize: '0.6rem', color: 'rgba(10,10,10,0.4)' }}>Vollmond</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'transparent', border: '1.5px solid #6B4C8A' }} />
                <span style={{ ...font, fontSize: '0.6rem', color: 'rgba(10,10,10,0.4)' }}>Neumond</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
