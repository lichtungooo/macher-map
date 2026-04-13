import { useEffect, useState } from 'react'

export function WandCursor({ active }: { active: boolean }) {
  const [pos, setPos] = useState({ x: -100, y: -100 })

  useEffect(() => {
    if (!active) return

    function onMove(e: MouseEvent) {
      setPos({ x: e.clientX, y: e.clientY })
    }

    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [active])

  if (!active) return null

  return (
    <div
      className="fixed pointer-events-none"
      style={{
        left: pos.x - 6,
        top: pos.y - 32,
        zIndex: 99999,
      }}
    >
      <svg width="40" height="40" viewBox="0 0 40 40" style={{ filter: 'drop-shadow(0 0 6px rgba(212,168,67,0.5))' }}>
        {/* Stab */}
        <line x1="6" y1="34" x2="26" y2="14" stroke="#A07830" strokeWidth="3" strokeLinecap="round"/>
        <line x1="24" y1="16" x2="28" y2="12" stroke="#C4A040" strokeWidth="3.5" strokeLinecap="round"/>

        {/* Leuchtende Spitze — pulsiert */}
        <circle cx="29" cy="11" r="6" fill="#FFF8D0" opacity="0.6">
          <animate attributeName="r" values="5;7;5" dur="1.2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="29" cy="11" r="3" fill="#FFFFF3" opacity="0.95"/>
        <circle cx="29" cy="11" r="1.2" fill="#fff"/>

        {/* Strahlen — flackern */}
        <line x1="29" y1="2" x2="29" y2="5.5" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round">
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur="1.5s" repeatCount="indefinite"/>
        </line>
        <line x1="29" y1="16.5" x2="29" y2="20" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round">
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur="1.5s" repeatCount="indefinite" begin="0.4s"/>
        </line>
        <line x1="20" y1="11" x2="23.5" y2="11" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round">
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur="1.5s" repeatCount="indefinite" begin="0.2s"/>
        </line>
        <line x1="34.5" y1="11" x2="38" y2="11" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round">
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur="1.5s" repeatCount="indefinite" begin="0.6s"/>
        </line>

        {/* Kleine Funken */}
        <circle cx="23" cy="5" r="1.2" fill="#D4A843">
          <animate attributeName="opacity" values="0;0.8;0" dur="1.6s" repeatCount="indefinite"/>
        </circle>
        <circle cx="35" cy="17" r="1" fill="#D4A843">
          <animate attributeName="opacity" values="0;0.7;0" dur="1.6s" repeatCount="indefinite" begin="0.5s"/>
        </circle>
        <circle cx="35" cy="5" r="1" fill="#D4A843">
          <animate attributeName="opacity" values="0;0.7;0" dur="1.6s" repeatCount="indefinite" begin="1s"/>
        </circle>
        <circle cx="23" cy="17" r="0.8" fill="#D4A843">
          <animate attributeName="opacity" values="0;0.6;0" dur="1.6s" repeatCount="indefinite" begin="0.8s"/>
        </circle>
      </svg>
    </div>
  )
}
