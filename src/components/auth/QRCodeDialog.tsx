import { useState, useEffect, useRef } from 'react'
import { X, RefreshCw, Smartphone } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import * as api from '../../api/client'

interface QRCodeDialogProps {
  userId: string
  userName: string
  onClose: () => void
}

export function QRCodeDialog({ userName, onClose }: QRCodeDialogProps) {
  const [inviteUrl, setInviteUrl] = useState('')
  const [timeLeft, setTimeLeft] = useState(60)
  const [expired, setExpired] = useState(false)
  const [nfcAvailable, setNfcAvailable] = useState(false)
  const [nfcStatus, setNfcStatus] = useState('')
  const timerRef = useRef<number>(0)

  const generateInvite = async () => {
    try {
      const data = await api.createInvite()
      setInviteUrl(data.url)
      setTimeLeft(60)
      setExpired(false)

      // Timer starten
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setExpired(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch {}
  }

  useEffect(() => {
    generateInvite()
    // NFC pruefen
    if ('NDEFReader' in window) setNfcAvailable(true)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const handleNFC = async () => {
    if (!inviteUrl || expired) return
    try {
      setNfcStatus('Halte ein Geraet an dein Handy...')
      const ndef = new (window as any).NDEFReader()
      await ndef.write({ records: [{ recordType: 'url', data: inviteUrl }] })
      setNfcStatus('Gesendet!')
      setTimeout(() => setNfcStatus(''), 2000)
    } catch (err: any) {
      setNfcStatus(err.message || 'NFC-Fehler')
    }
  }

  const font = { fontFamily: 'Inter, sans-serif' as const }
  const progress = timeLeft / 60

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
      <div className="relative w-full max-w-xs rounded-2xl p-8 shadow-xl text-center" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
        <button onClick={onClose} className="absolute top-4 right-4" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}>
          <X size={20} />
        </button>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.3rem', fontWeight: 400, color: '#0A0A0A', marginBottom: '0.3rem' }}>
          Dein Licht teilen
        </h2>
        <p style={{ ...font, fontSize: '0.78rem', color: 'rgba(10,10,10,0.4)', marginBottom: '1.2rem' }}>
          Zeige diesen QR-Code, damit sich andere mit deinem Licht verbinden.
        </p>

        {/* QR Code */}
        <div className="relative flex justify-center mb-4">
          <div className="p-4 rounded-xl" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)', opacity: expired ? 0.3 : 1, transition: 'opacity 0.3s' }}>
            {inviteUrl && (
              <QRCodeSVG
                value={inviteUrl}
                size={180}
                bgColor="#FAFAF8"
                fgColor="#0A0A0A"
                level="H"
                imageSettings={{
                  src: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="17" fill="#FDFCF9"/><circle cx="18" cy="18" r="14" fill="#F4E3BB" opacity="0.6"/><circle cx="18" cy="18" r="8" fill="#FEF4D2" opacity="0.8"/><circle cx="18" cy="18" r="4" fill="#FFFFF3"/><circle cx="18" cy="18" r="1.5" fill="#fff"/></svg>'),
                  height: 36,
                  width: 36,
                  excavate: true,
                }}
              />
            )}
          </div>

          {/* Expired Overlay */}
          {expired && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button onClick={generateInvite} className="flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg"
                style={{ background: '#0A0A0A', ...font, fontSize: '0.78rem', fontWeight: 500, color: '#fff', border: 'none', cursor: 'pointer' }}>
                <RefreshCw size={14} />
                Neuen Code
              </button>
            </div>
          )}
        </div>

        {/* Countdown */}
        {!expired && (
          <div className="mb-4">
            {/* Progress Bar */}
            <div className="w-full h-1 rounded-full mb-1.5" style={{ background: 'rgba(10,10,10,0.06)' }}>
              <div className="h-full rounded-full transition-all" style={{
                width: `${progress * 100}%`,
                background: timeLeft > 15 ? '#D4A843' : '#D4766E',
                transition: 'width 1s linear',
              }} />
            </div>
            <span style={{ ...font, fontSize: '0.68rem', color: timeLeft > 15 ? 'rgba(10,10,10,0.35)' : '#D4766E' }}>
              {timeLeft}s
            </span>
          </div>
        )}

        {/* Name */}
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem', fontWeight: 500, color: '#0A0A0A' }}>
          {userName || 'Anonym'}
        </p>
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.82rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.3)', marginTop: '2px', marginBottom: '12px' }}>
          laedt ein, ein Licht zu entzuenden.
        </p>

        {/* NFC Button */}
        {nfcAvailable && !expired && (
          <button onClick={handleNFC} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
            style={{ ...font, fontSize: '0.78rem', fontWeight: 500, color: '#0A0A0A', background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)', cursor: 'pointer' }}>
            <Smartphone size={15} style={{ color: '#D4A843' }} />
            Per NFC teilen
          </button>
        )}
        {nfcStatus && (
          <p style={{ ...font, fontSize: '0.68rem', color: '#D4A843', marginTop: '6px' }}>{nfcStatus}</p>
        )}
      </div>
    </div>
  )
}
