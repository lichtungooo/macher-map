import { useState, useEffect } from 'react'
import { Wrench, Calendar, Users, Trophy, X } from 'lucide-react'

interface Feature {
  key: string
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  title: string
  teaser: string
  color: string
  detail: React.ReactNode
}

const FEATURES: Feature[] = [
  {
    key: 'werkstaetten',
    icon: Wrench,
    title: 'Werkstaetten',
    teaser: 'Finde offene Werkstaetten, FabLabs und Macher-Garagen in deiner Naehe.',
    color: '#E8751A',
    detail: (
      <>
        <p>
          Jede <strong>Werkstatt</strong> auf der Macher-Map ist ein realer Ort — eine Schreinerei,
          ein FabLab, eine offene Garage, eine Schlosserei, ein Makerspace.
        </p>
        <p>
          Hier findest du Werkzeuge, Material und Menschen, die wissen, wie man es benutzt.
          Jede Werkstatt zeigt, was sie bietet: CNC-Fraese, Schweissgeraet, 3D-Drucker, Holzwerkstatt.
        </p>
        <p>
          Du kannst eigene Werkstaetten eintragen und sichtbar machen fuer andere Macher.
        </p>
      </>
    ),
  },
  {
    key: 'abenteuer',
    icon: Calendar,
    title: 'Abenteuer',
    teaser: 'Seifenkistenrennen, Bau-Wochenenden, Schweisskurse — echte Action.',
    color: '#2D7DD2',
    detail: (
      <>
        <p>
          <strong>Abenteuer</strong> sind Events, bei denen du selbst Hand anlegst.
          Seifenkistenrennen, Baumhaus-Bau, Messerbau-Workshop, Schweiss-Kurs, Festival-Builds.
        </p>
        <p>
          Jedes Abenteuer findet an einem realen Ort statt und ist auf der Karte sichtbar.
          Melde dich an, bring deine Freunde mit, bau etwas Grossartiges.
        </p>
        <p>
          Nach dem Abenteuer bekommst du Erfahrungspunkte fuer deinen Skill-Tree.
        </p>
      </>
    ),
  },
  {
    key: 'bauprojekte',
    icon: Trophy,
    title: 'Bauprojekte',
    teaser: 'Zeig, was du gebaut hast. Teile Bauplaene. Inspiriere andere.',
    color: '#45B764',
    detail: (
      <>
        <p>
          Dein <strong>Bauprojekt</strong> verdient Sichtbarkeit. Egal ob Seifenkiste, Baumhaus,
          selbstgebautes Moebelstueck oder eine komplette Werkstatt — zeig es der Community.
        </p>
        <p>
          Lade Fotos hoch, beschreibe den Bauprozess, teile Bauplaene.
          Andere Macher koennen kommentieren, Tipps geben oder sich fuer aehnliche Projekte inspirieren lassen.
        </p>
        <p>
          Die besten Projekte werden auf der Karte hervorgehoben.
        </p>
      </>
    ),
  },
  {
    key: 'community',
    icon: Users,
    title: 'Macher-Community',
    teaser: 'Vernetze dich mit Machern in deiner Naehe. Analog. Echt. Ohne Tracking.',
    color: '#9B59B6',
    detail: (
      <>
        <p>
          Die <strong>Macher-Community</strong> lebt nicht im Internet — sie lebt in Werkstaetten,
          auf Festivals, in Garagen und auf Baustellen.
        </p>
        <p>
          Die Macher-Map verbindet dich mit Menschen, die anpacken. Keine Likes, keine Follower,
          kein Algorithmus. Nur echte Verbindung zu echten Machern.
        </p>
        <p>
          Deine Daten gehoeren dir. Kein Tracking. Keine Werbung. Du bestimmst, was sichtbar ist.
        </p>
      </>
    ),
  },
]

function DetailDialog({ feature, onClose }: { feature: Feature; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(8px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        style={{ background: '#fff', border: '1px solid rgba(26,26,26,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
      >
        <button
          onClick={onClose}
          aria-label="Schliessen"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(26,26,26,0.05)', border: 'none', cursor: 'pointer' }}
        >
          <X size={15} style={{ color: 'rgba(26,26,26,0.6)' }} />
        </button>

        <div className="p-8 md:p-10">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
            style={{ background: `${feature.color}14` }}
          >
            <feature.icon size={24} style={{ color: feature.color }} />
          </div>

          <h3
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.6rem',
              fontWeight: 700,
              color: '#1A1A1A',
              marginBottom: '1.2rem',
              letterSpacing: '-0.02em',
            }}
          >
            {feature.title}
          </h3>

          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.92rem',
              lineHeight: 1.75,
              color: 'rgba(26,26,26,0.65)',
            }}
            className="space-y-4"
          >
            {feature.detail}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Kunstprojekt() {
  const [open, setOpen] = useState<Feature | null>(null)

  return (
    <section id="features" className="py-28 section-reveal" style={{ background: '#FAF8F5' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700,
              color: '#1A1A1A',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '1.2rem',
            }}
          >
            Alles, was Macher brauchen.
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
              lineHeight: 1.65,
              color: 'rgba(26,26,26,0.55)',
              maxWidth: 580,
              margin: '0 auto',
            }}
          >
            Eine Karte. Werkstaetten, Abenteuer, Bauprojekte und eine Community,
            die anpackt statt zuschaut.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(f => (
            <button
              key={f.key}
              onClick={() => setOpen(f)}
              className="group p-6 rounded-xl text-left transition-all"
              style={{
                background: '#fff',
                border: '1px solid rgba(26,26,26,0.06)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `${f.color}14` }}
              >
                <f.icon size={20} style={{ color: f.color }} />
              </div>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  marginBottom: '0.5rem',
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.8rem',
                  lineHeight: 1.55,
                  color: 'rgba(26,26,26,0.55)',
                  flexGrow: 1,
                }}
              >
                {f.teaser}
              </p>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: f.color,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginTop: 14,
                }}
              >
                Mehr erfahren
              </span>
            </button>
          ))}
        </div>

      </div>

      {open && <DetailDialog feature={open} onClose={() => setOpen(null)} />}
    </section>
  )
}
