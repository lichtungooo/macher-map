import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Sparkles, Share2, Radio } from 'lucide-react'
import { MapContainer, TileLayer, CircleMarker, Polyline } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import * as api from '../api/client'

const FALLBACK_LIGHTS: { position: LatLngExpression; invitedBy: number | null }[] = [
  { position: [48.1351, 11.5820], invitedBy: null },
  { position: [52.5200, 13.4050], invitedBy: 0 },
  { position: [50.9375, 6.9603], invitedBy: 0 },
  { position: [48.7758, 9.1829], invitedBy: 1 },
  { position: [53.5511, 9.9937], invitedBy: 1 },
  { position: [47.3769, 8.5417], invitedBy: 2 },
  { position: [48.2082, 16.3738], invitedBy: 3 },
  { position: [51.3397, 12.3731], invitedBy: 4 },
  { position: [50.1109, 8.6821], invitedBy: 0 },
  { position: [51.0504, 13.7373], invitedBy: 7 },
  { position: [49.4521, 11.0767], invitedBy: 2 },
  { position: [47.0505, 8.3093], invitedBy: 5 },
]

const STEPS = [
  { icon: Sparkles, title: 'Setze dein Licht', text: 'Waehle einen Ort auf der Karte.' },
  { icon: Share2, title: 'Teile die Flamme', text: 'Jede Einladung knuepft einen Knoten in der Kette.' },
  { icon: Radio, title: 'Meditiere mit uns', text: 'Wenn viele leuchten, traegt die Stille um die Welt.' },
]

export default function MapPreview() {
  const [lights, setLights] = useState<{ position: LatLngExpression; id: string; invitedBy: string | null }[]>([])
  const [lines, setLines] = useState<[LatLngExpression, LatLngExpression][]>([])

  useEffect(() => {
    api.getLights().then((data: any[]) => {
      if (!data || data.length === 0) return
      const mapped = data.map(l => ({
        position: [l.lat, l.lng] as LatLngExpression,
        id: l.id,
        invitedBy: l.invited_by || null,
      }))
      setLights(mapped)

      // Verbindungs-Linien zwischen invitedBy und invitee
      const byId = new Map(mapped.map(l => [l.id, l.position]))
      const pairs: [LatLngExpression, LatLngExpression][] = []
      for (const l of mapped) {
        if (l.invitedBy && byId.has(l.invitedBy)) {
          pairs.push([byId.get(l.invitedBy)!, l.position])
        }
      }
      setLines(pairs)
    }).catch(() => {
      // Fallback: Demo-Daten mit Demo-Ketten
      const demoLights = FALLBACK_LIGHTS.map((l, i) => ({
        position: l.position,
        id: String(i),
        invitedBy: l.invitedBy !== null ? String(l.invitedBy) : null,
      }))
      setLights(demoLights)
      const pairs: [LatLngExpression, LatLngExpression][] = []
      for (const l of demoLights) {
        if (l.invitedBy) {
          const parent = demoLights[Number(l.invitedBy)]
          if (parent) pairs.push([parent.position, l.position])
        }
      }
      setLines(pairs)
    })
  }, [])

  return (
    <section id="karte" className="py-24 section-reveal" style={{ background: '#fff' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Titel */}
        <div className="text-center mb-10">
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
            Die Friedenskette
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)',
              fontWeight: 400,
              color: '#0A0A0A',
              marginBottom: '0.8rem',
            }}
          >
            Dein Licht wird Teil einer Kette.
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'rgba(10,10,10,0.5)',
              maxWidth: '520px',
              margin: '0 auto',
            }}
          >
            Du laedst Menschen ein. Sie laden Menschen ein. Sichtbar auf der Karte —
            als leuchtendes Geflecht, das um die Erde waechst.
          </p>
        </div>

        {/* Kleine Karte mit Lichterkette */}
        <div className="relative rounded-xl overflow-hidden mb-10" style={{ border: '1px solid rgba(10,10,10,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <MapContainer
            center={[50.0, 10.0]}
            zoom={5}
            scrollWheelZoom={false}
            dragging={false}
            zoomControl={false}
            attributionControl={false}
            className="h-[280px] md:h-[340px] w-full"
            style={{ background: '#F5F4F0' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
            />
            {/* Verbindungs-Linien (die Kette) */}
            {lines.map((pair, i) => (
              <Polyline
                key={i}
                positions={pair as any}
                pathOptions={{
                  color: '#D4A843',
                  weight: 1.2,
                  opacity: 0.35,
                  dashArray: '2 4',
                }}
              />
            ))}
            {/* Lichter */}
            {lights.map((l, i) => (
              <CircleMarker
                key={i}
                center={l.position}
                radius={5}
                pathOptions={{
                  color: '#D4A843',
                  fillColor: '#FFF8D0',
                  fillOpacity: 0.95,
                  weight: 2,
                  opacity: 0.85,
                }}
              />
            ))}
          </MapContainer>
        </div>

        {/* Drei Schritte unter der Karte — kompakt */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {STEPS.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(212,168,67,0.08)' }}
              >
                <step.icon size={16} style={{ color: '#D4A843' }} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#0A0A0A', marginBottom: '2px' }}>
                  {step.title}
                </h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', lineHeight: 1.55, color: 'rgba(10,10,10,0.5)' }}>
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/app"
            className="inline-flex items-center gap-2"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#fff',
              textDecoration: 'none',
              padding: '14px 32px',
              background: '#0A0A0A',
              borderRadius: '8px',
            }}
          >
            <Sparkles size={16} />
            Setze dein Licht
          </Link>
        </div>

      </div>
    </section>
  )
}
