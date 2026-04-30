import { useState, useEffect } from "react"
import { MapPin, X } from "lucide-react"
import { Button, Input, Label, Textarea } from "@real-life-stack/toolkit"

/**
 * QuickCreateForm — Kompakte Form fuer schnelles Anlegen von Items
 * direkt von der Karte aus. Standort wird per Map-Klick gepickt.
 *
 * Wird vom MapView in einem Side-Panel angezeigt sobald der Action-Button
 * geklickt wurde. Felder passen sich am createItemType an:
 *   - "event" / "appointment"  → Datum + Uhrzeit + Beschreibung
 *   - "place" / sonst          → Adresse + Beschreibung (kein Datum)
 */

export interface QuickCreateFormProps {
  /** Welchen Item-Type wir anlegen (aus MapModuleConfig.actionButton.createItemType). */
  itemType: string
  /** Aktuell auf der Karte gepickter Standort (oder null = noch nicht gewaehlt). */
  pickedLocation: { lat: number; lng: number } | null
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}

export function QuickCreateForm({ itemType, pickedLocation, onSubmit, onCancel }: QuickCreateFormProps) {
  const isTimedItem = itemType === "event" || itemType === "appointment"
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [saving, setSaving] = useState(false)

  // Auto-Endzeit (1h nach Start)
  useEffect(() => {
    if (start && !end) {
      const startDate = new Date(start)
      if (!isNaN(startDate.getTime())) {
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
        const pad = (n: number) => String(n).padStart(2, "0")
        setEnd(
          `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}T${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`
        )
      }
    }
  }, [start, end])

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      const data: Record<string, unknown> = {
        title: title.trim(),
        location: pickedLocation
          ? { ...pickedLocation, address: address.trim() || undefined }
          : address.trim()
          ? { address: address.trim() }
          : undefined,
      }
      if (description.trim()) {
        data.markdownBody = description.trim()
        data.plainDescription = description.trim()
      }
      if (isTimedItem) {
        if (start) data.start = new Date(start).toISOString()
        if (end) data.end = new Date(end).toISOString()
      }
      await onSubmit(data)
    } finally {
      setSaving(false)
    }
  }

  const valid = title.trim().length > 0 && (isTimedItem ? Boolean(start) : true)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between bg-card">
        <div>
          <h3 className="font-semibold text-sm">
            {itemType === "event" ? "Neues Event" : itemType === "appointment" ? "Neuer Termin" : itemType === "place" ? "Werkstatt eintragen" : `Neues Item (${itemType})`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {pickedLocation
              ? "Standort gewaehlt"
              : "Klick auf die Karte um Standort zu waehlen"}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Standort-Status */}
        <div
          className={`rounded-md border p-2 flex items-start gap-2 text-xs ${
            pickedLocation ? "border-primary/40 bg-primary/5" : "border-amber-300/50 bg-amber-50/50"
          }`}
        >
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <div className="flex-1">
            {pickedLocation ? (
              <>
                <span className="font-medium">Standort:</span>
                <code className="ml-1 text-[10px]">
                  {pickedLocation.lat.toFixed(5)}, {pickedLocation.lng.toFixed(5)}
                </code>
                <p className="text-muted-foreground/80 mt-0.5">
                  Klick erneut auf die Karte zum Verschieben.
                </p>
              </>
            ) : (
              <span className="text-amber-800">Noch kein Standort gewaehlt. Tippe auf die Karte.</span>
            )}
          </div>
        </div>

        {/* Titel */}
        <div>
          <Label className="text-xs">Titel</Label>
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              itemType === "event"
                ? "z.B. Sommerfest"
                : itemType === "place"
                ? "z.B. Holzwerkstatt Berlin Mitte"
                : "Titel"
            }
          />
        </div>

        {/* Adresse (optional) */}
        <div>
          <Label className="text-xs">Adresse (optional)</Label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Strasse, Hausnummer, PLZ Ort"
          />
        </div>

        {/* Datum + Zeit (nur fuer event/appointment) */}
        {isTimedItem && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Start</Label>
              <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Ende</Label>
              <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
        )}

        {/* Beschreibung */}
        <div>
          <Label className="text-xs">Beschreibung (optional)</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-20"
            placeholder="Was, wann, wer, warum..."
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t flex justify-end gap-2 bg-card">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          Abbrechen
        </Button>
        <Button size="sm" onClick={handleSave} disabled={!valid || saving}>
          {saving ? "Speichern..." : "Anlegen"}
        </Button>
      </div>
    </div>
  )
}
