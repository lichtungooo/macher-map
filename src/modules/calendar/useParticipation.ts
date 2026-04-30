import { useMemo, useCallback } from "react"
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"

/**
 * Participation — Teilnahme-Status fuer Events.
 *
 * Datenmodell:
 *   type: "event-participation"
 *   createdBy: <eigene DID>
 *   data: { eventId: string, status: "accepted" | "observing" | "declined" }
 *
 * Pro User + Event genau ein Participation-Item. Beim Statuswechsel:
 * existierendes Item updaten. Beim "Zurueckziehen": Item loeschen.
 */

export const PARTICIPATION_ITEM_TYPE = "event-participation"
export type ParticipationStatus = "accepted" | "observing" | "declined"

export interface ParticipationData {
  eventId: string
  status: ParticipationStatus
}

export function useParticipation(eventId: string) {
  const { data: items } = useItems({ type: PARTICIPATION_ITEM_TYPE })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()
  const { mutate: deleteItem } = useDeleteItem()

  // Eigene Participation fuer dieses Event
  const myItem = useMemo<Item | null>(() => {
    if (!currentUser?.id) return null
    return (
      items.find(
        (it) =>
          it.createdBy === currentUser.id &&
          (it.data as ParticipationData).eventId === eventId
      ) ?? null
    )
  }, [items, currentUser?.id, eventId])

  const myStatus: ParticipationStatus | null = useMemo(() => {
    if (!myItem) return null
    return (myItem.data as ParticipationData).status
  }, [myItem])

  // Statistiken (alle Participations fuer dieses Event)
  const stats = useMemo(() => {
    const eventParticipations = items.filter(
      (it) => (it.data as ParticipationData).eventId === eventId
    )
    let accepted = 0
    let observing = 0
    let declined = 0
    for (const p of eventParticipations) {
      const s = (p.data as ParticipationData).status
      if (s === "accepted") accepted++
      else if (s === "observing") observing++
      else if (s === "declined") declined++
    }
    return { accepted, observing, declined, total: eventParticipations.length }
  }, [items, eventId])

  const setStatus = useCallback(
    async (status: ParticipationStatus) => {
      if (!currentUser?.id) return
      if (myItem) {
        await updateItem(myItem.id, {
          data: { ...myItem.data, status },
        })
      } else {
        await createItem({
          type: PARTICIPATION_ITEM_TYPE,
          createdBy: currentUser.id,
          data: { eventId, status },
        })
      }
    },
    [currentUser?.id, myItem, createItem, updateItem, eventId]
  )

  const clearStatus = useCallback(async () => {
    if (myItem) await deleteItem(myItem.id)
  }, [deleteItem, myItem])

  return { myStatus, stats, setStatus, clearStatus }
}

/**
 * Hook fuer ein Profil-Tab "Meine Termine":
 * gibt eigene Events + angenommene + beobachtete Events zurueck.
 */
export function useMyParticipations() {
  const { data: items } = useItems({ type: PARTICIPATION_ITEM_TYPE })
  const { data: currentUser } = useCurrentUser()

  const myParticipations = useMemo(() => {
    if (!currentUser?.id) return []
    return items.filter((it) => it.createdBy === currentUser.id)
  }, [items, currentUser?.id])

  const acceptedEventIds = useMemo(
    () =>
      new Set(
        myParticipations
          .filter((p) => (p.data as ParticipationData).status === "accepted")
          .map((p) => (p.data as ParticipationData).eventId)
      ),
    [myParticipations]
  )

  const observingEventIds = useMemo(
    () =>
      new Set(
        myParticipations
          .filter((p) => (p.data as ParticipationData).status === "observing")
          .map((p) => (p.data as ParticipationData).eventId)
      ),
    [myParticipations]
  )

  return { acceptedEventIds, observingEventIds }
}
