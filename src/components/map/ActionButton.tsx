import { useState } from 'react'
import { Plus, X, CalendarDays } from 'lucide-react'

const BTN_SIZE = 46

function LightIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="6" fill="#FFF8D0" stroke="#D4A843" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2.5" fill="#D4A843" opacity="0.6" />
      <line x1="12" y1="2" x2="12" y2="5" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="19" x2="12" y2="22" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="12" x2="5" y2="12" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="19" y1="12" x2="22" y2="12" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

interface ActionButtonProps {
  onSetLight: () => void
  onCreateEvent: () => void
}

export function ActionButton({ onSetLight, onCreateEvent }: ActionButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-3">
      {open && (
        <>
          <button
            onClick={() => { onCreateEvent(); setOpen(false) }}
            className="flex items-center gap-3 rounded-full shadow-lg"
            style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.08)', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, color: '#0A0A0A', padding: '10px 20px', cursor: 'pointer', animation: 'fade-in-up 0.2s ease-out 0.05s both' }}
          >
            <CalendarDays size={18} style={{ color: '#D4A843' }} />
            Veranstaltung erstellen
          </button>
          <button
            onClick={() => { onSetLight(); setOpen(false) }}
            className="flex items-center gap-3 rounded-full shadow-lg"
            style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.08)', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, color: '#0A0A0A', padding: '10px 20px', cursor: 'pointer', animation: 'fade-in-up 0.2s ease-out both' }}
          >
            <LightIcon size={18} />
            Licht entzuenden
          </button>
        </>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="rounded-full flex items-center justify-center shadow-lg"
        style={{ width: BTN_SIZE, height: BTN_SIZE, background: open ? '#0A0A0A' : '#fff', border: open ? 'none' : '1px solid rgba(10,10,10,0.08)', cursor: 'pointer' }}
      >
        {open ? <X size={20} color="#fff" /> : <Plus size={20} color="#D4A843" />}
      </button>
    </div>
  )
}
