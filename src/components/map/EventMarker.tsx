import { Marker, Popup } from 'react-leaflet'
import type { EventItem } from '../../context/AppContext'
import { createEventPin, EVENT_COLORS } from './pins'

const EVENT_LABELS: Record<string, string> = {
  workshop: 'Workshop',
  kurs: 'Kurs',
  bau: 'Bau-Event',
  wettbewerb: 'Wettbewerb',
  treffen: 'Treffen',
  offen: 'Offene Werkstatt',
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ', ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

interface EventMarkerProps {
  event: EventItem
  onShowEvent?: (event: EventItem) => void
}

export function EventMarker({ event, onShowEvent }: EventMarkerProps) {
  const type = event.type || 'workshop'
  const color = EVENT_COLORS[type] || EVENT_COLORS.workshop
  const icon = createEventPin(type)

  return (
    <Marker position={event.position} icon={icon}>
      <Popup className="macher-popup">
        <div style={{ padding: '6px 0', minWidth: '180px', maxWidth: '260px', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px' }}>
            {event.title}
          </p>

          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 600,
            color: color, background: `${color}15`, border: `1px solid ${color}30`,
            borderRadius: '4px', padding: '2px 8px', display: 'inline-block', marginBottom: '4px',
          }}>
            {EVENT_LABELS[type] || type}
          </span>

          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(10,10,10,0.5)', margin: '4px 0 8px' }}>
            {formatShortDate(event.start)}
          </p>

          {onShowEvent && (
            <button
              onClick={(e) => { e.stopPropagation(); onShowEvent(event) }}
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600,
                color: 'white', background: color,
                border: 'none', borderRadius: '6px',
                padding: '7px 20px', cursor: 'pointer',
              }}
            >
              Reinschauen
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  )
}
