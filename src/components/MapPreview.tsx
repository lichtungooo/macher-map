import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import maplibregl from 'maplibre-gl'

const DEMO_LIGHTS = [
  [11.5820, 48.1351], [13.4050, 52.5200], [6.9603, 50.9375],
  [9.1829, 48.7758], [9.9937, 53.5511], [8.5417, 47.3769],
  [16.3738, 48.2082], [12.3731, 51.3397], [8.6821, 50.1109],
  [13.7373, 51.0504], [11.0767, 49.4521], [8.3093, 47.0505],
]

export default function MapPreview() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [10.0, 50.0],
      zoom: 4.5,
      attributionControl: false,
      interactive: false,
    })

    map.on('load', () => {
      for (const [lng, lat] of DEMO_LIGHTS) {
        const el = document.createElement('div')
        el.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20"><defs><radialGradient id="pg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FFFFF0" stop-opacity="1"/><stop offset="40%" stop-color="#FFF8D0" stop-opacity="0.8"/><stop offset="100%" stop-color="#D4A843" stop-opacity="0"/></radialGradient></defs><circle cx="10" cy="10" r="9" fill="url(#pg)"/><circle cx="10" cy="10" r="3" fill="#FFFFF0" opacity="0.95"/></svg>`
        new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map)
      }
    })

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  return (
    <section id="karte" className="py-24 section-reveal" style={{ background: '#fff' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 400, color: '#0A0A0A', marginBottom: '0.8rem' }}>
            Die Karte der Herzen
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.7, color: 'rgba(10,10,10,0.5)', maxWidth: '480px', margin: '0 auto' }}>
            Jedes Licht ein Mensch. Jede Verbindung ein Versprechen. Sieh, wie das Netzwerk waechst.
          </p>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(10,10,10,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div ref={mapContainer} className="h-[400px] md:h-[480px] w-full" />
        </div>

        <div className="text-center mt-8">
          <Link to="/app" className="inline-flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 500, color: '#fff', textDecoration: 'none', padding: '14px 28px', background: '#0A0A0A', borderRadius: '8px' }}>
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
