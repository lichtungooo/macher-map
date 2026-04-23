import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Projekt-Marker: rosa Herz mit optionalem Progress-Ring
function createProjectIcon(progress: number) {
  // progress: 0..1
  const radius = 14
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)))

  const svg = `
    <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="prj" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFF0F5" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="#E8C4D2" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="#C07090" stop-opacity="0.4"/>
        </radialGradient>
      </defs>
      <circle cx="18" cy="18" r="16" fill="url(#prj)" stroke="#C07090" stroke-width="1.5" opacity="0.9"/>
      <circle cx="18" cy="18" r="${radius}" fill="none" stroke="rgba(192,112,144,0.2)" stroke-width="2"/>
      ${progress > 0 ? `<circle cx="18" cy="18" r="${radius}" fill="none" stroke="#C07090" stroke-width="2"
        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"
        transform="rotate(-90 18 18)" opacity="0.9"/>` : ''}
      <path d="M18 24 l-5.5 -5.5 a3.5 3.5 0 0 1 5.5 -4.5 a3.5 3.5 0 0 1 5.5 4.5 z"
        fill="#C07090" opacity="0.95" transform="translate(0 -1)"/>
    </svg>
  `
  return L.divIcon({
    html: `<div class="project-marker">${svg}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
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
      <Popup className="project-popup">
        <div style={{ padding: '4px 0', minWidth: 160, maxWidth: 240, textAlign: 'center' }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.05rem', fontWeight: 500, color: '#1A1A1A', margin: '0 0 8px' }}>
            {project.title}
          </p>
          {project.goal_amount && project.goal_amount > 0 && project.current_amount && project.current_amount > 0 ? (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(10,10,10,0.5)', margin: '0 0 8px' }}>
              {Math.round(progress * 100)}% &middot; {project.current_amount} / {project.goal_amount} &euro;
            </p>
          ) : null}
          <button
            onClick={(e) => { e.stopPropagation(); onClick(project.id) }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.7rem',
              fontWeight: 500,
              color: '#C07090',
              background: 'rgba(192,112,144,0.08)',
              border: '1px solid rgba(192,112,144,0.22)',
              borderRadius: '6px',
              padding: '6px 18px',
              cursor: 'pointer',
            }}
          >
            Zum Projekt
          </button>
        </div>
      </Popup>
    </Marker>
  )
}
