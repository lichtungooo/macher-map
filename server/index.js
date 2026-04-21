import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import { mkdirSync, existsSync } from 'fs'
import {
  findUserByEmail, findUserById, createUser, updateUser,
  setEmailVerified, setPassword,
  createResetToken, verifyResetToken,
  createVerifyToken, verifyEmailToken,
  getAllLights, getUserLight, createLight, getLightCount,
  getAllEvents, getEventById, updateEvent, createEvent, getGlobalEvents, deleteEvent,
  getUpcomingGlobalEvents, getDockedEvents,
  getEventCoOwners, addEventCoOwner, removeEventCoOwner, isEventCoOwner,
  joinEvent, watchEvent, leaveEvent, getEventParticipants, getEventParticipantCount, isUserParticipating, getUserEvents,
  createInviteToken, verifyInviteToken,
  getAllLichtungen, getLichtung, createLichtung, updateLichtung, deleteLichtung, getLichtungEvents,
  addLichtungMember, removeLichtungMember, setLichtungRole, getLichtungMembers, getLichtungMemberRole, getLichtungMemberCount,
  getLichtungCode, findLichtungByCode,
  getSlots, setSlot, deleteSlot, isSlotAvailable, getSlotsForDate, createTimeSlot, deleteSlotById, copyWeekSlots,
  createConnection, getConnections, getConnectionCount, getFullChain,
  getLichtungTelegramLinks, addLichtungTelegramLink, deleteLichtungTelegramLink, updateLichtungTelegramLink,
  getLichtungImages, addLichtungImage, deleteLichtungImage,
  getEventMaxParticipants,
  getStats, getRecentUsers, getNewsletterEmails, deleteUserCompletely, exportUserData,
  searchTags, ensureTag,
  setTelegramChatId, findUserByTelegramStart, updateNotifySettings, getUsersToNotifyForEvent, getUsersToNotifyForConnection,
  connectGroup, getGroupsForLichtung, getGroupByChatId, setGroupReminderInterval,
  saveMessageRef, getMessageRef, deleteMessageRef,
  getGroupsDueForReminder, markReminderSent, getUpcomingEventsForLichtung,
  getAllProjects, getProjectById, createProject, updateProject, deleteProject, setProjectImage,
  getProjectMilestones, createMilestone, updateMilestone, deleteMilestone, getProjectOwner,
} from './db.js'
import { sendVerifyEmail, sendResetEmail, sendNewsletter } from './mail.js'
import { moonPhasesBetween } from './moonphases.js'
import { sendTelegramMessage, deleteTelegramMessage, formatEventMessage, formatUpcomingEvents } from './telegram.js'

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'lichtung-dev-secret-change-in-prod'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'frieden@lichtung.ooo'

const UPLOAD_DIR = '/data/uploads'
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true })

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      const ext = file.originalname.split('.').pop()
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Nur Bilder erlaubt'))
  },
})

app.use(cors())
app.use(express.json())
app.use('/api/uploads', express.static(UPLOAD_DIR))

// ─── Auth Middleware ───

function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Nicht angemeldet' })
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET)
    req.userId = payload.userId
    next()
  } catch {
    res.status(401).json({ error: 'Token ungueltig' })
  }
}

function adminAuth(req, res, next) {
  auth(req, res, () => {
    const user = findUserById(req.userId)
    if (!user || (!user.is_admin && user.email !== ADMIN_EMAIL)) {
      return res.status(403).json({ error: 'Kein Zugriff' })
    }
    next()
  })
}

// ─── Auth: Register ───

app.post('/api/auth/register', async (req, res) => {
  const { email, password, newsletter } = req.body
  if (!email || !password) return res.status(400).json({ error: 'E-Mail und Passwort erforderlich' })
  if (password.length < 6) return res.status(400).json({ error: 'Passwort muss mindestens 6 Zeichen haben' })

  const existing = findUserByEmail(email)
  if (existing) return res.status(400).json({ error: 'Diese E-Mail ist bereits registriert' })

  const hash = await bcrypt.hash(password, 10)
  const user = createUser(email, hash, !!newsletter)

  // Send verification email (non-blocking)
  const token = createVerifyToken(email)
  sendVerifyEmail(email, token).catch(err => console.error('Verify-Mail:', err.message))

  const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })
  res.json({ token: jwtToken, user: { id: user.id, email, name: '', statement: '' } })
})

// ─── Auth: Login ───

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'E-Mail und Passwort erforderlich' })

  const user = findUserByEmail(email)
  if (!user) return res.status(400).json({ error: 'E-Mail oder Passwort falsch' })

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return res.status(400).json({ error: 'E-Mail oder Passwort falsch' })

  const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })
  res.json({
    token: jwtToken,
    user: { id: user.id, email: user.email, name: user.name, statement: user.statement, image_path: user.image_path, is_admin: user.is_admin },
  })
})

// ─── Auth: Verify Email ───

app.get('/api/auth/verify-email', (req, res) => {
  const { token } = req.query
  if (!token) return res.status(400).json({ error: 'Token fehlt' })
  const email = verifyEmailToken(token)
  if (!email) return res.status(400).json({ error: 'Link ungueltig oder abgelaufen' })
  setEmailVerified(email)
  res.json({ ok: true })
})

// ─── Auth: Forgot Password ───

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'E-Mail fehlt' })

  const user = findUserByEmail(email)
  if (!user) return res.json({ ok: true }) // Don't reveal if email exists

  const token = createResetToken(email)
  try {
    await sendResetEmail(email, token)
  } catch (err) {
    console.error('Reset-Mail:', err.message)
  }
  res.json({ ok: true })
})

// ─── Auth: Reset Password ───

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body
  if (!token || !password) return res.status(400).json({ error: 'Token und Passwort erforderlich' })
  if (password.length < 6) return res.status(400).json({ error: 'Passwort muss mindestens 6 Zeichen haben' })

  const email = verifyResetToken(token)
  if (!email) return res.status(400).json({ error: 'Link ungueltig oder abgelaufen' })

  const hash = await bcrypt.hash(password, 10)
  setPassword(email, hash)
  res.json({ ok: true })
})

// ─── Profile ───

app.get('/api/profile', auth, (req, res) => {
  const user = findUserById(req.userId)
  if (!user) return res.status(404).json({ error: 'Nutzer nicht gefunden' })
  const { password_hash, ...safe } = user
  res.json(safe)
})

