import { Lock, Globe, MapPin } from "lucide-react"
import { Input, Label, Textarea } from "@real-life-stack/toolkit"
import type { ModuleFieldConfig } from "../types"
import { TagInput } from "../profile/TagInput"

/**
 * FieldRenderer — rendert ein einzelnes Schema-Feld als Input.
 *
 * Universell genug fuer Profil-Editor, Marktplatz-Form, Modul-Konfigurator.
 * Liest `field.type` und entscheidet welches Input-Element gerendert wird.
 */

export interface FieldRendererProps {
  field: ModuleFieldConfig
  value: unknown
  onChange: (val: unknown) => void
  /** Visibility-Badge ueber dem Feld zeigen? Default: true. */
  showVisibility?: boolean
}

export function FieldRenderer({
  field,
  value,
  onChange,
  showVisibility = true,
}: FieldRendererProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={`field-${field.id}`} className="text-xs text-muted-foreground">
          {field.label}
          {field.required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        {showVisibility && <VisibilityBadge visibility={field.visibility} />}
      </div>

      {renderInput(field, value, onChange)}

      {field.hint && (
        <p className="text-[11px] text-muted-foreground/70">{field.hint}</p>
      )}
    </div>
  )
}

function renderInput(
  field: ModuleFieldConfig,
  value: unknown,
  onChange: (val: unknown) => void
) {
  if (field.type === "tags") {
    return (
      <TagInput
        value={Array.isArray(value) ? (value as string[]) : []}
        onChange={onChange}
        placeholder={field.placeholder}
        suggestions={field.suggestions}
      />
    )
  }

  if (field.type === "textarea") {
    return (
      <Textarea
        id={`field-${field.id}`}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        className="min-h-20"
      />
    )
  }

  if (field.type === "select") {
    return (
      <select
        id={`field-${field.id}`}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
      >
        <option value="">- waehlen -</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    )
  }

  if (field.type === "location") {
    const loc = (value as { lat?: number; lng?: number } | undefined) ?? {}
    const setLat = (v: string) => {
      const num = parseFloat(v)
      onChange({ ...loc, lat: Number.isFinite(num) ? num : undefined })
    }
    const setLng = (v: string) => {
      const num = parseFloat(v)
      onChange({ ...loc, lng: Number.isFinite(num) ? num : undefined })
    }
    const useCurrent = () => {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition((pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      })
    }
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            step="any"
            value={loc.lat ?? ""}
            onChange={(e) => setLat(e.target.value)}
            placeholder="Breitengrad (lat)"
            className="h-9"
          />
          <Input
            type="number"
            step="any"
            value={loc.lng ?? ""}
            onChange={(e) => setLng(e.target.value)}
            placeholder="Laengengrad (lng)"
            className="h-9"
          />
        </div>
        <button
          type="button"
          onClick={useCurrent}
          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
        >
          <MapPin className="h-3 w-3" />
          Aktuellen Standort verwenden
        </button>
      </div>
    )
  }

  // Default: Input mit type-attribute
  const inputType =
    field.type === "phone" ? "tel"
    : field.type === "email" ? "email"
    : field.type === "url" ? "url"
    : field.type === "number" ? "number"
    : "text"

  return (
    <Input
      id={`field-${field.id}`}
      type={inputType}
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      maxLength={field.maxLength}
      className="h-9"
    />
  )
}

export function VisibilityBadge({ visibility }: { visibility: ModuleFieldConfig["visibility"] }) {
  if (visibility === "public") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/70">
        <Globe className="h-2.5 w-2.5" />
        Oeffentlich
      </span>
    )
  }
  if (visibility === "contacts") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-700/80">
        <Lock className="h-2.5 w-2.5" />
        Nur Kontakte
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/70">
      <Lock className="h-2.5 w-2.5" />
      Privat
    </span>
  )
}
