import { useState, useMemo } from "react"
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react"
import {
  Button,
  Input,
  Label,
  Textarea,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@real-life-stack/toolkit"
import type { ModuleSchema } from "../schema-types"
import type { ModuleFieldConfig, FieldType, FieldVisibility } from "../types"

/**
 * SchemaEditor — wiederverwendbarer Editor fuer ModuleSchema.
 *
 * **Controlled:** schema + onChange. Save/Cancel handled der Parent (z.B.
 * ModuleEditScreen oder ein Side-Panel mit eigener Save-Logik).
 *
 * Verwendet:
 *   - In Modulschmiede-Tab fuer "Neues Modul anlegen"
 *   - Im Marktplatz-Zahnrad zum Editieren des Marktplatz-Schemas
 *   - Spaeter fuer alle Daten-Module
 */

export interface SchemaEditorProps {
  schema: ModuleSchema
  onChange: (next: ModuleSchema) => void
  /** Sollen Metadaten (Label/ID/Item-Typ/Beschreibung/Icon) editierbar sein? Default: true. */
  showMeta?: boolean
}

export function SchemaEditor({ schema, onChange, showMeta = true }: SchemaEditorProps) {
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null)
  const [showAddField, setShowAddField] = useState(false)

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
    next.forEach((f, i) => (f.order = (i + 1) * 10))
    onChange({ ...schema, fields: next })
  }

  return (
    <div className="space-y-6">
      {/* Metadaten */}
      {showMeta && (
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
      )}

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
            <div key={`${field.id}-${index}`} className="border rounded-lg p-3 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
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
// Field-Editor (intern)
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
  { value: "location", label: "Standort (lat/lng)" },
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

  // Reset draft beim Oeffnen
  useMemo(() => {
    if (open) setDraft(fieldDraftOrDefault(field))
    return null
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
