import { useState, useMemo, useCallback } from "react"
import { Plus, Settings, ChevronLeft, ChevronRight, CalendarDays, List, Layers, MapPin, Tag, Ticket, Search, Clock, Grid3x3, User as UserIcon } from "lucide-react"
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useCurrentUser,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogTitle,
  AdaptivePanel,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import type { ModuleViewProps } from "../registry"
import { useIsSpaceAdmin } from "../use-module-config"
import { CalendarSettingsPanel } from "./CalendarSettingsPanel"
import { MarkdownEditor, MarkdownView } from "./MarkdownEditor"
import { ImageUploadField } from "./ImageUploadField"
import { LocationField, type EventLocation } from "./LocationField"
import { RecurrenceEditor } from "./RecurrenceEditor"
import { expandRecurrence, summarizeRecurrence, type RecurrenceRule, type ExpandedInstance } from "./recurrence"
import { ReminderEditor } from "./ReminderEditor"
import type { Reminder } from "./reminders"
import { useReminderScheduler } from "./useReminderScheduler"
import { ParticipationControls } from "./ParticipationControls"
import { useMyParticipations } from "./useParticipation"
import { CalendarFilterBar, applyCalendarFilter, collectHashtags, emptyFilter, type CalendarFilterState } from "./CalendarFilterBar"
import { DayView } from "./views/DayView"
import { YearView } from "./views/YearView"
import { MyEventsView } from "./views/MyEventsView"
import { useCalendars } from "./useCalendars"
import { TagInput } from "../profile/TagInput"
import { EmptyDemoBanner } from "../../demo/EmptyDemoBanner"

// ============================================================
// Types
// ============================================================

export type CalendarMode = "event-calendar" | "group-calendar" | "mixed"
export type CalendarView = "day" | "week" | "month" | "year" | "agenda" | "events" | "mine"
export type FirstDayOfWeek = "monday" | "sunday"
export type TimeFormat = "24h" | "12h"

export interface CalendarModuleConfig {
  mode: CalendarMode
  defaultView: CalendarView
  /** Welche Item-Typen werden angezeigt? */
  itemTypes: string[]
  /** Farbe pro Item-Typ */
  colors?: Record<string, string>
  firstDayOfWeek: FirstDayOfWeek
  timeFormat: TimeFormat
  /** Standard-Dauer fuer neue Termine (Minuten) */
  defaultDurationMinutes?: number
  /** "Neuer Termin"-Button anzeigen */
  showCreateButton?: boolean
  /** Standard-Reminder fuer neue Events (Minuten vor Start). undefined = aus. */
  defaultReminderMinutes?: number
  /** Browser-Notifications aktivieren */
  notificationsEnabled?: boolean
}

/**
 * Default-Konfig — "alles an" (Demo-First / Subtraction-Design).
 *
 * Frischer Kalender zeigt Events + Termine + Quests. Admins schalten
 * ueber das Inline-Zahnrad ab, was sie nicht brauchen.
 */
export const calendarDefaultConfig: CalendarModuleConfig = {
  mode: "mixed",
  defaultView: "month",
  itemTypes: ["event", "appointment", "quest"],
  colors: { event: "#3b82f6", appointment: "#10b981", quest: "#a855f7" },
  firstDayOfWeek: "monday",
  timeFormat: "24h",
  defaultDurationMinutes: 60,
  showCreateButton: true,
  defaultReminderMinutes: 15,
  notificationsEnabled: true,
}

export interface CalendarViewProps extends ModuleViewProps<CalendarModuleConfig> {
  isPreview?: boolean
}

// ============================================================
// Constants
// ============================================================

const MONTH_NAMES = [
  "Januar", "Februar", "Maerz", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
]

const WEEKDAYS_MO = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
const WEEKDAYS_SO = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]

// ============================================================
// View
// ============================================================

