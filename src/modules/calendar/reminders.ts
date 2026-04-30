/**
 * Reminders — Termin-Erinnerungen via Browser-Notification API.
 *
 * Pro Event eine Liste von Remindern (offset in Minuten + Typ).
 * Browser-Notifications werden alle 60s geprueft (Polling) und
 * getriggert wenn nicht schon angezeigt.
 *
 * Persistenz: gezeigte Reminders speichern wir in localStorage
 * (`shown-reminders`) damit sie nicht wiederholt feuern.
 */

export type ReminderType = "notification" | "popup"

export interface Reminder {
  /** Minuten vor Event-Start. 0 = bei Event-Start, 15 = 15 Min vorher. */
  offsetMinutes: number
  type: ReminderType
  /** Optional Custom-Text (z.B. fuer wiederholte Reminder). */
  message?: string
}

const SHOWN_KEY = "macher-shown-reminders"
const SNOOZE_KEY = "macher-snoozed-reminders"

interface ShownEntry {
  /** "<itemId>#<instanceIndex>#<offsetMinutes>" */
  key: string
  /** ISO-Date wann es gezeigt wurde */
  shownAt: string
}

interface SnoozeEntry {
  key: string
  /** ISO-Date wann der Snooze ablaeuft */
  until: string
}

// ============================================================
// Storage-Helpers
// ============================================================

function loadShown(): ShownEntry[] {
  try {
    const raw = localStorage.getItem(SHOWN_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveShown(list: ShownEntry[]) {
  // Nur die letzten 200 behalten (sonst wird's gross)
  const recent = list.slice(-200)
  try {
    localStorage.setItem(SHOWN_KEY, JSON.stringify(recent))
  } catch {}
}

function loadSnoozes(): SnoozeEntry[] {
  try {
    const raw = localStorage.getItem(SNOOZE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSnoozes(list: SnoozeEntry[]) {
  // Abgelaufene Snoozes raus
  const now = new Date().toISOString()
  const active = list.filter((s) => s.until > now)
  try {
    localStorage.setItem(SNOOZE_KEY, JSON.stringify(active))
  } catch {}
}

// ============================================================
// Public API
// ============================================================

/** Gibt die Notification-Permission an. Bittet bei "default" um Erlaubnis. */
export async function ensureNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied"
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission
  }
  return await Notification.requestPermission()
}

/** Markiert einen Reminder als gezeigt. */
export function markReminderShown(key: string) {
  const list = loadShown()
  list.push({ key, shownAt: new Date().toISOString() })
  saveShown(list)
}

/** Wurde der Reminder schon gezeigt? */
export function wasReminderShown(key: string): boolean {
  return loadShown().some((e) => e.key === key)
}

/** Snooze-Status: wenn aktiv, returnt das End-Datum. */
export function getSnoozeUntil(key: string): Date | null {
  const list = loadSnoozes()
  const entry = list.find((s) => s.key === key)
  if (!entry) return null
  const until = new Date(entry.until)
  return until > new Date() ? until : null
}

/** Snooze einen Reminder um X Minuten. */
export function snoozeReminder(key: string, minutes: number) {
  const list = loadSnoozes().filter((s) => s.key !== key)
  list.push({ key, until: new Date(Date.now() + minutes * 60 * 1000).toISOString() })
  saveSnoozes(list)
}

/** Browser-Notification anzeigen. */
export function showNotification(
  title: string,
  body: string,
  onClick?: () => void
): Notification | null {
  if (!("Notification" in window) || Notification.permission !== "granted") return null
  try {
    const n = new Notification(title, {
      body,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      requireInteraction: false,
    })
    if (onClick) n.onclick = () => { onClick(); n.close() }
    return n
  } catch {
    return null
  }
}

/**
 * Berechnet welche Reminders im naechsten Tick faellig sind.
 * Aufrufer (useReminderScheduler-Hook) iteriert dann.
 */
export interface DueReminder {
  key: string
  itemId: string
  itemTitle: string
  eventStart: Date
  reminder: Reminder
}

export function findDueReminders(
  events: Array<{
    id: string
    title: string
    eventStart: Date
    reminders: Reminder[]
    instanceIndex: number
  }>,
  now: Date = new Date()
): DueReminder[] {
  const due: DueReminder[] = []
  const lookAheadMs = 60 * 1000 // 1 Minute Toleranz nach hinten/vorne

  for (const ev of events) {
    for (const r of ev.reminders) {
      const triggerTime = new Date(ev.eventStart.getTime() - r.offsetMinutes * 60 * 1000)
      const diff = triggerTime.getTime() - now.getTime()
      // Faellig wenn triggerTime <= now UND nicht laenger als 5 Minuten vorbei
      if (diff <= 0 && diff > -5 * 60 * 1000) {
        const key = `${ev.id}#${ev.instanceIndex}#${r.offsetMinutes}`
        // Skip wenn schon gezeigt oder in Snooze
        if (wasReminderShown(key)) continue
        if (getSnoozeUntil(key)) continue
        due.push({
          key,
          itemId: ev.id,
          itemTitle: ev.title,
          eventStart: ev.eventStart,
          reminder: r,
        })
      }
      // lookAheadMs unused (eslint)
      void lookAheadMs
    }
  }

  return due
}

// ============================================================
// Default-Reminder Helpers
// ============================================================

/** Aus Sekunden-Offset → menschenlesbar. */
export function formatReminderOffset(minutes: number): string {
  if (minutes === 0) return "Bei Start"
  if (minutes < 60) return `${minutes} Min vorher`
  if (minutes < 1440) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h} Std ${m} Min vorher` : `${h} Std vorher`
  }
  const d = Math.floor(minutes / 1440)
  return `${d} Tag${d > 1 ? "e" : ""} vorher`
}
