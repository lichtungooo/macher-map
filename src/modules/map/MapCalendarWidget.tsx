import { useMemo, useState } from "react"
import { Calendar as CalIcon, ChevronDown, ChevronUp, MapPin } from "lucide-react"
import { useItems, Button } from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"

/**
 * MapCalendarWidget — schwebender Kalender-Auszug auf der Karte.
 *
 * Zeigt die naechsten N Events mit Standort. Kollabiert ist es nur ein
 * kleiner Knopf mit Anzahl. Expandiert eine Liste der naechsten Termine.
 * Klick auf einen Termin → Karte fliegt zum Standort und oeffnet den Pin.
 *
 * Holt sich die Events selbst aus `useItems({ type: "event" })`. Filtert
 * auf zukuenftige Events mit gueltiger location.
 */
export interface MapCalendarWidgetProps {
  /** Wird aufgerufen wenn der User einen Event waehlt — Karte sollte
   *  dorthin fliegen + Pin hervorheben. */
  onEventSelect: (event: { lat: number; lng: number; itemId: string }) => void
  /** Wieviele Termine zeigen wir maximal? Default: 5 */
  limit?: number
}

export function MapCalendarWidget({ onEventSelect, limit = 5 }: MapCalendarWidgetProps) {
  const [open, setOpen] = useState(false)
  const { data: events } = useItems({ type: "event" })

  const upcoming = useMemo(() => {
    const now = Date.now()
    return events
      .filter((e) => {
        const start = e.data.start as string | undefined
        const loc = e.data.location as { lat?: number; lng?: number } | undefined
        if (!start || !loc?.lat || !loc?.lng) return false
        return new Date(start).getTime() >= now
      })
      .sort((a, b) => {
        const aTime = new Date(String(a.data.start)).getTime()
        const bTime = new Date(String(b.data.start)).getTime()
        return aTime - bTime
      })
      .slice(0, limit)
  }, [events, limit])

  if (upcoming.length === 0) return null

  return (
    <div className="absolute top-14 right-3 z-[1000] pointer-events-auto">
      {/* Toggle-Knopf */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className="bg-background/95 backdrop-blur shadow-md border h-8 gap-1.5 px-2.5 text-xs"
        aria-expanded={open}
      >
        <CalIcon className="h-3.5 w-3.5 text-primary" />
        <span className="font-medium">{upcoming.length}</span>
        <span className="text-muted-foreground hidden sm:inline">
          {upcoming.length === 1 ? "Termin" : "Termine"}
        </span>
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </Button>

      {/* Aufgeklappte Liste */}
      {open && (
        <div className="mt-2 bg-background/95 backdrop-blur rounded-md shadow-lg border w-64 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b bg-muted/30">
            <h4 className="text-[11px] font-semibold uppercase text-muted-foreground">
              Naechste Termine
            </h4>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {upcoming.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                onSelect={(ev) => {
                  setOpen(false)
                  onEventSelect(ev)
                }}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ============================================================
// EventRow
// ============================================================

function EventRow({
  event,
  onSelect,
}: {
  event: Item
  onSelect: (ev: { lat: number; lng: number; itemId: string }) => void
}) {
  const start = new Date(String(event.data.start))
  const loc = event.data.location as { lat: number; lng: number; address?: string }
  const title = String(event.data.title ?? "(ohne Titel)")
  const address = loc.address ?? ""

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect({ lat: loc.lat, lng: loc.lng, itemId: event.id })}
        className="w-full px-3 py-2 hover:bg-muted/50 text-left flex items-start gap-2 border-b last:border-b-0 transition-colors"
      >
        <div className="flex-shrink-0 w-10 text-center">
          <div className="text-[9px] uppercase font-semibold text-muted-foreground">
            {start.toLocaleDateString("de-DE", { month: "short" }).replace(".", "")}
          </div>
          <div className="text-base font-bold text-primary leading-tight">
            {start.getDate()}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {start.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium leading-snug line-clamp-2">{title}</div>
          {address && (
            <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{address}</span>
            </div>
          )}
        </div>
      </button>
    </li>
  )
}
