import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { EventItem } from '../../context/AppContext'

function createEventIcon() {
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="eg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#E8D5F0" stop-opacity="1"/>
          <stop offset="60%" stop-color="#C9A8E0" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#A07CC0" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#eg)" opacity="0.85"/>
      <circle cx="16" cy="16" r="5" fill="#E8D5F0" opacity="0.95"/>
      <text x="16" y="20" text-anchor="middle" font-size="10" fill="#6B4C8A">&#9733;</text>
    </svg>
  `
  return L.divIcon({
    html: `<div class="event-pin-marker">${svg}</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  })
}

const eventIcon = createEventIcon()

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
  return (
    <Marker position={event.position} icon={eventIcon}>
      <Popup className="event-popup">
        <div style={{ padding: '4px 0', minWidth: '160px', maxWidth: '220px', textAlign: 'center' }}>
          {/* Titel */}
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem', fontWeight: 600, color: '#0A0A0A', margin: '0 0 2px' }}>
            {event.title}
          </p>

          {/* Hashtag */}
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: '#D4A843', margin: '0 0 4px' }}>
            #{event.type}
          </p>

          {/* Datum/Uhrzeit */}
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(10,10,10,0.45)', margin: '0 0 8px' }}>
            {formatShortDate(event.start)}
          </p>

          {/* Zum Event */}
          {onShowEvent && (
            <button
              onClick={(e) => { e.stopPropagation(); onShowEvent(event) }}
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 500,
                color: '#6B4C8A', background: 'rgba(160,124,192,0.08)',
                border: '1px solid rgba(160,124,192,0.2)', borderRadius: '6px',
                padding: '6px 18px', cursor: 'pointer',
              }}
            >
              Zum Event
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  )
}
