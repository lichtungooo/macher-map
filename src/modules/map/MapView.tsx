import { useMemo, useState, useCallback, useEffect } from "react"
import { Settings, Plus, X } from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import { useItems, useCreateItem, useCurrentUser, Button, AdaptivePanel } from "@real-life-stack/toolkit"
import type { ModuleViewProps } from "../registry"
import { useModuleConfig, useIsSpaceAdmin } from "../use-module-config"
import { MapSettingsPanel } from "./MapSettingsPanel"
import { ModuleEditScreen } from "../renderers/ModuleEditScreen"
import { QuickCreateForm } from "./QuickCreateForm"
import { renderPinIcon, renderPinHtml, type PinStyle } from "./pin-styles"

// ============================================================
// Default-Pin-Konfiguration pro Item-Typ
// ============================================================

export const DEFAULT_PIN_STYLES: Record<string, { color: string; shape: PinStyle["shape"]; label: string }> = {
  place: { color: "#E8751A", shape: "drop", label: "Werkstaetten" },
  event: { color: "#3b82f6", shape: "drop", label: "Events" },
  offer: { color: "#10b981", shape: "circle", label: "Angebote" },
  need: { color: "#f59e0b", shape: "circle", label: "Suche" },
  quest: { color: "#a855f7", shape: "hexagon", label: "Quests" },
  profile: { color: "#ec4899", shape: "circle", label: "Macher" },
}

// ============================================================
// Modul-Konfig
// ============================================================

export interface MapModuleConfig {
  /** Welche Item-Typen werden als Pins angezeigt? */
  pinTypes?: string[]
  /** Tile-Layer-URL. */
  tileUrl?: string
  /** Tile-Provider-Name (fuer UI-Auswahl). */
  tileProvider?: "osm-de" | "osm" | "topo" | "satellite"
  /** Default-Center wenn keine Pins. */
  defaultCenter?: [number, number]
  /** Default-Zoom wenn keine Pins. */
  defaultZoom?: number
  /** Pin-Styles pro Item-Typ (Form + Farbe + Border + Glow). */
  pinStyles?: Record<string, PinStyle>
  /** Zeige Action-Button unten rechts? */
  actionButton?: {
    enabled: boolean
    /** @deprecated nur fuer Legacy-Configs — bitte `actions` nutzen. */
    label?: string
    /** @deprecated nur fuer Legacy-Configs — bitte `actions` nutzen. */
    createItemType?: string
    /**
     * Liste der Aktionen. 1 Action: direkter Klick. >1: aufklappbares Menu.
     * Bei leerer Liste + Legacy-Felder werden diese als 1-Action-Liste interpretiert.
     */
    actions?: MapActionEntry[]
  }
}

export interface MapActionEntry {
  /** Stabile ID (fuer Reihenfolge + React-Keys). */
  id: string
  /** Beschriftung im Menu. */
  label: string
  /** Welcher Item-Typ wird beim Klick angelegt. */
  createItemType: string
}

export const TILE_PROVIDERS: Record<NonNullable<MapModuleConfig["tileProvider"]>, { url: string; label: string }> = {
  "osm-de": {
    url: "https://tile.openstreetmap.de/{z}/{x}/{y}.png",
    label: "OpenStreetMap (DE)",
  },
  "osm": {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    label: "OpenStreetMap",
  },
  "topo": {
    url: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
    label: "OpenTopoMap",
  },
  "satellite": {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    label: "Satellit",
  },
}

export const mapDefaultConfig: MapModuleConfig = {
  pinTypes: ["place", "event"],
  tileProvider: "osm-de",
  defaultCenter: [50.0, 10.0],
  defaultZoom: 6,
  actionButton: { enabled: false, actions: [] },
}

/**
 * Liest die effektive Actions-Liste aus der Konfig.
 * Migriert Legacy (createItemType + label) automatisch.
 */
export function resolveMapActions(cfg: MapModuleConfig): MapActionEntry[] {
  const ab = cfg.actionButton
  if (!ab?.enabled) return []
  if (ab.actions && ab.actions.length > 0) return ab.actions
  if (ab.createItemType) {
    return [{
      id: "legacy",
      label: ab.label?.trim() || "Neu",
      createItemType: ab.createItemType,
    }]
  }
  return []
}

/** Merged User-Pin-Style mit Default fuer einen Item-Typ. */
export function resolvePinStyle(type: string, cfg: MapModuleConfig): PinStyle {
  const userStyle = cfg.pinStyles?.[type]
  const defaultStyle = DEFAULT_PIN_STYLES[type] ?? { color: "#888", shape: "drop" as const }
  return {
    shape: userStyle?.shape ?? defaultStyle.shape,
    color: userStyle?.color ?? defaultStyle.color,
    borderColor: userStyle?.borderColor,
    borderWidth: userStyle?.borderWidth,
    iconColor: userStyle?.iconColor,
    glow: userStyle?.glow,
    size: userStyle?.size,
    iconSvg: userStyle?.iconSvg,
  }
}

// ============================================================
// View
// ============================================================

