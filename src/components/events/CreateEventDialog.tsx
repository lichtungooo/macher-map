import { useState, useRef } from 'react'
import { X, MapPin, Camera } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { MarkdownToolbar } from '../auth/MarkdownToolbar'
import { TagInput } from './TagInput'
import * as api from '../../api/client'

interface CreateEventDialogProps {
  position?: [number, number]
  lichtungId?: string
  lichtungName?: string
  onClose: () => void
}

const RECURRING_OPTIONS = [
  { value: '', label: 'Einmalig' },
  { value: 'woechentlich', label: 'Woechentlich' },
  { value: 'monatlich', label: 'Monatlich' },
]

export function CreateEventDialog({ position, lichtungId, lichtungName, onClose }: CreateEventDialogProps) {
  const { setEvents } = useApp()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>(['workshop'])
  const [recurring, setRecurring] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('18:00')
  const [maxParticipants, setMaxParticipants] = useState('')
  const [loading, setLoading] = useState(false)
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
        type: tags[0] || 'workshop',
        tags: tags.join(','),
        recurring: recurring || undefined,
        max_participants: maxParticipants ? Number(maxParticipants) : undefined,
        lichtung_id: lichtungId || undefined,
      })
      const updated = await api.getEvents()
      const mapped = updated.map((ev: any) => ({
        id: ev.id, title: ev.title, description: ev.description || '',
        position: [ev.lat, ev.lng] as [number, number],
        start: ev.start_time, end: ev.end_time,
        type: ev.type || 'workshop', recurring: ev.recurring, createdBy: ev.user_id,
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
  const inputStyle = { border: '1px solid rgba(10,10,10,0.1)', ...font, fontSize: '0.82rem', color: '#1A1A1A', background: '#fff' }
  const labelStyle = { ...font, fontSize: '0.62rem', fontWeight: 500 as const, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(10,10,10,0.35)', display: 'block', marginBottom: '4px' }

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
      <div className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)', maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(10,10,10,0.04)' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.15rem', fontWeight: 500, color: '#1A1A1A' }}>
            Veranstaltung
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
              placeholder="z.B. Holzworkshop fuer Anfaenger" required
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

          {/* Beschreibung mit Markdown */}
          <div>
            <label style={labelStyle}>Beschreibung</label>
            <MarkdownToolbar textareaRef={textareaRef} value={description} onChange={setDescription} />
            <textarea ref={textareaRef} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Was wird gebaut? Was lernt man? Was soll man mitbringen?"
              rows={3}
              className="w-full px-3 py-2 rounded-lg outline-none resize-none"
              style={{ ...inputStyle, fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9rem', lineHeight: 1.6 }} />
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
            style={{ background: loading ? 'rgba(10,10,10,0.5)' : '#1A1A1A', border: 'none', ...font, fontSize: '0.82rem', fontWeight: 500, color: '#fff', cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Wird erstellt...' : 'Veranstaltung erstellen'}
          </button>
        </form>
      </div>
    </div>
  )
}
