import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import { createHash } from 'crypto'

const DB_PATH = process.env.DB_PATH || '/data/lichtung.db'
const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

function hashPassword(pw) {
  return createHash('sha256').update(pw).digest('hex')
}

// ─── Ferropolis Region: 51.5°N, 12.5°E (Gräfenhainichen / Dessau / Wittenberg / Leipzig-Halle) ───

const DEMO_PASSWORD = hashPassword('macher2026')

const users = [
  { name: 'Hanna Werkmeister', statement: 'Ich bau Moebel aus Altholz', bio: 'Schreinerin seit 15 Jahren. Meine Werkstatt steht in Dessau — jeden Samstag offen fuer alle.', telegram: '@hanna_holz' },
  { name: 'Jonas Kupferschmied', statement: 'Schweissen ist Meditation mit Funken', bio: 'Metallbauer und Kuenstler. Baue Skulpturen aus Schrott.', telegram: '@jonas_metall' },
  { name: 'Lena Stromberg', statement: 'Arduino, Raspberry Pi und alles was blinkt', bio: '14 Jahre alt. Mache seit 3 Jahren Elektronik-Projekte. Will Ingenieurin werden.', telegram: '@lena_maker' },
  { name: 'Klaus Drechsler', statement: 'Holz hat eine Seele — ich mach sie sichtbar', bio: 'Drechslermeister, 62 Jahre. Fuehre die Werkstatt meines Vaters weiter.', telegram: '@klaus_dreh' },
  { name: 'Mira Fadenstark', statement: 'Naehen, Sticken, Upcycling — alles wird neu', bio: 'Modedesignerin und Upcycling-Aktivistin. Gebe Workshops fuer Kinder und Jugendliche.', telegram: '@mira_stoff' },
  { name: 'Tom Schrauber', statement: 'Fahrraeder reparieren = Freiheit schenken', bio: 'Betreibe eine offene Fahrradwerkstatt in Wittenberg. Jeder kann kommen, jeder kann lernen.', telegram: '@tom_bike' },
  { name: 'Sarah Lehmhaus', statement: 'Mit Lehm bauen — das aelteste Handwerk der Welt', bio: 'Lehmbauerin und Permakultur-Designerin. Baue Lehmoefen und Naturhaeuser.', telegram: '@sarah_lehm' },
  { name: 'Max Laserstrahl', statement: '3D-Druck und Lasercutter — die Zukunft ist jetzt', bio: 'FabLab-Gruender. Bringe Jugendlichen bei, wie man mit digitalen Werkzeugen echte Dinge baut.', telegram: '@max_fablab' },
  { name: 'Elif Tonkunst', statement: 'Keramik ist Erde die zu Kunst wird', bio: 'Keramikerin und Toepferlehrerin. Meine Brennoefen stehen in Leipzig.', telegram: '@elif_ton' },
  { name: 'Nico Funkenflug', statement: 'Ich bau Dinge die fliegen und Dinge die rollen', bio: 'Modellbauer und RC-Enthusiast. Organisiere Bau-Wettbewerbe fuer Kids.', telegram: '@nico_fly' },
  { name: 'Anna Holzwurm', statement: 'Kinder + Holz = Magie', bio: 'Erzieherin und Holzwerk-Paedagogin. Bringe Kindern bei, mit echtem Werkzeug zu arbeiten.', telegram: '@anna_kids' },
  { name: 'Bernd Eisenhart', statement: 'Schmieden wie vor 500 Jahren', bio: 'Kunstschmied in dritter Generation. Zeige altes Handwerk in moderner Form.', telegram: '@bernd_amboss' },
  { name: 'Yuki Druckkopf', statement: 'Siebdruck ist Punk — jeder kann drucken', bio: 'Siebdruckerin. Offene Druckwerkstatt in Halle. Shirts, Poster, Taschen — alles handgemacht.', telegram: '@yuki_print' },
  { name: 'Frieda Gartenwerk', statement: 'Hochbeete, Gewaechshaeuser, Urban Farming', bio: 'Gaertnerin und Tischlerin. Baue Hochbeete und Gewaechshaeuser fuer Gemeinschaftsgaerten.', telegram: '@frieda_green' },
  { name: 'Olaf Motoroel', statement: 'Alte Motoren, neue Traeume', bio: 'Kfz-Mechaniker-Meister. Restauriere Oldtimer und bringe Jugendlichen Schrauben bei.', telegram: '@olaf_motor' },
]

