import { Hammer } from 'lucide-react'
import { Logo } from './Logo'

export default function Footer() {
  return (
    <footer className="py-10 px-4" style={{ background: '#111' }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <Logo size={26} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
              Macher-Map
            </span>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.35)' }}>
            Pack an. Bau was. Zeig's.
            <br />Die Karte fuer alle, die anpacken.
          </p>
        </div>

        <div>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            Projekt
          </h3>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { href: '#features', label: 'Features' },
              { href: '#karte', label: 'Karte' },
              { href: '#community', label: 'Community' },
              { href: '#partner', label: 'Mitmachen' },
            ].map((link, i) => (
              <li key={i}>
                <a
                  href={link.href}
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            Rechtliches
          </h3>
          <div className="flex flex-col gap-1.5 mb-4">
            <a href="/impressum" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Impressum</a>
            <a href="/datenschutz" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Datenschutz</a>
          </div>
          <a
            href="https://real-life-stack.de"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            Real Life Network
          </a>
        </div>
      </div>

      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.18)' }}>
          Open Source. Fuer immer frei.
        </p>
        <p className="flex items-center gap-1.5" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.18)' }}>
          Gebaut mit <Hammer size={11} style={{ color: '#E8751A' }} /> von Machern fuer Macher
        </p>
      </div>
    </footer>
  )
}
