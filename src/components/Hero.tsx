import { useEffect, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { MapContainer, TileLayer } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import { BlazingO } from './BlazingO'
import { LightMarker } from './map/LightMarker'
import { LichtungMarker } from './map/LichtungMarker'
import * as api from '../api/client'

interface LightData {
  id: string
  lat: number
  lng: number
  name: string
  statement: string
  image_path?: string
}

interface LichtungData {
  id: string
  name: string
  description: string
  lat: number
  lng: number
  creator_name: string
  image_path?: string
}

export default function Hero() {
  const [lights, setLights] = useState<LightData[]>([])
  const [lichtungen, setLichtungen] = useState<LichtungData[]>([])

  useEffect(() => {
    api.getLights().then(setLights).catch(() => {})
    api.getLichtungen().then(setLichtungen).catch(() => {})
  }, [])

  // LightMarker erwartet ein LightPin-Shape mit position
  const lightsForMarker = lights.map(l => ({
    id: l.id,
    position: [l.lat, l.lng] as [number, number],
    name: l.name,
    statement: l.statement,
    image_path: l.image_path,
    createdAt: '',
  }))

  return (
    <section className="relative w-full overflow-hidden" style={{ height: '100vh' }}>

      {/* Live-Karte als Hintergrund */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[35, 15] as LatLngExpression}
          zoom={3}
          minZoom={2}
          maxZoom={8}
          scrollWheelZoom={false}
          dragging={true}
          zoomControl={false}
          attributionControl={false}
          doubleClickZoom={false}
          touchZoom={true}
          className="w-full h-full"
          style={{ background: '#F5F4F0' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          />
          {lightsForMarker.map(l => (
            <LightMarker key={l.id} light={l as any} />
          ))}
          {lichtungen.map(l => (
            <LichtungMarker key={l.id} lichtung={l} onClick={() => {}} />
          ))}
        </MapContainer>
      </div>

      {/* Weicher Fade-Overlay oben und unten, damit Text lesbar ist */}
      <div className="absolute inset-x-0 top-0 h-40 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 60%, rgba(255,255,255,0) 100%)' }}
      />
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)' }}
      />

      {/* Hero-Inhalt im Zentrum */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center pt-16 pb-20 px-6 pointer-events-none">

        <div
          className="flex flex-col items-center text-center rounded-2xl px-8 py-8 md:px-12 md:py-10 pointer-events-auto"
          style={{
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(10,10,10,0.03)',
            maxWidth: 520,
          }}
        >
          {/* BlazingO */}
          <div className="hero-light mb-5">
            <BlazingO size={110} />
          </div>

          {/* Titel */}
          <h1
            className="hero-title"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1.8rem, 4.5vw, 3rem)',
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
              color: 'rgba(10,10,10,0.55)',
              marginBottom: '1.8rem',
              maxWidth: 380,
              lineHeight: 1.5,
              letterSpacing: '0.02em',
            }}
          >
            Licht fuer den Frieden aus den Herzen der Menschen.
          </p>

          {/* Ein Button */}
          <a
            href="#kunst"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              fontWeight: 400,
              color: 'rgba(10,10,10,0.7)',
              textDecoration: 'none',
              padding: '13px 30px',
              border: '1px solid rgba(10,10,10,0.15)',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.6)',
            }}
          >
            Erfahre mehr
          </a>
        </div>

      </div>

      {/* Scroll-Pfeil */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 scroll-hint pointer-events-auto">
        <a href="#kunst" style={{ color: 'rgba(10,10,10,0.35)' }}>
          <ArrowDown size={22} />
        </a>
      </div>

    </section>
  )
}
