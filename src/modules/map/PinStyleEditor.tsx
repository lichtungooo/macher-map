import { useState } from "react"
import { Sparkles, Library } from "lucide-react"
import { Button, Label } from "@real-life-stack/toolkit"
import {
  PIN_LIBRARY,
  renderPinHtml,
  type PinShape,
  type PinStyle,
} from "./pin-styles"

/**
 * PinStyleEditor — kompakter Editor fuer einen PinStyle.
 *
 * Aufbau:
 *   - Library-Picker: 12 vorgefertigte Stile (Klick → uebernehmen)
 *   - Form-Auswahl (7 Shapes)
 *   - Farb-Picker
 *   - Border-Farbe
 *   - Glow-Toggle
 */

export interface PinStyleEditorProps {
  value: PinStyle
  onChange: (next: PinStyle) => void
  /** Optionaler Default-Color falls value keinen hat (vom Item-Typ). */
  defaultColor?: string
}

const SHAPES: Array<{ value: PinShape; label: string }> = [
  { value: "drop", label: "Tropfen" },
  { value: "circle", label: "Rund" },
  { value: "square", label: "Eckig" },
  { value: "rounded", label: "Soft" },
  { value: "hexagon", label: "Hexagon" },
  { value: "star", label: "Stern" },
  { value: "diamond", label: "Raute" },
]

export function PinStyleEditor({ value, onChange, defaultColor }: PinStyleEditorProps) {
  const [showLibrary, setShowLibrary] = useState(false)
  const style: PinStyle = { color: value.color || defaultColor || "#E8751A", ...value }

  const set = <K extends keyof PinStyle>(key: K, val: PinStyle[K]) => {
    onChange({ ...style, [key]: val })
  }

  return (
    <div className="space-y-2">
      {/* Live-Preview + Library-Toggle */}
      <div className="flex items-center gap-3 p-2 border rounded-md bg-muted/20">
        <div
          className="shrink-0"
          style={{ width: 40, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}
          dangerouslySetInnerHTML={{ __html: renderPinHtml(style, 36) }}
        />
        <div className="flex-1 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">{shapeLabel(style.shape ?? "drop")}</div>
          <code className="text-[10px]">{style.color}</code>
          {style.glow && <span className="ml-1 text-amber-600">✨ Glow</span>}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowLibrary(!showLibrary)}
          className="text-xs"
        >
          <Library className="h-3 w-3 mr-1" />
          {showLibrary ? "Schliessen" : "Library"}
        </Button>
      </div>

      {/* Library */}
      {showLibrary && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-2 border rounded-md bg-card">
          {PIN_LIBRARY.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                onChange(preset.style)
                setShowLibrary(false)
              }}
              className="flex flex-col items-center gap-1 p-1 rounded hover:bg-muted/50 transition-colors"
              title={preset.label}
            >
              <div
                style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}
                dangerouslySetInnerHTML={{ __html: renderPinHtml(preset.style, 32) }}
              />
              <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                {preset.label.split(" ").pop()}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Shape-Picker */}
      <div>
        <Label className="text-[10px] uppercase text-muted-foreground/70">Form</Label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 mt-1">
          {SHAPES.map((s) => {
            const active = (style.shape ?? "drop") === s.value
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => set("shape", s.value)}
                className={`p-1 rounded border text-[10px] transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <div
                  style={{ width: 24, height: 28, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}
                  dangerouslySetInnerHTML={{
                    __html: renderPinHtml({ ...style, shape: s.value }, 22),
                  }}
                />
                {s.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Color + Border + Glow */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px] uppercase text-muted-foreground/70">Farbe</Label>
          <input
            type="color"
            value={style.color}
            onChange={(e) => set("color", e.target.value)}
            className="h-8 w-full rounded border cursor-pointer"
          />
        </div>
        <div>
          <Label className="text-[10px] uppercase text-muted-foreground/70">Rand</Label>
          <input
            type="color"
            value={style.borderColor ?? "#ffffff"}
            onChange={(e) => set("borderColor", e.target.value)}
            className="h-8 w-full rounded border cursor-pointer"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-muted/30">
        <input
          type="checkbox"
          checked={style.glow ?? false}
          onChange={(e) => set("glow", e.target.checked)}
        />
        <Sparkles className="h-3 w-3 text-amber-500" />
        <span className="text-xs">Glow-Effekt</span>
      </label>
    </div>
  )
}

function shapeLabel(s: PinShape): string {
  const map = SHAPES.find((x) => x.value === s)
  return map?.label ?? "Tropfen"
}
