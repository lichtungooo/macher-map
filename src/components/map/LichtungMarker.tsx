import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

const WERKSTATT_COLORS: Record<string, string> = {
  holz: '#C4883C',
  metall: '#7A8B99',
  elektronik: '#2D7DD2',
  '3ddruck': '#2D7DD2',
  cnc: '#2D7DD2',
  laser: '#2D7DD2',
  naehen: '#C07090',
  textil: '#C07090',
  keramik: '#B06840',
  toepfern: '#B06840',
  schmieden: '#E8751A',
  fahrrad: '#45B764',
  reparatur: '#45B764',
  siebdruck: '#9B59B6',
  lehm: '#8B7355',
  modellbau: '#E0A050',
  default: '#E8751A',
}

function getWerkstattColor(tags?: string): string {
  if (!tags) return WERKSTATT_COLORS.default
  for (const tag of tags.split(',')) {
    const c = WERKSTATT_COLORS[tag.trim()]
    if (c) return c
  }
  return WERKSTATT_COLORS.default
}

function createWerkstattIconSvg(color: string) {
  const svg = `
    <svg width="40" height="46" viewBox="0 0 40 46" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="ws" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${color}" flood-opacity="0.35"/>
        </filter>
      </defs>
      <path d="M20 2C10 2 2 10 2 20c0 14 18 24 18 24s18-10 18-24C38 10 30 2 20 2z"
        fill="${color}" filter="url(#ws)" stroke="white" stroke-width="1.5"/>
      <circle cx="20" cy="18" r="11" fill="white" opacity="0.95"/>
      <!-- Hammer icon -->
      <g transform="translate(13, 11)" fill="${color}" opacity="0.85">
        <rect x="6" y="0" width="2" height="8" rx="1"/>
        <rect x="2" y="0" width="10" height="4" rx="2"/>
        <rect x="6" y="7" width="2" height="7" rx="0.5"/>
      </g>
    </svg>
  `
  return L.divIcon({
    html: `<div class="werkstatt-marker">${svg}</div>`,
    className: '',
    iconSize: [40, 46],
    iconAnchor: [20, 46],
    popupAnchor: [0, -48],
  })
}

interface LichtungMarkerProps {
  lichtung: {
    id: string
    name: string
    description: string
    lat: number
    lng: number
    creator_name: string
    tags?: string
  }
  onClick: (id: string) => void
}

export function LichtungMarker({ lichtung, onClick }: LichtungMarkerProps) {
  const color = getWerkstattColor((lichtung as any).tags)
  const icon = createWerkstattIconSvg(color)

  return (
    <Marker
      position={[lichtung.lat, lichtung.lng]}
      icon={icon}
    >
      <Popup className="macher-popup">
        <div style={{ padding: '6px 0', minWidth: 180, maxWidth: 260, textAlign: 'center' }}>
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.05rem',
            fontWeight: 600,
            color: '#1A1A1A',
            margin: '0 0 4px',
          }}>
            {lichtung.name}
          </p>

          {(lichtung as any).tags && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', marginBottom: '8px' }}>
              {(lichtung as any).tags.split(',').slice(0, 3).map((tag: string) => (
                <span key={tag} style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 500,
                  color: color, background: `${color}15`, border: `1px solid ${color}30`,
                  borderRadius: '4px', padding: '2px 6px',
                }}>
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onClick(lichtung.id) }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'white',
              background: color,
              border: 'none',
              borderRadius: '6px',
              padding: '7px 20px',
              cursor: 'pointer',
            }}
          >
            Reinschauen
          </button>
        </div>
      </Popup>
    </Marker>
  )
}
