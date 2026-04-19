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

  CREATE TABLE IF NOT EXISTS lichtungen (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    image_path TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lichtung_members (
    lichtung_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (lichtung_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS lichtung_telegram_links (
    id TEXT PRIMARY KEY,
    lichtung_id TEXT NOT NULL,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS connections (
    user_a TEXT NOT NULL,
    user_b TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_a, user_b)
  );

  CREATE TABLE IF NOT EXISTS lichtung_slots (
    id TEXT PRIMARY KEY,
    lichtung_id TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    max_events INTEGER DEFAULT 1,
    note TEXT DEFAULT '',
    created_by TEXT,
    start_hour INTEGER,
    end_hour INTEGER,
    parallel_slots INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS lichtung_codes (
    lichtung_id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS invite_tokens (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS event_participants (
    event_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    status TEXT DEFAULT 'joined',
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (event_id, user_id)
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
try { db.exec('ALTER TABLE event_participants ADD COLUMN status TEXT DEFAULT "joined"') } catch {}
try { db.exec('ALTER TABLE events ADD COLUMN lichtung_id TEXT') } catch {}
try { db.exec('ALTER TABLE events ADD COLUMN max_participants INTEGER') } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN telegram TEXT') } catch {}
try { db.exec('ALTER TABLE lichtung_slots ADD COLUMN start_hour INTEGER') } catch {}
try { db.exec('ALTER TABLE lichtung_slots ADD COLUMN end_hour INTEGER') } catch {}
try { db.exec('ALTER TABLE lichtung_slots ADD COLUMN parallel_slots INTEGER DEFAULT 1') } catch {}
try { db.exec('ALTER TABLE lichtung_telegram_links ADD COLUMN is_private INTEGER DEFAULT 0') } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN bio TEXT DEFAULT ""') } catch {}
try { db.exec('ALTER TABLE events ADD COLUMN image_path TEXT') } catch {}
try { db.exec('ALTER TABLE events ADD COLUMN tags TEXT DEFAULT ""') } catch {}
try { db.exec('ALTER TABLE lichtungen ADD COLUMN tags TEXT DEFAULT ""') } catch {}
try { db.exec('ALTER TABLE events ADD COLUMN wave_mode TEXT') } catch {}
try { db.exec('ALTER TABLE events ADD COLUMN docked_to_event_id TEXT') } catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS event_co_owners (
    event_id TEXT NOT NULL REFERENCES events(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (event_id, user_id)
  );
`)

// Migration: alte /uploads/ → /api/uploads/ (Traefik routet nur /api/*)
try { db.prepare("UPDATE lichtungen SET image_path = '/api' || image_path WHERE image_path LIKE '/uploads/%'").run() } catch {}
try { db.prepare("UPDATE users SET image_path = '/api' || image_path WHERE image_path LIKE '/uploads/%'").run() } catch {}
try { db.prepare("UPDATE events SET image_path = '/api' || image_path WHERE image_path LIKE '/uploads/%'").run() } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN telegram_chat_id TEXT') } catch {}

// ─── Telegram Gruppen ───

db.exec(`
  CREATE TABLE IF NOT EXISTS telegram_groups (
    id TEXT PRIMARY KEY,
    chat_id TEXT UNIQUE NOT NULL,
    chat_title TEXT DEFAULT '',
    lichtung_id TEXT,
    reminder_interval TEXT DEFAULT 'none',
    last_reminder_at TEXT,
    connected_by TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS telegram_messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    message_id INTEGER NOT NULL,
    event_id TEXT,
    type TEXT DEFAULT 'event',
    created_at TEXT DEFAULT (datetime('now'))
  )
`)
try { db.exec('ALTER TABLE users ADD COLUMN notify_new_connection INTEGER DEFAULT 1') } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN notify_new_event INTEGER DEFAULT 1') } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN notify_radius INTEGER DEFAULT 50') } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN notify_lichtung INTEGER DEFAULT 1') } catch {}

// ─── Tags ───

db.exec(`
  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 0
  )
`)

// Vorbefuellte Tags
const defaultTags = ['meditation', 'gebet', 'stille', 'begegnung', 'tanz', 'fest', 'musik', 'natur', 'yoga', 'feuer', 'gesang', 'wald', 'wasser', 'vollmond', 'neumond', 'frieden', 'liebe', 'heilung', 'gemeinschaft', 'kunst']
for (const tag of defaultTags) {
  try { db.prepare('INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)').run(randomUUID(), tag) } catch {}
}

// ─── Telegram Notifications ───

export function setTelegramChatId(userId, chatId) {
  db.prepare('UPDATE users SET telegram_chat_id = ? WHERE id = ?').run(chatId, userId)
}

export function findUserByTelegramStart(startParam) {
  // startParam ist die userId
  return findUserById(startParam)
}

export function updateNotifySettings(userId, settings) {
  const fields = {}
  if (settings.notify_new_connection !== undefined) fields.notify_new_connection = settings.notify_new_connection ? 1 : 0
  if (settings.notify_new_event !== undefined) fields.notify_new_event = settings.notify_new_event ? 1 : 0
  if (settings.notify_radius !== undefined) fields.notify_radius = settings.notify_radius
  if (settings.notify_lichtung !== undefined) fields.notify_lichtung = settings.notify_lichtung ? 1 : 0
  updateUser(userId, fields)
}

export function getUsersToNotifyForEvent(lat, lng) {
  // Alle User mit Telegram-chat_id die Event-Benachrichtigungen aktiviert haben
  const users = db.prepare(`
    SELECT u.id, u.telegram_chat_id, u.notify_radius, l.lat as light_lat, l.lng as light_lng
    FROM users u LEFT JOIN lights l ON l.user_id = u.id
    WHERE u.telegram_chat_id IS NOT NULL AND u.notify_new_event = 1
  `).all()

  return users.filter(u => {
    if (!u.light_lat || !u.light_lng) return false
    // Haversine-Distanz
    const R = 6371
    const dLat = (lat - u.light_lat) * Math.PI / 180
    const dLng = (lng - u.light_lng) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(u.light_lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return dist <= (u.notify_radius || 50)
  })
}

export function getUsersToNotifyForConnection(userId) {
  // Den User selbst benachrichtigen wenn jemand in seine Kette kommt
  return db.prepare(`
    SELECT id, telegram_chat_id FROM users
    WHERE id = ? AND telegram_chat_id IS NOT NULL AND notify_new_connection = 1
  `).all(userId)
}

// ─── Telegram Gruppen DB ───

export function connectGroup(chatId, chatTitle, lichtungId, connectedBy) {
  const existing = db.prepare('SELECT * FROM telegram_groups WHERE chat_id = ?').get(String(chatId))
  if (existing) {
    db.prepare('UPDATE telegram_groups SET lichtung_id = ?, chat_title = ? WHERE chat_id = ?').run(lichtungId, chatTitle, String(chatId))
    return existing.id
  }
  const id = randomUUID()
  db.prepare('INSERT INTO telegram_groups (id, chat_id, chat_title, lichtung_id, connected_by) VALUES (?, ?, ?, ?, ?)').run(id, String(chatId), chatTitle, lichtungId, connectedBy)
  return id
}

export function getGroupsForLichtung(lichtungId) {
  return db.prepare('SELECT * FROM telegram_groups WHERE lichtung_id = ?').all(lichtungId)
}

export function getGroupByChatId(chatId) {
  return db.prepare('SELECT * FROM telegram_groups WHERE chat_id = ?').get(String(chatId))
}

export function setGroupReminderInterval(chatId, interval) {
  db.prepare('UPDATE telegram_groups SET reminder_interval = ? WHERE chat_id = ?').run(interval, String(chatId))
}

export function saveMessageRef(chatId, messageId, eventId, type = 'event') {
  const id = randomUUID()
  db.prepare('INSERT INTO telegram_messages (id, chat_id, message_id, event_id, type) VALUES (?, ?, ?, ?, ?)').run(id, String(chatId), messageId, eventId, type)
}

export function getMessageRef(chatId, eventId) {
  return db.prepare('SELECT * FROM telegram_messages WHERE chat_id = ? AND event_id = ? ORDER BY created_at DESC LIMIT 1').get(String(chatId), eventId)
}

export function deleteMessageRef(chatId, eventId) {
  db.prepare('DELETE FROM telegram_messages WHERE chat_id = ? AND event_id = ?').run(String(chatId), eventId)
}

export function getGroupsDueForReminder() {
  const now = new Date()
  return db.prepare(`
    SELECT g.*, l.name as lichtung_name
    FROM telegram_groups g LEFT JOIN lichtungen l ON g.lichtung_id = l.id
    WHERE g.reminder_interval != 'none' AND g.lichtung_id IS NOT NULL
  `).all().filter(g => {
    if (!g.last_reminder_at) return true
    const last = new Date(g.last_reminder_at)
    const hours = (now.getTime() - last.getTime()) / (1000 * 60 * 60)
    if (g.reminder_interval === 'daily') return hours >= 24
    if (g.reminder_interval === '3days') return hours >= 72
    if (g.reminder_interval === 'weekly') return hours >= 168
    return false
  })
}

export function markReminderSent(chatId) {
  db.prepare('UPDATE telegram_groups SET last_reminder_at = datetime("now") WHERE chat_id = ?').run(String(chatId))
}

export function getUpcomingEventsForLichtung(lichtungId, limit = 5) {
  return db.prepare(`
    SELECT e.*, u.name as creator_name
    FROM events e JOIN users u ON e.user_id = u.id
    WHERE e.lichtung_id = ? AND e.start_time > datetime('now')
    ORDER BY e.start_time ASC LIMIT ?
  `).all(lichtungId, limit)
}

export function searchTags(query) {
  if (!query) return db.prepare('SELECT name FROM tags ORDER BY usage_count DESC, name ASC LIMIT 20').all()
  return db.prepare('SELECT name FROM tags WHERE name LIKE ? ORDER BY usage_count DESC, name ASC LIMIT 15').all(`${query}%`)
}

export function ensureTag(name) {
  const clean = name.toLowerCase().replace(/[^a-zäöüß0-9]/g, '')
  if (!clean) return null
  const existing = db.prepare('SELECT name FROM tags WHERE name = ?').get(clean)
  if (existing) {
    db.prepare('UPDATE tags SET usage_count = usage_count + 1 WHERE name = ?').run(clean)
    return clean
  }
  db.prepare('INSERT INTO tags (id, name, usage_count) VALUES (?, ?, 1)').run(randomUUID(), clean)
  return clean
}

// Galerie-Tabelle
db.exec(`
  CREATE TABLE IF NOT EXISTS lichtung_images (
    id TEXT PRIMARY KEY,
    lichtung_id TEXT NOT NULL REFERENCES lichtungen(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    filename TEXT NOT NULL,
    caption TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  )
`)

// Migration: bestehende Lichtungen ohne Owner-Member -> Ersteller als Owner setzen
try {
  const lichtungen = db.prepare('SELECT id, user_id FROM lichtungen').all()
  for (const l of lichtungen) {
    const exists = db.prepare('SELECT 1 FROM lichtung_members WHERE lichtung_id = ? AND user_id = ?').get(l.id, l.user_id)
    if (!exists) {
      db.prepare('INSERT INTO lichtung_members (lichtung_id, user_id, role) VALUES (?, ?, ?)').run(l.id, l.user_id, 'owner')
    }
    const codeExists = db.prepare('SELECT 1 FROM lichtung_codes WHERE lichtung_id = ?').get(l.id)
    if (!codeExists) {
      const code = randomUUID().slice(0, 8)
      db.prepare('INSERT INTO lichtung_codes (lichtung_id, code) VALUES (?, ?)').run(l.id, code)
    }
  }
} catch (err) { console.error('Lichtung-Migration fehlgeschlagen:', err.message) }

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
  const count = (table, where = '') => db.prepare(`SELECT COUNT(*) as c FROM ${table}${where ? ' WHERE ' + where : ''}`).get().c
  return {
    users: count('users'),
    lights: count('lights'),
    events: count('events'),
    lichtungen: count('lichtungen'),
    lichtung_members: count('lichtung_members'),
    telegram_links: count('lichtung_telegram_links'),
    telegram_groups: count('telegram_groups'),
    gallery_images: count('lichtung_images'),
    event_participants: count('event_participants'),
    connections: count('connections'),
    newsletter: count('users', 'newsletter = 1'),
    verified: count('users', 'email_verified = 1'),
    admins: count('users', 'is_admin = 1'),
  }
}

export function deleteUserCompletely(userId) {
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM lights WHERE user_id = ?').run(userId)
    db.prepare('DELETE FROM connections WHERE user_a = ? OR user_b = ?').run(userId, userId)
    db.prepare('DELETE FROM event_participants WHERE user_id = ?').run(userId)
    db.prepare('DELETE FROM lichtung_members WHERE user_id = ?').run(userId)
    db.prepare('DELETE FROM lichtung_images WHERE user_id = ?').run(userId)
    db.prepare('DELETE FROM events WHERE user_id = ?').run(userId)
    db.prepare('DELETE FROM lichtungen WHERE user_id = ?').run(userId)
    db.prepare('DELETE FROM users WHERE id = ?').run(userId)
  })
  tx()
}

export function exportUserData(userId) {
  return {
    profile: db.prepare('SELECT id, email, name, statement, bio, image_path, telegram, newsletter, email_verified, created_at FROM users WHERE id = ?').get(userId),
    light: db.prepare('SELECT id, lat, lng, invited_by, created_at FROM lights WHERE user_id = ?').get(userId),
    lichtungen: db.prepare('SELECT id, name, description, lat, lng, tags, created_at FROM lichtungen WHERE user_id = ?').all(userId),
    events: db.prepare('SELECT id, title, description, lat, lng, start_time, end_time, type, tags, created_at FROM events WHERE user_id = ?').all(userId),
    event_participations: db.prepare('SELECT event_id, status, created_at FROM event_participants WHERE user_id = ?').all(userId),
    memberships: db.prepare('SELECT lichtung_id, role, created_at FROM lichtung_members WHERE user_id = ?').all(userId),
    connections: db.prepare('SELECT user_a, user_b, created_at FROM connections WHERE user_a = ? OR user_b = ?').all(userId, userId),
    exported_at: new Date().toISOString(),
  }
}

// ─── Lights ───

export function getAllLights() {
  return db.prepare(`
    SELECT l.id, l.user_id, l.lat, l.lng, l.created_at, l.invited_by,
           u.name, u.statement, u.bio, u.image_path, u.telegram
    FROM lights l JOIN users u ON l.user_id = u.id
    ORDER BY l.created_at DESC
  `).all()
}

export function getUserLight(userId) {
  return db.prepare('SELECT * FROM lights WHERE user_id = ?').get(userId)
}

export function createLight(userId, lat, lng, invitedBy) {
  db.prepare('DELETE FROM lights WHERE user_id = ?').run(userId)
  const id = randomUUID()
  db.prepare('INSERT INTO lights (id, user_id, lat, lng, invited_by) VALUES (?, ?, ?, ?, ?)').run(id, userId, lat, lng, invitedBy || null)
  // Verbindung erstellen wenn eingeladen
  if (invitedBy && invitedBy !== userId) {
    const [a, b] = [userId, invitedBy].sort()
    db.prepare('INSERT OR IGNORE INTO connections (user_a, user_b) VALUES (?, ?)').run(a, b)
  }
  return { id, lat, lng }
}

export function getLightCount() {
  return db.prepare('SELECT COUNT(*) as count FROM lights').get().count
}

// ─── Events ───

export function getEventById(id) {
  return db.prepare('SELECT * FROM events WHERE id = ?').get(id)
}

// ─── Event Co-Owner ───

export function getEventCoOwners(eventId) {
  return db.prepare(`
    SELECT u.id, u.name, u.email, u.image_path, o.created_at
    FROM event_co_owners o JOIN users u ON o.user_id = u.id
    WHERE o.event_id = ? ORDER BY o.created_at
  `).all(eventId)
}

export function addEventCoOwner(eventId, userId) {
  db.prepare('INSERT OR IGNORE INTO event_co_owners (event_id, user_id) VALUES (?, ?)').run(eventId, userId)
}

export function removeEventCoOwner(eventId, userId) {
  db.prepare('DELETE FROM event_co_owners WHERE event_id = ? AND user_id = ?').run(eventId, userId)
}

export function isEventCoOwner(eventId, userId) {
  return !!db.prepare('SELECT 1 FROM event_co_owners WHERE event_id = ? AND user_id = ?').get(eventId, userId)
}

export function updateEvent(id, fields) {
  const sets = []
  const vals = []
  for (const [key, val] of Object.entries(fields)) {
    if (val !== undefined) { sets.push(`${key} = ?`); vals.push(val) }
  }
  if (sets.length === 0) return
  vals.push(id)
  db.prepare(`UPDATE events SET ${sets.join(', ')} WHERE id = ?`).run(...vals)
}

export function getAllEvents() {
  return db.prepare(`
    SELECT e.*, u.name as creator_name, u.image_path as creator_image,
      (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id AND status = 'joined') as participant_count
    FROM events e JOIN users u ON e.user_id = u.id
    ORDER BY e.start_time ASC
  `).all()
}

export function createEvent(userId, { title, description, lat, lng, start_time, end_time, type, recurring, is_global, image_path, tags, wave_mode, docked_to_event_id }) {
  const id = randomUUID()
  db.prepare(`
    INSERT INTO events (id, user_id, title, description, lat, lng, start_time, end_time, type, recurring, is_global, image_path, tags, wave_mode, docked_to_event_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, title, description || '', lat, lng, start_time, end_time || null, type || 'meditation', recurring || null, is_global ? 1 : 0, image_path || null, tags || '', wave_mode || null, docked_to_event_id || null)
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

export function getUpcomingGlobalEvents() {
  const now = new Date().toISOString()
  return db.prepare(`
    SELECT e.*, u.name as creator_name,
      (SELECT COUNT(*) FROM events d WHERE d.docked_to_event_id = e.id) as docked_count
    FROM events e JOIN users u ON e.user_id = u.id
    WHERE e.is_global = 1 AND (e.start_time >= ? OR e.recurring IS NOT NULL)
    ORDER BY e.start_time ASC
    LIMIT 5
  `).all(now)
}

export function getDockedEvents(globalEventId) {
  return db.prepare(`
    SELECT e.*, u.name as creator_name
    FROM events e JOIN users u ON e.user_id = u.id
    WHERE e.docked_to_event_id = ?
    ORDER BY e.start_time ASC
  `).all(globalEventId)
}

export function deleteEvent(eventId) {
  db.prepare('DELETE FROM events WHERE id = ?').run(eventId)
}

// ─── Event Teilnahme ───

export function joinEvent(eventId, userId) {
  db.prepare('INSERT OR REPLACE INTO event_participants (event_id, user_id, status) VALUES (?, ?, ?)').run(eventId, userId, 'joined')
}

export function watchEvent(eventId, userId) {
  db.prepare('INSERT OR REPLACE INTO event_participants (event_id, user_id, status) VALUES (?, ?, ?)').run(eventId, userId, 'watching')
}

export function leaveEvent(eventId, userId) {
  db.prepare('DELETE FROM event_participants WHERE event_id = ? AND user_id = ?').run(eventId, userId)
}

export function getEventParticipants(eventId) {
  return db.prepare(`
    SELECT u.id, u.name, u.image_path
    FROM event_participants ep JOIN users u ON ep.user_id = u.id
    WHERE ep.event_id = ?
  `).all(eventId)
}

export function getEventParticipantCount(eventId) {
  return db.prepare('SELECT COUNT(*) as count FROM event_participants WHERE event_id = ?').get(eventId).count
}

export function getEventMaxParticipants(eventId) {
  const row = db.prepare('SELECT max_participants FROM events WHERE id = ?').get(eventId)
  return row?.max_participants || null
}

export function isUserParticipating(eventId, userId) {
  const row = db.prepare('SELECT status FROM event_participants WHERE event_id = ? AND user_id = ?').get(eventId, userId)
  return row ? row.status : null
}

export function getUserEvents(userId) {
  return db.prepare(`
    SELECT e.*, ep.status, u.name as creator_name
    FROM event_participants ep
    JOIN events e ON ep.event_id = e.id
    JOIN users u ON e.user_id = u.id
    WHERE ep.user_id = ?
    ORDER BY e.start_time ASC
  `).all(userId)
}

// ─── Lichtungen (Orte) ───

export function getAllLichtungen() {
  return db.prepare(`
    SELECT l.*, u.name as creator_name
    FROM lichtungen l JOIN users u ON l.user_id = u.id
    ORDER BY l.created_at DESC
  `).all()
}

export function getLichtung(id) {
  return db.prepare(`
    SELECT l.*, u.name as creator_name
    FROM lichtungen l JOIN users u ON l.user_id = u.id
    WHERE l.id = ?
  `).get(id)
}

export function createLichtung(userId, { name, description, lat, lng, tags }) {
  const id = randomUUID()
  db.prepare('INSERT INTO lichtungen (id, user_id, name, description, lat, lng, tags) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, userId, name, description || '', lat, lng, tags || '')
  // Ersteller wird automatisch Owner
  db.prepare('INSERT INTO lichtung_members (lichtung_id, user_id, role) VALUES (?, ?, ?)').run(id, userId, 'owner')
  // Permanenten Code generieren
  const code = randomUUID().slice(0, 8)
  db.prepare('INSERT INTO lichtung_codes (lichtung_id, code) VALUES (?, ?)').run(id, code)
  return { id, code }
}

export function updateLichtung(id, fields) {
  const sets = []
  const vals = []
  for (const [key, val] of Object.entries(fields)) {
    if (val !== undefined) { sets.push(`${key} = ?`); vals.push(val) }
  }
  if (sets.length === 0) return
  vals.push(id)
  db.prepare(`UPDATE lichtungen SET ${sets.join(', ')} WHERE id = ?`).run(...vals)
}

export function deleteLichtung(id) {
  db.prepare('DELETE FROM lichtungen WHERE id = ?').run(id)
}

export function getLichtungEvents(lichtungId) {
  return db.prepare(`
    SELECT e.*, u.name as creator_name
    FROM events e JOIN users u ON e.user_id = u.id
    WHERE e.lichtung_id = ?
    ORDER BY e.start_time ASC
  `).all(lichtungId)
}

// ─── Lichtung Mitglieder + Rollen ───

export function addLichtungMember(lichtungId, userId, role = 'member') {
  db.prepare('INSERT OR REPLACE INTO lichtung_members (lichtung_id, user_id, role) VALUES (?, ?, ?)').run(lichtungId, userId, role)
}

export function removeLichtungMember(lichtungId, userId) {
  db.prepare('DELETE FROM lichtung_members WHERE lichtung_id = ? AND user_id = ?').run(lichtungId, userId)
}

export function setLichtungRole(lichtungId, userId, role) {
  db.prepare('UPDATE lichtung_members SET role = ? WHERE lichtung_id = ? AND user_id = ?').run(role, lichtungId, userId)
}

export function getLichtungMembers(lichtungId) {
  return db.prepare(`
    SELECT lm.role, lm.created_at, u.id, u.name, u.image_path, u.email
    FROM lichtung_members lm JOIN users u ON lm.user_id = u.id
    WHERE lm.lichtung_id = ?
    ORDER BY CASE lm.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END, lm.created_at
  `).all(lichtungId)
}

export function getLichtungMemberRole(lichtungId, userId) {
  const row = db.prepare('SELECT role FROM lichtung_members WHERE lichtung_id = ? AND user_id = ?').get(lichtungId, userId)
  return row ? row.role : null
}

export function getLichtungMemberCount(lichtungId) {
  return db.prepare('SELECT COUNT(*) as c FROM lichtung_members WHERE lichtung_id = ?').get(lichtungId).c
}

// ─── Lichtung Telegram Links ───

export function getLichtungTelegramLinks(lichtungId) {
  return db.prepare('SELECT * FROM lichtung_telegram_links WHERE lichtung_id = ? ORDER BY created_at').all(lichtungId)
}

export function addLichtungTelegramLink(lichtungId, label, url, isPrivate = false) {
  const id = randomUUID()
  db.prepare('INSERT INTO lichtung_telegram_links (id, lichtung_id, label, url, is_private) VALUES (?, ?, ?, ?, ?)').run(id, lichtungId, label, url, isPrivate ? 1 : 0)
  return { id }
}

export function deleteLichtungTelegramLink(id) {
  db.prepare('DELETE FROM lichtung_telegram_links WHERE id = ?').run(id)
}

export function updateLichtungTelegramLink(id, label, url, isPrivate) {
  const fields = []
  const values = []
  if (label !== undefined) { fields.push('label = ?'); values.push(label) }
  if (url !== undefined) { fields.push('url = ?'); values.push(url) }
  if (isPrivate !== undefined) { fields.push('is_private = ?'); values.push(isPrivate ? 1 : 0) }
  if (!fields.length) return
  values.push(id)
  db.prepare(`UPDATE lichtung_telegram_links SET ${fields.join(', ')} WHERE id = ?`).run(...values)
}

// ─── Verbindungen (Mensch-zu-Mensch) ───

export function createConnection(userA, userB) {
  // Sortieren damit A<B, so verhindern wir Duplikate
  const [a, b] = [userA, userB].sort()
  db.prepare('INSERT OR IGNORE INTO connections (user_a, user_b) VALUES (?, ?)').run(a, b)
}

export function getConnections(userId) {
  return db.prepare(`
    SELECT
      CASE WHEN c.user_a = ? THEN c.user_b ELSE c.user_a END as connected_id,
      u.name, u.image_path, u.statement, u.telegram,
      l.lat, l.lng,
      c.created_at
    FROM connections c
    JOIN users u ON u.id = CASE WHEN c.user_a = ? THEN c.user_b ELSE c.user_a END
    LEFT JOIN lights l ON l.user_id = u.id
    WHERE c.user_a = ? OR c.user_b = ?
    ORDER BY c.created_at DESC
  `).all(userId, userId, userId, userId)
}

export function getConnectionCount(userId) {
  return db.prepare('SELECT COUNT(*) as c FROM connections WHERE user_a = ? OR user_b = ?').get(userId, userId).c
}

export function isConnected(userA, userB) {
  const [a, b] = [userA, userB].sort()
  return !!db.prepare('SELECT 1 FROM connections WHERE user_a = ? AND user_b = ?').get(a, b)
}

// Lichterkette: Alle die durch mich eingeladen wurden (invite chain)
export function getInviteChain(userId) {
  return db.prepare(`
    SELECT l.id, l.lat, l.lng, l.invited_by, u.name, u.image_path
    FROM lights l JOIN users u ON l.user_id = u.id
    WHERE l.invited_by = ?
  `).all(userId)
}

// Gesamte Kette rekursiv (bis 5 Ebenen)
export function getFullChain(userId, depth = 5) {
  const result = []
  const visited = new Set()
  function walk(uid, level) {
    if (level > depth || visited.has(uid)) return
    visited.add(uid)
    const children = db.prepare('SELECT l.user_id, l.lat, l.lng, u.name FROM lights l JOIN users u ON l.user_id = u.id WHERE l.invited_by = ?').all(uid)
    for (const c of children) {
      result.push({ ...c, level, parent: uid })
      walk(c.user_id, level + 1)
    }
  }
  walk(userId, 1)
  return result
}

// ─── Lichtung Verfuegbarkeit (Slots) ───

export function getSlots(lichtungId, from, to) {
  return db.prepare('SELECT * FROM lichtung_slots WHERE lichtung_id = ? AND date >= ? AND date <= ? ORDER BY date').all(lichtungId, from, to)
}

export function getSlotsForDate(lichtungId, date) {
  return db.prepare('SELECT * FROM lichtung_slots WHERE lichtung_id = ? AND date = ? ORDER BY start_hour').all(lichtungId, date)
}

// Ganztags-Slot oder Stunden-Slot anlegen
export function createTimeSlot(lichtungId, date, { startHour, endHour, status, parallelSlots, note }, createdBy) {
  const id = randomUUID()
  db.prepare(`
    INSERT INTO lichtung_slots (id, lichtung_id, date, status, max_events, note, created_by, start_hour, end_hour, parallel_slots)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, lichtungId, date, status || 'open', parallelSlots || 1, note || '', createdBy, startHour ?? null, endHour ?? null, parallelSlots || 1)
  return { id }
}

export function deleteSlotById(slotId) {
  db.prepare('DELETE FROM lichtung_slots WHERE id = ?').run(slotId)
}

export function deleteSlot(lichtungId, date) {
  db.prepare('DELETE FROM lichtung_slots WHERE lichtung_id = ? AND date = ?').run(lichtungId, date)
}

export function getSlot(lichtungId, date) {
  // Prioritaet: Ganztags-Slot (kein start_hour)
  return db.prepare('SELECT * FROM lichtung_slots WHERE lichtung_id = ? AND date = ? AND start_hour IS NULL').get(lichtungId, date)
}

export function copyWeekSlots(lichtungId, weekStartDate, weeksAhead, createdBy) {
  // weekStartDate ist YYYY-MM-DD (Montag). Kopiert alle Slots von Mo-So in die naechsten N Wochen.
  const start = new Date(weekStartDate + 'T00:00:00Z')
  const end = new Date(start.getTime() + 7 * 86400000)
  const weekEnd = end.toISOString().slice(0, 10)
  const srcSlots = db.prepare('SELECT * FROM lichtung_slots WHERE lichtung_id = ? AND date >= ? AND date < ?').all(lichtungId, weekStartDate, weekEnd)

  let copied = 0
  for (let w = 1; w <= weeksAhead; w++) {
    for (const s of srcSlots) {
      const srcDate = new Date(s.date + 'T00:00:00Z')
      const newDate = new Date(srcDate.getTime() + w * 7 * 86400000).toISOString().slice(0, 10)
      // Duplikate vermeiden: gleicher Slot (Datum + start_hour + end_hour) -> ueberschreiben
      const existing = db.prepare('SELECT id FROM lichtung_slots WHERE lichtung_id = ? AND date = ? AND IFNULL(start_hour, -1) = IFNULL(?, -1) AND IFNULL(end_hour, -1) = IFNULL(?, -1)').get(lichtungId, newDate, s.start_hour, s.end_hour)
      if (existing) {
        db.prepare('UPDATE lichtung_slots SET status = ?, parallel_slots = ?, note = ? WHERE id = ?').run(s.status, s.parallel_slots, s.note, existing.id)
      } else {
        const id = randomUUID()
        db.prepare('INSERT INTO lichtung_slots (id, lichtung_id, date, status, max_events, note, created_by, start_hour, end_hour, parallel_slots) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, lichtungId, newDate, s.status, s.max_events, s.note, createdBy, s.start_hour, s.end_hour, s.parallel_slots)
      }
      copied++
    }
  }
  return copied
}

export function setSlot(lichtungId, date, status, maxEvents, note, createdBy) {
  const existing = db.prepare('SELECT id FROM lichtung_slots WHERE lichtung_id = ? AND date = ? AND start_hour IS NULL').get(lichtungId, date)
  if (existing) {
    db.prepare('UPDATE lichtung_slots SET status = ?, max_events = ?, note = ? WHERE id = ?').run(status, maxEvents || 1, note || '', existing.id)
  } else {
    const id = randomUUID()
    db.prepare('INSERT INTO lichtung_slots (id, lichtung_id, date, status, max_events, note, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, lichtungId, date, status, maxEvents || 1, note || '', createdBy)
  }
}

export function getEventsForDate(lichtungId, date) {
  return db.prepare("SELECT COUNT(*) as c FROM events WHERE lichtung_id = ? AND start_time LIKE ?").get(lichtungId, date + '%').c
}

export function isSlotAvailable(lichtungId, date) {
  const slot = getSlot(lichtungId, date)
  if (!slot) return { available: true, reason: 'Kein Slot definiert — offen' }
  if (slot.status === 'closed') return { available: false, reason: slot.note || 'Ruhetag' }
  const eventCount = getEventsForDate(lichtungId, date)
  if (eventCount >= slot.max_events) return { available: false, reason: `Voll (${eventCount}/${slot.max_events})` }
  return { available: true, remaining: slot.max_events - eventCount }
}

// ─── Lichtung Permanente QR-Codes ───

export function getLichtungCode(lichtungId) {
  const row = db.prepare('SELECT code FROM lichtung_codes WHERE lichtung_id = ?').get(lichtungId)
  if (row) return row.code
  const code = randomUUID().slice(0, 8)
  db.prepare('INSERT INTO lichtung_codes (lichtung_id, code) VALUES (?, ?)').run(lichtungId, code)
  return code
}

export function findLichtungByCode(code) {
  const row = db.prepare('SELECT lichtung_id FROM lichtung_codes WHERE code = ?').get(code)
  return row ? row.lichtung_id : null
}

// ─── Invite Tokens (temporaer, 60s) ───

export function createInviteToken(userId) {
  const token = randomUUID()
  const expires_at = new Date(Date.now() + 60 * 1000).toISOString() // 60 Sekunden
  db.prepare('INSERT INTO invite_tokens (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expires_at)
  return token
}

export function verifyInviteToken(token) {
  const row = db.prepare('SELECT * FROM invite_tokens WHERE token = ? AND used = 0').get(token)
  if (!row || new Date(row.expires_at) < new Date()) return null
  db.prepare('UPDATE invite_tokens SET used = 1 WHERE token = ?').run(token)
  return row.user_id
}

// ─── Lichtung Galerie ───

export function getLichtungImages(lichtungId) {
  return db.prepare(`
    SELECT i.id, i.filename, i.caption, i.created_at, u.name as user_name
    FROM lichtung_images i JOIN users u ON i.user_id = u.id
    WHERE i.lichtung_id = ?
    ORDER BY i.created_at DESC
  `).all(lichtungId)
}

export function addLichtungImage(lichtungId, userId, filename, caption) {
  const id = randomUUID()
  db.prepare('INSERT INTO lichtung_images (id, lichtung_id, user_id, filename, caption) VALUES (?, ?, ?, ?, ?)').run(id, lichtungId, userId, filename, caption || '')
  return { id, filename }
}

export function deleteLichtungImage(imageId, userId) {
  const img = db.prepare('SELECT * FROM lichtung_images WHERE id = ?').get(imageId)
  if (!img) return false
  if (img.user_id !== userId) {
    const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId)
    if (!user?.is_admin) return false
  }
  db.prepare('DELETE FROM lichtung_images WHERE id = ?').run(imageId)
  return img.filename
}

export default db
