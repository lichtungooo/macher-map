import { useSearchParams, Link } from 'react-router-dom'
import { BlazingO } from '../components/BlazingO'

export default function InvitePage() {
  const [searchParams] = useSearchParams()
  const inviterName = searchParams.get('name') || 'Ein Mensch'
  const inviteId = searchParams.get('id') || ''

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#fff' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(212, 168, 67, 0.06) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-sm">
        <div className="mb-6">
          <BlazingO size={160} />
        </div>

        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 400, color: '#0A0A0A', lineHeight: 1.4, marginBottom: '0.5rem' }}>
          <span style={{ color: '#D4A843' }}>{inviterName}</span> laedt dich ein
        </h1>

        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.1rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.45)', marginBottom: '2rem', lineHeight: 1.6 }}>
          ein Licht fuer den Frieden zu entzuenden.
        </p>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: 'rgba(10,10,10,0.5)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Setze dein Licht auf die Weltkarte und verbinde dich mit Menschen, die fuer den Frieden leuchten.
        </p>

        <Link
          to={`/app?invite=${inviteId}`}
          style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 500,
            color: '#fff', textDecoration: 'none', padding: '16px 40px',
            background: '#0A0A0A', borderRadius: '8px',
          }}
        >
          Mein Licht entzuenden
        </Link>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: 'rgba(10,10,10,0.25)', marginTop: '2rem' }}>
          Licht fuer Frieden — lichtung.ooo
          <br />Kollektiv Lichtung e.V.
        </p>
      </div>
    </div>
  )
}
