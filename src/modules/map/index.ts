/**
 * Karte — Code-Modul mit Leaflet.
 *
 * Volle Karte (fullWidth) mit Inline-Zahnrad fuer Admins:
 * Pin-Typen-Filter, Pin-Farben, Tile-Layer (OSM/Topo/Satellit),
 * optionaler Action-Button. Konfig in `group.data.moduleConfig.map`.
 */
import { MapPin } from "lucide-react"
import type { ModuleDefinition } from "../registry"
import { MapView, mapDefaultConfig, type MapModuleConfig } from "./MapView"

export const mapModule: ModuleDefinition<MapModuleConfig> = {
  id: "map",
  label: "Karte",
  icon: MapPin,
  View: MapView,
  defaultConfig: mapDefaultConfig,
  itemTypes: ["place", "event"],
  fullWidth: true,
}

export type { MapModuleConfig } from "./MapView"
