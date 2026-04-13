import { X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface QRCodeDialogProps {
  userId: string
  userName: string
  onClose: () => void
}

export function QRCodeDialog({ userId, userName, onClose }: QRCodeDialogProps) {
  const inviteUrl = `${window.location.origin}/invite?id=${userId}&name=${encodeURIComponent(userName || 'Ein Freund')}`

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
      <div className="relative w-full max-w-xs rounded-2xl p-8 shadow-xl text-center" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
        <button onClick={onClose} className="absolute top-4 right-4" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}>
          <X size={20} />
        </button>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.3rem', fontWeight: 400, color: '#0A0A0A', marginBottom: '0.3rem' }}>
          Dein Licht teilen
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(10,10,10,0.4)', marginBottom: '1.5rem' }}>
          Zeige diesen QR-Code, damit sich andere mit deinem Licht verbinden.
        </p>

        <div className="flex justify-center mb-5">
          <div className="p-4 rounded-xl" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}>
            <QRCodeSVG
              value={inviteUrl}
              size={180}
              bgColor="#FAFAF8"
              fgColor="#0A0A0A"
              level="M"
            />
          </div>
        </div>

        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', fontWeight: 500, color: '#0A0A0A' }}>
          {userName || 'Anonym'}
        </p>
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.85rem', fontStyle: 'italic', color: 'rgba(10,10,10,0.35)', marginTop: '4px' }}>
          laedt ein, ein Licht zu entzuenden.
        </p>
      </div>
    </div>
  )
}
