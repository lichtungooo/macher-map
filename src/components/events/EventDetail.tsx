import { useState, useEffect } from 'react'
import { X, ArrowLeft, CalendarDays, Clock, MapPin, Repeat, Users, Heart, Eye, Navigation } from 'lucide-react'
import { useApp, type EventItem } from '../../context/AppContext'
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

function renderMarkdown(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br/>')
}

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
  const { user } = useApp()
  const [status, setStatus] = useState<string | null>(null)
  const [participantCount, setParticipantCount] = useState(data.participant_count || data.participantCount || 0)
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const tags = (data.tags || data.type || '').split(',').filter((t: string) => t.trim())

  useEffect(() => {
    if (user && api.getToken()) {
      api.getEventStatus(event.id).then(d => { setStatus(d.status); setParticipantCount(d.count) }).catch(() => {})
    }
    api.getEventParticipants(event.id).then(setParticipants).catch(() => {})
  }, [event.id, user])

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

          {/* Title */}
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.35rem', fontWeight: 500, color: '#0A0A0A', marginBottom: '12px', lineHeight: 1.3 }}>
            {event.title}
          </h2>

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
        </div>
      </div>
    </div>
  )
}
