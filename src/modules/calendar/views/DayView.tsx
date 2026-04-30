import { useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, Button } from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import type { TimeFormat } from "../CalendarView"
import { expandRecurrence, type RecurrenceRule } from "../recurrence"

/**
 * DayView — Tag mit Stunden-Raster (0-24 Uhr).
 *
 * Events werden vertikal als farbige Bloecke positioniert (Top + Hoehe
 * berechnet aus Start/Ende). Ganztaegige Events stehen oben in einer
 * separaten Leiste.
 */

export interface DayViewProps {
  items: Item[]
  currentDay: Date
  onDayChange: (d: Date) => void
  timeFormat: TimeFormat
  colors: Record<string, string>
  onItemClick: (item: Item) => void
}

const HOUR_HEIGHT = 48 // px pro Stunde

export function DayView({ items, currentDay, onDayChange, timeFormat, colors, onItemClick }: DayViewProps) {
  const dayStart = useMemo(() => {
    const d = new Date(currentDay)
    d.setHours(0, 0, 0, 0)
    return d
  }, [currentDay])

  const dayEnd = useMemo(() => {
    const d = new Date(dayStart)
    d.setHours(23, 59, 59, 999)
    return d
  }, [dayStart])

  // Recurrence expanden auf diesen Tag
  const instances = useMemo(() => {
    const out: Array<{
      item: Item
      start: Date
      end: Date | null
      key: string
    }> = []
    for (const item of items) {
      const baseStart = new Date(String(item.data.start))
      if (isNaN(baseStart.getTime())) continue
      const baseEnd = item.data.end ? new Date(String(item.data.end)) : null
      const rule = item.data.recurrence as RecurrenceRule | undefined
      const expanded = expandRecurrence(baseStart, baseEnd, rule, dayStart, dayEnd)
      for (const inst of expanded) {
        out.push({ item, start: inst.start, end: inst.end, key: `${item.id}#${inst.index}` })
      }
    }
    return out
  }, [items, dayStart, dayEnd])

  const allDayItems = useMemo(
    () => instances.filter((inst) => inst.item.data.allDay),
    [instances]
  )
  const timedItems = useMemo(
    () => instances.filter((inst) => !inst.item.data.allDay),
    [instances]
  )

  const navigate = (delta: number) => {
    const next = new Date(dayStart)
    next.setDate(next.getDate() + delta)
    onDayChange(next)
  }

  const today = new Date()
  const isToday =
    today.getFullYear() === dayStart.getFullYear() &&
    today.getMonth() === dayStart.getMonth() &&
    today.getDate() === dayStart.getDate()

  const formatHour = (h: number) =>
    timeFormat === "24h"
      ? `${h.toString().padStart(2, "0")}:00`
      : h === 0
      ? "12 AM"
      : h < 12
      ? `${h} AM`
      : h === 12
      ? "12 PM"
      : `${h - 12} PM`

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-base">
            {dayStart.toLocaleDateString("de-DE", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDayChange(new Date())}>
              Heute
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Ganztaegige Events oben */}
        {allDayItems.length > 0 && (
          <div className="px-4 py-2 border-b bg-muted/30 space-y-1">
            <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Ganztaegig</div>
            {allDayItems.map((inst) => (
              <button
                key={inst.key}
                onClick={() => onItemClick(inst.item)}
                className="w-full text-left px-2 py-1 rounded text-xs flex items-center gap-2 hover:bg-background/60 transition-colors"
                style={{ background: (colors[inst.item.type] ?? "#888") + "20" }}
              >
                <div
                  className="w-1 h-3 rounded-full shrink-0"
                  style={{ background: colors[inst.item.type] ?? "#888" }}
                />
                <span className="font-medium truncate">{String(inst.item.data.title ?? "(ohne Titel)")}</span>
              </button>
            ))}
          </div>
        )}

        {/* Stunden-Raster */}
        <div className="relative" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
          {/* Stunden-Linien + Beschriftung */}
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              className="absolute left-0 right-0 border-t border-border/40 flex"
              style={{ top: `${h * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
            >
              <div className="w-14 text-[10px] text-muted-foreground text-right pr-2 pt-0.5 shrink-0">
                {formatHour(h)}
              </div>
              <div className="flex-1 border-l border-border/30" />
            </div>
          ))}

          {/* "Jetzt"-Linie */}
          {isToday && (
            <div
              className="absolute left-14 right-2 border-t-2 border-primary z-10"
              style={{ top: `${(today.getHours() + today.getMinutes() / 60) * HOUR_HEIGHT}px` }}
            >
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-primary" />
            </div>
          )}

          {/* Event-Bloecke */}
          <div className="absolute left-14 right-2 top-0 bottom-0 pointer-events-none">
            {timedItems.map((inst) => {
              const startHour = inst.start.getHours() + inst.start.getMinutes() / 60
              const endHour = inst.end
                ? inst.end.getHours() + inst.end.getMinutes() / 60
                : startHour + 1
              const top = startHour * HOUR_HEIGHT
              const height = Math.max(20, (endHour - startHour) * HOUR_HEIGHT)
              const c = colors[inst.item.type] ?? "#888"
              return (
                <button
                  key={inst.key}
                  onClick={() => onItemClick(inst.item)}
                  className="absolute left-1 right-1 rounded text-xs overflow-hidden text-left p-1.5 pointer-events-auto hover:shadow-md transition-shadow"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    background: c + "30",
                    borderLeft: `3px solid ${c}`,
                  }}
                >
                  <div className="font-medium truncate">{String(inst.item.data.title ?? "(ohne Titel)")}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {timeFormat === "24h"
                      ? inst.start.toLocaleTimeString("de-DE", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                      : inst.start.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
