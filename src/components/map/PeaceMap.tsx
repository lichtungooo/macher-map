import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { useApp } from '../../context/AppContext'
import type { LightPin, EventItem } from '../../context/AppContext'

const STYLES: Record<string, string> = {
  liberty: 'https://tiles.openfreemap.org/styles/liberty',
  bright: 'https://tiles.openfreemap.org/styles/bright',
  positron: 'https://tiles.openfreemap.org/styles/positron',
}

interface PeaceMapProps {
  onMapClick?: (position: [number, number]) => void
  placingLight?: boolean
  showLights?: boolean
  showEvents?: boolean
  onZoomChange?: (zoom: number) => void
  onCenterChange?: (center: [number, number]) => void
  onRadiusChange?: (radiusKm: number) => void
  flyTo?: [number, number, number] | null
  zoomToRadius?: number | null
  lichtungen?: any[]
  onLichtungClick?: (id: string) => void
  onShowProfile?: (light: any) => void
  chainData?: any[]
  showChain?: boolean
}

// ─── Marker-Elemente ───

let _pid = 0

function createLightEl() {
  const id = 'lp' + (_pid++)
  const el = document.createElement('div')
  el.className = 'light-pin-marker'
  // will-change und backface-visibility fuer stabile GPU-Beschleunigung
  el.style.cssText = 'width:52px;height:52px;cursor:pointer;will-change:transform;backface-visibility:hidden;-webkit-backface-visibility:hidden;'

  // SVG als DOM-Elemente statt innerHTML — stabiler bei MapLibre
  const ns = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('width', '52')
  svg.setAttribute('height', '52')
  svg.setAttribute('viewBox', '0 0 52 52')

  const defs = document.createElementNS(ns, 'defs')

  // Gradient A — aeusserer Glow
  const gradA = document.createElementNS(ns, 'radialGradient')
  gradA.id = `${id}a`
  gradA.setAttribute('cx', '50%')
  gradA.setAttribute('cy', '50%')
  gradA.setAttribute('r', '50%')
  const stopsA = [
    ['0%', '#FFFFF3', '1'], ['10%', '#FEF4D2', '1'],
    ['25%', '#FAECC3', '.95'], ['42%', '#F4E3BB', '.8'],
    ['60%', '#EED9AC', '.5'], ['78%', '#DEC895', '.2'],
    ['100%', '#DEC895', '0'],
  ]
  for (const [offset, color, opacity] of stopsA) {
    const stop = document.createElementNS(ns, 'stop')
    stop.setAttribute('offset', offset)
    stop.setAttribute('stop-color', color)
    stop.setAttribute('stop-opacity', opacity)
    gradA.appendChild(stop)
  }

  // Gradient B — innerer Kern
  const gradB = document.createElementNS(ns, 'radialGradient')
  gradB.id = `${id}b`
  gradB.setAttribute('cx', '50%')
  gradB.setAttribute('cy', '50%')
  gradB.setAttribute('r', '50%')
  const stopsB = [
    ['0%', '#fff', '1'], ['35%', '#FFFFF3', '.95'], ['100%', '#FEF4D2', '0'],
  ]
  for (const [offset, color, opacity] of stopsB) {
    const stop = document.createElementNS(ns, 'stop')
    stop.setAttribute('offset', offset)
    stop.setAttribute('stop-color', color)
    stop.setAttribute('stop-opacity', opacity)
    gradB.appendChild(stop)
  }

  defs.appendChild(gradA)
  defs.appendChild(gradB)
  svg.appendChild(defs)

  // Kreise
  const circles = [
    { cx: 26, cy: 26, r: 25, fill: `url(#${id}a)` },
    { cx: 26, cy: 26, r: 19, fill: 'none', stroke: '#F4E3BB', strokeWidth: '.6', opacity: '.5' },
    { cx: 26, cy: 26, r: 14, fill: 'none', stroke: '#FAECC3', strokeWidth: '.5', opacity: '.4' },
    { cx: 26, cy: 26, r: 9, fill: 'none', stroke: '#FEF4D2', strokeWidth: '.4', opacity: '.35' },
    { cx: 26, cy: 26, r: 5.5, fill: `url(#${id}b)` },
    { cx: 26, cy: 26, r: 2.5, fill: '#fff', opacity: '.95' },
  ]

  for (const c of circles) {
    const circle = document.createElementNS(ns, 'circle')
    circle.setAttribute('cx', String(c.cx))
    circle.setAttribute('cy', String(c.cy))
    circle.setAttribute('r', String(c.r))
    circle.setAttribute('fill', c.fill || 'none')
    if (c.stroke) circle.setAttribute('stroke', c.stroke)
    if (c.strokeWidth) circle.setAttribute('stroke-width', c.strokeWidth)
    if (c.opacity) circle.setAttribute('opacity', c.opacity)
    svg.appendChild(circle)
  }

  el.appendChild(svg)
  return el
}

