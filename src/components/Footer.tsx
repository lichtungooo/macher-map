import { Hammer } from 'lucide-react'
import { Logo } from './Logo'

export default function Footer() {
  return (
    <footer className="py-10 px-4" style={{ background: '#1A1A1A' }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Logo size={24} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
              Macher-Map
            </span>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.4)' }}>
            Bau. Mach. Zeig es.
            <br />Die Karte fuer alle, die anpacken.
          </p>
        </div>

        <div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            Projekt
          </h3>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { href: '#features', label: 'Features' },
              { href: '#karte', label: 'Karte' },
              { href: '#community', label: 'Community' },
              { href: '#partner', label: 'Partner' },
              { href: 'https://real-life-stack.de', label: 'Real Life Network', ext: true },
            ].map((link, i) => (
              <li key={i}>
                <a
                  href={link.href}
                  {...(link.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            Rechtliches
          </h3>
          <div className="flex flex-col gap-1.5">
            <a href="/impressum" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Impressum</a>
            <a href="/datenschutz" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Datenschutz</a>
          </div>
        </div>
      </div>

      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)' }}>
          Open Source. Fuer immer frei.
        </p>
        <p className="flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)' }}>
          Gebaut mit <Hammer size={12} style={{ color: '#E8751A' }} /> fuer Macher
        </p>
      </div>
    </footer>
  )
}
