import { useEffect, useRef, useState } from 'react'

export function WandCursor({ active }: { active: boolean }) {
  const [pos, setPos] = useState({ x: -200, y: -200 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!active) return
    const style = document.createElement('style')
    style.id = 'wand-cursor-style'
    style.textContent = '* { cursor: none !important; }'
    document.head.appendChild(style)
    const container = document.querySelector('.leaflet-container') as HTMLElement
    if (container) container.style.cursor = 'none'
    return () => { style.remove(); if (container) container.style.cursor = '' }
  }, [active])

  useEffect(() => {
    if (!active) return
    function onMove(e: MouseEvent) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => setPos({ x: e.clientX, y: e.clientY }))
    }
    window.addEventListener('mousemove', onMove)
    return () => { window.removeEventListener('mousemove', onMove); if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [active])

  if (!active || pos.x < -100) return null

  // Spitze oben rechts, Stab nach links unten
  // Hotspot = leuchtende Spitze = oben rechts im SVG
  return (
    <div
      style={{
        position: 'fixed',
        left: pos.x - 36,
        top: pos.y - 8,
        pointerEvents: 'none',
        zIndex: 999999,
      }}
    >
      <svg width="44" height="44" viewBox="0 0 44 44" style={{ filter: 'drop-shadow(0 0 8px rgba(212,168,67,0.6))' }}>
        {/* Stab — von rechts oben nach links unten */}
        <line x1="38" y1="6" x2="10" y2="34" stroke="#9A7828" strokeWidth="3" strokeLinecap="round"/>
        <line x1="36" y1="8" x2="38" y2="6" stroke="#B89038" strokeWidth="3.5" strokeLinecap="round"/>

        {/* Leuchtende Spitze — oben rechts */}
        <circle cx="39" cy="5" r="8" fill="#FFF8D0" opacity="0.5">
          <animate attributeName="r" values="6;9;6" dur="1.2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="39" cy="5" r="4" fill="#FFFFF3" opacity="0.9"/>
        <circle cx="39" cy="5" r="1.5" fill="#fff"/>

        {/* Strahlen */}
        <line x1="39" y1="-4" x2="39" y2="0" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1.3s" repeatCount="indefinite"/>
        </line>
        <line x1="39" y1="10" x2="39" y2="14" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1.3s" repeatCount="indefinite" begin="0.35s"/>
        </line>
        <line x1="30" y1="5" x2="34" y2="5" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1.3s" repeatCount="indefinite" begin="0.65s"/>
        </line>

        {/* Funken */}
        <circle cx="34" cy="-1" r="1.5" fill="#F5E090">
          <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="44" cy="11" r="1.2" fill="#F5E090">
          <animate attributeName="opacity" values="0;0.8;0" dur="1.5s" repeatCount="indefinite" begin="0.5s"/>
        </circle>
        <circle cx="44" cy="-1" r="1" fill="#F5E090">
          <animate attributeName="opacity" values="0;0.8;0" dur="1.5s" repeatCount="indefinite" begin="1s"/>
        </circle>
      </svg>
    </div>
  )
}
