import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

function createLichtungIcon() {
  // Baum/Lichtung-Symbol — ein gruener Kreis mit goldenem Kern
  const svg = `
    <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lig" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFFFF0" stop-opacity="0.9"/>
          <stop offset="40%" stop-color="#D4E8C0" stop-opacity="0.7"/>
          <stop offset="80%" stop-color="#7BAE5E" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#5A8A3C" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="18" cy="18" r="16" fill="url(#lig)" stroke="#7BAE5E" stroke-width="1.5" opacity="0.9"/>
      <circle cx="18" cy="18" r="5" fill="#FFF8D0" stroke="#D4A843" stroke-width="1" opacity="0.9"/>
      <circle cx="18" cy="18" r="2" fill="#FFFFF0"/>
    </svg>
  `
  return L.divIcon({
    html: `<div class="lichtung-marker">${svg}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

const lichtungIcon = createLichtungIcon()

interface LichtungMarkerProps {
  lichtung: {
    id: string
    name: string
    description: string
    lat: number
    lng: number
    creator_name: string
  }
  onClick: (id: string) => void
}

export function LichtungMarker({ lichtung, onClick }: LichtungMarkerProps) {
  return (
    <Marker
      position={[lichtung.lat, lichtung.lng]}
      icon={lichtungIcon}
      eventHandlers={{ click: () => onClick(lichtung.id) }}
    >
      <Popup className="lichtung-popup">
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textAlign: 'center', padding: '4px 0' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0A0A0A', margin: 0 }}>
            {lichtung.name}
          </p>
        </div>
      </Popup>
    </Marker>
  )
}
