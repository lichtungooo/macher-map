import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wrench, Hammer, Calendar, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'

interface CardItem {
  id: string
  title: string
  subtitle: string
  tag?: string
}

function seed(i: number) {
  let x = Math.sin(i * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

const MACHER: CardItem[] = [
  { id: 'm1', title: 'Max der Schweisser', subtitle: 'Schweissen · Metall · Level 8', tag: 'Schweissergilde' },
  { id: 'm2', title: 'Lena Holzwurm', subtitle: 'Holzbau · Schreinerei · Level 12', tag: 'Holzgilde' },
  { id: 'm3', title: 'Basti Schrauber', subtitle: 'KFZ · Fahrrad · Level 5', tag: 'Schrauber' },
  { id: 'm4', title: 'Finja Funkenflug', subtitle: 'Elektro · Loeten · Level 7', tag: 'Technikerin' },
  { id: 'm5', title: 'Jonas Zimmermann', subtitle: 'Trockenbau · Holz · Level 15', tag: 'Meister' },
  { id: 'm6', title: 'Mila Saegemehl', subtitle: '3D-Druck · CNC · Level 6', tag: 'Makerin' },
  { id: 'm7', title: 'Tom Kabelkoenig', subtitle: 'Smart Home · Arduino · Level 9', tag: 'IoT-Macher' },
  { id: 'm8', title: 'Hanna Leimfest', subtitle: 'Moebelbau · Upcycling · Level 11', tag: 'Holzgilde' },
  { id: 'm9', title: 'Nico Dreher', subtitle: 'Drechseln · Toepfern · Level 4', tag: 'Handwerker' },
]

const WERKSTAETTEN: CardItem[] = [
  { id: 'w1', title: 'FabLab Berlin', subtitle: 'Kreuzberg · 3D-Drucker · Laser · CNC', tag: 'Offen' },
  { id: 'w2', title: 'Offene Werkstatt Muenchen', subtitle: 'Schwabing · Holz · Metall · Textil', tag: 'Offen' },
  { id: 'w3', title: 'Makerspace Koeln', subtitle: 'Ehrenfeld · Elektronik · Robotik', tag: 'Offen' },
  { id: 'w4', title: 'HolzWerk Hamburg', subtitle: 'Altona · Schreinerei · Drechseln', tag: 'Werkstatt' },
  { id: 'w5', title: 'MetallWerk Leipzig', subtitle: 'Plagwitz · Schweissen · Schmieden', tag: 'Werkstatt' },
  { id: 'w6', title: 'Garage Nuernberg', subtitle: 'Gostenhof · KFZ · Moebel', tag: 'Garage' },
  { id: 'w7', title: 'TechHub Frankfurt', subtitle: 'Bornheim · IoT · Arduino · Loeten', tag: 'Lab' },
  { id: 'w8', title: 'BauWerk Dresden', subtitle: 'Neustadt · Holzbau · Trockenbau', tag: 'Werkstatt' },
  { id: 'w9', title: 'Kreativlabor Stuttgart', subtitle: 'West · Siebdruck · Laser · Naehen', tag: 'Lab' },
]

const ABENTEUER: CardItem[] = [
  { id: 'a1', title: 'Seifenkistenrennen', subtitle: '6. Aug · Ferropolis · Macher-Festival', tag: 'Festival' },
  { id: 'a2', title: 'Baumhaus-Wochenende', subtitle: '12. Jul · Schwarzwald · 2 Tage', tag: 'Bauprojekt' },
  { id: 'a3', title: 'Messerbau-Workshop', subtitle: '23. Mai · Hamburg · Schmieden + Schleifen', tag: 'Workshop' },
  { id: 'a4', title: 'Schweissen fuer Anfaenger', subtitle: '8. Jun · Berlin · MIG/MAG Grundkurs', tag: 'Kurs' },
  { id: 'a5', title: 'Festival-Buehne bauen', subtitle: '1. Aug · Ferropolis · 3 Tage Bau-Action', tag: 'Festival' },
  { id: 'a6', title: 'Moebel aus Paletten', subtitle: '15. Jun · Koeln · Upcycling-Workshop', tag: 'Workshop' },
  { id: 'a7', title: 'Schmieden fuer Kids', subtitle: '20. Jul · Nuernberg · ab 10 Jahre', tag: 'Kids' },
  { id: 'a8', title: 'Floss bauen & fahren', subtitle: '28. Jun · Leipzig · Bau + Fahrt', tag: 'Abenteuer' },
  { id: 'a9', title: 'Longboard selber bauen', subtitle: '5. Jul · Muenchen · Holz + Shape', tag: 'Workshop' },
]

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
  const initialized = useRef(false)

  const getCardWidth = () => {
    const el = scrollRef.current
    if (!el) return 0
    const firstItem = el.querySelector(':scope > *') as HTMLElement | null
    if (!firstItem) return 0
    return firstItem.getBoundingClientRect().width + 12
  }

  useEffect(() => {
    if (initialized.current || itemCount === 0) return
    const el = scrollRef.current
    if (!el) return
    const timer = setTimeout(() => {
      const cardWidth = getCardWidth()
      if (cardWidth > 0) {
        el.scrollLeft = cardWidth * itemCount
        initialized.current = true
      }
    }, 50)
    return () => clearTimeout(timer)
  }, [itemCount])

  const rebalance = () => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = getCardWidth()
    if (cardWidth === 0) return
    const oneSet = cardWidth * itemCount
    const current = el.scrollLeft
    if (current < oneSet * 0.5) el.scrollLeft = current + oneSet
    else if (current > oneSet * 2.5) el.scrollLeft = current - oneSet
  }

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = getCardWidth()
    if (cardWidth === 0) return
    el.scrollBy({ left: dir === 'right' ? cardWidth : -cardWidth, behavior: 'smooth' })
    setTimeout(rebalance, 450)
  }

  if (itemCount === 0) return null

  return (
    <div className="mb-8 last:mb-0">
      <div className="flex items-center justify-center gap-3 mb-3">
        <button
          onClick={() => scroll('left')}
          aria-label="Zurueck"
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(232,117,26,0.08)', border: '1px solid rgba(232,117,26,0.15)', cursor: 'pointer' }}
        >
          <ChevronLeft size={14} style={{ color: '#E8751A' }} />
        </button>
        <div className="flex items-center gap-2" style={{ minWidth: 160, justifyContent: 'center' }}>
          <Icon size={14} style={{ color: accentColor }} />
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.75rem', fontWeight: 700, color: accentColor, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {title}
          </h3>
        </div>
        <button
          onClick={() => scroll('right')}
          aria-label="Weiter"
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(232,117,26,0.08)', border: '1px solid rgba(232,117,26,0.15)', cursor: 'pointer' }}
        >
          <ChevronRight size={14} style={{ color: '#E8751A' }} />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
    </div>
  )
}

