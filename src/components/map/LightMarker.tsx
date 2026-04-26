import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { LightPin } from '../../context/AppContext'

function createMacherIcon() {
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="mp" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#E8751A" flood-opacity="0.3"/>
        </filter>
      </defs>
      <circle cx="16" cy="16" r="14" fill="#E8751A" filter="url(#mp)" stroke="white" stroke-width="2"/>
      <!-- Wrench silhouette -->
      <g transform="translate(9, 8)" fill="white" opacity="0.95">
        <circle cx="7" cy="4" r="3.5" fill="none" stroke="white" stroke-width="1.8"/>
        <rect x="6" y="6" width="2" height="8" rx="0.5"/>
      </g>
    </svg>
  `
  return L.divIcon({
    html: `<div class="macher-pin-marker">${svg}</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  })
}

const macherIcon = createMacherIcon()

interface LightMarkerProps {
  light: LightPin
  onShowProfile?: (light: LightPin) => void
}

export function LightMarker({ light, onShowProfile }: LightMarkerProps) {
  const data = light as any
  const hasImage = !!data.image_path

  return (
    <Marker position={light.position} icon={macherIcon}>
      <Popup className="macher-popup">
        <div style={{ padding: '4px 0', minWidth: '160px', maxWidth: '240px', textAlign: 'center' }}>
          {hasImage ? (
            <img src={data.image_path} alt=""
              style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #E8751A', margin: '0 auto 8px', display: 'block' }} />
          ) : (
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#E8751A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.3rem', fontWeight: 700, color: 'white' }}>{light.name?.charAt(0) || '?'}</span>
            </div>
          )}

          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.05rem', fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px' }}>
            {light.name}
          </p>

          {light.statement && (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.5)', margin: '0 0 10px', lineHeight: 1.5 }}>
              "{light.statement.length > 80 ? light.statement.slice(0, 80).trim() + '...' : light.statement}"
            </p>
          )}

          {onShowProfile && (
            <button
              onClick={(e) => { e.stopPropagation(); onShowProfile(light) }}
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600,
                color: 'white', background: '#E8751A',
                border: 'none', borderRadius: '6px',
                padding: '7px 20px', cursor: 'pointer',
              }}
            >
              Profil ansehen
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  )
}
