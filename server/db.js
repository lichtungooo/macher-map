import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'

const db = new Database('/data/lichtung.db')

// WAL mode for better concurrent reads
db.pragma('journal_mode = WAL')

// ─── Schema ───

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT DEFAULT '',
    statement TEXT DEFAULT '',
    image_path TEXT,
    newsletter INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS magic_links (
    token TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    newsletter INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS lights (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    invited_by TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    type TEXT DEFAULT 'meditation',
    recurring TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`)

// ─── Users ───

export function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email)
}

export function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id)
}

export function createUser(email, newsletter = false) {
  const id = randomUUID()
  db.prepare('INSERT INTO users (id, email, newsletter) VALUES (?, ?, ?)').run(id, email, newsletter ? 1 : 0)
  return { id, email, name: '', statement: '', newsletter }
}

export function updateUser(id, { name, statement, image_path }) {
  const fields = []
  const values = []
  if (name !== undefined) { fields.push('name = ?'); values.push(name) }
  if (statement !== undefined) { fields.push('statement = ?'); values.push(statement) }
  if (image_path !== undefined) { fields.push('image_path = ?'); values.push(image_path) }
  if (fields.length === 0) return
  values.push(id)
  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values)
}

// ─── Magic Links ───

export function createMagicLink(email, newsletter = false) {
  const token = randomUUID()
  const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min
  db.prepare('INSERT INTO magic_links (token, email, expires_at, newsletter) VALUES (?, ?, ?, ?)').run(token, email, expires_at, newsletter ? 1 : 0)
  return token
}

export function verifyMagicLink(token) {
  const row = db.prepare('SELECT * FROM magic_links WHERE token = ? AND used = 0').get(token)
  if (!row) return null
  if (new Date(row.expires_at) < new Date()) return null
  db.prepare('UPDATE magic_links SET used = 1 WHERE token = ?').run(token)
  return { email: row.email, newsletter: !!row.newsletter }
}

// ─── Lights ───

export function getAllLights() {
  return db.prepare(`
    SELECT l.id, l.lat, l.lng, l.created_at, l.invited_by,
           u.name, u.statement, u.image_path
    FROM lights l JOIN users u ON l.user_id = u.id
    ORDER BY l.created_at DESC
  `).all()
}

export function createLight(userId, lat, lng, invitedBy) {
  const id = randomUUID()
  db.prepare('INSERT INTO lights (id, user_id, lat, lng, invited_by) VALUES (?, ?, ?, ?, ?)').run(id, userId, lat, lng, invitedBy || null)
  return { id, lat, lng }
}

export function getLightCount() {
  return db.prepare('SELECT COUNT(*) as count FROM lights').get().count
}

// ─── Events ───

export function getAllEvents() {
  return db.prepare(`
    SELECT e.*, u.name as creator_name
    FROM events e JOIN users u ON e.user_id = u.id
    ORDER BY e.start_time ASC
  `).all()
}

export function createEvent(userId, { title, description, lat, lng, start_time, end_time, type, recurring }) {
  const id = randomUUID()
  db.prepare(`
    INSERT INTO events (id, user_id, title, description, lat, lng, start_time, end_time, type, recurring)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, title, description || '', lat, lng, start_time, end_time || null, type || 'meditation', recurring || null)
  return { id }
}

export default db
