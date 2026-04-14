import { CalendarDays } from 'lucide-react'

const BTN_SIZE = 38

function LightIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" fill="#FFF8D0" stroke="#D4A843" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2" fill="#D4A843" opacity="0.6" />
    </svg>
  )
}

interface MapFiltersProps {
  showLights: boolean
  showEvents: boolean
  onToggleLights: () => void
  onToggleEvents: () => void
}

export function MapFilters({ showLights, showEvents, onToggleLights, onToggleEvents }: MapFiltersProps) {
  return (
    <div className="fixed left-4 z-[1000] flex flex-col gap-1.5" style={{ top: 'calc(50% + 50px)' }}>
      <button
        onClick={onToggleLights}
        className="rounded-full flex items-center justify-center shadow-sm transition-all"
        title="Lichter ein/aus"
        style={{
          width: BTN_SIZE, height: BTN_SIZE,
          background: showLights ? '#fff' : 'rgba(255,255,255,0.4)',
          border: showLights ? '2px solid #D4A843' : '1px solid rgba(10,10,10,0.08)',
          cursor: 'pointer',
          opacity: showLights ? 1 : 0.4,
        }}
      >
        <LightIcon size={18} />
      </button>

      <button
        onClick={onToggleEvents}
        className="rounded-full flex items-center justify-center shadow-sm transition-all"
        title="Veranstaltungen ein/aus"
        style={{
          width: BTN_SIZE, height: BTN_SIZE,
          background: showEvents ? '#fff' : 'rgba(255,255,255,0.4)',
          border: showEvents ? '2px solid #0A0A0A' : '1px solid rgba(10,10,10,0.08)',
          cursor: 'pointer',
          opacity: showEvents ? 1 : 0.4,
        }}
      >
        <CalendarDays size={16} style={{ color: '#0A0A0A' }} />
      </button>
    </div>
  )
}
