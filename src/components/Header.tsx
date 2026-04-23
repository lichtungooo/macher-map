import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'

const NAV_ITEMS = [
  { href: '#features', label: 'Features' },
  { href: '#karte', label: 'Karte' },
  { href: '#community', label: 'Community' },
  { href: '#partner', label: 'Partner' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const headerBg = scrolled
    ? 'rgba(250,248,245,0.95)'
    : 'rgba(250,248,245,0.4)'

  const borderColor = scrolled
    ? 'rgba(26,26,26,0.08)'
    : 'rgba(26,26,26,0.04)'

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: headerBg,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${borderColor}`,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2.5" style={{ textDecoration: 'none' }}>
          <Logo size={30} />
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#1A1A1A',
              letterSpacing: '-0.02em',
            }}
          >
            Macher-Map
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map(item => (
            <a
              key={item.href}
              href={item.href}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.8rem',
                fontWeight: 500,
                color: '#1A1A1A',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#E8751A'}
              onMouseLeave={e => e.currentTarget.style.color = '#1A1A1A'}
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/app"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#fff',
              textDecoration: 'none',
              padding: '9px 22px',
              background: '#E8751A',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
          >
            Macher werden
          </Link>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A1A1A' }}
          aria-label="Navigation"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav
          className="md:hidden px-4 pb-4 space-y-3"
          style={{
            borderTop: '1px solid rgba(26,26,26,0.06)',
            background: 'rgba(250,248,245,0.98)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {NAV_ITEMS.map(item => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.88rem',
                color: 'rgba(26,26,26,0.6)',
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
              fontSize: '0.88rem',
              fontWeight: 600,
              color: '#E8751A',
              textDecoration: 'none',
              padding: '8px 0',
            }}
          >
            Macher werden
          </Link>
        </nav>
      )}
    </header>
  )
}
