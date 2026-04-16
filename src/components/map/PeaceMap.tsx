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

function createLightEl() {
  const el = document.createElement('div')
  el.className = 'light-pin-marker'
  el.innerHTML = `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="lg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFFFF0" stop-opacity="1"/>
        <stop offset="30%" stop-color="#FFF8D0" stop-opacity="0.9"/>
        <stop offset="60%" stop-color="#F5E090" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#D4A843" stop-opacity="0"/>
      </radialGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
    </defs>
    <circle cx="14" cy="14" r="12" fill="url(#lg)" filter="url(#glow)" opacity="0.9"/>
    <circle cx="14" cy="14" r="4" fill="#FFFFF0" opacity="0.95"/>
  </svg>`
  el.style.cursor = 'pointer'
  return el
}

function createEventEl() {
  const el = document.createElement('div')
  el.innerHTML = `<svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="eg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#E8D5F0" stop-opacity="1"/>
        <stop offset="60%" stop-color="#C9A8E0" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#A07CC0" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="15" cy="15" r="13" fill="url(#eg)" opacity="0.85"/>
    <circle cx="15" cy="15" r="5" fill="#E8D5F0" opacity="0.95"/>
  </svg>`
  el.style.cursor = 'pointer'
  return el
}

function createLichtungEl() {
  const el = document.createElement('div')
  el.innerHTML = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="rgba(123,174,94,0.15)" stroke="#7BAE5E" stroke-width="1.5"/>
    <circle cx="16" cy="16" r="5" fill="#7BAE5E" opacity="0.8"/>
  </svg>`
  el.style.cursor = 'pointer'
  return el
}

function popupHtml(light: LightPin) {
  const img = (light as any).image_path
    ? `<img src="${(light as any).image_path}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;margin:0 auto 8px;border:2px solid rgba(212,168,67,0.4);display:block"/>`
    : ''
  const name = light.name ? `<p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:0.92rem;font-weight:500;color:rgba(10,10,10,0.7);margin:0 0 4px">${light.name}</p>` : ''
  const stmt = light.statement ? `<p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:0.85rem;font-style:italic;color:rgba(10,10,10,0.55);margin:0;line-height:1.5">"${light.statement.length > 90 ? light.statement.slice(0, 90).trim() + '…' : light.statement}"</p>` : ''
  return `<div style="text-align:center;padding:4px 0;min-width:160px;max-width:200px">${img}${name}${stmt}</div>`
}

function eventPopupHtml(event: EventItem) {
  const labels: Record<string, string> = { meditation: 'Meditation', gebet: 'Gebet', stille: 'Stille', begegnung: 'Begegnung', tanz: 'Tanz', fest: 'Fest' }
  const date = new Date(event.start).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  return `<div style="padding:4px 0;max-width:220px">
    <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:1rem;font-weight:600;color:#0A0A0A;margin:0 0 2px">${event.title}</p>
    <p style="font-family:Inter,sans-serif;font-size:0.72rem;color:#D4A843;margin:0 0 6px">${labels[event.type] || event.type}</p>
    <p style="font-family:Inter,sans-serif;font-size:0.78rem;color:rgba(10,10,10,0.5);margin:0 0 6px">${date}</p>
    ${event.description ? `<p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:0.88rem;font-style:italic;color:rgba(10,10,10,0.6);margin:0;line-height:1.5">${event.description.slice(0, 120)}</p>` : ''}
  </div>`
}

export function PeaceMap({ onMapClick, placingLight, showLights = true, showEvents = true, onZoomChange, onCenterChange, onRadiusChange, flyTo, zoomToRadius, lichtungen = [], onLichtungClick, onShowProfile }: PeaceMapProps) {
  const { lights, events } = useApp()
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

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

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left')

    mapRef.current = map

    return () => { map.remove(); mapRef.current = null }
  }, [styleUrl])

  // Click handler
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const handler = (e: maplibregl.MapMouseEvent) => {
      if (placingLight && onMapClick) {
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
    map.on('zoomend', handler)
    handler()
    return () => { map.off('moveend', handler); map.off('zoomend', handler) }
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

  // Render markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Clear old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    // Light markers
    if (showLights) {
      for (const light of lights) {
        if (!light.position[0] || !light.position[1]) continue
        const el = createLightEl()
        const popup = new maplibregl.Popup({ offset: 16, closeButton: false, maxWidth: '240px' })
          .setHTML(popupHtml(light))

        el.addEventListener('click', (e) => {
          e.stopPropagation()
          if (onShowProfile) onShowProfile(light)
        })

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([light.position[1], light.position[0]])
          .setPopup(popup)
          .addTo(map)
        markersRef.current.push(marker)
      }
    }

    // Event markers
    if (showEvents) {
      for (const event of events) {
        if (!event.position[0] || !event.position[1]) continue
        const el = createEventEl()
        const popup = new maplibregl.Popup({ offset: 16, closeButton: false, maxWidth: '260px' })
          .setHTML(eventPopupHtml(event))

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([event.position[1], event.position[0]])
          .setPopup(popup)
          .addTo(map)
        markersRef.current.push(marker)
      }
    }

    // Lichtung markers
    for (const l of lichtungen) {
      if (!l.lat || !l.lng) continue
      const el = createLichtungEl()
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        if (onLichtungClick) onLichtungClick(l.id)
      })

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([l.lng, l.lat])
        .addTo(map)
      markersRef.current.push(marker)
    }
  }, [lights, events, lichtungen, showLights, showEvents, onLichtungClick, onShowProfile])

  return (
    <div
      ref={mapContainer}
      className="h-full w-full"
      style={{ position: 'absolute', inset: 0 }}
    />
  )
}
