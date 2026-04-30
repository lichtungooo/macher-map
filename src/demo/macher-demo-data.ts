/**
 * Demo-Datensatz fuer den Macher-Space.
 *
 * Verteilt sich quer durch Deutschland und deckt alle Pin-Typen ab:
 *   - place    (Werkstaetten)
 *   - event    (Termine + Festivals)
 *   - offer    (Verleih + Kurse)
 *   - need     (Mit-Macher + Material gesucht)
 *   - quest    (kleine offene Aufgaben)
 *   - profile-extension (Macher-Profile mit Standort)
 *
 * Jedes Item bekommt `data.isDemo: true` — daran erkennen wir die Demo-Items
 * fuer das spaetere Aufraeumen.
 */

export interface DemoItem {
  type: string
  data: Record<string, unknown>
}

export const DEMO_FLAG_FIELD = "isDemo"

export const MACHER_DEMO_ITEMS: DemoItem[] = [
  // ============================================================
  // Werkstaetten (places)
  // ============================================================
  {
    type: "place",
    data: {
      title: "Holzwerkstatt Kreuzberg",
      address: "Wiener Str. 12, 10999 Berlin",
      location: { lat: 52.4946, lng: 13.4068, address: "Wiener Str. 12, 10999 Berlin" },
      markdownBody:
        "Offene Holzwerkstatt fuer Moebel, Skateboards, Spielzeug. Bandsaege, Hobel, CNC. Mitgliedsbeitrag oder Tagespass.",
      hashtags: ["holz", "werkstatt", "berlin", "open"],
      isDemo: true,
    },
  },
  {
    type: "place",
    data: {
      title: "FabLab Muenchen Schwabing",
      address: "Hohenzollernstr. 92, 80796 Muenchen",
      location: { lat: 48.1745, lng: 11.5798, address: "Hohenzollernstr. 92, 80796 Muenchen" },
      markdownBody:
        "FabLab mit 3D-Druckern, Lasercutter, CNC-Fraese. Mitgliedschaft guenstig fuer Studis und Maker.",
      hashtags: ["3d-druck", "lasern", "elektronik", "muenchen", "fablab"],
      isDemo: true,
    },
  },
  {
    type: "place",
    data: {
      title: "Metallwerkstatt Hafenstrasse",
      address: "Hafenstr. 96, 20359 Hamburg",
      location: { lat: 53.5485, lng: 9.9685, address: "Hafenstr. 96, 20359 Hamburg" },
      markdownBody:
        "Schweissen, Schmieden, Plasma-Schneiden. Industrie-Look, riesige Halle direkt am Wasser.",
      hashtags: ["metall", "schweissen", "schmieden", "hamburg"],
      isDemo: true,
    },
  },
  {
    type: "place",
    data: {
      title: "Reparatur-Cafe Ehrenfeld",
      address: "Heliosstr. 6a, 50825 Koeln",
      location: { lat: 50.9558, lng: 6.9051, address: "Heliosstr. 6a, 50825 Koeln" },
      markdownBody:
        "Jeden Samstag: bring kaputtes Zeug, repariere es mit Helfern. Kaffee + Kuchen umsonst, Spende erwuenscht.",
      hashtags: ["reparieren", "koeln", "open", "samstag"],
      isDemo: true,
    },
  },
  {
    type: "place",
    data: {
      title: "Toepferwerkstatt Plagwitz",
      address: "Karl-Heine-Str. 99, 04229 Leipzig",
      location: { lat: 51.3296, lng: 12.336, address: "Karl-Heine-Str. 99, 04229 Leipzig" },
      markdownBody:
        "Drehscheiben, Brennofen, Kurse fuer Anfaenger. Tee + Kekse inklusive.",
      hashtags: ["toepfern", "keramik", "leipzig", "kurse"],
      isDemo: true,
    },
  },
  {
    type: "place",
    data: {
      title: "Open-Source-Werkstatt Dresden",
      address: "Bischofsweg 50, 01099 Dresden",
      location: { lat: 51.0689, lng: 13.747, address: "Bischofsweg 50, 01099 Dresden" },
      markdownBody:
        "Hardware-Hacker treffen sich jeden Mittwoch. Loetstationen, Oszilloskope, Maker-Vibes.",
      hashtags: ["elektronik", "hardware", "dresden", "open-source"],
      isDemo: true,
    },
  },

  // ============================================================
  // Events
  // ============================================================
  {
    type: "event",
    data: {
      title: "Sommerfest Holzwerkstatt Kreuzberg",
      address: "Wiener Str. 12, 10999 Berlin",
      location: { lat: 52.4946, lng: 13.4068, address: "Wiener Str. 12, 10999 Berlin" },
      start: "2026-06-21T14:00:00.000Z",
      end: "2026-06-21T22:00:00.000Z",
      markdownBody: "Holz, Grill, Bier, Live-Musik. Bring eigene Hobelspaene mit ;-)",
      hashtags: ["sommerfest", "berlin", "holz"],
      isDemo: true,
    },
  },
  {
    type: "event",
    data: {
      title: "3D-Druck-Sprechstunde",
      address: "Hohenzollernstr. 92, 80796 Muenchen",
      location: { lat: 48.1745, lng: 11.5798, address: "Hohenzollernstr. 92, 80796 Muenchen" },
      start: "2026-05-15T18:00:00.000Z",
      end: "2026-05-15T20:00:00.000Z",
      markdownBody: "Bring dein Bastelprojekt — wir tunen den Slicer.",
      hashtags: ["3d-druck", "muenchen", "open"],
      isDemo: true,
    },
  },
  {
    type: "event",
    data: {
      title: "Macher-Festival Ferropolis",
      address: "Ferropolisstr. 1, 06773 Graefenhainichen",
      location: { lat: 51.735, lng: 12.4233, address: "Ferropolis 06773 Graefenhainichen" },
      start: "2026-08-06T16:00:00.000Z",
      end: "2026-08-09T22:00:00.000Z",
      markdownBody:
        "Das grosse Treffen aller Macher. Drei Tage, viele Werkstaetten, ein Funke.",
      hashtags: ["festival", "ferropolis", "macher", "sommer"],
      isDemo: true,
    },
  },

  // ============================================================
  // Angebote
  // ============================================================
  {
    type: "offer",
    data: {
      title: "Drechselbank zu verleihen",
      address: "Koeln-Ehrenfeld",
      location: { lat: 50.9528, lng: 6.9171, address: "Koeln-Ehrenfeld" },
      markdownBody: "Wenig genutzt, gerne fuer Wochen-Verleih. Eigenabholung.",
      hashtags: ["drechseln", "verleih", "koeln"],
      isDemo: true,
    },
  },
  {
    type: "offer",
    data: {
      title: "Schreiner-Workshop fuer 8 Personen",
      address: "Stuttgart-West",
      location: { lat: 48.7758, lng: 9.1593, address: "Stuttgart-West" },
      markdownBody: "8h, vom Brett zum Schemel. 90 EUR/Person inkl. Material.",
      hashtags: ["holz", "workshop", "stuttgart"],
      isDemo: true,
    },
  },

  // ============================================================
  // Suche
  // ============================================================
  {
    type: "need",
    data: {
      title: "Mitstreiter fuer Lastenrad-Bau",
      address: "Frankfurt-Bornheim",
      location: { lat: 50.1306, lng: 8.705, address: "Frankfurt-Bornheim" },
      markdownBody:
        "Schweissen + Bremsen-Anpassung. 2 Wochenenden, dann faehrt das Ding.",
      hashtags: ["lastenrad", "schweissen", "frankfurt", "kollab"],
      isDemo: true,
    },
  },
  {
    type: "need",
    data: {
      title: "Brennofen leihen oder kaufen",
      address: "Leipzig",
      location: { lat: 51.3397, lng: 12.3731, address: "Leipzig" },
      markdownBody: "Mittlerer Brennofen, ca. 60L. Bereit Reisekosten zu zahlen.",
      hashtags: ["toepfern", "brennofen", "leipzig"],
      isDemo: true,
    },
  },

  // ============================================================
  // Quests (kleine offene Aufgaben)
  // ============================================================
  {
    type: "quest",
    data: {
      title: "Bauanleitung: Hochbeet aus Paletten",
      address: "Berlin",
      location: { lat: 52.517, lng: 13.3889, address: "Berlin" },
      markdownBody:
        "Wer macht ein Schritt-fuer-Schritt mit Fotos? Open-Source CC-BY.",
      hashtags: ["upcycling", "garten", "berlin", "open-source"],
      isDemo: true,
    },
  },
  {
    type: "quest",
    data: {
      title: "Reparatur-Sonntag organisieren",
      address: "Hamburg-Altona",
      location: { lat: 53.55, lng: 9.9333, address: "Hamburg-Altona" },
      markdownBody:
        "Raeumlichkeit + 5 Reparateure finden. Termin: Fruehling 2026.",
      hashtags: ["reparieren", "hamburg", "kollab"],
      isDemo: true,
    },
  },

  // ============================================================
  // Macher (Profile-Extensions mit Standort)
  // ============================================================
  {
    type: "profile-extension",
    data: {
      name: "Lara aus der Holzwerkstatt",
      bio: "Holzbauerin in Berlin. Moebel, Skateboards, Spielzeug.",
      address: "Berlin-Kreuzberg",
      location: { lat: 52.498, lng: 13.418, address: "Berlin-Kreuzberg" },
      skills: ["Holz", "CNC", "Drechseln"],
      offers: ["Werkstatt-Zeit", "Workshops"],
      hashtags: ["holz", "berlin"],
      isDemo: true,
    },
  },
  {
    type: "profile-extension",
    data: {
      name: "Tom Schweisst",
      bio: "Metall-Kuenstler aus Hamburg. Schmiede + Kunst.",
      address: "Hamburg-St. Pauli",
      location: { lat: 53.55, lng: 9.965, address: "Hamburg-St. Pauli" },
      skills: ["Metall", "Schweissen", "Schmieden"],
      offers: ["Auftragsarbeiten"],
      hashtags: ["metall", "hamburg"],
      isDemo: true,
    },
  },
  {
    type: "profile-extension",
    data: {
      name: "Anna 3D",
      bio: "FabLab-Pionierin Muenchen. Lehre, Kurse, Forschung.",
      address: "Muenchen-Schwabing",
      location: { lat: 48.17, lng: 11.58, address: "Muenchen-Schwabing" },
      skills: ["3D-Druck", "Lasern", "CAD"],
      offers: ["Kurse", "Beratung"],
      hashtags: ["3d-druck", "muenchen"],
      isDemo: true,
    },
  },
]

/** Item-Typen, die in den Demo-Daten vorkommen — fuer Zaehler/UI. */
export const DEMO_ITEM_TYPES = Array.from(
  new Set(MACHER_DEMO_ITEMS.map((i) => i.type))
)

/** Verteilung der Demo-Items pro Typ — fuer den Lade-Status. */
export const DEMO_BREAKDOWN: Record<string, number> = MACHER_DEMO_ITEMS.reduce(
  (acc, i) => {
    acc[i.type] = (acc[i.type] ?? 0) + 1
    return acc
  },
  {} as Record<string, number>
)
