import { useState, useRef } from 'react'
import { X, MapPin, Camera, ChevronDown } from 'lucide-react'
import { useApp, type EventItem } from '../../context/AppContext'
import { MarkdownToolbar } from '../auth/MarkdownToolbar'
import * as api from '../../api/client'

interface CreateEventDialogProps {
  position?: [number, number]
  lichtungId?: string
  lichtungName?: string
  onClose: () => void
}

const TAGS = [
  { value: 'meditation', label: '#meditation' },
  { value: 'gebet', label: '#gebet' },
  { value: 'stille', label: '#stille' },
  { value: 'begegnung', label: '#begegnung' },
  { value: 'tanz', label: '#tanz' },
  { value: 'fest', label: '#fest' },
  { value: 'musik', label: '#musik' },
  { value: 'natur', label: '#natur' },
]

const RECURRING_OPTIONS = [
  { value: '', label: 'Einmalig' },
  { value: 'vollmond', label: 'Vollmond' },
  { value: 'neumond', label: 'Neumond' },
  { value: 'woechentlich', label: 'Woechentlich' },
  { value: 'monatlich', label: 'Monatlich' },
]

export function CreateEventDialog({ position, lichtungId, lichtungName, onClose }: CreateEventDialogProps) {
  const { setEvents } = useApp()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<EventItem['type']>('meditation')
  const [recurring, setRecurring] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('18:00')
  const [maxParticipants, setMaxParticipants] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [_imageFile, setImageFile] = useState<File | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !position || !date) return
    setLoading(true)

    try {
      await api.createEvent({
        title,
        description,
        lat: position[0],
        lng: position[1],
        start_time: `${date}T${time}:00`,
        type,
        recurring: recurring || undefined,
        max_participants: maxParticipants ? Number(maxParticipants) : undefined,
        lichtung_id: lichtungId || undefined,
      })
      const updated = await api.getEvents()
      const mapped = updated.map((ev: any) => ({
        id: ev.id, title: ev.title, description: ev.description || '',
        position: [ev.lat, ev.lng] as [number, number],
        start: ev.start_time, end: ev.end_time,
        type: ev.type || 'meditation', recurring: ev.recurring, createdBy: ev.user_id,
      }))
      setEvents(mapped)
      onClose()
    } catch {
      alert('Fehler beim Erstellen.')
    } finally {
      setLoading(false)
    }
  }

  const font = { fontFamily: 'Inter, sans-serif' as const }
  const inputStyle = { border: '1px solid rgba(10,10,10,0.1)', ...font, fontSize: '0.82rem', color: '#0A0A0A', background: '#fff' }
  const labelStyle = { ...font, fontSize: '0.62rem', fontWeight: 500 as const, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(10,10,10,0.35)', display: 'block', marginBottom: '4px' }

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
      <div className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)', maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(10,10,10,0.04)' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.15rem', fontWeight: 500, color: '#0A0A0A' }}>
            Veranstaltung
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Scroll-Bereich */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 space-y-3" style={{ maxHeight: 'calc(85vh - 60px)' }}>

          {lichtungName && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(123,174,94,0.06)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#7BAE5E' }} />
              <span style={{ ...font, fontSize: '0.72rem', fontWeight: 500, color: '#7BAE5E' }}>{lichtungName}</span>
            </div>
          )}

          {/* Titel */}
          <div>
            <label style={labelStyle}>Titel</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="z.B. Vollmond-Meditation am See" required
              className="w-full px-3 py-2 rounded-lg outline-none" style={inputStyle} />
          </div>

          {/* Datum + Uhrzeit + Wiederholung — kompakt in einer Zeile */}
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
              <select value={recurring} onChange={e => setRecurring(e.target.value)}
                className="w-full px-2 py-2 rounded-lg outline-none" style={{ ...inputStyle, fontSize: '0.75rem' }}>
                {RECURRING_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Hashtag + Teilnehmer — kompakt */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <label style={labelStyle}>Kategorie</label>
              <button type="button" onClick={() => setShowTags(!showTags)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ ...inputStyle, cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ color: '#D4A843', fontSize: '0.78rem' }}>#{type}</span>
                <ChevronDown size={14} style={{ color: 'rgba(10,10,10,0.3)' }} />
              </button>
              {showTags && (
                <div className="absolute left-0 right-0 top-full mt-1 rounded-lg shadow-lg p-1.5 z-10 grid grid-cols-2 gap-1" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.08)' }}>
                  {TAGS.map(t => (
                    <button key={t.value} type="button"
                      onClick={() => { setType(t.value as any); setShowTags(false) }}
                      className="px-2 py-1.5 rounded text-left"
                      style={{ ...font, fontSize: '0.7rem', color: type === t.value ? '#D4A843' : 'rgba(10,10,10,0.5)', background: type === t.value ? 'rgba(212,168,67,0.06)' : 'transparent', border: 'none', cursor: 'pointer' }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>Teilnehmer</label>
              <input type="number" min="1" value={maxParticipants} onChange={e => setMaxParticipants(e.target.value)}
                placeholder="unbegrenzt"
                className="w-full px-3 py-2 rounded-lg outline-none" style={inputStyle} />
            </div>
          </div>

          {/* Beschreibung mit Markdown */}
          <div>
            <label style={labelStyle}>Beschreibung</label>
            <MarkdownToolbar textareaRef={textareaRef} value={description} onChange={setDescription} />
            <textarea ref={textareaRef} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Beschreibe deine Absicht. Was wollt ihr gemeinsam tun?"
              rows={3}
              className="w-full px-3 py-2 rounded-lg outline-none resize-none"
              style={{ ...inputStyle, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.9rem', lineHeight: 1.6 }} />
          </div>

          {/* Bild-Upload */}
          <div>
            <label style={labelStyle}>Bild (optional)</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="" className="w-full h-28 object-cover rounded-lg" />
                <button type="button" onClick={() => { setImagePreview(null); setImageFile(null) }}
                  className="absolute top-2 right-2 rounded-full w-6 h-6 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer' }}>
                  <X size={12} color="#fff" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg"
                style={{ background: '#FAFAF8', border: '1px dashed rgba(10,10,10,0.12)', cursor: 'pointer', ...font, fontSize: '0.75rem', color: 'rgba(10,10,10,0.35)' }}>
                <Camera size={16} />
                Bild hinzufuegen
              </button>
            )}
          </div>

          {/* Ort-Anzeige */}
          {position && !lichtungName && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(212,168,67,0.04)' }}>
              <MapPin size={12} style={{ color: 'rgba(10,10,10,0.3)' }} />
              <span style={{ ...font, fontSize: '0.65rem', color: 'rgba(10,10,10,0.35)' }}>
                {position[0].toFixed(4)}, {position[1].toFixed(4)}
              </span>
            </div>
          )}

          {/* Erstellen-Button */}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg"
            style={{ background: loading ? 'rgba(10,10,10,0.5)' : '#0A0A0A', border: 'none', ...font, fontSize: '0.82rem', fontWeight: 500, color: '#fff', cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Wird erstellt...' : 'Veranstaltung erstellen'}
          </button>
        </form>
      </div>
    </div>
  )
}
