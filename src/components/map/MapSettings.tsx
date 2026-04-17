import { useState, useEffect } from 'react'
import { X, Map, Sparkles, CalendarDays, Check, Settings, User, LocateFixed } from 'lucide-react'

const LAYERS = [
  { key: 'osm_de', label: 'OpenStreetMap DE' },
  { key: 'osm', label: 'OpenStreetMap' },
  { key: 'voyager', label: 'Voyager' },
  { key: 'positron', label: 'Positron' },
]

type Tab = 'general' | 'map' | 'calendar' | 'profile'

interface MapSettingsProps {
  showLights: boolean
  showEvents: boolean
  onToggleLights: () => void
  onToggleEvents: () => void
  onClose: () => void
}

export function MapSettings({ showLights, showEvents, onToggleLights, onToggleEvents, onClose }: MapSettingsProps) {
  const [tab, setTab] = useState<Tab>('general')
  const [currentLayer, setCurrentLayer] = useState(localStorage.getItem('lichtung-tile-layer') || 'osm_de')
  const [autoLight, setAutoLight] = useState(() => localStorage.getItem('lichtung-auto-light') === '1')
  const [pushEnabled, setPushEnabled] = useState(false)

  useEffect(() => {
    if ('Notification' in window) setPushEnabled(Notification.permission === 'granted')
  }, [])

  const switchLayer = (key: string) => {
    setCurrentLayer(key)
    localStorage.setItem('lichtung-tile-layer', key)
    window.location.reload()
  }

  const font = { fontFamily: 'Inter, sans-serif' as const }
  const labelStyle = { ...font, fontSize: '0.62rem', fontWeight: 500 as const, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(10,10,10,0.3)', marginBottom: '6px' }

  const TABS: { key: Tab; icon: any; label: string }[] = [
    { key: 'general', icon: Settings, label: 'Allgemein' },
    { key: 'map', icon: Map, label: 'Karte' },
    { key: 'calendar', icon: CalendarDays, label: 'Kalender' },
    { key: 'profile', icon: User, label: 'Profil' },
  ]

  return (
    <div
      className="fixed z-[1500] rounded-2xl shadow-xl overflow-hidden"
      style={{ top: '70px', right: '16px', width: '280px', background: '#fff', border: '1px solid rgba(10,10,10,0.06)', animation: 'fade-in-up 0.15s ease-out' }}
    >
      {/* Header mit Tabs */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(10,10,10,0.04)' }}>
        <div className="flex items-center gap-0.5">
          {TABS.map(t => (
            <div key={t.key} className="relative group">
              <button onClick={() => setTab(t.key)}
                className="rounded-full flex items-center justify-center"
                style={{ width: 32, height: 32, background: tab === t.key ? 'rgba(212,168,67,0.1)' : 'transparent', border: 'none', cursor: 'pointer' }}>
                <t.icon size={14} style={{ color: tab === t.key ? '#D4A843' : 'rgba(10,10,10,0.25)' }} />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
                style={{ background: '#0A0A0A', whiteSpace: 'nowrap', zIndex: 10 }}>
                <span style={{ ...font, fontSize: '0.55rem', color: '#fff' }}>{t.label}</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.25)' }}>
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {tab === 'general' && (
          <>
            {/* Standort */}
            <div>
              <p style={labelStyle}>Standort</p>
              <button
                onClick={() => {
                  const next = !autoLight
                  setAutoLight(next)
                  localStorage.setItem('lichtung-auto-light', next ? '1' : '0')
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg"
                style={{ background: autoLight ? 'rgba(212,168,67,0.05)' : '#FAFAF8', border: '1px solid ' + (autoLight ? 'rgba(212,168,67,0.2)' : 'rgba(10,10,10,0.04)'), cursor: 'pointer', textAlign: 'left' }}>
                <LocateFixed size={14} style={{ color: autoLight ? '#D4A843' : 'rgba(10,10,10,0.25)' }} />
                <div style={{ flex: 1 }}>
                  <span style={{ ...font, fontSize: '0.75rem', color: '#0A0A0A', display: 'block' }}>Licht automatisch setzen</span>
                  <span style={{ ...font, fontSize: '0.6rem', color: 'rgba(10,10,10,0.35)' }}>Beim Oeffnen der Karte</span>
                </div>
                {autoLight && <Check size={13} style={{ color: '#D4A843' }} />}
              </button>
            </div>

            {/* Push */}
            <div>
              <p style={labelStyle}>Benachrichtigungen</p>
              <button
                onClick={async () => {
                  if (!('Notification' in window)) return
                  if (pushEnabled) { setPushEnabled(false); return }
                  const perm = await Notification.requestPermission()
                  if (perm === 'granted') {
                    setPushEnabled(true)
                    new Notification('Licht fuer Frieden', { body: 'Push aktiv.', icon: '/favicon.svg' })
                  }
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg"
                style={{ background: pushEnabled ? 'rgba(212,168,67,0.05)' : '#FAFAF8', border: '1px solid ' + (pushEnabled ? 'rgba(212,168,67,0.2)' : 'rgba(10,10,10,0.04)'), cursor: 'pointer', textAlign: 'left' }}>
                <CalendarDays size={14} style={{ color: pushEnabled ? '#D4A843' : 'rgba(10,10,10,0.25)' }} />
                <span style={{ ...font, fontSize: '0.75rem', color: '#0A0A0A', flex: 1 }}>Push-Nachrichten</span>
                {pushEnabled && <Check size={13} style={{ color: '#D4A843' }} />}
              </button>
            </div>
          </>
        )}

        {tab === 'map' && (
          <>
            {/* Anzeige */}
            <div>
              <p style={labelStyle}>Anzeige</p>
              <div className="space-y-1.5">
                <button onClick={onToggleLights} className="w-full flex items-center gap-3 p-2.5 rounded-lg"
                  style={{ background: showLights ? 'rgba(212,168,67,0.05)' : '#FAFAF8', border: '1px solid ' + (showLights ? 'rgba(212,168,67,0.2)' : 'rgba(10,10,10,0.04)'), cursor: 'pointer', textAlign: 'left' }}>
                  <Sparkles size={14} style={{ color: showLights ? '#D4A843' : 'rgba(10,10,10,0.25)' }} />
                  <span style={{ ...font, fontSize: '0.75rem', color: showLights ? '#0A0A0A' : 'rgba(10,10,10,0.4)', flex: 1 }}>Lichter</span>
                  {showLights && <Check size={13} style={{ color: '#D4A843' }} />}
                </button>
                <button onClick={onToggleEvents} className="w-full flex items-center gap-3 p-2.5 rounded-lg"
                  style={{ background: showEvents ? 'rgba(212,168,67,0.05)' : '#FAFAF8', border: '1px solid ' + (showEvents ? 'rgba(212,168,67,0.2)' : 'rgba(10,10,10,0.04)'), cursor: 'pointer', textAlign: 'left' }}>
                  <CalendarDays size={14} style={{ color: showEvents ? '#0A0A0A' : 'rgba(10,10,10,0.25)' }} />
                  <span style={{ ...font, fontSize: '0.75rem', color: showEvents ? '#0A0A0A' : 'rgba(10,10,10,0.4)', flex: 1 }}>Veranstaltungen</span>
                  {showEvents && <Check size={13} style={{ color: '#D4A843' }} />}
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
                      border: '1px solid ' + (currentLayer === l.key ? 'rgba(212,168,67,0.25)' : 'rgba(10,10,10,0.04)'),
                      cursor: 'pointer',
                    }}>
                    <Map size={11} style={{ color: currentLayer === l.key ? '#D4A843' : 'rgba(10,10,10,0.25)' }} />
                    <span style={{ ...font, fontSize: '0.62rem', fontWeight: currentLayer === l.key ? 600 : 400, color: currentLayer === l.key ? '#D4A843' : 'rgba(10,10,10,0.45)' }}>
                      {l.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'calendar' && (
          <div>
            <p style={labelStyle}>Kalender</p>
            <p style={{ ...font, fontSize: '0.75rem', color: 'rgba(10,10,10,0.4)', lineHeight: 1.5 }}>
              Kalender-Einstellungen werden hier kuenftig verfuegbar sein — z.B. Standard-Umkreis, Benachrichtigungen vor Terminen.
            </p>
          </div>
        )}

        {tab === 'profile' && (
          <div>
            <p style={labelStyle}>Profil</p>
            <p style={{ ...font, fontSize: '0.75rem', color: 'rgba(10,10,10,0.4)', lineHeight: 1.5 }}>
              Profil-Einstellungen findest du im Profil-Dialog (Profil-Icon oben rechts, dann Zahnrad-Tab).
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
