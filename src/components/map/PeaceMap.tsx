import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useApp } from '../../context/AppContext'
import { LightMarker } from './LightMarker'
import { EventMarker } from './EventMarker'
import { ZoomButtons } from './ZoomButtons'
import type { LatLngExpression } from 'leaflet'

interface PeaceMapProps {
  onMapClick?: (position: [number, number]) => void
  placingLight?: boolean
  showLights?: boolean
  showEvents?: boolean
  onZoomChange?: (zoom: number) => void
  onCenterChange?: (center: [number, number]) => void
  onRadiusChange?: (radiusKm: number) => void
  flyTo?: [number, number, number] | null // [lat, lng, zoom]
}

function MapClickHandler({ onMapClick, placingLight }: { onMapClick?: (pos: [number, number]) => void; placingLight?: boolean }) {
  useMapEvents({
    click(e) {
      if (placingLight && onMapClick) {
        // Funken-Effekt mit Partikeln
        const origEvent = (e as any).originalEvent as MouseEvent | TouchEvent
        let x = 0, y = 0
        if (origEvent) {
          if ('touches' in origEvent && origEvent.touches.length > 0) {
            x = origEvent.touches[0].clientX; y = origEvent.touches[0].clientY
          } else if ('clientX' in origEvent) {
            x = origEvent.clientX; y = origEvent.clientY
          }
        }
        if (x && y) {
          const sparkle = document.createElement('div')
          sparkle.className = 'sparkle-effect'
          sparkle.style.left = x + 'px'
          sparkle.style.top = y + 'px'

          // Funken-Partikel erzeugen
          for (let i = 0; i < 8; i++) {
            const p = document.createElement('div')
            p.className = 'sparkle-particle'
            const angle = (i / 8) * Math.PI * 2
            const dist = 25 + Math.random() * 20
            const tx = Math.cos(angle) * dist
            const ty = Math.sin(angle) * dist
            p.style.left = '38px'
            p.style.top = '38px'
            p.style.animation = `sparkle-particle 0.5s ease-out ${i * 0.03}s forwards`
            p.style.transform = `translate(${tx}px, ${ty}px) scale(0.3)`
            sparkle.appendChild(p)
          }

          document.body.appendChild(sparkle)
          setTimeout(() => sparkle.remove(), 1200)
        }
        onMapClick([e.latlng.lat, e.latlng.lng])
      }
    },
  })
  return null
}

function LocateUser() {
  const map = useMap()
  useEffect(() => { map.locate({ setView: true, maxZoom: 10 }) }, [map])
  return null
}

function MapEventBridge({ onZoomChange, onCenterChange, onRadiusChange }: { onZoomChange?: (z: number) => void; onCenterChange?: (c: [number, number]) => void; onRadiusChange?: (r: number) => void }) {
  const map = useMap()
  useEffect(() => {
    const handler = () => {
      if (onZoomChange) onZoomChange(map.getZoom())
      if (onCenterChange) {
        const c = map.getCenter()
        onCenterChange([c.lat, c.lng])
      }
      if (onRadiusChange) {
        // Exakten Radius aus der sichtbaren Kartenflaeche berechnen
        const bounds = map.getBounds()
        const center = map.getCenter()
        const ne = bounds.getNorthEast()
        // Distanz vom Zentrum zum Rand in km
        const R = 6371
        const dLat = (ne.lat - center.lat) * Math.PI / 180
        const dLng = (ne.lng - center.lng) * Math.PI / 180
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(center.lat * Math.PI / 180) * Math.cos(ne.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        onRadiusChange(Math.round(dist))
      }
    }
    map.on('zoomend', handler)
    map.on('moveend', handler)
    // Initial call
    handler()
    return () => { map.off('zoomend', handler); map.off('moveend', handler) }
  }, [map, onZoomChange, onCenterChange, onRadiusChange])
  return null
}

function FlyToHandler({ flyTo }: { flyTo?: [number, number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (flyTo) map.flyTo([flyTo[0], flyTo[1]], flyTo[2], { duration: 1.5 })
  }, [flyTo, map])
  return null
}

export function PeaceMap({ onMapClick, placingLight, showLights = true, showEvents = true, onZoomChange, onCenterChange, onRadiusChange, flyTo }: PeaceMapProps) {
  const { lights, events } = useApp()
  const center: LatLngExpression = [50.0, 10.0]

  return (
    <MapContainer
      center={center}
      zoom={5}
      zoomControl={false}
      attributionControl={false}
      zoomSnap={0}
      zoomDelta={1}
      wheelDebounceTime={0}
      wheelPxPerZoomLevel={80}
      className={`h-full w-full ${placingLight ? 'cursor-wand' : ''}`}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap &copy; CARTO'
      />

      <LocateUser />
      <MapClickHandler onMapClick={onMapClick} placingLight={placingLight} />
      <MapEventBridge onZoomChange={onZoomChange} onCenterChange={onCenterChange} onRadiusChange={onRadiusChange} />
      <FlyToHandler flyTo={flyTo} />
      <ZoomButtons />

      {showLights && lights.map(light => (
        <LightMarker key={light.id} light={light} />
      ))}

      {showEvents && events.map(event => (
        <EventMarker key={event.id} event={event} />
      ))}
    </MapContainer>
  )
}
