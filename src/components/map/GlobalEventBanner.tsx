import { useEffect, useState } from 'react'
import { Globe, X, Clock, Waves, Zap } from 'lucide-react'
import * as api from '../../api/client'

function formatTimeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff < 0) return 'laeuft'
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `in ${minutes} Min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `in ${hours} Std`
  const days = Math.floor(hours / 24)
  return `in ${days} Tag${days > 1 ? 'en' : ''}`
}

function localTimeOfWaveEvent(startUtc: string): string {
  // Timezone-Wave: die Ortszeit wird 1:1 uebernommen (wir lesen die Stunden/Minuten aus der UTC und zeigen sie als lokale Zeit)
  const d = new Date(startUtc)
  const h = String(d.getUTCHours()).padStart(2, '0')
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  return `${h}:${m} Uhr Ortszeit`
}

interface GlobalEventBannerProps {
  onShowEvent?: (event: any) => void
}

export function GlobalEventBanner({ onShowEvent }: GlobalEventBannerProps) {
  const [events, setEvents] = useState<any[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    const raw = localStorage.getItem('macher-dismissed-globals')
    return raw ? new Set(raw.split(',')) : new Set()
  })

  useEffect(() => {
    api.getUpcomingGlobalEvents().then(setEvents).catch(() => {})
    const timer = setInterval(() => {
      api.getUpcomingGlobalEvents().then(setEvents).catch(() => {})
    }, 60_000)
    return () => clearInterval(timer)
  }, [])

  const visible = events.filter(e => !dismissed.has(e.id))
  if (visible.length === 0) return null

  // Zeige das naechste Event
  const event = visible[0]
  const isWave = event.wave_mode === 'timezone_wave'

  const handleDismiss = () => {
    const next = new Set(dismissed)
    next.add(event.id)
    setDismissed(next)
    localStorage.setItem('macher-dismissed-globals', Array.from(next).join(','))
  }

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[900] w-[calc(100%-2rem)] max-w-md rounded-2xl shadow-xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(253,252,249,0.96), rgba(253,252,249,0.92))',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(212,168,67,0.3)',
        animation: 'fade-in-up 0.3s ease-out',
      }}>
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: isWave ? 'rgba(80,120,200,0.1)' : 'rgba(212,168,67,0.1)' }}>
          {isWave ? <Waves size={16} style={{ color: '#D4A020' }} /> : <Zap size={16} style={{ color: '#E8751A' }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500, color: isWave ? '#D4A020' : '#E8751A', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <Globe size={10} /> Globale Veranstaltung
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.05rem', fontWeight: 500, color: '#1A1A1A', marginTop: '2px' }}>
            {event.title}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(10,10,10,0.5)' }}>
            <Clock size={11} />
            <span>
              {isWave
                ? localTimeOfWaveEvent(event.start_time)
                : new Date(event.start_time).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
            <span style={{ color: 'rgba(10,10,10,0.3)' }}>&middot;</span>
            <span>{formatTimeUntil(event.start_time)}</span>
          </div>
          {event.description && (
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.82rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.55)', margin: '6px 0 0', lineHeight: 1.5 }}>
              {event.description.length > 100 ? event.description.slice(0, 100).trim() + '...' : event.description}
            </p>
          )}
          {onShowEvent && (
            <button onClick={() => onShowEvent(event)}
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 500,
                color: isWave ? '#D4A020' : '#E8751A',
                background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0 0', textDecoration: 'underline',
              }}>
              Mehr erfahren
            </button>
          )}
        </div>
        <button onClick={handleDismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)', padding: '2px', marginTop: '-2px' }}>
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
