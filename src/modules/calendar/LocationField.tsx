import { MapPin } from "lucide-react"
import { Input, Label } from "@real-life-stack/toolkit"

/**
 * LocationField — Adresse (frei) + optional Geo-Koordinaten.
 *
 * Spaeter: Geocoding (Adresse → lat/lng), Reverse-Geocoding, Karten-Picker.
 * Aktuell: nur manuelle Eingabe + "Aktuellen Standort" Button.
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
    navigator.geolocation.getCurrentPosition(
      (pos) => onChange({ ...loc, lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.warn("[LocationField] geolocation:", err.message)
    )
  }

  return (
    <div className="space-y-2">
      {label && <Label className="text-xs">{label}</Label>}
      <Input
        value={loc.address ?? ""}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Adresse oder Ortsname"
        className="h-9"
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          step="any"
          value={loc.lat ?? ""}
          onChange={(e) => setLat(e.target.value)}
          placeholder="Breitengrad (lat)"
          className="h-9 text-xs"
        />
        <Input
          type="number"
          step="any"
          value={loc.lng ?? ""}
          onChange={(e) => setLng(e.target.value)}
          placeholder="Laengengrad (lng)"
          className="h-9 text-xs"
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
