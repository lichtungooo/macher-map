import { useMemo, useCallback } from "react"
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import { useCalendars } from "./useCalendars"

/**
 * Location — Ort/Ortlichkeit mit eigenem Event-Kalender.
 *
 *   type: "location"
 *   data: { name, address, descriptionMarkdown, coverImageUrl, galleryImageUrls,
 *           calendarId, geoLat, geoLng, contactInfo }
 *
 * Beim Anlegen einer Location wird AUTOMATISCH ein Calendar mit
 * type: "location" erstellt und in `data.calendarId` referenziert.
 */

export const LOCATION_ITEM_TYPE = "location"

export interface LocationItemData {
  name: string
  address?: string
  descriptionMarkdown?: string
  plainDescription?: string
  coverImageUrl?: string
  galleryImageUrls?: string[]
  calendarId: string
  geoLat?: number
  geoLng?: number
  contactInfo?: string
}

export interface LocationEntity {
  id: string
  data: LocationItemData
  createdBy: string
}

export function useLocations() {
  const { data: items } = useItems({ type: LOCATION_ITEM_TYPE })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()
  const { mutate: deleteItem } = useDeleteItem()
  const { createCalendar, removeCalendar } = useCalendars()

  const locations = useMemo<LocationEntity[]>(
    () =>
      items
        .filter((it) => it.data && typeof it.data === "object" && "name" in it.data)
        .map((it) => ({
          id: it.id,
          data: it.data as LocationItemData,
          createdBy: it.createdBy,
        })),
    [items]
  )

  /**
   * Legt Location + automatischen Location-Kalender an.
   * Returns das erstellte Location-Item.
   */
  const createLocation = useCallback(
    async (data: Omit<LocationItemData, "calendarId">) => {
      if (!currentUser?.id) return null
      // 1. Location-Kalender erstellen
      const cal = await createCalendar({
        name: data.name,
        color: "#E8751A",
        type: "location",
      })
      if (!cal) return null
      // 2. Location-Item mit calendarId-Referenz erstellen
      const loc = await createItem({
        type: LOCATION_ITEM_TYPE,
        createdBy: currentUser.id,
        data: { ...data, calendarId: cal.id },
      })
      return loc
    },
    [createItem, createCalendar, currentUser?.id]
  )

  const updateLocation = useCallback(
    async (id: string, patch: Partial<LocationItemData>) => {
      const loc = locations.find((l) => l.id === id)
      if (!loc) return
      await updateItem(id, { data: { ...loc.data, ...patch } })
    },
    [locations, updateItem]
  )

  const removeLocation = useCallback(
    async (id: string) => {
      const loc = locations.find((l) => l.id === id)
      // Auch den zugehoerigen Location-Kalender entfernen
      if (loc?.data.calendarId) {
        await removeCalendar(loc.data.calendarId).catch(() => {})
      }
      await deleteItem(id)
    },
    [locations, deleteItem, removeCalendar]
  )

  return { locations, createLocation, updateLocation, removeLocation }
}
