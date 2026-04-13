import { useEffect, useRef, useState } from 'react'

export function WandCursor({ active }: { active: boolean }) {
  const [pos, setPos] = useState({ x: -200, y: -200 })
  const rafRef = useRef<number>(0)

  // Cursor per JS verstecken — Leaflet ueberschreibt CSS
  useEffect(() => {
    if (!active) return

    const style = document.createElement('style')
    style.id = 'wand-cursor-style'
    style.textContent = `
      * { cursor: none !important; }
      .leaflet-container { cursor: none !important; }
      .leaflet-grab { cursor: none !important; }
      .leaflet-interactive { cursor: none !important; }
      .leaflet-marker-icon { cursor: none !important; }
      .leaflet-popup { cursor: none !important; }
    `
    document.head.appendChild(style)

    // Auch inline-Styles ueberschreiben
    const container = document.querySelector('.leaflet-container') as HTMLElement
    if (container) container.style.cursor = 'none'

    return () => {
      style.remove()
      if (container) container.style.cursor = ''
    }
  }, [active])

  // Maus-Position tracken
  useEffect(() => {
    if (!active) return

    function onMove(e: MouseEvent) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        setPos({ x: e.clientX, y: e.clientY })
      })
    }

    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [active])

  if (!active || pos.x < -100) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: pos.x - 6,
        top: pos.y - 34,
        pointerEvents: 'none',
        zIndex: 999999,
      }}
    >
      <svg width="44" height="44" viewBox="0 0 44 44" style={{ filter: 'drop-shadow(0 0 8px rgba(212,168,67,0.6))' }}>
        {/* Stab */}
        <line x1="6" y1="38" x2="28" y2="16" stroke="#9A7828" strokeWidth="3" strokeLinecap="round"/>
        <line x1="26" y1="18" x2="30" y2="14" stroke="#B89038" strokeWidth="3.5" strokeLinecap="round"/>

        {/* Leuchtende Spitze */}
        <circle cx="31" cy="13" r="8" fill="#FFF8D0" opacity="0.5">
          <animate attributeName="r" values="6;9;6" dur="1.2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="31" cy="13" r="4" fill="#FFFFF3" opacity="0.9"/>
        <circle cx="31" cy="13" r="1.5" fill="#fff"/>

        {/* Strahlen */}
        <line x1="31" y1="2" x2="31" y2="6" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1.3s" repeatCount="indefinite"/>
        </line>
        <line x1="31" y1="20" x2="31" y2="24" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1.3s" repeatCount="indefinite" begin="0.35s"/>
        </line>
        <line x1="20" y1="13" x2="24" y2="13" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1.3s" repeatCount="indefinite" begin="0.65s"/>
        </line>
        <line x1="38" y1="13" x2="42" y2="13" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1.3s" repeatCount="indefinite" begin="0.9s"/>
        </line>

        {/* Funken */}
        <circle cx="24" cy="6" r="1.5" fill="#F5E090">
          <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="38" cy="20" r="1.2" fill="#F5E090">
          <animate attributeName="opacity" values="0;0.8;0" dur="1.5s" repeatCount="indefinite" begin="0.5s"/>
        </circle>
        <circle cx="38" cy="6" r="1" fill="#F5E090">
          <animate attributeName="opacity" values="0;0.8;0" dur="1.5s" repeatCount="indefinite" begin="1s"/>
        </circle>
      </svg>
    </div>
  )
}
