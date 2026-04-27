/**
 * Demo-Daten-Generator: Erzeugt realistische Werkstätten, Events, Projekte und User
 * über ganz Deutschland verteilt (gewichtet nach Stadtgröße).
 *
 * Usage: node scripts/seed-demo.js [count]
 * Default: 10000 Werkstätten + proportional Events/Projekte/User
 */

import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DB_PATH = process.env.DB_PATH || join(__dirname, '..', 'data', 'lichtung.db')
const TOTAL = parseInt(process.argv[2] || '10000', 10)

// ─── Deutsche Städte mit Gewichtung (Bevölkerung / 1000) ───

const CITIES = [
  { name: 'Berlin', lat: 52.52, lng: 13.405, w: 3645 },
  { name: 'Hamburg', lat: 53.551, lng: 9.993, w: 1841 },
  { name: 'München', lat: 48.135, lng: 11.582, w: 1472 },
  { name: 'Köln', lat: 50.937, lng: 6.960, w: 1084 },
  { name: 'Frankfurt', lat: 50.110, lng: 8.682, w: 753 },
  { name: 'Stuttgart', lat: 48.776, lng: 9.183, w: 635 },
  { name: 'Düsseldorf', lat: 51.227, lng: 6.774, w: 619 },
  { name: 'Leipzig', lat: 51.340, lng: 12.375, w: 587 },
  { name: 'Dortmund', lat: 51.514, lng: 7.468, w: 588 },
  { name: 'Essen', lat: 51.455, lng: 7.012, w: 583 },
  { name: 'Bremen', lat: 53.079, lng: 8.802, w: 569 },
  { name: 'Dresden', lat: 51.051, lng: 13.738, w: 556 },
  { name: 'Hannover', lat: 52.376, lng: 9.732, w: 536 },
  { name: 'Nürnberg', lat: 49.453, lng: 11.077, w: 518 },
  { name: 'Duisburg', lat: 51.435, lng: 6.763, w: 498 },
  { name: 'Bochum', lat: 51.482, lng: 7.216, w: 365 },
  { name: 'Wuppertal', lat: 51.256, lng: 7.151, w: 355 },
  { name: 'Bielefeld', lat: 52.022, lng: 8.533, w: 334 },
  { name: 'Bonn', lat: 50.737, lng: 7.099, w: 330 },
  { name: 'Münster', lat: 51.961, lng: 7.626, w: 315 },
  { name: 'Mannheim', lat: 49.488, lng: 8.467, w: 309 },
  { name: 'Karlsruhe', lat: 49.007, lng: 8.404, w: 308 },
  { name: 'Augsburg', lat: 48.371, lng: 10.898, w: 296 },
  { name: 'Wiesbaden', lat: 50.083, lng: 8.240, w: 278 },
  { name: 'Aachen', lat: 50.776, lng: 6.084, w: 249 },
  { name: 'Braunschweig', lat: 52.269, lng: 10.521, w: 249 },
  { name: 'Kiel', lat: 54.323, lng: 10.123, w: 247 },
  { name: 'Chemnitz', lat: 50.828, lng: 12.921, w: 244 },
  { name: 'Freiburg', lat: 47.999, lng: 7.842, w: 231 },
  { name: 'Lübeck', lat: 53.870, lng: 10.687, w: 217 },
  { name: 'Magdeburg', lat: 52.121, lng: 11.628, w: 236 },
  { name: 'Erfurt', lat: 50.978, lng: 11.029, w: 214 },
  { name: 'Rostock', lat: 54.092, lng: 12.099, w: 209 },
  { name: 'Kassel', lat: 51.313, lng: 9.497, w: 201 },
  { name: 'Mainz', lat: 49.993, lng: 8.271, w: 218 },
  { name: 'Halle', lat: 51.497, lng: 11.969, w: 239 },
  { name: 'Saarbrücken', lat: 49.240, lng: 6.997, w: 180 },
  { name: 'Potsdam', lat: 52.396, lng: 13.058, w: 178 },
  { name: 'Oldenburg', lat: 53.144, lng: 8.214, w: 169 },
  { name: 'Osnabrück', lat: 52.280, lng: 8.043, w: 165 },
  { name: 'Regensburg', lat: 49.013, lng: 12.102, w: 153 },
  { name: 'Heidelberg', lat: 49.399, lng: 8.672, w: 159 },
  { name: 'Darmstadt', lat: 49.873, lng: 8.651, w: 159 },
  { name: 'Würzburg', lat: 49.792, lng: 9.953, w: 127 },
  { name: 'Ulm', lat: 48.402, lng: 9.988, w: 126 },
  { name: 'Jena', lat: 50.927, lng: 11.586, w: 111 },
  { name: 'Konstanz', lat: 47.660, lng: 9.176, w: 85 },
  { name: 'Trier', lat: 49.756, lng: 6.637, w: 111 },
  { name: 'Göttingen', lat: 51.534, lng: 9.935, w: 120 },
  { name: 'Cottbus', lat: 51.756, lng: 14.333, w: 100 },
]

