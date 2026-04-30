import { Label, Input } from "@real-life-stack/toolkit"
import type { CalendarModuleConfig, CalendarMode, CalendarView, FirstDayOfWeek, TimeFormat } from "./CalendarView"
import { CalendarManagerPanel } from "./CalendarManagerPanel"

/**
 * CalendarSettingsPanel — Editor fuer Kalender-Konfig (Phase 1).
 *
 * Modus:
 *   event-calendar  → Events, eine Liste, Anbieten/Buchen-Aktion
 *   group-calendar  → Termine + Erinnerungen, Member-Sichtbarkeit
 *   mixed           → Beide Modi parallel (Tab-Auswahl in der View)
 */

export interface CalendarSettingsPanelProps {
  config: CalendarModuleConfig
  onChange: (next: CalendarModuleConfig) => void
}

const MODES: Array<{ value: CalendarMode; label: string; description: string }> = [
  { value: "event-calendar", label: "Event-Kalender", description: "Oeffentliche Events mit Bildern, Anbieten/Buchen" },
  { value: "group-calendar", label: "Gruppenkalender", description: "Private Termine fuer Member, Erinnerungen" },
  { value: "mixed", label: "Mixed", description: "Beide Modi parallel" },
]

const VIEWS: Array<{ value: CalendarView; label: string }> = [
  { value: "day", label: "Tag (Stunden-Raster)" },
  { value: "week", label: "Woche" },
  { value: "month", label: "Monat" },
  { value: "year", label: "Jahr (12 Mini-Monate)" },
  { value: "agenda", label: "Agenda (Liste)" },
  { value: "events", label: "Event-Liste (mit Bildern)" },
]

const FIRST_DAY: Array<{ value: FirstDayOfWeek; label: string }> = [
  { value: "monday", label: "Montag" },
  { value: "sunday", label: "Sonntag" },
]

const TIME_FORMAT: Array<{ value: TimeFormat; label: string }> = [
  { value: "24h", label: "24-Stunden (14:30)" },
  { value: "12h", label: "12-Stunden (2:30 PM)" },
]

const ITEM_TYPE_OPTIONS = [
  { id: "event", label: "Events", color: "#3b82f6" },
  { id: "appointment", label: "Termine", color: "#10b981" },
  { id: "quest", label: "Quests", color: "#a855f7" },
]

export function CalendarSettingsPanel({ config, onChange }: CalendarSettingsPanelProps) {
  const set = <K extends keyof CalendarModuleConfig>(key: K, value: CalendarModuleConfig[K]) => {
    onChange({ ...config, [key]: value })
  }

  const toggleItemType = (id: string) => {
    const current = new Set(config.itemTypes ?? [])
    if (current.has(id)) current.delete(id)
    else current.add(id)
    onChange({ ...config, itemTypes: Array.from(current) })
  }

  const setColor = (typeId: string, color: string) => {
    onChange({
      ...config,
      colors: { ...(config.colors ?? {}), [typeId]: color },
    })
  }

  return (
    <div className="space-y-6">
      {/* Modus */}
      <section>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Modus
        </h4>
        <div className="space-y-1">
          {MODES.map((m) => (
            <label
              key={m.value}
              className="flex items-start gap-2 p-2 border rounded-md cursor-pointer hover:bg-muted/50"
            >
              <input
                type="radio"
                name="cal-mode"
                checked={config.mode === m.value}
                onChange={() => set("mode", m.value)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{m.label}</div>
                <div className="text-[11px] text-muted-foreground">{m.description}</div>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Standard-Ansicht */}
      <section>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Standard-Ansicht
        </h4>
        <select
          value={config.defaultView}
          onChange={(e) => set("defaultView", e.target.value as CalendarView)}
          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
        >
          {VIEWS.map((v) => (
            <option key={v.value} value={v.value}>{v.label}</option>
          ))}
        </select>
      </section>

      {/* Sichtbare Item-Typen */}
      <section>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Was wird angezeigt
        </h4>
        <div className="space-y-2">
          {ITEM_TYPE_OPTIONS.map((opt) => {
            const enabled = (config.itemTypes ?? []).includes(opt.id)
            const currentColor = config.colors?.[opt.id] ?? opt.color
            return (
              <div key={opt.id} className="flex items-center gap-2 p-2 border rounded-md bg-card">
                <input
                  type="checkbox"
                  id={`cal-${opt.id}`}
                  checked={enabled}
                  onChange={() => toggleItemType(opt.id)}
                />
                <Label htmlFor={`cal-${opt.id}`} className="flex-1 cursor-pointer text-sm">
                  {opt.label}
                </Label>
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setColor(opt.id, e.target.value)}
                  className="h-7 w-9 rounded border cursor-pointer"
                  title="Farbe"
                />
              </div>
            )
          })}
        </div>
      </section>

      {/* Wochentag + Zeitformat */}
      <section className="space-y-3">
        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
          Anzeige
        </h4>
        <div>
          <Label className="text-xs">Erster Wochentag</Label>
          <select
            value={config.firstDayOfWeek}
            onChange={(e) => set("firstDayOfWeek", e.target.value as FirstDayOfWeek)}
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            {FIRST_DAY.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs">Zeitformat</Label>
          <select
            value={config.timeFormat}
            onChange={(e) => set("timeFormat", e.target.value as TimeFormat)}
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            {TIME_FORMAT.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs">Standard-Termin-Dauer (Minuten)</Label>
          <Input
            type="number"
            value={config.defaultDurationMinutes ?? 60}
            onChange={(e) => set("defaultDurationMinutes", parseInt(e.target.value, 10) || 60)}
            min={5}
            max={1440}
            step={15}
            className="h-9"
          />
        </div>
      </section>

      {/* Aktion-Button */}
      <section>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Aktion-Button
        </h4>
        <label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer mb-2">
          <input
            type="checkbox"
            checked={config.showCreateButton ?? true}
            onChange={(e) => set("showCreateButton", e.target.checked)}
          />
          <span className="text-sm">"Neuer Termin / Event" Button anzeigen</span>
        </label>
      </section>

      {/* Erinnerungen */}
      <section>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Erinnerungen
        </h4>
        <label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer mb-2">
          <input
            type="checkbox"
            checked={config.notificationsEnabled ?? true}
            onChange={(e) => set("notificationsEnabled", e.target.checked)}
          />
          <span className="text-sm">Browser-Notifications aktivieren</span>
        </label>
        <div className="mt-2">
          <Label className="text-xs">Standard-Reminder fuer neue Events (Min vorher)</Label>
          <Input
            type="number"
            value={config.defaultReminderMinutes ?? 15}
            onChange={(e) => set("defaultReminderMinutes", parseInt(e.target.value, 10) || 0)}
            min={0}
            max={43200}
            className="h-9"
          />
          <p className="text-[11px] text-muted-foreground/70 mt-1">
            Wird automatisch hinzugefuegt wenn ein Event keine eigenen Erinnerungen hat. 0 = bei Start, 1440 = 1 Tag.
          </p>
        </div>
      </section>

      {/* Multi-Kalender-Manager */}
      <section>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Kalender (Privat / Arbeit / Locations)
        </h4>
        <CalendarManagerPanel />
      </section>
    </div>
  )
}
