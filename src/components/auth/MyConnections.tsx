import { useState, useEffect } from 'react'
import { Users, MessageCircle, Link2, ChevronRight, Map, Check, X as XIcon } from 'lucide-react'
import * as api from '../../api/client'

interface ConnectionProfile {
  connected_id: string
  name: string
  statement?: string
  image_path?: string
  telegram?: string
  created_at?: string
}

interface PendingProfile {
  id: string
  initiator_id: string
  name: string
  image_path?: string
  statement?: string
  context: string
  context_ref?: string
  created_at: string
}

function ConnectionDetail({ connection, onClose }: { connection: ConnectionProfile; onClose: () => void }) {
  const font = { fontFamily: 'Inter, sans-serif' as const }
  return (
    <div className="space-y-4">
      <button onClick={onClose} className="flex items-center gap-1 mb-2" style={{ ...font, fontSize: '0.72rem', color: 'rgba(10,10,10,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
        &larr; Zurueck
      </button>

      <div className="text-center">
        {connection.image_path ? (
          <img src={connection.image_path} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-3" style={{ border: '2.5px solid rgba(212,168,67,0.3)' }} />
        ) : (
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(212,168,67,0.08)', border: '2.5px solid rgba(212,168,67,0.2)' }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.8rem', color: '#E8751A' }}>{connection.name?.charAt(0) || '?'}</span>
          </div>
        )}
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.3rem', fontWeight: 500, color: '#1A1A1A', marginBottom: '4px' }}>
          {connection.name}
        </h3>
      </div>

      {connection.statement && (
        <div className="p-4 rounded-xl" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.03)' }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.95rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.55)', lineHeight: 1.6 }}>
            "{connection.statement}"
          </p>
        </div>
      )}

      {connection.telegram && (
        <a
          href={`https://t.me/${connection.telegram.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
          style={{ background: 'rgba(80,120,200,0.06)', border: '1px solid rgba(80,120,200,0.15)', textDecoration: 'none', ...font, fontSize: '0.82rem', fontWeight: 500, color: '#D4A020' }}
        >
          <MessageCircle size={16} />
          Telegram: {connection.telegram}
        </a>
      )}

      {connection.created_at && (
        <p style={{ ...font, fontSize: '0.65rem', color: 'rgba(10,10,10,0.25)', textAlign: 'center' }}>
          Verbunden seit {new Date(connection.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      )}
    </div>
  )
}

interface MyConnectionsProps {
  onShowOnMap?: () => void
}

export function MyConnections({ onShowOnMap }: MyConnectionsProps = {}) {
  const [connections, setConnections] = useState<ConnectionProfile[]>([])
  const [pending, setPending] = useState<PendingProfile[]>([])
  const [chain, setChain] = useState<any[]>([])
  const [connectionCount, setConnectionCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedConnection, setSelectedConnection] = useState<ConnectionProfile | null>(null)
  const font = { fontFamily: 'Inter, sans-serif' as const }

  const reload = () => Promise.all([
    api.getConnections().then(setConnections).catch(() => {}),
    api.getConnectionCount().then(setConnectionCount).catch(() => {}),
    api.getPendingConnections().then(setPending).catch(() => {}),
    api.getChain().then(setChain).catch(() => {}),
  ])

  useEffect(() => {
    reload().finally(() => setLoading(false))
  }, [])

  const handleConfirm = async (id: string) => {
    try { await api.confirmPending(id) } catch {}
    await reload()
  }

  const handleReject = async (id: string) => {
    try { await api.rejectPending(id) } catch {}
    await reload()
  }

  if (loading) return <p style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.4)', textAlign: 'center', padding: '20px' }}>Laden...</p>

  if (selectedConnection) {
    return <ConnectionDetail connection={selectedConnection} onClose={() => setSelectedConnection(null)} />
  }

  return (
    <div className="space-y-4">
      {/* Ketten-Statistik */}
      <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(212,168,67,0.04)', border: '1px solid rgba(212,168,67,0.1)' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,168,67,0.1)' }}>
          <Link2 size={20} style={{ color: '#E8751A' }} />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span style={{ ...font, fontSize: '1.4rem', fontWeight: 700, color: '#E8751A' }}>{connectionCount}</span>
            <span style={{ ...font, fontSize: '0.72rem', color: 'rgba(10,10,10,0.4)' }}>
              {connectionCount === 1 ? 'Verbindung' : 'Verbindungen'}
            </span>
          </div>
          {chain.length > 0 && (
            <p style={{ ...font, fontSize: '0.65rem', color: 'rgba(10,10,10,0.3)', marginTop: '2px' }}>
              {chain.length} {chain.length === 1 ? 'Macher' : 'Macher'} in deinem Netzwerk
            </p>
          )}
        </div>
        {onShowOnMap && connectionCount > 0 && (
          <button onClick={onShowOnMap}
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.15)', cursor: 'pointer' }}
            title="Auf der Karte zeigen"
          >
            <Map size={16} style={{ color: '#E8751A' }} />
          </button>
        )}
      </div>

      {/* Pending — Gruenes Licht */}
      {pending.length > 0 && (
        <div className="space-y-1.5">
          <p style={{ ...font, fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7CB342', marginBottom: '4px' }}>
            Gruenes Licht · {pending.length} {pending.length === 1 ? 'Anfrage' : 'Anfragen'}
          </p>
          {pending.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(124,179,66,0.06)', border: '1px solid rgba(124,179,66,0.25)' }}>
              {p.image_path ? (
                <img src={p.image_path} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" style={{ border: '2px solid rgba(124,179,66,0.4)' }} />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(124,179,66,0.12)', border: '2px solid rgba(124,179,66,0.3)' }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', color: '#7CB342' }}>{p.name?.charAt(0) || '?'}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#1A1A1A' }} className="truncate block">{p.name}</span>
                <span style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.4)' }} className="truncate block">
                  {p.context === 'lichtung' ? 'ist einer Werkstatt beigetreten' : 'hat dich gescannt'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => handleConfirm(p.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: '#7CB342', border: 'none', cursor: 'pointer' }}
                  title="Bestaetigen"
                >
                  <Check size={16} style={{ color: '#fff' }} />
                </button>
                <button onClick={() => handleReject(p.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(10,10,10,0.04)', border: '1px solid rgba(10,10,10,0.08)', cursor: 'pointer' }}
                  title="Ablehnen"
                >
                  <XIcon size={14} style={{ color: 'rgba(10,10,10,0.4)' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Direkte Verbindungen */}
      {connections.length === 0 ? (
        <div className="text-center py-6">
          <Users size={24} style={{ color: 'rgba(10,10,10,0.08)', margin: '0 auto 8px' }} />
          <p style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.35)' }}>Noch keine Verbindungen.</p>
          <p style={{ ...font, fontSize: '0.7rem', color: 'rgba(10,10,10,0.25)', marginTop: '4px' }}>
            Teile deinen QR-Code, um dich zu verbinden.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <p style={{ ...font, fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.3)', marginBottom: '4px' }}>
            Deine Verbindungen
          </p>
          {connections.map((c) => (
            <button
              key={c.connected_id}
              onClick={() => setSelectedConnection(c)}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left"
              style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.03)', cursor: 'pointer' }}
            >
              {c.image_path ? (
                <img src={c.image_path} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" style={{ border: '2px solid rgba(212,168,67,0.2)' }} />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(212,168,67,0.08)', border: '2px solid rgba(212,168,67,0.15)' }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', color: '#E8751A' }}>{c.name?.charAt(0) || '?'}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#1A1A1A' }} className="truncate block">{c.name}</span>
                {c.statement && (
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.72rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.4)' }} className="truncate block">
                    {c.statement.slice(0, 50)}{c.statement.length > 50 ? '...' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {c.telegram && <MessageCircle size={13} style={{ color: '#D4A020' }} />}
                <ChevronRight size={14} style={{ color: 'rgba(10,10,10,0.2)' }} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
