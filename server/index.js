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
  getAllLights, createLight, getLightCount,
  getAllEvents, createEvent,
  getStats, getRecentUsers, getNewsletterEmails,
} from './db.js'
import { sendVerifyEmail, sendResetEmail, sendNewsletter } from './mail.js'

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
    if (!user || user.email !== ADMIN_EMAIL) {
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
    user: { id: user.id, email: user.email, name: user.name, statement: user.statement, image_path: user.image_path },
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
  const { name, statement } = req.body
  updateUser(req.userId, { name, statement })
  res.json({ ok: true })
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
  res.json(createLight(req.userId, lat, lng, invited_by))
})

// ─── Events ───

app.get('/api/events', (req, res) => res.json(getAllEvents()))

app.post('/api/events', auth, (req, res) => {
  res.json(createEvent(req.userId, req.body))
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

// ─── Start ───

app.listen(PORT, () => {
  console.log(`Lichtung API laeuft auf Port ${PORT}`)
})
