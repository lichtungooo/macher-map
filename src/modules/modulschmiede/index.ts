import { Hammer } from "lucide-react"
import type { ModuleDefinition } from "../registry"
import { ModulschmiedeView } from "./ModulschmiedeView"

/**
 * Modulschmiede — Konfigurator-UI als Code-Modul.
 *
 * Hier baut man neue Daten-Module: Felder definieren, Layouts waehlen,
 * speichern. Gespeicherte Templates (Items vom Typ "module-template")
 * erscheinen automatisch als Tab im Space.
 *
 * Die Modulschmiede selbst ist ein Code-Modul, weil sie komplexer ist als
 * was sich per Schema ausdruecken laesst (Live-Preview, Drag-Drop, Editor).
 */
export const modulschmiedeModule: ModuleDefinition = {
  id: "modulschmiede",
  label: "Modulschmiede",
  icon: Hammer,
  View: ModulschmiedeView,
  itemTypes: ["module-template"],
  requiredCapabilities: ["ItemWriter"],
}

export { useModuleTemplates } from "./use-module-templates"
export { useAvailableModules, templateToModuleDefinition } from "./use-available-modules"
