import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useApp } from '../../context/AppContext'
import { LightMarker } from './LightMarker'
import { EventMarker } from './EventMarker'
import type { LatLngExpression } from 'leaflet'

interface PeaceMapProps {
  onMapClick?: (position: [number, number]) => void
  placingLight?: boolean
}

function MapClickHandler({ onMapClick, placingLight }: PeaceMapProps) {
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

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 10 })
  }, [map])

  return null
}

export function PeaceMap({ onMapClick, placingLight }: PeaceMapProps) {
  const { lights, events } = useApp()
  const center: LatLngExpression = [50.0, 10.0]

  return (
    <MapContainer
      center={center}
      zoom={5}
      zoomControl={false}
      attributionControl={false}
      className="h-full w-full"
      style={{ cursor: placingLight ? 'crosshair' : undefined }}
    >
      {/* CartoDB Voyager: hell, klar, friedlich, natuerliche Farben */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
      />

      <LocateUser />
      <MapClickHandler onMapClick={onMapClick} placingLight={placingLight} />

      {lights.map(light => (
        <LightMarker key={light.id} light={light} />
      ))}

      {events.map(event => (
        <EventMarker key={event.id} event={event} />
      ))}
    </MapContainer>
  )
}
