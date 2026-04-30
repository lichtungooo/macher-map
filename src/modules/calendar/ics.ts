/**
 * ICS-Export — generiert iCalendar-Format (RFC 5545) aus Events.
 *
 * Funktioniert mit Standard-Kalender-Apps (Google Calendar, Apple Calendar,
 * Outlook, Thunderbird, etc.). Wird einmal als statische Datei generiert
 * (kein Server-Endpoint da Macher-Map rein statisch ist).
 */

import type { Item } from "@real-life-stack/data-interface"
import type { RecurrenceRule } from "./recurrence"

interface IcsEvent {
  uid: string
  title: string
  description?: string
  start: Date
  end?: Date
  allDay: boolean
  location?: string
  hashtags?: string[]
  url?: string
  recurrence?: RecurrenceRule
}

/**
 * Erzeugt einen ICS-Feed aus Items.
 */
export function generateIcs(events: Item[], feedName = "Macher-Map"): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Macher-Map//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcs(feedName)}`,
  ]

  for (const item of events) {
    const start = item.data.start ? new Date(String(item.data.start)) : null
    if (!start || isNaN(start.getTime())) continue
    const end = item.data.end ? new Date(String(item.data.end)) : null
    const allDay = Boolean(item.data.allDay)
    const loc = item.data.location as { address?: string; lat?: number; lng?: number } | undefined
    const rule = item.data.recurrence as RecurrenceRule | undefined

    const ev: IcsEvent = {
      uid: `${item.id}@macher-map.org`,
      title: String(item.data.title ?? "(ohne Titel)"),
      description: item.data.plainDescription
        ? String(item.data.plainDescription)
        : item.data.markdownBody
        ? String(item.data.markdownBody)
        : undefined,
      start,
      end: end ?? undefined,
      allDay,
      location: loc?.address || (loc?.lat != null && loc?.lng != null ? `${loc.lat},${loc.lng}` : undefined),
      hashtags: (item.data.hashtags as string[] | undefined) ?? undefined,
      url: item.data.ticketUrl ? String(item.data.ticketUrl) : undefined,
      recurrence: rule,
    }

    lines.push(...renderEvent(ev))
  }

  lines.push("END:VCALENDAR")
  return lines.join("\r\n")
}

function renderEvent(ev: IcsEvent): string[] {
  const out: string[] = ["BEGIN:VEVENT", `UID:${ev.uid}`, `DTSTAMP:${formatIcsDateTime(new Date())}`]

  if (ev.allDay) {
    out.push(`DTSTART;VALUE=DATE:${formatIcsDate(ev.start)}`)
    if (ev.end) {
      // Bei all-day ist das Ende EXKLUSIV → +1 Tag
      const endPlus = new Date(ev.end)
      endPlus.setDate(endPlus.getDate() + 1)
      out.push(`DTEND;VALUE=DATE:${formatIcsDate(endPlus)}`)
    }
  } else {
    out.push(`DTSTART:${formatIcsDateTime(ev.start)}`)
    if (ev.end) out.push(`DTEND:${formatIcsDateTime(ev.end)}`)
  }

  out.push(`SUMMARY:${escapeIcs(ev.title)}`)
  if (ev.description) {
    // Hashtags an Description anhaengen
    const desc = ev.hashtags && ev.hashtags.length > 0
      ? `${ev.description}\n\n${ev.hashtags.join(" ")}`
      : ev.description
    out.push(`DESCRIPTION:${escapeIcs(desc)}`)
  }
  if (ev.location) out.push(`LOCATION:${escapeIcs(ev.location)}`)
  if (ev.url) out.push(`URL:${escapeIcs(ev.url)}`)
  if (ev.hashtags && ev.hashtags.length > 0) {
    out.push(`CATEGORIES:${ev.hashtags.map((t) => t.replace(/^#/, "")).join(",")}`)
  }
  if (ev.recurrence) {
    out.push(`RRULE:${renderRrule(ev.recurrence)}`)
  }

  out.push("END:VEVENT")
  return out
}

function renderRrule(rule: RecurrenceRule): string {
  const parts: string[] = [`FREQ=${rule.freq}`]
  if (rule.interval && rule.interval > 1) parts.push(`INTERVAL=${rule.interval}`)
  if (rule.byweekday && rule.byweekday.length > 0) {
    parts.push(`BYDAY=${rule.byweekday.join(",")}`)
  }
  if (rule.count) parts.push(`COUNT=${rule.count}`)
  if (rule.until) {
    const u = new Date(rule.until + "T23:59:59")
    parts.push(`UNTIL=${formatIcsDateTime(u)}`)
  }
  return parts.join(";")
}

function formatIcsDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
}

function formatIcsDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
}

function escapeIcs(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n")
}

/**
 * Loest einen ICS-Download im Browser aus.
 */
export function downloadIcs(content: string, filename = "macher-map-events.ics") {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Erzeugt eine Data-URL die mit webcal:// geoeffnet werden kann (bei manchen
 * Mobile-Apps geht das, bei manchen nicht). Fallback: Download als ICS.
 */
export function buildIcsDataUrl(content: string): string {
  return `data:text/calendar;charset=utf-8;base64,${btoa(unescape(encodeURIComponent(content)))}`
}
