# Macher-Map — Architektur

**Stand:** 29. April 2026
**Entscheidung:** All-WoT. Antons Real-Life-Stack + Web-of-Trust ist der Master.
**Was rausfliegt:** komplette Lichtung-API + alle direkten REST-Calls aus der Macher-Map.

---

## Warum All-WoT

- **Antons Vision:** Vertrauen ohne zentrale Autoritaet, E2E-verschluesselt, dezentral, self-hostable.
- **Eine Sprache:** Macher-Map nutzt exakt die Bausteine die Anton + Sebastian bauen. Code laesst sich 1:1 ins RLN ueberfuehren.
- **Sauberer Modul-Baukasten:** Module sprechen alle das gleiche `DataInterface` + Capabilities. Kein Daten-Schema-Bruch.
- **Kein Doppel-Auth:** keine Email/Password parallel zu DID. Eine Identitaet, ueberall.

## Was rausfliegt aus der Macher-Map

| Was | Wo | Status |
|-----|----|--------|
| `src/api/client.ts` | komplettes REST-Client | **raus** |
| `src/components/auth/AuthDialog.tsx` (Email/Password) | Login/Register | **raus** |
| `src/components/auth/ProfileDialog.tsx` (Lichtung-Profil) | alte Profil-UI | **raus** |
| `src/components/auth/MyConnections.tsx` | Lichtung-Connections | **raus** |
| `src/pages/MapApp.tsx` | alte Lichtung-Karte | **raus** |
| `src/pages/AdminPanel.tsx` | Admin-Panel | **raus** |
| `src/pages/InvitePage.tsx` | Lichtung-Invite | **raus** |
| `src/context/IdentityContext.tsx` | Lichtung-Auth | **raus** |
| Routes `/legacy`, `/admin`, `/invite` | App.tsx | **raus** |
| `macher-map-api-1` Container | Server-Backend (Lichtung-API) | **abschalten** sobald Frontend umgezogen |

**Was bleibt:** alles unter `src/pages/MacherApp.tsx` + `src/modules/*` + Toolkit-Komponenten + WoT-Connector.

---

## Antons Stack (das Fundament)

### Identitaets-Schicht: Web of Trust

```
@web_of_trust/core           ← CRDT-Doc, DID, Verifikation, SignedClaims
@web_of_trust/adapter-yjs    ← Yjs-Adapter fuer Multi-Device-Sync
```

**Server-Komponenten** (alle unter utopia-lab.org, self-hostbar):

| Service | URL | Aufgabe |
|---------|-----|---------|
| **Relay** | `wss://relay.utopia-lab.org` | E2E-verschluesselte Nachrichten-Weiterleitung |
| **Profile-Discovery** | `https://profiles.utopia-lab.org` | oeffentliche Profile finden (DID → Profil-Daten) |
| **Vault** | `https://vault.utopia-lab.org` | verschluesselte Backups |

**Wichtig:** Relays/Profile/Vault koennen **selbst gehostet** werden. Macher-Map kann eigenen Relay betreiben — ohne Code-Aenderung.

### Daten-Schicht: Real-Life-Stack

```
@real-life-stack/data-interface     ← Item-Modell, Capabilities, Type Guards
@real-life-stack/wot-connector      ← WotConnector implementiert FullConnector + ProfileCapable + ContactManager + SignedClaimCapable + MessagingCapable
@real-life-stack/local-connector    ← LocalConnector (IndexedDB) — fuer Dev/Tests
@real-life-stack/mock-connector     ← MockConnector — fuer Stories/Tests
@real-life-stack/toolkit            ← UI-Komponenten + Hooks + ConnectorProvider
```

**Datenfluss:**
```
UI-Modul → Hook → DataInterface (Connector) → WoT-Doc → Relay/IndexedDB
```

### Item-Modell (Antons universelles Datenobjekt)

```ts
interface Item {
  id: string
  type: string         // "post", "event", "task", "place", "profile", ...
  data: Record<string, unknown>
  relations?: Relation[]
}
```

`type` bestimmt Bedeutung. Felder in `data` bestimmen wo das Item erscheint:
- `status` → Kanban
- `start`/`end` → Kalender
- `location` → Karte
- `content` → Feed

Ein Item kann in **mehreren Modulen** gleichzeitig erscheinen.

### Capabilities (ISP-Architektur)

Connectors implementieren nur was sie koennen:

