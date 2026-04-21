import { Sparkles, Trees, Heart, ExternalLink } from 'lucide-react'

// Open Collective Kategorien — jede Karte kann spaeter ihre eigene OC-Seite bekommen
const KATEGORIEN = [
  {
    icon: Sparkles,
    title: 'Die Bewegung',
    text: 'Trage die Infrastruktur, damit die Lichtung waechst und leuchtet.',
    url: 'https://opencollective.com/lichtung',
    color: '#D4A843',
  },
  {
    icon: Trees,
    title: 'Orte fuer den Frieden',
    text: 'Unterstuetze Lichtungen — Plaetze, an denen Menschen zusammenkommen.',
    url: 'https://opencollective.com/lichtung-orte',
    color: '#7BAE5E',
  },
  {
    icon: Heart,
    title: 'Projekte fuer den Frieden',
    text: 'Foerdere Friedensprojekte, die Menschen auf der Karte starten.',
    url: 'https://opencollective.com/lichtung-projekte',
    color: '#C07090',
  },
]

export default function Support() {
  return (
    <section id="unterstuetzen" className="py-24 section-reveal" style={{ background: '#fff' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

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
            Unterstuetzen
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)',
              fontWeight: 400,
              color: '#0A0A0A',
              marginBottom: '0.8rem',
            }}
          >
            Waehle, was du staerken willst.
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.92rem',
              lineHeight: 1.7,
              color: 'rgba(10,10,10,0.5)',
              maxWidth: '520px',
              margin: '0 auto',
            }}
          >
            Transparent ueber Open Collective. Jeder Beitrag — ob ein Euro oder hundert —
            fliesst sichtbar dorthin, wo du ihn hintraegst.
          </p>
        </div>

        {/* Drei Karten */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {KATEGORIEN.map((k, i) => (
            <a
              key={i}
              href={k.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-7 rounded-xl transition-all"
              style={{
                background: '#FAFAF8',
                border: '1px solid rgba(10,10,10,0.05)',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fff'}
              onMouseLeave={e => e.currentTarget.style.background = '#FAFAF8'}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `${k.color}14` }}
              >
                <k.icon size={20} style={{ color: k.color }} />
              </div>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '1.2rem',
                  fontWeight: 500,
                  color: '#0A0A0A',
                  marginBottom: '0.6rem',
                }}
              >
                {k.title}
              </h3>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.82rem',
                  lineHeight: 1.6,
                  color: 'rgba(10,10,10,0.55)',
                  marginBottom: '1rem',
                  flexGrow: 1,
                }}
              >
                {k.text}
              </p>
              <div
                className="flex items-center gap-1.5"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  color: k.color,
                }}
              >
                Open Collective
                <ExternalLink size={12} />
              </div>
            </a>
          ))}
        </div>

        {/* Bezug zum Real Life Network — kleiner Verweis */}
        <div
          className="text-center mt-10 pt-10"
          style={{ borderTop: '1px solid rgba(10,10,10,0.05)' }}
        >
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(10,10,10,0.5)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
            Die Lichtung wurzelt im <strong>Real Life Network</strong> — dem gemeinsamen Fundament fuer echtes Begegnen.
            Vertrauen entsteht ueber das <strong>Web of Trust</strong>.
          </p>
          <div className="flex items-center justify-center gap-5 mt-4">
            <a
              href="https://real-life-stack.de"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(10,10,10,0.5)', textDecoration: 'underline', textUnderlineOffset: '3px', textDecorationColor: 'rgba(10,10,10,0.15)' }}
            >
              Real Life Stack
            </a>
            <a
              href="https://web-of-trust.de"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(10,10,10,0.5)', textDecoration: 'underline', textUnderlineOffset: '3px', textDecorationColor: 'rgba(10,10,10,0.15)' }}
            >
              Web of Trust
            </a>
          </div>
        </div>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: 'rgba(10,10,10,0.3)', textAlign: 'center', marginTop: '2rem' }}>
          Gemeinnuetzig &middot; Steuerlich absetzbar &middot; Kollektiv Lichtung e.V.
        </p>
      </div>
    </section>
  )
}
