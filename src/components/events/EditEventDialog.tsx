import { useState, useRef } from 'react'
import { X } from 'lucide-react'
import { useApp, type EventItem } from '../../context/AppContext'
import { MarkdownToolbar } from '../auth/MarkdownToolbar'
import { TagInput } from './TagInput'
import * as api from '../../api/client'

interface EditEventDialogProps {
  event: EventItem
  onClose: () => void
  onSaved?: () => void
}

const RECURRING_OPTIONS = [
  { value: '', label: 'Einmalig' },
  { value: 'vollmond', label: 'Vollmond' },
  { value: 'neumond', label: 'Neumond' },
  { value: 'woechentlich', label: 'Woechentlich' },
  { value: 'monatlich', label: 'Monatlich' },
]

export function EditEventDialog({ event, onClose, onSaved }: EditEventDialogProps) {
  const data = event as any
  const { setEvents } = useApp()
  const [title, setTitle] = useState(event.title)
  const [description, setDescription] = useState(event.description || '')
  const initialTags = ((data.tags || event.type || '') as string).split(',').map(t => t.trim()).filter(Boolean)
  const [tags, setTags] = useState<string[]>(initialTags.length ? initialTags : ['meditation'])
  const [recurring, setRecurring] = useState(event.recurring || '')
  const startDate = new Date(event.start)
  const dateStr = startDate.toISOString().slice(0, 10)
  const timeStr = startDate.toTimeString().slice(0, 5)
  const [date, setDate] = useState(dateStr)
  const [time, setTime] = useState(timeStr)
  const [maxParticipants, setMaxParticipants] = useState(String(data.max_participants || ''))
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !date) return
    setLoading(true)
    try {
      await api.updateEvent(event.id, {
        title,
        description,
        start_time: `${date}T${time}:00`,
        type: tags[0] || 'meditation',
        tags: tags.join(','),
        recurring: recurring || null,
        max_participants: maxParticipants ? Number(maxParticipants) : null,
      })
      // Globale Events neu laden
      const all = await api.getEvents()
      const mapped = all.map((ev: any) => ({
        id: ev.id, title: ev.title, description: ev.description || '',
        position: [ev.lat, ev.lng] as [number, number],
        start: ev.start_time, end: ev.end_time,
        type: ev.type || 'meditation', recurring: ev.recurring, createdBy: ev.user_id,
      }))
      setEvents(mapped)
      onSaved?.()
      onClose()
    } catch (err: any) {
      alert(err?.message || 'Fehler beim Speichern.')
    } finally {
      setLoading(false)
    }
  }

  const font = { fontFamily: 'Inter, sans-serif' as const }
  const inputStyle = { border: '1px solid rgba(10,10,10,0.1)', ...font, fontSize: '0.82rem', color: '#0A0A0A', background: '#fff' }
  const labelStyle = { ...font, fontSize: '0.62rem', fontWeight: 500 as const, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(10,10,10,0.35)', display: 'block', marginBottom: '4px' }

  return (
    <div className="fixed inset-0 z-[2100] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
      <div className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)', maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(10,10,10,0.04)' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.15rem', fontWeight: 500, color: '#0A0A0A' }}>
            Veranstaltung bearbeiten
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Scroll-Bereich */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 space-y-3" style={{ maxHeight: 'calc(85vh - 60px)' }}>

          {/* Titel */}
          <div>
            <label style={labelStyle}>Titel</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="z.B. Vollmond-Meditation am See" required
              className="w-full px-3 py-2 rounded-lg outline-none" style={inputStyle} />
          </div>

          {/* Datum + Uhrzeit + Wiederholung */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label style={labelStyle}>Datum</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                className="w-full px-2 py-2 rounded-lg outline-none" style={{ ...inputStyle, fontSize: '0.75rem' }} />
            </div>
            <div>
              <label style={labelStyle}>Uhrzeit</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full px-2 py-2 rounded-lg outline-none" style={{ ...inputStyle, fontSize: '0.75rem' }} />
            </div>
            <div>
              <label style={labelStyle}>Wdh.</label>
              <select value={recurring} onChange={e => setRecurring(e.target.value as any)}
                className="w-full px-2 py-2 rounded-lg outline-none" style={{ ...inputStyle, fontSize: '0.75rem' }}>
                {RECURRING_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <label style={labelStyle}>Hashtags</label>
            <TagInput value={tags} onChange={setTags} />
          </div>

          {/* Teilnehmer */}
          <div>
            <label style={labelStyle}>Teilnehmer (optional)</label>
            <input type="number" min="1" value={maxParticipants} onChange={e => setMaxParticipants(e.target.value)}
              placeholder="unbegrenzt"
              className="w-full px-3 py-2 rounded-lg outline-none" style={inputStyle} />
          </div>

          {/* Beschreibung */}
          <div>
            <label style={labelStyle}>Beschreibung</label>
            <MarkdownToolbar textareaRef={textareaRef} value={description} onChange={setDescription} />
            <textarea ref={textareaRef} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Beschreibe deine Absicht."
              rows={4}
              className="w-full px-3 py-2 rounded-lg outline-none resize-none"
              style={{ ...inputStyle, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.9rem', lineHeight: 1.6 }} />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg"
            style={{ background: loading ? 'rgba(10,10,10,0.5)' : '#0A0A0A', border: 'none', ...font, fontSize: '0.82rem', fontWeight: 500, color: '#fff', cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Wird gespeichert...' : 'Speichern'}
          </button>
        </form>
      </div>
    </div>
  )
}
