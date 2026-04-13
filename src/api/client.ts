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

export async function register(email: string, password: string, newsletter: boolean) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, newsletter }),
  })
  setToken(data.token)
  return data.user
}

export async function login(email: string, password: string) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(data.token)
  return data.user
}

export async function forgotPassword(email: string) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function resetPassword(token: string, password: string) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
}

export async function verifyEmail(token: string) {
  return request(`/auth/verify-email?token=${token}`)
}

// ─── Profile ───

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
  return request('/profile/image', { method: 'POST', body: formData })
}

// ─── Lights ───

export async function getLights() { return request('/lights') }
export async function getLightCount() { return (await request('/lights/count')).count as number }
export async function createLight(lat: number, lng: number, invitedBy?: string) {
  return request('/lights', { method: 'POST', body: JSON.stringify({ lat, lng, invited_by: invitedBy }) })
}

// ─── Events ───

export async function getEvents() { return request('/events') }
export async function createEvent(event: Record<string, unknown>) {
  return request('/events', { method: 'POST', body: JSON.stringify(event) })
}

export { getToken, setToken, clearToken }
