import { Hammer, Building, Megaphone, ExternalLink } from 'lucide-react'

const PARTNER = [
  {
    icon: Hammer,
    title: 'Werkstatt-Partner',
    text: 'Deine Werkstatt auf der Karte. Sichtbar fuer tausende Macher in deiner Region.',
    cta: 'Partner werden',
    color: '#E8751A',
  },
  {
    icon: Building,
    title: 'Sponsoring',
    text: 'Unterstuetze die Macher-Bewegung. Dein Logo auf der Karte, bei Events und im Festival-Programm.',
    cta: 'Sponsoring anfragen',
    color: '#2D7DD2',
  },
  {
    icon: Megaphone,
    title: 'Macher-Festival 2026',
    text: 'Ferropolis, 6.–9. August. Bau-Wettbewerbe, Workshops, Seifenkistenrennen. Sei dabei.',
    cta: 'Mehr erfahren',
    color: '#45B764',
  },
]

export default function Support() {
  return (
    <section id="partner" className="py-24 section-reveal" style={{ background: '#fff' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-14">
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#E8751A',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '0.8rem',
            }}
          >
            Partner & Sponsoring
          </p>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)',
              fontWeight: 700,
              color: '#1A1A1A',
              marginBottom: '0.8rem',
              letterSpacing: '-0.02em',
            }}
          >
            Mach mit. Werde Teil der Bewegung.
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.92rem',
              lineHeight: 1.7,
              color: 'rgba(26,26,26,0.55)',
              maxWidth: '540px',
              margin: '0 auto',
            }}
          >
            Werkstaetten, Sponsoren und Festivals — gemeinsam bauen wir
            die groesste Macher-Karte Deutschlands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {PARTNER.map((p, i) => (
            <div
              key={i}
              className="group p-7 rounded-xl transition-all"
              style={{
                background: '#FAF8F5',
                border: '1px solid rgba(26,26,26,0.05)',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#fff'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#FAF8F5'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `${p.color}14` }}
              >
                <p.icon size={20} style={{ color: p.color }} />
              </div>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: '#1A1A1A',
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
                  color: 'rgba(26,26,26,0.55)',
                  marginBottom: '1rem',
                  flexGrow: 1,
                }}
              >
                {p.text}
              </p>
              <span
                className="flex items-center gap-1.5"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: p.color,
                  cursor: 'pointer',
                }}
              >
                {p.cta}
                <ExternalLink size={12} />
              </span>
            </div>
          ))}
        </div>

        <div
          className="text-center mt-10 pt-10"
          style={{ borderTop: '1px solid rgba(26,26,26,0.05)' }}
        >
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(26,26,26,0.5)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
            Die Macher-Map ist ein Projekt des <strong>Real Life Network</strong> —
            dem Fundament fuer echtes Machen, echte Begegnung, echte Wirkung.
          </p>
          <div className="flex items-center justify-center gap-5 mt-4">
            <a
              href="https://real-life-stack.de"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(26,26,26,0.5)', textDecoration: 'underline', textUnderlineOffset: '3px', textDecorationColor: 'rgba(26,26,26,0.15)' }}
            >
              Real Life Network
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
