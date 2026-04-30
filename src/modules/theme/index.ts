/**
 * Theme — Code-Modul fuer Space-Theming.
 *
 * Pro Space waehlbares Theme aus 5 vordefinierten Welten. Schreibt
 * `group.data.theme` und schiebt die CSS-Variablen via useSpaceTheme
 * aufs documentElement.
 */
import { Palette } from "lucide-react"
import type { ModuleDefinition } from "../registry"
import { ThemeView } from "./ThemeView"

export const themeModule: ModuleDefinition = {
  id: "theme",
  label: "Theme",
  icon: Palette,
  View: ThemeView,
  itemTypes: [],
  requiredCapabilities: ["GroupManager"],
}
