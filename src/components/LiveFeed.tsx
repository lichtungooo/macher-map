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
      ' · ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr'
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
        ? 'Weltweite Meditation im Licht des Vollmondes. Jeder, wo er gerade steht.'
        : 'Neubeginn in der Stille. Gemeinsamer Puls um die Erde.',
      start_time: d.toISOString(),
      type: isFullMoon ? 'meditation' : 'stille',
      is_global: true,
      is_placeholder: true,
    })
  }
  return out
})()

// ─── Scroll-Reihe ───

function RowScroller({
  title,
  icon: Icon,
  accentColor,
  children,
  count,
}: {
  title: string
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  accentColor: string
  children: React.ReactNode
  count: number
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const width = scrollRef.current.clientWidth
    scrollRef.current.scrollBy({ left: dir === 'left' ? -width * 0.7 : width * 0.7, behavior: 'smooth' })
  }

  return (
    <div className="mb-14 last:mb-0">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Icon size={15} style={{ color: accentColor }} />
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(10,10,10,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {title}
          </h3>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: 'rgba(10,10,10,0.3)', marginLeft: 4 }}>
            {count}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            aria-label="Zurueck"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.08)', cursor: 'pointer' }}
          >
            <ChevronLeft size={14} style={{ color: 'rgba(10,10,10,0.5)' }} />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Weiter"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.08)', cursor: 'pointer' }}
          >
            <ChevronRight size={14} style={{ color: 'rgba(10,10,10,0.5)' }} />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Fade links/rechts */}
        <div className="absolute left-0 top-0 bottom-0 w-10 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to right, #FAFAF8, transparent)' }}
        />
        <div className="absolute right-0 top-0 bottom-0 w-10 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to left, #FAFAF8, transparent)' }}
        />
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 px-1 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(10,10,10,0.15) transparent' }}
        >
          {children}
        </div>
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
    // Lichter: nur solche mit Name und Statement/Bild zeigen
    api.getLights().then((data: any[]) => {
      const filtered = (data || []).filter(l => l.name && (l.statement || l.image_path))
      setLights(pickRandom(filtered, 9))
    }).catch(() => {})

    api.getLichtungen().then((data: any[]) => {
      setLichtungen(pickRandom(data || [], 9))
    }).catch(() => {})

    api.getEvents().then((data: any[]) => {
      const real = (data || []).filter(e => e.title)
      // Vergangene rausfiltern
      const now = Date.now()
      const future = real.filter(e => !e.start_time || new Date(e.start_time).getTime() > now - 24 * 3600 * 1000)
      if (future.length >= 3) {
        setEvents(pickRandom(future, 9))
      } else {
        // Mix mit Placeholder-Events
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

  // Komplett leer? Dann Sektion ausblenden — zumindest Events gibt es dank Placeholder
  const hasAnything = lights.length > 0 || lichtungen.length > 0 || events.length > 0
  if (!hasAnything) return null

  const cardBase: React.CSSProperties = {
    background: '#fff',
    border: '1px solid rgba(10,10,10,0.05)',
    borderRadius: 12,
    flexShrink: 0,
    scrollSnapAlign: 'start',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textDecoration: 'none',
  }

  return (
    <section id="stimmen" className="py-24 section-reveal" style={{ background: '#FAFAF8' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-14">
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.72rem',
              fontWeight: 500,
              color: '#D4A843',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              marginBottom: '0.8rem',
            }}
          >
            Stimmen von der Karte
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)',
              fontWeight: 400,
              color: '#0A0A0A',
              marginBottom: '0.6rem',
            }}
          >
            Menschen. Orte. Veranstaltungen.
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9rem',
              color: 'rgba(10,10,10,0.5)',
              maxWidth: '520px',
              margin: '0 auto',
            }}
          >
            Klicke auf eine Karte und du landest direkt auf der Weltkarte —
            beim Licht, bei der Lichtung, bei der Veranstaltung.
          </p>
        </div>

        {/* ─── Lichter ─── */}
        {lights.length > 0 && (
          <RowScroller title="Lichter" icon={Sparkles} accentColor="#D4A843" count={lights.length}>
            {lights.map(l => (
              <div
                key={l.id}
                onClick={() => openOnMap('light', l.id)}
                style={{ ...cardBase, width: 280, padding: 20 }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div className="flex gap-3 items-start">
                  {l.image_path ? (
                    <img
                      src={l.image_path}
                      alt=""
                      style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(212,168,67,0.25)' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: 'rgba(212,168,67,0.08)',
                        border: '2px solid rgba(212,168,67,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.1rem', color: '#D4A843' }}>
                        {l.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem', fontWeight: 500, color: '#0A0A0A', marginBottom: '0.3rem' }}>
                      {l.name}
                    </h4>
                    {l.statement && (
                      <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.5, color: 'rgba(10,10,10,0.55)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        „{l.statement}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </RowScroller>
        )}

        {/* ─── Lichtungen ─── */}
        {lichtungen.length > 0 && (
          <RowScroller title="Lichtungen" icon={Trees} accentColor="#7BAE5E" count={lichtungen.length}>
            {lichtungen.map(l => (
              <div
                key={l.id}
                onClick={() => openOnMap('lichtung', l.id)}
                style={{ ...cardBase, width: 260, overflow: 'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                {l.image_path ? (
                  <div
                    style={{
                      height: 120,
                      backgroundImage: `url(${l.image_path})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                ) : (
                  <div className="h-[120px] flex items-center justify-center" style={{ background: 'rgba(123,174,94,0.08)' }}>
                    <Trees size={32} style={{ color: 'rgba(123,174,94,0.45)' }} />
                  </div>
                )}
                <div className="p-4">
                  <h4 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', fontWeight: 500, color: '#0A0A0A', marginBottom: '0.4rem' }}>
                    {l.name}
                  </h4>
                  {l.description && (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', lineHeight: 1.55, color: 'rgba(10,10,10,0.55)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                      {l.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </RowScroller>
        )}

        {/* ─── Veranstaltungen ─── */}
        {events.length > 0 && (
          <RowScroller title="Veranstaltungen" icon={CalendarDays} accentColor="#5078C8" count={events.length}>
            {events.map(ev => (
              <div
                key={ev.id}
                onClick={() => openOnMap('event', ev.id, ev.is_placeholder)}
                style={{ ...cardBase, width: 260, padding: 18 }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {ev.is_global ? (
                    <Globe size={12} style={{ color: '#5078C8' }} />
                  ) : ev.type === 'meditation' || ev.type === 'stille' ? (
                    <Moon size={12} style={{ color: '#5078C8' }} />
                  ) : (
                    <CalendarDays size={12} style={{ color: '#5078C8' }} />
                  )}
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.66rem', fontWeight: 500, color: '#5078C8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {ev.is_global ? 'Global' : ev.type || 'Event'}
                  </span>
                  {ev.is_placeholder && (
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', color: 'rgba(10,10,10,0.3)', marginLeft: 'auto' }}>
                      geplant
                    </span>
                  )}
                </div>
                <h4 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', fontWeight: 500, color: '#0A0A0A', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                  {ev.title}
                </h4>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(10,10,10,0.5)', marginBottom: '0.6rem' }}>
                  {formatDate(ev.start_time)}
                </p>
                {ev.description && (
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.5, color: 'rgba(10,10,10,0.55)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {ev.description}
                  </p>
                )}
              </div>
            ))}
          </RowScroller>
        )}

        {/* CTA */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate('/app')}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'rgba(10,10,10,0.7)',
              padding: '12px 28px',
              border: '1px solid rgba(10,10,10,0.15)',
              borderRadius: '8px',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            Zur Karte
          </button>
        </div>

      </div>
    </section>
  )
}
