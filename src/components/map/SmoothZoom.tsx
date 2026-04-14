import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

/**
 * Smooth Wheel Zoom — Google-Maps-Feeling fuer Leaflet.
 * Nutzt map._zoom direkt fuer flackerfreies Zoomen.
 */
export function SmoothZoom() {
  const map = useMap()

  useEffect(() => {
    // Standard-Wheel-Zoom deaktivieren
    map.scrollWheelZoom.disable()

    let targetZoom = map.getZoom()
    let currentZoom = targetZoom
    let animFrameId = 0

    function animate() {
      const diff = targetZoom - currentZoom

      if (Math.abs(diff) < 0.003) {
        currentZoom = targetZoom
        animFrameId = 0
        return
      }

      // Sanfte Interpolation — 20% pro Frame
      currentZoom += diff * 0.2

      // setView statt setZoom — verhindert Tile-Flackern
      const center = map.getCenter()
      map.setView(center, currentZoom, { animate: false })

      animFrameId = requestAnimationFrame(animate)
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      e.stopPropagation()

      // Delta normalisieren
      let delta: number
      if (e.ctrlKey) {
        // Trackpad Pinch-Zoom (Browser sendet ctrlKey + deltaY)
        delta = -e.deltaY / 100
      } else if (e.deltaMode === 0) {
        // Trackpad Scroll (Pixel)
        delta = -e.deltaY / 150
      } else {
        // Mausrad (Zeilen)
        delta = e.deltaY > 0 ? -1 : 1
      }

      targetZoom = Math.max(2, Math.min(19, targetZoom + delta))

      if (!animFrameId) {
        currentZoom = map.getZoom()
        animFrameId = requestAnimationFrame(animate)
      }
    }

    const container = map.getContainer()
    container.addEventListener('wheel', onWheel, { passive: false })

    // Sync wenn Zoom sich anderweitig aendert (z.B. flyTo, Buttons)
    const syncZoom = () => {
      targetZoom = map.getZoom()
      currentZoom = targetZoom
    }
    map.on('zoomend', syncZoom)

    return () => {
      container.removeEventListener('wheel', onWheel)
      map.off('zoomend', syncZoom)
      if (animFrameId) cancelAnimationFrame(animFrameId)
    }
  }, [map])

  return null
}
