import { useCallback, useMemo } from "react"
import {
  useUpdateGroup,
  useGroups,
  useMembers,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import type { Group } from "@real-life-stack/data-interface"

/**
 * Konfig-Persistenz pro Space + pro Modul.
 *
 * Modul-Konfigs leben in `group.data.moduleConfig[<moduleId>]`.
 * Schreiben geht ueber GroupManager.updateGroup — Antons API.
 *
 * Lese-Reihenfolge:
 *   1. group.data.moduleConfig[moduleId]
 *   2. Default-Config der Modul-Definition (kommt aus Registry)
 *
 * Schreib-Berechtigung: Space-Admin (aktuell: Group-Creator = erstes Member).
 * Spaeter: Antons Roles ("admin", "member") aus group.data.roles.
 */

export function useModuleConfig() {
  const updateGroup = useUpdateGroup()

  const setModuleConfig = useCallback(
    async (group: Group, moduleId: string, config: unknown) => {
      const currentModuleConfigs = (group.data?.moduleConfig as Record<string, unknown> | undefined) ?? {}
      const nextData = {
        ...group.data,
        moduleConfig: {
          ...currentModuleConfigs,
          [moduleId]: config,
        },
      }
      await updateGroup(group.id, { data: nextData })
    },
    [updateGroup]
  )

  return { setModuleConfig }
}

/**
 * Hook: ist der current User Admin im aktiven Space?
 *
 * Owner-Check kommt aus zwei Quellen — defensive gegen verschiedene
 * Connector-Persistenz-Pfade:
 *   1. group.members[0] (LocalConnector / MockConnector)
 *   2. useMembers(spaceId)[0] (Antons WoT-Connector hat einen separaten
 *      Member-Observer, group.members ist dort u.U. nicht befuellt)
 *
 * Zusaetzlich: explizite "admin"-Eintraege in group.data.roles.
 */
export function useIsSpaceAdmin(spaceId: string | null): boolean {
  const { data: currentUser } = useCurrentUser()
  const { data: groups } = useGroups()
  const { data: members } = useMembers(spaceId)

  const group = useMemo(
    () => (spaceId ? groups.find((g) => g.id === spaceId) ?? null : null),
    [groups, spaceId]
  )

  if (!currentUser?.id || !spaceId) return false

  const ownerFromGroup = group?.members?.[0]
  const ownerFromMembers = members[0]?.id
  const ownerId = ownerFromGroup ?? ownerFromMembers
  if (ownerId && ownerId === currentUser.id) return true

  if (group) {
    const roles = (group.data?.roles as Record<string, unknown> | undefined) ?? {}
    if (roles[currentUser.id] === "admin") return true
  }

  return false
}
