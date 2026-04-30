import { Plus, Trash2, BellRing } from "lucide-react"
import { Button, Input, Label } from "@real-life-stack/toolkit"
import type { Reminder } from "./reminders"
import { formatReminderOffset } from "./reminders"

/**
 * ReminderEditor — Mehrere Erinnerungen pro Event.
 *
 * Quick-Actions: 5 Min, 15 Min, 1h, 1 Tag vorher.
 * Custom-Eingabe in Minuten.
 */

const PRESETS: Array<{ label: string; minutes: number }> = [
  { label: "5 Min", minutes: 5 },
  { label: "15 Min", minutes: 15 },
  { label: "30 Min", minutes: 30 },
  { label: "1 Std", minutes: 60 },
  { label: "1 Tag", minutes: 1440 },
  { label: "1 Woche", minutes: 10080 },
]

export interface ReminderEditorProps {
  value: Reminder[]
  onChange: (next: Reminder[]) => void
}

export function ReminderEditor({ value, onChange }: ReminderEditorProps) {
  const reminders = value ?? []

  const add = (offsetMinutes: number) => {
    if (reminders.some((r) => r.offsetMinutes === offsetMinutes)) return
    onChange([...reminders, { offsetMinutes, type: "notification" }])
  }

  const remove = (index: number) => {
    onChange(reminders.filter((_, i) => i !== index))
  }

  const updateOffset = (index: number, minutes: number) => {
    const next = [...reminders]
    next[index] = { ...next[index], offsetMinutes: Math.max(0, minutes) }
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {/* Liste der Erinnerungen */}
      {reminders.length > 0 && (
        <div className="space-y-1">
          {reminders.map((r, i) => (
            <div key={i} className="flex items-center gap-2 p-2 border rounded-md bg-card">
              <BellRing className="h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="number"
                value={r.offsetMinutes}
                onChange={(e) => updateOffset(i, parseInt(e.target.value, 10) || 0)}
                min={0}
                max={43200}
                className="h-7 w-24 text-xs"
              />
              <span className="text-xs text-muted-foreground flex-1">
                Min vorher · {formatReminderOffset(r.offsetMinutes)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive"
                onClick={() => remove(i)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Quick-Add */}
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((p) => {
          const exists = reminders.some((r) => r.offsetMinutes === p.minutes)
          return (
            <Button
              key={p.minutes}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => add(p.minutes)}
              disabled={exists}
              className="h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              {p.label}
            </Button>
          )
        })}
      </div>

      {reminders.length === 0 && (
        <p className="text-[11px] text-muted-foreground/70">
          Klick auf einen Vorschlag, um eine Erinnerung hinzuzufuegen.
        </p>
      )}
    </div>
  )
}
