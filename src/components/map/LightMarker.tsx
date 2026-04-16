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
  return (
    <Marker position={light.position} icon={lightIcon}>
      <Popup className="light-popup">
        <div style={{ textAlign: 'center', padding: '4px 0', minWidth: '160px', maxWidth: '200px' }}>
          {/* Profilbild — nur wenn vorhanden, kein Buchstaben-Fallback */}
          {(light as any).image_path && (
            <img
              src={(light as any).image_path}
              alt=""
              style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 8px', border: '2px solid rgba(212,168,67,0.4)', display: 'block' }}
            />
          )}
          {light.name && (
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.92rem', fontWeight: 500, color: 'rgba(10,10,10,0.7)', margin: '0 0 4px' }}>
              {light.name}
            </p>
          )}
          {light.statement && (
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.85rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.55)', margin: '0 0 10px', lineHeight: 1.5 }}>
              "{light.statement.length > 90 ? light.statement.slice(0, 90).trim() + '…' : light.statement}"
            </p>
          )}
          {onShowProfile && (
            <button
              onClick={(e) => { e.stopPropagation(); onShowProfile(light) }}
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 500,
                color: '#D4A843', background: 'rgba(212,168,67,0.08)',
                border: '1px solid rgba(212,168,67,0.2)', borderRadius: '6px',
                padding: '5px 14px', cursor: 'pointer',
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
