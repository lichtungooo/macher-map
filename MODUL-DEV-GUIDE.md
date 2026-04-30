# Modul-Dev-Guide

Wie baust du ein neues Modul in der Macher-Map? Diese Anleitung beantwortet das fuer beide Modul-Arten.

> Vorab lesen: [CLAUDE.md](CLAUDE.md), [MODULSCHMIEDE.md](MODULSCHMIEDE.md). Wenn du Vision + Architektur schon kennst, los hier.

---

## Welche Modul-Art waehlen?

| Frage | Code-Modul | Daten-Modul |
|-------|-----------|-------------|
| Brauchst du komplexe Logik (Drag-Drop, externe Libs wie Leaflet, eigene Animationen)? | ✅ ja | ❌ nein |
| Reichen Standard-Felder + Cards/List/Map/Calendar? | ❌ nein | ✅ ja |
| Soll der Mensch das Modul anpassen koennen? | nur ueber Code-Update | ja, im Konfigurator |
| Wer soll es bauen? | Programmierer | Mensch + KI im Konfigurator |
| Wo lebt das Modul? | im Repo | als Item im WoT |

**Faustregel:** wenn du Karte / Kanban / Drag-Drop / komplexen State brauchst → Code-Modul.
Sonst Daten-Modul. Bei Unklarheit: erstmal Daten-Modul versuchen, das geht schneller.

---

## Weg A: Daten-Modul ueber Schema bauen (kein Code)

Geht direkt in der App. Du brauchst dafuer **keinen Editor**, **kein Compile**, **kein Repo-Zugang**.

### Schritte

1. App oeffnen → Tab **Modulschmiede**
2. **"Neues Modul"** klicken
3. Eingeben:
   - **Name:** "Werkzeug-Verleih" (Anzeige-Label)
   - **URL-Slug:** automatisch (z.B. "werkzeug-verleih")
   - **Item-Typ:** automatisch (z.B. "werkzeug-verleih")
4. **Anlegen** → Editor oeffnet
5. **Felder hinzufuegen** mit "+ Feld":
   - Typ: text / textarea / tags / select / phone / email / url / location / image / number
   - Sichtbarkeit: public / contacts / private
   - Pflicht? Hint? Placeholder?
6. **Speichern** → erscheint sofort als Tab im Space

### Was geht aktuell (Stand 30.04.2026)

- ✅ Felder definieren mit allen Typen
- ✅ Cards-Layout (Default)
- ✅ Map-Layout (sobald `location`-Feld vorhanden) — Layout-Switcher in der Toolbar
- ✅ Suche ueber Text/Textarea-Felder
- ✅ Pin-Farben pro Wert (per Schema-JSON)
- ❌ Layout-Editor in der Schmiede — aktuell nur Default-Layout aus dem Code
- ❌ Filter-Bar (Select-Filter, Tag-Filter)
- ❌ Custom-Aktionen (Buchen, XP vergeben)

Wenn du was brauchst was die Schmiede noch nicht kann → Code-Modul oder neuen Renderer im Code anlegen.

---

## Weg B: Code-Modul im Repo bauen

Du arbeitest direkt im `macher-map`-Repo. Das ist der Weg fuer komplexe Module.

### Beispiel: ein neues Modul "Kalender"

#### 1. Ordner anlegen

```bash
cd macher-map/src/modules
mkdir calendar
```

#### 2. View-Komponente schreiben (`calendar/CalendarView.tsx`)

```tsx
import { useItems } from "@real-life-stack/toolkit"
import type { ModuleViewProps } from "../registry"

// 1. Konfig-Type definieren (was ist pro Space anpassbar)
export interface CalendarModuleConfig {
  startField?: string       // welches Feld ist Startdatum
  defaultView?: "month" | "week" | "day"
}

const defaultConfig: CalendarModuleConfig = {
  startField: "start",
  defaultView: "month",
}

// 2. View-Komponente — bekommt ModuleViewProps mit config, spaceId, activeGroup
export function CalendarView({ config }: ModuleViewProps<CalendarModuleConfig>) {
  const cfg = { ...defaultConfig, ...(config ?? {}) }
  const { data: events } = useItems({ type: "event" })
  // ... rendern
  return <div>...</div>
}

export { defaultConfig as calendarDefaultConfig }
```

#### 3. ModuleDefinition exportieren (`calendar/index.ts`)

```ts
import { Calendar } from "lucide-react"
import type { ModuleDefinition } from "../registry"
import { CalendarView, calendarDefaultConfig, type CalendarModuleConfig } from "./CalendarView"

export const calendarModule: ModuleDefinition<CalendarModuleConfig> = {
  id: "calendar",
  label: "Kalender",
  icon: Calendar,
  View: CalendarView,
  defaultConfig: calendarDefaultConfig,
  itemTypes: ["event"],
  requiredCapabilities: ["ItemWriter"],
}

export type { CalendarModuleConfig } from "./CalendarView"
```

#### 4. In `MacherApp.tsx` registrieren

```ts
import { calendarModule } from '../modules/calendar'

registerModule(calendarModule)
```

Plus `'calendar'` zu `DEFAULT_MODULE_IDS` oder `ALWAYS_VISIBLE_MODULES` hinzufuegen wenn der Tab automatisch erscheinen soll.

#### 5. Optional: Inline-Konfig (Zahnrad)

