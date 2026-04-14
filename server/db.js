import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'

const db = new Database('/data/lichtung.db')
db.pragma('journal_mode = WAL')

// ─── Schema ───

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT DEFAULT '',
    statement TEXT DEFAULT '',
    image_path TEXT,
    newsletter INTEGER DEFAULT 0,
    email_verified INTEGER DEFAULT 0,
    is_admin INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reset_tokens (
    token TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS verify_tokens (
    token TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0
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
    is_global INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
`)

// Migration: add columns if missing
try { db.exec('ALTER TABLE users ADD COLUMN password_hash TEXT DEFAULT ""') } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0') } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0') } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN newsletter INTEGER DEFAULT 0') } catch {}
try { db.exec('ALTER TABLE events ADD COLUMN is_global INTEGER DEFAULT 0') } catch {}

// ─── Users ───

export function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email)
}

export function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id)
}

export function createUser(email, passwordHash, newsletter = false) {
  const id = randomUUID()
  db.prepare('INSERT INTO users (id, email, password_hash, newsletter) VALUES (?, ?, ?, ?)').run(id, email, passwordHash, newsletter ? 1 : 0)
  return { id, email, name: '', statement: '' }
}

export function updateUser(id, fields) {
  const sets = []
  const vals = []
  for (const [key, val] of Object.entries(fields)) {
    if (val !== undefined) { sets.push(`${key} = ?`); vals.push(val) }
  }
  if (sets.length === 0) return
  vals.push(id)
  db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...vals)
}

export function setEmailVerified(email) {
  db.prepare('UPDATE users SET email_verified = 1 WHERE email = ?').run(email)
}

export function setPassword(email, passwordHash) {
  db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(passwordHash, email)
}

// ─── Tokens (Reset + Verify) ───

export function createResetToken(email) {
  const token = randomUUID()
  const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 Stunde
  db.prepare('INSERT INTO reset_tokens (token, email, expires_at) VALUES (?, ?, ?)').run(token, email, expires_at)
  return token
}

export function verifyResetToken(token) {
  const row = db.prepare('SELECT * FROM reset_tokens WHERE token = ? AND used = 0').get(token)
  if (!row || new Date(row.expires_at) < new Date()) return null
  db.prepare('UPDATE reset_tokens SET used = 1 WHERE token = ?').run(token)
  return row.email
}

export function createVerifyToken(email) {
  const token = randomUUID()
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 Tage
  db.prepare('INSERT INTO verify_tokens (token, email, expires_at) VALUES (?, ?, ?)').run(token, email, expires_at)
  return token
}

export function verifyEmailToken(token) {
  const row = db.prepare('SELECT * FROM verify_tokens WHERE token = ? AND used = 0').get(token)
  if (!row || new Date(row.expires_at) < new Date()) return null
  db.prepare('UPDATE verify_tokens SET used = 1 WHERE token = ?').run(token)
  return row.email
}

// ─── Admin ───

export function getUserCount() {
  return db.prepare('SELECT COUNT(*) as count FROM users').get().count
}

export function getRecentUsers(limit = 20) {
  return db.prepare('SELECT id, email, name, newsletter, email_verified, created_at FROM users ORDER BY created_at DESC LIMIT ?').all(limit)
}

export function getNewsletterEmails() {
  return db.prepare('SELECT email, name FROM users WHERE newsletter = 1').all()
}

export function getStats() {
  const users = db.prepare('SELECT COUNT(*) as c FROM users').get().c
  const lights = db.prepare('SELECT COUNT(*) as c FROM lights').get().c
  const events = db.prepare('SELECT COUNT(*) as c FROM events').get().c
  const newsletter = db.prepare('SELECT COUNT(*) as c FROM users WHERE newsletter = 1').get().c
  return { users, lights, events, newsletter }
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

export function getUserLight(userId) {
  return db.prepare('SELECT * FROM lights WHERE user_id = ?').get(userId)
}

export function createLight(userId, lat, lng, invitedBy) {
  // Jeder Mensch hat genau ein Licht — altes loeschen, neues setzen
  db.prepare('DELETE FROM lights WHERE user_id = ?').run(userId)
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

export function createEvent(userId, { title, description, lat, lng, start_time, end_time, type, recurring, is_global }) {
  const id = randomUUID()
  db.prepare(`
    INSERT INTO events (id, user_id, title, description, lat, lng, start_time, end_time, type, recurring, is_global)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, title, description || '', lat, lng, start_time, end_time || null, type || 'meditation', recurring || null, is_global ? 1 : 0)
  return { id }
}

export function getGlobalEvents() {
  return db.prepare(`
    SELECT e.*, u.name as creator_name
    FROM events e JOIN users u ON e.user_id = u.id
    WHERE e.is_global = 1
    ORDER BY e.start_time ASC
  `).all()
}

export function deleteEvent(eventId) {
  db.prepare('DELETE FROM events WHERE id = ?').run(eventId)
}

export default db
