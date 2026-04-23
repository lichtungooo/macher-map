import { ArrowDown } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: '100vh', background: '#F5F0E8' }}>

      {/* Hero-Bild als Hintergrund */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/hero-macher.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          filter: 'brightness(0.7)',
        }}
      />

      {/* Gradient-Overlay fuer Lesbarkeit */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(to bottom, rgba(26,26,26,0.3) 0%, rgba(26,26,26,0.6) 60%, rgba(26,26,26,0.85) 100%)',
        }}
      />

      {/* Hero-Inhalt */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center pt-16 pb-20 px-6">

        <div className="flex flex-col items-center text-center max-w-2xl">

          {/* Badge */}
          <div
            className="hero-light mb-6 px-4 py-1.5 rounded-full"
            style={{
              background: 'rgba(232,117,26,0.15)',
              border: '1px solid rgba(232,117,26,0.3)',
            }}
          >
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#FFAA54',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              Macher-Festival 2026 — Wir sind dabei
            </span>
          </div>

          {/* Titel */}
          <h1
            className="hero-title"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 0.95,
              marginBottom: '1.2rem',
              letterSpacing: '-0.03em',
            }}
          >
            Bau.<br />Mach.<br />Zeig es.
          </h1>

          {/* Untertitel */}
          <p
            className="hero-subtitle"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(1rem, 2.2vw, 1.25rem)',
              color: 'rgba(255,255,255,0.75)',
              marginBottom: '2.5rem',
              maxWidth: 480,
              lineHeight: 1.6,
            }}
          >
            Die Karte fuer Macher. Finde Werkstaetten, Abenteuer und Menschen,
            die anpacken — in deiner Naehe.
          </p>

          {/* CTAs */}
          <div className="hero-ctas flex flex-col sm:flex-row gap-3">
            <Link
              to="/app"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#fff',
                textDecoration: 'none',
                padding: '14px 36px',
                background: '#E8751A',
                borderRadius: '10px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(232,117,26,0.4)',
              }}
            >
              Karte entdecken
            </Link>
            <a
              href="#features"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.95rem',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.85)',
                textDecoration: 'none',
                padding: '14px 36px',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(8px)',
              }}
            >
              So funktioniert's
            </a>
          </div>
        </div>

      </div>

      {/* Scroll-Pfeil */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 scroll-hint">
        <a href="#features" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <ArrowDown size={24} />
        </a>
      </div>

    </section>
  )
}
