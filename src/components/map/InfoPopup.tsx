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
          background: i === current ? '#E8751A' : 'rgba(10,10,10,0.1)',
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
      iconColor: '#E8751A',
      title: 'Machen beginnt hier',
      text: 'Diese Karte zeigt Macher, Werkstaetten und Abenteuer in deiner Naehe. Jeder Pin ist ein Mensch, der sagt: Ich bau was. Pack an.',
      subtext: 'Wir bauen. Wir schweissen. Wir werkeln — zusammen, vor Ort, mit den eigenen Haenden.',
    },
    {
      icon: Users,
      iconColor: '#D4A020',
      title: 'Das groessere Bild',
      text: 'Diese Karte ist der Anfang. Dahinter entsteht das Real Life Network — eine Plattform fuer echte Begegnung im wirklichen Leben.',
      subtext: 'Werkstaetten, die fuer alle offen sind. Skills, die sichtbar werden. Workshops, Abenteuer, gemeinsames Bauen — dezentral, in deiner Nachbarschaft.',
    },
    {
      icon: HandHeart,
      iconColor: '#E8751A',
      title: 'Mach mit',
      text: 'Dezentrale Infrastruktur aufzubauen braucht Energie. Jeder Beitrag fliesst direkt in die Entwicklung — Server, Werkstaetten, das Netzwerk.',
      subtext: 'Open Source. Fuer immer frei.',
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
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.4rem', fontWeight: 500, color: '#1A1A1A', textAlign: 'center', marginBottom: '12px' }}>
            {current.title}
          </h2>

          {/* Text */}
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', lineHeight: 1.7, color: 'rgba(10,10,10,0.55)', textAlign: 'center', marginBottom: '10px' }}>
            {current.text}
          </p>

          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.6, color: 'rgba(10,10,10,0.4)', textAlign: 'center', marginBottom: '20px' }}>
            {current.subtext}
          </p>

          {/* Spenden-Link auf letztem Tab */}
          {isLast && (
            <a
              href="https://opencollective.com/real-life-network"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl mb-3 transition-all"
              style={{ background: '#1A1A1A', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 500, color: '#fff', textDecoration: 'none' }}
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
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, color: '#fff', background: '#1A1A1A', border: 'none', cursor: 'pointer' }}>
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
    if (sessionStorage.getItem('macher-info-seen')) return

    const timer = setTimeout(() => setShow(true), DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setShow(false)
    sessionStorage.setItem('macher-info-seen', '1')
  }

  if (!show) return null
  return <InfoPopupInner onClose={handleClose} />
}
