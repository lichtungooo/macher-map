import { useState } from "react"
import {
  Label,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@real-life-stack/toolkit"
import { Pin, Layers, MousePointerClick, SlidersHorizontal, Search, ChevronDown, ChevronRight } from "lucide-react"
import type { MapModuleConfig } from "./MapView"
import { TILE_PROVIDERS } from "./MapView"
import { PinStyleEditor } from "./PinStyleEditor"
import { renderPinHtml, type PinStyle } from "./pin-styles"

/**
 * MapSettingsPanel — Editor-UI fuer die Karten-Konfig.
 *
 * **Tab-Struktur** (Phase A) — verteilt die Konfig in 5 Bereiche:
 *   - Pins:      Welche Item-Typen + Pin-Stil pro Typ (Phase B: Library + Generator)
 *   - Layer:     Tile-Provider, spaeter Overlay-Layer
 *   - Aktionen:  Action-Button (Phase C: Multi-Action-Menu)
 *   - Filter:    User-sichtbare Filter (Phase E)
 *   - Suche:     Karten-Suche (Phase E)
 *
 * **Controlled Component**: bekommt config + onChange.
 */

export interface MapSettingsPanelProps {
  config: MapModuleConfig
  onChange: (next: MapModuleConfig) => void
  pinTypeOptions: { id: string; label: string; defaultColor: string }[]
}

export function MapSettingsPanel({ config, onChange, pinTypeOptions }: MapSettingsPanelProps) {
  return (
    <Tabs defaultValue="pins" className="w-full">
      <TabsList className="grid grid-cols-5 w-full">
        <TabsTrigger value="pins" title="Pins">
          <Pin className="h-3.5 w-3.5 mr-1" />
          <span className="hidden sm:inline">Pins</span>
        </TabsTrigger>
        <TabsTrigger value="layer" title="Layer">
          <Layers className="h-3.5 w-3.5 mr-1" />
          <span className="hidden sm:inline">Layer</span>
        </TabsTrigger>
        <TabsTrigger value="actions" title="Aktionen">
          <MousePointerClick className="h-3.5 w-3.5 mr-1" />
          <span className="hidden sm:inline">Aktionen</span>
        </TabsTrigger>
        <TabsTrigger value="filter" title="Filter">
          <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
          <span className="hidden sm:inline">Filter</span>
        </TabsTrigger>
        <TabsTrigger value="search" title="Suche">
          <Search className="h-3.5 w-3.5 mr-1" />
          <span className="hidden sm:inline">Suche</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pins" className="space-y-4 mt-4">
        <PinsTab config={config} onChange={onChange} pinTypeOptions={pinTypeOptions} />
      </TabsContent>

      <TabsContent value="layer" className="space-y-4 mt-4">
        <LayerTab config={config} onChange={onChange} />
      </TabsContent>

      <TabsContent value="actions" className="space-y-4 mt-4">
        <ActionsTab config={config} onChange={onChange} />
      </TabsContent>

      <TabsContent value="filter" className="space-y-4 mt-4">
        <ComingSoon
          title="Filter"
          description="Filter-Buttons fuer User: schnell Pin-Typen ein-/ausblenden, ohne in den Settings."
        />
      </TabsContent>

      <TabsContent value="search" className="space-y-4 mt-4">
        <ComingSoon
          title="Suche"
          description="Hashtag- und User-Suche direkt auf der Karte. Pins werden gefiltert."
        />
      </TabsContent>
    </Tabs>
  )
}

// ============================================================
// Tab: Pins
// ============================================================

function PinsTab({
  config,
  onChange,
  pinTypeOptions,
}: {
  config: MapModuleConfig
  onChange: (next: MapModuleConfig) => void
  pinTypeOptions: { id: string; label: string; defaultColor: string }[]
}) {
  const [expandedType, setExpandedType] = useState<string | null>(null)

  const togglePinType = (id: string) => {
    const set = new Set(config.pinTypes ?? [])
    if (set.has(id)) set.delete(id)
    else set.add(id)
    onChange({ ...config, pinTypes: Array.from(set) })
  }

  const setPinStyle = (typeId: string, style: PinStyle) => {
    onChange({
      ...config,
      pinStyles: { ...(config.pinStyles ?? {}), [typeId]: style },
    })
  }

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Pin-Typen
        </h4>
        <p className="text-[11px] text-muted-foreground/70 mb-2">
          Aktiviere Item-Typen die als Pins erscheinen. Klick auf "Stil" um Form/Farbe/Glow
          pro Typ anzupassen.
        </p>
        <div className="space-y-2">
          {pinTypeOptions.map((opt) => {
            const enabled = (config.pinTypes ?? []).includes(opt.id)
            const userStyle = config.pinStyles?.[opt.id]
            const currentStyle: PinStyle = {
              color: userStyle?.color ?? opt.defaultColor,
              shape: userStyle?.shape ?? "drop",
              borderColor: userStyle?.borderColor,
              borderWidth: userStyle?.borderWidth,
              iconColor: userStyle?.iconColor,
              glow: userStyle?.glow,
              size: userStyle?.size,
              iconSvg: userStyle?.iconSvg,
            }
            const isExpanded = expandedType === opt.id

            return (
              <div key={opt.id} className="border rounded-md bg-card overflow-hidden">
                <div className="flex items-center gap-2 p-2">
                  <input
                    type="checkbox"
                    id={`pin-${opt.id}`}
                    checked={enabled}
                    onChange={() => togglePinType(opt.id)}
                  />
                  <Label htmlFor={`pin-${opt.id}`} className="flex-1 cursor-pointer text-sm">
                    {opt.label}
                  </Label>
                  {/* Mini-Pin-Preview */}
                  <div
                    className="shrink-0"
                    style={{
                      width: 28,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    dangerouslySetInnerHTML={{ __html: renderPinHtml(currentStyle, 24) }}
                  />
                  <button
                    type="button"
                    onClick={() => setExpandedType(isExpanded ? null : opt.id)}
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-muted/50"
                    disabled={!enabled}
                  >
                    {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    Stil
                  </button>
                </div>
                {isExpanded && enabled && (
                  <div className="p-3 border-t bg-muted/20">
                    <PinStyleEditor
                      value={currentStyle}
                      onChange={(next) => setPinStyle(opt.id, next)}
                      defaultColor={opt.defaultColor}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Phase D Hint */}
      <div className="border border-dashed border-border rounded-md p-3 text-[11px] text-muted-foreground/70">
        🔜 <strong>Phase D</strong> kommt: Pin-Generator (eigene Bilder → Pin),
        z.B. Werkstatt-Logo direkt auf der Karte.
      </div>
    </div>
  )
}

// ============================================================
// Tab: Layer
// ============================================================

function LayerTab({
  config,
  onChange,
}: {
  config: MapModuleConfig
  onChange: (next: MapModuleConfig) => void
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
        Karten-Stil (Tile-Provider)
      </h4>
      <div className="space-y-1">
        {(Object.entries(TILE_PROVIDERS) as Array<
          [keyof typeof TILE_PROVIDERS, { url: string; label: string }]
        >).map(([id, prov]) => (
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
        ))}
      </div>

      <div className="mt-4 border border-dashed border-border rounded-md p-3 text-[11px] text-muted-foreground/70">
        🔜 Spaeter: zusaetzliche Overlay-Layer (Cluster, Heatmap, Routen),
        Custom-Tile-URL fuer Spezialkarten.
      </div>
    </div>
  )
}

// ============================================================
// Tab: Aktionen (FAB-Konfig)
// ============================================================

function ActionsTab({
  config,
  onChange,
}: {
  config: MapModuleConfig
  onChange: (next: MapModuleConfig) => void
}) {
  const setActionButton = (patch: Partial<NonNullable<MapModuleConfig["actionButton"]>>) => {
    onChange({
      ...config,
      actionButton: { ...(config.actionButton ?? { enabled: false }), ...patch },
    })
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase text-muted-foreground">
        Action-Button (FAB unten rechts)
      </h4>
      <p className="text-[11px] text-muted-foreground/70">
        Plus-Button auf der Karte zum schnellen Anlegen. Klick → Quick-Create-Form mit
        Standort-Picker per Map-Klick.
      </p>

      <label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer">
        <input
          type="checkbox"
          checked={config.actionButton?.enabled ?? false}
          onChange={(e) => setActionButton({ enabled: e.target.checked })}
        />
        <span className="text-sm">Action-Button anzeigen</span>
      </label>

      {config.actionButton?.enabled && (
        <div className="space-y-2 pl-2 border-l-2 ml-2">
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
              placeholder="z.B. place, event, appointment, quest"
            />
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              Form passt sich am Typ an: <code>event/appointment</code> zeigt Datum/Zeit,
              <code> place/quest</code> zeigt nur Beschreibung.
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 border border-dashed border-border rounded-md p-3 text-[11px] text-muted-foreground/70">
        🔜 <strong>Phase C</strong>: Multi-Action-Menu. Plus-Klick oeffnet Menu mit
        mehreren Aktionen ("Werkstatt / Event / Profil-Pin / Quest").
      </div>
    </div>
  )
}

// ============================================================
// Coming-Soon Placeholder
// ============================================================

function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="py-8 text-center">
      <div className="inline-block p-3 rounded-full bg-muted/50 mb-3">
        <span className="text-2xl">🔜</span>
      </div>
      <h4 className="font-semibold text-sm mb-1">{title} — kommt bald</h4>
      <p className="text-xs text-muted-foreground/70 max-w-sm mx-auto">{description}</p>
    </div>
  )
}
