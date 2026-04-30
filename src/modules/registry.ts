/**
 * Modul-Registry
 *
 * Jedes Modul registriert sich hier mit Metadaten + Komponenten.
 * MacherApp rendert dynamisch ueber `getModule(id)`, MacherApp kennt
 * die einzelnen Module nicht im Detail.
 *
 * Ein Modul liefert:
 *   - View         — Vollbild-Inhalt (Tab-Content im AppShell)
 *   - Widget       — Kompakt-Variante (einbettbar in andere Module / Profil)
 *   - ConfigEditor — UI fuer Space-Admins (spaeter)
 *   - defaultConfig + itemTypes
 */

import type { ComponentType } from "react"
import type { LucideIcon } from "lucide-react"
import type { Group } from "@real-life-stack/data-interface"

// ============================================================
// Props die jedes Modul bekommt
// ============================================================

/** Props fuer den Vollbild-View eines Moduls (Tab-Inhalt). */
export interface ModuleViewProps<TConfig = unknown> {
  /** Aktiver Space (null = Overview/alle Spaces). */
  spaceId: string | null
  /** Aktiver Space als Group-Item (null bei Overview). */
  activeGroup: Group | null
  /** Alle Groups die der User sehen kann (fuer Modul-Cross-View, z.B. Karte zeigt alle Spaces). */
  allGroups: Group[]
  /** Modul-Konfiguration aus `activeGroup.data.moduleConfig[<id>]` (oder Default). */
  config: TConfig
  /**
   * Optional: Item-ID aus URL (Deep-Link in einen Item-Detail-View).
   * MacherApp uebergibt das z.B. fuer Kanban-Item-Edit.
   */
  itemId?: string
  /** Item-Detail oeffnen — Modul kann das in MacherApp pushen. */
  onItemSelect?: (id: string) => void
  /** Item-Detail schliessen. */
  onItemClose?: () => void
  /**
   * Oeffnet das Vollbild-Space-Settings. Optional mit einem Tab + Modul-ID,
   * sodass z.B. das Inline-Zahnrad auf der Karte direkt zur Karten-Konfig
   * springt.
   */
  onOpenSettings?: (tab?: string, moduleId?: string) => void
}

/** Props fuer Widget-Variante (kompakt, eingebettet). */
export interface ModuleWidgetProps<TConfig = unknown> {
  spaceId: string | null
  config: TConfig
  /** Optionale Filter (z.B. "nur Items von User X"). */
  filter?: Record<string, unknown>
  /** Klick auf das Widget → fuehrt in den Vollbild-View. */
  onOpen?: () => void
}

// ============================================================
// Modul-Definition
// ============================================================

export interface ModuleDefinition<TConfig = unknown> {
  /** Eindeutige ID (URL-Slug, Konfig-Key). */
  id: string
  /** Anzeige-Label im Tab/Switcher. */
  label: string
  /** Icon im Tab/Switcher. */
  icon: LucideIcon
  /** Vollbild-View (Tab-Inhalt). */
  View: ComponentType<ModuleViewProps<TConfig>>
  /** Optional: Widget-Variante. */
  Widget?: ComponentType<ModuleWidgetProps<TConfig>>
  /** Optional: Konfig-Editor fuer Space-Admins. */
  ConfigEditor?: ComponentType<{ config: TConfig; onChange: (next: TConfig) => void }>
  /** Default-Konfig wenn der Space keine eigene hat. */
  defaultConfig?: TConfig
  /** Welche Item-Typen nutzt dieses Modul? (Cross-Modul-Schnittstelle, Doku) */
  itemTypes?: string[]
  /** Welche Capabilities werden gebraucht? (Doku, ggf. fuer Disable-Logic) */
  requiredCapabilities?: string[]
  /** In welchen URL-Layouts darf das Modul rendern? Default: voller AppShell-Container. */
  fullWidth?: boolean
}

// ============================================================
// Registry
// ============================================================

const registry = new Map<string, ModuleDefinition<any>>()

export function registerModule(mod: ModuleDefinition<any>): void {
  if (registry.has(mod.id)) {
    console.warn(`[modules] Modul ${mod.id} ist bereits registriert — wird ueberschrieben`)
  }
  registry.set(mod.id, mod)
}

export function getModule(id: string): ModuleDefinition<any> | undefined {
  return registry.get(id)
}

export function getAllModules(): ModuleDefinition<any>[] {
  return Array.from(registry.values())
}

/** Liefert nur die Module aus einer ID-Liste, in deren Reihenfolge. Unbekannte werden gefiltert. */
export function getModulesByIds(ids: string[]): ModuleDefinition<any>[] {
  return ids.map((id) => registry.get(id)).filter((m): m is ModuleDefinition<any> => Boolean(m))
}

/** Modul-Konfig aus group.data.moduleConfig[id] holen, sonst Default, sonst undefined. */
export function getModuleConfig<T = unknown>(
  group: Group | null,
  moduleId: string,
  defaultConfig?: T
): T | undefined {
  const moduleConfigs = group?.data?.moduleConfig as Record<string, unknown> | undefined
  const fromGroup = moduleConfigs?.[moduleId] as T | undefined
  return fromGroup ?? defaultConfig
}
