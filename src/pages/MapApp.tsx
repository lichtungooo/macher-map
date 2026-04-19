import { useState, useEffect } from 'react'
import { User, QrCode, CalendarDays, LocateFixed, Check, X as XIcon, Settings } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { AppProvider, useApp } from '../context/AppContext'
import { PeaceMap } from '../components/map/PeaceMap'
import { ActionButton } from '../components/map/ActionButton'
import { MapSettings } from '../components/map/MapSettings'
import { GuidedTutorial, type TutorialStep } from '../components/map/GuidedTutorial'
import { AuthDialog } from '../components/auth/AuthDialog'
import { ProfileDialog } from '../components/auth/ProfileDialog'
import { QRCodeDialog } from '../components/auth/QRCodeDialog'
import { CreateEventDialog } from '../components/events/CreateEventDialog'
import { EventCalendar } from '../components/events/EventCalendar'
import { EventDetail } from '../components/events/EventDetail'
import { Logo } from '../components/Logo'
import { WandCursor } from '../components/map/WandCursor'
import { InfoPopup } from '../components/map/InfoPopup'
import { LichtungDetail } from '../components/map/LichtungDetail'
import { CreateLichtungDialog } from '../components/map/CreateLichtungDialog'
import { ProfileDetail } from '../components/map/ProfileDetail'
import * as api from '../api/client'

const BTN_SIZE = 46

function MapTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[1100]"
        style={{ background: '#0A0A0A', whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', color: '#fff' }}>{label}</span>
      </div>
    </div>
  )
}

type Dialog = 'none' | 'auth' | 'profile' | 'create-event' | 'create-lichtung' | 'qr-code'
type Mode = 'browse' | 'place-light' | 'place-event' | 'place-lichtung' | 'move-lichtung'