export function CalendarView({ spaceId, activeGroup, config, isPreview, onOpenSettings }: CalendarViewProps) {
  const cfg = { ...calendarDefaultConfig, ...(config ?? {}) }
  const isAdmin = useIsSpaceAdmin(spaceId)

  const [activeView, setActiveView] = useState<CalendarView>(cfg.defaultView)
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [currentDay, setCurrentDay] = useState(() => new Date())
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear())
  const [creating, setCreating] = useState(false)
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [filter, setFilter] = useState<CalendarFilterState>(emptyFilter)
  const [filterOpen, setFilterOpen] = useState(false)
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()
  const { mutate: deleteItem } = useDeleteItem()

  // Items pro Typ holen (max 3)
  const eventItems = useItems({ type: cfg.itemTypes.includes("event") ? "event" : "__none__" }).data
  const apptItems = useItems({ type: cfg.itemTypes.includes("appointment") ? "appointment" : "__none__" }).data
  const questItems = useItems({ type: cfg.itemTypes.includes("quest") ? "quest" : "__none__" }).data

  const rawItems = useMemo(
    () => [...eventItems, ...apptItems, ...questItems].filter((it) => it.data.start),
    [eventItems, apptItems, questItems]
  )

  // Participation fuer Filter
  const { acceptedEventIds, observingEventIds } = useMyParticipations()

  // Multi-Calendar: nur Events sichtbarer Kalender zeigen
  const { calendars, visibleCalendarIds, defaultCalendar } = useCalendars()

  const itemsAfterCalendarFilter = useMemo(() => {
    // Wenn keine Kalender existieren: zeige alles (Backward-Compat)
    if (calendars.length === 0) return rawItems
    return rawItems.filter((it) => {
      const calId = it.data.calendarId as string | undefined
      // Events ohne calendarId zeigen (legacy / vor Phase 8)
      if (!calId) return true
      return visibleCalendarIds.has(calId)
    })
  }, [rawItems, calendars.length, visibleCalendarIds])

  // Filter anwenden
  const allItems = useMemo(
    () =>
      applyCalendarFilter(itemsAfterCalendarFilter, filter, {
        currentUserId: currentUser?.id,
        acceptedEventIds,
        observingEventIds,
      }),
    [itemsAfterCalendarFilter, filter, currentUser?.id, acceptedEventIds, observingEventIds]
  )

  const availableHashtags = useMemo(() => collectHashtags(rawItems), [rawItems])

  // Reminder-Scheduler (Browser-Notifications, nur ausserhalb von Preview)
  useReminderScheduler({
    events: !isPreview && cfg.notificationsEnabled ? allItems : [],
    defaultReminderMinutes: cfg.defaultReminderMinutes,
    onItemOpen: setEditItem,
  })

  const handleCreate = useCallback(
    async (data: Record<string, unknown>) => {
      const itemType = cfg.mode === "group-calendar" ? "appointment" : "event"
      // Default-Calendar zuweisen wenn nicht explizit gesetzt
      const calendarId = data.calendarId ?? defaultCalendar?.id
      await createItem({
        type: itemType,
        createdBy: currentUser?.id ?? "anonymous",
        data: { ...data, calendarId },
      })
      setCreating(false)
    },
    [createItem, currentUser?.id, cfg.mode, defaultCalendar?.id]
  )

  const handleUpdate = useCallback(
    async (data: Record<string, unknown>) => {
      if (!editItem) return
      await updateItem(editItem.id, { data: { ...editItem.data, ...data } })
      setEditItem(null)
    },
    [editItem, updateItem]
  )

  const handleDelete = useCallback(async () => {
    if (!editItem) return
    await deleteItem(editItem.id)
    setEditItem(null)
  }, [editItem, deleteItem])

  return (
    <div className="space-y-4 relative">
      {/* Toolbar */}
      <div className="flex gap-2 items-center flex-wrap">
        {/* View-Switcher */}
        <div className="inline-flex rounded-md border bg-muted/30 p-0.5 flex-wrap">
          {(["day", "week", "month", "year", "agenda", "events", "mine"] as CalendarView[]).map((v) => {
            const Icon =
              v === "day" ? Clock
              : v === "week" ? Layers
              : v === "month" ? CalendarDays
              : v === "year" ? Grid3x3
              : v === "agenda" ? List
              : v === "mine" ? UserIcon
              : Layers
            const isActive = activeView === v
            const label =
              v === "day" ? "Tag"
              : v === "week" ? "Woche"
              : v === "month" ? "Monat"
              : v === "year" ? "Jahr"
              : v === "agenda" ? "Agenda"
              : v === "mine" ? "Meine"
              : "Events"
            return (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`px-2.5 h-8 inline-flex items-center gap-1.5 text-xs rounded transition-colors ${
                  isActive ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            )
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Filter-Toggle */}
        <Button
          variant={filter.search || filter.hashtags.length > 0 || filter.status !== "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilterOpen(!filterOpen)}
          title="Suche und Filter"
        >
          <Search className="h-3.5 w-3.5" />
        </Button>

        {/* Zahnrad */}
        {!isPreview && isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenSettings?.("modules", "calendar")}
            title="Kalender konfigurieren"
            aria-label="Kalender konfigurieren"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}

        {/* Create-Button */}
        {cfg.showCreateButton && (
          <Button onClick={() => setCreating(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            {cfg.mode === "group-calendar" ? "Neuer Termin" : "Neues Event"}
          </Button>
        )}
      </div>

      {/* Filter-Bar (collapsible) */}
      {filterOpen && (
        <CalendarFilterBar
          filter={filter}
          onChange={setFilter}
          availableHashtags={availableHashtags}
          resultCount={allItems.length}
        />
      )}

      {/* Empty-State: keiner Termin im Space → Demo-Banner mit Lade-Knopf */}
      {!isPreview && activeGroup && (
        <EmptyDemoBanner
          visible={rawItems.length === 0 && !creating && !editItem}
          isAdmin={isAdmin}
          inline
          title="Noch kein Termin im Kalender"
          adminText="Lass uns mit Demo-Events starten — Sommerfest in Kreuzberg, 3D-Druck-Sprechstunde, Macher-Festival Ferropolis. Plus Werkstaetten und Macher mit Standort. Du kannst alles jederzeit wieder loeschen."
          memberText="Sobald ein Admin Events anlegt, erscheinen sie hier."
        />
      )}

      {/* View-Inhalt */}
      {activeView === "day" && (
        <DayView
          items={allItems}
          currentDay={currentDay}
          onDayChange={setCurrentDay}
          timeFormat={cfg.timeFormat}
          colors={cfg.colors ?? {}}
          onItemClick={setEditItem}
        />
      )}
      {activeView === "month" && (
        <MonthView
          items={allItems}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          firstDayOfWeek={cfg.firstDayOfWeek}
          colors={cfg.colors ?? {}}
          onItemClick={setEditItem}
        />
      )}
      {activeView === "year" && (
        <YearView
          items={allItems}
          currentYear={currentYear}
          onYearChange={setCurrentYear}
          firstDayOfWeek={cfg.firstDayOfWeek}
          onDaySelect={(d) => {
            setCurrentMonth(d)
            setActiveView("month")
          }}
        />
      )}
      {activeView === "week" && (
        <AgendaView items={allItems} colors={cfg.colors ?? {}} timeFormat={cfg.timeFormat} onItemClick={setEditItem} weekOnly />
      )}
      {activeView === "agenda" && (
        <AgendaView items={allItems} colors={cfg.colors ?? {}} timeFormat={cfg.timeFormat} onItemClick={setEditItem} />
      )}
      {activeView === "events" && (
        <EventListView items={allItems} colors={cfg.colors ?? {}} onItemClick={setEditItem} />
      )}
      {activeView === "mine" && (
        <MyEventsView
          items={allItems}
          colors={cfg.colors ?? {}}
          timeFormat={cfg.timeFormat}
          onItemClick={setEditItem}
        />
      )}

      {/* Create-Dialog */}
      <EventFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSubmit={handleCreate}
        defaultDuration={cfg.defaultDurationMinutes ?? 60}
        title={cfg.mode === "group-calendar" ? "Neuer Termin" : "Neues Event"}
        availableHashtags={availableHashtags}
      />

      {/* Edit-Panel */}
      <AdaptivePanel
        open={editItem !== null}
        onClose={() => setEditItem(null)}
        allowedModes={["sidebar", "drawer", "modal"]}
        sidebarWidth="420px"
      >
        {editItem && (
          <EventEditForm
            item={editItem}
            onSubmit={handleUpdate}
            onDelete={handleDelete}
            onCancel={() => setEditItem(null)}
            currentUserId={currentUser?.id}
            availableHashtags={availableHashtags}
          />
        )}
      </AdaptivePanel>
    </div>
  )
}

// ============================================================
// Helper: Items + Recurrence-Expansion → flache Liste fuer Render
// ============================================================

interface RenderInstance {
  item: Item
  start: Date
  end: Date | null
  /** Index der Recurrence-Instanz (0 = Original / einmalig) */
  instanceIndex: number
  /** Eindeutiger Key fuer React */
  key: string
}

function expandItemsForRange(items: Item[], rangeStart: Date, rangeEnd: Date): RenderInstance[] {
  const out: RenderInstance[] = []
  for (const item of items) {
    const start = new Date(String(item.data.start))
    if (isNaN(start.getTime())) continue
    const end = item.data.end ? new Date(String(item.data.end)) : null
    const rule = item.data.recurrence as RecurrenceRule | undefined

    const expanded: ExpandedInstance[] = expandRecurrence(start, end, rule, rangeStart, rangeEnd)
    for (const inst of expanded) {
      out.push({
        item,
        start: inst.start,
        end: inst.end,
        instanceIndex: inst.index,
        key: `${item.id}#${inst.index}`,
      })
    }
  }
  return out
}

