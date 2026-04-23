import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export default function InvitePage() {
  const [searchParams] = useSearchParams()
  const inviterName = searchParams.get('name') || 'Ein Macher'
  const inviteId = searchParams.get('id') || ''
  const [inviterImage, setInviterImage] = useState<string | null>(null)

  useEffect(() => {
    if (inviteId) {
      fetch(`/api/user/${inviteId}/public`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.image_path) setInviterImage(data.image_path)
        })
        .catch(() => {})
    }
  }, [inviteId])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#FAF8F5' }}>
      <div className="relative z-10 flex flex-col items-center max-w-sm">
        {inviterImage ? (
          <div className="mb-6">
            <div
              className="w-28 h-28 rounded-full overflow-hidden mx-auto"
              style={{ border: '3px solid rgba(232,117,26,0.3)', boxShadow: '0 0 30px rgba(232,117,26,0.15)' }}
            >
              <img src={inviterImage} alt={inviterName} className="w-full h-full object-cover" />
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <Logo size={100} />
          </div>
        )}

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.4, marginBottom: '0.5rem' }}>
          <span style={{ color: '#E8751A' }}>{inviterName}</span> laedt dich ein
        </h1>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(26,26,26,0.55)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Teil der Macher-Community zu werden.
        </p>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: 'rgba(26,26,26,0.5)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Finde Werkstaetten, starte Abenteuer und verbinde dich
          mit Menschen, die anpacken.
        </p>

        <Link
          to={`/app?invite=${inviteId}`}
          style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 600,
            color: '#fff', textDecoration: 'none', padding: '16px 40px',
            background: '#E8751A', borderRadius: '10px',
            boxShadow: '0 4px 16px rgba(232,117,26,0.3)',
          }}
        >
          Macher werden
        </Link>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: 'rgba(26,26,26,0.25)', marginTop: '2rem' }}>
          Macher-Map — macher-map.org
        </p>
      </div>
    </div>
  )
}
