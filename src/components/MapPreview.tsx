import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { Wrench, MapPin, Zap } from 'lucide-react'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'

type Pt = { lat: number; lng: number }

function seed(i: number) {
  let x = Math.sin(i * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

function genMacher(count: number): Pt[] {
  const pts: Pt[] = []
  const regions = [
    { cLat: 51, cLng: 10, spread: 5, weight: 0.50 },
    { cLat: 48, cLng: 11, spread: 3, weight: 0.20 },
    { cLat: 53, cLng: 10, spread: 3, weight: 0.15 },
    { cLat: 50, cLng: 7, spread: 3, weight: 0.15 },
  ]
  for (let i = 0; i < count; i++) {
    const r = seed(i * 7 + 11)
    let acc = 0, region = regions[0]
    for (const reg of regions) { acc += reg.weight; if (r < acc) { region = reg; break } }
    const latOff = (seed(i * 3 + 5) - 0.5) * 2 * region.spread
    const lngOff = (seed(i * 5 + 13) - 0.5) * 2 * region.spread
    pts.push({ lat: region.cLat + latOff, lng: region.cLng + lngOff })
  }
  return pts
}

const WERKSTAETTEN: Pt[] = [
  { lat: 52.52, lng: 13.40 },
  { lat: 48.14, lng: 11.58 },
  { lat: 50.94, lng: 6.96 },
  { lat: 53.55, lng: 9.99 },
  { lat: 51.34, lng: 12.37 },
  { lat: 49.45, lng: 11.08 },
  { lat: 48.78, lng: 9.18 },
  { lat: 51.05, lng: 13.74 },
]

export default function MapPreview() {
  const macher = useMemo(() => genMacher(200), [])

  return (
    <section id="karte" className="py-24 section-reveal" style={{ background: '#fff' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          <div className="order-2 lg:order-1">
            <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid rgba(26,26,26,0.1)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              <MapContainer
                center={[51, 10] as LatLngExpression}
                zoom={6}
                minZoom={5}
                maxZoom={8}
                scrollWheelZoom={false}
                dragging={false}
                zoomControl={false}
                attributionControl={false}
                touchZoom={false}
                doubleClickZoom={false}
                className="w-full"
                style={{ height: '400px', background: '#F5F0E8' }}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png" />

                {macher.map((p, i) => (
                  <CircleMarker
                    key={`m-${i}`}
                    center={[p.lat, p.lng]}
                    radius={2.5}
                    pathOptions={{
                      color: 'rgba(232,117,26,0.4)',
                      fillColor: '#FFCC80',
                      fillOpacity: 0.7,
                      weight: 0.8,
                    }}
                  />
                ))}

                {WERKSTAETTEN.map((p, i) => (
                  <CircleMarker
                    key={`w-${i}`}
                    center={[p.lat, p.lng]}
                    radius={7}
                    pathOptions={{
                      color: '#E8751A',
                      fillColor: '#FFF3E0',
                      fillOpacity: 0.9,
                      weight: 2,
                    }}
                  />
                ))}
              </MapContainer>

              <div className="absolute top-3 left-3 flex flex-col gap-1.5 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', border: '1px solid rgba(26,26,26,0.06)' }}>
                <div className="flex items-center gap-2">
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFCC80', border: '1.5px solid #E8751A' }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', color: 'rgba(26,26,26,0.55)' }}>Macher</span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFF3E0', border: '1.5px solid #E8751A' }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', color: 'rgba(26,26,26,0.55)' }}>Werkstaetten</span>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#E8751A',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              Die Macher-Karte
            </p>

            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
                fontWeight: 700,
                color: '#1A1A1A',
                lineHeight: 1.15,
                marginBottom: '1.2rem',
                letterSpacing: '-0.02em',
              }}
            >
              Finde Werkstaetten und Macher in deiner Naehe.
            </h2>

            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: 'rgba(26,26,26,0.55)',
                marginBottom: '2rem',
              }}
            >
              Offene Werkstaetten, Bau-Events und aktive Macher — alles auf einer Karte.
              Finde deinen naechsten Workshop, leih dir Werkzeug oder triff Gleichgesinnte.
            </p>

            <div className="space-y-4 mb-7">
              {[
                { icon: MapPin, title: 'Werkstatt finden', text: 'FabLabs, Garagen, Schreinereien, Makerspaces — alles sichtbar.' },
                { icon: Wrench, title: 'Werkzeug & Material', text: 'Sieh, wer was hat. Leih aus. Teile. Spar Geld.' },
                { icon: Zap, title: 'Abenteuer starten', text: 'Workshops, Bau-Wochenenden, Seifenkistenrennen — pack an.' },
              ].map((s, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(232,117,26,0.08)' }}
                  >
                    <s.icon size={16} style={{ color: '#E8751A' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(26,26,26,0.2)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9rem', fontWeight: 600, color: '#1A1A1A' }}>
                        {s.title}
                      </h3>
                    </div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', lineHeight: 1.55, color: 'rgba(26,26,26,0.5)', paddingLeft: '2rem' }}>
                      {s.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/app"
              className="inline-flex items-center gap-2"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#fff',
                textDecoration: 'none',
                padding: '14px 32px',
                background: '#E8751A',
                borderRadius: '10px',
                boxShadow: '0 4px 16px rgba(232,117,26,0.3)',
              }}
            >
              <MapPin size={16} />
              Karte oeffnen
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
