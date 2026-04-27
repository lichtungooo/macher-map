import { Marker, Popup } from 'react-leaflet'
import { createProjectPin } from './pins'

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
  const icon = createProjectPin(progress)

  return (
    <Marker position={[project.lat, project.lng]} icon={icon}>
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
