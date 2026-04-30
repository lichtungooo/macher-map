import { useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import type { Item } from "@real-life-stack/data-interface"
import type { MapLayoutConfig } from "../schema-types"
import type { ModuleFieldConfig } from "../types"

/**
 * Generischer Map-Layout-Renderer fuer SchemaModuleView.
 *
 * Nimmt eine Liste Items + den Map-Layout-Config + die Schema-Felder.
 * Findet das location-Field, rendert Pins fuer alle Items mit gueltiger Position.
 *
 * Spaeter: Pin-Color-Mapping per Field, Cluster, Tile-Layer-Switcher.
 */

export interface SchemaMapLayoutProps {
  items: Item[]
  config: MapLayoutConfig
  fields: ModuleFieldConfig[]
  onItemClick?: (item: Item) => void
}

const DEFAULT_PIN_COLOR = "#E8751A"

function makePinIcon(color: string): L.DivIcon {
  return L.divIcon({
    html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  })
}

const defaultIcon = makePinIcon(DEFAULT_PIN_COLOR)

export function SchemaMapLayout({ items, config, fields, onItemClick }: SchemaMapLayoutProps) {
  const titleField = config.titleField ?? findFirstFieldByType(fields, "text")?.id ?? "title"
  const subtitleField = findFirstFieldByType(fields, "textarea")?.id ?? "description"

  // Pin-Color: per Field-Mapping (z.B. kind=offer → orange, kind=need → blau) oder fest
  const colorByItemId = useMemo(() => {
    const map = new Map<string, L.DivIcon>()
    if (typeof config.pinColor === "object" && config.pinColor.field && config.pinColor.map) {
      for (const item of items) {
        const fieldValue = item.data[config.pinColor.field] as string | undefined
        const color = (fieldValue && config.pinColor.map[fieldValue]) ?? DEFAULT_PIN_COLOR
        map.set(item.id, makePinIcon(color))
      }
    } else if (typeof config.pinColor === "string") {
      const icon = makePinIcon(config.pinColor)
      for (const item of items) map.set(item.id, icon)
    }
    return map
  }, [items, config.pinColor])

  // Items mit gueltiger Position extrahieren
  const markers = useMemo(() => {
    return items
      .map((item) => {
        const loc = item.data[config.locationField] as { lat?: number; lng?: number } | undefined
        if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number") return null
        return {
          item,
          lat: loc.lat,
          lng: loc.lng,
          title: String(item.data[titleField] ?? "(ohne Titel)"),
          subtitle: subtitleField ? String(item.data[subtitleField] ?? "") : "",
          icon: colorByItemId.get(item.id) ?? defaultIcon,
        }
      })
      .filter((m): m is NonNullable<typeof m> => m !== null)
  }, [items, config.locationField, titleField, subtitleField, colorByItemId])

  const center: [number, number] = markers.length > 0
    ? [
        markers.reduce((s, m) => s + m.lat, 0) / markers.length,
        markers.reduce((s, m) => s + m.lng, 0) / markers.length,
      ]
    : (config.defaultCenter ?? [50.0, 10.0])

  const zoom = markers.length > 0 ? 11 : (config.defaultZoom ?? 6)

  return (
    <div style={{ height: "calc(100dvh - 14rem)", isolation: "isolate" }} className="rounded-lg overflow-hidden border">
      <MapContainer center={center} zoom={zoom} className="h-full w-full" zoomControl={true}>
        <TileLayer
          url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {markers.map((m) => (
          <Marker
            key={m.item.id}
            position={[m.lat, m.lng]}
            icon={m.icon}
            eventHandlers={onItemClick ? { click: () => onItemClick(m.item) } : undefined}
          >
            <Popup>
              <div style={{ fontFamily: "Inter, sans-serif", minWidth: 160 }}>
                <p style={{ fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>{m.title}</p>
                {m.subtitle && (
                  <p style={{ fontSize: "0.75rem", color: "#666", margin: "4px 0 0" }}>{m.subtitle}</p>
                )}
                {onItemClick && (
                  <button
                    onClick={() => onItemClick(m.item)}
                    style={{
                      marginTop: 8,
                      fontSize: "0.75rem",
                      color: "#E8751A",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                    }}
                  >
                    Details öffnen
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {markers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow text-sm text-muted-foreground">
            Noch keine Eintraege mit Standort
          </div>
        </div>
      )}
    </div>
  )
}

function findFirstFieldByType(fields: ModuleFieldConfig[], type: ModuleFieldConfig["type"]) {
  return fields.find((f) => f.type === type)
}

/** Findet das erste location-Field eines Schemas, fuer Auto-Konfig. */
export function findLocationField(fields: ModuleFieldConfig[]): ModuleFieldConfig | undefined {
  return fields.find((f) => f.type === "location")
}
