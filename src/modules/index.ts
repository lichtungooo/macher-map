/**
 * Modul-System — zentrale Re-Exporte.
 *
 * Modul-Registrierung passiert direkt in `MacherApp.tsx` (deterministische
 * Reihenfolge, einfacher zu lesen). Diese Datei buendelt nur die Typen +
 * Helper damit Konsumenten nicht durch die Unterordner navigieren muessen.
 */

// Core
export * from "./registry"
export * from "./types"
export * from "./schema-types"

// Hooks + Helpers
export * from "./use-module-config"

// Renderer (oeffentliche API: SchemaModuleView, makeSchemaModuleView, ModuleSettingsButton)
export {
  SchemaModuleView,
  makeSchemaModuleView,
} from "./renderers/SchemaModuleView"
export { SchemaMapLayout, findLocationField } from "./renderers/SchemaMapLayout"
export { FieldRenderer, VisibilityBadge } from "./renderers/FieldRenderer"
export { ModuleSettingsButton, ModuleHeader } from "./renderers/ModuleSettingsButton"

// Modulschmiede-Hooks (fuer MacherApp + andere)
export {
  useModuleTemplates,
  useAvailableModules,
  templateToModuleDefinition,
} from "./modulschmiede"

// Module — Definitionen direkt aus Unterordnern, MacherApp registriert sie
export { mapModule } from "./map"
export type { MapModuleConfig } from "./map/MapView"
export { kanbanModule } from "./kanban"
export { marketplaceModule } from "./marketplace"
export { modulschmiedeModule } from "./modulschmiede"
