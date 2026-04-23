import { ArrowDown, Hammer, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: '100vh', background: '#1A1A1A' }}>

      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/hero-macher.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          filter: 'brightness(0.55) contrast(1.1)',
        }}
      />

      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(to bottom, rgba(26,26,26,0.2) 0%, rgba(26,26,26,0.4) 40%, rgba(26,26,26,0.9) 100%)',
        }}
      />

      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center pt-16 pb-20 px-6">
        <div className="flex flex-col items-center text-center max-w-3xl">

          <div
            className="hero-light mb-5 px-5 py-2 rounded-full flex items-center gap-2"
            style={{
              background: 'rgba(232,117,26,0.15)',
              border: '1px solid rgba(232,117,26,0.35)',
            }}
          >
            <Hammer size={13} style={{ color: '#FFAA54' }} />
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#FFAA54',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}>
              Macher-Festival 2026 — Ferropolis — Wir sind dabei
            </span>
          </div>

          <h1
            className="hero-title"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(3rem, 8vw, 5.5rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 0.9,
              marginBottom: '1.5rem',
              letterSpacing: '-0.04em',
            }}
          >
            Pack an.<br />Bau was.<br />
            <span style={{ color: '#E8751A' }}>Zeig's.</span>
          </h1>

          <p
            className="hero-subtitle"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.05rem, 2.5vw, 1.35rem)',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.8)',
              marginBottom: '1rem',
              maxWidth: 520,
              lineHeight: 1.5,
            }}
          >
            Finde Werkstaetten, Macher und Abenteuer in deiner Naehe.
            Material, Werkzeug, Leute die anpacken — alles auf einer Karte.
          </p>

          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.45)',
              marginBottom: '2.5rem',
              fontStyle: 'italic',
            }}
          >
            Es gibt nicht viel Gutes, ausser man tut es.
          </p>

          <div className="hero-ctas flex flex-col sm:flex-row gap-3">
            <Link
              to="/app"
              className="flex items-center justify-center gap-2"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1rem',
                fontWeight: 700,
                color: '#fff',
                textDecoration: 'none',
                padding: '16px 40px',
                background: '#E8751A',
                borderRadius: '10px',
                boxShadow: '0 4px 24px rgba(232,117,26,0.4)',
              }}
            >
              <Wrench size={18} />
              Lass uns bauen
            </Link>
            <a
              href="#features"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.85)',
                textDecoration: 'none',
                padding: '16px 40px',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(8px)',
              }}
            >
              Was steckt drin?
            </a>
          </div>

          <div className="flex items-center gap-6 mt-10" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <div className="flex items-center gap-2">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#45B764' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem' }}>200+ Werkstaetten</span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8751A' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem' }}>1.200+ Macher</span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2D7DD2' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem' }}>50+ Abenteuer</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 scroll-hint">
        <a href="#features" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <ArrowDown size={24} />
        </a>
      </div>
    </section>
  )
}
