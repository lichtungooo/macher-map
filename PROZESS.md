# Macher-Map — Prozess-Log

Dokumentation des gesamten Prototyping-Prozesses.
Fehler, Erkenntnisse, Optimierungen — damit wir beim nächsten Space schneller und sauberer sind.

---

## Rollen

| Wer | Was | Wie |
|-----|-----|-----|
| **Timo** | Vision, Konzept, Pitch, Feedback | Spricht Visionen ein, gibt Richtung, testet mit echten Menschen |
| **Sebastian** | UX-Design, Modul-Design | Nimmt Timos Rohvision, macht sauberes UX draus, arbeitet übers Kanban-Board |
| **Eli** | Prototyp-Bau, Code, Deployment, Prozess-Doku | Baut aus Konzept + UX den funktionierenden Prototyp |

## Workflow

1. **Timo** → spricht Vision ein (Voice-Message / Gespräch)
2. **Eli** → füllt KONZEPT.md aus (Fragenkatalog mit Timo zusammen)
3. **Eli** → erstellt MARKTANALYSE.md (Deep Dive, siehe unten)
4. **Timo + Eli** → bewerten Marktchancen, justieren Vision
5. **Eli** → baut ersten Prototyp (Landingpage + Kern-Erlebnis)
6. **Sebastian** → reviewed UX, gibt Design-Feedback übers Kanban
7. **Eli** → iteriert auf Basis von UX-Feedback
8. **Timo** → pitcht, sammelt Partner-Feedback
9. → Zurück zu 6/7 bis Pitch-Ready

## Marktanalyse (Schritt 3 — vor dem ersten Code)

Jedes Projekt braucht vor dem Prototyping eine saubere Marktanalyse. Datei: `MARKTANALYSE.md`

**Pflicht-Abschnitte:**

| Abschnitt | Was rein muss |
|-----------|---------------|
| **Ist-Zustand** | Was gibt es bereits am Markt? Wer sind die Player? Wo sind Lücken? |
| **Zielgruppe** | Wer genau? Alter, Verhalten, Bedürfnisse, wo sind die online/offline? |
| **Potenzielle Partner** | Firmen, Verbände, Institutionen — wer hat Interesse, Budget, Reichweite? |
| **Sponsoring-Kandidaten** | Konkrete Firmen mit Begründung. Was bringen die mit? Was brauchen die? |
| **Influencer & Multiplikatoren** | YouTube, Instagram, Podcasts — wer passt zum Universum? Reichweite, Kontaktweg |
| **Kooperationsmöglichkeiten** | Wer könnte das Projekt nutzen, umsetzen, in die Realität bringen? |
| **Finanz-Spektrum** | Kosten für Aufbau, laufende Kosten, Einnahme-Modelle, Break-Even |
| **ROI-Szenarien** | Konservativ, realistisch, optimistisch — was bringt es dem Sponsor? |
| **Strategische Positionierung** | Wie grenzen wir uns ab? Was ist unser unfairer Vorteil? |
| **Pitch-Strategie** | Wer pitcht wem? In welcher Reihenfolge? Was zeigen wir zuerst? |

**Warum vor dem Code:** Ohne Marktanalyse baut man ins Blaue. Mit Analyse weiß man: Lohnt sich das? Wer zahlt? Wen sprechen wir an? Das spart Wochen Arbeit an Prototypen, die niemand will.

## Tools

- **Code:** GitHub (github.com/lichtungooo/macher-map)
- **Kanban:** Real Life Network Board (TBD — mit Sebastian abstimmen)
- **Deployment:** GitHub Actions → ghcr.io → Watchtower (automatisch)
- **Konzept:** KONZEPT.md im Repo
- **Prozess:** PROZESS.md im Repo (dieses Dokument)

---

## Fehler & Erkenntnisse

### 2026-04-23 — Erster Prototyp

**Fehler: Re-Skin statt eigenes Universum**
- Was passiert ist: Lichtung-Code genommen, Farben getauscht, Begriffe umbenannt. Ergebnis sah aus wie "Lichtung in Orange".
- Warum: Kein Konzept vorher. Direkt in den Code gesprungen.
- Lösung: KONZEPT.md zuerst ausfüllen. Fragenkatalog durcharbeiten. Dann erst coden.
- **Regel für die Zukunft: Kein Code ohne ausgefülltes KONZEPT.md.**

**Fehler: SSH-User falsch angenommen**
- Was passiert ist: `root@85.214.196.122` versucht, failed. User ist `timo`.
- Warum: Nicht nachgeschaut, wie Lichtung deployt wird.
- Lösung: In Memory gespeichert. Beim nächsten Deployment sofort richtig.
- **Regel: Bestehende Deployments checken bevor man rät.**

**Fehler: node_modules beim Kopieren**
- Was passiert ist: `cp -r` auf Windows blockiert an node_modules (file locks).
- Lösung: Selektiv kopieren, nicht ganzes Verzeichnis.
- **Regel: Auf Windows nie blindes `cp -r` mit node_modules.**

**Erkenntnis: Watchtower macht CI/CD trivial**
- GitHub Actions baut Image, Watchtower zieht automatisch. Kein SSH-Deploy nötig.
- **Für neue Spaces: Immer Watchtower + ghcr.io nutzen.**

**Erkenntnis: Space-Konzept-Vorlage funktioniert**
- Der Fragenkatalog (KONZEPT.md) hat in einem Durchgang ein vollständiges Bild erzeugt.
- **Für neue Spaces: Gleichen Katalog nutzen, verfeinern wenn nötig.**

---

## Offene Optimierungen

- [ ] Theming-System bauen (Code-Basis + Theme-Schicht), damit Spaces nicht Handarbeit sind
- [ ] Kanban-Board einrichten für Timo/Sebastian/Eli Zusammenarbeit
- [ ] Skills/Templates für wiederkehrende Aufgaben erstellen (Landingpage-Generator, Marker-Stil-Generator)
- [ ] Handoff-Dokument für Sebastian vorbereiten (Aufgabenverteilung, UX-Briefing)
- [ ] MARKTANALYSE.md für Macher-Map erstellen (Deep Dive: Markt, Partner, Influencer, Finanzen)
- [ ] Marktanalyse-Vorlage als Standard-Template für alle zukünftigen Spaces
