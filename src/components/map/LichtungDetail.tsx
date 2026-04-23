import { useState, useEffect } from 'react'
import { X, CalendarDays, Clock, Users, Navigation, Repeat, Plus, Link2, Copy, Check, QrCode, Shield, MessageCircle, Trash2, Lock, Pencil, Move, Camera, Info, ImagePlus, Settings } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { LichtungGallery } from './LichtungGallery'
import { QRCodeSVG } from 'qrcode.react'
import { FullCalendar } from './FullCalendar'
import { renderMarkdown } from '../../lib/markdown'
import { ShareButton } from '../ShareButton'
import * as api from '../../api/client'

const TYPE_COLORS: Record<string, string> = {
  meditation: '#E8751A', gebet: '#A07CC0', stille: '#6BA3BE',
  begegnung: '#E8751A', tanz: '#D4766E', fest: '#E0A050',
}

function formatDate(d: string) { return new Date(d).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' }) }
function formatTime(d: string) { return new Date(d).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) }

interface LichtungDetailProps {
  lichtungId: string
  onClose: () => void
  onCreateEvent?: (lichtungId: string, lichtungName: string, position: [number, number]) => void
  onMoveLichtung?: (lichtungId: string) => void
  onDeleted?: () => void
}

export function LichtungDetail({ lichtungId, onClose, onCreateEvent, onMoveLichtung, onDeleted }: LichtungDetailProps) {
  const { setEvents: setGlobalEvents, user } = useApp()
  const [lichtung, setLichtung] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'info' | 'kalender' | 'galerie' | 'community' | 'settings'>('info')
  const [editMode, setEditMode] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
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
  const [editingTg, setEditingTg] = useState<string | null>(null)
  const [editTgLabel, setEditTgLabel] = useState('')
  const [editTgUrl, setEditTgUrl] = useState('')
  // moonPhases werden nur durch Monats/Wochen-Ansichten verwendet — hier nicht noetig
  const calUrl = `${window.location.origin}/api/lichtungen/${lichtungId}/cal.ics`

  // Globale Events neu laden (fuer sofortige Karten-Aktualisierung)
  const reloadGlobalEvents = async () => {
    const all = await api.getEvents()
    const mapped = all.map((e: any) => ({
      id: e.id, title: e.title, description: e.description || '',
      position: [e.lat, e.lng] as [number, number],
      start: e.start_time, end: e.end_time,
      type: e.type || 'meditation', recurring: e.recurring, createdBy: e.user_id,
    }))
    setGlobalEvents(mapped)
  }

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

  const startEditTg = (link: any) => {
    setEditingTg(link.id)
    setEditTgLabel(link.label)
    setEditTgUrl(link.url)
  }

  const saveEditTg = async () => {
    if (!editingTg || !editTgLabel.trim()) return
    await api.updateLichtungTelegramLink(lichtungId, editingTg, { label: editTgLabel, url: editTgUrl })
    await api.getLichtungTelegramLinks(lichtungId).then(setTgLinks)
    setEditingTg(null)
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
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 500, color: '#1A1A1A', marginBottom: '4px' }}>
            {lichtung.name}
          </h2>
          <p style={{ ...font, fontSize: '0.85rem', color: 'rgba(10,10,10,0.45)' }}>
            Scanne den Code, um Mitglied zu werden
          </p>
        </div>

        <div className="rounded-2xl p-8 shadow-xl" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
          <QRCodeSVG value={qrUrl} size={Math.min(380, window.innerWidth - 80)} bgColor="#fff" fgColor="#1A1A1A" level="H"
            imageSettings={{
              src: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="17" fill="#FDFCF9"/><circle cx="18" cy="18" r="14" fill="#E8751A" opacity="0.7"/><circle cx="18" cy="18" r="8" fill="#D4E8C0" opacity="0.9"/><circle cx="18" cy="18" r="4" fill="#FFFFF0"/></svg>'),
              height: 50, width: 50, excavate: true,
            }} />
        </div>

        <div className="mt-6 text-center max-w-md">
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.05rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.55)', lineHeight: 1.6 }}>
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
      {/* Tabs (mit Icons) + X in einer Zeile */}
      <div className="flex items-center px-3 py-2 gap-0.5" style={{ borderBottom: '1px solid rgba(10,10,10,0.04)' }}>
        {([
          { key: 'info', label: 'Info', Icon: Info, badge: '' },
          { key: 'kalender', label: 'Kalender', Icon: CalendarDays, badge: '' },
          { key: 'galerie', label: 'Galerie', Icon: ImagePlus, badge: '' },
          { key: 'community', label: 'Community', Icon: Users, badge: String(members.length) },
          ...((myRole === 'owner' || myRole === 'admin') ? [{ key: 'settings' as const, label: 'Einstellungen', Icon: Settings, badge: '' }] : []),
        ] as { key: string; label: string; Icon: any; badge: string }[]).map(({ key, label, Icon, badge }) => (
          <div key={key} className="relative group">
            <button onClick={() => setTab(key as any)}
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 34, height: 34,
                background: tab === key ? 'rgba(123,174,94,0.1)' : 'transparent',
                border: 'none', cursor: 'pointer',
              }}>
              <Icon size={15} style={{ color: tab === key ? '#E8751A' : 'rgba(10,10,10,0.4)' }} />
              {badge && (
                <span className="absolute -top-0.5 -right-0.5 rounded-full flex items-center justify-center"
                  style={{ minWidth: 14, height: 14, padding: '0 3px', background: '#E8751A', color: '#fff', fontSize: '0.55rem', fontWeight: 600, ...font }}>
                  {badge}
                </span>
              )}
            </button>
            {/* Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
              style={{ background: '#1A1A1A', whiteSpace: 'nowrap', zIndex: 10 }}>
              <span style={{ ...font, fontSize: '0.6rem', color: '#fff' }}>{label}</span>
            </div>
          </div>
        ))}
        <div className="flex-1" />
        <button onClick={onClose} className="flex items-center justify-center rounded-lg"
          style={{ width: 34, height: 34, background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}>
          <X size={16} />
        </button>
      </div>

      <div className="overflow-y-auto p-5" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {tab === 'info' && (
          <>
            {/* Profilbild mit QR-Code + Upload */}
            <div className="relative w-full h-40 rounded-xl overflow-hidden mb-4" style={{ background: 'rgba(123,174,94,0.06)', border: '1px solid rgba(10,10,10,0.04)' }}>
              {lichtung.image_path ? (
                <img src={lichtung.image_path} alt={lichtung.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <QrCode size={24} style={{ color: 'rgba(123,174,94,0.3)', marginBottom: '6px' }} />
                  <span style={{ ...font, fontSize: '0.7rem', color: 'rgba(10,10,10,0.35)' }}>Noch kein Bild</span>
                </div>
              )}

              {/* Upload-Overlay (nur Owner/Admin) */}
              {(myRole === 'owner' || myRole === 'admin') && (
                <>
                  <input type="file" accept="image/*" id={`macher-img-${lichtungId}`} className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      await api.uploadLichtungProfileImage(lichtungId, file)
                      const updated = await api.getLichtung(lichtungId)
                      setLichtung(updated)
                    }} />
                  <label htmlFor={`macher-img-${lichtungId}`}
                    className="absolute top-2 left-2 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', border: '1px solid rgba(10,10,10,0.08)' }}
                    title="Bild hochladen">
                    <Camera size={13} style={{ color: 'rgba(10,10,10,0.6)' }} />
                  </label>
                </>
              )}

              {/* QR-Code klein unten rechts */}
              {qrUrl && myRole && (
                <button onClick={() => setShowFullQR(true)}
                  className="absolute bottom-2 right-2 rounded-lg overflow-hidden p-1"
                  style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.08)', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
                  title="QR-Code vergroessern">
                  <QRCodeSVG value={qrUrl} size={52} bgColor="#fff" fgColor="#1A1A1A" level="M" />
                </button>
              )}
            </div>

            {editMode ? (
              /* ─── Bearbeiten ─── */
              <div className="space-y-3 mb-4">
                <div>
                  <label style={{ ...font, fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.35)', display: 'block', marginBottom: '4px' }}>Name</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{ border: '1px solid rgba(10,10,10,0.1)', ...font, fontSize: '0.85rem', color: '#1A1A1A' }} />
                </div>
                <div>
                  <label style={{ ...font, fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.35)', display: 'block', marginBottom: '4px' }}>Beschreibung</label>
                  <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={4}
                    className="w-full px-3 py-2 rounded-lg outline-none resize-none"
                    style={{ border: '1px solid rgba(10,10,10,0.1)', fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.92rem', lineHeight: 1.6, color: '#1A1A1A' }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={async () => {
                    await api.updateLichtung(lichtungId, { name: editName, description: editDesc })
                    const updated = await api.getLichtung(lichtungId)
                    setLichtung(updated)
                    setEditMode(false)
                  }}
                    className="flex-1 py-2 rounded-lg"
                    style={{ ...font, fontSize: '0.78rem', fontWeight: 500, color: '#fff', background: '#E8751A', border: 'none', cursor: 'pointer' }}>
                    Speichern
                  </button>
                  <button onClick={() => setEditMode(false)}
                    className="px-4 py-2 rounded-lg"
                    style={{ ...font, fontSize: '0.78rem', color: 'rgba(10,10,10,0.5)', background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)', cursor: 'pointer' }}>
                    Abbrechen
                  </button>
                </div>
                {/* Loeschen im Bearbeiten-Modus */}
                {myRole === 'owner' && (
                  <button onClick={async () => {
                    if (!confirm(`"${lichtung.name}" wirklich loeschen? Alle Events und Mitglieder werden entfernt.`)) return
                    try {
                      await api.deleteLichtung(lichtungId)
                      onDeleted?.()
                      onClose()
                    } catch (err: any) {
                      alert(err?.message || 'Loeschen fehlgeschlagen.')
                    }
                  }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg mt-2"
                    style={{ ...font, fontSize: '0.72rem', color: '#c44', background: 'rgba(200,50,50,0.04)', border: '1px solid rgba(200,50,50,0.15)', cursor: 'pointer' }}>
                    <Trash2 size={12} />
                    Werkstatt loeschen
                  </button>
                )}
              </div>
            ) : (
              /* ─── Anzeige ─── */
              <>
                <div className="flex items-start justify-between mb-4 gap-2">
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 500, color: '#1A1A1A' }}>
                    {lichtung.name}
                  </h2>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <ShareButton
                      url={`${window.location.origin}/api/share/lichtung/${lichtungId}`}
                      title={`Werkstatt: ${lichtung.name}`}
                      text={lichtung.description ? lichtung.description.split('\n')[0].replace(/[#*>]/g, '').trim().slice(0, 140) : 'Eine Werkstatt auf der Macher-Map.'}
                      label=""
                      compact
                    />
                    {onMoveLichtung && (myRole === 'owner' || myRole === 'admin') && (
                      <button onClick={() => onMoveLichtung(lichtungId)}
                        title="Werkstatt neu platzieren"
                        className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg"
                        style={{ ...font, fontSize: '0.7rem', fontWeight: 500, color: '#E8751A', background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.25)', cursor: 'pointer' }}>
                        <Move size={13} />
                        Platzieren
                      </button>
                    )}
                    {(myRole === 'owner' || myRole === 'admin') && (
                      <button onClick={() => { setEditName(lichtung.name); setEditDesc(lichtung.description || ''); setEditMode(true) }}
                        title="Bearbeiten"
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)', cursor: 'pointer' }}>
                        <Pencil size={13} style={{ color: 'rgba(10,10,10,0.35)' }} />
                      </button>
                    )}
                  </div>
                </div>

                {lichtung.description && (
                  <div className="rounded-xl p-5 mb-4" style={{ background: '#FAFAF8' }}>
                    <div
                      className="prose-macher"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(lichtung.description) }}
                    />
                  </div>
                )}
              </>
            )}

            {/* Navigation */}
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl mb-4"
              style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#1A1A1A', background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)', textDecoration: 'none' }}>
              <Navigation size={15} style={{ color: '#E8751A' }} />
              Zum Standort navigieren
            </a>

            {/* Telegram-Gruppen */}
            {(tgLinks.length > 0 || (myRole === 'owner' || myRole === 'admin')) && (
              <div className="rounded-xl p-3" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={13} style={{ color: '#D4A020' }} />
                    <span style={{ ...font, fontSize: '0.72rem', fontWeight: 600, color: '#1A1A1A' }}>Telegram-Gruppen</span>
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
                  const locked = link.locked
                  const isEditing = editingTg === link.id
                  return (
                    <div key={link.id} className="flex items-center gap-2 mb-1.5">
                      {isEditing ? (
                        <div className="flex-1 flex flex-col gap-1.5">
                          <input type="text" value={editTgLabel} onChange={e => setEditTgLabel(e.target.value)}
                            placeholder="Name" autoFocus
                            className="w-full px-2.5 py-1.5 rounded-lg outline-none"
                            style={{ ...font, fontSize: '0.75rem', color: '#1A1A1A', background: '#fff', border: '1px solid rgba(80,120,200,0.25)' }} />
                          <input type="text" value={editTgUrl} onChange={e => setEditTgUrl(e.target.value)}
                            placeholder="https://t.me/..."
                            className="w-full px-2.5 py-1.5 rounded-lg outline-none"
                            style={{ ...font, fontSize: '0.72rem', color: 'rgba(10,10,10,0.55)', background: '#fff', border: '1px solid rgba(10,10,10,0.08)' }} />
                          <div className="flex gap-1.5">
                            <button onClick={saveEditTg}
                              style={{ ...font, fontSize: '0.68rem', fontWeight: 500, color: '#fff', background: '#D4A020', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>
                              Speichern
                            </button>
                            <button onClick={() => setEditingTg(null)}
                              style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>
                              Abbrechen
                            </button>
                          </div>
                        </div>
                      ) : locked ? (
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
                          <MessageCircle size={12} style={{ color: '#D4A020' }} />
                          <span style={{ ...font, fontSize: '0.75rem', color: '#1A1A1A' }}>{link.label}</span>
                          {!!link.is_private && <Lock size={10} style={{ color: '#E8751A', marginLeft: 'auto' }} />}
                        </a>
                      )}
                      {!isEditing && (myRole === 'owner' || myRole === 'admin') && (
                        <>
                          <button onClick={() => startEditTg(link)}
                            title="Bearbeiten"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)', padding: '4px' }}>
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => handleDeleteTg(link.id)}
                            title="Loeschen"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)', padding: '4px' }}>
                            <Trash2 size={12} />
                          </button>
                        </>
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
                        style={{ border: newTgPrivate ? 'none' : '1px solid rgba(10,10,10,0.15)', background: newTgPrivate ? '#E8751A' : '#fff', cursor: 'pointer' }}>
                        {newTgPrivate && <Check size={11} color="#fff" />}
                      </button>
                      <div>
                        <span style={{ ...font, fontSize: '0.72rem', fontWeight: 500, color: '#1A1A1A', display: 'block' }}>Private Gruppe</span>
                        <span style={{ ...font, fontSize: '0.62rem', color: 'rgba(10,10,10,0.4)', display: 'block' }}>
                          Link nur fuer Werkstatt-Mitglieder sichtbar.
                        </span>
                      </div>
                    </label>
                    <div className="flex gap-2">
                      <button onClick={handleAddTg} className="flex-1 py-2 rounded-lg"
                        style={{ background: '#D4A020', border: 'none', ...font, fontSize: '0.72rem', fontWeight: 500, color: '#fff', cursor: 'pointer' }}>
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

          </>
        )}
        {tab === 'kalender' && (
          <>
            {/* Neuer-Termin-Button — fuer alle Mitglieder */}
            {onCreateEvent && myRole && (
              <button
                onClick={() => onCreateEvent(lichtungId, lichtung.name, [lichtung.lat, lichtung.lng])}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-4"
                style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#fff', background: '#1A1A1A', border: 'none', cursor: 'pointer' }}
              >
                <Plus size={15} />
                Termin erstellen
              </button>
            )}

            {/* Nicht-Mitglied: Aufforderung zum Beitreten */}
            {onCreateEvent && !myRole && user && (
              <div className="rounded-xl p-4 mb-4 text-center" style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.15)' }}>
                <p style={{ ...font, fontSize: '0.78rem', color: 'rgba(10,10,10,0.55)', marginBottom: 8 }}>
                  Werde Mitglied dieser Werkstatt, um Termine zu erstellen.
                </p>
              </div>
            )}

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
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: TYPE_COLORS[e.type] || '#E8751A' }} />
                      <span style={{ ...font, fontSize: '0.82rem', fontWeight: 600, color: '#1A1A1A' }}>{e.title}</span>
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
                      <span className="flex items-center gap-1" style={{ ...font, fontSize: '0.6rem', color: '#E8751A' }}>
                        <Users size={10} /> {e.participant_count}{e.max_participants ? `/${e.max_participants}` : ''}
                      </span>
                    </div>
                    {e.description && (
                      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.82rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.45)', lineHeight: 1.5 }}>
                        {e.description.slice(0, 120)}{e.description.length > 120 ? '...' : ''}
                      </p>
                    )}
                    {/* Loeschen fuer Admins/Owner */}
                    {(myRole === 'owner' || myRole === 'admin') && (
                      <div className="flex gap-2 mt-2 pt-2" style={{ borderTop: '1px solid rgba(10,10,10,0.04)' }}>
                        <button onClick={async () => {
                          const reason = prompt(`"${e.title}" absagen?\n\nOptional: Grund fuer die Absage (wird an Teilnehmer gesendet):`)
                          if (reason === null) return // Abgebrochen
                          try {
                            await api.deleteEvent(e.id, reason || undefined)
                            api.getLichtungEvents(lichtungId).then(setEvents)
                            reloadGlobalEvents()
                          } catch (err: any) {
                            alert(err.message || 'Fehler beim Loeschen.')
                          }
                        }}
                          className="flex items-center gap-1 px-2 py-1 rounded"
                          style={{ ...font, fontSize: '0.6rem', color: '#c44', background: 'rgba(200,50,50,0.04)', border: '1px solid rgba(200,50,50,0.12)', cursor: 'pointer' }}>
                          <Trash2 size={10} /> Absagen
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Kalender abonnieren */}
            {events.length > 0 && (
              <div className="rounded-xl p-3 mt-3" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Link2 size={12} style={{ color: '#E8751A' }} />
                  <span style={{ ...font, fontSize: '0.68rem', fontWeight: 600, color: 'rgba(10,10,10,0.5)' }}>Kalender abonnieren</span>
                </div>
                <div className="flex items-center gap-2">
                  <input readOnly value={calUrl} className="flex-1 px-2 py-1.5 rounded text-xs outline-none"
                    style={{ border: '1px solid rgba(10,10,10,0.06)', fontFamily: 'monospace', fontSize: '0.58rem', color: 'rgba(10,10,10,0.4)', background: '#fff' }}
                    onClick={e => (e.target as HTMLInputElement).select()} />
                  <button onClick={() => { navigator.clipboard.writeText(calUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                    className="shrink-0 rounded px-2 py-1.5" style={{ background: copied ? 'rgba(123,174,94,0.1)' : '#fff', border: '1px solid rgba(10,10,10,0.06)', cursor: 'pointer' }}>
                    {copied ? <Check size={12} style={{ color: '#E8751A' }} /> : <Copy size={12} style={{ color: 'rgba(10,10,10,0.35)' }} />}
                  </button>
                </div>
              </div>
            )}

            {/* Aktion: Kalender oeffnen (mit Slots + Termin-Erstellung darin) */}
            <div className="space-y-2 mt-4">
              {(myRole === 'owner' || myRole === 'admin') && (
                <button onClick={() => setShowFullCalendar(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
                  style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#fff', background: '#1A1A1A', border: 'none', cursor: 'pointer' }}>
                  <CalendarDays size={16} />
                  Kalender oeffnen
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
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9rem', color: '#E8751A' }}>{m.name?.charAt(0) || '?'}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#1A1A1A' }} className="truncate block">{m.name}</span>
                    <span className="flex items-center gap-1" style={{ ...font, fontSize: '0.62rem', color: m.role === 'owner' ? '#E8751A' : m.role === 'admin' ? '#E8751A' : 'rgba(10,10,10,0.35)' }}>
                      {m.role === 'owner' && <><Shield size={9} /> Meister</>}
                      {m.role === 'admin' && <><Shield size={9} /> Vorarbeiter</>}
                      {m.role === 'member' && 'Mitglied'}
                    </span>
                  </div>
                  {/* Rolle aendern (nur fuer Meister) */}
                  {myRole === 'owner' && m.id !== user?.id && (
                    <div className="flex gap-1 shrink-0">
                      {m.role !== 'owner' && (
                        <button
                          onClick={() => api.setMemberRole(lichtungId, m.id, 'owner').then(() => api.getLichtungMembers(lichtungId).then(setMembers))}
                          title="Zum Meister machen"
                          style={{ ...font, fontSize: '0.58rem', color: '#E8751A', background: 'rgba(123,174,94,0.08)', border: '1px solid rgba(123,174,94,0.2)', borderRadius: '6px', padding: '2px 7px', cursor: 'pointer' }}>
                          Meister
                        </button>
                      )}
                      {m.role !== 'admin' && (
                        <button
                          onClick={() => api.setMemberRole(lichtungId, m.id, 'admin').then(() => api.getLichtungMembers(lichtungId).then(setMembers))}
                          title="Zum Vorarbeiter machen"
                          style={{ ...font, fontSize: '0.58rem', color: '#E8751A', background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: '6px', padding: '2px 7px', cursor: 'pointer' }}>
                          Vorarbeiter
                        </button>
                      )}
                      {m.role !== 'member' && (
                        <button
                          onClick={() => api.setMemberRole(lichtungId, m.id, 'member').then(() => api.getLichtungMembers(lichtungId).then(setMembers))}
                          title="Zum Mitglied machen"
                          style={{ ...font, fontSize: '0.58rem', color: 'rgba(10,10,10,0.4)', background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.08)', borderRadius: '6px', padding: '2px 7px', cursor: 'pointer' }}>
                          Mitglied
                        </button>
                      )}
                    </div>
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
                style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#fff', background: '#E8751A', border: 'none', cursor: 'pointer' }}>
                <Users size={16} />
                Dieser Werkstatt beitreten
              </button>
            )}
          </>
        )}
        {tab === 'settings' && (myRole === 'owner' || myRole === 'admin') && (
          <>
            {/* Ort bearbeiten */}
            <div className="mb-4">
              <p style={{ ...font, fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.35)', marginBottom: '8px' }}>Ort verwalten</p>
              <button onClick={() => { setEditName(lichtung.name); setEditDesc(lichtung.description || ''); setTab('info'); setEditMode(true) }}
                className="w-full flex items-center gap-2 p-3 rounded-lg"
                style={{ ...font, fontSize: '0.78rem', color: '#1A1A1A', background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)', cursor: 'pointer', textAlign: 'left' }}>
                <Pencil size={14} style={{ color: '#E8751A' }} />
                Name und Beschreibung bearbeiten
              </button>
            </div>

            {/* Telegram-Bot */}
            <div className="mb-4">
              <p style={{ ...font, fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.35)', marginBottom: '8px' }}>Telegram-Bot</p>
              <div className="rounded-lg p-3" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
                <p style={{ ...font, fontSize: '0.75rem', color: 'rgba(10,10,10,0.5)', lineHeight: 1.5, marginBottom: '8px' }}>
                  Fuege den Bot zu einer Telegram-Gruppe hinzu und tippe dort:
                </p>
                <code style={{ ...font, fontSize: '0.72rem', color: '#E8751A', background: 'rgba(123,174,94,0.06)', padding: '4px 8px', borderRadius: '4px', display: 'block', marginBottom: '6px' }}>
                  /connect {lichtung.code || lichtungId.slice(0, 8)}
                </code>
                <p style={{ ...font, fontSize: '0.65rem', color: 'rgba(10,10,10,0.35)' }}>
                  Neue Events werden automatisch in die Gruppe gepostet.
                </p>
              </div>
            </div>

            {/* Rollen */}
            <div className="mb-4">
              <p style={{ ...font, fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.35)', marginBottom: '8px' }}>Rollen</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: '#FAFAF8' }}>
                  <Shield size={12} style={{ color: '#E8751A' }} />
                  <span style={{ ...font, fontSize: '0.72rem', color: '#1A1A1A', flex: 1 }}>Meister</span>
                  <span style={{ ...font, fontSize: '0.6rem', color: 'rgba(10,10,10,0.35)' }}>Volle Kontrolle</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: '#FAFAF8' }}>
                  <Shield size={12} style={{ color: '#E8751A' }} />
                  <span style={{ ...font, fontSize: '0.72rem', color: '#1A1A1A', flex: 1 }}>Vorarbeiter</span>
                  <span style={{ ...font, fontSize: '0.6rem', color: 'rgba(10,10,10,0.35)' }}>Events + Kalender</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: '#FAFAF8' }}>
                  <Users size={12} style={{ color: 'rgba(10,10,10,0.35)' }} />
                  <span style={{ ...font, fontSize: '0.72rem', color: '#1A1A1A', flex: 1 }}>Mitglied</span>
                  <span style={{ ...font, fontSize: '0.6rem', color: 'rgba(10,10,10,0.35)' }}>Teilnehmen + Sehen</span>
                </div>
              </div>
            </div>

            {/* Ort loeschen */}
            {myRole === 'owner' && (
              <button onClick={async () => {
                if (!confirm(`"${lichtung.name}" wirklich loeschen? Alle Events und Mitglieder werden entfernt.`)) return
                try {
                  await api.deleteLichtung(lichtungId)
                  onDeleted?.()
                  onClose()
                } catch (err: any) {
                  alert(err?.message || 'Loeschen fehlgeschlagen.')
                }
              }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg mt-4"
                style={{ ...font, fontSize: '0.75rem', color: '#c44', background: 'rgba(200,50,50,0.04)', border: '1px solid rgba(200,50,50,0.15)', cursor: 'pointer' }}>
                <Trash2 size={14} />
                Ort loeschen
              </button>
            )}
          </>
        )}
      </div>

    </div>
  )
}
