import { useState, useEffect } from 'react'
import { Users, Sparkles, CalendarDays, Mail, Send, LogOut, Shield, KeyRound, Bold, Italic, Heading2, Image, Link as LinkIcon, Eye, Trees, MessageCircle, Link2, UserCheck, ShieldCheck, ImagePlus } from 'lucide-react'
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
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [newPw2, setNewPw2] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminMsg, setAdminMsg] = useState('')

  useEffect(() => { if (api.getToken()) loadData() }, [])

  const headers = () => ({ 'Authorization': `Bearer ${api.getToken()}`, 'Content-Type': 'application/json' })

  const [notAdmin, setNotAdmin] = useState(false)

  async function loadData() {
    try {
      const sRes = await fetch('/api/admin/stats', { headers: headers() })
      if (sRes.status === 403 || sRes.status === 401) {
        // Eingeloggt aber kein Admin
        const profileRes = await fetch('/api/profile', { headers: headers() })
        if (profileRes.ok) { setNotAdmin(true); setLoggedIn(false); return }
        throw new Error()
      }
      if (!sRes.ok) throw new Error()
      setStats(await sRes.json())
      const uRes = await fetch('/api/admin/users?limit=100', { headers: headers() })
      setUsers(await uRes.json())
      setLoggedIn(true)
      setNotAdmin(false)
    } catch {
      setLoggedIn(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setError(''); setNotAdmin(false)
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
    if (!currentPw) { setPwMsg('Aktuelles Passwort fehlt.'); return }
    if (newPw.length < 8) { setPwMsg('Neues Passwort muss mindestens 8 Zeichen haben.'); return }
    if (newPw !== newPw2) { setPwMsg('Die neuen Passwoerter stimmen nicht ueberein.'); return }
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fehler')
      setPwMsg('Passwort geaendert.'); setCurrentPw(''); setNewPw(''); setNewPw2('')
    } catch (err: any) { setPwMsg(err?.message || 'Fehler.') }
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

  if (notAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#FAFAF8' }}>
        <div className="w-full max-w-sm p-8 rounded-2xl text-center" style={card}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, color: '#0A0A0A', marginBottom: '0.8rem' }}>Kein Admin</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(10,10,10,0.55)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Du bist angemeldet, hast aber keine Admin-Rechte fuer dieses Panel.
          </p>
          <div className="flex gap-2">
            <button onClick={() => { api.clearToken(); setNotAdmin(false); setLoggedIn(false) }}
              className="flex-1 py-3 rounded-lg"
              style={{ background: '#0A0A0A', color: '#fff', border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', cursor: 'pointer' }}>
              Als Admin anmelden
            </button>
            <a href="/app" className="flex-1 py-3 rounded-lg flex items-center justify-center"
              style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.08)', color: '#0A0A0A', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', textDecoration: 'none' }}>
              Zurueck zur App
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#FAFAF8' }}>
        <form onSubmit={handleLogin} className="w-full max-w-sm p-8 rounded-2xl" style={card}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, color: '#0A0A0A', marginBottom: '0.3rem', textAlign: 'center' }}>Admin</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(10,10,10,0.4)', textAlign: 'center', marginBottom: '1.2rem' }}>
            Mit deiner normalen E-Mail und Passwort anmelden
          </p>
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
          <div className="space-y-6">
            {/* Menschen */}
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.4)', marginBottom: '10px' }}>Menschen</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Users, label: 'Nutzer', value: stats.users, color: '#D4A843' },
                  { icon: UserCheck, label: 'E-Mail bestaetigt', value: stats.verified, color: '#7BAE5E' },
                  { icon: ShieldCheck, label: 'Admins', value: stats.admins, color: '#6B4C8A' },
                  { icon: Mail, label: 'Newsletter', value: stats.newsletter, color: '#5078C8' },
                ].map((s, i) => (
                  <div key={i} style={card}>
                    <s.icon size={18} style={{ color: s.color, marginBottom: '8px' }} />
                    <div style={{ fontSize: '1.6rem', fontWeight: 600, color: '#0A0A0A' }}>{s.value}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(10,10,10,0.4)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inhalte */}
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.4)', marginBottom: '10px' }}>Inhalte</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Sparkles, label: 'Lichter', value: stats.lights, color: '#D4A843' },
                  { icon: Trees, label: 'Lichtungen', value: stats.lichtungen, color: '#7BAE5E' },
                  { icon: CalendarDays, label: 'Events', value: stats.events, color: '#5078C8' },
                  { icon: ImagePlus, label: 'Galerie-Bilder', value: stats.gallery_images, color: '#C9A8E0' },
                ].map((s, i) => (
                  <div key={i} style={card}>
                    <s.icon size={18} style={{ color: s.color, marginBottom: '8px' }} />
                    <div style={{ fontSize: '1.6rem', fontWeight: 600, color: '#0A0A0A' }}>{s.value}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(10,10,10,0.4)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verbindungen */}
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.4)', marginBottom: '10px' }}>Verbindungen</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Link2, label: 'Mensch-zu-Mensch', value: stats.connections, color: '#D4A843' },
                  { icon: Shield, label: 'Lichtung-Mitglieder', value: stats.lichtung_members, color: '#7BAE5E' },
                  { icon: UserCheck, label: 'Event-Teilnahmen', value: stats.event_participants, color: '#5078C8' },
                  { icon: MessageCircle, label: 'Telegram-Gruppen', value: stats.telegram_groups + stats.telegram_links, color: '#6BA3BE' },
                ].map((s, i) => (
                  <div key={i} style={card}>
                    <s.icon size={18} style={{ color: s.color, marginBottom: '8px' }} />
                    <div style={{ fontSize: '1.6rem', fontWeight: 600, color: '#0A0A0A' }}>{s.value}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(10,10,10,0.4)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* DSGVO-Hinweis */}
            <div style={{ ...card, background: 'rgba(212,168,67,0.04)', borderColor: 'rgba(212,168,67,0.2)' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0A0A0A', marginBottom: '6px' }}>
                Datenschutz
              </p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(10,10,10,0.55)', lineHeight: 1.6 }}>
                Jeder Nutzer kann sein Konto loeschen und seine Daten exportieren (im Profil unter Einstellungen).
                Bilder liegen im Volume /data/uploads, Passwoerter sind bcrypt-gehasht, alle Verbindungen sind TLS-verschluesselt.
              </p>
            </div>
          </div>
        )}

        {/* ─── Users ─── */}
        {tab === 'users' && (
          <div>
            {/* Add Admin per E-Mail */}
            <div style={card} className="mb-6">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>Admin per E-Mail hinzufuegen</h3>
              <div className="flex gap-2">
                <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="E-Mail des Nutzers" className="flex-1 px-4 py-2 rounded-lg outline-none" style={inp} />
                <button onClick={handleSetAdmin} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: '#0A0A0A', color: '#fff', border: 'none', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <Shield size={14} /> Admin machen
                </button>
              </div>
              {adminMsg && <p style={{ fontSize: '0.75rem', color: adminMsg.includes('Fehler') ? '#c44' : '#D4A843', marginTop: '8px' }}>{adminMsg}</p>}
            </div>

            {/* User List mit Aktionen */}
            <div style={card}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>Alle Nutzer ({users.length})</h3>
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(10,10,10,0.06)' }}>
                      <th style={{ textAlign: 'left', padding: '8px', color: 'rgba(10,10,10,0.4)', fontWeight: 500 }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '8px', color: 'rgba(10,10,10,0.4)', fontWeight: 500 }}>E-Mail</th>
                      <th style={{ textAlign: 'center', padding: '8px', color: 'rgba(10,10,10,0.4)', fontWeight: 500 }}>NL</th>
                      <th style={{ textAlign: 'left', padding: '8px', color: 'rgba(10,10,10,0.4)', fontWeight: 500 }}>Seit</th>
                      <th style={{ textAlign: 'right', padding: '8px', color: 'rgba(10,10,10,0.4)', fontWeight: 500 }}>Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(10,10,10,0.03)' }}>
                        <td style={{ padding: '8px' }}>
                          <div className="flex items-center gap-1.5">
                            {u.is_admin ? <Shield size={11} style={{ color: '#D4A843' }} /> : null}
                            <span>{u.name || '—'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '8px', color: 'rgba(10,10,10,0.5)' }}>{u.email}</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: u.newsletter ? '#D4A843' : 'rgba(10,10,10,0.15)' }}>{u.newsletter ? '●' : '○'}</td>
                        <td style={{ padding: '8px', color: 'rgba(10,10,10,0.35)' }}>{u.created_at?.slice(0, 10)}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={async () => {
                                const makeAdmin = !u.is_admin
                                if (!confirm(makeAdmin ? `${u.email} zum Admin machen?` : `${u.email} Admin-Rechte entziehen?`)) return
                                try {
                                  const res = await fetch('/api/admin/set-admin', { method: 'POST', headers: headers(), body: JSON.stringify({ email: u.email, isAdmin: makeAdmin }) })
                                  if (!res.ok) throw new Error()
                                  loadData()
                                } catch { alert('Fehler.') }
                              }}
                              title={u.is_admin ? 'Admin entfernen' : 'Zum Admin machen'}
                              style={{
                                background: u.is_admin ? 'rgba(212,168,67,0.12)' : 'transparent',
                                border: '1px solid rgba(10,10,10,0.08)', cursor: 'pointer',
                                padding: '4px 10px', borderRadius: '6px', fontSize: '0.68rem',
                                color: u.is_admin ? '#D4A843' : 'rgba(10,10,10,0.45)',
                                fontFamily: 'Inter, sans-serif',
                              }}>
                              {u.is_admin ? 'Admin ✓' : 'Admin'}
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Nutzer ${u.email} wirklich loeschen? Alle Inhalte (Licht, Lichtungen, Events) werden entfernt.`)) return
                                try {
                                  const res = await fetch(`/api/admin/user/${u.id}`, { method: 'DELETE', headers: headers() })
                                  const data = await res.json()
                                  if (!res.ok) throw new Error(data.error)
                                  loadData()
                                } catch (err: any) { alert(err?.message || 'Fehler.') }
                              }}
                              title="Nutzer loeschen"
                              style={{
                                background: 'transparent', border: '1px solid rgba(200,50,50,0.2)',
                                cursor: 'pointer', padding: '4px 8px', borderRadius: '6px',
                                color: '#c44', fontSize: '0.68rem', fontFamily: 'Inter, sans-serif',
                              }}>
                              Loeschen
                            </button>
                          </div>
                        </td>
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
              <div className="space-y-2">
                <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Aktuelles Passwort" className="w-full px-4 py-2 rounded-lg outline-none" style={inp} autoComplete="current-password" />
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Neues Passwort (mindestens 8 Zeichen)" className="w-full px-4 py-2 rounded-lg outline-none" style={inp} autoComplete="new-password" />
                <input type="password" value={newPw2} onChange={e => setNewPw2(e.target.value)} placeholder="Neues Passwort wiederholen" className="w-full px-4 py-2 rounded-lg outline-none" style={inp} autoComplete="new-password" />
                <button onClick={handleChangePw} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: '#0A0A0A', color: '#fff', border: 'none', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <KeyRound size={14} /> Passwort aendern
                </button>
              </div>
              {pwMsg && <p style={{ fontSize: '0.75rem', color: pwMsg.includes('geaendert') ? '#7BAE5E' : '#c44', marginTop: '8px' }}>{pwMsg}</p>}
            </div>

            <div style={{ ...card, background: 'rgba(212,168,67,0.04)', borderColor: 'rgba(212,168,67,0.2)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Sicherheitshinweis</h3>
              <p style={{ fontSize: '0.78rem', lineHeight: 1.7, color: 'rgba(10,10,10,0.6)' }}>
                Gib dein Passwort niemals per Messenger, E-Mail oder Telefon an andere weiter —
                auch nicht an uns. Ein Admin-Konto hat vollen Zugriff auf alle Nutzerdaten.
                Nutze ein eindeutiges, starkes Passwort.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
