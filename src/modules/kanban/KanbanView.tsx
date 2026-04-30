import { useState, useMemo, useCallback } from "react"
import {
  useConnector,
  useItems,
  useMembers,
  useCurrentUser,
  useUpdateItem,
  useCreateItem,
  useDeleteItem,
  KanbanBoard,
  KanbanToolbar,
  applyKanbanFilter,
  ContentComposer,
  defaultColumns,
  AdaptivePanel,
  CommentSection,
  CommentInput,
  ReactionBar,
} from "@real-life-stack/toolkit"
import type {
  KanbanFilter,
  ContentTypeConfig,
  ContentComposerSubmitData,
  CommentQuote,
} from "@real-life-stack/toolkit"
import type { Item, Relation } from "@real-life-stack/data-interface"
import type { ModuleViewProps } from "../registry"

// ============================================================
// Modul-Konfig
// ============================================================

export interface KanbanModuleConfig {
  /** Spaltennamen + Sortierung (kommt spaeter aus group.data.moduleConfig). */
  columns?: { id: string; label: string }[]
}

const defaultConfig: KanbanModuleConfig = {
  columns: defaultColumns,
}

// ============================================================
// View
// ============================================================

export function KanbanView({ spaceId }: ModuleViewProps<KanbanModuleConfig>) {
  const connector = useConnector()
  const { data: tasks } = useItems({ type: "task" })
  const memberGroupId = spaceId === "__overview__" ? null : (spaceId ?? null)
  const { data: members } = useMembers(memberGroupId)
  const { data: currentUser } = useCurrentUser()
  const { mutate: updateItem } = useUpdateItem()
  const { mutate: createItem } = useCreateItem()
  const { mutate: deleteItem } = useDeleteItem()
  const [filter, setFilter] = useState<KanbanFilter>({
    searchText: "",
    assignedTo: null,
    myTasksOnly: false,
    tags: [],
  })
  const [editItem, setEditItem] = useState<Item | null>(null)

  const filteredTasks = useMemo(
    () => applyKanbanFilter(tasks, filter, currentUser?.id),
    [tasks, filter, currentUser?.id]
  )

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    for (const task of tasks) {
      const taskTags = task.data.tags as string[] | undefined
      if (taskTags) for (const tag of taskTags) tagSet.add(tag)
    }
    return Array.from(tagSet)
  }, [tasks])

  const handleMoveItem = (itemId: string, newStatus: string, position: number) => {
    const item = tasks.find((t) => t.id === itemId)
    if (!item) return
    const columnItems = tasks
      .filter((t) => ((t.data.status as string) ?? "todo") === newStatus && t.id !== itemId)
      .sort((a, b) => ((a.data.position as number) ?? 0) - ((b.data.position as number) ?? 0))
    columnItems.splice(position, 0, item)
    for (let i = 0; i < columnItems.length; i++) {
      const t = columnItems[i]
      updateItem(t.id, { data: { ...t.data, status: newStatus, position: i } })
    }
  }

  const handleCreateTask = useCallback(async () => {
    const newItem = await createItem({
      type: "task",
      createdBy: currentUser?.id ?? "user-1",
      data: { title: "", description: "", status: "todo", position: tasks.length, tags: [] },
    })
    if (newItem) setEditItem(newItem)
  }, [createItem, currentUser?.id, tasks.length])

  const taskContentType: ContentTypeConfig = useMemo(() => ({
    id: "task",
    label: "Task",
    defaultWidgets: ["title", "text", "status", "people", "tags"],
    widgetLabels: { text: "Beschreibung", people: "Zugewiesen" },
    statusOptions: defaultColumns.map((col) => ({ id: col.id, label: col.label })),
    defaultStatus: "todo",
  }), [])

  const handleTaskEdit = useCallback(async (submitData: ContentComposerSubmitData) => {
    if (!editItem) return
    const { data } = submitData
    const relations: Relation[] = (data.people ?? []).map((id) => ({
      predicate: "assignedTo",
      target: `global:${id}`,
    }))
    await updateItem(editItem.id, {
      data: { ...editItem.data, title: data.title, description: data.text, status: data.status, tags: data.tags },
      relations,
    })
  }, [editItem, updateItem])

  const [commentReplyTo, setCommentReplyTo] = useState<CommentQuote | null>(null)
  const [commentSubmit, setCommentSubmit] = useState<((text: string) => Promise<void>) | null>(null)
  const [commentCancel, setCommentCancel] = useState<(() => void) | null>(null)

  // connector wird gerade nicht direkt benutzt — wir holen alles ueber Hooks.
  // Variable bleibt fuer spaetere Capability-Checks (item-groups etc.).
  void connector

  return (
    <div className="space-y-4">
      <KanbanToolbar
        items={tasks}
        users={members}
        currentUserId={currentUser?.id}
        onFilterChange={setFilter}
        onCreateItem={handleCreateTask}
        onEditColumns={() => {}}
      />
      <KanbanBoard
        items={filteredTasks}
        users={members}
        onMoveItem={handleMoveItem}
        onItemClick={(item) => setEditItem(item)}
      />
      <AdaptivePanel
        open={editItem !== null}
        onClose={() => setEditItem(null)}
        allowedModes={["modal", "sidebar", "drawer"]}
        sidebarWidth="420px"
      >
        {editItem && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto min-h-0">
              <ContentComposer
                key={editItem.id}
                className="p-4"
                contentTypes={[taskContentType]}
                mode="task"
                liveUpdate
                editMode
                onSubmit={handleTaskEdit}
                onDelete={() => { deleteItem(editItem.id); setEditItem(null) }}
                showVisibility={false}
                showPreview={false}
                initialData={{
                  title: String(editItem.data.title ?? ""),
                  text: String(editItem.data.description ?? ""),
                  status: String(editItem.data.status ?? "todo"),
                  tags: (editItem.data.tags as string[]) ?? [],
                  people: (editItem.relations ?? [])
                    .filter((r: Relation) => r.predicate === "assignedTo")
                    .map((r: Relation) => r.target.replace(/^global:/, "")),
                }}
                peopleOptions={members.map((m) => ({ id: m.id, name: m.displayName ?? m.id }))}
                tagSuggestions={availableTags}
              />
              <div className="border-t px-4 pt-3 pb-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">Kommentare</p>
              </div>
              <CommentSection
                itemId={editItem.id}
                renderReactions={(commentId) => <ReactionBar itemId={commentId} />}
                hideInput
                onReplyChange={(replyTo, submit, cancel) => {
                  setCommentReplyTo(replyTo)
                  setCommentSubmit(() => submit)
                  setCommentCancel(() => cancel)
                }}
              />
            </div>
            <CommentInput
              onSubmit={commentSubmit ?? (async () => {})}
              replyTo={commentReplyTo}
              onCancelReply={commentCancel ?? undefined}
            />
          </div>
        )}
      </AdaptivePanel>
    </div>
  )
}

export { defaultConfig as kanbanDefaultConfig }
