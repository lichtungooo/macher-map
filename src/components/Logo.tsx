export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #FFFFF3 0%, #FEF4D2 15%, #FAECC3 30%, #F4E3BB 50%, rgba(238,217,172,0.4) 70%, rgba(222,200,149,0) 100%)',
        boxShadow: '0 0 12px 2px rgba(212,168,67,0.2)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: size * 0.22,
          height: size * 0.22,
          borderRadius: '50%',
          background: '#FFFFF3',
          boxShadow: '0 0 6px 2px rgba(255,248,200,0.6)',
        }}
      />
    </div>
  )
}
