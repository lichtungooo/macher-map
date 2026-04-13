import { CalendarDays, Globe, MapPin, Moon } from 'lucide-react'

const EVENTS = [
  {
    icon: Moon,
    title: 'Vollmond-Meditation',
    date: 'Jeden Vollmond, 21:00 Uhr Ortszeit',
    badge: 'Global',
    text: 'Gemeinsames Innehalten. Eine Welle der Stille, die mit dem Mond um die Erde wandert.',
  },
  {
    icon: Globe,
    title: 'Globaler Friedenspuls',
    date: 'Jeden Sonntag, 12:00 UTC',
    badge: 'Global',
    text: 'Zur gleichen Sekunde, ueberall auf der Welt: ein Moment des Friedens. Ein gemeinsamer Herzschlag.',
  },
  {
    icon: MapPin,
    title: 'Friedenskreise vor Ort',
    date: 'Laufend, in deiner Naehe',
    badge: 'Lokal',
    text: 'Menschen treffen sich in ihrer Stadt. Meditieren, singen, tanzen, feiern. Gemeinsam.',
  },
]

export default function Calendar() {
  return (
    <section id="kalender" className="py-24 section-reveal" style={{ background: '#fff' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Gemeinsam im Rhythmus
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              color: 'rgba(10,10,10,0.5)',
              maxWidth: '460px',
              margin: '0 auto',
            }}
          >
            Globale Meditationen und lokale Begegnungen.
            Jeder Mensch kann Veranstaltungen erstellen und teilnehmen.
          </p>
        </div>

        <div className="space-y-4">
          {EVENTS.map((event, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-5 rounded-xl"
              style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(212,168,67,0.08)' }}
              >
                <event.icon size={20} style={{ color: '#D4A843' }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: '#0A0A0A', margin: 0 }}>
                    {event.title}
                  </h3>
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, color: '#D4A843', background: 'rgba(212,168,67,0.08)' }}
                  >
                    {event.badge}
                  </span>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#D4A843', margin: '0 0 4px' }}>
                  {event.date}
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', lineHeight: 1.6, color: 'rgba(10,10,10,0.5)', margin: 0 }}>
                  {event.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#"
            className="inline-flex items-center gap-2"
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500,
              color: '#0A0A0A', textDecoration: 'none', padding: '10px 20px',
              border: '1px solid rgba(10,10,10,0.15)', borderRadius: '8px',
            }}
          >
            <CalendarDays size={16} />
            Kalender abonnieren
          </a>
        </div>
      </div>
    </section>
  )
}
