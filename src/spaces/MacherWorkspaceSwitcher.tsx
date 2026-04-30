import { useMemo } from "react"
import { ChevronsUpDown, Home, Plus, Settings, ChevronDown, Compass } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  type Workspace,
} from "@real-life-stack/toolkit"
import type { Group } from "@real-life-stack/data-interface"
import { findChildSpaces, findRootSpaces, getSpaceMeta } from "./space-data"

/**
 * MacherWorkspaceSwitcher — eigener Switcher mit Sub-Space-Hierarchie.
 *
 * Anders als der Toolkit-Default zeigt dieser:
 *   - Overview (alle Werkstaetten) oben
 *   - Root-Spaces in alphabetischer Reihenfolge
 *   - Direkt darunter ihre Sub-Spaces eingerueckt
 *   - Optional: Spaces-Browser-Eintrag fuer Discovery
 */

export interface MacherWorkspaceSwitcherProps {
  workspaces: Workspace[]
  groups: Group[]
  activeWorkspace: Workspace
  onWorkspaceChange: (workspace: Workspace) => void
  onCreateWorkspace?: () => void
  onEditWorkspace?: (workspace: Workspace) => void
  onOpenSpacesBrowser?: () => void
}

export function MacherWorkspaceSwitcher({
  workspaces,
  groups,
  activeWorkspace,
  onWorkspaceChange,
  onCreateWorkspace,
  onEditWorkspace,
  onOpenSpacesBrowser,
}: MacherWorkspaceSwitcherProps) {
  const overviewWorkspace = workspaces.find((w) => w.scope === "overview")
  const isOverviewActive = activeWorkspace.scope === "overview"

  // Hierarchische Sortierung der Group-Workspaces
  const sortedEntries = useMemo(() => {
    const entries: Array<{ workspace: Workspace; depth: number }> = []
    const seen = new Set<string>()
    const groupWorkspaces = workspaces.filter((w) => w.scope !== "overview")

    const groupById = new Map(groups.map((g) => [g.id, g]))
    const wsById = new Map(groupWorkspaces.map((w) => [w.id, w]))

    const visit = (ws: Workspace, depth: number) => {
      if (seen.has(ws.id)) return
      seen.add(ws.id)
      entries.push({ workspace: ws, depth })
      const children = findChildSpaces(groups, ws.id)
      const sortedChildren = [...children].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
      for (const c of sortedChildren) {
        const childWs = wsById.get(c.id)
        if (childWs) visit(childWs, depth + 1)
      }
    }

    // Root-Spaces (kein Parent) — alphabetisch
    const roots = findRootSpaces(groups)
      .filter((g) => wsById.has(g.id))
      .sort((a, b) => a.name.localeCompare(b.name))

    for (const root of roots) {
      const ws = wsById.get(root.id)
      if (ws) visit(ws, 0)
    }

    // Workspaces ohne zugehoerige Group (z.B. orphan) hinten anhaengen
    for (const ws of groupWorkspaces) {
      if (!seen.has(ws.id) && !groupById.has(ws.id)) {
        entries.push({ workspace: ws, depth: 0 })
      }
    }

    return entries
  }, [workspaces, groups])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent">
        {isOverviewActive ? (
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Home className="h-4 w-4 text-primary" />
          </div>
        ) : (
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage
              src={activeWorkspace.avatar}
              alt={activeWorkspace.name}
              className="rounded-lg"
            />
            <AvatarFallback className="text-sm font-semibold rounded-md">
              {getInitials(activeWorkspace.name)}
            </AvatarFallback>
          </Avatar>
        )}
        <span className="hidden sm:inline-block text-lg font-semibold">
          {activeWorkspace.name}
        </span>
        <ChevronsUpDown className="h-4 w-4 opacity-50 hidden sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-72 max-h-[70vh] overflow-y-auto">
        {/* Overview */}
        {overviewWorkspace && (
          <>
            <DropdownMenuItem
              onClick={() => onWorkspaceChange(overviewWorkspace)}
              className="flex items-center gap-2"
            >
              <div className="h-5 w-5 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
                <Home className="h-3 w-3 text-primary" />
              </div>
              <span className="flex-1 font-medium">{overviewWorkspace.name}</span>
              <span className="text-[10px] text-muted-foreground">aggregiert</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Spaces (hierarchisch) */}
        {sortedEntries.length > 0 && (
          <>
            <DropdownMenuLabel>Meine Spaces</DropdownMenuLabel>
            {sortedEntries.map(({ workspace, depth }) => {
              const group = groups.find((g) => g.id === workspace.id)
              const childCount = group ? findChildSpaces(groups, workspace.id).length : 0
              const meta = group ? getSpaceMeta(group) : null
              return (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => onWorkspaceChange(workspace)}
                  className="group/ws flex items-center gap-2"
                  style={{ paddingLeft: `${0.5 + depth * 1}rem` }}
                >
                  {depth > 0 && (
                    <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0 -rotate-90" />
                  )}
                  <Avatar className="h-5 w-5 rounded-sm shrink-0">
                    <AvatarImage
                      src={workspace.avatar}
                      alt={workspace.name}
                      className="rounded-sm object-contain"
                    />
                    <AvatarFallback className="text-xs rounded-sm">
                      {getInitials(workspace.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm leading-tight truncate">{workspace.name}</div>
                    {(childCount > 0 || (meta?.hashtags && meta.hashtags.length > 0)) && (
                      <div className="text-[9px] text-muted-foreground truncate">
                        {childCount > 0 && (
                          <span>
                            {childCount} Sub-Space{childCount === 1 ? "" : "s"}
                          </span>
                        )}
                        {childCount > 0 && meta?.hashtags && meta.hashtags.length > 0 && " · "}
                        {meta?.hashtags && meta.hashtags.length > 0 && (
                          <span>#{meta.hashtags.slice(0, 2).join(" #")}</span>
                        )}
                      </div>
                    )}
                  </div>
                  {onEditWorkspace && (
                    <button
                      type="button"
                      aria-label={`${workspace.name} bearbeiten`}
                      className="rounded p-0.5 opacity-50 hover:opacity-100 hover:bg-accent shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditWorkspace(workspace)
                      }}
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                  )}
                </DropdownMenuItem>
              )
            })}
          </>
        )}

        <DropdownMenuSeparator />

        {onOpenSpacesBrowser && (
          <DropdownMenuItem onClick={onOpenSpacesBrowser} className="flex items-center gap-2">
            <Compass className="h-4 w-4" />
            <span>Spaces entdecken</span>
          </DropdownMenuItem>
        )}

        {onCreateWorkspace && (
          <DropdownMenuItem onClick={onCreateWorkspace} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Neuen Space anlegen</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
