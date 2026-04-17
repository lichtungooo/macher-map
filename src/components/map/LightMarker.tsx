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
          <stop offset="100%" stop-color="#D4A843" stop-opacity="0"/>
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
        <div style={{ padding: '4px 0', minWidth: '180px', maxWidth: '230px' }}>
          {/* Profilbild links + Name rechts — gleicher Stil wie DetailView */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: light.statement ? '8px' : '0' }}>
            {hasImage ? (
              <img src={data.image_path} alt=""
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(212,168,67,0.3)', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(212,168,67,0.08)', border: '2px solid rgba(212,168,67,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', color: '#D4A843' }}>{light.name?.charAt(0) || '?'}</span>
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem', fontWeight: 500, color: '#0A0A0A', margin: 0 }}>
                {light.name}
              </p>
            </div>
          </div>

          {/* Statement */}
          {light.statement && (
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.82rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.5)', margin: '0 0 8px', lineHeight: 1.5 }}>
              "{light.statement.length > 80 ? light.statement.slice(0, 80).trim() + '...' : light.statement}"
            </p>
          )}

          {/* Mehr lesen */}
          {onShowProfile && (
            <button
              onClick={(e) => { e.stopPropagation(); onShowProfile(light) }}
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 500,
                color: '#D4A843', background: 'rgba(212,168,67,0.08)',
                border: '1px solid rgba(212,168,67,0.2)', borderRadius: '6px',
                padding: '5px 14px', cursor: 'pointer', width: '100%',
              }}
            >
              Mehr lesen
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  )
}
