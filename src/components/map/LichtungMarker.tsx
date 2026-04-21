import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Die Ursprungs-Lichtung (Kassel, Harleshaeuser Wald) — von hier breitet sich das Licht aus
const ORIGIN_LICHTUNG_ID = '24615195-da9f-4fd4-956a-8aceb374bfc3'

function createLichtungIcon() {
  // Normale Lichtung — gruener Kreis mit goldenem Kern
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

function createOriginIcon() {
  // Ursprungs-Lichtung — kraftvolle, pulsierende Aura mit goldenem Herzen
  // Drei expandierende Ringe + atmender Kern + ausgebreitete Strahlen
  const svg = `
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <defs>
        <radialGradient id="originCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFFFF8" stop-opacity="1"/>
          <stop offset="30%" stop-color="#FFF8D0" stop-opacity="0.95"/>
          <stop offset="60%" stop-color="#F5E090" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="#D4A843" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="originAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#D4A843" stop-opacity="0.4"/>
          <stop offset="50%" stop-color="#7BAE5E" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#7BAE5E" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <!-- Atmosphaerische Aussen-Aura -->
      <circle cx="60" cy="60" r="58" fill="url(#originAura)" class="origin-breathe"/>

      <!-- Drei expandierende Ringe -->
      <circle cx="60" cy="60" r="22" fill="none" stroke="#D4A843" stroke-width="1.5" opacity="0.5" class="origin-ring origin-ring-1"/>
      <circle cx="60" cy="60" r="22" fill="none" stroke="#D4A843" stroke-width="1.5" opacity="0.5" class="origin-ring origin-ring-2"/>
      <circle cx="60" cy="60" r="22" fill="none" stroke="#D4A843" stroke-width="1.5" opacity="0.5" class="origin-ring origin-ring-3"/>

      <!-- Mittlerer gruener Ring -->
      <circle cx="60" cy="60" r="22" fill="none" stroke="#7BAE5E" stroke-width="2" opacity="0.75"/>

      <!-- Goldener Kern mit Halo -->
      <circle cx="60" cy="60" r="14" fill="url(#originCore)" class="origin-breathe" style="animation-delay: 0.3s"/>

      <!-- Innerer Licht-Kern -->
      <circle cx="60" cy="60" r="4" fill="#FFFFF8" opacity="0.95"/>
    </svg>
  `
  return L.divIcon({
    html: `<div class="origin-lichtung-marker">${svg}</div>`,
    className: '',
    iconSize: [120, 120],
    iconAnchor: [60, 60],
    popupAnchor: [0, -40],
  })
}

const lichtungIcon = createLichtungIcon()
const originIcon = createOriginIcon()

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
  const isOrigin = lichtung.id === ORIGIN_LICHTUNG_ID
  const icon = isOrigin ? originIcon : lichtungIcon

  return (
    <Marker
      position={[lichtung.lat, lichtung.lng]}
      icon={icon}
      eventHandlers={{ click: () => onClick(lichtung.id) }}
      zIndexOffset={isOrigin ? 1000 : 0}
    >
      <Popup className="lichtung-popup">
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textAlign: 'center', padding: '4px 0' }}>
          {isOrigin && (
            <p style={{ fontSize: '0.7rem', fontFamily: 'Inter, sans-serif', color: '#D4A843', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 4px', fontWeight: 500 }}>
              Ursprung
            </p>
          )}
          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0A0A0A', margin: 0 }}>
            {lichtung.name}
          </p>
        </div>
      </Popup>
    </Marker>
  )
}
