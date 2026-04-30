import { useState } from "react"
import { Check, Loader2, Palette } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  useUpdateGroup,
} from "@real-life-stack/toolkit"
import type { ModuleViewProps } from "../registry"
import { useIsSpaceAdmin } from "../use-module-config"
import { THEMES, DEFAULT_THEME_ID, getTheme } from "../../themes/themes"

/**
 * ThemeView — Theme-Picker pro Space.
 *
 * Live-Vorschau-Knopf mit Swatch + Label fuer jedes Theme. Klick auf ein
 * Theme: 1) zeigt eine Live-Preview an (Theme wird aufs Dokument geschrieben),
 * 2) Speichern-Knopf macht es persistent in `group.data.theme`.
 *
 * Nicht-Admins sehen die Liste, koennen aber nichts speichern.
 */
export function ThemeView({ spaceId, activeGroup }: ModuleViewProps) {
  const isAdmin = useIsSpaceAdmin(spaceId)
  const updateGroup = useUpdateGroup()
  const currentThemeId =
    (activeGroup?.data?.theme as string | undefined) ?? DEFAULT_THEME_ID

  const [previewId, setPreviewId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeId = previewId ?? currentThemeId

  const handlePreview = (id: string) => {
    setPreviewId(id)
    // Live-Vorschau direkt aufs Dokument
    const root = document.documentElement
    const theme = getTheme(id)
    if (id === DEFAULT_THEME_ID) {
      // Toolkit-Default: alle ueberschriebenen Variablen entfernen
      const props = [
        "--primary", "--primary-foreground",
        "--secondary", "--secondary-foreground",
        "--accent", "--accent-foreground",
        "--background", "--foreground",
        "--card", "--card-foreground",
        "--muted", "--muted-foreground",
        "--border", "--ring",
      ]
      props.forEach((p) => root.style.removeProperty(p))
      delete root.dataset.theme
    } else {
      root.style.setProperty("--primary", theme.vars.primary)
      root.style.setProperty("--primary-foreground", theme.vars.primaryForeground)
      root.style.setProperty("--secondary", theme.vars.secondary)
      root.style.setProperty("--secondary-foreground", theme.vars.secondaryForeground)
      root.style.setProperty("--accent", theme.vars.accent)
      root.style.setProperty("--accent-foreground", theme.vars.accentForeground)
      root.style.setProperty("--background", theme.vars.background)
      root.style.setProperty("--foreground", theme.vars.foreground)
      root.style.setProperty("--card", theme.vars.card)
      root.style.setProperty("--card-foreground", theme.vars.cardForeground)
      root.style.setProperty("--muted", theme.vars.muted)
      root.style.setProperty("--muted-foreground", theme.vars.mutedForeground)
      root.style.setProperty("--border", theme.vars.border)
      root.style.setProperty("--ring", theme.vars.ring)
      root.dataset.theme = id
    }
  }

  const handleSave = async () => {
    if (!activeGroup || !previewId) return
    setSaving(true)
    setError(null)
    try {
      await updateGroup(activeGroup.id, {
        data: { ...(activeGroup.data ?? {}), theme: previewId },
      })
      setPreviewId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setPreviewId(null)
    // Auf gespeichertes Theme zuruecksetzen (oder Default)
    handlePreview(currentThemeId)
  }

  if (!activeGroup) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Bitte einen Space waehlen, um das Theme anzupassen.
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme von {activeGroup.name}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Jeder Space traegt sein eigenes Universum. Klick ein Theme an, um es
            live zu testen — Knoepfe, Cards, Hintergrund passen sich sofort an.
            {isAdmin
              ? " Mit 'Speichern' wird es fuer alle Mitglieder uebernommen."
              : " Nur Admins koennen das Theme dauerhaft setzen."}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {THEMES.map((theme) => {
              const isActive = activeId === theme.id
              const isSaved = currentThemeId === theme.id
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handlePreview(theme.id)}
                  className={`relative p-3 rounded-lg border-2 text-left transition-all hover:scale-[1.02] ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className="h-7 w-7 rounded-full shadow-sm border"
                      style={{ background: theme.swatch }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {theme.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground italic truncate">
                        {theme.mood}
                      </div>
                    </div>
                    {isActive && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {theme.description}
                  </p>
                  {isSaved && !previewId && (
                    <span className="absolute top-2 right-2 text-[9px] uppercase font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      aktiv
                    </span>
                  )}
                  {previewId === theme.id && (
                    <span className="absolute top-2 right-2 text-[9px] uppercase font-semibold text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded">
                      Vorschau
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {error && (
            <div className="text-xs text-destructive bg-destructive/5 border border-destructive/30 rounded px-2 py-1.5">
              {error}
            </div>
          )}

          {previewId && (
            <div className="flex items-center gap-2 p-3 border-t border-dashed">
              <span className="text-xs text-muted-foreground flex-1">
                Vorschau aktiv. {isAdmin ? "Speichern uebernimmt es fuer alle Mitglieder." : "Nur Admins koennen speichern."}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={saving}
                className="text-xs"
              >
                Abbrechen
              </Button>
              {isAdmin && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="text-xs"
                >
                  {saving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                  Speichern
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-[11px] text-muted-foreground/70 px-2 leading-relaxed">
        💡 Themes setzen Akzentfarbe, Hintergrund und Card-Look. Pin-Farben auf
        der Karte und Kalender-Farben pro Item-Typ bleiben unabhaengig — die
        konfigurierst du in den jeweiligen Modul-Settings.
      </div>
    </div>
  )
}
