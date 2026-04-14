import { useState, useEffect } from 'react'
import { X, Heart, Users, HandHeart } from 'lucide-react'

const DELAY_MS = 60_000 // 1 Minute

interface InfoPopupProps {
  onClose: () => void
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="h-1 rounded-full transition-all" style={{
          width: i === current ? '24px' : '8px',
          background: i === current ? '#D4A843' : 'rgba(10,10,10,0.1)',
        }} />
      ))}
    </div>
  )
}

function InfoPopupInner({ onClose }: InfoPopupProps) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      icon: Heart,
      iconColor: '#D4A843',
      title: 'Frieden beginnt hier',
      text: 'Diese Karte zeigt Menschen, die fuer den Frieden leuchten. Jedes Licht ist ein Mensch, der sagt: Ich stehe fuer Verbindung, fuer Stille, fuer ein Miteinander aus dem Herzen heraus.',
      subtext: 'Wir meditieren. Wir potenzieren. Wir verbinden uns — ueberall auf der Welt, zur gleichen Zeit.',
    },
    {
      icon: Users,
      iconColor: '#5078C8',
      title: 'Das groessere Bild',
      text: 'Diese Karte ist der Anfang. Dahinter entsteht das Real Life Network — eine Plattform fuer echte Begegnung im wirklichen Leben.',
      subtext: 'Lokale Kreise, die sich gegenseitig unterstuetzen. Vertrauen, das von Mensch zu Mensch waechst. Workshops, Abenteuer, gemeinsames Wirken — dezentral, ohne Konzerne, in deiner Nachbarschaft.',
    },
    {
      icon: HandHeart,
      iconColor: '#7BAE5E',
      title: 'Trage das Licht weiter',
      text: 'Dezentrale Infrastruktur aufzubauen braucht Energie. Jeder Beitrag fliesst direkt in die Entwicklung — Server, Veranstaltungen, das Netzwerk.',
      subtext: 'Gemeinnuetzig. Transparent. Kollektiv Lichtung e.V.',
    },
  ]

  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.25)' }}>
      <div className="w-full max-w-sm rounded-2xl shadow-xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)', animation: 'fade-in-up 0.3s ease-out' }}>
        {/* Close */}
        <div className="flex justify-end px-4 pt-4">
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.2)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <StepDots current={step} total={steps.length} />

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${current.iconColor}12` }}>
              <current.icon size={28} style={{ color: current.iconColor }} />
            </div>
          </div>

          {/* Title */}
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 500, color: '#0A0A0A', textAlign: 'center', marginBottom: '12px' }}>
            {current.title}
          </h2>

          {/* Text */}
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', lineHeight: 1.7, color: 'rgba(10,10,10,0.55)', textAlign: 'center', marginBottom: '10px' }}>
            {current.text}
          </p>

          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.6, color: 'rgba(10,10,10,0.4)', textAlign: 'center', marginBottom: '20px' }}>
            {current.subtext}
          </p>

          {/* Spenden-Link auf letztem Tab */}
          {isLast && (
            <a
              href="https://opencollective.com/real-life-network"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl mb-3 transition-all"
              style={{ background: '#0A0A0A', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 500, color: '#fff', textDecoration: 'none' }}
            >
              <HandHeart size={18} />
              Projekt unterstuetzen
            </a>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(10,10,10,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Zurueck
              </button>
            ) : (
              <div />
            )}

            {!isLast ? (
              <button onClick={() => setStep(step + 1)}
                className="flex items-center gap-1 px-5 py-2.5 rounded-xl"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, color: '#fff', background: '#0A0A0A', border: 'none', cursor: 'pointer' }}>
                Weiter
              </button>
            ) : (
              <button onClick={onClose}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(10,10,10,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Schliessen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function InfoPopup() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Nicht zeigen wenn schon gesehen (diese Session)
    if (sessionStorage.getItem('lichtung-info-seen')) return

    const timer = setTimeout(() => setShow(true), DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setShow(false)
    sessionStorage.setItem('lichtung-info-seen', '1')
  }

  if (!show) return null
  return <InfoPopupInner onClose={handleClose} />
}