app.put('/api/profile', auth, (req, res) => {
  const { name, statement, bio, telegram } = req.body
  const fields = {}
  if (name !== undefined) fields.name = name
  if (statement !== undefined) fields.statement = statement
  if (bio !== undefined) fields.bio = bio
  if (telegram !== undefined) fields.telegram = telegram
  updateUser(req.userId, fields)
  res.json({ ok: true })
})

app.delete('/api/profile', auth, (req, res) => {
  deleteUserCompletely(req.userId)
  res.json({ ok: true })
})

app.get('/api/profile/export', auth, (req, res) => {
  const data = exportUserData(req.userId)
  res.setHeader('Content-Disposition', 'attachment; filename="lichtung-meine-daten.json"')
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(data, null, 2))
})

app.post('/api/profile/image', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Kein Bild' })
  const image_path = `/api/uploads/${req.file.filename}`
  updateUser(req.userId, { image_path })
  res.json({ image_path })
})

// ─── Lights ───

app.get('/api/lights', (req, res) => res.json(getAllLights()))
app.get('/api/lights/count', (req, res) => res.json({ count: getLightCount() }))

app.post('/api/lights', auth, (req, res) => {
  const { lat, lng, invited_by } = req.body
  if (lat == null || lng == null) return res.status(400).json({ error: 'Position fehlt' })
  // createLight loescht automatisch das alte Licht des Users
  const light = createLight(req.userId, lat, lng, invited_by)

  // Telegram: Einladenden benachrichtigen bei neuer Verbindung
  if (invited_by && invited_by !== req.userId) {
    const toNotify = getUsersToNotifyForConnection(invited_by)
    const newUser = findUserById(req.userId)
    for (const u of toNotify) {
      sendTelegramMessage(u.telegram_chat_id, `🔗 <b>Neue Verbindung!</b>\n\n<b>${newUser?.name || 'Jemand'}</b> ist durch dich auf die Karte gekommen.\n\n👉 lichtung.ooo/app`)
    }
  }

  res.json(light)
})

// ─── Events ───

app.get('/api/events', (req, res) => {
  const events = getAllEvents()
  const enriched = events.map(e => ({
    ...e,
    participant_count: getEventParticipantCount(e.id),
  }))
  res.json(enriched)
})

app.get('/api/events/global', (req, res) => res.json(getGlobalEvents()))
app.get('/api/events/global/upcoming', (req, res) => res.json(getUpcomingGlobalEvents()))
app.get('/api/events/:id/docked', (req, res) => res.json(getDockedEvents(req.params.id)))

// Admin: Globale Events erstellen
app.post('/api/admin/global-events', adminAuth, (req, res) => {
  const { title, description, start_time, end_time, wave_mode, tags, recurring, image_path } = req.body
  if (!title || !start_time) return res.status(400).json({ error: 'Titel und Startzeit erforderlich' })
  if (!['simultaneous', 'timezone_wave'].includes(wave_mode)) return res.status(400).json({ error: 'wave_mode muss simultaneous oder timezone_wave sein' })
  // Globale Events haben Position = (0,0) als Platzhalter, sie werden nicht auf der Karte angezeigt
  const result = createEvent(req.userId, {
    title, description: description || '',
    lat: 0, lng: 0,
    start_time, end_time: end_time || null,
    type: 'meditation',
    recurring: recurring || null,
    is_global: 1,
    image_path: image_path || null,
    tags: tags || '',
    wave_mode,
  })
  res.json(result)
})

app.delete('/api/admin/global-events/:id', adminAuth, (req, res) => {
  const event = getEventById(req.params.id)
  if (!event || !event.is_global) return res.status(404).json({ error: 'Nicht gefunden' })
  deleteEvent(req.params.id)
  res.json({ ok: true })
})

// Mondphasen (on-the-fly berechnet, kein DB-Eintrag)
app.get('/api/moon-phases', (req, res) => {
  // Standard: 2 Monate zurueck + N Monate voraus (damit aktueller Monat sicher drin ist)
  const from = req.query.from
    ? new Date(String(req.query.from))
    : new Date(Date.now() - 60 * 86400000)
  const months = Math.min(Number(req.query.months) || 12, 120)
  const to = req.query.to
    ? new Date(String(req.query.to))
    : new Date(Date.now() + months * 30.5 * 86400000)
  const phases = moonPhasesBetween(from, to)
  res.json(phases.map(p => ({ type: p.type, time: p.date.toISOString() })))
})

// Event an globales Event andocken (Lichtung-Besitzer)
app.post('/api/events/:id/dock', auth, (req, res) => {
  const event = getEventById(req.params.id)
  if (!event) return res.status(404).json({ error: 'Event nicht gefunden' })
  if (event.user_id !== req.userId && !isEventCoOwner(req.params.id, req.userId)) {
    return res.status(403).json({ error: 'Nur der Ersteller kann andocken' })
  }
  const { global_event_id } = req.body
  if (global_event_id) {
    const global = getEventById(global_event_id)
    if (!global || !global.is_global) return res.status(400).json({ error: 'Kein globales Event' })
  }
  updateEvent(req.params.id, { docked_to_event_id: global_event_id || null })
  res.json({ ok: true })
})

app.post('/api/events', auth, (req, res) => {
  // Slot-Verfuegbarkeit pruefen wenn an Lichtung gebunden
  if (req.body.lichtung_id && req.body.start_time) {
    const date = req.body.start_time.slice(0, 10)
    const check = isSlotAvailable(req.body.lichtung_id, date)
    if (!check.available) return res.status(400).json({ error: check.reason })
  }
  // Admin-Berechtigung pruefen wenn an Lichtung gebunden
  if (req.body.lichtung_id) {
    const role = getLichtungMemberRole(req.body.lichtung_id, req.userId)
    if (role !== 'owner' && role !== 'admin') {
      return res.status(403).json({ error: 'Nur Admins dieses Ortes koennen hier Termine erstellen.' })
    }
  }
  const newEvent = createEvent(req.userId, req.body)

  const fullEvent = getEventById(newEvent.id)

  // Telegram: Nutzer im Umkreis
  if (req.body.lat && req.body.lng) {
    const toNotify = getUsersToNotifyForEvent(req.body.lat, req.body.lng)
    for (const u of toNotify) {
      if (u.id === req.userId) continue
      sendTelegramMessage(u.telegram_chat_id, formatEventMessage(fullEvent || req.body, 'new'))
    }
  }

  // Telegram: Verbundene Gruppen der Lichtung
  if (req.body.lichtung_id) {
    const groups = getGroupsForLichtung(req.body.lichtung_id)
    for (const g of groups) {
      sendTelegramMessage(g.chat_id, formatEventMessage(fullEvent || req.body, 'new')).then(msgId => {
        if (msgId) saveMessageRef(g.chat_id, msgId, newEvent.id)
      })
    }
  }

  res.json(newEvent)
})

