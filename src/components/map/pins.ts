import L from 'leaflet'

// ─── Werkstatt-Kategorie-Icons (SVG paths, viewBox 0 0 16 16) ───

const CATEGORY_ICONS: Record<string, string> = {
  holz: `<g fill="currentColor">
    <rect x="7" y="1" width="2" height="10" rx=".5"/>
    <rect x="3" y="1" width="10" height="3.5" rx="1.5"/>
    <circle cx="5" cy="13" r="2" fill="none" stroke="currentColor" stroke-width="1.3"/>
    <line x1="6.4" y1="11.6" x2="8" y2="10" stroke="currentColor" stroke-width="1.3"/>
  </g>`,
  metall: `<g fill="currentColor">
    <path d="M3 3l3 3-1.5 1.5L1.5 4.5z"/>
    <rect x="5.5" y="5.5" width="1.8" height="8" rx=".5" transform="rotate(-45 6.4 9.5)"/>
    <path d="M13 3l-3 3 1.5 1.5 3-3z" opacity=".6"/>
    <rect x="8.7" y="5.5" width="1.8" height="8" rx=".5" transform="rotate(45 9.6 9.5)" opacity=".6"/>
  </g>`,
  elektro: `<g fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round">
    <path d="M9 1L5 7h3l-2 8"/>
    <circle cx="12" cy="4" r="1.5" fill="currentColor" opacity=".4"/>
    <circle cx="3" cy="12" r="1.5" fill="currentColor" opacity=".4"/>
  </g>`,
  digital: `<g fill="currentColor">
    <rect x="2" y="3" width="12" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3"/>
    <rect x="5" y="11" width="6" height="1.5" rx=".5"/>
    <circle cx="8" cy="7" r="1.5"/>
  </g>`,
  textil: `<g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
    <path d="M4 14L8 2"/>
    <path d="M6 12c-3-2 0-5 2-3s5-1 3-3"/>
    <circle cx="12" cy="4" r="2" fill="currentColor" opacity=".3"/>
  </g>`,
  keramik: `<g fill="currentColor">
    <path d="M4 4c0 0-1 3-.5 6s1.5 4 4.5 4 4-1.5 4.5-4S12 4 12 4z" fill="none" stroke="currentColor" stroke-width="1.3"/>
    <ellipse cx="8" cy="4" rx="4" ry="1.2"/>
  </g>`,
  schmieden: `<g fill="currentColor">
    <rect x="6.5" y="1" width="3" height="5" rx="1"/>
    <rect x="4" y="1" width="8" height="3" rx="1.2"/>
    <rect x="7" y="6" width="2" height="6" rx=".4"/>
    <ellipse cx="8" cy="14" rx="3" ry="1.2" opacity=".3"/>
  </g>`,
  fahrrad: `<g fill="none" stroke="currentColor" stroke-width="1.2">
    <circle cx="4.5" cy="10.5" r="3"/>
    <circle cx="11.5" cy="10.5" r="3"/>
    <path d="M4.5 10.5L7 5h3l1.5 5.5" stroke-linejoin="round"/>
    <rect x="6" y="4" width="4.5" height="1.5" rx=".5" fill="currentColor"/>
  </g>`,
  siebdruck: `<g fill="currentColor">
    <rect x="2" y="3" width="12" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <line x1="2" y1="6.5" x2="14" y2="6.5" stroke="currentColor" stroke-width="1"/>
    <rect x="5" y="10" width="6" height="3" rx=".5" opacity=".5"/>
    <circle cx="6" cy="5" r="1"/>
    <circle cx="10" cy="5" r="1"/>
  </g>`,
  laser: `<g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
    <path d="M8 2v7"/>
    <path d="M5 12h6" stroke-width="1.5"/>
    <circle cx="8" cy="9" r="1.5" fill="currentColor" opacity=".5"/>
    <path d="M4 4l2 2M12 4l-2 2" opacity=".5"/>
  </g>`,
  reparatur: `<g fill="currentColor">
    <path d="M3 11l5-5 1.5 1.5-5 5z"/>
    <circle cx="11" cy="5" r="3.5" fill="none" stroke="currentColor" stroke-width="1.3"/>
    <path d="M9.5 3.5l3 3" stroke="currentColor" stroke-width="1.2"/>
  </g>`,
  default: `<g fill="currentColor">
    <rect x="6.5" y="1" width="3" height="5" rx="1"/>
    <rect x="4" y="1" width="8" height="3" rx="1.2"/>
    <rect x="7" y="6" width="2" height="8" rx=".4"/>
  </g>`,
}

