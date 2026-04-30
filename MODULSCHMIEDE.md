# Modulschmiede

**Stand:** 30. April 2026
**Ziel:** Menschen bauen sich eigene Module — per Konfigurator, per Prompt, per Forking — und teilen sie auf einem Marktplatz.

> "The next big thing."

---

## Die Vision

Im Real Life Network sind Spaces (Macher, Adventure, Lichtung, ...) **Communities mit Modulen**. Bisher musste jedes Modul von Programmierern gebaut werden. Die **Modulschmiede** dreht das um:

> **Jeder Mensch kann sich Module bauen — ohne Code zu schreiben.**

Die Modulschmiede ist:
- ein **Konfigurator** (Drag-Drop-UI fuer Felder, Layouts, Aktionen)
- ein **AI-Assistent** (Prompt → erstes Modul-Schema, dann verfeinern per UI)
- ein **Marktplatz** (fertige Module teilen + ueber andere Spaces nutzen)
- ein **Theme-System** (eigener Look pro Space — Werkstatt, Rollenspiel, Meditation, ...)
- ein **Fork-System** (jedes Modul ist erweiterbar, auch der Konfigurator selbst)

---

## Code-Module vs. Daten-Module

Wir trennen sauber:

| | Code-Modul | Daten-Modul (Modulschmiede) |
|---|---|---|
| **Was** | TypeScript-Komponente | JSON-Schema |
| **Wer baut** | Programmierer | Mensch im Konfigurator + KI |
| **Beispiele** | Karte (Leaflet), Kanban (Drag-Drop) | Marktplatz, Profil, Skill-Tree, Quests, Forms, Listen |
| **Verteilung** | npm/Toolkit | Items im RLN-Marktplatz |
| **Anpassbar** | Nur per Code | Jeder im Konfigurator |
| **Anteil** | ~20% (komplexe Spezial-Module) | ~80% (CRUD-artige Module) |

**Karte mit Leaflet wird nie ein Daten-Modul.** Aber Marktplatz, Skill-Tree, Quest-Liste, Profil-Erweiterungen — das sind alles Listen + Cards + Forms + Filter, die ueber ein Schema beschreibbar sind.

---

## Was ein Daten-Modul kann

Ein Modul-Schema beschreibt:

### 1. Felder (was wird erfasst)
- Text, Textarea, Tags, Bild, Adresse, Telefon, Email, Url
- Select (Dropdown), Multi-Select, Number, Range, Date, Time
- Person (Verweis auf Member), Item-Referenz, Geo-Punkt
- Rich-Text, Markdown, Code

### 2. Sichtbarkeit pro Feld
- Public (alle sehen)
- Contacts (nur Kontakte sehen)
- Private (nur Owner)
- Group-Members
- Role-based (Admin, Mitglied, ...)

### 3. Layouts (wie wird angezeigt)
- **List** — einfache Liste (Skills, Quests)
- **Cards** — Cards-Grid (Marktplatz-Angebote, Werkstaetten)
- **Board** — Kanban-Style (Status-Spalten)
- **Map** — Leaflet-Karte (Items mit Geo-Feld)
- **Calendar** — Monats/Wochen/Tag-Ansicht (Items mit Datum)
- **Tree** — Hierarchie (Skill-Tree)
- **Form** — Edit-Formular
- **Detail** — Detail-Page mit allen Feldern

Pro Modul kann es **mehrere Layouts** geben — User waehlt welcher.

### 4. Aktionen (was kann der User tun)
- **Create** — neues Item anlegen
- **Edit** — bearbeiten
- **Delete** — loeschen
- **Custom** — eigene Aktion (z.B. "Buchen", "XP vergeben", "Anbieten", "Quest abschliessen")

Aktionen koennen Conditions haben (nur wenn Status=offen, nur wenn Owner, ...).

### 5. Filter & Suche
- Search (Volltextsuche ueber Felder)
- Select-Filter (auf Select-Feldern)
- Tag-Filter
- Date-Range
- Owner-Filter ("nur meine")

### 6. Schnittstellen zu anderen Modulen
- **Items teilen**: Quest = Item mit type=quest UND mit start/end → erscheint im Kalender
- **Aktion-Trigger**: Aktion "XP vergeben" im Marktplatz → updated Skill-Tree
- **Widgets**: Profil zeigt Marktplatz-Widget mit eigenen Angeboten

