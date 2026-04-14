import { useState, useEffect } from 'react'
import { Users, MessageCircle } from 'lucide-react'
import * as api from '../../api/client'

export function MyConnections() {
  const [connections, setConnections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const font = { fontFamily: 'Inter, sans-serif' as const }

  useEffect(() => {
    api.getConnections().then(setConnections).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.4)', textAlign: 'center', padding: '20px' }}>Laden...</p>

  if (connections.length === 0) return (
    <div className="text-center py-8">
      <Users size={24} style={{ color: 'rgba(10,10,10,0.08)', margin: '0 auto 8px' }} />
      <p style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.35)' }}>Noch keine Verbindungen.</p>
      <p style={{ ...font, fontSize: '0.7rem', color: 'rgba(10,10,10,0.25)', marginTop: '4px' }}>
        Teile deinen QR-Code, um dich zu verbinden.
      </p>
    </div>
  )

  return (
    <div className="space-y-2">
      {connections.map((c: any) => (
        <div key={c.connected_id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#FAFAF8' }}>
          {c.image_path ? (
            <img src={c.image_path} alt="" className="w-10 h-10 rounded-full object-cover" style={{ border: '2px solid rgba(212,168,67,0.2)' }} />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,168,67,0.08)', border: '2px solid rgba(212,168,67,0.15)' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem', color: '#D4A843' }}>{c.name?.charAt(0) || '?'}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#0A0A0A' }} className="truncate block">{c.name}</span>
            {c.statement && (
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.72rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.4)' }} className="truncate block">
                {c.statement.slice(0, 60)}{c.statement.length > 60 ? '...' : ''}
              </span>
            )}
          </div>
          {c.telegram && (
            <a href={`https://t.me/${c.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(80,120,200,0.08)', border: '1px solid rgba(80,120,200,0.15)' }}>
              <MessageCircle size={14} style={{ color: '#5078C8' }} />
            </a>
          )}
        </div>
      ))}
    </div>
  )
}
