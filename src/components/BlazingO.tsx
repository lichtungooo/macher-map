// The blazing O — the visual heart of Die Lichtung
// A luminous circle with radial light, halos, and animated breath

export function BlazingO({ size = 280 }: { size?: number }) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.32
  const numRays = 24

  const rays = Array.from({ length: numRays }, (_, i) => {
    const angle = (i * 360) / numRays
    const rad = (angle * Math.PI) / 180
    const innerR = r * 1.15
    const outerR = r * 2.0
    const x1 = cx + Math.cos(rad) * innerR
    const y1 = cy + Math.sin(rad) * innerR
    const x2 = cx + Math.cos(rad) * outerR
    const y2 = cy + Math.sin(rad) * outerR
    const delay = (i * 4) / numRays
    return { x1, y1, x2, y2, angle, delay }
  })

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Outer atmospheric glow */}
      <div
        className="o-outer-glow"
        style={{ width: size * 2.2, height: size * 2.2, left: -(size * 0.6), top: -(size * 0.6) }}
      />

      {/* Expanding pulse rings */}
      <div
        className="expand-ring"
        style={{ width: size * 0.72, height: size * 0.72, left: '14%', top: '14%' }}
      />
      <div
        className="expand-ring expand-ring-2"
        style={{ width: size * 0.72, height: size * 0.72, left: '14%', top: '14%' }}
      />
      <div
        className="expand-ring expand-ring-3"
        style={{ width: size * 0.72, height: size * 0.72, left: '14%', top: '14%' }}
      />

      {/* SVG: light rays + circle */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFF8" stopOpacity="1" />
            <stop offset="25%" stopColor="#FFF9E0" stopOpacity="1" />
            <stop offset="60%" stopColor="#F5D878" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D4A843" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D4A843" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#D4A843" stopOpacity="0" />
          </radialGradient>
          <filter id="blur-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="ray-blur">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* Background radial glow behind ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r * 1.8}
          fill="url(#glowGrad)"
          className="animate-breathe"
        />

        {/* Light rays */}
        <g className="rays-svg" style={{ transformOrigin: `${cx}px ${cy}px` }}>
          {rays.map((ray, i) => (
            <line
              key={i}
              x1={ray.x1}
              y1={ray.y1}
              x2={ray.x2}
              y2={ray.y2}
              stroke="rgba(245, 220, 150, 0.9)"
              strokeWidth={i % 3 === 0 ? '1.5' : '0.8'}
              className="ray-line"
              style={{
                animationDelay: `${ray.delay}s`,
                filter: 'blur(0.5px)',
              }}
            />
          ))}
        </g>

        {/* Outer halo ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r * 1.08}
          fill="none"
          stroke="rgba(245, 230, 160, 0.2)"
          strokeWidth="1"
          filter="url(#blur-glow)"
        />

        {/* Main luminous ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(255, 248, 200, 0.85)"
          strokeWidth="2.5"
          filter="url(#blur-glow)"
          className="animate-breathe"
        />

        {/* Inner ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r * 0.88}
          fill="none"
          stroke="rgba(255, 255, 220, 0.35)"
          strokeWidth="1"
        />

        {/* Core radiant center */}
        <circle
          cx={cx}
          cy={cy}
          r={r * 0.28}
          fill="url(#coreGrad)"
          className="animate-breathe"
        />

        {/* Bright center point */}
        <circle
          cx={cx}
          cy={cy}
          r={r * 0.08}
          fill="rgba(255, 255, 248, 0.95)"
        />
      </svg>

      {/* CSS halo layers */}
      <div
        className="o-halo-1 absolute"
        style={{ width: size * 1.0, height: size * 1.0, left: 0, top: 0 }}
      />
      <div
        className="o-halo-2 absolute"
        style={{ width: size * 0.78, height: size * 0.78, left: '11%', top: '11%' }}
      />
    </div>
  )
}
