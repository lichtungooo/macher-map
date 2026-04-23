import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { Wrench, MapPin, Hammer, ShoppingBag } from 'lucide-react'
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
    <section id="karte" className="py-24 section-reveal" style={{ background: '#FAF8F5' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          <div className="order-2 lg:order-1">
            <div className="relative rounded-xl overflow-hidden" style={{ border: '2px solid rgba(26,26,26,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
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
                style={{ height: '420px', background: '#2C2C2C' }}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" />

                {macher.map((p, i) => (
                  <CircleMarker
                    key={`m-${i}`}
                    center={[p.lat, p.lng]}
                    radius={2.5}
                    pathOptions={{
                      color: 'rgba(232,117,26,0.5)',
                      fillColor: '#E8751A',
                      fillOpacity: 0.6,
                      weight: 0.5,
                    }}
                  />
                ))}

                {WERKSTAETTEN.map((p, i) => (
                  <CircleMarker
                    key={`w-${i}`}
                    center={[p.lat, p.lng]}
                    radius={8}
                    pathOptions={{
                      color: '#D4A020',
                      fillColor: '#E8751A',
                      fillOpacity: 0.9,
                      weight: 2.5,
                    }}
                  />
                ))}
              </MapContainer>

              <div className="absolute top-3 left-3 flex flex-col gap-1.5 px-3 py-2 rounded-lg" style={{ background: 'rgba(26,26,26,0.85)', backdropFilter: 'blur(8px)' }}>
                <div className="flex items-center gap-2">
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8751A' }} />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.62rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Macher</span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{ width: 8, height: 8, borderRadius: '2px', background: '#E8751A', border: '1.5px solid #D4A020' }} />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.62rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Werkstaetten</span>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#E8751A',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              Die Karte
            </p>

            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
                fontWeight: 800,
                color: '#1A1A1A',
                lineHeight: 1.1,
                marginBottom: '1.2rem',
                letterSpacing: '-0.03em',
              }}
            >
              Alles in deiner Naehe.<br />
              <span style={{ color: 'rgba(26,26,26,0.35)' }}>Sofort sichtbar.</span>
            </h2>

            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.92rem',
                lineHeight: 1.7,
                color: 'rgba(26,26,26,0.55)',
                marginBottom: '2rem',
              }}
            >
              Werkstaetten, Macher, Material, Abenteuer — alles auf einer Karte.
              Klick drauf, fahr hin, pack an. So einfach.
            </p>

            <div className="space-y-4 mb-7">
              {[
                { icon: MapPin, title: 'Werkstatt finden', text: 'FabLabs, Garagen, Schreinereien — in deiner Naehe. Sofort sehen, was die haben.', color: '#E8751A' },
                { icon: ShoppingBag, title: 'Material & Werkzeug', text: 'Wer hat was? Leihen, tauschen, kaufen. Alles lokal, alles abholbar.', color: '#D4A020' },
                { icon: Hammer, title: 'Abenteuer starten', text: 'Workshops, Bau-Wochenenden, Seifenkistenrennen — einfach mitmachen.', color: '#2D7DD2' },
              ].map((s, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${s.color}15` }}
                  >
                    <s.icon size={18} style={{ color: s.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>
                      {s.title}
                    </h3>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', lineHeight: 1.55, color: 'rgba(26,26,26,0.5)' }}>
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
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.92rem',
                fontWeight: 700,
                color: '#fff',
                textDecoration: 'none',
                padding: '14px 32px',
                background: '#E8751A',
                borderRadius: '10px',
                boxShadow: '0 4px 16px rgba(232,117,26,0.3)',
              }}
            >
              <Wrench size={16} />
              Karte oeffnen
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
