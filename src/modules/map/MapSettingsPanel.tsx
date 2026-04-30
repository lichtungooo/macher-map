import { Label } from "@real-life-stack/toolkit"
import { Input } from "@real-life-stack/toolkit"
import type { MapModuleConfig } from "./MapView"
import { TILE_PROVIDERS } from "./MapView"

/**
 * MapSettingsPanel — Editor-UI fuer die Karten-Konfig.
 *
 * **Controlled Component:** bekommt aktuellen Config-Draft + onChange.
 * Lebt im linken Bereich des ModuleEditScreen, schreibt Aenderungen
 * in den lokalen State des EditScreen. Speicherung passiert dort.
 */

export interface MapSettingsPanelProps {
  config: MapModuleConfig
  onChange: (next: MapModuleConfig) => void
  pinTypeOptions: { id: string; label: string; defaultColor: string }[]
}

export function MapSettingsPanel({ config, onChange, pinTypeOptions }: MapSettingsPanelProps) {
  const togglePinType = (id: string) => {
    const set = new Set(config.pinTypes ?? [])
    if (set.has(id)) set.delete(id)
    else set.add(id)
    onChange({ ...config, pinTypes: Array.from(set) })
  }

  const setPinColor = (typeId: string, color: string) => {
    onChange({
      ...config,
      pinStyles: {
        ...(config.pinStyles ?? {}),
        [typeId]: { ...(config.pinStyles?.[typeId] ?? {}), color },
      },
    })
  }

  const setActionButton = (patch: Partial<NonNullable<MapModuleConfig["actionButton"]>>) => {
    onChange({
      ...config,
      actionButton: { ...(config.actionButton ?? { enabled: false }), ...patch },
    })
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
            const enabled = (config.pinTypes ?? []).includes(opt.id)
            const currentColor = config.pinStyles?.[opt.id]?.color ?? opt.defaultColor
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
                  checked={config.tileProvider === id}
                  onChange={() => onChange({ ...config, tileProvider: id, tileUrl: prov.url })}
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
            checked={config.actionButton?.enabled ?? false}
            onChange={(e) => setActionButton({ enabled: e.target.checked })}
          />
          <span className="text-sm">Action-Button anzeigen</span>
        </label>
        {config.actionButton?.enabled && (
          <div className="space-y-2 pl-2">
            <div>
              <Label className="text-xs">Beschriftung</Label>
              <Input
                value={config.actionButton?.label ?? ""}
                onChange={(e) => setActionButton({ label: e.target.value })}
                placeholder="z.B. Werkstatt eintragen"
              />
            </div>
            <div>
              <Label className="text-xs">Item-Typ beim Klick anlegen</Label>
              <Input
                value={config.actionButton?.createItemType ?? ""}
                onChange={(e) => setActionButton({ createItemType: e.target.value })}
                placeholder="z.B. place"
              />
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
