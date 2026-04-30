import { useCallback } from "react"
import {
  useUpdateGroup,
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
 * Aktuell: Creator-Check (erstes Member ist Owner). Spaeter: Antons Rollen.
 */
export function useIsSpaceAdmin(spaceId: string | null): boolean {
  const { data: currentUser } = useCurrentUser()
  const { data: members } = useMembers(spaceId)

  if (!currentUser?.id || !spaceId || members.length === 0) return false
  return members[0]?.id === currentUser.id
}