// ============================================================
// MonthView (Grid mit Tagen + Punkte fuer Events)
// ============================================================

function MonthView({
  items,
  currentMonth,
  onMonthChange,
  firstDayOfWeek,
  colors,
  onItemClick,
}: {
  items: Item[]
  currentMonth: Date
  onMonthChange: (d: Date) => void
  firstDayOfWeek: FirstDayOfWeek
  colors: Record<string, string>
  onItemClick: (item: Item) => void
}) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  const weekdays = firstDayOfWeek === "monday" ? WEEKDAYS_MO : WEEKDAYS_SO

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const startOffset = firstDayOfWeek === "monday"
      ? (firstDay === 0 ? 6 : firstDay - 1)
      : firstDay
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Range fuer Recurrence-Expansion: kompletter sichtbarer Monat (auch Vor-/Nach-Schau)
    const rangeStart = new Date(year, month, 1 - startOffset)
    const rangeEnd = new Date(year, month, daysInMonth + (42 - startOffset - daysInMonth) + 1)
    const instances = expandItemsForRange(items, rangeStart, rangeEnd)

    return Array.from({ length: 42 }, (_, i) => {
      const dayNum = i - startOffset + 1
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth
      const date = new Date(year, month, dayNum)
      const dayInstances = instances.filter((inst) => {
        return (
          inst.start.getDate() === date.getDate() &&
          inst.start.getMonth() === date.getMonth() &&
          inst.start.getFullYear() === date.getFullYear()
        )
      })
      return {
        date,
        number: dayNum,
        isCurrentMonth: inMonth,
        isToday: isCurrentMonth && dayNum === today.getDate(),
        instances: dayInstances,
      }
    })
  }, [year, month, items, firstDayOfWeek, isCurrentMonth, today])

  const navigate = (delta: number) => {
    const next = new Date(year, month + delta, 1)
    onMonthChange(next)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-base">{MONTH_NAMES[month]} {year}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onMonthChange(new Date())}>
              Heute
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {weekdays.map((d) => (
            <div key={d} className="text-[11px] font-semibold text-muted-foreground py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => (
            <div
              key={i}
              className={`aspect-square p-1 rounded text-xs flex flex-col ${
                !d.isCurrentMonth
                  ? "text-muted-foreground/30"
                  : d.isToday
                  ? "bg-primary/10 ring-1 ring-primary/30 font-semibold"
                  : "hover:bg-muted/50"
              }`}
            >
              <span className="self-end">{d.number}</span>
              <div className="flex-1 flex flex-wrap gap-0.5 mt-1 content-start">
                {d.instances.slice(0, 3).map((inst) => (
                  <button
                    key={inst.key}
                    onClick={() => onItemClick(inst.item)}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: colors[inst.item.type] ?? "#888" }}
                    title={String(inst.item.data.title ?? "")}
                  />
                ))}
                {d.instances.length > 3 && (
                  <span className="text-[9px] text-muted-foreground">+{d.instances.length - 3}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// AgendaView (Liste sortiert nach Datum)
// ============================================================

function AgendaView({
  items,
  colors,
  timeFormat,
  onItemClick,
  weekOnly,
}: {
  items: Item[]
  colors: Record<string, string>
  timeFormat: TimeFormat
  onItemClick: (item: Item) => void
  weekOnly?: boolean
}) {
  const instances = useMemo(() => {
    const now = new Date()
    const rangeStart = new Date(now)
    rangeStart.setHours(0, 0, 0, 0)
    const rangeEnd = weekOnly
      ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

    return expandItemsForRange(items, rangeStart, rangeEnd).sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    )
  }, [items, weekOnly])

  if (instances.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground text-sm">
        {weekOnly ? "Diese Woche keine Termine." : "Keine kommenden Termine."}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {instances.map((inst) => {
        const it = inst.item
        const d = inst.start
        const loc = it.data.location as EventLocation | undefined
        const cover = it.data.coverImageUrl as string | undefined
        const hashtags = (it.data.hashtags as string[] | undefined) ?? []
        const rule = it.data.recurrence as RecurrenceRule | undefined
        return (
          <button
            key={inst.key}
            onClick={() => onItemClick(it)}
            className="w-full text-left p-3 border rounded-lg hover:bg-muted/30 transition-colors flex gap-3 items-start"
          >
            <div
              className="w-1 self-stretch rounded-full shrink-0"
              style={{ background: colors[it.type] ?? "#888" }}
            />
            {cover && (
              <img src={cover} alt="" className="w-16 h-16 rounded-md object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm flex items-center gap-2">
                {String(it.data.title ?? "(ohne Titel)")}
                {rule && (
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {summarizeRecurrence(rule)}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {formatDateTime(d, timeFormat)}
                {loc?.address && (
                  <span className="inline-flex items-center gap-1 ml-2">
                    <MapPin className="h-3 w-3" />
                    {loc.address}
                  </span>
                )}
              </div>
              {it.data.plainDescription && (
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {String(it.data.plainDescription)}
                </div>
              )}
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {hashtags.slice(0, 4).map((t) => (
                    <span key={t} className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ============================================================
// EventListView (Cards mit Bildern)
// ============================================================

function EventListView({
  items,
  colors,
  onItemClick,
}: {
  items: Item[]
  colors: Record<string, string>
  onItemClick: (item: Item) => void
}) {
  const instances = useMemo(() => {
    const now = new Date()
    const rangeStart = new Date(now)
    rangeStart.setHours(0, 0, 0, 0)
    const rangeEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
    return expandItemsForRange(items, rangeStart, rangeEnd).sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    )
  }, [items])

  if (instances.length === 0) {
    return <div className="py-12 text-center text-muted-foreground text-sm">Keine Events.</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {instances.map((inst) => {
        const it = inst.item
        const cover = it.data.coverImageUrl as string | undefined
        const d = inst.start
        const loc = it.data.location as EventLocation | undefined
        const hashtags = (it.data.hashtags as string[] | undefined) ?? []
        const price = it.data.price as string | undefined
        const rule = it.data.recurrence as RecurrenceRule | undefined
        return (
          <Card
            key={inst.key}
            className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
            onClick={() => onItemClick(it)}
          >
            {cover && (
              <div className="aspect-[16/9] bg-muted">
                <img src={cover} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex items-start gap-2">
                <div className="w-1 h-5 rounded-full mt-0.5" style={{ background: colors[it.type] ?? "#888" }} />
                <CardTitle className="text-base flex-1">
                  {String(it.data.title ?? "(ohne Titel)")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span>{d.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
                {rule && (
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                    {summarizeRecurrence(rule)}
                  </span>
                )}
              </div>
              {loc?.address && (
                <div className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {loc.address}
                </div>
              )}
              {price && (
                <div className="inline-flex items-center gap-1">
                  <Ticket className="h-3 w-3" />
                  {price}
                </div>
              )}
              {it.data.plainDescription && (
                <p className="text-foreground/70 line-clamp-2 pt-1">
                  {String(it.data.plainDescription)}
                </p>
              )}
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {hashtags.slice(0, 5).map((t) => (
                    <span key={t} className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                      <Tag className="h-2 w-2" />
                      {t.replace(/^#/, "")}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ============================================================
// Event-Form (Dialog + Edit-Form)
// ============================================================

function EventFormDialog({
  open,
  onClose,
  onSubmit,
  defaultDuration,
  title,
  availableHashtags,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  defaultDuration: number
  title: string
  availableHashtags?: string[]
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogTitle>{title}</DialogTitle>
        <EventForm
          initialData={{}}
          onSubmit={async (data) => {
            await onSubmit(data)
          }}
          onCancel={onClose}
          defaultDuration={defaultDuration}
          availableHashtags={availableHashtags}
        />
      </DialogContent>
    </Dialog>
  )
}

function EventEditForm({
  item,
  onSubmit,
  onDelete,
  onCancel,
  currentUserId,
  availableHashtags,
}: {
  item: Item
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onDelete: () => void
  onCancel: () => void
  currentUserId?: string
  availableHashtags?: string[]
}) {
  const isOwn = currentUserId === item.createdBy
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Participation oben */}
        <ParticipationControls eventId={item.id} isOwnEvent={isOwn} />

        <h3 className="font-semibold">Bearbeiten</h3>
        <EventForm
          initialData={item.data}
          onSubmit={onSubmit}
          onCancel={onCancel}
          onDelete={isOwn ? onDelete : undefined}
          defaultDuration={60}
          availableHashtags={availableHashtags}
        />
      </div>
    </div>
  )
}

function EventForm({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  defaultDuration,
  availableHashtags,
}: {
  initialData: Record<string, unknown>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  onDelete?: () => void
  defaultDuration: number
  /** Vorhandene Hashtags fuer Autocomplete. */
  availableHashtags?: string[]
}) {
  const { calendars, defaultCalendar } = useCalendars()
  const [calendarId, setCalendarId] = useState<string | undefined>(
    (initialData.calendarId as string | undefined) ?? defaultCalendar?.id
  )
  const [title, setTitle] = useState(String(initialData.title ?? ""))
  const [start, setStart] = useState(toDateTimeLocal(initialData.start))
  const [end, setEnd] = useState(toDateTimeLocal(initialData.end))
  const [allDay, setAllDay] = useState(Boolean(initialData.allDay))
  // Mehrtaegig-Modus: Datum-Range statt Single-Datetime
  const initialMultiDay = Boolean(
    initialData.start && initialData.end && computeIsMultiDay(initialData.start, initialData.end)
  )
  const [multiDay, setMultiDay] = useState(initialMultiDay)
  const [markdownBody, setMarkdownBody] = useState(String(initialData.markdownBody ?? initialData.description ?? ""))
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(
    initialData.coverImageUrl as string | undefined
  )
  const [galleryImageUrls, setGalleryImageUrls] = useState<string[] | undefined>(
    initialData.galleryImageUrls as string[] | undefined
  )
  const [location, setLocation] = useState<EventLocation | undefined>(
    initialData.location as EventLocation | undefined
  )
  const [price, setPrice] = useState(String(initialData.price ?? ""))
  const [ticketUrl, setTicketUrl] = useState(String(initialData.ticketUrl ?? ""))
  const [hashtags, setHashtags] = useState<string[]>(
    Array.isArray(initialData.hashtags) ? (initialData.hashtags as string[]) : []
  )
  const [recurrence, setRecurrence] = useState<RecurrenceRule | undefined>(
    initialData.recurrence as RecurrenceRule | undefined
  )
  const [reminders, setReminders] = useState<Reminder[]>(
    (initialData.reminders as Reminder[] | undefined) ?? []
  )
  const [saving, setSaving] = useState(false)
  // Optionale Sektionen — kollabiert by default ausser wenn schon befuellt
  const [showRecurrence, setShowRecurrence] = useState(Boolean(initialData.recurrence))
  const [showReminders, setShowReminders] = useState(
    Array.isArray(initialData.reminders) && (initialData.reminders as Reminder[]).length > 0
  )
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(initialData.galleryImageUrls || initialData.price || initialData.ticketUrl)
  )

  // Auto-Endzeit bei Startzeit-Eingabe
  const handleStartChange = (v: string) => {
    setStart(v)
    if (!end && v) {
      const startDate = new Date(v)
      const endDate = new Date(startDate.getTime() + defaultDuration * 60 * 1000)
      setEnd(toDateTimeLocal(endDate.toISOString()))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Hashtags normalisieren: # Prefix sicherstellen, lowercase, dedupe
      const normalizedHashtags = Array.from(
        new Set(
          hashtags
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
            .map((t) => (t.startsWith("#") ? t : `#${t}`))
        )
      )

      // plainDescription aus Markdown (fuer Suche)
      const plainDescription = markdownBody
        .replace(/[#*`>_-]/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\n+/g, " ")
        .trim()
        .slice(0, 500)

      await onSubmit({
        title: title.trim(),
        start: start ? new Date(start).toISOString() : undefined,
        end: end ? new Date(end).toISOString() : undefined,
        allDay,
        markdownBody: markdownBody.trim() || undefined,
        plainDescription: plainDescription || undefined,
        coverImageUrl,
        galleryImageUrls: galleryImageUrls && galleryImageUrls.length > 0 ? galleryImageUrls : undefined,
        location: location && (location.address || location.lat || location.lng) ? location : undefined,
        price: price.trim() || undefined,
        ticketUrl: ticketUrl.trim() || undefined,
        hashtags: normalizedHashtags.length > 0 ? normalizedHashtags : undefined,
        recurrence,
        reminders: reminders.length > 0 ? reminders : undefined,
        calendarId,
      })
    } finally {
      setSaving(false)
    }
  }

  const valid = title.trim().length > 0 && (allDay || start)

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Titel</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z.B. Werkstatt-Treffen" />
      </div>

      {/* Kalender-Auswahl (nur wenn mehrere existieren) */}
      {calendars.length > 1 && (
        <div>
          <Label className="text-xs">Kalender</Label>
          <select
            value={calendarId ?? ""}
            onChange={(e) => setCalendarId(e.target.value || undefined)}
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            {calendars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.data.name}{c.data.type === "location" ? " (Location)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Coverbild */}
      <ImageUploadField
        mode="cover"
        label="Coverbild"
        hint="Wird in der Event-Liste prominent angezeigt"
        value={coverImageUrl}
        onChange={setCoverImageUrl}
      />

      {/* Datum + Zeit (smart) */}
      <div className="space-y-2">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
            />
            <span className="text-xs">Ganztaegig</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={multiDay}
              onChange={(e) => setMultiDay(e.target.checked)}
            />
            <span className="text-xs">Ueber mehrere Tage</span>
          </label>
        </div>

        {!allDay && !multiDay && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Start</Label>
              <Input type="datetime-local" value={start} onChange={(e) => handleStartChange(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Ende</Label>
              <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
        )}

        {allDay && !multiDay && (
          <div>
            <Label className="text-xs">Datum</Label>
            <Input
              type="date"
              value={start.split("T")[0]}
              onChange={(e) => setStart(e.target.value + "T00:00")}
            />
          </div>
        )}

        {multiDay && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Von</Label>
              <Input
                type="date"
                value={start.split("T")[0]}
                onChange={(e) => setStart(e.target.value + "T00:00")}
              />
            </div>
            <div>
              <Label className="text-xs">Bis</Label>
              <Input
                type="date"
                value={end.split("T")[0]}
                onChange={(e) => setEnd(e.target.value + "T23:59")}
              />
            </div>
            {!allDay && (
              <p className="col-span-2 text-[11px] text-muted-foreground/70">
                Mehrtaegige Events laufen ohne Uhrzeit. Aktiviere "Ganztaegig" zur Klarstellung
                oder lass es weg fuer einen offenen Zeitraum.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Beschreibung — Markdown */}
      <div>
        <Label className="text-xs">Beschreibung</Label>
        <MarkdownEditor
          value={markdownBody}
          onChange={setMarkdownBody}
          placeholder="**Was passiert beim Event?** Programm, Ablauf, Mitbringsel..."
          rows={6}
        />
      </div>

      {/* Standort */}
      <div>
        <Label className="text-xs">Standort</Label>
        <LocationField value={location} onChange={setLocation} />
      </div>

      {/* Tags — TagInput mit Enter-Hinzufuegen + Autocomplete */}
      <div>
        <Label className="text-xs">Hashtags</Label>
        <TagInput
          value={hashtags}
          onChange={setHashtags}
          placeholder="Hashtag eingeben + Enter"
          suggestions={availableHashtags ?? []}
          quickSuggestions={8}
        />
      </div>

      {/* Wiederholung — optional */}
      <div className="border rounded-md p-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showRecurrence}
            onChange={(e) => {
              setShowRecurrence(e.target.checked)
              if (!e.target.checked) setRecurrence(undefined)
            }}
          />
          <span className="text-xs font-medium">🔁 Wiederholung</span>
          {recurrence && !showRecurrence && (
            <span className="text-[10px] text-muted-foreground ml-2">aktiviert</span>
          )}
        </label>
        {showRecurrence && (
          <div className="mt-2">
            <RecurrenceEditor value={recurrence} onChange={setRecurrence} />
          </div>
        )}
      </div>

      {/* Erinnerungen — optional */}
      <div className="border rounded-md p-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showReminders}
            onChange={(e) => {
              setShowReminders(e.target.checked)
              if (!e.target.checked) setReminders([])
            }}
          />
          <span className="text-xs font-medium">🔔 Erinnerungen</span>
          {reminders.length > 0 && !showReminders && (
            <span className="text-[10px] text-muted-foreground ml-2">{reminders.length} gesetzt</span>
          )}
        </label>
        {showReminders && (
          <div className="mt-2">
            <ReminderEditor value={reminders} onChange={setReminders} />
          </div>
        )}
      </div>

      {/* Erweiterte Optionen aufklappbar */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {showAdvanced ? "▾" : "▸"} Erweitert (Bilder, Preis, Tickets)
        </button>
        {showAdvanced && (
          <div className="space-y-3 mt-3 pl-2 border-l-2">
            <ImageUploadField
              mode="gallery"
              label="Galerie"
              hint="Zusaetzliche Bilder (max. 10)"
              value={galleryImageUrls}
              onChange={setGalleryImageUrls}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Preis (optional)</Label>
                <Input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="z.B. 12 EUR / Frei"
                />
              </div>
              <div>
                <Label className="text-xs">Ticket-Link</Label>
                <Input
                  type="url"
                  value={ticketUrl}
                  onChange={(e) => setTicketUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t">
        {onDelete ? (
          <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
            Loeschen
          </Button>
        ) : <div />}
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>Abbrechen</Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !valid}>
            {saving ? "Speichern..." : "Speichern"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Helpers
// ============================================================

function computeIsMultiDay(startIso: unknown, endIso: unknown): boolean {
  if (typeof startIso !== "string" || typeof endIso !== "string") return false
  const s = new Date(startIso)
  const e = new Date(endIso)
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return false
  return (
    s.getFullYear() !== e.getFullYear() ||
    s.getMonth() !== e.getMonth() ||
    s.getDate() !== e.getDate()
  )
}

function toDateTimeLocal(iso: unknown): string {
  if (!iso || typeof iso !== "string") return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  // YYYY-MM-DDTHH:MM
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDateTime(d: Date, format: TimeFormat): string {
  const datePart = d.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" })
  const timePart = format === "24h"
    ? d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false })
    : d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  return `${datePart} ${timePart}`
}
