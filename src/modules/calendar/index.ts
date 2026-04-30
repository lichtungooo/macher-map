/**
 * Kalender — Code-Modul mit Inline-Zahnrad.
 *
 * Phase 1: Monat / Woche / Agenda / Event-Liste, Event-Form, drei Modi
 * (Event-Kalender / Gruppenkalender / Mixed). Konfigurierbar: Standard-View,
 * Item-Typen, Farben, Wochentag, Zeitformat, Standard-Dauer.
 *
 * Phase 2 (spaeter): Markdown-Editor, Coverbild + Galerie, Location-Kalender,
 * Recurrence, Reminders, Participation (Annehmen/Beobachten), Widgets.
 *
 * Vollstaendige Spec siehe Vision/real-life-stack/module/kalender.md (1826 Zeilen).
 */
import { Calendar } from "lucide-react"
import type { ModuleDefinition } from "../registry"
import { CalendarView, calendarDefaultConfig, type CalendarModuleConfig } from "./CalendarView"

export const calendarModule: ModuleDefinition<CalendarModuleConfig> = {
  id: "calendar",
  label: "Kalender",
  icon: Calendar,
  View: CalendarView,
  defaultConfig: calendarDefaultConfig,
  itemTypes: ["event", "appointment", "quest"],
  requiredCapabilities: ["ItemWriter"],
}

export type { CalendarModuleConfig } from "./CalendarView"
