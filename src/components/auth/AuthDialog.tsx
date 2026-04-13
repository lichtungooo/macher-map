import { useState } from 'react'
import { X, Mail, ArrowRight, Check } from 'lucide-react'
import * as api from '../../api/client'

interface AuthDialogProps {
  onClose: () => void
  onSuccess: () => void
}

export function AuthDialog({ onClose }: AuthDialogProps) {
  const [email, setEmail] = useState('')
  const [newsletter, setNewsletter] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')

    try {
      await api.sendMagicLink(email.trim(), newsletter)
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
      <div
        className="relative w-full max-w-sm rounded-2xl p-8 shadow-xl"
        style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}
        >
          <X size={20} />
        </button>

        {!sent ? (
          <>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, color: '#0A0A0A', marginBottom: '0.5rem', textAlign: 'center' }}>
              Willkommen
            </h2>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.95rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.4)', textAlign: 'center', marginBottom: '2rem' }}>
              Dein Licht wartet.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="relative mb-4">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(10,10,10,0.3)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Deine E-Mail"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-lg outline-none"
                  style={{ border: '1px solid rgba(10,10,10,0.12)', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#0A0A0A', background: '#fff' }}
                />
              </div>

              {/* Newsletter Checkbox */}
              <label className="flex items-start gap-3 mb-5 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setNewsletter(!newsletter)}
                  className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    border: newsletter ? 'none' : '1px solid rgba(10,10,10,0.15)',
                    background: newsletter ? '#D4A843' : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  {newsletter && <Check size={14} color="#fff" />}
                </button>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', lineHeight: 1.5, color: 'rgba(10,10,10,0.5)' }}>
                  Ich moechte ueber Friedensveranstaltungen und Neuigkeiten informiert werden.
                </span>
              </label>

              {error && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#c44', marginBottom: '12px', textAlign: 'center' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg"
                style={{
                  background: loading ? 'rgba(10,10,10,0.5)' : '#0A0A0A',
                  border: 'none',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500,
                  color: '#fff', cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading ? 'Wird gesendet...' : 'Magic Link senden'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <p className="mt-4 text-center" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', color: 'rgba(10,10,10,0.3)', lineHeight: 1.5 }}>
              Du erhaeltst einen Link per E-Mail. Kein Passwort noetig.
              <br />Wir geben deine Daten nicht an Dritte weiter.
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(212,168,67,0.1)' }}>
              <Mail size={28} style={{ color: '#D4A843' }} />
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.3rem', fontWeight: 400, color: '#0A0A0A', marginBottom: '0.5rem' }}>
              Pruefe dein Postfach
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(10,10,10,0.5)', lineHeight: 1.6 }}>
              Wir haben dir einen Link an <strong>{email}</strong> gesendet.
              Klicke auf den Link in der E-Mail, um dein Profil zu erstellen.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
