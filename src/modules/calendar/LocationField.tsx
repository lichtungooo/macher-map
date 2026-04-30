import { Navigation, MapPin } from "lucide-react"
import { Input, Label, Button } from "@real-life-stack/toolkit"

/**
 * LocationField — Adresse mit "In Maps oeffnen"-Button.
 *
 * Vereinfachte Version (April 2026): nur Adresse-Eingabe.
 * Lat/Lng wird automatisch im Hintergrund mitgespeichert wenn die App
 * den Ort z.B. ueber Karten-Klick gesetzt hat — aber nicht im Formular sichtbar.
 *
 * "In Maps oeffnen" oeffnet einen Maps-Link (Google/Apple Maps deeplink mit
 * Adresse oder Geo-Koordinaten). Funktioniert auch auf Mobile fuer Navigation.
 */

export interface EventLocation {
  address?: string
  lat?: number
  lng?: number
}

export interface LocationFieldProps {
  value: EventLocation | undefined
  onChange: (next: EventLocation | undefined) => void
  label?: string
}

export function LocationField({ value, onChange, label }: LocationFieldProps) {
  const loc = value ?? {}

  const setAddress = (address: string) => {
    if (!address && !loc.lat && !loc.lng) onChange(undefined)
    else onChange({ ...loc, address: address || undefined })
  }

  const openInMaps = () => {
    const url = buildMapsUrl(loc)
    if (url) window.open(url, "_blank", "noopener")
  }

  const hasLocation = Boolean(loc.address || (loc.lat != null && loc.lng != null))

  return (
    <div className="space-y-2">
      {label && <Label className="text-xs">{label}</Label>}
      <div className="flex gap-2">
        <Input
          value={loc.address ?? ""}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Adresse oder Ortsname"
          className="h-9 flex-1"
        />
        {hasLocation && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openInMaps}
            title="In Maps oeffnen / Navigation starten"
            className="h-9 px-3"
          >
            <Navigation className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      {loc.lat != null && loc.lng != null && (
        <p className="text-[10px] text-muted-foreground/70 inline-flex items-center gap-1">
          <MapPin className="h-2.5 w-2.5" />
          Standort gesetzt ({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})
        </p>
      )}
    </div>
  )
}

/**
 * Erzeugt einen Maps-Link aus EventLocation.
 * Bei Geo-Koordinaten: Universal-Link der auf Mobile native Maps oeffnet.
 * Sonst: Google-Maps-Suche nach Adresse.
 */
export function buildMapsUrl(loc: EventLocation): string | null {
  if (loc.lat != null && loc.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`
  }
  if (loc.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`
  }
  return null
}
