import { useState } from "react"
import { Sparkles, Loader2, X } from "lucide-react"
import { Button } from "@real-life-stack/toolkit"
import { useMacherDemoData } from "./use-demo-data"

/**
 * EmptyDemoBanner — generischer Floating-Hinweis fuer leere Module.
 *
 * Wird gerendert, wenn `visible` true ist und der Space noch keine
 * Demo-Items enthaelt (count === 0). Admins sehen einen Lade-Knopf,
 * Member nur den Hinweis. Wer das Banner schliesst, sieht es in dieser
 * Session nicht mehr.
 */
export interface EmptyDemoBannerProps {
  visible: boolean
  isAdmin: boolean
  /** Ueberschrift, z.B. "Hier wird gleich was los" oder "Noch kein Event geplant" */
  title?: string
  /** Hilfstext fuer Admins (mit Aufforderung zum Demo-Laden) */
  adminText?: string
  /** Hilfstext fuer Member */
  memberText?: string
  /** Falls true: Banner mittig auf der Flaeche (statt am oberen Rand) */
  centered?: boolean
  /** Falls true: Banner liegt im normalen Layout-Flow (statt floating ueber der Karte) */
  inline?: boolean
}

export function EmptyDemoBanner({
  visible,
  isAdmin,
  title = "Hier wird gleich was los",
  adminText = "Lass uns mit einem Demo-Set starten — 19 Werkstaetten, Events und Macher quer durch Deutschland. Du kannst sie jederzeit wieder loeschen.",
  memberText = "Sobald ein Admin Inhalte anlegt, erscheinen sie hier.",
  centered = true,
  inline = false,
}: EmptyDemoBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const { load, busy, count } = useMacherDemoData()

  if (!visible || dismissed || count > 0) return null

  const wrapperClass = inline
    ? "max-w-md mx-auto my-6"
    : `absolute z-[1000] max-w-md w-[90%] sm:w-auto pointer-events-auto ${
        centered
          ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          : "top-6 left-1/2 -translate-x-1/2"
      }`

  return (
    <div className={wrapperClass}>
      <div className="bg-background/95 backdrop-blur rounded-lg shadow-2xl border-2 border-primary/20 p-5 text-center">
        <div className="inline-block p-3 rounded-full bg-primary/10 mb-3">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-base font-semibold mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          {isAdmin ? adminText : memberText}
        </p>

        {isAdmin && (
          <div className="flex gap-2 justify-center">
            <Button type="button" size="sm" onClick={load} disabled={busy} className="text-xs">
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
