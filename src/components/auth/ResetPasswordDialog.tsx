import { useState } from 'react'
import { X, KeyRound, Check } from 'lucide-react'
import * as api from '../../api/client'

interface ResetPasswordDialogProps {
  token: string
  onClose: () => void
  onSuccess: () => void
}

export function ResetPasswordDialog({ token, onClose, onSuccess }: ResetPasswordDialogProps) {
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Mindestens 8 Zeichen.'); return }
    if (password !== password2) { setError('Passwoerter stimmen nicht ueberein.'); return }
    setLoading(true)
    try {
      await api.resetPassword(token, password)
      setDone(true)
      setTimeout(() => { onSuccess(); onClose() }, 1600)
    } catch (err: any) {
      setError(err?.message || 'Fehler. Link ungueltig oder abgelaufen?')
    } finally { setLoading(false) }
  }

  const inp = { border: '1px solid rgba(10,10,10,0.12)', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#0A0A0A', background: '#fff' }

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}>
      <div className="relative w-full max-w-sm rounded-2xl p-8 shadow-xl" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
        <button onClick={onClose} className="absolute top-4 right-4" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}>
          <X size={20} />
        </button>

        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(123,174,94,0.12)' }}>
              <Check size={24} style={{ color: '#7BAE5E' }} />
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.3rem', color: '#0A0A0A', marginBottom: '0.4rem' }}>
              Passwort gesetzt
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(10,10,10,0.5)' }}>
              Du kannst dich jetzt anmelden.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3" style={{ background: 'rgba(212,168,67,0.1)' }}>
              <KeyRound size={22} style={{ color: '#D4A843' }} />
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, color: '#0A0A0A', marginBottom: '0.5rem', textAlign: 'center' }}>
              Neues Passwort
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(10,10,10,0.5)', marginBottom: '1.5rem', textAlign: 'center', lineHeight: 1.5 }}>
              Setze dein neues Passwort.
            </p>

            <form onSubmit={handleSubmit}>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Neues Passwort (mindestens 8 Zeichen)" required autoFocus
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-lg outline-none mb-3" style={inp} />
              <input type="password" value={password2} onChange={e => setPassword2(e.target.value)}
                placeholder="Passwort wiederholen" required
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-lg outline-none mb-4" style={inp} />

              {error && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#c44', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg"
                style={{ background: loading ? 'rgba(10,10,10,0.5)' : '#0A0A0A', color: '#fff', border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, cursor: loading ? 'wait' : 'pointer' }}>
                {loading ? 'Wird gesetzt...' : 'Passwort setzen'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
