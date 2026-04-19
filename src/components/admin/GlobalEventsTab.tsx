import { useEffect, useState } from 'react'
import { Globe, Clock, Trash2, Plus, Waves, Zap } from 'lucide-react'
import * as api from '../../api/client'

export function GlobalEventsTab() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [waveMode, setWaveMode] = useState<'simultaneous' | 'timezone_wave'>('timezone_wave')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('21:00')
  const [recurring, setRecurring] = useState('')
  const [tags, setTags] = useState('meditation')

  const load = async () => {
    try {
      const data = await fetch('/api/events/global').then(r => r.json())
      setEvents(data)
    } catch {}
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !date || !time) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/global-events', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${api.getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description,
          start_time: `${date}T${time}:00`,
          wave_mode: waveMode,
          recurring: recurring || null,
          tags,
        }),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error) }
      setTitle(''); setDescription(''); setDate(''); setShowCreate(false)
      const listRes = await fetch('/api/events/global')
      setEvents(await listRes.json())
    } catch (err: any) {
      alert(err?.message || 'Fehler.')
    } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Globale Veranstaltung wirklich loeschen?')) return
    try {
      await fetch(`/api/admin/global-events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${api.getToken()}` },
      })
      const listRes = await fetch('/api/events/global')
      setEvents(await listRes.json())
    } catch {}
  }

  const font = { fontFamily: 'Inter, sans-serif' }
  const card = { background: '#fff', border: '1px solid rgba(10,10,10,0.06)', borderRadius: '12px', padding: '20px' }
  const inp = { border: '1px solid rgba(10,10,10,0.1)', ...font, fontSize: '0.85rem', color: '#0A0A0A', background: '#fff' }
  const labelStyle = { ...font, fontSize: '0.68rem', fontWeight: 500 as const, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(10,10,10,0.4)', display: 'block', marginBottom: '6px' }

  const fmtDate = (s: string) => new Date(s).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div className="space-y-4">
      {/* Erklaerung */}
      <div style={{ ...card, background: 'rgba(212,168,67,0.04)', borderColor: 'rgba(212,168,67,0.2)' }}>
        <h3 style={{ ...font, fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>Globale Veranstaltungen</h3>
        <p style={{ ...font, fontSize: '0.78rem', color: 'rgba(10,10,10,0.6)', lineHeight: 1.65 }}>
          Weltweit sichtbare Meditationen und Gebete. Nutzer bekommen sie im Kalender,
          Lichtungen koennen sich andocken und vor Ort mitfeiern.
        </p>
        <div className="mt-3 space-y-1.5 text-xs" style={font}>
          <div className="flex items-start gap-2">
            <Zap size={14} style={{ color: '#D4A843', flexShrink: 0, marginTop: '2px' }} />
            <span style={{ color: 'rgba(10,10,10,0.6)' }}>
              <strong style={{ color: '#0A0A0A' }}>Gleichzeitig</strong> — alle zur gleichen Sekunde.
              Die Startzeit ist weltweit identisch (z.B. 21:00 Berlin = 15:00 New York = 05:00 Tokio naechster Tag).
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Waves size={14} style={{ color: '#5078C8', flexShrink: 0, marginTop: '2px' }} />
            <span style={{ color: 'rgba(10,10,10,0.6)' }}>
              <strong style={{ color: '#0A0A0A' }}>Welle (Ortszeit)</strong> — 21:00 ueberall lokal.
              Die Welle wandert mit den Zeitzonen um die Erde.
            </span>
          </div>
        </div>
      </div>

      {/* Create */}
      {!showCreate ? (
        <button onClick={() => setShowCreate(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
          style={{ ...font, fontSize: '0.82rem', color: '#fff', background: '#0A0A0A', border: 'none', cursor: 'pointer' }}>
          <Plus size={16} /> Neue globale Veranstaltung
        </button>
      ) : (
        <form onSubmit={handleCreate} style={card} className="space-y-3">
          <div>
            <label style={labelStyle}>Titel</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="z.B. Vollmond-Meditation" required
              className="w-full px-3 py-2 rounded-lg outline-none" style={inp} />
          </div>

          <div>
            <label style={labelStyle}>Modus</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setWaveMode('timezone_wave')}
                className="flex items-center gap-2 p-3 rounded-lg text-left"
                style={{
                  ...font, fontSize: '0.8rem', cursor: 'pointer',
                  background: waveMode === 'timezone_wave' ? 'rgba(80,120,200,0.06)' : '#FAFAF8',
                  border: waveMode === 'timezone_wave' ? '1px solid rgba(80,120,200,0.35)' : '1px solid rgba(10,10,10,0.06)',
                  color: waveMode === 'timezone_wave' ? '#5078C8' : 'rgba(10,10,10,0.6)',
                }}>
                <Waves size={16} />
                <div>
                  <div style={{ fontWeight: 600 }}>Welle</div>
                  <div style={{ fontSize: '0.65rem', marginTop: '2px', opacity: 0.7 }}>Ortszeit</div>
                </div>
              </button>
              <button type="button" onClick={() => setWaveMode('simultaneous')}
                className="flex items-center gap-2 p-3 rounded-lg text-left"
                style={{
                  ...font, fontSize: '0.8rem', cursor: 'pointer',
                  background: waveMode === 'simultaneous' ? 'rgba(212,168,67,0.06)' : '#FAFAF8',
                  border: waveMode === 'simultaneous' ? '1px solid rgba(212,168,67,0.35)' : '1px solid rgba(10,10,10,0.06)',
                  color: waveMode === 'simultaneous' ? '#D4A843' : 'rgba(10,10,10,0.6)',
                }}>
                <Zap size={16} />
                <div>
                  <div style={{ fontWeight: 600 }}>Gleichzeitig</div>
                  <div style={{ fontSize: '0.65rem', marginTop: '2px', opacity: 0.7 }}>Berlin-Zeit</div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label style={labelStyle}>Datum</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                className="w-full px-3 py-2 rounded-lg outline-none" style={inp} />
            </div>
            <div>
              <label style={labelStyle}>Uhrzeit {waveMode === 'timezone_wave' && <span style={{ fontSize: '0.56rem', color: '#5078C8' }}>(lokal)</span>}</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} required
                className="w-full px-3 py-2 rounded-lg outline-none" style={inp} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Wiederholung</label>
            <select value={recurring} onChange={e => setRecurring(e.target.value)}
              className="w-full px-3 py-2 rounded-lg outline-none" style={inp}>
              <option value="">Einmalig</option>
              <option value="vollmond">Jeden Vollmond</option>
              <option value="neumond">Jeden Neumond</option>
              <option value="woechentlich">Woechentlich</option>
              <option value="monatlich">Monatlich</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Tags (kommagetrennt)</label>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)}
              placeholder="meditation, gebet, stille"
              className="w-full px-3 py-2 rounded-lg outline-none" style={inp} />
          </div>

          <div>
            <label style={labelStyle}>Beschreibung</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="Einleitung, Intention, Anweisungen..."
              className="w-full px-3 py-2 rounded-lg outline-none resize-none"
              style={{ ...inp, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.92rem', lineHeight: 1.6 }} />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg"
              style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#fff', background: loading ? 'rgba(10,10,10,0.5)' : '#0A0A0A', border: 'none', cursor: loading ? 'wait' : 'pointer' }}>
              {loading ? 'Wird erstellt...' : 'Erstellen'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2.5 rounded-lg"
              style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.5)', background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)', cursor: 'pointer' }}>
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {/* Liste */}
      {events.length === 0 ? (
        <div style={card} className="text-center">
          <Globe size={24} style={{ color: 'rgba(10,10,10,0.2)', margin: '0 auto 8px' }} />
          <p style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.4)' }}>Noch keine globalen Veranstaltungen.</p>
        </div>
      ) : (
        <div style={card}>
          <h3 style={{ ...font, fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>Bestehende globale Events ({events.length})</h3>
          <div className="space-y-2">
            {events.map((e: any) => (
              <div key={e.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: e.wave_mode === 'timezone_wave' ? 'rgba(80,120,200,0.08)' : 'rgba(212,168,67,0.08)' }}>
                  {e.wave_mode === 'timezone_wave' ? <Waves size={16} style={{ color: '#5078C8' }} /> : <Zap size={16} style={{ color: '#D4A843' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ ...font, fontSize: '0.85rem', fontWeight: 600, color: '#0A0A0A' }}>{e.title}</div>
                  <div className="flex items-center gap-1.5 mt-0.5" style={{ ...font, fontSize: '0.7rem', color: 'rgba(10,10,10,0.5)' }}>
                    <Clock size={10} /> {fmtDate(e.start_time)}
                    {e.recurring && <span> &middot; {e.recurring}</span>}
                    <span style={{ color: e.wave_mode === 'timezone_wave' ? '#5078C8' : '#D4A843', fontWeight: 500 }}>
                      &middot; {e.wave_mode === 'timezone_wave' ? 'Welle' : 'Gleichzeitig'}
                    </span>
                  </div>
                  {e.description && <p style={{ ...font, fontSize: '0.72rem', color: 'rgba(10,10,10,0.5)', marginTop: '4px', lineHeight: 1.5 }}>{e.description}</p>}
                </div>
                <button onClick={() => handleDelete(e.id)} title="Loeschen"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(200,50,50,0.6)', padding: '4px' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
