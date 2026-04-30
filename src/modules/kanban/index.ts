/**
 * Kanban (Tab-Label "Projekte") — Code-Modul fuer Task-Management.
 *
 * Items vom Typ "task" mit Status-Spalten. Drag-Drop, Filter, Edit-Panel
 * mit ContentComposer + Comments. Von Sebastian sauber gebaut.
 */
import { Columns3 } from "lucide-react"
import type { ModuleDefinition } from "../registry"
import { KanbanView, kanbanDefaultConfig, type KanbanModuleConfig } from "./KanbanView"

export const kanbanModule: ModuleDefinition<KanbanModuleConfig> = {
  id: "kanban",
  label: "Projekte",
  icon: Columns3,
  View: KanbanView,
  defaultConfig: kanbanDefaultConfig,
  itemTypes: ["task"],
  requiredCapabilities: ["ItemWriter"],
}

export type { KanbanModuleConfig } from "./KanbanView"