function MapAppInner() {
  const { user, setLights, setEvents, login: loginCtx } = useApp()
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
  const [desiredZoomRadius, setDesiredZoomRadius] = useState<number | null>(null)
  const [lichtungen, setLichtungen] = useState<any[]>([])
  const [selectedLichtung, setSelectedLichtung] = useState<string | null>(null)
  const [lichtungPosition, setLichtungPosition] = useState<[number, number] | undefined>()
  const [movingLichtungId, setMovingLichtungId] = useState<string | null>(null)
  const [eventLichtung, setEventLichtung] = useState<{ id: string; name: string } | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<any>(null)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showChain, setShowChain] = useState(false)
  const [chainData, setChainData] = useState<any[]>([])
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

  // Lichtungen + Verbindungen laden
  useEffect(() => {
    api.getLichtungen().then(setLichtungen).catch(() => {})
  }, [])

  // Ort-QR-Code: ?place=CODE&by=USER_ID (Bringer)
  useEffect(() => {
    const placeCode = searchParams.get('place')
    const broughtBy = searchParams.get('by')
    if (!placeCode) return
    setSearchParams({})
    if (api.getToken()) {
      api.joinLichtungByCode(placeCode, broughtBy || undefined).then(data => {
        setSelectedLichtung(data.lichtung_id)
        api.getLichtungen().then(setLichtungen)
      }).catch(() => {})
    } else {
      sessionStorage.setItem('lichtung-join-code', placeCode)
      if (broughtBy) sessionStorage.setItem('lichtung-join-by', broughtBy)
      setDialog('auth')
    }
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
        setFlyTo([p[0], p[1], 16 + Math.random() * 0.001])
        api.createLight(p[0], p[1]).then(() => api.getLights()).then(setLights).catch(() => {})
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }, [user])

  // Auto-Zoom auf eigenes Licht (100km Umkreis), Fallback: GPS
  useEffect(() => {
    function zoomTo(lat: number, lng: number) {
      const radiusKm = 100
      const smallerDim = Math.min(window.innerHeight, window.innerWidth)
      const desiredMpx = (radiusKm * 2000) / smallerDim
      const targetZoom = Math.log2((40075016.686 * Math.cos(lat * Math.PI / 180)) / (256 * desiredMpx))
      const zoom = Math.max(2, Math.min(18, targetZoom))
      setFlyTo([lat, lng, zoom + Math.random() * 0.001])
    }

    // Eigenes Licht aus dem Backend laden
    if (api.getToken()) {
      api.getProfile().then((profile: any) => {
        // Licht des Users finden
        return api.getLights().then((lights: any[]) => {
          const myLight = lights.find((l: any) => l.user_id === profile.id)
          if (myLight) {
            zoomTo(myLight.lat, myLight.lng)
          } else if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              pos => zoomTo(pos.coords.latitude, pos.coords.longitude),
              () => {},
              { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
            )
          }
        })
      }).catch(() => {
        // Nicht eingeloggt oder Fehler → GPS Fallback
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            pos => zoomTo(pos.coords.latitude, pos.coords.longitude),
            () => {},
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
          )
        }
      })
    } else if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => zoomTo(pos.coords.latitude, pos.coords.longitude),
        () => {},
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      )
    }
  }, [])

  // Tutorial only for first-time visitors
  useEffect(() => {
    const seen = localStorage.getItem('lichtung-tutorial-seen')
    if (!seen && !api.getToken() && !searchParams.get('invite')) setTutorialStep('welcome')
  }, [])

  // Escape-Taste zum Abbrechen von Platzierungsmodi
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mode !== 'browse') setMode('browse')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mode])

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
    if (!('geolocation' in navigator)) {
      alert('Geolocation nicht verfuegbar in diesem Browser.')
      return
    }
    // Visuelles Feedback: Button kurz gold faerben
    navigator.geolocation.getCurrentPosition(
      pos => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        console.log('GPS Position:', p[0], p[1], 'Genauigkeit:', pos.coords.accuracy, 'm')
        setLocatedPos(p)
        setFlyTo([p[0], p[1], 16 + Math.random() * 0.001])

        if (autoLight && user && api.getToken()) {
          api.createLight(p[0], p[1]).then(() => api.getLights()).then(setLights).catch(() => {})
        } else {
          setShowLocateDialog(true)
        }
      },
      (err) => {
        console.error('Standort-Fehler:', err.code, err.message)
        if (err.code === 1) {
          alert('Standort-Berechtigung verweigert. Bitte in den Browser-Einstellungen erlauben.')
        } else if (err.code === 2) {
          alert('Standort nicht verfuegbar. GPS-Signal nicht empfangbar.')
        } else {
          alert('Standort-Abfrage abgelaufen. Bitte erneut versuchen.')
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
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

  const handleCreateLichtung = () => {
    if (!user) { setDialog('auth'); return }
    setMode('place-lichtung')
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
    } else if (mode === 'place-lichtung') {
      setLichtungPosition(position)
      setDialog('create-lichtung')
      setMode('browse')
    } else if (mode === 'move-lichtung' && movingLichtungId) {
      try {
        await api.updateLichtung(movingLichtungId, { lat: position[0], lng: position[1] })
        const updated = await api.getLichtungen()
        setLichtungen(updated)
        setSelectedLichtung(movingLichtungId)
      } catch (err) {
        console.error('Lichtung verschieben fehlgeschlagen:', err)
      }
      setMovingLichtungId(null)
      setMode('browse')
    }
  }

  return (
    <div className={`fixed inset-0 ${mode === 'place-light' ? 'cursor-wand' : ''}`} style={{ background: '#F5F4F0' }}>
      <PeaceMap
        onMapClick={handleMapClick}
        placingLight={mode !== 'browse'}
        showLights={showLights}
        showEvents={showEvents}
        onRadiusChange={setMapRadius}
        flyTo={flyTo}
        zoomToRadius={desiredZoomRadius}
        lichtungen={lichtungen}
        onLichtungClick={id => setSelectedLichtung(id)}
        onShowProfile={light => setSelectedProfile(light)}
        onShowEvent={event => setSelectedEvent(event)}
        chainData={chainData}
        showChain={showChain}
      />

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 py-3" style={{ pointerEvents: 'none' }}>
        <MapTooltip label="Lichtung">
          <Link to="/" style={{ textDecoration: 'none', pointerEvents: 'auto' }}>
            <Logo size={42} />
          </Link>
        </MapTooltip>

        <div className="flex items-center gap-2.5" style={{ pointerEvents: 'auto' }}>
          {/* Einstellungen */}
          <MapTooltip label="Einstellungen">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-full flex items-center justify-center shadow-sm"
              style={{ width: BTN_SIZE, height: BTN_SIZE, background: showSettings ? '#F5EDD8' : '#fff', border: '1px solid ' + (showSettings ? 'rgba(212,168,67,0.35)' : 'rgba(10,10,10,0.06)'), cursor: 'pointer' }}
            >
              <Settings size={18} style={{ color: showSettings ? '#D4A843' : 'rgba(10,10,10,0.35)' }} />
            </button>
          </MapTooltip>

          {/* Kalender */}
          <MapTooltip label="Kalender">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="rounded-full flex items-center justify-center shadow-sm"
              style={{ width: BTN_SIZE, height: BTN_SIZE, background: showCalendar ? '#F5EDD8' : '#fff', border: '1px solid ' + (showCalendar ? 'rgba(212,168,67,0.35)' : 'rgba(10,10,10,0.06)'), cursor: 'pointer' }}
            >
              <CalendarDays size={18} style={{ color: showCalendar ? '#D4A843' : 'rgba(10,10,10,0.35)' }} />
            </button>
          </MapTooltip>

          {/* Profil — mit QR-Code-Overlay */}
          <MapTooltip label="Profil">
            <div className="relative">
              <button
                onClick={() => user ? setDialog('profile') : setDialog('auth')}
                className="rounded-full flex items-center justify-center overflow-hidden shadow-sm"
                style={{
                  width: BTN_SIZE, height: BTN_SIZE,
                  background: user?.imageUrl ? '#F5EDD8' : '#fff',
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
          </MapTooltip>
        </div>
      </div>

      {/* Mode Indicator */}
      {mode !== 'browse' && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg" style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.06)' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#0A0A0A', textAlign: 'center' }}>
            {mode === 'place-light' && 'Setze dein Licht auf die Karte'}
            {mode === 'place-lichtung' && 'Setze deinen Ort auf die Karte'}
            {mode === 'place-event' && 'Setze deinen Termin auf die Karte'}
            {mode === 'move-lichtung' && 'Tippe den neuen Ort der Lichtung an'}
          </p>
          <button onClick={() => { setMode('browse'); setMovingLichtungId(null) }}
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(10,10,10,0.4)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Abbrechen
          </button>
        </div>
      )}

      {/* Standort-Pointer — unten links */}
      <div className="fixed left-4 bottom-6 z-[1000]">
        <MapTooltip label="Standort">
          <button
            onClick={handleLocateMe}
            className="rounded-full flex items-center justify-center shadow-lg"
            style={{ width: BTN_SIZE, height: BTN_SIZE, background: '#fff', border: '1px solid rgba(10,10,10,0.08)', cursor: 'pointer' }}
          >
            <LocateFixed size={18} style={{ color: '#D4A843' }} />
          </button>
        </MapTooltip>
      </div>

      <ActionButton onSetLight={handleSetLight} onCreateEvent={handleCreateEvent} onCreateLichtung={handleCreateLichtung} />
      {tutorialStep && <GuidedTutorial step={tutorialStep} onNext={handleTutorialNext} onClose={closeTutorial} />}
      {dialog === 'auth' && <AuthDialog onClose={() => setDialog('none')} onSuccess={handleAuthSuccess} />}
      {dialog === 'profile' && <ProfileDialog onClose={handleProfileClose} onShowChainOnMap={() => {
        api.getChain().then(data => {
          setChainData(data)
          setShowChain(true)
        }).catch(() => {})
      }} />}
      {dialog === 'qr-code' && user && <QRCodeDialog userId={user.id} userName={user.name} onClose={() => setDialog('none')} />}
      {dialog === 'create-event' && <CreateEventDialog position={eventPosition} lichtungId={eventLichtung?.id} lichtungName={eventLichtung?.name} onClose={() => { setDialog('none'); setEventPosition(undefined); setEventLichtung(null) }} />}
      {dialog === 'create-lichtung' && <CreateLichtungDialog position={lichtungPosition} onClose={() => { setDialog('none'); setLichtungPosition(undefined) }} onCreated={() => api.getLichtungen().then(setLichtungen)} />}
      {showCalendar && <EventCalendar onClose={() => setShowCalendar(false)} mapRadius={mapRadius} onRadiusSlide={setDesiredZoomRadius} onCreateEvent={() => { setShowCalendar(false); handleCreateEvent() }} />}
      {showSettings && <MapSettings showLights={showLights} showEvents={showEvents} onToggleLights={() => setShowLights(!showLights)} onToggleEvents={() => setShowEvents(!showEvents)} onClose={() => setShowSettings(false)} />}

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

      {selectedLichtung && <LichtungDetail lichtungId={selectedLichtung} onClose={() => setSelectedLichtung(null)}
        onCreateEvent={(lid, lname, pos) => {
          setSelectedLichtung(null)
          setEventPosition(pos)
          setEventLichtung({ id: lid, name: lname })
          setDialog('create-event')
        }}
        onMoveLichtung={(lid) => {
          setMovingLichtungId(lid)
          setSelectedLichtung(null)
          setMode('move-lichtung')
        }} />}
      {selectedProfile && <ProfileDetail light={selectedProfile} onClose={() => setSelectedProfile(null)} />}
      {selectedEvent && <EventDetail event={selectedEvent} userPos={null} onClose={() => setSelectedEvent(null)} />}
      <InfoPopup />
      <WandCursor active={mode !== 'browse'} />
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
