import { useState, useRef } from 'react'
import { X, MapPin, Camera } from 'lucide-react'
import { TagInput } from '../events/TagInput'
import * as api from '../../api/client'

interface CreateLichtungDialogProps {
  position?: [number, number]
  onClose: () => void
  onCreated: () => void
}

export function CreateLichtungDialog({ position, onClose, onCreated }: CreateLichtungDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const font = { fontFamily: 'Inter, sans-serif' as const }
  const inputStyle = { border: '1px solid rgba(10,10,10,0.1)', ...font, fontSize: '0.82rem', color: '#0A0A0A', background: '#fff' }
  const labelStyle = { ...font, fontSize: '0.62rem', fontWeight: 500 as const, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(10,10,10,0.35)', display: 'block', marginBottom: '4px' }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !position) return
    setLoading(true)
    try {
      const result = await api.createLichtung({
        name,
        description,
        lat: position[0],
        lng: position[1],
        tags: tags.join(','),
      })
      if (imageFile && result.id) {
        const formData = new FormData()
        formData.append('image', imageFile)
        await fetch(`/api/lichtungen/${result.id}/image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${api.getToken()}` },
          body: formData,
        })
      }
      onCreated()
      onClose()
    } catch {
      alert('Fehler beim Erstellen.')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
      <div className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)', maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(10,10,10,0.04)' }}>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#7BAE5E' }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.15rem', fontWeight: 500, color: '#0A0A0A' }}>
              Lichtung erstellen
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Scroll-Bereich */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 space-y-3" style={{ maxHeight: 'calc(85vh - 60px)' }}>

          <p style={{ ...font, fontSize: '0.78rem', color: 'rgba(10,10,10,0.45)', lineHeight: 1.6 }}>
            Ein Ort der Begegnung. Ein Platz, an dem Menschen sich treffen, meditieren, feiern.
          </p>

          {position && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(123,174,94,0.06)' }}>
              <MapPin size={13} style={{ color: '#7BAE5E' }} />
              <span style={{ ...font, fontSize: '0.7rem', color: 'rgba(10,10,10,0.5)' }}>
                {position[0].toFixed(4)}, {position[1].toFixed(4)}
              </span>
            </div>
          )}

          {/* Bild */}
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => {
                const f = e.target.files?.[0]
                if (!f) return
                setImageFile(f)
                const reader = new FileReader()
                reader.onload = ev => setImagePreview(ev.target?.result as string)
                reader.readAsDataURL(f)
              }} />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full h-28 rounded-xl flex items-center justify-center overflow-hidden"
              style={{ background: imagePreview ? 'transparent' : 'rgba(123,174,94,0.04)', border: imagePreview ? 'none' : '2px dashed rgba(123,174,94,0.2)', cursor: 'pointer' }}>
              {imagePreview ? (
                <img src={imagePreview} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="text-center">
                  <Camera size={20} style={{ color: 'rgba(123,174,94,0.4)', margin: '0 auto 4px' }} />
                  <p style={{ ...font, fontSize: '0.65rem', color: 'rgba(10,10,10,0.3)' }}>Foto vom Ort (optional)</p>
                </div>
              )}
            </button>
          </div>

          {/* Name */}
          <div>
            <label style={labelStyle}>Name der Lichtung</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="z.B. Die Waldlichtung Kassel"
              className="w-full px-3 py-2 rounded-lg outline-none" style={inputStyle} />
          </div>

          {/* Hashtags */}
          <div>
            <label style={labelStyle}>Hashtags</label>
            <TagInput value={tags} onChange={setTags} />
            <p style={{ ...font, fontSize: '0.6rem', color: 'rgba(10,10,10,0.3)', marginTop: '4px' }}>
              Hilft anderen, deinen Ort zu finden (z.B. wald, quelle, stille)
            </p>
          </div>

          {/* Beschreibung */}
          <div>
            <label style={labelStyle}>Beschreibung</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
              placeholder="Was macht diesen Ort besonders? Was ist dort moeglich? Wie sieht er aus?"
              className="w-full px-3 py-2 rounded-lg outline-none resize-none"
              style={{ ...inputStyle, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.9rem', lineHeight: 1.6 }} />
            <p style={{ ...font, fontSize: '0.6rem', color: 'rgba(10,10,10,0.3)', marginTop: '4px' }}>
              Markdown: **fett**, *kursiv*
            </p>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg"
            style={{ background: loading ? 'rgba(10,10,10,0.5)' : '#0A0A0A', border: 'none', ...font, fontSize: '0.82rem', fontWeight: 500, color: '#fff', cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Wird erstellt...' : 'Lichtung erstellen'}
          </button>
        </form>
      </div>
    </div>
  )
}
