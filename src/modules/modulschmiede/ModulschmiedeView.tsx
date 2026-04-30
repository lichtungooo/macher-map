import { useState, useMemo, useCallback } from "react"
import { Plus, Trash2, GitBranch, Save, X, ChevronUp, ChevronDown } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  AdaptivePanel,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@real-life-stack/toolkit"
import type { ModuleViewProps } from "../registry"
import type { ModuleSchema, LayoutDefinition, ActionDefinition } from "../schema-types"
import type { ModuleFieldConfig, FieldType, FieldVisibility } from "../types"
import { useModuleTemplates } from "./use-module-templates"

/**
 * ModulschmiedeView — Konfigurator-UI MVP.
 *
 * Master-Detail:
 *   - Liste aller Templates (gespeichert im Space)
 *   - Click → Editor oeffnet (Felder, Aktionen, Layouts)
 *   - "Neu" → leeres Schema mit minimalem Default
 *   - Save → wird als Item persistiert + erscheint sofort als Tab
 *
 * Phase 4b: Felder-Editor + Metadaten. Layouts/Aktionen kommen in 4c.
 */

export function ModulschmiedeView(_props: ModuleViewProps) {
  const { templates, saveTemplate, removeTemplate, forkTemplate } = useModuleTemplates()
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingSchema, setEditingSchema] = useState<ModuleSchema | null>(null)
  const [showNewDialog, setShowNewDialog] = useState(false)

  const openEditor = (schema: ModuleSchema, itemId: string) => {
    setEditingSchema(schema)
    setEditingItemId(itemId)
  }

  const closeEditor = () => {
    setEditingSchema(null)
    setEditingItemId(null)
  }

  const handleSave = useCallback(async () => {
    if (!editingSchema) return
    await saveTemplate(editingSchema, editingItemId ?? undefined)
    closeEditor()
  }, [editingSchema, editingItemId, saveTemplate])

  const handleNewBlank = (initial: { id: string; label: string; itemType: string }) => {
    const newSchema: ModuleSchema = {
      id: initial.id,
      label: initial.label,
      itemType: initial.itemType,
      fields: [
        { id: "title", label: "Titel", type: "text", visibility: "public", required: true, order: 10 },
      ],
      layouts: [
        { id: "cards", type: "cards", label: "Karten", config: { titleField: "title" } },
      ],
      defaultLayout: "cards",
      actions: [
        { id: "create", label: "Neu", type: "create", placement: ["toolbar"] },
      ],
      filters: [{ fieldId: "title", type: "search", label: "Suche" }],
      version: "0.1.0",
      license: "MIT",
    }
    setEditingSchema(newSchema)
    setEditingItemId(null)
    setShowNewDialog(false)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Modulschmiede</h2>
          <p className="text-sm text-muted-foreground">
            Bau dir eigene Module ohne Code. Schema → Renderer → fertig.
          </p>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Neues Modul
        </Button>
      </div>

      {/* Liste */}
      {templates.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-sm mb-4">Noch keine Module gebaut.</p>
          <Button variant="outline" onClick={() => setShowNewDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Erstes Modul anlegen
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map(({ item, schema }) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openEditor(schema, item.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{schema.label}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {schema.fields.length} Felder
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {schema.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {schema.description}
                  </p>
                )}
                <div className="flex gap-1 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full">
                    /{schema.id}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full">
                    type: {schema.itemType}
                  </span>
                  {schema.forkedFrom && (
                    <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full inline-flex items-center gap-0.5">
                      <GitBranch className="h-2.5 w-2.5" />
                      Fork
                    </span>
                  )}
                </div>
                <div className="flex gap-1 mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => forkTemplate(schema)}
                  >
                    <GitBranch className="h-3 w-3 mr-1" />
                    Fork
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => removeTemplate(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor-Panel */}
      <AdaptivePanel
        open={editingSchema !== null}
        onClose={closeEditor}
        allowedModes={["sidebar", "drawer", "modal"]}
        sidebarWidth="520px"
      >
        {editingSchema && (
          <SchemaEditor
            schema={editingSchema}
            onChange={setEditingSchema}
            onSave={handleSave}
            onCancel={closeEditor}
          />
        )}
      </AdaptivePanel>

      {/* Neues-Modul-Dialog */}
      <NewModuleDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onCreate={handleNewBlank}
        existingIds={templates.map((t) => t.schema.id)}
      />
    </div>
  )
}

// ============================================================
// Schema-Editor (Master-Felder + Felder-Liste)
// ============================================================

function SchemaEditor({
  schema,
  onChange,
  onSave,
  onCancel,
}: {
  schema: ModuleSchema
  onChange: (next: ModuleSchema) => void
  onSave: () => Promise<void>
  onCancel: () => void
}) {
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null)
  const [showAddField, setShowAddField] = useState(false)
  const [saving, setSaving] = useState(false)

  const setMeta = (patch: Partial<ModuleSchema>) => onChange({ ...schema, ...patch })

  const setField = (index: number, field: ModuleFieldConfig) => {
    const next = [...schema.fields]
    next[index] = field
    onChange({ ...schema, fields: next })
  }

  const addField = (field: ModuleFieldConfig) => {
    onChange({ ...schema, fields: [...schema.fields, field] })
    setShowAddField(false)
  }

  const removeField = (index: number) => {
    const next = [...schema.fields]
    next.splice(index, 1)
    onChange({ ...schema, fields: next })
  }

  const moveField = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= schema.fields.length) return
    const next = [...schema.fields]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    // order-Werte aktualisieren
    next.forEach((f, i) => (f.order = (i + 1) * 10))
    onChange({ ...schema, fields: next })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Metadaten */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Modul</h3>
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Label (Tab-Anzeige)</Label>
              <Input
                value={schema.label}
                onChange={(e) => setMeta({ label: e.target.value })}
                placeholder="z.B. Werkzeug-Verleih"
              />
            </div>
            <div>
              <Label className="text-xs">ID (URL-Slug)</Label>
              <Input
                value={schema.id}
                onChange={(e) => setMeta({ id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                placeholder="werkzeug-verleih"
              />
            </div>
            <div>
              <Label className="text-xs">Item-Typ (intern)</Label>
              <Input
                value={schema.itemType}
                onChange={(e) => setMeta({ itemType: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                placeholder="tool-rental"
              />
            </div>
            <div>
              <Label className="text-xs">Beschreibung</Label>
              <Textarea
                value={schema.description ?? ""}
                onChange={(e) => setMeta({ description: e.target.value })}
                placeholder="Worum geht es in dem Modul?"
                className="min-h-16"
              />
            </div>
            <div>
              <Label className="text-xs">Icon (Lucide-Name)</Label>
              <Input
                value={schema.icon ?? ""}
                onChange={(e) => setMeta({ icon: e.target.value })}
                placeholder="z.B. Wrench, ShoppingBag, Trophy"
              />
            </div>
          </div>
        </section>

        {/* Felder */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Felder ({schema.fields.length})</h3>
            <Button size="sm" variant="outline" onClick={() => setShowAddField(true)}>
              <Plus className="h-3 w-3 mr-1" />
              Feld
            </Button>
          </div>
          <div className="space-y-2">
            {schema.fields.map((field, index) => (
              <div
                key={`${field.id}-${index}`}
                className="border rounded-lg p-3 space-y-2 bg-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{field.label}</span>
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {field.type}
                      </span>
                      {field.required && (
                        <span className="text-[10px] text-destructive">*pflicht</span>
                      )}
                    </div>
                    <code className="text-[10px] text-muted-foreground">{field.id}</code>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => moveField(index, -1)}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => moveField(index, 1)}
                      disabled={index === schema.fields.length - 1}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditingFieldIndex(index)}
                    >
                      <span className="text-xs">⚙</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeField(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="border-t p-3 flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          <X className="h-4 w-4 mr-1" />
          Schliessen
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving || !schema.id || !schema.label}>
          <Save className="h-4 w-4 mr-1" />
          {saving ? "Speichern..." : "Speichern"}
        </Button>
      </div>

      {/* Feld-Editor */}
      <FieldEditDialog
        open={editingFieldIndex !== null}
        field={editingFieldIndex !== null ? schema.fields[editingFieldIndex] : null}
        onClose={() => setEditingFieldIndex(null)}
        onSave={(field) => {
          if (editingFieldIndex !== null) setField(editingFieldIndex, field)
          setEditingFieldIndex(null)
        }}
      />

      {/* Neues Feld */}
      <FieldEditDialog
        open={showAddField}
        field={null}
        onClose={() => setShowAddField(false)}
        onSave={(field) => addField(field)}
      />
    </div>
  )
}

// ============================================================
// Field-Editor (ein einzelnes Feld konfigurieren)
// ============================================================

const FIELD_TYPES: Array<{ value: FieldType; label: string }> = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Mehrzeilig" },
  { value: "tags", label: "Tags / Schlagwoerter" },
  { value: "select", label: "Dropdown (Auswahl)" },
  { value: "phone", label: "Telefon" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" },
  { value: "address", label: "Adresse" },
  { value: "number", label: "Zahl" },
  { value: "image", label: "Bild" },
]

const VISIBILITIES: Array<{ value: FieldVisibility; label: string }> = [
  { value: "public", label: "Oeffentlich (alle sehen)" },
  { value: "contacts", label: "Nur Kontakte" },
  { value: "private", label: "Nur ich" },
]

function FieldEditDialog({
  open,
  field,
  onClose,
  onSave,
}: {
  open: boolean
  field: ModuleFieldConfig | null
  onClose: () => void
  onSave: (field: ModuleFieldConfig) => void
}) {
  const [draft, setDraft] = useState<ModuleFieldConfig>(() => fieldDraftOrDefault(field))

  // Reset draft when dialog opens
  useMemo(() => {
    if (open) setDraft(fieldDraftOrDefault(field))
  }, [open, field])

  const set = <K extends keyof ModuleFieldConfig>(key: K, value: ModuleFieldConfig[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogTitle>{field ? "Feld bearbeiten" : "Feld hinzufuegen"}</DialogTitle>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-xs">Label</Label>
            <Input
              value={draft.label}
              onChange={(e) => set("label", e.target.value)}
              placeholder="Anzeige-Name"
            />
          </div>
          <div>
            <Label className="text-xs">ID (Feld-Schluessel)</Label>
            <Input
              value={draft.id}
              onChange={(e) => set("id", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              placeholder="z.B. werkzeug-name"
            />
          </div>
          <div>
            <Label className="text-xs">Typ</Label>
            <select
              value={draft.type}
              onChange={(e) => set("type", e.target.value as FieldType)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              {FIELD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs">Sichtbarkeit</Label>
            <select
              value={draft.visibility}
              onChange={(e) => set("visibility", e.target.value as FieldVisibility)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              {VISIBILITIES.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs">Platzhalter (optional)</Label>
            <Input
              value={draft.placeholder ?? ""}
              onChange={(e) => set("placeholder", e.target.value)}
              placeholder="Beispiel-Text im leeren Feld"
            />
          </div>
          <div>
            <Label className="text-xs">Hilfetext (optional)</Label>
            <Input
              value={draft.hint ?? ""}
              onChange={(e) => set("hint", e.target.value)}
              placeholder="Erklaerung unter dem Feld"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="field-required"
              checked={draft.required ?? false}
              onChange={(e) => set("required", e.target.checked)}
            />
            <Label htmlFor="field-required" className="text-xs cursor-pointer">
              Pflichtfeld
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Abbrechen</Button>
          <Button onClick={() => onSave(draft)} disabled={!draft.id || !draft.label}>
            {field ? "Aktualisieren" : "Hinzufuegen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function fieldDraftOrDefault(field: ModuleFieldConfig | null): ModuleFieldConfig {
  if (field) return { ...field }
  return {
    id: "",
    label: "",
    type: "text",
    visibility: "public",
  }
}

// ============================================================
// Neues-Modul-Dialog (Start-Werte fuer Schema)
// ============================================================

function NewModuleDialog({
  open,
  onOpenChange,
  onCreate,
  existingIds,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (initial: { id: string; label: string; itemType: string }) => void
  existingIds: string[]
}) {
  const [label, setLabel] = useState("")
  const [id, setId] = useState("")
  const [itemType, setItemType] = useState("")

  // ID aus Label ableiten wenn ID leer
  const effectiveId = id || label.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-")
  const effectiveItemType = itemType || effectiveId

  const idCollision = existingIds.includes(effectiveId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogTitle>Neues Modul</DialogTitle>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-xs">Wie soll dein Modul heissen?</Label>
            <Input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="z.B. Werkzeug-Verleih"
            />
          </div>
          <div>
            <Label className="text-xs">URL-Slug (automatisch aus Name)</Label>
            <Input
              value={effectiveId}
              onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            />
            {idCollision && (
              <p className="text-xs text-destructive mt-1">ID existiert bereits</p>
            )}
          </div>
          <div>
            <Label className="text-xs">Item-Typ (was wird gespeichert)</Label>
            <Input
              value={effectiveItemType}
              onChange={(e) => setItemType(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              placeholder="z.B. tool-rental"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button
            onClick={() => onCreate({ id: effectiveId, label, itemType: effectiveItemType })}
            disabled={!label || !effectiveId || !effectiveItemType || idCollision}
          >
            Anlegen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
