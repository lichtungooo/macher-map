import type { Group } from "@real-life-stack/data-interface"

/**
 * Group-Roles — explizite Rollenvergabe pro Space.
 *
 * Daten-Modell:
 *   group.data.roles = { "<did>": "admin" | "member", ... }
 *
 * Owner ist immer das erste Element von `group.members` und implizit Admin —
 * der Eintrag in `roles` ist nicht noetig (aber erlaubt). Owner kann nicht
 * demotet werden.
 *
 * Lese-Reihenfolge fuer eine Person:
 *   1. owner (group.members[0]) → "owner"
 *   2. roles[did] → "admin" | "member"
 *   3. fallback → "member"
 */

export type SpaceRole = "owner" | "admin" | "member"

export type SpaceRoleAssignable = "admin" | "member"

export function getOwnerId(group: Group): string | undefined {
  return group.members?.[0]
}

export function getRolesMap(group: Group): Record<string, SpaceRoleAssignable> {
  const raw = (group.data?.roles as Record<string, unknown> | undefined) ?? {}
  const out: Record<string, SpaceRoleAssignable> = {}
  for (const [did, role] of Object.entries(raw)) {
    if (role === "admin" || role === "member") out[did] = role
  }
  return out
}

export function getRoleFor(group: Group, did: string | null | undefined): SpaceRole {
  if (!did) return "member"
  if (getOwnerId(group) === did) return "owner"
  const roles = getRolesMap(group)
  return roles[did] ?? "member"
}

export function isAdmin(group: Group, did: string | null | undefined): boolean {
  const role = getRoleFor(group, did)
  return role === "owner" || role === "admin"
}

/**
 * Erzeugt ein neues `group.data` mit aktualisierten Rollen. Wenn role
 * `member` ist und der User vorher keine explizite Rolle hatte, wird
 * der Eintrag entfernt (Default ist "member"). Owner-Eintraege werden
 * stillschweigend ignoriert.
 */
export function withRole(
  group: Group,
  did: string,
  nextRole: SpaceRoleAssignable
): Record<string, unknown> {
  if (getOwnerId(group) === did) {
    return group.data ?? {}
  }
  const current = getRolesMap(group)
  const next = { ...current }
  if (nextRole === "member") {
    delete next[did]
  } else {
    next[did] = nextRole
  }
  return {
    ...(group.data ?? {}),
    roles: next,
  }
}

/** Label fuer eine Rolle in UI-Texten. */
export function roleLabel(role: SpaceRole): string {
  switch (role) {
    case "owner":
      return "Owner"
    case "admin":
      return "Admin"
    case "member":
      return "Member"
  }
}
