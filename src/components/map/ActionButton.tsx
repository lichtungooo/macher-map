import { useState } from 'react'
import { Plus, X, CalendarDays, Sparkles, Trees } from 'lucide-react'

const BTN_SIZE = 46
const btnStyle = { background: '#fff', border: '1px solid rgba(10,10,10,0.08)', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, color: '#0A0A0A', padding: '10px 20px', cursor: 'pointer' }

interface ActionButtonProps {
  onSetLight: () => void
  onCreateEvent: () => void
  onCreateLichtung?: () => void
}

export function ActionButton({ onSetLight, onCreateEvent, onCreateLichtung }: ActionButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-3">
      {open && (
        <>
          {onCreateLichtung && (
            <button onClick={() => { onCreateLichtung(); setOpen(false) }}
              className="flex items-center gap-3 rounded-full shadow-lg"
              style={{ ...btnStyle, animation: 'fade-in-up 0.2s ease-out 0.1s both' }}>
              <Trees size={18} style={{ color: '#7BAE5E' }} />
              Lichtung erstellen
            </button>
          )}
          <button onClick={() => { onCreateEvent(); setOpen(false) }}
            className="flex items-center gap-3 rounded-full shadow-lg"
            style={{ ...btnStyle, animation: 'fade-in-up 0.2s ease-out 0.05s both' }}>
            <CalendarDays size={18} style={{ color: '#5078C8' }} />
            Veranstaltung erstellen
          </button>
          <button onClick={() => { onSetLight(); setOpen(false) }}
            className="flex items-center gap-3 rounded-full shadow-lg"
            style={{ ...btnStyle, animation: 'fade-in-up 0.2s ease-out both' }}>
            <Sparkles size={18} style={{ color: '#D4A843' }} />
            Licht entzuenden
          </button>
        </>
      )}

      <div className="relative group">
        <button onClick={() => setOpen(!open)}
          className="rounded-full flex items-center justify-center shadow-lg"
          style={{ width: BTN_SIZE, height: BTN_SIZE, background: open ? '#0A0A0A' : '#fff', border: open ? 'none' : '1px solid rgba(10,10,10,0.08)', cursor: 'pointer' }}>
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