```tsx
// CalendarView.tsx
import { useIsSpaceAdmin, useModuleConfig } from "../use-module-config"
import { ModuleSettingsButton } from "../renderers/ModuleSettingsButton"
import { CalendarSettingsPanel } from "./CalendarSettingsPanel"

export function CalendarView({ spaceId, activeGroup, config }: ModuleViewProps<CalendarModuleConfig>) {
  const cfg = { ...defaultConfig, ...(config ?? {}) }
  const isAdmin = useIsSpaceAdmin(spaceId)
  const { setModuleConfig } = useModuleConfig()
  // ...
  return (
    <div className="relative">
      {isAdmin && activeGroup && (
        <div className="absolute top-3 right-3 z-50">
          <ModuleSettingsButton title="Kalender konfigurieren">
            <CalendarSettingsPanel
              config={cfg}
              onSave={async (next) => setModuleConfig(activeGroup, "calendar", next)}
            />
          </ModuleSettingsButton>
        </div>
      )}
      {/* Kalender-UI */}
    </div>
  )
}
```

Settings-Panel ist eine eigene Komponente neben der View — siehe `MapSettingsPanel.tsx` als Vorbild.

#### 6. Build + Test

```bash
pnpm dev      # Vite startet auf 5173
# Browser: http://localhost:5173/app/spaces/__overview__/calendar
```

Wenn Build sauber + Tab erscheint + Click rendert → fertig.

---

## ModuleViewProps — was bekommt jedes Modul

Jede View-Komponente bekommt diese Props (definiert in `registry.ts`):

```ts
interface ModuleViewProps<TConfig = unknown> {
  spaceId: string | null        // aktiver Space (null = Overview)
  activeGroup: Group | null     // Group-Item des aktiven Spaces (null bei Overview)
  allGroups: Group[]            // alle sichtbaren Groups (z.B. fuer Cross-Space-Sicht)
  config: TConfig               // Modul-Konfig aus group.data.moduleConfig[id]
  itemId?: string               // Deep-Link auf ein Item (z.B. fuer Kanban)
  onItemSelect?: (id: string) => void  // Item-Detail in URL pushen
  onItemClose?: () => void      // Item-Detail schliessen
}
```

---

## Item-Typen + Cross-Modul-Schnittstellen

Module sprechen miteinander ueber **Items**. Gleicher Item-Typ → gleiche Daten.

Beispiel:
- **Quest-Modul** speichert Items vom Typ `"quest"` mit Feldern `{ title, start, end, ... }`
- **Kalender-Modul** liest Items vom Typ `"event"` UND `"quest"` mit `start`-Feld
- → Quests erscheinen automatisch im Kalender

Das funktioniert, weil Antons Item-Modell generisch ist. Wenn du ein neues Modul baust, frag dich:
- Welche Item-Typen schreibe ich?
- Welche Item-Typen nutze ich (auch von anderen Modulen)?

Documentiere das in `itemTypes` in der `ModuleDefinition`.

---

## Capabilities pruefen

Nicht jeder Connector kann alles. Wenn dein Modul z.B. `SignedClaimCapable` braucht, pruefe das:

```ts
import { hasSignedClaims } from "@real-life-stack/data-interface"

if (!hasSignedClaims(connector)) {
  return <div>Dieses Modul braucht WoT-Connector</div>
}
```

In `ModuleDefinition` deklariere die Anforderungen mit `requiredCapabilities: ["SignedClaimCapable"]`. Die Registry filtert dann automatisch.

---

## Konventionen

### Datei-Naming
- View-Komponenten: `<Name>View.tsx` (PascalCase)
- Settings-Panels: `<Name>SettingsPanel.tsx`
- Hooks: `use-<name>.ts` (kebab-case)
- Schemas: `<name>-schema.ts`
- Configs: `<name>-config.ts`

### Code-Style
- **Englische Identifier**, deutsche UI-Texte, deutsche Kommentare
- Header-Kommentar in jeder Datei (was tut sie, warum)
- Strict TypeScript — keine `any` ausser bei Item-Daten (die sind dynamisch)
- Keine Verneinungen in UI-Texten ("kraftvolle Sprache" laut Memory)

### Commits
- Ein Modul = ein PR
- Build muss sauber sein (`npx vite build`)
- Mindestens ein Smoke-Test am echten Dev-Server

---

## Wenn was nicht geht

- Build bricht? → Vite-Cache pruefen, evtl. `pnpm dev` neu starten
- Tab erscheint nicht? → `groupModuleIds` in MacherApp pruefen, ggf. zu `ALWAYS_VISIBLE_MODULES` hinzufuegen
- Konfig wird nicht gespeichert? → `useIsSpaceAdmin` returnt false? → User ist nicht Creator des Spaces
- Pin auf Karte fehlt? → Item-`data.location` muss `{ lat: number, lng: number }` haben — keine Strings

---

## Verwandte Dokumente

- [CLAUDE.md](CLAUDE.md) — Projekt-Struktur + Architektur-Stand
- [ARCHITEKTUR.md](ARCHITEKTUR.md) — All-WoT-Entscheidung, was rausgeflogen ist
- [MODULSCHMIEDE.md](MODULSCHMIEDE.md) — Vision + Phasen
- [src/modules/registry.ts](src/modules/registry.ts) — ModuleDefinition Typ
- [src/modules/schema-types.ts](src/modules/schema-types.ts) — ModuleSchema (fuer Daten-Module)
