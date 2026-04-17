import { useState } from 'react'
import { X, Map, Sparkles, CalendarDays, Check } from 'lucide-react'

const LAYERS = [
  { key: 'osm_de', label: 'OpenStreetMap DE' },
  { key: 'osm', label: 'OpenStreetMap' },
  { key: 'voyager', label: 'Voyager' },
  { key: 'positron', label: 'Positron' },
]

interface MapSettingsProps {
  showLights: boolean
  showEvents: boolean
  onToggleLights: () => void
  onToggleEvents: () => void
  onClose: () => void
}

export function MapSettings({ showLights, showEvents, onToggleLights, onToggleEvents, onClose }: MapSettingsProps) {
  const [currentLayer, setCurrentLayer] = useState(localStorage.getItem('lichtung-tile-layer') || 'osm_de')

  const switchLayer = (key: string) => {
    setCurrentLayer(key)
    localStorage.setItem('lichtung-tile-layer', key)
    window.location.reload()
  }

  const font = { fontFamily: 'Inter, sans-serif' as const }
  const labelStyle = { ...font, fontSize: '0.68rem', fontWeight: 500 as const, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(10,10,10,0.35)', marginBottom: '8px' }

  return (
    <div
      className="fixed z-[1500] rounded-2xl shadow-xl overflow-hidden"
      style={{ top: '70px', right: '16px', width: '260px', background: '#fff', border: '1px solid rgba(10,10,10,0.06)', animation: 'fade-in-up 0.15s ease-out' }}
    >
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(10,10,10,0.04)' }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', fontWeight: 500, color: '#0A0A0A' }}>Einstellungen</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.25)' }}>
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Anzeige */}
        <div>
          <p style={labelStyle}>Anzeige</p>
          <div className="space-y-2">
            <button onClick={onToggleLights} className="w-full flex items-center gap-3 p-2.5 rounded-lg"
              style={{ background: showLights ? 'rgba(212,168,67,0.05)' : '#FAFAF8', border: showLights ? '1px solid rgba(212,168,67,0.2)' : '1px solid rgba(10,10,10,0.04)', cursor: 'pointer', textAlign: 'left' }}>
              <Sparkles size={15} style={{ color: showLights ? '#D4A843' : 'rgba(10,10,10,0.25)' }} />
              <span style={{ ...font, fontSize: '0.78rem', color: showLights ? '#0A0A0A' : 'rgba(10,10,10,0.4)', flex: 1 }}>Lichter</span>
              {showLights && <Check size={14} style={{ color: '#D4A843' }} />}
            </button>
            <button onClick={onToggleEvents} className="w-full flex items-center gap-3 p-2.5 rounded-lg"
              style={{ background: showEvents ? 'rgba(212,168,67,0.05)' : '#FAFAF8', border: showEvents ? '1px solid rgba(212,168,67,0.2)' : '1px solid rgba(10,10,10,0.04)', cursor: 'pointer', textAlign: 'left' }}>
              <CalendarDays size={15} style={{ color: showEvents ? '#0A0A0A' : 'rgba(10,10,10,0.25)' }} />
              <span style={{ ...font, fontSize: '0.78rem', color: showEvents ? '#0A0A0A' : 'rgba(10,10,10,0.4)', flex: 1 }}>Veranstaltungen</span>
              {showEvents && <Check size={14} style={{ color: '#D4A843' }} />}
            </button>
          </div>
        </div>

        {/* Kartenstil */}
        <div>
          <p style={labelStyle}>Kartenstil</p>
          <div className="grid grid-cols-2 gap-1.5">
            {LAYERS.map(l => (
              <button key={l.key} onClick={() => switchLayer(l.key)}
                className="flex items-center gap-1.5 p-2 rounded-lg"
                style={{
                  background: currentLayer === l.key ? 'rgba(212,168,67,0.06)' : '#FAFAF8',
                  border: currentLayer === l.key ? '1px solid rgba(212,168,67,0.25)' : '1px solid rgba(10,10,10,0.04)',
                  cursor: 'pointer',
                }}>
                <Map size={11} style={{ color: currentLayer === l.key ? '#D4A843' : 'rgba(10,10,10,0.25)' }} />
                <span style={{ ...font, fontSize: '0.65rem', fontWeight: currentLayer === l.key ? 600 : 400, color: currentLayer === l.key ? '#D4A843' : 'rgba(10,10,10,0.45)' }}>
                  {l.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
