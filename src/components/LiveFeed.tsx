import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trees, Sparkles, CalendarDays, ChevronLeft, ChevronRight, Moon, Globe } from 'lucide-react'
import * as api from '../api/client'

// ─── Typen ───

interface LightItem {
  id: string
  name: string
  statement: string
  image_path?: string
}

interface LichtungItem {
  id: string
  name: string
  description?: string
  image_path?: string
}

interface EventItem {
  id: string
  title: string
  description?: string
  start_time: string
  end_time?: string
  type?: string
  is_global?: boolean
  is_placeholder?: boolean
}

// ─── Utils ───

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }) +
      ' · ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

// Platzhalter-Events fuer globale Meditationen (falls Backend leer ist)
const PLACEHOLDER_EVENTS: EventItem[] = (() => {
  const out: EventItem[] = []
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i * 15)
    d.setHours(21, 0, 0, 0)
    const isFullMoon = i % 2 === 0
    out.push({
      id: `placeholder-${i}`,
      title: isFullMoon ? 'Vollmond-Meditation' : 'Neumond-Innehalten',
      description: isFullMoon
        ? 'Weltweite Meditation im Licht des Vollmondes.'
        : 'Neubeginn in der Stille. Gemeinsamer Puls um die Erde.',
      start_time: d.toISOString(),
      type: isFullMoon ? 'meditation' : 'stille',
      is_global: true,
      is_placeholder: true,
    })
  }
  return out
})()

// ─── Karussell ───

function Carousel({
  title,
  icon: Icon,
  accentColor,
  children,
  itemCount,
}: {
  title: string
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  accentColor: string
  children: React.ReactNode
  itemCount: number
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return

    // Eine Karten-Breite + Gap (12px) berechnen
    const firstItem = el.querySelector(':scope > *') as HTMLElement | null
    if (!firstItem) return
    const cardWidth = firstItem.getBoundingClientRect().width + 12

    const maxScroll = el.scrollWidth - el.clientWidth
    const current = el.scrollLeft

    if (dir === 'right') {
      // Am Ende? Zurueck auf Anfang
      if (current >= maxScroll - 2) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' })
      }
    } else {
      // Am Anfang? Nach ganz hinten springen
      if (current <= 2) {
        el.scrollTo({ left: maxScroll, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: -cardWidth, behavior: 'smooth' })
      }
    }
  }

  if (itemCount === 0) return null

  return (
    <div className="mb-8 last:mb-0">
      {/* Header zentriert: [←] Titel [→] */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <button
          onClick={() => scroll('left')}
          aria-label="Zurueck"
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'transparent', border: '1px solid rgba(10,10,10,0.12)', cursor: 'pointer' }}
        >
          <ChevronLeft size={13} style={{ color: 'rgba(10,10,10,0.55)' }} />
        </button>

        <div className="flex items-center gap-1.5" style={{ minWidth: 'calc((100% - 2 * 12px) / 3)', justifyContent: 'center' }}>
          <Icon size={13} style={{ color: accentColor }} />
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(10,10,10,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {title}
          </h3>
        </div>

        <button
          onClick={() => scroll('right')}
          aria-label="Weiter"
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'transparent', border: '1px solid rgba(10,10,10,0.12)', cursor: 'pointer' }}
        >
          <ChevronRight size={13} style={{ color: 'rgba(10,10,10,0.55)' }} />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Haupt-Komponente ───

