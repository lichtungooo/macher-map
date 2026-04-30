import { useEffect, useRef } from "react"
import {
  findDueReminders,
  markReminderShown,
  showNotification,
  ensureNotificationPermission,
  type Reminder,
} from "./reminders"
import type { Item } from "@real-life-stack/data-interface"
import type { RecurrenceRule } from "./recurrence"
import { expandRecurrence } from "./recurrence"

/**
 * useReminderScheduler — pollt alle 30s, triggert Browser-Notifications
 * fuer Events deren Reminder-Zeit erreicht ist.
 *
 * Bei aktivem WoT: Reminders kommen aus item.data.reminders (Array<Reminder>).
 * Bei nicht-gesetztem Reminder: Default aus Modul-Config (defaultReminder).
 *
 * Wiederholte Events: jede Recurrence-Instanz hat eigene Reminder-Keys
 * (item-id#instance-index#offset).
 */

const CHECK_INTERVAL_MS = 30 * 1000

interface SchedulerOptions {
  events: Item[]
  defaultReminderMinutes?: number
  /** Wenn der User auf eine Notification klickt: Item oeffnen. */
  onItemOpen?: (item: Item) => void
}

export function useReminderScheduler({
  events,
  defaultReminderMinutes,
  onItemOpen,
}: SchedulerOptions) {
  const eventsRef = useRef(events)
  const onItemOpenRef = useRef(onItemOpen)
  eventsRef.current = events
  onItemOpenRef.current = onItemOpen

  // Permission beim ersten Mount erfragen
  useEffect(() => {
    ensureNotificationPermission().catch(() => {})
  }, [])

  // Periodisch checken
  useEffect(() => {
    const check = () => {
      const now = new Date()
      // Nur Events der naechsten 8 Tage betrachten — sonst zu viel
      const lookAhead = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000)

      const flat: Array<{
        id: string
        title: string
        eventStart: Date
        reminders: Reminder[]
        instanceIndex: number
      }> = []

      for (const item of eventsRef.current) {
        const baseStart = new Date(String(item.data.start))
        if (isNaN(baseStart.getTime())) continue
        const baseEnd = item.data.end ? new Date(String(item.data.end)) : null
        const rule = item.data.recurrence as RecurrenceRule | undefined
        const itemReminders = (item.data.reminders as Reminder[] | undefined) ?? []

        // Default anwenden falls keine eigenen Reminders + Default gesetzt
        const reminders =
          itemReminders.length > 0
            ? itemReminders
            : defaultReminderMinutes != null && defaultReminderMinutes >= 0
            ? [{ offsetMinutes: defaultReminderMinutes, type: "notification" as const }]
            : []

        if (reminders.length === 0) continue

        // Recurrence expandieren — pro Instanz Reminder pruefen
        const instances = expandRecurrence(baseStart, baseEnd, rule, now, lookAhead)
        for (const inst of instances) {
          flat.push({
            id: item.id,
            title: String(item.data.title ?? "(ohne Titel)"),
            eventStart: inst.start,
            reminders,
            instanceIndex: inst.index,
          })
        }
      }

      const due = findDueReminders(flat, now)
      for (const d of due) {
        const time = d.eventStart.toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
        })
        const date = d.eventStart.toLocaleDateString("de-DE", {
          weekday: "short",
          day: "numeric",
          month: "short",
        })
        showNotification(
          d.itemTitle,
          d.reminder.message ?? `${date} um ${time}`,
          () => {
            const item = eventsRef.current.find((it) => it.id === d.itemId)
            if (item && onItemOpenRef.current) onItemOpenRef.current(item)
            // Fokussiert das Browser-Tab
            window.focus()
          }
        )
        markReminderShown(d.key)
      }
    }

    // Sofort checken + dann interval
    check()
    const interval = setInterval(check, CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [defaultReminderMinutes])
}
