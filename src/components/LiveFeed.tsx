import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wrench, Hammer, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface CardItem {
  id: string
  title: string
  subtitle: string
  image?: string
}

function seed(i: number) {
  let x = Math.sin(i * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

const MACHER_NAMES = [
  'Max der Schweisser', 'Lena Holzwurm', 'Basti Schrauber', 'Finja Funkenflug',
  'Jonas Zimmermann', 'Mila Saegemehl', 'Tom Kabelkoenig', 'Hanna Leimfest',
  'Nico Dreher', 'Ella Bohrmaschine', 'Felix Schleifer', 'Paula Nagelprobe',
]

const MACHER_SKILLS = [
  'Holzbau · Schreinerei', 'Schweissen · Metall', 'Elektro · Loeten',
  '3D-Druck · CNC', 'Fahrrad-Schrauben', 'Messerbau', 'Moebelbau',
  'Seifenkisten-Profi', 'Baumhaus-Bauer', 'Keramik · Toepfern',
  'Leder-Handwerk', 'Textil · Naehen',
]

const WERKSTATT_ITEMS: CardItem[] = [
  { id: 'w1', title: 'FabLab Berlin', subtitle: '3D-Drucker · Laser · CNC' },
  { id: 'w2', title: 'Offene Werkstatt Muenchen', subtitle: 'Holz · Metall · Textil' },
  { id: 'w3', title: 'Makerspace Koeln', subtitle: 'Elektronik · Robotik · 3D-Druck' },
  { id: 'w4', title: 'HolzWerk Hamburg', subtitle: 'Schreinerei · Drechseln' },
  { id: 'w5', title: 'MetallWerk Leipzig', subtitle: 'Schweissen · Schmieden · Drehen' },
  { id: 'w6', title: 'Garage Nuernberg', subtitle: 'KFZ · Fahrrad · Moebel' },
  { id: 'w7', title: 'Kreativlabor Stuttgart', subtitle: 'Siebdruck · Laser · Naehen' },
  { id: 'w8', title: 'BauWerk Dresden', subtitle: 'Holzbau · Trockenbau · Mauer' },
  { id: 'w9', title: 'TechHub Frankfurt', subtitle: 'IoT · Arduino · Loeten' },
]

const ABENTEUER_ITEMS: CardItem[] = [
  { id: 'a1', title: 'Seifenkistenrennen Ferropolis', subtitle: '6. Aug 2026 · Ferropolis' },
  { id: 'a2', title: 'Baumhaus-Wochenende', subtitle: '12. Jul 2026 · Schwarzwald' },
  { id: 'a3', title: 'Messerbau-Workshop', subtitle: '23. Mai 2026 · Hamburg' },
  { id: 'a4', title: 'Schweiss-Kurs fuer Anfaenger', subtitle: '8. Jun 2026 · Berlin' },
  { id: 'a5', title: 'Festival-Buehne bauen', subtitle: '1. Aug 2026 · Ferropolis' },
  { id: 'a6', title: 'Moebel aus Paletten', subtitle: '15. Jun 2026 · Koeln' },
  { id: 'a7', title: 'Schmieden fuer Kids', subtitle: '20. Jul 2026 · Nuernberg' },
  { id: 'a8', title: 'Floss bauen & fahren', subtitle: '28. Jun 2026 · Leipzig' },
  { id: 'a9', title: 'Longboard selber bauen', subtitle: '5. Jul 2026 · Muenchen' },
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
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'transparent', border: '1px solid rgba(26,26,26,0.12)', cursor: 'pointer' }}
        >
          <ChevronLeft size={13} style={{ color: 'rgba(26,26,26,0.55)' }} />
        </button>
        <div className="flex items-center gap-1.5" style={{ minWidth: 'calc((100% - 2 * 12px) / 3)', justifyContent: 'center' }}>
          <Icon size={13} style={{ color: accentColor }} />
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(26,26,26,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {title}
          </h3>
        </div>
        <button
          onClick={() => scroll('right')}
          aria-label="Weiter"
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'transparent', border: '1px solid rgba(26,26,26,0.12)', cursor: 'pointer' }}
        >
          <ChevronRight size={13} style={{ color: 'rgba(26,26,26,0.55)' }} />
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

  const macherItems: CardItem[] = MACHER_NAMES.map((name, i) => ({
    id: `m-${i}`,
    title: name,
    subtitle: MACHER_SKILLS[i % MACHER_SKILLS.length],
  }))

  const itemStyle: React.CSSProperties = {
    flex: '0 0 calc((100% - 2 * 12px) / 3)',
    scrollSnapAlign: 'start',
    background: '#fff',
    border: '1px solid rgba(26,26,26,0.05)',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.2s',
  }

  const hoverIn = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(-2px)'
    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.05)'
  }
  const hoverOut = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(0)'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <section id="community" className="py-20 section-reveal" style={{ background: '#FAF8F5' }}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) {
          .carousel-item { flex: 0 0 85% !important; }
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.68rem',
            fontWeight: 500,
            color: 'rgba(26,26,26,0.4)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}>
            Was gerade passiert
          </p>
        </div>

        {/* Macher */}
        <Carousel title="Macher" icon={Hammer} accentColor="#E8751A" itemCount={macherItems.length}>
          {[...macherItems, ...macherItems, ...macherItems].map((m, i) => (
            <div
              key={`${m.id}-${Math.floor(i / macherItems.length)}`}
              className="carousel-item"
              onClick={() => navigate('/app')}
              style={{ ...itemStyle, padding: 14 }}
              onMouseEnter={hoverIn}
              onMouseLeave={hoverOut}
            >
              <div className="flex gap-2.5 items-center">
                <div
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: `hsl(${seed(i * 7) * 360}, 35%, 92%)`,
                    border: '1.5px solid rgba(232,117,26,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#E8751A' }}>
                    {m.title.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.88rem', fontWeight: 600, color: '#1A1A1A', lineHeight: 1.2, marginBottom: 2 }}>
                    {m.title}
                  </h4>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(26,26,26,0.5)', lineHeight: 1.3 }}>
                    {m.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Carousel>

        {/* Werkstaetten */}
        <Carousel title="Werkstaetten" icon={Wrench} accentColor="#45B764" itemCount={WERKSTATT_ITEMS.length}>
          {[...WERKSTATT_ITEMS, ...WERKSTATT_ITEMS, ...WERKSTATT_ITEMS].map((w, i) => (
            <div
              key={`${w.id}-${Math.floor(i / WERKSTATT_ITEMS.length)}`}
              className="carousel-item"
              onClick={() => navigate('/app')}
              style={{ ...itemStyle, overflow: 'hidden' }}
              onMouseEnter={hoverIn}
              onMouseLeave={hoverOut}
            >
              <div style={{ height: 70, background: 'rgba(69,183,100,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wrench size={20} style={{ color: 'rgba(69,183,100,0.35)' }} />
              </div>
              <div style={{ padding: 12 }}>
                <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.88rem', fontWeight: 600, color: '#1A1A1A', lineHeight: 1.2, marginBottom: 2 }}>
                  {w.title}
                </h4>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(26,26,26,0.5)', lineHeight: 1.4 }}>
                  {w.subtitle}
                </p>
              </div>
            </div>
          ))}
        </Carousel>

        {/* Abenteuer */}
        <Carousel title="Abenteuer" icon={Calendar} accentColor="#2D7DD2" itemCount={ABENTEUER_ITEMS.length}>
          {[...ABENTEUER_ITEMS, ...ABENTEUER_ITEMS, ...ABENTEUER_ITEMS].map((a, i) => (
            <div
              key={`${a.id}-${Math.floor(i / ABENTEUER_ITEMS.length)}`}
              className="carousel-item"
              onClick={() => navigate('/app')}
              style={{ ...itemStyle, padding: 12 }}
              onMouseEnter={hoverIn}
              onMouseLeave={hoverOut}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Calendar size={10} style={{ color: '#2D7DD2' }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 500, color: '#2D7DD2', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Abenteuer
                </span>
              </div>
              <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.88rem', fontWeight: 600, color: '#1A1A1A', lineHeight: 1.25, marginBottom: 2 }}>
                {a.title}
              </h4>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: 'rgba(26,26,26,0.45)' }}>
                {a.subtitle}
              </p>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  )
}
