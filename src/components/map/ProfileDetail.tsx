import { X } from 'lucide-react'
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

      <div className="p-5 text-center">
        {/* Profilbild */}
        {(light as any).image_path ? (
          <img src={(light as any).image_path} alt={light.name}
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
            style={{ border: '3px solid rgba(212,168,67,0.3)' }} />
        ) : (
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(212,168,67,0.08)', border: '3px solid rgba(212,168,67,0.2)' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.8rem', fontWeight: 500, color: '#D4A843' }}>
              {light.name?.charAt(0) || '?'}
            </span>
          </div>
        )}

        {/* Name */}
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 500, color: '#0A0A0A', marginBottom: '4px' }}>
          {light.name}
        </h2>

        {/* Datum */}
        {light.createdAt && (
          <p style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.35)', marginBottom: '16px' }}>
            Leuchtet seit {new Date(light.createdAt).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}

        {/* Statement */}
        {light.statement && (
          <div className="rounded-xl p-4 text-left" style={{ background: '#FAFAF8' }}>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem', lineHeight: 1.7, color: 'rgba(10,10,10,0.6)', fontStyle: 'italic' }}
              dangerouslySetInnerHTML={{ __html: renderMd(light.statement) }} />
          </div>
        )}
      </div>
    </div>
  )
}
