import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

/**
 * Smooth Wheel Zoom — Google-Maps-Feeling fuer Leaflet.
 * Ersetzt das Standard-Scrollwheel-Zoom durch einen
 * requestAnimationFrame-basierten Smooth-Zoom.
 */
export function SmoothZoom() {
  const map = useMap()

  useEffect(() => {
    // Standard-Wheel-Zoom deaktivieren
    map.scrollWheelZoom.disable()

    let targetZoom = map.getZoom()
    let animating = false

    function animate() {
      const currentZoom = map.getZoom()
      const diff = targetZoom - currentZoom

      if (Math.abs(diff) < 0.005) {
        animating = false
        return
      }

      // Sanfte Interpolation — 15% pro Frame (~60fps)
      const step = diff * 0.15
      map.setZoom(currentZoom + step, { animate: false })

      requestAnimationFrame(animate)
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      e.stopPropagation()

      // Delta normalisieren — Trackpad liefert kleine Werte, Mausrad grosse
      let delta = -e.deltaY

      // Trackpad-Erkennung: deltaMode 0 + kleine Werte
      if (e.deltaMode === 0) {
        // Pixel-basiert (Trackpad) — feinere Kontrolle
        delta = delta / 120
      } else {
        // Zeilen-basiert (Mausrad) — groessere Schritte
        delta = delta > 0 ? 1 : -1
      }

      // Zoom-Geschwindigkeit: schnelles Scrollen = mehr Zoom
      const speed = 0.8
      targetZoom = Math.max(2, Math.min(19, targetZoom + delta * speed))

      if (!animating) {
        animating = true
        requestAnimationFrame(animate)
      }
    }

    const container = map.getContainer()
    container.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', onWheel)
    }
  }, [map])

  return null
}
