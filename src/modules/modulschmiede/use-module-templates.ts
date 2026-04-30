import { useMemo, useCallback } from "react"
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import type { ModuleSchema } from "../schema-types"

/**
 * Module-Templates leben als Items im WoT-Doc:
 *   type: "module-template"
 *   data: ModuleSchema (das vollstaendige Schema)
 *
 * Items sind sichtbar fuer alle Members des Spaces; geforkt werden kann
 * cross-Space ueber `data.forkedFrom`.
 */

export const MODULE_TEMPLATE_ITEM_TYPE = "module-template"

/**
 * Hook: alle gespeicherten Module-Templates laden + CRUD-Helfer.
 */
export function useModuleTemplates() {
  const { data: items } = useItems({ type: MODULE_TEMPLATE_ITEM_TYPE })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()
  const { mutate: deleteItem } = useDeleteItem()

  /** Alle Schemas als typisierte Liste. */
  const templates = useMemo<Array<{ item: Item; schema: ModuleSchema }>>(
    () =>
      items
        .filter((it) => it.data && typeof it.data === "object")
        .map((it) => ({ item: it, schema: it.data as ModuleSchema }))
        // nur valide Schemas behalten
        .filter((t) => Boolean(t.schema.id && t.schema.label && t.schema.itemType)),
    [items]
  )

  /** Template speichern (neu) oder updaten (existierend per item-id). */
  const saveTemplate = useCallback(
    async (schema: ModuleSchema, existingItemId?: string) => {
      const data = {
        ...schema,
        author: schema.author ?? currentUser?.id,
      }
      if (existingItemId) {
        await updateItem(existingItemId, { data })
      } else {
        await createItem({
          type: MODULE_TEMPLATE_ITEM_TYPE,
          createdBy: currentUser?.id ?? "anonymous",
          data,
        })
      }
    },
    [createItem, updateItem, currentUser?.id]
  )

  /** Template loeschen. */
  const removeTemplate = useCallback(
    async (itemId: string) => {
      await deleteItem(itemId)
    },
    [deleteItem]
  )

  /** Fork eines existierenden Templates — neue Kopie mit eigenem Author. */
  const forkTemplate = useCallback(
    async (source: ModuleSchema, newId?: string) => {
      const forked: ModuleSchema = {
        ...source,
        id: newId ?? `${source.id}-fork-${Date.now().toString(36)}`,
        forkedFrom: source.id,
        author: currentUser?.id,
        version: "0.1.0",
      }
      await createItem({
        type: MODULE_TEMPLATE_ITEM_TYPE,
        createdBy: currentUser?.id ?? "anonymous",
        data: forked,
      })
    },
    [createItem, currentUser?.id]
  )

  return { templates, saveTemplate, removeTemplate, forkTemplate }
}
