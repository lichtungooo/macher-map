import { useState, useEffect } from 'react'
import { Wrench, Calendar, Trophy, Users, ShoppingBag, Target, X } from 'lucide-react'

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
    teaser: 'FabLabs, Garagen, Schreinereien, Makerspaces — alles auf der Karte. Finde den Ort, wo du loslegen kannst.',
    color: '#E8751A',
    detail: (
      <>
        <p>
          Jede <strong>Werkstatt</strong> auf der Karte ist ein realer Ort — Schreinerei,
          FabLab, offene Garage, Schlosserei, Makerspace. Kein Fake, kein Stock-Foto.
        </p>
        <p>
          Du siehst sofort: CNC-Fraese? Check. Schweissgeraet? Check. 3D-Drucker? Check.
          Du weisst, was dich erwartet, bevor du hinfaehrst.
        </p>
        <p>
          Du betreibst selbst eine Werkstatt? Trag sie ein. Mach sie sichtbar.
          Zeig der Community, was bei dir geht.
        </p>
      </>
    ),
  },
  {
    key: 'abenteuer',
    icon: Calendar,
    title: 'Abenteuer',
    teaser: 'Seifenkistenrennen, Schweisskurse, Baumhaus-Bau — echte Action mit echten Leuten.',
    color: '#2D7DD2',
    detail: (
      <>
        <p>
          <strong>Abenteuer</strong> sind keine Webinare. Du packst an. Du schwitzt.
          Du baust was mit deinen eigenen Haenden.
        </p>
        <p>
          Seifenkistenrennen in Ferropolis. Messerbau in Hamburg.
          Floss bauen in Leipzig. Schweisskurs fuer Anfaenger in Berlin.
        </p>
        <p>
          Jedes Abenteuer bringt Erfahrung fuer deinen Skill-Tree.
          Je mehr du machst, desto mehr wirst du zum Macher.
        </p>
      </>
    ),
  },
  {
    key: 'bauprojekte',
    icon: Trophy,
    title: 'Bauprojekte',
    teaser: 'Zeig, was du gebaut hast. Teile Bauplaene. Finde Leute, die mitbauen.',
    color: '#45B764',
    detail: (
      <>
        <p>
          Du willst eine <strong>Seifenkiste</strong> bauen? Ein <strong>Baumhaus</strong>?
          Ein komplettes <strong>Moebelstueck</strong>? Poste dein Projekt.
        </p>
        <p>
          Beschreib, was du vorhast. Was du brauchst. Wer soll mitbauen?
          Andere Macher sehen dein Projekt auf der Karte und koennen sich melden.
        </p>
        <p>
          Fertig gebaut? Fotos rein, Bauplan teilen, andere inspirieren.
          Die Community feiert, was du geschaffen hast.
        </p>
      </>
    ),
  },
  {
    key: 'marktplatz',
    icon: ShoppingBag,
    title: 'Materialboerse',
    teaser: 'Holz uebrig? Schweissgeraet zu verleihen? Schrauben gesucht? Geben und Nehmen.',
    color: '#D4A020',
    detail: (
      <>
        <p>
          Die <strong>Materialboerse</strong> verbindet Angebot und Nachfrage.
          Du hast Material uebrig? Stell es rein. Du brauchst was? Schau, wer es hat.
        </p>
        <p>
          Kostenlos, Tausch oder fair bezahlt — du entscheidest.
          Alles lokal, alles abholbar, kein Versand-Quatsch.
        </p>
        <p>
          Auch Werkzeug-Verleih, Maschinen-Sharing, Restposten von
          Handwerksbetrieben. Was einer nicht braucht, ist fuer den anderen Gold.
        </p>
      </>
    ),
  },
  {
    key: 'skilltree',
    icon: Target,
    title: 'Skill-Tree',
    teaser: 'Holz, Metall, Elektro, Schweissen — level deine Skills. Zeig, was du drauf hast.',
    color: '#9B59B6',
    detail: (
      <>
        <p>
          Jedes Abenteuer, jeder Workshop, jedes Projekt gibt dir
          <strong> Erfahrung</strong>. Dein Skill-Tree waechst mit dir.
        </p>
        <p>
          Holz Level 5? Du bist in der Holzgilde.
          Schweissen Level 10? Schweisskoenig.
          Alles sichtbar auf deinem Profil — wie bei Duolingo, nur echt.
        </p>
        <p>
          Handwerksbetriebe sehen sofort: Dieser Macher hat Talent,
          hat Spass daran, hat Erfahrung. Der goldene Boden des Handwerks — sichtbar gemacht.
        </p>
      </>
    ),
  },
  {
    key: 'community',
    icon: Users,
    title: 'Macher-Community',
    teaser: 'Echte Verbindungen. Keine Likes. Keine Follower. Leute, die anpacken.',
    color: '#C0392B',
    detail: (
      <>
        <p>
          Die <strong>Macher-Community</strong> lebt nicht im Internet — sie lebt
          in Werkstaetten, auf Festivals, in Garagen und auf Baustellen.
        </p>
        <p>
          Offers & Needs: Was kannst du? Was brauchst du?
          Hashtags verbinden dich mit Machern, die das Gleiche bauen wollen.
        </p>
        <p>
          Deine Daten gehoeren dir. Kein Tracking. Keine Werbung.
          Kein Algorithmus. Nur echte Verbindung zu echten Machern.
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
      style={{ background: 'rgba(26,26,26,0.6)', backdropFilter: 'blur(10px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        style={{ background: '#FAF8F5', border: '1px solid rgba(26,26,26,0.1)', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}
      >
        <button
          onClick={onClose}
          aria-label="Schliessen"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(26,26,26,0.08)', border: 'none', cursor: 'pointer' }}
        >
          <X size={15} style={{ color: 'rgba(26,26,26,0.6)' }} />
        </button>

        <div className="p-8 md:p-10">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
            style={{ background: `${feature.color}18` }}
          >
            <feature.icon size={26} style={{ color: feature.color }} />
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
    <section id="features" className="py-28 section-reveal" style={{ background: '#1A1A1A' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#E8751A',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Was steckt drin
          </p>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '1rem',
            }}
          >
            Alles, was Macher brauchen.
            <br />
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Nichts, was sie nicht brauchen.</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <button
              key={f.key}
              onClick={() => setOpen(f)}
              className="group p-5 lg:p-6 rounded-xl text-left transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor = `${f.color}40`
                e.currentTarget.style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `${f.color}20` }}
              >
                <f.icon size={20} style={{ color: f.color }} />
              </div>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '0.5rem',
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.78rem',
                  lineHeight: 1.55,
                  color: 'rgba(255,255,255,0.45)',
                  flexGrow: 1,
                }}
              >
                {f.teaser}
              </p>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: f.color,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginTop: 14,
                }}
              >
                Reinschauen →
              </span>
            </button>
          ))}
        </div>

      </div>

      {open && <DetailDialog feature={open} onClose={() => setOpen(null)} />}
    </section>
  )
}