const TOTAL_WEIGHT = CITIES.reduce((s, c) => s + c.w, 0)

const CATEGORIES = [
  { tag: 'holz', names: ['Holzwerkstatt', 'Schreinerei', 'Tischlerei', 'Holz-Atelier', 'Holzmanufaktur'] },
  { tag: 'metall', names: ['Metallwerkstatt', 'Schweißerei', 'Schlosserei', 'Metall-Lab', 'Stahl & Eisen'] },
  { tag: 'elektronik', names: ['Elektronik-Lab', 'Lötstube', 'E-Werkstatt', 'Maker-Electronics', 'Schaltkreis'] },
  { tag: 'textil', names: ['Nähwerkstatt', 'Textil-Atelier', 'Stoffwerkstatt', 'Nähcafé', 'Fadenzauber'] },
  { tag: 'keramik', names: ['Keramikwerkstatt', 'Töpferei', 'Ton-Atelier', 'Brennofen-Studio', 'Lehmkunst'] },
  { tag: 'schmieden', names: ['Schmiede', 'Amboss & Feuer', 'Hammerschlag', 'Kunstschmiede', 'Feuerwerkstatt'] },
  { tag: 'fahrrad', names: ['Fahrrad-Werkstatt', 'Rad-Station', 'Bike-Lab', 'Pedalwerk', 'Zweirad-Werkstatt'] },
  { tag: 'siebdruck', names: ['Siebdruck-Atelier', 'Druckwerkstatt', 'Print-Lab', 'Sieb & Farbe', 'Druckkunst'] },
  { tag: 'laser', names: ['Laser-Lab', 'CNC-Werkstatt', 'Digital-Fabrik', 'FabLab', 'Maker-Space'] },
  { tag: 'reparatur', names: ['Repair-Café', 'Reparatur-Werkstatt', 'Fix-It-Lab', 'Werkstatt der Dinge', 'Wiederbelebung'] },
  { tag: '3ddruck', names: ['3D-Druck-Lab', '3D-Werkstatt', 'Additive Fabrik', 'Print-Station', '3D-Manufaktur'] },
]

