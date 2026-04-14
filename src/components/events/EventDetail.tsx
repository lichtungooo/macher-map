import { useState, useEffect } from 'react'
import { X, ArrowLeft, CalendarDays, Clock, MapPin, Repeat, Users, Heart } from 'lucide-react'
import { useApp, type EventItem } from '../../context/AppContext'
import * as api from '../../api/client'

const TYPE_LABELS: Record<string, string> = {
  meditation: 'Meditation', gebet: 'Gebet', stille: 'Stille',
  begegnung: 'Begegnung', tanz: 'Tanz', fest: 'Fest',
}

const TYPE_COLORS: Record<string, string> = {
  meditation: '#D4A843', gebet: '#A07CC0', stille: '#6BA3BE',
  begegnung: '#7BAE5E', tanz: '#D4766E', fest: '#E0A050',
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

// Simple markdown: **bold**, *italic*, newlines
function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
}

interface EventDetailProps {
  event: EventItem
  onClose: () => void
  onBack: () => void
}

export function EventDetail({ event, onClose, onBack }: EventDetailProps) {
  const { user } = useApp()
  const [participating, setParticipating] = useState(false)
  const [participantCount, setParticipantCount] = useState((event as any).participantCount || 0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && api.getToken()) {
      api.getEventStatus(event.id).then(data => {
        setParticipating(data.participating)
        setParticipantCount(data.count)
      }).catch(() => {})
    }
  }, [event.id, user])

  const handleToggleParticipation = async () => {
    if (!user || !api.getToken()) return
    setLoading(true)
    try {
      if (participating) {
        const data = await api.leaveEvent(event.id)
        setParticipating(false)
        setParticipantCount(data.count)
      } else {
        const data = await api.joinEvent(event.id)
        setParticipating(true)
        setParticipantCount(data.count)
      }
    } catch {} finally { setLoading(false) }
  }

  const color = TYPE_COLORS[event.type] || '#D4A843'
  const font = { fontFamily: 'Inter, sans-serif' as const }

  return (
    <div
      className="fixed z-[1500] rounded-2xl shadow-xl overflow-hidden"
      style={{
        top: '70px', right: '16px', width: '340px', maxHeight: 'calc(100vh - 90px)',
        background: '#fff', border: '1px solid rgba(10,10,10,0.06)',
        animation: 'fade-in-up 0.2s ease-out',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(10,10,10,0.04)' }}>
        <button onClick={onBack} className="flex items-center gap-1" style={{ ...font, fontSize: '0.78rem', color: 'rgba(10,10,10,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={14} /> Zurueck
        </button>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.25)' }}>
          <X size={18} />
        </button>
      </div>

      <div className="overflow-y-auto p-5" style={{ maxHeight: 'calc(100vh - 160px)' }}>
        {/* Type Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
          <span style={{ ...font, fontSize: '0.62rem', fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {TYPE_LABELS[event.type]}
          </span>
        </div>

        {/* Title */}
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 500, color: '#0A0A0A', marginBottom: '16px', lineHeight: 1.3 }}>
          {event.title}
        </h2>

        {/* Meta */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center gap-2.5">
            <CalendarDays size={14} style={{ color: 'rgba(10,10,10,0.3)', flexShrink: 0 }} />
            <span style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.55)' }}>
              {formatDate(event.start)}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock size={14} style={{ color: 'rgba(10,10,10,0.3)', flexShrink: 0 }} />
            <span style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.55)' }}>
              {formatTime(event.start)} Uhr
            </span>
          </div>
          {event.recurring && (
            <div className="flex items-center gap-2.5">
              <Repeat size={14} style={{ color: 'rgba(10,10,10,0.3)', flexShrink: 0 }} />
              <span style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.55)' }}>
                {RECURRING_LABELS[event.recurring]}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <MapPin size={14} style={{ color: 'rgba(10,10,10,0.3)', flexShrink: 0 }} />
            <span style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.55)' }}>
              {event.position[0].toFixed(4)}, {event.position[1].toFixed(4)}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Users size={14} style={{ color: 'rgba(10,10,10,0.3)', flexShrink: 0 }} />
            <span style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.55)' }}>
              {participantCount} {participantCount === 1 ? 'Teilnehmer' : 'Teilnehmer'}
            </span>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="mb-5 rounded-xl p-4" style={{ background: '#FAFAF8' }}>
            <p
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.95rem', lineHeight: 1.7, color: 'rgba(10,10,10,0.6)' }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(event.description) }}
            />
          </div>
        )}

        {/* Join Button */}
        {user && (
          <button
            onClick={handleToggleParticipation}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all"
            style={{
              background: participating ? 'rgba(212,168,67,0.1)' : '#0A0A0A',
              border: participating ? '1px solid rgba(212,168,67,0.3)' : 'none',
              color: participating ? '#D4A843' : '#fff',
              ...font, fontSize: '0.82rem', fontWeight: 500,
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            <Heart size={16} fill={participating ? '#D4A843' : 'none'} />
            {participating ? 'Du nimmst teil' : 'Teilnehmen'}
          </button>
        )}

        {!user && (
          <p className="text-center" style={{ ...font, fontSize: '0.75rem', color: 'rgba(10,10,10,0.35)', marginTop: '8px' }}>
            Melde dich an, um teilzunehmen.
          </p>
        )}
      </div>
    </div>
  )
}