### 7. Theme
- Farben (Primary, Secondary, Background, Text)
- Schrift (Display-Font, Body-Font)
- Border-Radius (eckig, weich, rund)
- Icons (Lucide-Set, eigenes Set)
- Hintergrund-Bild
- Logo

---

## Drei Wege ein Modul zu bauen

### Weg 1: Vom leeren Schema (fuer Bastler)
1. Du startest mit leerem Schema
2. Faehrst Felder hinzu (Drag-Drop oder Plus-Knopf)
3. Waehlst Layouts
4. Konfigurierst Aktionen
5. Speicherst — fertig

### Weg 2: Per Prompt (fuer Schnelle)
1. Du tippst: "Ich brauche ein Modul fuer Werkzeug-Verleih in meiner Werkstatt"
2. KI generiert ein Start-Schema (Felder: Werkzeug, Verfuegbarkeit, Pfand, Ausleiher; Layout: Cards; Aktionen: Anbieten, Buchen)
3. Du verfeinerst per Klick oder weiteren Prompt: "Fuege ein Foto-Feld hinzu", "Mach den Pfand optional"
4. Speicherst

### Weg 3: Vom Marktplatz forken (fuer Pragmaten)
1. Du suchst auf dem Marktplatz: "Werkzeug-Verleih"
2. Findest Modul "Macher-Toolshare" von Timo
3. Klickst "In meinen Space holen" (Fork)
4. Passt fuer dich an (Theme, ein paar Felder umbenennen)
5. Speicherst

---

## Marktplatz

### Was wird geteilt
- **Modul-Schemas** (fertige, getestete Module)
- **Themes** (Farben/Fonts/Look-Sets)
- **Templates** (Modul + Theme zusammen, z.B. "Werkstatt-Komplett-Paket")
- **Aktion-Bausteine** ("Bei XP vergeben + Badge geben + Notification")

### Wer kann uploaden
Jeder mit Account. Quality-Checks via Community (Likes, Forks, Reviews).

### Lizenzen
- MIT (default) — frei nutzbar, modifizierbar
- CC-BY (Attribution)
- Optional: Token-System fuer Premium-Module (siehe unten)

### Discovery
- **Kategorie** (Profil, Marktplatz, Gamification, Quest, Kalender, ...)
- **Tags** (Werkstatt, Rollenspiel, Meditation, ...)
- **Use-Case** ("ich suche etwas fuer X")
- **Featured** (von uns kuratiert)

### Forking + Verbesserungen
Jedes Modul ist ein Fork-Original. Wenn du was verbesserst, kannst du:
- in dein Original mergen (eigenes Modul)
- als PR-aehnlich an Original-Author schicken
- als eigenen Fork veroeffentlichen

So waechst die Bibliothek organisch.

---

## Token-System (optional, spaeter)

Wie bei Moneyprinter:
- KI-Nutzung kostet Tokens (Prompt → Schema-Generierung)
- Premium-Module kosten Tokens
- Tokens kauft man (oder verdient man durch Beitraege)
- Modul-Builder bekommen Tokens wenn ihre Module genutzt werden

Wichtig: **Basis-Konfigurator + AI ist gratis.** Tokens nur fuer Heavy-Use oder Premium.

---

## Was die Modulschmiede selbst nutzbar macht

Ein Modul-Schema ist ein **Item** im Real Life Stack:
```ts
{
  type: "module-template",
  data: {
    id: "marketplace",
    label: "Marktplatz",
    fields: [...],
    layouts: [...],
    actions: [...],
    theme: {...}
  },
  createdBy: <DID des Moduls-Authors>,
  relations: [
    { predicate: "forkedFrom", target: "item:original-marketplace" }
  ]
}
```

Heisst: alle Module sind **Daten im WoT**, nicht Code im Repo. Kein Server-Update fuer neue Module noetig.

---

## Phasen / Roadmap

