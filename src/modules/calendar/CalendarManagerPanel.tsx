import { useState } from "react"
import { Plus, Trash2, Eye, EyeOff, Star, MapPin } from "lucide-react"
import { Button, Input, Label } from "@real-life-stack/toolkit"
import { useCalendars, type CalendarType } from "./useCalendars"

/**
 * CalendarManagerPanel — Verwaltung mehrerer Kalender im Settings.
 *
 * Listet alle Calendars: User-Kalender (eigene) + Location-Kalender +
 * geteilte. Pro Calendar: Name + Farbe editieren, Sichtbarkeit toggeln,
 * Default setzen, loeschen.
 *
 * Location-Kalender koennen hier nur sichtbar/unsichtbar geschaltet werden —
 * der Calendar selbst wird mit der Location verwaltet.
 */

export function CalendarManagerPanel() {
  const {
    myCalendars,
    locationCalendars,
    sharedCalendars,
    createCalendar,
    updateCalendar,
    removeCalendar,
    toggleVisibility,
  } = useCalendars()

  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState("#3b82f6")

  const handleCreate = async () => {
    if (!newName.trim()) return
    await createCalendar({ name: newName.trim(), color: newColor, type: "user" as CalendarType })
    setNewName("")
    setNewColor("#3b82f6")
    setCreating(false)
  }

  const setDefault = async (id: string) => {
    // Alle anderen auf isDefault: false, dieser auf true
    for (const c of myCalendars) {
      if (c.data.isDefault && c.id !== id) {
        await updateCalendar(c.id, { isDefault: false })
      }
    }
    await updateCalendar(id, { isDefault: true })
  }

  return (
    <div className="space-y-4">
      {/* Eigene Kalender */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground">
            Meine Kalender
          </h4>
          {!creating && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setCreating(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Neu
            </Button>
          )}
        </div>

        {creating && (
          <div className="border rounded-md p-2 mb-2 space-y-2 bg-card">
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Kalender-Name (z.B. Privat)"
                className="h-8 text-sm flex-1"
                autoFocus
              />
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="h-8 w-9 rounded border cursor-pointer"
              />
            </div>
            <div className="flex gap-1 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setCreating(false)}
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-7 text-xs"
                onClick={handleCreate}
                disabled={!newName.trim()}
              >
                Anlegen
              </Button>
            </div>
          </div>
        )}

        {myCalendars.length === 0 && !creating && (
          <p className="text-[11px] text-muted-foreground/70 italic">
            Noch keine Kalender. Klick "Neu" um einen anzulegen.
          </p>
        )}

        <div className="space-y-1">
          {myCalendars.map((c) => (
            <CalendarRow
              key={c.id}
              name={c.data.name}
              color={c.data.color}
              isVisible={c.data.isVisible}
              isDefault={c.data.isDefault}
              onColorChange={(color) => updateCalendar(c.id, { color })}
              onNameChange={(name) => updateCalendar(c.id, { name })}
              onToggleVisibility={() => toggleVisibility(c.id)}
              onSetDefault={() => setDefault(c.id)}
              onRemove={() => removeCalendar(c.id)}
            />
          ))}
        </div>
      </section>

      {/* Location-Kalender */}
      {locationCalendars.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
            Location-Kalender
          </h4>
          <div className="space-y-1">
            {locationCalendars.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 p-2 border rounded-md bg-card"
              >
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input
                  type="color"
                  value={c.data.color}
                  onChange={(e) => updateCalendar(c.id, { color: e.target.value })}
                  className="h-6 w-7 rounded border cursor-pointer"
                />
                <span className="flex-1 text-sm truncate">{c.data.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleVisibility(c.id)}
                  title={c.data.isVisible ? "Ausblenden" : "Einblenden"}
                >
                  {c.data.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Geteilte Kalender */}
      {sharedCalendars.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
            Geteilt
          </h4>
          <div className="space-y-1">
            {sharedCalendars.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 p-2 border rounded-md bg-card"
              >
                <input
                  type="color"
                  value={c.data.color}
                  className="h-6 w-7 rounded border"
                  disabled
                />
                <span className="flex-1 text-sm truncate">{c.data.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleVisibility(c.id)}
                  title={c.data.isVisible ? "Ausblenden" : "Einblenden"}
                >
                  {c.data.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ============================================================
// CalendarRow — eine Zeile in der Kalender-Liste
// ============================================================

function CalendarRow({
  name,
  color,
  isVisible,
  isDefault,
  onColorChange,
  onNameChange,
  onToggleVisibility,
  onSetDefault,
  onRemove,
}: {
  name: string
  color: string
  isVisible: boolean
  isDefault?: boolean
  onColorChange: (color: string) => void
  onNameChange: (name: string) => void
  onToggleVisibility: () => void
  onSetDefault: () => void
  onRemove: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(name)

  const saveName = () => {
    if (draftName.trim() && draftName !== name) onNameChange(draftName.trim())
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-2 p-2 border rounded-md bg-card">
      <input
        type="color"
        value={color}
        onChange={(e) => onColorChange(e.target.value)}
        className="h-6 w-7 rounded border cursor-pointer"
      />
      {editing ? (
        <Input
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onBlur={saveName}
          onKeyDown={(e) => e.key === "Enter" && saveName()}
          className="h-7 text-sm flex-1"
          autoFocus
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraftName(name)
            setEditing(true)
          }}
          className="flex-1 text-left text-sm truncate hover:underline"
        >
          {name}
        </button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`h-6 w-6 ${isDefault ? "text-amber-500" : ""}`}
        onClick={onSetDefault}
        title={isDefault ? "Standard-Kalender" : "Als Standard setzen"}
      >
        <Star className={`h-3 w-3 ${isDefault ? "fill-current" : ""}`} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onToggleVisibility}
        title={isVisible ? "Ausblenden" : "Einblenden"}
      >
        {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-destructive"
        onClick={onRemove}
        title="Loeschen"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  )
}
