import L from "leaflet"

// ============================================================
// Bild-Upload-Helfer fuer Pin-Bilder (klein resized, klein base64)
// ============================================================

/**
 * Liest eine Datei ein, skaliert sie auf maximal 128x128 (quadratisches
 * Cover-Crop) und gibt sie als data:image/png-Base64 zurueck.
 * Klein genug, dass mehrere Pins in der Group-Konfig kein Problem sind.
 */
export async function fileToPinImage(file: File, maxSize = 128): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error("FileReader failed"))
    reader.readAsDataURL(file)
  })

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = () => reject(new Error("Bild konnte nicht geladen werden"))
    el.src = dataUrl
  })

  const sourceSize = Math.min(img.width, img.height)
  const sx = (img.width - sourceSize) / 2
  const sy = (img.height - sourceSize) / 2
  const targetSize = Math.min(maxSize, sourceSize)

  const canvas = document.createElement("canvas")
  canvas.width = targetSize
  canvas.height = targetSize
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas-Context nicht verfuegbar")
  ctx.drawImage(img, sx, sy, sourceSize, sourceSize, 0, 0, targetSize, targetSize)

  // PNG fuer Logo-Look (Transparenz), sonst JPEG-Quali 0.85 falls riesig
  return canvas.toDataURL("image/png")
}

/**
 * Pin-Stile — Bibliothek + Renderer.
 *
 * Pin = Form + Farbe + Border + Glow + (optional) Icon.
 * Form ist SVG-Path, der in einen runden/eckigen/Tropfen-Container gerendert wird.
 *
 * Phase D wird das erweitern um "image"-Pins (User-Bild als Pin).
 */

export type PinShape =
  | "drop"          // klassischer Map-Pin (Tropfen)
  | "circle"        // rund
  | "square"        // eckig
  | "rounded"       // abgerundetes Quadrat
  | "hexagon"       // sechseckig
  | "star"          // Stern
  | "diamond"       // Raute

export interface PinStyle {
  /** Pin-Form. Default: "drop" */
  shape?: PinShape
  /** Hauptfarbe (Hex). */
  color: string
  /** Optional Icon-Innenraum: Hex-Farbe (default weiss). */
  iconColor?: string
  /** Border-Farbe (default weiss). */
  borderColor?: string
  /** Border-Dicke in px. Default 3. */
  borderWidth?: number
  /** Glow-Effekt aussen rum. */
  glow?: boolean
  /** Pin-Groesse in px (Hoehe). Default 32. */
  size?: number
  /** Inline-SVG-Inhalt fuer das Icon-Innenraum (optional). */
  iconSvg?: string
  /**
   * Bild-URL (data: oder http://). Wird in die Pin-Form geclippt und
   * uerberlagert das Standard-Icon. Z.B. Werkstatt-Logo als Pin.
   */
  imageUrl?: string
}

// ============================================================
// Library: vordefinierte Stile
// ============================================================

export interface PinStylePreset {
  id: string
  label: string
  style: PinStyle
}

export const PIN_LIBRARY: PinStylePreset[] = [
  { id: "drop-orange",  label: "Tropfen Orange",  style: { shape: "drop",    color: "#E8751A" } },
  { id: "drop-blue",    label: "Tropfen Blau",    style: { shape: "drop",    color: "#3b82f6" } },
  { id: "drop-green",   label: "Tropfen Gruen",   style: { shape: "drop",    color: "#10b981" } },
  { id: "circle-red",   label: "Rund Rot",        style: { shape: "circle",  color: "#ef4444" } },
  { id: "circle-pink",  label: "Rund Pink",       style: { shape: "circle",  color: "#ec4899" } },
  { id: "square-amber", label: "Eckig Amber",     style: { shape: "square",  color: "#f59e0b" } },
  { id: "rounded-teal", label: "Soft Teal",       style: { shape: "rounded", color: "#14b8a6" } },
  { id: "hexagon-purple", label: "Hexagon Lila",  style: { shape: "hexagon", color: "#a855f7" } },
  { id: "hexagon-cyan", label: "Hexagon Cyan",    style: { shape: "hexagon", color: "#06b6d4" } },
  { id: "star-gold",    label: "Stern Gold",      style: { shape: "star",    color: "#eab308" } },
  { id: "diamond-rose", label: "Raute Rose",      style: { shape: "diamond", color: "#f43f5e" } },
  { id: "drop-glow",    label: "Tropfen Glow",    style: { shape: "drop",    color: "#E8751A", glow: true } },
]

