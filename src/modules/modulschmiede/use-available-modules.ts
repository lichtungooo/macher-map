import { useMemo } from "react"
import { Box } from "lucide-react"
import { getModulesByIds } from "../registry"
import type { ModuleDefinition } from "../registry"
import { makeSchemaModuleView } from "../renderers/SchemaModuleView"
import { useModuleTemplates } from "./use-module-templates"
import type { ModuleSchema } from "../schema-types"
import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"

/**
 * Konvertiert ein Schema in eine ModuleDefinition fuer die Tab-Leiste.
 * Nutzt `makeSchemaModuleView` als View — der generische Renderer.
 */
export function templateToModuleDefinition(schema: ModuleSchema): ModuleDefinition {
  // Lucide-Icon per Name aufloesen, sonst Box als Fallback
  const icon: LucideIcon =
    (schema.icon && (LucideIcons as unknown as Record<string, LucideIcon>)[schema.icon]) ?? Box

  return {
    id: schema.id,
    label: schema.label,
    icon,
    View: makeSchemaModuleView(schema),
    itemTypes: [schema.itemType],
    requiredCapabilities: schema.requiredCapabilities,
  }
}

/**
 * Hook: liefert alle verfuegbaren Module fuer einen Space.
 *
 * Quellen:
 *   1. Code-Module aus der ModuleRegistry (Karte, Kanban, Marktplatz, Modulschmiede)
 *   2. Daten-Module aus dem WoT-Doc (Items vom Typ "module-template")
 *
 * Daten-Module ueberschreiben Code-Module mit gleicher ID — so kann ein
 * Template ein Code-Modul "ueberschreiben" (z.B. eigene Marktplatz-Variante).
 */
export function useAvailableModules(moduleIds: string[]): ModuleDefinition[] {
  const { templates } = useModuleTemplates()

  const codeModules = useMemo(
    () => getModulesByIds(moduleIds),
    [moduleIds.join(",")]
  )

  const templateModules = useMemo(
    () =>
      templates
        .filter((t) => moduleIds.includes(t.schema.id))
        .map((t) => templateToModuleDefinition(t.schema)),
    [templates, moduleIds.join(",")]
  )

  return useMemo(() => {
    // Templates ueberschreiben Code-Module mit gleicher ID
    const map = new Map<string, ModuleDefinition>()
    for (const m of codeModules) map.set(m.id, m)
    for (const m of templateModules) map.set(m.id, m)
    // Reihenfolge wie in moduleIds beibehalten
    return moduleIds.map((id) => map.get(id)).filter((m): m is ModuleDefinition => Boolean(m))
  }, [codeModules, templateModules, moduleIds.join(",")])
}
