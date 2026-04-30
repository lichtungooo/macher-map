/**
 * Theme-System fuer Spaces.
 *
 * Jedes Theme ist ein Satz CSS-Variablen, die zur Laufzeit auf das
 * `document.documentElement` geschrieben werden — sie ueberschreiben die
 * Tailwind-:root-Defaults aus dem Toolkit-globals.css.
 *
 * Persistenz: `group.data.theme = "<theme-id>"`. Default: "macher-orange".
 */

export interface ThemeVars {
  /** Primaere Akzentfarbe (Buttons, Pins, Links) — als OKLCH oder Hex */
  primary: string
  /** Schrift auf dem Primaer-Hintergrund */
  primaryForeground: string
  /** Sekundaere Akzentfarbe */
  secondary: string
  secondaryForeground: string
  /** Akzent-Hintergrund (Hover-Felder, Highlight-Boxen) */
  accent: string
  accentForeground: string
  /** Page-Background */
  background: string
  /** Schrift-Default */
  foreground: string
  /** Card-Background (gleich oder anders als Page) */
  card: string
  cardForeground: string
  /** Muted Bereiche (Sidebar, Tabs) */
  muted: string
  mutedForeground: string
  /** Border-Farbe */
  border: string
  /** Ring (Focus-Outline) */
  ring: string
}

export interface ThemeDefinition {
  id: string
  label: string
  description: string
  /** Stimmung in einem Satz fuer den Picker */
  mood: string
  /** Einer der praegenden Farbtoene als Hex — fuer den Preset-Knopf */
  swatch: string
  vars: ThemeVars
}

/**
 * Theme-Library — 5 vordefinierte Welten.
 * Werte als OKLCH (wahrnehmungsgleichmaessig) oder Hex.
 */
export const THEMES: ThemeDefinition[] = [
  {
    id: "macher-orange",
    label: "Macher-Orange",
    description: "Werkstatt, Werkbank, Funken — die Heimat-Farbe der Macher-Map.",
    mood: "Erdig, kraftvoll, gamifiziert.",
    swatch: "#E8751A",
    vars: {
      primary: "oklch(0.63 0.16 55)",
      primaryForeground: "oklch(1.00 0 0)",
      secondary: "oklch(0.55 0.21 264)",
      secondaryForeground: "oklch(1.00 0 0)",
      accent: "oklch(0.95 0.03 55)",
      accentForeground: "oklch(0.63 0.16 55)",
      background: "oklch(1.00 0 0)",
      foreground: "oklch(0.28 0.02 265)",
      card: "oklch(1.00 0 0)",
      cardForeground: "oklch(0.28 0.02 265)",
      muted: "oklch(0.98 0.00 247)",
      mutedForeground: "oklch(0.45 0.02 265)",
      border: "oklch(0.90 0.01 247)",
      ring: "oklch(0.63 0.16 55)",
    },
  },
  {
    id: "lichtung-gold",
    label: "Lichtung-Gold",
    description: "Licht, Frieden, Verbindungskunst — fuer sanfte, atmende Spaces.",
    mood: "Warm, weich, leuchtend.",
    swatch: "#D4AF37",
    vars: {
      primary: "oklch(0.78 0.13 85)",
      primaryForeground: "oklch(0.20 0.02 85)",
      secondary: "oklch(0.55 0.10 35)",
      secondaryForeground: "oklch(1.00 0 0)",
      accent: "oklch(0.96 0.04 85)",
      accentForeground: "oklch(0.50 0.13 85)",
      background: "oklch(0.99 0.005 85)",
      foreground: "oklch(0.25 0.02 85)",
      card: "oklch(1.00 0 0)",
      cardForeground: "oklch(0.25 0.02 85)",
      muted: "oklch(0.97 0.01 85)",
      mutedForeground: "oklch(0.45 0.02 85)",
      border: "oklch(0.90 0.02 85)",
      ring: "oklch(0.78 0.13 85)",
    },
  },
  {
    id: "marine",
    label: "Marine",
    description: "Tiefe, Ruhe, Klarheit — fuer Spaces mit Fokus auf Wissen und Reflexion.",
    mood: "Klar, kuehl, weit.",
    swatch: "#1E5F8E",
    vars: {
      primary: "oklch(0.55 0.13 235)",
      primaryForeground: "oklch(1.00 0 0)",
      secondary: "oklch(0.70 0.10 200)",
      secondaryForeground: "oklch(0.20 0.05 235)",
      accent: "oklch(0.95 0.03 235)",
      accentForeground: "oklch(0.45 0.13 235)",
      background: "oklch(0.99 0.005 235)",
      foreground: "oklch(0.25 0.03 235)",
      card: "oklch(1.00 0 0)",
      cardForeground: "oklch(0.25 0.03 235)",
      muted: "oklch(0.97 0.01 235)",
      mutedForeground: "oklch(0.45 0.03 235)",
      border: "oklch(0.90 0.02 235)",
      ring: "oklch(0.55 0.13 235)",
    },
  },
  {
    id: "wald",
    label: "Wald",
    description: "Erde, Wachstum, Wurzeln — fuer Garten-, Land- und Naturspaces.",
    mood: "Erdig, lebendig, gruen.",
    swatch: "#3B7A45",
    vars: {
      primary: "oklch(0.55 0.13 145)",
      primaryForeground: "oklch(1.00 0 0)",
      secondary: "oklch(0.45 0.10 65)",
      secondaryForeground: "oklch(1.00 0 0)",
      accent: "oklch(0.95 0.04 145)",
      accentForeground: "oklch(0.45 0.13 145)",
      background: "oklch(0.99 0.005 145)",
      foreground: "oklch(0.25 0.02 145)",
      card: "oklch(1.00 0 0)",
      cardForeground: "oklch(0.25 0.02 145)",
      muted: "oklch(0.97 0.01 145)",
      mutedForeground: "oklch(0.45 0.02 145)",
      border: "oklch(0.90 0.02 145)",
      ring: "oklch(0.55 0.13 145)",
    },
  },
  {
    id: "nacht",
    label: "Nacht",
    description: "Dunkelmodus mit Sternen — fuer Spaces, die in der Dunkelheit leuchten.",
    mood: "Tief, geheimnisvoll, kontrastreich.",
    swatch: "#0F172A",
    vars: {
      primary: "oklch(0.75 0.18 60)",
      primaryForeground: "oklch(0.15 0.02 265)",
      secondary: "oklch(0.50 0.18 264)",
      secondaryForeground: "oklch(1.00 0 0)",
      accent: "oklch(0.30 0.05 60)",
      accentForeground: "oklch(0.85 0.13 60)",
      background: "oklch(0.18 0.02 265)",
      foreground: "oklch(0.95 0.01 265)",
      card: "oklch(0.22 0.02 265)",
      cardForeground: "oklch(0.95 0.01 265)",
      muted: "oklch(0.25 0.02 265)",
      mutedForeground: "oklch(0.65 0.02 265)",
      border: "oklch(0.30 0.02 265)",
      ring: "oklch(0.75 0.18 60)",
    },
  },
]

export const DEFAULT_THEME_ID = "macher-orange"

export function getTheme(id: string | null | undefined): ThemeDefinition {
  if (!id) return THEMES[0]
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}
