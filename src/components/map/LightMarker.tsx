import { Marker, Popup } from 'react-leaflet'
import type { LightPin } from '../../context/AppContext'
import { createMacherPin } from './pins'

const macherIcon = createMacherPin()

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
