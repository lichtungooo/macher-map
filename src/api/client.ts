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

export async function updateProfile(data: { name?: string; statement?: string; bio?: string; telegram?: string }) {
  return request('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
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
export async function updateEvent(id: string, data: Record<string, unknown>) {
  return request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteEvent(id: string, reason?: string) {
  const query = reason ? `?reason=${encodeURIComponent(reason)}` : ''
  return request(`/events/${id}${query}`, { method: 'DELETE' })
}

// ─── Event Teilnahme ───

export async function joinEvent(eventId: string) {
  return request(`/events/${eventId}/join`, { method: 'POST' })
}
export async function leaveEvent(eventId: string) {
  return request(`/events/${eventId}/leave`, { method: 'POST' })
}
export async function getEventStatus(eventId: string) {
  return request(`/events/${eventId}/status`)
}
export async function watchEvent(eventId: string) {
  return request(`/events/${eventId}/watch`, { method: 'POST' })
}
export async function getEventParticipants(eventId: string) {
  return request(`/events/${eventId}/participants`)
}
export async function getMyEvents() {
  return request('/my/events')
}
export async function getCalToken() {
  return request('/my/cal-token')
}

// ─── Lichtungen ───

export async function getLichtungen() { return request('/lichtungen') }
export async function getLichtung(id: string) { return request(`/lichtungen/${id}`) }
export async function getLichtungEvents(id: string) { return request(`/lichtungen/${id}/events`) }
export async function createLichtung(data: { name: string; description: string; lat: number; lng: number }) {
  return request('/lichtungen', { method: 'POST', body: JSON.stringify(data) })
}

// ─── Lichtung Galerie ───

export async function getLichtungGallery(id: string) { return request(`/lichtungen/${id}/gallery`) }
export async function uploadLichtungImage(id: string, file: File, caption?: string) {
  const formData = new FormData()
  formData.append('image', file)
  if (caption) formData.append('caption', caption)
  return request(`/lichtungen/${id}/gallery`, { method: 'POST', body: formData })
}
export async function deleteLichtungImage(lichtungId: string, imageId: string) {
  return request(`/lichtungen/${lichtungId}/gallery/${imageId}`, { method: 'DELETE' })
}

// ─── Lichtung Telegram Links ───

export async function getLichtungTelegramLinks(id: string) {
  return request(`/lichtungen/${id}/telegram`)
}
export async function addLichtungTelegramLink(id: string, label: string, url: string, isPrivate?: boolean) {
  return request(`/lichtungen/${id}/telegram`, { method: 'POST', body: JSON.stringify({ label, url, is_private: isPrivate }) })
}
export async function deleteLichtungTelegramLink(lichtungId: string, linkId: string) {
  return request(`/lichtungen/${lichtungId}/telegram/${linkId}`, { method: 'DELETE' })
}
export async function updateLichtungTelegramLink(lichtungId: string, linkId: string, data: { label?: string; url?: string; is_private?: boolean }) {
  return request(`/lichtungen/${lichtungId}/telegram/${linkId}`, { method: 'PUT', body: JSON.stringify(data) })
}

// ─── Verbindungen ───

export async function getConnections() { return request('/connections') }
export async function getConnectionCount() { return (await request('/connections/count')).count as number }
export async function getChain() { return request('/chain') }
export async function setTelegram(telegram: string) {
  return request('/profile/telegram', { method: 'PUT', body: JSON.stringify({ telegram }) })
}

// ─── Lichtung Verfuegbarkeit ───

export async function getLichtungSlots(id: string, from?: string, to?: string) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  return request(`/lichtungen/${id}/slots?${params}`)
}
export async function setLichtungSlot(id: string, date: string, status: string, maxEvents?: number, note?: string) {
  return request(`/lichtungen/${id}/slots/${date}`, { method: 'PUT', body: JSON.stringify({ status, max_events: maxEvents, note }) })
}
export async function checkSlotAvailable(id: string, date: string) {
  return request(`/lichtungen/${id}/available/${date}`)
}
export async function getSlotsForDate(id: string, date: string) {
  return request(`/lichtungen/${id}/slots/${date}`)
}
export async function createTimeSlot(id: string, date: string, data: { startHour?: number; endHour?: number; status?: string; parallelSlots?: number; note?: string }) {
  return request(`/lichtungen/${id}/slots/${date}`, { method: 'POST', body: JSON.stringify(data) })
}
export async function deleteTimeSlot(lichtungId: string, slotId: string) {
  return request(`/lichtungen/${lichtungId}/slot/${slotId}`, { method: 'DELETE' })
}

// ─── Lichtung Mitglieder ───

export async function getLichtungMembers(id: string) { return request(`/lichtungen/${id}/members`) }
export async function getMyLichtungRole(id: string) { return request(`/lichtungen/${id}/my-role`) }
export async function joinLichtungByCode(code: string, invitedBy?: string) {
  return request(`/lichtungen/join/${code}`, { method: 'POST', body: JSON.stringify({ invitedBy }) })
}
export async function getLichtungQRCode(id: string) { return request(`/lichtungen/${id}/code`) }
export async function setMemberRole(lichtungId: string, userId: string, role: string) {
  return request(`/lichtungen/${lichtungId}/members/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) })
}

// ─── Invite ───

export async function createInvite() {
  return request('/invite/create', { method: 'POST' })
}

// ─── Notifications ───

export async function getNotifySettings() { return request('/notify/settings') }
export async function updateNotifySettings(data: Record<string, unknown>) {
  return request('/notify/settings', { method: 'PUT', body: JSON.stringify(data) })
}
export async function getTelegramLink() { return request('/notify/telegram-link') }

// ─── Tags ───

export async function searchTags(query: string) {
  return request(`/tags?q=${encodeURIComponent(query)}`)
}

export { getToken, setToken, clearToken }
