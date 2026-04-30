import { useMemo, useState } from "react"
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
  PanelRightOpen,
  PanelRightClose,
  Heart,
  Star,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  Button,
  Label,
  Input,
  Textarea,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useUpdateGroup,
} from "@real-life-stack/toolkit"
import type { Group } from "@real-life-stack/data-interface"
import { ThemeView } from "../modules/theme/ThemeView"
import { MembersView } from "../modules/members/MembersView"
import { DemoSection } from "../demo/DemoSection"
import { getAllModules } from "../modules/registry"

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
  const [previewVisible, setPreviewVisible] = useState(true)

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
              onClick={() => setPreviewVisible((v) => !v)}
              className="h-8 w-8 hidden md:inline-flex"
              title={previewVisible ? "Vorschau ausblenden" : "Vorschau einblenden"}
              aria-label="Vorschau umschalten"
            >
              {previewVisible ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRightOpen className="h-4 w-4" />
              )}
            </Button>
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
            <div className="flex-1 bg-background min-w-0">
              {!activeGroup && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Bitte einen Space waehlen, um die Einstellungen zu oeffnen.
                </div>
              )}

              {activeGroup && (
                <SplitContent
                  previewVisible={previewVisible}
                  hasPreview={tabHasPreview(activeTab)}
                  editor={renderEditor(activeTab, spaceId, activeGroup)}
                  preview={renderPreview(activeTab, activeGroup)}
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// SplitContent — Layout fuer Editor + optionale Live-Vorschau
// ============================================================

function SplitContent({
  previewVisible,
  hasPreview,
  editor,
  preview,
}: {
  previewVisible: boolean
  hasPreview: boolean
  editor: React.ReactNode
  preview: React.ReactNode
}) {
  const showPreview = previewVisible && hasPreview
  return (
    <div className="flex h-full">
      <div className={`overflow-y-auto ${showPreview ? "flex-1 lg:w-1/2" : "w-full"}`}>
        <div className="p-4 sm:p-6">{editor}</div>
      </div>
      {showPreview && (
        <div className="hidden lg:flex flex-1 lg:w-1/2 border-l bg-muted/10 overflow-y-auto">
          <div className="w-full p-4 sm:p-6">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-3 tracking-wider">
              Live-Vorschau
            </div>
            {preview}
          </div>
        </div>
      )}
    </div>
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
// Tab-Renderer
// ============================================================

function tabHasPreview(tab: SpaceSettingsTab): boolean {
  // Nur Tabs mit sinnvoller Live-Vorschau melden true. Phase B (Module-Tab)
  // schaltet sein Preview spaeter anhand des aktiven Sub-Moduls ein.
  return tab === "theme" || tab === "general"
}

function renderEditor(
  tab: SpaceSettingsTab,
  spaceId: string | null,
  activeGroup: Group
): React.ReactNode {
  switch (tab) {
    case "general":
      return <GeneralTab group={activeGroup} />
    case "theme":
      return (
        <EmbeddedView>
          <ThemeView
            spaceId={spaceId}
            activeGroup={activeGroup}
            allGroups={[]}
            config={undefined}
          />
        </EmbeddedView>
      )
    case "modules":
      return <ModulesTab group={activeGroup} />
    case "modulschmiede":
      return <ModulschmiedePlaceholder />
    case "members":
      return (
        <EmbeddedView>
          <MembersView
            spaceId={spaceId}
            activeGroup={activeGroup}
            allGroups={[]}
            config={undefined}
          />
        </EmbeddedView>
      )
    case "demo":
      return (
        <div className="max-w-md mx-auto">
          <DemoSection />
        </div>
      )
    case "advanced":
      return <AdvancedPlaceholder />
  }
}

function renderPreview(tab: SpaceSettingsTab, activeGroup: Group): React.ReactNode {
  switch (tab) {
    case "theme":
      return <ThemePreview groupName={activeGroup.name} />
    case "general":
      return <GeneralPreview groupName={activeGroup.name} description={typeof activeGroup.data?.description === "string" ? activeGroup.data.description : ""} />
    default:
      return null
  }
}

// ============================================================
// Vorschauen
// ============================================================

function ThemePreview({ groupName }: { groupName: string }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{groupName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            So sehen Karten und Buttons in deinem Space aus. Klick auf ein
            Theme links — die Vorschau wechselt sofort mit.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm">Werkstatt eintragen</Button>
            <Button size="sm" variant="outline">Mehr erfahren</Button>
            <Button size="sm" variant="ghost">Abbrechen</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-3">
          <Heart className="h-4 w-4 text-primary mb-1.5" />
          <div className="text-xs font-semibold mb-0.5">Akzent-Box</div>
          <div className="text-[10px] text-muted-foreground">Primary-Farbe</div>
        </div>
        <div className="rounded-lg border bg-card p-3 shadow-sm">
          <Star className="h-4 w-4 text-secondary mb-1.5" />
          <div className="text-xs font-semibold mb-0.5">Card-Beispiel</div>
          <div className="text-[10px] text-muted-foreground">Standard-Look</div>
        </div>
      </div>

      <div className="rounded-lg border p-3 bg-card">
        <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-2 tracking-wider">
          Sample-Liste
        </div>
        <ul className="space-y-1.5 text-xs">
          {["Holzwerkstatt Kreuzberg", "FabLab Schwabing", "Reparatur-Cafe Ehrenfeld"].map((name, i) => (
            <li
              key={i}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="flex-1 truncate">{name}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function GeneralPreview({ groupName, description }: { groupName: string; description: string }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{groupName || "(ohne Namen)"}</CardTitle>
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              {description}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-[11px] text-muted-foreground">
            So erscheint dein Space im Workspace-Switcher und in Einladungen.
            Aenderungen sind erst nach "Speichern" sichtbar.
          </p>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-muted/30 px-3 py-2 flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-primary/20 grid place-items-center text-[10px] font-semibold text-primary">
          {(groupName.trim()[0] ?? "?").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate">{groupName || "(ohne Namen)"}</div>
          <div className="text-[10px] text-muted-foreground">Workspace-Switcher</div>
        </div>
      </div>
    </div>
  )
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

// ============================================================
// Tab: Module — An/Aus-Liste + (Phase B2) Sub-Konfig
// ============================================================

const FUNCTION_MODULE_IDS = ["map", "kanban", "calendar", "marketplace"]

function ModulesTab({ group }: { group: Group }) {
  const updateGroup = useUpdateGroup()
  const [busy, setBusy] = useState(false)

  const enabled = useMemo<string[]>(
    () => (group.data?.modules as string[] | undefined) ?? FUNCTION_MODULE_IDS,
    [group.data?.modules]
  )

  // Alle registrierten Module — Funktions-Module zuerst, dann der Rest.
  const sortedModules = useMemo(() => {
    const all = getAllModules()
    const fn = FUNCTION_MODULE_IDS
      .map((id) => all.find((m) => m.id === id))
      .filter((m): m is NonNullable<typeof m> => Boolean(m))
    const rest = all.filter((m) => !FUNCTION_MODULE_IDS.includes(m.id))
    return [...fn, ...rest]
  }, [])

  const toggleModule = async (id: string) => {
    setBusy(true)
    try {
      const next = enabled.includes(id)
        ? enabled.filter((x) => x !== id)
        : [...enabled, id]
      await updateGroup(group.id, {
        data: { ...(group.data ?? {}), modules: next },
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h3 className="text-base font-semibold mb-1">Module</h3>
        <p className="text-xs text-muted-foreground">
          Schalte ein, was dieser Space koennen soll. Aktive Module
          erscheinen sofort als Tab in der Navbar oben.
        </p>
      </div>

      <div className="space-y-2">
        {sortedModules.map((mod) => {
          const Icon = mod.icon
          const isOn = enabled.includes(mod.id)
          const isFunction = FUNCTION_MODULE_IDS.includes(mod.id)
          return (
            <div
              key={mod.id}
              className={`flex items-center gap-3 p-3 border rounded-md transition-colors ${
                isOn ? "bg-card" : "bg-muted/20"
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isOn ? "text-primary" : "text-muted-foreground"}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-tight">{mod.label}</div>
                <div className="text-[11px] text-muted-foreground">
                  {isFunction
                    ? "Funktions-Modul — erscheint als Tab in der Navbar"
                    : "Konfigurations-Modul — sichtbar als Tab wenn aktiv"}
                  {mod.itemTypes && mod.itemTypes.length > 0 && (
                    <span> · Item-Typen: {mod.itemTypes.join(", ")}</span>
                  )}
                </div>
              </div>
              <label className="inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isOn}
                  onChange={() => toggleModule(mod.id)}
                  disabled={busy}
                  className="sr-only peer"
                />
                <div className={`relative w-10 h-5 rounded-full transition-colors ${
                  isOn ? "bg-primary" : "bg-muted-foreground/30"
                }`}>
                  <div className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    isOn ? "translate-x-5" : "translate-x-0"
                  }`} />
                </div>
              </label>
            </div>
          )
        })}
      </div>

      <div className="border border-dashed rounded-md p-3 text-[11px] text-muted-foreground/80 leading-relaxed">
        💡 <strong>Sub-Konfiguration pro Modul</strong> kommt im naechsten Schritt
        — dann oeffnet ein Klick auf ein aktives Modul einen Editor mit
        Live-Vorschau der Karte/des Kalenders rechts daneben.
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
