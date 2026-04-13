import { Sparkles, Share2, Radio } from 'lucide-react'

const STEPS = [
  {
    icon: Sparkles,
    num: '1',
    title: 'Setze dein Licht',
    text: 'Oeffne die App, waehle deinen Ort und schreibe dein Friedens-Statement — ein Satz, ein Gedicht, was aus deinem Herzen kommt.',
  },
  {
    icon: Share2,
    num: '2',
    title: 'Teile die Flamme',
    text: 'Dein QR-Code verbindet dich mit anderen. Jeder Mensch, den du einlaedst, traegt dein Licht weiter. So waechst das Netzwerk.',
  },
  {
    icon: Radio,
    num: '3',
    title: 'Meditiere mit uns',
    text: 'Bei Vollmond, Neumond, zu besonderen Zeiten: ein gemeinsamer Puls um die Welt. Du erhaeltst eine Nachricht und haeltst inne.',
  },
]

export default function HowItWorks() {
  return (
    <section id="so-gehts" className="py-24 section-reveal" style={{ background: '#FAFAF8' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
            fontWeight: 400,
            color: '#0A0A0A',
            marginBottom: '0.6rem',
          }}
        >
          So einfach geht es
        </h2>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(10,10,10,0.5)',
            marginBottom: '3rem',
          }}
        >
          Drei Schritte. Kein Haken im Kleingedruckten.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={i} className="text-center">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(212,168,67,0.08)' }}
              >
                <step.icon size={22} style={{ color: '#D4A843' }} />
              </div>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#0A0A0A', marginBottom: '0.5rem' }}>
                {step.title}
              </h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', lineHeight: 1.65, color: 'rgba(10,10,10,0.5)' }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
