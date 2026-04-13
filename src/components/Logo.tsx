export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="logo-g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFF3" stopOpacity="1"/>
          <stop offset="15%" stopColor="#FEF4D2" stopOpacity="1"/>
          <stop offset="35%" stopColor="#FAECC3" stopOpacity="0.95"/>
          <stop offset="55%" stopColor="#F4E3BB" stopOpacity="0.8"/>
          <stop offset="75%" stopColor="#EED9AC" stopOpacity="0.5"/>
          <stop offset="90%" stopColor="#DEC895" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#DEC895" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="15.5" fill="url(#logo-g)"/>
      <circle cx="16" cy="16" r="12" fill="none" stroke="#F4E3BB" strokeWidth="0.6" opacity="0.5"/>
      <circle cx="16" cy="16" r="9" fill="none" stroke="#FAECC3" strokeWidth="0.5" opacity="0.4"/>
      <circle cx="16" cy="16" r="5.5" fill="none" stroke="#FEF4D2" strokeWidth="0.4" opacity="0.3"/>
      <circle cx="16" cy="16" r="3" fill="#FFFFF3" opacity="0.95"/>
      <circle cx="16" cy="16" r="1.2" fill="#FFFFFF" opacity="0.9"/>
    </svg>
  )
}