| Capability | Was | WoT | Local | Mock |
|------------|-----|-----|-------|------|
| `DataInterface` | Read-only core | ✅ | ✅ | ✅ |
| `ItemWriter` | CRUD | ✅ | ✅ | ✅ |
| `GroupManager` | Spaces/Gruppen | ✅ | ✅ | ✅ |
| `RelationCapable` | Relations | ✅ | ✅ | ✅ |
| `Authenticatable` | DID-Auth | ✅ | ❌ | ❌ |
| `ContactManager` | Kontakte | ✅ | ❌ | ❌ |
| `MessagingCapable` | Relay-Messages | ✅ | ❌ | ❌ |
| `SignedClaimCapable` | Attestations/Verifikation | ✅ | ❌ | ❌ |
| `ProfileCapable` | Profile (name/bio/avatar) | ✅ | ❌ | ❌ |
| `EventListenerCapable` | Incoming Events | ✅ | ❌ | ❌ |
| `ItemGroupCapable` | Items↔Group | ✅ | ✅ | ✅ |

UI prueft ueber Type Guards (`hasProfile(connector)`, `hasSignedClaims(connector)`, etc.).

---

## Modul-Baukasten

### Konzept

**Modul** = Funktionalitaet (Karte, Kalender, Feed, Kanban, Profil, Marktplatz, Gamification, Log).
**Space** = Community waehlt + konfiguriert Module.
**Theme** = Design-Schicht pro Space.

```
Space (Macher) hat Module: [karte, kalender, marktplatz, profil, gamification]
  ↓ jedes Modul liest seine Konfig aus group.data.moduleConfig[<modulId>]
Module rendern UI gegen DataInterface
```

### Modul-Schnittstellen

Module sprechen miteinander ueber **vier Wege**:

#### 1. Item-Typen (geteilte Daten)
```ts
// Quest-Modul liest events mit type="quest"
// Kalender-Modul liest events mit type="event" UND type="quest"
// → Quest erscheint im Kalender, weil beide den gleichen Item-Typ verstehen
```

#### 2. Widgets (Modul rendert anderes Modul ein)
```tsx
<ProfileView>
  <ProfileWidget moduleId="calendar" config={{ filter: { createdBy: userId } }} />
  <ProfileWidget moduleId="marketplace" config={{ filter: { ownerId: userId } }} />
</ProfileView>
```
Beispiele:
- Profil zeigt Kalender-Widget mit eigenen Events
- Lichtung zeigt Mitglieder-Widget mit Kontakten
- Werkstatt zeigt Marktplatz-Widget mit eigenen Offers

#### 3. Hooks (Module reagieren auf Item-Events)
```ts
// Gamification-Modul lauscht auf neue items, vergibt XP
useItemHook("created", "post", (item) => awardXP(item.createdBy, "post:create", 10))
```

#### 4. Mobile Widgets (Capacitor Widget-Extensions)
- `event_kalender` Modul → Home-Screen-Widget mit naechsten Events
- `marktplatz` Modul → Widget mit neuen Angeboten in der Naehe
- spaeter Phase 2

### Modul-Konfig-Schema (additiv zu Antons Schema)

```ts
group.data.modules: string[]                            // welche Module aktiv (Anton hat das)
group.data.moduleConfig: {                              // NEU: pro-Modul-Konfiguration
  profile?: { fields: ModuleFieldConfig[] }
  map?: { pinTypes, defaultZoom, layers, ... }
  calendar?: { eventTypes, defaultView, ... }
  marketplace?: { categories, currency, ... }
  gamification?: { skillTree, xpRules, badges, ... }
}
```

`group.data` ist offene `Record<string, unknown>` — wir brechen Antons Schema **nicht**, wir erweitern es additiv. Spaeter ggf. Type-Definition in `data-interface` nachziehen (mit Anton abstimmen).

### Modul-Liste (Roadmap)

| Modul | Item-Typen | Capabilities-Bedarf | Status |
|-------|-----------|---------------------|--------|
| **Profil** | `profile`, `profile-extension` | ProfileCapable, ItemWriter | in Arbeit |
| **Karte** | `place`, `event` (mit location) | DataInterface | Platzhalter |
| **Kalender** | `event` (mit start/end) | DataInterface | Platzhalter |
| **Feed** | `post`, `event` | DataInterface, ItemWriter | im Toolkit |
| **Kanban** | `task` | ItemWriter | im Toolkit (Sebastian) |
| **Kontakte** | — | ContactManager, SignedClaimCapable | im Toolkit |
| **Marktplatz** | `offer`, `need` | ItemWriter | offen |
| **Gamification** | `xp-event`, `achievement`, `badge` | ItemWriter, ItemGroupCapable | offen |
| **Log** | (aggregiert) | DataInterface | offen |
| **Spaces-Browser** | `group` | GroupManager | offen |
| **Quest** | `quest` (extends event) | ItemWriter | offen |
| **Modulschmiede** | `module-template` | ItemWriter | spaeter |