app.put('/api/events/:id', auth, (req, res) => {
  const event = getEventById(req.params.id)
  if (!event) return res.status(404).json({ error: 'Event nicht gefunden' })
  const isOwner = event.user_id === req.userId
  const isCoOwner = isEventCoOwner(req.params.id, req.userId)
  if (!isOwner && !isCoOwner) return res.status(403).json({ error: 'Nur der Ersteller oder Mitverantwortliche koennen bearbeiten' })

  const { title, description, start_time, end_time, type, recurring, tags, max_participants } = req.body
  const fields = {}
  if (title !== undefined) fields.title = title
  if (description !== undefined) fields.description = description
  if (start_time !== undefined) fields.start_time = start_time
  if (end_time !== undefined) fields.end_time = end_time
  if (type !== undefined) fields.type = type
  if (recurring !== undefined) fields.recurring = recurring
  if (tags !== undefined) fields.tags = tags
  if (max_participants !== undefined) fields.max_participants = max_participants

  updateEvent(req.params.id, fields)

  // Teilnehmer per Mail benachrichtigen
  const participants = getEventParticipants(req.params.id)
  if (participants.length > 0) {
    const updatedEvent = getEventById(req.params.id)
    const subject = `Aenderung: ${updatedEvent.title} — Lichtung`
    const bodyHtml = `
      <p style="font-size: 16px; color: #0A0A0A;">Die Veranstaltung <strong>${updatedEvent.title}</strong> wurde aktualisiert.</p>
      <p style="font-size: 14px; color: rgba(10,10,10,0.55);">Neuer Termin: ${updatedEvent.start_time ? new Date(updatedEvent.start_time).toLocaleString('de-DE') : 'unveraendert'}</p>
      <a href="${process.env.BASE_URL || 'https://lichtung.ooo'}/app" style="display: inline-block; padding: 12px 28px; background: #0A0A0A; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; margin-top: 16px;">Zur Karte</a>
    `
    sendNewsletter(participants, subject, bodyHtml).catch(err => console.error('Event-Mail-Fehler:', err))
  }

  // Telegram: Gruppen updaten (alten Post loeschen, neuen senden)
  if (updatedEvent.lichtung_id) {
    const groups = getGroupsForLichtung(updatedEvent.lichtung_id)
    for (const g of groups) {
      const oldMsg = getMessageRef(g.chat_id, req.params.id)
      if (oldMsg) {
        deleteTelegramMessage(g.chat_id, oldMsg.message_id)
        deleteMessageRef(g.chat_id, req.params.id)
      }
      sendTelegramMessage(g.chat_id, formatEventMessage(updatedEvent, 'update')).then(msgId => {
        if (msgId) saveMessageRef(g.chat_id, msgId, req.params.id)
      })
    }
  }

  res.json({ ok: true })
})

app.delete('/api/events/:id', auth, (req, res) => {
  const event = getEventById(req.params.id)
  if (!event) return res.status(404).json({ error: 'Event nicht gefunden' })
  // Ersteller oder Admin der Lichtung darf loeschen
  let canDelete = event.user_id === req.userId
  if (!canDelete && event.lichtung_id) {
    const role = getLichtungMemberRole(event.lichtung_id, req.userId)
    canDelete = role === 'owner' || role === 'admin'
  }
  if (!canDelete) return res.status(403).json({ error: 'Keine Berechtigung zum Loeschen.' })

  // Teilnehmer benachrichtigen
  const participants = getEventParticipants(req.params.id)
  const reason = req.query.reason || req.body?.reason || ''
  if (participants.length > 0) {
    const subject = `Abgesagt: ${event.title} — Lichtung`
    const bodyHtml = `<p style="font-size: 16px; color: #0A0A0A;">Die Veranstaltung <strong>${event.title}</strong> wurde leider abgesagt.</p>${reason ? `<p style="font-size: 14px; color: rgba(10,10,10,0.55); margin-top: 12px;"><em>${reason}</em></p>` : ''}`
    sendNewsletter(participants, subject, bodyHtml).catch(err => console.error('Event-Mail-Fehler:', err))
  }

  // Telegram: Absage an Gruppen
  if (event.lichtung_id) {
    const groups = getGroupsForLichtung(event.lichtung_id)
    for (const g of groups) {
      const oldMsg = getMessageRef(g.chat_id, req.params.id)
      if (oldMsg) {
        deleteTelegramMessage(g.chat_id, oldMsg.message_id)
        deleteMessageRef(g.chat_id, req.params.id)
      }
      const cancelMsg = formatEventMessage(event, 'cancel') + (reason ? `\n\n<em>${reason}</em>` : '')
      sendTelegramMessage(g.chat_id, cancelMsg)
    }
  }

  deleteEvent(req.params.id)
  res.json({ ok: true })
})

app.get('/api/events/:id/participants', (req, res) => {
  res.json(getEventParticipants(req.params.id))
})

// ─── Event Co-Owner ───

app.get('/api/events/:id/co-owners', (req, res) => {
  res.json(getEventCoOwners(req.params.id))
})

app.post('/api/events/:id/co-owners', auth, (req, res) => {
  const event = getEventById(req.params.id)
  if (!event) return res.status(404).json({ error: 'Event nicht gefunden' })
  if (event.user_id !== req.userId) return res.status(403).json({ error: 'Nur der Ersteller kann Mitverantwortliche hinzufuegen.' })
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'E-Mail fehlt' })
  const user = findUserByEmail(email)
  if (!user) return res.status(404).json({ error: 'Nutzer mit dieser E-Mail nicht gefunden.' })
  if (user.id === event.user_id) return res.status(400).json({ error: 'Der Ersteller ist bereits Owner.' })
  addEventCoOwner(req.params.id, user.id)
  res.json({ ok: true })
})

