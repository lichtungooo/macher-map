import { useState, useEffect, useRef } from 'react'
import { X, ExternalLink, Camera, Pencil, Trash2, Plus, Check, Video, Hash, Trees, Navigation, Info, ListChecks, Users, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useApp } from '../../context/AppContext'
import { renderMarkdown } from '../../lib/markdown'
import { getVideoEmbedUrl } from '../../lib/videoEmbed'
import { ShareButton } from '../ShareButton'
import { MarkdownToolbar } from '../auth/MarkdownToolbar'
import * as api from '../../api/client'

interface ProjectDetailProps {
  projectId: string
  onClose: () => void
  onDeleted?: () => void
}

type Tab = 'info' | 'milestones' | 'team'

const ACCENT = '#C07090'

export function ProjectDetail({ projectId, onClose, onDeleted }: ProjectDetailProps) {
  const { user } = useApp()
  const [project, setProject] = useState<any>(null)
  const [milestones, setMilestones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('info')
  const [editMode, setEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editGoal, setEditGoal] = useState('')
  const [editOC, setEditOC] = useState('')
  const [editVideo, setEditVideo] = useState('')
  const [newMilestoneOpen, setNewMilestoneOpen] = useState(false)
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('')
  const [newMilestoneGoal, setNewMilestoneGoal] = useState('')
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('')
  const [showFullQR, setShowFullQR] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    try {
      const p = await api.getProject(projectId)
      setProject(p)
      setMilestones(p.milestones || [])
      setEditTitle(p.title || '')
      setEditDesc(p.description || '')
      setEditGoal(String(p.goal_amount || ''))
      setEditOC(p.opencollective_url || '')
      setEditVideo(p.video_url || '')
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [projectId])

  const font = { fontFamily: 'Inter, sans-serif' as const }

  // ─── Fullscreen QR-Modus ───
  if (showFullQR && project) {
    const qrUrl = `${window.location.origin}/app?project=${projectId}`
    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
        <div className="relative rounded-2xl p-8 max-w-sm w-full" style={{ background: '#fff' }}>
          <button onClick={() => setShowFullQR(false)} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#FAFAF8', border: 'none', cursor: 'pointer' }}>
            <X size={15} />
          </button>
          <p style={{ ...font, fontSize: '0.6rem', fontWeight: 500, color: ACCENT, letterSpacing: '0.2em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 }}>
            Projekt teilen
          </p>
          <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', fontWeight: 500, color: '#0A0A0A', textAlign: 'center', marginBottom: 20 }}>
            {project.title}
          </h3>
          <div className="flex justify-center mb-4">
            <QRCodeSVG value={qrUrl} size={Math.min(320, window.innerWidth - 120)} bgColor="#fff" fgColor="#0A0A0A" level="H" />
          </div>
          <p style={{ ...font, fontSize: '0.7rem', color: 'rgba(10,10,10,0.45)', textAlign: 'center' }}>
            Scanne den Code, um direkt zum Projekt zu gelangen.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[1500] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="rounded-xl px-5 py-3" style={{ background: '#fff' }}>
          <p style={{ ...font, fontSize: '0.85rem', color: 'rgba(10,10,10,0.55)' }}>Laedt...</p>
        </div>
      </div>
    )
  }

  if (!project) return null

  const isOwner = user && (user.id === project.user_id || user.isAdmin)
  const goal = Number(project.goal_amount) || 0
  const current = Number(project.current_amount) || 0
  const progress = goal > 0 ? Math.min(1, current / goal) : 0
  const progressPct = Math.round(progress * 100)
  const mapsUrl = `https://www.google.com/maps?q=${project.lat},${project.lng}`
  const tags = (project.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean)

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await api.uploadProjectImage(projectId, file)
      load()
    } catch (err: any) {
      alert(err.message || 'Fehler beim Upload')
    }
  }

  const saveEdit = async () => {
    try {
      await api.updateProject(projectId, {
        title: editTitle,
        description: editDesc,
        goal_amount: Number(editGoal) || 0,
        opencollective_url: editOC || null,
        video_url: editVideo || null,
      })
      setEditMode(false)
      load()
    } catch (err: any) {
      alert(err.message || 'Fehler')
    }
  }

  const deleteProject = async () => {
    if (!confirm(`Projekt "${project.title}" wirklich loeschen?`)) return
    try {
      await api.deleteProject(projectId)
      if (onDeleted) onDeleted()
      onClose()
    } catch (err: any) {
      alert(err.message || 'Fehler')
    }
  }

  const addMilestone = async () => {
    if (!newMilestoneTitle.trim()) return
    try {
      await api.createMilestone(projectId, {
        title: newMilestoneTitle,
        description: newMilestoneDesc,
        goal_amount: Number(newMilestoneGoal) || 0,
      })
      setNewMilestoneTitle('')
      setNewMilestoneGoal('')
      setNewMilestoneDesc('')
      setNewMilestoneOpen(false)
      load()
    } catch (err: any) {
      alert(err.message || 'Fehler')
    }
  }

  const toggleMilestone = async (id: string, reached: boolean) => {
    try {
      await api.updateMilestone(projectId, id, { reached: reached ? 0 : 1 })
      load()
    } catch {}
  }

  const removeMilestone = async (id: string) => {
    if (!confirm('Meilenstein loeschen?')) return
    try {
      await api.deleteMilestone(projectId, id)
      load()
    } catch {}
  }

  const tabs: { key: Tab; label: string; Icon: any; badge?: string }[] = [
    { key: 'info', label: 'Info', Icon: Info },
    { key: 'milestones', label: 'Meilensteine', Icon: ListChecks, badge: milestones.length > 0 ? String(milestones.length) : '' },
    { key: 'team', label: 'Team', Icon: Users },
  ]

  return (
    <div className="fixed inset-0 z-[1500] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)', maxHeight: '90vh' }}>

        {/* Video oder Bild im Header — Video hat Vorrang */}
        {(() => {
          const embedUrl = getVideoEmbedUrl(project.video_url)
          if (embedUrl) {
            return (
              <div className="relative w-full" style={{ aspectRatio: '16/9', background: '#000' }}>
                <iframe
                  src={embedUrl}
                  title={project.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                />
              </div>
            )
          }
          if (project.image_path) {
            return (
              <div className="relative">
                <img src={project.image_path} alt={project.title} className="w-full h-44 object-cover" />
                {isOwner && (
                  <button onClick={() => fileRef.current?.click()}
                    className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer' }}
                    title="Bild aendern">
                    <Camera size={14} style={{ color: '#0A0A0A' }} />
                  </button>
                )}
              </div>
            )
          }
          if (isOwner) {
            return (
              <button onClick={() => fileRef.current?.click()}
                className="w-full h-32 flex flex-col items-center justify-center gap-1.5"
                style={{ background: `${ACCENT}0D`, border: 'none', cursor: 'pointer', borderBottom: '1px solid rgba(10,10,10,0.06)' }}>
                <Camera size={18} style={{ color: ACCENT }} />
                <span style={{ ...font, fontSize: '0.72rem', fontWeight: 500, color: ACCENT }}>Bild hinzufuegen</span>
              </button>
            )
          }
          return null
        })()}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />

        {/* Tab-Leiste */}
        <div className="flex items-center px-3 py-2 gap-0.5" style={{ borderBottom: '1px solid rgba(10,10,10,0.04)' }}>
          {tabs.map(({ key, label, Icon, badge }) => (
            <div key={key} className="relative group">
              <button onClick={() => setTab(key)}
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 34, height: 34,
                  background: tab === key ? `${ACCENT}1A` : 'transparent',
                  border: 'none', cursor: 'pointer',
                }}>
                <Icon size={15} style={{ color: tab === key ? ACCENT : 'rgba(10,10,10,0.4)' }} />
                {badge && (
                  <span className="absolute -top-0.5 -right-0.5 rounded-full flex items-center justify-center"
                    style={{ minWidth: 14, height: 14, padding: '0 3px', background: ACCENT, color: '#fff', fontSize: '0.55rem', fontWeight: 600, ...font }}>
                    {badge}
                  </span>
                )}
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
                style={{ background: '#0A0A0A', whiteSpace: 'nowrap', zIndex: 10 }}>
                <span style={{ ...font, fontSize: '0.6rem', color: '#fff' }}>{label}</span>
              </div>
            </div>
          ))}
          <div className="flex-1" />
          <button onClick={onClose} className="flex items-center justify-center rounded-lg"
            style={{ width: 34, height: 34, background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5" style={{ maxHeight: project.image_path ? 'calc(90vh - 226px)' : 'calc(90vh - 190px)' }}>

          {/* ─── INFO-TAB ─── */}
          {tab === 'info' && !editMode && (
            <>
              <p style={{ ...font, fontSize: '0.6rem', fontWeight: 500, color: ACCENT, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
                Projekt
              </p>

              <div className="flex items-start justify-between gap-2 mb-3">
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 500, color: '#0A0A0A', lineHeight: 1.25, flex: 1 }}>
                  {project.title}
                </h2>
                <div className="flex items-center gap-1.5 shrink-0">
                  <ShareButton
                    url={`${window.location.origin}/api/share/project/${projectId}`}
                    title={`Projekt: ${project.title}`}
                    text={project.description ? project.description.replace(/[#*>]/g, '').trim().slice(0, 140) : 'Ein Friedensprojekt auf der Lichtung.'}
                    label=""
                    compact
                  />
                  <button onClick={() => setShowFullQR(true)} title="QR-Code"
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)', cursor: 'pointer' }}>
                    <QrCode size={13} style={{ color: 'rgba(10,10,10,0.35)' }} />
                  </button>
                  {isOwner && (
                    <button onClick={() => setEditMode(true)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)', cursor: 'pointer' }}>
                      <Pencil size={13} style={{ color: 'rgba(10,10,10,0.35)' }} />
                    </button>
                  )}
                </div>
              </div>

              {/* Meta-Zeile */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {project.creator_name && (
                  <span style={{ ...font, fontSize: '0.7rem', color: 'rgba(10,10,10,0.4)' }}>
                    von {project.creator_name}
                  </span>
                )}
                {project.lichtung_name && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(123,174,94,0.08)' }}>
                    <Trees size={10} style={{ color: '#7BAE5E' }} />
                    <span style={{ ...font, fontSize: '0.65rem', fontWeight: 500, color: '#7BAE5E' }}>{project.lichtung_name}</span>
                  </span>
                )}
              </div>

              {/* Progress */}
              {goal > 0 && (
                <div className="rounded-xl p-4 mb-4" style={{ background: '#FAFAF8' }}>
                  <div className="flex items-baseline justify-between mb-2">
                    <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.15rem', fontWeight: 500, color: '#0A0A0A' }}>
                      {current} &euro;
                    </span>
                    <span style={{ ...font, fontSize: '0.72rem', color: 'rgba(10,10,10,0.5)' }}>
                      von {goal} &euro; &middot; {progressPct}%
                    </span>
                  </div>
                  <div className="w-full rounded-full overflow-hidden" style={{ height: 8, background: 'rgba(10,10,10,0.06)' }}>
                    <div style={{
                      width: `${progressPct}%`,
                      height: '100%',
                      background: progress >= 1 ? 'linear-gradient(90deg, #7BAE5E, #D4A843)' : `linear-gradient(90deg, ${ACCENT}, #E0A0B5)`,
                      transition: 'width 0.6s',
                    }} />
                  </div>
                </div>
              )}

              {/* Open-Collective-Button */}
              {project.opencollective_url && (
                <a href={project.opencollective_url} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-4"
                  style={{ ...font, fontSize: '0.85rem', fontWeight: 500, color: '#fff', background: `linear-gradient(90deg, ${ACCENT}, #E0A0B5)`, border: 'none', textDecoration: 'none' }}>
                  Unterstuetzen via Open Collective
                  <ExternalLink size={13} />
                </a>
              )}

              {/* Beschreibung */}
              {project.description && (
                <div className="rounded-xl p-5 mb-4" style={{ background: '#FAFAF8' }}>
                  <div className="prose-lichtung" dangerouslySetInnerHTML={{ __html: renderMarkdown(project.description) }} />
                </div>
              )}

              {/* Video-Link nur wenn nicht-einbettbar (z.B. direkter mp4 oder anderes) */}
              {project.video_url && !getVideoEmbedUrl(project.video_url) && (
                <a href={project.video_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-4"
                  style={{ ...font, fontSize: '0.82rem', color: '#0A0A0A', background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)', textDecoration: 'none' }}>
                  <Video size={14} style={{ color: ACCENT }} />
                  Video ansehen
                  <ExternalLink size={11} style={{ color: 'rgba(10,10,10,0.3)', marginLeft: 'auto' }} />
                </a>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mb-4">
                  <p style={{ ...font, fontSize: '0.62rem', fontWeight: 600, color: 'rgba(10,10,10,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                    Was es braucht
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t: string) => (
                      <span key={t} className="flex items-center gap-0.5 px-2 py-1 rounded-full"
                        style={{ background: `${ACCENT}12`, ...font, fontSize: '0.68rem', fontWeight: 500, color: ACCENT }}>
                        <Hash size={9} />{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl mb-2"
                style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#0A0A0A', background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)', textDecoration: 'none' }}>
                <Navigation size={14} style={{ color: '#7BAE5E' }} />
                Zum Standort navigieren
              </a>

              {/* Loeschen */}
              {isOwner && (
                <button onClick={deleteProject}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg mt-2"
                  style={{ ...font, fontSize: '0.7rem', color: '#c44', background: 'rgba(200,50,50,0.04)', border: '1px solid rgba(200,50,50,0.12)', cursor: 'pointer' }}>
                  <Trash2 size={11} />
                  Projekt loeschen
                </button>
              )}
            </>
          )}

          {/* ─── INFO-TAB im Edit-Modus ─── */}
          {tab === 'info' && editMode && (
            <div className="space-y-3">
              <p style={{ ...font, fontSize: '0.6rem', fontWeight: 500, color: ACCENT, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 0 }}>
                Projekt bearbeiten
              </p>

              <div>
                <label style={{ ...font, fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.35)', display: 'block', marginBottom: 4 }}>
                  Titel
                </label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={{ ...font, fontSize: '1rem', fontWeight: 500, border: '1px solid rgba(10,10,10,0.1)', background: '#fff' }} />
              </div>

              <div>
                <label style={{ ...font, fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.35)', display: 'block', marginBottom: 4 }}>
                  Beschreibung
                </label>
                <MarkdownToolbar textareaRef={textareaRef} value={editDesc} onChange={setEditDesc} />
                <textarea ref={textareaRef} value={editDesc} onChange={e => setEditDesc(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 rounded-lg outline-none resize-none"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.9rem', border: '1px solid rgba(10,10,10,0.1)', background: '#fff' }} />
              </div>

              <div>
                <label style={{ ...font, fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.35)', display: 'block', marginBottom: 4 }}>
                  Zielbetrag (Euro)
                </label>
                <input type="number" min="0" value={editGoal} onChange={e => setEditGoal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={{ ...font, fontSize: '0.85rem', border: '1px solid rgba(10,10,10,0.1)', background: '#fff' }} />
              </div>

              <div>
                <label style={{ ...font, fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.35)', display: 'block', marginBottom: 4 }}>
                  Open Collective URL
                </label>
                <input type="url" value={editOC} onChange={e => setEditOC(e.target.value)}
                  placeholder="https://opencollective.com/..."
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={{ ...font, fontSize: '0.85rem', border: '1px solid rgba(10,10,10,0.1)', background: '#fff' }} />
              </div>

              <div>
                <label style={{ ...font, fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.35)', display: 'block', marginBottom: 4 }}>
                  Video URL
                </label>
                <input type="url" value={editVideo} onChange={e => setEditVideo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={{ ...font, fontSize: '0.85rem', border: '1px solid rgba(10,10,10,0.1)', background: '#fff' }} />
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={saveEdit}
                  className="flex-1 py-2.5 rounded-lg"
                  style={{ ...font, fontSize: '0.82rem', fontWeight: 500, color: '#fff', background: '#0A0A0A', border: 'none', cursor: 'pointer' }}>
                  Speichern
                </button>
                <button onClick={() => setEditMode(false)}
                  className="px-5 py-2.5 rounded-lg"
                  style={{ ...font, fontSize: '0.82rem', color: 'rgba(10,10,10,0.5)', background: '#fff', border: '1px solid rgba(10,10,10,0.1)', cursor: 'pointer' }}>
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          {/* ─── MEILENSTEINE-TAB ─── */}
          {tab === 'milestones' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p style={{ ...font, fontSize: '0.6rem', fontWeight: 500, color: ACCENT, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 2 }}>
                    Meilensteine
                  </p>
                  <p style={{ ...font, fontSize: '0.72rem', color: 'rgba(10,10,10,0.45)' }}>
                    Abschnitte, die mit zusaetzlicher Unterstuetzung moeglich werden.
                  </p>
                </div>
                {isOwner && (
                  <button onClick={() => setNewMilestoneOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg"
                    style={{ ...font, fontSize: '0.68rem', fontWeight: 500, color: ACCENT, background: `${ACCENT}0F`, border: `1px solid ${ACCENT}26`, cursor: 'pointer' }}>
                    <Plus size={11} /> Neu
                  </button>
                )}
              </div>

              {newMilestoneOpen && isOwner && (
                <div className="rounded-xl p-4 mb-3 space-y-2" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}26` }}>
                  <input type="text" value={newMilestoneTitle} onChange={e => setNewMilestoneTitle(e.target.value)}
                    placeholder="Titel des Meilensteins"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{ ...font, fontSize: '0.82rem', border: '1px solid rgba(10,10,10,0.08)', background: '#fff' }} />
                  <input type="number" min="0" value={newMilestoneGoal} onChange={e => setNewMilestoneGoal(e.target.value)}
                    placeholder="Zielbetrag (Euro)"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{ ...font, fontSize: '0.82rem', border: '1px solid rgba(10,10,10,0.08)', background: '#fff' }} />
                  <textarea value={newMilestoneDesc} onChange={e => setNewMilestoneDesc(e.target.value)}
                    placeholder="Was wird damit erreicht?" rows={2}
                    className="w-full px-3 py-2 rounded-lg outline-none resize-none"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.88rem', border: '1px solid rgba(10,10,10,0.08)', background: '#fff' }} />
                  <div className="flex gap-2">
                    <button onClick={addMilestone}
                      className="flex-1 py-2 rounded-lg" style={{ ...font, fontSize: '0.78rem', fontWeight: 500, color: '#fff', background: ACCENT, border: 'none', cursor: 'pointer' }}>
                      Speichern
                    </button>
                    <button onClick={() => setNewMilestoneOpen(false)}
                      className="px-4 py-2 rounded-lg" style={{ ...font, fontSize: '0.78rem', color: 'rgba(10,10,10,0.5)', background: '#fff', border: '1px solid rgba(10,10,10,0.1)', cursor: 'pointer' }}>
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}

              {milestones.length === 0 ? (
                <div className="text-center py-8">
                  <ListChecks size={22} style={{ color: 'rgba(10,10,10,0.1)', margin: '0 auto 8px' }} />
                  <p style={{ ...font, fontSize: '0.8rem', color: 'rgba(10,10,10,0.4)' }}>
                    Noch keine Meilensteine.
                  </p>
                  {isOwner && (
                    <p style={{ ...font, fontSize: '0.72rem', color: 'rgba(10,10,10,0.35)', marginTop: 4 }}>
                      Ueber den Plus-Button oben lassen sie sich anlegen.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {milestones.map((m: any) => (
                    <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg"
                      style={{ background: m.reached ? 'rgba(123,174,94,0.05)' : '#FAFAF8', border: m.reached ? '1px solid rgba(123,174,94,0.15)' : '1px solid rgba(10,10,10,0.04)' }}>
                      {isOwner ? (
                        <button onClick={() => toggleMilestone(m.id, !!m.reached)}
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: m.reached ? '#7BAE5E' : 'transparent', border: m.reached ? 'none' : '2px solid rgba(10,10,10,0.15)', cursor: 'pointer' }}>
                          {m.reached ? <Check size={11} style={{ color: '#fff' }} /> : null}
                        </button>
                      ) : (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: m.reached ? '#7BAE5E' : 'transparent', border: m.reached ? 'none' : '2px solid rgba(10,10,10,0.15)' }}>
                          {m.reached ? <Check size={11} style={{ color: '#fff' }} /> : null}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span style={{ ...font, fontSize: '0.85rem', fontWeight: 600, color: '#0A0A0A' }}>{m.title}</span>
                          {m.goal_amount > 0 && (
                            <span style={{ ...font, fontSize: '0.7rem', color: 'rgba(10,10,10,0.45)', whiteSpace: 'nowrap' }}>{m.goal_amount} &euro;</span>
                          )}
                        </div>
                        {m.description && (
                          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.82rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.5)', marginTop: 2 }}>
                            {m.description}
                          </p>
                        )}
                      </div>
                      {isOwner && (
                        <button onClick={() => removeMilestone(m.id)}
                          className="shrink-0 w-6 h-6 rounded flex items-center justify-center"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={11} style={{ color: 'rgba(10,10,10,0.25)' }} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ─── TEAM-TAB (Platzhalter) ─── */}
          {tab === 'team' && (
            <>
              <p style={{ ...font, fontSize: '0.6rem', fontWeight: 500, color: ACCENT, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 2 }}>
                Team
              </p>
              <p style={{ ...font, fontSize: '0.72rem', color: 'rgba(10,10,10,0.45)', marginBottom: 20 }}>
                Initiatoren und Unterstuetzer dieses Projekts.
              </p>

              {/* Initiator (Creator) */}
              {project.creator_name && (
                <div className="flex items-center gap-3 p-3 rounded-lg mb-3" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
                  {project.creator_image ? (
                    <img src={project.creator_image} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(212,168,67,0.25)' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(212,168,67,0.08)', border: '1.5px solid rgba(212,168,67,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem', color: '#D4A843' }}>
                        {project.creator_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p style={{ ...font, fontSize: '0.82rem', fontWeight: 600, color: '#0A0A0A' }}>{project.creator_name}</p>
                    <p style={{ ...font, fontSize: '0.66rem', color: ACCENT, fontWeight: 500 }}>Initiator</p>
                  </div>
                </div>
              )}

              {/* Coming-Soon-Hinweis */}
              <div className="rounded-xl p-4 text-center" style={{ background: `${ACCENT}0A`, border: `1px dashed ${ACCENT}33` }}>
                <Users size={18} style={{ color: ACCENT, margin: '0 auto 8px' }} />
                <p style={{ ...font, fontSize: '0.78rem', color: 'rgba(10,10,10,0.6)', marginBottom: 4 }}>
                  Mit-Initiatoren einladen
                </p>
                <p style={{ ...font, fontSize: '0.68rem', color: 'rgba(10,10,10,0.4)', lineHeight: 1.5 }}>
                  Bald koennen mehrere Menschen ein Projekt gemeinsam tragen — mit Rollen, Einladungen und geteilter Verantwortung.
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
