import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { EventItem } from '../../context/AppContext'

const EVENT_TYPE_LABELS: Record<EventItem['type'], string> = {
  meditation: 'Meditation',
  gebet: 'Gebet',
  fest: 'Fest',
  begegnung: 'Begegnung',
  tanz: 'Tanz',
  stille: 'Stille',
}

const RECURRING_LABELS: Record<string, string> = {
  vollmond: 'Jeden Vollmond',
  neumond: 'Jeden Neumond',
  woechentlich: 'Woechentlich',
  monatlich: 'Monatlich',
}

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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface EventMarkerProps {
  event: EventItem
}

export function EventMarker({ event }: EventMarkerProps) {
  return (
    <Marker position={event.position} icon={eventIcon}>
      <Popup className="event-popup">
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", padding: '4px 0', maxWidth: '220px' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0A0A0A', margin: '0 0 2px' }}>
            {event.title}
          </p>

          <p style={{ fontSize: '0.72rem', fontFamily: 'Inter, sans-serif', color: '#D4A843', margin: '0 0 6px', fontWeight: 400 }}>
            {EVENT_TYPE_LABELS[event.type]}
            {event.recurring && ` · ${RECURRING_LABELS[event.recurring]}`}
          </p>

          <p style={{ fontSize: '0.78rem', fontFamily: 'Inter, sans-serif', color: 'rgba(10,10,10,0.5)', margin: '0 0 6px' }}>
            {formatDate(event.start)}
          </p>

          <p style={{ fontSize: '0.88rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.6)', margin: 0, lineHeight: 1.5 }}>
            {event.description}
          </p>
        </div>
      </Popup>
    </Marker>
  )
}
