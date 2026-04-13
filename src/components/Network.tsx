import { Handshake, Shield, Network as NetworkIcon } from 'lucide-react'

const POINTS = [
  { icon: Handshake, title: 'Lokale Kreise', text: 'Menschen in deiner Naehe, die fuereinander da sind. Gegenseitige Hilfe, echte Begegnung.' },
  { icon: Shield, title: 'Vertrauen', text: 'Ein Netz, in dem Vertrauen von Mensch zu Mensch waechst. Ohne Konzerne, ohne Algorithmen.' },
  { icon: NetworkIcon, title: 'Dezentral', text: 'Die Infrastruktur gehoert den Menschen. Kein Konzern kann abschalten, was uns verbindet.' },
]

export default function Network() {
  return (
    <section id="netzwerk" className="py-24 section-reveal" style={{ background: '#FAFAF8' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
              fontWeight: 400,
              color: '#0A0A0A',
              marginBottom: '0.8rem',
            }}
          >
            Von der Karte ins Leben
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              color: 'rgba(10,10,10,0.5)',
              maxWidth: '500px',
              margin: '0 auto',
            }}
          >
            Die Friedenskarte macht sichtbar. Das Real Life Network macht greifbar.
            Menschen, die sich hier finden, begegnen sich im wirklichen Leben.
          </p>
        </div>

        <div
          className="rounded-xl p-8 md:p-10"
          style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {POINTS.map((point, i) => (
              <div key={i} className="text-center">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(80,120,200,0.08)' }}
                >
                  <point.icon size={20} style={{ color: '#5078C8' }} />
                </div>
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: '#0A0A0A', marginBottom: '0.4rem' }}>
                  {point.title}
                </h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', lineHeight: 1.6, color: 'rgba(10,10,10,0.5)' }}>
                  {point.text}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/real-life-network/rln"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500,
                color: '#5078C8', textDecoration: 'none', padding: '10px 20px',
                border: '1px solid rgba(80,120,200,0.2)', borderRadius: '8px',
              }}
            >
              Real Life Network
            </a>
            <a
              href="https://web-of-trust.de"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500,
                color: 'rgba(10,10,10,0.5)', textDecoration: 'none', padding: '10px 20px',
                border: '1px solid rgba(10,10,10,0.1)', borderRadius: '8px',
              }}
            >
              Web of Trust
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
