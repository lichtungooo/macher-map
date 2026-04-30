import { Check, Eye, X, Users } from "lucide-react"
import { Button } from "@real-life-stack/toolkit"
import { useParticipation } from "./useParticipation"

/**
 * ParticipationControls — Buttons "Annehmen / Beobachten / Ablehnen"
 * + Statistik-Anzeige.
 *
 * Wird im Event-Edit-Panel angezeigt. Bei "mein eigenes Event" sieht der
 * Author nur die Statistiken, keine Buttons.
 */

export interface ParticipationControlsProps {
  eventId: string
  /** Wenn der current User der Author ist: keine Buttons, nur Statistik. */
  isOwnEvent?: boolean
}

export function ParticipationControls({ eventId, isOwnEvent }: ParticipationControlsProps) {
  const { myStatus, stats, setStatus, clearStatus } = useParticipation(eventId)

  return (
    <div className="space-y-2 p-3 border rounded-md bg-muted/20">
      {/* Statistiken */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          <strong className="text-foreground">{stats.accepted}</strong> angenommen
        </span>
        {stats.observing > 0 && (
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <strong className="text-foreground">{stats.observing}</strong> beobachten
          </span>
        )}
      </div>

      {/* Action-Buttons (nicht fuer Author) */}
      {!isOwnEvent && (
        <div className="flex gap-1">
          <Button
            variant={myStatus === "accepted" ? "default" : "outline"}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => (myStatus === "accepted" ? clearStatus() : setStatus("accepted"))}
          >
            <Check className="h-3 w-3 mr-1" />
            {myStatus === "accepted" ? "Angenommen ✓" : "Annehmen"}
          </Button>
          <Button
            variant={myStatus === "observing" ? "default" : "outline"}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => (myStatus === "observing" ? clearStatus() : setStatus("observing"))}
          >
            <Eye className="h-3 w-3 mr-1" />
            {myStatus === "observing" ? "Beobachte ✓" : "Beobachten"}
          </Button>
          <Button
            variant={myStatus === "declined" ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => (myStatus === "declined" ? clearStatus() : setStatus("declined"))}
            title="Ablehnen"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Status-Hinweis fuer eigenes Event */}
      {isOwnEvent && (
        <div className="text-[11px] text-muted-foreground/70 italic">
          Dein eigenes Event. Statistik zeigt wer angenommen oder beobachtet.
        </div>
      )}
    </div>
  )
}
