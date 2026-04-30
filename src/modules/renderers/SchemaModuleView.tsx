import { useState, useMemo, useCallback } from "react"
import { Plus, Search, LayoutGrid, List as ListIcon, Map as MapIcon, Settings } from "lucide-react"
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useCurrentUser,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  AdaptivePanel,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import type { ModuleViewProps } from "../registry"
import type { ModuleSchema, CardsLayoutConfig, MapLayoutConfig, LayoutType } from "../schema-types"
import type { ModuleFieldConfig } from "../types"
import { FieldRenderer } from "./FieldRenderer"
import { SchemaMapLayout, findLocationField } from "./SchemaMapLayout"
import { ModuleEditScreen } from "./ModuleEditScreen"
import { SchemaEditor } from "./SchemaEditor"
import { useIsSpaceAdmin } from "../use-module-config"
import { useModuleTemplates } from "../modulschmiede/use-module-templates"

const LAYOUT_ICONS: Record<LayoutType, typeof LayoutGrid> = {
  cards: LayoutGrid,
  list: ListIcon,
  map: MapIcon,
  board: LayoutGrid,
  calendar: LayoutGrid,
  tree: LayoutGrid,
  form: LayoutGrid,
  detail: LayoutGrid,
}

/**
 * SchemaModuleView — generischer Renderer fuer Daten-Module aus Schema.
 *
 * Nimmt ein ModuleSchema und rendert daraus ein vollwertiges Modul:
 * - Items laden (via useItems mit schema.itemType)
 * - Toolbar mit Suche + Create-Action
 * - Layout (aktuell: Cards — weitere Layouts kommen)
 * - Click auf Card → Edit-Dialog mit allen Feldern
 * - Save → updateItem, Delete → deleteItem
 *
 * Filter, Sortierung, weitere Layouts (List, Map, Calendar, Board) folgen.
 */

export interface SchemaModuleViewProps {
  schema: ModuleSchema
  /** Im Preview-Modus wird kein Zahnrad angezeigt (verhindert Inception). */
  isPreview?: boolean
  /** spaceId fuer Admin-Check (im Preview ignoriert). */
  spaceId?: string | null
}

