import { EmptyDemoBanner } from "./EmptyDemoBanner"

/**
 * EmptyMapBanner — Karten-spezifischer Wrapper um den generischen
 * EmptyDemoBanner. Default-Texte fuer leere Karten-Spaces.
 */
export function EmptyMapBanner({ visible, isAdmin }: { visible: boolean; isAdmin: boolean }) {
  return (
    <EmptyDemoBanner
      visible={visible}
      isAdmin={isAdmin}
      title="Hier wird gleich was los"
      adminText="Die Karte wartet auf Pins. Lass uns mit einem Demo-Set starten — 19 Werkstaetten, Events und Macher quer durch Deutschland. Du kannst sie jederzeit wieder loeschen."
      memberText="Sobald ein Admin Pins anlegt, erscheinen sie hier auf der Karte."
      centered
    />
  )
}