---

## Backend-Frage: was laeuft auf welchem Server

### Macher-Map auf Strato (nach Cleanup)

| Container | Image | Aufgabe |
|-----------|-------|---------|
| `macher-map-web` | `ghcr.io/lichtungooo/macher-map` | Frontend (statisch via nginx) |
| ~~`macher-map-api`~~ | ~~`ghcr.io/lichtungooo/licht-fuer-frieden-api`~~ | **wird abgeschaltet** |

→ Macher-Map ist nach Cleanup **rein statisches Frontend**. Alle Daten gehen ueber WoT.

### WoT-Backend (utopia-lab.org)

| Service | Was | Macher-Map nutzt? |
|---------|-----|-------------------|
| `relay.utopia-lab.org` | E2E-Messages | ✅ |
| `profiles.utopia-lab.org` | Profile-Discovery | ✅ |
| `vault.utopia-lab.org` | Verschluesselte Backups | ✅ |

→ Macher-Map nutzt Antons Public-Relays. Spaeter eigene Relays moeglich (real-life-network.org/relay).

### Admin-Sicht

WoT ist E2E-verschluesselt — klassisches Admin-Panel "alle Daten sehen" geht **nicht**. Stattdessen:
- **Group-Rollen** (admin/member) in `group.data.roles`
- Admin-Funktionen pro Space, fuer Space-Admins sichtbar
- Public-Daten (Werkstatt-Karte) sind sowieso oeffentlich
- Moderation-Aktionen werden als Items festgehalten (`type: "moderation-action"`)

→ Kein zentraler Admin, sondern **Space-spezifische Admin-Tools**.

---

## Reihenfolge (Cleanup + Aufbau)

### Phase 1: Cleanup (jetzt)
1. ARCHITEKTUR.md (✅ dieses Dokument)
2. Lichtung-API raus aus Macher-Map (siehe Liste oben)
3. Routes vereinfachen: nur `/` (Landing) + `/app/*` (MacherApp)
4. Tests pruefen ob noch was bricht
5. Container `macher-map-api` aus docker-compose entfernen (auf Server)

### Phase 2: Profil sauber bauen
1. Profile-Extension-Items (`type: "profile-extension"`, owned by DID)
2. Erweiterte Felder (skills, offers, needs, address, phone) in extension speichern
3. UI lest Master-Profil + Extension zusammen
4. Visibility pro Feld (public/contacts/private) ueber `data.visibility`

### Phase 3: Modul-Schnittstellen
1. Modul-Registry definieren (welche Module gibts, welche Item-Typen)
2. Widget-System (Module rendern andere Module ein)
3. Item-Hooks (Module reagieren auf andere Items)

### Phase 4: Module
1. Karte (Leaflet, konfigurierbar) — Pin-Typen, Layer, Zoom
2. Kalender (mit Quest-Schnittstelle)
3. Marktplatz (Offers/Needs als Items)
4. Gamification (XP global, Skill-Tree pro Space)
5. Log (Aktivitaet ueber Spaces)
6. Spaces-Browser (Karte + Liste)
7. Modulschmiede (KI-gestuetzt)

### Phase 5: Mobile
1. Capacitor-Build pruefen
2. Home-Screen-Widgets (iOS, Android)

---

## Was Anton mit Utopia-Map macht (zu pruefen)

Timo erinnert sich an ein Backend-Tool das Anton bei der Utopia-Map verwendet. Verdaechtig: **react-admin** oder **Refine** oder **Directus**. → bei naechstem Anton-Kontakt nachfragen welcher Stack, ob wir das uebernehmen koennen.

Vorlaeufig: Admin-Sicht in Macher-Map als Space-eigene UI bauen (kein separates Admin-Tool).

---

## Was wir Anton zurueckspielen wollen

Wenn unsere Erweiterungen gut sind, gehoeren sie spaeter ins `real-life-stack` Repo:

- Modul-Konfig-Schema (`SpaceModuleConfig` Type)
- `getProfileConfig` Helper
- TagInput-Komponente (gehoert in toolkit/primitives)
- Schema-basierter Profile-Editor
- Modul-Registry-Pattern
- Widget-System

Bis dahin: alles **lokal in macher-map**, nicht ins toolkit pushen.
