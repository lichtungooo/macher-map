import { useState, useEffect } from 'react'
import { X, ArrowLeft, CalendarDays, Clock, MapPin, Repeat, Users, Heart, Eye, Navigation, Pencil, Trash2 } from 'lucide-react'
import { useApp, type EventItem } from '../../context/AppContext'
import { EditEventDialog } from './EditEventDialog'
import { renderMarkdown as renderMd } from '../../lib/markdown'
import { ShareButton } from '../ShareButton'
import * as api from '../../api/client'

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDist(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

const RECURRING_LABELS: Record<string, string> = {
  vollmond: 'Jeden Vollmond', neumond: 'Jeden Neumond',
  woechentlich: 'Woechentlich', monatlich: 'Monatlich',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

const renderMarkdown = renderMd

interface EventDetailProps {
  event: EventItem
  userPos?: [number, number] | null
  onClose: () => void
  onBack?: () => void
}

export function EventDetail({ event, userPos, onClose, onBack }: EventDetailProps) {
  const data = event as any
  const dist = userPos ? distanceKm(userPos[0], userPos[1], event.position[0], event.position[1]) : null
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${event.position[0]},${event.position[1]}`
  const { user, setEvents: setGlobalEvents } = useApp()
  const [status, setStatus] = useState<string | null>(null)
  const [participantCount, setParticipantCount] = useState(data.participant_count || data.participantCount || 0)
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [coOwners, setCoOwners] = useState<any[]>([])
  const [showAddCo, setShowAddCo] = useState(false)
  const [newCoEmail, setNewCoEmail] = useState('')
  const [coError, setCoError] = useState('')

  const tags = (data.tags || data.type || '').split(',').filter((t: string) => t.trim())

  useEffect(() => {
    if (user && api.getToken()) {
      api.getEventStatus(event.id).then(d => { setStatus(d.status); setParticipantCount(d.count) }).catch(() => {})
    }
    api.getEventParticipants(event.id).then(setParticipants).catch(() => {})
    api.getEventCoOwners(event.id).then(setCoOwners).catch(() => {})
  }, [event.id, user])

  const isOwner = !!user && user.id === event.createdBy
  const isCoOwner = !!user && coOwners.some(c => c.id === user.id)
  const canEdit = isOwner || isCoOwner

  const handleAddCoOwner = async () => {
    setCoError('')
    if (!newCoEmail.trim()) return
    try {
      await api.addEventCoOwner(event.id, newCoEmail.trim())
      const updated = await api.getEventCoOwners(event.id)
      setCoOwners(updated)
      setNewCoEmail('')
      setShowAddCo(false)
    } catch (err: any) {
      setCoError(err?.message || 'Fehler.')
    }
  }

  const handleRemoveCoOwner = async (userId: string) => {
    try {
      await api.removeEventCoOwner(event.id, userId)
      const updated = await api.getEventCoOwners(event.id)
      setCoOwners(updated)
    } catch {}
  }

  const handleAction = async (action: 'join' | 'watch' | 'leave') => {
    if (!user || !api.getToken()) return
    setLoading(true)
    try {
      if (action === 'join') { const d = await api.joinEvent(event.id); setStatus('joined'); setParticipantCount(d.count) }
      else if (action === 'watch') { const d = await api.watchEvent(event.id); setStatus('watching'); setParticipantCount(d.count) }
      else { const d = await api.leaveEvent(event.id); setStatus(null); setParticipantCount(d.count) }
      api.getEventParticipants(event.id).then(setParticipants).catch(() => {})
    } catch {} finally { setLoading(false) }
  }

  const font = { fontFamily: 'Inter, sans-serif' as const }

  return (
    <div className="fixed z-[1500] rounded-2xl shadow-xl overflow-hidden"
      style={{ top: '70px', right: '16px', width: '340px', maxHeight: 'calc(100vh - 90px)', background: '#fff', border: '1px solid rgba(10,10,10,0.06)', animation: 'fade-in-up 0.2s ease-out' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(10,10,10,0.04)' }}>
        {onBack ? (
          <button onClick={onBack} className="flex items-center gap-1" style={{ ...font, fontSize: '0.75rem', color: 'rgba(10,10,10,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={14} />
          </button>
        ) : <div />}
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.25)' }}>
          <X size={18} />
        </button>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 150px)' }}>
        {/* Event-Bild */}
        {data.image_path && (
          <img src={data.image_path} alt={event.title} className="w-full h-40 object-cover" />
        )}

        <div className="p-5">
          {/* Hashtags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map((tag: string, i: number) => (
                <span key={i} className="px-2 py-0.5 rounded-full"
                  style={{ ...font, fontSize: '0.65rem', fontWeight: 500, color: '#D4A843', background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.15)' }}>
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Title + Share */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.35rem', fontWeight: 500, color: '#0A0A0A', lineHeight: 1.3, flex: 1 }}>
              {event.title}
            </h2>
            <ShareButton
              url={`${window.location.origin}/api/share/event/${event.id}`}
              title={`Veranstaltung: ${event.title}`}
              text={event.description ? event.description.replace(/[#*>]/g, '').trim().slice(0, 140) : `${formatDate(event.start)} · ${formatTime(event.start)}`}
              label=""
              compact
            />
          </div>

          {/* Meta — kompakt */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2.5">
              <CalendarDays size={13} style={{ color: 'rgba(10,10,10,0.3)', flexShrink: 0 }} />
              <span style={{ ...font, fontSize: '0.78rem', color: 'rgba(10,10,10,0.5)' }}>{formatDate(event.start)}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock size={13} style={{ color: 'rgba(10,10,10,0.3)', flexShrink: 0 }} />
              <span style={{ ...font, fontSize: '0.78rem', color: 'rgba(10,10,10,0.5)' }}>{formatTime(event.start)} Uhr</span>
            </div>
            {event.recurring && (
              <div className="flex items-center gap-2.5">
                <Repeat size={13} style={{ color: 'rgba(10,10,10,0.3)', flexShrink: 0 }} />
                <span style={{ ...font, fontSize: '0.78rem', color: 'rgba(10,10,10,0.5)' }}>{RECURRING_LABELS[event.recurring]}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <MapPin size={13} style={{ color: 'rgba(10,10,10,0.3)', flexShrink: 0 }} />
              <span style={{ ...font, fontSize: '0.78rem', color: 'rgba(10,10,10,0.5)' }}>
                {dist != null ? formatDist(dist) + ' entfernt' : `${event.position[0].toFixed(3)}, ${event.position[1].toFixed(3)}`}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl mb-3"
            style={{ ...font, fontSize: '0.78rem', fontWeight: 500, color: '#0A0A0A', background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)', textDecoration: 'none' }}>
            <Navigation size={14} style={{ color: '#D4A843' }} />
            Zum Standort navigieren
          </a>

          {/* Description */}
          {event.description && (
            <div className="mb-4 rounded-xl p-3.5" style={{ background: '#FAFAF8' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.92rem', lineHeight: 1.7, color: 'rgba(10,10,10,0.55)' }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(event.description) }} />
            </div>
          )}

          {/* Teilnehmer */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={13} style={{ color: 'rgba(10,10,10,0.3)' }} />
              <span style={{ ...font, fontSize: '0.72rem', fontWeight: 500, color: 'rgba(10,10,10,0.4)' }}>
                {participantCount} {participantCount === 1 ? 'Teilnehmer' : 'Teilnehmer'}
              </span>
            </div>
            {participants.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {participants.map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
                    {p.image_path ? (
                      <img src={p.image_path} alt="" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(212,168,67,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.5rem', color: '#D4A843' }}>{p.name?.charAt(0)}</span>
                      </div>
                    )}
                    <span style={{ ...font, fontSize: '0.65rem', color: 'rgba(10,10,10,0.5)' }}>{p.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Teilnehmen / Beobachten */}
          {user && (
            <div className="flex gap-2">
              <button onClick={() => handleAction(status === 'joined' ? 'leave' : 'join')} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl"
                style={{
                  background: status === 'joined' ? 'rgba(212,168,67,0.1)' : '#0A0A0A',
                  border: status === 'joined' ? '1px solid rgba(212,168,67,0.3)' : 'none',
                  color: status === 'joined' ? '#D4A843' : '#fff',
                  ...font, fontSize: '0.78rem', fontWeight: 500, cursor: loading ? 'wait' : 'pointer',
                }}>
                <Heart size={14} fill={status === 'joined' ? '#D4A843' : 'none'} />
                {status === 'joined' ? 'Dabei' : 'Teilnehmen'}
              </button>
              <button onClick={() => handleAction(status === 'watching' ? 'leave' : 'watch')} disabled={loading}
                className="flex items-center justify-center px-4 py-2.5 rounded-xl"
                style={{
                  background: status === 'watching' ? 'rgba(10,10,10,0.06)' : 'transparent',
                  border: '1px solid ' + (status === 'watching' ? 'rgba(10,10,10,0.15)' : 'rgba(10,10,10,0.08)'),
                  color: status === 'watching' ? '#0A0A0A' : 'rgba(10,10,10,0.4)',
                  ...font, fontSize: '0.78rem', fontWeight: 500, cursor: loading ? 'wait' : 'pointer',
                }}>
                <Eye size={14} />
              </button>
            </div>
          )}

          {!user && (
            <p className="text-center" style={{ ...font, fontSize: '0.72rem', color: 'rgba(10,10,10,0.35)', marginTop: '8px' }}>
              Melde dich an, um teilzunehmen.
            </p>
          )}

          {/* Mitverantwortliche (nur Owner/Co-Owner sehen; nur Owner darf aendern) */}
          {canEdit && (
            <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(10,10,10,0.04)' }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ ...font, fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.4)' }}>
                  Mitverantwortliche
                </span>
                {isOwner && !showAddCo && (
                  <button onClick={() => setShowAddCo(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.4)', ...font, fontSize: '0.7rem' }}>
                    + hinzufuegen
                  </button>
                )}
              </div>

              {coOwners.length === 0 && !showAddCo && (
                <p style={{ ...font, fontSize: '0.7rem', color: 'rgba(10,10,10,0.35)' }}>
                  Keine Mitverantwortlichen.
                </p>
              )}

              <div className="space-y-1.5">
                {coOwners.map(c => (
                  <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#FAFAF8' }}>
                    {c.image_path ? (
                      <img src={c.image_path} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,168,67,0.15)' }}>
                        <span style={{ ...font, fontSize: '0.65rem', fontWeight: 500, color: '#D4A843' }}>{c.name?.charAt(0) || '?'}</span>
                      </div>
                    )}
                    <span className="flex-1 truncate" style={{ ...font, fontSize: '0.78rem', color: '#0A0A0A' }}>{c.name || c.email}</span>
                    {isOwner && (
                      <button onClick={() => handleRemoveCoOwner(c.id)} title="Entfernen"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)', padding: '2px' }}>
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {showAddCo && (
                <div className="mt-2 space-y-1.5">
                  <input type="email" value={newCoEmail} onChange={e => setNewCoEmail(e.target.value)}
                    placeholder="E-Mail des Nutzers"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{ ...font, fontSize: '0.75rem', color: '#0A0A0A', background: '#fff', border: '1px solid rgba(10,10,10,0.1)' }} />
                  <div className="flex gap-1.5">
                    <button onClick={handleAddCoOwner}
                      style={{ ...font, fontSize: '0.7rem', fontWeight: 500, color: '#fff', background: '#0A0A0A', border: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer' }}>
                      Hinzufuegen
                    </button>
                    <button onClick={() => { setShowAddCo(false); setNewCoEmail(''); setCoError('') }}
                      style={{ ...font, fontSize: '0.7rem', color: 'rgba(10,10,10,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Abbrechen
                    </button>
                  </div>
                  {coError && <p style={{ ...font, fontSize: '0.65rem', color: '#c44' }}>{coError}</p>}
                </div>
              )}
            </div>
          )}

          {/* Bearbeiten / Loeschen — Owner oder Co-Owner */}
          {canEdit && (
            <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: '1px solid rgba(10,10,10,0.04)' }}>
              <button
                onClick={() => setEditing(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg"
                style={{ ...font, fontSize: '0.72rem', color: 'rgba(10,10,10,0.5)', background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)', cursor: 'pointer' }}
              >
                <Pencil size={12} /> Bearbeiten
              </button>
              {isOwner && (
                <button
                  onClick={async () => {
                    const reason = prompt('Veranstaltung absagen?\n\nOptional: Grund (wird an Teilnehmer gesendet):')
                    if (reason === null) return
                    try {
                      await api.deleteEvent(event.id, reason || undefined)
                      api.getEvents().then(all => {
                        setGlobalEvents(all.map((e: any) => ({
                          id: e.id, title: e.title, description: e.description || '',
                          position: [e.lat, e.lng] as [number, number],
                          start: e.start_time, end: e.end_time,
                          type: e.type || 'meditation', recurring: e.recurring, createdBy: e.user_id,
                        })))
                      })
                      onClose()
                    } catch (err: any) {
                      alert(err.message || 'Fehler beim Loeschen.')
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg"
                  style={{ ...font, fontSize: '0.72rem', color: '#c44', background: 'rgba(200,50,50,0.04)', border: '1px solid rgba(200,50,50,0.15)', cursor: 'pointer' }}
                >
                  <Trash2 size={12} /> Loeschen
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {editing && <EditEventDialog event={event} onClose={() => setEditing(false)} onSaved={onClose} />}
    </div>
  )
}
