import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function ImpressumPage() {
  return (
    <div className="min-h-screen py-16 px-6" style={{ background: '#FDFCF9', fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8" style={{ color: 'rgba(10,10,10,0.5)', textDecoration: 'none', fontSize: '0.82rem' }}>
          <ArrowLeft size={14} /> Zurueck
        </Link>

        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', fontWeight: 400, color: '#0A0A0A', marginBottom: '3rem' }}>
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

          <h2 style={h2Style}>Vertreten durch</h2>
          <p>
            [Name des Vorstands einfuegen]
          </p>

          <h2 style={h2Style}>Kontakt</h2>
          <p>
            E-Mail: <a href="mailto:frieden@lichtung.ooo" style={{ color: '#D4A843' }}>frieden@lichtung.ooo</a>
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
            [Name einfuegen]<br />
            Anschrift wie oben
          </p>

          <h2 style={h2Style}>Hinweis zur Open-Source-Natur</h2>
          <p>
            Der Quellcode dieser Plattform ist offen einsehbar unter{' '}
            <a href="https://github.com/lichtungooo/licht-fuer-frieden" target="_blank" rel="noopener noreferrer" style={{ color: '#D4A843' }}>
              github.com/lichtungooo/licht-fuer-frieden
            </a>.
          </p>

          <h2 style={h2Style}>Haftung fuer Inhalte</h2>
          <p>
            Als Betreiber sind wir fuer eigene Inhalte auf dieser Plattform nach den allgemeinen Gesetzen verantwortlich.
            Nutzerbeitraege (Profile, Veranstaltungen, Lichtungen) geben die Meinung des jeweiligen Verfassers wieder,
            nicht die des Vereins.
          </p>
        </div>
      </div>
    </div>
  )
}

const h2Style = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: '1.3rem',
  fontWeight: 500,
  color: '#0A0A0A',
  marginTop: '2rem',
  marginBottom: '0.6rem',
}
