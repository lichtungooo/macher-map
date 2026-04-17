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
  const font = { fontFamily: 'Inter, sans-serif' as const }
  const data = light as any

  return (
    <div className="fixed z-[1500] rounded-2xl shadow-xl overflow-hidden"
      style={{ top: '70px', right: '16px', width: '340px', maxHeight: 'calc(100vh - 90px)', background: '#fff', border: '1px solid rgba(10,10,10,0.06)', animation: 'fade-in-up 0.2s ease-out' }}>

      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(10,10,10,0.04)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#D4A843' }} />
          <span style={{ ...font, fontSize: '0.62rem', fontWeight: 600, color: '#D4A843', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Licht</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.25)' }}>
          <X size={18} />
        </button>
      </div>

      <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
        <div className="text-center mb-4">
          {/* Profilbild — immer anzeigen */}
          {data.image_path ? (
            <img src={data.image_path} alt={light.name}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
              style={{ border: '3px solid rgba(212,168,67,0.3)' }} />
          ) : (
            <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ background: 'rgba(212,168,67,0.08)', border: '3px solid rgba(212,168,67,0.2)' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.8rem', fontWeight: 500, color: '#D4A843' }}>
                {light.name?.charAt(0) || '?'}
              </span>
            </div>
          )}

          {/* Name */}
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 500, color: '#0A0A0A', marginBottom: '2px' }}>
            {light.name}
          </h2>

          {/* Telegram direkt unter dem Namen */}
          {data.telegram && (
            <a href={`https://t.me/${data.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
              style={{ ...font, fontSize: '0.75rem', color: '#5078C8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <MessageCircle size={12} />
              {data.telegram}
            </a>
          )}

          {/* Datum */}
          {light.createdAt && (
            <p style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.3)', marginTop: '8px', marginBottom: '12px' }}>
              Leuchtet seit {new Date(light.createdAt).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}

          {/* Kurz-Statement */}
          {light.statement && (
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.5)', lineHeight: 1.5 }}>
              "{light.statement}"
            </p>
          )}
        </div>

        {/* Bio / ausfuehrlicher Text */}
        {data.bio && (
          <div className="rounded-xl p-4 mt-3" style={{ background: '#FAFAF8' }}>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.95rem', lineHeight: 1.7, color: 'rgba(10,10,10,0.55)' }}
              dangerouslySetInnerHTML={{ __html: renderMd(data.bio) }} />
          </div>
        )}
      </div>
    </div>
  )
}
