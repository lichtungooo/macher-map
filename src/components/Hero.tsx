import { ArrowDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BlazingO } from './BlazingO'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden" style={{ background: '#FFFFFF' }}>
      {/* Subtle warm radiance */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 55% 45% at 50% 42%, rgba(212, 168, 67, 0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl mx-auto">
        {/* BlazingO — kleiner, mit mehr Abstand nach unten, damit nix in den Header reinragt */}
        <div className="hero-light mb-8">
          <BlazingO size={150} />
        </div>

        {/* Headline — Lichtung */}
        <h1
          className="hero-title"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)',
            fontWeight: 300,
            color: '#0A0A0A',
            lineHeight: 1,
            marginBottom: '0.6rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}
        >
          Lichtung
        </h1>

        {/* Untertitel */}
        <p
          className="hero-subtitle"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(0.95rem, 2vw, 1.2rem)',
            fontStyle: 'italic',
            color: 'rgba(10,10,10,0.45)',
            marginBottom: '2.5rem',
            letterSpacing: '0.04em',
          }}
        >
          Dein Licht fuer den Frieden.
        </p>

        {/* CTA Buttons */}
        <div className="hero-ctas flex flex-col sm:flex-row items-center justify-center gap-4">
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
            href="#kunst"
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
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 scroll-hint">
        <a href="#kunst" style={{ color: 'rgba(10,10,10,0.2)', transition: 'color 0.2s' }}>
          <ArrowDown size={24} />
        </a>
      </div>
    </section>
  )
}
