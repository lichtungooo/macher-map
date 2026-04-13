import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useApp } from '../../context/AppContext'
import { LightMarker } from './LightMarker'
import { EventMarker } from './EventMarker'
import type { LatLngExpression } from 'leaflet'

interface PeaceMapProps {
  onMapClick?: (position: [number, number]) => void
  placingLight?: boolean
  showLights?: boolean
  showEvents?: boolean
}

function MapClickHandler({ onMapClick, placingLight }: { onMapClick?: (pos: [number, number]) => void; placingLight?: boolean }) {
  useMapEvents({
    click(e) {
      if (placingLight && onMapClick) {
        // Funken-Effekt
        const point = (e as any).containerPoint || (e as any).originalEvent
        if (point) {
          const container = document.querySelector('.leaflet-container')
          if (container) {
            const rect = container.getBoundingClientRect()
            const x = (point.x || point.clientX - rect.left) + rect.left
            const y = (point.y || point.clientY - rect.top) + rect.top
            const sparkle = document.createElement('div')
            sparkle.className = 'sparkle-effect'
            sparkle.style.left = x + 'px'
            sparkle.style.top = y + 'px'
            document.body.appendChild(sparkle)
            setTimeout(() => sparkle.remove(), 1000)
          }
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

export function PeaceMap({ onMapClick, placingLight, showLights = true, showEvents = true }: PeaceMapProps) {
  const { lights, events } = useApp()
  const center: LatLngExpression = [50.0, 10.0]

  return (
    <MapContainer
      center={center}
      zoom={5}
      zoomControl={false}
      attributionControl={false}
      className={`h-full w-full ${placingLight ? 'cursor-wand' : ''}`}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap &copy; CARTO'
      />

      <LocateUser />
      <MapClickHandler onMapClick={onMapClick} placingLight={placingLight} />

      {showLights && lights.map(light => (
        <LightMarker key={light.id} light={light} />
      ))}

      {showEvents && events.map(event => (
        <EventMarker key={event.id} event={event} />
      ))}
    </MapContainer>
  )
}
