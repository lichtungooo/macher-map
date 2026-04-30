import { useCallback, useMemo, useState } from "react"
import {
  useItems,
  useCreateItem,
  useDeleteItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import { MACHER_DEMO_ITEMS, DEMO_FLAG_FIELD } from "./macher-demo-data"

/**
 * Hook fuer Macher-Demo-Daten — Laden + Aufraeumen.
 *
 * Demo-Items sind durch `data.isDemo === true` markiert. Der Hook zaehlt
 * existierende Demo-Items im aktuellen Space und bietet `load()` + `clear()`.
 *
 * Idempotenz-Hinweis: `load()` legt jedes Mal alle Items neu an. Wenn schon
 * Demo-Items existieren, sollte das UI vorher fragen oder erst `clear()` rufen.
 */
export function useMacherDemoData() {
  const { data: allItems } = useItems()
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: deleteItem } = useDeleteItem()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const demoItems = useMemo(
    () => allItems.filter((it) => (it.data as Record<string, unknown>)[DEMO_FLAG_FIELD] === true),
    [allItems]
  )

  const load = useCallback(async () => {
    setError(null)
    setBusy(true)
    try {
      for (const item of MACHER_DEMO_ITEMS) {
        await createItem({
          type: item.type,
          createdBy: currentUser?.id ?? "demo",
          data: item.data,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo-Daten laden fehlgeschlagen")
    } finally {
      setBusy(false)
    }
  }, [createItem, currentUser?.id])

  const clear = useCallback(async () => {
    setError(null)
    setBusy(true)
    try {
      for (const it of demoItems) {
        await deleteItem(it.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo-Daten loeschen fehlgeschlagen")
    } finally {
      setBusy(false)
    }
  }, [deleteItem, demoItems])

  return {
    load,
    clear,
    busy,
    error,
    /** Anzahl der Demo-Items aktuell im Space. */
    count: demoItems.length,
    /** Anzahl der Items, die `load()` anlegen wuerde. */
    totalDefined: MACHER_DEMO_ITEMS.length,
  }
}
