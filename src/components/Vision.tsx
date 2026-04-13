import { Heart, Sun, Users } from 'lucide-react'

const PILLARS = [
  {
    icon: Heart,
    title: 'Aus dem Herzen',
    text: 'Frieden entsteht, wenn Menschen ihr Herz oeffnen und sich verbinden. Jedes Licht auf der Karte ist ein Mensch, der das tut.',
  },
  {
    icon: Sun,
    title: 'In der Stille',
    text: 'Meditation, Gebet, Gesang, Tanz. Gemeinsames Innehalten — zur gleichen Zeit, ueberall auf der Welt. Ein Puls, der die Erde umspannt.',
  },
  {
    icon: Users,
    title: 'Miteinander',
    text: 'Alle Voelker, alle Kulturen, alle Religionen. Menschen begegnen sich vor Ort, helfen einander, stehen fuereinander ein.',
  },
]

export default function Vision() {
  return (
    <section id="vision" className="py-24 section-reveal" style={{ background: '#FAFAF8' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
              fontWeight: 400,
              color: '#0A0A0A',
              marginBottom: '1rem',
            }}
          >
            Frieden beginnt in deinem Herzen
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'rgba(10,10,10,0.55)',
              maxWidth: '560px',
              margin: '0 auto',
            }}
          >
            Ueberall auf der Welt sehnen sich Menschen nach Frieden.
            Wir geben dieser Sehnsucht eine Form — eine Karte, auf der jedes Licht
            ein Mensch ist, der fuer den Frieden steht.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PILLARS.map((pillar, i) => (
            <div
              key={i}
              className="p-6 rounded-xl"
              style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: 'rgba(212,168,67,0.08)' }}
              >
                <pillar.icon size={20} style={{ color: '#D4A843' }} />
              </div>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#0A0A0A', marginBottom: '0.5rem' }}>
                {pillar.title}
              </h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', lineHeight: 1.65, color: 'rgba(10,10,10,0.5)' }}>
                {pillar.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
