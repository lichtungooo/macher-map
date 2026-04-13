import { Heart, Server, Calendar, Globe } from 'lucide-react'

const USES = [
  { icon: Calendar, label: 'Friedensveranstaltungen weltweit organisieren' },
  { icon: Server, label: 'Dezentrale Server fuer lokale Gruppen aufbauen' },
  { icon: Globe, label: 'Das Real Life Network weiterentwickeln' },
  { icon: Heart, label: 'Friedensinitiativen vor Ort unterstuetzen' },
]

export default function Support() {
  return (
    <section id="unterstuetzen" className="py-24 section-reveal" style={{ background: '#fff' }}>
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
            Unterstuetze die Bewegung
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'rgba(10,10,10,0.5)',
              maxWidth: '480px',
              margin: '0 auto',
            }}
          >
            Dezentrale Infrastruktur aufzubauen kostet Ressourcen.
            Jeder Beitrag — ob ein Euro oder hundert — fliesst direkt
            in den Frieden und die Verbindung zwischen Menschen.
          </p>
        </div>

        {/* Donation Amounts */}
        <div className="flex items-center justify-center gap-3 mb-4">
          {[5, 10, 25].map(amount => (
            <button
              key={amount}
              className="transition-all"
              style={{
                border: '1px solid rgba(10,10,10,0.12)',
                background: '#fff',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#0A0A0A',
                padding: '12px 28px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              {amount}&thinsp;&euro;
            </button>
          ))}
        </div>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(10,10,10,0.35)', textAlign: 'center', marginBottom: '2rem' }}>
          Einmalig oder als monatliche Patenschaft
        </p>

        {/* Payment Methods */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <a
            href="#"
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500,
              color: '#fff', textDecoration: 'none', padding: '12px 28px',
              background: '#0A0A0A', borderRadius: '8px',
            }}
          >
            PayPal
          </a>
          <a
            href="#"
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 400,
              color: 'rgba(10,10,10,0.6)', textDecoration: 'none', padding: '12px 28px',
              border: '1px solid rgba(10,10,10,0.12)', borderRadius: '8px',
            }}
          >
            Ueberweisung
          </a>
        </div>

        {/* What it funds */}
        <div className="max-w-md mx-auto">
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#0A0A0A', textAlign: 'center', marginBottom: '0.8rem' }}>
            Wohin deine Energie fliesst
          </p>
          <div className="space-y-2">
            {USES.map((use, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: '#FAFAF8' }}>
                <use.icon size={16} style={{ color: '#D4A843', flexShrink: 0 }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(10,10,10,0.55)' }}>
                  {use.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: 'rgba(10,10,10,0.3)', textAlign: 'center', marginTop: '1.5rem' }}>
          Gemeinnuetzig &middot; Steuerlich absetzbar &middot; Kollektiv Lichtung e.V.
        </p>
      </div>
    </section>
  )
}