const werkstaetten = [
  {
    name: 'Ferropolis Makerspace',
    description: 'Die groesste offene Werkstatt Mitteldeutschlands — direkt neben den Baggern. Holz, Metall, Elektronik, 3D-Druck. Jeden Tag offen, jeder willkommen.',
    lat: 51.6168, lng: 12.4415,
    tags: 'holz,metall,elektronik,3ddruck,cnc,laser',
  },
  {
    name: 'Holzwerkstatt Dessau',
    description: 'Hannas Reich: Altholz-Moebel, Restaurierung, Schnitzen. 200qm Werkstatt mit allem was das Holzherz begehrt. Samstags offen fuer alle.',
    lat: 51.8360, lng: 12.2443,
    tags: 'holz,moebel,restaurierung,schnitzen',
  },
  {
    name: 'Metallkunst Kupferschmied',
    description: 'Jonas Atelier fuer Metallskulpturen und Schweisskurse. MIG, MAG, WIG — alles da. Auch Schmiedekurse am offenen Feuer.',
    lat: 51.7550, lng: 12.3100,
    tags: 'metall,schweissen,schmieden,skulptur',
  },
  {
    name: 'FabLab Halle',
    description: 'Maxs FabLab: 3D-Drucker, Lasercutter, CNC-Fraese, Ploter. Jeden Mittwoch offener Abend. Projekte fuer Schulen und Jugendgruppen.',
    lat: 51.4828, lng: 11.9700,
    tags: '3ddruck,laser,cnc,elektronik,cad',
  },
  {
    name: 'Offene Fahrradwerkstatt Wittenberg',
    description: 'Toms Garage: Fahrraeder reparieren, aufbauen, customizen. Werkzeug und Know-how fuer alle. Keine Vorkenntnisse noetig.',
    lat: 51.8663, lng: 12.6454,
    tags: 'fahrrad,reparatur,upcycling,mechanik',
  },
  {
    name: 'Toepferei Tonkunst Leipzig',
    description: 'Elifs Keramikwerkstatt: Drehen, Aufbauen, Glasieren, Brennen. Kurse fuer Anfaenger und Fortgeschrittene. Zwei Brennoefen.',
    lat: 51.3397, lng: 12.3731,
    tags: 'keramik,toepfern,glasieren,skulptur',
  },
  {
    name: 'Siebdruckerei Druckkopf',
    description: 'Yukis offene Druckwerkstatt: Siebdruck auf Textil, Papier, Holz. Workshops jeden Freitag. Bring dein Motiv — wir drucken es.',
    lat: 51.4870, lng: 11.9628,
    tags: 'siebdruck,textil,design,grafik',
  },
  {
    name: 'Naehwerkstatt Fadenstark',
    description: 'Miras Upcycling-Atelier: Naehen, Sticken, Stricken, Upcycling. Naehmaschinen fuer alle da. Kinderkurse am Wochenende.',
    lat: 51.5030, lng: 11.9560,
    tags: 'naehen,textil,upcycling,stricken,mode',
  },
  {
    name: 'Schmiede Eisenhart',
    description: 'Bernds traditionelle Kunstschmiede: Amboss, Esse, Hammer. Schmiedekurse fuer Erwachsene und Jugendliche. Messer, Werkzeug, Kunstobjekte.',
    lat: 51.6040, lng: 12.4280,
    tags: 'schmieden,metall,messer,tradition',
  },
  {
    name: 'Lehmbau-Werkstatt Gartenwerk',
    description: 'Sarahs Permakultur-Werkstatt: Lehmoefen bauen, Naturputz, Hochbeete zimmern. Draussen arbeiten mit natuerlichen Materialien.',
    lat: 51.5910, lng: 12.4600,
    tags: 'lehm,permakultur,garten,hochbeet,natur',
  },
  {
    name: 'Elektronik-Lab Stromberg',
    description: 'Lenas Bastelkeller (mit Papas Hilfe): Arduino, Raspberry Pi, Loeten, Programmieren. Jeden Donnerstag Jugend-Hackerspace.',
    lat: 51.6200, lng: 12.4500,
    tags: 'elektronik,arduino,raspberrypi,loeten,programmieren',
  },
  {
    name: 'Modellbau Funkenflug',
    description: 'Nicos Werkstatt fuer alles was fliegt und rollt: Drohnen, RC-Autos, Modellflugzeuge. Bau-Wettbewerbe fuer Kids jeden Monat.',
    lat: 51.5500, lng: 12.3800,
    tags: 'modellbau,drohne,rc,elektronik,wettbewerb',
  },
]

