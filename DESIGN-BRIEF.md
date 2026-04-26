# Macher-Map — Design-Brief

Fuer: Sebastian
Von: Eli + Timo
Stand: 2026-04-26

---

## 1. Kontext

| Frage | Antwort |
|-------|---------|
| **Was ist der Space?** | Die Karte, die Handwerk sichtbar, geil und gamifiziert macht — fuer alle die mit den eigenen Haenden bauen wollen. |
| **Fuer wen?** | Familien mit Kindern (10+), Jugendliche/Azubis, Handwerksbetriebe — von "erste Saege" bis Meister |
| **Was fuehlt man beim Oeffnen?** | Bock. Sofort rausgehen und was bauen wollen. "Cool, ich komm, lass uns das bauen." |
| **Was unterscheidet ihn?** | Keine Plattform kombiniert Karte + Skill-Tree + Peer-Community + Werkstatt-Finder + Materialboerse + Gamification. Komplett unbesetztes Territorium. |
| **Claim** | "Lass uns was bauen." |
| **Deadline** | Macher-Festival Ferropolis, 6.–9. August 2026 — dort pitchen wir Hornbach + Real Life Guys |

---

## 2. Design-Prinzipien

5 Regeln, die jede Design-Entscheidung leiten:

1. **Werkstatt, nicht Showroom** — Es darf nach Arbeit aussehen. Dreckige Haende, Saegemehl, Funken. Kein cleaner Baumarkt-Katalog. Es soll sich anfuehlen wie eine Werkstatt in die man reingelaufen ist.
2. **Ein 14-Jaehriger muss es geil finden** — Wenn ein Jugendlicher sagt "Boah, was ist das?", haben wir gewonnen. Gamification, Celebrations, Skill-Trees, Badges — es muss so befriedigend sein wie ein Level-Up in einem Game.
3. **Karte ist das Herz** — Die Map ist kein Feature, sie ist das Zentrum. Alles orbitet um die Karte: Werkstaetten, Macher, Abenteuer. Du oeffnest die App und siehst sofort: Hier wird gemacht.
4. **Echte Bilder, echte Menschen** — Kein Stock. Keine generischen Haende. Echte Werkbaenke, echte Funken, echte Gesichter. Wenn ein Bild nicht nach "das war Samstag um 15 Uhr in der Werkstatt" aussieht, fliegt es raus.
5. **Laut und stolz** — Handwerk ist nicht leise. Die Farben duerfen knallen, die Typo darf gross sein, die Animationen duerfen krachen. Wir sind keine Meditations-App. Wir sind die Macher-Map.

---

## 3. Visuelles System

### Farbwelt

