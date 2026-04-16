import { useState, useEffect } from 'react'
import { X, CalendarDays, Clock, Users, Navigation, Repeat, Plus, Link2, Copy, Check, QrCode, Shield, MessageCircle, Trash2, Lock, Maximize2 } from 'lucide-react'
import { LichtungGallery } from './LichtungGallery'
import { QRCodeSVG } from 'qrcode.react'
import { FullCalendar } from './FullCalendar'
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
  const [tab, setTab] = useState<'info' | 'kalender' | 'galerie' | 'community'>('info')
  const [copied, setCopied] = useState(false)
  const [members, setMembers] = useState<any[]>([])
  const [myRole, setMyRole] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState('')
  const [tgLinks, setTgLinks] = useState<any[]>([])
  const [showFullCalendar, setShowFullCalendar] = useState(false)
  const [showFullQR, setShowFullQR] = useState(false)
  const [newTgLabel, setNewTgLabel] = useState('')
  const [newTgUrl, setNewTgUrl] = useState('')
  const [newTgPrivate, setNewTgPrivate] = useState(false)
  const [showAddTg, setShowAddTg] = useState(false)
  const calUrl = `${window.location.origin}/api/lichtungen/${lichtungId}/cal.ics`

  useEffect(() => {
    api.getLichtungMembers(lichtungId).then(setMembers).catch(() => {})
    api.getLichtungTelegramLinks(lichtungId).then(setTgLinks).catch(() => {})
    if (api.getToken()) {
      api.getMyLichtungRole(lichtungId).then(d => setMyRole(d.role)).catch(() => {})
      api.getLichtungQRCode(lichtungId).then(d => setQrUrl(d.url)).catch(() => {})
    }
  }, [lichtungId])

  const handleAddTg = async () => {
    if (!newTgLabel.trim() || !newTgUrl.trim()) return
    await api.addLichtungTelegramLink(lichtungId, newTgLabel, newTgUrl, newTgPrivate)
    api.getLichtungTelegramLinks(lichtungId).then(setTgLinks)
    setNewTgLabel('')
    setNewTgUrl('')
    setNewTgPrivate(false)
    setShowAddTg(false)
  }

  const handleDeleteTg = async (linkId: string) => {
    await api.deleteLichtungTelegramLink(lichtungId, linkId)
    api.getLichtungTelegramLinks(lichtungId).then(setTgLinks)
  }

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

  if (showFullCalendar) {
    return <FullCalendar lichtungId={lichtungId} lichtungName={lichtung.name} myRole={myRole} onClose={() => setShowFullCalendar(false)} />
  }

  // Vollbild-QR
  if (showFullQR && qrUrl) {
    return (
      <div className="fixed inset-0 z-[2500] flex flex-col items-center justify-center p-6" style={{ background: '#FDFCF9' }}>
        <button onClick={() => setShowFullQR(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.08)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', fontWeight: 500, color: '#0A0A0A', marginBottom: '4px' }}>
            {lichtung.name}
          </h2>
          <p style={{ ...font, fontSize: '0.85rem', color: 'rgba(10,10,10,0.45)' }}>
            Scanne den Code, um Mitglied zu werden
          </p>
        </div>

        <div className="rounded-2xl p-8 shadow-xl" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
          <QRCodeSVG value={qrUrl} size={Math.min(380, window.innerWidth - 80)} bgColor="#fff" fgColor="#0A0A0A" level="H"
            imageSettings={{
              src: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="17" fill="#FDFCF9"/><circle cx="18" cy="18" r="14" fill="#7BAE5E" opacity="0.7"/><circle cx="18" cy="18" r="8" fill="#D4E8C0" opacity="0.9"/><circle cx="18" cy="18" r="4" fill="#FFFFF0"/></svg>'),
              height: 50, width: 50, excavate: true,
            }} />
        </div>

        <div className="mt-6 text-center max-w-md">
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.55)', lineHeight: 1.6 }}>
            "Wer durch dich beitritt, ist mit dir verbunden. Du buergst fuer ihn."
          </p>
          <p style={{ ...font, fontSize: '0.72rem', color: 'rgba(10,10,10,0.35)', marginTop: '12px' }}>
            Vorstufe zum Web of Trust — echte Vernetzung durch echte Begegnung.
          </p>
        </div>
      </div>
    )
  }

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
        {['info', 'kalender', 'galerie', 'community'].map(key => (
          <button key={key} onClick={() => setTab(key as any)} className="pb-2 px-2.5 shrink-0"
            style={{ ...font, fontSize: '0.68rem', fontWeight: 500, color: tab === key ? '#7BAE5E' : 'rgba(10,10,10,0.35)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === key ? '#7BAE5E' : 'transparent'}`, cursor: 'pointer' }}>
            {key === 'info' ? 'Info' : key === 'kalender' ? 'Kalender' : key === 'galerie' ? 'Galerie' : `Community (${members.length})`}
          </button>
        ))}
      </div>

      <div className="overflow-y-auto p-5" style={{ maxHeight: 'calc(100vh - 200px)' }}>
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
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl mb-4"
              style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#0A0A0A', background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)', textDecoration: 'none' }}>
              <Navigation size={15} style={{ color: '#7BAE5E' }} />
              Zum Standort navigieren
            </a>

            {/* Telegram-Gruppen */}
            {(tgLinks.length > 0 || (myRole === 'owner' || myRole === 'admin')) && (
              <div className="rounded-xl p-3" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={13} style={{ color: '#5078C8' }} />
                    <span style={{ ...font, fontSize: '0.72rem', fontWeight: 600, color: '#0A0A0A' }}>Telegram-Gruppen</span>
                  </div>
                  {(myRole === 'owner' || myRole === 'admin') && !showAddTg && (
                    <button onClick={() => setShowAddTg(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.4)', padding: '2px' }}>
                      <Plus size={14} />
                    </button>
                  )}
                </div>

                {tgLinks.length === 0 && !showAddTg && (
                  <p style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.35)' }}>
                    Noch keine Gruppen verlinkt.
                  </p>
                )}

                {tgLinks.map((link: any) => {
                  const locked = link.locked // Private Gruppe, User kein Mitglied
                  return (
                    <div key={link.id} className="flex items-center gap-2 mb-1.5">
                      {locked ? (
                        <div className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg"
                          style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)' }}>
                          <Lock size={12} style={{ color: 'rgba(10,10,10,0.3)' }} />
                          <span style={{ ...font, fontSize: '0.75rem', color: 'rgba(10,10,10,0.45)' }}>{link.label}</span>
                          <span style={{ ...font, fontSize: '0.62rem', color: 'rgba(10,10,10,0.3)', marginLeft: 'auto' }}>
                            Nur fuer Mitglieder
                          </span>
                        </div>
                      ) : (
                        <a href={link.url} target="_blank" rel="noopener noreferrer"
                          className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg"
                          style={{ background: '#fff', border: '1px solid rgba(80,120,200,0.12)', textDecoration: 'none' }}>
                          <MessageCircle size={12} style={{ color: '#5078C8' }} />
                          <span style={{ ...font, fontSize: '0.75rem', color: '#0A0A0A' }}>{link.label}</span>
                          {link.is_private && <Lock size={10} style={{ color: '#D4A843', marginLeft: 'auto' }} />}
                        </a>
                      )}
                      {(myRole === 'owner' || myRole === 'admin') && (
                        <button onClick={() => handleDeleteTg(link.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)', padding: '4px' }}>
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  )
                })}

                {showAddTg && (
                  <div className="mt-2 space-y-2">
                    <input type="text" value={newTgLabel} onChange={e => setNewTgLabel(e.target.value)}
                      placeholder="Name (z.B. Yoga-Kreis)"
                      className="w-full px-3 py-2 rounded-lg outline-none"
                      style={{ border: '1px solid rgba(10,10,10,0.08)', ...font, fontSize: '0.78rem', background: '#fff' }} />
                    <input type="url" value={newTgUrl} onChange={e => setNewTgUrl(e.target.value)}
                      placeholder="https://t.me/+abc oder https://t.me/gruppe"
                      className="w-full px-3 py-2 rounded-lg outline-none"
                      style={{ border: '1px solid rgba(10,10,10,0.08)', ...font, fontSize: '0.72rem', background: '#fff', fontFamily: 'monospace' }} />
                    <label className="flex items-start gap-2 cursor-pointer p-2 rounded-lg" style={{ background: newTgPrivate ? 'rgba(212,168,67,0.06)' : '#fff' }}>
                      <button type="button" onClick={() => setNewTgPrivate(!newTgPrivate)}
                        className="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5"
                        style={{ border: newTgPrivate ? 'none' : '1px solid rgba(10,10,10,0.15)', background: newTgPrivate ? '#D4A843' : '#fff', cursor: 'pointer' }}>
                        {newTgPrivate && <Check size={11} color="#fff" />}
                      </button>
                      <div>
                        <span style={{ ...font, fontSize: '0.72rem', fontWeight: 500, color: '#0A0A0A', display: 'block' }}>Private Gruppe</span>
                        <span style={{ ...font, fontSize: '0.62rem', color: 'rgba(10,10,10,0.4)', display: 'block' }}>
                          Link nur fuer Lichtung-Mitglieder sichtbar.
                        </span>
                      </div>
                    </label>
                    <div className="flex gap-2">
                      <button onClick={handleAddTg} className="flex-1 py-2 rounded-lg"
                        style={{ background: '#5078C8', border: 'none', ...font, fontSize: '0.72rem', fontWeight: 500, color: '#fff', cursor: 'pointer' }}>
                        Hinzufuegen
                      </button>
                      <button onClick={() => { setShowAddTg(false); setNewTgLabel(''); setNewTgUrl('') }}
                        className="px-3 py-2 rounded-lg"
                        style={{ background: 'none', border: '1px solid rgba(10,10,10,0.08)', ...font, fontSize: '0.72rem', color: 'rgba(10,10,10,0.5)', cursor: 'pointer' }}>
                        Abbrechen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* QR-Code (alle Mitglieder) */}
            {qrUrl && myRole && (
              <div className="rounded-xl p-4 mt-4" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <QrCode size={13} style={{ color: '#7BAE5E' }} />
                  <span style={{ ...font, fontSize: '0.72rem', fontWeight: 600, color: '#0A0A0A' }}>Einladung zur Lichtung</span>
                </div>

                <button onClick={() => setShowFullQR(true)}
                  className="w-full flex items-center justify-center p-3 rounded-lg transition-all"
                  style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)', cursor: 'pointer' }}>
                  <div className="flex items-center gap-3">
                    <QRCodeSVG value={qrUrl} size={70} bgColor="#fff" fgColor="#0A0A0A" level="M" />
                    <div className="text-left">
                      <div style={{ ...font, fontSize: '0.78rem', fontWeight: 500, color: '#0A0A0A' }}>Tippe zum Vergroessern</div>
                      <div style={{ ...font, fontSize: '0.62rem', color: 'rgba(10,10,10,0.4)', marginTop: '2px' }}>
                        Wer ihn scannt, wird Mitglied
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Maximize2 size={10} style={{ color: '#7BAE5E' }} />
                        <span style={{ ...font, fontSize: '0.6rem', color: '#7BAE5E' }}>Vollbild</span>
                      </div>
                    </div>
                  </div>
                </button>

                <p style={{ ...font, fontSize: '0.62rem', color: 'rgba(10,10,10,0.35)', marginTop: '8px', lineHeight: 1.5 }}>
                  Wer durch dich beitritt, ist mit dir verbunden. Du buergst fuer ihn.
                </p>
              </div>
            )}
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

            {/* Aktionen */}
            <div className="space-y-2 mt-4">
              {(myRole === 'owner' || myRole === 'admin') && (
                <button onClick={() => setShowFullCalendar(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
                  style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#fff', background: '#0A0A0A', border: 'none', cursor: 'pointer' }}>
                  <CalendarDays size={16} />
                  Kalender verwalten
                </button>
              )}
              {onCreateEvent && (myRole === 'owner' || myRole === 'admin') && (
                <button
                  onClick={() => onCreateEvent(lichtungId, lichtung.name, [lichtung.lat, lichtung.lng])}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
                  style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#fff', background: '#7BAE5E', border: 'none', cursor: 'pointer' }}>
                  <Plus size={16} />
                  Termin erstellen
                </button>
              )}
            </div>
          </>
        )}
        {tab === 'galerie' && (
          <LichtungGallery lichtungId={lichtungId} canUpload={!!myRole} />
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
                      {m.role === 'owner' && <><Shield size={9} /> Hueter</>}
                      {m.role === 'admin' && <><Shield size={9} /> Gaertner</>}
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
                      {m.role === 'admin' ? '→ Mitglied' : '→ Gaertner'}
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
