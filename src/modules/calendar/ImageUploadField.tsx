import { useRef } from "react"
import { ImagePlus, X, Plus } from "lucide-react"
import { Button } from "@real-life-stack/toolkit"

/**
 * ImageUploadField — Coverbild ODER Galerie.
 *
 * Bilder werden auf max. 800px (Cover) bzw. 600px (Galerie) resized und
 * als base64 in den Item-Daten gespeichert. Kein externes Storage —
 * passt zur All-WoT-Architektur (Daten leben im WoT-Doc).
 *
 * Limit: max 10 Bilder pro Galerie, jedes ~80-150 KB als base64.
 */

interface ImageUploadFieldBaseProps {
  label?: string
  hint?: string
}

export interface CoverImageFieldProps extends ImageUploadFieldBaseProps {
  mode: "cover"
  value: string | undefined
  onChange: (next: string | undefined) => void
}

export interface GalleryFieldProps extends ImageUploadFieldBaseProps {
  mode: "gallery"
  value: string[] | undefined
  onChange: (next: string[] | undefined) => void
  max?: number
}

export type ImageUploadFieldProps = CoverImageFieldProps | GalleryFieldProps

export function ImageUploadField(props: ImageUploadFieldProps) {
  if (props.mode === "cover") return <CoverImageField {...props} />
  return <GalleryField {...props} />
}

// ============================================================
// Cover-Image
// ============================================================

function CoverImageField({ label, hint, value, onChange }: CoverImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return
    try {
      const { resizeImage } = await import("@real-life-stack/toolkit/lib/image-utils")
      const base64 = await resizeImage(file, 800, 0.8)
      onChange(base64)
    } catch (err) {
      console.error("[CoverImage] resize failed", err)
    }
    e.target.value = ""
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
      )}
      {value ? (
        <div className="relative group rounded-md overflow-hidden border bg-muted">
          <img src={value} alt="Coverbild" className="w-full aspect-[16/9] object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onChange(undefined)}
            title="Coverbild entfernen"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-[16/9] border-2 border-dashed border-border rounded-md hover:border-primary/50 hover:bg-muted/30 flex flex-col items-center justify-center text-muted-foreground transition-colors"
        >
          <ImagePlus className="h-6 w-6 mb-1" />
          <span className="text-xs">Coverbild hochladen</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      {hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}
    </div>
  )
}

// ============================================================
// Galerie
// ============================================================

function GalleryField({ label, hint, value, onChange, max = 10 }: GalleryFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const images = value ?? []

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const remaining = max - images.length
    const filesToProcess = files.slice(0, remaining)
    try {
      const { resizeImage } = await import("@real-life-stack/toolkit/lib/image-utils")
      const newImages = await Promise.all(
        filesToProcess
          .filter((f) => f.type.startsWith("image/"))
          .map((f) => resizeImage(f, 600, 0.8))
      )
      onChange([...images, ...newImages])
    } catch (err) {
      console.error("[Gallery] resize failed", err)
    }
    e.target.value = ""
  }

  const removeAt = (index: number) => {
    const next = images.filter((_, i) => i !== index)
    onChange(next.length > 0 ? next : undefined)
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            {label} ({images.length}/{max})
          </span>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, i) => (
          <div key={i} className="relative group aspect-square rounded-md overflow-hidden border bg-muted">
            <img src={img} alt="" className="w-full h-full object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeAt(i)}
              title="Entfernen"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-border rounded-md hover:border-primary/50 hover:bg-muted/30 flex items-center justify-center text-muted-foreground transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />
      {hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}
    </div>
  )
}
