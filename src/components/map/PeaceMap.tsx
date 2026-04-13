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
