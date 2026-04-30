/**
 * Modul-Schema-Format
 *
 * Ein Schema beschreibt ein Daten-Modul vollstaendig: welche Felder es hat,
 * welche Layouts (List/Cards/Map/Calendar/...), welche Aktionen, welche Filter.
 *
 * Schema lebt als JSON in einem Item (`type: "module-template"`) im WoT-Doc.
 * Generische Renderer interpretieren das Schema → UI.
 *
 * Siehe MODULSCHMIEDE.md fuer die Gesamt-Vision.
 */

import type { ModuleFieldConfig } from "./types"

// ============================================================
// Schema (Vollstaendige Modul-Definition als Daten)
// ============================================================

export interface ModuleSchema {
  // --- Identitaet ---
  /** Eindeutige ID (URL-Slug, Konfig-Key). */
  id: string
  /** Anzeige-Label im Tab/Switcher. */
  label: string
  /** Kurzbeschreibung — fuer Marktplatz, Tooltip. */
  description?: string
  /** Lucide-Icon-Name (z.B. "ShoppingBag", "Trees", "Calendar"). */
  icon?: string

  // --- Daten ---
  /** Item-Typ den dieses Modul verwaltet (z.B. "offer", "achievement"). */
  itemType: string
  /** Felder im Item.data — auch fuer Form-Renderer. */
  fields: ModuleFieldConfig[]

  // --- Sichten ---
  /** Verfuegbare Layouts fuer diese Items. */
  layouts: LayoutDefinition[]
  /** Default-Layout-ID. */
  defaultLayout?: string

  // --- Aktionen ---
  actions: ActionDefinition[]

  // --- Filter & Sortierung ---
  filters?: FilterDefinition[]
  sortOptions?: SortOption[]
  defaultSort?: string

  // --- Schnittstellen zu anderen Modulen ---
  /**
   * Welche Item-Typen aus anderen Modulen interessieren dieses Modul?
   * (z.B. ein Quest-Modul will auch event-Items im Kalender-Layout sehen.)
   */
  alsoShowItemTypes?: string[]

  /**
   * Aktion-Hooks die andere Module triggern koennen.
   * (z.B. "marketplace.bought" → Gamification gibt XP)
   */
  publishesEvents?: string[]
  subscribesToEvents?: string[]

  // --- Capabilities ---
  /** Welche Connector-Capabilities werden gebraucht? */
  requiredCapabilities?: ("ItemWriter" | "GroupManager" | "ProfileCapable" | "SignedClaimCapable" | "MessagingCapable")[]

  // --- Theme ---
  /** Optional: Default-Theme fuer dieses Modul (kann vom Space-Theme uebersteuert werden). */
  theme?: ModuleThemeConfig

  // --- Meta ---
  /** Schema-Version fuer Migration. */
  version?: string
  /** Author-DID (wer hat das Schema erstellt). */
  author?: string
  /** Forked-From: Original-Schema-ID falls Fork. */
  forkedFrom?: string
  /** Tags fuer Marktplatz-Discovery. */
  tags?: string[]
  /** Lizenz-Hinweis. */
  license?: "MIT" | "CC-BY" | "premium"
}

// ============================================================
// Layout-Definitionen
// ============================================================

export type LayoutType =
  | "list"
  | "cards"
  | "board"
  | "map"
  | "calendar"
  | "tree"
  | "form"
  | "detail"

export interface LayoutDefinition {
  /** ID — wird im URL-Param genutzt (`?layout=cards`). */
  id: string
  /** Renderer-Typ. */
  type: LayoutType
  /** Anzeige-Label. */
  label: string
  /** Lucide-Icon. */
  icon?: string
  /** Layout-spezifische Konfig. */
  config?: LayoutConfig
}

export type LayoutConfig =
  | ListLayoutConfig
  | CardsLayoutConfig
  | BoardLayoutConfig
  | MapLayoutConfig
  | CalendarLayoutConfig
  | TreeLayoutConfig

export interface ListLayoutConfig {
  /** Welche Felder als Spalten zeigen. */
  columns?: string[]
  /** Welches Feld ist die Primary-Anzeige? */
  primaryField?: string
  /** Welches Feld ist Subtitle? */
  subtitleField?: string
}

export interface CardsLayoutConfig {
  /** Welches Feld ist Bild? */
  imageField?: string
  /** Welches Feld ist Titel? */
  titleField?: string
  /** Welches Feld ist Beschreibung? */
  descriptionField?: string
  /** Welche Felder als Tags/Badges anzeigen? */
  badgeFields?: string[]
  /** Cards pro Zeile (responsive). */
  columns?: { sm?: number; md?: number; lg?: number }
}