app.delete('/api/events/:id/co-owners/:userId', auth, (req, res) => {
  const event = getEventById(req.params.id)
  if (!event) return res.status(404).json({ error: 'Event nicht gefunden' })
  if (event.user_id !== req.userId) return res.status(403).json({ error: 'Nur der Ersteller kann Mitverantwortliche entfernen.' })
  removeEventCoOwner(req.params.id, req.params.userId)
  res.json({ ok: true })
})

app.post('/api/events/:id/join', auth, (req, res) => {
  const max = getEventMaxParticipants(req.params.id)
  if (max) {
    const count = getEventParticipantCount(req.params.id)
    if (count >= max) {
      return res.status(400).json({ error: 'Leider ausgebucht. Alle Plaetze sind vergeben.' })
    }
  }
  joinEvent(req.params.id, req.userId)
  res.json({ ok: true, count: getEventParticipantCount(req.params.id) })
})

app.post('/api/events/:id/leave', auth, (req, res) => {
  leaveEvent(req.params.id, req.userId)
  res.json({ ok: true, count: getEventParticipantCount(req.params.id) })
})

app.post('/api/events/:id/watch', auth, (req, res) => {
  watchEvent(req.params.id, req.userId)
  res.json({ ok: true, count: getEventParticipantCount(req.params.id) })
})

app.get('/api/events/:id/status', auth, (req, res) => {
  res.json({
    status: isUserParticipating(req.params.id, req.userId), // 'joined', 'watching', or null
    count: getEventParticipantCount(req.params.id),
  })
})

// Persoenliche Events
app.get('/api/my/events', auth, (req, res) => {
  res.json(getUserEvents(req.userId))
})

// Kalender-Abo-Token (1 Jahr gueltig)
app.get('/api/my/cal-token', auth, (req, res) => {
  const calToken = jwt.sign({ userId: req.userId }, JWT_SECRET, { expiresIn: '365d' })
  res.json({ url: `${process.env.BASE_URL || 'https://lichtung.ooo'}/api/cal/${calToken}.ics` })
})

// iCal-Abo-URL — Token in Query statt Header, damit Kalender-Apps es abonnieren koennen
app.get('/api/cal/:token.ics', (req, res) => {
  let userId
  try {
    const payload = jwt.verify(req.params.token, JWT_SECRET)
    userId = payload.userId
  } catch {
    return res.status(401).send('Token ungueltig')
  }
  const events = getUserEvents(userId)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lichtung//Lichtung//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Lichtung',
  ]
  for (const e of events) {
    const start = e.start_time.replace(/[-:]/g, '').replace('T', 'T').split('.')[0] + 'Z'
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${e.id}@lichtung.ooo`)
    lines.push(`DTSTART:${start}`)
    if (e.end_time) {
      const end = e.end_time.replace(/[-:]/g, '').replace('T', 'T').split('.')[0] + 'Z'
      lines.push(`DTEND:${end}`)
    }
    lines.push(`SUMMARY:${e.title}`)
    if (e.description) lines.push(`DESCRIPTION:${e.description.replace(/\n/g, '\\n')}`)
    lines.push(`LOCATION:${e.lat},${e.lng}`)
    lines.push(`URL:https://lichtung.ooo/app`)
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="lichtung-termine.ics"')
  res.send(lines.join('\r\n'))
})

// ─── Lichtungen (Orte) ───

app.get('/api/lichtungen', (req, res) => {
  const all = getAllLichtungen()
  res.json(all.map(l => ({ ...l, member_count: getLichtungMemberCount(l.id) })))
})

app.get('/api/lichtungen/:id', (req, res) => {
  const l = getLichtung(req.params.id)
  if (!l) return res.status(404).json({ error: 'Nicht gefunden' })
  res.json(l)
})

app.get('/api/lichtungen/:id/events', (req, res) => {
  const events = getLichtungEvents(req.params.id)
  const enriched = events.map(e => ({
    ...e,
    participant_count: getEventParticipantCount(e.id),
  }))
  res.json(enriched)
})

// iCal fuer Lichtung — oeffentlich, kein Auth noetig
app.get('/api/lichtungen/:id/cal.ics', (req, res) => {
  const l = getLichtung(req.params.id)
  if (!l) return res.status(404).send('Nicht gefunden')
  const events = getLichtungEvents(req.params.id)
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0',
    `PRODID:-//Lichtung//${l.name}//DE`,
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    `X-WR-CALNAME:${l.name}`,
  ]
  for (const e of events) {
    const start = e.start_time.replace(/[-:]/g, '').split('.')[0] + 'Z'
    lines.push('BEGIN:VEVENT', `UID:${e.id}@lichtung.ooo`, `DTSTART:${start}`)
    if (e.end_time) lines.push(`DTEND:${e.end_time.replace(/[-:]/g, '').split('.')[0]}Z`)
    lines.push(`SUMMARY:${e.title}`)
    if (e.description) lines.push(`DESCRIPTION:${e.description.replace(/\n/g, '\\n')}`)
    lines.push(`LOCATION:${l.name}`, `URL:https://lichtung.ooo/app`, 'END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
  res.send(lines.join('\r\n'))
})

app.post('/api/lichtungen', auth, (req, res) => {
  res.json(createLichtung(req.userId, req.body))
})

app.put('/api/lichtungen/:id', auth, (req, res) => {
  const role = getLichtungMemberRole(req.params.id, req.userId)
  if (role !== 'owner' && role !== 'admin') return res.status(403).json({ error: 'Nur Hueter/Gaertner.' })
  const { name, description, lat, lng, tags } = req.body
  const fields = {}
  if (name !== undefined) fields.name = name
  if (description !== undefined) fields.description = description
  if (lat !== undefined) fields.lat = lat
  if (lng !== undefined) fields.lng = lng
  if (tags !== undefined) fields.tags = tags
  updateLichtung(req.params.id, fields)
  res.json({ ok: true })
})

app.delete('/api/lichtungen/:id', auth, (req, res) => {
  const role = getLichtungMemberRole(req.params.id, req.userId)
  if (role !== 'owner') return res.status(403).json({ error: 'Nur der Hueter darf die Lichtung loeschen.' })
  deleteLichtung(req.params.id)
  res.json({ ok: true })
})

app.post('/api/lichtungen/:id/image', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Kein Bild' })
  const image_path = `/api/uploads/${req.file.filename}`
  updateLichtung(req.params.id, { image_path })
  res.json({ image_path })
})

