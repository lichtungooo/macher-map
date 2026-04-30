import { useMemo, useCallback } from "react"
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"

/**
 * Felder, die Antons WoT-Connector ueber `updateMyProfile` ZUSAETZLICH erhaelt
 * (damit Antons Profile-Discovery + andere Geraete davon erfahren).
 * Trotzdem werden ALLE Felder ins Extension-Item geschrieben, weil Antons
 * `doc.profile.*` aktuell nicht zuverlaessig ueber Reload persistiert
 * (Yjs-Storage-Quirk). Lese-Prio: extension > master > currentUser.
 */
export const MASTER_PROFILE_FIELDS = ["name", "bio"] as const

export type MasterProfileField = (typeof MASTER_PROFILE_FIELDS)[number]

export function isMasterField(field: string): field is MasterProfileField {
  return (MASTER_PROFILE_FIELDS as readonly string[]).includes(field)
}

/**
 * Profile-Extension-Item — pro DID genau ein Item mit erweiterten Feldern.
 *
 *   type:      "profile-extension"
 *   createdBy: <eigene DID>
 *   data:      { skills, offers, needs, address, phone, _visibility, ... }
 *
 * Visibility pro Feld wird in `data._visibility` gespeichert:
 *   data._visibility = { phone: "contacts", skills: "public", ... }
 */
export interface ProfileExtensionData {
  [field: string]: unknown
  _visibility?: Record<string, "public" | "contacts" | "private">
}

/**
 * Hook fuer das eigene Profile-Extension-Item.
 *
 * Liest alle profile-extension Items, filtert auf das eigene (createdBy === currentUser.id).
 * Beim Update: erstellt das Item falls noch keins existiert, sonst updated es.
 */
export function useProfileExtension() {
  const { data: extensions } = useItems({ type: "profile-extension" })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()

  const myExtension = useMemo(() => {
    if (!currentUser?.id) return null
    return extensions.find((e) => e.createdBy === currentUser.id) ?? null
  }, [extensions, currentUser?.id])

  const data = useMemo(
    () => (myExtension?.data as ProfileExtensionData | undefined) ?? {},
    [myExtension]
  )

  const update = useCallback(
    async (updates: Partial<ProfileExtensionData>) => {
      if (!currentUser?.id) {
        throw new Error("Kein eingeloggter User")
      }
      if (myExtension) {
        await updateItem(myExtension.id, {
          data: { ...myExtension.data, ...updates },
        })
      } else {
        await createItem({
          type: "profile-extension",
          createdBy: currentUser.id,
          data: updates,
        })
      }
    },
    [myExtension, currentUser?.id, createItem, updateItem]
  )

  return { data, update, exists: myExtension !== null }
}

/**
 * Splittet UI-Updates fuer Dual-Write:
 * - **master**: nur die Felder die Antons WoT-Connector kennt (zusaetzlich an
 *   `updateMyProfile` schicken, damit Profile-Discovery sie hat)
 * - **extension**: ALLE Felder (auch master-Felder), weil Antons Persistenz
 *   aktuell nicht zuverlaessig ist. Extension ist die Source-of-Truth fuer's UI.
 */
export function splitProfileUpdates(updates: Record<string, unknown>) {
  const master: Record<string, unknown> = {}
  const extension: Record<string, unknown> = { ...updates } // alle Felder ins Extension
  for (const [key, val] of Object.entries(updates)) {
    if (isMasterField(key)) master[key] = val
  }
  return { master, extension }
}