export default function LiveFeed() {
  const navigate = useNavigate()

  const itemStyle: React.CSSProperties = {
    flex: '0 0 calc((100% - 2 * 12px) / 3)',
    scrollSnapAlign: 'start',
    background: '#fff',
    border: '1px solid rgba(26,26,26,0.06)',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.2s',
  }

  const hoverIn = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(-2px)'
    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'
  }
  const hoverOut = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(0)'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <section id="community" className="py-20 section-reveal" style={{ background: '#fff' }}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) {
          .carousel-item { flex: 0 0 85% !important; }
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            fontWeight: 800,
            color: '#1A1A1A',
            letterSpacing: '-0.02em',
            marginBottom: '0.5rem',
          }}>
            Was gerade abgeht
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.85rem',
            color: 'rgba(26,26,26,0.45)',
          }}>
            Macher, Werkstaetten und Abenteuer — live von der Karte.
          </p>
        </div>

        <Carousel title="Macher" icon={Hammer} accentColor="#E8751A" itemCount={MACHER.length}>
          {[...MACHER, ...MACHER, ...MACHER].map((m, i) => (
            <div
              key={`${m.id}-${Math.floor(i / MACHER.length)}`}
              className="carousel-item"
              onClick={() => navigate('/app')}
              style={{ ...itemStyle, padding: 14 }}
              onMouseEnter={hoverIn}
              onMouseLeave={hoverOut}
            >
              <div className="flex gap-3 items-center">
                <div
                  style={{
                    width: 38, height: 38, borderRadius: '10px',
                    background: `hsl(${seed(i * 7) * 40 + 15}, 60%, 50%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                    {m.title.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2 }}>
                      {m.title}
                    </h4>
                    {m.tag && (
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.55rem', fontWeight: 600, color: '#E8751A', background: 'rgba(232,117,26,0.08)', padding: '1px 6px', borderRadius: 4 }}>
                        {m.tag}
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(26,26,26,0.45)', lineHeight: 1.3 }}>
                    {m.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Carousel>

        <Carousel title="Werkstaetten" icon={Wrench} accentColor="#45B764" itemCount={WERKSTAETTEN.length}>
          {[...WERKSTAETTEN, ...WERKSTAETTEN, ...WERKSTAETTEN].map((w, i) => (
            <div
              key={`${w.id}-${Math.floor(i / WERKSTAETTEN.length)}`}
              className="carousel-item"
              onClick={() => navigate('/app')}
              style={{ ...itemStyle, padding: 14 }}
              onMouseEnter={hoverIn}
              onMouseLeave={hoverOut}
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={11} style={{ color: '#45B764' }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 600, color: '#45B764', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {w.tag}
                </span>
              </div>
              <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, marginBottom: 2 }}>
                {w.title}
              </h4>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(26,26,26,0.45)', lineHeight: 1.4 }}>
                {w.subtitle}
              </p>
            </div>
          ))}
        </Carousel>

        <Carousel title="Abenteuer" icon={Calendar} accentColor="#2D7DD2" itemCount={ABENTEUER.length}>
          {[...ABENTEUER, ...ABENTEUER, ...ABENTEUER].map((a, i) => (
            <div
              key={`${a.id}-${Math.floor(i / ABENTEUER.length)}`}
              className="carousel-item"
              onClick={() => navigate('/app')}
              style={{ ...itemStyle, padding: 14, borderLeft: `3px solid #2D7DD2` }}
              onMouseEnter={hoverIn}
              onMouseLeave={hoverOut}
            >
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={11} style={{ color: '#2D7DD2' }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 600, color: '#2D7DD2', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {a.tag}
                </span>
              </div>
              <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, marginBottom: 2 }}>
                {a.title}
              </h4>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(26,26,26,0.45)' }}>
                {a.subtitle}
              </p>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  )
}
