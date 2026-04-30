import { useState } from "react"
import { Sparkles, Loader2, X } from "lucide-react"
import { Button } from "@real-life-stack/toolkit"
import { useMacherDemoData } from "./use-demo-data"

/**
 * EmptyMapBanner — Floating-Hinweis fuer leere Karten-Spaces.
 *
 * Wird nur fuer Admins gerendert und nur wenn `visible` true ist (= keine
 * Marker auf der Karte). Klick auf "Demo-Daten laden" legt 19 Items quer
 * durch DE an. Wer das Banner schliesst, sieht es in dieser Session nicht
 * mehr.
 */
export function EmptyMapBanner({ visible, isAdmin }: { visible: boolean; isAdmin: boolean }) {
  const [dismissed, setDismissed] = useState(false)
  const { load, busy, count } = useMacherDemoData()

  if (!visible || dismissed || count > 0) return null

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] max-w-md w-[90%] sm:w-auto pointer-events-auto">
      <div className="bg-background/95 backdrop-blur rounded-lg shadow-2xl border-2 border-primary/20 p-5 text-center">
        <div className="inline-block p-3 rounded-full bg-primary/10 mb-3">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-base font-semibold mb-1">Hier wird gleich was los</h3>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          Die Karte wartet auf Pins. {isAdmin
            ? "Lass uns mit einem Demo-Set starten — 19 Werkstaetten, Events und Macher quer durch Deutschland. Du kannst sie jederzeit wieder loeschen."
            : "Sobald ein Admin Inhalte anlegt, erscheinen sie hier."}
        </p>

        {isAdmin && (
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              size="sm"
              onClick={load}
              disabled={busy}
              className="text-xs"
            >
              {busy ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3 mr-1" />
              )}
              Demo-Daten laden
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setDismissed(true)}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Spaeter
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
