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
    <div className="fixed bottom-6 left-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={onToggleLights}
        className="rounded-full flex items-center justify-center shadow-sm"
        title="Lichter"
        style={{
          width: BTN_SIZE, height: BTN_SIZE,
          background: showLights ? '#fff' : 'rgba(255,255,255,0.5)',
          border: showLights ? '2px solid #D4A843' : '1px solid rgba(10,10,10,0.08)',
          cursor: 'pointer',
          opacity: showLights ? 1 : 0.5,
        }}
      >
        <Sparkles size={16} style={{ color: '#D4A843' }} />
      </button>

      <button
        onClick={onToggleEvents}
        className="rounded-full flex items-center justify-center shadow-sm"
        title="Veranstaltungen"
        style={{
          width: BTN_SIZE, height: BTN_SIZE,
          background: showEvents ? '#fff' : 'rgba(255,255,255,0.5)',
          border: showEvents ? '2px solid #5078C8' : '1px solid rgba(10,10,10,0.08)',
          cursor: 'pointer',
          opacity: showEvents ? 1 : 0.5,
        }}
      >
        <CalendarDays size={16} style={{ color: '#5078C8' }} />
      </button>
    </div>
  )
}
