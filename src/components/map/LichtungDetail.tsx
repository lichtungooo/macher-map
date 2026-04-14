import { useState, useEffect } from 'react'
import { X, CalendarDays, Clock, Users, Navigation, Repeat, Plus, Link2, Copy, Check, QrCode, Shield } from 'lucide-react'
import { SlotManager } from './SlotManager'
import * as api from '../../api/client'

const TYPE_COLORS: Record<string, string> = {
  meditation: '#D4A843', gebet: '#A07CC0', stille: '#6BA3BE',
  begegnung: '#7BAE5E', tanz: '#D4766E', fest: '#E0A050',
}

function formatDate(d: string) { return new Date(d).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' }) }
function formatTime(d: string) { return new Date(d).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) }
function renderMd(t: string) { return t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br/>') }

interface LichtungDetailProps {
  lichtungId: string
  onClose: () => void
  onCreateEvent?: (lichtungId: string, lichtungName: string, position: [number, number]) => void
}

export function LichtungDetail({ lichtungId, onClose, onCreateEvent }: LichtungDetailProps) {
  const [lichtung, setLichtung] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'info' | 'kalender' | 'community' | 'slots'>('info')
  const [copied, setCopied] = useState(false)
  const [members, setMembers] = useState<any[]>([])
  const [myRole, setMyRole] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState('')
  const [qrCopied, setQrCopied] = useState(false)
  const calUrl = `${window.location.origin}/api/lichtungen/${lichtungId}/cal.ics`

  useEffect(() => {
    api.getLichtungMembers(lichtungId).then(setMembers).catch(() => {})
    if (api.getToken()) {
      api.getMyLichtungRole(lichtungId).then(d => setMyRole(d.role)).catch(() => {})
      api.getLichtungQRCode(lichtungId).then(d => setQrUrl(d.url)).catch(() => {})
    }
  }, [lichtungId])

  useEffect(() => {
    Promise.all([
      api.getLichtung(lichtungId),
      api.getLichtungEvents(lichtungId),
    ]).then(([l, e]) => { setLichtung(l); setEvents(e) }).finally(() => setLoading(false))
  }, [lichtungId])

  const font = { fontFamily: 'Inter, sans-serif' as const }
  const mapsUrl = lichtung ? `https://www.google.com/maps/dir/?api=1&destination=${lichtung.lat},${lichtung.lng}` : '#'

  if (loading) return (
    <div className="fixed z-[1500] rounded-2xl shadow-xl" style={{ top: '70px', right: '16px', width: '360px', background: '#fff', padding: '40px', textAlign: 'center' }}>
      <p style={{ ...font, color: 'rgba(10,10,10,0.4)' }}>Laden...</p>
    </div>
  )

  if (!lichtung) return null

  return (
    <div className="fixed z-[1500] rounded-2xl shadow-xl overflow-hidden" style={{ top: '70px', right: '16px', width: '360px', maxHeight: 'calc(100vh - 90px)', background: '#fff', border: '1px solid rgba(10,10,10,0.06)', animation: 'fade-in-up 0.2s ease-out' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(10,10,10,0.04)' }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: '#7BAE5E' }} />
          <span style={{ ...font, fontSize: '0.62rem', fontWeight: 600, color: '#7BAE5E', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Lichtung</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.25)' }}>
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-5 pt-3 gap-0.5 overflow-x-auto" style={{ borderBottom: '1px solid rgba(10,10,10,0.04)' }}>
        {['info', 'kalender', 'community', ...((myRole === 'owner' || myRole === 'admin') ? ['slots'] : [])].map(key => (
          <button key={key} onClick={() => setTab(key as any)} className="pb-2 px-2.5 shrink-0"
            style={{ ...font, fontSize: '0.68rem', fontWeight: 500, color: tab === key ? '#7BAE5E' : 'rgba(10,10,10,0.35)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === key ? '#7BAE5E' : 'transparent'}`, cursor: 'pointer' }}>
            {key === 'info' ? 'Info' : key === 'kalender' ? 'Kalender' : key === 'community' ? `Community (${members.length})` : 'Slots'}
          </button>
        ))}
      </div>

      <div className="overflow-y-auto p-5" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {tab === 'slots' && (myRole === 'owner' || myRole === 'admin') && (
          <SlotManager lichtungId={lichtungId} />
        )}
        {tab === 'info' && (
          <>
            {/* Bild */}
            {lichtung.image_path && (
              <img src={lichtung.image_path} alt={lichtung.name} className="w-full h-40 object-cover rounded-xl mb-4" />
            )}

            {/* Name */}
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 500, color: '#0A0A0A', marginBottom: '4px' }}>
              {lichtung.name}
            </h2>
            <p style={{ ...font, fontSize: '0.72rem', color: 'rgba(10,10,10,0.4)', marginBottom: '16px' }}>
              von {lichtung.creator_name}
            </p>

            {/* Beschreibung */}
            {lichtung.description && (
              <div className="rounded-xl p-4 mb-4" style={{ background: '#FAFAF8' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.92rem', lineHeight: 1.7, color: 'rgba(10,10,10,0.6)' }}
                  dangerouslySetInnerHTML={{ __html: renderMd(lichtung.description) }} />
              </div>
            )}

            {/* Navigation */}
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl"
              style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#0A0A0A', background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)', textDecoration: 'none' }}>
              <Navigation size={15} style={{ color: '#7BAE5E' }} />
              Zum Standort navigieren
            </a>
          </>
        )}
        {tab === 'kalender' && (
          <>
            {/* Termine */}
            {events.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays size={24} style={{ color: 'rgba(10,10,10,0.08)', margin: '0 auto 8px' }} />
                <p style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.35)' }}>Noch keine Termine an diesem Ort.</p>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {events.map((e: any) => (
                  <div key={e.id} className="rounded-xl p-3.5" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.03)' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: TYPE_COLORS[e.type] || '#D4A843' }} />
                      <span style={{ ...font, fontSize: '0.82rem', fontWeight: 600, color: '#0A0A0A' }}>{e.title}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span className="flex items-center gap-1" style={{ ...font, fontSize: '0.65rem', color: 'rgba(10,10,10,0.4)' }}>
                        <Clock size={10} /> {formatDate(e.start_time)} · {formatTime(e.start_time)}
                      </span>
                      {e.recurring && (
                        <span className="flex items-center gap-1" style={{ ...font, fontSize: '0.6rem', color: 'rgba(10,10,10,0.3)' }}>
                          <Repeat size={9} /> {e.recurring}
                        </span>
                      )}
                      <span className="flex items-center gap-1" style={{ ...font, fontSize: '0.6rem', color: '#D4A843' }}>
                        <Users size={10} /> {e.participant_count}{e.max_participants ? `/${e.max_participants}` : ''}
                      </span>
                    </div>
                    {e.description && (
                      <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.82rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.45)', lineHeight: 1.5 }}>
                        {e.description.slice(0, 120)}{e.description.length > 120 ? '...' : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Kalender abonnieren */}
            {events.length > 0 && (
              <div className="rounded-xl p-3 mt-3" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Link2 size={12} style={{ color: '#7BAE5E' }} />
                  <span style={{ ...font, fontSize: '0.68rem', fontWeight: 600, color: 'rgba(10,10,10,0.5)' }}>Kalender abonnieren</span>
                </div>
                <div className="flex items-center gap-2">
                  <input readOnly value={calUrl} className="flex-1 px-2 py-1.5 rounded text-xs outline-none"
                    style={{ border: '1px solid rgba(10,10,10,0.06)', fontFamily: 'monospace', fontSize: '0.58rem', color: 'rgba(10,10,10,0.4)', background: '#fff' }}
                    onClick={e => (e.target as HTMLInputElement).select()} />
                  <button onClick={() => { navigator.clipboard.writeText(calUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                    className="shrink-0 rounded px-2 py-1.5" style={{ background: copied ? 'rgba(123,174,94,0.1)' : '#fff', border: '1px solid rgba(10,10,10,0.06)', cursor: 'pointer' }}>
                    {copied ? <Check size={12} style={{ color: '#7BAE5E' }} /> : <Copy size={12} style={{ color: 'rgba(10,10,10,0.35)' }} />}
                  </button>
                </div>
              </div>
            )}

            {/* Termin erstellen */}
            {onCreateEvent && (
              <button
                onClick={() => onCreateEvent(lichtungId, lichtung.name, [lichtung.lat, lichtung.lng])}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mt-4"
                style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#fff', background: '#7BAE5E', border: 'none', cursor: 'pointer' }}>
                <Plus size={16} />
                Termin an diesem Ort erstellen
              </button>
            )}
          </>
        )}
        {tab === 'community' && (
          <>
            {/* Mitglieder */}
            <div className="space-y-2 mb-4">
              {members.map((m: any) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#FAFAF8' }}>
                  {m.image_path ? (
                    <img src={m.image_path} alt="" className="w-9 h-9 rounded-full object-cover" style={{ border: '2px solid rgba(123,174,94,0.2)' }} />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(123,174,94,0.08)', border: '2px solid rgba(123,174,94,0.15)' }}>
                      <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.9rem', color: '#7BAE5E' }}>{m.name?.charAt(0) || '?'}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#0A0A0A' }} className="truncate block">{m.name}</span>
                    <span className="flex items-center gap-1" style={{ ...font, fontSize: '0.62rem', color: m.role === 'owner' ? '#7BAE5E' : m.role === 'admin' ? '#D4A843' : 'rgba(10,10,10,0.35)' }}>
                      {m.role === 'owner' && <><Shield size={9} /> Eigentuemer</>}
                      {m.role === 'admin' && <><Shield size={9} /> Admin</>}
                      {m.role === 'member' && 'Mitglied'}
                    </span>
                  </div>
                  {/* Rolle aendern (nur fuer Owner) */}
                  {myRole === 'owner' && m.role !== 'owner' && (
                    <button
                      onClick={() => {
                        const newRole = m.role === 'admin' ? 'member' : 'admin'
                        api.setMemberRole(lichtungId, m.id, newRole).then(() => api.getLichtungMembers(lichtungId).then(setMembers))
                      }}
                      style={{ ...font, fontSize: '0.6rem', color: '#D4A843', background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: '6px', padding: '2px 8px', cursor: 'pointer' }}>
                      {m.role === 'admin' ? '→ Mitglied' : '→ Admin'}
                    </button>
                  )}
                </div>
              ))}
              {members.length === 0 && (
                <p style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.35)', textAlign: 'center', padding: '16px 0' }}>
                  Noch keine Mitglieder.
                </p>
              )}
            </div>

            {/* QR-Code fuer den Ort (nur Owner/Admin) */}
            {qrUrl && (myRole === 'owner' || myRole === 'admin') && (
              <div className="rounded-xl p-4" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <QrCode size={13} style={{ color: '#7BAE5E' }} />
                  <span style={{ ...font, fontSize: '0.72rem', fontWeight: 600, color: '#0A0A0A' }}>Permanenter QR-Code</span>
                </div>
                <p style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.4)', marginBottom: '8px' }}>
                  Menschen scannen diesen Code um Mitglied zu werden.
                </p>
                <div className="flex items-center gap-2">
                  <input readOnly value={qrUrl} className="flex-1 px-2 py-1.5 rounded text-xs outline-none"
                    style={{ border: '1px solid rgba(10,10,10,0.06)', fontFamily: 'monospace', fontSize: '0.58rem', color: 'rgba(10,10,10,0.4)', background: '#fff' }}
                    onClick={e => (e.target as HTMLInputElement).select()} />
                  <button onClick={() => { navigator.clipboard.writeText(qrUrl); setQrCopied(true); setTimeout(() => setQrCopied(false), 2000) }}
                    className="shrink-0 rounded px-2 py-1.5" style={{ background: qrCopied ? 'rgba(123,174,94,0.1)' : '#fff', border: '1px solid rgba(10,10,10,0.06)', cursor: 'pointer' }}>
                    {qrCopied ? <Check size={12} style={{ color: '#7BAE5E' }} /> : <Copy size={12} style={{ color: 'rgba(10,10,10,0.35)' }} />}
                  </button>
                </div>
              </div>
            )}

            {/* Beitreten Button (wenn nicht Mitglied) */}
            {!myRole && api.getToken() && (
              <button
                onClick={() => {
                  api.getLichtungQRCode(lichtungId).catch(() => null).then(d => {
                    if (!d) return
                    api.joinLichtungByCode(d.code.split('/').pop() || '').then(() => {
                      api.getLichtungMembers(lichtungId).then(setMembers)
                      api.getMyLichtungRole(lichtungId).then(r => setMyRole(r.role))
                    })
                  })
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mt-4"
                style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#fff', background: '#7BAE5E', border: 'none', cursor: 'pointer' }}>
                <Users size={16} />
                Dieser Lichtung beitreten
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
