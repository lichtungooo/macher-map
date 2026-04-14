import { Sparkles, CalendarDays } from 'lucide-react'

const BTN_SIZE = 38

interface MapFiltersProps {
  showLights: boolean
  showEvents: boolean
  onToggleLights: () => void
  onToggleEvents: () => void
}

export function MapFilters({ showLights, showEvents, onToggleLights, onToggleEvents }: MapFiltersProps) {
  return (
    <div className="fixed left-4 bottom-6 z-[1000] flex flex-col gap-1.5">
      <button
        onClick={onToggleLights}
        className="rounded-full flex items-center justify-center shadow-sm transition-all"
        title="Lichter ein/aus"
        style={{
          width: BTN_SIZE, height: BTN_SIZE,
          background: '#fff',
          border: showLights ? '2px solid #D4A843' : '2px solid rgba(10,10,10,0.12)',
          cursor: 'pointer',
          opacity: showLights ? 1 : 0.5,
        }}
      >
        <Sparkles size={16} style={{ color: showLights ? '#D4A843' : 'rgba(10,10,10,0.3)' }} />
      </button>

      <button
        onClick={onToggleEvents}
        className="rounded-full flex items-center justify-center shadow-sm transition-all"
        title="Veranstaltungen ein/aus"
        style={{
          width: BTN_SIZE, height: BTN_SIZE,
          background: '#fff',
          border: showEvents ? '2px solid #0A0A0A' : '2px solid rgba(10,10,10,0.12)',
          cursor: 'pointer',
          opacity: showEvents ? 1 : 0.5,
        }}
      >
        <CalendarDays size={16} style={{ color: showEvents ? '#0A0A0A' : 'rgba(10,10,10,0.3)' }} />
      </button>
    </div>
  )
}
