import { useState } from 'react'
import { Sparkles, CalendarDays, Map } from 'lucide-react'

const BTN_SIZE = 38

const LAYERS = [
  { key: 'osm_de', label: 'Deutsch (DE)' },
  { key: 'osm', label: 'Standard' },
  { key: 'voyager', label: 'Voyager' },
  { key: 'positron', label: 'Hell' },
]

interface MapFiltersProps {
  showLights: boolean
  showEvents: boolean
  onToggleLights: () => void
  onToggleEvents: () => void
}

export function MapFilters({ showLights, showEvents, onToggleLights, onToggleEvents }: MapFiltersProps) {
  const [showLayerMenu, setShowLayerMenu] = useState(false)
  const currentLayer = localStorage.getItem('lichtung-tile-layer') || 'osm_de'

  const switchLayer = (key: string) => {
    localStorage.setItem('lichtung-tile-layer', key)
    setShowLayerMenu(false)
    window.location.reload() // Leaflet braucht Reload fuer Tile-Wechsel
  }

  return (
    <div className="fixed left-4 bottom-6 z-[1000] flex flex-col gap-1.5">
      {/* Layer Picker */}
      <div className="relative">
        {showLayerMenu && (
          <div className="absolute left-12 bottom-0 rounded-lg shadow-lg p-1.5 flex flex-col gap-1" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.08)', minWidth: '120px' }}>
            {LAYERS.map(l => (
              <button
                key={l.key}
                onClick={() => switchLayer(l.key)}
                className="px-3 py-1.5 rounded text-left"
                style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: currentLayer === l.key ? 600 : 400,
                  color: currentLayer === l.key ? '#D4A843' : 'rgba(10,10,10,0.5)',
                  background: currentLayer === l.key ? 'rgba(212,168,67,0.06)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="rounded-full flex items-center justify-center shadow-sm"
          title="Kartenstil"
          style={{ width: BTN_SIZE, height: BTN_SIZE, background: '#fff', border: '2px solid rgba(10,10,10,0.12)', cursor: 'pointer' }}
        >
          <Map size={16} style={{ color: 'rgba(10,10,10,0.4)' }} />
        </button>
      </div>

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
