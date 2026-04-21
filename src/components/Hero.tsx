import { ArrowDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BlazingO } from './BlazingO'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden" style={{ background: '#FFFFFF' }}>
      {/* Subtle warm radiance */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(212, 168, 67, 0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">
        {/* BlazingO */}
        <div className="hero-light mb-4">
          <BlazingO size={200} />
        </div>

        {/* Headline — Lichtung */}
        <h1
          className="hero-title"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            fontWeight: 300,
            color: '#0A0A0A',
            lineHeight: 1,
            marginBottom: '0.8rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}
        >
          Lichtung
        </h1>

        {/* Untertitel — Dein Licht fuer den Frieden */}
        <p
          className="hero-subtitle"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(1rem, 2.2vw, 1.35rem)',
            fontStyle: 'italic',
            color: 'rgba(10,10,10,0.45)',
            marginBottom: '2rem',
            letterSpacing: '0.04em',
          }}
        >
          Dein Licht fuer den Frieden.
        </p>

        {/* Subline */}
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
            fontWeight: 400,
            lineHeight: 1.7,
            color: 'rgba(10,10,10,0.55)',
            maxWidth: '540px',
            marginBottom: '2.5rem',
          }}
        >
          Setze dein Licht auf die Weltkarte und verbinde dich mit Menschen,
          die fuer den Frieden leuchten. Meditiere mit uns — ueberall auf der Welt, zur gleichen Zeit.
        </p>

        {/* CTA Buttons */}
        <div className="hero-ctas flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/app"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#fff',
              textDecoration: 'none',
              padding: '14px 32px',
              background: '#0A0A0A',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
          >
            Setze dein Licht
          </Link>
          <a
            href="#vision"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              fontWeight: 400,
              color: 'rgba(10,10,10,0.6)',
              textDecoration: 'none',
              padding: '14px 32px',
              border: '1px solid rgba(10,10,10,0.15)',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
          >
            Erfahre mehr
          </a>
        </div>

        {/* Key Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { label: 'Karte der Herzen', desc: 'Sichtbar machen, wer leuchtet' },
            { label: 'Gemeinsame Meditation', desc: 'Zur gleichen Zeit, ueberall' },
            { label: 'Lokale Begegnung', desc: 'Menschen treffen sich im echten Leben' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ background: '#D4A843' }} />
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, color: '#0A0A0A' }}>
                  {item.label}
                </span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(10,10,10,0.4)', marginLeft: '6px' }}>
                  — {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 scroll-hint">
        <a href="#vision" style={{ color: 'rgba(10,10,10,0.2)', transition: 'color 0.2s' }}>
          <ArrowDown size={24} />
        </a>
      </div>
    </section>
  )
}
