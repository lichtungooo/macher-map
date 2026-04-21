import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trees, Sparkles } from 'lucide-react'
import * as api from '../api/client'

interface LightItem {
  id: string
  name: string
  statement: string
  image_path?: string
  created_at?: string
}

interface LichtungItem {
  id: string
  name: string
  description?: string
  image_path?: string
}

export default function LiveFeed() {
  const [lights, setLights] = useState<LightItem[]>([])
  const [lichtungen, setLichtungen] = useState<LichtungItem[]>([])

  useEffect(() => {
    api.getLights().then((data: any[]) => {
      // Nur Lichter mit Statement oder Bild zeigen, neueste zuerst
      const filtered = (data || [])
        .filter(l => l.name && (l.statement || l.image_path))
        .slice(0, 6)
      setLights(filtered)
    }).catch(() => {})

    api.getLichtungen().then((data: any[]) => {
      setLichtungen((data || []).slice(0, 4))
    }).catch(() => {})
  }, [])

  // Wenn gar nichts da ist, die Sektion nicht anzeigen
  if (lights.length === 0 && lichtungen.length === 0) return null

  return (
    <section id="stimmen" className="py-24 section-reveal" style={{ background: '#FAFAF8' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-14">
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.72rem',
              fontWeight: 500,
              color: '#D4A843',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              marginBottom: '0.8rem',
            }}
          >
            Stimmen von der Karte
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)',
              fontWeight: 400,
              color: '#0A0A0A',
              marginBottom: '0.6rem',
            }}
          >
            Menschen. Lichter. Lichtungen.
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9rem',
              color: 'rgba(10,10,10,0.5)',
              maxWidth: '480px',
              margin: '0 auto',
            }}
          >
            Das ist keine Theorie. Das sind echte Menschen und Orte, die jetzt gerade leuchten.
          </p>
        </div>

        {/* Lichtungen */}
        {lichtungen.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center gap-2 mb-5">
              <Trees size={15} style={{ color: '#7BAE5E' }} />
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(10,10,10,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Lichtungen
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {lichtungen.map(l => (
                <div
                  key={l.id}
                  className="rounded-xl overflow-hidden"
                  style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.05)' }}
                >
                  {l.image_path ? (
                    <div
                      className="h-32 w-full"
                      style={{
                        backgroundImage: `url(${l.image_path})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  ) : (
                    <div className="h-32 w-full flex items-center justify-center" style={{ background: 'rgba(123,174,94,0.06)' }}>
                      <Trees size={28} style={{ color: 'rgba(123,174,94,0.4)' }} />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', fontWeight: 500, color: '#0A0A0A', marginBottom: '0.3rem' }}>
                      {l.name}
                    </h4>
                    {l.description && (
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', lineHeight: 1.55, color: 'rgba(10,10,10,0.5)' }}>
                        {l.description.length > 90 ? l.description.slice(0, 90).trim() + '…' : l.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lichter */}
        {lights.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={15} style={{ color: '#D4A843' }} />
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(10,10,10,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Lichter
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lights.map(l => (
                <div
                  key={l.id}
                  className="p-5 rounded-xl flex gap-4"
                  style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.05)' }}
                >
                  {l.image_path ? (
                    <img
                      src={l.image_path}
                      alt=""
                      style={{
                        width: 48, height: 48, borderRadius: '50%',
                        objectFit: 'cover', flexShrink: 0,
                        border: '2px solid rgba(212,168,67,0.25)',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: 'rgba(212,168,67,0.08)',
                        border: '2px solid rgba(212,168,67,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', color: '#D4A843' }}>
                        {l.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem', fontWeight: 500, color: '#0A0A0A', marginBottom: '0.3rem' }}>
                      {l.name}
                    </h4>
                    {l.statement && (
                      <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.88rem', fontStyle: 'italic', lineHeight: 1.55, color: 'rgba(10,10,10,0.55)' }}>
                        „{l.statement.length > 100 ? l.statement.slice(0, 100).trim() + '…' : l.statement}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-14">
          <Link
            to="/app"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'rgba(10,10,10,0.7)',
              textDecoration: 'none',
              padding: '12px 28px',
              border: '1px solid rgba(10,10,10,0.15)',
              borderRadius: '8px',
            }}
          >
            Zur Karte
          </Link>
        </div>

      </div>
    </section>
  )
}
