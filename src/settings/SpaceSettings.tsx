import { useEffect, useMemo, useState } from "react"
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
import { ModulschmiedeView } from "../modules/modulschmiede/ModulschmiedeView"
import { DemoSection } from "../demo/DemoSection"
import { TagInput } from "../modules/profile/TagInput"
import { getAllModules, getModule, getModuleConfig } from "../modules/registry"
import {
  generateSlug,
  isValidSlug,
  isSlugFree,
  canBeParent,
  collectAllHashtags,
  getSpaceMeta,
} from "../spaces/space-data"
import { useGroups } from "@real-life-stack/toolkit"
import { useModuleConfig } from "../modules/use-module-config"
import { MapSettingsPanel } from "../modules/map/MapSettingsPanel"
import { MapView, DEFAULT_PIN_STYLES, type MapModuleConfig } from "../modules/map/MapView"
import { CalendarSettingsPanel } from "../modules/calendar/CalendarSettingsPanel"
import { CalendarView, type CalendarModuleConfig } from "../modules/calendar/CalendarView"
import { ChevronDown } from "lucide-react"

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
  /** Wenn gesetzt: im Module-Tab automatisch dieses Modul aufgeklappt zeigen. */
  initialModuleId?: string | null
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
  initialModuleId = null,
}: SpaceSettingsProps) {
  const [activeTab, setActiveTab] = useState<SpaceSettingsTab>(initialTab)
  const [previewVisible, setPreviewVisible] = useState(true)

  // Wenn Dialog mit initialTab/initialModuleId neu geoeffnet wird:
  // den State entsprechend setzen.
  useEffect(() => {
    if (open) {
      setActiveTab(initialTab)
    }
  }, [open, initialTab])

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent
        className="max-w-none w-screen h-screen sm:w-[95vw] sm:h-[92vh] sm:max-w-6xl p-0 gap-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
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
                  editor={renderEditor(activeTab, spaceId, activeGroup, initialModuleId)}
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
  activeGroup: Group,
  initialModuleId: string | null
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
      return <ModulesTab group={activeGroup} initialOpenModuleId={initialModuleId} />
    case "modulschmiede":
      return (
        <EmbeddedView>
          <ModulschmiedeView
            spaceId={spaceId}
            activeGroup={activeGroup}
            allGroups={[]}
            config={undefined}
          />
        </EmbeddedView>
      )
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
      return <AdvancedTab group={activeGroup} />
  }
}

