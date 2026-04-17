import { useState } from 'react'
import { Plus, X, CalendarDays, Sparkles, Trees } from 'lucide-react'

const BTN_SIZE = 46

interface ActionButtonProps {
  onSetLight: () => void
  onCreateEvent: () => void
  onCreateLichtung?: () => void
}

export function ActionButton({ onSetLight, onCreateEvent, onCreateLichtung }: ActionButtonProps) {
  const [open, setOpen] = useState(false)

  const SUB_BUTTONS = [
    ...(onCreateLichtung ? [{ icon: Trees, label: 'Ort platzieren', color: '#7BAE5E', onClick: onCreateLichtung }] : []),
    { icon: CalendarDays, label: 'Veranstaltung erstellen', color: '#5078C8', onClick: onCreateEvent },
    { icon: Sparkles, label: 'Licht platzieren', color: '#D4A843', onClick: onSetLight },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-2.5">
      {open && SUB_BUTTONS.map((btn, i) => (
        <div key={i} className="relative group">
          <button
            onClick={() => { btn.onClick(); setOpen(false) }}
            className="rounded-full flex items-center justify-center shadow-lg"
            style={{
              width: 40, height: 40,
              background: '#fff',
              border: '1px solid rgba(10,10,10,0.08)',
              cursor: 'pointer',
              animation: `fade-in-up 0.15s ease-out ${i * 0.04}s both`,
            }}
          >
            <btn.icon size={18} style={{ color: btn.color }} />
          </button>
          {/* Tooltip links */}
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
            style={{ background: '#0A0A0A', whiteSpace: 'nowrap' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', color: '#fff' }}>{btn.label}</span>
          </div>
        </div>
      ))}

      {/* Main Button */}
      <div className="relative group">
        <button
          onClick={() => setOpen(!open)}
          className="rounded-full flex items-center justify-center shadow-lg"
          style={{ width: BTN_SIZE, height: BTN_SIZE, background: open ? '#0A0A0A' : '#fff', border: open ? 'none' : '1px solid rgba(10,10,10,0.08)', cursor: 'pointer' }}
        >
          {open ? <X size={20} color="#fff" /> : <Plus size={20} color="#D4A843" />}
        </button>
        {!open && (
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
            style={{ background: '#0A0A0A', whiteSpace: 'nowrap' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', color: '#fff' }}>Aktion</span>
          </div>
        )}
      </div>
    </div>
  )
}
