import { X } from 'lucide-react'

type TutorialStep = 'welcome' | 'profile' | 'fill-profile' | 'set-light' | 'done'

interface GuidedTutorialProps {
  step: TutorialStep
  onNext: () => void
  onClose: () => void
}

const STEPS: Record<TutorialStep, { title: string; text: string; arrow?: 'top-right' | 'bottom-right' | 'none'; position: 'center' | 'top' | 'bottom' }> = {
  welcome: {
    title: 'Willkommen',
    text: 'Das ist eine interaktive Karte, auf der du dein Licht fuer den Frieden mit anderen teilen kannst. Sieh, wie sich dein Licht in der Welt verteilt.',
    arrow: 'none',
    position: 'center',
  },
  profile: {
    title: 'Erstelle dein Profil',
    text: 'Klicke jetzt oben rechts auf das Profil-Symbol, um deine E-Mail einzugeben und deinen Magic Link zu erhalten.',
    arrow: 'top-right',
    position: 'top',
  },
  'fill-profile': {
    title: 'Dein Profil',
    text: 'Gib deinen Namen ein, lade ein Foto hoch und schreibe deinen Herzenstext fuer den Frieden. Dann druecke auf Speichern.',
    arrow: 'none',
    position: 'center',
  },
  'set-light': {
    title: 'Setze dein Licht',
    text: 'Klicke jetzt unten rechts auf den Plus-Button und waehle "Setze dein Licht". Dann tippe auf die Karte, wo du leuchten moechtest.',
    arrow: 'bottom-right',
    position: 'bottom',
  },
  done: {
    title: 'Dein Licht leuchtet',
    text: 'Wunderschoen. Dein Licht ist auf der Karte. Teile deinen QR-Code, damit andere Menschen sich mit deinem Licht verbinden.',
    arrow: 'none',
    position: 'center',
  },
}

export function GuidedTutorial({ step, onNext, onClose }: GuidedTutorialProps) {
  const current = STEPS[step]
  if (!current) return null

  const positionClasses = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-20',
    bottom: 'items-end justify-center pb-24',
  }

  return (
    <div className={`fixed inset-0 z-[2500] flex ${positionClasses[current.position]} p-4`} style={{ background: 'rgba(0,0,0,0.15)' }}>
      <div
        className="relative max-w-sm w-full rounded-2xl p-6 shadow-xl"
        style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(10,10,10,0.3)' }}
        >
          <X size={18} />
        </button>

        {/* Arrow pointing to top-right (profile button) */}
        {current.arrow === 'top-right' && (
          <div className="absolute -top-12 right-8">
            <svg width="40" height="50" viewBox="0 0 40 50" fill="none">
              <path d="M20 48 C20 25, 30 15, 38 2" stroke="#D4A843" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M33 0 L39 3 L35 8" stroke="#D4A843" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}

        {/* Arrow pointing to bottom-right (action button) */}
        {current.arrow === 'bottom-right' && (
          <div className="absolute -bottom-12 right-8">
            <svg width="40" height="50" viewBox="0 0 40 50" fill="none">
              <path d="M20 2 C20 25, 30 35, 38 48" stroke="#D4A843" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M33 50 L39 47 L35 42" stroke="#D4A843" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}

        <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.3rem', fontWeight: 500, color: '#0A0A0A', marginBottom: '0.5rem' }}>
          {current.title}
        </h3>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', lineHeight: 1.7, color: 'rgba(10,10,10,0.55)', marginBottom: '1.2rem' }}>
          {current.text}
        </p>

        <button
          onClick={onNext}
          style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500,
            color: '#fff', background: '#0A0A0A', border: 'none',
            padding: '10px 24px', borderRadius: '8px', cursor: 'pointer',
            width: '100%',
          }}
        >
          {step === 'welcome' ? 'Los gehts' : step === 'done' ? 'Verstanden' : 'Weiter'}
        </button>
      </div>
    </div>
  )
}

export type { TutorialStep }
