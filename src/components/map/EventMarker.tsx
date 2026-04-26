import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { EventItem } from '../../context/AppContext'

const EVENT_COLORS: Record<string, string> = {
  workshop: '#E8751A',
  kurs: '#2D7DD2',
  bau: '#45B764',
  wettbewerb: '#D4A020',
  treffen: '#9B59B6',
  offen: '#7A8B99',
}

function createEventIcon(type: string) {
  const color = EVENT_COLORS[type] || EVENT_COLORS.workshop
  const svg = `
    <svg width="36" height="42" viewBox="0 0 36 42" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="ev" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${color}" flood-opacity="0.35"/>
        </filter>
      </defs>
      <path d="M18 2C9 2 2 9 2 18c0 13 16 22 16 22s16-9 16-22C34 9 27 2 18 2z"
        fill="${color}" filter="url(#ev)" stroke="white" stroke-width="1.5"/>
      <!-- Lightning bolt = Event/Action -->
      <path d="M20 10l-6 9h4l-2 8 6-9h-4l2-8z" fill="white" opacity="0.95"/>
    </svg>
  `
  return L.divIcon({
    html: `<div class="event-pin-marker">${svg}</div>`,
    className: '',
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -44],
  })
}

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
  const icon = createEventIcon(type)

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
