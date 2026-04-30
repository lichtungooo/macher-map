import { useMemo } from "react"
import { ChevronUp, ChevronRight, Layers } from "lucide-react"
import type { Group } from "@real-life-stack/data-interface"
import { findChildSpaces, getSpaceMeta } from "./space-data"

/**
 * SpaceHierarchyBar — kompakte Anzeige der Hierarchie-Position des
 * aktuellen Space.
 *
 * - Bei Sub-Space: "↑ unter Macher"-Knopf, der zurueck zum Parent fuehrt
 * - Bei Root mit Sub-Spaces: kleine Pillen mit den Sub-Spaces zum
 *   schnellen Wechsel
 * - Sonst: nichts
 *
 * Liegt am oberen Rand der Modul-Views (Karte, Kalender, ...) und
 * macht die Position im Spaces-Baum sichtbar.
 */
export interface SpaceHierarchyBarProps {
  group: Group
  allGroups: Group[]
  /** Wechselt zu einem Space (Parent oder Sub-Space). */
  onNavigate: (groupId: string) => void
}

export function SpaceHierarchyBar({ group, allGroups, onNavigate }: SpaceHierarchyBarProps) {
  const meta = getSpaceMeta(group)
  const parent = useMemo(
    () => (meta.parentSpaceId ? allGroups.find((g) => g.id === meta.parentSpaceId) : null),
    [meta.parentSpaceId, allGroups]
  )
  const children = useMemo(() => findChildSpaces(allGroups, group.id), [allGroups, group.id])

  if (!parent && children.length === 0) return null

  return (
    <div className="border-b bg-muted/20 px-4 py-2 flex items-center gap-2 flex-wrap">
      {parent && (
        <button
          type="button"
          onClick={() => onNavigate(parent.id)}
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title={`Zurueck zu ${parent.name}`}
        >
          <ChevronUp className="h-3 w-3" />
          <span>{parent.name}</span>
        </button>
      )}

      {children.length > 0 && (
        <>
          <Layers className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-[11px] text-muted-foreground shrink-0">
            {children.length} Sub-Space{children.length === 1 ? "" : "s"}:
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            {children.slice(0, 6).map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={() => onNavigate(child.id)}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-background border hover:bg-muted/60 hover:border-primary/40 transition-colors"
                title={`Zu ${child.name} wechseln`}
              >
                <span>{child.name}</span>
                <ChevronRight className="h-2.5 w-2.5 opacity-60" />
              </button>
            ))}
            {children.length > 6 && (
              <span className="text-[10px] text-muted-foreground">
                +{children.length - 6} weitere
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
