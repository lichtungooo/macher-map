# Macher-Map — Deep Dive

Stand: 2026-04-23

---

## 1. Markt-Landschaft

### Marktvolumen & Trends
| Kennzahl | Wert | Quelle |
|----------|------|--------|
| Marktvolumen Baumarkt gesamt | ~24,8 Mrd. EUR (2024) | [Handelsdaten.de](https://www.handelsdaten.de/bau-und-heimwerkermarkte/top-6-umsatz-baumarktunternehmen-deutschland-2024) |
| Wachstumsrate | +2,9% (Anfang 2025, Erholung) | Handelsdaten.de |
| Makerspaces DACH | 379 Standorte | [Maker Faire](https://maker-faire.de/en/makerspaces/) |
| Handwerksbetriebe DE | 1.038.315 | [ZDH](https://www.zdh.de/daten-und-fakten/kennzahlen-des-handwerks/) |
| Beschaeftigte Handwerk | 5,6 Mio. (12,3% aller Erwerbstaetigen) | ZDH |
| Unbesetzte Stellen Handwerk | 200.000–250.000 | [IW Koeln](https://www.iwkoeln.de/studien/lydia-malin-helen-hickmann-fachkraeftemangel-in-handwerksberufen-frauen-sind-ein-wichtiger-teil-der-loesung.html) |
| Unbesetzte Ausbildungsplaetze | 73.000+ (2023) | ZDH |
| Azubis im Handwerk | ~342.000 (28,2% aller Azubis) | ZDH |
| Trend-Richtung | Aufwaerts: Fachkraeftemangel erzwingt Innovation, Gamification/Community als Loesungsansatz | Marktbeobachtung |

### Die 10 groessten Player
| # | Player | Umsatz/Groesse | Was sie machen | Staerke | Schwaeche |
|---|--------|----------------|----------------|---------|-----------|
| 1 | Bauhaus | 4,40 Mrd. EUR | Baumarkt-Kette, eigene Workshop-Angebote | Marktfuehrer, groesstes Sortiment | Kein digitales Community-Erlebnis |
| 2 | OBI | 4,19 Mrd. EUR | Baumarkt, groesstes Filialnetz | Reichweite, Filialdichte | Kein Maker-Fokus, generisch |
| 3 | Hornbach | 3,25 Mrd. EUR | Baumarkt, Macher-Festival, Experience Marketing | Staerkste Marke fuer "Macher", Festival mit 8.000+ Besuchern | Digitale Verlaengerung fehlt |
| 4 | offene-werkstaetten.org | 379 Standorte | Verzeichnis offener Werkstaetten (Verbund) | Vollstaendigstes Verzeichnis in DACH | Kein Peer-to-Peer, keine Interaktion, keine Community |
| 5 | Maker Faire DE | 10.000-15.000 Besucher/Jahr | Events, Karte mit 379 Makerspaces | Bekannteste Maker-Veranstaltung | Nur Verzeichnis + Events, keine laufende Community |
| 6 | fablabs.io | Global | Globales FabLab-Verzeichnis | International, gut gepflegt | Kein lokaler Fokus, keine Community-Features |
| 7 | MINTvernetzt | Institutionell | STEM-Bildungsnetzwerk | Staatliche Foerderung, Reichweite | Bildungstraeger-Fokus, nicht Maker |
| 8 | Hornbach "Macher Projekte" | — | Galerie (#zeigsHORNBACH) | Social Proof, echte Projekte | Nur Galerie, kein Peer-to-Peer, kein Skill-Tracking |
| 9 | Instructables | Global | DIY-Anleitungsplattform (Autodesk) | Riesige Anleitungs-Datenbank | Englisch, kein lokaler Bezug, kein Gamification |
| 10 | Hackster.io | Global | IoT/Electronics Community | Stark in Elektronik/IoT | Nische, kein Handwerk allgemein |

### Bestehende Plattformen / Loesungen
| Plattform | Was sie macht | Nutzer/Reichweite | Was fehlt |
|-----------|--------------|-------------------|----------|
| offene-werkstaetten.org | Verzeichnis offener Werkstaetten | 379 Standorte | Kein Peer-to-Peer, keine Community, kein Skill-Tracking |
| maker-faire.de/makerspaces | Karte mit Makerspaces | 379 Standorte | Nur Verzeichnis, keine Interaktion |
| fablabs.io | Globales FabLab-Verzeichnis | 2.000+ global | International, keine lokale Community |
| MINTvernetzt | Institutionelles STEM-Netzwerk | Bildungstraeger | Nicht Maker, nicht Community-driven |
| Hornbach "Macher Projekte" | Projekt-Galerie | Unbekannt | Nur Galerie, kein Peer-to-Peer |
| Instructables.com | DIY-Anleitungen | Millionen global | Englisch, kein lokaler Bezug, keine Karte |

### Die Luecke
**Was macht NIEMAND?**
Keine einzige Plattform kombiniert: interaktive Karte + Skill-Tree mit Gamification + Peer-Community + Werkstatt-Finder + Materialboerse. Jeder Player deckt ein Fragment ab — Verzeichnisse ohne Community, Communities ohne Karte, Galerien ohne Gamification. Die Macher-Map besetzt das komplette unbesetzte Territorium: **Duolingo trifft Strava trifft Google Maps — fuer Handwerk.** Das Handwerk hat 200.000+ unbesetzte Stellen und keine digitale Plattform, die Jugendliche in ihrer Sprache (Gamification, XP, Levels) anspricht.

---

## 2. Zielgruppe

### Segment-Analyse
| Segment | Groesse | Alter | Beduerfnis | Wo online? | Wo offline? | Sprache/Ton |
|---------|---------|-------|------------|------------|-------------|-------------|
| **Primaer:** Familien mit Kindern (10+) | 8.000+ Macher-Festival-Besucher, Millionen DIY-Familien | 25-45 (Eltern), 10-16 (Kinder) | Gemeinsam bauen, erleben, Quality Time, Skills entdecken | YouTube (Real Life Guys), Instagram, Facebook-Gruppen | Makerspaces, Baumaerkte, Macher-Festival, Schulen | Locker, familienfrerundlich, "Lass uns das zusammen bauen" |
| **Sekundaer:** Jugendliche / Azubis | 342.000 Azubis, Millionen Schueler | 14-25 | Berufsorientierung, Skills sichtbar machen, Community, Anerkennung | TikTok, YouTube, Instagram, Discord | Berufsschulen, Praktika, Makerspaces | Gaming-Sprache, Challenges, "Level up", XP, Achievements |
| **Tertiaer:** Handwerksbetriebe | 1.038.315 Betriebe | Betriebsinhaber 35-60 | Nachwuchs finden, Talente entdecken, Sichtbarkeit | LinkedIn, Handwerker-Foren, Kammer-Netzwerke | Innungen, Messen, Kammer-Events | Professionell, ROI-orientiert, "Fachkraefte finden" |

### User-Persona (Kern-Nutzer)
- **Name:** Lena (14)
- **Alter:** 14
- **Beruf:** Schuelerin, 8. Klasse, Praktikum im Makerspace
- **Frustration:** "Alle reden von Studium. Ich will was mit meinen Haenden machen, aber weiss nicht wo anfangen. Meine Freunde checken das nicht."
- **Traum:** "Ich will sehen wie gut ich bin. Ich will Levels aufsteigen. Ich will andere Macher finden die so drauf sind wie ich."
- **Erster Kontakt:** Sieht die Macher-Map am Macher-Festival am Hornbach-Stand. Scannt QR-Code.
- **Aha-Moment:** Oeffnet die Karte, sieht 3 Werkstaetten in ihrer Naehe, erstellt Profil, bekommt ersten Badge: "Erster Funke". Zeigt ihren Skill-Tree den Freunden: "Ich bin Holz Level 3!"

---

## 3. Wettbewerb & Inspiration

### Direkte Wettbewerber
| Wettbewerber | URL | Was sie gut machen | Was sie schlecht machen | Nutzer/Reichweite |
|--------------|-----|-------------------|----------------------|-------------------|
| offene-werkstaetten.org | offene-werkstaetten.org | Vollstaendigstes Verzeichnis, gepflegt, Community-getragen | Statisch, keine Interaktion, kein Profil, kein Gamification | 379 Standorte |
| Maker Faire DE | maker-faire.de | Starke Marke, gute Events, Karte | Nur Events + Verzeichnis, keine laufende Plattform | 10.000-15.000/Event |
| Instructables | instructables.com | Riesige Anleitungs-DB, gute UX, aktive Community | Englisch, kein lokaler Bezug, kein Map-Feature | Millionen global |
| Hackster.io | hackster.io | Starke IoT-Community, Projekt-Sharing | Nische (nur Electronics), englisch | 2M+ global |

### Inspiration aus anderen Branchen
| Vorbild | Branche | Was wir klauen koennen | Wie wir es anpassen |
|---------|---------|----------------------|---------------------|
| Duolingo | Sprachen | Skill-Tree, Streaks (3x taegl. Rueckkehr), XP/Leaderboards (+15% Abschluss), Badges pro Skill, 128 Mio. MAU | Skill-Bereiche: Holz, Metall, Elektro, Schweissen, 3D-Druck. Badges fuer echte Projekte statt Lektionen. |
| Strava | Sport | Social Proof, Leaderboards, Kudos, Segmente, Community Challenges | Macher-Challenges: "Bau diese Woche was aus Holz". Kudos fuer Projekte. Lokale Leaderboards. |
| Discord | Gaming | Server/Channels, Rollen, Community-Bildung, Voice | Gilden (Schweissergilde, Holzgilde), Rollen-System, lokale Channels pro Region |
| Pokemon GO | Gaming | Map-basiertes Gameplay, Sammel-Mechanik, lokale Events | Werkstaetten als "Gyms", Badges als "Pokemon", Abenteuer als "Raids" |
| Notion | Produktivitaet | Clean UI, Flexibilitaet, Templates | Dashboard-Gefuehl fuer Macher: mein Fortschritt, meine Projekte, meine Skills |

---

## 4. Partner & Sponsoren

### Partner-Matrix
| # | Partner | Typ | Umsatz/Budget | Was er mitbringt | Was er braucht | Potenzial | Status |
|---|---------|-----|---------------|------------------|----------------|-----------|--------|
| 1 | Hornbach | Baumarkt | 3,25 Mrd. EUR | Haupt-Sponsor Macher-Festival, 10.000qm Werkstatt, Experience Marketing Budget, Marke "Macher" | Digitale Verlaengerung, Kundenbindung, Nachwuchs-Marketing | **A** | Kontakt ueber Macher-Festival |
| 2 | The Real Life Guys | Influencer/Veranstalter | ~2,07 Mio. Abos | Macher-Festival, Riesige Reichweite, Authentizitaet, direkte Community | Digitale Plattform fuer ihr Festival, Community-Tool | **A** | Kontakt ueber Festival |
| 3 | Bosch / L-BOXX (Sortimo) | Werkzeughersteller | Multi-Mrd. | Bereits Festival-Sponsor 2025, starke Marke, Budget | Produktplatzierung, Markenbindung bei Jugend | **A** | Bestehende Festival-Beziehung |
| 4 | Bauhaus | Baumarkt | 4,40 Mrd. EUR | Marktfuehrer, Workshop-Angebote, Budget | Digitale Community, Differenzierung | **B** | Kein direkter Kontakt |
| 5 | OBI | Baumarkt | 4,19 Mrd. EUR | Groesstes Filialnetz, Budget | Community-Bindung | **B** | Kein direkter Kontakt |
| 6 | Makita / Festool / Metabo | Werkzeughersteller | Premium-Segment | Premiummarken, Handwerker-Community, Budget | Markenbindung, Skill-Tree Platzierung | **B** | Ueber Fachhandel/Messen |
| 7 | ZDH (Zentralverband Dt. Handwerk) | Verband | Institutionell | Imagekampagne Handwerk, Netzwerk, politische Reichweite | Nachwuchsgewinnung, digitale Innovation | **B** | Offizieller Weg |
| 8 | Handwerkskammern | Kammern | Institutionell | Regionale Netzwerke, Ausbildungsbetriebe | Nachwuchs, unbesetzte Plaetze fuellen | **B** | Regional ansprechen |
| 9 | BMBF | Ministerium | Foerdertoepfe | Foerderprogramme Berufsorientierung | Innovative Loesungen, messbare Ergebnisse | **C** | Foerderantraege |
| 10 | Carrera | Sponsor | — | Bereits Festival-Sponsor 2025 | Zielgruppen-Zugang, Event-Praesenz | **C** | Ueber Festival |

**Potenzial-Bewertung:**
- **A** = Strategisch perfekt, hohes Budget, direkter Zugang
- **B** = Guter Fit, mittleres Budget oder indirekter Zugang
- **C** = Moeglicher Fit, braucht mehr Arbeit

### ROI pro Partner-Typ
| Partner-Typ | Was er investiert | Was er bekommt | ROI-Argument (1 Satz) |
|-------------|-------------------|----------------|----------------------|
| Baumarkt | Sponsoring + Lizenz (5-stellig) | Logo auf Karte, bei Events, in Skill-Badges, Kundenbindung | "Eure 10.000qm Werkstatt lebt digital weiter — 365 Tage im Jahr, nicht nur 4 Tage Festival." |
| Werkzeughersteller | Skill-Tree Sponsoring (4-stellig) | Produktplatzierung in Skill-Tree, Workshop-Sponsoring, direkte Zielgruppe | "Eure Marke ist im Skill-Tree verankert — jeder Schweiss-Macher Level 5 kennt euer Logo." |
| Handwerkskammer | Institutionelles Budget (4-stellig) | Recruiting-Pipeline, Talent-Sichtbarkeit, regionale Karte | "73.000 unbesetzte Ausbildungsplaetze — wir machen Handwerk fuer die Generation TikTok sichtbar." |
| Veranstalter (Real Life Guys) | Reichweite + Plattform-Zugang | Digitale Community fuer ihr Festival, gaenzjaehrige Bindung | "Eure 8.000 Festival-Besucher bleiben das ganze Jahr vernetzt — nicht nur 4 Tage." |

### Kontaktwege
| Partner | Ansprechpartner | Kontaktweg | Naechster Schritt |
|---------|----------------|------------|-------------------|
| Hornbach | Marketing / Macher-Festival-Team | Ueber Macher-Festival-Kontakt | Demo vorbereiten mit Ferropolis-Region-Daten |
| Real Life Guys | Johannes & Philipp Mickenbecker | Direkt ueber Festival-Organisation | Persoenliche Demo, "digitale Verlaengerung eures Festivals" |
| Bosch / L-BOXX | Festival-Sponsoring-Kontakt | Ueber bestehende Festival-Beziehung | Skill-Tree-Sponsoring-Konzept vorstellen |
| ZDH | Pressestelle / Innovation | Offizieller Weg, ggf. ueber Kammer | White Paper: "Gamification gegen Fachkraeftemangel" |

---

## 5. Influencer & Multiplikatoren

### Influencer-Liste (Basis — wird durch Recherche erweitert)
| # | Name/Kanal | Plattform | Reichweite | Profil/Nische | Engagement | Kontaktweg | Potenzial-Score (1-10) | Strategie |
|---|------------|-----------|------------|---------------|------------|------------|----------------------|-----------|
| 1 | The Real Life Guys | YouTube | ~2,07 Mio. | Mega-Builds (U-Boot, Haus auf See), Festival-Veranstalter | Hoch, loyale Community | **Ueber Macher-Festival direkt** | 10/10 | Launch-Partner, Festival-Integration |
| 2 | Lets Bastel | YouTube | ~565.000 | Woechentliche DIY-Projekte, juengere Zielgruppe | Gut, regelmaessig | YouTube / Social Media | 8/10 | Content-Partner, Skill-Tree-Showcase |
| 3 | Fynn Kliemann | YouTube | ~525.000 | Reduzierte Aktivitaet, Post-Skandal | Unsicher, Restreichweite gross | Vorsichtig, ueber Dritte | 4/10 | Nur bei Gelegenheit, Risiko beachten |
| 4 | M1Molter | YouTube | ~300.000 | Heimwerken, Reparaturen, solide Anleitungen | Konstant, treue Community | YouTube | 7/10 | Tutorial-Partner, "Werkstatt des Monats" |
| 5 | Laura Kampf | YouTube | ~109.000 | Workshop/Build-Projekte, internationale Reichweite | Hoch, kreativ | Instagram/YouTube | 7/10 | Design-Inspiration, internationale Bruecke |
| 6 | easyalex | YouTube | ~113.000 | Einfache DIY, Upcycling, IKEA-Hacks | Gut, Einsteigerfreundlich | YouTube | 6/10 | Einsteiger-Content, breite Zielgruppe |
| 7 | Laura Kampf | YouTube | ~1,09 Mio. (!) | Handwerk, Metall, Holz, Industrial Design — international | Sehr gut (4-6%) | Management, laurakampf.com | 7/10 | Diversity-Signal, internationale Bruecke, eine der wenigen Frauen |
| 8 | Mach mal / Jonas Winkler | YouTube | ~150-200K | DIY Home Improvement, Renovierung | Hoch | YouTube/Instagram | 7/10 | Praktisch, nahbar, gute Reichweite |
| 9 | Werkstatt von Fynn | YouTube | ~80-120K | Holzbearbeitung, Moebelbau | Sehr hoch | YouTube | 7/10 | Holz-Nische, sehr engagierte Community |
| 10 | Heiko Rech (Holzwerken) | YouTube | ~50-80K | Professionelle Holzbearbeitung, Kurse | Hoch, Profi-Publikum | YouTube/Website | 7/10 | Profi-Segment, hohe Glaubwuerdigkeit |
| 11 | Kreativ-Bude | YouTube | ~40-70K | Upcycling, kreatives DIY | Mittel-Hoch | YouTube | 6/10 | Breite Zielgruppe, Einsteigerfreundlich |
| 12 | Der Frickler | YouTube | ~30-60K | Elektronik, Arduino, Reparatur | Hoch | YouTube | 6/10 | Elektronik-Nische, technikaffin |
| 13 | Andys Werkstatt | YouTube | ~20-50K | Metallbearbeitung, Schweissen | Hoch (Nische) | YouTube | 6/10 | Schweisser-Community, authentisch |
| 14 | Lets Bastel (TikTok) | TikTok | ~100-200K | DIY-Shorts, Werkstatt-Clips | Hoch | Gleicher Creator wie #2 | 7/10 | TikTok-Reichweite zusaetzlich |
| 15 | @die_werkbank | Instagram | ~20-50K | Holzhandwerk, Moebel | Mittel | Instagram DM | 6/10 | Visuell stark, Instagram-Community |
| 16 | @handwerk_magazin | Instagram | ~30-50K | Handwerk allgemein, B2B | Mittel | Redaktion | 5/10 | Medien-Multiplikator |
| 17 | Make Magazin (Print+Online+Podcast) | Multi | ~50-100K (YT), ~5-10K/Folge (Podcast) | Maker, Technik, 3D-Druck | Mittel | Redaktion | 6/10 | Medien-Multiplikator, Print+Online+Podcast |
| 18 | Saku's Bastelstube | YouTube | ~15-30K | 3D-Druck, Maker-Projekte | Hoch | YouTube | 5/10 | 3D-Druck Nische |
| 19 | @diyreparatur | TikTok | ~50-100K | Reparatur-Hacks, Kurzvideos | Hoch | TikTok DM | 6/10 | TikTok-Wachstum, junge Zielgruppe |
| 20 | @tischlereitv | Instagram | ~10-30K | Tischlerei, Holzbearbeitung | Mittel | Instagram | 5/10 | Fach-Community |

*Hinweis: Abonnentenzahlen geschaetzt (Q1 2025). Fuer exakte aktuelle Zahlen: Social Blade, Nindo.de. Laura Kampf korrigiert von 109K auf ~1,09 Mio. (internationales Wachstum).*

**Potenzial-Score erklaert:**
- 10 = Perfekter Fit, riesige Reichweite, direkter Kontakt moeglich
- 7-9 = Sehr guter Fit, gute Reichweite
- 4-6 = Passender Fit, begrenzte Reichweite oder schwieriger Kontakt
- 1-3 = Randrelevanz, nur bei Gelegenheit

### Gesamt-Reichweite
| Plattform | Summe Abonnenten/Follower | Top-3 Kanaele |
|-----------|---------------------------|---------------|
| YouTube | ~5,2 Mio. (Top 10) | Real Life Guys (2,07M), Laura Kampf (1,09M), Lets Bastel (565K) |
| Instagram | ~100-200K (geschaetzt, DE DIY-Szene) | @die_werkbank, @handwerk_magazin, @tischlereitv |
| TikTok | ~200-400K + 500M+ Views #heimwerken | Lets Bastel TikTok, @diyreparatur |
| Podcast | Fragmentiert, kein dominanter Player | Make Magazin (~5-10K/Folge), Holzwerken Podcast |
| **Gesamt** | **~5,7 Mio.+** | |

**Strategische Erkenntnis:** TikTok + Podcast sind UNBESETZTE Felder im deutschen Maker-Bereich. First-Mover-Vorteil moeglich.

### Multiplikatoren (keine klassischen Influencer)
| Organisation/Netzwerk | Typ | Reichweite | Relevanz | Kontaktweg |
|----------------------|-----|------------|----------|------------|
| Verbund offener Werkstaetten | Verband | 379 Werkstaetten | Sehr hoch — unser Kern-Verzeichnis | offene-werkstaetten.org |
| Maker Faire Deutschland | Messe/Event | 10.000-15.000 Besucher | Hoch — gleiche Zielgruppe | Ueber Veranstalter |
| Macher-Festival | Event | 8.000+ Besucher | Kritisch — unser Launch-Event | Real Life Guys |
| Handwerkskammern (53 in DE) | Kammern | 1 Mio.+ Betriebe | Hoch — Multiplikator in jede Region | Regional |
| ZDH Imagekampagne | Verband | National | Hoch — politischer Rueckenwind | Offiziell |
| MINT-Initiativen | Bildung | Tausende Schulen | Mittel — Berufsorientierung | Ueber Bildungstraeger |

---

## 6. Foren, Netzwerke, Communities

### Wo die Zielgruppe JETZT schon ist

**Facebook-Gruppen (GROESSTER Community-Hub in DE):**
| Plattform | Community/Gruppe | Mitglieder | Aktivitaet | URL | Relevanz |
|-----------|-----------------|------------|------------|-----|----------|
| Facebook | Heimwerker Forum | ~80.000-120.000 | Hoch (mehrere Posts/Tag) | facebook.com/groups/ | Sehr hoch |
| Facebook | DIY - Do it yourself (Deutschland) | ~50.000-80.000 | Hoch | facebook.com/groups/ | Hoch |
| Facebook | Holzwerker / Holzwerken | ~30.000-50.000 | Hoch | facebook.com/groups/ | Hoch (Holz-Nische) |
| Facebook | Schweissen fuer Anfaenger und Profis | ~20.000-30.000 | Mittel | facebook.com/groups/ | Mittel |
| Facebook | Maker und 3D-Druck Deutschland | ~15.000-25.000 | Mittel-Hoch | facebook.com/groups/ | Hoch |
| Facebook | Tiny House Deutschland | ~40.000-60.000 | Hoch | facebook.com/groups/ | Mittel-Hoch |
| Facebook | Vanlife & Camperausbau Deutschland | ~50.000-80.000 | Sehr hoch | facebook.com/groups/ | Mittel |

**Klassische Foren (in DE immer noch RELEVANT!):**
| Plattform | Community/Gruppe | Mitglieder | Aktivitaet | URL | Relevanz |
|-----------|-----------------|------------|------------|-----|----------|
| Forum | 1-2-do.com (Bosch-Community) | ~200.000+ registriert | Hoch | 1-2-do.com | Sehr hoch |
| Forum | heimwerker-forum.de | ~50.000+ | Mittel-Hoch | heimwerker-forum.de | Sehr hoch |
| Forum | woodworker.de | ~30.000+ | Mittel | woodworker.de | Hoch (Holz) |
| Forum | mikrocontroller.net | ~100.000+ | Sehr hoch | mikrocontroller.net | Hoch (Elektronik) |
| Forum | holzwerken.net | ~20.000+ | Mittel | holzwerken.net | Hoch |

**Reddit, Discord, Telegram (wachsend, aber kleiner):**
| Plattform | Community/Gruppe | Mitglieder | Aktivitaet | URL | Relevanz |
|-----------|-----------------|------------|------------|-----|----------|
| Reddit | r/heimwerken | ~15.000-20.000 | Mittel | reddit.com/r/heimwerken | Hoch |
| Reddit | r/selbermachen | ~5.000-8.000 | Niedrig-Mittel | reddit.com/r/selbermachen | Mittel |
| Discord | Real Life Guys Community | ~5.000-10.000 | Mittel | — | Sehr hoch |
| Discord | Deutscher Maker-/3D-Druck-Discord | ~2.000-5.000 | Mittel | — | Hoch |
| Telegram | 3D-Druck Deutschland | ~2.000-5.000 | Mittel | — | Mittel |

**Offline-Netzwerke (physische Multiplikatoren):**
| Plattform | Community/Gruppe | Mitglieder | Aktivitaet | URL | Relevanz |
|-----------|-----------------|------------|------------|-----|----------|
| Verband | Verbund Offener Werkstaetten e.V. | 150+ Werkstaetten | Aktiv (Sommercamp, Treffen) | verbundoffenerwerkstaetten.de | **KRITISCH** |
| Verein | FabLab-Netzwerk Deutschland | 80+ FabLabs | Regelmaessig | fablab.de | Hoch |
| Verein | Repair Cafe Deutschland | 900+ Standorte | Sehr aktiv | repaircafe.org/de | Hoch |
| Event | Maker Faire DACH | 10.000-15.000/Event | Jaehrlich | maker-faire.de | Sehr hoch |
| Event | Macher-Festival | 8.000+ Besucher | Jaehrlich (August) | — | **KRITISCH** |
| Verband | Dt. Gesellschaft fuer DIY e.V. | Branchenverband | Institutionell | diy-verband.de | Mittel |
| Kammern | 53 Handwerkskammern | 1 Mio.+ Betriebe | Institutionell | handwerk.de | Hoch |

**Strategische Erkenntnis:** Facebook > Reddit fuer deutsche DIY-Community. Klassische Foren sind in DE nach wie vor STARK (besonders 35+). Der Verbund Offener Werkstaetten (150+ Standorte) ist DER strategische Multiplikator.

### Seeding-Strategie
| Community | Ansatz | Wer macht's | Zeitpunkt |
|-----------|--------|-------------|-----------|
| Macher-Festival | Live-Demo, QR-Codes, "Scann und leg los" | Timo + Team vor Ort | August 2026 |
| YouTube-Communities | Influencer-Koops, "Bau das nach und level up" | Eli (Kontakt) + Influencer | Ab Juni 2026 |
| Offene Werkstaetten | Werkstatt-Betreiber einladen, Listing anbieten | Eli (Outreach) | Ab Mai 2026 |
| Reddit/Facebook | Mehrwert liefern: Karte teilen, Werkstatt-Finder anbieten | Timo | Ab Juli 2026 |
| Schulen/Berufsschulen | Gamification-Pilot: "Macher-Challenge fuer deine Klasse" | Ueber Handwerkskammern | Ab September 2026 |

---

## 7. Design-Benchmark

### 10 Referenz-Websites/Apps analysiert

| # | Website/App | URL | Was sie richtig machen | Design-Pattern | Was fehlt / unsere Chance |
|---|-------------|-----|----------------------|----------------|--------------------------|
| 1 | **Duolingo** | duolingo.com | Skill-Tree mit Kronen-System, Streaks (3x Rueckkehr), XP + Leaderboards (+15% Abschluss), Celebration-Animationen, Maskottchen, Onboarding: Erfolg in 60 Sek | Bottom-Tab-Nav (5 Tabs), vertikaler Skill-Path, Fortschrittsbalken ueberall, 3D-Illustration, runde Formen | Rein digital, keine Karte, kein Community-Matching |
| 2 | **Strava** | strava.com | Community Heatmaps, Segments (Vergleich), Clubs (lokale Gruppen), 150 Mio. Nutzer, eigene Map-Engine (2025), Dark Mode | Karte als Zentrum, Activity-Cards (Foto + Karte + Stats), Segment-Leaderboards | Rein Sport, kein Skill-Tree, Paywall |
| 3 | **Komoot (2025 Redesign!)** | komoot.com | Community-Heatmaps (2025 neu), 87 Mio. Community-Fotos, vorbildlicher Design-Prozess (110 Interviews + 3.000 Surveys) | Karten-basiert, Foto-Content als Entscheidungshilfe, verbesserte Spacing | Nur Outdoor, keine Gamification |
| 4 | **Maker Skill Trees** | github.com/sjpiper145/MakerSkillTree | **SCHLUESSEL-FUND:** 73 hexagonale Skill-Tiles pro Tree, Basis→Fortgeschritten, Open Source, fertige Vorlagen | Hexagonales Grid, klare Progression unten→oben | Nur statische PDFs — keine App, kein XP. **WIR digitalisieren das!** |
| 5 | **Hornbach Macher** | hornbach.de/aktuelles/macher-festival/ | Experience-Marketing, "Macher"-Narrativ, emotionale Bildsprache, #zeigsHORNBACH | Grossflaechige Fotos, cineastische Spots | Nur Galerie, kein P2P, kein Skill-Tracking, kein Karten-Feature |
| 6 | **Habitica** | habitica.com | RPG fuer Alltag (Habits → XP), Avatar-System, Parties & Gilden (Team-Quests), Open Source | Farbcodierte Tasks (Rot→Blau), Party-Feed, Avatar-Customization | Pixel-Art nischig, Bugs, keine Karte |
| 7 | **Instructables** | instructables.com | Goldstandard Step-by-Step-Anleitungen, Contests als Engagement, breite Kategorien | Card-Grid, Step-by-Step-Layout, Kategorie-Nav | Design 2015, keine Karte, kein Skill-Tree |
| 8 | **Hackster.io** | hackster.io | Navigation nach Hardware-Plattform, Web-Design-Tools (2025), Partner-Modell | Dunkler Header + heller Content, Tag-Navigation | Nur Elektronik, keine Gamification |
| 9 | **offene-werkstaetten.org** | offene-werkstaetten.org | Beste Werkstatt-Datenbasis in DACH (379 Orte), Community im Hintergrund | Einfaches CMS, Listenansichten | Vereins-Blog-Optik, null Gamification, keine App |
| 10 | **SkillTree Platform (NSA)** | github.com/NationalSecurityAgency/skills-service | Enterprise Open-Source Gamification-Backend, flexibles Skill/Badge/Level-System, API-first | Konfigurierbare Skills, Badges, Levels | Kein Consumer-Frontend. **Moegliche Backend-Engine!** |

### Design-Trends 2025/2026

- [x] **Dark Mode** — Standard-Erwartung (Strava, Duolingo, Komoot alle 2024/25). Fuer Macher-Map: "Werkstatt bei Nacht"
- [x] **Foto + 3D-Illustration Hybrid** — Fotos fuer Projekte (Komoot: 87 Mio. Bilder), 3D-Illustration fuer Skill-Tree (Duolingo)
- [x] **Maximalismus > Minimalismus** — mehr Farbe, Tiefe, Animation. Bento-Grid-Layouts (Apple-inspiriert)
- [x] **Gamification als Standard** — Markt: 29,11 Mrd. USD (2025), progn. 92,51 Mrd. USD (2030)
- [ ] **Video-Hero** — cineastisch, Scroll-Storytelling fuer Landingpage
- [x] **Scroll-Storytelling** — getimte Reveals, Transitions, interaktive Elemente
- [x] **3D-Elemente / WebGL** — Skill-Tree als 3D-Baum? Werkzeug-Icons als 3D-Objekte?
- [x] **Micro-Interactions** — Celebration bei Skill-Unlock, Partikel bei Badge-Reveal, Puls auf Karten-Pins

### Farbwelten der Wettbewerber

| Wettbewerber | Primaerfarbe | Hex | Sekundaer | Hex | Stil |
|--------------|-------------|-----|-----------|-----|------|
| Hornbach | Warm-Orange | #F79E1C | Petrol-Blau | #066F8F | Emotional, "Macher"-Identitaet |
| OBI | Rein-Orange | #F56600 | Weiss | #FFFFFF | Clean-funktional |
| Bauhaus | Kraeftig-Rot | #E30613 | Schwarz | #000000 | Traditionell-kraftvoll |
| Strava | Strava-Orange | #FC4C02 | Schwarz | #000000 | Sportlich-energisch |
| Duolingo | Gruen | #58CC02 | Gold/Lila | diverse | Freundlich-verspielt |
| Maker Faire | Rot | #E4002B | Weiss | #FFFFFF | Event-betont |
| offene-werkstaetten | Gruen/Tuerkis | — | Weiss | — | Vereins-sachlich |

**Analyse:** Orange besetzt (Hornbach, OBI, Strava). Rot besetzt (Bauhaus). Gruen = Duolingo. Unser #E8751A liegt im Hornbach/OBI-Territorium.

**Freie Farbterritorien:**
1. Dunkles Petrol + Amber/Gold — handwerklich, edel, sofort abgrenzend
2. Anthrazit + Neon-Gelb — modern, "Werkstatt bei Nacht"
3. Warmes Dunkelgruen + Kupfer — organisch, Werkstoff-Palette

*Entscheidung mit Sebastian im Design-Brief. Aktuell fahren wir Orange — Abgrenzung ueber Gamification + Map + Tonalitaet.*

### Was WIR anders machen (Abgrenzung)

1. **Gamification-First:** Hexagonaler Skill-Tree (wie Maker Skill Trees GitHub), aber digital + animiert + XP + Streaks + Celebration-Animationen
2. **Karte als Herzstueck:** Map-basiert mit Heatmaps ("Wo wird gemacht?"), wie Strava/Komoot aber fuer Maker
3. **Werkstatt-Aesthetic + Dark Mode:** Dunkel, erdig, nach Arbeit aussehend. Nicht Baumarkt-Clean
4. **Foto + 3D Hybrid:** Echte Haende/Funken/Werkbaenke + 3D-Illustrationen fuer Skill-Tree
5. **Celebration-Animationen:** Skill-Unlock mit Funken und Haemmern statt Konfetti
6. **Bento-Grid-Dashboard:** Karte + Skill-Fortschritt + Quest + Community in modularen Boxen
7. **Jugend-Sprache:** Buttons sagen "Reinhauen", nicht "Jetzt registrieren"

---

## 8. Finanz-Spektrum

### Kosten
| Phase | Zeitraum | Investition | Wer traegt's |
|-------|----------|-------------|-------------|
| Prototyp | Apr–Jun 2026 | Eigenleistung | Timo + Eli |
| MVP (Festival-ready) | Jul–Aug 2026 | Pitch-Fee + erste Partner-Beitraege | Partner + Eigenleistung |
| Scale | Sep 2026+ | Sponsoring + Lizenz-Einnahmen | Partner + Community |

### Einnahme-Modelle
| Modell | Beschreibung | Umsatz-Potenzial | Zeitpunkt |
|--------|-------------|------------------|-----------|
| 1. Werkstatt-Listings | Premium-Sichtbarkeit fuer Werkstaetten/FabLabs | 10-50 EUR/Monat × 379+ Standorte | Ab Launch |
| 2. Sponsoring | Baumaerkte, Werkzeughersteller, Events (Skill-Tree, Badges, Karten-Praesenz) | 5-stellig pro Partner/Jahr | Ab erstem Pitch |
| 3. Materialboerse | Provision auf Transaktionen (Material, Werkzeug) | 5-10% Provision | Spaeter (Phase 2) |
| 4. B2B Handwerk | Talent-Sichtbarkeit fuer Betriebe (Recruiting-Tool) | Abo-Modell, 50-200 EUR/Monat | Ab Scale |
| 5. RLN Showroom-Modell | Pitch-Fee + Aufsatz-Lizenz + Rev-Share | Abhaengig vom Partner-Deal | Laufend |

### Break-Even
| Szenario | Zeitraum | Voraussetzung |
|----------|----------|---------------|
| Konservativ | 18 Monate nach Launch | 1 Hauptsponsor (Hornbach), 50 Werkstatt-Listings |
| Realistisch | 12 Monate nach Launch | 2 Sponsoren + 100 Listings + erste Materialboerse |
| Optimistisch | 6 Monate nach Launch | Hornbach + Bosch + 200 Listings + B2B Recruiting |

---

## 9. Pitch-Strategie

### Pitch-Reihenfolge
| # | Wen | Wann | Ueber wen | Kern-Argument | Was zeigen |
|---|-----|------|-----------|---------------|------------|
| 1 | Intern (Team) | Sofort | — | Ausrichtung, Vision teilen | KONZEPT.md + DEEP-DIVE.md |
| 2 | Handwerker (echte Betriebe) | Mai 2026 | Direkt | Realitaets-Check, "Wuerdet ihr das nutzen?" | Karten-Prototyp mit lokalen Daten |
| 3 | Real Life Guys | Juni 2026 | Macher-Festival-Kontakt | "Digitale Verlaengerung eures Festivals, gaenzjaehrig" | Live-Demo mit Ferropolis-Daten |
| 4 | Hornbach | Juni 2026 | Ueber Festival-Verbindung | "Eure 10.000qm Werkstatt lebt digital weiter — 365 Tage" | Demo mit Hornbach-Region-Daten, Skill-Tree |
| 5 | Bosch / L-BOXX | Juli 2026 | Bestehende Festival-Beziehung | "Eure Marke im Skill-Tree — jeder Macher kennt euch" | Skill-Tree mit Werkzeug-Integration |
| 6 | Handwerkskammern / ZDH | Aug 2026+ | Offiziell | "Gamification gegen Fachkraeftemangel — Generation TikTok" | Zahlen + Live-Demo + Pilot-Konzept |

### Der eine Satz (pro Partner)
| Partner | "Wir sind..." |
|---------|--------------|
| Hornbach | "Wir sind die digitale Schicht, die eure 10.000qm Werkstatt 365 Tage im Jahr leben laesst." |
| Real Life Guys | "Wir sind die Plattform, auf der eure 8.000 Festival-Besucher das ganze Jahr Macher bleiben." |
| Bosch | "Wir sind der Skill-Tree, in dem eure Werkzeuge die Helden sind." |
| Handwerkskammer | "Wir machen Handwerk fuer die Generation TikTok sichtbar — mit Gamification statt Broschüren." |

### Was wir zeigen
1. **Karte oeffnen** — sofort Werkstaetten in der Region des Partners sehen
2. **Profil erstellen** — 30 Sekunden, Offers & Needs, erster Badge
3. **Skill-Tree** — "Holz Level 1 → Meister" — Duolingo-Gefuehl fuer Handwerk
4. **Abenteuer** — Workshop finden, anmelden, hingehen
5. **Zahlen** — 379 Makerspaces, 1 Mio. Betriebe, 73.000 unbesetzte Plaetze

### Was wir NICHT sagen (Fallstricke)
- Nicht "Social Media Plattform" — sondern "Werkzeug fuer echte Begegnung"
- Nicht "Wir ersetzen euer Marketing" — sondern "Wir verlaengern euer Erlebnis digital"
- Nicht "Startup" — sondern "Community-Projekt mit professioneller Umsetzung"
- Nicht mit Technik anfangen — sondern mit dem Gefuehl: "Stellt euch vor, jeder Jugendliche..."
- Nicht Fynn Kliemann erwaehnen — Risiko-Thema

---

## 10. Ressourcen-Check

### Was wir haben
- [x] Live-Prototyp unter macher-map.org (App laeuft)
- [x] Karte mit Basis-Funktionalitaet (Pins, Werkstaetten, Events)
- [ ] Echte Werkstatt-Daten auf der Karte (noch zu befuellen)
- [ ] Skill-Tree Prototyp (noch zu bauen)
- [ ] Video-Material (noch zu produzieren)
- [x] Partner-Kontakte identifiziert (Hornbach, Real Life Guys ueber Festival)
- [x] Team bereit (Timo Vision/Pitch, Eli Code, Sebastian UX)
- [x] Deployment-Pipeline steht (GitHub Actions → ghcr.io → Watchtower)

### Was noch fehlt
- [ ] Echte Werkstatt-Daten fuer Ferropolis-Region (fuer Pitch-Demo)
- [ ] Skill-Tree MVP (Kern-Feature fuer Differenzierung)
- [ ] Materialboerse MVP
- [ ] Landingpage im eigenen Universum (nicht Lichtung-Reskin)
- [ ] Video: 60s "Was ist die Macher-Map?" 
- [ ] One-Pager fuer Leave-Behind nach Pitch
- [ ] Design-Brief fuer Sebastian

---

## Quellen

Alle Daten mit Quelle belegt:

- [Handelsdaten.de — Top-6 Baumarkt-Umsatz 2024](https://www.handelsdaten.de/bau-und-heimwerkermarkte/top-6-umsatz-baumarktunternehmen-deutschland-2024) — Marktvolumen, Umsatz-Rankings
- [Maker Faire — Makerspaces in Deutschland](https://maker-faire.de/en/makerspaces/) — 379 Standorte DACH
- [Ferropolis — Macher-Festival](https://www.ferropolis.de/events/the-real-life-guys-macher-festival) — Veranstaltungsort, Datum
- [Hornbach — Macher-Festival](https://www.hornbach.de/aktuelles/macher-festival/) — Sponsoring-Details, 10.000qm Werkstatt
- [Campaign Germany — Hornbach + Real Life Guys](https://campaigngermany.de/news/beitrag/1237-hornbach-und-die-real-life-guys-gehen-mit-dem-macher-festival-in-die-zweite-runde.html) — Festival Runde 2
- [ZDH — Kennzahlen des Handwerks 2024](https://www.zdh.de/daten-und-fakten/kennzahlen-des-handwerks/) — Betriebe, Beschaeftigte, Azubis
- [IW Koeln — Fachkraeftemangel Handwerk](https://www.iwkoeln.de/studien/lydia-malin-helen-hickmann-fachkraeftemangel-in-handwerksberufen-frauen-sind-ein-wichtiger-teil-der-loesung.html) — Unbesetzte Stellen
- [ZDF Heute — Handwerk Ausblick 2026](https://www.zdfheute.de/wirtschaft/handwerk-ausblick-2026-100.html) — Trends, politische Lage
- [Social Blade — Real Life Guys](https://socialblade.com/youtube/handle/thereallifeguys) — Abonnenten-Daten
- [StriveCloud — Duolingo Gamification](https://www.strivecloud.io/blog/gamification-examples-boost-user-retention-duolingo) — Gamification-Zahlen
- [Jesus.de — Macherfestival 2024](https://www.jesus.de/nachrichten-themen/macherfestival-2024-basteln-schweissen-und-bungee-jumping/) — Besucher, Programm

---

*Erstellt mit `/deep-dive`. Vorlage: Real-Life-Forge/templates/DEEP-DIVE.md*
