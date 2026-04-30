import { useState, useMemo } from "react"
import { Download, Calendar, Eye, User as UserIcon } from "lucide-react"
import { Button, useCurrentUser } from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import type { TimeFormat } from "../CalendarView"
import { useMyParticipations } from "../useParticipation"
import { generateIcs, downloadIcs } from "../ics"
import type { RecurrenceRule } from "../recurrence"
import { expandRecurrence, summarizeRecurrence } from "../recurrence"

/**
 * MyEventsView — persoenliche Termin-Uebersicht.
 *
 * Drei Tabs:
 *   - Eigene (createdBy === currentUserId)
 *   - Angenommen (Participation status="accepted")
 *   - Beobachtet (Participation status="observing")
 *
 * Plus ICS-Export-Buttons pro Tab.
 */

export interface MyEventsViewProps {
  items: Item[]
  colors: Record<string, string>
  timeFormat: TimeFormat
  onItemClick: (item: Item) => void
}

type MyTab = "own" | "accepted" | "observing"

export function MyEventsView({ items, colors, timeFormat, onItemClick }: MyEventsViewProps) {
  const [tab, setTab] = useState<MyTab>("own")
  const { data: currentUser } = useCurrentUser()
  const { acceptedEventIds, observingEventIds } = useMyParticipations()

  const grouped = useMemo(() => {
    const own = items.filter((it) => it.createdBy === currentUser?.id)
    const accepted = items.filter((it) => acceptedEventIds.has(it.id))
    const observing = items.filter((it) => observingEventIds.has(it.id))
    return { own, accepted, observing }
  }, [items, currentUser?.id, acceptedEventIds, observingEventIds])

  const activeItems = grouped[tab === "own" ? "own" : tab === "accepted" ? "accepted" : "observing"]

  const handleDownload = () => {
    const ics = generateIcs(activeItems, `Macher-Map: ${tabLabel(tab)}`)
    downloadIcs(ics, `macher-map-${tab}.ics`)
  }

  const handleDownloadAll = () => {
    const all = [...grouped.own, ...grouped.accepted, ...grouped.observing]
    // Dedupe by id
    const unique = Array.from(new Map(all.map((it) => [it.id, it])).values())
    const ics = generateIcs(unique, "Macher-Map: Meine Termine")
    downloadIcs(ics, "macher-map-meine-termine.ics")
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Meine Termine
          </h2>
          <p className="text-xs text-muted-foreground">
            Eigene, angenommene und beobachtete Events. Als ICS-Feed exportieren fuer dein Handy.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownloadAll}>
          <Download className="h-3.5 w-3.5 mr-1" />
          Alle exportieren (.ics)
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["own", "accepted", "observing"] as MyTab[]).map((t) => {
          const Icon = t === "own" ? Calendar : t === "accepted" ? UserIcon : Eye
          const count = grouped[t].length
          const active = tab === t
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 h-9 inline-flex items-center gap-1.5 text-sm border-b-2 -mb-px transition-colors ${
                active
                  ? "border-primary text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tabLabel(t)}
              <span className="text-xs text-muted-foreground/70">({count})</span>
            </button>
          )
        })}

        <div className="flex-1" />

        {activeItems.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download className="h-3 w-3 mr-1" />
            <span className="text-xs">Tab als .ics</span>
          </Button>
        )}
      </div>

      {/* Liste */}
      {activeItems.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          {tab === "own" && "Du hast noch keine Events angelegt."}
          {tab === "accepted" && "Du hast noch keine Events angenommen."}
          {tab === "observing" && "Du beobachtest noch keine Events."}
        </div>
      ) : (
        <div className="space-y-2">
          {sortInstances(activeItems).map((entry) => (
            <EventRow
              key={entry.key}
              item={entry.item}
              start={entry.start}
              colors={colors}
              timeFormat={timeFormat}
              onClick={() => onItemClick(entry.item)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// EventRow
// ============================================================

function EventRow({
  item,
  start,
  colors,
  timeFormat,
  onClick,
}: {
  item: Item
  start: Date
  colors: Record<string, string>
  timeFormat: TimeFormat
  onClick: () => void
}) {
  const loc = item.data.location as { address?: string } | undefined
  const cover = item.data.coverImageUrl as string | undefined
  const hashtags = (item.data.hashtags as string[] | undefined) ?? []
  const rule = item.data.recurrence as RecurrenceRule | undefined

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 border rounded-lg hover:bg-muted/30 transition-colors flex gap-3 items-start"
    >
      <div
        className="w-1 self-stretch rounded-full shrink-0"
        style={{ background: colors[item.type] ?? "#888" }}
      />
      {cover && (
        <img src={cover} alt="" className="w-16 h-16 rounded-md object-cover shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm flex items-center gap-2">
          {String(item.data.title ?? "(ohne Titel)")}
          {rule && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {summarizeRecurrence(rule)}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {start.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          {!item.data.allDay && (
            <span className="ml-2">
              {timeFormat === "24h"
                ? start.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false })
                : start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
            </span>
          )}
          {loc?.address && <span className="ml-2">· {loc.address}</span>}
        </div>
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {hashtags.slice(0, 4).map((t) => (
              <span key={t} className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

// ============================================================
// Helpers
// ============================================================

function tabLabel(t: MyTab): string {
  return t === "own" ? "Eigene" : t === "accepted" ? "Angenommen" : "Beobachtet"
}

/** Items + Recurrence → Liste sortiert nach naechster Instanz. */
function sortInstances(items: Item[]): Array<{ key: string; item: Item; start: Date }> {
  const now = new Date()
  const limit = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

  const out: Array<{ key: string; item: Item; start: Date }> = []
  for (const item of items) {
    const baseStart = new Date(String(item.data.start))
    if (isNaN(baseStart.getTime())) continue
    const baseEnd = item.data.end ? new Date(String(item.data.end)) : null
    const rule = item.data.recurrence as RecurrenceRule | undefined
    const expanded = expandRecurrence(baseStart, baseEnd, rule, now, limit)
    if (expanded.length > 0) {
      // nur die naechste Instanz pro Item zeigen
      out.push({ key: `${item.id}#${expanded[0].index}`, item, start: expanded[0].start })
    } else if (baseStart >= now) {
      out.push({ key: `${item.id}#0`, item, start: baseStart })
    }
  }

  return out.sort((a, b) => a.start.getTime() - b.start.getTime())
}
