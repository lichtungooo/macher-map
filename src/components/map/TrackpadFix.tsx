import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

/**
 * Fix fuer traege Trackpad-Gesten auf Leaflet.
 * Erkennt Trackpad-Events (deltaMode=0, kein ctrlKey, kleine deltaY)
 * und fuehrt den Zoom direkt aus, ohne Leaflets Debouncing.
 * Mausrad bleibt bei Leaflets eigenem Handler.
 */
export function TrackpadFix() {
  const map = useMap()

  useEffect(() => {
    let accum = 0
    let lastTime = 0

    function onWheel(e: WheelEvent) {
      // Nur Trackpad abfangen: Pixel-Mode, kleine Werte, kein ctrlKey
      const isTrackpad = e.deltaMode === 0 && !e.ctrlKey && Math.abs(e.deltaY) < 60

      if (!isTrackpad) return // Mausrad -> Leaflet macht es selbst

      e.preventDefault()
      e.stopPropagation()

      const now = performance.now()
      const dt = now - lastTime
      lastTime = now

      // Akkumulieren fuer 32ms-Fenster (2 Frames) — glatter
      if (dt < 32) {
        accum += -e.deltaY / 120
      } else {
        accum = -e.deltaY / 120
      }

      const newZoom = Math.max(2, Math.min(19, map.getZoom() + accum))
      map.setZoom(newZoom, { animate: false })
      accum = 0
    }

    const container = map.getContainer()
    container.addEventListener('wheel', onWheel, { passive: false, capture: true })

    return () => {
      container.removeEventListener('wheel', onWheel, { capture: true } as EventListenerOptions)
    }
  }, [map])

  return null
}
