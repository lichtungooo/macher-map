import { useState } from 'react'
import { X, MapPin } from 'lucide-react'
import * as api from '../../api/client'

interface CreateLichtungDialogProps {
  position?: [number, number]
  onClose: () => void
  onCreated: () => void
}

export function CreateLichtungDialog({ position, onClose, onCreated }: CreateLichtungDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const inputStyle = { border: '1px solid rgba(10,10,10,0.1)', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#0A0A0A', background: '#fff' }
  const labelStyle = { fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', fontWeight: 400 as const, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'rgba(10,10,10,0.4)', display: 'block', marginBottom: '6px' }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !position) return
    setLoading(true)
    try {
      await api.createLichtung({ name, description, lat: position[0], lng: position[1] })
      onCreated()
      onClose()
    } catch {
      alert('Fehler beim Erstellen.')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
      <div className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 shadow-xl max-h-[85vh] overflow-y-auto" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
        <button onClick={onClose} className="absolute top-4 right-4" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}>
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full" style={{ background: '#7BAE5E' }} />
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 500, color: '#0A0A0A' }}>
            Lichtung erstellen
          </h2>
        </div>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(10,10,10,0.45)', marginBottom: '16px', lineHeight: 1.6 }}>
          Ein Ort der Begegnung. Ein Platz, an dem Menschen sich treffen, meditieren, feiern.
        </p>

        {position && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(123,174,94,0.06)' }}>
            <MapPin size={14} style={{ color: '#7BAE5E' }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(10,10,10,0.5)' }}>
              {position[0].toFixed(4)}, {position[1].toFixed(4)}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label style={labelStyle}>Name der Lichtung</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="z.B. Die Waldlichtung Kassel"
              className="w-full px-4 py-3 rounded-lg outline-none" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Beschreibung</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5}
              placeholder="Was macht diesen Ort besonders? Was ist dort moeglich? Wie sieht er aus?"
              className="w-full px-4 py-3 rounded-lg outline-none resize-none"
              style={{ ...inputStyle, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.95rem', lineHeight: 1.6 }} />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', color: 'rgba(10,10,10,0.3)', marginTop: '4px' }}>
              Markdown: **fett**, *kursiv*
            </p>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg"
            style={{ background: loading ? 'rgba(10,10,10,0.5)' : '#0A0A0A', border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, color: '#fff', cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Wird erstellt...' : 'Lichtung erstellen'}
          </button>
        </form>
      </div>
    </div>
  )
}
