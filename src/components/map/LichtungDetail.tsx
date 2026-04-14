import { useState, useEffect } from 'react'
import { X, CalendarDays, Clock, Users, Navigation, Repeat } from 'lucide-react'
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
}

export function LichtungDetail({ lichtungId, onClose }: LichtungDetailProps) {
  const [lichtung, setLichtung] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'info' | 'kalender'>('info')

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
      <div className="flex px-5 pt-3 gap-1" style={{ borderBottom: '1px solid rgba(10,10,10,0.04)' }}>
        {(['info', 'kalender'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className="pb-2 px-3"
            style={{ ...font, fontSize: '0.72rem', fontWeight: 500, color: tab === t ? '#7BAE5E' : 'rgba(10,10,10,0.35)', borderBottom: tab === t ? '2px solid #7BAE5E' : '2px solid transparent', background: 'none', border: 'none', borderBottomWidth: '2px', borderBottomStyle: 'solid', borderBottomColor: tab === t ? '#7BAE5E' : 'transparent', cursor: 'pointer' }}>
            {t === 'info' ? 'Info' : 'Kalender'}
          </button>
        ))}
      </div>

      <div className="overflow-y-auto p-5" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {tab === 'info' ? (
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
        ) : (
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
          </>
        )}
      </div>
    </div>
  )
}
