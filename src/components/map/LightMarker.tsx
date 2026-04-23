import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { LightPin } from '../../context/AppContext'

function createLightIcon() {
  const svg = `
    <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFFFF0" stop-opacity="1"/>
          <stop offset="30%" stop-color="#FFF8D0" stop-opacity="0.9"/>
          <stop offset="60%" stop-color="#F5E090" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#E8751A" stop-opacity="0"/>
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      <circle cx="14" cy="14" r="12" fill="url(#lg)" filter="url(#glow)" opacity="0.9"/>
      <circle cx="14" cy="14" r="4" fill="#FFFFF0" opacity="0.95"/>
    </svg>
  `
  return L.divIcon({
    html: `<div class="light-pin-marker">${svg}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

const lightIcon = createLightIcon()

interface LightMarkerProps {
  light: LightPin
  onShowProfile?: (light: LightPin) => void
}

export function LightMarker({ light, onShowProfile }: LightMarkerProps) {
  const data = light as any
  const hasImage = !!data.image_path

  return (
    <Marker position={light.position} icon={lightIcon}>
      <Popup className="light-popup">
        <div style={{ padding: '4px 0', minWidth: '160px', maxWidth: '220px', textAlign: 'center' }}>
          {/* Profilbild mittig */}
          {hasImage ? (
            <img src={data.image_path} alt=""
              style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(212,168,67,0.3)', margin: '0 auto 8px', display: 'block' }} />
          ) : (
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(212,168,67,0.08)', border: '2px solid rgba(212,168,67,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.3rem', color: '#E8751A' }}>{light.name?.charAt(0) || '?'}</span>
            </div>
          )}

          {/* Name mittig */}
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.05rem', fontWeight: 500, color: '#1A1A1A', margin: '0 0 4px' }}>
            {light.name}
          </p>

          {/* Statement mittig */}
          {light.statement && (
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.82rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.5)', margin: '0 0 10px', lineHeight: 1.5 }}>
              "{light.statement.length > 80 ? light.statement.slice(0, 80).trim() + '...' : light.statement}"
            </p>
          )}

          {/* Zum Profil */}
          {onShowProfile && (
            <button
              onClick={(e) => { e.stopPropagation(); onShowProfile(light) }}
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 500,
                color: '#E8751A', background: 'rgba(212,168,67,0.08)',
                border: '1px solid rgba(212,168,67,0.2)', borderRadius: '6px',
                padding: '6px 18px', cursor: 'pointer',
              }}
            >
              Zum Profil
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  )
}
