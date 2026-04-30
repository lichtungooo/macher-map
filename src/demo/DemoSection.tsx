import { useState } from "react"
import { Sparkles, Trash2, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@real-life-stack/toolkit"
import { DEMO_BREAKDOWN } from "./macher-demo-data"
import { useMacherDemoData } from "./use-demo-data"

/**
 * DemoSection — Lade- und Aufraeum-UI fuer Macher-Demo-Daten.
 *
 * Zeigt:
 *   - Wieviele Demo-Items aktuell im Space sind
 *   - Was geladen wuerde (Aufschluesselung pro Typ)
 *   - Buttons "Demo-Daten laden" + "Demo-Daten loeschen"
 *
 * Bestaetigung vor dem Laden, falls schon Demo-Items existieren — sonst
 * entstehen Duplikate.
 */
export function DemoSection() {
  const { load, clear, busy, error, count, totalDefined } = useMacherDemoData()
  const [confirmReload, setConfirmReload] = useState(false)

  const handleLoad = async () => {
    if (count > 0 && !confirmReload) {
      setConfirmReload(true)
      return
    }
    setConfirmReload(false)
    await load()
  }

  return (
    <div className="border rounded-md bg-card p-3 space-y-3">
      <div className="flex items-start gap-2">
        <Sparkles className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground">
            Demo-Daten
          </h4>
          <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-snug">
            {totalDefined} vorgefertigte Items quer durch Deutschland — Werkstaetten,
            Events, Macher mit Standort. Perfekt fuer Pitches und zum Spielen.
          </p>
        </div>
      </div>

      {/* Aufschluesselung */}
      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
        {Object.entries(DEMO_BREAKDOWN).map(([type, n]) => (
          <div
            key={type}
            className="border rounded px-2 py-1 bg-muted/30 text-center"
            title={`${n} ${type}`}
          >
            <div className="font-semibold text-foreground">{n}</div>
            <div className="text-muted-foreground/80 truncate">{type}</div>
          </div>
        ))}
      </div>

      {/* Status */}
      {count > 0 && (
        <div className="text-[11px] text-muted-foreground bg-amber-500/5 border border-amber-500/20 rounded px-2 py-1.5">
          {count} Demo-Item{count === 1 ? "" : "s"} aktuell im Space.
        </div>
      )}

      {/* Confirm-Banner */}
      {confirmReload && (
        <div className="border border-amber-500/40 bg-amber-500/10 rounded p-2 text-[11px] flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <div className="text-foreground">
              Schon {count} Demo-Item{count === 1 ? "" : "s"} da.
            </div>
            <div className="text-muted-foreground">
              Trotzdem laden? Es entstehen Duplikate. Sicherer: erst loeschen,
              dann neu laden.
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-[11px] text-destructive bg-destructive/5 border border-destructive/30 rounded px-2 py-1.5">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={handleLoad}
          disabled={busy}
          className="flex-1 text-xs"
        >
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Sparkles className="h-3 w-3 mr-1" />
          )}
          {confirmReload ? "Trotzdem laden" : count > 0 ? "Nochmal laden" : "Laden"}
        </Button>
        {count > 0 && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={clear}
            disabled={busy}
            className="text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Loeschen
          </Button>
        )}
        {confirmReload && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setConfirmReload(false)}
            disabled={busy}
            className="text-xs"
          >
            Abbrechen
          </Button>
        )}
      </div>
    </div>
  )
}