function renderPreview(tab: SpaceSettingsTab, activeGroup: Group): React.ReactNode {
  switch (tab) {
    case "theme":
      return <ThemePreview groupName={activeGroup.name} />
    case "general":
      return <GeneralPreview group={activeGroup} />
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

function GeneralPreview({ group }: { group: Group }) {
  const { data: allGroups } = useGroups()
  const meta = getSpaceMeta(group)
  const parent = meta.parentSpaceId
    ? allGroups.find((g) => g.id === meta.parentSpaceId)
    : null
  const slugUrl = meta.slug ? `/spaces/${meta.slug}` : `/spaces/${group.id.slice(0, 8)}…`

  return (
    <div className="space-y-4">
      {/* URL-Pfad-Vorschau */}
      <div className="rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs">
        <span className="text-muted-foreground">real-life.network</span>
        <span className="text-primary font-semibold">{slugUrl}</span>
        <span className="text-muted-foreground">/karte</span>
      </div>

      <Card>
        <CardHeader className="pb-2">
          {parent && (
            <div className="text-[10px] text-muted-foreground mb-1">
              Sub-Space von <span className="text-foreground font-medium">{parent.name}</span>
            </div>
          )}
          <CardTitle className="text-base">{group.name || "(ohne Namen)"}</CardTitle>
          {meta.description && (
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              {meta.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {meta.hashtags && meta.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {meta.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">
            So erscheint dein Space im Workspace-Switcher, in Einladungen
            und im Spaces-Browser.
          </p>
        </CardContent>
      </Card>

      {/* Workspace-Switcher-Darstellung */}
      <div className="rounded-md border bg-muted/30 px-3 py-2 flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-primary/20 grid place-items-center text-[10px] font-semibold text-primary">
          {(group.name.trim()[0] ?? "?").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate">{group.name || "(ohne Namen)"}</div>
          <div className="text-[10px] text-muted-foreground">
            {parent ? `↳ unter ${parent.name}` : "Root-Space"}
          </div>
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
  const { data: allGroups } = useGroups()
  const meta = getSpaceMeta(group)

  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(meta.description ?? "")
  const [slug, setSlug] = useState(meta.slug ?? "")
  const [hashtags, setHashtags] = useState<string[]>(meta.hashtags ?? [])
  const [parentSpaceId, setParentSpaceId] = useState<string>(meta.parentSpaceId ?? "")
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Slug-Validierung
  const slugError = useMemo(() => {
    if (!slug) return null
    if (!isValidSlug(slug)) {
      return "Slug nur Kleinbuchstaben, Zahlen, Bindestriche."
    }
    if (!isSlugFree(allGroups, slug, group.id)) {
      return "Dieser Slug wird schon von einem anderen Space genutzt."
    }
    return null
  }, [slug, allGroups, group.id])

  // Parent-Optionen — alle Spaces ausser self und seine Nachfahren
  const parentOptions = useMemo(() => {
    return allGroups.filter(
      (g) => g.id !== group.id && canBeParent(allGroups, group.id, g.id)
    )
  }, [allGroups, group.id])

  // Hashtag-Vorschlaege aus allen Spaces
  const hashtagSuggestions = useMemo(() => collectAllHashtags(allGroups), [allGroups])

  const handleAutoSlug = () => {
    const generated = generateSlug(name.trim() || group.name)
    setSlug(generated)
  }

  const handleSave = async () => {
    setError(null)
    if (slugError) {
      setError(slugError)
      return
    }
    setSaving(true)
    try {
      const nextData: Record<string, unknown> = { ...(group.data ?? {}) }
      nextData.description = description.trim()
      nextData.slug = slug.trim() || undefined
      nextData.hashtags = hashtags.length > 0 ? hashtags : undefined
      nextData.parentSpaceId = parentSpaceId || undefined
      // undefined-Felder loeschen, damit data sauber bleibt
      Object.keys(nextData).forEach((k) => {
        if (nextData[k] === undefined) delete nextData[k]
      })
      await updateGroup(group.id, {
        name: name.trim() || group.name,
        data: nextData,
      })
      setSavedAt(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen")
    } finally {
      setSaving(false)
    }
  }

  const dirty =
    name.trim() !== group.name ||
    description.trim() !== (meta.description ?? "") ||
    slug.trim() !== (meta.slug ?? "") ||
    parentSpaceId !== (meta.parentSpaceId ?? "") ||
    JSON.stringify(hashtags) !== JSON.stringify(meta.hashtags ?? [])

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h3 className="text-base font-semibold mb-1">Allgemeine Angaben</h3>
        <p className="text-xs text-muted-foreground">
          Name, Beschreibung, URL-Slug, Eltern-Space und Hashtags. Diese Werte
          erscheinen im Workspace-Switcher, in Einladungen und im Spaces-
          Browser.
        </p>
      </div>

      <div className="space-y-4">
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
            className="min-h-20"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">URL-Slug</Label>
            <button
              type="button"
              onClick={handleAutoSlug}
              className="text-[10px] text-primary hover:underline"
            >
              Aus Name erzeugen
            </button>
          </div>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="z.B. macher-berlin-mitte"
            className={slugError ? "border-destructive" : ""}
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] text-muted-foreground">
              {slug
                ? <>Erscheint als <code className="text-foreground">{`/spaces/${slug}/...`}</code></>
                : "Leer lassen heisst: URL nutzt die ID."}
            </p>
            {slugError && (
              <p className="text-[10px] text-destructive">{slugError}</p>
            )}
          </div>
        </div>

        <div>
          <Label className="text-xs">Eltern-Space (optional)</Label>
          <select
            value={parentSpaceId}
            onChange={(e) => setParentSpaceId(e.target.value)}
            className="w-full h-9 px-3 rounded-md border bg-background text-sm"
          >
            <option value="">— ohne (Root-Space) —</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-muted-foreground mt-1">
            Wenn dieser Space ein Sub-Space von z.B. "Macher" ist, traegt er
            zur Aggregation in den Macher-Root bei. Der Workspace-Switcher
            zeigt Sub-Spaces eingeklappt unter dem Root.
          </p>
        </div>

        <div>
          <Label className="text-xs">Hashtags / Kategorien</Label>
          <TagInput
            value={hashtags}
            onChange={(next) => setHashtags(next.map((t) => t.replace(/^#/, "").toLowerCase()))}
            placeholder="handwerk, regional, jugendarbeit ..."
            suggestions={hashtagSuggestions}
            quickSuggestions={8}
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Macht den Space im Spaces-Browser auffindbar. Mehrere Tags sind
            erlaubt — Enter oder Komma fuegt hinzu.
          </p>
        </div>
      </div>

      {error && (
        <div className="text-xs text-destructive bg-destructive/5 border border-destructive/30 rounded px-2 py-1.5">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2 border-t">
        {savedAt && !dirty && (
          <span className="text-[11px] text-muted-foreground">Gespeichert.</span>
        )}
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={!dirty || saving || Boolean(slugError)}
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
// Tab: Module — An/Aus + Sub-Konfig mit Live-Preview
// ============================================================

const FUNCTION_MODULE_IDS = ["map", "kanban", "calendar", "marketplace"]

const MODULES_WITH_CONFIG = new Set(["map", "calendar"])

function ModulesTab({ group, initialOpenModuleId }: { group: Group; initialOpenModuleId?: string | null }) {
  const updateGroup = useUpdateGroup()
  const { setModuleConfig } = useModuleConfig()
  const [busy, setBusy] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<unknown>(null)

  // Initial: wenn jemand mit initialOpenModuleId reinkommt (z.B. Inline-
  // Zahnrad auf der Karte), das Modul direkt aufgeklappt zeigen.
  useEffect(() => {
    if (initialOpenModuleId && MODULES_WITH_CONFIG.has(initialOpenModuleId)) {
      const mod = getModule(initialOpenModuleId)
      if (mod) {
        const current = getModuleConfig(group, initialOpenModuleId, mod.defaultConfig)
        setSelectedId(initialOpenModuleId)
        setDraft(current ?? mod.defaultConfig ?? {})
      }
    }
  }, [initialOpenModuleId, group])

  const enabled = useMemo<string[]>(
    () => (group.data?.modules as string[] | undefined) ?? FUNCTION_MODULE_IDS,
    [group.data?.modules]
  )

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

  const openConfig = (id: string) => {
    if (!MODULES_WITH_CONFIG.has(id)) {
      setSelectedId(id)
      setDraft(null)
      return
    }
    const mod = getModule(id)
    if (!mod) return
    const current = getModuleConfig(group, id, mod.defaultConfig)
    setSelectedId(id)
    setDraft(current ?? mod.defaultConfig ?? {})
  }

  const closeConfig = () => {
    setSelectedId(null)
    setDraft(null)
  }

  const handleSaveConfig = async () => {
    if (!selectedId || draft === null) return
    setBusy(true)
    try {
      await setModuleConfig(group, selectedId, draft)
      closeConfig()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="max-w-2xl">
        <h3 className="text-base font-semibold mb-1">Module</h3>
        <p className="text-xs text-muted-foreground">
          Schalte ein, was dieser Space koennen soll. Aktive Module erscheinen
          sofort als Tab in der Navbar oben. Klick auf den Modul-Namen
          oeffnet die Konfiguration mit Live-Vorschau.
        </p>
      </div>

      <div className="space-y-2 max-w-2xl">
        {sortedModules.map((mod) => {
          const Icon = mod.icon
          const isOn = enabled.includes(mod.id)
          const isFunction = FUNCTION_MODULE_IDS.includes(mod.id)
          const hasConfig = MODULES_WITH_CONFIG.has(mod.id)
          const isSelected = selectedId === mod.id
          return (
            <div
              key={mod.id}
              className={`border rounded-md transition-colors ${
                isOn ? "bg-card" : "bg-muted/20"
              } ${isSelected ? "ring-2 ring-primary" : ""}`}
            >
              <div className="flex items-center gap-3 p-3">
                <Icon className={`h-5 w-5 shrink-0 ${isOn ? "text-primary" : "text-muted-foreground"}`} />
                <button
                  type="button"
                  onClick={() => (hasConfig && isOn ? (isSelected ? closeConfig() : openConfig(mod.id)) : null)}
                  disabled={!hasConfig || !isOn}
                  className={`flex-1 min-w-0 text-left ${
                    hasConfig && isOn ? "cursor-pointer hover:opacity-80" : "cursor-default"
                  }`}
                >
                  <div className="text-sm font-medium leading-tight flex items-center gap-1.5">
                    {mod.label}
                    {hasConfig && isOn && (
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${
                          isSelected ? "rotate-180" : ""
                        } text-muted-foreground`}
                      />
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {isFunction
                      ? "Funktions-Modul — erscheint als Tab in der Navbar"
                      : "Konfigurations-Modul — sichtbar als Tab wenn aktiv"}
                    {hasConfig && isOn && " · Klick fuer Konfiguration"}
                  </div>
                </button>
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

              {/* Aufgeklappte Konfig + Live-Preview */}
              {isSelected && hasConfig && draft !== null && (
                <ModuleConfigSplit
                  moduleId={mod.id}
                  draft={draft}
                  setDraft={setDraft}
                  onSave={handleSaveConfig}
                  onCancel={closeConfig}
                  saving={busy}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// ModuleConfigSplit — Editor + Live-Preview pro Modul
// ============================================================

function ModuleConfigSplit({
  moduleId,
  draft,
  setDraft,
  onSave,
  onCancel,
  saving,
}: {
  moduleId: string
  draft: unknown
  setDraft: (next: unknown) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
}) {
  return (
    <div className="border-t bg-muted/10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x">
        {/* Editor */}
        <div className="p-3 max-h-[60vh] overflow-y-auto">
          <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-2 tracking-wider">
            Konfiguration
          </div>
          <ModuleConfigEditor
            moduleId={moduleId}
            draft={draft}
            setDraft={setDraft}
          />
        </div>

        {/* Live-Preview */}
        <div className="p-3 bg-background max-h-[60vh] overflow-hidden flex flex-col">
          <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-2 tracking-wider shrink-0">
            Live-Vorschau
          </div>
          <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
            <ModuleConfigPreview moduleId={moduleId} draft={draft} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 px-3 py-2 border-t bg-card">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          Abbrechen
        </Button>
        <Button type="button" size="sm" onClick={onSave} disabled={saving}>
          {saving ? "Speichere..." : "Speichern"}
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// Modul-spezifische Editor + Preview Adapter
// ============================================================

function ModuleConfigEditor({
  moduleId,
  draft,
  setDraft,
}: {
  moduleId: string
  draft: unknown
  setDraft: (next: unknown) => void
}) {
  if (moduleId === "map") {
    const pinTypeOptions = Object.entries(DEFAULT_PIN_STYLES).map(([id, s]) => ({
      id,
      label: s.label,
      defaultColor: s.color,
    }))
    return (
      <MapSettingsPanel
        config={draft as MapModuleConfig}
        onChange={(next) => setDraft(next)}
        pinTypeOptions={pinTypeOptions}
      />
    )
  }
  if (moduleId === "calendar") {
    return (
      <CalendarSettingsPanel
        config={draft as CalendarModuleConfig}
        onChange={(next) => setDraft(next)}
      />
    )
  }
  return (
    <div className="text-xs text-muted-foreground">
      Kein Konfigurations-Editor verfuegbar.
    </div>
  )
}

function ModuleConfigPreview({ moduleId, draft }: { moduleId: string; draft: unknown }) {
  if (moduleId === "map") {
    return (
      <MapView
        spaceId={null}
        activeGroup={null}
        allGroups={[]}
        config={draft as MapModuleConfig}
        isPreview
      />
    )
  }
  if (moduleId === "calendar") {
    return (
      <div className="h-full overflow-y-auto p-3">
        <CalendarView
          spaceId={null}
          activeGroup={null}
          allGroups={[]}
          config={draft as CalendarModuleConfig}
          isPreview
        />
      </div>
    )
  }
  return (
    <div className="h-full grid place-items-center text-xs text-muted-foreground p-4">
      Keine Vorschau verfuegbar.
    </div>
  )
}

// ============================================================
// Tab: Erweitert
// ============================================================

function AdvancedTab({ group }: { group: Group }) {
  const updateGroup = useUpdateGroup()
  const [busy, setBusy] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const moduleConfigs = (group.data?.moduleConfig as Record<string, unknown> | undefined) ?? {}
  const configCount = Object.keys(moduleConfigs).length

  const resetModuleConfigs = async () => {
    setBusy(true)
    try {
      const next = { ...(group.data ?? {}) }
      delete (next as { moduleConfig?: unknown }).moduleConfig
      await updateGroup(group.id, { data: next })
      setConfirmReset(false)
    } finally {
      setBusy(false)
    }
  }

  const exportSpaceJson = () => {
    const blob = new Blob([JSON.stringify(group, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `space-${group.id.slice(0, 12)}-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h3 className="text-base font-semibold mb-1">Erweitert</h3>
        <p className="text-xs text-muted-foreground">
          Werkzeuge fuer Aufraeumen, Export und Reset.
        </p>
      </div>

      {/* Export */}
      <div className="border rounded-md p-3 bg-card space-y-2">
        <div>
          <h4 className="text-sm font-semibold">Space exportieren</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Laedt die Group-Daten als JSON herunter — Name, Beschreibung,
            Mitglieder, Modul-Konfig, Theme. Items selbst sind getrennt im
            WoT gespeichert.
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={exportSpaceJson}>
          JSON herunterladen
        </Button>
      </div>

      {/* Modul-Konfig zuruecksetzen */}
      <div className="border rounded-md p-3 bg-card space-y-2">
        <div>
          <h4 className="text-sm font-semibold">Modul-Konfiguration zuruecksetzen</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Setzt alle pro-Modul-Einstellungen (Karte, Kalender, ...) auf
            ihre Default-Werte zurueck. Der Modul-Tab zeigt wieder die
            volle Demo-First-Ausstattung.
          </p>
          {configCount > 0 && (
            <p className="text-[11px] text-amber-700 mt-1">
              Aktuell {configCount} Modul{configCount === 1 ? "" : "e"} mit eigener Konfig.
            </p>
          )}
        </div>
        {!confirmReset ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setConfirmReset(true)}
            disabled={busy || configCount === 0}
          >
            Zuruecksetzen
          </Button>
        ) : (
          <div className="flex gap-2 items-center">
            <span className="text-[11px] text-amber-700">Wirklich alle Modul-Konfigs zuruecksetzen?</span>
            <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmReset(false)} disabled={busy}>
              Abbrechen
            </Button>
            <Button type="button" size="sm" onClick={resetModuleConfigs} disabled={busy}>
              {busy ? "Setze zurueck..." : "Ja, zuruecksetzen"}
            </Button>
          </div>
        )}
      </div>

      <div className="border border-dashed rounded-md p-3 text-[11px] text-muted-foreground/80 leading-relaxed">
        💡 Demo-Daten loeschen geht im Tab "Demo-Daten". Mitglieder verwalten
        im Tab "Mitglieder". Theme zuruecksetzen via Theme-Tab → Macher-Orange.
      </div>
    </div>
  )
}
