import { useState, useEffect } from 'react'
import { CalendarDays, Eye, Heart, Download } from 'lucide-react'
import * as api from '../../api/client'

const TYPE_COLORS: Record<string, string> = {
  meditation: '#D4A843', gebet: '#A07CC0', stille: '#6BA3BE',
  begegnung: '#7BAE5E', tanz: '#D4766E', fest: '#E0A050',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

export function MyEvents() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMyEvents().then(setEvents).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const font = { fontFamily: 'Inter, sans-serif' as const }

  const joinedEvents = events.filter(e => e.status === 'joined')
  const watchingEvents = events.filter(e => e.status === 'watching')

  const handleExportIcal = () => {
    const token = api.getToken()
    if (token) {
      window.open(`/api/my/events.ics?token=${token}`, '_blank')
    }
  }

  if (loading) return <p style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.4)', textAlign: 'center', padding: '20px' }}>Laden...</p>

  return (
    <div>
      {/* Teilnahme */}
      {joinedEvents.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={13} style={{ color: '#D4A843' }} />
            <span style={{ ...font, fontSize: '0.68rem', fontWeight: 600, color: 'rgba(10,10,10,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Teilnahme</span>
          </div>
          {joinedEvents.map(e => (
            <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg mb-1.5" style={{ background: '#FAFAF8' }}>
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: TYPE_COLORS[e.type] || '#D4A843' }} />
              <div className="flex-1 min-w-0">
                <span style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#0A0A0A' }} className="truncate block">{e.title}</span>
                <span style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.4)' }}>
                  {formatDate(e.start_time)} · {formatTime(e.start_time)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Beobachte */}
      {watchingEvents.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={13} style={{ color: 'rgba(10,10,10,0.4)' }} />
            <span style={{ ...font, fontSize: '0.68rem', fontWeight: 600, color: 'rgba(10,10,10,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Beobachte</span>
          </div>
          {watchingEvents.map(e => (
            <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg mb-1.5" style={{ background: '#FAFAF8' }}>
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: TYPE_COLORS[e.type] || '#D4A843' }} />
              <div className="flex-1 min-w-0">
                <span style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#0A0A0A' }} className="truncate block">{e.title}</span>
                <span style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.4)' }}>
                  {formatDate(e.start_time)} · {formatTime(e.start_time)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {joinedEvents.length === 0 && watchingEvents.length === 0 && (
        <div className="text-center py-8">
          <CalendarDays size={24} style={{ color: 'rgba(10,10,10,0.08)', margin: '0 auto 8px' }} />
          <p style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.35)' }}>Noch keine Termine.</p>
        </div>
      )}

      {/* iCal Export */}
      {events.length > 0 && (
        <button
          onClick={handleExportIcal}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mt-2"
          style={{ ...font, fontSize: '0.78rem', fontWeight: 500, color: '#0A0A0A', background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)', cursor: 'pointer' }}
        >
          <Download size={15} style={{ color: '#D4A843' }} />
          Kalender exportieren (.ics)
        </button>
      )}
    </div>
  )
}
