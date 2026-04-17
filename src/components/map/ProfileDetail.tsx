import { X, MessageCircle } from 'lucide-react'
import type { LightPin } from '../../context/AppContext'

function renderMd(t: string) {
  return t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br/>')
}

interface ProfileDetailProps {
  light: LightPin
  onClose: () => void
}

export function ProfileDetail({ light, onClose }: ProfileDetailProps) {
  const data = light as any
  const hasImage = !!data.image_path

  return (
    <div className="fixed z-[1500] rounded-2xl shadow-xl overflow-hidden"
      style={{ top: '70px', right: '16px', width: '340px', maxHeight: 'calc(100vh - 90px)', background: '#fff', border: '1px solid rgba(10,10,10,0.06)', animation: 'fade-in-up 0.2s ease-out' }}>

      {/* Header — nur Schliessen-Button, kein "Licht"-Text */}
      <div className="flex items-center justify-end px-5 py-3">
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.25)' }}>
          <X size={18} />
        </button>
      </div>

      <div className="px-5 pb-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
        {/* Profilbild links + Name/Telegram rechts — gleicher Stil wie Popup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          {hasImage ? (
            <img src={data.image_path} alt={light.name}
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(212,168,67,0.3)', flexShrink: 0 }} />
          ) : (
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(212,168,67,0.08)', border: '3px solid rgba(212,168,67,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.6rem', fontWeight: 500, color: '#D4A843' }}>
                {light.name?.charAt(0) || '?'}
              </span>
            </div>
          )}
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 500, color: '#0A0A0A', margin: '0 0 2px' }}>
              {light.name}
            </h2>
            {data.telegram && (
              <a href={`https://t.me/${data.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#5078C8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <MessageCircle size={12} />
                {data.telegram}
              </a>
            )}
          </div>
        </div>

        {/* Statement */}
        {light.statement && (
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.5)', lineHeight: 1.6, marginBottom: '12px' }}>
            "{light.statement}"
          </p>
        )}

        {/* Bio */}
        {data.bio && (
          <div className="rounded-xl p-4" style={{ background: '#FAFAF8' }}>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.95rem', lineHeight: 1.7, color: 'rgba(10,10,10,0.55)' }}
              dangerouslySetInnerHTML={{ __html: renderMd(data.bio) }} />
          </div>
        )}
      </div>
    </div>
  )
}
