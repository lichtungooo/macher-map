import { Hammer, Building, Calendar, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const PARTNER = [
  {
    icon: Hammer,
    title: 'Werkstatt eintragen',
    text: 'Du hast eine Werkstatt, ein FabLab, eine Garage? Mach sie sichtbar. Tausende Macher in deiner Region warten drauf.',
    cta: 'Werkstatt eintragen',
    color: '#E8751A',
    link: '/app',
  },
  {
    icon: Building,
    title: 'Sponsor werden',
    text: 'Dein Unternehmen auf der Macher-Map. Bei Events, auf der Karte, im Festival-Programm. Handwerk foerdern, Nachwuchs finden.',
    cta: 'Kontakt aufnehmen',
    color: '#D4A020',
    link: null,
  },
  {
    icon: Calendar,
    title: 'Macher-Festival 2026',
    text: 'Ferropolis, 6.–9. August. Seifenkistenrennen, Bau-Wettbewerbe, Workshops, 10.000qm Werkstatt. Das groesste Macher-Event des Jahres.',
    cta: 'Dabei sein',
    color: '#2D7DD2',
    link: '/app',
  },
]

export default function Support() {
  return (
    <section id="partner" className="py-24 section-reveal" style={{ background: '#1A1A1A' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-14">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#E8751A',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Mitmachen
          </p>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
              fontWeight: 800,
              color: '#fff',
              marginBottom: '0.8rem',
              letterSpacing: '-0.03em',
            }}
          >
            Werde Teil der Bewegung.
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.92rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.45)',
              maxWidth: '520px',
              margin: '0 auto',
            }}
          >
            Werkstaetten, Sponsoren, Handwerksbetriebe — gemeinsam bauen wir
            die groesste Macher-Karte Deutschlands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {PARTNER.map((p, i) => {
            const inner = (
              <>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${p.color}18` }}
                >
                  <p.icon size={22} style={{ color: p.color }} />
                </div>
                <h3
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: '0.6rem',
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.82rem',
                    lineHeight: 1.6,
                    color: 'rgba(255,255,255,0.45)',
                    marginBottom: '1.2rem',
                    flexGrow: 1,
                  }}
                >
                  {p.text}
                </p>
                <span
                  className="flex items-center gap-1.5"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: p.color,
                  }}
                >
                  {p.cta}
                  <ArrowRight size={14} />
                </span>
              </>
            )

            const style: React.CSSProperties = {
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
            }

            return p.link ? (
              <Link
                key={i}
                to={p.link}
                className="group p-7 rounded-xl transition-all"
                style={style}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.borderColor = `${p.color}40`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                }}
              >
                {inner}
              </Link>
            ) : (
              <div
                key={i}
                className="group p-7 rounded-xl transition-all"
                style={style}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.borderColor = `${p.color}40`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                }}
              >
                {inner}
              </div>
            )
          })}
        </div>

        <div
          className="text-center pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
            Die Macher-Map ist ein Projekt des <strong style={{ color: 'rgba(255,255,255,0.55)' }}>Real Life Network</strong> —
            dem Fundament fuer echtes Machen, echte Begegnung, echte Wirkung.
          </p>
        </div>
      </div>
    </section>
  )
}
