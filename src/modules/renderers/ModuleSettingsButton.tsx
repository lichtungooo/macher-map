import { useState, type ReactNode } from "react"
import { Settings } from "lucide-react"
import { Button, AdaptivePanel } from "@real-life-stack/toolkit"

/**
 * ModuleSettingsButton — Zahnrad-Knopf der ein Side-Panel mit Modul-Einstellungen oeffnet.
 *
 * Nur fuer Admins sichtbar (Aufrufer steuert das ueber `visible`).
 *
 * Verwendung:
 *   <ModuleSettingsButton title="Karten-Einstellungen" visible={isAdmin}>
 *     <MapSettingsPanel ... />
 *   </ModuleSettingsButton>
 */

export interface ModuleSettingsButtonProps {
  title: string
  children: ReactNode
  visible?: boolean
  /** Position des Buttons (default: oben rechts ueber dem Modul-Inhalt). */
  position?: "inline" | "floating"
}

export function ModuleSettingsButton({
  title,
  children,
  visible = true,
  position = "inline",
}: ModuleSettingsButtonProps) {
  const [open, setOpen] = useState(false)

  if (!visible) return null

  const button = (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setOpen(true)}
      className="h-8 w-8"
      title="Modul konfigurieren"
      aria-label="Modul konfigurieren"
    >
      <Settings className="h-4 w-4" />
    </Button>
  )

  return (
    <>
      {position === "floating" ? (
        <div className="absolute top-3 right-3 z-[1000]">
          <div className="bg-background/90 backdrop-blur rounded-md shadow-sm border">{button}</div>
        </div>
      ) : (
        button
      )}

      <AdaptivePanel
        open={open}
        onClose={() => setOpen(false)}
        allowedModes={["sidebar", "drawer", "modal"]}
        sidebarWidth="380px"
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">{title}</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>
        </div>
      </AdaptivePanel>
    </>
  )
}

/**
 * ModuleHeader — Standard-Header fuer Module mit Titel + optionalem Settings-Zahnrad.
 *
 * Verwendet von Karte, Kanban, Marktplatz etc. damit das Pattern einheitlich ist.
 */
export interface ModuleHeaderProps {
  title?: string
  description?: string
  isAdmin?: boolean
  settingsTitle?: string
  settings?: ReactNode
  actions?: ReactNode
}

export function ModuleHeader({
  title,
  description,
  isAdmin,
  settingsTitle,
  settings,
  actions,
}: ModuleHeaderProps) {
  if (!title && !description && !actions && !settings) return null
  return (
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1 min-w-0">
        {title && <h2 className="text-lg font-semibold leading-tight">{title}</h2>}
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {actions}
        {settings && (
          <ModuleSettingsButton
            title={settingsTitle ?? `${title ?? "Modul"} konfigurieren`}
            visible={isAdmin}
          >
            {settings}
          </ModuleSettingsButton>
        )}
      </div>
    </div>
  )
}
