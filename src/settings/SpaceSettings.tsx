import { useState } from "react"
import {
  Settings as SettingsIcon,
  Home,
  Palette,
  Puzzle,
  Hammer,
  Users,
  Sparkles,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  Button,
  Label,
  Input,
  Textarea,
  useUpdateGroup,
} from "@real-life-stack/toolkit"
import type { Group } from "@real-life-stack/data-interface"
import { ThemeView } from "../modules/theme/ThemeView"
import { MembersView } from "../modules/members/MembersView"
import { DemoSection } from "../demo/DemoSection"

/**
 * SpaceSettings — Vollbild-Konfigurations-Dialog pro Space.
 *
 * Linke Sidebar: Tabs (Allgemein, Theme, Module, Modulschmiede, Mitglieder,
 * Demo-Daten, Erweitert). Rechter Content: Inhalt des aktiven Tabs.
 *
 * Phase A: Allgemein + Theme + Mitglieder + Demo. Module + Modulschmiede
 * folgen in Phase B.
 *
 * Geoeffnet wird der Dialog ueber den Settings-Knopf in der Navbar (Admin-
 * sichtbar) oder ueber Inline-Zahnraeder in den Modulen, die direkt zum
 * passenden Tab springen.
 */

export type SpaceSettingsTab =
  | "general"
  | "theme"
  | "modules"
  | "modulschmiede"
  | "members"
  | "demo"
  | "advanced"

export interface SpaceSettingsProps {
  open: boolean
  onClose: () => void
  spaceId: string | null
  activeGroup: Group | null
  /** Welcher Tab beim Oeffnen aktiv sein soll. Default: "general". */
  initialTab?: SpaceSettingsTab
}

interface TabDef {
  id: SpaceSettingsTab
  label: string
  icon: LucideIcon
  hint?: string
}

const TABS: TabDef[] = [
  { id: "general", label: "Allgemein", icon: Home, hint: "Name, Beschreibung" },
  { id: "theme", label: "Theme", icon: Palette, hint: "Farbwelt + Stimmung" },
  { id: "modules", label: "Module", icon: Puzzle, hint: "Was kann der Space" },
  { id: "modulschmiede", label: "Modulschmiede", icon: Hammer, hint: "Eigene Module bauen" },
  { id: "members", label: "Mitglieder", icon: Users, hint: "Rollen, Admins" },
  { id: "demo", label: "Demo-Daten", icon: Sparkles, hint: "Showroom-Inhalte" },
  { id: "advanced", label: "Erweitert", icon: Wrench, hint: "Reset, Export" },
]

