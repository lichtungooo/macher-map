import { useMemo, useState } from "react"
import { Settings } from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import { useItems, Button } from "@real-life-stack/toolkit"
import type { ModuleViewProps } from "../registry"
import { useModuleConfig, useIsSpaceAdmin } from "../use-module-config"
import { MapSettingsPanel } from "./MapSettingsPanel"
import { ModuleEditScreen } from "../renderers/ModuleEditScreen"

// ============================================================
// Pin-Stile (Default-Set, spaeter konfigurierbar im Pin-Generator)
// ============================================================

function makePinIcon(color: string, iconSvg?: string): L.DivIcon {
  const inner =
    iconSvg ??
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
  return L.divIcon({
    html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">${inner}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  })
}

const DEFAULT_PIN_STYLES: Record<string, { color: string; label: string }> = {
  place: { color: "#E8751A", label: "Werkstaetten" },
  event: { color: "#3b82f6", label: "Events" },
  offer: { color: "#10b981", label: "Angebote" },
  need: { color: "#f59e0b", label: "Suche" },
  quest: { color: "#a855f7", label: "Quests" },
  profile: { color: "#ec4899", label: "Macher" },
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
  /** Pin-Styles pro Item-Typ (color, optional Icon-SVG). */
  pinStyles?: Record<string, { color: string; iconSvg?: string }>
  /** Zeige Action-Button unten rechts? */
  actionButton?: {
    enabled: boolean
    label?: string
    /** Welcher Item-Typ wird beim Klick angelegt. */
    createItemType?: string
  }
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
  actionButton: { enabled: false },
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
  const [editOpen, setEditOpen] = useState(false)

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
        const style = cfg.pinStyles?.[item.type] ?? DEFAULT_PIN_STYLES[item.type] ?? { color: "#888" }
        return {
          item,
          lat: loc.lat,
          lng: loc.lng,
          title: String(item.data.title ?? "(ohne Titel)"),
          subtitle:
            String(item.data.address ?? item.data.description ?? item.data.start ?? ""),
          icon: makePinIcon(style.color, "iconSvg" in style ? style.iconSvg : undefined),
        }
      })
      .filter((m): m is NonNullable<typeof m> => m !== null)
  }, [allItems, cfg.pinStyles])

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

      {/* Action-Button unten rechts (konfigurierbar) */}
      {cfg.actionButton?.enabled && (
        <button
          className="absolute bottom-6 right-4 z-[1000] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
          title={cfg.actionButton.label ?? "Neu"}
          onClick={() => {
            // TODO: Item-Create-Dialog fuer cfg.actionButton.createItemType oeffnen
            console.log("[MapView] action click — create", cfg.actionButton?.createItemType)
          }}
        >
          <span className="text-2xl leading-none">+</span>
        </button>
      )}
    </div>
  )
}