// ─── Lichtung Galerie ───

app.get('/api/lichtungen/:id/gallery', (req, res) => {
  res.json(getLichtungImages(req.params.id))
})

app.post('/api/lichtungen/:id/gallery', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Kein Bild' })
  const caption = req.body.caption || ''
  const result = addLichtungImage(req.params.id, req.userId, req.file.filename, caption)
  res.json({ ...result, path: `/api/uploads/${req.file.filename}` })
})

app.delete('/api/lichtungen/:id/gallery/:imageId', auth, (req, res) => {
  const filename = deleteLichtungImage(req.params.imageId, req.userId)
  if (!filename) return res.status(403).json({ error: 'Keine Berechtigung' })
  res.json({ ok: true })
})

// ─── Lichtung Telegram Links ───

app.get('/api/lichtungen/:id/telegram', (req, res) => {
  const links = getLichtungTelegramLinks(req.params.id)
  // Pruefen ob User Mitglied ist
  let isMember = false
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(authHeader.slice(7), JWT_SECRET)
      const role = getLichtungMemberRole(req.params.id, payload.userId)
      if (role) isMember = true
    } catch {}
  }
  // Private Gruppen nur fuer Mitglieder sichtbar — URL wird fuer Nicht-Mitglieder entfernt
  const filtered = links.map(l => {
    if (l.is_private && !isMember) {
      return { ...l, url: null, locked: true }
    }
    return l
  })
  res.json(filtered)
})

app.post('/api/lichtungen/:id/telegram', auth, (req, res) => {
  const role = getLichtungMemberRole(req.params.id, req.userId)
  if (role !== 'owner' && role !== 'admin') return res.status(403).json({ error: 'Nur Hueter/Gaertner.' })
  const { label, url, is_private } = req.body
  if (!label || !url) return res.status(400).json({ error: 'Name und URL noetig.' })
  res.json(addLichtungTelegramLink(req.params.id, label, url, is_private))
})

app.delete('/api/lichtungen/:id/telegram/:linkId', auth, (req, res) => {
  const role = getLichtungMemberRole(req.params.id, req.userId)
  if (role !== 'owner' && role !== 'admin') return res.status(403).json({ error: 'Nur Admins.' })
  deleteLichtungTelegramLink(req.params.linkId)
  res.json({ ok: true })
})

app.put('/api/lichtungen/:id/telegram/:linkId', auth, (req, res) => {
  const role = getLichtungMemberRole(req.params.id, req.userId)
  if (role !== 'owner' && role !== 'admin') return res.status(403).json({ error: 'Nur Hueter/Gaertner.' })
  const { label, url, is_private } = req.body
  updateLichtungTelegramLink(req.params.linkId, label, url, is_private)
  res.json({ ok: true })
})

// ─── Verbindungen ───

app.get('/api/connections', auth, (req, res) => {
  res.json(getConnections(req.userId))
})

app.get('/api/connections/count', auth, (req, res) => {
  res.json({ count: getConnectionCount(req.userId) })
})

app.get('/api/chain', auth, (req, res) => {
  res.json(getFullChain(req.userId))
})

// Telegram-Kontakt setzen
app.put('/api/profile/telegram', auth, (req, res) => {
  const { telegram } = req.body
  updateUser(req.userId, { telegram: telegram || '' })
  res.json({ ok: true })
})

// ─── Lichtung Verfuegbarkeit ───

app.get('/api/lichtungen/:id/slots', (req, res) => {
  const from = req.query.from || new Date().toISOString().slice(0, 10)
  const to = req.query.to || new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10)
  res.json(getSlots(req.params.id, from, to))
})

app.get('/api/lichtungen/:id/available/:date', (req, res) => {
  res.json(isSlotAvailable(req.params.id, req.params.date))
})

app.put('/api/lichtungen/:id/slots/:date', auth, (req, res) => {
  const role = getLichtungMemberRole(req.params.id, req.userId)
  if (role !== 'owner' && role !== 'admin') return res.status(403).json({ error: 'Nur Hueter/Gaertner koennen Slots verwalten.' })
  const { status, max_events, note } = req.body
  setSlot(req.params.id, req.params.date, status || 'open', max_events, note, req.userId)
  res.json({ ok: true })
})

// Stunden-Slots fuer einen Tag abrufen
app.get('/api/lichtungen/:id/slots/:date', (req, res) => {
  res.json(getSlotsForDate(req.params.id, req.params.date))
})

// Neuen Zeit-Slot anlegen (Hueter/Gaertner)
app.post('/api/lichtungen/:id/slots/:date', auth, (req, res) => {
  const role = getLichtungMemberRole(req.params.id, req.userId)
  if (role !== 'owner' && role !== 'admin') return res.status(403).json({ error: 'Nur Hueter oder Gaertner koennen Slots setzen.' })
  res.json(createTimeSlot(req.params.id, req.params.date, req.body, req.userId))
})

// Aktuelle Woche auf naechste N Wochen kopieren (Hueter)
app.post('/api/lichtungen/:id/slots/repeat-week', auth, (req, res) => {
  const role = getLichtungMemberRole(req.params.id, req.userId)
  if (role !== 'owner') return res.status(403).json({ error: 'Nur der Hueter kann Wochen uebertragen.' })
  const { weekStart, weeks } = req.body
  if (!weekStart || !weeks) return res.status(400).json({ error: 'weekStart und weeks erforderlich' })
  const n = Math.min(Math.max(1, Number(weeks)), 52)
  const copied = copyWeekSlots(req.params.id, weekStart, n, req.userId)
  res.json({ copied, weeks: n })
})

// Zeit-Slot loeschen
app.delete('/api/lichtungen/:id/slot/:slotId', auth, (req, res) => {
  const role = getLichtungMemberRole(req.params.id, req.userId)
  if (role !== 'owner') return res.status(403).json({ error: 'Nur der Hueter.' })
  deleteSlotById(req.params.slotId)
  res.json({ ok: true })
})

