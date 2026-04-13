const API_BASE = '/api'

function getToken(): string | null {
  return localStorage.getItem('lichtung-token')
}

function setToken(token: string) {
  localStorage.setItem('lichtung-token', token)
}

function clearToken() {
  localStorage.removeItem('lichtung-token')
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Fehler')
  return data
}

// ─── Auth ───

export async function sendMagicLink(email: string, newsletter: boolean) {
  return request('/auth/magic-link', {
    method: 'POST',
    body: JSON.stringify({ email, newsletter }),
  })
}

export async function verifyToken(token: string) {
  const data = await request(`/auth/verify?token=${token}`)
  setToken(data.token)
  return data.user
}

export async function getProfile() {
  return request('/profile')
}

export async function updateProfile(name: string, statement: string) {
  return request('/profile', {
    method: 'PUT',
    body: JSON.stringify({ name, statement }),
  })
}

export async function uploadProfileImage(file: File) {
  const formData = new FormData()
  formData.append('image', file)
  return request('/profile/image', {
    method: 'POST',
    body: formData,
  })
}

// ─── Lights ───

export async function getLights() {
  return request('/lights')
}

export async function getLightCount() {
  const data = await request('/lights/count')
  return data.count as number
}

export async function createLight(lat: number, lng: number, invitedBy?: string) {
  return request('/lights', {
    method: 'POST',
    body: JSON.stringify({ lat, lng, invited_by: invitedBy }),
  })
}

// ─── Events ───

export async function getEvents() {
  return request('/events')
}

export async function createEvent(event: {
  title: string
  description: string
  lat: number
  lng: number
  start_time: string
  end_time?: string
  type: string
  recurring?: string
}) {
  return request('/events', {
    method: 'POST',
    body: JSON.stringify(event),
  })
}

export { getToken, setToken, clearToken }
