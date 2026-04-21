import { useState, useEffect } from 'react'
import { Trees, Calendar, HeartHandshake, Users, X } from 'lucide-react'

interface Saeule {
  key: string
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  title: string
  teaser: string
  color: string
  detail: React.ReactNode
}

const SAEULEN: Saeule[] = [
  {
    key: 'orte',
    icon: Trees,
    title: 'Orte',
    teaser: 'Lichtungen — physische Raeume, an denen Herzen sich begegnen.',
    color: '#7BAE5E',
    detail: (
      <>
        <p>
          Eine <strong>Lichtung</strong> ist ein realer Ort — im Wald, am See, auf einer Wiese, in der Stadt.
          Menschen markieren solche Plaetze auf der Karte und oeffnen sie fuer andere.
        </p>
        <p>
          An einer Lichtung begegnen sich Menschen, um zu meditieren, zu singen, zu tanzen, zu schweigen,
          Feuer zu machen, zu feiern oder einfach nur da zu sein.
        </p>
        <p>
          Jede Lichtung hat ihre Hueter, ihre Mitglieder, ihre eigene Geschichte.
          Alle sind eingeladen, eigene Lichtungen zu oeffnen.
        </p>
      </>
    ),
  },
  {
    key: 'projekte',
    icon: HeartHandshake,
    title: 'Projekte',
    teaser: 'Friedensprojekte fuer die Heilung von Mutter Erde.',
    color: '#C07090',
    detail: (
      <>
        <p>
          Jeder Mensch darf ein <strong>Friedensprojekt</strong> starten —
          ein konkretes Vorhaben fuer die Heilung der Erde, fuer die Begegnung der Kulturen,
          fuer die Befreiung des Herzens.
        </p>
        <p>
          Projekte werden auf der Karte sichtbar. Sie koennen Unterstuetzung erhalten —
          in Form von Spenden, von Zeit, von Verbindung.
        </p>
        <p>
          Ueber das <em>Kollektiv Lichtung e.V.</em> fliessen Spenden transparent und
          gemeinnuetzig in die Projekte, die den Menschen am Herzen liegen.
        </p>
      </>
    ),
  },
  {
    key: 'veranstaltungen',
    icon: Calendar,
    title: 'Veranstaltungen',
    teaser: 'Im Kleinen und im Grossen — bis die Welle um die Erde laeuft.',
    color: '#5078C8',
    detail: (
      <>
        <p>
          Es gibt <strong>kleine Veranstaltungen</strong> — ein Feuerabend, eine stille Stunde, ein Singkreis im Wohnzimmer.
          Und es gibt <strong>grosse Wellen</strong>, die ueber die ganze Erde gehen.
        </p>
        <p>
          Zu Vollmond, zu Neumond, zu besonderen Zeiten: ein gemeinsamer Puls, zur gleichen Stunde, ueberall.
          Aus vielen kleinen Lichtern wird eine Welle, die den Planeten umspannt.
        </p>
        <p>
          Jeder kann Veranstaltungen erstellen — wiederkehrend oder einmalig, oeffentlich oder fuer seinen Kreis.
        </p>
      </>
    ),
  },
  {
    key: 'gemeinschaft',
    icon: Users,
    title: 'Gemeinschaft',
    teaser: 'Jeder Mensch ist ein Kuenstler. (Joseph Beuys)',
    color: '#D4A843',
    detail: (
      <>
        <p>
          <em>Jeder Mensch ist ein Kuenstler.</em>
          Das wusste schon Joseph Beuys. Er meinte es nicht als Metapher,
          sondern als Wahrheit ueber uns alle.
        </p>
        <p>
          Die Kunst, von der wir sprechen, ist die <strong>Kunst der Heilung</strong>, die Kunst des Friedens,
          der Freiheit, der Freude, der Liebe, der Gleichheit.
          Sie entsteht dort, wo Menschen sich wirklich begegnen.
        </p>
        <p>
          Die Gemeinschaft traegt alles andere — die Orte, die Projekte, die Veranstaltungen.
          Ohne Gemeinschaft gibt es keine Lichtung.
          Mit ihr wird aus einem einzelnen Licht ein Geflecht um die Welt.
        </p>
      </>
    ),
  },
]

function DetailDialog({ saeule, onClose }: { saeule: Saeule; onClose: () => void }) {
  // ESC schliesst
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,10,10,0.35)', backdropFilter: 'blur(8px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
      >
        <button
          onClick={onClose}
          aria-label="Schliessen"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(10,10,10,0.04)', border: 'none', cursor: 'pointer' }}
        >
          <X size={15} style={{ color: 'rgba(10,10,10,0.6)' }} />
        </button>

        <div className="p-8 md:p-10">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
            style={{ background: `${saeule.color}14` }}
          >
            <saeule.icon size={22} style={{ color: saeule.color }} />
          </div>

          <h3
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '1.8rem',
              fontWeight: 500,
              color: '#0A0A0A',
              marginBottom: '1.2rem',
              letterSpacing: '-0.01em',
            }}
          >
            {saeule.title}
          </h3>

          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.92rem',
              lineHeight: 1.75,
              color: 'rgba(10,10,10,0.65)',
            }}
            className="space-y-4"
          >
            {saeule.detail}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Kunstprojekt() {
  const [open, setOpen] = useState<Saeule | null>(null)

  return (
    <section id="kunst" className="py-28 section-reveal" style={{ background: '#FAFAF8' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Titel + Text */}
        <div className="text-center mb-16">
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 400,
              color: '#0A0A0A',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              marginBottom: '1.8rem',
            }}
          >
            Liebe ist die Kunst des Lebens.
          </h2>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
              lineHeight: 1.65,
              color: 'rgba(10,10,10,0.55)',
              fontStyle: 'italic',
              maxWidth: 680,
              margin: '0 auto',
            }}
          >
            Wir gestalten eine digitale Friedenskette aus den Herzen der Menschen,
            erschaffen Orte der Begegnung, Veranstaltungen der Freude und
            unterstuetzen uns bei Gemeinschaftsprojekten,
            die es braucht fuer die Heilung von Mutter Erde.
          </p>
        </div>

        {/* Saeulen */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SAEULEN.map(s => (
            <button
              key={s.key}
              onClick={() => setOpen(s)}
              className="group p-6 rounded-xl text-left transition-all"
              style={{
                background: '#fff',
                border: '1px solid rgba(10,10,10,0.05)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.06)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `${s.color}14` }}
              >
                <s.icon size={17} style={{ color: s.color }} />
              </div>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '1.2rem',
                  fontWeight: 500,
                  color: '#0A0A0A',
                  marginBottom: '0.5rem',
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.8rem',
                  lineHeight: 1.55,
                  color: 'rgba(10,10,10,0.55)',
                  flexGrow: 1,
                }}
              >
                {s.teaser}
              </p>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.68rem',
                  fontWeight: 500,
                  color: s.color,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginTop: 14,
                }}
              >
                Mehr
              </span>
            </button>
          ))}
        </div>

      </div>

      {open && <DetailDialog saeule={open} onClose={() => setOpen(null)} />}
    </section>
  )
}