app.delete('/api/lichtungen/:id/slots/:date', auth, (req, res) => {
  const role = getLichtungMemberRole(req.params.id, req.userId)
  if (role !== 'owner' && role !== 'admin') return res.status(403).json({ error: 'Nur Admins.' })
  deleteSlot(req.params.id, req.params.date)
  res.json({ ok: true })
})

// ─── Lichtung Mitglieder + Rollen ───

app.get('/api/lichtungen/:id/members', (req, res) => {
  res.json(getLichtungMembers(req.params.id))
})

app.get('/api/lichtungen/:id/my-role', auth, (req, res) => {
  res.json({ role: getLichtungMemberRole(req.params.id, req.userId) })
})

// Per QR-Code beitreten — mit optionalem Bringer (Buergschaft)
app.post('/api/lichtungen/join/:code', auth, (req, res) => {
  const lichtungId = findLichtungByCode(req.params.code)
  if (!lichtungId) return res.status(404).json({ error: 'Unbekannter Code.' })
  const existing = getLichtungMemberRole(lichtungId, req.userId)
  if (!existing) {
    addLichtungMember(lichtungId, req.userId, 'member')
    // Buergschaft: wer den Link geteilt hat -> Verbindung Mensch-zu-Mensch
    const inviter = req.body?.invitedBy
    if (inviter && inviter !== req.userId) {
      createConnection(req.userId, inviter)
    }
  }
  const l = getLichtung(lichtungId)
  res.json({ lichtung_id: lichtungId, name: l?.name, role: existing || 'member' })
})

// QR-Code abrufen — fuer alle Mitglieder, mit eigenem Bringer-Tag
app.get('/api/lichtungen/:id/code', auth, (req, res) => {
  const role = getLichtungMemberRole(req.params.id, req.userId)
  if (!role) return res.status(403).json({ error: 'Nur Mitglieder.' })
  const code = getLichtungCode(req.params.id)
  // URL mit Bringer-Info — wer einlaedt, wird Buerge
  const url = `${process.env.BASE_URL || 'https://lichtung.ooo'}/app?place=${code}&by=${req.userId}`
  res.json({ code, url, role })
})

// Rolle aendern (nur Owner)
app.put('/api/lichtungen/:id/members/:userId/role', auth, (req, res) => {
  const myRole = getLichtungMemberRole(req.params.id, req.userId)
  if (myRole !== 'owner') return res.status(403).json({ error: 'Nur der Hueter.' })
  const { role } = req.body
  if (!['owner', 'admin', 'member'].includes(role)) return res.status(400).json({ error: 'Ungueltige Rolle.' })
  setLichtungRole(req.params.id, req.params.userId, role)
  res.json({ ok: true })
})

// Mitglied entfernen (nur Owner/Admin)
app.delete('/api/lichtungen/:id/members/:userId', auth, (req, res) => {
  const myRole = getLichtungMemberRole(req.params.id, req.userId)
  if (myRole !== 'owner' && myRole !== 'admin') return res.status(403).json({ error: 'Nur Admins.' })
  removeLichtungMember(req.params.id, req.params.userId)
  res.json({ ok: true })
})

// ─── Invite Token (60s gueltig) ───

app.post('/api/invite/create', auth, (req, res) => {
  const token = createInviteToken(req.userId)
  const url = `${process.env.BASE_URL || 'https://lichtung.ooo'}/app?invite=${token}`
  res.json({ token, url, expires_in: 60 })
})

app.get('/api/invite/verify/:token', (req, res) => {
  const userId = verifyInviteToken(req.params.token)
  if (!userId) return res.status(400).json({ error: 'Link abgelaufen oder ungueltig.' })
  res.json({ invited_by: userId })
})

// ─── Admin: Dashboard ───

app.get('/api/admin/stats', adminAuth, (req, res) => {
  res.json(getStats())
})

app.get('/api/admin/users', adminAuth, (req, res) => {
  const limit = parseInt(req.query.limit) || 50
  res.json(getRecentUsers(limit))
})

app.post('/api/admin/newsletter', adminAuth, async (req, res) => {
  const { subject, body } = req.body
  if (!subject || !body) return res.status(400).json({ error: 'Betreff und Text erforderlich' })

  const recipients = getNewsletterEmails()
  const sent = await sendNewsletter(recipients, subject, body)
  res.json({ sent, total: recipients.length })
})

// ─── Invite OG-Tags (fuer QR-Code-Scanner Vorschau) ───

app.get('/api/invite-page', (req, res) => {
  const { id, name } = req.query
  const inviterName = name || 'Ein Mensch'
  const ogImage = `${process.env.BASE_URL || 'https://lichtung.ooo'}/og-invite.png`
  const appUrl = `${process.env.BASE_URL || 'https://lichtung.ooo'}/invite?id=${id || ''}&name=${encodeURIComponent(inviterName)}`

  res.setHeader('Content-Type', 'text/html')
  res.send(`<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lichtung — ${inviterName} laedt dich ein</title>
  <meta property="og:title" content="Lichtung — Dein Licht fuer den Frieden">
  <meta property="og:description" content="${inviterName} laedt dich ein, dein Licht fuer den Frieden zu entzuenden.">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:url" content="${appUrl}">
  <meta property="og:type" content="website">
  <meta name="description" content="${inviterName} laedt dich ein, dein Licht fuer den Frieden zu entzuenden.">
  <meta http-equiv="refresh" content="0;url=${appUrl}">
</head>
<body style="font-family: Georgia, serif; text-align: center; padding: 60px 20px; background: #FDFCF9; color: #0A0A0A;">
  <p style="font-size: 28px; letter-spacing: 0.15em;">Lichtung</p>
  <p style="font-size: 14px; color: rgba(10,10,10,0.45); font-style: italic; margin-top: 4px;">Dein Licht fuer den Frieden</p>
  <p style="font-size: 16px; color: rgba(10,10,10,0.5); font-style: italic; margin-top: 28px;">${inviterName} laedt dich ein, dein Licht zu entzuenden.</p>
  <p><a href="${appUrl}" style="color: #D4A843;">Weiter zur Karte</a></p>
</body>
</html>`)
})

// ─── Public Profile (fuer Einladungsseite) ───

app.get('/api/user/:id/public', (req, res) => {
  const user = findUserById(req.params.id)
  if (!user) return res.status(404).json({ error: 'Nicht gefunden' })
  res.json({ name: user.name || 'Ein Mensch', image_path: user.image_path || null })
})

