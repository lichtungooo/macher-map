# Macher-Map

Erster Showroom-Space des Real Life Network. Handwerk und DIY. Live auf [macher-map.org](https://macher-map.org).

Repo: github.com/lichtungooo/macher-map

> **Wichtig fuer Sessions:** Lies in dieser Reihenfolge beim Start:
> 1. Diese Datei
> 2. [ARCHITEKTUR.md](ARCHITEKTUR.md) — All-WoT-Entscheidung, was rausgeflogen ist, Antons Stack
> 3. [MODULSCHMIEDE.md](MODULSCHMIEDE.md) — Vision: Module als Daten + Konfigurator + AI + Marktplatz
> 4. [MODUL-DEV-GUIDE.md](MODUL-DEV-GUIDE.md) — wie baue ich ein neues Modul (Code- oder Daten-Modul)

---

## Dev-Server (FEST — niemals aendern!)

**Port: 5173** mit `strictPort: true` in `vite.config.ts`.

```bash
cd macher-map
pnpm dev
# laeuft auf http://localhost:5173/app/...
```

### Warum fester Port

- **IndexedDB ist origin-gebunden** — wenn der Port wechselt, ist Login + alle Daten weg.
- `strictPort: true` heisst: Vite startet **NUR** auf 5173. Wenn der Port belegt ist: Fehler statt Hop.
- Wenn der Server nicht startet: alten Vite-Prozess beenden (Task-Manager oder `taskkill /F /IM node.exe`), **nicht** einen anderen Port nehmen.

### Port-Belegung im Workspace

| App | Port | Repo |
|-----|------|------|
| **Macher-Map** | **5173** | `macher-map/` |
| **RLS Reference App** | **5174** | `real-life-stack/apps/reference/` |
| **Storybook** | 6006 | `real-life-stack/packages/toolkit/` |

---

## Architektur

Macher-Map ist ein **rein statisches Frontend** auf Antons Real-Life-Stack + Web-of-Trust. Die alte Lichtung-API (REST + JWT) wurde komplett entfernt — siehe [ARCHITEKTUR.md](ARCHITEKTUR.md).

Toolkit-Imports kommen ueber Vite-Aliase aus `../real-life-stack/`:

| Alias | Was |
|-------|-----|
| `@real-life-stack/toolkit` | UI-Komponenten + Hooks + ConnectorProvider |
| `@real-life-stack/data-interface` | Item-Modell + Capability-Interfaces |
| `@real-life-stack/wot-connector` | Web-of-Trust-Connector (E2E-verschluesselt) |
| `@real-life-stack/local-connector` | IndexedDB-Persistenz (Dev/Test) |
| `@real-life-stack/mock-connector` | In-Memory (Stories/Tests) |

### Routing (App.tsx)

```
/                   → LandingPage (statisch)
/app/*              → MacherApp (WoT-App, Hauptarbeit)
/datenschutz        → PrivacyPage
/impressum          → ImpressumPage
```

### MacherApp

In `src/pages/MacherApp.tsx`. Aufgabe:
1. Connector laden (WoT / Local / Mock je nach Setup)
2. Auth-Gate (nur fuer WoT)
3. AppShell mit Navbar + ModuleTabs + UserMenu
4. **Module ueber Registry rendern** (zentrales Pattern, siehe unten)

---

## Modul-System (das Herzstueck)

Module sind die einzelnen Funktionen eines Spaces (Karte, Kanban, Marktplatz, Modulschmiede, Profil-Editor, ...).

### Zwei Arten von Modulen

| | **Code-Modul** | **Daten-Modul** |
|---|---|---|
| **Was** | TypeScript-Komponente | JSON-Schema |
| **Wer baut** | Programmierer | Mensch im Konfigurator + KI |
| **Beispiele** | Karte (Leaflet), Kanban, Modulschmiede | Marktplatz, Skill-Tree, Quest |
| **Verteilung** | Im Repo | Items vom Typ `module-template` im WoT |

Code-Module sind fuer komplexe Sachen (Karte mit Leaflet, Kanban mit Drag-Drop, Modulschmiede selbst). Daten-Module sind fuer alles andere — sie werden zur Laufzeit aus Schema gerendert.

### Modul-Ordnerstruktur

```
src/modules/
├── index.ts                      # Re-Exporte (registry, types, schema-types)
├── registry.ts                   # ModuleDefinition Typ + zentrale Registry
├── schema-types.ts               # ModuleSchema, LayoutDefinition, ActionDefinition
├── types.ts                      # ModuleFieldConfig, FieldType, FieldVisibility
├── use-module-config.ts          # useModuleConfig + useIsSpaceAdmin
│
├── renderers/                    # Wiederverwendbare Renderer
│   ├── FieldRenderer.tsx         # Rendert ein einzelnes Feld (Input/Textarea/Tags/Location/Select)
│   ├── SchemaModuleView.tsx      # Generischer Schema-Renderer (Cards-Grid + Form + Edit)
│   ├── SchemaMapLayout.tsx       # Map-Layout fuer Daten-Module (Leaflet)
│   └── ModuleSettingsButton.tsx  # Zahnrad-Knopf + Side-Panel (Inline-Konfig)
│
├── map/                          # CODE-Modul: Karte mit Leaflet
│   ├── MapView.tsx               # Hauptansicht (mit Zahnrad-Settings, Pin-Filter, Tile-Layer)
│   ├── MapSettingsPanel.tsx      # Inline-Editor fuer Karten-Konfig
│   └── index.ts                  # exportiert mapModule
│
├── kanban/                       # CODE-Modul: Kanban-Board
│   ├── KanbanView.tsx
│   └── index.ts
│
├── profile/                      # Profil-Editor (Dialog, kein Tab)
│   ├── MacherProfileDialog.tsx
│   ├── macher-profile-config.ts  # Macher-Default-Felder (Skills, Offers, Needs, Address, Phone)
│   ├── TagInput.tsx              # Chip-Input fuer Tag-Felder
│   └── use-profile-extension.ts  # Extension-Item-Persistenz (Antons WoT speichert nur name/bio/avatar)
│
├── marketplace/                  # DATEN-Modul: Marktplatz aus Schema
│   ├── marketplace-schema.ts     # Schema (Felder, Layouts, Aktionen)
│   └── index.ts                  # registriert ueber makeSchemaModuleView
│
└── modulschmiede/                # CODE-Modul: Konfigurator-UI
    ├── ModulschmiedeView.tsx     # Liste aller Templates + Schema-Editor
    ├── use-module-templates.ts   # Templates-Persistenz (type: "module-template")
    ├── use-available-modules.ts  # Code-Module + Daten-Module zusammen
    └── index.ts
```

### Wie ein Modul registriert wird

In `src/pages/MacherApp.tsx`:
```ts
import { registerModule } from '../modules/registry'
import { mapModule } from '../modules/map'
import { kanbanModule } from '../modules/kanban'
import { marketplaceModule } from '../modules/marketplace'
import { modulschmiedeModule, useAvailableModules } from '../modules/modulschmiede'

registerModule(mapModule)
registerModule(kanbanModule)
registerModule(marketplaceModule)
registerModule(modulschmiedeModule)
```

`useAvailableModules(moduleIds)` merged Code-Module (aus Registry) + Daten-Module (aus WoT-Items).
Daten-Module mit gleicher ID **ueberschreiben** Code-Module — so kann ein Schema ein Code-Modul ersetzen.

### Schaufenster-Module (immer sichtbar)

Im Macher-Space sind **Marktplatz** + **Modulschmiede** **immer** als Tabs sichtbar (auch wenn `group.data.modules` sie nicht enthaelt). Definiert in `MacherApp.tsx` als `ALWAYS_VISIBLE_MODULES`.

### Modul-Konfig pro Space

Konfig pro Space + pro Modul liegt in:
```ts
group.data.moduleConfig[<modulId>]
```

Lese-Reihenfolge:
1. `group.data.moduleConfig[id]`
2. Default-Config aus ModuleDefinition (`defaultConfig`)

Schreiben ueber `useModuleConfig().setModuleConfig(group, moduleId, config)`.
Berechtigung: `useIsSpaceAdmin(spaceId)` — aktuell Group-Creator-Check.

### Inline-Konfiguration (Zahnrad-Pattern)

Jedes Modul kann oben rechts ein Zahnrad anbieten. Klick → Side-Panel mit Modul-spezifischem Editor. Nur fuer Admins sichtbar.

Wiederverwendbar via `ModuleSettingsButton`:
```tsx
<ModuleSettingsButton title="Karte konfigurieren" visible={isAdmin}>
  <MapSettingsPanel config={cfg} onSave={...} />
</ModuleSettingsButton>
```

Karte hat das schon — Marktplatz, Profil, Kalender folgen nach dem gleichen Pattern.

---

## Profile (Sonderfall)

Antons WoT-Connector speichert nur `name`, `bio`, `avatar`. Alles andere (Skills, Offers, Needs, Address, Phone) wandert in ein **Profile-Extension-Item** (`type: "profile-extension"`). Plus: Avatar persistiert ueber Reload nicht zuverlaessig in Antons doc — deshalb auch im Extension-Item.

Implementiert in `src/modules/profile/use-profile-extension.ts` mit `splitProfileUpdates()`.

Lese-Prioritaet: **Extension > Master (Antons WoT) > currentUser fallback**.

---

## Module-Stand

| Modul | Typ | Status |
|-------|-----|--------|
| **Karte** | Code | ✅ Mit Zahnrad: Pin-Typen-Filter, Pin-Farben, Tile-Layer-Auswahl, optionaler Action-Button |
| **Kanban** (Projekte) | Code | ✅ Drag-Drop, Filter, Edit-Panel, Comments — von Sebastian gebaut |
| **Marktplatz** | Daten | ✅ Cards-Grid + Map-Layout, Anbieten/Suchen mit Pin-Farbe |
| **Modulschmiede** | Code | ✅ MVP: Template-Liste + Editor, neue Module per Klick anlegbar |
| **Profil** | Dialog | ✅ Schema-basiert mit Skills/Offers/Needs/Address/Phone, Visibility pro Feld |
| **Kalender** | — | ❌ noch zu bauen |
| **Skill-Tree / Gamification** | — | ❌ noch zu bauen |
| **Spaces-Browser** | — | ❌ noch zu bauen |
| **Log** | — | ❌ noch zu bauen |

---

## Persistenz-Schichten

| Wo | Was |
|----|-----|
| **Antons WoT-Doc** (`doc.profile`) | name, bio, avatar (aktuell unsicher) |
| **Items im WoT-Doc** | Tasks, Posts, Events, Places, Offers, Needs, **Profile-Extensions**, **Module-Templates** |
| **Group-Data** (`group.data.modules`, `group.data.moduleConfig`) | Welche Module sichtbar + ihre Konfig |
| **localStorage** | UI-State (aktiver Connector, aktiver Space, aktives Modul, Connector-Type) |
| **IndexedDB (per Yjs/automerge)** | Persistierung des kompletten WoT-Docs |

---

## Cleanup-Stand

Was rausgeflogen ist (29.04.2026): siehe [ARCHITEKTUR.md](ARCHITEKTUR.md). Macher-Map ist seit dem ein **rein statisches Frontend**. Container `macher-map-api-1` muss am Server abgeschaltet werden.

---

## Sprache

Deutsch. Macher-Sprache: erdig, direkt, gamifiziert. Siehe `/macher-sprache` Skill.

In Code: englische Identifier, deutsche UI-Texte, deutsche Kommentare. Konsistent mit Antons Reference App.

---

## Wichtige Dateien

- [src/pages/MacherApp.tsx](src/pages/MacherApp.tsx) — App-Root, Connector-Setup, ModuleRouter
- [src/modules/registry.ts](src/modules/registry.ts) — ModuleDefinition + zentrale Map
- [src/modules/schema-types.ts](src/modules/schema-types.ts) — ModuleSchema (Daten-Modul-Format)
- [src/modules/renderers/SchemaModuleView.tsx](src/modules/renderers/SchemaModuleView.tsx) — Rendert ein Schema → UI
- [vite.config.ts](vite.config.ts) — Aliase, fester Port
- [ARCHITEKTUR.md](ARCHITEKTUR.md) — All-WoT-Entscheidung
- [MODULSCHMIEDE.md](MODULSCHMIEDE.md) — Modulschmiede-Vision
- [MODUL-DEV-GUIDE.md](MODUL-DEV-GUIDE.md) — neuen Modul bauen (Schritt-fuer-Schritt)
