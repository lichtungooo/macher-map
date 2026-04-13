import { useState, useEffect } from 'react'
import { Users, Sparkles, CalendarDays, Mail, Send, LogOut } from 'lucide-react'
import * as api from '../api/client'

export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState<{ users: number; lights: number; events: number; newsletter: number } | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [nlSubject, setNlSubject] = useState('')
  const [nlBody, setNlBody] = useState('')
  const [nlResult, setNlResult] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (api.getToken()) {
      loadData()
    }
  }, [])

  async function loadData() {
    try {
      const token = api.getToken()
      if (!token) return
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      const statsRes = await fetch('/api/admin/stats', { headers })
      if (!statsRes.ok) throw new Error('Kein Zugriff')
      setStats(await statsRes.json())
      const usersRes = await fetch('/api/admin/users?limit=50', { headers })
      setUsers(await usersRes.json())
      setLoggedIn(true)
    } catch {
      setLoggedIn(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await api.login(email, password)
      await loadData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleSendNewsletter() {
    if (!nlSubject || !nlBody) return
    setSending(true)
    setNlResult('')
    try {
      const token = api.getToken()
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: nlSubject, body: nlBody }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNlResult(`Newsletter gesendet an ${data.sent} von ${data.total} Empfaengern.`)
      setNlSubject('')
      setNlBody('')
    } catch (err: any) {
      setNlResult(`Fehler: ${err.message}`)
    } finally {
      setSending(false)
    }
  }

  const cardStyle = { background: '#fff', border: '1px solid rgba(10,10,10,0.06)', borderRadius: '12px', padding: '20px' }

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#FAFAF8' }}>
        <form onSubmit={handleLogin} className="w-full max-w-sm p-8 rounded-2xl" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, color: '#0A0A0A', marginBottom: '1.5rem', textAlign: 'center' }}>
            Admin
          </h1>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-Mail" required
            className="w-full px-4 py-3 rounded-lg outline-none mb-3" style={{ border: '1px solid rgba(10,10,10,0.12)', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Passwort" required
            className="w-full px-4 py-3 rounded-lg outline-none mb-4" style={{ border: '1px solid rgba(10,10,10,0.12)', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }} />
          {error && <p style={{ color: '#c44', fontSize: '0.78rem', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}
          <button type="submit" className="w-full py-3 rounded-lg" style={{ background: '#0A0A0A', color: '#fff', border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer' }}>
            Anmelden
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6" style={{ background: '#FAFAF8', fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.8rem', fontWeight: 400, color: '#0A0A0A' }}>
            Lichtung Admin
          </h1>
          <button onClick={() => { api.clearToken(); setLoggedIn(false) }} className="flex items-center gap-2" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.4)', fontSize: '0.82rem' }}>
            <LogOut size={16} /> Abmelden
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Users, label: 'Nutzer', value: stats.users },
              { icon: Sparkles, label: 'Lichter', value: stats.lights },
              { icon: CalendarDays, label: 'Events', value: stats.events },
              { icon: Mail, label: 'Newsletter', value: stats.newsletter },
            ].map((s, i) => (
              <div key={i} style={cardStyle}>
                <s.icon size={20} style={{ color: '#D4A843', marginBottom: '8px' }} />
                <div style={{ fontSize: '1.8rem', fontWeight: 600, color: '#0A0A0A' }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(10,10,10,0.4)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Newsletter */}
        <div style={cardStyle} className="mb-8">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0A0A0A', marginBottom: '12px' }}>Newsletter senden</h2>
          <input type="text" value={nlSubject} onChange={e => setNlSubject(e.target.value)} placeholder="Betreff"
            className="w-full px-4 py-3 rounded-lg outline-none mb-3" style={{ border: '1px solid rgba(10,10,10,0.1)', fontSize: '0.85rem' }} />
          <textarea value={nlBody} onChange={e => setNlBody(e.target.value)} placeholder="Text (HTML erlaubt)" rows={6}
            className="w-full px-4 py-3 rounded-lg outline-none resize-none mb-3" style={{ border: '1px solid rgba(10,10,10,0.1)', fontSize: '0.85rem', lineHeight: 1.6 }} />
          <div className="flex items-center gap-4">
            <button onClick={handleSendNewsletter} disabled={sending} className="flex items-center gap-2 px-6 py-3 rounded-lg"
              style={{ background: '#0A0A0A', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 500, cursor: sending ? 'wait' : 'pointer' }}>
              <Send size={16} /> {sending ? 'Wird gesendet...' : 'An alle Newsletter-Abonnenten senden'}
            </button>
            {nlResult && <span style={{ fontSize: '0.78rem', color: nlResult.startsWith('Fehler') ? '#c44' : '#2a2' }}>{nlResult}</span>}
          </div>
        </div>

        {/* Users */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0A0A0A', marginBottom: '12px' }}>Letzte Registrierungen</h2>
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(10,10,10,0.06)' }}>
                  <th style={{ textAlign: 'left', padding: '8px', color: 'rgba(10,10,10,0.4)', fontWeight: 500 }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '8px', color: 'rgba(10,10,10,0.4)', fontWeight: 500 }}>E-Mail</th>
                  <th style={{ textAlign: 'left', padding: '8px', color: 'rgba(10,10,10,0.4)', fontWeight: 500 }}>Newsletter</th>
                  <th style={{ textAlign: 'left', padding: '8px', color: 'rgba(10,10,10,0.4)', fontWeight: 500 }}>Datum</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(10,10,10,0.03)' }}>
                    <td style={{ padding: '8px', color: '#0A0A0A' }}>{u.name || '—'}</td>
                    <td style={{ padding: '8px', color: 'rgba(10,10,10,0.6)' }}>{u.email}</td>
                    <td style={{ padding: '8px', color: u.newsletter ? '#D4A843' : 'rgba(10,10,10,0.2)' }}>{u.newsletter ? 'Ja' : '—'}</td>
                    <td style={{ padding: '8px', color: 'rgba(10,10,10,0.4)' }}>{u.created_at?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
