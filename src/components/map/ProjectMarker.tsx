import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

function createProjectIcon(progress: number) {
  const color = '#45B764'
  const radius = 13
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)))

  const svg = `
    <svg width="40" height="46" viewBox="0 0 40 46" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="pj" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${color}" flood-opacity="0.35"/>
        </filter>
      </defs>
      <path d="M20 2C10 2 2 10 2 20c0 14 18 24 18 24s18-10 18-24C38 10 30 2 20 2z"
        fill="${color}" filter="url(#pj)" stroke="white" stroke-width="1.5"/>
      <circle cx="20" cy="18" r="12" fill="white" opacity="0.95"/>
      <!-- Progress ring -->
      <circle cx="20" cy="18" r="${radius}" fill="none" stroke="rgba(69,183,100,0.2)" stroke-width="2.5"/>
      ${progress > 0 ? `<circle cx="20" cy="18" r="${radius}" fill="none" stroke="${color}" stroke-width="2.5"
        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"
        transform="rotate(-90 20 18)" opacity="0.9"/>` : ''}
      <!-- Gear/cog icon -->
      <g transform="translate(14, 12)" fill="${color}" opacity="0.8">
        <circle cx="6" cy="6" r="2.5" fill="none" stroke="${color}" stroke-width="1.5"/>
        <rect x="5" y="-1" width="2" height="3" rx="0.5"/>
        <rect x="5" y="10" width="2" height="3" rx="0.5"/>
        <rect x="-1" y="5" width="3" height="2" rx="0.5"/>
        <rect x="10" y="5" width="3" height="2" rx="0.5"/>
      </g>
    </svg>
  `
  return L.divIcon({
    html: `<div class="project-marker">${svg}</div>`,
    className: '',
    iconSize: [40, 46],
    iconAnchor: [20, 46],
    popupAnchor: [0, -48],
  })
}

interface ProjectData {
  id: string
  title: string
  description?: string
  lat: number
  lng: number
  goal_amount?: number
  current_amount?: number
  image_path?: string
  creator_name?: string
}

interface ProjectMarkerProps {
  project: ProjectData
  onClick: (id: string) => void
}

export function ProjectMarker({ project, onClick }: ProjectMarkerProps) {
  const progress = project.goal_amount && project.goal_amount > 0
    ? (project.current_amount || 0) / project.goal_amount
    : 0
  const icon = createProjectIcon(progress)

  return (
    <Marker
      position={[project.lat, project.lng]}
      icon={icon}
    >
      <Popup className="macher-popup">
        <div style={{ padding: '6px 0', minWidth: 180, maxWidth: 260, textAlign: 'center' }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.05rem', fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px' }}>
            {project.title}
          </p>
          {project.goal_amount && project.goal_amount > 0 ? (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 500, color: '#45B764', margin: '0 0 8px' }}>
              {Math.round(progress * 100)}% &middot; {project.current_amount || 0} / {project.goal_amount} &euro;
            </p>
          ) : null}
          <button
            onClick={(e) => { e.stopPropagation(); onClick(project.id) }}
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600,
              color: 'white', background: '#45B764',
              border: 'none', borderRadius: '6px',
              padding: '7px 20px', cursor: 'pointer',
            }}
          >
            Zum Projekt
          </button>
        </div>
      </Popup>
    </Marker>
  )
}
