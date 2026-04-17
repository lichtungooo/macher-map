const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const API = `https://api.telegram.org/bot${BOT_TOKEN}`
const BASE_URL = process.env.BASE_URL || 'https://lichtung.ooo'

export async function sendTelegramMessage(chatId, text, parseMode = 'HTML') {
  if (!BOT_TOKEN || !chatId) return null
  try {
    const res = await fetch(`${API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode, disable_web_page_preview: true }),
    })
    const data = await res.json()
    return data.ok ? data.result.message_id : null
  } catch (err) {
    console.error('Telegram-Fehler:', err.message)
    return null
  }
}

export async function deleteTelegramMessage(chatId, messageId) {
  if (!BOT_TOKEN || !chatId || !messageId) return
  try {
    await fetch(`${API}/deleteMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
    })
  } catch {}
}

export function formatEventMessage(event, type = 'new') {
  const date = event.start_time ? new Date(event.start_time).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }) : ''
  const time = event.start_time ? new Date(event.start_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : ''
  const tags = event.tags ? event.tags.split(',').map(t => `#${t.trim()}`).join(' ') : ''

  if (type === 'new') {
    return `📅 <b>Neue Veranstaltung</b>\n\n<b>${event.title}</b>\n📆 ${date}\n🕐 ${time} Uhr\n${tags ? `\n${tags}\n` : ''}${event.description ? `\n${event.description.slice(0, 200)}${event.description.length > 200 ? '...' : ''}` : ''}\n\n👉 ${BASE_URL}/app`
  }
  if (type === 'update') {
    return `✏️ <b>Veranstaltung aktualisiert</b>\n\n<b>${event.title}</b>\n📆 ${date}\n🕐 ${time} Uhr\n${tags ? `\n${tags}\n` : ''}\n👉 ${BASE_URL}/app`
  }
  if (type === 'cancel') {
    return `❌ <b>Veranstaltung abgesagt</b>\n\n<b>${event.title}</b> am ${date} wurde leider abgesagt.`
  }
  if (type === 'reminder') {
    return `🔔 <b>Erinnerung</b>\n\n<b>${event.title}</b>\n📆 ${date}\n🕐 ${time} Uhr\n${tags ? `${tags}\n` : ''}\n👉 ${BASE_URL}/app`
  }
  return ''
}

export function formatUpcomingEvents(events, lichtungName) {
  if (events.length === 0) return `📋 <b>${lichtungName}</b>\n\nKeine kommenden Veranstaltungen.`

  let msg = `📋 <b>Kommende Veranstaltungen — ${lichtungName}</b>\n`
  for (const e of events) {
    const date = new Date(e.start_time).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })
    const time = new Date(e.start_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    msg += `\n📅 <b>${e.title}</b> — ${date}, ${time} Uhr`
  }
  msg += `\n\n👉 ${BASE_URL}/app`
  return msg
}

export async function setBotCommands() {
  if (!BOT_TOKEN) return
  await fetch(`${API}/setMyCommands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      commands: [
        { command: 'start', description: 'Mit Lichtung verbinden' },
        { command: 'status', description: 'Verbindungsstatus' },
        { command: 'connect', description: 'Gruppe mit Lichtung verbinden' },
        { command: 'events', description: 'Kommende Veranstaltungen' },
        { command: 'remind', description: 'Erinnerungs-Intervall setzen' },
      ]
    })
  }).catch(() => {})
}

setBotCommands()
