import { useState } from 'react'
import { X, Mail, ArrowRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'

interface AuthDialogProps {
  onClose: () => void
  onSuccess: () => void
}

export function AuthDialog({ onClose, onSuccess }: AuthDialogProps) {
  const { login } = useApp()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    // Simulate magic link sent
    setSent(true)
    // For demo: auto-login after 1.5s
    setTimeout(() => {
      login(email)
      onSuccess()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
      <div
        className="relative w-full max-w-sm rounded-2xl p-8 shadow-xl"
        style={{ background: '#FDFCF9', border: '1px solid rgba(10,10,10,0.06)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {!sent ? (
          <>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '1.5rem',
                fontWeight: 400,
                color: '#0A0A0A',
                marginBottom: '0.5rem',
                textAlign: 'center',
              }}
            >
              Willkommen
            </h2>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '0.95rem',
                fontStyle: 'italic',
                color: 'rgba(10,10,10,0.4)',
                textAlign: 'center',
                marginBottom: '2rem',
              }}
            >
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
                  className="w-full pl-11 pr-4 py-3 rounded-lg outline-none transition-colors"
                  style={{
                    border: '1px solid rgba(10,10,10,0.12)',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.85rem',
                    color: '#0A0A0A',
                    background: '#fff',
                  }}
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, #D4A843, #F5E090)',
                  border: 'none',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  color: '#0A0A0A',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Magic Link senden
                <ArrowRight size={16} />
              </button>
            </form>

            <p
              className="mt-4 text-center"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.62rem',
                color: 'rgba(10,10,10,0.3)',
              }}
            >
              Du erhaeltst einen Link per E-Mail. Kein Passwort noetig.
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(212,168,67,0.1)' }}>
              <Mail size={28} style={{ color: '#D4A843' }} />
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '1.3rem',
                fontWeight: 400,
                color: '#0A0A0A',
                marginBottom: '0.5rem',
              }}
            >
              Pruefe dein Postfach
            </h2>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.8rem',
                color: 'rgba(10,10,10,0.5)',
              }}
            >
              Wir haben dir einen Link an <strong>{email}</strong> gesendet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
