import { useEffect, useMemo, useRef, useState } from 'react'
import { Globe, Clock, Trash2, Plus, Waves, Zap } from 'lucide-react'
import * as api from '../../api/client'
import { TagInput } from '../events/TagInput'
import { MarkdownToolbar } from '../auth/MarkdownToolbar'

type MoonPhase = { type: 'vollmond' | 'neumond'; time: string }

export function GlobalEventsTab() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [phases, setPhases] = useState<MoonPhase[]>([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [waveMode, setWaveMode] = useState<'simultaneous' | 'timezone_wave'>('timezone_wave')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('21:00')
  const [recurring, setRecurring] = useState<'' | 'vollmond' | 'neumond' | 'woechentlich' | 'monatlich'>('vollmond')
  const [tags, setTags] = useState<string[]>(['meditation'])
  const descRef = useRef<HTMLTextAreaElement>(null)

  const load = async () => {
    try {
      const data = await fetch('/api/events/global').then(r => r.json())
      setEvents(data)
    } catch {}
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    api.getMoonPhases(6).then(p => setPhases(p as MoonPhase[])).catch(() => {})
  }, [])

  // Die naechsten 6 Mondphasen ab heute
  const upcoming = useMemo(() => {
    const now = Date.now()
    return phases.filter(p => new Date(p.time).getTime() >= now).slice(0, 6)
  }, [phases])

  const nextOf = (type: 'vollmond' | 'neumond') =>
    upcoming.find(p => p.type === type)

  // Auto-Fill: wenn recurring auf vollmond/neumond wechselt und kein Datum gesetzt
  useEffect(() => {
    if (!date && (recurring === 'vollmond' || recurring === 'neumond')) {
      const next = nextOf(recurring)
      if (next) applyPhase(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurring, upcoming])

  const applyPhase = (p: MoonPhase) => {
    const d = new Date(p.time)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    setDate(`${yyyy}-${mm}-${dd}`)
  }

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
          tags: tags.join(','),
        }),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error) }
      setTitle(''); setDescription(''); setDate(''); setTags(['meditation']); setShowCreate(false)
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
  const card = { background: '#fff', border: '1px solid rgba(10,10,10,0.06)', borderRadius: '12px', padding: '14px' }
  const inp = { border: '1px solid rgba(10,10,10,0.1)', ...font, fontSize: '0.82rem', color: '#0A0A0A', background: '#fff' }
  const labelStyle = { ...font, fontSize: '0.64rem', fontWeight: 500 as const, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(10,10,10,0.4)', display: 'block', marginBottom: '4px' }

  const fmtDate = (s: string) => new Date(s).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })
  const fmtShort = (s: string) => new Date(s).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })

  return (
    <div className="space-y-3">
      {/* Create */}
      {!showCreate ? (
        <button onClick={() => setShowCreate(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl"
          style={{ ...font, fontSize: '0.82rem', color: '#fff', background: '#0A0A0A', border: 'none', cursor: 'pointer' }}>
          <Plus size={16} /> Neue globale Veranstaltung
        </button>
      ) : (
        <form onSubmit={handleCreate} style={card} className="space-y-2.5">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Titel — z.B. Vollmond-Meditation" required autoFocus
            className="w-full px-3 py-2 rounded-lg outline-none"
            style={{ ...inp, fontSize: '0.95rem', fontWeight: 500 }} />

          {/* Modus als Segmented Control */}
          <div className="flex items-center gap-2">
            <label style={{ ...labelStyle, marginBottom: 0, flexShrink: 0 }}>Modus</label>
            <div className="flex rounded-lg p-0.5" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)' }}>
              <button type="button" onClick={() => setWaveMode('timezone_wave')}
                className="flex items-center gap-1 px-2.5 py-1 rounded"
                style={{
                  ...font, fontSize: '0.74rem', cursor: 'pointer', border: 'none',
                  background: waveMode === 'timezone_wave' ? '#fff' : 'transparent',
                  color: waveMode === 'timezone_wave' ? '#5078C8' : 'rgba(10,10,10,0.5)',
                  fontWeight: waveMode === 'timezone_wave' ? 600 : 400,
                  boxShadow: waveMode === 'timezone_wave' ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
                }}>
                <Waves size={12} /> Welle
              </button>
              <button type="button" onClick={() => setWaveMode('simultaneous')}
                className="flex items-center gap-1 px-2.5 py-1 rounded"
                style={{
                  ...font, fontSize: '0.74rem', cursor: 'pointer', border: 'none',
                  background: waveMode === 'simultaneous' ? '#fff' : 'transparent',
                  color: waveMode === 'simultaneous' ? '#D4A843' : 'rgba(10,10,10,0.5)',
                  fontWeight: waveMode === 'simultaneous' ? 600 : 400,
                  boxShadow: waveMode === 'simultaneous' ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
                }}>
                <Zap size={12} /> Gleichzeitig
              </button>
            </div>
            <span style={{ ...font, fontSize: '0.66rem', color: 'rgba(10,10,10,0.4)', marginLeft: 'auto' }}>
              {waveMode === 'timezone_wave' ? 'Ortszeit rollt um die Erde' : 'Berlin-Zeit fuer alle'}
            </span>
          </div>

          {/* Datum + Uhrzeit + Wiederholung */}
          <div className="grid grid-cols-3 gap-1.5">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required
              className="px-2 py-2 rounded-lg outline-none" style={inp} />
            <input type="time" value={time} onChange={e => setTime(e.target.value)} required
              className="px-2 py-2 rounded-lg outline-none" style={inp} />
            <select value={recurring} onChange={e => setRecurring(e.target.value as any)}
              className="px-2 py-2 rounded-lg outline-none" style={inp}>
              <option value="">Einmalig</option>
              <option value="vollmond">Jeden Vollmond</option>
              <option value="neumond">Jeden Neumond</option>
              <option value="woechentlich">Woechentlich</option>
              <option value="monatlich">Monatlich</option>
            </select>
          </div>

          {/* Mondphasen-Chips */}
          {upcoming.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span style={{ ...font, fontSize: '0.64rem', color: 'rgba(10,10,10,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Mondphasen
              </span>
              {upcoming.map((p, i) => {
                const iso = new Date(p.time).toISOString().slice(0, 10)
                const active = date === iso
                const full = p.type === 'vollmond'
                return (
                  <button key={i} type="button" onClick={() => applyPhase(p)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{
                      ...font, fontSize: '0.68rem', cursor: 'pointer',
                      background: active ? (full ? 'rgba(212,168,67,0.15)' : 'rgba(80,80,120,0.12)') : '#FAFAF8',
                      border: active ? `1px solid ${full ? 'rgba(212,168,67,0.4)' : 'rgba(80,80,120,0.35)'}` : '1px solid rgba(10,10,10,0.06)',
                      color: active ? (full ? '#B48830' : '#4a4a70') : 'rgba(10,10,10,0.55)',
                    }}
                    title={new Date(p.time).toLocaleString('de-DE', { dateStyle: 'full', timeStyle: 'short' })}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: full ? '#E8C873' : '#1F1F2E',
                      border: full ? '1px solid rgba(212,168,67,0.5)' : '1px solid rgba(255,255,255,0.6)',
                      display: 'inline-block',
                    }} />
                    {fmtShort(p.time)}
                  </button>
                )
              })}
            </div>
          )}

          <div>
            <label style={labelStyle}>Tags</label>
            <TagInput value={tags} onChange={setTags} />
          </div>

          <div>
            <label style={labelStyle}>Beschreibung</label>
            <MarkdownToolbar textareaRef={descRef} value={description} onChange={setDescription} />
            <textarea ref={descRef} value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="Intention, Ablauf..."
              className="w-full px-3 py-2 rounded-lg outline-none resize-none"
              style={{ ...inp, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.92rem', lineHeight: 1.55 }} />
          </div>

          <div className="flex gap-2 pt-0.5">
            <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg"
              style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#fff', background: loading ? 'rgba(10,10,10,0.5)' : '#0A0A0A', border: 'none', cursor: loading ? 'wait' : 'pointer' }}>
              {loading ? 'Wird erstellt...' : 'Erstellen'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg"
              style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.5)', background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)', cursor: 'pointer' }}>
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {/* Liste */}
      {events.length === 0 ? (
        <div style={card} className="text-center">
          <Globe size={22} style={{ color: 'rgba(10,10,10,0.2)', margin: '0 auto 6px' }} />
          <p style={{ ...font, fontSize: '0.8rem', color: 'rgba(10,10,10,0.4)' }}>Noch keine globalen Veranstaltungen.</p>
        </div>
      ) : (
        <div style={card}>
          <div className="flex items-center justify-between mb-2">
            <h3 style={{ ...font, fontSize: '0.82rem', fontWeight: 600 }}>Bestehende ({events.length})</h3>
            <div className="flex items-center gap-3" style={{ ...font, fontSize: '0.64rem', color: 'rgba(10,10,10,0.45)' }}>
              <span className="flex items-center gap-1"><Waves size={10} style={{ color: '#5078C8' }} /> Welle</span>
              <span className="flex items-center gap-1"><Zap size={10} style={{ color: '#D4A843' }} /> Gleichzeitig</span>
            </div>
          </div>
          <div className="space-y-1.5">
            {events.map((e: any) => (
              <div key={e.id} className="flex items-start gap-2.5 p-2.5 rounded-lg" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: e.wave_mode === 'timezone_wave' ? 'rgba(80,120,200,0.08)' : 'rgba(212,168,67,0.08)' }}>
                  {e.wave_mode === 'timezone_wave' ? <Waves size={14} style={{ color: '#5078C8' }} /> : <Zap size={14} style={{ color: '#D4A843' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ ...font, fontSize: '0.84rem', fontWeight: 600, color: '#0A0A0A' }}>{e.title}</div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap" style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.5)' }}>
                    <Clock size={10} /> {fmtDate(e.start_time)}
                    {e.recurring && <span>&middot; {e.recurring}</span>}
                  </div>
                  {e.description && <p style={{ ...font, fontSize: '0.7rem', color: 'rgba(10,10,10,0.5)', marginTop: '3px', lineHeight: 1.5 }}>{e.description}</p>}
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
