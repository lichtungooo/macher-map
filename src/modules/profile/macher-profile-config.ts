import type { ProfileModuleConfig } from "../types"

/**
 * Default-Profil-Konfig fuer den Macher-Space.
 *
 * Felder mappen 1:1 auf Antons `ProfileItemData`-Schema:
 *   real-life-stack/packages/data-interface/src/item-types.ts:234
 *
 * Reihenfolge im Editor: order-Feld kleiner zuerst.
 */
export const macherProfileConfig: ProfileModuleConfig = {
  fields: [
    // Identitaet (Master-Felder, immer da)
    {
      id: "name",
      label: "Name",
      type: "text",
      visibility: "public",
      placeholder: "Dein Name",
      required: true,
      order: 10,
    },
    {
      id: "bio",
      label: "Ueber mich",
      type: "textarea",
      visibility: "public",
      placeholder: "Ein kurzer Satz ueber dich",
      maxLength: 280,
      order: 20,
    },

    // Macher-spezifische Felder
    {
      id: "skills",
      label: "Skills",
      type: "tags",
      visibility: "public",
      hint: "Was du kannst",
      placeholder: "Holz, Metall, Schweissen, ...",
      suggestions: [
        "Holz", "Metall", "Schweissen", "Drechseln", "Schnitzen",
        "Drucken", "3D-Druck", "Lasern", "CNC", "Programmieren",
        "Naehen", "Stricken", "Filzen", "Toepfern", "Glasen",
        "Loeten", "Elektronik", "Photovoltaik", "Reparieren",
        "Restaurieren", "Lackieren", "Polstern",
      ],
      order: 30,
    },
    {
      id: "offers",
      label: "Was du anbietest",
      type: "tags",
      visibility: "public",
      hint: "Werkzeug, Werkstatt-Zeit, Wissen",
      placeholder: "Werkstatt-Zeit, Werkzeug-Verleih, ...",
      suggestions: [
        "Werkstatt-Zeit", "Werkzeug-Verleih", "Material",
        "Wissen weitergeben", "Workshops", "Co-Working",
        "Reparatur-Hilfe", "Beratung",
      ],
      order: 40,
    },
    {
      id: "needs",
      label: "Was du suchst",
      type: "tags",
      visibility: "public",
      hint: "Mit-Macher, Material, Auftraege",
      placeholder: "Mit-Macher, Material, ...",
      suggestions: [
        "Mit-Macher", "Material", "Werkzeug", "Werkstatt",
        "Auftraege", "Lehrling", "Mentor",
      ],
      order: 50,
    },

    // Kontakt-Felder (contacts-only)
    {
      id: "address",
      label: "Werkstatt-Adresse",
      type: "address",
      visibility: "contacts",
      hint: "Nur fuer Kontakte sichtbar",
      placeholder: "Strasse, Hausnummer, PLZ Ort",
      order: 60,
    },
    {
      id: "phone",
      label: "Telefon",
      type: "phone",
      visibility: "contacts",
      hint: "Nur fuer Kontakte sichtbar",
      placeholder: "+49 ...",
      order: 70,
    },
  ],
}
