import { useCallback, useMemo, useState } from "react"
import { useGroups, useUpdateGroup, useCurrentUser } from "@real-life-stack/toolkit"
import {
  getRoleFor,
  withRole,
  isAdmin as isAdminOf,
  type SpaceRole,
  type SpaceRoleAssignable,
} from "./roles"

/**
 * Hook fuer Group-Roles im aktiven Space.
 *
 * - `roleOf(did)` → "owner" | "admin" | "member"
 * - `isAdmin(did)` → boolean
 * - `setRole(did, role)` → schreibt nach group.data.roles
 * - `myRole` → Rolle des current Users
 *
 * Schreiben ist nur erlaubt wenn der current User Admin ist; sonst wirft
 * `setRole` einen Fehler.
 */
export function useGroupRoles(spaceId: string | null) {
  const { data: groups } = useGroups()
  const { data: currentUser } = useCurrentUser()
  const updateGroup = useUpdateGroup()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const group = useMemo(
    () => (spaceId ? groups.find((g) => g.id === spaceId) ?? null : null),
    [groups, spaceId]
  )

  const roleOf = useCallback(
    (did: string | null | undefined): SpaceRole => {
      if (!group) return "member"
      return getRoleFor(group, did)
    },
    [group]
  )

  const myRole = useMemo<SpaceRole>(
    () => roleOf(currentUser?.id),
    [roleOf, currentUser?.id]
  )

  const setRole = useCallback(
    async (did: string, nextRole: SpaceRoleAssignable) => {
      if (!group) throw new Error("Kein aktiver Space")
      if (!isAdminOf(group, currentUser?.id)) {
        throw new Error("Nur Admins koennen Rollen aendern")
      }
      if (group.members?.[0] === did) {
        throw new Error("Owner-Rolle kann nicht geaendert werden")
      }
      setError(null)
      setBusy(true)
      try {
        await updateGroup(group.id, { data: withRole(group, did, nextRole) })
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Rolle aendern fehlgeschlagen"
        setError(msg)
        throw err
      } finally {
        setBusy(false)
      }
    },
    [group, currentUser?.id, updateGroup]
  )

  return {
    group,
    roleOf,
    myRole,
    isAdmin: myRole === "owner" || myRole === "admin",
    setRole,
    busy,
    error,
  }
}
