import { useState, useRef } from 'react'
import { X, MapPin, Target, Plus, Trash2 } from 'lucide-react'
import { MarkdownToolbar } from '../auth/MarkdownToolbar'
import { TagInput } from '../events/TagInput'
import * as api from '../../api/client'

interface CreateProjectDialogProps {
  position?: [number, number]
  lichtungId?: string
  lichtungName?: string
  onClose: () => void
  onCreated?: (projectId: string) => void
}

interface MilestoneDraft {
  title: string
  goal_amount: string
  description: string
}

export function CreateProjectDialog({ position, lichtungId, lichtungName, onClose, onCreated }: CreateProjectDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [goalAmount, setGoalAmount] = useState('')
  const [opencollectiveUrl, setOpencollectiveUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([])
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const addMilestone = () => {
    setMilestones([...milestones, { title: '', goal_amount: '', description: '' }])
  }

  const updateMilestone = (idx: number, field: keyof MilestoneDraft, value: string) => {
    setMilestones(milestones.map((m, i) => i === idx ? { ...m, [field]: value } : m))
  }

  const removeMilestone = (idx: number) => {
    setMilestones(milestones.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !position) return
    setLoading(true)
    try {
      const project = await api.createProject({
        title,
        description,
        lat: position[0],
        lng: position[1],
        lichtung_id: lichtungId || undefined,
        tags: tags.join(','),
        goal_amount: goalAmount ? Number(goalAmount) : 0,
        opencollective_url: opencollectiveUrl || undefined,
        video_url: videoUrl || undefined,
      })

      // Meilensteine nacheinander anlegen
      for (let i = 0; i < milestones.length; i++) {
        const m = milestones[i]
        if (!m.title.trim()) continue
        try {
          await api.createMilestone(project.id, {
            title: m.title,
            description: m.description,
            goal_amount: m.goal_amount ? Number(m.goal_amount) : 0,
            sort_order: i,
          })
        } catch {}
      }

      if (onCreated) onCreated(project.id)
      onClose()
    } catch (err: any) {
      alert(err.message || 'Fehler beim Erstellen.')
    } finally {
      setLoading(false)
    }
  }

  const font = { fontFamily: 'Inter, sans-serif' as const }
  const inputStyle = { border: '1px solid rgba(10,10,10,0.1)', ...font, fontSize: '0.82rem', color: '#1A1A1A', background: '#fff' }
  const labelStyle = { ...font, fontSize: '0.62rem', fontWeight: 500 as const, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(10,10,10,0.35)', display: 'block', marginBottom: '4px' }

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)', maxHeight: '90vh' }}>

        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(10,10,10,0.04)' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.15rem', fontWeight: 500, color: '#1A1A1A' }}>
            Projekt erstellen
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 space-y-3" style={{ maxHeight: 'calc(90vh - 60px)' }}>

          {lichtungName && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(123,174,94,0.06)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#E8751A' }} />
              <span style={{ ...font, fontSize: '0.72rem', fontWeight: 500, color: '#E8751A' }}>Verknuepft mit {lichtungName}</span>
            </div>
          )}

          {position && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(192,112,144,0.06)' }}>
              <MapPin size={12} style={{ color: '#C07090' }} />
              <span style={{ ...font, fontSize: '0.7rem', color: 'rgba(10,10,10,0.5)' }}>
                {position[0].toFixed(4)}, {position[1].toFixed(4)}
              </span>
            </div>
          )}

          <div>
            <label style={labelStyle}>Titel</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="z.B. Werkstatt in Kassel ausbauen" required
              className="w-full px-3 py-2 rounded-lg outline-none" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Beschreibung</label>
            <MarkdownToolbar textareaRef={textareaRef} value={description} onChange={setDescription} />
            <textarea ref={textareaRef} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Was soll mit dem Projekt geschehen? Wofuer die Mittel?"
              rows={4}
              className="w-full px-3 py-2 rounded-lg outline-none resize-none"
              style={{ ...inputStyle, fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9rem', lineHeight: 1.6 }} />
          </div>

          <div>
            <label style={labelStyle}>Video-Link (YouTube / Vimeo)</label>
            <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full px-3 py-2 rounded-lg outline-none" style={inputStyle} />
            <p style={{ ...font, fontSize: '0.62rem', color: 'rgba(10,10,10,0.35)', marginTop: 4 }}>
              Wird im Projekt-Header direkt eingebettet.
            </p>
          </div>

          <div>
            <label style={labelStyle}>Zielbetrag (Euro, optional)</label>
            <div className="relative">
              <Target size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(10,10,10,0.3)' }} />
              <input type="number" min="0" value={goalAmount} onChange={e => setGoalAmount(e.target.value)}
                placeholder="z.B. 5000"
                className="w-full pl-8 pr-3 py-2 rounded-lg outline-none" style={inputStyle} />
            </div>
          </div>

          {/* ─── Meilensteine ─── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label style={{ ...labelStyle, marginBottom: 0 }}>Meilensteine (optional)</label>
              <button type="button" onClick={addMilestone}
                className="flex items-center gap-1 px-2 py-1 rounded"
                style={{ ...font, fontSize: '0.65rem', fontWeight: 500, color: '#C07090', background: 'rgba(192,112,144,0.06)', border: '1px solid rgba(192,112,144,0.2)', cursor: 'pointer' }}>
                <Plus size={10} /> Hinzufuegen
              </button>
            </div>
            <p style={{ ...font, fontSize: '0.66rem', color: 'rgba(10,10,10,0.4)', marginBottom: 8, lineHeight: 1.45 }}>
              Aufeinanderfolgende Ziele — z.B. bis 3000 Euro passiert das, bis 6000 das weitere.
            </p>

            {milestones.length > 0 && (
              <div className="space-y-2">
                {milestones.map((m, idx) => (
                  <div key={idx} className="rounded-lg p-3 space-y-2" style={{ background: 'rgba(192,112,144,0.04)', border: '1px solid rgba(192,112,144,0.15)' }}>
                    <div className="flex items-center gap-2">
                      <span style={{ ...font, fontSize: '0.62rem', fontWeight: 600, color: '#C07090', letterSpacing: '0.1em' }}>
                        STUFE {idx + 1}
                      </span>
                      <div className="flex-1" />
                      <button type="button" onClick={() => removeMilestone(idx)}
                        className="w-5 h-5 rounded flex items-center justify-center"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={10} style={{ color: 'rgba(10,10,10,0.3)' }} />
                      </button>
                    </div>
                    <input type="text" value={m.title} onChange={e => updateMilestone(idx, 'title', e.target.value)}
                      placeholder="Titel des Meilensteins"
                      className="w-full px-2.5 py-1.5 rounded outline-none"
                      style={{ ...font, fontSize: '0.78rem', border: '1px solid rgba(10,10,10,0.08)', background: '#fff' }} />
                    <input type="number" min="0" value={m.goal_amount} onChange={e => updateMilestone(idx, 'goal_amount', e.target.value)}
                      placeholder="Zielbetrag (Euro)"
                      className="w-full px-2.5 py-1.5 rounded outline-none"
                      style={{ ...font, fontSize: '0.78rem', border: '1px solid rgba(10,10,10,0.08)', background: '#fff' }} />
                    <textarea value={m.description} onChange={e => updateMilestone(idx, 'description', e.target.value)}
                      placeholder="Was wird damit erreicht?" rows={2}
                      className="w-full px-2.5 py-1.5 rounded outline-none resize-none"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.82rem', lineHeight: 1.5, border: '1px solid rgba(10,10,10,0.08)', background: '#fff' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Wen / was braucht es? (Hashtags)</label>
            <TagInput value={tags} onChange={setTags} />
            <p style={{ ...font, fontSize: '0.62rem', color: 'rgba(10,10,10,0.35)', marginTop: 4 }}>
              z.B. schreiner, bagger, motorsaege, spende, kunst
            </p>
          </div>

          <div>
            <label style={labelStyle}>Open Collective URL (optional)</label>
            <input type="url" value={opencollectiveUrl} onChange={e => setOpencollectiveUrl(e.target.value)}
              placeholder="https://opencollective.com/..."
              className="w-full px-3 py-2 rounded-lg outline-none" style={inputStyle} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mt-2"
            style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#fff', background: loading ? 'rgba(10,10,10,0.5)' : '#1A1A1A', border: 'none', cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Wird erstellt...' : 'Projekt erstellen'}
          </button>

          <p style={{ ...font, fontSize: '0.62rem', color: 'rgba(10,10,10,0.35)', textAlign: 'center', paddingBottom: 4 }}>
            Ein Bild kannst du nach dem Erstellen hochladen.
          </p>

        </form>
      </div>
    </div>
  )
}