export function SchemaModuleView({ schema, isPreview, spaceId }: SchemaModuleViewProps) {
  const { data: items } = useItems({ type: schema.itemType })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()
  const { mutate: deleteItem } = useDeleteItem()
  const isAdmin = useIsSpaceAdmin(spaceId ?? null)
  const { templates, saveTemplate } = useModuleTemplates()

  const [search, setSearch] = useState("")
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [creating, setCreating] = useState(false)
  const [editScreenOpen, setEditScreenOpen] = useState(false)
  const [activeLayoutId, setActiveLayoutId] = useState<string>(
    schema.defaultLayout ?? schema.layouts[0]?.id ?? "cards"
  )

  // Existierendes Template fuer dieses Schema (falls schon mal editiert)
  const existingTemplate = useMemo(
    () => templates.find((t) => t.schema.id === schema.id),
    [templates, schema.id]
  )

  const handleSaveSchema = useCallback(
    async (next: ModuleSchema) => {
      await saveTemplate(next, existingTemplate?.item.id)
    },
    [saveTemplate, existingTemplate?.item.id]
  )

  const activeLayout = useMemo(
    () => schema.layouts.find((l) => l.id === activeLayoutId) ?? schema.layouts[0],
    [schema.layouts, activeLayoutId]
  )

  const cardsLayout = useMemo(
    () => schema.layouts.find((l) => l.type === "cards"),
    [schema.layouts]
  )
  const cardsConfig = (cardsLayout?.config as CardsLayoutConfig | undefined) ?? {}

  const titleField = cardsConfig.titleField ?? findFirstField(schema.fields, "text")?.id ?? "title"
  const descriptionField = cardsConfig.descriptionField ?? findFirstField(schema.fields, "textarea")?.id
  const badgeFields = cardsConfig.badgeFields ?? []

  // Volltextsuche ueber alle Text/Textarea-Felder
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const s = search.toLowerCase()
    return items.filter((item) =>
      Object.values(item.data).some(
        (v) => typeof v === "string" && v.toLowerCase().includes(s)
      )
    )
  }, [items, search])

  const handleCreate = useCallback(async (data: Record<string, unknown>) => {
    await createItem({
      type: schema.itemType,
      createdBy: currentUser?.id ?? "anonymous",
      data,
    })
    setCreating(false)
  }, [createItem, schema.itemType, currentUser?.id])

  const handleSave = useCallback(async (data: Record<string, unknown>) => {
    if (!editItem) return
    await updateItem(editItem.id, {
      data: { ...editItem.data, ...data },
    })
    setEditItem(null)
  }, [editItem, updateItem])

  const handleDelete = useCallback(async () => {
    if (!editItem) return
    await deleteItem(editItem.id)
    setEditItem(null)
  }, [editItem, deleteItem])

  const createAction = schema.actions.find((a) => a.type === "create")

  return (
    <div className="space-y-4 relative">
      {/* Edit-Screen Vollbild-Overlay */}
      {!isPreview && (
        <ModuleEditScreen<ModuleSchema>
          open={editScreenOpen}
          onClose={() => setEditScreenOpen(false)}
          title={schema.label}
          description="Felder, Layouts, Aktionen"
          initialConfig={schema}
          onSave={handleSaveSchema}
          renderEditor={(draft, setDraft) => (
            <SchemaEditor schema={draft} onChange={setDraft} />
          )}
          renderPreview={(draft) => (
            <div className="p-4">
              <SchemaModuleView schema={draft} isPreview />
            </div>
          )}
        />
      )}

      {/* Toolbar */}
      <div className="flex gap-2 items-center flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Durchsuchen...`}
            className="pl-9"
          />
        </div>
        {/* Zahnrad fuer Admins (NICHT im Preview) */}
        {!isPreview && isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditScreenOpen(true)}
            title={`${schema.label} konfigurieren`}
            aria-label={`${schema.label} konfigurieren`}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
        {/* Layout-Switcher (nur wenn mehr als 1 Layout) */}
        {schema.layouts.length > 1 && (
          <div className="inline-flex rounded-md border bg-muted/30 p-0.5">
            {schema.layouts.map((layout) => {
              const Icon = LAYOUT_ICONS[layout.type] ?? LayoutGrid
              const isActive = layout.id === activeLayoutId
              return (
                <button
                  key={layout.id}
                  onClick={() => setActiveLayoutId(layout.id)}
                  className={`px-2.5 h-8 inline-flex items-center gap-1.5 text-xs rounded transition-colors ${
                    isActive
                      ? "bg-background shadow-sm font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title={layout.label}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{layout.label}</span>
                </button>
              )
            })}
          </div>
        )}
        {createAction && (
          <Button onClick={() => setCreating(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            {createAction.label}
          </Button>
        )}
      </div>

      {/* Layout-Rendering */}
      {activeLayout?.type === "map" ? (
        <SchemaMapLayout
          items={filteredItems}
          config={(activeLayout.config as MapLayoutConfig | undefined) ?? autoMapConfig(schema.fields)}
          fields={schema.fields}
          onItemClick={(item) => setEditItem(item)}
        />
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-sm">
            {search ? "Nichts gefunden." : `Noch keine ${schema.label}.`}
          </p>
          {createAction && !search && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setCreating(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              {createAction.label}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setEditItem(item)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {String(item.data[titleField] ?? "(ohne Titel)")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {descriptionField && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                    {String(item.data[descriptionField] ?? "")}
                  </p>
                )}
                {badgeFields.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {badgeFields.map((fieldId) => {
                      const v = item.data[fieldId]
                      if (!v) return null
                      const field = schema.fields.find((f) => f.id === fieldId)
                      const label = field?.options?.find((o) => o.value === v)?.label ?? String(v)
                      return (
                        <span
                          key={fieldId}
                          className="inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {label}
                        </span>
                      )
                    })}
                    {Array.isArray(item.data.tags) &&
                      (item.data.tags as string[]).slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create-Dialog */}
      <ItemFormDialog
        open={creating}
        onOpenChange={setCreating}
        title={createAction?.label ?? `Neu`}
        fields={schema.fields}
        initialData={{}}
        onSubmit={handleCreate}
      />

      {/* Edit-Panel */}
      <AdaptivePanel
        open={editItem !== null}
        onClose={() => setEditItem(null)}
        allowedModes={["modal", "sidebar", "drawer"]}
        sidebarWidth="420px"
      >
        {editItem && (
          <ItemEditForm
            fields={schema.fields}
            initialData={editItem.data}
            onSubmit={handleSave}
            onDelete={handleDelete}
            onCancel={() => setEditItem(null)}
          />
        )}
      </AdaptivePanel>
    </div>
  )
}

// ============================================================
// Form-Komponenten
// ============================================================

function ItemFormDialog({
  open,
  onOpenChange,
  title,
  fields,
  initialData,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  fields: ModuleFieldConfig[]
  initialData: Record<string, unknown>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogTitle>{title}</DialogTitle>
        <ItemForm
          fields={fields}
          initialData={initialData}
          onSubmit={async (data) => {
            await onSubmit(data)
            onOpenChange(false)
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function ItemEditForm({
  fields,
  initialData,
  onSubmit,
  onDelete,
  onCancel,
}: {
  fields: ModuleFieldConfig[]
  initialData: Record<string, unknown>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onDelete?: () => void
  onCancel: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <ItemForm
          fields={fields}
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onCancel}
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}

function ItemForm({
  fields,
  initialData,
  onSubmit,
  onCancel,
  onDelete,
}: {
  fields: ModuleFieldConfig[]
  initialData: Record<string, unknown>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  onDelete?: () => void
}) {
  const sortedFields = [...fields].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

  const [values, setValues] = useState<Record<string, unknown>>(() => initValues(fields, initialData))
  const [saving, setSaving] = useState(false)

  const setField = (id: string, val: unknown) => {
    setValues((prev) => ({ ...prev, [id]: val }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const cleaned: Record<string, unknown> = {}
      for (const field of fields) {
        const v = values[field.id]
        if (v === undefined || v === null) continue
        if (typeof v === "string" && v.trim() === "") continue
        if (Array.isArray(v) && v.length === 0) continue
        cleaned[field.id] = typeof v === "string" ? v.trim() : v
      }
      await onSubmit(cleaned)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {sortedFields.map((field) => (
          <FieldRenderer
            key={field.id}
            field={field}
            value={values[field.id]}
            onChange={(val) => setField(field.id, val)}
          />
        ))}
      </div>
      <div className="flex justify-between items-center pt-4 border-t">
        {onDelete ? (
          <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
            Loeschen
          </Button>
        ) : <div />}
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
            Abbrechen
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Speichern..." : "Speichern"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Helpers
// ============================================================

function initValues(
  fields: ModuleFieldConfig[],
  data: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const field of fields) {
    const v = data[field.id]
    if (field.type === "tags") {
      out[field.id] = Array.isArray(v) ? v : []
    } else {
      out[field.id] = v ?? ""
    }
  }
  return out
}

function findFirstField(fields: ModuleFieldConfig[], type: ModuleFieldConfig["type"]) {
  return fields.find((f) => f.type === type)
}

/**
 * Wenn ein Schema "map"-Layout hat ohne explizite Config: locationField + titleField raten.
 */
function autoMapConfig(fields: ModuleFieldConfig[]): MapLayoutConfig {
  const locationField = findLocationField(fields)
  const titleField = findFirstField(fields, "text")
  return {
    locationField: locationField?.id ?? "location",
    titleField: titleField?.id,
  }
}

/**
 * Generische ModuleViewProps-Wrapper-Funktion: erstellt aus einem Schema
 * eine View-Komponente die direkt in der Modul-Registry verwendet werden kann.
 *
 * Wenn ein passendes Template-Item existiert (Schema mit gleicher ID wurde
 * schon mal im Zahnrad-Editor gespeichert), wird das Template-Schema
 * verwendet — sonst das hardcoded Schema. So funktioniert "Code-Modul mit
 * editierbarem Schema": initial das Default, nach erstem Edit live aus WoT.
 */
export function makeSchemaModuleView(defaultSchema: ModuleSchema) {
  return function GeneratedModuleView(props: ModuleViewProps) {
    return <SchemaModuleViewWithTemplate defaultSchema={defaultSchema} spaceId={props.spaceId} />
  }
}

function SchemaModuleViewWithTemplate({
  defaultSchema,
  spaceId,
}: {
  defaultSchema: ModuleSchema
  spaceId: string | null
}) {
  const { templates } = useModuleTemplates()
  const liveSchema = useMemo(() => {
    const tpl = templates.find((t) => t.schema.id === defaultSchema.id)
    return tpl?.schema ?? defaultSchema
  }, [templates, defaultSchema])
  return <SchemaModuleView schema={liveSchema} spaceId={spaceId} />
}