function createEventEl() {
  const el = document.createElement('div')
  el.className = 'event-pin-marker'
  el.style.cssText = 'width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;will-change:transform;'
  el.innerHTML = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="rgba(160,124,192,0.12)" stroke="#A07CC0" stroke-width="1.5"/>
    <rect x="11" y="10" width="10" height="11" rx="1.5" fill="none" stroke="#A07CC0" stroke-width="1.3"/>
    <line x1="13" y1="9" x2="13" y2="12" stroke="#A07CC0" stroke-width="1.3" stroke-linecap="round"/>
    <line x1="19" y1="9" x2="19" y2="12" stroke="#A07CC0" stroke-width="1.3" stroke-linecap="round"/>
    <line x1="11" y1="15" x2="21" y2="15" stroke="#A07CC0" stroke-width="0.8"/>
  </svg>`
  return el
}

function createLichtungEl(name: string) {
  const el = document.createElement('div')
  el.style.cssText = 'cursor:pointer;display:flex;align-items:center;gap:6px;will-change:transform;'
  el.innerHTML = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="rgba(123,174,94,0.1)" stroke="#7BAE5E" stroke-width="1.5"/>
      <path d="M16 10 C16 10 11 16 11 19 C11 21.8 13.2 24 16 24 C18.8 24 21 21.8 21 19 C21 16 16 10 16 10Z" fill="#7BAE5E" opacity="0.7"/>
      <circle cx="16" cy="18" r="2" fill="#fff" opacity="0.8"/>
    </svg>
    <span style="font-family:Inter,sans-serif;font-size:0.68rem;font-weight:600;color:#5a9240;white-space:nowrap;text-shadow:0 1px 3px rgba(255,255,255,0.9),0 0 6px rgba(255,255,255,0.6)">${name}</span>
  `
  return el
}

function sparkleAt(x: number, y: number) {
  const sparkle = document.createElement('div')
  sparkle.className = 'sparkle-effect'
  sparkle.style.left = x + 'px'
  sparkle.style.top = y + 'px'
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div')
    p.className = 'sparkle-particle'
    const angle = (i / 8) * Math.PI * 2
    const dist = 25 + Math.random() * 20
    const tx = Math.cos(angle) * dist
    const ty = Math.sin(angle) * dist
    p.style.left = '38px'
    p.style.top = '38px'
    p.style.animation = `sparkle-particle 0.5s ease-out ${i * 0.03}s forwards`
    p.style.transform = `translate(${tx}px, ${ty}px) scale(0.3)`
    sparkle.appendChild(p)
  }
  document.body.appendChild(sparkle)
  setTimeout(() => sparkle.remove(), 1200)
}

