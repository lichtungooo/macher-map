import { Search, Filter as FilterIcon, X, Tag, User as UserIcon, Check, Eye } from "lucide-react"
import { Button, Input } from "@real-life-stack/toolkit"

/**
 * CalendarFilterBar — Suche + Filter fuer den Kalender.
 *
 * Suche: Volltext (Titel + Description + Adresse + Hashtags)
 * Hashtag-Filter: Multi-Select aus den vorhandenen Hashtags
 * Owner-Filter: nur eigene Events
 * Status-Filter: nur angenommen / nur beobachtet / nur eigene / alle
 */

export type CalendarStatusFilter = "all" | "accepted" | "observing" | "mine"

export interface CalendarFilterState {
  search: string
  hashtags: string[]
  status: CalendarStatusFilter
}

export const emptyFilter: CalendarFilterState = {
  search: "",
  hashtags: [],
  status: "all",
}

export interface CalendarFilterBarProps {
  filter: CalendarFilterState
  onChange: (next: CalendarFilterState) => void
  /** Alle vorhandenen Hashtags aus den Events (fuer Autocomplete). */
  availableHashtags: string[]
  /** Anzahl gefilterter Events (fuer Anzeige). */
  resultCount?: number
}

export function CalendarFilterBar({ filter, onChange, availableHashtags, resultCount }: CalendarFilterBarProps) {
  const isActive =
    filter.search.length > 0 || filter.hashtags.length > 0 || filter.status !== "all"

  const reset = () => onChange(emptyFilter)

  const toggleHashtag = (tag: string) => {
    const set = new Set(filter.hashtags)
    if (set.has(tag)) set.delete(tag)
    else set.add(tag)
    onChange({ ...filter, hashtags: Array.from(set) })
  }

  return (
    <div className="space-y-2 border rounded-md p-2 bg-muted/20">
      {/* Suchfeld */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={filter.search}
          onChange={(e) => onChange({ ...filter, search: e.target.value })}
          placeholder="Suche nach Titel, Beschreibung, Ort, Hashtag..."
          className="pl-9 h-9"
        />
      </div>

      {/* Filter-Chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <FilterIcon className="h-3 w-3 text-muted-foreground shrink-0" />

        {/* Status-Filter */}
        {(["all", "mine", "accepted", "observing"] as CalendarStatusFilter[]).map((s) => {
          const active = filter.status === s
          const Icon = s === "mine" ? UserIcon : s === "accepted" ? Check : s === "observing" ? Eye : null
          const label = s === "all" ? "Alle" : s === "mine" ? "Meine" : s === "accepted" ? "Angenommen" : "Beobachtet"
          return (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ ...filter, status: s })}
              className={`inline-flex items-center gap-1 px-2 h-6 rounded-full text-xs transition-colors ${
                active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {Icon && <Icon className="h-3 w-3" />}
              {label}
            </button>
          )
        })}

        {/* Reset */}
        {isActive && (
          <button
            type="button"
            onClick={reset}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Zuruecksetzen
          </button>
        )}
      </div>

      {/* Hashtag-Picker */}
      {availableHashtags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1 border-t border-border/50">
          <Tag className="h-3 w-3 text-muted-foreground shrink-0 mt-1" />
          {availableHashtags.map((tag) => {
            const active = filter.hashtags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleHashtag(tag)}
                className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                  active
                    ? "bg-primary/20 text-primary border border-primary/40"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
      )}

      {/* Result-Count */}
      {resultCount != null && isActive && (
        <div className="text-[11px] text-muted-foreground">{resultCount} Ergebnis{resultCount !== 1 ? "se" : ""}</div>
      )}
    </div>
  )
}

/**
 * Wendet einen CalendarFilterState auf eine Item-Liste an.
 */
export function applyCalendarFilter(
  items: Array<import("@real-life-stack/data-interface").Item>,
  filter: CalendarFilterState,
  context: {
    currentUserId?: string
    acceptedEventIds: Set<string>
    observingEventIds: Set<string>
  }
): Array<import("@real-life-stack/data-interface").Item> {
  const search = filter.search.trim().toLowerCase()
  const wantedHashtags = filter.hashtags

  return items.filter((it) => {
    // Status-Filter
    if (filter.status === "mine" && it.createdBy !== context.currentUserId) return false
    if (filter.status === "accepted" && !context.acceptedEventIds.has(it.id)) return false
    if (filter.status === "observing" && !context.observingEventIds.has(it.id)) return false

    // Hashtag-Filter (Item muss alle gewaehlten Tags haben)
    if (wantedHashtags.length > 0) {
      const itemTags = (it.data.hashtags as string[] | undefined) ?? []
      const hasAll = wantedHashtags.every((t) => itemTags.includes(t))
      if (!hasAll) return false
    }

    // Volltextsuche
    if (search) {
      const haystack = [
        it.data.title,
        it.data.plainDescription,
        it.data.markdownBody,
        ((it.data.location as { address?: string } | undefined)?.address) ?? "",
        ...((it.data.hashtags as string[] | undefined) ?? []),
      ]
        .filter(Boolean)
        .map((s) => String(s).toLowerCase())
        .join(" ")
      if (!haystack.includes(search)) return false
    }

    return true
  })
}

/** Sammelt alle einzigartigen Hashtags aus Items, sortiert. */
export function collectHashtags(items: Array<import("@real-life-stack/data-interface").Item>): string[] {
  const set = new Set<string>()
  for (const it of items) {
    const tags = (it.data.hashtags as string[] | undefined) ?? []
    for (const t of tags) set.add(t)
  }
  return Array.from(set).sort()
}