const events = [
  {
    title: 'Schweiss-Workshop Level 1: Grundlagen',
    description: 'Lerne die Basics: Schutzausruestung, MIG-Schweissen, erste Naht. Keine Vorkenntnisse noetig. Material und Ausruestung gestellt.',
    type: 'workshop', tags: 'schweissen,anfaenger,metall,sicherheit',
    werkstattIndex: 2, start: '2026-08-06T10:00:00', end: '2026-08-06T14:00:00', max: 8,
  },
  {
    title: 'Holz-Bootcamp: Vom Brett zum Regal',
    description: 'In 4 Stunden baust du ein Regal komplett selbst — Saegen, Schleifen, Duebeln, Oelen. Du nimmst es mit nach Hause.',
    type: 'workshop', tags: 'holz,moebel,anfaenger,bauen',
    werkstattIndex: 1, start: '2026-08-06T09:00:00', end: '2026-08-06T13:00:00', max: 12,
  },
  {
    title: 'Kids Maker Day: Bau dein erstes Projekt',
    description: 'Fuer Kinder ab 8: Wir bauen zusammen ein Vogelhaeuschen aus Holz. Werkzeug-Fuehrerschein inklusive!',
    type: 'workshop', tags: 'kinder,holz,anfaenger,familie',
    werkstattIndex: 0, start: '2026-08-07T10:00:00', end: '2026-08-07T13:00:00', max: 20,
  },
  {
    title: 'Arduino fuer Einsteiger: LED-Blinken bis Sensor-Magie',
    description: 'Lenas Elektronik-Kurs: In 3 Stunden vom ersten LED-Blinken zum eigenen Sensor-Projekt. Arduino-Kit zum Mitnehmen.',
    type: 'workshop', tags: 'elektronik,arduino,anfaenger,jugend',
    werkstattIndex: 10, start: '2026-08-07T14:00:00', end: '2026-08-07T17:00:00', max: 10,
  },
  {
    title: 'Messerschmieden: Dein eigenes Outdoormesser',
    description: 'Zweitaegiger Schmiedekurs mit Bernd: Stahl erhitzen, haemmern, schleifen, Griff bauen. Du gehst mit deinem eigenen Messer nach Hause.',
    type: 'workshop', tags: 'schmieden,messer,metall,fortgeschritten',
    werkstattIndex: 8, start: '2026-08-08T09:00:00', end: '2026-08-09T16:00:00', max: 6,
  },
  {
    title: 'Siebdruck-Abend: Druck dein Festival-Shirt',
    description: 'Bring dein eigenes T-Shirt mit oder nimm eins von uns. Yuki zeigt dir Siebdruck — 2 Farben, dein Motiv. Sofort tragbar.',
    type: 'workshop', tags: 'siebdruck,textil,kreativ,abend',
    werkstattIndex: 6, start: '2026-08-06T18:00:00', end: '2026-08-06T21:00:00', max: 15,
  },
  {
    title: 'Fahrrad-Selbsthilfe: Plattfuss bis Schaltung',
    description: 'Offene Werkstatt — bring dein kaputtes Rad mit. Tom zeigt dir, wie du es selbst reparierst. Ersatzteile vorhanden.',
    type: 'workshop', tags: 'fahrrad,reparatur,selbsthilfe,anfaenger',
    werkstattIndex: 4, start: '2026-08-07T10:00:00', end: '2026-08-07T16:00:00', max: 0,
  },
  {
    title: 'Upcycling-Naehen: Aus Alt mach Geil',
    description: 'Bring alte Klamotten mit — Mira zeigt dir, wie du daraus was Neues machst. Naehmaschinen stehen bereit.',
    type: 'workshop', tags: 'naehen,upcycling,textil,nachhaltigkeit',
    werkstattIndex: 7, start: '2026-08-08T14:00:00', end: '2026-08-08T18:00:00', max: 10,
  },
  {
    title: 'Macher-Battle: Wer baut den besten Hocker?',
    description: 'Wettbewerb! 4 Teams, 2 Stunden, 1 Aufgabe: Bau den stabilsten, schoensten Hocker aus Restholz. Jury + Publikumspreis.',
    type: 'wettbewerb', tags: 'wettbewerb,holz,team,spass',
    werkstattIndex: 0, start: '2026-08-08T15:00:00', end: '2026-08-08T17:00:00', max: 20,
  },
  {
    title: 'Lehmofen bauen: Pizza aus dem Selbstgebauten',
    description: 'Gemeinsam bauen wir einen Lehmofen — und backen am Ende Pizza drin. Fuer Familien und alle die mit den Haenden arbeiten wollen.',
    type: 'workshop', tags: 'lehm,ofen,outdoor,familie,pizza',
    werkstattIndex: 9, start: '2026-08-09T10:00:00', end: '2026-08-09T16:00:00', max: 15,
  },
  {
    title: 'Toepfer-Abend: Deine erste Schale',
    description: 'Elifs Einfuehrung in die Toepferei: Ton aufbereiten, drehen, formen. Deine Schale wird gebrannt und kann abgeholt werden.',
    type: 'workshop', tags: 'keramik,toepfern,anfaenger,abend',
    werkstattIndex: 5, start: '2026-08-06T17:00:00', end: '2026-08-06T20:00:00', max: 8,
  },
  {
    title: 'Drohnenbau-Challenge fuer Jugendliche',
    description: 'Bau deine eigene Mini-Drohne! Nico zeigt wie: Rahmen, Motoren, Controller, erster Flug. Ab 12 Jahren.',
    type: 'workshop', tags: 'drohne,elektronik,jugend,bauen',
    werkstattIndex: 11, start: '2026-08-07T09:00:00', end: '2026-08-07T15:00:00', max: 8,
  },
]