export interface MapViewProps extends ModuleViewProps<MapModuleConfig> {
  /** Im Preview-Modus wird kein Zahnrad angezeigt (verhindert Inception). */
  isPreview?: boolean
}

export function MapView({ spaceId, activeGroup, config, isPreview }: MapViewProps) {
  const cfg = { ...mapDefaultConfig, ...(config ?? {}) }
  const isAdmin = useIsSpaceAdmin(spaceId)
  const { setModuleConfig } = useModuleConfig()
  const { mutate: createItem } = useCreateItem()
  const { data: currentUser } = useCurrentUser()
  const [editOpen, setEditOpen] = useState(false)

  // Quick-Create-Flow von der Karte aus
  const [creatingType, setCreatingType] = useState<string | null>(null)
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [actionMenuOpen, setActionMenuOpen] = useState(false)

  const pinTypes = cfg.pinTypes ?? mapDefaultConfig.pinTypes!
  const tileUrl = cfg.tileUrl ?? TILE_PROVIDERS[cfg.tileProvider ?? "osm-de"].url

  // Items pro Typ laden — wir nutzen useItems pro Type weil Filter im
  // useItems-Hook nicht alle Typen kombinieren kann. Limit hier: max 6 Typen.
  const placeItems = useItems({ type: pinTypes.includes("place") ? "place" : "__none__" }).data
  const eventItems = useItems({ type: pinTypes.includes("event") ? "event" : "__none__" }).data
  const offerItems = useItems({ type: pinTypes.includes("offer") ? "offer" : "__none__" }).data
  const needItems = useItems({ type: pinTypes.includes("need") ? "need" : "__none__" }).data
  const questItems = useItems({ type: pinTypes.includes("quest") ? "quest" : "__none__" }).data

  const allItems = useMemo(
    () => [...placeItems, ...eventItems, ...offerItems, ...needItems, ...questItems],
    [placeItems, eventItems, offerItems, needItems, questItems]
  )

  // Marker erzeugen — Items mit gueltigem location-Field oder data.location
  const markers = useMemo(() => {
    return allItems
      .map((item) => {
        const loc = (item.data.location as { lat?: number; lng?: number } | undefined) ?? null
        if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number") return null
        const style = resolvePinStyle(item.type, cfg)
        return {
          item,
          lat: loc.lat,
          lng: loc.lng,
          title: String(item.data.title ?? "(ohne Titel)"),
          subtitle:
            String(item.data.address ?? item.data.description ?? item.data.start ?? ""),
          icon: renderPinIcon(style),
        }
      })
      .filter((m): m is NonNullable<typeof m> => m !== null)
  }, [allItems, cfg])

  const center: [number, number] = markers.length > 0
    ? [
        markers.reduce((s, m) => s + m.lat, 0) / markers.length,
        markers.reduce((s, m) => s + m.lng, 0) / markers.length,
      ]
    : cfg.defaultCenter ?? [50.0, 10.0]

  const zoom = markers.length > 0 ? 11 : (cfg.defaultZoom ?? 6)

  const handleSaveConfig = async (next: MapModuleConfig) => {
    if (!activeGroup) return
    await setModuleConfig(activeGroup, "map", next)
  }

  const actions = useMemo(() => resolveMapActions(cfg), [cfg])

  const startActionCreate = useCallback((createItemType: string) => {
    setActionMenuOpen(false)
    setCreatingType(createItemType)
    setPickedLocation(null)
  }, [])

  const handleFabClick = useCallback(() => {
    if (actions.length === 0) return
    if (actions.length === 1) {
      startActionCreate(actions[0].createItemType)
    } else {
      setActionMenuOpen((open) => !open)
    }
  }, [actions, startActionCreate])

  // ESC schliesst das Aktionen-Menu
  useEffect(() => {
    if (!actionMenuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActionMenuOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [actionMenuOpen])

  const handleQuickCreate = useCallback(
    async (data: Record<string, unknown>) => {
      if (!creatingType) return
      await createItem({
        type: creatingType,
        createdBy: currentUser?.id ?? "anonymous",
        data,
      })
      setCreatingType(null)
      setPickedLocation(null)
    },
    [createItem, creatingType, currentUser?.id]
  )

  const handleMapClick = useCallback((latlng: L.LatLng) => {
    setPickedLocation({ lat: latlng.lat, lng: latlng.lng })
  }, [])

  const pinTypeOptions = Object.entries(DEFAULT_PIN_STYLES).map(([id, s]) => ({
    id,
    label: s.label,
    defaultColor: s.color,
  }))

  return (
    <div style={{ height: isPreview ? "100%" : "calc(100dvh - 3.5rem)", isolation: "isolate", position: "relative" }}>
      {/* Settings-Zahnrad oben rechts (nur Admin, NICHT im Preview) */}
      {!isPreview && isAdmin && activeGroup && (
        <div className="absolute top-3 right-3 z-[1000]">
          <div className="bg-background/95 backdrop-blur rounded-md shadow-md border">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setEditOpen(true)}
              title="Karte konfigurieren"
              aria-label="Karte konfigurieren"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit-Screen (Vollbild Split: Editor links, Live-Preview rechts) */}
      {!isPreview && activeGroup && (
        <ModuleEditScreen<MapModuleConfig>
          open={editOpen}
          onClose={() => setEditOpen(false)}
          title="Karte"
          description="Pin-Typen, Karten-Stil, Action-Button"
          initialConfig={cfg}
          onSave={handleSaveConfig}
          renderEditor={(draft, setDraft) => (
            <MapSettingsPanel
              config={draft}
              onChange={setDraft}
              pinTypeOptions={pinTypeOptions}
            />
          )}
          renderPreview={(draft) => (
            <MapView
              spaceId={spaceId}
              activeGroup={activeGroup}
              allGroups={[]}
              config={draft}
              isPreview
            />
          )}
        />
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          key={tileUrl}
          url={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Map-Click-Handler — nur wenn Quick-Create aktiv */}
        {creatingType && <MapClickHandler onClick={handleMapClick} />}

        {/* Gepickter Standort als pulsierender Pin */}
        {pickedLocation && (
          <Marker
            position={[pickedLocation.lat, pickedLocation.lng]}
            icon={L.divIcon({
              html: `<div style="position:relative;width:32px;height:32px">
                <div style="position:absolute;inset:0;background:#E8751A;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);animation:pulse 1.5s infinite"></div>
                <div style="position:absolute;inset:8px;background:#fff;border-radius:50%"></div>
              </div>
              <style>@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:0.85}}</style>`,
              className: "",
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            })}
          />
        )}

        {markers.map((m) => (
          <Marker key={m.item.id} position={[m.lat, m.lng]} icon={m.icon}>
            <Popup>
              <div style={{ fontFamily: "Inter, sans-serif", minWidth: 160 }}>
                <p style={{ fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>{m.title}</p>
                {m.subtitle && (
                  <p style={{ fontSize: "0.75rem", color: "#666", margin: "4px 0 0" }}>{m.subtitle}</p>
                )}
                <p style={{ fontSize: "0.65rem", color: "#999", margin: "4px 0 0" }}>
                  {m.item.type}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Action-Button unten rechts + Multi-Action-Menu */}
      {!isPreview && actions.length > 0 && !creatingType && (
        <>
          {/* Backdrop schliesst das Menu beim Klick neben dran */}
          {actionMenuOpen && (
            <div
              className="absolute inset-0 z-[999]"
              onClick={() => setActionMenuOpen(false)}
            />
          )}

          {/* Aufgeklappte Aktions-Liste oberhalb des FAB */}
          {actionMenuOpen && actions.length > 1 && (
            <div className="absolute bottom-24 right-4 z-[1001] flex flex-col gap-2 items-end animate-in fade-in slide-in-from-bottom-2 duration-150">
              {actions.map((action) => {
                const style = resolvePinStyle(action.createItemType, cfg)
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => startActionCreate(action.createItemType)}
                    className="bg-background/95 backdrop-blur shadow-lg pl-2 pr-4 py-2 rounded-full border flex items-center gap-2 hover:bg-muted/80 hover:scale-[1.02] transition-all"
                    title={action.label}
                  >
                    <span
                      style={{ width: 24, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      dangerouslySetInnerHTML={{ __html: renderPinHtml(style, 22) }}
                    />
                    <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Eigentlicher FAB */}
          <button
            className="absolute bottom-6 right-4 z-[1001] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
            title={
              actions.length === 1
                ? actions[0].label
                : actionMenuOpen
                ? "Menu schliessen"
                : "Aktion waehlen"
            }
            onClick={handleFabClick}
            aria-expanded={actions.length > 1 ? actionMenuOpen : undefined}
          >
            {actionMenuOpen && actions.length > 1 ? (
              <X className="h-6 w-6" />
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </button>
        </>
      )}

      {/* Hint waehrend Picker aktiv */}
      {!isPreview && creatingType && !pickedLocation && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-primary text-primary-foreground px-3 py-1.5 rounded-full shadow-lg text-xs font-medium pointer-events-none">
          Tippe auf die Karte um Standort zu waehlen
        </div>
      )}

      {/* Quick-Create Side-Panel */}
      <AdaptivePanel
        open={creatingType !== null}
        onClose={() => {
          setCreatingType(null)
          setPickedLocation(null)
        }}
        allowedModes={["sidebar", "drawer"]}
        sidebarWidth="380px"
      >
        {creatingType && (
          <QuickCreateForm
            itemType={creatingType}
            pickedLocation={pickedLocation}
            onSubmit={handleQuickCreate}
            onCancel={() => {
              setCreatingType(null)
              setPickedLocation(null)
            }}
          />
        )}
      </AdaptivePanel>
    </div>
  )
}

// ============================================================
// MapClickHandler — registriert click-Listener auf der Karte
// (muss innerhalb von <MapContainer> sein, sonst ist useMapEvents kein Hook)
// ============================================================

function MapClickHandler({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng)
    },
  })
  return null
}