export default function LiveFeed() {
  const navigate = useNavigate()
  const [lights, setLights] = useState<LightItem[]>([])
  const [lichtungen, setLichtungen] = useState<LichtungItem[]>([])
  const [events, setEvents] = useState<EventItem[]>([])

  useEffect(() => {
    api.getLights().then((data: any[]) => {
      const filtered = (data || []).filter(l => l.name && (l.statement || l.image_path))
      setLights(pickRandom(filtered, 9))
    }).catch(() => {})

    api.getLichtungen().then((data: any[]) => {
      setLichtungen(pickRandom(data || [], 9))
    }).catch(() => {})

    api.getEvents().then((data: any[]) => {
      const real = (data || []).filter(e => e.title)
      const now = Date.now()
      const future = real.filter(e => !e.start_time || new Date(e.start_time).getTime() > now - 24 * 3600 * 1000)
      if (future.length >= 3) {
        setEvents(pickRandom(future, 9))
      } else {
        setEvents([...future, ...PLACEHOLDER_EVENTS].slice(0, 9))
      }
    }).catch(() => {
      setEvents(PLACEHOLDER_EVENTS)
    })
  }, [])

  const openOnMap = (type: 'light' | 'lichtung' | 'event', id: string, isPlaceholder?: boolean) => {
    if (isPlaceholder) {
      navigate('/app')
      return
    }
    navigate(`/app?${type}=${id}`)
  }

  // Karussell-Item-Breite: 3 sichtbar auf Desktop, 1 Karte mit Peek auf Mobile
  const itemStyle: React.CSSProperties = {
    flex: '0 0 calc((100% - 2 * 12px) / 3)',
    scrollSnapAlign: 'start',
    background: '#fff',
    border: '1px solid rgba(10,10,10,0.05)',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.2s',
  }

  return (
    <section id="stimmen" className="py-20 section-reveal" style={{ background: '#FAFAF8' }}>
      {/* Scrollbar-Hider fuer alle Browser */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) {
          .carousel-item { flex: 0 0 85% !important; }
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Minimal-Titel */}
        <div className="text-center mb-10">
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.68rem',
              fontWeight: 500,
              color: 'rgba(10,10,10,0.4)',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
            }}
          >
            Stimmen von der Karte
          </p>
        </div>

        {/* ─── Menschen (Lichter) ─── */}
        <Carousel title="Menschen" icon={Sparkles} accentColor="#D4A843" itemCount={lights.length}>
          {lights.map(l => (
            <div
              key={l.id}
              className="carousel-item"
              onClick={() => openOnMap('light', l.id)}
              style={{ ...itemStyle, padding: 14 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div className="flex gap-2.5 items-start">
                {l.image_path ? (
                  <img
                    src={l.image_path}
                    alt=""
                    style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1.5px solid rgba(212,168,67,0.3)' }}
                  />
                ) : (
                  <div
                    style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: 'rgba(212,168,67,0.08)',
                      border: '1.5px solid rgba(212,168,67,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.9rem', color: '#D4A843' }}>
                      {l.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.92rem', fontWeight: 500, color: '#0A0A0A', marginBottom: 2, lineHeight: 1.2 }}>
                    {l.name}
                  </h4>
                  {l.statement && (
                    <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.78rem', fontStyle: 'italic', lineHeight: 1.4, color: 'rgba(10,10,10,0.55)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      „{l.statement}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Carousel>

        {/* ─── Orte (Lichtungen) ─── */}
        <Carousel title="Orte" icon={Trees} accentColor="#7BAE5E" itemCount={lichtungen.length}>
          {lichtungen.map(l => (
            <div
              key={l.id}
              className="carousel-item"
              onClick={() => openOnMap('lichtung', l.id)}
              style={{ ...itemStyle, overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {l.image_path ? (
                <div
                  style={{
                    height: 80,
                    backgroundImage: `url(${l.image_path})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              ) : (
                <div style={{ height: 80, background: 'rgba(123,174,94,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trees size={22} style={{ color: 'rgba(123,174,94,0.4)' }} />
                </div>
              )}
              <div style={{ padding: 12 }}>
                <h4 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.92rem', fontWeight: 500, color: '#0A0A0A', marginBottom: 2, lineHeight: 1.2 }}>
                  {l.name}
                </h4>
                {l.description && (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', lineHeight: 1.4, color: 'rgba(10,10,10,0.5)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {l.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </Carousel>

        {/* ─── Veranstaltungen ─── */}
        <Carousel title="Veranstaltungen" icon={CalendarDays} accentColor="#5078C8" itemCount={events.length}>
          {events.map(ev => (
            <div
              key={ev.id}
              className="carousel-item"
              onClick={() => openOnMap('event', ev.id, ev.is_placeholder)}
              style={{ ...itemStyle, padding: 12 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                {ev.is_global ? (
                  <Globe size={10} style={{ color: '#5078C8' }} />
                ) : ev.type === 'meditation' || ev.type === 'stille' ? (
                  <Moon size={10} style={{ color: '#5078C8' }} />
                ) : (
                  <CalendarDays size={10} style={{ color: '#5078C8' }} />
                )}
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 500, color: '#5078C8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {ev.is_global ? 'Global' : ev.type || 'Event'}
                </span>
                {ev.is_placeholder && (
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.55rem', color: 'rgba(10,10,10,0.3)', marginLeft: 'auto' }}>
                    geplant
                  </span>
                )}
              </div>
              <h4 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.92rem', fontWeight: 500, color: '#0A0A0A', marginBottom: 2, lineHeight: 1.25, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                {ev.title}
              </h4>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: 'rgba(10,10,10,0.45)', marginBottom: 4 }}>
                {formatDate(ev.start_time)}
              </p>
              {ev.description && (
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.74rem', fontStyle: 'italic', lineHeight: 1.4, color: 'rgba(10,10,10,0.55)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                  {ev.description}
                </p>
              )}
            </div>
          ))}
        </Carousel>

      </div>
    </section>
  )
}
