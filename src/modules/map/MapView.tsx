import { useMemo, useState, useCallback, useEffect } from "react"
import { Settings, Plus, X, Search as SearchIcon } from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import { useItems, useCreateItem, useCurrentUser, Button, AdaptivePanel } from "@real-life-stack/toolkit"
import type { ModuleViewProps } from "../registry"
import { useIsSpaceAdmin } from "../use-module-config"
import { QuickCreateForm } from "./QuickCreateForm"
import { renderPinIcon, renderPinHtml, type PinStyle } from "./pin-styles"
import { EmptyMapBanner } from "../../demo/EmptyMapBanner"
import { MapCalendarWidget } from "./MapCalendarWidget"

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
  /** Karten-Suche (Volltext + #hashtag + @user) als floating Suchfeld. */
  search?: {
    enabled: boolean
    placeholder?: string
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

/**
 * Default-Konfig — "alles an" (Demo-First / Subtraction-Design).
 *
 * Ein frisch erstellter Space zeigt die Karte mit voller Funktionspalette.
 * Admins schalten ueber das Inline-Zahnrad ab, was sie nicht brauchen —
 * statt sich aus einer leeren Karte alles zusammenzukonfigurieren.
 */
export const mapDefaultConfig: MapModuleConfig = {
  pinTypes: ["place", "event", "offer", "need", "quest", "profile"],
  tileProvider: "osm-de",
  defaultCenter: [50.0, 10.0],
  defaultZoom: 6,
  actionButton: {
    enabled: true,
    actions: [
      { id: "place", label: "Werkstatt eintragen", createItemType: "place" },
      { id: "event", label: "Event anlegen", createItemType: "event" },
      { id: "quest", label: "Quest setzen", createItemType: "quest" },
      { id: "offer", label: "Angebot teilen", createItemType: "offer" },
    ],
  },
  search: { enabled: true, placeholder: "Suche... #hashtag @user" },
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

// ============================================================
// Karten-Suche: Tokenizer (#hashtag, @user, Freitext)
// ============================================================

export interface ParsedSearch {
  hashtags: string[]
  users: string[]
  text: string[]
}

export function parseSearchQuery(query: string): ParsedSearch {
  const hashtags: string[] = []
  const users: string[] = []
  const text: string[] = []
  query
    .trim()
    .split(/\s+/)
    .forEach((token) => {
      if (!token) return
      if (token.startsWith("#") && token.length > 1) {
        hashtags.push(token.slice(1).toLowerCase())
      } else if (token.startsWith("@") && token.length > 1) {
        users.push(token.slice(1).toLowerCase())
      } else {
        text.push(token.toLowerCase())
      }
    })
  return { hashtags, users, text }
}

/** Prueft ob ein Item-Datensatz auf eine geparste Suchanfrage passt. */
export function itemMatchesSearch(
  item: { type: string; createdBy?: string; data: Record<string, unknown> },
  parsed: ParsedSearch
): boolean {
  if (parsed.hashtags.length === 0 && parsed.users.length === 0 && parsed.text.length === 0) {
    return true
  }
  // Tags / Hashtags — wir akzeptieren beide Felder + strippen optionales "#"
  if (parsed.hashtags.length > 0) {
    const raw = [
      ...((item.data.hashtags as string[] | undefined) ?? []),
      ...((item.data.tags as string[] | undefined) ?? []),
    ]
    const tags = raw.map((t) => String(t).toLowerCase().replace(/^#/, ""))
    if (!parsed.hashtags.every((h) => tags.includes(h))) return false
  }
  // User — Substring im createdBy (DID oder Name, je nachdem was im Feld steht)
  if (parsed.users.length > 0) {
    const created = String(item.createdBy ?? "").toLowerCase()
    if (!parsed.users.some((u) => created.includes(u))) return false
  }
  // Freitext — Substring in Titel/Beschreibung/Adresse
  if (parsed.text.length > 0) {
    const blob = [
      item.data.title,
      item.data.description,
      item.data.markdownBody,
      item.data.plainDescription,
      item.data.address,
      item.data.name,
      item.data.bio,
    ]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase())
      .join(" ")
    if (!parsed.text.every((t) => blob.includes(t))) return false
  }
  return true
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
    imageUrl: userStyle?.imageUrl,
  }
}

// ============================================================
// View
// ============================================================

export interface MapViewProps extends ModuleViewProps<MapModuleConfig> {
  /** Im Preview-Modus wird kein Zahnrad angezeigt (verhindert Inception). */
  isPreview?: boolean
}

export function MapView({ spaceId, activeGroup, config, isPreview, onOpenSettings }: MapViewProps) {
  const cfg = { ...mapDefaultConfig, ...(config ?? {}) }
  const isAdmin = useIsSpaceAdmin(spaceId)
  const { mutate: createItem } = useCreateItem()
  const { data: currentUser } = useCurrentUser()

  // Quick-Create-Flow von der Karte aus
  const [creatingType, setCreatingType] = useState<string | null>(null)
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [actionMenuOpen, setActionMenuOpen] = useState(false)

  // Karten-Suche (#hashtag, @user, Freitext)
  const [searchQuery, setSearchQuery] = useState("")

  // FlyTo-Ziel (z.B. wenn ein Event aus dem Kalender-Widget angeklickt wird)
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; itemId?: string } | null>(null)

  const pinTypes = cfg.pinTypes ?? mapDefaultConfig.pinTypes!
  const tileUrl = cfg.tileUrl ?? TILE_PROVIDERS[cfg.tileProvider ?? "osm-de"].url

  // Items pro Typ laden — wir nutzen useItems pro Type weil Filter im
  // useItems-Hook nicht alle Typen kombinieren kann.
  const placeItems = useItems({ type: pinTypes.includes("place") ? "place" : "__none__" }).data
  const eventItems = useItems({ type: pinTypes.includes("event") ? "event" : "__none__" }).data
  const offerItems = useItems({ type: pinTypes.includes("offer") ? "offer" : "__none__" }).data
  const needItems = useItems({ type: pinTypes.includes("need") ? "need" : "__none__" }).data
  const questItems = useItems({ type: pinTypes.includes("quest") ? "quest" : "__none__" }).data
  // User-Pins: profile-extension-Items (eines pro User) mit data.location
  const profileExtItems = useItems({
    type: pinTypes.includes("profile") ? "profile-extension" : "__none__",
  }).data

  // Profile-Extension-Items werden fuer Marker-Logik wie type "profile" behandelt.
  const profileItems = useMemo(
    () => profileExtItems.map((it) => ({ ...it, type: "profile" })),
    [profileExtItems]
  )

  const allItems = useMemo(
    () => [...placeItems, ...eventItems, ...offerItems, ...needItems, ...questItems, ...profileItems],
    [placeItems, eventItems, offerItems, needItems, questItems, profileItems]
  )

  const parsedSearch = useMemo(() => parseSearchQuery(searchQuery), [searchQuery])

  // Marker erzeugen — Items mit gueltigem location-Field oder data.location
  const markers = useMemo(() => {
    const searchActive = cfg.search?.enabled === true
    return allItems
      .map((item) => {
        const loc = (item.data.location as { lat?: number; lng?: number; address?: string } | undefined) ?? null
        if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number") return null
        if (searchActive && !itemMatchesSearch(item, parsedSearch)) return null
        const style = resolvePinStyle(item.type, cfg)
        // User-Pins (type "profile") zeigen Name aus data.name oder data.title
        const isProfile = item.type === "profile"
        const title = isProfile
          ? String(item.data.name ?? item.data.title ?? "Macher")
          : String(item.data.title ?? "(ohne Titel)")
        const address =
          loc.address ??
          (typeof item.data.address === "string" ? item.data.address : undefined)
        const start = typeof item.data.start === "string" ? item.data.start : undefined
        const description = isProfile
          ? (typeof item.data.bio === "string" ? item.data.bio : undefined)
          : (typeof item.data.markdownBody === "string" ? item.data.markdownBody : undefined)
        return {
          item,
          lat: loc.lat,
          lng: loc.lng,
          title,
          address,
          start,
          description,
          icon: renderPinIcon(style),
        }
      })
      .filter((m): m is NonNullable<typeof m> => m !== null)
  }, [allItems, cfg, parsedSearch])

  const center: [number, number] = markers.length > 0
    ? [
        markers.reduce((s, m) => s + m.lat, 0) / markers.length,
        markers.reduce((s, m) => s + m.lng, 0) / markers.length,
      ]
    : cfg.defaultCenter ?? [50.0, 10.0]

  const zoom = markers.length > 0 ? 11 : (cfg.defaultZoom ?? 6)

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
              onClick={() => onOpenSettings?.("modules", "map")}
              title="Karte konfigurieren"
              aria-label="Karte konfigurieren"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Empty-State: keine Pins → Demo-Banner mit Lade-Knopf (nur fuer Admins) */}
      {!isPreview && activeGroup && (
        <EmptyMapBanner
          visible={markers.length === 0 && !creatingType && !searchQuery}
          isAdmin={isAdmin}
        />
      )}

      {/* Kompakt-Kalender: schwebender Auszug der naechsten Termine */}
      {!isPreview && !creatingType && (
        <MapCalendarWidget
          onEventSelect={(ev) => setFlyTarget({ ...ev })}
        />
      )}

      {/* Karten-Suche oben links (konfigurierbar, nicht im Preview) */}
      {!isPreview && cfg.search?.enabled && !creatingType && (
        <div className="absolute top-3 left-3 z-[1000] flex items-center bg-background/95 backdrop-blur rounded-md shadow-md border">
          <SearchIcon
            className={`h-4 w-4 ml-2.5 shrink-0 transition-colors ${
              searchQuery ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={cfg.search?.placeholder ?? "Suche... #hashtag @user"}
            className="px-2 py-1.5 text-sm bg-transparent outline-none w-48 sm:w-64"
            aria-label="Karte durchsuchen"
          />
          {searchQuery && (
            <>
              <span
                className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded mr-1 shrink-0"
                title={`${markers.length} Treffer`}
              >
                {markers.length}
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="h-8 w-8 inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
                title="Suche leeren"
                aria-label="Suche leeren"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Such-Status: keine Treffer */}
      {!isPreview && cfg.search?.enabled && searchQuery && markers.length === 0 && (
        <div className="absolute top-14 left-3 z-[1000] bg-background/95 backdrop-blur rounded-md shadow-md border px-3 py-1.5 text-xs text-muted-foreground">
          Keine Treffer fuer <code className="text-foreground">{searchQuery}</code>
        </div>
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

        {/* FlyTo: wenn jemand im Kalender-Widget einen Termin auswaehlt */}
        <MapFlyTo target={flyTarget} />

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
              <PinPopupContent
                title={m.title}
                start={m.start}
                address={m.address}
                description={m.description}
                type={m.item.type}
              />
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
// PinPopupContent — strukturierter Pin-Popup-Inhalt
// ============================================================

const TYPE_LABEL: Record<string, string> = {
  place: "Werkstatt",
  event: "Event",
  offer: "Angebot",
  need: "Suche",
  quest: "Quest",
  profile: "Macher",
  appointment: "Termin",
}

function formatPopupDate(start: string): string {
  const d = new Date(start)
  if (Number.isNaN(d.getTime())) return start
  return d.toLocaleString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function PinPopupContent({
  title,
  start,
  address,
  description,
  type,
}: {
  title: string
  start?: string
  address?: string
  description?: string
  type: string
}) {
  const typeLabel = TYPE_LABEL[type] ?? type
  const shortDesc = description
    ? description.length > 120
      ? description.slice(0, 117) + "..."
      : description
    : undefined

  return (
    <div style={{ fontFamily: "Inter, sans-serif", minWidth: 200, maxWidth: 280 }}>
      <div style={{
        fontSize: "0.65rem",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "#E8751A",
        fontWeight: 600,
        margin: "0 0 4px",
      }}>
        {typeLabel}
      </div>
      <div style={{ fontWeight: 600, fontSize: "0.95rem", margin: 0, lineHeight: 1.3 }}>
        {title}
      </div>
      {start && (
        <div style={{
          fontSize: "0.75rem",
          color: "#1A1A1A",
          margin: "6px 0 0",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}>
          <span>📅</span>
          <span>{formatPopupDate(start)}</span>
        </div>
      )}
      {address && (
        <div style={{
          fontSize: "0.7rem",
          color: "#666",
          margin: "4px 0 0",
          display: "flex",
          alignItems: "flex-start",
          gap: "4px",
        }}>
          <span>📍</span>
          <span>{address}</span>
        </div>
      )}
      {shortDesc && (
        <p style={{
          fontSize: "0.75rem",
          color: "#444",
          margin: "8px 0 0",
          lineHeight: 1.45,
        }}>
          {shortDesc}
        </p>
      )}
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

// ============================================================
// MapFlyTo — fliegt zu einem Ziel und zoomt rein
// (muss innerhalb von <MapContainer> sitzen wegen useMap)
// ============================================================

function MapFlyTo({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 14, { animate: true, duration: 0.8 })
    }
  }, [target, map])
  return null
}
