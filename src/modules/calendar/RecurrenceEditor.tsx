import { Input, Label } from "@real-life-stack/toolkit"
import type { RecurrenceRule, RecurrenceFrequency, Weekday } from "./recurrence"

/**
 * RecurrenceEditor — UI fuer Wiederholungs-Regeln.
 *
 * 4 Sektionen:
 *   1. Frequency-Auswahl (Keine / Taeglich / Woechentlich / Monatlich / Jaehrlich)
 *   2. Interval ("alle X")
 *   3. Bei WEEKLY: Wochentage-Checkboxen
 *   4. Endbedingung (Nie / Bis Datum / Nach X)
 */

export interface RecurrenceEditorProps {
  value: RecurrenceRule | undefined
  onChange: (next: RecurrenceRule | undefined) => void
}

const FREQ_OPTIONS: Array<{ value: RecurrenceFrequency | "NONE"; label: string }> = [
  { value: "NONE", label: "Einmalig (keine Wiederholung)" },
  { value: "DAILY", label: "Taeglich" },
  { value: "WEEKLY", label: "Woechentlich" },
  { value: "MONTHLY", label: "Monatlich" },
  { value: "YEARLY", label: "Jaehrlich" },
]

const WEEKDAYS: Array<{ value: Weekday; label: string }> = [
  { value: "MO", label: "Mo" },
  { value: "TU", label: "Di" },
  { value: "WE", label: "Mi" },
  { value: "TH", label: "Do" },
  { value: "FR", label: "Fr" },
  { value: "SA", label: "Sa" },
  { value: "SU", label: "So" },
]

export function RecurrenceEditor({ value, onChange }: RecurrenceEditorProps) {
  const rule = value
  const interval = rule?.interval ?? 1
  const byweekday = rule?.byweekday ?? []
  const endMode: "never" | "until" | "count" = rule?.until ? "until" : rule?.count ? "count" : "never"

  const setFreq = (freq: RecurrenceFrequency | "NONE") => {
    if (freq === "NONE") {
      onChange(undefined)
      return
    }
    onChange({ ...(rule ?? { freq: "DAILY" }), freq })
  }

  const setInterval = (v: number) => {
    if (!rule) return
    onChange({ ...rule, interval: Math.max(1, v) })
  }

  const toggleWeekday = (d: Weekday) => {
    if (!rule) return
    const set = new Set(byweekday)
    if (set.has(d)) set.delete(d)
    else set.add(d)
    onChange({ ...rule, byweekday: Array.from(set) })
  }

  const setEndMode = (mode: "never" | "until" | "count") => {
    if (!rule) return
    if (mode === "never") onChange({ ...rule, until: undefined, count: undefined })
    if (mode === "until") onChange({ ...rule, count: undefined, until: rule.until ?? "" })
    if (mode === "count") onChange({ ...rule, until: undefined, count: rule.count ?? 5 })
  }

  return (
    <div className="space-y-3 border rounded-md p-3 bg-muted/20">
      {/* Frequency */}
      <div>
        <Label className="text-xs">Wiederholung</Label>
        <select
          value={rule?.freq ?? "NONE"}
          onChange={(e) => setFreq(e.target.value as RecurrenceFrequency | "NONE")}
          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
        >
          {FREQ_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {rule && (
        <>
          {/* Interval */}
          <div>
            <Label className="text-xs">
              Alle{" "}
              <Input
                type="number"
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value, 10) || 1)}
                min={1}
                max={365}
                className="h-7 w-16 inline-block mx-1"
              />{" "}
              {rule.freq === "DAILY"
                ? "Tag(e)"
                : rule.freq === "WEEKLY"
                ? "Woche(n)"
                : rule.freq === "MONTHLY"
                ? "Monat(e)"
                : "Jahr(e)"}
            </Label>
          </div>

          {/* Wochentage (nur bei WEEKLY) */}
          {rule.freq === "WEEKLY" && (
            <div>
              <Label className="text-xs">An Wochentagen</Label>
              <div className="flex gap-1 flex-wrap mt-1">
                {WEEKDAYS.map((d) => {
                  const active = byweekday.includes(d.value)
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleWeekday(d.value)}
                      className={`h-7 w-9 rounded text-xs font-medium transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                      }`}
                    >
                      {d.label}
                    </button>
                  )
                })}
              </div>
              {byweekday.length === 0 && (
                <p className="text-[11px] text-muted-foreground/70 mt-1">
                  Keine Wochentage gewaehlt → Wiederholung am Wochentag des Original-Termins.
                </p>
              )}
            </div>
          )}

          {/* End-Bedingung */}
          <div>
            <Label className="text-xs">Endet</Label>
            <div className="space-y-1 mt-1">
              <label className="flex items-center gap-2 p-1 cursor-pointer">
                <input
                  type="radio"
                  checked={endMode === "never"}
                  onChange={() => setEndMode("never")}
                />
                <span className="text-sm">Nie</span>
              </label>
              <label className="flex items-center gap-2 p-1 cursor-pointer">
                <input
                  type="radio"
                  checked={endMode === "until"}
                  onChange={() => setEndMode("until")}
                />
                <span className="text-sm">Bis</span>
                {endMode === "until" && (
                  <Input
                    type="date"
                    value={rule.until ?? ""}
                    onChange={(e) => onChange({ ...rule, until: e.target.value || undefined })}
                    className="h-7 w-40"
                  />
                )}
              </label>
              <label className="flex items-center gap-2 p-1 cursor-pointer">
                <input
                  type="radio"
                  checked={endMode === "count"}
                  onChange={() => setEndMode("count")}
                />
                <span className="text-sm">Nach</span>
                {endMode === "count" && (
                  <>
                    <Input
                      type="number"
                      value={rule.count ?? 5}
                      onChange={(e) =>
                        onChange({ ...rule, count: Math.max(1, parseInt(e.target.value, 10) || 1) })
                      }
                      min={1}
                      max={500}
                      className="h-7 w-16"
                    />
                    <span className="text-sm">Wiederholungen</span>
                  </>
                )}
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
