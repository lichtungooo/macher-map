import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'

const NAV_ITEMS = [
  { href: '#vision', label: 'Vision' },
  { href: '#karte', label: 'Karte' },
  { href: '#so-gehts', label: 'So gehts' },
  { href: '#kalender', label: 'Kalender' },
  { href: '#netzwerk', label: 'Netzwerk' },
  { href: '#unterstuetzen', label: 'Mitmachen' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(10,10,10,0.06)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <a
          href="#"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '1.3rem',
            fontWeight: 500,
            color: '#0A0A0A',
            textDecoration: 'none',
            letterSpacing: '0.08em',
          }}
        >
          Lichtung
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map(item => (
            <a
              key={item.href}
              href={item.href}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.8rem',
                fontWeight: 400,
                color: 'rgba(10,10,10,0.5)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#D4A843'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(10,10,10,0.5)'}
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/app"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: '#0A0A0A',
              textDecoration: 'none',
              padding: '8px 20px',
              border: '1px solid #0A0A0A',
              borderRadius: '6px',
              transition: 'all 0.2s',
            }}
          >
            Setze dein Licht
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0A0A0A' }}
          aria-label="Navigation"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {open && (
        <nav className="md:hidden px-4 pb-4 space-y-3" style={{ borderTop: '1px solid rgba(10,10,10,0.06)' }}>
          {NAV_ITEMS.map(item => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem',
                color: 'rgba(10,10,10,0.6)',
                textDecoration: 'none',
                padding: '8px 0',
              }}
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/app"
            onClick={() => setOpen(false)}
            style={{
              display: 'block',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#D4A843',
              textDecoration: 'none',
              padding: '8px 0',
            }}
          >
            Setze dein Licht
          </Link>
        </nav>
      )}
    </header>
  )
}