**Wichtig:** Orange (#E8751A) liegt im Hornbach/OBI-Territorium. Wir brauchen Sebastians Meinung — bleiben wir bei Orange (Abgrenzung ueber Gamification + Tonalitaet) oder wechseln wir? Drei freie Territorien aus dem Deep Dive:

| Option | Primaer | Sekundaer | Akzent | Gefuehl |
|--------|---------|-----------|--------|---------|
| **A: Aktuell (Orange)** | Orange #E8751A | Schwarz #1A1A1A | Gold #D4A020 | Energie, Feuer — aber nah an Hornbach |
| **B: Petrol + Amber** | Dunkles Petrol #1B4D5C | Anthrazit #2A2A2A | Amber/Gold #D4A020 | Handwerklich, edel, sofort abgrenzend |
| **C: Anthrazit + Neon** | Anthrazit #2D2D2D | Schwarz #1A1A1A | Neon-Gelb #E8E427 | Modern, "Werkstatt bei Nacht", jugendlich |

**Frage an Sebastian:** Welche Richtung? Oder ein Mix? Die Hintergrundfarbe bleibt warm-hell (#FAF8F5 Cream) fuer den Normalzustand, Dark Mode ist geplant.

| Rolle | Aktuell | Hex | Verwendung |
|-------|---------|-----|------------|
| Primaer | Orange | #E8751A | Buttons, Links, Akzente, CTAs |
| Sekundaer | Schwarz | #1A1A1A | Headers, Text, Kontrast |
| Akzent | Gold | #D4A020 | Badges, Highlights, Skill-Tree Gold |
| Hintergrund (hell) | Cream | #FAF8F5 | Body, Cards |
| Hintergrund (Section) | Warm-Grau | #F5F0E8 | Erdige Sections |
| Text | Dunkelgrau | #333333 | Body-Text |
| Muted | Grau | #999999 | Subtitles, Placeholders |
| Erfolg | Gruen | #22C55E | Skill-Unlock, Fertig-Status |
| Warnung | Rot | #EF4444 | Fehler, Abgelaufen |

### Typografie
| Rolle | Font | Gewicht | Groesse | Wo |
|-------|------|---------|---------|-----|
| Display | Space Grotesk | Bold (700) | 36-48px | Hero, grosse Headlines |
| Heading | Space Grotesk | SemiBold (600) | 20-28px | Section-Titel, Card-Titel |
| Body | Inter | Regular (400) | 14-16px | Fliesstext |
| Caption | Inter | Regular (400) | 12px | Labels, Meta-Infos |
| Mono | JetBrains Mono | Regular (400) | 14px | Zahlen, XP, Level-Anzeigen |
| Button | Space Grotesk | SemiBold (600) | 14-16px | CTAs, Buttons |

### Icon-Stil
| Frage | Antwort |
|-------|---------|
| **Bibliothek** | Lucide (Basis) + Custom Handwerks-Icons |
| **Strichstaerke** | 2px (kraeftig, sichtbar, "laut") |
| **Stil** | Outline (Lucide) + Filled Custom-Icons fuer Werkzeuge |
| **Rundungen** | Leicht gerundet (r=2px), nicht zu weich |
| **Custom-Icons noetig fuer** | Hammer, Saege, Schweissmaske, Bohrer, Hobel, Loetkolben, Naehmaschine, CNC, 3D-Drucker |

### Karten-Marker
| Element | Stil | Groesse | Farbe | Beschreibung |
|---------|------|---------|-------|-------------|
| Werkstatt | Werkzeug-Silhouette im Kreis | 32-40px | Primaer (Orange/Petrol) | Typ-spezifisch: Saege, Hammer, Loetkolben je nach Werkstatt |
| Macher-Pin | Runder Avatar mit farbigem Ring | 28-36px | Level-abhaengig (Bronze→Silber→Gold) | Zeigt Profilbild + Level-Ring |
| Abenteuer/Event | Stern/Blitz im Kreis | 32-40px | Akzent (Gold) | Pulsiert wenn bald stattfindend |
| Bauprojekt | Zahnrad/Blaupause im Kreis | 28-32px | Sekundaer | "Hier wird gebaut" |
| Cluster | Kreis mit Zahl | 48px | Primaer mit Opacity | Zeigt Anzahl bei Zoom-Out |

---

## 4. Referenzen

### "So wie X, aber mit Y"
| # | Referenz | URL | Was wir uebernehmen | Was wir anders machen |
|---|----------|-----|---------------------|----------------------|
| 1 | Duolingo | duolingo.com | Skill-Tree (vertikaler Path), XP, Streaks, Celebration-Animationen, 60-Sek-Onboarding | Hexagonale Tiles statt Kreise (Maker Skill Trees), Karte statt nur Feed, echte Handwerks-Skills |
| 2 | Strava | strava.com | Karte als Zentrum, Activity-Cards (Foto + Stats), Segment-Leaderboards, Community-Heatmaps | Werkstaetten statt Routen, Projekte statt Runs, Gilden statt Clubs |
| 3 | Komoot (2025 Redesign) | komoot.com | Community-Fotos als Entscheidungshilfe (87 Mio. Bilder), Spacing, Mobile-First | Werkstaetten statt Routen, Gamification dazu |
| 4 | Maker Skill Trees | github.com/sjpiper145/MakerSkillTree | 73 hexagonale Tiles pro Tree, Basis→Fortgeschritten Progression | Digital + animiert + XP + Celebration statt statische PDFs |
| 5 | Habitica | habitica.com | RPG-Mechanik fuer Alltag, Parties & Gilden, Avatar-System | Echte Skills statt Habits, Karte statt nur Listen |

### Moodboard-Quellen
- **Werkstatt-Atmosphaere:** Dunkles Holz, Metallregale, Werkzeug an Wand, warmes Licht, Saegemehl
- **Gamification:** Hexagonale Skill-Tiles, leuchtende Fortschrittsbalken, Funken-Animationen bei Unlock
- **Karte:** Warme Tile-Layer (nicht Google-Standard), eigene Marker, Heatmap-Overlay fuer Aktivitaet
- **Festival:** Macher-Festival Ferropolis — industrielle Kulisse, Outdoor-Werkstaetten, Familien die bauen

### Farbwelten der Wettbewerber (aus Deep Dive)
| Wettbewerber | Primaerfarbe | Hex | Was wir daraus lernen |
|--------------|-------------|-----|----------------------|
| Hornbach | Warm-Orange | #F79E1C | Nah an unserem Orange — Vorsicht! |
| OBI | Rein-Orange | #F56600 | Auch Orange-Territorium |
| Bauhaus | Kraeftig-Rot | #E30613 | Rot = besetzt |
| Strava | Orange | #FC4C02 | Sport-Orange, energisch |
| Duolingo | Gruen | #58CC02 | Gruen = Duolingo im Gamification-Kontext |
| Maker Faire | Rot | #E4002B | Event-Rot |
| offene-werkstaetten.org | Gruen/Tuerkis | — | Vereins-sachlich, null Energie |

---

## 5. Kern-Screens

### Screen-Hierarchie
| # | Screen | Zweck | Prioritaet |
|---|--------|-------|------------|
| 1 | **Landing — Hero** | Erster Eindruck: "Lass uns was bauen." | Kritisch |
| 2 | **Landing — Features** | Was kann man tun? (Karte, Skill-Tree, Abenteuer) | Kritisch |
| 3 | **Map — Uebersicht** | Die Karte: Werkstaetten, Macher, Events | Kritisch |
| 4 | **Map — Werkstatt-Panel** | Detail einer Werkstatt (Sidebar oder Bottom-Sheet) | Kritisch |
| 5 | **Skill-Tree** | Hexagonaler Macher-Skill-Tree mit Progression | Kritisch |
| 6 | **Macher-Profil** | Identitaet: Avatar, Level, Skills, Badges, Projekte | Hoch |
| 7 | **Abenteuer-Detail** | Event/Workshop: Was, Wann, Wo, Wer kommt? | Hoch |
| 8 | **Dashboard** | Bento-Grid: Karte + Skill-Fortschritt + Quest + Community | Hoch |
| 9 | **Onboarding** | Erster Kontakt: Erfolg in 60 Sek (Duolingo-Stil) | Mittel |

### Wireframe-Notizen

#### Landing — Hero
- **Layout:** Fullscreen Video/Bild + Overlay-Text. Haende die bauen, Funken fliegen, Werkstatt-Atmosphaere.
- **Headline:** "Lass uns was bauen." (Space Grotesk, 48px+, weiss auf dunklem Bild)
- **Subline:** "Finde Werkstaetten, lerne Skills, bau mit deiner Community."
- **CTA:** "Reinhauen" (nicht "Jetzt registrieren") — gross, primaerfarben
- **Zweiter CTA:** "Karte ansehen" — Ghost-Button
- **Scroll-Hinweis:** Dezenter Pfeil oder Animation

#### Map — Uebersicht
- **Tile-Layer:** Warm, erdig (kein kaltes Google-Blau). Mapbox Custom Style oder Leaflet mit warmem Theme.
- **Marker-Stil:** Typ-spezifische Werkzeug-Icons (siehe Karten-Marker oben)
- **Panel-Position:** Mobile = Bottom-Sheet (swipeable), Desktop = rechte Sidebar (400px)
- **Filter:** Werkstatt-Typ (Holz, Metall, Elektronik, Textil, ...), Abenteuer, Macher, Bauprojekte
- **Heatmap-Layer:** Optional: "Wo wird am meisten gemacht?" als Overlay
- **Suche:** Top-Bar mit Orts-Suche + "In meiner Naehe"
- **Karte klicken schliesst Panels** (Timos Wunsch aus frueherer Iteration)

#### Skill-Tree
- **Layout:** Hexagonales Grid (inspiriert von Maker Skill Trees auf GitHub)
- **Progression:** Unten = Basis-Skills, oben = Fortgeschritten. 73 Tiles pro Tree-Bereich.
- **Visuelle States:** Locked (grau, Schloss-Icon), Unlockable (pulsierende Umrandung), In Progress (Fortschrittsring), Completed (voll ausgefuellt + Glow), Mastered (Gold + Sternchen)
- **Kategorien:** Holz, Metall, Elektronik, Textil, 3D-Druck, CNC, Outdoor-Bau, ...
- **Celebration:** Bei Skill-Unlock: Funken-Animation + Hammer-Sound-Visualisierung + XP-Counter der hochzaehlt
- **Touch:** Tap auf Tile → Detail-Popup (was ist der Skill, wie unlock ich ihn, wer kann ihn?)

#### Macher-Profil
- **Layout:** Header-Card mit Avatar + Level-Badge + XP-Bar, darunter Tabs
- **Tabs:** Skills | Projekte | Badges | Gilden
- **Kern-Elemente:** Grosser Avatar (mit Level-Ring: Bronze/Silber/Gold), Name, "Macher seit...", Statement ("Ich bau Moebel und Gitarren"), Stats (Skills, Projekte, Community-Score)
- **Gamification sichtbar:** XP-Balken, naechstes Level, aktueller Streak, Badge-Galerie

#### Dashboard (Bento-Grid)
- **Layout:** Modulare Boxen in Bento-Grid (CSS Grid, variable Groessen)
- **Boxen:** Mini-Karte (gross, links oben), Skill-Fortschritt (kompakt), Aktuelle Quest, Naechstes Abenteuer, Community-Feed (letzte Aktivitaet), Streak-Counter
- **Responsiv:** Mobile = vertikaler Stack, Tablet = 2 Spalten, Desktop = Bento-Grid

---

## 6. Animationen & Micro-Interactions

| Element | Animation | Dauer | Easing | Beschreibung |
|---------|-----------|-------|--------|-------------|
| Page-Transition | Slide + Fade | 300ms | ease-out | Seiten gleiten sanft rein |
| Card-Hover | Scale 1.02 + Shadow | 200ms | ease | Karten heben sich leicht |
| Marker-Appear | Scale from 0 + Bounce | 500ms | spring | Marker poppen auf die Karte |
| Panel-Open | Slide from right/bottom | 350ms | ease-out | Sidebar/Bottom-Sheet gleitet rein |
| Skill-Unlock | Funken-Partikel + Glow + XP-Counter | 800ms | bounce | DAS Celebration-Moment — muss sich GEIL anfuehlen |
| Badge-Earned | Goldener Ring + Pulse + Konfetti | 1000ms | elastic | Seltener aber noch groesser als Skill-Unlock |
| Button-Click | Scale 0.95 + Color-Shift | 150ms | ease | Haptisches Feedback |
| Level-Up | Fullscreen-Overlay + Partikel + Zahl-Animation | 1500ms | custom | Grosses Moment — neues Level, Screen-Filling |
| Streak-Count | Zaehler-Animation (Odometer-Stil) | 400ms | ease-out | Taeglicher Streak zaehlt hoch |
| Map-Zoom | Smooth Zoom + Marker-Cluster-Split | 300ms | ease | Marker splitten sich beim Reinzoomen |

---

## 7. Responsive-Strategie

| Breakpoint | Verhalten | Besonderheiten |
|------------|-----------|----------------|
| Mobile (< 640px) | Mobile-First | Bottom-Sheet statt Sidebar, Skill-Tree scrollbar, Tab-Nav unten (5 Tabs wie Duolingo) |
| Tablet (640-1024px) | Hybrid | Sidebar + Karte nebeneinander, Bento-Grid 2 Spalten |
| Desktop (> 1024px) | Volle Breite | Side-Panels (400px rechts), Bento-Dashboard, Skill-Tree voll sichtbar |

### Mobile-Spezifisch
- **Bottom-Tab-Nav:** Karte | Skill-Tree | Abenteuer | Community | Profil
- **Bottom-Sheet:** Werkstatt-Details als swipeable Sheet (wie Google Maps)
- **Karte:** Fullscreen, Filter als Pills oben
- **Skill-Tree:** Horizontal scrollbar oder pinch-to-zoom

---

## 8. Abgrenzung

### Was dieser Space NICHT ist
- Kein Re-Skin der Lichtung in Orange — komplett eigenes visuelles Universum
- Kein Baumarkt-Online-Shop — wir verkaufen nichts, wir verbinden Menschen
- Keine Anleitung-Plattform (wie Instructables) — wir bringen Menschen zusammen, nicht PDFs
- Keine reine Karten-App (wie Google Maps) — Gamification + Community sind gleichwertig
- Kein kaltes Tech-Produkt — warm, erdig, menschlich, nach Werkstatt riechend

### Was ihn visuell einzigartig macht
1. **Hexagonaler Skill-Tree** — gibt es nirgendwo digital (Maker Skill Trees nur als PDF)
2. **Werkstatt-Aesthetic** — kein anderer digitaler Service sieht nach Werkstatt aus
3. **Celebration-Animationen mit Handwerks-Metaphern** — Funken statt Konfetti, Hammer statt Glocke
4. **Karten-Marker als Werkzeug-Silhouetten** — sofort erkennbar, kein generischer Pin
5. **Dark Mode = "Werkstatt bei Nacht"** — atmosphaerisch, nicht nur dunkel

---

## 9. Offene Fragen an Sebastian

- [ ] **Farbwelt:** Bleiben wir bei Orange (#E8751A) oder wechseln wir in ein freies Territorium (Petrol+Amber oder Anthrazit+Neon)? Orange ist stark aber nah an Hornbach/OBI.
- [ ] **Skill-Tree-Visualisierung:** Hexagonal (wie GitHub Maker Skill Trees) oder ein anderer Ansatz? Wie sehen die 5 States aus (Locked → Mastered)?
- [ ] **Hero-Typ:** Video-Hintergrund (cineastisch, teuer) oder grosses Foto mit Parallax? Oder Scroll-Storytelling?
- [ ] **Karten-Stil:** Wie warm/erdig soll der Tile-Layer sein? Custom Mapbox Style?
- [ ] **Marker-Stil:** Pro Werkstatt-Typ ein eigenes Werkzeug-Icon oder abstraktere Formen?
- [ ] **Celebration-Animationen:** Wie aufwaendig? Reine CSS oder Lottie/Rive fuer die grossen Momente (Skill-Unlock, Level-Up)?
- [ ] **Dark Mode Prioritaet:** Sofort mit designen oder erst spaeter?
- [ ] **3D-Elemente:** Skill-Tree als 3D-Objekt (WebGL) oder 2D mit Tiefe (Schatten, Gradienten)?
- [ ] **Maskottchen:** Brauchen wir eins? (Duolingo hat Duo, wir koennten einen Hammer/Amboss-Charakter haben)
- [ ] **Jugend-Ansprache:** Wie weit gehen wir mit der Sprache? "Reinhauen" statt "Registrieren" — findet er das richtig?

---

## 10. Assets-Checkliste

### Von Sebastian brauchen wir (Prioritaet)
- [ ] **Farbpalette** — finale Entscheidung (Orange vs. Alternative), als Design Tokens / CSS Variables
- [ ] **Kern-Screens** (min. 3 Figma Frames): Landing Hero, Map-Ansicht, Skill-Tree
- [ ] **Karten-Marker** — SVG: Werkstatt (min. 8 Typen), Macher-Pin, Abenteuer, Bauprojekt, Cluster
- [ ] **Skill-Tree Tiles** — Hexagonal, 5 States (Locked, Unlockable, In Progress, Completed, Mastered)
- [ ] **Icon-Set** — Lucide-Erweiterung: Custom Handwerks-Icons (SVG)
- [ ] **Typografie-Scale** — Bestaetigte Groessen/Gewichte als Type Styles
- [ ] **Komponenten** — Buttons (Primary, Secondary, Ghost, Danger), Cards (Werkstatt, Abenteuer, Macher, Projekt), Badges, XP-Bar, Level-Indicator
- [ ] **Celebration-Animationen** — Beschreibung oder Lottie/Rive fuer: Skill-Unlock, Badge-Earned, Level-Up
- [ ] **Hero-Bild/Video** — Konzept + Bildsprache
- [ ] **OG-Image** — fuer Social Sharing (1200x630px)

### Von Eli schon vorbereitet
- [x] KONZEPT.md (Vision, Module, Zielgruppe)
- [x] DEEP-DIVE.md (Markt, 10 Design-Benchmarks, Farbwelten-Analyse, 20 Influencer)
- [x] Live-Prototyp (macher-map.org — aktuell noch Lichtung-Migration, wird umgebaut)
- [x] Tech-Stack steht (React + Vite + TypeScript + Tailwind + Leaflet)
- [x] Deployment-Pipeline (GitHub Actions → Docker → Watchtower → 85.214.196.122)

---

## Deep-Dive-Auszug fuer Sebastian

### Die 3 wichtigsten Erkenntnisse fuer's Design

1. **Maker Skill Trees (GitHub)** — 73 hexagonale Tiles pro Bereich, Open Source, bereits etabliert in der Maker-Community. WIR digitalisieren das. Das ist unser visuelles Alleinstellungsmerkmal.

2. **Orange ist Baumarkt-Territorium** — Hornbach (#F79E1C), OBI (#F56600), Strava (#FC4C02) sind alle Orange. Wenn wir fuer Hornbach pitchen UND Orange sind, sehen wir wie ein Hornbach-Tool aus statt wie ein eigenes Produkt. Sebastian muss entscheiden.

3. **Gamification-Markt explodiert** — 29 Mrd. USD (2025) → 92 Mrd. USD (2030). Duolingo hat bewiesen: Celebration-Animationen sind der Unterschied zwischen "nett" und "suechtig". Unsere Skill-Unlock-Momente muessen KNALLEN — aber ohne Dark Patterns (keine kuenstliche Verknappung, keine Angst-Notifications).

### Wettbewerber-Screenshots die Sebastian sehen sollte
1. **Duolingo Skill-Tree** — vertikaler Path mit Kronen-System
2. **Strava Activity-Card** — Foto + Karte + Stats auf einer Karte
3. **Komoot 2025 Redesign** — Community-Heatmaps, Foto-Content
4. **Maker Skill Trees PDF** — hexagonale Tiles, Progression unten→oben
5. **Hornbach Macher-Festival** — emotionale Bildsprache, "Macher"-Narrativ

---

*Erstellt mit `/space-forge design`. Vorlage: Real-Life-Forge/templates/DESIGN-BRIEF.md*
