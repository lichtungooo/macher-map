import { useState } from "react"
import { Save } from "lucide-react"
import { Button, Input, Label } from "@real-life-stack/toolkit"
import type { MapModuleConfig } from "./MapView"
import { TILE_PROVIDERS } from "./MapView"

/**
 * MapSettingsPanel — Inline-Editor fuer die Karten-Konfig.
 *
 * Erscheint im Side-Panel wenn Admin aufs Zahnrad klickt.
 * Speichert in `group.data.moduleConfig.map`.
 */

export interface MapSettingsPanelProps {
  config: MapModuleConfig
  pinTypeOptions: { id: string; label: string; defaultColor: string }[]
  onSave: (next: MapModuleConfig) => Promise<void>
}

export function MapSettingsPanel({ config, pinTypeOptions, onSave }: MapSettingsPanelProps) {
  const [draft, setDraft] = useState<MapModuleConfig>({ ...config })
  const [saving, setSaving] = useState(false)

  const togglePinType = (id: string) => {
    const set = new Set(draft.pinTypes ?? [])
    if (set.has(id)) set.delete(id)
    else set.add(id)
    setDraft({ ...draft, pinTypes: Array.from(set) })
  }

  const setPinColor = (typeId: string, color: string) => {
    setDraft({
      ...draft,
      pinStyles: {
        ...(draft.pinStyles ?? {}),
        [typeId]: { ...(draft.pinStyles?.[typeId] ?? {}), color },
      },
    })
  }

  const setActionButton = (patch: Partial<NonNullable<MapModuleConfig["actionButton"]>>) => {
    setDraft({
      ...draft,
      actionButton: { ...(draft.actionButton ?? { enabled: false }), ...patch },
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(draft)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Item-Typen / Filter */}
      <section>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Was wird auf der Karte gezeigt
        </h4>
        <div className="space-y-2">
          {pinTypeOptions.map((opt) => {
            const enabled = (draft.pinTypes ?? []).includes(opt.id)
            const currentColor = draft.pinStyles?.[opt.id]?.color ?? opt.defaultColor
            return (
              <div key={opt.id} className="flex items-center gap-2 p-2 border rounded-md bg-card">
                <input
                  type="checkbox"
                  id={`pin-${opt.id}`}
                  checked={enabled}
                  onChange={() => togglePinType(opt.id)}
                />
                <Label htmlFor={`pin-${opt.id}`} className="flex-1 cursor-pointer text-sm">
                  {opt.label}
                </Label>
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setPinColor(opt.id, e.target.value)}
                  className="h-7 w-9 rounded border cursor-pointer"
                  title="Pin-Farbe"
                />
              </div>
            )
          })}
        </div>
      </section>

      {/* Tile-Layer */}
      <section>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Karten-Stil
        </h4>
        <div className="space-y-1">
          {(Object.entries(TILE_PROVIDERS) as Array<[keyof typeof TILE_PROVIDERS, { url: string; label: string }]>).map(
            ([id, prov]) => (
              <label
                key={id}
                className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-muted/50"
              >
                <input
                  type="radio"
                  name="tile-provider"
                  checked={draft.tileProvider === id}
                  onChange={() => setDraft({ ...draft, tileProvider: id, tileUrl: prov.url })}
                />
                <span className="text-sm">{prov.label}</span>
              </label>
            )
          )}
        </div>
      </section>

      {/* Action-Button */}
      <section>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Action-Button (unten rechts)
        </h4>
        <label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer mb-2">
          <input
            type="checkbox"
            checked={draft.actionButton?.enabled ?? false}
            onChange={(e) => setActionButton({ enabled: e.target.checked })}
          />
          <span className="text-sm">Action-Button anzeigen</span>
        </label>
        {draft.actionButton?.enabled && (
          <div className="space-y-2 pl-2">
            <div>
              <Label className="text-xs">Beschriftung</Label>
              <Input
                value={draft.actionButton?.label ?? ""}
                onChange={(e) => setActionButton({ label: e.target.value })}
                placeholder="z.B. Werkstatt eintragen"
              />
            </div>
            <div>
              <Label className="text-xs">Item-Typ beim Klick anlegen</Label>
              <Input
                value={draft.actionButton?.createItemType ?? ""}
                onChange={(e) => setActionButton({ createItemType: e.target.value })}
                placeholder="z.B. place"
              />
            </div>
          </div>
        )}
      </section>

      {/* Save */}
      <div className="pt-4 border-t flex justify-end">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-1" />
          {saving ? "Speichern..." : "Speichern"}
        </Button>
      </div>
    </div>
  )
}
