# Macher-Map

> Finde Werkstaetten, Macher und Abenteuer in deiner Naehe.
> Bau. Mach. Zeig es.

Erster Showroom-Space des **Real Life Network**. Live auf [macher-map.org](https://macher-map.org).

---

## Was ist das

Eine dezentrale, E2E-verschluesselte Web-App fuer Handwerks-Communities. Karte mit Werkstaetten, Marktplatz fuer Werkzeug + Material, Projekt-Boards, Profile mit Skills + Offers + Needs. Plus eine **Modulschmiede** in der Communities ihre eigenen Funktionen ohne Code zusammenklicken.

Tech-Stack:

- **Frontend:** React 19 + Vite 8 + TypeScript + Tailwind v4
- **UI-Toolkit:** [Real Life Stack](https://github.com/real-life-org/real-life-stack) (shadcn/ui + Custom)
- **Identitaet:** [Web of Trust](https://github.com/antontranelis/web-of-trust) (DID, E2E, Multi-Device, CRDT)
- **Karte:** Leaflet + OSM
- **Persistenz:** WoT-Doc in IndexedDB (Yjs/automerge), syncht ueber Relays
- **Hosting:** macher-map.org als statisches Frontend (nginx in Docker), kein eigenes Backend mehr

---

## Schnellstart

```bash
git clone git@github.com:lichtungooo/macher-map.git
cd macher-map
pnpm install
pnpm dev
```

Oeffnet auf **http://localhost:5173** (fester Port — siehe [CLAUDE.md](CLAUDE.md)).

Routes:
- `/` — Landing-Page
- `/app/spaces/__overview__/map` — die App, Default-Sicht
- `/datenschutz`, `/impressum` — Legal

---

## Architektur in einem Satz

> Module + Modulschmiede + Web-of-Trust + statisches Frontend.

Drei Doku-Ebenen, in dieser Reihenfolge lesen wenn du einsteigen willst:

| | Datei | Was |
|---|-------|-----|
| 1 | [CLAUDE.md](CLAUDE.md) | Projekt-Struktur, Modul-System, Persistenz-Schichten, Stand pro Modul |
| 2 | [ARCHITEKTUR.md](ARCHITEKTUR.md) | All-WoT-Entscheidung, was rausgeflogen ist, Antons Stack |
| 3 | [MODULSCHMIEDE.md](MODULSCHMIEDE.md) | Vision: Module als Daten + Konfigurator + AI + Marktplatz |
| 4 | [MODUL-DEV-GUIDE.md](MODUL-DEV-GUIDE.md) | Schritt-fuer-Schritt: neues Modul bauen (Code- oder Daten-Modul) |

---

## Deployment

Push auf `main` → GitHub Action baut Docker-Image (siehe [.github/workflows/deploy.yml](.github/workflows/deploy.yml)) und pusht es zu `ghcr.io/lichtungooo/macher-map:latest`. Auf dem Strato-Server pollt **Watchtower** alle 30 Sekunden auf neue Images und tauscht den Container automatisch.

```
git push origin main
   ↓
GitHub Actions (build + push)
   ↓
ghcr.io/lichtungooo/macher-map:latest
   ↓
Watchtower (auf Strato-Server)
   ↓
macher-map.org (live)
```

Container heisst `macher-map-web-1`. Es gibt keinen API-Container mehr — die App ist seit dem [Cleanup](ARCHITEKTUR.md) rein statisch.

---

## Mitarbeiten

- **Timo**: Vision, Pitch, UX
- **Eli**: Technische Implementierung
- **Anton**: WoT-Stack
- **Sebastian**: UX-Design, Mobile

Issues + PRs auf GitHub willkommen.

---

## Lizenz

MIT. Code gehoert niemandem und allen.

---

## Verwandt

- [Real Life Network](https://github.com/real-life-network/rln) — der Kern, an dem wir alle bauen
- [Real Life Stack](https://github.com/real-life-org/real-life-stack) — UI-Toolkit + DataInterface (Anton, Sebastian)
- [Web of Trust](https://github.com/antontranelis/web-of-trust) — Identitaets-Schicht (Anton)
- [Lichtung](https://lichtung.ooo) — Schwester-Projekt (Friedensnetzwerk)