const projects = [
  {
    title: 'Solar-Werkbank: Mobile Werkstatt mit Sonnenenergie',
    description: 'Wir bauen eine mobile Werkbank die komplett mit Solarstrom laeuft. Akku-Bohrer, LED-Licht, Loetstation — alles vom Dach. Fuer Schulen und Festivals.',
    tags: 'solar,werkbank,mobil,nachhaltigkeit,outdoor',
    lat: 51.6168, lng: 12.4415, goal: 3500, current: 2100,
  },
  {
    title: 'Tiny Werkstatt: Werkstatt auf 12qm Anhaenger',
    description: 'Ein Anhaenger wird zur fahrenden Werkstatt: Werkbank, Werkzeug, Strom. Faehrt zu Schulen, Festen, Doerfern. Handwerk kommt zu dir.',
    tags: 'tiny,mobil,anhaenger,werkstatt,bildung',
    lat: 51.5500, lng: 12.3800, goal: 8000, current: 3200,
  },
  {
    title: 'Repair Cafe Netzwerk Sachsen-Anhalt',
    description: 'Ziel: 10 neue Repair Cafes in Sachsen-Anhalt innerhalb eines Jahres. Werkzeug-Grundausstattung, Schulung, Vernetzung.',
    tags: 'repair,nachhaltigkeit,netzwerk,gemeinschaft',
    lat: 51.4828, lng: 11.9700, goal: 5000, current: 5000,
  },
  {
    title: 'Macher-Skill-Tree Prototyp',
    description: 'Die digitale Version der Maker Skill Trees: Hexagonale Tiles, XP-System, Badges. Open Source, fuer alle Werkstaetten nutzbar.',
    tags: 'digital,gamification,skilltree,opensource',
    lat: 51.6168, lng: 12.4415, goal: 2000, current: 800,
  },
  {
    title: 'Jugend-Werkstatt Ferropolis',
    description: 'Eine permanente Jugend-Werkstatt auf dem Ferropolis-Gelaende. Offen nach der Schule, betreut von Ehrenamtlichen. Holz, Metall, Elektronik.',
    tags: 'jugend,werkstatt,ferropolis,bildung,ehrenamt',
    lat: 51.6175, lng: 12.4430, goal: 15000, current: 4500,
  },
]

