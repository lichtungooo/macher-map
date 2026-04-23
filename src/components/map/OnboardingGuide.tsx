import { useState } from 'react'
import { ArrowRight, User, MapPin, CalendarPlus, X } from 'lucide-react'

const STEPS = [
  {
    icon: User,
    title: 'Willkommen bei Macher-Map',
    text: 'Finde Werkstaetten, Abenteuer und Macher in deiner Naehe. Erstelle zuerst dein Profil — mit deinem Namen, einem Foto und deinen Skills.',
    hint: 'Klicke oben rechts auf das Profil-Symbol.',
  },
  {
    icon: MapPin,
    title: 'Zeig dich auf der Karte',
    text: 'Mit dem Plus-Button unten rechts kannst du deinen Macher-Pin auf die Karte setzen. Tippe auf die Stelle, wo du baust — dort wo du lebst, oder an einem Ort, der dir am Herzen liegt.',
    hint: 'Klicke auf (+) und waehle "Macher-Pin setzen".',
  },
  {
    icon: CalendarPlus,
    title: 'Triff dich mit Machern',
    text: 'Erstelle Abenteuer in deiner Naehe: Zusammen bauen, schweissen, werkeln. Andere Macher koennen teilnehmen und sich mit dir verbinden.',
    hint: 'Klicke auf (+) und waehle "Abenteuer erstellen".',
  },
]

interface OnboardingGuideProps {
  onClose: () => void
}

export function OnboardingGuide({ onClose }: OnboardingGuideProps) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}>
      <div
        className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-8 shadow-xl"
        style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}
        >
          <X size={20} />
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full flex-1 transition-all"
              style={{ background: i <= step ? '#E8751A' : 'rgba(10,10,10,0.08)' }}
            />
          ))}
        </div>

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
          style={{ background: 'rgba(212,168,67,0.08)' }}
        >
          <current.icon size={24} style={{ color: '#E8751A' }} />
        </div>

        {/* Content */}
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.4rem', fontWeight: 500, color: '#1A1A1A', marginBottom: '0.6rem' }}>
          {current.title}
        </h3>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', lineHeight: 1.7, color: 'rgba(10,10,10,0.55)', marginBottom: '1rem' }}>
          {current.text}
        </p>

        {/* Hint with arrow */}
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-lg mb-6"
          style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.04)' }}
        >
          <ArrowRight size={14} style={{ color: '#E8751A', flexShrink: 0 }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 500, color: '#E8751A' }}>
            {current.hint}
          </span>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => step > 0 && setStep(step - 1)}
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: '0.82rem',
              color: step > 0 ? 'rgba(10,10,10,0.5)' : 'transparent',
              background: 'none', border: 'none', cursor: step > 0 ? 'pointer' : 'default',
            }}
          >
            Zurueck
          </button>

          <button
            onClick={() => isLast ? onClose() : setStep(step + 1)}
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500,
              color: '#fff', background: '#1A1A1A', border: 'none',
              padding: '10px 24px', borderRadius: '8px', cursor: 'pointer',
            }}
          >
            {isLast ? 'Los gehts' : 'Weiter'}
          </button>
        </div>
      </div>
    </div>
  )
}
