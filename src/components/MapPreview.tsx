import { Link } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { User, Sparkles, Share2, Play, Trees } from 'lucide-react'
import { MapContainer, TileLayer, CircleMarker, Polyline } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'

// ─── Demo-Daten: zufaellige Lichter auf der ganzen Welt ───

type Pt = { lat: number; lng: number }

// Seed-basierte Pseudo-Zufallszahlen fuer reproduzierbares Layout
function seed(i: number) {
  let x = Math.sin(i * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

// Normale Lichter (Hintergrund) — zufaellig weltweit
function genBackgroundLights(count: number): Pt[] {
  const pts: Pt[] = []
  // Konzentriert auf bewohnte Kontinente (Europa, Nordamerika, Asien, S-Amerika, Afrika, Australien)
  const regions = [
    { cLat: 50, cLng: 10, spread: 25, weight: 0.35 },   // Europa
    { cLat: 40, cLng: -95, spread: 20, weight: 0.20 },  // Nord-Amerika
    { cLat: 25, cLng: 85, spread: 18, weight: 0.15 },   // Indien/SO-Asien
    { cLat: -20, cLng: -55, spread: 18, weight: 0.10 }, // Suedamerika
    { cLat: 0, cLng: 20, spread: 20, weight: 0.10 },    // Afrika
    { cLat: -25, cLng: 135, spread: 15, weight: 0.05 }, // Australien
    { cLat: 35, cLng: 110, spread: 15, weight: 0.05 },  // China
  ]
  for (let i = 0; i < count; i++) {
    const r = seed(i * 7 + 11)
    let acc = 0, region = regions[0]
    for (const reg of regions) {
      acc += reg.weight
      if (r < acc) { region = reg; break }
    }
    const latOff = (seed(i * 3 + 5) - 0.5) * 2 * region.spread
    const lngOff = (seed(i * 5 + 13) - 0.5) * 2 * region.spread
    pts.push({ lat: region.cLat + latOff, lng: region.cLng + lngOff })
  }
  return pts
}

// Ketten-Lichter — ausgehend von einem Anker, sich ausbreitend
function genChainLights(anchor: Pt): { pos: Pt; parent: number | null }[] {
  const chain: { pos: Pt; parent: number | null }[] = [{ pos: anchor, parent: null }]
  // Generationen
  const layers = [
    { count: 4, radius: 15 },   // Direkte Einladungen
    { count: 7, radius: 30 },   // 2. Generation
    { count: 9, radius: 45 },   // 3. Generation
  ]
  let offset = 1
  for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
    const layer = layers[layerIdx]
    const parentStart = layerIdx === 0 ? 0 : offset - layers[layerIdx - 1].count
    for (let i = 0; i < layer.count; i++) {
      const parentIdx = parentStart + (i % (layerIdx === 0 ? 1 : layers[layerIdx - 1].count))
      const parent = chain[parentIdx]?.pos || anchor
      const angle = seed(layerIdx * 37 + i * 13) * Math.PI * 2
      const r = 3 + seed(layerIdx * 41 + i * 17) * (layer.radius - 3)
      const lat = parent.lat + Math.sin(angle) * r * 0.5
      const lng = parent.lng + Math.cos(angle) * r
      chain.push({ pos: { lat, lng }, parent: parentIdx })
    }
    offset += layer.count
  }
  return chain
}

// Lichtungen (gruene Orte) — wenige, auf Kontinenten verteilt
const LICHTUNGEN: Pt[] = [
  { lat: 52.52, lng: 13.40 },   // Berlin
  { lat: 48.86, lng: 2.35 },    // Paris
  { lat: 40.76, lng: -73.97 },  // NYC
  { lat: 35.68, lng: 139.69 },  // Tokio
  { lat: -33.86, lng: 151.21 }, // Sydney
  { lat: 19.43, lng: -99.13 },  // Mexico
]

const ANCHOR: Pt = { lat: 50.11, lng: 8.68 } // Frankfurt als Anker der Kette

export default function MapPreview() {
  const [chainActive, setChainActive] = useState(false)
  const [reveal, setReveal] = useState(0) // Wieviele Ketten-Lichter schon geleuchtet haben

  const background = useMemo(() => genBackgroundLights(160), [])
  const chain = useMemo(() => genChainLights(ANCHOR), [])

  // Animation: Ketten-Lichter nacheinander aufleuchten lassen
  useEffect(() => {
    if (!chainActive) { setReveal(0); return }
    let i = 0
    const timer = setInterval(() => {
      i++
      setReveal(i)
      if (i >= chain.length) clearInterval(timer)
    }, 120)
    return () => clearInterval(timer)
  }, [chainActive, chain.length])

  const activateChain = () => {
    setChainActive(false)
    setTimeout(() => setChainActive(true), 50)
  }

  // Verbindungslinien — nur so viele, wie schon enthuellt
  const lines = chain
    .map((c, i) => ({ idx: i, parent: c.parent, pos: c.pos }))
    .filter(c => c.parent !== null && c.idx < reveal)
    .map(c => [chain[c.parent!].pos, c.pos] as [Pt, Pt])

  return (
    <section id="karte" className="py-24 section-reveal" style={{ background: '#fff' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* LINKS: Karte */}
          <div className="order-2 lg:order-1">
            <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid rgba(10,10,10,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <MapContainer
                center={[25, 10] as LatLngExpression}
                zoom={1}
                minZoom={1}
                maxZoom={4}
                scrollWheelZoom={false}
                dragging={false}
                zoomControl={false}
                attributionControl={false}
                touchZoom={false}
                doubleClickZoom={false}
                className="w-full"
                style={{ height: '360px', background: '#F5F4F0' }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                />

                {/* Hintergrund-Lichter (viele, klein, dimmed wenn Kette aktiv) */}
                {background.map((p, i) => (
                  <CircleMarker
                    key={`bg-${i}`}
                    center={[p.lat, p.lng]}
                    radius={2}
                    pathOptions={{
                      color: chainActive ? 'rgba(212,168,67,0.15)' : 'rgba(212,168,67,0.35)',
                      fillColor: '#FFF8D0',
                      fillOpacity: chainActive ? 0.25 : 0.7,
                      weight: 0.8,
                    }}
                  />
                ))}

                {/* Lichtungen (gruene Kreise) */}
                {LICHTUNGEN.map((p, i) => (
                  <CircleMarker
                    key={`l-${i}`}
                    center={[p.lat, p.lng]}
                    radius={6}
                    pathOptions={{
                      color: '#7BAE5E',
                      fillColor: '#C9E0B8',
                      fillOpacity: chainActive ? 0.3 : 0.8,
                      weight: 1.8,
                      opacity: chainActive ? 0.4 : 0.9,
                    }}
                  />
                ))}

                {/* Verbindungslinien der Kette */}
                {lines.map((pair, i) => (
                  <Polyline
                    key={`line-${i}`}
                    positions={[[pair[0].lat, pair[0].lng], [pair[1].lat, pair[1].lng]]}
                    pathOptions={{
                      color: '#D4A843',
                      weight: 1.4,
                      opacity: 0.55,
                      dashArray: '3 4',
                    }}
                  />
                ))}

                {/* Ketten-Lichter (hervorgehoben, groesser, leuchten nacheinander auf) */}
                {chain.slice(0, reveal).map((c, i) => (
                  <CircleMarker
                    key={`chain-${i}`}
                    center={[c.pos.lat, c.pos.lng]}
                    radius={i === 0 ? 7 : 5}
                    pathOptions={{
                      color: '#D4A843',
                      fillColor: i === 0 ? '#FFFFF0' : '#FEF4D2',
                      fillOpacity: 1,
                      weight: i === 0 ? 2.5 : 2,
                    }}
                  />
                ))}
              </MapContainer>

              {/* Play-Button Overlay */}
              <button
                onClick={activateChain}
                className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full transition-all shadow-lg"
                style={{
                  background: chainActive ? 'rgba(10,10,10,0.85)' : '#0A0A0A',
                  color: '#fff',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  padding: '9px 16px',
                  border: 'none',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Play size={12} style={{ fill: '#fff' }} />
                {chainActive && reveal < chain.length ? 'Kette waechst…' : chainActive ? 'Nochmal' : 'Sieh deine Kette'}
              </button>

              {/* Legende */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(10,10,10,0.05)' }}>
                <div className="flex items-center gap-2">
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FEF4D2', border: '1.5px solid #D4A843' }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', color: 'rgba(10,10,10,0.55)' }}>Lichter</span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9E0B8', border: '1.5px solid #7BAE5E' }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', color: 'rgba(10,10,10,0.55)' }}>Lichtungen</span>
                </div>
              </div>
            </div>
          </div>

          {/* RECHTS: Texte und Schritte */}
          <div className="order-1 lg:order-2">
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.72rem',
                fontWeight: 500,
                color: '#D4A843',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              Die Friedenskette
            </p>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)',
                fontWeight: 400,
                color: '#0A0A0A',
                lineHeight: 1.2,
                marginBottom: '1.2rem',
              }}
            >
              Ein Licht. Eine Einladung. Ein Geflecht um die Welt.
            </h2>

            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: 'rgba(10,10,10,0.55)',
                marginBottom: '2rem',
              }}
            >
              Du setzt dein Licht. Du laedst Menschen ein. Sie laden Menschen ein.
              Druecke auf <em>Sieh deine Kette</em> — und beobachte, wie aus einem einzigen Licht
              ein leuchtendes Netz wird, das die Erde umspannt.
            </p>

            {/* Drei Schritte — vertikal */}
            <div className="space-y-4 mb-7">
              {[
                { icon: User, title: 'Profil erstellen', text: 'Dein Name, dein Bild, dein Friedens-Statement.' },
                { icon: Sparkles, title: 'Licht auf die Karte setzen', text: 'Waehle einen Ort, der dir am Herzen liegt.' },
                { icon: Share2, title: 'Das Licht teilen', text: 'Jede Einladung knuepft einen neuen Knoten in der Kette.' },
              ].map((s, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(212,168,67,0.08)' }}
                  >
                    <s.icon size={16} style={{ color: '#D4A843' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, color: 'rgba(10,10,10,0.25)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: '#0A0A0A' }}>
                        {s.title}
                      </h3>
                    </div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', lineHeight: 1.55, color: 'rgba(10,10,10,0.5)', paddingLeft: '2rem' }}>
                      {s.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Hinweis auf Lichtungen */}
            <div
              className="flex items-start gap-3 p-3 rounded-lg mb-7"
              style={{ background: 'rgba(123,174,94,0.06)', border: '1px solid rgba(123,174,94,0.12)' }}
            >
              <Trees size={14} style={{ color: '#7BAE5E', marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', lineHeight: 1.55, color: 'rgba(10,10,10,0.55)' }}>
                Auf der Karte leben auch <strong>Lichtungen</strong> — gruene Kreise,
                die reale Orte markieren, an denen sich Menschen treffen.
              </p>
            </div>

            {/* CTA */}
            <Link
              to="/app"
              className="inline-flex items-center gap-2"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: '#fff',
                textDecoration: 'none',
                padding: '14px 32px',
                background: '#0A0A0A',
                borderRadius: '8px',
              }}
            >
              <Sparkles size={16} />
              Dein Licht entzuenden
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
