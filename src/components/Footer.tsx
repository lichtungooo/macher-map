import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="py-10 px-4" style={{ borderTop: '1px solid rgba(10,10,10,0.06)' }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.1rem', fontWeight: 500, color: '#0A0A0A', marginBottom: '0.5rem' }}>
            Lichtung
          </h3>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', lineHeight: 1.6, color: 'rgba(10,10,10,0.4)' }}>
            Dein Licht fuer den Frieden.
            <br />Eine Bewegung der Herzen.
          </p>
        </div>

        <div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', fontWeight: 600, color: 'rgba(10,10,10,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            Projekt
          </h3>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { href: '#kunst', label: 'Bewegung' },
              { href: '#karte', label: 'Verbindung' },
              { href: '#stimmen', label: 'Sichtbar' },
              { href: '#unterstuetzen', label: 'Getragen' },
              { href: 'https://real-life-stack.de', label: 'Real Life Network', ext: true },
            ].map((link, i) => (
              <li key={i}>
                <a
                  href={link.href}
                  {...(link.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(10,10,10,0.4)', textDecoration: 'none' }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', fontWeight: 600, color: 'rgba(10,10,10,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            Traeger
          </h3>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', lineHeight: 1.6, color: 'rgba(10,10,10,0.4)' }}>
            Kollektiv Lichtung e.V.
            <br />Gemeinnuetziger Verein
          </p>
          <div className="flex gap-4 mt-2">
            <a href="/impressum" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(10,10,10,0.35)', textDecoration: 'none' }}>Impressum</a>
            <a href="/datenschutz" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(10,10,10,0.35)', textDecoration: 'none' }}>Datenschutz</a>
          </div>
        </div>
      </div>

      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid rgba(10,10,10,0.04)' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: 'rgba(10,10,10,0.25)' }}>
          Open Source. Fuer immer frei.
        </p>
        <p className="flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: 'rgba(10,10,10,0.25)' }}>
          Gebaut mit <Heart size={12} style={{ color: '#D4A843' }} /> fuer den Frieden
        </p>
      </div>
    </footer>
  )
}