export interface BoardLayoutConfig {
  /** Welches Feld ist die Status-Spalte? */
  statusField: string
  /** Spaltennamen. */
  columns: { id: string; label: string; color?: string }[]
}

export interface MapLayoutConfig {
  /** Welches Feld enthaelt {lat, lng}? */
  locationField: string
  /** Welches Feld ist Pin-Titel? */
  titleField?: string
  /** Pin-Farbe — entweder fest oder per Field-Mapping. */
  pinColor?: string | { field: string; map: Record<string, string> }
  /** Default-Center fallback. */
  defaultCenter?: [number, number]
  /** Default-Zoom fallback. */
  defaultZoom?: number
}

export interface CalendarLayoutConfig {
  /** Welches Feld ist Start-Datum? */
  startField: string
  /** Welches Feld ist End-Datum (optional). */
  endField?: string
  /** Welches Feld ist Titel? */
  titleField?: string
  /** Default-View. */
  defaultView?: "month" | "week" | "day" | "agenda"
}

export interface TreeLayoutConfig {
  /** Welches Feld zeigt auf das Parent-Item? */
  parentField: string
  /** Welches Feld ist Label? */
  labelField?: string
}

// ============================================================
// Aktionen
// ============================================================

export interface ActionDefinition {
  id: string
  label: string
  /** Lucide-Icon. */
  icon?: string
  /** Action-Typ. */
  type: ActionType
  /** Wo wird die Aktion angezeigt? */
  placement: ActionPlacement[]
  /** Bedingung (Conditional-Action). */
  when?: ActionCondition
  /** Konfig je nach Action-Type. */
  config?: ActionConfig
}

export type ActionType =
  | "create"      // Neues Item anlegen
  | "edit"        // Item bearbeiten
  | "delete"      // Item loeschen
  | "duplicate"   // Item kopieren
  | "field-update" // Feld eines Items aendern (z.B. Status -> "done")
  | "publish-event" // Event triggern (z.B. fuer Gamification-XP)
  | "navigate"    // Zu anderem Modul/Detail navigieren
  | "external"    // External Link

export type ActionPlacement =
  | "toolbar"     // Oben in der Toolbar (haupt-Aktion)
  | "card"        // Auf jedem Card/Item
  | "detail"      // In der Detail-View
  | "context"     // Im Rechtsklick-Menue

export interface ActionCondition {
  /** Modul-Aktion nur fuer Owner. */
  ownerOnly?: boolean
  /** Modul-Aktion nur fuer Admin/Member. */
  role?: "admin" | "member"
  /** Field-Wert muss matchen. */
  fieldEquals?: { field: string; value: unknown }
}

export type ActionConfig =
  | { type: "field-update"; field: string; newValue: unknown }
  | { type: "publish-event"; eventName: string; payload?: Record<string, unknown> }
  | { type: "navigate"; toModule: string; itemId?: "$current" }
  | { type: "external"; urlTemplate: string }

// ============================================================
// Filter & Sortierung
// ============================================================

export interface FilterDefinition {
  /** Feld-ID auf das gefiltert wird. */
  fieldId: string
  /** Wie wird gefiltert? */
  type: "search" | "select" | "multi-select" | "tags" | "range" | "date-range" | "owner" | "boolean"
  /** Anzeige-Label im Filter-Bar. */
  label?: string
}

export interface SortOption {
  /** ID (z.B. "newest", "alphabetical", "price-asc"). */
  id: string
  label: string
  /** Field zum sortieren. */
  fieldId: string
  /** Richtung. */
  direction: "asc" | "desc"
}

// ============================================================
// Theme
// ============================================================

export interface ModuleThemeConfig {
  colors?: {
    primary?: string
    secondary?: string
    accent?: string
    background?: string
    foreground?: string
  }
  fonts?: {
    display?: string
    body?: string
  }
  borderRadius?: "none" | "small" | "medium" | "large" | "full"
  iconStyle?: "lucide" | "custom"
  customIconSet?: Record<string, string>
  backgroundImage?: string
  logo?: string
}

// ============================================================
// Helpers
// ============================================================

/** Vereinheitlicht ein Schema mit Defaults. */
export function withSchemaDefaults(schema: ModuleSchema): ModuleSchema {
  return {
    ...schema,
    layouts: schema.layouts.length > 0 ? schema.layouts : [{ id: "list", type: "list", label: "Liste" }],
    defaultLayout: schema.defaultLayout ?? schema.layouts[0]?.id ?? "list",
    actions: schema.actions ?? [],
    filters: schema.filters ?? [],
    sortOptions: schema.sortOptions ?? [],
  }
}
