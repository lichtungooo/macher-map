import { useEffect, useRef, useState } from 'react'
import { Share2, Check, Link as LinkIcon, MessageCircle, Send, Mail, X } from 'lucide-react'

interface ShareButtonProps {
  url: string
  title: string
  text?: string
  label?: string
  compact?: boolean
}

/**
 * Teilen-Button — nutzt native Web-Share-API wenn verfuegbar,
 * sonst Dialog mit Telegram, WhatsApp, Mail, Kopieren.
 */
export function ShareButton({ url, title, text, label = 'Teilen', compact = false }: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const popRef = useRef<HTMLDivElement>(null)

  // Schliesst Popover bei Klick ausserhalb
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [open])

  // ESC schliesst
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const handleClick = async () => {
    // Native Web-Share wenn verfuegbar (Mobile + moderne Browser)
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await (navigator as any).share({ title, text, url })
        return
      } catch (err: any) {
        // User hat abgebrochen — nichts weiter tun
        if (err?.name === 'AbortError') return
        // Sonst Fallback-Dialog oeffnen
      }
    }
    setOpen(true)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  const shareText = text ? `${text}\n\n${url}` : url
  const enc = encodeURIComponent

  const telegramUrl = `https://t.me/share/url?url=${enc(url)}&text=${enc(title + (text ? '\n\n' + text : ''))}`
  const whatsappUrl = `https://wa.me/?text=${enc(title + '\n' + shareText)}`
  const mailUrl = `mailto:?subject=${enc(title)}&body=${enc((text || '') + '\n\n' + url)}`

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontFamily: 'Inter, sans-serif',
    fontSize: compact ? '0.72rem' : '0.8rem',
    fontWeight: 500,
    color: 'rgba(10,10,10,0.7)',
    padding: compact ? '6px 12px' : '8px 16px',
    background: '#FAFAF8',
    border: '1px solid rgba(10,10,10,0.08)',
    borderRadius: 8,
    cursor: 'pointer',
  }

  return (
    <div className="relative inline-block">
      <button onClick={handleClick} style={buttonStyle}>
        <Share2 size={compact ? 12 : 14} style={{ color: '#D4A843' }} />
        {label}
      </button>

      {open && (
        <div
          ref={popRef}
          className="absolute z-[3000] mt-2 rounded-xl shadow-xl"
          style={{
            right: 0,
            background: '#fff',
            border: '1px solid rgba(10,10,10,0.08)',
            minWidth: 240,
            padding: 8,
          }}
        >
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', fontWeight: 600, color: 'rgba(10,10,10,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Teilen
            </span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.35)' }}>
              <X size={14} />
            </button>
          </div>

          <ShareOption href={telegramUrl} icon={Send} label="Telegram" color="#2AABEE" />
          <ShareOption href={whatsappUrl} icon={MessageCircle} label="WhatsApp" color="#25D366" />
          <ShareOption href={mailUrl} icon={Mail} label="E-Mail" color="#D4A843" />

          <button
            onClick={copy}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {copied ? (
              <Check size={15} style={{ color: '#7BAE5E' }} />
            ) : (
              <LinkIcon size={15} style={{ color: 'rgba(10,10,10,0.55)' }} />
            )}
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#0A0A0A' }}>
              {copied ? 'Kopiert' : 'Link kopieren'}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

function ShareOption({ href, icon: Icon, label, color }: { href: string; icon: any; label: string; color: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
      style={{ textDecoration: 'none' }}
      onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <Icon size={15} style={{ color }} />
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#0A0A0A' }}>
        {label}
      </span>
    </a>
  )
}