// ─── Admin: User Management ───

app.post('/api/admin/set-admin', adminAuth, (req, res) => {
  const { email, isAdmin } = req.body
  if (!email) return res.status(400).json({ error: 'E-Mail fehlt' })
  const user = findUserByEmail(email)
  if (!user) return res.status(404).json({ error: 'Nutzer nicht gefunden' })
  updateUser(user.id, { is_admin: isAdmin ? 1 : 0 })
  res.json({ ok: true })
})

app.post('/api/admin/change-password', adminAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!newPassword || newPassword.length < 8) return res.status(400).json({ error: 'Neues Passwort muss mindestens 8 Zeichen haben' })
  if (!currentPassword) return res.status(400).json({ error: 'Aktuelles Passwort erforderlich' })
  const user = findUserById(req.userId)
  if (!user) return res.status(404).json({ error: 'Nutzer nicht gefunden' })
  const valid = await bcrypt.compare(currentPassword, user.password_hash)
  if (!valid) return res.status(400).json({ error: 'Aktuelles Passwort ist falsch' })
  const hash = await bcrypt.hash(newPassword, 10)
  setPassword(user.email, hash)
  res.json({ ok: true })
})

app.delete('/api/admin/user/:userId', adminAuth, (req, res) => {
  const { userId } = req.params
  if (userId === req.userId) return res.status(400).json({ error: 'Du kannst dich nicht selbst loeschen.' })
  const user = findUserById(userId)
  if (!user) return res.status(404).json({ error: 'Nutzer nicht gefunden' })
  deleteUserCompletely(userId)
  res.json({ ok: true })
})

// ─── Telegram Bot Webhook ───

app.post('/api/telegram/webhook', (req, res) => {
  const msg = req.body?.message
  if (!msg) return res.json({ ok: true })

  const chatId = msg.chat?.id
  const chatType = msg.chat?.type // 'private', 'group', 'supergroup', 'channel'
  const chatTitle = msg.chat?.title || ''
  const text = msg.text || ''
  const isGroup = chatType === 'group' || chatType === 'supergroup' || chatType === 'channel'

  // ─── Private Messages ───
  if (!isGroup) {
    if (text.startsWith('/start')) {
      const userId = text.replace('/start', '').trim()
      if (userId) {
        const user = findUserByTelegramStart(userId)
        if (user) {
          setTelegramChatId(userId, String(chatId))
          sendTelegramMessage(chatId, `✨ <b>Willkommen bei Lichtung!</b>\n\nDu bist jetzt verbunden als <b>${user.name || 'Anonym'}</b>.\n\nDu erhaeltst Benachrichtigungen ueber:\n• Neue Veranstaltungen in deiner Naehe\n• Neue Verbindungen in deiner Kette\n• Neuigkeiten deiner Lichtungen\n\nEinstellungen: lichtung.ooo`)
        } else {
          sendTelegramMessage(chatId, 'Verbindung fehlgeschlagen. Bitte ueber lichtung.ooo erneut versuchen.')
        }
      } else {
        sendTelegramMessage(chatId, '✨ <b>Lichtung</b>\n\nVerbinde dich ueber dein Profil auf lichtung.ooo mit diesem Bot.')
      }
    } else if (text === '/status') {
      sendTelegramMessage(chatId, '🔗 Bot aktiv. Einstellungen auf lichtung.ooo.')
    }
  }

  // ─── Group/Channel Commands ───
  if (isGroup) {
    if (text.startsWith('/connect')) {
      const code = text.replace('/connect', '').replace('@lichtungsbot', '').trim()
      if (!code) {
        sendTelegramMessage(chatId, '💡 Nutzung: <code>/connect CODE</code>\n\nDen Code findest du auf der Lichtungs-Detailseite auf lichtung.ooo.')
        return res.json({ ok: true })
      }
      const lichtung = findLichtungByCode(code)
      if (!lichtung) {
        sendTelegramMessage(chatId, '❌ Lichtung nicht gefunden. Pruefe den Code.')
        return res.json({ ok: true })
      }
      connectGroup(chatId, chatTitle, lichtung.id, msg.from?.id ? String(msg.from.id) : null)
      sendTelegramMessage(chatId, `✅ <b>Verbunden!</b>\n\nDiese Gruppe ist jetzt mit <b>${lichtung.name}</b> verbunden.\n\nNeue Veranstaltungen werden automatisch hier gepostet.\n\nErinnerungen setzen: <code>/remind daily</code>, <code>/remind 3days</code> oder <code>/remind weekly</code>`)
    }

    if (text.startsWith('/events')) {
      const group = getGroupByChatId(chatId)
      if (!group?.lichtung_id) {
        sendTelegramMessage(chatId, 'Keine Lichtung verbunden. Nutze <code>/connect CODE</code>.')
        return res.json({ ok: true })
      }
      const events = getUpcomingEventsForLichtung(group.lichtung_id, 10)
      const lichtung = getLichtung(group.lichtung_id)
      sendTelegramMessage(chatId, formatUpcomingEvents(events, lichtung?.name || 'Lichtung'))
    }

    if (text.startsWith('/remind')) {
      const interval = text.replace('/remind', '').replace('@lichtungsbot', '').trim().toLowerCase()
      const valid = ['none', 'daily', '3days', 'weekly']
      if (!valid.includes(interval)) {
        sendTelegramMessage(chatId, `⏰ Erinnerungs-Intervall setzen:\n\n<code>/remind daily</code> — taeglich\n<code>/remind 3days</code> — alle 3 Tage\n<code>/remind weekly</code> — woechentlich\n<code>/remind none</code> — aus`)
        return res.json({ ok: true })
      }
      setGroupReminderInterval(String(chatId), interval)
      const labels = { none: 'deaktiviert', daily: 'taeglich', '3days': 'alle 3 Tage', weekly: 'woechentlich' }
      sendTelegramMessage(chatId, `⏰ Erinnerungen: <b>${labels[interval]}</b>`)
    }

    if (text === '/status') {
      const group = getGroupByChatId(chatId)
      if (group?.lichtung_id) {
        const lichtung = getLichtung(group.lichtung_id)
        const labels = { none: 'aus', daily: 'taeglich', '3days': 'alle 3 Tage', weekly: 'woechentlich' }
        sendTelegramMessage(chatId, `🔗 Verbunden mit: <b>${lichtung?.name || '?'}</b>\n⏰ Erinnerungen: ${labels[group.reminder_interval] || 'aus'}`)
      } else {
        sendTelegramMessage(chatId, 'Keine Lichtung verbunden. Nutze <code>/connect CODE</code>.')
      }
    }
  }

  res.json({ ok: true })
})