const EVENT_TYPES = ['workshop', 'kurs', 'bau', 'wettbewerb', 'treffen', 'offen']
const EVENT_TITLES = [
  'Einsteiger-Workshop', 'Meisterkurs', 'Offene Werkstatt', 'Repair-Café',
  'Bau-Wochenende', 'Maker-Treffen', 'Hands-On Kurs', 'Projekt-Abend',
  'Schnupper-Tag', 'Intensiv-Kurs', 'Community-Build', 'Wettbewerb',
  'Nachbarschafts-Werkstatt', 'Kreativ-Nachmittag', 'Tool-Sharing Tag',
]
const PROJECT_TITLES = [
  'Gemeinschaftsgarten-Möbel', 'Spielplatz-Renovierung', 'Lastenrad bauen',
  'Tiny House Prototyp', 'Solar-Werkbank', 'Nachbarschafts-Bibliothek',
  'Outdoor-Küche', 'Werkzeug-Verleih', 'Gemeinschafts-Werkstatt',
  'Skatepark-Ramp', 'Baumhaus-Projekt', 'Open-Source CNC',
  'Mobile Werkstatt', 'Upcycling-Container', 'Makerspace-Ausbau',
]
const FIRST_NAMES = [
  'Max', 'Anna', 'Lukas', 'Sophie', 'Tim', 'Laura', 'Felix', 'Marie',
  'Jonas', 'Lena', 'Paul', 'Lisa', 'Ben', 'Julia', 'Leon', 'Sarah',
  'Finn', 'Emma', 'Moritz', 'Hannah', 'Elias', 'Maja', 'Noah', 'Lea',
  'Niklas', 'Clara', 'David', 'Mila', 'Jan', 'Ella',
]
const LAST_NAMES = [
  'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner',
  'Becker', 'Schulz', 'Hoffmann', 'Koch', 'Richter', 'Klein', 'Wolf',
  'Schröder', 'Neumann', 'Schwarz', 'Braun', 'Zimmermann', 'Krüger',
]
const STATEMENTS = [
  'Macher aus Leidenschaft', 'Bauen verbindet', 'Hands on!',
  'Kreativ & praktisch', 'Werkstatt-Liebe', 'Gemeinsam schaffen wir das',
  'Holz ist mein Element', 'Vom Kopf in die Hand', 'Machen statt Reden',
  '',
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function pickCity() {
  let r = Math.random() * TOTAL_WEIGHT
  for (const city of CITIES) {
    r -= city.w
    if (r <= 0) return city
  }
  return CITIES[0]
}

function jitter(center, spread) {
  const u = Math.random(), v = Math.random()
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  return center + z * spread
}

function futureDate(maxDays) {
  return new Date(Date.now() + Math.random() * maxDays * 86400000).toISOString()
}

function pastDate(maxDaysAgo) {
  return new Date(Date.now() - Math.random() * maxDaysAgo * 86400000).toISOString()
}

// ─── DB Setup ───

console.log(`Seeding ${TOTAL} Werkstätten + Events + Projekte + User...`)
console.log(`DB: ${DB_PATH}`)

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

// Ensure core tables exist (mirrors server/db.js schema)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
    name TEXT DEFAULT '', statement TEXT DEFAULT '', image_path TEXT,
    newsletter INTEGER DEFAULT 0, email_verified INTEGER DEFAULT 0,
    is_admin INTEGER DEFAULT 0, bio TEXT DEFAULT '', telegram TEXT,
    telegram_chat_id TEXT,
    notify_new_connection INTEGER DEFAULT 1, notify_new_event INTEGER DEFAULT 1,
    notify_radius INTEGER DEFAULT 50, notify_lichtung INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS lights (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, lat REAL NOT NULL, lng REAL NOT NULL,
    invited_by TEXT, created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS lichtungen (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT NOT NULL,
    description TEXT DEFAULT '', lat REAL NOT NULL, lng REAL NOT NULL,
    image_path TEXT, tags TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS lichtung_members (
    lichtung_id TEXT NOT NULL, user_id TEXT NOT NULL, role TEXT DEFAULT 'member',
    created_at TEXT DEFAULT (datetime('now')), PRIMARY KEY (lichtung_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS lichtung_codes (
    lichtung_id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL
  );
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL,
    description TEXT DEFAULT '', lat REAL NOT NULL, lng REAL NOT NULL,
    start_time TEXT NOT NULL, end_time TEXT, type TEXT DEFAULT 'workshop',
    recurring TEXT, is_global INTEGER DEFAULT 0, lichtung_id TEXT,
    max_participants INTEGER, image_path TEXT, tags TEXT DEFAULT '',
    wave_mode TEXT, docked_to_event_id TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL,
    description TEXT DEFAULT '', lat REAL NOT NULL, lng REAL NOT NULL,
    goal_amount REAL DEFAULT 0, current_amount REAL DEFAULT 0,
    image_path TEXT, tags TEXT DEFAULT '', lichtung_id TEXT,
    opencollective_url TEXT, video_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`)

// ─── Prepared statements ───

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, email, password_hash, name, statement, email_verified, created_at)
  VALUES (?, ?, 'demo_hash_not_loginable', ?, ?, 1, ?)
`)
const insertLight = db.prepare(`
  INSERT OR IGNORE INTO lights (id, user_id, lat, lng, created_at) VALUES (?, ?, ?, ?, ?)
`)
const insertLichtung = db.prepare(`
  INSERT OR IGNORE INTO lichtungen (id, user_id, name, description, lat, lng, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)
const insertMember = db.prepare(`
  INSERT OR IGNORE INTO lichtung_members (lichtung_id, user_id, role) VALUES (?, ?, 'owner')
`)
const insertCode = db.prepare(`
  INSERT OR IGNORE INTO lichtung_codes (lichtung_id, code) VALUES (?, ?)
`)
const insertEvent = db.prepare(`
  INSERT OR IGNORE INTO events (id, user_id, title, description, lat, lng, start_time, type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`)
const insertProject = db.prepare(`
  INSERT OR IGNORE INTO projects (id, user_id, title, description, lat, lng, goal_amount, current_amount, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

// ─── Seed ───

const seedAll = db.transaction(() => {
  const userIds = []

  const userCount = Math.ceil(TOTAL / 5)
  console.log(`  ${userCount} User...`)
  for (let i = 0; i < userCount; i++) {
    const id = randomUUID()
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
    const email = `demo-${id.slice(0, 8)}@macher.test`
    const created = pastDate(180)
    insertUser.run(id, email, name, pick(STATEMENTS), created)
    userIds.push(id)

    const city = pickCity()
    insertLight.run(randomUUID(), id, jitter(city.lat, 0.02), jitter(city.lng, 0.03), created)
  }

  console.log(`  ${TOTAL} Werkstätten...`)
  for (let i = 0; i < TOTAL; i++) {
    const city = pickCity()
    const cat = pick(CATEGORIES)
    const userId = pick(userIds)
    const lid = randomUUID()
    const name = `${pick(cat.names)} ${city.name}`

    insertLichtung.run(
      lid, userId, name,
      `${cat.tag.charAt(0).toUpperCase() + cat.tag.slice(1)}-Werkstatt in ${city.name}`,
      jitter(city.lat, 0.04), jitter(city.lng, 0.06),
      cat.tag, pastDate(120),
    )
    insertMember.run(lid, userId)
    insertCode.run(lid, randomUUID().slice(0, 8))
  }

  const eventCount = Math.ceil(TOTAL / 3)
  console.log(`  ${eventCount} Events...`)
  for (let i = 0; i < eventCount; i++) {
    const city = pickCity()
    const userId = pick(userIds)
    const type = pick(EVENT_TYPES)

    insertEvent.run(
      randomUUID(), userId,
      `${pick(EVENT_TITLES)} — ${city.name}`,
      `${type} Event in ${city.name}`,
      jitter(city.lat, 0.03), jitter(city.lng, 0.05),
      futureDate(90), type, pastDate(30),
    )
  }

  const projectCount = Math.ceil(TOTAL / 10)
  console.log(`  ${projectCount} Projekte...`)
  for (let i = 0; i < projectCount; i++) {
    const city = pickCity()
    const userId = pick(userIds)
    const goal = pick([500, 1000, 2000, 3000, 5000, 10000])
    const current = Math.floor(Math.random() * goal)
    const tag = pick(CATEGORIES).tag

    insertProject.run(
      randomUUID(), userId,
      `${pick(PROJECT_TITLES)} — ${city.name}`,
      `Gemeinschaftsprojekt in ${city.name}`,
      jitter(city.lat, 0.03), jitter(city.lng, 0.05),
      goal, current, tag, pastDate(60),
    )
  }
})

seedAll()

const stats = {
  users: db.prepare('SELECT COUNT(*) as c FROM users').get().c,
  lights: db.prepare('SELECT COUNT(*) as c FROM lights').get().c,
  lichtungen: db.prepare('SELECT COUNT(*) as c FROM lichtungen').get().c,
  events: db.prepare('SELECT COUNT(*) as c FROM events').get().c,
  projects: db.prepare('SELECT COUNT(*) as c FROM projects').get().c,
}

console.log('\nFertig!')
console.log(stats)
db.close()
