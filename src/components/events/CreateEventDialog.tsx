import { useState } from 'react'
import { X, MapPin } from 'lucide-react'
import { useApp, type EventItem } from '../../context/AppContext'

interface CreateEventDialogProps {
  position?: [number, number]
  onClose: () => void
}

const EVENT_TYPES: { value: EventItem['type']; label: string }[] = [
  { value: 'meditation', label: 'Meditation' },
  { value: 'gebet', label: 'Gebet' },
  { value: 'stille', label: 'Stille' },
  { value: 'begegnung', label: 'Begegnung' },
  { value: 'tanz', label: 'Tanz' },
  { value: 'fest', label: 'Fest' },
]

const RECURRING_OPTIONS = [
  { value: '', label: 'Einmalig' },
  { value: 'vollmond', label: 'Jeden Vollmond' },
  { value: 'neumond', label: 'Jeden Neumond' },
  { value: 'woechentlich', label: 'Woechentlich' },
  { value: 'monatlich', label: 'Monatlich' },
]

export function CreateEventDialog({ position, onClose }: CreateEventDialogProps) {
  const { addEvent } = useApp()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<EventItem['type']>('meditation')
  const [recurring, setRecurring] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('18:00')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !position || !date) return

    addEvent({
      title,
      description,
      position,
      start: `${date}T${time}:00`,
      type,
      recurring: recurring ? recurring as EventItem['recurring'] : undefined,
    })
    onClose()
  }

  const inputStyle = {
    border: '1px solid rgba(10,10,10,0.1)',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.85rem',
    color: '#0A0A0A',
    background: '#fff',
  }

  const labelStyle = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.68rem',
    fontWeight: 400 as const,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: 'rgba(10,10,10,0.4)',
    display: 'block',
    marginBottom: '6px',
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
      <div
        className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 shadow-xl max-h-[85vh] overflow-y-auto"
        style={{ background: '#FDFCF9', border: '1px solid rgba(10,10,10,0.06)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '1.4rem',
            fontWeight: 400,
            color: '#0A0A0A',
            marginBottom: '1.2rem',
          }}
        >
          Veranstaltung erstellen
        </h2>

        {position && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(212,168,67,0.06)' }}>
            <MapPin size={14} style={{ color: '#D4A843' }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(10,10,10,0.5)' }}>
              {position[0].toFixed(4)}, {position[1].toFixed(4)}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label style={labelStyle}>Titel</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="z.B. Vollmond-Meditation am See"
              required
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Art</label>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className="px-3 py-1.5 rounded-full text-xs transition-all"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    border: type === t.value ? '1px solid #D4A843' : '1px solid rgba(10,10,10,0.1)',
                    color: type === t.value ? '#D4A843' : 'rgba(10,10,10,0.5)',
                    background: type === t.value ? 'rgba(212,168,67,0.08)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Datum</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full px-3 py-3 rounded-lg outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Uhrzeit</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-3 rounded-lg outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Wiederholung</label>
            <select
              value={recurring}
              onChange={e => setRecurring(e.target.value)}
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={inputStyle}
            >
              {RECURRING_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Beschreibung</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Beschreibe deine Absicht. Was wollt ihr gemeinsam tun?"
              rows={3}
              className="w-full px-4 py-3 rounded-lg outline-none resize-none"
              style={{
                ...inputStyle,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '0.95rem',
                lineHeight: 1.6,
              }}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #D4A843, #F5E090)',
              border: 'none',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.78rem',
              fontWeight: 500,
              color: '#0A0A0A',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Veranstaltung erstellen
          </button>
        </form>
      </div>
    </div>
  )
}
