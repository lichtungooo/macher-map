import { Heart, Trees, Sparkles, Users } from 'lucide-react'

const SAEULEN = [
  {
    icon: Heart,
    title: 'Verbindungskunst',
    text: 'Die Lichtung ist ein Kunstprojekt. Tanz, Meditation, Stille, Gesang — wir potenzieren Energie durch gemeinsames Tun. Wilhelm Reich hat es Orgon genannt. Wir nennen es Verbindung.',
  },
  {
    icon: Trees,
    title: 'Orte fuer den Frieden',
    text: 'Lichtungen sind physische Raeume, an denen sich Menschen treffen. Im Wald, am See, in der Stadt. Ueberall dort, wo Herzen sich oeffnen duerfen.',
  },
  {
    icon: Sparkles,
    title: 'Projekte fuer den Frieden',
    text: 'Menschen starten Friedensprojekte auf der Karte und sammeln Unterstuetzung. Jedes Projekt ist ein Same fuer die neue Welt, die wir gemeinsam traeumen.',
  },
  {
    icon: Users,
    title: 'Gemeinsam',
    text: 'Kein Einzelkaempfer. Kein Guru. Nur Menschen, die sich begegnen, einander staerken und gemeinsam ein Feld tragen — getragen vom Kollektiv Lichtung e.V.',
  },
]

export default function Kunstprojekt() {
  return (
    <section id="kunst" className="py-28 section-reveal" style={{ background: '#FAFAF8' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Titel */}
        <div className="text-center mb-20">
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.72rem',
              fontWeight: 500,
              color: '#D4A843',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Ein Kunstprojekt
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 400,
              color: '#0A0A0A',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            Liebe ist die Kunst des Lebens.
          </h2>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
              fontStyle: 'italic',
              color: 'rgba(10,10,10,0.45)',
              marginTop: '0.8rem',
              maxWidth: '540px',
              margin: '0.8rem auto 0',
              lineHeight: 1.6,
            }}
          >
            Verbindungskunst in einer Welt, die Verbindung vergessen hat.
          </p>
        </div>

        {/* Saeulen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SAEULEN.map((s, i) => (
            <div
              key={i}
              className="p-7 rounded-xl"
              style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.05)' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: 'rgba(212,168,67,0.08)' }}
              >
                <s.icon size={20} style={{ color: '#D4A843' }} />
              </div>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '1.25rem',
                  fontWeight: 500,
                  color: '#0A0A0A',
                  marginBottom: '0.6rem',
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.88rem',
                  lineHeight: 1.7,
                  color: 'rgba(10,10,10,0.55)',
                }}
              >
                {s.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
