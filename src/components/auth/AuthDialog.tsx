import { useState } from 'react'
import { X, Mail, Lock, ArrowRight, Check, Eye, EyeOff } from 'lucide-react'
import * as api from '../../api/client'

type Mode = 'register' | 'login' | 'forgot' | 'forgot-sent'

interface AuthDialogProps {
  onClose: () => void
  onSuccess: (user: { id: string; email: string; name: string; statement: string; image_path?: string }) => void
}

export function AuthDialog({ onClose, onSuccess }: AuthDialogProps) {
  const [mode, setMode] = useState<Mode>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [newsletter, setNewsletter] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        if (password !== password2) { setError('Passwoerter stimmen nicht ueberein.'); setLoading(false); return }
        const user = await api.register(email.trim(), password, newsletter)
        onSuccess(user)
      } else if (mode === 'login') {
        const user = await api.login(email.trim(), password)
        onSuccess(user)
      } else if (mode === 'forgot') {
        await api.forgotPassword(email.trim())
        setMode('forgot-sent')
      }
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { border: '1px solid rgba(10,10,10,0.12)', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#0A0A0A', background: '#fff' }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
      <div className="relative w-full max-w-sm rounded-2xl p-8 shadow-xl" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
        <button onClick={onClose} className="absolute top-4 right-4" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}>
          <X size={20} />
        </button>

        {mode === 'forgot-sent' ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(212,168,67,0.1)' }}>
              <Mail size={28} style={{ color: '#D4A843' }} />
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.3rem', fontWeight: 400, color: '#0A0A0A', marginBottom: '0.5rem' }}>
              Pruefe dein Postfach
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(10,10,10,0.5)', lineHeight: 1.6 }}>
              Falls ein Konto mit <strong>{email}</strong> existiert, haben wir dir einen Link zum Zuruecksetzen gesendet.
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, color: '#0A0A0A', marginBottom: '0.3rem', textAlign: 'center' }}>
              {mode === 'register' ? 'Konto erstellen' : mode === 'login' ? 'Anmelden' : 'Passwort vergessen'}
            </h2>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.95rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.4)', textAlign: 'center', marginBottom: '1.5rem' }}>
              {mode === 'forgot' ? 'Wir senden dir einen Link.' : 'Dein Licht wartet.'}
            </p>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="relative mb-3">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(10,10,10,0.3)' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-Mail-Adresse" required
                  className="w-full pl-11 pr-4 py-3 rounded-lg outline-none" style={inputStyle} />
              </div>

              {/* Password */}
              {mode !== 'forgot' && (
                <div className="relative mb-3">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(10,10,10,0.3)' }} />
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Passwort" required minLength={6}
                    className="w-full pl-11 pr-11 py-3 rounded-lg outline-none" style={inputStyle} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              )}

              {/* Password confirm (register only) */}
              {mode === 'register' && (
                <div className="relative mb-3">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(10,10,10,0.3)' }} />
                  <input type={showPw ? 'text' : 'password'} value={password2} onChange={e => setPassword2(e.target.value)}
                    placeholder="Passwort wiederholen" required minLength={6}
                    className="w-full pl-11 pr-4 py-3 rounded-lg outline-none" style={inputStyle} />
                </div>
              )}

              {/* Newsletter (register only) */}
              {mode === 'register' && (
                <label className="flex items-start gap-3 mb-4 cursor-pointer">
                  <button type="button" onClick={() => setNewsletter(!newsletter)}
                    className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5"
                    style={{ border: newsletter ? 'none' : '1px solid rgba(10,10,10,0.15)', background: newsletter ? '#D4A843' : '#fff', cursor: 'pointer' }}>
                    {newsletter && <Check size={14} color="#fff" />}
                  </button>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', lineHeight: 1.5, color: 'rgba(10,10,10,0.5)' }}>
                    Ueber Friedensveranstaltungen und Neuigkeiten informiert werden.
                  </span>
                </label>
              )}

              {error && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#c44', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg"
                style={{ background: loading ? 'rgba(10,10,10,0.5)' : '#0A0A0A', border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, color: '#fff', cursor: loading ? 'wait' : 'pointer' }}>
                {loading ? 'Bitte warten...' : mode === 'register' ? 'Konto erstellen' : mode === 'login' ? 'Anmelden' : 'Link senden'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            {/* Mode switches */}
            <div className="mt-4 text-center space-y-2">
              {mode === 'register' && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(10,10,10,0.4)' }}>
                  Schon ein Konto? <button onClick={() => { setMode('login'); setError('') }} style={{ color: '#D4A843', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: 'inherit' }}>Anmelden</button>
                </p>
              )}
              {mode === 'login' && (
                <>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(10,10,10,0.4)' }}>
                    Noch kein Konto? <button onClick={() => { setMode('register'); setError('') }} style={{ color: '#D4A843', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: 'inherit' }}>Registrieren</button>
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(10,10,10,0.3)' }}>
                    <button onClick={() => { setMode('forgot'); setError('') }} style={{ color: 'rgba(10,10,10,0.4)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: 'inherit' }}>Passwort vergessen?</button>
                  </p>
                </>
              )}
              {mode === 'forgot' && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(10,10,10,0.4)' }}>
                  <button onClick={() => { setMode('login'); setError('') }} style={{ color: '#D4A843', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: 'inherit' }}>Zurueck zur Anmeldung</button>
                </p>
              )}
            </div>

            {mode === 'register' && (
              <p className="mt-3 text-center" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', color: 'rgba(10,10,10,0.25)', lineHeight: 1.5 }}>
                Wir geben deine Daten nicht an Dritte weiter.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
