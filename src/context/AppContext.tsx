import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

// ─── Types ───

export interface LightPin {
  id: string
  position: [number, number]
  name: string
  statement: string
  invitedBy?: string
  createdAt: string
}

export interface EventItem {
  id: string
  title: string
  description: string
  position: [number, number]
  start: string
  end?: string
  type: 'meditation' | 'gebet' | 'fest' | 'begegnung' | 'tanz' | 'stille'
  recurring?: 'vollmond' | 'neumond' | 'woechentlich' | 'monatlich'
  createdBy: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  statement: string
  imageUrl?: string
  lightId?: string
}

interface AppState {
  user: UserProfile | null
  lights: LightPin[]
  events: EventItem[]
  login: (userData: { id?: string; email: string; name?: string; statement?: string; imageUrl?: string }) => void
  logout: () => void
  updateProfile: (profile: Partial<UserProfile>) => void
  setLights: (lights: LightPin[]) => void
  setEvents: (events: EventItem[]) => void
  addLight: (position: [number, number]) => void
  addEvent: (event: Omit<EventItem, 'id' | 'createdBy'>) => void
}

// Keine Demo-Daten — alles kommt aus dem Backend

// ─── Context ───

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [lights, setLightsState] = useState<LightPin[]>([])
  const [events, setEvents] = useState<EventItem[]>([])

  // Auto-Login: Token aus localStorage wiederherstellen
  useEffect(() => {
    const token = localStorage.getItem('lichtung-token')
    if (token) {
      fetch('/api/profile', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          setUser({
            id: data.id,
            email: data.email,
            name: data.name || '',
            statement: data.statement || '',
            imageUrl: data.image_path && data.image_path !== 'null' ? data.image_path : undefined,
          })
        })
        .catch(() => localStorage.removeItem('lichtung-token'))
    }
  }, [])

  const setLights = useCallback((newLights: LightPin[]) => {
    // Map backend format to frontend format — alle Felder durchreichen
    const mapped = newLights.map((l: any) => ({
      id: l.id,
      position: [l.lat ?? l.position?.[0], l.lng ?? l.position?.[1]] as [number, number],
      name: l.name || '',
      statement: l.statement || '',
      invitedBy: l.invited_by,
      createdAt: l.created_at || l.createdAt || '',
      // Extra-Felder fuer Profil-Anzeige
      image_path: l.image_path || null,
      bio: l.bio || '',
      telegram: l.telegram || null,
      user_id: l.user_id || null,
    }))
    setLightsState(mapped)
  }, [])

  const login = useCallback((userData: { id?: string; email: string; name?: string; statement?: string; imageUrl?: string }) => {
    setUser(prev => ({
      id: userData.id || prev?.id || crypto.randomUUID(),
      email: userData.email,
      name: userData.name || prev?.name || '',
      statement: userData.statement || prev?.statement || '',
      imageUrl: userData.imageUrl || prev?.imageUrl,
    }))
  }, [])

  const logout = useCallback(() => setUser(null), [])

  const updateProfile = useCallback((profile: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...profile } : null)
  }, [])

  const addLight = useCallback((position: [number, number]) => {
    if (!user) return
    const light: LightPin = {
      id: crypto.randomUUID(),
      position,
      name: user.name || 'Anonym',
      statement: user.statement || '',
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setLightsState(prev => [...prev, light])
    setUser(prev => prev ? { ...prev, lightId: light.id } : null)
  }, [user])

  const addEvent = useCallback((event: Omit<EventItem, 'id' | 'createdBy'>) => {
    if (!user) return
    setEvents(prev => [...prev, {
      ...event,
      id: crypto.randomUUID(),
      createdBy: user.id,
    }])
  }, [user])

  return (
    <AppContext.Provider value={{ user, lights, events, login, logout, updateProfile, setLights, setEvents, addLight, addEvent }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
