const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const API = `https://api.telegram.org/bot${BOT_TOKEN}`

export async function sendTelegramMessage(chatId, text, parseMode = 'HTML') {
  if (!BOT_TOKEN || !chatId) return
  try {
    await fetch(`${API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode, disable_web_page_preview: true }),
    })
  } catch (err) {
    console.error('Telegram-Fehler:', err.message)
  }
}

export async function setBotCommands() {
  if (!BOT_TOKEN) return
  await fetch(`${API}/setMyCommands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      commands: [
        { command: 'start', description: 'Mit Lichtung verbinden' },
        { command: 'status', description: 'Verbindungsstatus pruefen' },
      ]
    })
  }).catch(() => {})
}

// Beim Start: Bot-Befehle setzen
setBotCommands()
