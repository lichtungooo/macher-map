import { useState, useEffect } from 'react'
import { Users, Sparkles, CalendarDays, Mail, Send, LogOut, Shield, KeyRound, Bold, Italic, Heading2, Image, Link as LinkIcon, Eye } from 'lucide-react'
import * as api from '../api/client'

type Tab = 'overview' | 'users' | 'newsletter' | 'settings'

export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])

  // Newsletter
  const [nlSubject, setNlSubject] = useState('')
  const [nlBody, setNlBody] = useState('')
  const [nlResult, setNlResult] = useState('')
  const [nlPreview, setNlPreview] = useState(false)
  const [sending, setSending] = useState(false)

  // Settings
  const [newPw, setNewPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminMsg, setAdminMsg] = useState('')

  useEffect(() => { if (api.getToken()) loadData() }, [])

  const headers = () => ({ 'Authorization': `Bearer ${api.getToken()}`, 'Content-Type': 'application/json' })

  async function loadData() {
    try {
      const sRes = await fetch('/api/admin/stats', { headers: headers() })
      if (!sRes.ok) throw new Error()
      setStats(await sRes.json())
      const uRes = await fetch('/api/admin/users?limit=100', { headers: headers() })
      setUsers(await uRes.json())
      setLoggedIn(true)
    } catch { setLoggedIn(false) }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setError('')
    try { await api.login(email, password); await loadData() }
    catch (err: any) { setError(err.message) }
  }

  async function handleSendNL() {
    if (!nlSubject || !nlBody) return
    setSending(true); setNlResult('')
    try {
      const res = await fetch('/api/admin/newsletter', { method: 'POST', headers: headers(), body: JSON.stringify({ subject: nlSubject, body: nlBody }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNlResult(`Gesendet an ${data.sent} von ${data.total} Empfaengern.`)
    } catch (err: any) { setNlResult(`Fehler: ${err.message}`) }
    finally { setSending(false) }
  }

  async function handleChangePw() {
    setPwMsg('')
    if (newPw.length < 6) { setPwMsg('Mindestens 6 Zeichen.'); return }
    try {
      const res = await fetch('/api/admin/change-password', { method: 'POST', headers: headers(), body: JSON.stringify({ newPassword: newPw }) })
      if (!res.ok) throw new Error()
      setPwMsg('Passwort geaendert.'); setNewPw('')
    } catch { setPwMsg('Fehler.') }
  }

  async function handleSetAdmin() {
    setAdminMsg('')
    if (!adminEmail) return
    try {
      const res = await fetch('/api/admin/set-admin', { method: 'POST', headers: headers(), body: JSON.stringify({ email: adminEmail, isAdmin: true }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAdminMsg(`${adminEmail} ist jetzt Admin.`); setAdminEmail(''); loadData()
    } catch (err: any) { setAdminMsg(`Fehler: ${err.message}`) }
  }

  function insertMd(tag: string) {
    const ta = document.getElementById('nl-body') as HTMLTextAreaElement
    if (!ta) return
    const s = ta.selectionStart, e = ta.selectionEnd, sel = nlBody.slice(s, e)
    let insert = ''
    if (tag === 'b') insert = `<strong>${sel || 'Text'}</strong>`
    else if (tag === 'i') insert = `<em>${sel || 'Text'}</em>`
    else if (tag === 'h') insert = `<h2>${sel || 'Ueberschrift'}</h2>`
    else if (tag === 'img') insert = `<img src="${sel || 'URL'}" style="max-width:100%;border-radius:8px;" />`
    else if (tag === 'a') insert = `<a href="${sel || 'URL'}" style="color:#D4A843;">${sel || 'Link'}</a>`
    setNlBody(nlBody.slice(0, s) + insert + nlBody.slice(e))
  }

  const card = { background: '#fff', border: '1px solid rgba(10,10,10,0.06)', borderRadius: '12px', padding: '20px' }
  const inp = { border: '1px solid rgba(10,10,10,0.1)', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#0A0A0A', background: '#fff' }
  const tabBtn = (t: Tab) => ({
    fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: tab === t ? 600 : 400,
    color: tab === t ? '#D4A843' : 'rgba(10,10,10,0.4)', background: 'none', border: 'none',
    borderBottom: tab === t ? '2px solid #D4A843' : '2px solid transparent',
    padding: '8px 16px', cursor: 'pointer',
  })

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#FAFAF8' }}>
        <form onSubmit={handleLogin} className="w-full max-w-sm p-8 rounded-2xl" style={card}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, color: '#0A0A0A', marginBottom: '1.5rem', textAlign: 'center' }}>Admin</h1>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-Mail" required className="w-full px-4 py-3 rounded-lg outline-none mb-3" style={inp} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Passwort" required className="w-full px-4 py-3 rounded-lg outline-none mb-4" style={inp} />
          {error && <p style={{ color: '#c44', fontSize: '0.78rem', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}
          <button type="submit" className="w-full py-3 rounded-lg" style={{ background: '#0A0A0A', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer' }}>Anmelden</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ background: '#FAFAF8', fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.6rem', fontWeight: 400, color: '#0A0A0A' }}>Lichtung Admin</h1>
          <button onClick={() => { api.clearToken(); setLoggedIn(false) }} className="flex items-center gap-2" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.4)', fontSize: '0.78rem' }}>
            <LogOut size={14} /> Abmelden
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-6" style={{ borderBottom: '1px solid rgba(10,10,10,0.06)' }}>
          <button style={tabBtn('overview')} onClick={() => setTab('overview')}>Uebersicht</button>
          <button style={tabBtn('users')} onClick={() => setTab('users')}>Nutzer</button>
          <button style={tabBtn('newsletter')} onClick={() => setTab('newsletter')}>Newsletter</button>
          <button style={tabBtn('settings')} onClick={() => setTab('settings')}>Einstellungen</button>
        </div>

        {/* ─── Overview ─── */}
        {tab === 'overview' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'Nutzer', value: stats.users },
              { icon: Sparkles, label: 'Lichter', value: stats.lights },
              { icon: CalendarDays, label: 'Events', value: stats.events },
              { icon: Mail, label: 'Newsletter', value: stats.newsletter },
            ].map((s, i) => (
              <div key={i} style={card}>
                <s.icon size={20} style={{ color: '#D4A843', marginBottom: '8px' }} />
                <div style={{ fontSize: '1.8rem', fontWeight: 600, color: '#0A0A0A' }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(10,10,10,0.4)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Users ─── */}
        {tab === 'users' && (
          <div>
            {/* Add Admin */}
            <div style={card} className="mb-6">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>Admin-Rechte vergeben</h3>
              <div className="flex gap-2">
                <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="E-Mail des Nutzers" className="flex-1 px-4 py-2 rounded-lg outline-none" style={inp} />
                <button onClick={handleSetAdmin} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: '#0A0A0A', color: '#fff', border: 'none', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <Shield size={14} /> Admin machen
                </button>
              </div>
              {adminMsg && <p style={{ fontSize: '0.75rem', color: adminMsg.includes('Fehler') ? '#c44' : '#D4A843', marginTop: '8px' }}>{adminMsg}</p>}
            </div>

            {/* User List */}
            <div style={card}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>Alle Nutzer ({users.length})</h3>
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(10,10,10,0.06)' }}>
                      <th style={{ textAlign: 'left', padding: '6px 8px', color: 'rgba(10,10,10,0.4)', fontWeight: 500 }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '6px 8px', color: 'rgba(10,10,10,0.4)', fontWeight: 500 }}>E-Mail</th>
                      <th style={{ textAlign: 'center', padding: '6px 8px', color: 'rgba(10,10,10,0.4)', fontWeight: 500 }}>NL</th>
                      <th style={{ textAlign: 'left', padding: '6px 8px', color: 'rgba(10,10,10,0.4)', fontWeight: 500 }}>Datum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(10,10,10,0.03)' }}>
                        <td style={{ padding: '6px 8px' }}>{u.name || '—'} {u.is_admin ? '⭐' : ''}</td>
                        <td style={{ padding: '6px 8px', color: 'rgba(10,10,10,0.5)' }}>{u.email}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center', color: u.newsletter ? '#D4A843' : 'rgba(10,10,10,0.15)' }}>{u.newsletter ? '●' : '○'}</td>
                        <td style={{ padding: '6px 8px', color: 'rgba(10,10,10,0.35)' }}>{u.created_at?.slice(0, 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── Newsletter ─── */}
        {tab === 'newsletter' && (
          <div style={card}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>Newsletter schreiben</h3>

            <input type="text" value={nlSubject} onChange={e => setNlSubject(e.target.value)} placeholder="Betreff"
              className="w-full px-4 py-3 rounded-lg outline-none mb-3" style={inp} />

            {/* Toolbar */}
            <div className="flex items-center gap-1 mb-2">
              {[
                { icon: Bold, tag: 'b', label: 'Fett' },
                { icon: Italic, tag: 'i', label: 'Kursiv' },
                { icon: Heading2, tag: 'h', label: 'Ueberschrift' },
                { icon: Image, tag: 'img', label: 'Bild' },
                { icon: LinkIcon, tag: 'a', label: 'Link' },
              ].map((t, i) => (
                <button key={i} title={t.label} onClick={() => insertMd(t.tag)} className="w-8 h-8 rounded flex items-center justify-center"
                  style={{ background: 'transparent', border: '1px solid rgba(10,10,10,0.08)', cursor: 'pointer', color: 'rgba(10,10,10,0.4)' }}>
                  <t.icon size={14} />
                </button>
              ))}
              <div className="flex-1" />
              <button onClick={() => setNlPreview(!nlPreview)} className="flex items-center gap-1 px-3 h-8 rounded"
                style={{ background: nlPreview ? 'rgba(212,168,67,0.1)' : 'transparent', border: '1px solid rgba(10,10,10,0.08)', cursor: 'pointer', color: nlPreview ? '#D4A843' : 'rgba(10,10,10,0.4)', fontSize: '0.72rem' }}>
                <Eye size={14} /> Vorschau
              </button>
            </div>

            {nlPreview ? (
              <div className="px-4 py-4 rounded-lg mb-4" style={{ background: '#FDFCF9', border: '1px solid rgba(10,10,10,0.06)', minHeight: '160px' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', lineHeight: 1.7, color: '#0A0A0A' }} dangerouslySetInnerHTML={{ __html: nlBody || '<span style="color:rgba(10,10,10,0.3)">Vorschau erscheint hier...</span>' }} />
              </div>
            ) : (
              <textarea id="nl-body" value={nlBody} onChange={e => setNlBody(e.target.value)}
                placeholder="Newsletter-Text (HTML). Nutze die Toolbar fuer Formatierung." rows={8}
                className="w-full px-4 py-3 rounded-lg outline-none resize-none mb-3"
                style={{ ...inp, fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.5 }} />
            )}

            <div className="flex items-center gap-4">
              <button onClick={handleSendNL} disabled={sending} className="flex items-center gap-2 px-6 py-3 rounded-lg"
                style={{ background: '#0A0A0A', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 500, cursor: sending ? 'wait' : 'pointer' }}>
                <Send size={16} /> {sending ? 'Wird gesendet...' : 'Senden'}
              </button>
              {nlResult && <span style={{ fontSize: '0.75rem', color: nlResult.includes('Fehler') ? '#c44' : '#D4A843' }}>{nlResult}</span>}
            </div>
          </div>
        )}

        {/* ─── Settings ─── */}
        {tab === 'settings' && (
          <div className="space-y-6">
            <div style={card}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>Passwort aendern</h3>
              <div className="flex gap-2">
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Neues Passwort (min. 6 Zeichen)" className="flex-1 px-4 py-2 rounded-lg outline-none" style={inp} />
                <button onClick={handleChangePw} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: '#0A0A0A', color: '#fff', border: 'none', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <KeyRound size={14} /> Aendern
                </button>
              </div>
              {pwMsg && <p style={{ fontSize: '0.75rem', color: pwMsg.includes('Fehler') ? '#c44' : '#D4A843', marginTop: '8px' }}>{pwMsg}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
