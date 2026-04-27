import { Marker, Popup } from 'react-leaflet'
import { createWerkstattPin, getWerkstattColor } from './pins'

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
  const tags = (lichtung as any).tags
  const color = getWerkstattColor(tags)
  const icon = createWerkstattPin(tags)

  return (
    <Marker position={[lichtung.lat, lichtung.lng]} icon={icon}>
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

          {tags && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', marginBottom: '8px' }}>
              {tags.split(',').slice(0, 3).map((tag: string) => (
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
