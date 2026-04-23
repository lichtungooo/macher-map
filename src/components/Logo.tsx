export function Logo({ size = 32 }: { size?: number }) {
  const s = size
  const cx = s / 2
  const cy = s / 2
  const outerR = s * 0.46
  const innerR = s * 0.38

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
      {/* Outer black ring */}
      <circle cx={cx} cy={cy} r={outerR} fill="#1A1A1A" />
      {/* Gold ring */}
      <circle cx={cx} cy={cy} r={outerR * 0.92} fill="#D4A020" />
      {/* Orange fill */}
      <circle cx={cx} cy={cy} r={innerR} fill="#E8751A" />
      {/* Hammer + Wrench crossed */}
      <g transform={`translate(${cx}, ${cy}) scale(${s / 80})`}>
        {/* Wrench (left-leaning) */}
        <g transform="rotate(-45)">
          <rect x={-2} y={-18} width={4} height={28} rx={1.5} fill="#1A1A1A" />
          <path d="M-5,-18 Q-5,-23 0,-23 Q5,-23 5,-18 Q5,-15 3,-14 L3,-13 L-3,-13 L-3,-14 Q-5,-15 -5,-18Z" fill="#1A1A1A" />
        </g>
        {/* Hammer (right-leaning) */}
        <g transform="rotate(45)">
          <rect x={-2} y={-18} width={4} height={30} rx={1.5} fill="#1A1A1A" />
          <rect x={-8} y={-22} width={16} height={7} rx={2} fill="#1A1A1A" />
        </g>
      </g>
    </svg>
  )
}
