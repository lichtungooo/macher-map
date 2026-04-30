import { useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, Button } from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import type { FirstDayOfWeek } from "../CalendarView"
import { expandRecurrence, type RecurrenceRule } from "../recurrence"

/**
 * YearView — 12 Mini-Monate auf einer Seite.
 *
 * Tage mit Events haben einen Punkt. Klick auf einen Tag → onDaySelect
 * (Aufrufer wechselt typischerweise zur Monatsansicht).
 */

export interface YearViewProps {
  items: Item[]
  currentYear: number
  onYearChange: (year: number) => void
  firstDayOfWeek: FirstDayOfWeek
  onDaySelect?: (d: Date) => void
}

const MONTH_NAMES = [
  "Januar", "Februar", "Maerz", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
]

const WEEKDAYS_MO = ["M", "D", "M", "D", "F", "S", "S"]
const WEEKDAYS_SO = ["S", "M", "D", "M", "D", "F", "S"]

export function YearView({ items, currentYear, onYearChange, firstDayOfWeek, onDaySelect }: YearViewProps) {
  const today = new Date()

  // Alle Event-Tage (yyyy-MM-dd) im ganzen Jahr
  const eventDays = useMemo(() => {
    const yearStart = new Date(currentYear, 0, 1)
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59)
    const set = new Set<string>()

    for (const item of items) {
      const start = new Date(String(item.data.start))
      if (isNaN(start.getTime())) continue
      const end = item.data.end ? new Date(String(item.data.end)) : null
      const rule = item.data.recurrence as RecurrenceRule | undefined
      const instances = expandRecurrence(start, end, rule, yearStart, yearEnd)
      for (const inst of instances) {
        const d = inst.start
        if (d.getFullYear() !== currentYear) continue
        set.add(`${d.getMonth()}-${d.getDate()}`)
      }
    }
    return set
  }, [items, currentYear])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-base">{currentYear}</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onYearChange(currentYear - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onYearChange(today.getFullYear())}
            >
              {today.getFullYear()}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onYearChange(currentYear + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }, (_, monthIdx) => (
            <MiniMonth
              key={monthIdx}
              year={currentYear}
              month={monthIdx}
              eventDays={eventDays}
              today={today}
              firstDayOfWeek={firstDayOfWeek}
              onDaySelect={onDaySelect}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// MiniMonth — kompakte Monatsanzeige
// ============================================================

function MiniMonth({
  year,
  month,
  eventDays,
  today,
  firstDayOfWeek,
  onDaySelect,
}: {
  year: number
  month: number
  eventDays: Set<string>
  today: Date
  firstDayOfWeek: FirstDayOfWeek
  onDaySelect?: (d: Date) => void
}) {
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
  const weekdays = firstDayOfWeek === "monday" ? WEEKDAYS_MO : WEEKDAYS_SO

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const startOffset =
      firstDayOfWeek === "monday" ? (firstDay === 0 ? 6 : firstDay - 1) : firstDay
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    return Array.from({ length: 42 }, (_, i) => {
      const dayNum = i - startOffset + 1
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth
      const hasEvent = inMonth && eventDays.has(`${month}-${dayNum}`)
      const isToday = isCurrentMonth && inMonth && dayNum === today.getDate()
      return { number: dayNum, isCurrentMonth: inMonth, hasEvent, isToday }
    })
  }, [year, month, eventDays, today, isCurrentMonth, firstDayOfWeek])

  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-center">{MONTH_NAMES[month]}</div>
      <div className="grid grid-cols-7 gap-0 text-center">
        {weekdays.map((d, i) => (
          <div key={i} className="text-[8px] text-muted-foreground">{d}</div>
        ))}
        {days.map((d, i) => (
          <button
            key={i}
            type="button"
            disabled={!d.isCurrentMonth}
            onClick={() => d.isCurrentMonth && onDaySelect?.(new Date(year, month, d.number))}
            className={`text-[10px] py-0.5 rounded relative ${
              !d.isCurrentMonth
                ? "text-muted-foreground/20"
                : d.isToday
                ? "bg-primary text-primary-foreground font-semibold"
                : "hover:bg-muted/50"
            }`}
          >
            {d.number}
            {d.hasEvent && !d.isToday && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