const CATEGORY_ALIASES: Record<string, string> = {
  '3ddruck': 'digital',
  cnc: 'digital',
  naehen: 'textil',
  toepfern: 'keramik',
  lehm: 'keramik',
  modellbau: 'holz',
}

// ─── Farb-System ───

export const WERKSTATT_COLORS: Record<string, string> = {
  holz: '#C4883C',
  metall: '#7A8B99',
  elektronik: '#2D7DD2',
  elektro: '#2D7DD2',
  '3ddruck': '#2D7DD2',
  cnc: '#2D7DD2',
  laser: '#2D7DD2',
  naehen: '#C07090',
  textil: '#C07090',
  keramik: '#B06840',
  toepfern: '#B06840',
  schmieden: '#E8751A',
  fahrrad: '#45B764',
  reparatur: '#45B764',
  siebdruck: '#9B59B6',
  lehm: '#8B7355',
  modellbau: '#E0A050',
  digital: '#2D7DD2',
  default: '#E8751A',
}

export const EVENT_COLORS: Record<string, string> = {
  workshop: '#E8751A',
  kurs: '#2D7DD2',
  bau: '#45B764',
  wettbewerb: '#D4A020',
  treffen: '#9B59B6',
  offen: '#7A8B99',
}

// ─── Helfer ───

function getCategoryKey(tags?: string): string {
  if (!tags) return 'default'
  for (const tag of tags.split(',')) {
    const t = tag.trim().toLowerCase()
    if (CATEGORY_ICONS[t]) return t
    if (CATEGORY_ALIASES[t]) return CATEGORY_ALIASES[t]
  }
  return 'default'
}

export function getWerkstattColor(tags?: string): string {
  if (!tags) return WERKSTATT_COLORS.default
  for (const tag of tags.split(',')) {
    const c = WERKSTATT_COLORS[tag.trim().toLowerCase()]
    if (c) return c
  }
  return WERKSTATT_COLORS.default
}

// ─── Pin-Generatoren ───

export function createWerkstattPin(tags?: string): L.DivIcon {
  const cat = getCategoryKey(tags)
  const color = getWerkstattColor(tags)
  const icon = CATEGORY_ICONS[cat] || CATEGORY_ICONS.default

  const svg = `<svg width="44" height="52" viewBox="0 0 44 52" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="ws-${cat}" x="-25%" y="-15%" width="150%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="${color}" flood-opacity="0.3"/>
      </filter>
    </defs>
    <path d="M22 2C11 2 2 11 2 22c0 15 20 28 20 28s20-13 20-28C42 11 33 2 22 2z"
      fill="${color}" filter="url(#ws-${cat})" stroke="white" stroke-width="1.8"/>
    <circle cx="22" cy="19" r="12.5" fill="white" opacity="0.97"/>
    <g transform="translate(14, 11)" color="${color}" style="color:${color}">
      ${icon}
    </g>
  </svg>`

  return L.divIcon({
    html: `<div class="werkstatt-marker">${svg}</div>`,
    className: '',
    iconSize: [44, 52],
    iconAnchor: [22, 52],
    popupAnchor: [0, -54],
  })
}

export function createEventPin(type: string): L.DivIcon {
  const color = EVENT_COLORS[type] || EVENT_COLORS.workshop

  const svg = `<svg width="38" height="46" viewBox="0 0 38 46" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="ev-${type}" x="-25%" y="-15%" width="150%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${color}" flood-opacity="0.3"/>
      </filter>
    </defs>
    <path d="M19 2C10 2 2 10 2 19c0 13 17 25 17 25s17-12 17-25C36 10 28 2 19 2z"
      fill="${color}" filter="url(#ev-${type})" stroke="white" stroke-width="1.5"/>
    <circle cx="19" cy="17" r="10.5" fill="white" opacity="0.97"/>
    <g transform="translate(12.5, 9.5)">
      <path d="M7.5 0L3.5 7h3L4.5 14l6-7.5H7.5L9.5 0z" fill="${color}" opacity="0.85"/>
    </g>
  </svg>`

  return L.divIcon({
    html: `<div class="event-pin-marker">${svg}</div>`,
    className: '',
    iconSize: [38, 46],
    iconAnchor: [19, 46],
    popupAnchor: [0, -48],
  })
}

