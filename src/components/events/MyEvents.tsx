import { useState, useEffect } from 'react'
import { CalendarDays, Eye, Heart, Link2, Copy, Check, HelpCircle, X } from 'lucide-react'
import * as api from '../../api/client'

const TYPE_COLORS: Record<string, string> = {
  workshop: '#E8751A', kurs: '#2D7DD2', bau: '#45B764',
  wettbewerb: '#D4A020', treffen: '#9B59B6', offen: '#7A8B99',
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
  const [calUrl, setCalUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    api.getMyEvents().then(setEvents).catch(() => {}).finally(() => setLoading(false))
    api.getCalToken().then(data => setCalUrl(data.url)).catch(() => {})
  }, [])

  const font = { fontFamily: 'Inter, sans-serif' as const }

  const joinedEvents = events.filter(e => e.status === 'joined')
  const watchingEvents = events.filter(e => e.status === 'watching')

  const handleCopy = () => {
    navigator.clipboard.writeText(calUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) return <p style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.4)', textAlign: 'center', padding: '20px' }}>Laden...</p>

  return (
    <div>
      {/* Teilnahme */}
      {joinedEvents.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={13} style={{ color: '#E8751A' }} />
            <span style={{ ...font, fontSize: '0.68rem', fontWeight: 600, color: 'rgba(10,10,10,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Teilnahme</span>
          </div>
          {joinedEvents.map(e => (
            <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg mb-1.5" style={{ background: '#FAFAF8' }}>
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: TYPE_COLORS[e.type] || '#E8751A' }} />
              <div className="flex-1 min-w-0">
                <span style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#1A1A1A' }} className="truncate block">{e.title}</span>
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
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: TYPE_COLORS[e.type] || '#E8751A' }} />
              <div className="flex-1 min-w-0">
                <span style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#1A1A1A' }} className="truncate block">{e.title}</span>
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
          <p style={{ ...font, fontSize: '0.7rem', color: 'rgba(10,10,10,0.25)', marginTop: '4px' }}>
            Nimm an Veranstaltungen teil oder beobachte sie.
          </p>
        </div>
      )}

      {/* Kalender abonnieren */}
      {calUrl && (
        <div className="mt-4 rounded-xl p-4" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Link2 size={13} style={{ color: '#E8751A' }} />
              <span style={{ ...font, fontSize: '0.72rem', fontWeight: 600, color: '#1A1A1A' }}>Kalender abonnieren</span>
            </div>
            <button onClick={() => setShowHelp(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}>
              <HelpCircle size={15} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              readOnly
              value={calUrl}
              className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
              style={{ border: '1px solid rgba(10,10,10,0.08)', fontFamily: 'monospace', fontSize: '0.65rem', color: 'rgba(10,10,10,0.5)', background: '#fff' }}
              onClick={e => (e.target as HTMLInputElement).select()}
            />
            <button onClick={handleCopy} className="shrink-0 rounded-lg px-3 py-2" style={{ background: copied ? 'rgba(123,174,94,0.1)' : '#fff', border: '1px solid rgba(10,10,10,0.08)', cursor: 'pointer' }}>
              {copied ? <Check size={14} style={{ color: '#E8751A' }} /> : <Copy size={14} style={{ color: 'rgba(10,10,10,0.4)' }} />}
            </button>
          </div>

          <p style={{ ...font, fontSize: '0.62rem', color: 'rgba(10,10,10,0.3)', marginTop: '6px' }}>
            Kopiere die URL und fuege sie in deinen Kalender ein.
          </p>
        </div>
      )}

      {/* Hilfe-Popup */}
      {showHelp && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.25)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-xl" style={{ background: '#fff' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.2rem', fontWeight: 500, color: '#1A1A1A' }}>
                Kalender abonnieren
              </h3>
              <button onClick={() => setShowHelp(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4" style={{ ...font, fontSize: '0.82rem', lineHeight: 1.6, color: 'rgba(10,10,10,0.6)' }}>
              <div>
                <p style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>Google Kalender</p>
                <p>Oeffne Google Kalender → "Weitere Kalender" (+) → "Per URL" → URL einfuegen.</p>
              </div>
              <div>
                <p style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>Android (CalenDAV Plus o.ae.)</p>
                <p>Einstellungen → Kalender hinzufuegen → "URL/ICS abonnieren" → URL einfuegen.</p>
              </div>
              <div>
                <p style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>Apple Kalender</p>
                <p>Einstellungen → Kalender → Accounts → "Kalenderabo hinzufuegen" → URL einfuegen.</p>
              </div>
              <div>
                <p style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>Outlook</p>
                <p>Kalender → "Kalender hinzufuegen" → "Aus dem Internet abonnieren" → URL einfuegen.</p>
              </div>
            </div>

            <p style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.35)', marginTop: '16px' }}>
              Der Kalender aktualisiert sich automatisch, wenn du neue Termine hinzufuegst.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