// ─── Einfuegen ───

console.log('Macher-Map Demo-Daten Seed-Script')
console.log('==================================')
console.log(`DB: ${DB_PATH}`)
console.log('')

const tx = db.transaction(() => {
  const userIds = []
  const werkstattIds = []

  // Users
  for (const u of users) {
    const id = randomUUID()
    const email = u.name.toLowerCase().replace(/\s/g, '.').replace(/[äöüß]/g, c => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' }[c] || c)) + '@demo.macher-map.org'
    try {
      db.prepare('INSERT INTO users (id, email, password_hash, name, statement, bio, telegram, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, 1)').run(id, email, DEMO_PASSWORD, u.name, u.statement, u.bio, u.telegram)
      userIds.push(id)
      console.log(`  + User: ${u.name} (${email})`)
    } catch (e) {
      console.log(`  ~ User ${u.name} existiert bereits, uebersprungen`)
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
      userIds.push(existing?.id || id)
    }
  }

  // Light Pins (Macher auf der Karte)
  for (let i = 0; i < userIds.length; i++) {
    const lat = 51.45 + Math.random() * 0.45
    const lng = 11.9 + Math.random() * 0.8
    try {
      db.prepare('DELETE FROM lights WHERE user_id = ?').run(userIds[i])
      const lightId = randomUUID()
      db.prepare('INSERT INTO lights (id, user_id, lat, lng) VALUES (?, ?, ?, ?)').run(lightId, userIds[i], lat, lng)
      console.log(`  + Pin: ${users[i].name} at ${lat.toFixed(3)}, ${lng.toFixed(3)}`)
    } catch (e) {
      console.log(`  ~ Pin fuer ${users[i].name} fehlgeschlagen: ${e.message}`)
    }
  }

  // Werkstaetten
  for (let i = 0; i < werkstaetten.length; i++) {
    const w = werkstaetten[i]
    const userId = userIds[i % userIds.length]
    const id = randomUUID()
    try {
      db.prepare('INSERT INTO lichtungen (id, user_id, name, description, lat, lng, tags) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, userId, w.name, w.description, w.lat, w.lng, w.tags)
      db.prepare('INSERT INTO lichtung_members (lichtung_id, user_id, role) VALUES (?, ?, ?)').run(id, userId, 'owner')
      const code = randomUUID().slice(0, 8)
      db.prepare('INSERT INTO lichtung_codes (lichtung_id, code) VALUES (?, ?)').run(id, code)
      werkstattIds.push(id)
      console.log(`  + Werkstatt: ${w.name}`)
    } catch (e) {
      console.log(`  ~ Werkstatt ${w.name} fehlgeschlagen: ${e.message}`)
      werkstattIds.push(null)
    }
  }

  // Events
  for (const ev of events) {
    const w = werkstaetten[ev.werkstattIndex]
    const wId = werkstattIds[ev.werkstattIndex]
    const userId = userIds[ev.werkstattIndex % userIds.length]
    const id = randomUUID()
    try {
      db.prepare(`
        INSERT INTO events (id, user_id, title, description, lat, lng, start_time, end_time, type, tags, lichtung_id, max_participants)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, userId, ev.title, ev.description, w.lat, w.lng, ev.start, ev.end || null, ev.type || 'workshop', ev.tags, wId, ev.max || null)
      // Zufaellige Teilnehmer
      const participantCount = Math.floor(Math.random() * Math.min(6, userIds.length))
      const shuffled = [...userIds].sort(() => Math.random() - 0.5)
      for (let j = 0; j < participantCount; j++) {
        if (shuffled[j] !== userId) {
          try { db.prepare('INSERT OR IGNORE INTO event_participants (event_id, user_id, status) VALUES (?, ?, ?)').run(id, shuffled[j], 'joined') } catch {}
        }
      }
      console.log(`  + Event: ${ev.title} (${participantCount} Teilnehmer)`)
    } catch (e) {
      console.log(`  ~ Event ${ev.title} fehlgeschlagen: ${e.message}`)
    }
  }

  // Projekte
  for (const p of projects) {
    const userId = userIds[Math.floor(Math.random() * userIds.length)]
    const id = randomUUID()
    try {
      db.prepare(`
        INSERT INTO projects (id, user_id, title, description, lat, lng, tags, goal_amount, current_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `).run(id, userId, p.title, p.description, p.lat, p.lng, p.tags, p.goal, p.current)

      // Milestones
      const milestones = [
        { title: 'Material beschaffen', goal: Math.floor(p.goal * 0.3) },
        { title: 'Bau-Phase', goal: Math.floor(p.goal * 0.7) },
        { title: 'Fertigstellung', goal: p.goal },
      ]
      for (let m = 0; m < milestones.length; m++) {
        db.prepare('INSERT INTO project_milestones (id, project_id, title, goal_amount, sort_order, reached) VALUES (?, ?, ?, ?, ?, ?)').run(
          randomUUID(), id, milestones[m].title, milestones[m].goal, m, p.current >= milestones[m].goal ? 1 : 0
        )
      }
      console.log(`  + Projekt: ${p.title} (${Math.round(p.current/p.goal*100)}% finanziert)`)
    } catch (e) {
      console.log(`  ~ Projekt ${p.title} fehlgeschlagen: ${e.message}`)
    }
  }

  // Connections (einige Macher kennen sich)
  for (let i = 0; i < 10; i++) {
    const a = userIds[Math.floor(Math.random() * userIds.length)]
    const b = userIds[Math.floor(Math.random() * userIds.length)]
    if (a !== b) {
      const [sorted_a, sorted_b] = [a, b].sort()
      try { db.prepare('INSERT OR IGNORE INTO connections (user_a, user_b) VALUES (?, ?)').run(sorted_a, sorted_b) } catch {}
    }
  }
  console.log('  + 10 Verbindungen zwischen Machern')

  // Macher-Tags
  const macherTags = ['holz', 'metall', 'schweissen', 'schmieden', 'elektronik', 'arduino', '3ddruck', 'laser', 'cnc', 'naehen', 'textil', 'upcycling', 'keramik', 'toepfern', 'fahrrad', 'reparatur', 'lehm', 'permakultur', 'siebdruck', 'modellbau', 'drohne', 'moebel', 'messer', 'outdoor', 'solar', 'workshop', 'kinder', 'jugend', 'anfaenger', 'fortgeschritten']
  for (const tag of macherTags) {
    try { db.prepare('INSERT OR IGNORE INTO tags (id, name, usage_count) VALUES (?, ?, ?)').run(randomUUID(), tag, Math.floor(Math.random() * 20) + 1) } catch {}
  }
  console.log(`  + ${macherTags.length} Macher-Tags`)
})

try {
  tx()
  console.log('')
  console.log('Fertig! Demo-Daten eingefuegt:')
  console.log(`  ${users.length} Macher (User)`)
  console.log(`  ${users.length} Macher-Pins (Karte)`)
  console.log(`  ${werkstaetten.length} Werkstaetten`)
  console.log(`  ${events.length} Abenteuer/Events`)
  console.log(`  ${projects.length} Bauprojekte`)
  console.log('')
  console.log('Alle Demo-User: Passwort = "macher2026"')
  console.log('Region: Ferropolis / Dessau / Halle / Wittenberg / Leipzig')
} catch (e) {
  console.error('Fehler beim Seeden:', e.message)
}

db.close()