function popupHtml(light: LightPin) {
  const img = (light as any).image_path
    ? `<img src="${(light as any).image_path}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;margin:0 auto 8px;border:2px solid rgba(212,168,67,0.35);display:block"/>`
    : ''
  const name = light.name ? `<p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:0.92rem;font-weight:500;color:#0A0A0A;margin:0 0 3px">${light.name}</p>` : ''
  const stmt = light.statement ? `<p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:0.82rem;font-style:italic;color:rgba(10,10,10,0.5);margin:0;line-height:1.5">"${light.statement.length > 80 ? light.statement.slice(0, 80).trim() + '…' : light.statement}"</p>` : ''
  return `<div style="text-align:center;padding:4px 0;min-width:140px;max-width:200px">${img}${name}${stmt}</div>`
}

function eventPopupHtml(event: EventItem) {
  const labels: Record<string, string> = { meditation: 'Meditation', gebet: 'Gebet', stille: 'Stille', begegnung: 'Begegnung', tanz: 'Tanz', fest: 'Fest' }
  const date = new Date(event.start).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  return `<div style="padding:2px 0;max-width:200px">
    <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:0.95rem;font-weight:600;color:#0A0A0A;margin:0 0 2px">${event.title}</p>
    <p style="font-family:Inter,sans-serif;font-size:0.68rem;color:#A07CC0;margin:0 0 4px;font-weight:500">${labels[event.type] || event.type}</p>
    <p style="font-family:Inter,sans-serif;font-size:0.72rem;color:rgba(10,10,10,0.45);margin:0 0 4px">${date}</p>
    ${event.description ? `<p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:0.82rem;font-style:italic;color:rgba(10,10,10,0.5);margin:0;line-height:1.4">${event.description.slice(0, 100)}</p>` : ''}
  </div>`
}

// ─── Map Component ───

export function PeaceMap({ onMapClick, placingLight, showLights = true, showEvents = true, onZoomChange, onCenterChange, onRadiusChange, flyTo, zoomToRadius, lichtungen = [], onLichtungClick, onShowProfile }: PeaceMapProps) {
  const { lights, events } = useApp()
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  // Click-Handler refs fuer Cleanup
  const clickHandlersRef = useRef<Map<HTMLElement, () => void>>(new Map())

  const styleKey = localStorage.getItem('lichtung-map-style') || 'liberty'
  const styleUrl = STYLES[styleKey] || STYLES.liberty

  // Init map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [10.0, 50.0],
      zoom: 4.5,
      attributionControl: false,
    })

    // Navigation-Control unten links, kein Logo
    map.addControl(new maplibregl.NavigationControl({ showCompass: false, showZoom: true }), 'bottom-left')

    // MapLibre-Logo sofort und nach dem Laden entfernen
    const removeLogo = () => {
      const logos = map.getContainer().querySelectorAll('.maplibregl-ctrl-logo, .maplibregl-ctrl-attrib, .mapboxgl-ctrl-logo')
      logos.forEach(el => (el as HTMLElement).style.display = 'none')
    }
    removeLogo()
    map.on('load', removeLogo)
    // Sicherheitshalber nochmal nach kurzer Verzoegerung
    setTimeout(removeLogo, 200)
    setTimeout(removeLogo, 1000)

    const doResize = () => { map.resize() }
    map.on('load', doResize)
    setTimeout(doResize, 100)
    setTimeout(doResize, 500)
    window.addEventListener('resize', doResize)

    mapRef.current = map
    return () => {
      window.removeEventListener('resize', doResize)
      map.remove()
      mapRef.current = null
    }
  }, [styleUrl])

  // Click handler
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const handler = (e: maplibregl.MapMouseEvent) => {
      if (placingLight && onMapClick) {
        const point = e.point
        if (point) {
          const canvas = map.getCanvas()
          const rect = canvas.getBoundingClientRect()
          sparkleAt(rect.left + point.x, rect.top + point.y)
        }
        onMapClick([e.lngLat.lat, e.lngLat.lng])
      }
    }
    map.on('click', handler)
    return () => { map.off('click', handler) }
  }, [placingLight, onMapClick])

  // Cursor
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.getCanvas().style.cursor = placingLight ? 'crosshair' : ''
  }, [placingLight])

  // Zoom/Center/Radius callbacks
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const handler = () => {
      if (onZoomChange) onZoomChange(map.getZoom())
      if (onCenterChange) {
        const c = map.getCenter()
        onCenterChange([c.lat, c.lng])
      }
      if (onRadiusChange) {
        const bounds = map.getBounds()
        const center = map.getCenter()
        const ne = bounds.getNorthEast()
        const R = 6371
        const dLat = (ne.lat - center.lat) * Math.PI / 180
        const dLng = (ne.lng - center.lng) * Math.PI / 180
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(center.lat * Math.PI / 180) * Math.cos(ne.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        onRadiusChange(Math.round(dist))
      }
    }
    map.on('moveend', handler)
    handler()
    return () => { map.off('moveend', handler) }
  }, [onZoomChange, onCenterChange, onRadiusChange])

  // Fly to
  useEffect(() => {
    if (!flyTo || !mapRef.current) return
    mapRef.current.flyTo({ center: [flyTo[1], flyTo[0]], zoom: Math.round(flyTo[2]), duration: 1200 })
  }, [flyTo])

  // Zoom to radius
  useEffect(() => {
    if (!zoomToRadius || zoomToRadius <= 0 || !mapRef.current) return
    const zoom = Math.max(2, Math.min(18, Math.log2(20000 / zoomToRadius)))
    mapRef.current.easeTo({ zoom, duration: 300 })
  }, [zoomToRadius])

  // Render markers — mit sauberem Cleanup
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Cleanup: alte Event-Listener entfernen
    clickHandlersRef.current.forEach((handler, el) => {
      el.removeEventListener('click', handler)
    })
    clickHandlersRef.current.clear()

    // Alte Marker entfernen
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    // Light markers
    if (showLights) {
      for (const light of lights) {
        const pos = light.position
        if (!pos || !pos[0] || !pos[1]) continue
        const el = createLightEl()

        if (onShowProfile) {
          const handler = (e: Event) => {
            e.stopPropagation()
            onShowProfile(light)
          }
          el.addEventListener('click', handler)
          clickHandlersRef.current.set(el, handler as () => void)
        }

        const popup = new maplibregl.Popup({ offset: 18, closeButton: false, maxWidth: '220px' })
          .setHTML(popupHtml(light))

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([pos[1], pos[0]])
          .setPopup(popup)
          .addTo(map)
        markersRef.current.push(marker)
      }
    }

    // Event markers
    if (showEvents) {
      for (const event of events) {
        const pos = event.position
        if (!pos || !pos[0] || !pos[1]) continue
        const el = createEventEl()

        const popup = new maplibregl.Popup({ offset: 16, closeButton: false, maxWidth: '240px' })
          .setHTML(eventPopupHtml(event))

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([pos[1], pos[0]])
          .setPopup(popup)
          .addTo(map)
        markersRef.current.push(marker)
      }
    }

    // Lichtung markers
    for (const l of lichtungen) {
      if (!l.lat || !l.lng) continue
      const el = createLichtungEl(l.name || '')

      if (onLichtungClick) {
        const handler = (e: Event) => {
          e.stopPropagation()
          onLichtungClick(l.id)
        }
        el.addEventListener('click', handler)
        clickHandlersRef.current.set(el, handler as () => void)
      }

      const marker = new maplibregl.Marker({ element: el, anchor: 'left' })
        .setLngLat([l.lng, l.lat])
        .addTo(map)
      markersRef.current.push(marker)
    }

    // Cleanup bei Unmount oder Re-Render
    return () => {
      clickHandlersRef.current.forEach((handler, el) => {
        el.removeEventListener('click', handler)
      })
      clickHandlersRef.current.clear()
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
    }
  }, [lights, events, lichtungen, showLights, showEvents, onLichtungClick, onShowProfile])

  return (
    <div
      ref={mapContainer}
      className={placingLight ? 'cursor-wand' : ''}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
    />
  )
}
