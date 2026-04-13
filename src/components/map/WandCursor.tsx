import { useEffect, useState } from 'react'

export function WandCursor({ active }: { active: boolean }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!active) { setVisible(false); return }

    function onMove(e: MouseEvent) {
      setPos({ x: e.clientX, y: e.clientY })
      setVisible(true)
    }
    function onLeave() { setVisible(false) }
    function onEnter() { setVisible(true) }

    const map = document.querySelector('.leaflet-container')
    if (map) {
      map.addEventListener('mousemove', onMove as any)
      map.addEventListener('mouseleave', onLeave)
      map.addEventListener('mouseenter', onEnter)
    }

    return () => {
      if (map) {
        map.removeEventListener('mousemove', onMove as any)
        map.removeEventListener('mouseleave', onLeave)
        map.removeEventListener('mouseenter', onEnter)
      }
    }
  }, [active])

  if (!active || !visible) return null

  return (
    <div
      className="fixed pointer-events-none z-[9998]"
      style={{
        left: pos.x - 4,
        top: pos.y - 28,
        transition: 'left 0.02s, top 0.02s',
      }}
    >
      {/* Zauberstab SVG */}
      <svg width="36" height="36" viewBox="0 0 36 36" style={{ filter: 'drop-shadow(0 0 4px rgba(212,168,67,0.4))' }}>
        {/* Stab */}
        <line x1="6" y1="30" x2="24" y2="12" stroke="#B8943A" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="22" y1="14" x2="25" y2="11" stroke="#D4A843" strokeWidth="3" strokeLinecap="round"/>

        {/* Leuchtende Spitze */}
        <circle cx="26" cy="10" r="5" fill="#FFF8D0" opacity="0.7">
          <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="26" cy="10" r="2.5" fill="#FFFFF3" opacity="0.95"/>
        <circle cx="26" cy="10" r="1" fill="#fff"/>

        {/* Strahlen */}
        <line x1="26" y1="2" x2="26" y2="5" stroke="#D4A843" strokeWidth="1.2" strokeLinecap="round" opacity="0.7">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
        </line>
        <line x1="26" y1="15" x2="26" y2="18" stroke="#D4A843" strokeWidth="1.2" strokeLinecap="round" opacity="0.7">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" begin="0.5s"/>
        </line>
        <line x1="18" y1="10" x2="21" y2="10" stroke="#D4A843" strokeWidth="1.2" strokeLinecap="round" opacity="0.7">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" begin="0.3s"/>
        </line>
        <line x1="31" y1="10" x2="34" y2="10" stroke="#D4A843" strokeWidth="1.2" strokeLinecap="round" opacity="0.7">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" begin="0.7s"/>
        </line>

        {/* Diagonale Funken */}
        <circle cx="21" cy="5" r="1" fill="#D4A843" opacity="0.5">
          <animate attributeName="opacity" values="0;0.7;0" dur="1.8s" repeatCount="indefinite"/>
        </circle>
        <circle cx="31" cy="15" r="0.8" fill="#D4A843" opacity="0.4">
          <animate attributeName="opacity" values="0;0.6;0" dur="1.8s" repeatCount="indefinite" begin="0.6s"/>
        </circle>
        <circle cx="31" cy="5" r="0.8" fill="#D4A843" opacity="0.4">
          <animate attributeName="opacity" values="0;0.6;0" dur="1.8s" repeatCount="indefinite" begin="1.2s"/>
        </circle>
      </svg>
    </div>
  )
}
