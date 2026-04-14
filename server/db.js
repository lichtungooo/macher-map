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

export function createLichtung(userId, { name, description, lat, lng }) {
  const id = randomUUID()
  db.prepare('INSERT INTO lichtungen (id, user_id, name, description, lat, lng) VALUES (?, ?, ?, ?, ?, ?)').run(id, userId, name, description || '', lat, lng)
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

export default db
