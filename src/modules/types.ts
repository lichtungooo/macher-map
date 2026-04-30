/**
 * Modul-Baukasten — Konfig-Schema
 *
 * Jedes Modul (Profil, Karte, Kalender, Marktplatz, ...) definiert seine
 * konfigurierbaren Felder ueber dieses Schema. Spaces speichern die Konfig
 * in `group.data.moduleConfig[<moduleId>]`.
 *
 * Beispiel Macher-Space:
 *   group.data.moduleConfig.profile.fields = [
 *     { id: "skills", type: "tags", label: "Skills", visibility: "public" },
 *     { id: "offers", type: "tags", label: "Was du anbietest", visibility: "public" },
 *     { id: "address", type: "text", label: "Werkstatt-Adresse", visibility: "contacts" },
 *   ]
 *
 * Spaeter rendert ein generischer Renderer dieses Schema in UI.
 */

/** Sichtbarkeitsstufen — wer darf das Feld sehen? */
export type FieldVisibility = "public" | "contacts" | "private"

/** Renderer-Typ — bestimmt das Input-Element */
export type FieldType =
  | "text"      // einzeilig
  | "textarea"  // mehrzeilig
  | "tags"      // Liste von Strings (Chips/Pills)
  | "phone"     // Telefonnummer
  | "email"     // E-Mail
  | "url"       // Website
  | "address"   // Adresse (spaeter mit Geocoding)
  | "image"     // Bild-Upload
  | "select"    // Dropdown
  | "number"    // Zahl
  | "location"  // Geo-Koordinaten { lat, lng } — wird zu Pin auf Karte

/** Konfiguration eines einzelnen Feldes */
export interface ModuleFieldConfig {
  /** Feld-ID — entspricht dem Schluessel in `item.data` */
  id: string
  /** Anzeige-Label im Editor */
  label: string
  /** Renderer-Typ */
  type: FieldType
  /** Wer darf das Feld sehen? */
  visibility: FieldVisibility
  /** Hilfstext unter dem Feld */
  hint?: string
  /** Platzhalter im Input */
  placeholder?: string
  /** Pflichtfeld? */
  required?: boolean
  /** Vorschlaege bei Tags/Select */
  suggestions?: string[]
  /** Optionen fuer Select */
  options?: Array<{ value: string; label: string }>
  /** Maximale Laenge bei Text/Textarea */
  maxLength?: number
  /** Reihenfolge im Editor (kleinere zuerst) */
  order?: number
}

/** Konfig fuer das Profil-Modul */
export interface ProfileModuleConfig {
  /** Welche Felder sind im Profil verfuegbar? */
  fields: ModuleFieldConfig[]
}

/** Generischer Modul-Konfig-Container — pro Space */
export interface SpaceModuleConfig {
  profile?: ProfileModuleConfig
  // map?: MapModuleConfig (kommt spaeter)
  // calendar?: CalendarModuleConfig (kommt spaeter)
  // marketplace?: MarketplaceModuleConfig (kommt spaeter)
}

/**
 * Liest die Modul-Konfig aus group.data.moduleConfig.
 * Fallback auf default-Config wenn Space keine eigene hat.
 */
export function getProfileConfig(
  groupData: Record<string, unknown> | undefined,
  defaultConfig: ProfileModuleConfig
): ProfileModuleConfig {
  const moduleConfig = groupData?.moduleConfig as SpaceModuleConfig | undefined
  return moduleConfig?.profile ?? defaultConfig
}
