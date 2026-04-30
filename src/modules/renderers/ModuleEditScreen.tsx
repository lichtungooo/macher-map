import { useState, useCallback, type ReactNode } from "react"
import { X, Save, RotateCcw } from "lucide-react"
import { Button } from "@real-life-stack/toolkit"

/**
 * ModuleEditScreen — Vollbild-Split-Screen-Editor fuer Module.
 *
 * UX:
 *   ┌──────────────────────────────────────────────────┐
 *   │ Header: Modul-Name                          ⨯    │
 *   ├──────────────────────────┬───────────────────────┤
 *   │ Editor (links 40%)       │ Live-Preview (60%)    │
 *   │                          │                       │
 *   │ Tabs / Felder / etc.     │ Modul mit lokalem     │
 *   │                          │ State                 │
 *   ├──────────────────────────┴───────────────────────┤
 *   │ [Verwerfen]                          [Speichern] │
 *   └──────────────────────────────────────────────────┘
 *
 * Lokaler State (config-Draft) lebt im ModuleEditScreen. Editor schreibt rein,
 * Preview liest raus. Beim Speichern: onSave(draft). Beim Verwerfen oder X:
 * draft weg, persistierter State bleibt.
 */

export interface ModuleEditScreenProps<TConfig> {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  /** Initial-Config (was aktuell persistiert ist). */
  initialConfig: TConfig
  /** Speichert die finale Config. */
  onSave: (config: TConfig) => Promise<void>
  /** Editor-UI links. Bekommt aktuelle Draft-Config + Setter. */
  renderEditor: (config: TConfig, setConfig: (next: TConfig) => void) => ReactNode
  /** Live-Preview rechts. Bekommt aktuelle Draft-Config. */
  renderPreview: (config: TConfig) => ReactNode
}

export function ModuleEditScreen<TConfig>({
  open,
  onClose,
  title,
  description,
  initialConfig,
  onSave,
  renderEditor,
  renderPreview,
}: ModuleEditScreenProps<TConfig>) {
  const [draft, setDraft] = useState<TConfig>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  // Re-init wenn der Editor frisch geoeffnet wird
  const handleOpen = useCallback(() => {
    setDraft(initialConfig)
    setDirty(false)
  }, [initialConfig])

  // Sicherstellen dass beim Oeffnen mit aktueller initialConfig gestartet wird
  if (!open) return null

  const handleEditorChange = (next: TConfig) => {
    setDraft(next)
    setDirty(true)
  }

  const handleReset = () => {
    setDraft(initialConfig)
    setDirty(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(draft)
      setDirty(false)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (dirty) {
      const ok = window.confirm("Aenderungen verwerfen?")
      if (!ok) return
    }
    handleOpen()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[1100] bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="min-w-0">
          <h2 className="font-semibold text-base truncate">{title}</h2>
          {description && (
            <p className="text-xs text-muted-foreground truncate">{description}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Schliessen">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Split-Screen */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Editor */}
        <div className="md:w-2/5 lg:w-1/3 border-r overflow-y-auto bg-muted/20">
          <div className="p-4">
            {renderEditor(draft, handleEditorChange)}
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-hidden bg-background relative">
          <div className="absolute top-2 right-3 z-10 text-[10px] uppercase tracking-wider text-muted-foreground/60 bg-background/80 backdrop-blur px-2 py-0.5 rounded">
            Live-Vorschau
          </div>
          <div className="h-full overflow-auto">
            {renderPreview(draft)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={!dirty || saving}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Zuruecksetzen
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={saving}>
            Abbrechen
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? "Speichern..." : "Speichern"}
          </Button>
        </div>
      </div>
    </div>
  )
}