// ─── Notification Settings ───

app.get('/api/notify/settings', auth, (req, res) => {
  const user = findUserById(req.userId)
  res.json({
    telegram_connected: !!user.telegram_chat_id,
    notify_new_connection: !!user.notify_new_connection,
    notify_new_event: !!user.notify_new_event,
    notify_radius: user.notify_radius || 50,
    notify_lichtung: !!user.notify_lichtung,
  })
})

app.put('/api/notify/settings', auth, (req, res) => {
  updateNotifySettings(req.userId, req.body)
  res.json({ ok: true })
})

app.get('/api/notify/telegram-link', auth, (req, res) => {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'LichtungFriedenBot'
  res.json({ url: `https://t.me/${botUsername}?start=${req.userId}` })
})

// ─── Tags ───

app.get('/api/tags', (req, res) => {
  const { q } = req.query
  res.json(searchTags(q || ''))
})

// ─── Start ───

// ─── Erinnerungs-Scheduler (alle 30 Minuten) ───

async function runReminders() {
  try {
    const groups = getGroupsDueForReminder()
    for (const g of groups) {
      if (!g.lichtung_id) continue
      const events = getUpcomingEventsForLichtung(g.lichtung_id, 5)
      if (events.length === 0) continue

      // Alten Erinnerungs-Post loeschen
      const oldMsg = getMessageRef(g.chat_id, `reminder-${g.lichtung_id}`)
      if (oldMsg) {
        await deleteTelegramMessage(g.chat_id, oldMsg.message_id)
        deleteMessageRef(g.chat_id, `reminder-${g.lichtung_id}`)
      }

      // Neuen Erinnerungs-Post senden
      const msgId = await sendTelegramMessage(g.chat_id, formatUpcomingEvents(events, g.lichtung_name || 'Lichtung'))
      if (msgId) saveMessageRef(g.chat_id, msgId, `reminder-${g.lichtung_id}`, 'reminder')
      markReminderSent(g.chat_id)
    }
  } catch (err) {
    console.error('Reminder-Fehler:', err.message)
  }
}

setInterval(runReminders, 30 * 60 * 1000) // alle 30 Min
setTimeout(runReminders, 10000) // 10 Sek nach Start

// ─── Projekte ───

app.get('/api/projects', (req, res) => {
  res.json(getAllProjects())
})

app.get('/api/projects/:id', (req, res) => {
  const p = getProjectById(req.params.id)
  if (!p) return res.status(404).json({ error: 'Projekt nicht gefunden' })
  const milestones = getProjectMilestones(req.params.id)
  res.json({ ...p, milestones })
})

app.post('/api/projects', auth, (req, res) => {
  const { title, description, lat, lng, lichtung_id, tags, goal_amount, opencollective_url, video_url } = req.body
  if (!title || lat == null || lng == null) return res.status(400).json({ error: 'Titel und Position noetig' })
  const p = createProject(req.userId, { title, description, lat, lng, lichtung_id, tags, goal_amount, opencollective_url, video_url })
  res.json(p)
})

app.put('/api/projects/:id', auth, (req, res) => {
  const owner = getProjectOwner(req.params.id)
  if (!owner) return res.status(404).json({ error: 'Projekt nicht gefunden' })
  const user = findUserById(req.userId)
  if (owner !== req.userId && !user?.is_admin) return res.status(403).json({ error: 'Keine Berechtigung' })
  const updated = updateProject(req.params.id, req.body)
  res.json(updated)
})

app.delete('/api/projects/:id', auth, (req, res) => {
  const owner = getProjectOwner(req.params.id)
  if (!owner) return res.status(404).json({ error: 'Projekt nicht gefunden' })
  const user = findUserById(req.userId)
  if (owner !== req.userId && !user?.is_admin) return res.status(403).json({ error: 'Keine Berechtigung' })
  deleteProject(req.params.id)
  res.json({ ok: true })
})

app.post('/api/projects/:id/image', auth, upload.single('image'), (req, res) => {
  const owner = getProjectOwner(req.params.id)
  if (!owner) return res.status(404).json({ error: 'Projekt nicht gefunden' })
  const user = findUserById(req.userId)
  if (owner !== req.userId && !user?.is_admin) return res.status(403).json({ error: 'Keine Berechtigung' })
  if (!req.file) return res.status(400).json({ error: 'Kein Bild' })
  const imagePath = `/api/uploads/${req.file.filename}`
  setProjectImage(req.params.id, imagePath)
  res.json({ image_path: imagePath })
})

// ─── Meilensteine ───

app.get('/api/projects/:id/milestones', (req, res) => {
  res.json(getProjectMilestones(req.params.id))
})

app.post('/api/projects/:id/milestones', auth, (req, res) => {
  const owner = getProjectOwner(req.params.id)
  if (!owner) return res.status(404).json({ error: 'Projekt nicht gefunden' })
  const user = findUserById(req.userId)
  if (owner !== req.userId && !user?.is_admin) return res.status(403).json({ error: 'Keine Berechtigung' })
  const m = createMilestone(req.params.id, req.body)
  res.json(m)
})

app.put('/api/projects/:id/milestones/:mid', auth, (req, res) => {
  const owner = getProjectOwner(req.params.id)
  if (!owner) return res.status(404).json({ error: 'Projekt nicht gefunden' })
  const user = findUserById(req.userId)
  if (owner !== req.userId && !user?.is_admin) return res.status(403).json({ error: 'Keine Berechtigung' })
  const m = updateMilestone(req.params.mid, req.body)
  res.json(m)
})

app.delete('/api/projects/:id/milestones/:mid', auth, (req, res) => {
  const owner = getProjectOwner(req.params.id)
  if (!owner) return res.status(404).json({ error: 'Projekt nicht gefunden' })
  const user = findUserById(req.userId)
  if (owner !== req.userId && !user?.is_admin) return res.status(403).json({ error: 'Keine Berechtigung' })
  deleteMilestone(req.params.mid)
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`Lichtung API laeuft auf Port ${PORT}`)
})
