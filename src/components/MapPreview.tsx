import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'

const DEMO_LIGHTS: LatLngExpression[] = [
  [48.1351, 11.5820], [52.5200, 13.4050], [50.9375, 6.9603],
  [48.7758, 9.1829], [53.5511, 9.9937], [47.3769, 8.5417],
  [48.2082, 16.3738], [51.3397, 12.3731], [50.1109, 8.6821],
  [51.0504, 13.7373], [49.4521, 11.0767], [47.0505, 8.3093],
]

export default function MapPreview() {
  return (
    <section id="karte" className="py-24 section-reveal" style={{ background: '#fff' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
              fontWeight: 400,
              color: '#0A0A0A',
              marginBottom: '0.8rem',
            }}
          >
            Die Karte der Herzen
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'rgba(10,10,10,0.5)',
              maxWidth: '480px',
              margin: '0 auto',
            }}
          >
            Jedes Licht ein Mensch. Jede Verbindung ein Versprechen.
            Sieh, wie das Netzwerk waechst.
          </p>
        </div>

        {/* Map */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(10,10,10,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <MapContainer
            center={[50.0, 10.0]}
            zoom={5}
            scrollWheelZoom={false}
            dragging={false}
            zoomControl={false}
            attributionControl={false}
            className="h-[400px] md:h-[480px] w-full"
          >
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              className="map-tiles-warm"
            />
            {DEMO_LIGHTS.map((pos, i) => (
              <CircleMarker
                key={i}
                center={pos}
                radius={5}
                pathOptions={{
                  color: '#D4A843',
                  fillColor: '#FFF8D0',
                  fillOpacity: 0.9,
                  weight: 2,
                  opacity: 0.7,
                }}
              />
            ))}
          </MapContainer>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link
            to="/app"
            className="inline-flex items-center gap-2"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#fff',
              textDecoration: 'none',
              padding: '14px 28px',
              background: '#0A0A0A',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
          >
            <MapPin size={18} />
            Setze dein Licht auf die Karte
          </Link>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(10,10,10,0.35)', marginTop: '10px' }}>
            Kostenlos. Anonym moeglich.
          </p>
        </div>
      </div>
    </section>
  )
}
