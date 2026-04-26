# Macher-Map — Prozess-Log

Dokumentation des gesamten Prototyping-Prozesses.
Fehler, Erkenntnisse, Optimierungen — damit wir beim naechsten Space schneller und sauberer sind.

---

## Pipeline

Die Macher-Map durchlaeuft die **Real Life Forge** — 9 Schritte von Vision bis Pitch.
Playbook: `../Real-Life-Forge/FORGE.md`
Status: `FORGE-STATUS.md`

| Phase | Artefakt | Skill |
|-------|----------|-------|
| 1. Vision | KONZEPT.md | `/space-forge konzept` |
| 2. Deep Dive | DEEP-DIVE.md | `/deep-dive macher-map` |
| 3. Design | DESIGN-BRIEF.md | `/space-forge design` |
| 4. Landingpage | Live auf macher-map.org | `/space-forge landing` |
| 5. App-Erlebnis | /app funktioniert | `/space-forge app` |
| 6. Sebastian-Review | UX-Feedback | Kanban-Board |
| 7. Content & Assets | Videos, Daten, Logos | Manuell |
| 8. Pitch-Vorbereitung | PITCH-DECK.md | `/space-forge pitch` |
| 9. Pitch & Iteration | Partner-Feedback | Timo |

---

## Rollen

| Wer | Was | Wie |
|-----|-----|-----|
| **Timo** | Vision, Konzept, Pitch, Feedback | Spricht Visionen ein, gibt Richtung, testet mit echten Menschen |
| **Sebastian** | UX-Design, Modul-Design | Nimmt Timos Rohvision, macht sauberes UX draus, arbeitet uebers Kanban-Board |
| **Eli** | Prototyp-Bau, Code, Deep Dive, Deployment, Prozess-Doku | Baut aus Konzept + UX den funktionierenden Prototyp |
| **Anton + Tillmann** | Architektur, Module, RLN-Kern | Fundament, auf dem alles steht |

## Tools

- **Code:** GitHub (github.com/lichtungooo/macher-map)
- **Kanban:** Real Life Network Board (TBD — mit Sebastian abstimmen)
- **Deployment:** GitHub Actions → ghcr.io → Watchtower (automatisch)
- **Forge:** Real-Life-Forge/ (Playbook, Templates, Skills)
- **Skills:** `/space-forge`, `/deep-dive`, `/deploy`

---

## Fehler & Erkenntnisse

### 2026-04-23 — Erster Prototyp

**Fehler: Re-Skin statt eigenes Universum**
- Was passiert ist: Lichtung-Code genommen, Farben getauscht, Begriffe umbenannt. Ergebnis sah aus wie "Lichtung in Orange".
- Loesung: KONZEPT.md ZUERST ausfuellen. Fragenkatalog durcharbeiten. Dann erst coden.
- **Regel: Kein Code ohne ausgefuelltes KONZEPT.md.**

**Fehler: SSH-User falsch angenommen**
- Was passiert ist: `root@85.214.196.122` versucht, failed. User ist `timo`.
- **Regel: Bestehende Deployments checken bevor man raet.**

**Fehler: node_modules beim Kopieren**
- Was passiert ist: `cp -r` auf Windows blockiert an node_modules (file locks).
- **Regel: Auf Windows nie blindes `cp -r` mit node_modules.**

**Erkenntnis: Watchtower macht CI/CD trivial**
- GitHub Actions baut Image, Watchtower zieht automatisch. Kein SSH-Deploy noetig.
- **Fuer neue Spaces: Immer Watchtower + ghcr.io nutzen.**

### 2026-04-23 — Forge-Migration

**Erkenntnis: MARKTANALYSE.md war zu duenn**
- Die alte Marktanalyse hatte gute Zahlen, aber es fehlte: Design-Benchmark, Community-Mapping, Influencer-Scoring, User-Persona, Seeding-Strategie.
- DEEP-DIVE.md (neues Format) deckt 10 Bloecke ab statt 5.
- **Regel: Immer das Forge-Template (Real-Life-Forge/templates/DEEP-DIVE.md) als Basis nehmen.**

**Erkenntnis: Maker Skill Trees existieren Open Source**
- github.com/sjpiper145/MakerSkillTree — hexagonale Skill-Tiles, fertige Vorlagen.
- Wir muessen das nicht erfinden, sondern digitalisieren.
- **Direkt im Skill-Tree-MVP nutzen.**

**Erkenntnis: Orange ist Baumarkt-Territorium**
- Hornbach #F79E1C, OBI #F56600, Strava #FC4C02 — alle Orange.
- Unser #E8751A liegt mittendrin. Farbabgrenzung im Design-Brief mit Sebastian klaeren.
- **Optionen: Petrol+Gold, Anthrazit+Neon-Gelb, oder Dunkelgruen+Kupfer.**

**Erkenntnis: Forge-Struktur spart enorm Zeit**
- Templates + Skills + Pipeline = klarer Pfad statt "was machen wir als naechstes?"
- Beim naechsten Space: `/space-forge konzept` aufrufen und der Prozess laeuft.

---

## Offene Optimierungen

- [ ] Design-Brief fuer Sebastian erstellen (DESIGN-BRIEF.md)
- [ ] Skill-Tree MVP bauen (Maker Skill Trees als Basis)
- [ ] Landingpage im eigenen Universum (Scroll-Storytelling, Video-Hero)
- [ ] Echte Werkstatt-Daten fuer Ferropolis-Region laden
- [ ] Kanban-Board einrichten (Timo/Sebastian/Eli Zusammenarbeit)
- [ ] 60s-Video "Was ist die Macher-Map?"
- [ ] Farbentscheidung mit Sebastian treffen
