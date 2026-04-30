import { useState } from "react"
import {
  Label,
  Input,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@real-life-stack/toolkit"
import { Pin, Layers, MousePointerClick, SlidersHorizontal, Search, ChevronDown, ChevronRight, Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react"
import type { MapModuleConfig, MapActionEntry } from "./MapView"
import { TILE_PROVIDERS, DEFAULT_PIN_STYLES, resolvePinStyle } from "./MapView"
import { PinStyleEditor } from "./PinStyleEditor"
import { renderPinHtml, type PinStyle } from "./pin-styles"
import { DemoSection } from "../../demo/DemoSection"

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
        <SearchTab config={config} onChange={onChange} />
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
      <DemoSection />

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
              imageUrl: userStyle?.imageUrl,
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

      <div className="border border-dashed border-border rounded-md p-3 text-[11px] text-muted-foreground/70 space-y-1.5">
        <div>
          💡 <strong>Bild als Pin:</strong> Im Stil-Editor pro Typ kannst du ein eigenes Bild
          hochladen (z.B. Werkstatt-Logo). Das Bild wird in die Pin-Form geclippt.
        </div>
        <div>
          👤 <strong>Macher als Pin:</strong> Aktiviere "Macher" oben — dann erscheinen alle
          Profile mit Standort als Pins. Profile mit <code>data.location.lat/lng</code> in
          ihrer Extension werden gerendert.
        </div>
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
// Tab: Aktionen (Multi-Action-FAB-Konfig)
// ============================================================

const DEFAULT_ACTIONS: MapActionEntry[] = [
  { id: "place", label: "Werkstatt eintragen", createItemType: "place" },
  { id: "event", label: "Event anlegen", createItemType: "event" },
  { id: "quest", label: "Quest setzen", createItemType: "quest" },
]

function ActionsTab({
  config,
  onChange,
}: {
  config: MapModuleConfig
  onChange: (next: MapModuleConfig) => void
}) {
  const ab = config.actionButton ?? { enabled: false }
  // Migrations-View: zeigt Legacy-Single-Action als 1-Eintrag-Liste
  const effectiveActions: MapActionEntry[] =
    ab.actions && ab.actions.length > 0
      ? ab.actions
      : ab.createItemType
      ? [{ id: "legacy", label: ab.label?.trim() || "Neu", createItemType: ab.createItemType }]
      : []

  const setActionButton = (patch: Partial<NonNullable<MapModuleConfig["actionButton"]>>) => {
    onChange({ ...config, actionButton: { ...ab, ...patch } })
  }

  const setActions = (next: MapActionEntry[]) => {
    // Beim ersten Schreiben Legacy-Felder ablegen, damit es nur eine Wahrheit gibt
    setActionButton({ actions: next, createItemType: undefined, label: undefined })
  }

  const addAction = (preset?: MapActionEntry) => {
    const newId = `act-${Date.now().toString(36)}`
    const next: MapActionEntry = preset
      ? { ...preset, id: newId }
      : { id: newId, label: "Neu", createItemType: "place" }
    setActions([...effectiveActions, next])
  }

  const updateAction = (id: string, patch: Partial<MapActionEntry>) => {
    setActions(effectiveActions.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }

  const removeAction = (id: string) => {
    setActions(effectiveActions.filter((a) => a.id !== id))
  }

  const moveAction = (id: string, dir: -1 | 1) => {
    const idx = effectiveActions.findIndex((a) => a.id === id)
    if (idx < 0) return
    const target = idx + dir
    if (target < 0 || target >= effectiveActions.length) return
    const next = [...effectiveActions]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setActions(next)
  }

  const resetToDefaults = () => setActions(DEFAULT_ACTIONS)

  // Vorschlaege fuer Item-Typ-Chips (aus DEFAULT_PIN_STYLES)
  const typePresets = Object.entries(DEFAULT_PIN_STYLES).map(([id, s]) => ({
    id,
    label: s.label,
  }))

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
          Aktions-Knopf (FAB unten rechts)
        </h4>
        <p className="text-[11px] text-muted-foreground/70 mt-1">
          Plus-Knopf auf der Karte. <strong>Eine Aktion</strong> → direkter Klick legt sie an.
          <strong> Mehrere Aktionen</strong> → der Klick oeffnet ein Menu zur Auswahl.
        </p>
      </div>

      <label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer">
        <input
          type="checkbox"
          checked={ab.enabled ?? false}
          onChange={(e) => setActionButton({ enabled: e.target.checked })}
        />
        <span className="text-sm">Aktions-Knopf anzeigen</span>
      </label>

      {ab.enabled && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Aktionen</span>
            <div className="flex gap-1">
              {effectiveActions.length === 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={resetToDefaults}
                  className="text-xs h-7"
                >
                  Standard-Set
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addAction()}
                className="text-xs h-7"
              >
                <Plus className="h-3 w-3 mr-1" />
                Aktion
              </Button>
            </div>
          </div>

          {effectiveActions.length === 0 && (
            <div className="text-center py-6 border border-dashed rounded-md text-[11px] text-muted-foreground/70">
              Noch keine Aktion. <br />
              "Standard-Set" nimmt Werkstatt + Event + Quest.
            </div>
          )}

          <div className="space-y-2">
            {effectiveActions.map((action, idx) => {
              const style = resolvePinStyle(action.createItemType, config)
              return (
                <div key={action.id} className="border rounded-md bg-card p-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      style={{ width: 24, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      dangerouslySetInnerHTML={{ __html: renderPinHtml(style, 22) }}
                    />
                    <Input
                      value={action.label}
                      onChange={(e) => updateAction(action.id, { label: e.target.value })}
                      placeholder="Beschriftung"
                      className="h-7 text-sm flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => moveAction(action.id, -1)}
                      disabled={idx === 0}
                      className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted/50 disabled:opacity-30"
                      title="Nach oben"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveAction(action.id, 1)}
                      disabled={idx === effectiveActions.length - 1}
                      className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted/50 disabled:opacity-30"
                      title="Nach unten"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAction(action.id)}
                      className="h-7 w-7 inline-flex items-center justify-center rounded text-destructive hover:bg-destructive/10"
                      title="Entfernen"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 pl-8">
                    <Label className="text-[10px] uppercase text-muted-foreground/70 shrink-0">
                      Item-Typ
                    </Label>
                    <Input
                      value={action.createItemType}
                      onChange={(e) => updateAction(action.id, { createItemType: e.target.value })}
                      placeholder="place, event, quest, ..."
                      className="h-7 text-xs flex-1"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 pl-8">
                    {typePresets.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => updateAction(action.id, { createItemType: p.id })}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                          action.createItemType === p.id
                            ? "bg-primary/10 border-primary/40 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-[10px] text-muted-foreground/70 pl-1">
            Tipp: Form & Farbe einer Aktion kommen automatisch aus dem Pin-Stil des
            Item-Typs (siehe Tab "Pins"). Item-Typ <code>event/appointment</code> zeigt
            Datum/Zeit im Quick-Create, sonst nur Beschreibung.
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Tab: Suche
// ============================================================

function SearchTab({
  config,
  onChange,
}: {
  config: MapModuleConfig
  onChange: (next: MapModuleConfig) => void
}) {
  const search = config.search ?? { enabled: false }

  const setSearch = (patch: Partial<NonNullable<MapModuleConfig["search"]>>) => {
    onChange({ ...config, search: { ...search, ...patch } })
  }

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
          Karten-Suche
        </h4>
        <p className="text-[11px] text-muted-foreground/70 mt-1">
          Floating-Suchfeld oben links auf der Karte. Filtert sichtbare Pins live.
        </p>
      </div>

      <label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer">
        <input
          type="checkbox"
          checked={search.enabled ?? false}
          onChange={(e) => setSearch({ enabled: e.target.checked })}
        />
        <span className="text-sm">Suchfeld auf der Karte zeigen</span>
      </label>

      {search.enabled && (
        <div className="pl-2 border-l-2 ml-2 space-y-2">
          <div>
            <Label className="text-xs">Platzhalter-Text</Label>
            <Input
              value={search.placeholder ?? ""}
              onChange={(e) => setSearch({ placeholder: e.target.value })}
              placeholder="Suche... #hashtag @user"
            />
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              Kurze Anleitung im Suchfeld. Leer lassen fuer Default.
            </p>
          </div>
        </div>
      )}

      <div className="border border-dashed border-border rounded-md p-3 text-[11px] text-muted-foreground/70 space-y-1.5">
        <div className="font-medium text-foreground">Such-Syntax</div>
        <ul className="space-y-0.5 list-none">
          <li>
            <code className="text-foreground">holz</code> — sucht in Titel, Beschreibung, Adresse, Bio
          </li>
          <li>
            <code className="text-foreground">#sommerfest</code> — Items mit Hashtag/Tag
          </li>
          <li>
            <code className="text-foreground">@did:key:abc</code> — Items von einem User
          </li>
          <li>Mehrere Tokens kombinieren — alle muessen passen.</li>
        </ul>
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
