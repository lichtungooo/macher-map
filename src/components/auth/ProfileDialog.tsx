import { useState, useRef, useEffect } from 'react'
import { X, Camera, Settings, LogOut, KeyRound, Check, CalendarDays, Users, MessageCircle, Map, User } from 'lucide-react'
import { MyEvents } from '../events/MyEvents'
import { MyConnections } from './MyConnections'
import { useApp } from '../../context/AppContext'
import { MarkdownToolbar } from './MarkdownToolbar'
import * as api from '../../api/client'

interface ProfileDialogProps {
  onClose: () => void
  onShowChainOnMap?: () => void
}

export function ProfileDialog({ onClose, onShowChainOnMap }: ProfileDialogProps) {
  const { user, updateProfile, logout } = useApp()
  const [name, setName] = useState(user?.name || '')
  const [statement, setStatement] = useState(user?.statement || '')
  const [imagePreview, setImagePreview] = useState<string | undefined>(user?.imageUrl)
  const [view, setView] = useState<'profile' | 'events' | 'connections' | 'settings'>('profile')
  const [telegram, setTelegram] = useState('')
  const [telegramStatus, setTelegramStatus] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [autoLight, setAutoLightState] = useState(() => localStorage.getItem('lichtung-auto-light') === '1')
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushStatus, setPushStatus] = useState('')

  // Check push permission
  useEffect(() => {
    if ('Notification' in window) {
      setPushEnabled(Notification.permission === 'granted')
    }
  }, [])

  // Telegram aus Profil laden
  useEffect(() => {
    if (!api.getToken()) return
    api.getProfile().then((p: any) => {
      if (p.telegram) setTelegram(p.telegram)
    }).catch(() => {})
  }, [])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    // Upload to backend
    api.uploadProfileImage(file).then(data => {
      updateProfile({ imageUrl: data.image_path })
    }).catch(() => {})
  }

  const handleSave = async () => {
    updateProfile({ name, statement })
    try { await api.updateProfile(name, statement) } catch {}
    onClose()
  }

  const handleLogout = () => {
    api.clearToken()
    logout()
    onClose()
  }

  const handleChangePassword = async () => {
    setPwMsg('')
    try {
      if (user?.email) {
        await api.forgotPassword(user.email)
        setPwMsg('Link zum Zuruecksetzen gesendet.')
      }
    } catch { setPwMsg('Fehler.') }
  }

  const inputStyle = { border: '1px solid rgba(10,10,10,0.1)', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#0A0A0A', background: '#fff' }
  const labelStyle = { fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', fontWeight: 400 as const, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'rgba(10,10,10,0.4)', display: 'block', marginBottom: '6px' }

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
      <div className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
        {/* Header with icon-only tabs + tooltip */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-0.5">
            {([
              ['profile', 'Profil', User],
              ['events', 'Termine', CalendarDays],
              ['connections', 'Netz', Users],
              ['settings', 'Einstellungen', Settings],
            ] as [string, string, any][]).map(([key, label, Icon]) => (
              <div key={key} className="relative group">
                <button onClick={() => setView(key as any)}
                  className="rounded-full flex items-center justify-center"
                  style={{ width: 36, height: 36, background: view === key ? 'rgba(212,168,67,0.1)' : 'transparent', border: 'none', cursor: 'pointer' }}>
                  <Icon size={16} style={{ color: view === key ? '#D4A843' : 'rgba(10,10,10,0.25)' }} />
                </button>
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
                  style={{ background: '#0A0A0A', whiteSpace: 'nowrap' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', color: '#fff' }}>{label}</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}>
            <X size={18} />
          </button>
        </div>

        {view === 'events' ? (
          <MyEvents />
        ) : view === 'connections' ? (
          <MyConnections onShowOnMap={onShowChainOnMap ? () => { onShowChainOnMap(); onClose() } : undefined} />
        ) : view === 'settings' ? (
          /* ─── Settings View ─── */
          <div className="space-y-4">
            <div>
              <label style={labelStyle}>E-Mail</label>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(10,10,10,0.6)', padding: '12px', background: '#FAFAF8', borderRadius: '8px' }}>
                {user?.email}
              </p>
            </div>

            <div>
              <label style={labelStyle}>Passwort aendern</label>
              <button
                onClick={handleChangePassword}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg"
                style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.08)', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#0A0A0A', cursor: 'pointer' }}
              >
                <KeyRound size={16} style={{ color: '#D4A843' }} />
                Link zum Zuruecksetzen senden
              </button>
              {pwMsg && <p style={{ fontSize: '0.75rem', color: pwMsg.includes('Fehler') ? '#c44' : '#D4A843', marginTop: '6px' }}>{pwMsg}</p>}
            </div>

            <div>
              <label style={labelStyle}>Standort</label>
              <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
                <button
                  onClick={() => {
                    const next = !autoLight
                    setAutoLightState(next)
                    localStorage.setItem('lichtung-auto-light', next ? '1' : '0')
                  }}
                  className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                  style={{ border: autoLight ? 'none' : '1px solid rgba(10,10,10,0.15)', background: autoLight ? '#D4A843' : '#fff', cursor: 'pointer' }}
                >
                  {autoLight && <Check size={14} color="#fff" />}
                </button>
                <div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#0A0A0A', display: 'block' }}>
                    Licht automatisch setzen
                  </span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: 'rgba(10,10,10,0.4)', display: 'block', marginTop: '2px' }}>
                    Beim Oeffnen der Karte wird dein Licht an deinen Standort gesetzt.
                  </span>
                </div>
              </label>
            </div>

            <div>
              <label style={labelStyle}>Benachrichtigungen</label>
              <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
                <button
                  onClick={async () => {
                    if (!('Notification' in window)) { setPushStatus('Nicht verfuegbar.'); return }
                    if (Notification.permission === 'granted') {
                      setPushEnabled(false)
                      setPushStatus('Deaktiviert. Zum Reaktivieren Browser-Einstellungen pruefen.')
                      return
                    }
                    const perm = await Notification.requestPermission()
                    if (perm === 'granted') {
                      setPushEnabled(true)
                      setPushStatus('Aktiviert.')
                      // Test-Notification
                      new Notification('Licht fuer Frieden', { body: 'Push-Nachrichten sind aktiv.', icon: '/favicon.svg' })
                    } else {
                      setPushStatus('Berechtigung verweigert.')
                    }
                  }}
                  className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                  style={{ border: pushEnabled ? 'none' : '1px solid rgba(10,10,10,0.15)', background: pushEnabled ? '#D4A843' : '#fff', cursor: 'pointer' }}
                >
                  {pushEnabled && <Check size={14} color="#fff" />}
                </button>
                <div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#0A0A0A', display: 'block' }}>
                    Push-Nachrichten
                  </span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: 'rgba(10,10,10,0.4)', display: 'block', marginTop: '2px' }}>
                    Erinnerungen an Termine und globale Meditationen.
                  </span>
                </div>
              </label>
              {pushStatus && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: '#D4A843', marginTop: '4px' }}>{pushStatus}</p>}
            </div>

            <div>
              <label style={labelStyle}>Telegram (optional)</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <MessageCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(10,10,10,0.25)' }} />
                  <input type="text" value={telegram} onChange={e => setTelegram(e.target.value)}
                    placeholder="@deinname"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg outline-none"
                    style={{ border: '1px solid rgba(10,10,10,0.08)', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#0A0A0A', background: '#fff' }} />
                </div>
                <button onClick={async () => {
                  try {
                    await api.setTelegram(telegram)
                    setTelegramStatus('Gespeichert.')
                    setTimeout(() => setTelegramStatus(''), 2000)
                  } catch {
                    setTelegramStatus('Fehler.')
                  }
                }}
                  className="px-3 py-2.5 rounded-lg" style={{ background: telegramStatus === 'Gespeichert.' ? 'rgba(123,174,94,0.1)' : '#FAFAF8', border: '1px solid rgba(10,10,10,0.08)', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: telegramStatus === 'Gespeichert.' ? '#7BAE5E' : '#0A0A0A', cursor: 'pointer' }}>
                  {telegramStatus === 'Gespeichert.' ? '✓' : 'OK'}
                </button>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', color: 'rgba(10,10,10,0.3)', marginTop: '4px' }}>
                Sichtbar fuer deine Verbindungen. Format: @deinname
              </p>
              {telegramStatus && telegramStatus !== 'Gespeichert.' && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: '#c44', marginTop: '4px' }}>{telegramStatus}</p>}
            </div>

            <div>
              <label style={labelStyle}>Kartenstil</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'osm_de', label: 'OpenStreetMap DE' },
                  { key: 'osm', label: 'OpenStreetMap' },
                  { key: 'voyager', label: 'Voyager' },
                  { key: 'positron', label: 'Positron' },
                ].map(layer => {
                  const active = (localStorage.getItem('lichtung-tile-layer') || 'osm_de') === layer.key
                  return (
                    <button key={layer.key}
                      onClick={() => { localStorage.setItem('lichtung-tile-layer', layer.key); window.location.reload() }}
                      className="flex items-center gap-2 p-3 rounded-lg"
                      style={{
                        background: active ? 'rgba(212,168,67,0.06)' : '#FAFAF8',
                        border: active ? '1px solid rgba(212,168,67,0.3)' : '1px solid rgba(10,10,10,0.04)',
                        cursor: 'pointer',
                      }}>
                      <Map size={13} style={{ color: active ? '#D4A843' : 'rgba(10,10,10,0.3)' }} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: active ? 600 : 400, color: active ? '#D4A843' : 'rgba(10,10,10,0.5)' }}>
                        {layer.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(10,10,10,0.06)', margin: '16px 0' }} />

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg"
              style={{ background: 'none', border: '1px solid rgba(200,50,50,0.2)', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#c44', cursor: 'pointer' }}
            >
              <LogOut size={16} />
              Abmelden
            </button>
          </div>
        ) : (
          /* ─── Profile View ─── */
          <>
            {/* Avatar Upload */}
            <div className="flex justify-center mb-5">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                style={{ background: imagePreview ? 'transparent' : 'rgba(212,168,67,0.06)', border: imagePreview ? '2.5px solid rgba(212,168,67,0.3)' : '2px dashed rgba(212,168,67,0.25)', cursor: 'pointer' }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Camera size={24} style={{ color: '#D4A843' }} />
                )}
              </button>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label style={labelStyle}>Dein Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Dein Name"
                className="w-full px-4 py-3 rounded-lg outline-none" style={inputStyle} />
            </div>

            {/* Statement */}
            <div className="mb-6">
              <label style={labelStyle}>Dein Friedens-Statement</label>
              <MarkdownToolbar textareaRef={textareaRef} value={statement} onChange={setStatement} />
              <textarea ref={textareaRef} value={statement} onChange={e => setStatement(e.target.value)}
                placeholder="Ein Satz, ein Gedicht, ein Gebet — was aus deinem Herzen kommt." rows={5}
                className="w-full px-4 py-3 rounded-lg outline-none resize-none"
                style={{ ...inputStyle, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.95rem', lineHeight: 1.6 }} />
            </div>

            <button onClick={handleSave} className="w-full py-3 rounded-lg"
              style={{ background: '#0A0A0A', border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, color: '#fff', cursor: 'pointer' }}>
              Speichern
            </button>
          </>
        )}
      </div>
    </div>
  )
}
