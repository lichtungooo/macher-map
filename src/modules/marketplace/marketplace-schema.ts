import type { ModuleSchema } from "../schema-types"

/**
 * Marktplatz — erstes Daten-Modul aus reinem Schema.
 *
 * Items vom Typ "offer" mit:
 *   - title (Titel des Angebots)
 *   - description (Beschreibung)
 *   - kind (Anbieten / Suchen)
 *   - category (Werkzeug / Material / Wissen / ...)
 *   - tags (frei)
 *   - price (frei text — "Tausch", "20 EUR", "Kostenlos", ...)
 *
 * Layout: Cards. Filter: Suche, Art (Anbieten/Suchen), Kategorie.
 *
 * Beweist: aus diesem Schema entsteht ein vollwertiges Modul ohne eigenen Code.
 */
export const marketplaceSchema: ModuleSchema = {
  id: "marketplace",
  label: "Marktplatz",
  description: "Anbieten + Suchen — Werkzeug, Material, Wissen, Werkstatt-Zeit",
  icon: "ShoppingBag",
  itemType: "offer",
  version: "0.1.0",
  license: "MIT",
  tags: ["macher", "tausch", "leihen", "werkstatt"],

  fields: [
    {
      id: "kind",
      label: "Art",
      type: "select",
      visibility: "public",
      required: true,
      options: [
        { value: "offer", label: "Anbieten" },
        { value: "need", label: "Suchen" },
      ],
      order: 10,
    },
    {
      id: "title",
      label: "Titel",
      type: "text",
      visibility: "public",
      required: true,
      placeholder: "Was bietest du an / suchst du?",
      order: 20,
    },
    {
      id: "description",
      label: "Beschreibung",
      type: "textarea",
      visibility: "public",
      placeholder: "Mehr Details — Zustand, Bedingungen, Zeitraum",
      maxLength: 500,
      order: 30,
    },
    {
      id: "category",
      label: "Kategorie",
      type: "select",
      visibility: "public",
      options: [
        { value: "tool", label: "Werkzeug" },
        { value: "material", label: "Material" },
        { value: "knowledge", label: "Wissen" },
        { value: "workspace", label: "Werkstatt-Zeit" },
        { value: "service", label: "Dienstleistung" },
        { value: "other", label: "Anderes" },
      ],
      order: 40,
    },
    {
      id: "price",
      label: "Preis / Tausch",
      type: "text",
      visibility: "public",
      placeholder: "z.B. 'Tausch', '20 EUR', 'Kostenlos', 'Pfand 50 EUR'",
      order: 50,
    },
    {
      id: "tags",
      label: "Tags",
      type: "tags",
      visibility: "public",
      hint: "Frei — fuer Suche und Discovery",
      placeholder: "Holz, schwer, Berlin, ...",
      order: 60,
    },
    {
      id: "location",
      label: "Standort",
      type: "location",
      visibility: "public",
      hint: "Pin auf der Karte (optional)",
      order: 70,
    },
  ],

  layouts: [
    {
      id: "cards",
      type: "cards",
      label: "Karten",
      icon: "LayoutGrid",
      config: {
        titleField: "title",
        descriptionField: "description",
        badgeFields: ["kind", "category"],
      },
    },
    {
      id: "map",
      type: "map",
      label: "Karte",
      icon: "Map",
      config: {
        locationField: "location",
        titleField: "title",
        // Pin-Farbe nach Art (Anbieten/Suchen)
        pinColor: {
          field: "kind",
          map: {
            offer: "#E8751A",  // Macher-Orange = anbieten
            need: "#3b82f6",   // blau = suchen
          },
        },
      },
    },
  ],
  defaultLayout: "cards",

  actions: [
    {
      id: "create",
      label: "Anbieten / Suchen",
      icon: "Plus",
      type: "create",
      placement: ["toolbar"],
    },
    {
      id: "delete",
      label: "Loeschen",
      type: "delete",
      placement: ["detail"],
      when: { ownerOnly: true },
    },
  ],

  filters: [
    { fieldId: "title", type: "search", label: "Suche" },
    { fieldId: "kind", type: "select", label: "Art" },
    { fieldId: "category", type: "select", label: "Kategorie" },
    { fieldId: "tags", type: "tags", label: "Tags" },
  ],

  sortOptions: [
    { id: "newest", label: "Neueste zuerst", fieldId: "createdAt", direction: "desc" },
    { id: "oldest", label: "Aelteste zuerst", fieldId: "createdAt", direction: "asc" },
  ],
  defaultSort: "newest",

  requiredCapabilities: ["ItemWriter"],
}
