import { useState, useEffect } from 'react'
import { User, Link2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { AppProvider, useApp } from '../context/AppContext'
import { PeaceMap } from '../components/map/PeaceMap'
import { ActionButton } from '../components/map/ActionButton'
import { GuidedTutorial, type TutorialStep } from '../components/map/GuidedTutorial'
import { AuthDialog } from '../components/auth/AuthDialog'
import { ProfileDialog } from '../components/auth/ProfileDialog'
import { CreateEventDialog } from '../components/events/CreateEventDialog'
import { Logo } from '../components/Logo'
import * as api from '../api/client'

const BTN_SIZE = 46

type Dialog = 'none' | 'auth' | 'profile' | 'create-event'
type Mode = 'browse' | 'place-light' | 'place-event'

function MapAppInner() {
  const { user, lights, addLight, login: loginCtx, updateProfile: updateUserProfile } = useApp()
  const [dialog, setDialog] = useState<Dialog>('none')
  const [mode, setMode] = useState<Mode>('browse')
  const [eventPosition, setEventPosition] = useState<[number, number] | undefined>()
  const [tutorialStep, setTutorialStep] = useState<TutorialStep | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  // Auto-login if token exists in localStorage
  useEffect(() => {
    const token = api.getToken()
    if (token) {
      api.getProfile()
        .then(userData => {
          loginCtx(userData.email)
          updateUserProfile({ id: userData.id, name: userData.name, statement: userData.statement, imageUrl: userData.image_path || undefined })
        })
        .catch(() => api.clearToken())
    }
  }, [])

  // Handle email verification from URL
  useEffect(() => {
    const verifyToken = searchParams.get('verify')
    if (verifyToken) {
      api.verifyEmail(verifyToken).catch(() => {})
      setSearchParams({})
    }
  }, [])

  // Show tutorial on first visit
  useEffect(() => {
    const seen = localStorage.getItem('lichtung-tutorial-seen')
    if (!seen && !api.getToken()) setTutorialStep('welcome')
  }, [])

  const closeTutorial = () => {
    setTutorialStep(null)
    localStorage.setItem('lichtung-tutorial-seen', '1')
  }

  const handleTutorialNext = () => {
    if (tutorialStep === 'welcome') setTutorialStep('profile')
    else if (tutorialStep === 'profile') { setTutorialStep(null); setDialog('auth') }
    else if (tutorialStep === 'fill-profile') setTutorialStep(null)
    else if (tutorialStep === 'set-light') setTutorialStep(null)
    else if (tutorialStep === 'done') closeTutorial()
  }

  const handleAuthSuccess = (userData: { id: string; email: string; name: string; statement: string; image_path?: string }) => {
    loginCtx(userData.email)
    updateUserProfile({ id: userData.id, name: userData.name, statement: userData.statement, imageUrl: userData.image_path || undefined })
    setDialog('profile')
    setTutorialStep('fill-profile')
  }

  const handleProfileClose = () => {
    setDialog('none')
    if (user?.name) setTutorialStep('set-light')
  }

  const handleSetLight = () => {
    if (!user) { setDialog('auth'); return }
    if (!user.name) { setDialog('profile'); return }
    setMode('place-light')
  }

  const handleCreateEvent = () => {
    if (!user) { setDialog('auth'); return }
    setMode('place-event')
  }

  const handleMapClick = (position: [number, number]) => {
    if (mode === 'place-light') {
      addLight(position)
      setMode('browse')
      const seen = localStorage.getItem('lichtung-tutorial-seen')
      if (!seen) { setTutorialStep('done'); localStorage.setItem('lichtung-tutorial-seen', '1') }
    } else if (mode === 'place-event') {
      setEventPosition(position)
      setDialog('create-event')
      setMode('browse')
    }
  }

  return (
    <div className="fixed inset-0" style={{ background: '#F5F4F0' }}>
      <PeaceMap onMapClick={handleMapClick} placingLight={mode === 'place-light' || mode === 'place-event'} />

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 py-3" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.92), rgba(255,255,255,0))', pointerEvents: 'none' }}>
        {/* Logo — rund */}
        <Link to="/" style={{ textDecoration: 'none', pointerEvents: 'auto' }}>
          <div className="rounded-full flex items-center justify-center shadow-sm" style={{ width: BTN_SIZE, height: BTN_SIZE, background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
            <Logo size={34} />
          </div>
        </Link>

        <div className="flex items-center gap-3" style={{ pointerEvents: 'auto' }}>
          {/* Lichterkette — rund, gleiche Groesse */}
          <button
            className="rounded-full flex flex-col items-center justify-center shadow-sm"
            style={{ width: BTN_SIZE, height: BTN_SIZE, background: '#fff', border: '1px solid rgba(10,10,10,0.06)', cursor: 'pointer', position: 'relative' }}
          >
            <Link2 size={16} style={{ color: '#D4A843' }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.55rem', fontWeight: 600, color: 'rgba(10,10,10,0.5)', marginTop: '1px' }}>
              {lights.length}
            </span>
          </button>

          {/* Profil — rund, gleiche Groesse */}
          <button
            onClick={() => user ? setDialog('profile') : setDialog('auth')}
            className="rounded-full flex items-center justify-center overflow-hidden shadow-sm"
            style={{
              width: BTN_SIZE, height: BTN_SIZE,
              background: user?.imageUrl ? 'transparent' : '#fff',
              border: user?.imageUrl ? '2.5px solid rgba(212,168,67,0.4)' : '1px solid rgba(10,10,10,0.06)',
              cursor: 'pointer',
            }}
          >
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User size={18} style={{ color: user ? '#D4A843' : 'rgba(10,10,10,0.35)' }} />
            )}
          </button>
        </div>
      </div>

      {/* Mode Indicator */}
      {mode !== 'browse' && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#0A0A0A' }}>
            {mode === 'place-light' ? 'Tippe auf die Karte, um dein Licht zu setzen' : 'Tippe auf die Karte, um den Ort zu waehlen'}
          </p>
          <button onClick={() => setMode('browse')} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(10,10,10,0.4)', cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline' }}>
            Abbrechen
          </button>
        </div>
      )}

      <ActionButton onSetLight={handleSetLight} onCreateEvent={handleCreateEvent} />

      {tutorialStep && <GuidedTutorial step={tutorialStep} onNext={handleTutorialNext} onClose={closeTutorial} />}

      {dialog === 'auth' && <AuthDialog onClose={() => setDialog('none')} onSuccess={handleAuthSuccess} />}
      {dialog === 'profile' && <ProfileDialog onClose={handleProfileClose} />}
      {dialog === 'create-event' && (
        <CreateEventDialog position={eventPosition} onClose={() => { setDialog('none'); setEventPosition(undefined) }} />
      )}
    </div>
  )
}

export default function MapApp() {
  return (
    <AppProvider>
      <MapAppInner />
    </AppProvider>
  )
}
