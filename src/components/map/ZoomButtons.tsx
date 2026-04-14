import { Plus, Minus } from 'lucide-react'
import { useMap } from 'react-leaflet'

export function ZoomButtons() {
  const map = useMap()

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-1">
      <button
        onClick={() => map.setZoom(map.getZoom() + 1.5, { animate: true })}
        className="rounded-full flex items-center justify-center shadow-sm"
        style={{ width: 38, height: 38, background: '#fff', border: '1px solid rgba(10,10,10,0.06)', cursor: 'pointer' }}
      >
        <Plus size={18} style={{ color: 'rgba(10,10,10,0.45)' }} />
      </button>
      <button
        onClick={() => map.setZoom(map.getZoom() - 1.5, { animate: true })}
        className="rounded-full flex items-center justify-center shadow-sm"
        style={{ width: 38, height: 38, background: '#fff', border: '1px solid rgba(10,10,10,0.06)', cursor: 'pointer' }}
      >
        <Minus size={18} style={{ color: 'rgba(10,10,10,0.45)' }} />
      </button>
    </div>
  )
}
