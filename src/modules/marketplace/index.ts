import { ShoppingBag } from "lucide-react"
import type { ModuleDefinition } from "../registry"
import { makeSchemaModuleView } from "../renderers/SchemaModuleView"
import { marketplaceSchema } from "./marketplace-schema"

/**
 * Marktplatz-Modul — basiert auf Schema (siehe marketplace-schema.ts).
 *
 * Erstes Daten-Modul: kein eigener View-Code, der generische SchemaModuleView
 * uebernimmt das Rendering. Beweis dass das Modul-Schmiede-Pattern funktioniert.
 */
export const marketplaceModule: ModuleDefinition = {
  id: "marketplace",
  label: "Marktplatz",
  icon: ShoppingBag,
  View: makeSchemaModuleView(marketplaceSchema),
  itemTypes: [marketplaceSchema.itemType],
  requiredCapabilities: ["ItemWriter"],
}