// Clipping-Pfade fuer Bild-Pins — pro Shape eine Region, die das Bild beschneidet.
// Bei drop wird das Bild im runden Kopf gerendert (nicht im Schweif).
const IMAGE_CLIP: Record<PinShape, string> = {
  drop:    `<circle cx="16" cy="14" r="12"/>`,
  circle:  `<circle cx="16" cy="16" r="13"/>`,
  square:  `<rect x="3" y="3" width="26" height="26"/>`,
  rounded: `<rect x="4" y="4" width="24" height="24" rx="5" ry="5"/>`,
  hexagon: `<path d="M16 4.5 L26 10 L26 22 L16 27.5 L6 22 L6 10 Z"/>`,
  star:    `<circle cx="16" cy="16" r="9"/>`,
  diamond: `<path d="M16 5 L27 16 L16 27 L5 16 Z"/>`,
}

// Position+Groesse des Bildes pro Shape (die <image>-Box, danach geclipped).
const IMAGE_BOX: Record<PinShape, { x: number; y: number; width: number; height: number }> = {
  drop:    { x: 4, y: 2, width: 24, height: 24 },
  circle:  { x: 3, y: 3, width: 26, height: 26 },
  square:  { x: 3, y: 3, width: 26, height: 26 },
  rounded: { x: 4, y: 4, width: 24, height: 24 },
  hexagon: { x: 6, y: 5, width: 20, height: 22 },
  star:    { x: 7, y: 7, width: 18, height: 18 },
  diamond: { x: 5, y: 5, width: 22, height: 22 },
}

// ============================================================
// Renderer: PinStyle → HTML/SVG → L.DivIcon
// ============================================================

const SHAPE_PATHS: Record<PinShape, { viewBox: string; path: string; anchor: [number, number] }> = {
  drop: {
    viewBox: "0 0 32 40",
    path: "M16 0 C7 0 0 7 0 16 C0 28 16 40 16 40 C16 40 32 28 32 16 C32 7 25 0 16 0 Z",
    anchor: [16, 40],
  },
  circle: {
    viewBox: "0 0 32 32",
    path: "M16 1 A15 15 0 1 0 16 31 A15 15 0 1 0 16 1 Z",
    anchor: [16, 16],
  },
  square: {
    viewBox: "0 0 32 32",
    path: "M2 2 H30 V30 H2 Z",
    anchor: [16, 16],
  },
  rounded: {
    viewBox: "0 0 32 32",
    path: "M8 2 H24 A6 6 0 0 1 30 8 V24 A6 6 0 0 1 24 30 H8 A6 6 0 0 1 2 24 V8 A6 6 0 0 1 8 2 Z",
    anchor: [16, 16],
  },
  hexagon: {
    viewBox: "0 0 32 32",
    path: "M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z",
    anchor: [16, 16],
  },
  star: {
    viewBox: "0 0 32 32",
    path: "M16 2 L19.5 12 L30 12 L21.5 18.5 L24.5 29 L16 22.5 L7.5 29 L10.5 18.5 L2 12 L12.5 12 Z",
    anchor: [16, 16],
  },
  diamond: {
    viewBox: "0 0 32 32",
    path: "M16 2 L30 16 L16 30 L2 16 Z",
    anchor: [16, 16],
  },
}

const DEFAULT_ICON_SVG = `<circle cx="16" cy="14" r="3.5" fill="currentColor" />`

/** Eindeutige ID pro SVG (mehrere Pins koennen gleichzeitig im DOM sein). */
let pinUid = 0
const nextPinId = () => `pin-${++pinUid}`

