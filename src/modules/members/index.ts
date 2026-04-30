/**
 * Members — Code-Modul fuer Mitglieder + Rollen-Verwaltung pro Space.
 *
 * Owner ist implizit (group.members[0]). Admins koennen weitere Admins
 * ernennen. Die Rollen werden in `group.data.roles[did]` persistiert.
 */
import { Users } from "lucide-react"
import type { ModuleDefinition } from "../registry"
import { MembersView } from "./MembersView"

export const membersModule: ModuleDefinition = {
  id: "members",
  label: "Mitglieder",
  icon: Users,
  View: MembersView,
  itemTypes: [],
  requiredCapabilities: ["GroupManager"],
}
