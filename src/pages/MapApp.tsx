import { useState, useEffect } from 'react'
import { User, Link2, QrCode, CalendarDays, LocateFixed, Check, X as XIcon } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { AppProvider, useApp } from '../context/AppContext'
import { PeaceMap } from '../components/map/PeaceMap'
import { ActionButton } from '../components/map/ActionButton'
import { MapFilters } from '../components/map/MapFilters'
import { GuidedTutorial, type TutorialStep } from '../components/map/GuidedTutorial'
import { AuthDialog } from '../components/auth/AuthDialog'
import { ProfileDialog } from '../components/auth/ProfileDialog'
import { QRCodeDialog } from '../components/auth/QRCodeDialog'
import { CreateEventDialog } from '../components/events/CreateEventDialog'
import { EventCalendar } from '../components/events/EventCalendar'
import { Logo } from '../components/Logo'
import { WandCursor } from '../components/map/WandCursor'
import * as api from '../api/client'

const BTN_SIZE = 46

type Dialog = 'none' | 'auth' | 'profile' | 'create-event' | 'qr-code'
type Mode = 'browse' | 'place-light' | 'place-event'

function MapAppInner() {
  const { user, lights, setLights, setEvents, login: loginCtx } = useApp()
  const [dialog, setDialog] = useState<Dialog>('none')
  const [mode, setMode] = useState<Mode>('browse')
  const [eventPosition, setEventPosition] = useState<[number, number] | undefined>()
  const [tutorialStep, setTutorialStep] = useState<TutorialStep | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [isNewUser, setIsNewUser] = useState(false)
  const [showLights, setShowLights] = useState(true)
  const [showEvents, setShowEvents] = useState(true)
  const [showCalendar, setShowCalendar] = useState(false)
  const [mapRadius, setMapRadius] = useState(500)
  const [showLocateDialog, setShowLocateDialog] = useState(false)
  const [locatedPos, setLocatedPos] = useState<[number, number] | null>(null)
  const [autoLight, setAutoLight] = useState(() => localStorage.getItem('lichtung-auto-light') === '1')
  const [flyTo, setFlyTo] = useState<[number, number, number] | null>(null)
  const [invitedBy, setInvitedBy] = useState<string | null>(null)

  // Capture invite parameter
  useEffect(() => {
    const invite = searchParams.get('invite')
    if (invite) {
      setInvitedBy(invite)
      setSearchParams({})
      if (!api.getToken()) setDialog('auth')
    }
  }, [])

  // Load lights and events from backend
  useEffect(() => {
    api.getLights().then(data => setLights(data)).catch(() => {})
    api.getEvents().then(data => {
      const mapped = data.map((e: any) => ({
        id: e.id,
        title: e.title,
        description: e.description || '',
        position: [e.lat, e.lng] as [number, number],
        start: e.start_time,
        end: e.end_time,
        type: e.type || 'meditation',
        recurring: e.recurring,
        createdBy: e.user_id,
      }))
      setEvents(mapped)
    }).catch(() => {})
  }, [])

  // Auto-login passiert jetzt im AppProvider

  // Handle email verification
  useEffect(() => {
    const verifyToken = searchParams.get('verify')
    if (verifyToken) {
      api.verifyEmail(verifyToken).catch(() => {})
      setSearchParams({})
    }
  }, [])

  // Auto-Standort: Beim Laden Licht automatisch setzen
  useEffect(() => {
    if (!user || !api.getToken()) return
    if (localStorage.getItem('lichtung-auto-light') !== '1') return
    if (!('geolocation' in navigator)) return

    navigator.geolocation.getCurrentPosition(
      pos => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setFlyTo([p[0], p[1], 16])
        api.createLight(p[0], p[1]).then(() => api.getLights()).then(setLights).catch(() => {})
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [user])

  // Tutorial only for first-time visitors
  useEffect(() => {
    const seen = localStorage.getItem('lichtung-tutorial-seen')
    if (!seen && !api.getToken() && !searchParams.get('invite')) setTutorialStep('welcome')
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
    loginCtx({ id: userData.id, email: userData.email, name: userData.name, statement: userData.statement, imageUrl: userData.image_path || undefined })
    // Mark tutorial as seen after first auth
    localStorage.setItem('lichtung-tutorial-seen', '1')
    // Only show profile fill + set-light if name is empty (brand new user)
    if (!userData.name) {
      setIsNewUser(true)
      setDialog('profile')
    } else {
      setDialog('none')
    }
  }

  const handleProfileClose = () => {
    setDialog('none')
    if (isNewUser && user?.name) {
      setTutorialStep('set-light')
      setIsNewUser(false)
    }
  }

  const handleLocateMe = () => {
    if (!('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(
      pos => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setLocatedPos(p)
        // Karte zum Standort fliegen (~100m Zoom = Stufe 16)
        setFlyTo([p[0], p[1], 16])

        if (autoLight && user && api.getToken()) {
          // Auto-Licht: direkt setzen ohne Dialog
          api.createLight(p[0], p[1]).then(() => api.getLights()).then(setLights).catch(() => {})
        } else {
          setShowLocateDialog(true)
        }
      },
      () => alert('Standort konnte nicht ermittelt werden.'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSetLightAtLocation = async () => {
    if (!locatedPos || !user) return
    try {
      await api.createLight(locatedPos[0], locatedPos[1])
      const updated = await api.getLights()
      setLights(updated)
    } catch {}
    setShowLocateDialog(false)
  }

  const toggleAutoLight = () => {
    const next = !autoLight
    setAutoLight(next)
    localStorage.setItem('lichtung-auto-light', next ? '1' : '0')
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

  const handleMapClick = async (position: [number, number]) => {
    if (mode === 'place-light') {
      try {
        await api.createLight(position[0], position[1], invitedBy || undefined)
        // Lichter vom Server neu laden — dort ist nur eins pro User
        const updated = await api.getLights()
        setLights(updated)
        setInvitedBy(null)
      } catch (err: any) {
        console.error('Licht setzen fehlgeschlagen:', err)
        if (err?.message?.includes('angemeldet') || err?.message?.includes('ungueltig')) {
          // Token abgelaufen — neu einloggen
          api.clearToken()
          setDialog('auth')
        }
      }
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
    <div className={`fixed inset-0 ${mode === 'place-light' ? 'cursor-wand' : ''}`} style={{ background: '#F5F4F0' }}>
      <PeaceMap
        onMapClick={handleMapClick}
        placingLight={mode === 'place-light' || mode === 'place-event'}
        showLights={showLights}
        showEvents={showEvents}
        onRadiusChange={setMapRadius}
        flyTo={flyTo}
      />

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 py-3" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.92), rgba(255,255,255,0))', pointerEvents: 'none' }}>
        <Link to="/" style={{ textDecoration: 'none', pointerEvents: 'auto' }}>
          <div className="rounded-full flex items-center justify-center shadow-sm" style={{ width: BTN_SIZE, height: BTN_SIZE, background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
            <Logo size={34} />
          </div>
        </Link>

        <div className="flex items-center gap-2.5" style={{ pointerEvents: 'auto' }}>
          {/* Standort-Pointer */}
          <button
            onClick={handleLocateMe}
            className="rounded-full flex items-center justify-center shadow-sm"
            style={{ width: BTN_SIZE, height: BTN_SIZE, background: '#fff', border: '1px solid rgba(10,10,10,0.06)', cursor: 'pointer' }}
          >
            <LocateFixed size={18} style={{ color: '#D4A843' }} />
          </button>

          {/* Lichterkette */}
          <button
            className="rounded-full flex flex-col items-center justify-center shadow-sm"
            style={{ width: BTN_SIZE, height: BTN_SIZE, background: '#fff', border: '1px solid rgba(10,10,10,0.06)', cursor: 'pointer' }}
          >
            <Link2 size={16} style={{ color: '#D4A843' }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.55rem', fontWeight: 600, color: 'rgba(10,10,10,0.5)', marginTop: '1px' }}>
              {lights.length}
            </span>
          </button>

          {/* Kalender */}
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="rounded-full flex items-center justify-center shadow-sm"
            style={{ width: BTN_SIZE, height: BTN_SIZE, background: showCalendar ? 'rgba(212,168,67,0.1)' : '#fff', border: showCalendar ? '1px solid rgba(212,168,67,0.3)' : '1px solid rgba(10,10,10,0.06)', cursor: 'pointer' }}
          >
            <CalendarDays size={18} style={{ color: showCalendar ? '#D4A843' : 'rgba(10,10,10,0.35)' }} />
          </button>

          {/* Profil — mit QR-Code-Overlay */}
          <div className="relative">
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
            {user && (
              <button
                onClick={() => setDialog('qr-code')}
                className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center"
                style={{ width: 20, height: 20, background: '#fff', border: '1px solid rgba(10,10,10,0.1)', cursor: 'pointer' }}
              >
                <QrCode size={10} style={{ color: '#D4A843' }} />
              </button>
            )}
          </div>
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

      {/* Filters */}
      <MapFilters
        showLights={showLights}
        showEvents={showEvents}
        onToggleLights={() => setShowLights(!showLights)}
        onToggleEvents={() => setShowEvents(!showEvents)}
      />

      <ActionButton onSetLight={handleSetLight} onCreateEvent={handleCreateEvent} />
      {tutorialStep && <GuidedTutorial step={tutorialStep} onNext={handleTutorialNext} onClose={closeTutorial} />}
      {dialog === 'auth' && <AuthDialog onClose={() => setDialog('none')} onSuccess={handleAuthSuccess} />}
      {dialog === 'profile' && <ProfileDialog onClose={handleProfileClose} />}
      {dialog === 'qr-code' && user && <QRCodeDialog userId={user.id} userName={user.name} onClose={() => setDialog('none')} />}
      {dialog === 'create-event' && <CreateEventDialog position={eventPosition} onClose={() => { setDialog('none'); setEventPosition(undefined) }} />}
      {showCalendar && <EventCalendar onClose={() => setShowCalendar(false)} mapRadius={mapRadius} />}

      {/* Standort-Dialog */}
      {showLocateDialog && locatedPos && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="rounded-2xl p-6 shadow-xl w-full max-w-xs" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', fontWeight: 500, color: '#0A0A0A', marginBottom: '8px' }}>
              Dein Standort
            </h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(10,10,10,0.5)', marginBottom: '16px', lineHeight: 1.6 }}>
              Moechtest du dein Licht an deinen aktuellen Standort setzen?
            </p>

            {user ? (
              <>
                <button
                  onClick={handleSetLightAtLocation}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-2"
                  style={{ background: '#0A0A0A', border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, color: '#fff', cursor: 'pointer' }}
                >
                  <LocateFixed size={16} />
                  Licht hier setzen
                </button>

                <label className="flex items-center gap-2 cursor-pointer mt-3">
                  <button
                    onClick={toggleAutoLight}
                    className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                    style={{ border: autoLight ? 'none' : '1px solid rgba(10,10,10,0.15)', background: autoLight ? '#D4A843' : '#fff', cursor: 'pointer' }}
                  >
                    {autoLight && <Check size={14} color="#fff" />}
                  </button>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(10,10,10,0.45)' }}>
                    Licht automatisch setzen
                  </span>
                </label>
              </>
            ) : (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(10,10,10,0.4)' }}>
                Melde dich an, um dein Licht zu setzen.
              </p>
            )}

            <button
              onClick={() => setShowLocateDialog(false)}
              className="w-full flex items-center justify-center gap-1 py-2 mt-2"
              style={{ background: 'none', border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(10,10,10,0.35)', cursor: 'pointer' }}
            >
              <XIcon size={14} /> Schliessen
            </button>
          </div>
        </div>
      )}

      <WandCursor active={mode === 'place-light'} />
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
