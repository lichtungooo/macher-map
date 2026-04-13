import { useState, useRef } from 'react'
import { X, User, Camera } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { MarkdownToolbar } from './MarkdownToolbar'

interface ProfileDialogProps {
  onClose: () => void
}

export function ProfileDialog({ onClose }: ProfileDialogProps) {
  const { user, updateProfile } = useApp()
  const [name, setName] = useState(user?.name || '')
  const [statement, setStatement] = useState(user?.statement || '')
  const [imagePreview, setImagePreview] = useState<string | undefined>(user?.imageUrl)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setImagePreview(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    updateProfile({ name, statement, imageUrl: imagePreview })
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
        className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto"
        style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}
        >
          <X size={20} />
        </button>

        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '1.4rem',
            fontWeight: 500,
            color: '#0A0A0A',
            marginBottom: '0.3rem',
            textAlign: 'center',
          }}
        >
          Dein Profil
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(10,10,10,0.4)', textAlign: 'center', marginBottom: '1.5rem' }}>
          Zeige der Welt, wer du bist.
        </p>

        {/* Avatar Upload */}
        <div className="flex justify-center mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden transition-all"
            style={{
              background: imagePreview ? 'transparent' : 'rgba(212,168,67,0.06)',
              border: imagePreview ? '2px solid rgba(212,168,67,0.3)' : '2px dashed rgba(212,168,67,0.25)',
              cursor: 'pointer',
            }}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <Camera size={24} style={{ color: '#D4A843' }} />
            )}
          </button>
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: 'rgba(10,10,10,0.3)', textAlign: 'center', marginBottom: '1.2rem', marginTop: '-0.8rem' }}>
          Klicke, um ein Foto hochzuladen (freiwillig)
        </p>

        {/* Name */}
        <div className="mb-4">
          <label style={labelStyle}>Dein Name</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(10,10,10,0.25)' }} />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Dein Name (oder anonym)"
              className="w-full pl-10 pr-4 py-3 rounded-lg outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Friedens-Statement mit Markdown-Toolbar */}
        <div className="mb-6">
          <label style={labelStyle}>Dein Friedens-Statement</label>
          <MarkdownToolbar
            textareaRef={textareaRef}
            value={statement}
            onChange={setStatement}
          />
          <textarea
            ref={textareaRef}
            value={statement}
            onChange={e => setStatement(e.target.value)}
            placeholder="Ein Satz, ein Gedicht, ein Gebet — was aus deinem Herzen kommt."
            rows={5}
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
          onClick={handleSave}
          className="w-full py-3 rounded-lg transition-all"
          style={{
            background: '#0A0A0A',
            border: 'none',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.82rem',
            fontWeight: 500,
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Speichern
        </button>
      </div>
    </div>
  )
}