| Phase | Was | Status |
|-------|-----|--------|
| **0** | Code-Module (Karte, Kanban, Profil) als Fundament | ✅ erledigt |
| **0.5** | Modul-Registry: ModuleDefinition + zentrale Map + Render in MacherApp | ✅ erledigt |
| **1** | Schema-Format definieren (`ModuleSchema`, `LayoutDefinition`, `ActionDefinition`) | ✅ erledigt |
| **2a** | Generischer Renderer Cards + Form + Detail (`SchemaModuleView`) | ✅ erledigt |
| **2b** | Generischer Map-Renderer (`SchemaMapLayout` mit Pin-Color-Mapping) | ✅ erledigt |
| **2c** | Generischer List-Renderer | offen |
| **2d** | Generischer Calendar-Renderer | offen |
| **2e** | Generischer Board-Renderer (Kanban-Style) | offen |
| **2f** | Generischer Tree-Renderer (Skill-Tree) | offen |
| **3** | Marktplatz als 1. Daten-Modul (Schema → gerendert, Cards + Map) | ✅ erledigt |
| **4a** | Module-Templates als Items persistieren + auto registrieren | ✅ erledigt |
| **4b** | Konfigurator-UI MVP (Liste + Editor mit Felder hinzufuegen) | ✅ erledigt |
| **4c** | Inline-Konfig (Zahnrad pro Modul, Side-Panel) — Karte hat das schon | 🟡 in Arbeit |
| **4d** | Layout-Editor in der Schmiede (Cards/List/Map konfigurieren) | offen |
| **4e** | Live-Preview im Editor + Drag-Drop Feld-Reihenfolge | offen |
| **4f** | Filter-Editor (Select / Tags / Search im SchemaModuleView aktivieren) | offen |
| **4g** | Action-Editor (Custom-Aktionen wie "Buchen", "XP vergeben") | offen |
| **5** | AI-Integration (Prompt → Schema, via Claude API) | offen |
| **6** | Modul-Marktplatz (Forking, Discovery, Tags, Featured) | offen |
| **7** | Theme-System (Farben/Fonts/Logos pro Space) | offen |
| **8** | Token-System (optional, fuer Premium-Module) | spaeter |
| **9** | Mobile Widgets (Capacitor Widget-Extensions) | spaeter |

### Was als Naechstes ansteht

1. **Inline-Konfig fuer Marktplatz** (Zahnrad oeffnet Schema-Editor wie in der Schmiede)
2. **Inline-Konfig fuer Profil**
3. **Kalender-Modul** als Code-Modul mit Zahnrad
4. **Layout-Editor in der Schmiede** (4d) — wenn das geht, ist Schema-only-Modul-Bau echt komplett
5. **Filter im SchemaModuleView** (4f)
6. **AI-Integration** (Phase 5) — der grosse Hebel

---

## Was die Modulschmiede NICHT ist

- **Kein Code-Editor** — Komplexe Logik (Karte, Kalender-Engine, Drag-Drop) bleibt Code
- **Kein No-Code-Hype** — wir bauen ein **konkretes** System fuer **konkrete** Use-Cases. Nicht "alles geht", sondern "die 80% die Communities wirklich brauchen"
- **Kein Lock-In** — Module sind als JSON exportierbar/importierbar, MIT-Lizenz default

---

## Designprinzipien

1. **Schema ist Daten, nicht Code** — Module leben im WoT, nicht im Repo
2. **Wiederverwendbare Renderer** — ein List-Renderer rendert ALLE List-Layouts, egal welches Modul
3. **Felder sind universell** — `text`, `tags`, `image` etc. funktionieren in jedem Modul
4. **Capabilities ueber Schema** — Modul deklariert was es braucht (`requiresProfile`, `requiresLocation`); UI prueft Connector
5. **Items sind die Master** — alle Daten sind Items, alle Schnittstellen ueber Item-Typen
6. **Theme ist Schicht** — Module funktionieren ohne Theme; Theme wird bei Bedarf drueber gelegt
7. **AI ist Helfer, nicht Master** — der Mensch kontrolliert immer das Endergebnis

---

## Wer baut mit

- **Timo**: Vision, Pitch, UX-Feedback, Modul-Templates fuer den Macher-Space
- **Eli**: Technische Implementierung, Architektur
- **Anton**: WoT-Fundament (Item-Modell, Capabilities)
- **Sebastian**: UX-Design, Mobile
- **Spaeter**: Community baut Module, Themes, Templates
