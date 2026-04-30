import { useEffect } from "react"
import type { Group } from "@real-life-stack/data-interface"
import { DEFAULT_THEME_ID, getTheme, type ThemeDefinition, type ThemeVars } from "./themes"

/**
 * Mapping ThemeVars → CSS-Variable-Name (Toolkit-Konvention).
 */
const VAR_MAP: Record<keyof ThemeVars, string> = {
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  background: "--background",
  foreground: "--foreground",
  card: "--card",
  cardForeground: "--card-foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  border: "--border",
  ring: "--ring",
}

/** Schreibt die Theme-Variablen direkt aufs documentElement. */
function applyTheme(theme: ThemeDefinition) {
  const root = document.documentElement
  for (const [key, cssVar] of Object.entries(VAR_MAP) as Array<[keyof ThemeVars, string]>) {
    root.style.setProperty(cssVar, theme.vars[key])
  }
  root.dataset.theme = theme.id
}

/** Setzt die Variablen wieder auf die Toolkit-Defaults zuruck. */
function resetTheme() {
  const root = document.documentElement
  for (const cssVar of Object.values(VAR_MAP)) {
    root.style.removeProperty(cssVar)
  }
  delete root.dataset.theme
}

/**
 * Liest `group.data.theme` und legt das passende Theme aufs Document.
 * Bei Space-Wechsel wird das Theme automatisch geupdatet.
 *
 * Wenn kein Group/Space aktiv ist, bleibt das Default-Theme (Macher-Orange)
 * stehen — Toolkit-Globals.css setzt die Variablen ja schon im :root.
 */
export function useSpaceTheme(group: Group | null) {
  const themeId =
    (group?.data?.theme as string | undefined) ?? DEFAULT_THEME_ID

  useEffect(() => {
    if (themeId === DEFAULT_THEME_ID) {
      resetTheme()
      return
    }
    const theme = getTheme(themeId)
    applyTheme(theme)
    return () => {
      // Beim Wechsel oder Unmount: Variablen entfernen, damit der naechste
      // Effect mit sauberem Slate startet.
      resetTheme()
    }
  }, [themeId])
}
