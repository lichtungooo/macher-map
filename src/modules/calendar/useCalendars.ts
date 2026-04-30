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
 * Calendar — eigene Kalender-Entitaet (privat / Arbeit / Location-Kalender / shared).
 *
 *   type: "calendar"
 *   data: { name, color, type, isVisible, isDefault?, locationId? }
 *
 * Nutzer haben mehrere Calendars (z.B. "Privat", "Arbeit", "Workshop-Termine").
 * Jeder Calendar hat eigene Farbe + Sichtbarkeits-Toggle.
 * Location-Kalender werden automatisch beim Anlegen einer Location erstellt.
 */

export const CALENDAR_ITEM_TYPE = "calendar"

export type CalendarType = "user" | "location" | "shared"

export interface CalendarItemData {
  name: string
  color: string
  type: CalendarType
  isVisible: boolean
  isDefault?: boolean
  /** Wenn type="location": Referenz auf Location-Item */
  locationId?: string
}

export interface CalendarEntity {
  id: string
  data: CalendarItemData
  createdBy: string
}

export function useCalendars() {
  const { data: items } = useItems({ type: CALENDAR_ITEM_TYPE })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()
  const { mutate: deleteItem } = useDeleteItem()

  const calendars = useMemo<CalendarEntity[]>(
    () =>
      items
        .filter((it) => it.data && typeof it.data === "object" && "name" in it.data)
        .map((it) => ({
          id: it.id,
          data: it.data as CalendarItemData,
          createdBy: it.createdBy,
        })),
    [items]
  )

  const myCalendars = useMemo(
    () => calendars.filter((c) => c.data.type === "user" && c.createdBy === currentUser?.id),
    [calendars, currentUser?.id]
  )

  const locationCalendars = useMemo(
    () => calendars.filter((c) => c.data.type === "location"),
    [calendars]
  )

  const sharedCalendars = useMemo(
    () => calendars.filter((c) => c.data.type === "shared"),
    [calendars]
  )

  const visibleCalendarIds = useMemo(
    () => new Set(calendars.filter((c) => c.data.isVisible).map((c) => c.id)),
    [calendars]
  )

  const defaultCalendar = useMemo(
    () => myCalendars.find((c) => c.data.isDefault) ?? myCalendars[0],
    [myCalendars]
  )

  const createCalendar = useCallback(
    async (data: Omit<CalendarItemData, "isVisible"> & { isVisible?: boolean }) => {
      if (!currentUser?.id) return null
      return await createItem({
        type: CALENDAR_ITEM_TYPE,
        createdBy: currentUser.id,
        data: { isVisible: true, ...data },
      })
    },
    [createItem, currentUser?.id]
  )

  const updateCalendar = useCallback(
    async (id: string, patch: Partial<CalendarItemData>) => {
      const cal = calendars.find((c) => c.id === id)
      if (!cal) return
      await updateItem(id, { data: { ...cal.data, ...patch } })
    },
    [calendars, updateItem]
  )

  const removeCalendar = useCallback(
    async (id: string) => {
      await deleteItem(id)
    },
    [deleteItem]
  )

  const toggleVisibility = useCallback(
    async (id: string) => {
      const cal = calendars.find((c) => c.id === id)
      if (!cal) return
      await updateCalendar(id, { isVisible: !cal.data.isVisible })
    },
    [calendars, updateCalendar]
  )

  return {
    calendars,
    myCalendars,
    locationCalendars,
    sharedCalendars,
    visibleCalendarIds,
    defaultCalendar,
    createCalendar,
    updateCalendar,
    removeCalendar,
    toggleVisibility,
  }
}