export function createMacherPin(): L.DivIcon {
  const svg = `<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="mp" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#E8751A" flood-opacity="0.25"/>
      </filter>
    </defs>
    <circle cx="18" cy="18" r="15" fill="#E8751A" filter="url(#mp)" stroke="white" stroke-width="2.2"/>
    <g transform="translate(10, 9)" fill="white" opacity="0.95">
      <rect x="5.5" y="0" width="5" height="3" rx="1.2"/>
      <rect x="7" y="2.5" width="2" height="9" rx=".5"/>
      <path d="M4 12.5c0-1.5 1-2.5 4-2.5s4 1 4 2.5" fill="none" stroke="white" stroke-width="1.3"/>
    </g>
  </svg>`

  return L.divIcon({
    html: `<div class="macher-pin-marker">${svg}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

export function createProjectPin(progress: number): L.DivIcon {
  const color = '#45B764'
  const r = 13
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(1, Math.max(0, progress)))

  const svg = `<svg width="44" height="52" viewBox="0 0 44 52" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="pj" x="-25%" y="-15%" width="150%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="${color}" flood-opacity="0.3"/>
      </filter>
    </defs>
    <path d="M22 2C11 2 2 11 2 22c0 15 20 28 20 28s20-13 20-28C42 11 33 2 22 2z"
      fill="${color}" filter="url(#pj)" stroke="white" stroke-width="1.8"/>
    <circle cx="22" cy="19" r="13" fill="white" opacity="0.97"/>
    <circle cx="22" cy="19" r="${r}" fill="none" stroke="rgba(69,183,100,0.15)" stroke-width="2.8"/>
    ${progress > 0 ? `<circle cx="22" cy="19" r="${r}" fill="none" stroke="${color}" stroke-width="2.8"
      stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"
      transform="rotate(-90 22 19)" opacity="0.8"/>` : ''}
    <g transform="translate(16, 13)" fill="${color}" opacity="0.8">
      <circle cx="6" cy="6" r="3" fill="none" stroke="${color}" stroke-width="1.5"/>
      <rect x="5" y="0" width="2" height="2.5" rx=".4"/>
      <rect x="5" y="9.5" width="2" height="2.5" rx=".4"/>
      <rect x="0" y="5" width="2.5" height="2" rx=".4"/>
      <rect x="9.5" y="5" width="2.5" height="2" rx=".4"/>
    </g>
  </svg>`

  return L.divIcon({
    html: `<div class="project-marker">${svg}</div>`,
    className: '',
    iconSize: [44, 52],
    iconAnchor: [22, 52],
    popupAnchor: [0, -54],
  })
}

// ─── Cluster ───

export function createClusterIcon(cluster: any): L.DivIcon {
  const count = cluster.getChildCount()
  const children = cluster.getAllChildMarkers()

  const catCounts: Record<string, number> = {}
  for (const m of children) {
    const el = m.getElement?.()
    const cls = el?.querySelector?.('.werkstatt-marker') ? 'werkstatt'
      : el?.querySelector?.('.event-pin-marker') ? 'event'
      : el?.querySelector?.('.project-marker') ? 'project'
      : 'macher'
    catCounts[cls] = (catCounts[cls] || 0) + 1
  }

  const dominant = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'macher'
  const colorMap: Record<string, string> = {
    werkstatt: '#E8751A',
    event: '#2D7DD2',
    project: '#45B764',
    macher: '#D4A020',
  }
  const color = colorMap[dominant]

  const size = count < 10 ? 40 : count < 50 ? 48 : count < 200 ? 56 : 64
  const fontSize = count < 10 ? '0.82rem' : count < 50 ? '0.88rem' : '0.95rem'

  const segments = Object.entries(catCounts)
  const total = segments.reduce((s, [, v]) => s + v, 0)
  let ringParts = ''
  const r = (size / 2) - 4
  const circ = 2 * Math.PI * r

  if (segments.length > 1) {
    let offset = 0
    for (const [cat, cnt] of segments) {
      const len = (cnt / total) * circ
      ringParts += `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none"
        stroke="${colorMap[cat] || '#E8751A'}" stroke-width="3"
        stroke-dasharray="${len} ${circ - len}" stroke-dashoffset="${-offset}"
        transform="rotate(-90 ${size / 2} ${size / 2})"/>`
      offset += len
    }
  }

  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="white" stroke="${color}" stroke-width="2" opacity="0.95"/>
    ${ringParts}
    <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="central"
      fill="#1A1A1A" font-family="Inter, sans-serif" font-weight="700" font-size="${fontSize}">${count}</text>
  </svg>`

  return L.divIcon({
    html: svg,
    className: 'macher-cluster-wrap',
    iconSize: [size, size],
  })
}
