import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

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
  login: (email: string) => void
  logout: () => void
  updateProfile: (profile: Partial<UserProfile>) => void
  addLight: (position: [number, number]) => void
  addEvent: (event: Omit<EventItem, 'id' | 'createdBy'>) => void
}

// ─── Demo Data ───

const DEMO_LIGHTS: LightPin[] = [
  { id: '1', position: [48.1351, 11.5820], name: 'Anna', statement: 'Frieden beginnt mit einem Laecheln.', createdAt: '2026-04-01' },
  { id: '2', position: [52.5200, 13.4050], name: 'Marcus', statement: 'Wir sind alle eins.', createdAt: '2026-04-02' },
  { id: '3', position: [50.9375, 6.9603], name: 'Lena', statement: 'In der Stille liegt die Kraft.', createdAt: '2026-04-03' },
  { id: '4', position: [48.7758, 9.1829], name: 'Jonas', statement: 'Liebe ist die Antwort.', createdAt: '2026-04-04' },
  { id: '5', position: [53.5511, 9.9937], name: 'Mira', statement: 'Die Erde traegt uns alle.', createdAt: '2026-04-05' },
  { id: '6', position: [47.3769, 8.5417], name: 'David', statement: 'Verbundenheit heilt.', createdAt: '2026-04-06' },
  { id: '7', position: [48.2082, 16.3738], name: 'Sophie', statement: 'Jedes Herz ist ein Stern.', createdAt: '2026-04-07' },
  { id: '8', position: [51.3397, 12.3731], name: 'Felix', statement: 'Gemeinsam leuchten wir heller.', createdAt: '2026-04-08' },
  { id: '9', position: [50.1109, 8.6821], name: 'Clara', statement: 'Frieden ist eine Entscheidung.', createdAt: '2026-04-09' },
  { id: '10', position: [47.0505, 8.3093], name: 'Noah', statement: 'Die Stille spricht lauter als Worte.', createdAt: '2026-04-10' },
  { id: '11', position: [49.4521, 11.0767], name: 'Emilia', statement: 'Licht kennt keine Grenzen.', createdAt: '2026-04-11' },
  { id: '12', position: [51.0504, 13.7373], name: 'Lukas', statement: 'Wo Licht ist, gibt es keinen Schatten.', createdAt: '2026-04-12' },
]

const DEMO_EVENTS: EventItem[] = [
  {
    id: 'e1',
    title: 'Vollmond-Meditation',
    description: 'Gemeinsames Innehalten in der Stille. Wir verbinden uns im Licht des Vollmondes.',
    position: [52.5200, 13.4050],
    start: '2026-04-26T21:00:00',
    type: 'meditation',
    recurring: 'vollmond',
    createdBy: '2',
  },
  {
    id: 'e2',
    title: 'Friedenskreis am Englischen Garten',
    description: 'Wir treffen uns unter dem grossen Baum am Eisbach. Singen, Stille, Verbundenheit.',
    position: [48.1580, 11.5920],
    start: '2026-04-20T18:00:00',
    end: '2026-04-20T20:00:00',
    type: 'begegnung',
    createdBy: '1',
  },
  {
    id: 'e3',
    title: 'Stille fuer den Frieden',
    description: 'Eine Stunde gemeinsame Stille. Jeder fuer sich, alle zusammen.',
    position: [47.3769, 8.5417],
    start: '2026-04-22T12:00:00',
    end: '2026-04-22T13:00:00',
    type: 'stille',
    createdBy: '6',
  },
]

// ─── Context ───

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [lights, setLights] = useState<LightPin[]>(DEMO_LIGHTS)
  const [events, setEvents] = useState<EventItem[]>(DEMO_EVENTS)

  const login = useCallback((email: string) => {
    const id = crypto.randomUUID()
    setUser({ id, email, name: '', statement: '' })
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
    setLights(prev => [...prev, light])
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
    <AppContext.Provider value={{ user, lights, events, login, logout, updateProfile, addLight, addEvent }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
