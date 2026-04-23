import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function ImpressumPage() {
  return (
    <div className="min-h-screen py-16 px-6" style={{ background: '#FDFCF9', fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8" style={{ color: 'rgba(10,10,10,0.5)', textDecoration: 'none', fontSize: '0.82rem' }}>
          <ArrowLeft size={14} /> Zurueck
        </Link>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 400, color: '#1A1A1A', marginBottom: '3rem' }}>
          Impressum
        </h1>

        <div style={{ fontSize: '0.92rem', lineHeight: 1.8, color: 'rgba(10,10,10,0.75)' }}>

          <h2 style={h2Style}>Angaben gemaess &sect; 5 TMG</h2>
          <p>
            Kollektiv Lichtung e.V.<br />
            Waldstr. 9<br />
            34587 Felsberg<br />
            Deutschland
          </p>

          <h2 style={h2Style}>Vertreten durch den Vorstand</h2>
          <p>
            Timo Martin<br />
            Anton Tranelis
          </p>

          <h2 style={h2Style}>Kontakt</h2>
          <p>
            E-Mail: <a href="mailto:hallo@macher-map.org" style={{ color: '#E8751A' }}>hallo@macher-map.org</a><br />
            Telefon: <a href="tel:+491778539254" style={{ color: '#E8751A' }}>+49 177 853 9254</a>
          </p>

          <h2 style={h2Style}>Registereintrag</h2>
          <p>
            Eintragung im Vereinsregister.<br />
            Registergericht: [einfuegen]<br />
            Registernummer: [einfuegen]
          </p>

          <h2 style={h2Style}>Gemeinnuetzigkeit</h2>
          <p>
            Das Kollektiv Lichtung e.V. ist vom Finanzamt als gemeinnuetzig anerkannt.
            Freistellungsbescheid fuer das Jahr 2024.
          </p>

          <h2 style={h2Style}>Verantwortlich fuer den Inhalt</h2>
          <p>
            Timo Martin<br />
            Anschrift wie oben
          </p>

          <h2 style={h2Style}>Hinweis zur Open-Source-Natur</h2>
          <p>
            Der Quellcode dieser Plattform ist offen einsehbar unter{' '}
            <a href="https://github.com/lichtungooo/macher-map" target="_blank" rel="noopener noreferrer" style={{ color: '#E8751A' }}>
              github.com/lichtungooo/macher-map
            </a>.
          </p>

          <h2 style={h2Style}>Haftung fuer Inhalte</h2>
          <p>
            Als Betreiber sind wir fuer eigene Inhalte auf dieser Plattform nach den allgemeinen Gesetzen verantwortlich.
            Nutzerbeitraege (Profile, Abenteuer, Werkstaetten) geben die Meinung des jeweiligen Verfassers wieder,
            nicht die des Vereins.
          </p>
        </div>
      </div>
    </div>
  )
}

const h2Style = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: '1.3rem',
  fontWeight: 500,
  color: '#1A1A1A',
  marginTop: '2rem',
  marginBottom: '0.6rem',
}
