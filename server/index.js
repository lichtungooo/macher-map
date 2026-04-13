import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import { mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import {
  findUserByEmail, findUserById, createUser, updateUser,
  createMagicLink, verifyMagicLink,
  getAllLights, createLight, getLightCount,
  getAllEvents, createEvent,
} from './db.js'
import { sendMagicLink } from './mail.js'

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'lichtung-dev-secret-change-in-prod'

// Uploads directory
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Nur Bilder erlaubt'))
  },
})

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(UPLOAD_DIR))

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

// ─── Auth Routes ───

app.post('/api/auth/magic-link', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'E-Mail fehlt' })

  const token = createMagicLink(email)

  try {
    await sendMagicLink(email, token)
    res.json({ ok: true })
  } catch (err) {
    console.error('Mail-Fehler:', err.message)
    res.status(500).json({ error: 'Mail konnte nicht gesendet werden' })
  }
})

app.get('/api/auth/verify', (req, res) => {
  const { token } = req.query
  if (!token) return res.status(400).json({ error: 'Token fehlt' })

  const email = verifyMagicLink(token)
  if (!email) return res.status(400).json({ error: 'Link ungueltig oder abgelaufen' })

  let user = findUserByEmail(email)
  if (!user) user = createUser(email)

  const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })
  res.json({ token: jwtToken, user: { id: user.id, email: user.email, name: user.name, statement: user.statement, image_path: user.image_path } })
})

// ─── Profile Routes ───

app.get('/api/profile', auth, (req, res) => {
  const user = findUserById(req.userId)
  if (!user) return res.status(404).json({ error: 'Nutzer nicht gefunden' })
  res.json(user)
})

app.put('/api/profile', auth, (req, res) => {
  const { name, statement } = req.body
  updateUser(req.userId, { name, statement })
  res.json({ ok: true })
})

app.post('/api/profile/image', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Kein Bild' })
  const image_path = `/uploads/${req.file.filename}`
  updateUser(req.userId, { image_path })
  res.json({ image_path })
})

// ─── Light Routes ───

app.get('/api/lights', (req, res) => {
  res.json(getAllLights())
})

app.get('/api/lights/count', (req, res) => {
  res.json({ count: getLightCount() })
})

app.post('/api/lights', auth, (req, res) => {
  const { lat, lng, invited_by } = req.body
  if (lat == null || lng == null) return res.status(400).json({ error: 'Position fehlt' })
  const light = createLight(req.userId, lat, lng, invited_by)
  res.json(light)
})

// ─── Event Routes ───

app.get('/api/events', (req, res) => {
  res.json(getAllEvents())
})

app.post('/api/events', auth, (req, res) => {
  const event = createEvent(req.userId, req.body)
  res.json(event)
})

// ─── Start ───

app.listen(PORT, () => {
  console.log(`Lichtung API laeuft auf Port ${PORT}`)
})
