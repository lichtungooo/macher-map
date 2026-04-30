/**
 * Recurrence — Wiederholungs-Regeln fuer Kalender-Events.
 *
 * Vereinfachtes RRULE-Modell (orientiert sich an RFC 5545, ohne externe lib).
 * Reicht fuer 90% der Use-Cases (Geburtstage, Wochentreffen, Monatsende-Edge).
 *
 * Spaeter: rrule.js Lib einbinden falls Edge-Cases haerter werden.
 */

export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
export type Weekday = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU"

export interface RecurrenceRule {
  /** Wie oft wiederholt sich der Termin? */
  freq: RecurrenceFrequency
  /** Alle X Einheiten (1 = jeden, 2 = jeden zweiten). Default 1. */
  interval?: number
  /** Bei WEEKLY: an welchen Wochentagen. */
  byweekday?: Weekday[]
  /** Endbedingung: bis Datum (ISO YYYY-MM-DD). */
  until?: string
  /** Endbedingung: nach X Wiederholungen. */
  count?: number
}

const WEEKDAY_CODES: Weekday[] = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"]

export function weekdayCode(d: Date): Weekday {
  return WEEKDAY_CODES[d.getDay()]
}

/** Pruefe ob ein Date ein bestimmter Wochentag ist. */
export function isWeekday(d: Date, codes: Weekday[]): boolean {
  return codes.includes(weekdayCode(d))
}

// ============================================================
// Expansion: aus Recurrence-Rule alle Instanzen im Range erzeugen
// ============================================================

export interface ExpandedInstance {
  /** Startzeit dieser konkreten Instanz */
  start: Date
  /** Endzeit (oder null wenn kein Ende gesetzt) */
  end: Date | null
  /** Index der Instanz (0 = Original) */
  index: number
}

const SAFETY_LIMIT = 500

/**
 * Erzeugt alle Instanzen einer Recurrence-Rule im gegebenen Date-Range.
 * Bei Single-Events (rule = null/undefined) wird das Original zurueckgegeben
 * falls es im Range liegt.
 */
export function expandRecurrence(
  originalStart: Date,
  originalEnd: Date | null,
  rule: RecurrenceRule | undefined,
  rangeStart: Date,
  rangeEnd: Date
): ExpandedInstance[] {
  // Single Event
  if (!rule) {
    if (originalStart >= rangeStart && originalStart <= rangeEnd) {
      return [{ start: originalStart, end: originalEnd, index: 0 }]
    }
    return []
  }

  const interval = rule.interval ?? 1
  const duration = originalEnd ? originalEnd.getTime() - originalStart.getTime() : 0
  const until = rule.until ? new Date(rule.until + "T23:59:59") : null
  const out: ExpandedInstance[] = []

  let current = new Date(originalStart)
  let index = 0

  while (index < SAFETY_LIMIT) {
    // Endbedingungen pruefen
    if (rule.count != null && index >= rule.count) break
    if (until && current > until) break
    if (current > rangeEnd) break

    // Innerhalb des sichtbaren Range UND (bei WEEKLY: passender Wochentag)?
    if (current >= rangeStart) {
      const matchesWeekday = rule.freq !== "WEEKLY" || !rule.byweekday || rule.byweekday.length === 0
        ? true
        : isWeekday(current, rule.byweekday)
      if (matchesWeekday) {
        out.push({
          start: new Date(current),
          end: duration > 0 ? new Date(current.getTime() + duration) : null,
          index,
        })
      }
    }

    // Nächstes Vorkommen
    current = nextOccurrence(current, rule.freq, interval, originalStart)
    index++
  }

  return out
}

/**
 * Naechste Instanz nach `current`. Beruecksichtigt Edge-Cases:
 * - MONTHLY mit 31. Tag: wenn naechster Monat den 31. nicht hat → letzter Tag
 * - YEARLY mit 29.02.: nicht-Schaltjahre → 28.02.
 */
function nextOccurrence(
  current: Date,
  freq: RecurrenceFrequency,
  interval: number,
  original: Date
): Date {
  const next = new Date(current)
  switch (freq) {
    case "DAILY":
      next.setDate(next.getDate() + interval)
      return next
    case "WEEKLY":
      next.setDate(next.getDate() + 7 * interval)
      return next
    case "MONTHLY": {
      // Original-Tag merken (z.B. 31), dann auf naechsten Monat addieren
      // und auf letzten Tag des Monats clampen
      const targetDay = original.getDate()
      next.setDate(1) // Auf 1. des aktuellen Monats setzen damit kein Auto-Rollover
      next.setMonth(next.getMonth() + interval)
      const lastOfMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
      next.setDate(Math.min(targetDay, lastOfMonth))
      next.setHours(original.getHours(), original.getMinutes(), original.getSeconds(), 0)
      return next
    }
    case "YEARLY": {
      // Bei 29.02. in nicht-Schaltjahren auf 28.02. clampen
      const targetMonth = original.getMonth()
      const targetDay = original.getDate()
      next.setDate(1)
      next.setFullYear(next.getFullYear() + interval, targetMonth, 1)
      const lastOfMonth = new Date(next.getFullYear(), targetMonth + 1, 0).getDate()
      next.setDate(Math.min(targetDay, lastOfMonth))
      next.setHours(original.getHours(), original.getMinutes(), original.getSeconds(), 0)
      return next
    }
  }
}

// ============================================================
// Human-readable summary fuer UI
// ============================================================

const FREQ_LABEL: Record<RecurrenceFrequency, string> = {
  DAILY: "taeglich",
  WEEKLY: "woechentlich",
  MONTHLY: "monatlich",
  YEARLY: "jaehrlich",
}

const WEEKDAY_LABEL: Record<Weekday, string> = {
  MO: "Mo", TU: "Di", WE: "Mi", TH: "Do", FR: "Fr", SA: "Sa", SU: "So",
}

export function summarizeRecurrence(rule: RecurrenceRule | undefined): string {
  if (!rule) return "Einmalig"
  const interval = rule.interval ?? 1
  const base =
    interval === 1
      ? FREQ_LABEL[rule.freq]
      : rule.freq === "DAILY"
      ? `alle ${interval} Tage`
      : rule.freq === "WEEKLY"
      ? `alle ${interval} Wochen`
      : rule.freq === "MONTHLY"
      ? `alle ${interval} Monate`
      : `alle ${interval} Jahre`

  const days =
    rule.freq === "WEEKLY" && rule.byweekday && rule.byweekday.length > 0
      ? ` (${rule.byweekday.map((d) => WEEKDAY_LABEL[d]).join(", ")})`
      : ""

  const ende = rule.until
    ? `, bis ${new Date(rule.until).toLocaleDateString("de-DE")}`
    : rule.count
    ? `, ${rule.count}-mal`
    : ""

  return base + days + ende
}