export function SpaceSettings({
  open,
  onClose,
  spaceId,
  activeGroup,
  initialTab = "general",
}: SpaceSettingsProps) {
  const [activeTab, setActiveTab] = useState<SpaceSettingsTab>(initialTab)

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent
        className="max-w-none w-screen h-screen sm:w-[95vw] sm:h-[92vh] sm:max-w-6xl p-0 gap-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/30 shrink-0">
            <SettingsIcon className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm leading-tight">
                Space-Einstellungen
              </h2>
              <p className="text-[11px] text-muted-foreground truncate">
                {activeGroup?.name ?? "Kein Space gewaehlt"}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Body: Sidebar + Content */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Tab-Sidebar */}
            <nav className="w-44 sm:w-52 border-r bg-muted/20 overflow-y-auto shrink-0">
              <ul className="p-2 space-y-0.5">
                {TABS.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <li key={tab.id}>
                      <button
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium leading-tight">{tab.label}</div>
                          {tab.hint && (
                            <div className={`text-[10px] truncate ${
                              isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                            }`}>
                              {tab.hint}
                            </div>
                          )}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-background">
              {!activeGroup && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Bitte einen Space waehlen, um die Einstellungen zu oeffnen.
                </div>
              )}

              {activeGroup && (
                <div className="p-4 sm:p-6">
                  {activeTab === "general" && <GeneralTab group={activeGroup} />}
                  {activeTab === "theme" && (
                    <EmbeddedView>
                      <ThemeView
                        spaceId={spaceId}
                        activeGroup={activeGroup}
                        allGroups={[]}
                        config={undefined}
                      />
                    </EmbeddedView>
                  )}
                  {activeTab === "modules" && <ModulesPlaceholder />}
                  {activeTab === "modulschmiede" && <ModulschmiedePlaceholder />}
                  {activeTab === "members" && (
                    <EmbeddedView>
                      <MembersView
                        spaceId={spaceId}
                        activeGroup={activeGroup}
                        allGroups={[]}
                        config={undefined}
                      />
                    </EmbeddedView>
                  )}
                  {activeTab === "demo" && (
                    <div className="max-w-md mx-auto">
                      <DemoSection />
                    </div>
                  )}
                  {activeTab === "advanced" && <AdvancedPlaceholder />}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// EmbeddedView — Wrapper damit eingebettete Modul-Views
// nicht ihren eigenen Page-Container nochmal mitbringen
// ============================================================

function EmbeddedView({ children }: { children: React.ReactNode }) {
  return <div className="-m-4 sm:-m-6">{children}</div>
}

// ============================================================
// Tab: Allgemein
// ============================================================

function GeneralTab({ group }: { group: Group }) {
  const updateGroup = useUpdateGroup()
  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(
    typeof group.data?.description === "string" ? group.data.description : ""
  )
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateGroup(group.id, {
        name: name.trim() || group.name,
        data: { ...(group.data ?? {}), description: description.trim() },
      })
      setSavedAt(Date.now())
    } finally {
      setSaving(false)
    }
  }

  const dirty = name.trim() !== group.name ||
    description.trim() !== (typeof group.data?.description === "string" ? group.data.description : "")

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h3 className="text-base font-semibold mb-1">Allgemeine Angaben</h3>
        <p className="text-xs text-muted-foreground">
          Name und Beschreibung erscheinen im Workspace-Switcher und in
          Einladungen.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs">Name des Space</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Macher Berlin Mitte"
          />
        </div>

        <div>
          <Label className="text-xs">Beschreibung</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Worum geht es in diesem Space? Wer ist hier zuhause?"
            className="min-h-24"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t">
        {savedAt && !dirty && (
          <span className="text-[11px] text-muted-foreground">Gespeichert.</span>
        )}
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={!dirty || saving}
        >
          {saving ? "Speichere..." : "Speichern"}
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// Platzhalter — werden in Phase B/C gefuellt
// ============================================================

function ModulesPlaceholder() {
  return (
    <div className="max-w-2xl">
      <h3 className="text-base font-semibold mb-1">Module</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Schalte Module ein und aus. Pro aktivem Modul erscheint hier rechts ein
        Sub-Tab mit den Modul-eigenen Einstellungen (Karte: Pins/Layer/Suche,
        Kalender: Modus/Reminders, Marktplatz: Felder/Layouts).
      </p>
      <div className="border border-dashed rounded-md p-6 text-center text-sm text-muted-foreground">
        Module-Verwaltung kommt in der naechsten Phase.
      </div>
    </div>
  )
}

function ModulschmiedePlaceholder() {
  return (
    <div className="max-w-2xl">
      <h3 className="text-base font-semibold mb-1">Modulschmiede</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Eigene Daten-Module bauen — Felder definieren, Layouts waehlen,
        Aktionen verdrahten. Templates sind als Items im Space gespeichert.
      </p>
      <div className="border border-dashed rounded-md p-6 text-center text-sm text-muted-foreground">
        Modulschmiede-Embed folgt — bis dahin im Tab "Modulschmiede" oben.
      </div>
    </div>
  )
}

function AdvancedPlaceholder() {
  return (
    <div className="max-w-2xl">
      <h3 className="text-base font-semibold mb-1">Erweitert</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Space exportieren, zuruecksetzen, Connector-Quelle wechseln.
      </p>
      <div className="border border-dashed rounded-md p-6 text-center text-sm text-muted-foreground">
        Diese Werkzeuge folgen sobald der Rest steht.
      </div>
    </div>
  )
}