/** Baut die Bild-Layer (defs + clipped image) — leer wenn kein imageUrl. */
function imageLayer(style: PinStyle, uid: string): { defs: string; layer: string } {
  if (!style.imageUrl) return { defs: "", layer: "" }
  const shape = style.shape ?? "drop"
  const clipId = `${uid}-clip`
  const box = IMAGE_BOX[shape]
  return {
    defs: `<clipPath id="${clipId}">${IMAGE_CLIP[shape]}</clipPath>`,
    layer: `<image href="${style.imageUrl}" x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})" />`,
  }
}

/**
 * Erzeugt ein Leaflet-DivIcon aus einer PinStyle.
 */
export function renderPinIcon(style: PinStyle): L.DivIcon {
  const shape = style.shape ?? "drop"
  const size = style.size ?? 32
  const color = style.color
  const iconColor = style.iconColor ?? "#fff"
  const borderColor = style.borderColor ?? "#fff"
  const borderWidth = style.borderWidth ?? 3
  const glow = style.glow ?? false
  const def = SHAPE_PATHS[shape]
  const aspect = def.viewBox.split(" ").slice(2).map(Number) // [w, h]
  const width = (size * aspect[0]) / aspect[1]
  const height = size

  // Tropfen-Form hat icon-Position oben (nicht zentriert)
  const iconY = shape === "drop" ? 14 : 16

  const uid = nextPinId()
  const glowFilterId = `glow-${uid}`
  const filter = glow ? `filter="url(#${glowFilterId})"` : ""
  const glowDef = glow
    ? `<filter id="${glowFilterId}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="2" /></filter>`
    : ""

  const img = imageLayer(style, uid)

  // Wenn ein Bild gesetzt ist: Standard-Icon weglassen (Bild ersetzt es).
  const innerIcon = style.imageUrl
    ? ""
    : `<g transform="translate(0, ${iconY - 16})" color="${iconColor}">${style.iconSvg ?? DEFAULT_ICON_SVG}</g>`

  // Anchor (Pixel im SVG): Tropfen unten zeigend, andere zentriert
  const anchor: [number, number] = shape === "drop" ? [width / 2, height] : [width / 2, height / 2]

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${def.viewBox}" style="overflow:visible;display:block">
    <defs>${glowDef}${img.defs}</defs>
    <g ${filter}>
      <path d="${def.path}" fill="${color}" stroke="${borderColor}" stroke-width="${borderWidth}" stroke-linejoin="round" />
      ${img.layer}
    </g>
    ${innerIcon}
  </svg>`

  return L.divIcon({
    html: svg,
    className: "macher-pin",
    iconSize: [width, height],
    iconAnchor: anchor,
    popupAnchor: [0, -height + 4],
  })
}

/**
 * Renders a Pin als kleines DOM-Preview (z.B. in der Pin-Library-Auswahl).
 */
export function renderPinHtml(style: PinStyle, size = 32): string {
  const shape = style.shape ?? "drop"
  const def = SHAPE_PATHS[shape]
  const aspect = def.viewBox.split(" ").slice(2).map(Number)
  const width = (size * aspect[0]) / aspect[1]
  const height = size
  const color = style.color
  const iconColor = style.iconColor ?? "#fff"
  const borderColor = style.borderColor ?? "#fff"
  const borderWidth = style.borderWidth ?? 3
  const iconY = shape === "drop" ? 14 : 16

  const uid = nextPinId()
  const img = imageLayer(style, uid)
  const innerIcon = style.imageUrl
    ? ""
    : `<g transform="translate(0, ${iconY - 16})" color="${iconColor}">${style.iconSvg ?? DEFAULT_ICON_SVG}</g>`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${def.viewBox}" style="overflow:visible">
    <defs>${img.defs}</defs>
    <path d="${def.path}" fill="${color}" stroke="${borderColor}" stroke-width="${borderWidth}" stroke-linejoin="round" />
    ${img.layer}
    ${innerIcon}
  </svg>`
}
